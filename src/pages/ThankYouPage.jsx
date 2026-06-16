import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { PageTransition } from '../components/layout/PageTransition';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { motion } from 'framer-motion';
import './ThankYouPage.css';

export const ThankYouPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

            {orderId && (
              <ScrollReveal direction="up" delay={0.6}>
                <div className="thankyou-order-badge">
                  <span className="text-label">{t('thankYou.orderLabel')}</span>
                  <span className="thankyou-order-id">{orderId.substring(0, 8).toUpperCase()}</span>
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
