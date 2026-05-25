import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';
import './CeremonyVisualizer.css';

export const CeremonyVisualizer = () => {
  const { t, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState('water'); // 'water' | 'earth'

  const data = {
    water: {
      title: t('home.ceremonies.waterTitle'),
      desc: t('home.ceremonies.waterDesc'),
      steps: [
        t('home.ceremonies.waterStep1'),
        t('home.ceremonies.waterStep2'),
        t('home.ceremonies.waterStep3')
      ],
      specs: [
        t('home.ceremonies.waterSpec1'),
        t('home.ceremonies.waterSpec2'),
        t('home.ceremonies.waterSpec3')
      ],
      products: [
        { name: 'KAMIBI® Aqua Urn', slug: 'aqua-urn', color: '#B8C5C5' },
        { name: 'KAMIBI® Angel Urn', slug: 'angel-urn', color: '#FFFFFF' }
      ],
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
      themeClass: 'visualizer-water-theme'
    },
    earth: {
      title: t('home.ceremonies.earthTitle'),
      desc: t('home.ceremonies.earthDesc'),
      steps: [
        t('home.ceremonies.earthStep1'),
        t('home.ceremonies.earthStep2'),
        t('home.ceremonies.earthStep3')
      ],
      specs: [
        t('home.ceremonies.earthSpec1'),
        t('home.ceremonies.earthSpec2'),
        t('home.ceremonies.earthSpec3')
      ],
      products: [
        { name: 'KAMIBI® Terra Urn', slug: 'terra-urn', color: '#C4856A' },
        { name: 'KAMIBI® Flore Urn', slug: 'flore-urn', color: '#8B9E8B' },
        { name: 'KAMIBI® Iris Urn', slug: 'iris-urn', color: '#D4A5A5' }
      ],
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop',
      themeClass: 'visualizer-earth-theme'
    }
  };

  const current = data[activeTab];

  return (
    <section className={`ceremony-visualizer-section ${current.themeClass}`}>
      <div className="container">
        <ScrollReveal direction="up" className="visualizer-header text-center">
          <span className="text-label visualizer-tag">{t('home.ceremonies.tag')}</span>
          <h2 className="heading-section visualizer-title">{t('home.ceremonies.title')}</h2>
          <p className="visualizer-subtitle text-body">{t('home.ceremonies.subtitle')}</p>

          {/* Toggle Tabs */}
          <div className="visualizer-tabs-container">
            <button
              onClick={() => setActiveTab('water')}
              className={`visualizer-tab-btn text-label ${activeTab === 'water' ? 'active' : ''}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              {t('home.ceremonies.waterTab')}
            </button>
            <button
              onClick={() => setActiveTab('earth')}
              className={`visualizer-tab-btn text-label ${activeTab === 'earth' ? 'active' : ''}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
                <path d="M12 6v6l4 2" />
              </svg>
              {t('home.ceremonies.earthTab')}
            </button>
          </div>
        </ScrollReveal>

        <div className="visualizer-content-grid">
          {/* Left Column: Image Crossfade */}
          <div className="visualizer-image-col">
            <div className="visualizer-img-frame-accent"></div>
            <div className="visualizer-image-wrapper">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeTab}
                  src={current.image}
                  alt={current.title}
                  className="visualizer-img"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Information details */}
          <div className="visualizer-info-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="visualizer-info-inner"
              >
                <h3 className="heading-display visualizer-info-title">{current.title}</h3>
                <p className="visualizer-info-desc text-body">{current.desc}</p>

                {/* Steps Details */}
                <div className="visualizer-steps">
                  {current.steps.map((step, idx) => (
                    <div key={idx} className="visualizer-step-row">
                      <span className="step-number">{idx + 1}</span>
                      <span className="step-text text-body">{step}</span>
                    </div>
                  ))}
                </div>

                {/* Specifications Pills */}
                <div className="visualizer-specs-row">
                  {current.specs.map((spec, idx) => (
                    <span key={idx} className="spec-pill text-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px', color: 'var(--color-deep-sage)' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Recommended Products */}
                <div className="visualizer-compatible-block">
                  <span className="text-label compatible-label">{t('home.ceremonies.compatible')}</span>
                  <div className="compatible-links">
                    {current.products.map((prod) => (
                      <Link
                        key={prod.slug}
                        to={`/product/${prod.slug}`}
                        className="compatible-product-tag"
                      >
                        <span className="prod-color-dot" style={{ backgroundColor: prod.color }}></span>
                        <span className="prod-name-tag text-body">{prod.name}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tag-arrow">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
