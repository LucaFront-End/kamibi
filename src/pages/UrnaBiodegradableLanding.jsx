import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useWixProducts } from '../hooks/useWixProducts';
import { useSEO } from '../hooks/useSEO';
import './UrnaBiodegradableLanding.css';

/**
 * Wrapper for individual sticky stacking cards with scroll-driven scale & depth
 */
const StickyCardWrapper = ({ index, total, children }) => {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start start', 'end start'],
  });

  // As the user scrolls past this card's top, slightly scale it down to create 3D stack depth
  const targetScale = 1 - (total - 1 - index) * 0.035;
  const scale = useTransform(scrollYProgress, [0, 1], [1, index === total - 1 ? 1 : targetScale]);

  return (
    <div
      ref={cardRef}
      className="kmb-sticky-card-slot"
      style={{
        top: `calc(88px + ${index * 26}px)`,
        zIndex: index + 1,
      }}
    >
      <motion.div
        style={{ scale }}
        className={`kmb-sticky-card kmb-sticky-card-${index + 1}`}
      >
        {children}
      </motion.div>
    </div>
  );
};

export const UrnaBiodegradableLanding = () => {
  const { locale } = useTranslation();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useWixProducts();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // SEO configuration: strictly NOINDEX, NOFOLLOW
  useSEO({
    titleEs: 'Urnas Biodegradables Kamibi® — Regresa a la Naturaleza. Nada Menos.',
    titleEn: 'Kamibi® Biodegradable Urns — Return to Nature. Nothing Less.',
    descEs: 'Una despedida ecológica, digna y eterna. Urnas biodegradables 100% orgánicas para ceremonias en tierra o mar.',
    descEn: 'An eco-friendly, dignified and eternal farewell. 100% organic biodegradable urns for earth or water ceremonies.',
    locale,
    noindex: true,
  });

  // Hero interactive atmosphere state: 'earth' | 'water' | 'mini'
  const [heroMode, setHeroMode] = useState('earth');
  // Card 1 interactive toggle: 'earth' | 'water'
  const [cardBioMode, setCardBioMode] = useState('earth');
  // Card 2 active material highlight
  const [activeMaterialIdx, setActiveMaterialIdx] = useState(0);
  // Carousel category filter
  const [carouselCategory, setCarouselCategory] = useState('all');
  // Modal state: 'how-it-works' | 'materials' | null
  const [activeModal, setActiveModal] = useState(null);
  // Feedback when adding to cart
  const [addedProductId, setAddedProductId] = useState(null);

  // Hero scroll parallax
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroBgY = useTransform(heroScroll, [0, 1], ['0%', '14%']);
  const heroUrnY = useTransform(heroScroll, [0, 1], ['0%', '-10%']);

  // Hero Modes Data
  const heroAtmospheres = {
    earth: {
      id: 'terra-urn',
      slug: 'terra-urn',
      label: 'Tierra & Bosque',
      tag: 'CEREMONIA EN TIERRA',
      urnName: 'KAMIBI® Terra (Bios)',
      urnCaption: 'Se integra con el suelo en 2 a 4 semanas y nutre nuevas raíces.',
      price: 189.00,
      bgImage: '/images/hero-earth-ceremony.png',
      urnImage: '/products/terra-urn.png',
      secondaryUrnImage: '/products/flore-urn.png',
      accentColor: '#C4856A',
      badgeTop: '100% Compostable con Semillas Vivas',
      badgeBottom: 'Integración en suelo: 2 a 4 semanas',
    },
    water: {
      id: 'aqua-urn',
      slug: 'aqua-urn',
      label: 'Océano & Calma',
      tag: 'CEREMONIA EN AGUA',
      urnName: 'KAMIBI® Aqua (Ocean)',
      urnCaption: 'Flota con serenidad y se disuelve limpiamente en el mar en ~30 minutos.',
      price: 165.75,
      originalPrice: 195.00,
      bgImage: '/images/hero-water-ceremony.png',
      urnImage: '/products/aqua-urn.png',
      secondaryUrnImage: '/products/angel-urn.png',
      accentColor: '#7A9A9A',
      badgeTop: 'pH Neutro • Seguro para Fauna Marina',
      badgeBottom: 'Flotación suave y disolución en 30 min',
    },
    mini: {
      id: 'mini-urns',
      slug: 'mini-biodegradables-urn-set',
      label: 'Set Familiar (x4)',
      tag: 'MEMORIAL COMPARTIDO',
      urnName: 'KAMIBI® Mini Sharing Set',
      urnCaption: '4 mini urnas orgánicas para que cada familiar realice su propio tributo.',
      price: 49.99,
      bgImage: '/images/philosophy-hero.png',
      urnImage: '/products/mini-urns.png',
      secondaryUrnImage: '/products/iris-urn.png',
      accentColor: '#8B9E8B',
      badgeTop: 'Set de 4 Réplicas Biodegradables',
      badgeBottom: 'Ideal para compartir o mascotas',
    },
  };

  const currentHero = heroAtmospheres[heroMode];

  // Botanical materials for Card 2
  const botanicalMaterials = [
    {
      title: 'Celulosa Virgen Prensada',
      subtitle: 'Fibras vegetales de bosques sostenibles',
      detail: 'Moldeada a mano sin cloros ni resinas sintéticas. Protege las cenizas de forma indefinida mientras se mantenga en un ambiente seco interior.',
      stat: '0% Plásticos',
    },
    {
      title: 'Arcilla & Sal Mineral Pura',
      subtitle: 'Equilibrio biológico para tierra y océano',
      detail: 'Compuestos minerales de pH neutro que se funden con el agua o el suelo sin alterar la microbiología ni la flora marina.',
      stat: 'pH Neutro 7.0',
    },
    {
      title: 'Cápsula de Semillas Nativas',
      subtitle: 'Memoria que germina en nueva vida',
      detail: 'Incluye semillas seleccionadas de flores silvestres y especies arbóreas para transformar el lugar del descanso en un jardín vivo.',
      stat: 'Vida Eterna',
    },
    {
      title: 'Pétalos Naturales & Almidón',
      subtitle: 'Aglutinantes 100% botánicos',
      detail: 'Unidos mediante extractos orgánicos de maíz y decorados con pétalos prensados reales y tintes de origen vegetal.',
      stat: '100% Orgánico',
    },
  ];

  // Comparison models definition
  const comparisonModels = [
    {
      id: 'terra-urn',
      slug: 'terra-urn',
      name: 'Kamibi Bios',
      edition: 'Versión Tierra & Árbol',
      tagline: 'Para jardines, bosques memoriales o entierros ecológicos.',
      image: '/products/terra-urn.png',
      bgAura: 'radial-gradient(circle at 50% 42%, rgba(196, 133, 106, 0.22), rgba(232, 222, 209, 0.05) 70%)',
      price: 189.00,
      originalPrice: null,
      palette: [
        { hex: '#C4856A', name: 'Terracotta' },
        { hex: '#8B9E8B', name: 'Floral Sage' },
        { hex: '#D4A5A5', name: 'Soft Rose' },
      ],
      specs: {
        material: 'Sustrato vegetal, celulosa virgen y arcilla natural',
        time: '2 a 4 semanas en contacto con la tierra',
        capacity: '3.5 Litros (Capacidad completa adulto)',
        memory: 'Incluye cápsula de germinación y semillas vivas',
        ceremony: 'Bosque conmemorativo, jardín privado o maceta grande',
        tsa: 'Certificada TSA para equipaje de mano en avión',
      },
    },
    {
      id: 'aqua-urn',
      slug: 'aqua-urn',
      name: 'Kamibi Ocean',
      edition: 'Versión Mar & Agua',
      tagline: 'Diseñada para flotar brevemente y descender con gracia en el agua.',
      image: '/products/aqua-urn.png',
      bgAura: 'radial-gradient(circle at 50% 42%, rgba(184, 197, 197, 0.35), rgba(232, 222, 209, 0.05) 70%)',
      price: 165.75,
      originalPrice: 195.00,
      badge: 'Más Elegida',
      palette: [
        { hex: '#B8C5C5', name: 'Ocean Mint' },
        { hex: '#FFFFFF', name: 'Pure Angel White' },
        { hex: '#E8DED1', name: 'Sand Mist' },
      ],
      specs: {
        material: 'Celulosa hidrosoluble orgánica y sal marina mineral',
        time: 'Flota 5–10 min; disolución total en ~30 minutos',
        capacity: '3.2 Litros (Capacidad completa adulto)',
        memory: 'Disolución marina limpia con bolsa soluble incluida',
        ceremony: 'Altamar, costa, lago, laguna o río de curso libre',
        tsa: 'Certificada TSA para equipaje de mano en avión',
      },
    },
    {
      id: 'mini-urns',
      slug: 'mini-biodegradables-urn-set',
      name: 'Kamibi Mini',
      edition: 'Set Familiar (x4) & Mascotas',
      tagline: 'Cuatro mini urnas para compartir el homenaje entre familiares.',
      image: '/products/mini-urns.png',
      bgAura: 'radial-gradient(circle at 50% 42%, rgba(139, 158, 139, 0.25), rgba(232, 222, 209, 0.05) 70%)',
      price: 49.99,
      originalPrice: null,
      palette: [
        { hex: '#E8DED1', name: 'Warm Sand' },
        { hex: '#C4856A', name: 'Clay' },
        { hex: '#8B9E8B', name: 'Sage' },
      ],
      specs: {
        material: 'Fibra botánica compacta y almidones vegetales',
        time: '1 a 3 semanas en tierra o agua dulce',
        capacity: '0.4 L por unidad (Incluye pack de 4 urnas)',
        memory: 'Cajas individuales de presentación para cada familiar',
        ceremony: 'Ceremonias íntimas simultáneas o memorial de mascotas',
        tsa: 'Certificada TSA para equipaje de mano en avión',
      },
    },
  ];

  // Carousel filtering & scrolling
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const filteredCarouselProducts = products.filter((p) => {
    if (carouselCategory === 'all') return true;
    if (carouselCategory === 'earth') {
      return ['terra-urn', 'flore-urn', 'iris-urn'].some((s) => p.slug?.includes(s) || p.id?.includes(s));
    }
    if (carouselCategory === 'water') {
      return ['aqua-urn', 'angel-urn'].some((s) => p.slug?.includes(s) || p.id?.includes(s));
    }
    if (carouselCategory === 'sets') {
      return p.category === 'minis' || p.category === 'bags' || p.slug?.includes('mini') || p.slug?.includes('bag');
    }
    return true;
  });

  const checkScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const offset = direction === 'left' ? -380 : 380;
    carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkScroll, 380);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Direct Add To Cart handler
  const handleDirectBuy = (productData) => {
    const matched = products.find(
      (p) => p.slug === productData.slug || p.id === productData.id
    );
    const itemToAdd = matched || {
      id: productData.id,
      _wixId: productData._wixId,
      name: productData.name || productData.urnName,
      price: productData.price,
      slug: productData.slug,
      images: [productData.image || productData.urnImage],
    };

    addToCart(itemToAdd, 1);
    setAddedProductId(productData.id);
    setTimeout(() => setAddedProductId(null), 2400);
  };

  // Editorial Reviews
  const reviews = [
    {
      id: 1,
      quote:
        'Hicimos la ceremonia en el mar al amanecer. La urna Aqua flotó con una serenidad indescriptible entre flores antes de sumergirse suavemente. Sentir que regresó a la naturaleza sin contaminar el océano nos dio una paz inmensa.',
      author: 'Elena R. de Mendoza',
      location: 'Ceremonia en el Mediterráneo',
      edition: 'Kamibi Ocean (Aqua)',
      image: '/images/hero-water-ceremony.png',
    },
    {
      id: 2,
      quote:
        'Plantamos la urna Terra junto con las semillas en el jardín de nuestra casa familiar. Hoy ese rincón está lleno de brotes verdes; transformó el dolor de la despedida en un lugar lleno de vida al que siempre podemos volver.',
      author: 'Marcus & Claudia G.',
      location: 'Bosque Memorial Familiar',
      edition: 'Kamibi Bios (Terra)',
      image: '/images/hero-earth-ceremony.png',
    },
    {
      id: 3,
      quote:
        'Mis hermanos y yo vivimos en distintos países. El set de 4 mini urnas nos permitió a cada uno realizar un ritual íntimo en los lugares que nuestra madre más amaba. La textura artesanal del papel es conmovedora.',
      author: 'Sofía Valenzuela',
      location: 'Homenaje Familiar Compartido',
      edition: 'Kamibi Mini Sharing Set',
      image: '/images/philosophy-hero.png',
    },
  ];

  return (
    <div className="kmb-landing">
      {/* =====================================================================
          1. HERO SECTION — SANTUARIO NATURAL KAMIBI (Minimalist Organic Luxury)
         ===================================================================== */}
      <section className="kmb-hero" ref={heroRef}>
        {/* Subtle ambient organic light auras */}
        <div className="kmb-hero-aura kmb-aura-1" />
        <div className="kmb-hero-aura kmb-aura-2" />

        <div className="kmb-container kmb-hero-grid">
          {/* Left Column: Poetic Editorial Typography & Interactive Controls */}
          <div className="kmb-hero-copy">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="kmb-eyebrow-pill"
            >
              <span className="kmb-gold-dot" />
              <span>KAMIBI® MEMORIALS • 100% ORGÁNICO</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="kmb-hero-title"
            >
              Regresa a la naturaleza.
              <span className="kmb-hero-title-italic">Nada menos.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="kmb-hero-subtitle"
            >
              Una despedida ecológica, digna y eterna. Esculpidas a mano con fibras botánicas, arcilla mineral y semillas vivas que se integran armónicamente con el planeta.
            </motion.p>

            {/* Interactive Elemental Atmosphere Switcher */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="kmb-hero-element-selector"
            >
              <span className="kmb-selector-label">Elige el entorno del homenaje:</span>
              <div className="kmb-selector-pills">
                {Object.entries(heroAtmospheres).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => setHeroMode(key)}
                    className={`kmb-element-btn ${heroMode === key ? 'active' : ''}`}
                  >
                    <span
                      className="kmb-element-swatch"
                      style={{ backgroundColor: item.accentColor }}
                    />
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Primary & Secondary CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
              className="kmb-hero-actions"
            >
              <button
                onClick={() => scrollToSection('comparativa')}
                className="kmb-btn-primary"
              >
                <span>Comprar ahora</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              <button
                onClick={() => setActiveModal('how-it-works')}
                className="kmb-btn-ghost"
              >
                <span>Ver cómo funciona</span>
                <span className="kmb-link-arrow">→</span>
              </button>
            </motion.div>

            {/* Trust Micro-bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.45 }}
              className="kmb-hero-trust-row"
            >
              <div className="kmb-trust-Point">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Desde $49.99 / $165.75 USD</span>
              </div>
              <span className="kmb-trust-sep">•</span>
              <div className="kmb-trust-Point">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Certificación Aérea TSA</span>
              </div>
              <span className="kmb-trust-sep">•</span>
              <div className="kmb-trust-Point">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Envío Express Discreto</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Dual-Layer Nature Arch + Floating 3D Product Showcase */}
          <div className="kmb-hero-stage">
            <div className="kmb-sanctuary-arch-wrapper">
              {/* Decorative organic gold line arch */}
              <div className="kmb-arch-gold-outline" />

              {/* Arched Nature Ceremony Window */}
              <div className="kmb-sanctuary-arch">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentHero.bgImage}
                    src={currentHero.bgImage}
                    alt={currentHero.urnName}
                    style={{ y: heroBgY }}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1.02 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="kmb-arch-bg-img"
                  />
                </AnimatePresence>
                <div className="kmb-arch-gradient-veil" />

                {/* Top Floating Nature Pill inside Arch */}
                <div className="kmb-arch-top-tag">
                  <span className="kmb-pulse-dot" />
                  <span>{currentHero.badgeTop}</span>
                </div>
              </div>

              {/* Foreground Floating Product Pedestal Card */}
              <motion.div
                style={{ y: heroUrnY }}
                className="kmb-floating-urn-card"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentHero.id}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="kmb-floating-urn-inner"
                  >
                    <div className="kmb-floating-urn-visual">
                      <img
                        src={currentHero.urnImage}
                        alt={currentHero.urnName}
                        className="kmb-floating-urn-img"
                      />
                      <img
                        src={currentHero.secondaryUrnImage}
                        alt="Variante complementaria Kamibi"
                        className="kmb-floating-urn-secondary"
                      />
                    </div>

                    <div className="kmb-floating-urn-info">
                      <span className="kmb-floating-tag">{currentHero.tag}</span>
                      <h3 className="kmb-floating-name">{currentHero.urnName}</h3>
                      <p className="kmb-floating-desc">{currentHero.urnCaption}</p>

                      <div className="kmb-floating-footer">
                        <div className="kmb-floating-price-col">
                          <span className="kmb-floating-price">
                            ${currentHero.price.toFixed(2)} <small>USD</small>
                          </span>
                          {currentHero.originalPrice && (
                            <span className="kmb-floating-old-price">
                              ${currentHero.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleDirectBuy(currentHero)}
                          className={`kmb-floating-buy-btn ${
                            addedProductId === currentHero.id ? 'added' : ''
                          }`}
                        >
                          {addedProductId === currentHero.id ? '✓ En tu carrito' : 'Añadir +'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. STICKY STACKING CARDS SECTION — SCROLL-DRIVEN STORYTELLING
         ===================================================================== */}
      <section className="kmb-stack-section" id="caracteristicas">
        <div className="kmb-container">
          <div className="kmb-section-intro">
            <span className="kmb-section-eyebrow">DISEÑO BIODEGRADABLE CONSCIENTE</span>
            <h2 className="kmb-section-heading">
              Creada para proteger en el hogar y florecer en la naturaleza.
            </h2>
            <p className="kmb-section-lead">
              Desliza para descubrir cómo cada capa de Kamibi une artesanía orgánica, respeto ambiental y una despedida llena de significado.
            </p>
          </div>

          {/* Sticky Cards Stack Container */}
          <div className="kmb-sticky-stack-container">
            
            {/* ---------------------------------------------------------------
                CARD 1: DISEÑADA PARA FLORECER (Biodegradación Controlada)
               --------------------------------------------------------------- */}
            <StickyCardWrapper index={0} total={3}>
              <div className="kmb-stack-card-grid">
                {/* Left Visual Pane with Interactive Switcher */}
                <div className="kmb-stack-visual-pane">
                  <div className="kmb-bio-showcase-stage">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={cardBioMode}
                        initial={{ opacity: 0, scale: 0.94, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="kmb-bio-stage-inner"
                      >
                        <div className="kmb-bio-env-backdrop">
                          <img
                            src={
                              cardBioMode === 'earth'
                                ? '/images/hero-earth-ceremony.png'
                                : '/images/hero-water-ceremony.png'
                            }
                            alt="Entorno natural"
                            className="kmb-bio-env-img"
                          />
                        </div>
                        <img
                          src={
                            cardBioMode === 'earth'
                              ? '/products/terra-urn.png'
                              : '/products/aqua-urn.png'
                          }
                          alt="Urna Biodegradable Kamibi"
                          className="kmb-bio-urn-render"
                        />
                        <div className="kmb-bio-floor-shadow" />
                      </motion.div>
                    </AnimatePresence>

                    {/* Segmented Toggle Pill */}
                    <div className="kmb-segmented-toggle">
                      <button
                        onClick={() => setCardBioMode('earth')}
                        className={`kmb-seg-btn ${cardBioMode === 'earth' ? 'active' : ''}`}
                      >
                        Tierra & Árbol
                      </button>
                      <button
                        onClick={() => setCardBioMode('water')}
                        className={`kmb-seg-btn ${cardBioMode === 'water' ? 'active' : ''}`}
                      >
                        Agua & Mar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Content Pane */}
                <div className="kmb-stack-text-pane">
                  <div className="kmb-card-step-header">
                    <span className="kmb-card-step-num">01 / 03</span>
                    <span className="kmb-card-step-tag">DISEÑADA PARA FLORECER</span>
                  </div>

                  <h3 className="kmb-stack-card-title">
                    Biodegradación natural controlada en tierra o agua.
                  </h3>

                  <p className="kmb-stack-card-desc">
                    Kamibi está fabricada con compuestos orgánicos que protegen las cenizas de tu ser querido hasta el momento de su contacto con la naturaleza, disolviéndose de manera segura sin dejar residuos químicos ni alterar el ecosistema.
                  </p>

                  <div className="kmb-metrics-row">
                    <div className="kmb-metric-item">
                      <span className="kmb-metric-val">100%</span>
                      <span className="kmb-metric-lbl">Compuestos botánicos y arcilla mineral</span>
                    </div>
                    <div className="kmb-metric-item">
                      <span className="kmb-metric-val">0%</span>
                      <span className="kmb-metric-lbl">Residuos químicos, resinas o metales</span>
                    </div>
                    <div className="kmb-metric-item">
                      <span className="kmb-metric-val">
                        {cardBioMode === 'earth' ? '2 a 4 sem' : '30 min'}
                      </span>
                      <span className="kmb-metric-lbl">
                        {cardBioMode === 'earth'
                          ? 'Integración armónica en suelo'
                          : 'Disolución limpia en agua'}
                      </span>
                    </div>
                  </div>

                  <div className="kmb-stack-card-links">
                    <button
                      onClick={() => setActiveModal('how-it-works')}
                      className="kmb-text-action-btn"
                    >
                      Saber más sobre el ritual <span>→</span>
                    </button>
                    <button
                      onClick={() => setActiveModal('materials')}
                      className="kmb-text-action-btn"
                    >
                      Ver materiales <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </StickyCardWrapper>

            {/* ---------------------------------------------------------------
                CARD 2: ALQUIMIA BOTÁNICA (Materiales Puros & Pétalos Reales)
               --------------------------------------------------------------- */}
            <StickyCardWrapper index={1} total={3}>
              <div className="kmb-stack-card-grid">
                {/* Left Visual Pane: Craftsmanship & Pressed Petals */}
                <div className="kmb-stack-visual-pane">
                  <div className="kmb-craft-collage">
                    <img
                      src="/images/about-craft.png"
                      alt="Artesanía botánica Kamibi"
                      className="kmb-craft-main-img"
                    />
                    <div className="kmb-craft-floating-urn-box">
                      <img
                        src="/products/flore-urn.png"
                        alt="Kamibi Flore con pétalos naturales"
                        className="kmb-craft-urn-img"
                      />
                      <span className="kmb-craft-urn-caption">
                        Edición Flore • Pétalos reales prensados
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Content Pane: Interactive Botanical Breakdown */}
                <div className="kmb-stack-text-pane">
                  <div className="kmb-card-step-header">
                    <span className="kmb-card-step-num">02 / 03</span>
                    <span className="kmb-card-step-tag">ALQUIMIA BOTÁNICA</span>
                  </div>

                  <h3 className="kmb-stack-card-title">
                    Solo lo que la tierra y el océano reconocen como propio.
                  </h3>

                  <p className="kmb-stack-card-desc">
                    Cada urna permanece firme e intacta durante años mientras se conserve en el hogar. Su proceso de reintegración biológica solo se activa al entrar en contacto profundo con el agua o la humedad de la tierra.
                  </p>

                  {/* Interactive Material Selector Pills */}
                  <div className="kmb-materials-interactive-box">
                    <div className="kmb-material-tabs">
                      {botanicalMaterials.map((mat, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveMaterialIdx(idx)}
                          className={`kmb-mat-tab ${activeMaterialIdx === idx ? 'active' : ''}`}
                        >
                          {mat.title}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeMaterialIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="kmb-mat-detail-panel"
                      >
                        <div className="kmb-mat-detail-top">
                          <div>
                            <h4>{botanicalMaterials[activeMaterialIdx].title}</h4>
                            <span>{botanicalMaterials[activeMaterialIdx].subtitle}</span>
                          </div>
                          <span className="kmb-mat-stat-badge">
                            {botanicalMaterials[activeMaterialIdx].stat}
                          </span>
                        </div>
                        <p>{botanicalMaterials[activeMaterialIdx].detail}</p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </StickyCardWrapper>

            {/* ---------------------------------------------------------------
                CARD 3: PACK MEMORIAL INTEGRAL (Dark Forest Luxury Climax)
               --------------------------------------------------------------- */}
            <StickyCardWrapper index={2} total={3}>
              <div className="kmb-stack-card-grid kmb-dark-forest-layout">
                {/* Left Content Pane */}
                <div className="kmb-stack-text-pane">
                  <div className="kmb-card-step-header kmb-header-light">
                    <span className="kmb-card-step-num">03 / 03</span>
                    <span className="kmb-card-step-tag">PACK MEMORIAL INTEGRAL</span>
                  </div>

                  <h3 className="kmb-stack-card-title kmb-text-cream">
                    Todo lo que buscas para un homenaje único. Por menos de lo que imaginas.
                  </h3>

                  <p className="kmb-stack-card-desc kmb-text-sand">
                    Cada pedido de Kamibi incluye el kit ceremonial completo en un empaque biodegradable de presentación, pensado para acompañar a tu familia sin complicaciones y con total delicadeza.
                  </p>

                  <ul className="kmb-pack-checklist">
                    <li>
                      <span className="kmb-check-gold">✓</span>
                      <span>Urna artesanal 100% biodegradable y orgánica</span>
                    </li>
                    <li>
                      <span className="kmb-check-gold">✓</span>
                      <span>Bolsa interior hidrosoluble de contención segura</span>
                    </li>
                    <li>
                      <span className="kmb-check-gold">✓</span>
                      <span>Cápsula con semillas nativas de flores silvestres o árbol</span>
                    </li>
                    <li>
                      <span className="kmb-check-gold">✓</span>
                      <span>Certificado de materiales orgánicos apto para cabina TSA</span>
                    </li>
                  </ul>

                  <div className="kmb-pack-cta-row">
                    <button
                      onClick={() => scrollToSection('comparativa')}
                      className="kmb-btn-gold"
                    >
                      Ver precios y paquetes →
                    </button>
                    <span className="kmb-pack-price-hint">
                      Sets desde $49.99 USD • Urnas principales desde $165.75 USD
                    </span>
                  </div>
                </div>

                {/* Right Visual Pane: Presentation Box + Urns */}
                <div className="kmb-stack-visual-pane">
                  <div className="kmb-pack-visual-composition">
                    <img
                      src="/images/caja-terra.png"
                      alt="Empaque conmemorativo biodegradable Kamibi"
                      className="kmb-pack-box-img"
                      onError={(e) => {
                        e.currentTarget.src = '/images/philosophy-hero.png';
                      }}
                    />
                    <img
                      src="/products/terra-urn.png"
                      alt="Urna Kamibi Terra"
                      className="kmb-pack-floating-urn"
                    />
                  </div>
                </div>
              </div>
            </StickyCardWrapper>

          </div>
        </div>
      </section>

      {/* =====================================================================
          3. SECCIÓN COMPARATIVA: "¿Qué Urna Kamibi Elegir?"
         ===================================================================== */}
      <section className="kmb-comparison-section" id="comparativa">
        <div className="kmb-container">
          <div className="kmb-section-intro">
            <span className="kmb-section-eyebrow">GUÍA COMPARATIVA</span>
            <h2 className="kmb-section-heading">¿Qué Urna Kamibi elegir?</h2>
            <p className="kmb-section-lead">
              Compara las tres ediciones según el entorno de la ceremonia, el tiempo de reintegración y la capacidad.
            </p>
          </div>

          <div className="kmb-comparison-grid">
            {comparisonModels.map((model, idx) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-8%' }}
                transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className={`kmb-comp-card ${model.badge ? 'kmb-comp-featured' : ''}`}
              >
                {model.badge && (
                  <span className="kmb-comp-badge">{model.badge}</span>
                )}

                {/* Product Image Stage with Organic Aura */}
                <div
                  className="kmb-comp-img-stage"
                  style={{ background: model.bgAura }}
                  onClick={() => navigate(`/product/${model.slug}`)}
                >
                  <img
                    src={model.image}
                    alt={model.name}
                    className="kmb-comp-img"
                  />
                </div>

                {/* Color Swatches */}
                <div className="kmb-comp-swatches">
                  {model.palette.map((swatch, sIdx) => (
                    <span
                      key={sIdx}
                      className="kmb-comp-swatch"
                      style={{ backgroundColor: swatch.hex }}
                      title={swatch.name}
                    />
                  ))}
                </div>

                <span className="kmb-comp-edition">{model.edition}</span>
                <h3 className="kmb-comp-name">{model.name}</h3>
                <p className="kmb-comp-tagline">{model.tagline}</p>

                {/* Price Block */}
                <div className="kmb-comp-price-box">
                  <span className="kmb-comp-price-from">Desde</span>
                  <div className="kmb-comp-price-nums">
                    <span className="kmb-comp-price-main">${model.price.toFixed(2)} USD</span>
                    {model.originalPrice && (
                      <span className="kmb-comp-price-old">${model.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                {/* Buy CTA */}
                <button
                  onClick={() => handleDirectBuy(model)}
                  className={`kmb-comp-buy-btn ${
                    addedProductId === model.id ? 'added' : ''
                  }`}
                >
                  {addedProductId === model.id ? '✓ Añadido al Carrito' : 'Comprar ahora'}
                </button>

                <button
                  onClick={() => navigate(`/product/${model.slug}`)}
                  className="kmb-comp-detail-link"
                >
                  Ver ficha completa →
                </button>

                <div className="kmb-comp-divider" />

                {/* Clean Specification Rows */}
                <div className="kmb-comp-specs">
                  <div className="kmb-comp-spec-row">
                    <span className="kmb-spec-lbl">Material</span>
                    <span className="kmb-spec-val">{model.specs.material}</span>
                  </div>
                  <div className="kmb-comp-spec-row">
                    <span className="kmb-spec-lbl">Tiempo de integración</span>
                    <span className="kmb-spec-val kmb-spec-accent">{model.specs.time}</span>
                  </div>
                  <div className="kmb-comp-spec-row">
                    <span className="kmb-spec-lbl">Capacidad</span>
                    <span className="kmb-spec-val">{model.specs.capacity}</span>
                  </div>
                  <div className="kmb-comp-spec-row">
                    <span className="kmb-spec-lbl">Tipo de recuerdo</span>
                    <span className="kmb-spec-val">{model.specs.memory}</span>
                  </div>
                  <div className="kmb-comp-spec-row">
                    <span className="kmb-spec-lbl">Ceremonia sugerida</span>
                    <span className="kmb-spec-val">{model.specs.ceremony}</span>
                  </div>
                  <div className="kmb-comp-spec-row">
                    <span className="kmb-spec-lbl">Transporte aéreo</span>
                    <span className="kmb-spec-val kmb-spec-accent">✓ {model.specs.tsa}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. CARRUSEL DE PRODUCTOS INTERACTIVO PARA COMPRAR
         ===================================================================== */}
      <section className="kmb-carousel-section" id="catalogo">
        <div className="kmb-container">
          <div className="kmb-carousel-header">
            <div>
              <span className="kmb-section-eyebrow">CATÁLOGO OFICIAL KAMIBI</span>
              <h2 className="kmb-carousel-title">Adquiere tu urna con envío inmediato.</h2>
            </div>

            <div className="kmb-carousel-controls-row">
              {/* Filter Pills */}
              <div className="kmb-carousel-filters">
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'earth', label: 'Tierra & Flores' },
                  { id: 'water', label: 'Agua & Mar' },
                  { id: 'sets', label: 'Mini Sets & Bolsas' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCarouselCategory(f.id)}
                    className={`kmb-filter-pill ${carouselCategory === f.id ? 'active' : ''}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Navigation Arrows */}
              <div className="kmb-carousel-arrows">
                <button
                  onClick={() => scrollCarousel('left')}
                  disabled={!canScrollLeft}
                  className="kmb-arrow-btn"
                  aria-label="Anterior"
                >
                  ‹
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  disabled={!canScrollRight}
                  className="kmb-arrow-btn"
                  aria-label="Siguiente"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Product Track */}
          <div
            className="kmb-carousel-track"
            ref={carouselRef}
            onScroll={checkScroll}
          >
            {productsLoading ? (
              <div className="kmb-carousel-loading">Cargando colección artesanal Kamibi...</div>
            ) : (
              filteredCarouselProducts.map((prod) => (
                <motion.div
                  layout
                  key={prod.id}
                  className="kmb-product-card"
                >
                  <div
                    className="kmb-prod-img-wrap"
                    onClick={() => navigate(`/product/${prod.slug}`)}
                  >
                    <img
                      src={prod.images?.[0] || '/products/terra-urn.png'}
                      alt={prod.name}
                      className="kmb-prod-img"
                      loading="lazy"
                    />
                    {prod.originalPrice && prod.originalPrice > prod.price && (
                      <span className="kmb-prod-sale-pill">Oferta Especial</span>
                    )}
                    <span className="kmb-prod-quickview">Ver detalles →</span>
                  </div>

                  <div className="kmb-prod-body">
                    <div className="kmb-prod-meta">
                      <span
                        className="kmb-prod-dot"
                        style={{ backgroundColor: prod.colorHex || '#C4856A' }}
                      />
                      <span className="kmb-prod-color-name">
                        {prod.colorName || '100% Biodegradable'}
                      </span>
                    </div>

                    <h3
                      className="kmb-prod-title"
                      onClick={() => navigate(`/product/${prod.slug}`)}
                    >
                      {prod.name}
                    </h3>

                    <p className="kmb-prod-desc">
                      {locale === 'es'
                        ? prod.shortDescription?.substring(0, 75) + '...'
                        : prod.tagline}
                    </p>

                    <div className="kmb-prod-footer">
                      <div className="kmb-prod-price-col">
                        <span className="kmb-prod-price">
                          ${Number(prod.price).toFixed(2)}
                        </span>
                        {prod.originalPrice && (
                          <span className="kmb-prod-old-price">
                            ${Number(prod.originalPrice).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleDirectBuy(prod)}
                        className={`kmb-prod-buy-btn ${
                          addedProductId === prod.id ? 'added' : ''
                        }`}
                      >
                        {addedProductId === prod.id ? '✓ Añadido' : 'Añadir al carrito'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. SECCIÓN DE RESEÑAS — HISTORIAS DE DESPEDIDAS EN PAZ
         ===================================================================== */}
      <section className="kmb-reviews-section" id="resenas">
        <div className="kmb-container">
          <div className="kmb-section-intro">
            <div className="kmb-rating-pill">
              <span className="kmb-stars">★★★★★</span>
              <span>4.9 / 5 • Más de 250 familias acompañadas</span>
            </div>
            <h2 className="kmb-section-heading">
              Palabras de quienes han honrado la vida con Kamibi.
            </h2>
          </div>

          <div className="kmb-reviews-grid">
            {reviews.map((rev, idx) => (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: idx * 0.12 }}
                className="kmb-review-card"
              >
                <div className="kmb-review-img-banner">
                  <img src={rev.image} alt={rev.edition} className="kmb-review-bg" />
                  <div className="kmb-review-img-overlay" />
                  <span className="kmb-review-edition-badge">{rev.edition}</span>
                </div>

                <div className="kmb-review-content">
                  <div className="kmb-review-stars">★★★★★</div>
                  <p className="kmb-review-quote">“{rev.quote}”</p>
                  <div className="kmb-review-author-row">
                    <div>
                      <strong className="kmb-author-name">{rev.author}</strong>
                      <span className="kmb-author-loc">{rev.location}</span>
                    </div>
                    <span className="kmb-verified-tag">✓ Compra verificada</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Final Conversion Banner */}
          <div className="kmb-final-cta-banner">
            <div className="kmb-final-cta-text">
              <h3>Un tributo sereno que devuelve vida a la tierra.</h3>
              <p>
                Envío express gratuito y asegurado a todo el país. Si necesitas orientación sobre qué urna elegir, nuestro equipo te acompaña en cada paso.
              </p>
            </div>
            <div className="kmb-final-cta-buttons">
              <button
                onClick={() => scrollToSection('comparativa')}
                className="kmb-btn-gold"
              >
                Elegir mi Urna Kamibi
              </button>
              <button
                onClick={() => navigate('/store')}
                className="kmb-btn-outline-light"
              >
                Ir a la tienda completa
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. MODALES INTERACTIVOS (Ritual Paso a Paso & Materiales)
         ===================================================================== */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            className="kmb-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              className="kmb-modal-box"
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="kmb-modal-close"
                onClick={() => setActiveModal(null)}
                aria-label="Cerrar"
              >
                ✕
              </button>

              {activeModal === 'how-it-works' && (
                <div className="kmb-modal-body">
                  <span className="kmb-section-eyebrow">EL RITUAL KAMIBI</span>
                  <h3 className="kmb-modal-title">Cómo funciona la ceremonia</h3>
                  <p className="kmb-modal-sub">
                    Un proceso sencillo, digno y profundamente humano pensado para realizarse en total paz.
                  </p>

                  <div className="kmb-modal-steps">
                    <div className="kmb-modal-step">
                      <span className="kmb-step-num">I</span>
                      <div>
                        <h4>Preparación en casa</h4>
                        <p>
                          Deposita las cenizas dentro de la bolsa hidrosoluble ceremonial incluida y colócala en el interior de la urna Kamibi junto con las semillas si elegiste la edición de tierra.
                        </p>
                      </div>
                    </div>
                    <div className="kmb-modal-step">
                      <span className="kmb-step-num">II</span>
                      <div>
                        <h4>Entrega a la naturaleza</h4>
                        <p>
                          <strong>En Tierra:</strong> Entierra la urna a 25–30 cm de profundidad en un jardín, bosque o maceta grande y riega suavemente.<br />
                          <strong>En Agua:</strong> Deposita la urna sobre el mar o lago; flotará de 5 a 10 minutos permitiendo una despedida serena antes de descender.
                        </p>
                      </div>
                    </div>
                    <div className="kmb-modal-step">
                      <span className="kmb-step-num">III</span>
                      <div>
                        <h4>Reintegración y florecimiento</h4>
                        <p>
                          Sin aditivos químicos ni plásticos, la estructura orgánica vuelve al ciclo vital en ~30 minutos en agua o de 2 a 4 semanas en tierra.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="kmb-modal-footer">
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        scrollToSection('comparativa');
                      }}
                      className="kmb-btn-primary"
                    >
                      Elegir mi urna Kamibi →
                    </button>
                  </div>
                </div>
              )}

              {activeModal === 'materials' && (
                <div className="kmb-modal-body">
                  <span className="kmb-section-eyebrow">COMPOSICIÓN 100% ORGÁNICA</span>
                  <h3 className="kmb-modal-title">Materiales nobles de origen natural</h3>
                  <p className="kmb-modal-sub">
                    Cada urna Kamibi está libre de resinas epóxicas, metales y barnices sintéticos.
                  </p>

                  <div className="kmb-modal-materials-grid">
                    {botanicalMaterials.map((m, idx) => (
                      <div key={idx} className="kmb-modal-mat-card">
                        <span className="kmb-modal-mat-badge">{m.stat}</span>
                        <h4>{m.title}</h4>
                        <p>{m.detail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="kmb-modal-footer">
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        scrollToSection('comparativa');
                      }}
                      className="kmb-btn-primary"
                    >
                      Ver modelos disponibles →
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UrnaBiodegradableLanding;
