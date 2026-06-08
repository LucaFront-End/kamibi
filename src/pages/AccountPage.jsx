import React, { useEffect, useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useMembers } from '../context/MembersContext';
import { useWixClient } from '../context/WixContext';
import { PageTransition } from '../components/layout/PageTransition';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { MagneticButton } from '../components/ui/MagneticButton';
import './AccountPage.css';

export const AccountPage = () => {
  const { locale } = useTranslation();
  const { currentMember, isLoggedIn, loadingMember, login, logout } = useMembers();
  const { wixClient } = useWixClient();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !wixClient) return;
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const result = await wixClient.orders.searchOrders({
          search: { cursorPaging: { limit: 10 } },
        });
        setOrders(result.orders || []);
      } catch (err) {
        console.error('[Account] Could not load orders:', err);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [isLoggedIn, wixClient]);

  if (loadingMember) {
    return (
      <PageTransition>
        <div className="account-page">
          <div className="container account-loading">
            <div className="account-spinner" />
          </div>
        </div>
      </PageTransition>
    );
  }

  // Not logged in — show login prompt
  if (!isLoggedIn) {
    return (
      <PageTransition>
        <div className="account-page">
          <div className="container account-login-prompt">
            <ScrollReveal direction="up" className="login-prompt-card">
              <div className="login-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h1 className="heading-section login-title">
                {locale === 'es' ? 'Tu Cuenta Kamibi' : 'Your Kamibi Account'}
              </h1>
              <p className="text-body login-subtitle">
                {locale === 'es'
                  ? 'Iniciá sesión para ver tus pedidos y gestionar tu perfil.'
                  : 'Sign in to view your orders and manage your profile.'}
              </p>
              <MagneticButton variant="primary" onClick={login} className="login-btn">
                {locale === 'es' ? 'Ingresar / Registrarse' : 'Sign In / Register'}
              </MagneticButton>
              <p className="login-footnote text-body">
                {locale === 'es'
                  ? 'Tus datos están protegidos y solo usados para gestionar tu cuenta.'
                  : 'Your data is protected and only used to manage your account.'}
              </p>
            </ScrollReveal>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Logged in — show dashboard
  const firstName = currentMember?.profile?.nickname || currentMember?.contact?.firstName || '';
  const email = currentMember?.loginEmail || '';
  const initial = firstName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || '?';

  return (
    <PageTransition>
      <div className="account-page">
        <div className="container account-dashboard">
          {/* Header */}
          <ScrollReveal direction="up" className="account-header">
            <div className="account-avatar">{initial}</div>
            <div className="account-greeting">
              <h1 className="heading-section account-name">
                {locale === 'es' ? `Hola, ${firstName || 'bienvenido'}` : `Hello, ${firstName || 'welcome'}`}
              </h1>
              <p className="text-body account-email">{email}</p>
            </div>
            <button className="account-logout-btn" onClick={logout}>
              {locale === 'es' ? 'Cerrar sesión' : 'Sign out'}
            </button>
          </ScrollReveal>

          <div className="account-divider" />

          {/* Orders */}
          <section className="account-orders">
            <h2 className="account-section-title text-label">
              {locale === 'es' ? 'MIS PEDIDOS' : 'MY ORDERS'}
            </h2>

            {loadingOrders ? (
              <div className="orders-skeleton">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="order-skeleton-row" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="orders-empty">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
                <p>{locale === 'es' ? 'Aún no tenés pedidos.' : "You don't have any orders yet."}</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order._id} className="order-row">
                    <div className="order-info">
                      <span className="order-number text-label">
                        #{order.number || order._id?.slice(-6).toUpperCase()}
                      </span>
                      <span className="order-date text-body">
                        {order._createdDate
                          ? new Date(order._createdDate).toLocaleDateString(
                              locale === 'es' ? 'es-AR' : 'en-US',
                              { year: 'numeric', month: 'short', day: 'numeric' }
                            )
                          : ''}
                      </span>
                    </div>
                    <div className="order-items text-body">
                      {order.lineItems?.map((item) => item.productName?.original).join(', ')}
                    </div>
                    <div className="order-right">
                      <span className="order-total">
                        ${order.priceSummary?.total?.amount || '—'}
                      </span>
                      <span className={`order-status order-status--${order.status?.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageTransition>
  );
};

export default AccountPage;
