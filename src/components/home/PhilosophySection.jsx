import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import { motion } from 'framer-motion';
import './PhilosophySection.css';

export const PhilosophySection = () => {
  const { t } = useTranslation();

  const valuesKeys = ['respect', 'sustainability', 'serenity', 'design'];

  // Staggered value pills variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const pillVariants = {
    hidden: { opacity: 0, y: 25, rotate: -2 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo
      },
    },
  };

  // Editorial image elements
  const imgWrapperVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const decorShapeVariants = {
    hidden: { opacity: 0, x: -25, y: -25 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 1.4,
        delay: 0.2,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="philosophy-section section-padding">
      <div className="container philosophy-container">
        {/* Left Column: Text description & values list */}
        <div className="philosophy-content">
          <ScrollReveal direction="up" className="philosophy-tag text-label">
            {t('home.philosophy.tag')}
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.15}>
            <h2 className="heading-section philosophy-title">
              {t('home.philosophy.title')}
            </h2>
          </ScrollReveal>
          
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '60px' }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="divider-line"
          />
          
          <ScrollReveal direction="up" delay={0.25} className="philosophy-text-wrapper">
            <p className="text-body philosophy-text">
              {t('home.philosophy.text1')}
            </p>
            <p className="text-body philosophy-text">
              {t('home.philosophy.text2')}
            </p>
          </ScrollReveal>

          {/* Grid of Pill/Card values */}
          <motion.div
            className="philosophy-values"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-10%' }}
          >
            {valuesKeys.map((key) => (
              <motion.div
                key={key}
                variants={pillVariants}
                className="value-pill"
              >
                <div className="value-dot"></div>
                <span>{t(`home.philosophy.values.${key}`)}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right Column: Editorial styling side-image with organic shapes */}
        <div className="philosophy-visual">
          <motion.div
            variants={imgWrapperVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-10%' }}
            className="visual-wrapper"
          >
            <img
              src="/images/philosophy-hero.png"
              alt="Urna biodegradable Kamibi sobre musgo en un bosque sereno"
              className="philosophy-img"
            />
            <motion.div
              variants={decorShapeVariants}
              className="philosophy-shape-decor"
            ></motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
export default PhilosophySection;
