import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../context/LanguageContext';
import { useWixClient } from '../../context/WixContext';
import './CouponPopup.css';

const LOCAL_STORAGE_DISMISSED_KEY = 'kamibi_coupon_dismissed';
const LOCAL_STORAGE_CLAIMED_KEY = 'kamibi_coupon_claimed';

export const CouponPopup = () => {
  const { t, locale } = useTranslation();
  const { wixClient } = useWixClient();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto open after 4 seconds if user hasn't claimed or dismissed it
  useEffect(() => {
    const isDismissed = localStorage.getItem(LOCAL_STORAGE_DISMISSED_KEY) === 'true';
    const isClaimed = localStorage.getItem(LOCAL_STORAGE_CLAIMED_KEY) === 'true';

    if (!isDismissed && !isClaimed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(LOCAL_STORAGE_DISMISSED_KEY, 'true');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg(
        locale === 'es'
          ? 'Por favor completa todos los campos.'
          : 'Please fill out all fields.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const payload = {
      title: name.trim(),
      nombre: name.trim(),
      name: name.trim(),
      telefono: phone.trim(),
      phone: phone.trim(),
      correo: email.trim(),
      email: email.trim(),
    };

    let saved = false;

    // 1. Try client SDK wixClient.items.insert
    try {
      if (wixClient?.items?.insert) {
        await wixClient.items.insert('Cupones', payload);
        saved = true;
      }
    } catch (sdkErr) {
      console.warn('[Coupon Popup] SDK insert failed, falling back to API:', sdkErr);
    }

    // 2. Fallback to serverless API /api/coupon
    if (!saved) {
      try {
        const res = await fetch('/api/coupon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error enviando datos');
        }
        saved = true;
      } catch (apiErr) {
        console.error('[Coupon Popup] API insert error:', apiErr);
      }
    }

    setIsSubmitting(false);
    setIsSuccess(true);
    localStorage.setItem(LOCAL_STORAGE_CLAIMED_KEY, 'true');
  };

  return (
    <>
      {/* Floating Gift Trigger Pill — allows opening popup if user closed it */}
      {!isOpen && !isSuccess && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
          onClick={() => setIsOpen(true)}
          className="coupon-floating-trigger"
          aria-label={locale === 'es' ? 'Obtener Cupón' : 'Get Discount'}
        >
          <span className="floating-gift-icon">🎁</span>
          <span className="floating-gift-text">
            {locale === 'es' ? 'Descuento 10%' : '10% Discount'}
          </span>
        </motion.button>
      )}

      {/* Modal Popup Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="coupon-popup-overlay">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="coupon-backdrop"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="coupon-popup-card"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="coupon-close-btn"
                aria-label="Close"
              >
                ✕
              </button>

              {/* Leaf / Brand Badge Header */}
              <div className="coupon-header-badge">
                <span className="coupon-badge-icon">🌿</span>
                <span className="coupon-badge-tag text-label">
                  {locale === 'es' ? 'Oferta Exclusiva' : 'Exclusive Offer'}
                </span>
              </div>

              {!isSuccess ? (
                <>
                  <h3 className="heading-section coupon-title">
                    {locale === 'es'
                      ? 'Obtén un descuento en tu primera compra.'
                      : 'Get a discount on your first purchase.'}
                  </h3>
                  <p className="coupon-subtitle text-body">
                    {locale === 'es'
                      ? 'Regístrate y recibe tu código de cupón directo en tu correo.'
                      : 'Sign up to receive your exclusive promo code in your inbox.'}
                  </p>

                  <form onSubmit={handleSubmit} className="coupon-form">
                    <div className="coupon-field-group">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={locale === 'es' ? 'Nombre completo' : 'Full Name'}
                        className="coupon-input"
                        required
                      />
                    </div>

                    <div className="coupon-field-group">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={locale === 'es' ? 'Teléfono' : 'Phone Number'}
                        className="coupon-input"
                        required
                      />
                    </div>

                    <div className="coupon-field-group">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={locale === 'es' ? 'Correo electrónico' : 'Email Address'}
                        className="coupon-input"
                        required
                      />
                    </div>

                    {errorMsg && <p className="coupon-error text-body">{errorMsg}</p>}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="coupon-submit-btn"
                    >
                      {isSubmitting ? (
                        <span className="coupon-btn-spinner"></span>
                      ) : (
                        locale === 'es' ? 'Obtener Cupón' : 'Get My Coupon'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="coupon-success-state"
                >
                  <div className="coupon-success-icon-wrap">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="heading-section coupon-success-title">
                    {locale === 'es' ? 'Registro Exitoso' : 'Registration Successful!'}
                  </h3>
                  <p className="coupon-success-desc text-body">
                    {locale === 'es'
                      ? 'Te llegará un correo con tu cupón.'
                      : 'You will receive an email with your coupon code shortly.'}
                  </p>
                  <button onClick={handleClose} className="coupon-success-close-btn">
                    {locale === 'es' ? 'Entendido' : 'Got it'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
export default CouponPopup;
