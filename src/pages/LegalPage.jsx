import React, { useEffect, useMemo } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { PageTransition } from '../components/layout/PageTransition';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { useSEO } from '../hooks/useSEO';
import { useWixLegal, LEGAL_POLICIES_CONFIG } from '../hooks/useWixLegal';
import './LegalPage.css';

// Map pathnames to policy keys
const PATH_TO_KEY = {
  '/privacy-policy': 'privacy',
  '/aviso-de-privacidad': 'privacy',
  '/terms-of-service': 'terms',
  '/terminos-y-condiciones': 'terms',
  '/shipping-policy': 'shipping',
  '/politica-de-envios': 'shipping',
  '/refund-policy': 'refund',
  '/politica-de-reembolsos': 'refund',
  '/cookie-policy': 'cookies',
  '/politica-de-cookies': 'cookies',
};

const SLUG_TO_KEY = {
  'privacy': 'privacy',
  'privacy-policy': 'privacy',
  'aviso-de-privacidad': 'privacy',
  'terms': 'terms',
  'terms-of-service': 'terms',
  'terminos-y-condiciones': 'terms',
  'shipping': 'shipping',
  'shipping-policy': 'shipping',
  'politica-de-envios': 'shipping',
  'refund': 'refund',
  'refund-policy': 'refund',
  'politica-de-reembolsos': 'refund',
  'cookies': 'cookies',
  'cookie-policy': 'cookies',
  'politica-de-cookies': 'cookies',
};

export const LegalPage = ({ policyKey: propPolicyKey }) => {
  const location = useLocation();
  const { slug } = useParams();
  const { locale } = useTranslation();

  // Determine active policy key
  const activeKey = useMemo(() => {
    if (propPolicyKey && LEGAL_POLICIES_CONFIG[propPolicyKey]) {
      return propPolicyKey;
    }
    if (PATH_TO_KEY[location.pathname]) {
      return PATH_TO_KEY[location.pathname];
    }
    if (slug && SLUG_TO_KEY[slug.toLowerCase()]) {
      return SLUG_TO_KEY[slug.toLowerCase()];
    }
    return 'privacy';
  }, [propPolicyKey, location.pathname, slug]);

  const { config, content, title, lastUpdated, loading, error, allPolicies } = useWixLegal(activeKey);

  // SEO configuration
  useSEO({
    titleEn: config.metaTitleEn,
    titleEs: config.metaTitleEs,
    descEn: config.metaDescEn,
    descEs: config.metaDescEs,
    canonical: `https://kamibistore.com${locale === 'es' ? config.pathEs : config.pathEn}`,
    locale,
  });

  // Scroll to top on tab/policy change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeKey]);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = useMemo(() => {
    if (!lastUpdated) return 'October 2026';
    try {
      const d = new Date(lastUpdated);
      return d.toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'October 2026';
    }
  }, [lastUpdated, locale]);

  return (
    <PageTransition>
      <div className="legal-page">
        {/* Hero Header */}
        <section className="legal-hero">
          <div className="container">
            <div className="legal-hero-inner">
              <span className="legal-tag">
                {locale === 'es' ? 'LEGAL Y TRANSPARENCIA' : 'LEGAL & COMPLIANCE'}
              </span>
              <h1 className="legal-title">
                {locale === 'es' ? config.labelEs : config.labelEn}
              </h1>

              <div className="legal-meta-row">
                <div className="legal-updated">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>
                    {locale === 'es' ? `Última actualización: ${formattedDate}` : `Last Updated: ${formattedDate}`}
                  </span>
                </div>

                <div className="legal-actions">
                  <button onClick={handlePrint} className="legal-action-btn" title={locale === 'es' ? 'Imprimir política' : 'Print policy'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="6 9 6 2 18 2 18 9" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    <span>{locale === 'es' ? 'Imprimir' : 'Print'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky Tab Switcher */}
        <nav className="legal-tabs-wrapper" aria-label="Legal policies tabs">
          <div className="legal-tabs-inner">
            {allPolicies.map((pol) => {
              const isActive = pol.key === activeKey;
              const linkPath = locale === 'es' ? pol.pathEs : pol.pathEn;
              return (
                <Link
                  key={pol.key}
                  to={linkPath}
                  className={`legal-tab-btn ${isActive ? 'active' : ''}`}
                >
                  {locale === 'es' ? pol.labelEs : pol.labelEn}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Content Section */}
        <section className="legal-content-container">
          <article className="legal-article-card">
            {loading && (
              <div className="legal-skeleton-container">
                <div className="legal-skeleton-line legal-skeleton-title skeleton-pulse" />
                <div className="legal-skeleton-line skeleton-pulse" style={{ width: '90%' }} />
                <div className="legal-skeleton-line skeleton-pulse" style={{ width: '95%' }} />
                <div className="legal-skeleton-line skeleton-pulse" style={{ width: '80%' }} />
                <div className="legal-skeleton-line skeleton-pulse" style={{ width: '88%', marginTop: '1rem' }} />
                <div className="legal-skeleton-line skeleton-pulse" style={{ width: '92%' }} />
                <div className="legal-skeleton-line skeleton-pulse" style={{ width: '70%' }} />
              </div>
            )}

            {!loading && error && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>⚠️</span>
                <h3 style={{ marginTop: '1rem', color: 'var(--color-charcoal)' }}>
                  {locale === 'es' ? 'No se pudo cargar la política' : 'Could not load policy'}
                </h3>
                <p style={{ color: 'var(--color-stone)', marginTop: '0.5rem' }}>
                  {error}
                </p>
              </div>
            )}

            {!loading && !error && content && (
              <div
                className="legal-article-content"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}

            {/* Direct Support Assistance Box */}
            <div className="legal-support-box">
              <div className="legal-support-text">
                <h4>
                  {locale === 'es' ? '¿Tienes dudas sobre nuestras políticas?' : 'Have questions about our policies?'}
                </h4>
                <p>
                  {locale === 'es'
                    ? 'Nuestro equipo de atención al cliente está disponible para orientarte con cualquier inquietud.'
                    : 'Our customer support team is available to assist you with any questions or concerns.'}
                </p>
              </div>
              <div className="legal-support-actions">
                <a href="tel:+16786746128" className="legal-support-btn secondary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  +1 678 674 6128
                </a>
                <a href="mailto:contact@kamibistore.com" className="legal-support-btn primary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  contact@kamibistore.com
                </a>
              </div>
            </div>
          </article>
        </section>
      </div>
    </PageTransition>
  );
};

export default LegalPage;
