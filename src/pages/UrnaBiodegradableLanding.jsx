import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
      'Una despedida ecológica, digna y eterna. Urnas biodegradables 100% orgánicas para ceremonias en tierra o mar desde $49.99 y $76.50 USD.',
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
  // Active real product variant per column in the 3-product comparison triptych
  const [selectedFinishes, setSelectedFinishes] = useState({
    'col-earth': 0,
    'col-water': 0,
    'col-mini': 0,
  });

  // Helper to lookup live Wix product by slug so prices/stock/IDs always match Wix Store
  const getLiveProduct = useCallback(
    (slug) => products.find((p) => p.slug === slug),
    [products]
  );

  // Hero scroll parallax
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImgScale = useTransform(heroScroll, [0, 1], [1, 1.08]);
  const heroDockY = useTransform(heroScroll, [0, 1], [0, -18]);

  // Hero Modes Data — Mapped to REAL Wix Store Products & Prices
  const heroAtmospheres = useMemo(() => {
    const terraLive = getLiveProduct('terra-urn');
    const aquaLive = getLiveProduct('aqua-urn');
    const miniFloreLive = getLiveProduct('mini-biodegradables-urn-set');

    return {
      earth: {
        id: terraLive?.id || 'b4fd86df-d446-0993-f324-d5d13eface16',
        _wixId: terraLive?._wixId || 'b4fd86df-d446-0993-f324-d5d13eface16',
        slug: 'terra-urn',
        num: '01',
        label: 'Tierra & Bosque',
        shortSub: 'Terra / Flore / Iris',
        tag: 'CEREMONIA EN TIERRA Y AGUA',
        urnName: terraLive?.name || 'TERRA BIODEGRADABLE URN',
        urnCaption:
          'Elaborada con fibras 100% compostables (3" × 12" × 14"). Incluye kit de despedida con hojas biodegradables y lápiz compostable.',
        timeBadge: 'Integración natural en tierra o agua',
        price: terraLive?.price ?? 90.0,
        originalPrice: terraLive?.originalPrice ?? null,
        bgImage: '/images/hero-earth-ceremony.png',
        urnImage:
          terraLive?.images?.[0] ||
          'https://static.wixstatic.com/media/45119e_8e4a1c81a2bd409e90cf795fe22bac2b~mv2.png/v1/fit/w_2000,h_2000,q_90/file.png',
        secondaryUrnImage:
          'https://static.wixstatic.com/media/45119e_92232e8c88c94935befe3b0b088a83a7~mv2.png/v1/fit/w_2000,h_2000,q_90/file.png',
        accentColor: '#C4856A',
        badgeTop: '100% Compostable • Incluye Kit de Despedida',
        locationHint: 'Bosques memoriales, jardines naturales o mar',
      },
      water: {
        id: aquaLive?.id || '4d71b043-1af4-8fa4-4a2c-c30289462282',
        _wixId: aquaLive?._wixId || '4d71b043-1af4-8fa4-4a2c-c30289462282',
        slug: 'aqua-urn',
        num: '02',
        label: 'Océano & Calma',
        shortSub: 'Aqua / Angel Urn',
        tag: 'EDICIÓN AGUA & TIERRA (15% OFF)',
        urnName: aquaLive?.name || 'AQUA BIODEGRADABLE URN',
        urnCaption:
          'Diseño inspirado en la serenidad del océano. Se disuelve de forma limpia y segura sin plásticos, pegamentos ni tóxicos.',
        timeBadge: 'Apta para mar, lago o tierra',
        price: aquaLive?.price ?? 76.5,
        originalPrice: aquaLive?.originalPrice ?? 90.0,
        bgImage: '/images/hero-water-ceremony.png',
        urnImage:
          aquaLive?.images?.[0] ||
          'https://static.wixstatic.com/media/45119e_812f09d2732e4e2db45a354383159ac9~mv2.png/v1/fit/w_2000,h_2000,q_90/file.png',
        secondaryUrnImage:
          'https://static.wixstatic.com/media/45119e_da682a60bd214c8f9b3a100f545edd65~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png',
        accentColor: '#7A9A9A',
        badgeTop: 'Libre de Tóxicos • Apta para Cabina TSA',
        locationHint: 'Altamar, costas serenas, lagos y ríos',
      },
      mini: {
        id: miniFloreLive?.id || 'f843aff9-c2d4-5a9f-a272-9fddf64c68e5',
        _wixId: miniFloreLive?._wixId || 'f843aff9-c2d4-5a9f-a272-9fddf64c68e5',
        slug: 'mini-biodegradables-urn-set',
        num: '03',
        label: 'Mini Urn Sets',
        shortSub: 'Flore & Ocean Sets',
        tag: 'HOMENAJE FAMILIAR COMPARTIDO',
        urnName: miniFloreLive?.name || 'MINI URN SET FLORE BIODEGRADABLES',
        urnCaption:
          'Set exclusivo de mini urnas biodegradables pensado para compartir una porción simbólica de las cenizas entre hermanos e hijos.',
        timeBadge: 'Set para compartir en familia',
        price: miniFloreLive?.price ?? 49.99,
        originalPrice: miniFloreLive?.originalPrice ?? null,
        bgImage: '/images/philosophy-hero.png',
        urnImage:
          miniFloreLive?.images?.[0] ||
          'https://static.wixstatic.com/media/45119e_d62bb5591c674265a6deee5eb3fa4985~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        secondaryUrnImage:
          'https://static.wixstatic.com/media/45119e_23cc9997f2b24ac7a9b277be1e904170~mv2.png/v1/fit/w_1024,h_1024,q_90/file.png',
        accentColor: '#8B9E8B',
        badgeTop: 'Ediciones Flore & Ocean Disponibles',
        locationHint: 'Múltiples rituales familiares en agua o tierra',
      },
    };
  }, [getLiveProduct]);

  const currentHero = heroAtmospheres[heroMode];

  // Botanical materials for Card 2
  const botanicalMaterials = [
    {
      title: 'Fibras Vegetales Compostables',
      subtitle: 'Papel reciclado y celulosa sostenible',
      detail:
        'Elaboradas sin plásticos, sin pegamentos sintéticos y sin químicos tóxicos. Protegen las cenizas de forma segura hasta el momento de la ceremonia.',
      stat: '0% Plásticos',
    },
    {
      title: 'Integración en Agua y Tierra',
      subtitle: 'Diseño versátil para mar, lago o jardín',
      detail:
        'Nuestras urnas principales (Terra, Aqua, Flore, Iris y Angel) están diseñadas tanto para entierros naturales en tierra como para ceremonias en el agua.',
      stat: 'Agua & Tierra',
    },
    {
      title: 'Kit de Despedida Incluido',
      subtitle: 'Hojas biodegradables y lápiz compostable',
      detail:
        'Cada urna incluye hojas biodegradables y un lápiz ecológico para que familiares y amigos escriban mensajes y palabras de despedida que acompañen el tributo.',
      stat: 'Kit Ritual',
    },
    {
      title: 'Tintas de Soja & Bandas Botánicas',
      subtitle: 'Acabados Ginkgo, Ocean, Turtle, Pink y Gold',
      detail:
        'Bandas decorativas intercambiables impresas con tintas ecológicas a base de soja y detalles florales orgánicos que honran la vida.',
      stat: '100% Orgánico',
    },
  ];

  // =========================================================================
  // 3-COLUMN INTERACTIVE COMPARISON TRIPTYCH — 100% REAL WIX STORE PRODUCTS
  // =========================================================================
  const comparisonModels = useMemo(() => {
    const floreLive = getLiveProduct('flore-urns');
    const terraLive = getLiveProduct('terra-urn');
    const irisLive = getLiveProduct('iris-urn');
    const aquaLive = getLiveProduct('aqua-urn');
    const angelLive = getLiveProduct('angel-urn');
    const miniFloreLive = getLiveProduct('mini-biodegradables-urn-set');
    const miniOceanLive = getLiveProduct('mini-urn-set-ocean-biodegradables');
    const bagTreeLive = getLiveProduct(
      'cremation-burial-bags-tree-of-life-design-pack-of-2'
    );

    return [
      {
        id: 'col-earth',
        num: '01',
        elementTag: 'COLECCIÓN TIERRA & FLORAL',
        edition: 'Urnas Adulto • Agua & Tierra',
        envImage: '/images/hero-earth-ceremony.png',
        timePill: '🌱 Capacidad Adulto (3"×12"×14")',
        variants: [
          {
            id: floreLive?.id || 'f9c09eac-dee0-50ec-1fd8-e591754fdb0a',
            _wixId: floreLive?._wixId || 'f9c09eac-dee0-50ec-1fd8-e591754fdb0a',
            productName: floreLive?.name || 'FLORE BIODEGRADABLE URNS',
            shortLabel: 'Flore Urn',
            bandsInfo: 'Bandas: Turtle, Deep Blue, Soft Blue',
            hex: '#8B9E8B',
            price: floreLive?.price ?? 76.5,
            originalPrice: floreLive?.originalPrice ?? 90.0,
            image:
              floreLive?.images?.[0] ||
              'https://static.wixstatic.com/media/45119e_92232e8c88c94935befe3b0b088a83a7~mv2.png/v1/fit/w_2000,h_2000,q_90/file.png',
            slug: 'flore-urns',
            tagline:
              'Inspirada en la delicadeza floral. Urna biodegradable para ceremonias en tierra o agua con kit de despedida incluido.',
          },
          {
            id: terraLive?.id || 'b4fd86df-d446-0993-f324-d5d13eface16',
            _wixId: terraLive?._wixId || 'b4fd86df-d446-0993-f324-d5d13eface16',
            productName: terraLive?.name || 'TERRA BIODEGRADABLE URN',
            shortLabel: 'Terra Urn',
            bandsInfo: 'Bandas: Ginko Gold, Ocean, Pink, Purple, Ginko',
            hex: '#C4856A',
            price: terraLive?.price ?? 90.0,
            originalPrice: terraLive?.originalPrice ?? null,
            image:
              terraLive?.images?.[0] ||
              'https://static.wixstatic.com/media/45119e_8e4a1c81a2bd409e90cf795fe22bac2b~mv2.png/v1/fit/w_2000,h_2000,q_90/file.png',
            slug: 'terra-urn',
            tagline:
              'Textura orgánica natural en tonos tierra. Diseñada para reintegrarse suavemente en suelo o agua sin dañar el ecosistema.',
          },
          {
            id: irisLive?.id || '4d9511b1-1f04-1057-e379-1d7f2030933c',
            _wixId: irisLive?._wixId || '4d9511b1-1f04-1057-e379-1d7f2030933c',
            productName: irisLive?.name || 'IRIS BIODEGRADABLE URN',
            shortLabel: 'Iris Urn',
            bandsInfo: 'Bandas: Purple, Ocean, Soft Pink, Ginkgo Gold',
            hex: '#D4A5A5',
            price: irisLive?.price ?? 76.5,
            originalPrice: irisLive?.originalPrice ?? 90.0,
            image:
              irisLive?.images?.[0] ||
              'https://static.wixstatic.com/media/45119e_7e8106db1e1645e6a982b82f45d3deeb~mv2.png/v1/fit/w_2000,h_2000,q_90/file.png',
            slug: 'iris-urn',
            tagline:
              'Combinación serena en tonos rosa suave y blanco orgánico, creada para despedidas cálidas en tierra o mar.',
          },
        ],
        bentoSpecs: [
          { label: 'Ceremonia', value: 'Tierra & Agua', sub: '100% Biodegradable' },
          { label: 'Dimensiones', value: '3" × 12" × 14"', sub: 'Capacidad 1 Adulto' },
          { label: 'Pureza', value: '0% Químicos', sub: 'Sin plásticos ni colas' },
          { label: 'Vuelo Aéreo', value: 'Apta Cabina TSA', sub: 'Envío Gratis USA/CAN' },
        ],
        kitHighlight:
          'Incluye Kit de Despedida: hojas biodegradables + lápiz compostable + guía',
      },
      {
        id: 'col-water',
        num: '02',
        elementTag: 'COLECCIÓN OCÉANO & SERENIDAD',
        edition: 'Urnas Adulto • Agua & Tierra',
        envImage: '/images/hero-water-ceremony.png',
        timePill: '🌊 Capacidad Adulto (3"×12"×14")',
        badge: 'Más Elegida • 15% OFF',
        variants: [
          {
            id: aquaLive?.id || '4d71b043-1af4-8fa4-4a2c-c30289462282',
            _wixId: aquaLive?._wixId || '4d71b043-1af4-8fa4-4a2c-c30289462282',
            productName: aquaLive?.name || 'AQUA BIODEGRADABLE URN',
            shortLabel: 'Aqua Urn',
            bandsInfo: 'Bandas: Gold, Deep Blue, Ginkgo, Soft Pink, Turtle',
            hex: '#8BA8A8',
            price: aquaLive?.price ?? 76.5,
            originalPrice: aquaLive?.originalPrice ?? 90.0,
            image:
              aquaLive?.images?.[0] ||
              'https://static.wixstatic.com/media/45119e_812f09d2732e4e2db45a354383159ac9~mv2.png/v1/fit/w_2000,h_2000,q_90/file.png',
            slug: 'aqua-urn',
            tagline:
              'Inspirada en la paz del océano. Se disuelve naturalmente en agua o tierra permitiendo un homenaje sereno y ecológico.',
          },
          {
            id: angelLive?.id || 'a09f394c-67bf-476b-f1a9-e3d576ce6505',
            _wixId: angelLive?._wixId || 'a09f394c-67bf-476b-f1a9-e3d576ce6505',
            productName: angelLive?.name || 'ANGEL BIODEGRADABLE URN',
            shortLabel: 'Angel Urn',
            bandsInfo: '10 diseños de banda disponibles (Ocean, Gold, Ginkgo...)',
            hex: '#F4F1EA',
            price: angelLive?.price ?? 90.0,
            originalPrice: angelLive?.originalPrice ?? null,
            image:
              angelLive?.images?.[0] ||
              'https://static.wixstatic.com/media/45119e_da682a60bd214c8f9b3a100f545edd65~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png',
            slug: 'angel-urn',
            tagline:
              'Diseño blanco minimalista que simboliza luz y paz espiritual. Apta para entierros en mar, lagos o jardines naturales.',
          },
        ],
        bentoSpecs: [
          { label: 'Ceremonia', value: 'Mar, Lago o Tierra', sub: 'Disolución limpia' },
          { label: 'Dimensiones', value: '3" × 12" × 14"', sub: 'Capacidad 1 Adulto' },
          { label: 'Pureza', value: '100% Compostable', sub: 'Respetuosa con fauna' },
          { label: 'Vuelo Aéreo', value: 'Apta Cabina TSA', sub: 'Envío Gratis USA/CAN' },
        ],
        kitHighlight:
          'Incluye Kit de Despedida: hojas biodegradables + lápiz compostable + guía',
      },
      {
        id: 'col-mini',
        num: '03',
        elementTag: 'MINI SETS & BURIAL BAGS',
        edition: 'Para Compartir o Entierro en Tierra',
        envImage: '/images/philosophy-hero.png',
        timePill: '✨ Sets Familiares',
        variants: [
          {
            id: miniFloreLive?.id || 'f843aff9-c2d4-5a9f-a272-9fddf64c68e5',
            _wixId: miniFloreLive?._wixId || 'f843aff9-c2d4-5a9f-a272-9fddf64c68e5',
            productName: miniFloreLive?.name || 'MINI URN SET FLORE BIODEGRADABLES',
            shortLabel: 'Mini Set Flore',
            bandsInfo: 'Set de mini urnas para compartir en familia',
            hex: '#D8C3B8',
            price: miniFloreLive?.price ?? 49.99,
            originalPrice: miniFloreLive?.originalPrice ?? null,
            image:
              miniFloreLive?.images?.[0] ||
              'https://static.wixstatic.com/media/45119e_d62bb5591c674265a6deee5eb3fa4985~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
            slug: 'mini-biodegradables-urn-set',
            tagline:
              'Set de mini urnas biodegradables edición Flore para que hermanos, hijos o familiares compartan una porción simbólica.',
          },
          {
            id: miniOceanLive?.id || '25f910fe-08a8-3004-4b99-579d88e4e240',
            _wixId: miniOceanLive?._wixId || '25f910fe-08a8-3004-4b99-579d88e4e240',
            productName: miniOceanLive?.name || 'MINI URN SET OCEAN BIODEGRADABLES',
            shortLabel: 'Mini Set Ocean',
            bandsInfo: 'Set de mini urnas edición Ocean',
            hex: '#89A7B1',
            price: miniOceanLive?.price ?? 49.99,
            originalPrice: miniOceanLive?.originalPrice ?? null,
            image:
              miniOceanLive?.images?.[0] ||
              'https://static.wixstatic.com/media/45119e_23cc9997f2b24ac7a9b277be1e904170~mv2.png/v1/fit/w_1024,h_1024,q_90/file.png',
            slug: 'mini-urn-set-ocean-biodegradables',
            tagline:
              'Set de mini urnas biodegradables edición Ocean para homenajes íntimos en múltiples lugares significativos.',
          },
          {
            id: bagTreeLive?.id || 'f1d9e4d3-6ad7-70e4-cb1a-3e2999ae3818',
            _wixId: bagTreeLive?._wixId || 'f1d9e4d3-6ad7-70e4-cb1a-3e2999ae3818',
            productName:
              bagTreeLive?.name || 'ASH BURIAL BAGS TREE OF LIFE DESIGN - Pack of 2',
            shortLabel: 'Burial Bags (x2)',
            bandsInfo: 'Pack de 2 bolsas tamaño adulto (Tree of Life / Turtle)',
            hex: '#C4A97D',
            price: bagTreeLive?.price ?? 12.99,
            originalPrice: bagTreeLive?.originalPrice ?? null,
            image:
              bagTreeLive?.images?.[0] ||
              'https://static.wixstatic.com/media/45119e_b515104a49a642a1945b922955493527~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png',
            slug: 'cremation-burial-bags-tree-of-life-design-pack-of-2',
            tagline:
              'Pack de 2 bolsas conmemorativas de papel reciclado con tintas de soja (11.5"×8.5"×4") para entierro en tierra o esparcimiento.',
          },
        ],
        bentoSpecs: [
          { label: 'Propósito', value: 'Tributo Familiar', sub: 'Compartir cenizas' },
          { label: 'Opciones', value: 'Mini Sets & Bags', sub: '$49.99 / $12.99 USD' },
          { label: 'Material', value: 'Fibras Naturales', sub: '100% Eco-Friendly' },
          { label: 'Vuelo Aéreo', value: 'Apta Cabina TSA', sub: 'Envío Gratis USA/CAN' },
        ],
        kitHighlight:
          'Diseñados para ceremonias íntimas familiares, esparcimiento o entierro natural',
      },
    ];
  }, [getLiveProduct]);

  // =========================================================================
  // SMOOTH SPRING-PHYSICS PRODUCT CAROUSEL LOGIC (REAL WIX PRODUCTS)
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

  const filteredCarouselProducts = useMemo(() => {
    return products.filter((p) => {
      if (carouselCategory === 'all') return true;
      if (carouselCategory === 'urns') {
        return p.category === 'urns';
      }
      if (carouselCategory === 'minis') {
        return p.category === 'minis';
      }
      if (carouselCategory === 'bags') {
        return p.category === 'bags';
      }
      return true;
    });
  }, [products, carouselCategory]);

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

  useEffect(() => {
    targetX.set(0);
  }, [carouselCategory, targetX]);

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
    if (next > 0) next *= 0.28;
    if (next < -maxScroll) next = -maxScroll + (next + maxScroll) * 0.28;
    targetX.set(next);
  };

  const handleCarouselPointerUp = () => {
    if (!dragInfo.current.active) return;
    dragInfo.current.active = false;
    setTimeout(() => setIsDraggingCarousel(false), 60);
    const clamped = Math.max(-maxScroll, Math.min(0, targetX.get()));
    targetX.set(clamped);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Direct Add To Cart handler — Always uses the real Wix product object
  const handleDirectBuy = (productData) => {
    const matched = products.find(
      (p) =>
        p.slug === productData.slug ||
        p.id === productData.id ||
        p._wixId === productData._wixId
    );
    const itemToAdd = matched || {
      id: productData._wixId || productData.id,
      _wixId: productData._wixId || productData.id,
      name: productData.productName || productData.name || productData.urnName,
      price: productData.price,
      slug: productData.slug,
      images: [productData.image || productData.urnImage],
    };

    addToCart(itemToAdd, 1);
    const feedbackKey = productData.slug || productData.id;
    setAddedProductId(feedbackKey);
    setTimeout(() => setAddedProductId(null), 2400);
  };

  // Hanging Polaroid Slides for Reviews Section — Featuring real Kamibi Urn names
  const polaroidReviews = [
    {
      image: '/images/review-polaroid-1.png',
      title: 'Paz infinita en el mar',
      quote:
        'Elegimos la Aqua Biodegradable Urn. Flotó al amanecer mientras leíamos las cartas del kit de despedida antes de integrarse en el mar.',
      author: 'Elena R. de Mendoza',
      location: 'San Diego, CA',
      edition: 'Aqua Biodegradable Urn',
      palette: 'dawn',
      seed: 3,
    },
    {
      image: '/images/review-polaroid-2.png',
      title: 'Regresó a la tierra en paz',
      quote:
        'La Terra Biodegradable Urn con banda Ginkgo Gold es hermosa. Poder escribirle nuestras palabras en las hojas biodegradables fue muy sanador.',
      author: 'Marcus & Claudia G.',
      location: 'Austin, TX',
      edition: 'Terra Biodegradable Urn',
      palette: 'mist',
      seed: 11,
    },
    {
      image: '/images/review-polaroid-3.png',
      title: 'Un lago en calma eterna',
      quote:
        'Despedir a mi padre con la Angel Biodegradable Urn en el lago que tanto amaba fue sumamente digno, simple y libre de químicos.',
      author: 'Javier L. Santamaría',
      location: 'Vancouver, Canadá',
      edition: 'Angel Biodegradable Urn',
      palette: 'dusk',
      seed: 19,
    },
    {
      image: '/images/review-polaroid-4.png',
      title: 'Cuatro hogares, un mismo amor',
      quote:
        'El Mini Urn Set Flore nos permitió a mis hermanos compartir las cenizas de mamá y realizar cada uno su propio homenaje íntimo.',
      author: 'Sofía Valenzuela',
      location: 'Miami, FL',
      edition: 'Mini Urn Set Flore',
      palette: 'dawn',
      seed: 27,
    },
    {
      image: '/images/hero-earth-ceremony.png',
      title: 'Delicadeza floral única',
      quote:
        'La Flore Biodegradable Urn superó nuestras expectativas. La calidad artesanal del papel orgánico nos dio muchísima serenidad.',
      author: 'Valentina & Tomás M.',
      location: 'Toronto, Canadá',
      edition: 'Flore Biodegradable Urn',
      palette: 'mist',
      seed: 35,
    },
    {
      image: '/images/hero-water-ceremony.png',
      title: 'Viaje seguro en avión TSA',
      quote:
        'Viajamos en avión sin ningún inconveniente en cabina con la Iris Biodegradable Urn para hacer la ceremonia familiar frente al Pacífico.',
      author: 'David K. Larraín',
      location: 'Seattle, WA',
      edition: 'Iris Biodegradable Urn',
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
                <span>KAMIBI® MEMORIALS • 100% BIODEGRADABLE & COMPOSTABLE</span>
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
                Una despedida ecológica, digna y eterna. Urnas artesanales para agua y tierra elaboradas con materiales 100% naturales, libres de plásticos y químicos.
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
                      <span className="kmb-ritual-sub">
                        Desde ${Number(item.price).toFixed(2)} USD
                      </span>
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

              {/* Trust Micro-bar with Real Prices */}
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
                  <span>Urnas $76.50 – $90 USD • Mini Sets $49.99</span>
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
                  <span>Apta para Cabina TSA</span>
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
                  <span>Envío Gratis USA & Canadá</span>
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
                      ✦ {currentHero.timeBadge}
                    </span>
                  </div>

                  {/* Subtle bottom-left location caption on image */}
                  <div className="kmb-panorama-caption">
                    <span>Ceremonia:</span>
                    <strong>{currentHero.locationHint}</strong>
                  </div>
                </div>

                {/* Below/Offset Studio Product Dock — Real Wix Product & Real Price */}
                <motion.div style={{ y: heroDockY }} className="kmb-studio-dock">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentHero.slug}
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
                          alt="Modelo complementario Kamibi"
                          className="kmb-dock-urn-sec"
                        />
                      </div>

                      <div className="kmb-dock-details">
                        <div className="kmb-dock-header-line">
                          <span className="kmb-dock-eyebrow">{currentHero.tag}</span>
                          <span className="kmb-dock-price">
                            ${Number(currentHero.price).toFixed(2)} <small>USD</small>
                            {currentHero.originalPrice && (
                              <s className="kmb-dock-old-price">
                                ${Number(currentHero.originalPrice).toFixed(2)}
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
                              addedProductId === currentHero.slug ? 'added' : ''
                            }`}
                          >
                            {addedProductId === currentHero.slug
                              ? '✓ Añadido al Carrito'
                              : 'Añadir al carrito +'}
                          </button>
                          <button
                            onClick={() => navigate(`/product/${currentHero.slug}`)}
                            className="kmb-dock-link-btn"
                          >
                            Ver bandas y detalles →
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
              Desliza para descubrir cómo cada urna Kamibi combina materiales 100% compostables, bandas botánicas y un kit ceremonial pensado para honrar la memoria.
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
                              ? 'https://static.wixstatic.com/media/45119e_8e4a1c81a2bd409e90cf795fe22bac2b~mv2.png/v1/fit/w_2000,h_2000,q_90/file.png'
                              : 'https://static.wixstatic.com/media/45119e_812f09d2732e4e2db45a354383159ac9~mv2.png/v1/fit/w_2000,h_2000,q_90/file.png'
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
                        Terra Urn ($90 USD)
                      </button>
                      <button
                        onClick={() => setCardBioMode('water')}
                        className={`kmb-seg-btn ${cardBioMode === 'water' ? 'active' : ''}`}
                      >
                        Aqua Urn ($76.50 USD)
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
                        Materiales naturales, sostenibles y compostables
                      </span>
                    </div>
                    <div className="kmb-metric-item">
                      <span className="kmb-metric-val">0%</span>
                      <span className="kmb-metric-lbl">
                        Plásticos, pegamentos, toxinas o químicos
                      </span>
                    </div>
                    <div className="kmb-metric-item">
                      <span className="kmb-metric-val">3"×12"×14"</span>
                      <span className="kmb-metric-lbl">
                        Capacidad completa para un adulto (ligera y apta TSA)
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
                        src="https://static.wixstatic.com/media/45119e_92232e8c88c94935befe3b0b088a83a7~mv2.png/v1/fit/w_2000,h_2000,q_90/file.png"
                        alt="Flore Biodegradable Urns"
                        className="kmb-craft-urn-img"
                      />
                      <span className="kmb-craft-urn-caption">
                        Flore Urn • $76.50 USD (Antes $90)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="kmb-stack-text-pane">
                  <div className="kmb-card-step-header">
                    <span className="kmb-card-step-num">02 / 03</span>
                    <span className="kmb-card-step-tag">ARTESANÍA CONSCIENTE</span>
                  </div>

                  <h3 className="kmb-stack-card-title">
                    Bandas personalizadas y materiales que honran la vida.
                  </h3>

                  <p className="kmb-stack-card-desc">
                    Cada urna permanece firme e intacta mientras se conserve en interior seco, y permite elegir entre delicadas bandas conmemorativas (Ginkgo Gold, Ocean, Turtle, Soft Pink, Deep Blue y Purple).
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
                    <span className="kmb-card-step-tag">KIT DE DESPEDIDA INCLUIDO</span>
                  </div>

                  <h3 className="kmb-stack-card-title kmb-text-cream">
                    Todo lo que buscas para un homenaje único. Por menos de lo que imaginas.
                  </h3>

                  <p className="kmb-stack-card-desc kmb-text-sand">
                    Cada urna biodegradable de adulto incluye sin costo adicional nuestro Kit de Despedida para que familiares y amigos participen en el ritual escribiendo sus mensajes finales.
                  </p>

                  <ul className="kmb-pack-checklist">
                    <li>
                      <span className="kmb-check-gold">✓</span>
                      <span>
                        Urna 100% biodegradable para agua y tierra (3&quot; Alto × 12&quot; Ancho × 14&quot; Largo)
                      </span>
                    </li>
                    <li>
                      <span className="kmb-check-gold">✓</span>
                      <span>
                        Hojas de escritura biodegradables y lápiz compostable incluidos para mensajes familiares
                      </span>
                    </li>
                    <li>
                      <span className="kmb-check-gold">✓</span>
                      <span>
                        Instrucciones paso a paso para ceremonia en océano, lago o tierra
                      </span>
                    </li>
                    <li>
                      <span className="kmb-check-gold">✓</span>
                      <span>
                        Cumple normativa TSA para viajar en avión + Envío Gratis en USA y Canadá
                      </span>
                    </li>
                  </ul>

                  <div className="kmb-pack-cta-row">
                    <button
                      onClick={() => scrollToSection('comparativa')}
                      className="kmb-btn-gold"
                    >
                      Ver precios y modelos →
                    </button>
                    <span className="kmb-pack-price-hint">
                      Bolsas $12.99 • Mini Sets $49.99 • Urnas Adulto $76.50 – $90.00 USD
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
                      src="https://static.wixstatic.com/media/45119e_8e4a1c81a2bd409e90cf795fe22bac2b~mv2.png/v1/fit/w_2000,h_2000,q_90/file.png"
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
          3. SECCIÓN COMPARATIVA: TRÍPTICO INTERACTIVO CON PRODUCTOS Y PRECIOS REALES
         ===================================================================== */}
      <section className="kmb-comparison-section" id="comparativa">
        <div className="kmb-container">
          <div className="kmb-section-intro">
            <span className="kmb-section-eyebrow">CATÁLOGO Y PRECIOS OFICIALES</span>
            <h2 className="kmb-section-heading">¿Qué Urna Kamibi elegir?</h2>
            <p className="kmb-section-lead">
              Compara nuestras líneas oficiales. Haz clic en los modelos dentro de cada tarjeta para ver su foto real, precio actualizado y opciones de banda.
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

                    {/* Dynamic Real Wix Product Image Pedestal */}
                    <div className="kmb-triptych-urn-pedestal">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeVar.slug}
                          src={activeVar.image}
                          alt={activeVar.productName}
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

                  {/* Interactive Real Model Selector Bar */}
                  <div className="kmb-triptych-finish-bar">
                    <div className="kmb-finish-pills-group">
                      {model.variants.map((v, vIdx) => (
                        <button
                          key={v.slug}
                          type="button"
                          onClick={() =>
                            setSelectedFinishes((prev) => ({
                              ...prev,
                              [model.id]: vIdx,
                            }))
                          }
                          className={`kmb-model-switch-pill ${
                            activeVarIdx === vIdx ? 'active' : ''
                          }`}
                        >
                          <span
                            className="kmb-model-switch-dot"
                            style={{ backgroundColor: v.hex }}
                          />
                          <span>{v.shortLabel}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Body: Real Product Name, Real Wix Price & 2x2 Bento Specs */}
                  <div className="kmb-triptych-body">
                    <div className="kmb-triptych-heading-row">
                      <div>
                        <span className="kmb-triptych-edition">{model.edition}</span>
                        <h3
                          className="kmb-triptych-title"
                          onClick={() => navigate(`/product/${activeVar.slug}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          {activeVar.productName}
                        </h3>
                        <span className="kmb-triptych-bands-note">
                          {activeVar.bandsInfo}
                        </span>
                      </div>

                      <div className="kmb-triptych-price-block">
                        <span className="kmb-triptych-price-from">Precio</span>
                        <div className="kmb-triptych-price-line">
                          <span className="kmb-triptych-price">
                            ${Number(activeVar.price).toFixed(2)}
                          </span>
                          {activeVar.originalPrice && (
                            <s className="kmb-triptych-old-price">
                              ${Number(activeVar.originalPrice).toFixed(2)}
                            </s>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="kmb-triptych-tagline">{activeVar.tagline}</p>

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
                        onClick={() => handleDirectBuy(activeVar)}
                        className={`kmb-triptych-buy-btn ${
                          addedProductId === activeVar.slug ? 'added' : ''
                        }`}
                      >
                        {addedProductId === activeVar.slug
                          ? '✓ Añadido al Carrito'
                          : `Añadir al carrito • $${Number(activeVar.price).toFixed(2)}`}
                      </button>

                      <button
                        onClick={() => navigate(`/product/${activeVar.slug}`)}
                        className="kmb-triptych-detail-btn"
                      >
                        Elegir banda →
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
          4. CARRUSEL DE PRODUCTOS CON FÍSICA SPRING ULTRA-SMOOTH (9 PRODUCTOS REALES)
         ===================================================================== */}
      <section className="kmb-carousel-section" id="catalogo">
        <div className="kmb-container">
          <div className="kmb-carousel-header">
            <div>
              <span className="kmb-section-eyebrow">TIENDA OFICIAL KAMIBI STORE</span>
              <h2 className="kmb-carousel-title">
                Todos los productos disponibles con envío gratis.
              </h2>
            </div>

            <div className="kmb-carousel-controls-row">
              <div className="kmb-carousel-filters">
                {[
                  { id: 'all', label: `Todos (${products.length || 9})` },
                  { id: 'urns', label: 'Urnas Adulto ($76.50 – $90)' },
                  { id: 'minis', label: 'Mini Urn Sets ($49.99)' },
                  { id: 'bags', label: 'Burial Bags ($12.99)' },
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
                Cargando catálogo oficial de Kamibi Store...
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
                          src={prod.images?.[0]}
                          alt={prod.name}
                          className="kmb-prod-img"
                          draggable={false}
                          loading="lazy"
                        />
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <span className="kmb-prod-sale-pill">15% OFF</span>
                        )}
                        <span className="kmb-prod-quickview">Ver producto →</span>
                      </div>

                      <div className="kmb-prod-body">
                        <div className="kmb-prod-meta">
                          <span
                            className="kmb-prod-dot"
                            style={{ backgroundColor: '#C4A97D' }}
                          />
                          <span className="kmb-prod-color-name">
                            {prod.variants?.length > 0
                              ? `${prod.variants.length} diseños de banda`
                              : prod.category === 'minis'
                              ? 'Set Familiar Compartido'
                              : 'Pack de 2 Unidades'}
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
                          {prod.shortDescription
                            ? prod.shortDescription.substring(0, 90) + '...'
                            : '100% Biodegradable y compostable. Envío gratis en USA y Canadá.'}
                        </p>

                        <div className="kmb-prod-footer">
                          <div className="kmb-prod-price-col">
                            <span className="kmb-prod-price">
                              ${Number(prod.price).toFixed(2)} USD
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
                              addedProductId === prod.slug || addedProductId === prod.id
                                ? 'added'
                                : ''
                            }`}
                          >
                            {addedProductId === prod.slug || addedProductId === prod.id
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
                Envío estándar gratuito a todo Estados Unidos y Canadá. Todas nuestras urnas incluyen Kit de Despedida y son aptas para transporte aéreo TSA.
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
                        <h4>Mensajes del Kit de Despedida</h4>
                        <p>
                          Cada urna incluye hojas biodegradables y un lápiz compostable para que los familiares escriban cartas, recuerdos y palabras de amor que se colocan dentro de la urna junto a las cenizas.
                        </p>
                      </div>
                    </div>
                    <div className="kmb-modal-step">
                      <span className="kmb-step-num">II</span>
                      <div>
                        <h4>Entrega en Agua o Tierra</h4>
                        <p>
                          <strong>En Tierra:</strong> Entierra la urna en un jardín, bosque conmemorativo o espacio natural.
                          <br />
                          <strong>En Agua:</strong> Deposita la urna sobre el océano o lago; flotará brevemente permitiendo una despedida serena antes de descender suavemente.
                        </p>
                      </div>
                    </div>
                    <div className="kmb-modal-step">
                      <span className="kmb-step-num">III</span>
                      <div>
                        <h4>Reintegración 100% libre de tóxicos</h4>
                        <p>
                          Fabricada sin plásticos, pegamentos ni metales, la urna se integra armónicamente con el agua o el suelo respetando por completo el ecosistema.
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
                    Cada urna Kamibi está libre de plásticos, pegamentos químicos, metales y barnices sintéticos.
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
