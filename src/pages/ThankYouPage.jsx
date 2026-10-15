import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { useWixClient } from '../context/WixContext';
import { useCart } from '../context/CartContext';
import { PageTransition } from '../components/layout/PageTransition';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { motion } from 'framer-motion';
import './ThankYouPage.css';

export const ThankYouPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { wixClient } = useWixClient();
  const { refreshCart } = useCart();

  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(orderId));

  useEffect(() => {
    window.scrollTo(0, 0);

    // Refresh cart to reset counter to 0 since purchase completed
    if (typeof refreshCart === 'function') {
      refreshCart().catch(() => {});
    }

    // 1. Instant preview from sessionStorage if available from checkout flow
    try {
      const cached = sessionStorage.getItem('kamibi_last_checkout');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Only use cache if it was created within the last 2 hours
        if (!parsed.timestamp || Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000) {
          setOrderDetails(parsed);
        }
      }
    } catch (e) {
      console.warn('[ThankYou] Could not read cached checkout:', e);
    }

    if (!orderId) {
      setIsLoading(false);
      return;
    }

    // 2. Fetch authoritative order details from serverless API or Wix SDK
    let isMounted = true;

    async function loadOrder() {
      setIsLoading(true);

      // Attempt A: Server-side API endpoint with elevated Wix API Key
      try {
        const res = await fetch(`/api/order?orderId=${encodeURIComponent(orderId)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && !data.error) {
            setOrderDetails((prev) => ({
              ...(prev || {}),
              ...data,
              items: (data.items && data.items.length > 0) ? data.items : prev?.items || [],
            }));
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[ThankYou] Server /api/order fetch error:', err);
      }

      // Attempt B: Client-side Wix SDK getOrder using buyer session tokens
      if (wixClient?.orders?.getOrder) {
        try {
          const order = await wixClient.orders.getOrder(orderId);
          if (isMounted && order) {
            const billingContact = order.billingInfo?.contactDetails || order.billingInfo?.address?.contactDetails || {};
            const shippingContact = order.shippingInfo?.logistics?.shippingDestination?.contactDetails || {};
            const customerName =
              [billingContact.firstName, billingContact.lastName].filter(Boolean).join(' ') ||
              [shippingContact.firstName, shippingContact.lastName].filter(Boolean).join(' ') ||
              billingContact.fullName ||
              order.buyerInfo?.email ||
              '';

            const items = (order.lineItems || []).map((it) => {
              let imgUrl = it.image?.url || it.image || '';
              if (imgUrl && !imgUrl.startsWith('http')) {
                const match = imgUrl.match(/(45119e_[a-zA-Z0-9~_-]+\.(png|jpg|jpeg|webp))/i);
                if (match) imgUrl = `https://static.wixstatic.com/media/${match[1]}`;
              }

              const options = (it.descriptionLines || []).map((line) => {
                if (line.plainText?.value) return line.plainText.value;
                if (line.name?.translated || line.name?.original) {
                  return `${line.name.translated || line.name.original}: ${line.plainText?.value || line.colorInfo?.original || ''}`;
                }
                return '';
              }).filter(Boolean);

              const unitPrice =
                it.price?.formattedAmount ||
                (it.price?.amount ? `$${Number(it.price.amount).toFixed(2)}` : '') ||
                '$0.00';

              const itemTotal =
                it.totalPrice?.formattedAmount ||
                (it.totalPrice?.amount ? `$${Number(it.totalPrice.amount).toFixed(2)}` : '') ||
                unitPrice;

              return {
                id: it._id || it.id,
                name: it.productName?.translated || it.productName?.original || it.name || 'Kamibi Urn',
                quantity: it.quantity || 1,
                price: unitPrice,
                totalPrice: itemTotal,
                image: imgUrl,
                options,
              };
            });

            const summary = order.priceSummary || order.totals || {};
            const totalFormatted =
              summary.total?.formattedAmount ||
              summary.totalPrice?.formattedAmount ||
              (summary.total?.amount ? `$${Number(summary.total.amount).toFixed(2)}` : '') ||
              '';

            const subtotalFormatted =
              summary.subtotal?.formattedAmount ||
              (summary.subtotal?.amount ? `$${Number(summary.subtotal.amount).toFixed(2)}` : '');

            setOrderDetails((prev) => ({
              ...(prev || {}),
              orderId,
              orderNumber: order.number ? `#${order.number}` : `#${orderId.substring(0, 8).toUpperCase()}`,
              customerName: customerName || prev?.customerName || '',
              customerEmail: order.buyerInfo?.email || prev?.customerEmail || '',
              items: items.length > 0 ? items : prev?.items || [],
              totalQuantity: items.reduce((acc, curr) => acc + (curr.quantity || 1), 0) || prev?.totalQuantity || 1,
              total: totalFormatted || prev?.total || '',
              subtotal: subtotalFormatted || prev?.subtotal || '',
              paymentStatus: order.paymentStatus || 'PAID',
            }));
          }
        } catch (sdkErr) {
          console.warn('[ThankYou] wixClient.orders.getOrder failed:', sdkErr);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId, wixClient, refreshCart]);

  const displayOrderNumber =
    orderDetails?.orderNumber ||
    (orderId ? `#${orderId.substring(0, 8).toUpperCase()}` : null);

  const displayTotalQuantity =
    orderDetails?.totalQuantity ||
    (orderDetails?.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <PageTransition>
      <div className="thankyou-page">
        <section className="thankyou-hero">
          {/* Ambient background */}
          <div className="thankyou-ambient">
            <div className="thankyou-glow thankyou-glow-1"></div>
            <div className="thankyou-glow thankyou-glow-2"></div>
          </div>

          <div className="container thankyou-content">
            {/* Animated check icon */}
            <ScrollReveal direction="up">
              <motion.div
                className="thankyou-icon-wrapper"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              >
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="thankyou-check-svg"
                >
                  <motion.path
                    d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeInOut' }}
                  />
                  <motion.polyline
                    points="22 4 12 14.01 9 11.01"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 1.2, ease: 'easeOut' }}
                  />
                </svg>
              </motion.div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3}>
              <span className="text-label thankyou-tag">{t('thankYou.tag')}</span>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.4}>
              <h1 className="heading-display thankyou-title">{t('thankYou.title')}</h1>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.5}>
              <p className="text-body thankyou-subtitle">{t('thankYou.subtitle')}</p>
            </ScrollReveal>

            {/* Comprehensive Order Summary Card */}
            {(orderId || orderDetails) && (
              <ScrollReveal direction="up" delay={0.6}>
                <div className="thankyou-order-summary-card">
                  {/* Card Header: Order Number, Customer Name & Status Badge */}
                  <div className="summary-card-header">
                    <div className="summary-header-info">
                      <div className="summary-badge-row">
                        <span className="summary-paid-badge">
                          <span className="summary-status-dot"></span>
                          {t('thankYou.paidStatus')}
                        </span>
                        {displayOrderNumber && (
                          <span className="summary-order-badge">
                            {t('thankYou.orderLabel')} <strong>{displayOrderNumber}</strong>
                          </span>
                        )}
                      </div>

                      {orderDetails?.customerName && (
                        <div className="summary-customer-line">
                          <span className="summary-customer-label">{t('thankYou.customer')}:</span>
                          <span className="summary-customer-value">{orderDetails.customerName}</span>
                          {orderDetails.customerEmail && (
                            <span className="summary-customer-email">({orderDetails.customerEmail})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="summary-items-section">
                    <h3 className="summary-items-heading text-label">
                      {t('thankYou.itemsTitle')} ({displayTotalQuantity || 1})
                    </h3>

                    {isLoading && !orderDetails?.items?.length ? (
                      <div className="summary-loading-placeholder">
                        <span className="summary-spinner"></span>
                        <span className="text-body">{t('thankYou.loadingDetails')}</span>
                      </div>
                    ) : (
                      <div className="summary-items-list">
                        {(orderDetails?.items || [
                          {
                            name: 'Terra Biodegradable Urn',
                            quantity: 1,
                            price: orderDetails?.total || '$90.00',
                            totalPrice: orderDetails?.total || '$90.00',
                          },
                        ]).map((item, idx) => (
                          <div key={item.id || idx} className="summary-item-card">
                            <div className="summary-item-left">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="summary-item-img"
                                />
                              ) : (
                                <div className="summary-item-img-placeholder">
                                  <span>🌿</span>
                                </div>
                              )}
                              <span className="summary-item-qty-tag">
                                {item.quantity}×
                              </span>
                            </div>

                            <div className="summary-item-details">
                              <h4 className="summary-item-name">{item.name}</h4>
                              {item.options && item.options.length > 0 && (
                                <div className="summary-item-options">
                                  {item.options.map((opt, optIdx) => (
                                    <span key={optIdx} className="summary-item-option-pill">
                                      {opt}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="summary-item-submeta">
                                <span className="summary-item-unit">
                                  {t('thankYou.quantityLabel')}: <strong>{item.quantity}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="summary-item-right">
                              <span className="summary-item-total-price">
                                {item.totalPrice || item.price}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Financial Breakdown & Grand Total */}
                  <div className="summary-totals-section">
                    {orderDetails?.subtotal && (
                      <div className="summary-totals-row">
                        <span className="summary-totals-label">{t('thankYou.subtotalLabel')}</span>
                        <span className="summary-totals-val">{orderDetails.subtotal}</span>
                      </div>
                    )}

                    <div className="summary-totals-row">
                      <span className="summary-totals-label">{t('thankYou.shippingLabel')}</span>
                      <span className="summary-totals-val summary-free-tag">
                        {orderDetails?.shipping || t('thankYou.freeShipping')}
                      </span>
                    </div>

                    {orderDetails?.tax && (
                      <div className="summary-totals-row">
                        <span className="summary-totals-label">{t('thankYou.taxLabel')}</span>
                        <span className="summary-totals-val">{orderDetails.tax}</span>
                      </div>
                    )}

                    {orderDetails?.discount && (
                      <div className="summary-totals-row summary-discount-row">
                        <span className="summary-totals-label">{t('thankYou.discountLabel')}</span>
                        <span className="summary-totals-val">-{orderDetails.discount}</span>
                      </div>
                    )}

                    <div className="summary-totals-divider"></div>

                    <div className="summary-totals-row summary-grand-total-row">
                      <div className="summary-grand-label-wrap">
                        <span className="summary-grand-title">{t('thankYou.totalLabel')}</span>
                        {displayTotalQuantity > 0 && (
                          <span className="summary-grand-count text-body">
                            ({displayTotalQuantity} {t('thankYou.itemsTitle').toLowerCase()})
                          </span>
                        )}
                      </div>
                      <span className="summary-grand-amount">
                        {orderDetails?.total || '$90.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Message card */}
            <ScrollReveal direction="up" delay={0.7}>
              <div className="thankyou-message-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="thankyou-leaf-icon">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.68-4.2A16.7 16.7 0 0 0 17 8Z" />
                  <path d="M17 8c3-1.47 5-4.42 5-8a1 1 0 0 0-1-1c-3.58 0-6.53 2-8 5" />
                  <path d="M2 22l2-2" />
                </svg>
                <p className="thankyou-message-text">{t('thankYou.message')}</p>
              </div>
            </ScrollReveal>

            {/* CTA Buttons */}
            <ScrollReveal direction="up" delay={0.8}>
              <div className="thankyou-actions">
                <Link to="/store" className="btn-primary thankyou-btn-primary">
                  {t('thankYou.continueShopping')}
                </Link>
                <Link to="/" className="btn-outline thankyou-btn-secondary">
                  {t('thankYou.backHome')}
                </Link>
              </div>
            </ScrollReveal>

            {/* Contact note */}
            <ScrollReveal direction="up" delay={0.9}>
              <p className="thankyou-contact-note text-body">
                {t('thankYou.contactNote')}{' '}
                <Link to="/contact" className="thankyou-contact-link">
                  {t('thankYou.contactLink')}
                </Link>
              </p>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default ThankYouPage;
