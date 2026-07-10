import React, { useRef } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PageTransition } from '../components/layout/PageTransition';
import { MagneticButton } from '../components/ui/MagneticButton';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { useSEO } from '../hooks/useSEO';
import './AboutPage.css';

export const AboutPage = () => {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const cycleRef = useRef(null);

  useSEO({
    titleEn: 'About Kamibi Store | Eco Friendly Urns & Sustainable Memorial Products',
    titleEs: 'Sobre Kamibi Store | Urnas Ecológicas y Productos Memoriales Sustentables',
    descEn:  'Learn how Kamibi Store helps families honor loved ones through biodegradable urns, eco memorial products, burial at sea urns, and environmentally responsible memorial solutions.',
    descEs:  'Conoce cómo Kamibi Store ayuda a las familias a honrar a sus seres queridos mediante urnas biodegradables, memoriales ecológicos y soluciones sustentables para despedidas significativas.',
    locale,
  });

  // Parallax effects for Hero
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  // Manifesto word reveal helper
  const manifestoText = t('about.manifesto.text') || '';
  const words = manifestoText.split(' ');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.025,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0.15, y: 8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    },
  };

  // Stats Data
  const STATS = [
    { value: '100%', label: t('about.stats.biodegradable') },
    { value: '0', label: t('about.stats.plastics') },
    { value: '3–5', label: t('about.stats.returnTime') },
    { value: '∞', label: t('about.stats.newLife') },
  ];

  // Timeline Journey milestones
  const JOURNEY = [
    {
      year: '2021',
      title: t('about.journey.t1Title'),
      text: t('about.journey.t1Text'),
    },
    {
      year: '2022',
      title: t('about.journey.t2Title'),
      text: t('about.journey.t2Text'),
    },
    {
      year: '2023',
      title: t('about.journey.t3Title'),
      text: t('about.journey.t3Text'),
    },
    {
      year: '2024',
      title: t('about.journey.t4Title'),
      text: t('about.journey.t4Text'),
    },
  ];

  // Ecological Cycle steps
  const CYCLE_STEPS = [
    {
      num: '01',
      title: t('about.cycle.c1Title'),
      desc: t('about.cycle.c1Desc'),
    },
    {
      num: '02',
      title: t('about.cycle.c2Title'),
      desc: t('about.cycle.c2Desc'),
    },
    {
      num: '03',
      title: t('about.cycle.c3Title'),
      desc: t('about.cycle.c3Desc'),
    },
    {
      num: '04',
      title: t('about.cycle.c4Title'),
      desc: t('about.cycle.c4Desc'),
    },
  ];

  // Materials Breakdown
  const MATERIALS = [
    {
      icon: '🌿',
      title: t('about.materials.m1Title'),
      desc: t('about.materials.m1Desc'),
    },
    {
      icon: '🪢',
      title: t('about.materials.m2Title'),
      desc: t('about.materials.m2Desc'),
    },
    {
      icon: '🌎',
      title: t('about.materials.m3Title'),
      desc: t('about.materials.m3Desc'),
    },
    {
      icon: '🌱',
      title: t('about.materials.m4Title'),
      desc: t('about.materials.m4Desc'),
    },
  ];

  return (
    <PageTransition>
      <div className="about-page">

        {/* ── 1. Cinematic Hero ─────────────────────────────────────────── */}
        <section className="about-hero" ref={heroRef}>
          <motion.div
            className="about-hero-bg"
            style={{ scale: heroScale, y: heroY }}
          >
            <img
              src="/images/about-hero.png"
              alt="Misty ancient forest — Kamibi"
              className="about-hero-img"
            />
            <div className="about-hero-overlay" />
          </motion.div>
          <motion.div className="about-hero-content" style={{ opacity: heroOpacity }}>
            <motion.span
              className="about-hero-tag animate-letter-spacing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              {t('about.hero.tag')}
            </motion.span>
            <motion.h1
              className="about-hero-title"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {t('about.hero.title')}
            </motion.h1>
            <motion.div
              className="about-hero-scroll-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <div className="scroll-line" />
              <span>{t('about.hero.scrollHint')}</span>
            </motion.div>
          </motion.div>
        </section>

        {/* ── 2. Manifesto (Word-by-word reveal) ────────────────────────── */}
        <section className="about-manifesto">
          <div className="container about-manifesto-inner">
            <motion.p
              className="manifesto-text"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-15%' }}
            >
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  variants={wordVariants}
                  style={{ display: 'inline-block', marginRight: '0.25em' }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.p>
          </div>
        </section>

        {/* ── 3. Stats Section ──────────────────────────────────────────── */}
        <section className="about-stats">
          <div className="container">
            <div className="stats-grid">
              {STATS.map((stat, i) => (
                <ScrollReveal
                  key={i}
                  direction="up"
                  delay={i * 0.1}
                  className="stat-item-reveal"
                >
                  <div className="stat-item">
                    <span className="stat-value">{stat.value}</span>
                    <div className="stat-divider" />
                    <span className="stat-label">{stat.label}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Our Journey — Interactive Timeline ────────────────────── */}
        <section className="about-journey">
          <div className="container">
            <ScrollReveal direction="up" className="journey-header">
              <span className="text-label journey-tag">{t('about.journey.tag')}</span>
              <h2 className="journey-main-title heading-section">{t('about.journey.title')}</h2>
            </ScrollReveal>

            <div className="timeline-container">
              <div className="timeline-line" />
              {JOURNEY.map((item, i) => (
                <div key={i} className={`timeline-row ${i % 2 === 0 ? 'left-row' : 'right-row'}`}>
                  <div className="timeline-dot-wrapper">
                    <div className="timeline-dot" />
                  </div>
                  <ScrollReveal 
                    direction={i % 2 === 0 ? 'left' : 'right'} 
                    delay={0.1} 
                    className="timeline-card-reveal"
                  >
                    <div className="timeline-card">
                      <span className="timeline-year">{item.year}</span>
                      <h3 className="timeline-title">{item.title}</h3>
                      <p className="timeline-text text-body">{item.text}</p>
                    </div>
                  </ScrollReveal>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. The Ecological Cycle (Refined Step-by-Step) ───────────── */}
        <section className="about-cycle" ref={cycleRef}>
          <div className="container">
            <ScrollReveal direction="up" className="cycle-header">
              <span className="text-label cycle-tag">{t('about.cycle.tag')}</span>
              <h2 className="cycle-main-title heading-section">{t('about.cycle.title')}</h2>
            </ScrollReveal>

            <div className="cycle-grid">
              {CYCLE_STEPS.map((step, i) => (
                <ScrollReveal
                  key={i}
                  direction="up"
                  delay={i * 0.12}
                  className="cycle-step-card"
                >
                  <div className="cycle-step-inner">
                    <span className="cycle-step-num">{step.num}</span>
                    <h3 className="cycle-step-title">{step.title}</h3>
                    <p className="cycle-step-desc text-body">{step.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. Detailed Materials Breakdown ────────────────────────────── */}
        <section className="about-materials">
          <div className="container">
            <div className="materials-layout-grid">
              <ScrollReveal direction="left" className="materials-text-column">
                <span className="text-label materials-tag">{t('about.materials.tag')}</span>
                <h2 className="materials-title heading-section">{t('about.materials.title')}</h2>
                <div className="materials-illustration-wrapper">
                  <img
                    src="/images/about-process.png"
                    alt="Kamibi raw biological materials"
                    className="materials-illustration"
                  />
                  <div className="materials-badge">
                    <span>ORGANIC®</span>
                  </div>
                </div>
              </ScrollReveal>

              <div className="materials-cards-column">
                {MATERIALS.map((m, i) => (
                  <ScrollReveal
                    key={i}
                    direction="right"
                    delay={i * 0.08}
                    className="material-card-reveal"
                  >
                    <div className="material-card-v2">
                      <div className="material-card-header">
                        <span className="material-icon-v2">{m.icon}</span>
                        <h3 className="material-title-v2">{m.title}</h3>
                      </div>
                      <p className="material-desc-v2 text-body">{m.desc}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. The Soul of Kamibi (Workspace/Letter) ─────────────────── */}
        <section className="about-soul">
          <div className="container about-soul-grid">
            <ScrollReveal direction="left" className="soul-visual">
              <img
                src="/images/about-workspace.png"
                alt="Kamibi design studio"
                className="soul-img"
              />
            </ScrollReveal>

            <ScrollReveal direction="right" className="soul-content" delay={0.15}>
              <span className="text-label soul-tag">{t('about.founders.tag')}</span>
              <h2 className="soul-title heading-section">{t('about.founders.title')}</h2>
              <p className="text-body soul-text leading-relaxed">
                {t('about.founders.text1')}
              </p>
              <p className="text-body soul-text leading-relaxed">
                {t('about.founders.text2')}
              </p>
              <div className="soul-signature">
                <span>{t('about.founders.signature')}</span>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 8. Poetic Quote ───────────────────────────────────────────── */}
        <section className="about-quote">
          <div className="container">
            <ScrollReveal direction="fade" className="quote-inner">
              <span className="quote-leaf">⚜</span>
              <blockquote className="poetic-blockquote">
                {t('about.testimonial.quote')}
              </blockquote>
              <cite className="quote-author">{t('about.testimonial.author')}</cite>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 9. Premium CTA ────────────────────────────────────────────── */}
        <section className="about-cta-v2">
          <div className="container about-cta-inner-v2">
            <ScrollReveal direction="up" className="cta-reveal-block">
              <h2 className="about-cta-title-v2">{t('about.cta.title')}</h2>
              <p className="about-cta-sub-v2 text-body">
                {t('about.cta.desc')}
              </p>
              <div className="cta-button-wrapper">
                <MagneticButton variant="primary" onClick={() => navigate('/store')}>
                  {t('about.cta.ctaBtn')}
                </MagneticButton>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </div>
    </PageTransition>
  );
};

export default AboutPage;
