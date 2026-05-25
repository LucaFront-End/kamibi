import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import './UsageGuide.css';

export const UsageGuide = () => {
  const { t } = useTranslation();

  const steps = [
    {
      num: "01",
      title: t('product.guide.step1.title'),
      desc: t('product.guide.step1.desc'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      )
    },
    {
      num: "02",
      title: t('product.guide.step2.title'),
      desc: t('product.guide.step2.desc'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    },
    {
      num: "03",
      title: t('product.guide.step3.title'),
      desc: t('product.guide.step3.desc'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    }
  ];

  return (
    <div className="usage-guide">
      <ScrollReveal direction="up" className="usage-header text-center">
        <h3 className="heading-section usage-title">{t('product.guide.title')}</h3>
        <div className="divider-line-center"></div>
      </ScrollReveal>

      <div className="usage-steps-grid">
        {/* Connecting dashline (background layout) */}
        <div className="usage-connector-line"></div>

        {steps.map((step, idx) => (
          <ScrollReveal
            key={step.num}
            direction="up"
            delay={idx * 0.15}
            className="usage-step-card"
          >
            <div className="step-badge-wrapper">
              <span className="step-number text-label">{step.num}</span>
              <div className="step-icon-circle">
                {step.icon}
              </div>
            </div>

            <h4 className="step-title">{step.title}</h4>
            <p className="step-desc">{step.desc}</p>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};
export default UsageGuide;
