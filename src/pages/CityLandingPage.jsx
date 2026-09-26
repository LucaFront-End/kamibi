import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWixLandingBySlug } from '../hooks/useWixCMS';
import { useTranslation } from '../context/LanguageContext';
import { PageTransition } from '../components/layout/PageTransition';
import { HeroSection } from '../components/home/HeroSection';
import { PhilosophySection } from '../components/home/PhilosophySection';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { RitualSection } from '../components/home/RitualSection';
import { CeremonyVisualizer } from '../components/home/CeremonyVisualizer';
import { EcologyTimeline } from '../components/home/EcologyTimeline';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { CTASection } from '../components/home/CTASection';
import { useSEO } from '../hooks/useSEO';

function formatSlugToTitle(slug = '') {
  if (!slug) return 'Kamibi Store';
  return slug
    .split('-')
    .filter(Boolean)
    .map(w => {
      const lower = w.toLowerCase();
      if (['in', 'for', 'at', 'and', 'or', 'of', 'to', 'on', 'the', 'a', 'an'].includes(lower)) {
        return lower;
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

export const CityLandingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { locale } = useTranslation();
  const { landing, loading, error } = useWixLandingBySlug(slug);

  // Fallback human-readable title parsed immediately from URL slug (0ms latency)
  const fallbackTitle = useMemo(() => formatSlugToTitle(slug), [slug]);
  const defaultExcerpt = locale === 'es'
    ? 'Descubre urnas biodegradables y opciones conmemorativas ecológicas de Kamibi Store, diseñadas con dignidad y respeto por la naturaleza.'
    : 'Discover biodegradable cremation urns and eco-friendly memorial options from Kamibi Store, designed with dignity and respect for nature.';

  const isNotFound = !loading && (error || !landing);

  // Dynamic SEO from CMS data or fallback title; if not found, emit noindex to prevent Google Soft 404
  useSEO({
    titleEn: isNotFound ? 'Page Not Found | Kamibi Store' : (landing?.seoTitle || landing?.pageTitle || `${fallbackTitle} | Kamibi Store`),
    titleEs: isNotFound ? 'Página No Encontrada | Kamibi Store' : (landing?.seoTitle || landing?.pageTitle || `${fallbackTitle} | Kamibi Store`),
    descEn: isNotFound ? 'The requested page was not found.' : (landing?.seoDescription || landing?.excerpt || defaultExcerpt),
    descEs: isNotFound ? 'La página solicitada no fue encontrada.' : (landing?.seoDescription || landing?.excerpt || defaultExcerpt),
    locale,
    noindex: isNotFound,
  });

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // If genuinely not found after CMS check completed
  if (isNotFound) {
    return (
      <PageTransition>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          background: 'var(--color-cream, #FAF7F2)',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🍃</span>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            color: 'var(--color-charcoal)',
            marginBottom: '0.75rem',
          }}>
            {locale === 'es' ? 'Página No Encontrada' : 'Page Not Found'}
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-stone)',
            marginBottom: '2rem',
          }}>
            {locale === 'es' ? 'La zona que buscas no está disponible o ha sido removida.' : "This page doesn't exist or has been removed."}
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

  // Render immediately with optimistic data while loading, smoothly updating when CMS resolves!
  const displayTitle = landing?.pageTitle || landing?.title || fallbackTitle;
  const displaySubtitle = landing?.excerpt || defaultExcerpt;

  // Render exact HomePage with CMS overrides
  return (
    <PageTransition>
      <div className="home-page">
        <HeroSection
          overrideTitle={displayTitle}
          overrideSubtitle={displaySubtitle}
          variant="transparent"
          customSlides={[
            { id: 'water', labelEn: 'Water Ceremony', labelEs: 'Ceremonia en Agua', image: '/images/home-test-water.png' },
            { id: 'earth', labelEn: 'Earth Burial', labelEs: 'Ceremonia en Tierra', image: '/images/home-test-earth.png' }
          ]}
        />
        <PhilosophySection />
        <FeaturedProducts />
        <CeremonyVisualizer />
        <RitualSection />
        <EcologyTimeline />
        <TestimonialsSection />
        <CTASection />
      </div>
    </PageTransition>
  );
};

export default CityLandingPage;
