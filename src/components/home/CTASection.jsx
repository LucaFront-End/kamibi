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
      {/* Background with subtle parallax */}
      <div className="cta-bg-wrapper">
        <img
          src="https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=1920&auto=format&fit=crop"
          alt="Tree leaf silhouette against deep orange sunset sky"
          className="cta-bg-img"
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
