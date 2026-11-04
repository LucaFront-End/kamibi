import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWixAdLandingBySlug } from '../hooks/useWixCMS';
import { useTranslation } from '../context/LanguageContext';
import { PageTransition } from '../components/layout/PageTransition';
import { useSEO } from '../hooks/useSEO';
import { UrnaBiodegradableLanding } from './UrnaBiodegradableLanding';

function formatSlugToTitle(slug = '') {
  if (!slug) return '';
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => {
      const lower = w.toLowerCase();
      if (
        [
          'in',
          'for',
          'at',
          'and',
          'or',
          'of',
          'to',
          'on',
          'the',
          'a',
          'an',
          'en',
          'de',
          'para',
          'y',
          'con',
          'del',
          'la',
          'el',
          'las',
          'los',
        ].includes(lower)
      ) {
        return lower;
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

/**
 * Dynamic Ads / Zonas Landing Page (/zonas/:slug)
 * Connected 100% dynamically to Wix CMS collection 'Zonas'.
 * Reflects additions, edits, and deletions in real time.
 */
export const ZonaAdLandingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { locale } = useTranslation();
  const { landing, loading, error } = useWixAdLandingBySlug(slug);

  const fallbackTitle = useMemo(() => formatSlugToTitle(slug), [slug]);
  const isNotFound = !loading && (error || !landing);

  useSEO({
    titleEn: isNotFound
      ? 'Page Not Found | Kamibi Store'
      : landing?.seoTitle || landing?.pageTitle || `${fallbackTitle} | Kamibi® Biodegradable Urns`,
    titleEs: isNotFound
      ? 'Página No Encontrada | Kamibi Store'
      : landing?.seoTitle || landing?.pageTitle || `${fallbackTitle} | Urnas Biodegradables Kamibi®`,
    descEn: isNotFound
      ? 'The requested zone was not found.'
      : landing?.seoDescription ||
        landing?.excerpt ||
        '100% organic biodegradable urns for water and earth ceremonies.',
    descEs: isNotFound
      ? 'La zona solicitada no fue encontrada.'
      : landing?.seoDescription ||
        landing?.excerpt ||
        'Urnas biodegradables 100% orgánicas para agua y tierra. Envío gratis.',
    canonical: `https://kamibistore.com/zonas/${slug}`,
    locale,
    noindex: true,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (typeof window !== 'undefined' && slug) {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/Zonas/')) {
        navigate(`/zonas/${slug}`, { replace: true });
      }
    }
  }, [slug, navigate]);

  if (loading && !landing) {
    return (
      <PageTransition>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-cream, #FAF7F2)',
          }}
        >
          <div style={{ textAlign: 'center', fontSize: '2.2rem' }}>🌿</div>
        </div>
      </PageTransition>
    );
  }

  if (isNotFound) {
    return (
      <PageTransition>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            background: 'var(--color-cream, #FAF7F2)',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🍃</span>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
              color: 'var(--color-charcoal)',
              marginBottom: '0.75rem',
            }}
          >
            {locale === 'es' ? 'Página No Encontrada' : 'Page Not Found'}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-stone)',
              marginBottom: '2rem',
            }}
          >
            {locale === 'es'
              ? 'La zona que buscas no está disponible o ha sido removida del CMS.'
              : "This zone doesn't exist or has been removed from the CMS."}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              fontFamily: 'var(--font-body)',
              padding: '0.75rem 2rem',
              background: 'var(--color-charcoal)',
              color: '#fff',
              border: 'none',
              borderRadius: '100px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              letterSpacing: '0.05em',
            }}
          >
            {locale === 'es' ? 'Volver al Inicio' : 'Back to Home'}
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <UrnaBiodegradableLanding
      cmsLanding={landing}
      cmsLoading={loading}
      zoneSlug={slug}
      fallbackZoneTitle={fallbackTitle}
    />
  );
};

export default ZonaAdLandingPage;
