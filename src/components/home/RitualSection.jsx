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
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
                src="https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=800&auto=format&fit=crop"
                alt="Sunbeams filters through forest trees"
                className="ritual-bg-img"
              />
              <div className="ritual-card-overlay"></div>
            </div>
            
            <div className="ritual-card-content">
              <div className="ritual-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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
