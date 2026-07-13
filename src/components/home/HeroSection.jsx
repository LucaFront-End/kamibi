import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { MagneticButton } from '../ui/MagneticButton';
import { SplitText } from '../ui/SplitText';
import { ScrollReveal } from '../ui/ScrollReveal';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

export const HeroSection = ({ overrideTitle, overrideSubtitle, variant, bgVideo, customSlides }) => {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  
  // If video is provided, default to twilight theme. If customSlides is provided, default to first slide ID. Otherwise detect hour.
  const [activeTheme, setActiveTheme] = useState(() => {
    if (bgVideo) return 'twilight';
    if (customSlides && customSlides.length > 0) return customSlides[0].id;
    const hours = new Date().getHours();
    if (hours >= 6 && hours < 16) return 'dawn';
    if (hours >= 16 && hours < 20) return 'sunset';
    return 'twilight';
  });

  // Autoplay themes/slides rotation (only when no video bg is present, rotates every 6 seconds)
  useEffect(() => {
    if (bgVideo) return; // Disable automatic slide rotation if there is a video background
    
    const themeIds = customSlides && customSlides.length > 0
      ? customSlides.map(s => s.id)
      : ['dawn', 'sunset', 'twilight'];
      
    const timer = setInterval(() => {
      setActiveTheme((current) => {
        const nextIndex = (themeIds.indexOf(current) + 1) % themeIds.length;
        return themeIds[nextIndex];
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [activeTheme, bgVideo, customSlides]);

  const handleScrollDown = () => {
    const nextSec = document.querySelector('.philosophy-section');
    if (nextSec) {
      nextSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const themes = customSlides && customSlides.length > 0
    ? customSlides
    : [
        { id: 'dawn', labelEn: 'Dawn Mist', labelEs: 'Amanecer' },
        { id: 'sunset', labelEn: 'Golden Sunset', labelEs: 'Atardecer' },
        { id: 'twilight', labelEn: 'Serene Twilight', labelEs: 'Crepúsculo' }
      ];

  return (
    <section className={`hero-section hero-theme-${activeTheme} ${variant ? `hero-sec-variant-${variant}` : ''}`}>
      {/* Background Crossfading Images or Video */}
      <div className="hero-bg-wrapper">
        {bgVideo ? (
          <video
            src={bgVideo}
            autoPlay
            loop
            muted
            playsInline
            className="hero-bg-video"
          />
        ) : customSlides && customSlides.length > 0 ? (
          customSlides.map((slide) => (
            <img
              key={slide.id}
              src={slide.image}
              alt={locale === 'en' ? slide.labelEn : slide.labelEs}
              className={`hero-bg-img ${activeTheme === slide.id ? 'active' : ''}`}
            />
          ))
        ) : (
          <>
            <img
              src="/lake-dawn.png"
              alt="Dawn Mist"
              className={`hero-bg-img ${activeTheme === 'dawn' ? 'active' : ''}`}
            />
            <img
              src="/lake-sunset.png"
              alt="Golden Sunset"
              className={`hero-bg-img ${activeTheme === 'sunset' ? 'active' : ''}`}
            />
            <img
              src="/lake-twilight.png"
              alt="Serene Twilight"
              className={`hero-bg-img ${activeTheme === 'twilight' ? 'active' : ''}`}
            />
          </>
        )}
        <div className="hero-bg-overlay"></div>
      </div>

      {/* Content */}
      <div className="container hero-container">
        <div className="hero-card-wrapper">
          <div className={`hero-content-card card-theme-${activeTheme} ${variant ? `hero-variant-${variant}` : ''}`}>
            <div className="hero-card-badge text-label">Kamibi Memorials</div>
            
            <SplitText className="hero-title heading-display">
              {overrideTitle || t('home.hero.title')}
            </SplitText>
 
            <ScrollReveal direction="up" delay={0.4} className="hero-subtitle-wrapper">
              <p className="hero-subtitle text-body">
                {overrideSubtitle || t('home.hero.subtitle')}
              </p>
            </ScrollReveal>
 
            <ScrollReveal direction="up" delay={0.7} className="hero-cta-wrapper">
              <MagneticButton
                variant="primary"
                onClick={() => navigate('/store')}
                className="hero-cta"
              >
                {t('home.hero.cta')}
              </MagneticButton>
            </ScrollReveal>
          </div>
        </div>
 
        {/* Ambient controls (only visible if no video background is active) */}
        {!bgVideo && (
          <div className="hero-ambient-controls">
            <span className="ambient-label text-label">
              {locale === 'en' ? 'Atmosphere:' : 'Atmósfera:'}
            </span>
            <div className="ambient-buttons-group">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id)}
                  className={`ambient-btn ${activeTheme === theme.id ? 'active' : ''}`}
                >
                  <span className={`ambient-dot dot-${theme.id}`}></span>
                  {locale === 'en' ? theme.labelEn : theme.labelEs}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scroll Indicator */}
        <div className="hero-scroll-indicator" onClick={handleScrollDown}>
          <span className="scroll-text text-label">{t('nav.home')}</span>
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;
