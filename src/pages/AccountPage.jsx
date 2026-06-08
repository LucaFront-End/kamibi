import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { useMembers } from '../context/MembersContext';
import { PageTransition } from '../components/layout/PageTransition';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';
import './AccountPage.css';

export const AccountPage = () => {
  const { locale } = useTranslation();
  const {
    isLoggedIn,
    memberEmail,
    memberName,
    loadingMember,
    orders,
    ordersLoading,
    login,
    register,
    logout,
    fetchOrders,
  } = useMembers();

  // Auth form state
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard tabs
  const [activeTab, setActiveTab] = useState('orders');

  // Load orders when logged in
  useEffect(() => {
    if (isLoggedIn) fetchOrders();
  }, [isLoggedIn, fetchOrders]);

  const t = (key) => {
    const strings = {
      es: {
        loginTab: 'Iniciar Sesión',
        registerTab: 'Registrarse',
        emailLabel: 'Correo Electrónico',
        passwordLabel: 'Contraseña',
        loginBtn: 'Iniciar Sesión',
        registerBtn: 'Crear Cuenta',
        processing: 'Procesando...',
        loginTitle: 'Accedé a tu cuenta',
        loginSubtitle: 'Iniciá sesión o registrate para gestionar tus pedidos y acceder a beneficios exclusivos.',
        welcomeTitle: 'Bienvenido',
        dashSubtitle: 'Administrá tus pedidos y perfil desde aquí.',
        ordersTab: 'Mis Pedidos',
        profileTab: 'Perfil',
        signOut: 'Cerrar sesión',
        noOrders: 'Aún no tenés pedidos.',
        noOrdersSub: 'Explorá nuestra colección y encontrá el memorial perfecto.',
        goToStore: 'Ir a la Tienda',
        loadingOrders: 'Cargando pedidos...',
        products: 'productos',
        support: 'Soporte',
        supportText: '¿Necesitás ayuda con tu cuenta o un pedido?',
        contactSupport: 'Contactar Soporte →',
        emailLabel2: 'Correo',
        member: 'Miembro Kamibi',
        errorInvalidCreds: 'Email o contraseña incorrectos.',
        errorEmailExists: 'Este email ya está registrado. Intentá iniciar sesión.',
        errorResetPw: 'Debés restablecer tu contraseña. Revisá tu correo.',
        errorEmailVerify: 'Revisá tu correo para verificar tu cuenta.',
        errorGeneric: 'Error al procesar. Intentá de nuevo.',
        delivered: 'Entregado',
        cancelled: 'Cancelado',
        approved: 'Aprobado',
        inProgress: 'En Proceso',
      },
      en: {
        loginTab: 'Sign In',
        registerTab: 'Register',
        emailLabel: 'Email Address',
        passwordLabel: 'Password',
        loginBtn: 'Sign In',
        registerBtn: 'Create Account',
        processing: 'Processing...',
        loginTitle: 'Access your account',
        loginSubtitle: 'Sign in or register to manage your orders and access exclusive benefits.',
        welcomeTitle: 'Welcome back',
        dashSubtitle: 'Manage your orders and profile from here.',
        ordersTab: 'My Orders',
        profileTab: 'Profile',
        signOut: 'Sign out',
        noOrders: "You don't have any orders yet.",
        noOrdersSub: 'Explore our collection and find the perfect memorial.',
        goToStore: 'Go to Store',
        loadingOrders: 'Loading orders...',
        products: 'products',
        support: 'Support',
        supportText: 'Need help with your account or an order?',
        contactSupport: 'Contact Support →',
        emailLabel2: 'Email',
        member: 'Kamibi Member',
        errorInvalidCreds: 'Incorrect email or password.',
        errorEmailExists: 'This email is already registered. Try signing in.',
        errorResetPw: 'You need to reset your password. Check your email.',
        errorEmailVerify: 'Check your email to verify your account.',
        errorGeneric: 'Error processing. Try again.',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        approved: 'Approved',
        inProgress: 'In Progress',
      },
    };
    return strings[locale]?.[key] || strings.en[key] || key;
  };

  const getErrorMessage = (errorCode) => {
    const map = {
      invalidCredentials: t('errorInvalidCreds'),
      emailExists: t('errorEmailExists'),
      resetPassword: t('errorResetPw'),
      emailVerification: t('errorEmailVerify'),
    };
    return map[errorCode] || t('errorGeneric');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const result = authMode === 'login'
        ? await login(email, password)
        : await register(email, password);

      if (!result.success) {
        setAuthError(getErrorMessage(result.error));
      }
    } catch (err) {
      console.error('[Account] Auth error:', err);
      setAuthError(t('errorGeneric'));
    }
    setAuthLoading(false);
  };

  const getStatusLabel = (status) => {
    const s = status?.toUpperCase();
    if (s === 'FULFILLED') return t('delivered');
    if (s === 'CANCELED') return t('cancelled');
    if (s === 'APPROVED') return t('approved');
    return t('inProgress');
  };

  const getStatusClass = (status) => {
    const s = status?.toUpperCase();
    if (s === 'FULFILLED') return 'order-status--fulfilled';
    if (s === 'CANCELED') return 'order-status--cancelled';
    if (s === 'APPROVED') return 'order-status--approved';
    return 'order-status--pending';
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────
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

  return (
    <PageTransition>
      <div className="account-page">
        {/* Hero banner */}
        <section className="account-hero">
          <div className="container account-hero-inner">
            <ScrollReveal direction="up">
              <span className="text-label account-hero-tag">
                {locale === 'es' ? 'MI CUENTA' : 'MY ACCOUNT'}
              </span>
              <h1 className="heading-section account-hero-title">
                {isLoggedIn
                  ? `${t('welcomeTitle')}, ${memberName || ''}`
                  : t('loginTitle')}
              </h1>
              <p className="text-body account-hero-subtitle">
                {isLoggedIn ? t('dashSubtitle') : t('loginSubtitle')}
              </p>
            </ScrollReveal>
          </div>
        </section>

        <div className="container account-body">
          <AnimatePresence mode="wait">
            {!isLoggedIn ? (
              /* ──── LOGIN / REGISTER FORM ──── */
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="auth-card"
              >
                {/* Toggle tabs */}
                <div className="auth-tabs">
                  <button
                    onClick={() => { setAuthMode('login'); setAuthError(''); }}
                    className={`auth-tab ${authMode === 'login' ? 'auth-tab--active' : ''}`}
                  >
                    {t('loginTab')}
                  </button>
                  <button
                    onClick={() => { setAuthMode('register'); setAuthError(''); }}
                    className={`auth-tab ${authMode === 'register' ? 'auth-tab--active' : ''}`}
                  >
                    {t('registerTab')}
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="auth-field">
                    <label className="auth-label">{t('emailLabel')}</label>
                    <input
                      type="email"
                      required
                      className="auth-input"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">{t('passwordLabel')}</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="auth-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {authError && (
                    <p className="auth-error">{authError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="auth-submit"
                  >
                    {authLoading
                      ? t('processing')
                      : authMode === 'login'
                        ? t('loginBtn')
                        : t('registerBtn')
                    }
                  </button>
                </form>
              </motion.div>
            ) : (
              /* ──── DASHBOARD ──── */
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="dashboard"
              >
                {/* Tab navigation */}
                <div className="dash-header">
                  <div className="dash-tabs">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`dash-tab ${activeTab === 'orders' ? 'dash-tab--active' : ''}`}
                    >
                      {t('ordersTab')}
                    </button>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`dash-tab ${activeTab === 'profile' ? 'dash-tab--active' : ''}`}
                    >
                      {t('profileTab')}
                    </button>
                  </div>
                  <button onClick={logout} className="dash-logout">
                    {t('signOut')}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'orders' && (
                    <motion.div
                      key="orders"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="dash-content"
                    >
                      {ordersLoading ? (
                        <div className="orders-loading">{t('loadingOrders')}</div>
                      ) : orders.length === 0 ? (
                        <div className="orders-empty-card">
                          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <h3>{t('noOrders')}</h3>
                          <p>{t('noOrdersSub')}</p>
                          <Link to="/store" className="orders-empty-btn">
                            {t('goToStore')}
                          </Link>
                        </div>
                      ) : (
                        <div className="orders-list">
                          {orders.map((order, idx) => (
                            <div key={order._id || idx} className="order-card">
                              <div className="order-card-top">
                                <div>
                                  <span className="order-number">
                                    #{order.number || idx + 1}
                                  </span>
                                  <span className="order-date">
                                    {order._createdDate
                                      ? new Date(order._createdDate).toLocaleDateString(
                                          locale === 'es' ? 'es-AR' : 'en-US',
                                          { year: 'numeric', month: 'long', day: 'numeric' }
                                        )
                                      : ''}
                                  </span>
                                </div>
                                <span className={`order-status ${getStatusClass(order.status)}`}>
                                  {getStatusLabel(order.status)}
                                </span>
                              </div>
                              <div className="order-card-bottom">
                                <span className="order-items-count">
                                  {order.lineItems?.length || 0} {t('products')}
                                </span>
                                <span className="order-total">
                                  {order.priceSummary?.total?.formattedAmount || '$0'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'profile' && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="dash-content profile-section"
                    >
                      <div className="profile-header">
                        <div className="profile-avatar">
                          {memberName ? memberName[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <h3 className="profile-name">{memberName || 'Usuario'}</h3>
                          <span className="profile-badge">{t('member')}</span>
                        </div>
                      </div>

                      <div className="profile-fields">
                        <div className="profile-field">
                          <span className="profile-field-label">{t('emailLabel2')}</span>
                          <p className="profile-field-value">{memberEmail || '—'}</p>
                        </div>

                        <div className="profile-field">
                          <span className="profile-field-label">{t('support')}</span>
                          <p className="profile-field-desc">{t('supportText')}</p>
                          <a href="mailto:info@kamibi.com" className="profile-support-link">
                            {t('contactSupport')}
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default AccountPage;
