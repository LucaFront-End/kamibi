import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useWixProducts } from '../hooks/useWixProducts';
import { useSEO } from '../hooks/useSEO';
import { PolaroidLineCarousel } from '../components/ui/PolaroidLineCarousel';
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

  const targetScale = 1 - (total - 1 - index) * 0.035;
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, index === total - 1 ? 1 : targetScale]
  );

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
    descEs:
      'Una despedida ecológica, digna y eterna. Urnas biodegradables 100% orgánicas para ceremonias en tierra o mar.',
    descEn:
      'An eco-friendly, dignified and eternal farewell. 100% organic biodegradable urns for earth or water ceremonies.',
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
  // Active finish variant per card in the 3-product comparison triptych
  const [selectedFinishes, setSelectedFinishes] = useState({
    'terra-urn': 0,
    'aqua-urn': 0,
    'mini-urns': 0,
  });

  // Hero scroll parallax
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImgScale = useTransform(heroScroll, [0, 1], [1, 1.08]);
  const heroDockY = useTransform(heroScroll, [0, 1], [0, -18]);

  // Hero Modes Data
  const heroAtmospheres = {
    earth: {
      id: 'terra-urn',
      slug: 'terra-urn',
      num: '01',
      label: 'Tierra & Bosque',
      shortSub: 'Germinación en suelo',
      tag: 'CEREMONIA EN TIERRA',
      urnName: 'KAMIBI® Terra (Bios)',
      urnCaption: 'Se integra con la tierra en 2 a 4 semanas nutriendo nuevas raíces.',
      timeBadge: '2 a 4 semanas en tierra',
      price: 189.0,
      bgImage: '/images/hero-earth-ceremony.png',
      urnImage: '/products/terra-urn.png',
      secondaryUrnImage: '/products/flore-urn.png',
      accentColor: '#C4856A',
      badgeTop: '100% Compostable • Incluye Semillas Vivas',
      locationHint: 'Bosques memoriales y jardines naturales',
    },
    water: {
      id: 'aqua-urn',
      slug: 'aqua-urn',
      num: '02',
      label: 'Océano & Calma',
      shortSub: 'Disolución marina',
      tag: 'CEREMONIA EN AGUA',
      urnName: 'KAMIBI® Aqua (Ocean)',
      urnCaption: 'Flota suavemente y se disuelve con pureza en el mar en ~30 minutos.',
      timeBadge: '~30 minutos en agua',
      price: 165.75,
      originalPrice: 195.0,
      bgImage: '/images/hero-water-ceremony.png',
      urnImage: '/products/aqua-urn.png',
      secondaryUrnImage: '/products/angel-urn.png',
      accentColor: '#7A9A9A',
      badgeTop: 'pH Neutro • Respetuosa con la Fauna Marina',
      locationHint: 'Altamar, costas serenas, lagos y ríos',
    },
    mini: {
      id: 'mini-urns',
      slug: 'mini-biodegradables-urn-set',
      num: '03',
      label: 'Set Familiar (x4)',
      shortSub: 'Tributo compartido',
      tag: 'MEMORIAL COMPARTIDO',
      urnName: 'KAMIBI® Mini Sharing Set',
      urnCaption: 'Cuatro mini urnas orgánicas para compartir el homenaje entre familiares.',
      timeBadge: 'Pack de 4 mini urnas',
      price: 49.99,
      bgImage: '/images/philosophy-hero.png',
      urnImage: '/products/mini-urns.png',
      secondaryUrnImage: '/products/iris-urn.png',
      accentColor: '#8B9E8B',
      badgeTop: 'Set de 4 Réplicas 100% Biodegradables',
      locationHint: 'Múltiples rituales familiares o mascotas',
    },
  };

  const currentHero = heroAtmospheres[heroMode];

  // Botanical materials for Card 2
  const botanicalMaterials = [
    {
      title: 'Celulosa Virgen Prensada',
      subtitle: 'Fibras vegetales de bosques sostenibles',
      detail:
        'Moldeada a mano sin cloros ni resinas sintéticas. Protege las cenizas de forma indefinida mientras se mantenga en un ambiente seco interior.',
      stat: '0% Plásticos',
    },
    {
      title: 'Arcilla & Sal Mineral Pura',
      subtitle: 'Equilibrio biológico para tierra y océano',
      detail:
        'Compuestos minerales de pH neutro que se funden con el agua o el suelo sin alterar la microbiología ni la flora marina.',
      stat: 'pH Neutro 7.0',
    },
    {
      title: 'Cápsula de Semillas Nativas',
      subtitle: 'Memoria que germina en nueva vida',
      detail:
        'Incluye semillas seleccionadas de flores silvestres y especies arbóreas para transformar el lugar del descanso en un jardín vivo.',
      stat: 'Vida Eterna',
    },
    {
      title: 'Pétalos Naturales & Almidón',
      subtitle: 'Aglutinantes 100% botánicos',
      detail:
        'Unidos mediante extractos orgánicos de maíz y decorados con pétalos prensados reales y tintes de origen vegetal.',
      stat: '100% Orgánico',
    },
  ];

  // Comparison models definition (Interactive 3-Product Sanctuary Triptych)
  const comparisonModels = [
    {
      id: 'terra-urn',
      num: '01',
      elementTag: 'TIERRA & BOSQUE',
      name: 'Kamibi Bios',
      edition: 'Edición Germinación en Tierra',
      tagline:
        'Creada para integrarse con el suelo y nutrir el nacimiento de un nuevo árbol o jardín memorial.',
      envImage: '/images/hero-earth-ceremony.png',
      timePill: '🌱 2 a 4 semanas',
      price: 189.0,
      originalPrice: null,
      variants: [
        {
          name: 'Terracotta Natural',
          hex: '#C4856A',
          image: '/products/terra-urn.png',
          slug: 'terra-urn',
        },
        {
          name: 'Flore (Pétalos Reales)',
          hex: '#8B9E8B',
          image: '/products/flore-urn.png',
          slug: 'flore-urn',
        },
        {
          name: 'Iris (Rosa Botánico)',
          hex: '#D4A5A5',
          image: '/products/iris-urn.png',
          slug: 'iris-urn',
        },
      ],
      bentoSpecs: [
        { label: 'Biodegradación', value: '2 a 4 semanas', sub: 'En tierra húmeda' },
        { label: 'Capacidad', value: '3.5 Litros', sub: '100% Adulto' },
        { label: 'Composición', value: 'Fibra & Arcilla', sub: '0% Químicos' },
        { label: 'Vuelo Aéreo', value: 'Apta Cabina TSA', sub: 'Certificado incl.' },
      ],
      kitHighlight: 'Incluye cápsula con semillas nativas vivas + bolsa soluble',
    },
    {
      id: 'aqua-urn',
      num: '02',
      elementTag: 'OCÉANO & CALMA',
      name: 'Kamibi Ocean',
      edition: 'Edición Ceremonia en Agua',
      tagline:
        'Diseñada para flotar serenamente unos minutos sobre el mar o lago antes de fundirse con pureza.',
      envImage: '/images/hero-water-ceremony.png',
      timePill: '🌊 ~30 minutos',
      price: 165.75,
      originalPrice: 195.0,
      badge: 'Más Elegida',
      variants: [
        {
          name: 'Aqua Marina',
          hex: '#9BB4B6',
          image: '/products/aqua-urn.png',
          slug: 'aqua-urn',
        },
        {
          name: 'Blanco Ángel',
          hex: '#F4F1EA',
          image: '/products/angel-urn.png',
          slug: 'angel-urn',
        },
      ],
      bentoSpecs: [
        { label: 'Disolución', value: '~30 minutos', sub: 'Flota 5–10 min' },
        { label: 'Capacidad', value: '3.2 Litros', sub: '100% Adulto' },
        { label: 'Composición', value: 'Celulosa & Sal', sub: 'pH Neutro Marino' },
        { label: 'Vuelo Aéreo', value: 'Apta Cabina TSA', sub: 'Certificado incl.' },
      ],
      kitHighlight: 'Incluye bolsa hidrosoluble de contención marina + guía ritual',
    },
    {
      id: 'mini-urns',
      num: '03',
      elementTag: 'TRIBUTO COMPARTIDO',
      name: 'Kamibi Mini',
      edition: 'Set Familiar (x4) & Mascotas',
      tagline:
        'Cuatro mini urnas orgánicas para que distintos familiares compartan el homenaje o para mascotas.',
      envImage: '/images/philosophy-hero.png',
      timePill: '✨ Pack de 4 urnas',
      price: 49.99,
      originalPrice: null,
      variants: [
        {
          name: 'Set 4 Mini Urnas',
          hex: '#E2D5C3',
          image: '/products/mini-urns.png',
          slug: 'mini-biodegradables-urn-set',
        },
        {
          name: 'Edición Iris Mini',
          hex: '#C4856A',
          image: '/products/iris-urn.png',
          slug: 'mini-biodegradables-urn-set',
        },
      ],
      bentoSpecs: [
        { label: 'Integración', value: '1 a 3 semanas', sub: 'Tierra o agua' },
        { label: 'Capacidad', value: '4 × 0.4 L', sub: 'Set de 4 piezas' },
        { label: 'Composición', value: 'Fibra Botánica', sub: '100% Orgánica' },
        { label: 'Vuelo Aéreo', value: 'Apta Cabina TSA', sub: 'Fácil traslado' },
      ],
      kitHighlight: 'Incluye 4 cajas individuales de presentación y bolsas solubles',
    },
  ];

  // =========================================================================
  // SMOOTH SPRING-PHYSICS PRODUCT CAROUSEL LOGIC
  // =========================================================================
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [maxScroll, setMaxScroll] = useState(0);
  const [carouselProgress, setCarouselProgress] = useState(0);
  const [isDraggingCarousel, setIsDraggingCarousel] = useState(false);

  const targetX = useMotionValue(0);
  const smoothX = useSpring(targetX, {
    stiffness: 85,
    damping: 22,
    mass: 0.75,
    restDelta: 0.5,
  });

  const filteredCarouselProducts = products.filter((p) => {
    if (carouselCategory === 'all') return true;
    if (carouselCategory === 'earth') {
      return ['terra-urn', 'flore-urn', 'iris-urn'].some(
        (s) => p.slug?.includes(s) || p.id?.includes(s)
      );
    }
    if (carouselCategory === 'water') {
      return ['aqua-urn', 'angel-urn'].some(
        (s) => p.slug?.includes(s) || p.id?.includes(s)
      );
    }
    if (carouselCategory === 'sets') {
      return (
        p.category === 'minis' ||
        p.category === 'bags' ||
        p.slug?.includes('mini') ||
        p.slug?.includes('bag')
      );
    }
    return true;
  });

  const updateCarouselBounds = useCallback(() => {
    if (!viewportRef.current || !trackRef.current) return;
    const vw = viewportRef.current.clientWidth;
    const tw = trackRef.current.scrollWidth;
    const max = Math.max(0, tw - vw);
    setMaxScroll(max);
    const current = Math.max(-max, Math.min(0, targetX.get()));
    targetX.set(current);
  }, [targetX]);

  useEffect(() => {
    updateCarouselBounds();
    window.addEventListener('resize', updateCarouselBounds);
    return () => window.removeEventListener('resize', updateCarouselBounds);
  }, [updateCarouselBounds, filteredCarouselProducts.length, productsLoading]);

  // Reset carousel position smoothly when category changes
  useEffect(() => {
    targetX.set(0);
  }, [carouselCategory, targetX]);

  // Subscribe to smoothX to update progress bar
  useEffect(() => {
    const unsubscribe = smoothX.on('change', (val) => {
      if (maxScroll <= 0) {
        setCarouselProgress(0);
      } else {
        const prog = Math.min(1, Math.max(0, -val / maxScroll));
        setCarouselProgress(prog);
      }
    });
    return () => unsubscribe();
  }, [smoothX, maxScroll]);

  const slideCarouselBy = (dir) => {
    const stepPx = 365;
    const next = Math.max(-maxScroll, Math.min(0, targetX.get() - dir * stepPx));
    targetX.set(next);
  };

  // Pointer drag support for spring carousel
  const dragInfo = useRef({ active: false, startX: 0, startTarget: 0, moved: false });

  const handleCarouselPointerDown = (e) => {
    if (e.target.closest('button')) return;
    dragInfo.current = {
      active: true,
      startX: e.clientX,
      startTarget: smoothX.get(),
      moved: false,
    };
  };

  const handleCarouselPointerMove = (e) => {
    if (!dragInfo.current.active) return;
    const dx = e.clientX - dragInfo.current.startX;
    if (!dragInfo.current.moved && Math.abs(dx) > 6) {
      dragInfo.current.moved = true;
      setIsDraggingCarousel(true);
    }
    if (!dragInfo.current.moved) return;
    let next = dragInfo.current.startTarget + dx * 1.15;
    // Rubber-band overscroll resistance
    if (next > 0) next *= 0.28;
    if (next < -maxScroll) next = -maxScroll + (next + maxScroll) * 0.28;
    targetX.set(next);
  };

  const handleCarouselPointerUp = () => {
    if (!dragInfo.current.active) return;
    dragInfo.current.active = false;
    setTimeout(() => setIsDraggingCarousel(false), 60);
    // Clamp back within bounds with spring physics
    const clamped = Math.max(-maxScroll, Math.min(0, targetX.get()));
    targetX.set(clamped);
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

  // Hanging Polaroid Slides for Reviews Section
  const polaroidReviews = [
    {
      image: '/images/review-polaroid-1.png',
      title: 'Paz infinita en el mar',
      quote:
        'Flotó entre pétalos blancos al amanecer antes de sumergirse con una calma única. Cero químicos, solo amor.',
      author: 'Elena R. de Mendoza',
      location: 'Costa Brava, España',
      edition: 'Kamibi Ocean',
      palette: 'dawn',
      seed: 3,
    },
    {
      image: '/images/review-polaroid-2.png',
      title: 'Hoy brota un árbol nuevo',
      quote:
        'Plantamos la urna Terra en el bosque familiar. Ver nacer un brote verde donde nos despedimos transformó el dolor en vida.',
      author: 'Marcus & Claudia G.',
      location: 'Valle de Bravo, México',
      edition: 'Kamibi Bios',
      palette: 'mist',
      seed: 11,
    },
    {
      image: '/images/review-polaroid-3.png',
      title: 'Un lago en calma eterna',
      quote:
        'Despedir a mi padre en el lago que tanto amaba fue sumamente digno. Se integró en el agua en minutos con total delicadeza.',
      author: 'Javier L. Santamaría',
      location: 'Bariloche, Argentina',
      edition: 'Kamibi Angel',
      palette: 'dusk',
      seed: 19,
    },
    {
      image: '/images/review-polaroid-4.png',
      title: 'Cuatro hogares, un mismo amor',
      quote:
        'El set de 4 mini urnas nos permitió a mis hermanos realizar nuestro propio homenaje íntimo en distintas ciudades.',
      author: 'Sofía Valenzuela',
      location: 'Santiago, Chile',
      edition: 'Kamibi Mini Set',
      palette: 'dawn',
      seed: 27,
    },
    {
      image: '/images/hero-earth-ceremony.png',
      title: 'Pétalos reales y pureza',
      quote:
        'La textura artesanal con pétalos prensados de la edición Flore parece una escultura orgánica. Nos dio muchísima serenidad.',
      author: 'Valentina & Tomás M.',
      location: 'Medellín, Colombia',
      edition: 'Kamibi Flore',
      palette: 'mist',
      seed: 35,
    },
    {
      image: '/images/hero-water-ceremony.png',
      title: 'Viaje seguro hacia el océano',
      quote:
        'Pudimos llevar la urna en cabina de avión gracias al certificado TSA incluido y hacer la ceremonia frente al Pacífico.',
      author: 'David K. Larraín',
      location: 'San Diego, CA',
      edition: 'Kamibi Ocean',
      palette: 'alpine',
      seed: 44,
    },
  ];

  return (
    <div className="kmb-landing">
      {/* =====================================================================
          1. HERO SECTION — GALERÍA PANORÁMICA & SANTUARIO NATURAL KAMIBI
         ===================================================================== */}
      <section className="kmb-hero" ref={heroRef}>
        <div className="kmb-hero-aura kmb-aura-1" />
        <div className="kmb-hero-aura kmb-aura-2" />

        <div className="kmb-container">
          <div className="kmb-hero-editorial-shell">
            {/* Left Column: Poetic Editorial Typography & Interactive Ceremony Cards */}
            <div className="kmb-hero-copy">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="kmb-eyebrow-pill"
              >
                <span className="kmb-gold-dot" />
                <span>KAMIBI® MEMORIALS • ARTESANÍA 100% ORGÁNICA</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="kmb-hero-title"
              >
                Regresa a la naturaleza.
                <span className="kmb-hero-title-italic">Nada menos.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="kmb-hero-subtitle"
              >
                Una despedida ecológica, digna y eterna. Urnas esculpidas a mano con fibras botánicas, arcilla mineral y semillas vivas que devuelven la memoria al ciclo de la vida.
              </motion.p>

              {/* Interactive Ceremony Environment Selector (3 Tactile Cards) */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="kmb-hero-ritual-cards"
              >
                {Object.entries(heroAtmospheres).map(([key, item]) => {
                  const isActive = heroMode === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setHeroMode(key)}
                      className={`kmb-ritual-mode-card ${isActive ? 'active' : ''}`}
                    >
                      <div className="kmb-ritual-card-top">
                        <span className="kmb-ritual-num">{item.num}</span>
                        <span
                          className="kmb-ritual-dot"
                          style={{ backgroundColor: item.accentColor }}
                        />
                      </div>
                      <strong className="kmb-ritual-label">{item.label}</strong>
                      <span className="kmb-ritual-sub">{item.shortSub}</span>
                    </button>
                  );
                })}
              </motion.div>

              {/* Primary & Secondary CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="kmb-hero-actions"
              >
                <button
                  onClick={() => scrollToSection('comparativa')}
                  className="kmb-btn-primary"
                >
                  <span>Comprar ahora</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
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
                transition={{ duration: 1, delay: 0.42 }}
                className="kmb-hero-trust-row"
              >
                <div className="kmb-trust-Point">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Desde $49.99 / $165.75 USD</span>
                </div>
                <span className="kmb-trust-sep">•</span>
                <div className="kmb-trust-Point">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Certificación Aérea TSA</span>
                </div>
                <span className="kmb-trust-sep">•</span>
                <div className="kmb-trust-Point">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Envío Express Gratis</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Full-Aspect Uncropped Landscape Panorama + Studio Pedestal Dock */}
            <div className="kmb-hero-panorama-column">
              <div className="kmb-panorama-frame-outer">
                {/* Main Panoramic Window — Shows full uncropped 16:10 scene */}
                <div className="kmb-panorama-window">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentHero.bgImage}
                      src={currentHero.bgImage}
                      alt={currentHero.urnName}
                      style={{ scale: heroImgScale }}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                      className="kmb-panorama-img"
                    />
                  </AnimatePresence>

                  <div className="kmb-panorama-vignette" />

                  {/* Top Badges over sky */}
                  <div className="kmb-panorama-top-bar">
                    <span className="kmb-panorama-badge">
                      <span className="kmb-pulse-dot" />
                      {currentHero.badgeTop}
                    </span>
                    <span className="kmb-panorama-time-pill">
                      ⏱ {currentHero.timeBadge}
                    </span>
                  </div>

                  {/* Subtle bottom-left location caption on image */}
                  <div className="kmb-panorama-caption">
                    <span>Entorno sugerido:</span>
                    <strong>{currentHero.locationHint}</strong>
                  </div>
                </div>

                {/* Below/Offset Studio Product Dock — Doesn't block the ceremony photo! */}
                <motion.div
                  style={{ y: heroDockY }}
                  className="kmb-studio-dock"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentHero.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="kmb-studio-dock-inner"
                    >
                      <div
                        className="kmb-dock-pedestal"
                        onClick={() => navigate(`/product/${currentHero.slug}`)}
                      >
                        <img
                          src={currentHero.urnImage}
                          alt={currentHero.urnName}
                          className="kmb-dock-urn-main"
                        />
                        <img
                          src={currentHero.secondaryUrnImage}
                          alt="Modelo complementario"
                          className="kmb-dock-urn-sec"
                        />
                      </div>

                      <div className="kmb-dock-details">
                        <div className="kmb-dock-header-line">
                          <span className="kmb-dock-eyebrow">{currentHero.tag}</span>
                          <span className="kmb-dock-price">
                            ${currentHero.price.toFixed(2)} <small>USD</small>
                            {currentHero.originalPrice && (
                              <s className="kmb-dock-old-price">
                                ${currentHero.originalPrice.toFixed(2)}
                              </s>
                            )}
                          </span>
                        </div>

                        <h3 className="kmb-dock-title">{currentHero.urnName}</h3>
                        <p className="kmb-dock-desc">{currentHero.urnCaption}</p>

                        <div className="kmb-dock-actions">
                          <button
                            onClick={() => handleDirectBuy(currentHero)}
                            className={`kmb-dock-buy-btn ${
                              addedProductId === currentHero.id ? 'added' : ''
                            }`}
                          >
                            {addedProductId === currentHero.id
                              ? '✓ Añadido al Carrito'
                              : 'Añadir al carrito +'}
                          </button>
                          <button
                            onClick={() => navigate(`/product/${currentHero.slug}`)}
                            className="kmb-dock-link-btn"
                          >
                            Ver detalles →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>
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

          <div className="kmb-sticky-stack-container">
            {/* CARD 1 */}
            <StickyCardWrapper index={0} total={3}>
              <div className="kmb-stack-card-grid">
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
                      <span className="kmb-metric-lbl">
                        Compuestos botánicos y arcilla mineral
                      </span>
                    </div>
                    <div className="kmb-metric-item">
                      <span className="kmb-metric-val">0%</span>
                      <span className="kmb-metric-lbl">
                        Residuos químicos, resinas o metales
                      </span>
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

            {/* CARD 2 */}
            <StickyCardWrapper index={1} total={3}>
              <div className="kmb-stack-card-grid">
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

                  <div className="kmb-materials-interactive-box">
                    <div className="kmb-material-tabs">
                      {botanicalMaterials.map((mat, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveMaterialIdx(idx)}
                          className={`kmb-mat-tab ${
                            activeMaterialIdx === idx ? 'active' : ''
                          }`}
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

            {/* CARD 3 */}
            <StickyCardWrapper index={2} total={3}>
              <div className="kmb-stack-card-grid kmb-dark-forest-layout">
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
          3. SECCIÓN COMPARATIVA: TRÍPTICO EDITORIAL INTERACTIVO DE 3 PRODUCTOS
         ===================================================================== */}
      <section className="kmb-comparison-section" id="comparativa">
        <div className="kmb-container">
          <div className="kmb-section-intro">
            <span className="kmb-section-eyebrow">COLECCIÓN ELEMENTAL KAMIBI®</span>
            <h2 className="kmb-section-heading">¿Qué Urna Kamibi elegir?</h2>
            <p className="kmb-section-lead">
              Explora las tres ediciones principales diseñadas para cada tipo de ceremonia. Selecciona el acabado en cada tarjeta para previsualizar el modelo.
            </p>
          </div>

          <div className="kmb-triptych-grid">
            {comparisonModels.map((model, idx) => {
              const activeVarIdx = selectedFinishes[model.id] || 0;
              const activeVar = model.variants[activeVarIdx] || model.variants[0];

              return (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-8%' }}
                  transition={{
                    duration: 0.75,
                    delay: idx * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`kmb-triptych-card ${
                    model.badge ? 'kmb-triptych-featured' : ''
                  }`}
                >
                  {model.badge && (
                    <span className="kmb-triptych-crown">{model.badge}</span>
                  )}

                  {/* Upper Atmospheric Sanctuary Header */}
                  <div
                    className="kmb-triptych-stage"
                    onClick={() => navigate(`/product/${activeVar.slug}`)}
                  >
                    <img
                      src={model.envImage}
                      alt={model.elementTag}
                      className="kmb-triptych-env-bg"
                    />
                    <div className="kmb-triptych-env-veil" />

                    {/* Top Floating Pills inside Stage */}
                    <div className="kmb-triptych-stage-top">
                      <span className="kmb-triptych-elem-pill">
                        <b>{model.num}</b> • {model.elementTag}
                      </span>
                      <span className="kmb-triptych-time-pill">{model.timePill}</span>
                    </div>

                    {/* Dynamic 3D Urn Pedestal */}
                    <div className="kmb-triptych-urn-pedestal">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeVar.image}
                          src={activeVar.image}
                          alt={`${model.name} - ${activeVar.name}`}
                          initial={{ opacity: 0, scale: 0.9, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.92, y: -6 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="kmb-triptych-urn-img"
                        />
                      </AnimatePresence>
                      <div className="kmb-triptych-pedestal-glow" />
                    </div>
                  </div>

                  {/* Interactive Finish / Edition Selector Bar */}
                  <div className="kmb-triptych-finish-bar">
                    <span className="kmb-finish-active-label">
                      Acabado: <strong>{activeVar.name}</strong>
                    </span>
                    <div className="kmb-finish-swatches">
                      {model.variants.map((v, vIdx) => (
                        <button
                          key={vIdx}
                          type="button"
                          onClick={() =>
                            setSelectedFinishes((prev) => ({
                              ...prev,
                              [model.id]: vIdx,
                            }))
                          }
                          className={`kmb-finish-swatch-btn ${
                            activeVarIdx === vIdx ? 'active' : ''
                          }`}
                          title={v.name}
                          aria-label={`Seleccionar acabado ${v.name}`}
                        >
                          <span
                            className="kmb-finish-swatch-dot"
                            style={{ backgroundColor: v.hex }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Body: Title, Tagline & 2x2 Bento Specs */}
                  <div className="kmb-triptych-body">
                    <div className="kmb-triptych-heading-row">
                      <div>
                        <span className="kmb-triptych-edition">{model.edition}</span>
                        <h3 className="kmb-triptych-title">{model.name}</h3>
                      </div>
                      <div className="kmb-triptych-price-block">
                        <span className="kmb-triptych-price-from">Desde</span>
                        <div className="kmb-triptych-price-line">
                          <span className="kmb-triptych-price">
                            ${model.price.toFixed(2)}
                          </span>
                          {model.originalPrice && (
                            <s className="kmb-triptych-old-price">
                              ${model.originalPrice.toFixed(2)}
                            </s>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="kmb-triptych-tagline">{model.tagline}</p>

                    {/* 2x2 Architectural Bento Spec Grid */}
                    <div className="kmb-triptych-bento">
                      {model.bentoSpecs.map((sp, spIdx) => (
                        <div key={spIdx} className="kmb-bento-cell">
                          <span className="kmb-bento-lbl">{sp.label}</span>
                          <strong className="kmb-bento-val">{sp.value}</strong>
                          <span className="kmb-bento-sub">{sp.sub}</span>
                        </div>
                      ))}
                    </div>

                    {/* Included Kit Highlight */}
                    <div className="kmb-triptych-kit-chip">
                      <span className="kmb-kit-check">✦</span>
                      <span>{model.kitHighlight}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="kmb-triptych-actions">
                      <button
                        onClick={() =>
                          handleDirectBuy({
                            ...model,
                            slug: activeVar.slug,
                            image: activeVar.image,
                          })
                        }
                        className={`kmb-triptych-buy-btn ${
                          addedProductId === model.id ? 'added' : ''
                        }`}
                      >
                        {addedProductId === model.id
                          ? '✓ Añadido al Carrito'
                          : `Comprar ${model.name} →`}
                      </button>

                      <button
                        onClick={() => navigate(`/product/${activeVar.slug}`)}
                        className="kmb-triptych-detail-btn"
                      >
                        Ver ficha
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. CARRUSEL DE PRODUCTOS CON FÍSICA SPRING ULTRA-SMOOTH
         ===================================================================== */}
      <section className="kmb-carousel-section" id="catalogo">
        <div className="kmb-container">
          <div className="kmb-carousel-header">
            <div>
              <span className="kmb-section-eyebrow">CATÁLOGO OFICIAL KAMIBI</span>
              <h2 className="kmb-carousel-title">Adquiere tu urna con envío inmediato.</h2>
            </div>

            <div className="kmb-carousel-controls-row">
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
                    className={`kmb-filter-pill ${
                      carouselCategory === f.id ? 'active' : ''
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="kmb-carousel-arrows">
                <button
                  onClick={() => slideCarouselBy(-1)}
                  disabled={carouselProgress <= 0.02 && maxScroll > 0}
                  className="kmb-arrow-btn"
                  aria-label="Anterior"
                >
                  ‹
                </button>
                <button
                  onClick={() => slideCarouselBy(1)}
                  disabled={carouselProgress >= 0.98 && maxScroll > 0}
                  className="kmb-arrow-btn"
                  aria-label="Siguiente"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Spring-Physics Viewport & Gliding Track */}
          <div
            ref={viewportRef}
            className={`kmb-spring-carousel-viewport ${
              isDraggingCarousel ? 'is-dragging' : ''
            }`}
            onPointerDown={handleCarouselPointerDown}
            onPointerMove={handleCarouselPointerMove}
            onPointerUp={handleCarouselPointerUp}
            onPointerLeave={handleCarouselPointerUp}
          >
            {productsLoading ? (
              <div className="kmb-carousel-loading">
                Cargando colección artesanal Kamibi...
              </div>
            ) : (
              <motion.div
                ref={trackRef}
                style={{ x: smoothX }}
                className="kmb-spring-carousel-track"
              >
                <AnimatePresence mode="popLayout">
                  {filteredCarouselProducts.map((prod, idx) => (
                    <motion.div
                      layout
                      key={prod.id}
                      initial={{ opacity: 0, scale: 0.92, y: 18 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        duration: 0.55,
                        delay: idx * 0.05,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="kmb-product-card"
                    >
                      <div
                        className="kmb-prod-img-wrap"
                        onClick={() => {
                          if (!isDraggingCarousel) navigate(`/product/${prod.slug}`);
                        }}
                      >
                        <img
                          src={prod.images?.[0] || '/products/terra-urn.png'}
                          alt={prod.name}
                          className="kmb-prod-img"
                          draggable={false}
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
                          onClick={() => {
                            if (!isDraggingCarousel) navigate(`/product/${prod.slug}`);
                          }}
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
                            {addedProductId === prod.id
                              ? '✓ Añadido'
                              : 'Añadir al carrito'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Smooth Progress Bar Indicator */}
          {maxScroll > 0 && (
            <div className="kmb-carousel-progress-wrap">
              <div className="kmb-carousel-progress-bar">
                <div
                  className="kmb-carousel-progress-fill"
                  style={{
                    transform: `scaleX(${Math.max(0.15, carouselProgress)})`,
                  }}
                />
              </div>
              <span className="kmb-carousel-drag-hint">
                Arrastra o usa las flechas para deslizar suavemente
              </span>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          5. SECCIÓN DE RESEÑAS — POLAROID LINE CAROUSEL CON FÍSICA DE CUERDA
         ===================================================================== */}
      <section className="kmb-reviews-section" id="resenas">
        <div className="kmb-container">
          <div className="kmb-section-intro kmb-reviews-intro">
            <div className="kmb-rating-pill">
              <span className="kmb-stars">★★★★★</span>
              <span>4.9 / 5 • Más de 250 familias acompañadas</span>
            </div>
            <h2 className="kmb-section-heading">
              Recuerdos que permanecen. Despedidas en paz.
            </h2>
            <p className="kmb-section-lead">
              Arrastra la cuerda o pasa de una fotografía a otra para sentir las historias reales de familias que honraron a los suyos con Kamibi.
            </p>
          </div>
        </div>

        {/* Full-Width 21st.dev Polaroid Line Carousel with Pendulum Physics */}
        <div className="kmb-polaroid-stage-wrap">
          <PolaroidLineCarousel
            slides={polaroidReviews}
            height={560}
            cardWidth={345}
            sag={50}
            swing={1.35}
            autoplay={5400}
            string="#B59E7A"
            background="transparent"
            ink="#2D2D2D"
          />
        </div>

        <div className="kmb-container">
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
                          <strong>En Tierra:</strong> Entierra la urna a 25–30 cm de profundidad en un jardín, bosque o maceta grande y riega suavemente.
                          <br />
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
