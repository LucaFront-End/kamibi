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

export const HomePageImagesTest = () => {
  const { locale } = useTranslation();

  useSEO({
    titleEn: 'Kamibi Store Test | Alternate Ceremony Images Design',
    titleEs: 'Kamibi Store Test | Diseño Alternativo de Imágenes de Ceremonia',
    descEn:  'A visual comparison test page evaluating alternate images for water and earth ceremonies.',
    descEs:  'Página de prueba comparativa evaluando imágenes alternativas para ceremonias de agua y tierra.',
    locale,
  });

  // Ensure we start at top of page on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition>
      <div className="home-page-images-test">
        <HeroSection variant="transparent" />
        <PhilosophySection />
        <FeaturedProducts />
        {/* Pass the two custom ChatGPT images to visualizer */}
        <CeremonyVisualizer 
          overrideWaterImage="/images/home-test-water.png" 
          overrideEarthImage="/images/home-test-earth.png" 
        />
        <RitualSection />
        <EcologyTimeline />
        <TestimonialsSection />
        <CTASection />
      </div>
    </PageTransition>
  );
};

export default HomePageImagesTest;
