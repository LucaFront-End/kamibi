import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';
import './EcologyTimeline.css';

export const EcologyTimeline = () => {
  const { t, locale } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: t('home.timeline.step1Title'),
      desc: t('home.timeline.step1Desc'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="timeline-svg">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      bgGlow: 'rgba(196, 169, 125, 0.08)',
      featureTag: locale === 'en' ? 'TSA Certified' : 'Certificado TSA'
    },
    {
      title: t('home.timeline.step2Title'),
      desc: t('home.timeline.step2Desc'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="timeline-svg">
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
          <path d="M12 8c-2 0-3 1.5-3 3.5s2 4.5 3 4.5 3-2.5 3-4.5S14 8 12 8z" />
          <path d="M12 3v5" />
        </svg>
      ),
      bgGlow: 'rgba(184, 197, 197, 0.1)',
      featureTag: locale === 'en' ? 'Reverence & Peace' : 'Reverencia y Paz'
    },
    {
      title: t('home.timeline.step3Title'),
      desc: t('home.timeline.step3Desc'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="timeline-svg">
          <path d="M12 5c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" strokeDasharray="3 3" />
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      ),
      bgGlow: 'rgba(139, 158, 139, 0.1)',
      featureTag: locale === 'en' ? '0% Chemicals' : '0% Químicos'
    },
    {
      title: t('home.timeline.step4Title'),
      desc: t('home.timeline.step4Desc'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="timeline-svg">
          <path d="M12 22V12M12 12c2.5-3 5.5-3.5 7-1.5s.5 5.5-2.5 7-4.5-2.5-4.5-5.5z" />
          <path d="M12 14c-2.5-2-5.5-2-6.5-.5s.5 4.5 3 4.5 3.5-2.5 3.5-4z" />
        </svg>
      ),
      bgGlow: 'rgba(196, 133, 106, 0.1)',
      featureTag: locale === 'en' ? 'Wildflowers Bloom' : 'Brote de Flores'
    }
  ];

  return (
    <section className="ecology-timeline-section">
      <div className="container">
        <ScrollReveal direction="up" className="timeline-section-header text-center">
          <span className="text-label timeline-tag">{t('home.timeline.tag')}</span>
          <h2 className="heading-section timeline-title">{t('home.timeline.title')}</h2>
          <p className="timeline-subtitle text-body">{t('home.timeline.subtitle')}</p>
        </ScrollReveal>

        {/* ── Desktop: side-by-side layout ── */}
        <div className="timeline-interactive-container desktop-timeline">
          {/* Steps Left Row Buttons */}
          <div className="timeline-left-column">
            {steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`timeline-step-btn ${activeStep === idx ? 'active' : ''}`}
                style={{ '--glow-color': step.bgGlow }}
              >
                <div className="step-btn-badge">{idx + 1}</div>
                <div className="step-btn-text text-left">
                  <span className="step-btn-tag text-label">{step.featureTag}</span>
                  <h4 className="step-btn-title">{step.title}</h4>
                </div>
                <div className="step-btn-indicator"></div>
              </button>
            ))}
          </div>

          {/* Interactive display card panel */}
          <div className="timeline-right-column">
            <div className="timeline-display-card" style={{ backgroundColor: steps[activeStep].bgGlow }}>
              <div className="card-ambient-glow" style={{ background: `radial-gradient(circle, ${steps[activeStep].bgGlow} 0%, transparent 70%)` }}></div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="timeline-card-content"
                >
                  <div className="timeline-card-icon-container">
                    <motion.div
                      className="svg-animation-wrapper"
                      initial={{ scale: 0.8, rotate: -10 }}
                      animate={{ scale: 1.1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      {steps[activeStep].icon}
                    </motion.div>
                  </div>

                  <span className="text-label timeline-card-tag">{steps[activeStep].featureTag}</span>
                  <h3 className="heading-display timeline-card-title">{steps[activeStep].title}</h3>
                  <p className="timeline-card-desc text-body">{steps[activeStep].desc}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Mobile: vertical accordion ── */}
        <div className="timeline-accordion mobile-timeline">
          {steps.map((step, idx) => {
            const isOpen = activeStep === idx;
            return (
              <div key={idx} className={`accordion-item ${isOpen ? 'open' : ''}`}>
                <button
                  className="accordion-trigger"
                  onClick={() => setActiveStep(idx)}
                >
                  <div className="accordion-left">
                    <div className={`accordion-number ${isOpen ? 'active' : ''}`}>
                      {idx + 1}
                    </div>
                    <div className="accordion-titles">
                      <span className="accordion-tag text-label">{step.featureTag}</span>
                      <h4 className="accordion-step-title">{step.title}</h4>
                    </div>
                  </div>
                  <motion.div
                    className="accordion-chevron"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="accordion-body"
                    >
                      <div className="accordion-body-inner" style={{ backgroundColor: step.bgGlow }}>
                        <div className="accordion-icon-wrap">
                          <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                          >
                            {step.icon}
                          </motion.div>
                        </div>
                        <p className="accordion-desc text-body">{step.desc}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
