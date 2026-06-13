import React, { useEffect } from 'react';
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

export const CityLandingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { locale } = useTranslation();
  const { landing, loading, error } = useWixLandingBySlug(slug);

  // Dynamic SEO from CMS data
  useSEO({
    titleEn: landing?.seoTitle || landing?.pageTitle || 'Kamibi Store',
    titleEs: landing?.seoTitle || landing?.pageTitle || 'Kamibi Store',
    descEn: landing?.seoDescription || landing?.excerpt || '',
    descEs: landing?.seoDescription || landing?.excerpt || '',
    locale,
  });

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Loading
  if (loading) {
    return (
      <PageTransition>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-cream, #FAF7F2)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', animation: 'spin 2s ease-in-out infinite' }}>🌿</div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // 404
  if (error || !landing) {
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
          }}>Page Not Found</h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-stone)',
            marginBottom: '2rem',
          }}>This page doesn't exist or has been removed.</p>
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
            Back to Home
          </button>
        </div>
      </PageTransition>
    );
  }

  // Render exact HomePage with CMS overrides
  return (
    <PageTransition>
      <div className="home-page">
        <HeroSection
          overrideTitle={landing.pageTitle || landing.title}
          overrideSubtitle={landing.excerpt}
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
