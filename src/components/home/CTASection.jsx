import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import { MagneticButton } from '../ui/MagneticButton';
import { useNavigate } from 'react-router-dom';
import './CTASection.css';

export const CTASection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="cta-section">
      {/* Background video with dark overlay */}
      <div className="cta-bg-wrapper">
        <video
          className="cta-bg-video"
          src="/videos/cta-background.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="cta-bg-overlay"></div>
      </div>

      {/* Content overlays */}
      <div className="container cta-container">
        <div className="cta-content">
          <ScrollReveal direction="up">
            <h2 className="heading-display cta-title">
              {t('home.cta.title')}
            </h2>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.2}>
            <p className="cta-subtitle text-body">
              {t('home.cta.subtitle')}
            </p>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.4} className="cta-btn-wrapper">
            <MagneticButton
              variant="primary"
              onClick={() => navigate('/store')}
              className="cta-btn"
            >
              {t('home.cta.button')}
            </MagneticButton>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
export default CTASection;
