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

export const HomePage = () => {
  const { locale } = useTranslation();

  useSEO({
    titleEn: 'Biodegradable Urns for Water & Earth Burial | Kamibi Store USA & Canada',
    titleEs: 'Urnas Biodegradables para Entierros en Agua y Tierra | Kamibi Store USA y Canadá',
    descEn:  'Discover premium biodegradable urns for human ashes at Kamibi Store. Eco friendly urns, water burial urns, natural burial urns, and sustainable funeral urns with free shipping across USA and Canada.',
    descEs:  'Descubre urnas biodegradables premium para cenizas humanas en Kamibi Store. Urnas ecológicas para agua y tierra, productos memoriales sustentables y envío gratis a Estados Unidos y Canadá.',
    locale,
  });

  // Ensure we start at top of page on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition>
      <div className="home-page">
        <HeroSection 
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
export default HomePage;
