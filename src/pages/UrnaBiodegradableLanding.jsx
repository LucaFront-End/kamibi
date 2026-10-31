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
 * Sticky Stacking Card Wrapper with scroll-driven scale depth
 */
const StickyCardWrapper = ({ index, total, children }) => {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start start', 'end start'],
  });

  const targetScale = 1 - (total - 1 - index) * 0.04;
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
        top: `calc(84px + ${index * 24}px)`,
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Strictly NOINDEX, NOFOLLOW
  useSEO({
    titleEs: 'Urnas Biodegradables Kamibi® — Regresa a la Naturaleza. Nada Menos.',
    titleEn: 'Kamibi® Biodegradable Urns — Return to Nature. Nothing Less.',
    descEs:
      'Urnas biodegradables 100% orgánicas para agua y tierra. Desde $49.99 y $76.50 USD con envío gratis.',
    descEn:
      '100% organic biodegradable urns for water and earth ceremonies.',
    locale,
    noindex: true,
  });

  // Interactive visual states
  const [heroPair, setHeroPair] = useState('urns'); // 'urns' | 'earth' | 'minis'
  const [hoveredHeroUrn, setHoveredHeroUrn] = useState(null); // 'left' | 'right' | null
  const [cardBioMode, setCardBioMode] = useState('water'); // 'water' | 'earth'
  const [activeBandIdx, setActiveBandIdx] = useState(0);
  const [carouselCategory, setCarouselCategory] = useState('all');
  const [activeModal, setActiveModal] = useState(null); // 'how-it-works' | 'materials' | null
  const [addedProductId, setAddedProductId] = useState(null);
  const [compSwatchIdx, setCompSwatchIdx] = useState({
    col1: 0,
    col2: 0,
    col3: 0,
  });

  // Hero scroll parallax for the two clean studio urns (NO rotation so isometric 3D lines stay parallel)
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const leftUrnY = useTransform(heroScroll, [0, 1], [0, -24]);
  const rightUrnY = useTransform(heroScroll, [0, 1], [0, 18]);

  // Clean standalone urn cutouts (100% pure box renders without floating bags or pens)
  const CLEAN_URN_CUTOUTS = {
    'flore-urns':
      'https://static.wixstatic.com/media/45119e_44f8f91ccd1b439098bf5760374cc702~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
    'aqua-urn':
      'https://static.wixstatic.com/media/45119e_48478600018f46ffb3f1ac569e733471~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
    'iris-urn':
      'https://static.wixstatic.com/media/45119e_4515ed8dce4f4ea28b7bfeb68eac9066~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
    'terra-urn':
      'https://static.wixstatic.com/media/45119e_277f4849b55642b1a9c570a911f20d37~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png',
    'angel-urn':
      'https://static.wixstatic.com/media/45119e_6fee7c273f3f487aba1e9f9e8aee9a72~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
    'mini-biodegradables-urn-set':
      'https://static.wixstatic.com/media/45119e_d62bb5591c674265a6deee5eb3fa4985~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
    'mini-urn-set-ocean-biodegradables':
      'https://static.wixstatic.com/media/45119e_b29071730d57411e80628960675d4a04~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
  };

  // Hero Dual-Product Visual Pairs with Hover Detail Metadata
  const heroVisualPairs = {
    urns: {
      label: 'Agua & Mar',
      caption: 'Pasa el cursor sobre cada urna para ver sus detalles',
      slug: 'aqua-urn',
      leftImg:
        'https://static.wixstatic.com/media/45119e_48478600018f46ffb3f1ac569e733471~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
      rightImg:
        'https://static.wixstatic.com/media/45119e_44f8f91ccd1b439098bf5760374cc702~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
      leftName: 'Kamibi Aqua (Gold)',
      rightName: 'Kamibi Flore (Turtle)',
      leftDetail: {
        id: '4d71b043-1af4-8fa4-4a2c-c30289462282',
        slug: 'aqua-urn',
        name: 'Kamibi Aqua',
        band: 'Banda Golden Leaf',
        hex: '#C4A97D',
        price: 76.5,
        oldPrice: 90.0,
        chips: ['Flotación + Mar', '14" × 12" × 3"', 'Cabina TSA'],
      },
      rightDetail: {
        id: 'f9c09eac-dee0-50ec-1fd8-e591754fdb0a',
        slug: 'flore-urns',
        name: 'Kamibi Flore',
        band: 'Banda Turtle Floral',
        hex: '#2B9EB3',
        price: 76.5,
        oldPrice: 90.0,
        chips: ['Agua & Tierra', 'Pétalos Reales', 'Kit Ritual'],
      },
    },
    earth: {
      label: 'Tierra & Bosque',
      caption: 'Pasa el cursor sobre cada urna para ver sus detalles',
      slug: 'terra-urn',
      leftImg:
        'https://static.wixstatic.com/media/45119e_277f4849b55642b1a9c570a911f20d37~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png',
      rightImg:
        'https://static.wixstatic.com/media/45119e_4515ed8dce4f4ea28b7bfeb68eac9066~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
      leftName: 'Kamibi Terra (Botanical)',
      rightName: 'Kamibi Iris (Sakura)',
      leftDetail: {
        id: 'b4fd86df-d446-0993-f324-d5d13eface16',
        slug: 'terra-urn',
        name: 'Kamibi Terra',
        band: 'Eucalyptus Botanical',
        hex: '#8B9E8B',
        price: 90.0,
        oldPrice: null,
        chips: ['Suelo 2–4 sem', 'Fibras Puras', 'Nutre Raíces'],
      },
      rightDetail: {
        id: '4d9511b1-1f04-1057-e379-1d7f2030933c',
        slug: 'iris-urn',
        name: 'Kamibi Iris',
        band: 'Sakura Blossom',
        hex: '#E2B4BD',
        price: 76.5,
        oldPrice: 90.0,
        chips: ['Tierra & Agua', '100% Orgánica', 'Cabina TSA'],
      },
    },
    minis: {
      label: 'Mini Sets (×4)',
      caption: 'Pasa el cursor sobre cada set para ver sus detalles',
      slug: 'mini-biodegradables-urn-set',
      leftImg:
        'https://static.wixstatic.com/media/45119e_d62bb5591c674265a6deee5eb3fa4985~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
      rightImg:
        'https://static.wixstatic.com/media/45119e_b29071730d57411e80628960675d4a04~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
      leftName: 'Mini Set Flore',
      rightName: 'Mini Set Ocean',
      leftDetail: {
        id: 'f843aff9-c2d4-5a9f-a272-9fddf64c68e5',
        slug: 'mini-biodegradables-urn-set',
        name: 'Mini Set Flore',
        band: 'Set Familiar × 4 Urnas',
        hex: '#8B9E8B',
        price: 49.99,
        oldPrice: null,
        chips: ['4 Mini Urnas', 'Para Compartir', 'Kit Incluido'],
      },
      rightDetail: {
        id: '25f910fe-08a8-3004-4b99-579d88e4e240',
        slug: 'mini-urn-set-ocean-biodegradables',
        name: 'Mini Set Ocean',
        band: 'Set Marino × 4 Urnas',
        hex: '#7BA7B5',
        price: 49.99,
        oldPrice: null,
        chips: ['4 Mini Urnas', 'Agua y Tierra', 'Cabina TSA'],
      },
    },
  };

  const activeHero = heroVisualPairs[heroPair];

  // Card 2 Interactive Band Showcase (100% Pure Clean Urn Cutouts)
  const bandShowcase = [
    {
      name: 'Eucalyptus Botanical',
      model: 'Terra Urn • $90.00 USD',
      slug: 'terra-urn',
      hex: '#8B9E8B',
      img: 'https://static.wixstatic.com/media/45119e_277f4849b55642b1a9c570a911f20d37~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png',
    },
    {
      name: 'Turtle Floral',
      model: 'Flore Urn • $76.50 USD',
      slug: 'flore-urns',
      hex: '#2B9EB3',
      img: 'https://static.wixstatic.com/media/45119e_44f8f91ccd1b439098bf5760374cc702~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
    },
    {
      name: 'Golden Leaf',
      model: 'Aqua Urn • $76.50 USD',
      slug: 'aqua-urn',
      hex: '#C4A97D',
      img: 'https://static.wixstatic.com/media/45119e_48478600018f46ffb3f1ac569e733471~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
    },
    {
      name: 'Sakura Blossom',
      model: 'Iris Urn • $76.50 USD',
      slug: 'iris-urn',
      hex: '#E2B4BD',
      img: 'https://static.wixstatic.com/media/45119e_4515ed8dce4f4ea28b7bfeb68eac9066~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
    },
    {
      name: 'Deep Ocean',
      model: 'Aqua Urn • $76.50 USD',
      slug: 'aqua-urn',
      hex: '#1C7C9C',
      img: 'https://static.wixstatic.com/media/45119e_5d507d8460784c628298d2c49edaac3e~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
    },
    {
      name: 'Angel Gold',
      model: 'Angel Urn • $90.00 USD',
      slug: 'angel-urn',
      hex: '#D4BC94',
      img: 'https://static.wixstatic.com/media/45119e_6fee7c273f3f487aba1e9f9e8aee9a72~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
    },
  ];

  // Visual-First 3-Product Showcase Cards (Zero long spec lists — Scenic Backdrop + Floating Cutout + Visual Chips)
  const appleComparisonCols = [
    {
      key: 'col1',
      envTag: 'Agua & Mar',
      envIcon: 'water',
      sceneBg: '/images/home-test-water.png',
      badge: '15% OFF',
      title: 'Kamibi Aqua & Flore',
      price: 76.5,
      originalPrice: 90.0,
      chips: ['🌊 Agua & Tierra', '✈️ Cabina TSA', '📜 Kit Ritual'],
      swatches: [
        {
          label: 'Aqua Gold',
          hex: '#C4A97D',
          slug: 'aqua-urn',
          id: '4d71b043-1af4-8fa4-4a2c-c30289462282',
          name: 'AQUA BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_48478600018f46ffb3f1ac569e733471~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Flore Turtle',
          hex: '#2B9EB3',
          slug: 'flore-urns',
          id: 'f9c09eac-dee0-50ec-1fd8-e591754fdb0a',
          name: 'FLORE BIODEGRADABLE URNS',
          img: 'https://static.wixstatic.com/media/45119e_44f8f91ccd1b439098bf5760374cc702~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Iris Sakura',
          hex: '#E2B4BD',
          slug: 'iris-urn',
          id: '4d9511b1-1f04-1057-e379-1d7f2030933c',
          name: 'IRIS BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_4515ed8dce4f4ea28b7bfeb68eac9066~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Aqua Deep Blue',
          hex: '#1C7C9C',
          slug: 'aqua-urn',
          id: '4d71b043-1af4-8fa4-4a2c-c30289462282',
          name: 'AQUA BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_5d507d8460784c628298d2c49edaac3e~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Iris Ginkgo',
          hex: '#E5A9A9',
          slug: 'iris-urn',
          id: '4d9511b1-1f04-1057-e379-1d7f2030933c',
          name: 'IRIS BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_30cc2647cbfa4613b55c9c180bd8be22~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
      ],
    },
    {
      key: 'col2',
      envTag: 'Tierra & Bosque',
      envIcon: 'earth',
      sceneBg: '/images/about-process.png',
      badge: '10 Bandas',
      title: 'Kamibi Terra & Angel',
      price: 90.0,
      originalPrice: null,
      chips: ['🌱 Suelo 2–4 sem', '✈️ Cabina TSA', '🌿 100% Orgánica'],
      swatches: [
        {
          label: 'Terra Botanical',
          hex: '#8B9E8B',
          slug: 'terra-urn',
          id: 'b4fd86df-d446-0993-f324-d5d13eface16',
          name: 'TERRA BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_277f4849b55642b1a9c570a911f20d37~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png',
        },
        {
          label: 'Angel Gold',
          hex: '#D4BC94',
          slug: 'angel-urn',
          id: 'a09f394c-67bf-476b-f1a9-e3d576ce6505',
          name: 'ANGEL BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_6fee7c273f3f487aba1e9f9e8aee9a72~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Angel Ocean',
          hex: '#7BA7B5',
          slug: 'angel-urn',
          id: 'a09f394c-67bf-476b-f1a9-e3d576ce6505',
          name: 'ANGEL BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_055fa3d6159a47a8b60de621c43b90e1~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Angel Soft Pink',
          hex: '#E2B4BD',
          slug: 'angel-urn',
          id: 'a09f394c-67bf-476b-f1a9-e3d576ce6505',
          name: 'ANGEL BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_8d3df7b505f7458a98c95c0fc4ea293e~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Angel Deep Blue',
          hex: '#1C7C9C',
          slug: 'angel-urn',
          id: 'a09f394c-67bf-476b-f1a9-e3d576ce6505',
          name: 'ANGEL BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_06646d5f8f6c4200aa02c9052fe7b168~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
      ],
    },
    {
      key: 'col3',
      envTag: 'Set Familiar ×4',
      envIcon: 'minis',
      sceneBg: '/images/caja-terra.png',
      badge: 'Compartir',
      title: 'Kamibi Mini & Bags',
      price: 49.99,
      originalPrice: null,
      chips: ['🤍 Pack ×4 / ×2', '✈️ Cabina TSA', '🌾 Papel Puro'],
      swatches: [
        {
          label: 'Mini Set Flore (×4)',
          hex: '#8B9E8B',
          slug: 'mini-biodegradables-urn-set',
          id: 'f843aff9-c2d4-5a9f-a272-9fddf64c68e5',
          name: 'MINI URN SET FLORE BIODEGRADABLES',
          priceOverride: 49.99,
          img: 'https://static.wixstatic.com/media/45119e_d62bb5591c674265a6deee5eb3fa4985~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Mini Set Ocean (×4)',
          hex: '#7BA7B5',
          slug: 'mini-urn-set-ocean-biodegradables',
          id: '25f910fe-08a8-3004-4b99-579d88e4e240',
          name: 'MINI URN SET OCEAN BIODEGRADABLES',
          priceOverride: 49.99,
          img: 'https://static.wixstatic.com/media/45119e_b29071730d57411e80628960675d4a04~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Tree of Life Bags (×2)',
          hex: '#C49A6C',
          slug: 'cremation-burial-bags-tree-of-life-design-pack-of-2',
          id: 'f1d9e4d3-6ad7-70e4-cb1a-3e2999ae3818',
          name: 'ASH BURIAL BAGS TREE OF LIFE DESIGN - Pack of 2',
          priceOverride: 12.99,
          img: 'https://static.wixstatic.com/media/45119e_b515104a49a642a1945b922955493527~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png',
        },
      ],
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

  const filteredCarouselProducts = useMemo(() => {
    return products.filter((p) => {
      if (carouselCategory === 'all') return true;
      if (carouselCategory === 'urns') return p.category === 'urns';
      if (carouselCategory === 'minis') return p.category === 'minis';
      if (carouselCategory === 'bags') return p.category === 'bags';
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
        setCarouselProgress(Math.min(1, Math.max(0, -val / maxScroll)));
      }
    });
    return () => unsubscribe();
  }, [smoothX, maxScroll]);

  const slideCarouselBy = (dir) => {
    const stepPx = 360;
    const next = Math.max(-maxScroll, Math.min(0, targetX.get() - dir * stepPx));
    targetX.set(next);
  };

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
    targetX.set(Math.max(-maxScroll, Math.min(0, targetX.get())));
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

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
      name: productData.name || productData.title,
      price: productData.priceOverride ?? productData.price,
      slug: productData.slug,
      images: [productData.img || productData.image],
    };

    addToCart(itemToAdd, 1);
    const feedbackKey = productData.slug || productData.id;
    setAddedProductId(feedbackKey);
    setTimeout(() => setAddedProductId(null), 2200);
  };

  // Concise Polaroid Reviews
  const polaroidReviews = [
    {
      image: '/images/review-polaroid-1.png',
      title: 'Paz infinita en el mar',
      quote: 'Flotó al amanecer antes de integrarse en el océano con una calma única.',
      author: 'Elena R.',
      location: 'San Diego, CA',
      edition: 'Aqua Urn',
    },
    {
      image: '/images/review-polaroid-2.png',
      title: 'Regresó a la tierra',
      quote: 'Escribir nuestras cartas en las hojas biodegradables fue profundamente sanador.',
      author: 'Marcus & Claudia',
      location: 'Austin, TX',
      edition: 'Terra Urn',
    },
    {
      image: '/images/review-polaroid-3.png',
      title: 'Un lago en calma',
      quote: 'Una despedida digna, silenciosa y 100% libre de químicos.',
      author: 'Javier L.',
      location: 'Vancouver, BC',
      edition: 'Angel Urn',
    },
    {
      image: '/images/review-polaroid-4.png',
      title: 'Cuatro hogares unidos',
      quote: 'El Mini Set nos permitió a mis hermanos compartir su recuerdo en cada ciudad.',
      author: 'Sofía V.',
      location: 'Miami, FL',
      edition: 'Mini Set Flore',
    },
    {
      image: '/images/hero-earth-ceremony.png',
      title: 'Belleza artesanal',
      quote: 'Parece una escultura orgánica. La banda Turtle es aún más linda en persona.',
      author: 'Valentina M.',
      location: 'Toronto, ON',
      edition: 'Flore Urn',
    },
  ];

  return (
    <div className="kmb-landing">
      {/* =====================================================================
          1. HERO SECTION — APPLE WATCH STYLE: MINIMAL COPY + 2 GIANT URNS
         ===================================================================== */}
      <section className="kmb-apple-hero" ref={heroRef}>
        <div className="kmb-container">
          {/* Minimal Centered Header */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="kmb-apple-hero-head"
          >
            <div className="kmb-brand-lockup">
              <span className="kmb-brand-leaf">✦</span>
              <span className="kmb-brand-word">KAMIBI</span>
              <span className="kmb-brand-series">COLECCIÓN ORGÁNICA</span>
            </div>

            <h1 className="kmb-apple-h1">
              Regresa a la naturaleza.
              <span>Nada menos.</span>
            </h1>

            <p className="kmb-apple-price-line">
              Desde <strong>$76.50 USD</strong> en Urnas Adulto o{' '}
              <strong>$49.99 USD</strong> en Mini Sets. Envío gratis.
            </p>

            <div className="kmb-apple-cta-group">
              <button
                onClick={() => scrollToSection('comparativa')}
                className="kmb-pill-cta-solid"
              >
                Comprar
              </button>

              <div className="kmb-apple-sublinks">
                <button
                  onClick={() => scrollToSection('catalogo')}
                  className="kmb-apple-link"
                >
                  Ver todos los modelos <span>›</span>
                </button>
                <button
                  onClick={() => setActiveModal('how-it-works')}
                  className="kmb-apple-link"
                >
                  Cómo funciona <span>ⓘ</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Giant Dual-Urn Studio Stage + Minimalist Ambient SVGs + Hover Detail Popovers */}
          <div className="kmb-dual-urn-stage">
            {/* Minimalist Ambient Background SVGs per Environment (Water / Forest / Minis) */}
            <div className="kmb-hero-ambient-svg-wrap" aria-hidden="true">
              <AnimatePresence mode="wait">
                {heroPair === 'urns' && (
                  <motion.svg
                    key="svg-water"
                    viewBox="0 0 900 420"
                    fill="none"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.6 }}
                    className="kmb-ambient-svg kmb-svg-water"
                  >
                    {/* Concentric Water Ripples */}
                    <ellipse cx="450" cy="215" rx="220" ry="88" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" opacity="0.45" />
                    <ellipse cx="450" cy="215" rx="320" ry="126" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                    <ellipse cx="450" cy="215" rx="410" ry="164" stroke="currentColor" strokeWidth="0.75" opacity="0.18" />
                    {/* Flowing Ocean Topographic Waves */}
                    <path d="M 40 165 Q 245 110, 450 165 T 860 165" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
                    <path d="M 20 245 Q 235 300, 450 245 T 880 245" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
                    <path d="M 80 310 Q 265 265, 450 310 T 820 310" stroke="currentColor" strokeWidth="0.9" strokeDasharray="3 5" opacity="0.28" />
                    {/* Minimalist Water Droplet & Wave Accents */}
                    <circle cx="135" cy="120" r="4" fill="currentColor" opacity="0.35" />
                    <circle cx="765" cy="135" r="3.5" fill="currentColor" opacity="0.35" />
                    <path d="M 755 95 C 765 80, 775 80, 785 95" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
                  </motion.svg>
                )}

                {heroPair === 'earth' && (
                  <motion.svg
                    key="svg-earth"
                    viewBox="0 0 900 420"
                    fill="none"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.6 }}
                    className="kmb-ambient-svg kmb-svg-earth"
                  >
                    {/* Organic Tree Growth Rings */}
                    <circle cx="450" cy="205" r="145" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" opacity="0.38" />
                    <circle cx="450" cy="205" r="215" stroke="currentColor" strokeWidth="1" opacity="0.26" />
                    <circle cx="450" cy="205" r="290" stroke="currentColor" strokeWidth="0.8" opacity="0.16" />
                    {/* Left Minimal Botanical Leaf Branch */}
                    <path d="M 110 290 Q 155 200, 215 115" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.42" />
                    <path d="M 140 240 C 115 225, 118 198, 152 212" stroke="currentColor" strokeWidth="1.1" opacity="0.38" />
                    <path d="M 172 185 C 148 168, 152 142, 184 158" stroke="currentColor" strokeWidth="1.1" opacity="0.38" />
                    <path d="M 155 222 C 182 215, 192 238, 162 245" stroke="currentColor" strokeWidth="1.1" opacity="0.38" />
                    {/* Right Minimal Botanical Leaf Branch */}
                    <path d="M 790 290 Q 745 200, 685 115" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.42" />
                    <path d="M 760 240 C 785 225, 782 198, 748 212" stroke="currentColor" strokeWidth="1.1" opacity="0.38" />
                    <path d="M 728 185 C 752 168, 748 142, 716 158" stroke="currentColor" strokeWidth="1.1" opacity="0.38" />
                  </motion.svg>
                )}

                {heroPair === 'minis' && (
                  <motion.svg
                    key="svg-minis"
                    viewBox="0 0 900 420"
                    fill="none"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.6 }}
                    className="kmb-ambient-svg kmb-svg-minis"
                  >
                    {/* Four Interconnected Family Tribute Orbits */}
                    <circle cx="340" cy="195" r="130" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                    <circle cx="560" cy="195" r="130" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                    <circle cx="450" cy="145" r="110" stroke="currentColor" strokeWidth="0.9" strokeDasharray="4 6" opacity="0.28" />
                    <circle cx="450" cy="245" r="110" stroke="currentColor" strokeWidth="0.9" strokeDasharray="4 6" opacity="0.28" />
                    {/* 4 Cardinal Botanical Stars */}
                    <path d="M 165 135 L 170 148 L 183 153 L 170 158 L 165 171 L 160 158 L 147 153 L 160 148 Z" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                    <path d="M 735 135 L 740 148 L 753 153 L 740 158 L 735 171 L 730 158 L 717 153 L 730 148 Z" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={heroPair}
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="kmb-dual-urns-composition"
              >
                <div className="kmb-stage-floor-glow" aria-hidden="true" />

                {/* LEFT URN + INTERACTIVE HOVER POPOVER */}
                <motion.div
                  style={{ y: leftUrnY }}
                  className={`kmb-giant-urn-wrap kmb-urn-left ${
                    hoveredHeroUrn === 'left'
                      ? 'is-hovered'
                      : hoveredHeroUrn === 'right'
                      ? 'is-dimmed'
                      : ''
                  }`}
                  onMouseEnter={() => setHoveredHeroUrn('left')}
                  onMouseLeave={() => setHoveredHeroUrn(null)}
                  onClick={() => navigate(`/product/${activeHero.leftDetail.slug}`)}
                >
                  <img
                    src={activeHero.leftImg}
                    alt={activeHero.leftName}
                    className="kmb-giant-urn-img"
                  />

                  <span className="kmb-urn-hotspot" aria-hidden="true">
                    +
                  </span>

                  <AnimatePresence>
                    {hoveredHeroUrn === 'left' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="kmb-urn-hover-card kmb-hover-left"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="kmb-uhc-top">
                          <span
                            className="kmb-uhc-dot"
                            style={{ backgroundColor: activeHero.leftDetail.hex }}
                          />
                          <span className="kmb-uhc-band">
                            {activeHero.leftDetail.band}
                          </span>
                        </div>

                        <div className="kmb-uhc-title-row">
                          <strong>{activeHero.leftDetail.name}</strong>
                          <span className="kmb-uhc-price">
                            ${activeHero.leftDetail.price.toFixed(2)}
                            {activeHero.leftDetail.oldPrice && (
                              <s>${activeHero.leftDetail.oldPrice.toFixed(2)}</s>
                            )}
                          </span>
                        </div>

                        <div className="kmb-uhc-chips">
                          {activeHero.leftDetail.chips.map((c, idx) => (
                            <span key={idx} className="kmb-uhc-chip">
                              {c}
                            </span>
                          ))}
                        </div>

                        <div className="kmb-uhc-actions">
                          <button
                            type="button"
                            onClick={() =>
                              handleDirectBuy({
                                ...activeHero.leftDetail,
                                img: activeHero.leftImg,
                              })
                            }
                            className="kmb-uhc-buy"
                          >
                            {addedProductId === activeHero.leftDetail.slug
                              ? '✓ Añadido'
                              : '+ Comprar'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/product/${activeHero.leftDetail.slug}`)
                            }
                            className="kmb-uhc-link"
                          >
                            Ver <span>→</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* RIGHT URN + INTERACTIVE HOVER POPOVER */}
                <motion.div
                  style={{ y: rightUrnY }}
                  className={`kmb-giant-urn-wrap kmb-urn-right ${
                    hoveredHeroUrn === 'right'
                      ? 'is-hovered'
                      : hoveredHeroUrn === 'left'
                      ? 'is-dimmed'
                      : ''
                  }`}
                  onMouseEnter={() => setHoveredHeroUrn('right')}
                  onMouseLeave={() => setHoveredHeroUrn(null)}
                  onClick={() => navigate(`/product/${activeHero.rightDetail.slug}`)}
                >
                  <img
                    src={activeHero.rightImg}
                    alt={activeHero.rightName}
                    className="kmb-giant-urn-img"
                  />

                  <span className="kmb-urn-hotspot" aria-hidden="true">
                    +
                  </span>

                  <AnimatePresence>
                    {hoveredHeroUrn === 'right' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="kmb-urn-hover-card kmb-hover-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="kmb-uhc-top">
                          <span
                            className="kmb-uhc-dot"
                            style={{ backgroundColor: activeHero.rightDetail.hex }}
                          />
                          <span className="kmb-uhc-band">
                            {activeHero.rightDetail.band}
                          </span>
                        </div>

                        <div className="kmb-uhc-title-row">
                          <strong>{activeHero.rightDetail.name}</strong>
                          <span className="kmb-uhc-price">
                            ${activeHero.rightDetail.price.toFixed(2)}
                            {activeHero.rightDetail.oldPrice && (
                              <s>${activeHero.rightDetail.oldPrice.toFixed(2)}</s>
                            )}
                          </span>
                        </div>

                        <div className="kmb-uhc-chips">
                          {activeHero.rightDetail.chips.map((c, idx) => (
                            <span key={idx} className="kmb-uhc-chip">
                              {c}
                            </span>
                          ))}
                        </div>

                        <div className="kmb-uhc-actions">
                          <button
                            type="button"
                            onClick={() =>
                              handleDirectBuy({
                                ...activeHero.rightDetail,
                                img: activeHero.rightImg,
                              })
                            }
                            className="kmb-uhc-buy"
                          >
                            {addedProductId === activeHero.rightDetail.slug
                              ? '✓ Añadido'
                              : '+ Comprar'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/product/${activeHero.rightDetail.slug}`)
                            }
                            className="kmb-uhc-link"
                          >
                            Ver <span>→</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            <p className="kmb-hero-pair-caption">{activeHero.caption}</p>

            {/* Minimal 3-pill visual switcher */}
            <div className="kmb-hero-pair-pills">
              {Object.entries(heroVisualPairs).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setHeroPair(key);
                    setHoveredHeroUrn(null);
                  }}
                  className={`kmb-pair-pill ${heroPair === key ? 'active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. STICKY STACKING CARDS — VISUAL-FIRST APPLE BENTO CARDS (MINIMAL TEXT)
         ===================================================================== */}
      <section className="kmb-stack-section" id="caracteristicas">
        <div className="kmb-container">
          <div className="kmb-sticky-stack-container">
            {/* STICKY CARD 1: Giant Clean Urn Left + Big Statement Right (Apple Block 2) */}
            <StickyCardWrapper index={0} total={3}>
              <div className="kmb-apple-feature-card">
                <div className="kmb-af-visual">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={cardBioMode}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="kmb-af-urn-stage"
                    >
                      <img
                        src={
                          cardBioMode === 'water'
                            ? 'https://static.wixstatic.com/media/45119e_48478600018f46ffb3f1ac569e733471~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png'
                            : 'https://static.wixstatic.com/media/45119e_277f4849b55642b1a9c570a911f20d37~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png'
                        }
                        alt="Urna Biodegradable Kamibi"
                        className="kmb-af-big-urn"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="kmb-af-copy">
                  <span className="kmb-af-eyebrow">Diseñada para florecer.</span>
                  <h2 className="kmb-af-headline">
                    Se integra con el{' '}
                    <em>{cardBioMode === 'water' ? 'océano' : 'bosque'}</em> sin dejar
                    rastro químico.
                  </h2>

                  <div className="kmb-af-pills">
                    <button
                      type="button"
                      onClick={() => setCardBioMode('water')}
                      className={`kmb-af-pill ${cardBioMode === 'water' ? 'active' : ''}`}
                    >
                      Agua & Mar
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardBioMode('earth')}
                      className={`kmb-af-pill ${cardBioMode === 'earth' ? 'active' : ''}`}
                    >
                      Tierra & Árbol
                    </button>
                  </div>
                </div>
              </div>
            </StickyCardWrapper>

            {/* STICKY CARD 2: Interactive Giant Band Switcher */}
            <StickyCardWrapper index={1} total={3}>
              <div className="kmb-apple-feature-card">
                <div className="kmb-af-visual">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeBandIdx}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                      className="kmb-af-urn-stage"
                      onClick={() =>
                        navigate(`/product/${bandShowcase[activeBandIdx].slug}`)
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src={bandShowcase[activeBandIdx].img}
                        alt={bandShowcase[activeBandIdx].name}
                        className="kmb-af-big-urn"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="kmb-af-copy">
                  <span className="kmb-af-eyebrow">100% Fibras Orgánicas.</span>
                  <h2 className="kmb-af-headline">
                    Diez bandas botánicas.{' '}
                    <em>Cero plásticos ni metales.</em>
                  </h2>

                  <div className="kmb-band-swatch-row">
                    {bandShowcase.map((b, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveBandIdx(idx)}
                        className={`kmb-band-dot-btn ${
                          activeBandIdx === idx ? 'active' : ''
                        }`}
                        title={b.name}
                      >
                        <span style={{ backgroundColor: b.hex }} />
                      </button>
                    ))}
                  </div>

                  <div className="kmb-band-active-caption">
                    <strong>{bandShowcase[activeBandIdx].name}</strong>
                    <span>• {bandShowcase[activeBandIdx].model}</span>
                  </div>
                </div>
              </div>
            </StickyCardWrapper>

            {/* STICKY CARD 3: Apple Block 3 Style ("Todo lo que buscas. Por menos." + Clean 2x2 Studio Grid) */}
            <StickyCardWrapper index={2} total={3}>
              <div className="kmb-apple-pack-card">
                <div className="kmb-ap-copy">
                  <div className="kmb-brand-lockup kmb-lockup-left">
                    <span className="kmb-brand-leaf">✦</span>
                    <span className="kmb-brand-word">KAMIBI</span>
                    <span className="kmb-brand-series">COLECCIÓN COMPLETA</span>
                  </div>

                  <h2 className="kmb-ap-headline">
                    Todo lo que buscas.
                    <span>Por menos.</span>
                  </h2>

                  <p className="kmb-ap-sub">
                    Urnas Adulto desde <strong>$76.50 USD</strong> o Sets de 4 Mini
                    Urnas para compartir en familia por <strong>$49.99 USD</strong>.
                  </p>

                  <div className="kmb-ap-actions">
                    <button
                      onClick={() => scrollToSection('comparativa')}
                      className="kmb-pill-cta-solid"
                    >
                      Comprar
                    </button>
                    <button
                      onClick={() => setActiveModal('how-it-works')}
                      className="kmb-apple-link"
                    >
                      Más información <span>›</span>
                    </button>
                  </div>
                </div>

                {/* Clean 2x2 Aligned Studio Showcase (Zero messy overlaps) */}
                <div className="kmb-ap-studio-grid">
                  {[
                    {
                      name: 'Kamibi Aqua',
                      price: '$76.50',
                      slug: 'aqua-urn',
                      img: 'https://static.wixstatic.com/media/45119e_48478600018f46ffb3f1ac569e733471~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
                    },
                    {
                      name: 'Kamibi Flore',
                      price: '$76.50',
                      slug: 'flore-urns',
                      img: 'https://static.wixstatic.com/media/45119e_44f8f91ccd1b439098bf5760374cc702~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
                    },
                    {
                      name: 'Kamibi Iris',
                      price: '$76.50',
                      slug: 'iris-urn',
                      img: 'https://static.wixstatic.com/media/45119e_4515ed8dce4f4ea28b7bfeb68eac9066~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
                    },
                    {
                      name: 'Mini Set (×4)',
                      price: '$49.99',
                      slug: 'mini-biodegradables-urn-set',
                      img: 'https://static.wixstatic.com/media/45119e_d62bb5591c674265a6deee5eb3fa4985~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="kmb-ap-studio-tile"
                      onClick={() => navigate(`/product/${item.slug}`)}
                    >
                      <img src={item.img} alt={item.name} />
                      <div className="kmb-ap-tile-meta">
                        <strong>{item.name}</strong>
                        <span>{item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </StickyCardWrapper>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. SECCIÓN 3 PRODUCTOS: VISUAL GALLERY CARDS (85% VISUAL, ZERO SPEC LISTS)
         ===================================================================== */}
      <section className="kmb-visual-trio-section" id="comparativa">
        <div className="kmb-container">
          <div className="kmb-vt-header">
            <span className="kmb-vt-eyebrow">Tres ediciones orgánicas</span>
            <h2 className="kmb-compare-main-title">¿Qué Kamibi elegir?</h2>
          </div>

          <div className="kmb-visual-trio-grid">
            {appleComparisonCols.map((col) => {
              const activeIdx = compSwatchIdx[col.key] || 0;
              const activeSwatch = col.swatches[activeIdx] || col.swatches[0];
              const displayPrice = activeSwatch.priceOverride ?? col.price;

              return (
                <div key={col.key} className="kmb-vt-card">
                  {/* TOP 70%: IMMERSIVE SCENIC VISUAL STAGE + FLOATING URN + SWATCH BAR */}
                  <div
                    className="kmb-vt-stage"
                    onClick={() => navigate(`/product/${activeSwatch.slug}`)}
                  >
                    <img
                      src={col.sceneBg}
                      alt={col.envTag}
                      className="kmb-vt-scene-bg"
                      loading="lazy"
                    />
                    <div className="kmb-vt-scene-overlay" />

                    {/* Top Floating Pills (Environment + Price) */}
                    <div className="kmb-vt-top-bar">
                      <span className="kmb-vt-env-pill">{col.envTag}</span>
                      <span className="kmb-vt-price-pill">
                        ${Number(displayPrice).toFixed(2)}
                        {col.originalPrice && !activeSwatch.priceOverride && (
                          <s>${Number(col.originalPrice).toFixed(2)}</s>
                        )}
                      </span>
                    </div>

                    {/* Floating Studio Cutout Urn */}
                    <div className="kmb-vt-urn-center">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeSwatch.img}
                          src={activeSwatch.img}
                          alt={activeSwatch.name}
                          initial={{ opacity: 0, scale: 0.88, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.92, y: -6 }}
                          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                          className="kmb-vt-urn-img"
                        />
                      </AnimatePresence>
                    </div>

                    {/* Interactive Band Color Swatch Bar inside Stage */}
                    <div
                      className="kmb-vt-swatch-bar"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="kmb-vt-dots">
                        {col.swatches.map((sw, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() =>
                              setCompSwatchIdx((prev) => ({
                                ...prev,
                                [col.key]: sIdx,
                              }))
                            }
                            className={`kmb-vt-dot ${
                              activeIdx === sIdx ? 'active' : ''
                            }`}
                            style={{ backgroundColor: sw.hex }}
                            title={sw.label}
                            aria-label={sw.label}
                          />
                        ))}
                      </div>
                      <span className="kmb-vt-swatch-label">
                        {activeSwatch.label}
                      </span>
                    </div>
                  </div>

                  {/* BOTTOM 30%: ULTRA-MINIMAL FOOTER (Title + 3 Visual Chips + Buy CTA) */}
                  <div className="kmb-vt-footer">
                    <div className="kmb-vt-title-row">
                      <h3
                        className="kmb-vt-title"
                        onClick={() => navigate(`/product/${activeSwatch.slug}`)}
                      >
                        {col.title}
                      </h3>
                      <span className="kmb-vt-badge">{col.badge}</span>
                    </div>

                    <div className="kmb-vt-chips-row">
                      {col.chips.map((ch, idx) => (
                        <span key={idx} className="kmb-vt-chip">
                          {ch}
                        </span>
                      ))}
                    </div>

                    <div className="kmb-vt-cta-row">
                      <button
                        type="button"
                        onClick={() =>
                          handleDirectBuy({
                            ...activeSwatch,
                            price: displayPrice,
                          })
                        }
                        className={`kmb-pill-cta-solid kmb-vt-buy-btn ${
                          addedProductId === activeSwatch.slug ? 'added' : ''
                        }`}
                      >
                        {addedProductId === activeSwatch.slug
                          ? '✓ Añadido al carrito'
                          : `Comprar — $${Number(displayPrice).toFixed(2)}`}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/product/${activeSwatch.slug}`)}
                        className="kmb-vt-detail-btn"
                        title="Ver producto"
                        aria-label="Ver detalles del producto"
                      >
                        ↗
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. CARRUSEL DE PRODUCTOS SPRING — VISUAL-FIRST CARDS
         ===================================================================== */}
      <section className="kmb-carousel-section" id="catalogo">
        <div className="kmb-container">
          <div className="kmb-carousel-header">
            <h2 className="kmb-carousel-title">Toda la colección.</h2>

            <div className="kmb-carousel-controls-row">
              <div className="kmb-carousel-filters">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'urns', label: 'Urnas ($76.50 – $90)' },
                  { id: 'minis', label: 'Mini Sets ($49.99)' },
                  { id: 'bags', label: 'Bags ($12.99)' },
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
              <div className="kmb-carousel-loading">Cargando colección...</div>
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
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        duration: 0.5,
                        delay: idx * 0.04,
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
                          src={CLEAN_URN_CUTOUTS[prod.slug] || prod.images?.[0]}
                          alt={prod.name}
                          className="kmb-prod-img"
                          draggable={false}
                          loading="lazy"
                        />
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <span className="kmb-prod-sale-pill">15% OFF</span>
                        )}
                      </div>

                      <div className="kmb-prod-body">
                        <span className="kmb-prod-color-name">
                          {prod.variants?.length > 0
                            ? `${prod.variants.length} bandas disponibles`
                            : prod.category === 'minis'
                            ? 'Set Familiar'
                            : 'Pack × 2'}
                        </span>

                        <h3
                          className="kmb-prod-title"
                          onClick={() => {
                            if (!isDraggingCarousel) navigate(`/product/${prod.slug}`);
                          }}
                        >
                          {prod.name}
                        </h3>

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
                              addedProductId === prod.slug || addedProductId === prod.id
                                ? 'added'
                                : ''
                            }`}
                          >
                            {addedProductId === prod.slug || addedProductId === prod.id
                              ? '✓ Añadido'
                              : 'Comprar'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

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
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          5. SECCIÓN DE RESEÑAS — POLAROID LINE CAROUSEL A ANCHO COMPLETO
         ===================================================================== */}
      <section className="kmb-reviews-section" id="resenas">
        <div className="kmb-container">
          <div className="kmb-section-intro kmb-reviews-intro">
            <div className="kmb-rating-pill">
              <span className="kmb-stars">★★★★★</span>
              <span>4.9 / 5 • Familias Kamibi</span>
            </div>
            <h2 className="kmb-section-heading">Recuerdos que permanecen.</h2>
          </div>
        </div>

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
      </section>

      {/* =====================================================================
          6. MODAL COMPACTO "CÓMO FUNCIONA"
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

              <div className="kmb-modal-body">
                <span className="kmb-section-eyebrow">EL RITUAL KAMIBI</span>
                <h3 className="kmb-modal-title">Tres pasos simples.</h3>

                <div className="kmb-modal-steps">
                  <div className="kmb-modal-step">
                    <span className="kmb-step-num">01</span>
                    <div>
                      <h4>Mensajes de despedida</h4>
                      <p>
                        Escribe tus palabras en las hojas biodegradables con el lápiz compostable incluido y colócalas junto a las cenizas.
                      </p>
                    </div>
                  </div>
                  <div className="kmb-modal-step">
                    <span className="kmb-step-num">02</span>
                    <div>
                      <h4>Ceremonia en Agua o Tierra</h4>
                      <p>
                        Deposita la urna en el mar, lago o jardín natural.
                      </p>
                    </div>
                  </div>
                  <div className="kmb-modal-step">
                    <span className="kmb-step-num">03</span>
                    <div>
                      <h4>Reintegración 100% orgánica</h4>
                      <p>
                        Se funde con la naturaleza sin plásticos, pegamentos ni metales.
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
                    className="kmb-pill-cta-solid"
                  >
                    Elegir mi Kamibi
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UrnaBiodegradableLanding;
