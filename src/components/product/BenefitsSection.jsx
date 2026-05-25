import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import './BenefitsSection.css';

export const BenefitsSection = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      id: "biodegradable",
      title: t('product.benefits.b1_title'),
      desc: t('product.benefits.b1_desc'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10A10 10 0 0 0 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          <path d="M12 6a6 6 0 0 0-6 6c0 3.31 2.69 6 6 6s6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
        </svg>
      )
    },
    {
      id: "tsa",
      title: t('product.benefits.b2_title'),
      desc: t('product.benefits.b2_desc'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 2H2v20h20V2z" />
          <path d="M12 18V6" />
          <path d="M8 10l4-4 4 4" />
        </svg>
      )
    },
    {
      id: "kit",
      title: t('product.benefits.b3_title'),
      desc: t('product.benefits.b3_desc'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      )
    },
    {
      id: "contaminants",
      title: t('product.benefits.b4_title'),
      desc: t('product.benefits.b4_desc'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M22 12H2" />
        </svg>
      )
    }
  ];

  // Eco statistics
  const stats = [
    { label: "100%", detail: "Compostable" },
    { label: "0%", detail: "Chemicals" },
    { label: "TSA", detail: "Approved" },
    { label: "Zero", detail: "Plastic" }
  ];

  return (
    <div className="benefits-section">
      <ScrollReveal direction="up" className="benefits-header text-center">
        <h3 className="heading-section benefits-title">{t('product.benefits.title')}</h3>
        <div className="divider-line-center"></div>
      </ScrollReveal>

      {/* Grid structure */}
      <div className="benefits-grid">
        {benefits.map((benefit, idx) => (
          <ScrollReveal
            key={benefit.id}
            direction="up"
            delay={idx * 0.1}
            className="benefit-card"
          >
            <div className="benefit-icon-wrapper">
              {benefit.icon}
            </div>
            <h4 className="benefit-card-title">{benefit.title}</h4>
            <p className="benefit-card-desc">{benefit.desc}</p>
          </ScrollReveal>
        ))}
      </div>

      {/* Animated Stats Banner */}
      <div className="stats-strip">
        {stats.map((stat, idx) => (
          <ScrollReveal
            key={idx}
            direction="up"
            delay={idx * 0.1}
            className="stat-box"
          >
            <span className="stat-number heading-display">{stat.label}</span>
            <span className="stat-detail text-label">{stat.detail}</span>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};
export default BenefitsSection;
