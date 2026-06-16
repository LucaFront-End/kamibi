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
      hook: t('product.guide.step1.hook'),
      desc: t('product.guide.step1.desc'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78z" />
          <path d="M15.5 8.5L19 5" />
          <path d="M14 11l1.5-1.5" />
        </svg>
      )
    },
    {
      num: "02",
      title: t('product.guide.step2.title'),
      hook: t('product.guide.step2.hook'),
      desc: t('product.guide.step2.desc'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      )
    },
    {
      num: "03",
      title: t('product.guide.step3.title'),
      hook: t('product.guide.step3.hook'),
      desc: t('product.guide.step3.desc'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 11V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v5" />
          <path d="M2 11a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5" />
          <path d="M10 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
          <path d="M10 16v-5" />
        </svg>
      )
    },
    {
      num: "04",
      title: t('product.guide.step4.title'),
      hook: t('product.guide.step4.hook'),
      desc: t('product.guide.step4.desc'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      )
    },
    {
      num: "05",
      title: t('product.guide.step5.title'),
      hook: t('product.guide.step5.hook'),
      desc: t('product.guide.step5.desc'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12l3 3 5-5" />
        </svg>
      )
    },
    {
      num: "06",
      title: t('product.guide.step6.title'),
      hook: t('product.guide.step6.hook'),
      desc: t('product.guide.step6.desc'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
          <path d="M16 8h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
          <circle cx="5.5" cy="18" r="2" />
          <circle cx="18.5" cy="18" r="2" />
        </svg>
      )
    },
    {
      num: "07",
      title: t('product.guide.step7.title'),
      hook: t('product.guide.step7.hook'),
      desc: t('product.guide.step7.desc'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      )
    },
    {
      num: "08",
      title: t('product.guide.step8.title'),
      hook: t('product.guide.step8.hook'),
      desc: t('product.guide.step8.desc'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.68-4.2A16.7 16.7 0 0 0 17 8Z" />
          <path d="M17 8c3-1.47 5-4.42 5-8a1 1 0 0 0-1-1c-3.58 0-6.53 2-8 5" />
          <path d="M2 22l2-2" />
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
        {steps.map((step, idx) => (
          <ScrollReveal
            key={step.num}
            direction="up"
            delay={idx * 0.08}
            className="usage-step-card"
          >
            <div className="step-badge-wrapper">
              <span className="step-number text-label">{step.num}</span>
              <div className="step-icon-circle">
                {step.icon}
              </div>
            </div>

            <h4 className="step-title">{step.title}</h4>
            <span className="step-hook text-label">{step.hook}</span>
            <p className="step-desc">{step.desc}</p>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};
export default UsageGuide;
