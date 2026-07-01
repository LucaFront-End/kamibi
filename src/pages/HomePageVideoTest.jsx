import React, { useEffect } from 'react';
import { PageTransition } from '../components/layout/PageTransition';
import { HeroSection } from '../components/home/HeroSection';
import { PhilosophySection } from '../components/home/PhilosophySection';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { RitualSection } from '../components/home/RitualSection';
import { CeremonyVisualizer } from '../components/home/CeremonyVisualizer';
import { EcologyTimeline } from '../components/home/EcologyTimeline';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { CTASection } from '../components/home/CTASection';
import { useTranslation } from '../context/LanguageContext';
import { useSEO } from '../hooks/useSEO';

export const HomePageVideoTest = () => {
  const { locale } = useTranslation();

  useSEO({
    titleEn: 'Kamibi Store Test | Alternate Background Video Design',
    titleEs: 'Kamibi Store Test | Diseño Alternativo con Video de Fondo',
    descEn:  'A visual comparison test page evaluating an alternate background video layout.',
    descEs:  'Página de prueba comparativa evaluando un diseño alternativo con video de fondo para el Hero.',
    locale,
  });

  // Ensure we start at top of page on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition>
      <div className="home-page-test">
        <HeroSection variant="transparent" bgVideo="/hero-video.mp4" />
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

export default HomePageVideoTest;
