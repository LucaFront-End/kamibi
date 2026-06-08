import React, { useRef } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PageTransition } from '../components/layout/PageTransition';
import { MagneticButton } from '../components/ui/MagneticButton';
import './AboutPage.css';

const STATS = [
  { value: '100%', label: { es: 'Biodegradable', en: 'Biodegradable' } },
  { value: '0', label: { es: 'Plásticos', en: 'Plastics' } },
  { value: '4–5', label: { es: 'Semanas hasta volver a la tierra', en: 'Weeks to return to earth' } },
  { value: '∞', label: { es: 'Nueva vida que florece', en: 'New life that blooms' } },
];

const MATERIALS = [
  {
    icon: '🌿',
    title: { es: 'Fibra de Celulosa', en: 'Cellulose Fiber' },
    desc: { es: 'Estructura ligera y resistente de origen vegetal, 100% compostable.', en: 'Lightweight, strong plant-based structure, 100% compostable.' },
  },
  {
    icon: '🪨',
    title: { es: 'Arcilla Natural', en: 'Natural Clay' },
    desc: { es: 'Sello y estructura minerales de origen puro, sin aditivos químicos.', en: 'Pure mineral seal and structure, no chemical additives.' },
  },
  {
    icon: '🌸',
    title: { es: 'Semillas Silvestres', en: 'Wild Seeds' },
    desc: { es: 'Cada urna de tierra contiene semillas que florecen como memorial vivo.', en: 'Each earth urn contains seeds that bloom as a living memorial.' },
  },
  {
    icon: '💧',
    title: { es: 'Sin Plastificantes', en: 'Plasticizer-Free' },
    desc: { es: 'Pegamentos orgánicos y tintas naturales que se disuelven sin dejar rastro.', en: 'Organic glues and natural inks that dissolve without a trace.' },
  },
];

export const AboutPage = () => {
  const { locale } = useTranslation();
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

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
              className="about-hero-tag"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              {locale === 'es' ? 'NUESTRA HISTORIA' : 'OUR STORY'}
            </motion.span>
            <motion.h1
              className="about-hero-title"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {locale === 'es'
                ? 'Nacimos para que\nel adiós sea natural'
                : 'Born so that\ngoodbye feels natural'}
            </motion.h1>
            <motion.div
              className="about-hero-scroll-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <div className="scroll-line" />
              <span>{locale === 'es' ? 'Descubrí nuestra historia' : 'Discover our story'}</span>
            </motion.div>
          </motion.div>
        </section>

        {/* ── 2. Manifesto ──────────────────────────────────────────────── */}
        <section className="about-manifesto">
          <div className="container about-manifesto-inner">
            <motion.p
              className="manifesto-text"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
            >
              {locale === 'es'
                ? 'Creemos que la muerte no es un final. Es un regreso. Y ese regreso merece ser tan bello, tan cuidado y tan lleno de vida como todo lo que vino antes.'
                : 'We believe death is not an ending. It is a return. And that return deserves to be as beautiful, as careful, and as full of life as everything that came before.'}
            </motion.p>
          </div>
        </section>

        {/* ── 3. Stats ──────────────────────────────────────────────────── */}
        <section className="about-stats">
          <div className="container">
            <div className="stats-grid">
              {STATS.map((stat, i) => (
                <motion.div
                  key={i}
                  className="stat-item"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.12 }}
                >
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label[locale]}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Origin — split section ─────────────────────────────────── */}
        <section className="about-origin">
          <div className="container about-origin-grid">
            <motion.div
              className="origin-visual"
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src="/images/about-craft.png"
                alt={locale === 'es' ? 'Proceso de fabricación artesanal' : 'Artisan crafting process'}
                className="origin-img"
              />
              <div className="origin-img-badge">
                <span>KAMIBI®</span>
              </div>
            </motion.div>

            <motion.div
              className="origin-content"
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-label origin-tag">
                {locale === 'es' ? 'EL ORIGEN' : 'THE ORIGIN'}
              </span>
              <h2 className="origin-title heading-section">
                {locale === 'es'
                  ? 'Una pregunta cambió todo'
                  : 'One question changed everything'}
              </h2>
              <p className="text-body origin-text">
                {locale === 'es'
                  ? 'Kamibi nació de una pregunta simple: ¿por qué las despedidas tienen que ser de plástico, metal o madera que tarda cientos de años en descomponerse? Creemos que el cuerpo que nos dio la tierra merece volver a ella de forma limpia, digna y hermosa.'
                  : 'Kamibi was born from a simple question: why do farewells have to use plastic, metal, or wood that takes hundreds of years to decompose? We believe the body the earth gave us deserves to return to it cleanly, with dignity and beauty.'}
              </p>
              <p className="text-body origin-text">
                {locale === 'es'
                  ? 'Cada urna Kamibi está hecha con materiales que la naturaleza reconoce como propios: celulosa vegetal, arcilla pura y flores silvestres. Sin químicos, sin rastros, solo vida que vuelve a su ciclo.'
                  : 'Every Kamibi urn is made with materials nature recognizes as its own: plant cellulose, pure clay, and wild flowers. No chemicals, no traces, only life returning to its cycle.'}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── 5. Materials ─────────────────────────────────────────────── */}
        <section className="about-materials">
          <div className="container">
            <motion.div
              className="materials-header"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-label materials-tag">
                {locale === 'es' ? 'LOS MATERIALES' : 'THE MATERIALS'}
              </span>
              <h2 className="materials-title heading-section">
                {locale === 'es'
                  ? 'Solo lo que la naturaleza puede reconocer'
                  : 'Only what nature can recognize'}
              </h2>
            </motion.div>

            <div className="materials-grid">
              {MATERIALS.map((m, i) => (
                <motion.div
                  key={i}
                  className="material-card"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <span className="material-icon">{m.icon}</span>
                  <h3 className="material-title">{m.title[locale]}</h3>
                  <p className="material-desc text-body">{m.desc[locale]}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. Mission strip ─────────────────────────────────────────── */}
        <section className="about-mission">
          <div className="about-mission-inner">
            <motion.h2
              className="mission-headline"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              {locale === 'es'
                ? 'Un adiós que se convierte en nueva vida.'
                : 'A farewell that becomes new life.'}
            </motion.h2>
          </div>
        </section>

        {/* ── 7. CTA ───────────────────────────────────────────────────── */}
        <section className="about-cta">
          <div className="container about-cta-inner">
            <motion.h2
              className="about-cta-title heading-section"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {locale === 'es' ? 'Conocé nuestra colección' : 'Explore our collection'}
            </motion.h2>
            <motion.p
              className="about-cta-sub text-body"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {locale === 'es'
                ? 'Urnas biodegradables diseñadas para el agua, la tierra y el corazón.'
                : 'Biodegradable urns designed for water, earth, and the heart.'}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.35 }}
            >
              <MagneticButton variant="primary" onClick={() => navigate('/store')}>
                {locale === 'es' ? 'Ver Colección' : 'View Collection'}
              </MagneticButton>
            </motion.div>
          </div>
        </section>

      </div>
    </PageTransition>
  );
};

export default AboutPage;
