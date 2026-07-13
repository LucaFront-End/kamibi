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
    titleEn: 'Kamibi Store Test | Alternate Hero Images Design',
    titleEs: 'Kamibi Store Test | Diseño Alternativo de Imágenes de Hero',
    descEn:  'A visual comparison test page evaluating alternate background images for the main hero section.',
    descEs:  'Página de prueba comparativa evaluando imágenes de fondo alternativas para la sección de hero principal.',
    locale,
  });

  // Ensure we start at top of page on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition>
      <div className="home-page-images-test">
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

export default HomePageImagesTest;
