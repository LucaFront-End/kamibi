import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import './RitualSection.css';

export const RitualSection = () => {
  const { t } = useTranslation();

  return (
    <section className="ritual-section section-padding-lg">
      <div className="container">
        {/* Title */}
        <div className="ritual-header">
          <ScrollReveal direction="up" className="text-label ritual-tag">
            {t('home.ritual.tag')}
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.15}>
            <h2 className="heading-section ritual-title">
              {t('home.ritual.title')}
            </h2>
          </ScrollReveal>
          <div className="divider-line-center"></div>
        </div>

        {/* Side-by-side splits */}
        <div className="ritual-grid">
          {/* Water Ceremony Panel */}
          <ScrollReveal direction="right" className="ritual-card water-panel">
            <div className="ritual-bg-wrapper">
              <img
                src="https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=800&auto=format&fit=crop"
                alt="Seashore waves gently breaking"
                className="ritual-bg-img"
              />
              <div className="ritual-card-overlay"></div>
            </div>
            
            <div className="ritual-card-content">
              <div className="ritual-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
              <h3 className="ritual-card-name heading-section">
                {t('home.ritual.water.title')}
              </h3>
              <p className="ritual-card-desc">
                {t('home.ritual.water.desc')}
              </p>
            </div>
          </ScrollReveal>

          {/* Earth Ceremony Panel */}
          <ScrollReveal direction="left" className="ritual-card earth-panel">
            <div className="ritual-bg-wrapper">
              <img
                src="https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop"
                alt="Sunlight filtering through a lush green forest"
                className="ritual-bg-img"
              />
              <div className="ritual-card-overlay"></div>
            </div>
            
            <div className="ritual-card-content">
              <div className="ritual-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.68-4.2A16.7 16.7 0 0 0 17 8Z" />
                  <path d="M17 8c3-1.47 5-4.42 5-8a1 1 0 0 0-1-1c-3.58 0-6.53 2-8 5" />
                  <path d="M2 22l2-2" />
                </svg>
              </div>
              <h3 className="ritual-card-name heading-section">
                {t('home.ritual.earth.title')}
              </h3>
              <p className="ritual-card-desc">
                {t('home.ritual.earth.desc')}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
export default RitualSection;
