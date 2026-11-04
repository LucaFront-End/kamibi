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

export const UrnaBiodegradableLanding = ({
  cmsLanding = null,
  zoneSlug = null,
  fallbackZoneTitle = '',
}) => {
  const { locale } = useTranslation();
  const isEs = locale === 'es';
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useWixProducts();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [zoneSlug]);

  const dynamicSeoTitleEs =
    cmsLanding?.seoTitle ||
    cmsLanding?.pageTitle ||
    (fallbackZoneTitle
      ? `${fallbackZoneTitle} | Urnas Biodegradables Kamibi®`
      : 'Urnas Biodegradables Kamibi® — Regresa a la Naturaleza. Nada Menos.');
  const dynamicSeoTitleEn =
    cmsLanding?.seoTitle ||
    cmsLanding?.pageTitle ||
    (fallbackZoneTitle
      ? `${fallbackZoneTitle} | Kamibi® Biodegradable Urns`
      : 'Kamibi® Biodegradable Urns — Return to Nature. Nothing Less.');
  const dynamicSeoDescEs =
    cmsLanding?.seoDescription ||
    cmsLanding?.excerpt ||
    'Urnas biodegradables 100% orgánicas para agua y tierra. Desde $49.99 y $76.50 USD con envío gratis.';
  const dynamicSeoDescEn =
    cmsLanding?.seoDescription ||
    cmsLanding?.excerpt ||
    '100% organic biodegradable urns for water and earth ceremonies.';

  // Strictly NOINDEX, NOFOLLOW for Ads landings (with canonical if under /zonas/:slug)
  useSEO({
    titleEs: dynamicSeoTitleEs,
    titleEn: dynamicSeoTitleEn,
    descEs: dynamicSeoDescEs,
    descEn: dynamicSeoDescEn,
    canonical: zoneSlug ? `https://kamibistore.com/zonas/${zoneSlug}` : undefined,
    locale,
    noindex: true,
  });

  // Interactive visual states
  const [heroPair, setHeroPair] = useState('urns'); // 'urns' | 'earth' | 'minis'
  const [hoveredHeroUrn, setHoveredHeroUrn] = useState(null); // 'left' | 'right' | null
  const [cardBioMode, setCardBioMode] = useState('water'); // 'water' | 'earth'
  const [activeBandIdx, setActiveBandIdx] = useState(0);
  const [activeIncludedIdx, setActiveIncludedIdx] = useState(0); // Sticky Card 3 active kit item (0..4)
  const [processEnvMode, setProcessEnvMode] = useState('water'); // 'water' | 'earth' for Horizontal Process Scroll
  const [carouselCategory, setCarouselCategory] = useState('all');
  const [activeModal, setActiveModal] = useState(null); // 'how-it-works' | 'materials' | null
  const [addedProductId, setAddedProductId] = useState(null);
  const [compSwatchIdx, setCompSwatchIdx] = useState({
    col1: 0,
    col2: 0,
    col3: 0,
  });
  // Per-card variant selection inside the #catalogo carousel
  const [carouselVariantMap, setCarouselVariantMap] = useState({});

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

  // Exact Wix variant choice corresponding to each CLEAN_URN_CUTOUTS default studio render
  const CLEAN_URN_DEFAULT_VARIANT = {
    'flore-urns': 'TURTLE',
    'aqua-urn': 'GOLD',
    'iris-urn': 'PINK',
    'terra-urn': 'PURPLE',
    'angel-urn': 'GOLD',
  };

  // Color hex map for Wix variant choice labels
  const VARIANT_HEX_MAP = {
    'GOLD': '#C4A97D',
    'GINKGO GOLD': '#D4B475',
    'GINKGO GLOD': '#D4B475',
    'GINKO GOLD': '#D4B475',
    'GINKGO': '#E5A9A9',
    'GINKO': '#E5A9A9',
    'TURTLE': '#2B9EB3',
    'OCEAN': '#5B9AA9',
    'SOFT BLUE': '#8BB8C9',
    'DEEP BLUE': '#1C7C9C',
    'PINK': '#E08FA3',
    'SOFT PINK': '#E8BBC5',
    'PURPLE': '#9B84B3',
  };

  // Hero Dual-Product Visual Pairs with Hover Detail Metadata + Real Wix Variant Linking
  const heroVisualPairs = {
    urns: {
      label: isEs ? 'Agua & Mar' : 'Water & Sea',
      caption: isEs
        ? 'Pasa el cursor sobre cada urna para ver sus detalles'
        : 'Hover over each urn to explore its details',
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
        variantChoice: 'GOLD',
        variantId: '4e430585-a945-4f93-a893-4d89e63e35bf',
        name: 'Kamibi Aqua',
        band: isEs ? 'Banda Golden Leaf (GOLD)' : 'Golden Leaf Band (GOLD)',
        hex: '#C4A97D',
        price: 76.5,
        oldPrice: 90.0,
        chips: isEs
          ? ['Flotación + Mar', '14" × 12" × 3"', 'Cabina TSA']
          : ['Sea Floatation', '14" × 12" × 3"', 'TSA Carry-On'],
      },
      rightDetail: {
        id: 'f9c09eac-dee0-50ec-1fd8-e591754fdb0a',
        slug: 'flore-urns',
        variantChoice: 'TURTLE',
        variantId: '69dda58d-b0fd-46b2-a287-0e8abe362c73',
        name: 'Kamibi Flore',
        band: isEs ? 'Banda Turtle Floral (TURTLE)' : 'Turtle Floral Band (TURTLE)',
        hex: '#2B9EB3',
        price: 76.5,
        oldPrice: 90.0,
        chips: isEs
          ? ['Agua & Tierra', 'Pétalos Reales', 'Kit Ritual']
          : ['Water & Earth', 'Real Petals', 'Ritual Kit'],
      },
    },
    earth: {
      label: isEs ? 'Tierra & Bosque' : 'Earth & Forest',
      caption: isEs
        ? 'Pasa el cursor sobre cada urna para ver sus detalles'
        : 'Hover over each urn to explore its details',
      slug: 'terra-urn',
      leftImg:
        'https://static.wixstatic.com/media/45119e_277f4849b55642b1a9c570a911f20d37~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png',
      rightImg:
        'https://static.wixstatic.com/media/45119e_4515ed8dce4f4ea28b7bfeb68eac9066~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
      leftName: 'Kamibi Terra (Botanical)',
      rightName: 'Kamibi Iris (Pink)',
      leftDetail: {
        id: 'b4fd86df-d446-0993-f324-d5d13eface16',
        slug: 'terra-urn',
        variantChoice: 'PURPLE',
        variantId: '4be466fd-4b58-496e-aaee-04274dfa7d7f',
        name: 'Kamibi Terra',
        band: isEs ? 'Banda Botánica (PURPLE)' : 'Botanical Band (PURPLE)',
        hex: '#8B9E8B',
        price: 90.0,
        oldPrice: null,
        chips: isEs
          ? ['Suelo 2–4 sem', 'Fibras Puras', 'Nutre Raíces']
          : ['Soil 2–4 wks', 'Pure Fibers', 'Nourishes Roots'],
      },
      rightDetail: {
        id: '4d9511b1-1f04-1057-e379-1d7f2030933c',
        slug: 'iris-urn',
        variantChoice: 'PINK',
        variantId: 'be0fed5b-d2e4-4752-b154-d05c5374b127',
        name: 'Kamibi Iris',
        band: isEs ? 'Banda Sakura Rose (PINK)' : 'Sakura Rose Band (PINK)',
        hex: '#E08FA3',
        price: 76.5,
        oldPrice: 90.0,
        chips: isEs
          ? ['Tierra & Agua', '100% Orgánica', 'Cabina TSA']
          : ['Earth & Water', '100% Organic', 'TSA Carry-On'],
      },
    },
    minis: {
      label: isEs ? 'Mini Sets (×4)' : 'Mini Sets (×4)',
      caption: isEs
        ? 'Pasa el cursor sobre cada set para ver sus detalles'
        : 'Hover over each set to explore its details',
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
        variantChoice: null,
        variantId: '00000000-0000-0000-0000-000000000000',
        name: 'Mini Set Flore',
        band: isEs ? 'Set Familiar × 4 Urnas' : 'Family Sharing Set × 4 Urns',
        hex: '#8B9E8B',
        price: 49.99,
        oldPrice: null,
        chips: isEs
          ? ['4 Mini Urnas', 'Para Compartir', 'Kit Incluido']
          : ['4 Mini Urns', 'For Sharing', 'Kit Included'],
      },
      rightDetail: {
        id: '25f910fe-08a8-3004-4b99-579d88e4e240',
        slug: 'mini-urn-set-ocean-biodegradables',
        variantChoice: null,
        variantId: '00000000-0000-0000-0000-000000000000',
        name: 'Mini Set Ocean',
        band: isEs ? 'Set Marino × 4 Urnas' : 'Ocean Sharing Set × 4 Urns',
        hex: '#7BA7B5',
        price: 49.99,
        oldPrice: null,
        chips: isEs
          ? ['4 Mini Urnas', 'Agua y Tierra', 'Cabina TSA']
          : ['4 Mini Urns', 'Water & Earth', 'TSA Carry-On'],
      },
    },
  };

  const activeHero = heroVisualPairs[heroPair];

  // Card 2 Interactive Band Showcase (100% Pure Clean Urn Cutouts + Exact Variant Linking)
  const bandShowcase = [
    {
      name: isEs ? 'Botánica Purple' : 'Botanical Purple',
      model: 'Terra Urn • $90.00 USD',
      slug: 'terra-urn',
      variantChoice: 'PURPLE',
      variantId: '4be466fd-4b58-496e-aaee-04274dfa7d7f',
      hex: '#8B9E8B',
      img: 'https://static.wixstatic.com/media/45119e_277f4849b55642b1a9c570a911f20d37~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png',
    },
    {
      name: 'Turtle Floral',
      model: 'Flore Urn • $76.50 USD',
      slug: 'flore-urns',
      variantChoice: 'TURTLE',
      variantId: '69dda58d-b0fd-46b2-a287-0e8abe362c73',
      hex: '#2B9EB3',
      img: 'https://static.wixstatic.com/media/45119e_44f8f91ccd1b439098bf5760374cc702~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
    },
    {
      name: 'Golden Leaf',
      model: 'Aqua Urn • $76.50 USD',
      slug: 'aqua-urn',
      variantChoice: 'GOLD',
      variantId: '4e430585-a945-4f93-a893-4d89e63e35bf',
      hex: '#C4A97D',
      img: 'https://static.wixstatic.com/media/45119e_48478600018f46ffb3f1ac569e733471~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
    },
    {
      name: isEs ? 'Sakura Rose (Pink)' : 'Sakura Rose (Pink)',
      model: 'Iris Urn • $76.50 USD',
      slug: 'iris-urn',
      variantChoice: 'PINK',
      variantId: 'be0fed5b-d2e4-4752-b154-d05c5374b127',
      hex: '#E08FA3',
      img: 'https://static.wixstatic.com/media/45119e_4515ed8dce4f4ea28b7bfeb68eac9066~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
    },
    {
      name: 'Deep Blue',
      model: 'Aqua Urn • $76.50 USD',
      slug: 'aqua-urn',
      variantChoice: 'DEEP BLUE',
      variantId: '173b161b-7848-42a7-abbb-3027a177af5c',
      hex: '#1C7C9C',
      img: 'https://static.wixstatic.com/media/45119e_5d507d8460784c628298d2c49edaac3e~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
    },
    {
      name: 'Angel Gold',
      model: 'Angel Urn • $90.00 USD',
      slug: 'angel-urn',
      variantChoice: 'GOLD',
      variantId: '743614c3-9a2a-41d0-95b7-7ac74c23cc58',
      hex: '#D4BC94',
      img: 'https://static.wixstatic.com/media/45119e_6fee7c273f3f487aba1e9f9e8aee9a72~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
    },
  ];

  // Sculptural Editorial 3-Product Showcase Cards (Organic Studio Pedestal + Delicate Botanical SVG + Architectural Spec Strip)
  const appleComparisonCols = [
    {
      key: 'col1',
      indexNum: '01',
      envTag: isEs ? 'Agua & Mar' : 'Water & Sea',
      theme: 'water',
      badge: '−15% OFF',
      subtitle: isEs
        ? 'Inmersión serena en mar, río o lago y entierro orgánico'
        : 'Serene immersion in ocean, river, or lake and organic burial',
      price: 76.5,
      originalPrice: 90.0,
      specs: [
        { val: '3–5 min', label: isEs ? 'Biodegradación' : 'Water Dissolution' },
        { val: '220 in³', label: isEs ? 'Capacidad Adulto' : 'Adult Capacity' },
        { val: isEs ? 'Cabina OK' : 'Carry-On', label: isEs ? 'Vuelo TSA' : 'TSA Approved' },
      ],
      swatches: [
        {
          label: 'Aqua Gold',
          modelTitle: 'Kamibi Aqua',
          editionSub: isEs
            ? 'Banda Gold · Agua y Tierra'
            : 'Gold Band · Water & Earth',
          hex: '#C4A97D',
          slug: 'aqua-urn',
          id: '4d71b043-1af4-8fa4-4a2c-c30289462282',
          variantChoice: 'GOLD',
          variantId: '4e430585-a945-4f93-a893-4d89e63e35bf',
          name: 'AQUA BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_48478600018f46ffb3f1ac569e733471~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Flore Turtle',
          modelTitle: 'Kamibi Flore',
          editionSub: isEs
            ? 'Banda Turtle · Agua y Tierra'
            : 'Turtle Band · Water & Earth',
          hex: '#2B9EB3',
          slug: 'flore-urns',
          id: 'f9c09eac-dee0-50ec-1fd8-e591754fdb0a',
          variantChoice: 'TURTLE',
          variantId: '69dda58d-b0fd-46b2-a287-0e8abe362c73',
          name: 'FLORE BIODEGRADABLE URNS',
          img: 'https://static.wixstatic.com/media/45119e_44f8f91ccd1b439098bf5760374cc702~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Iris Pink',
          modelTitle: 'Kamibi Iris',
          editionSub: isEs
            ? 'Banda Rosa (Pink) · Agua y Tierra'
            : 'Pink Band · Water & Earth',
          hex: '#E08FA3',
          slug: 'iris-urn',
          id: '4d9511b1-1f04-1057-e379-1d7f2030933c',
          variantChoice: 'PINK',
          variantId: 'be0fed5b-d2e4-4752-b154-d05c5374b127',
          name: 'IRIS BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_4515ed8dce4f4ea28b7bfeb68eac9066~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Aqua Soft Pink',
          modelTitle: 'Kamibi Aqua',
          editionSub: isEs
            ? 'Banda Rosa Suave (Soft Pink) · Agua y Tierra'
            : 'Soft Pink Band · Water & Earth',
          hex: '#E8BBC5',
          slug: 'aqua-urn',
          id: '4d71b043-1af4-8fa4-4a2c-c30289462282',
          variantChoice: 'SOFT PINK',
          variantId: 'e869e857-d2dd-40c8-a4f5-49cad8a901bd',
          name: 'AQUA BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_45fcd46337e3476c95debccbd733f914~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Aqua Deep Blue',
          modelTitle: 'Kamibi Aqua',
          editionSub: isEs
            ? 'Banda Deep Blue · Agua y Tierra'
            : 'Deep Blue Band · Water & Earth',
          hex: '#1C7C9C',
          slug: 'aqua-urn',
          id: '4d71b043-1af4-8fa4-4a2c-c30289462282',
          variantChoice: 'DEEP BLUE',
          variantId: '173b161b-7848-42a7-abbb-3027a177af5c',
          name: 'AQUA BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_5d507d8460784c628298d2c49edaac3e~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Iris Ginkgo',
          modelTitle: 'Kamibi Iris',
          editionSub: isEs
            ? 'Banda Ginkgo · Agua y Tierra'
            : 'Ginkgo Band · Water & Earth',
          hex: '#D8A384',
          slug: 'iris-urn',
          id: '4d9511b1-1f04-1057-e379-1d7f2030933c',
          variantChoice: 'GINKGO',
          variantId: '9029f582-f02a-4b91-9e04-192bf4641ec1',
          name: 'IRIS BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_30cc2647cbfa4613b55c9c180bd8be22~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
      ],
    },
    {
      key: 'col2',
      indexNum: '02',
      envTag: isEs ? 'Tierra & Bosque' : 'Earth & Forest',
      theme: 'earth',
      badge: isEs ? '10 Bandas' : '10 Bands',
      subtitle: isEs
        ? 'Fibras botánicas prensadas a mano para jardín o bosque'
        : 'Hand-pressed botanical fibers for forest or garden burial',
      price: 90.0,
      originalPrice: null,
      specs: [
        { val: isEs ? '2–4 sem' : '2–4 wks', label: isEs ? 'Integración Suelo' : 'Soil Return' },
        { val: '220 in³', label: isEs ? 'Capacidad Adulto' : 'Adult Capacity' },
        { val: isEs ? 'Cabina OK' : 'Carry-On', label: isEs ? 'Vuelo TSA' : 'TSA Approved' },
      ],
      swatches: [
        {
          label: 'Terra Botanical',
          modelTitle: 'Kamibi Terra',
          editionSub: isEs
            ? 'Banda Botánica (Purple) · Tierra y Bosque'
            : 'Botanical Band (Purple) · Earth & Forest',
          hex: '#8B9E8B',
          slug: 'terra-urn',
          id: 'b4fd86df-d446-0993-f324-d5d13eface16',
          variantChoice: 'PURPLE',
          variantId: '4be466fd-4b58-496e-aaee-04274dfa7d7f',
          name: 'TERRA BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_277f4849b55642b1a9c570a911f20d37~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png',
        },
        {
          label: 'Angel Gold',
          modelTitle: 'Kamibi Angel',
          editionSub: isEs
            ? 'Banda Gold · Tierra y Agua'
            : 'Gold Band · Earth & Water',
          hex: '#D4BC94',
          slug: 'angel-urn',
          id: 'a09f394c-67bf-476b-f1a9-e3d576ce6505',
          variantChoice: 'GOLD',
          variantId: '743614c3-9a2a-41d0-95b7-7ac74c23cc58',
          name: 'ANGEL BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_6fee7c273f3f487aba1e9f9e8aee9a72~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Angel Ocean',
          modelTitle: 'Kamibi Angel',
          editionSub: isEs
            ? 'Banda Ocean · Tierra y Agua'
            : 'Ocean Band · Earth & Water',
          hex: '#7BA7B5',
          slug: 'angel-urn',
          id: 'a09f394c-67bf-476b-f1a9-e3d576ce6505',
          variantChoice: 'OCEAN',
          variantId: '3603a353-e46e-43c5-a70c-58c582d56ebb',
          name: 'ANGEL BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_055fa3d6159a47a8b60de621c43b90e1~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Angel Soft Pink',
          modelTitle: 'Kamibi Angel',
          editionSub: isEs
            ? 'Banda Rosa Suave (Soft Pink) · Tierra y Agua'
            : 'Soft Pink Band · Earth & Water',
          hex: '#E8BBC5',
          slug: 'angel-urn',
          id: 'a09f394c-67bf-476b-f1a9-e3d576ce6505',
          variantChoice: 'SOFT PINK',
          variantId: '07131476-b57f-47b2-a262-d92835940506',
          name: 'ANGEL BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_8d3df7b505f7458a98c95c0fc4ea293e~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Angel Pink',
          modelTitle: 'Kamibi Angel',
          editionSub: isEs
            ? 'Banda Rosa (Pink) · Tierra y Agua'
            : 'Pink Band · Earth & Water',
          hex: '#E06088',
          slug: 'angel-urn',
          id: 'a09f394c-67bf-476b-f1a9-e3d576ce6505',
          variantChoice: 'PINK',
          variantId: 'a4f1d078-18fc-429b-96d1-9099f08bf484',
          name: 'ANGEL BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_0b3c807faff94f52b37dc194dff7c837~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Angel Deep Blue',
          modelTitle: 'Kamibi Angel',
          editionSub: isEs
            ? 'Banda Deep Blue · Tierra y Agua'
            : 'Deep Blue Band · Earth & Water',
          hex: '#1C7C9C',
          slug: 'angel-urn',
          id: 'a09f394c-67bf-476b-f1a9-e3d576ce6505',
          variantChoice: 'DEEP BLUE',
          variantId: '63db2879-3485-44bd-ad5d-64fbde59d2fc',
          name: 'ANGEL BIODEGRADABLE URN',
          img: 'https://static.wixstatic.com/media/45119e_06646d5f8f6c4200aa02c9052fe7b168~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
      ],
    },
    {
      key: 'col3',
      indexNum: '03',
      envTag: isEs ? 'Set Familiar ×4' : 'Family Set ×4',
      theme: 'minis',
      badge: isEs ? 'Compartir' : 'Sharing',
      subtitle: isEs
        ? 'Sets de 4 mini urnas individuales para compartir el homenaje'
        : 'Sets of 4 individual mini urns to share the tribute with family',
      price: 49.99,
      originalPrice: null,
      specs: [
        { val: 'Pack ×4', label: isEs ? 'Para Compartir' : 'Sharing Set' },
        { val: '4 × 55 in³', label: isEs ? 'Capacidad Set' : 'Set Capacity' },
        { val: isEs ? 'Cabina OK' : 'Carry-On', label: isEs ? 'Vuelo TSA' : 'TSA Approved' },
      ],
      swatches: [
        {
          label: 'Mini Set Flore (×4)',
          modelTitle: 'Kamibi Mini Set',
          editionSub: isEs
            ? 'Edición Flore · 4 Mini Urnas Orgánicas'
            : 'Flore Edition · 4 Organic Mini Urns',
          hex: '#8B9E8B',
          slug: 'mini-biodegradables-urn-set',
          id: 'f843aff9-c2d4-5a9f-a272-9fddf64c68e5',
          variantChoice: null,
          variantId: '00000000-0000-0000-0000-000000000000',
          name: 'MINI URN SET FLORE BIODEGRADABLES',
          priceOverride: 49.99,
          img: 'https://static.wixstatic.com/media/45119e_d62bb5591c674265a6deee5eb3fa4985~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Mini Set Ocean (×4)',
          modelTitle: 'Kamibi Mini Ocean',
          editionSub: isEs
            ? 'Edición Ocean · 4 Mini Urnas Agua y Tierra'
            : 'Ocean Edition · 4 Water & Earth Mini Urns',
          hex: '#7BA7B5',
          slug: 'mini-urn-set-ocean-biodegradables',
          id: '25f910fe-08a8-3004-4b99-579d88e4e240',
          variantChoice: null,
          variantId: '00000000-0000-0000-0000-000000000000',
          name: 'MINI URN SET OCEAN BIODEGRADABLES',
          priceOverride: 49.99,
          img: 'https://static.wixstatic.com/media/45119e_b29071730d57411e80628960675d4a04~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
        },
        {
          label: 'Tree of Life Bags (×2)',
          modelTitle: 'Kamibi Ash Bags',
          editionSub: isEs
            ? 'Pack ×2 Bolsas Solubles · Árbol de la Vida'
            : 'Pack ×2 Water-Soluble Bags · Tree of Life',
          hex: '#C49A6C',
          slug: 'cremation-burial-bags-tree-of-life-design-pack-of-2',
          id: 'f1d9e4d3-6ad7-70e4-cb1a-3e2999ae3818',
          variantChoice: null,
          variantId: '00000000-0000-0000-0000-000000000000',
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

  // =========================================================================
  // HORIZONTAL SCROLL USAGE PROCESS LOGIC (WATER & EARTH STEPS)
  // =========================================================================
  const procViewportRef = useRef(null);
  const procTrackRef = useRef(null);
  const [procMaxScroll, setProcMaxScroll] = useState(0);
  const [procProgress, setProcProgress] = useState(0);
  const [isDraggingProc, setIsDraggingProc] = useState(false);

  const procTargetX = useMotionValue(0);
  const procSmoothX = useSpring(procTargetX, {
    stiffness: 90,
    damping: 22,
    mass: 0.75,
    restDelta: 0.5,
  });

  const updateProcBounds = useCallback(() => {
    if (!procViewportRef.current || !procTrackRef.current) return;
    const vw = procViewportRef.current.clientWidth;
    const tw = procTrackRef.current.scrollWidth;
    const max = Math.max(0, tw - vw);
    setProcMaxScroll(max);
    const current = Math.max(-max, Math.min(0, procTargetX.get()));
    procTargetX.set(current);
  }, [procTargetX]);

  useEffect(() => {
    updateProcBounds();
    window.addEventListener('resize', updateProcBounds);
    return () => window.removeEventListener('resize', updateProcBounds);
  }, [updateProcBounds, processEnvMode]);

  useEffect(() => {
    procTargetX.set(0);
  }, [processEnvMode, procTargetX]);

  useEffect(() => {
    const unsubscribe = procSmoothX.on('change', (val) => {
      if (procMaxScroll <= 0) {
        setProcProgress(0);
      } else {
        setProcProgress(Math.min(1, Math.max(0, -val / procMaxScroll)));
      }
    });
    return () => unsubscribe();
  }, [procSmoothX, procMaxScroll]);

  const slideProcessBy = (dir) => {
    const stepPx = 370;
    const next = Math.max(
      -procMaxScroll,
      Math.min(0, procTargetX.get() - dir * stepPx)
    );
    procTargetX.set(next);
  };

  const procDragInfo = useRef({
    active: false,
    startX: 0,
    startTarget: 0,
    moved: false,
  });

  const handleProcPointerDown = (e) => {
    if (e.target.closest('button')) return;
    procDragInfo.current = {
      active: true,
      startX: e.clientX,
      startTarget: procSmoothX.get(),
      moved: false,
    };
  };

  const handleProcPointerMove = (e) => {
    if (!procDragInfo.current.active) return;
    const dx = e.clientX - procDragInfo.current.startX;
    if (!procDragInfo.current.moved && Math.abs(dx) > 6) {
      procDragInfo.current.moved = true;
      setIsDraggingProc(true);
    }
    if (!procDragInfo.current.moved) return;
    let next = procDragInfo.current.startTarget + dx * 1.15;
    if (next > 0) next *= 0.28;
    if (next < -procMaxScroll) next = -procMaxScroll + (next + procMaxScroll) * 0.28;
    procTargetX.set(next);
  };

  const handleProcPointerUp = () => {
    if (!procDragInfo.current.active) return;
    procDragInfo.current.active = false;
    setTimeout(() => setIsDraggingProc(false), 60);
    procTargetX.set(Math.max(-procMaxScroll, Math.min(0, procTargetX.get())));
  };

  // =========================================================================
  // STICKY CARD 3 DATA: "KAMIBI TODO INCLUIDO" (REAL + HAND-DRAWN SKETCH)
  // =========================================================================
  const kitIncludedItems = [
    {
      id: 'urn',
      icon: '🌿',
      shortTag: isEs ? 'Urna Orgánica' : 'Organic Urn',
      title: isEs
        ? 'Urna biodegradable con diseño personalizado.'
        : 'Biodegradable urn with custom botanical design.',
      detail: isEs
        ? 'Moldeada artesanalmente con fibras vegetales 100% libres de químicos ni metales.'
        : 'Handcrafted from 100% plant fibers with zero chemicals or metals.',
      realImg:
        'https://static.wixstatic.com/media/45119e_48478600018f46ffb3f1ac569e733471~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
      imgClass: 'kmb-kit-img--urn',
    },
    {
      id: 'sleeve',
      icon: '🌸',
      shortTag: isEs ? 'Celosía de Soya' : 'Soy Ink Sleeve',
      title: isEs
        ? 'Celosías decorativas impresas con tinta de soya biodegradable.'
        : 'Decorative lattice sleeves printed with biodegradable soy ink.',
      detail: isEs
        ? 'Bandas botánicas acuareladas a mano con pigmentos vegetales de soya.'
        : 'Hand-watercolored botanical bands printed with natural soy pigments.',
      realImg:
        'https://static.wixstatic.com/media/45119e_44f8f91ccd1b439098bf5760374cc702~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
      imgClass: 'kmb-kit-img--sleeve',
    },
    {
      id: 'bag',
      icon: '💧',
      shortTag: isEs ? 'Bolsa Soluble' : 'Water-Soluble Bag',
      title: isEs
        ? 'Bolsa biodegradable para cenizas, soluble en agua.'
        : 'Biodegradable ash bag, 100% water-soluble.',
      detail: isEs
        ? 'Protege las cenizas en el traslado y se disuelve suavemente al contacto con el agua o suelo.'
        : 'Secures the ashes during transport and gently dissolves upon contact with water or soil.',
      realImg:
        'https://static.wixstatic.com/media/45119e_b515104a49a642a1945b922955493527~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png',
      imgClass: 'kmb-kit-img--bag',
    },
    {
      id: 'cards',
      icon: '✉️',
      shortTag: isEs ? 'Hojas de Despedida' : 'Farewell Note Cards',
      title: isEs
        ? 'Hojas biodegradables para escribir mensajes de despedida.'
        : 'Biodegradable note cards to write farewell messages.',
      detail: isEs
        ? 'Tarjetas de papel de algodón orgánico atadas con cordel de yute natural.'
        : 'Organic cotton paper note cards tied with natural jute twine.',
      realImg:
        'https://static.wixstatic.com/media/45119e_7a1c94ae780545e5a741810a8d7df6a2~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
      imgClass: 'kmb-kit-img--cards',
    },
    {
      id: 'pen',
      icon: '🖊️',
      shortTag: isEs ? 'Pluma de Soya' : 'Soy Ink Pen',
      title: isEs
        ? 'Plumas con tinta de soya para dedicar palabras especiales.'
        : 'Soy-based ink pen to dedicate special words.',
      detail: isEs
        ? 'Cuerpo de papel kraft biodegradable y tinta ecológica de soya para tus cartas.'
        : 'Biodegradable kraft barrel and eco-friendly soy ink for heartfelt letters.',
      realImg:
        'https://static.wixstatic.com/media/45119e_dfef8b5f5c2f4fffa54a24ab1bc0916d~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
      imgClass: 'kmb-kit-img--pen',
    },
  ];

  // =========================================================================
  // HORIZONTAL PROCESS STEPS DATA (IMG2: REAL PRODUCT + HAND-DRAWN HANDS)
  // =========================================================================
  const activeModeUrnImg =
    processEnvMode === 'water'
      ? 'https://static.wixstatic.com/media/45119e_44f8f91ccd1b439098bf5760374cc702~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png'
      : 'https://static.wixstatic.com/media/45119e_277f4849b55642b1a9c570a911f20d37~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png';

  const activeModeKitImg =
    processEnvMode === 'water'
      ? 'https://static.wixstatic.com/media/45119e_dfef8b5f5c2f4fffa54a24ab1bc0916d~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png'
      : 'https://static.wixstatic.com/media/45119e_7a1c94ae780545e5a741810a8d7df6a2~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png';

  const usageProcessSteps = [
    {
      step: '01',
      sketchKey: 'step1-sleeve',
      phase: isEs ? 'Preparación' : 'Preparation',
      title: isEs ? 'Retira la celosía con cuidado' : 'Carefully remove the sleeve',
      desc: isEs
        ? 'Desliza suavemente la celosía decorativa de tu urna Kamibi™ y apártala sobre una superficie plana.'
        : 'Gently slide the decorative lattice sleeve off your Kamibi™ Urn and set it aside on a flat surface.',
      realImg: activeModeUrnImg,
      imgMode: 'urn-tilt',
    },
    {
      step: '02',
      sketchKey: 'step2-open',
      phase: isEs ? 'El Kit Ritual' : 'The Ritual Kit',
      title: isEs ? 'Abre la urna y saca las hojas y pluma' : 'Open the urn & remove cards and pen',
      desc: isEs
        ? 'Abre la urna Kamibi™ y retira las hojas biodegradables, la pluma de tinta de soya y la bolsa soluble.'
        : 'Open the Kamibi™ Urn and remove the biodegradable note cards, soy pen, and water-soluble bag.',
      realImg: activeModeKitImg,
      imgMode: 'kit-full',
    },
    {
      step: '03',
      sketchKey: 'step3-ashes',
      phase: isEs ? 'Interior' : 'Interior',
      title: isEs ? 'Deposita las cenizas con suavidad' : 'Carefully place the ashes inside',
      desc: isEs
        ? 'Coloca las cenizas dentro de la bolsa biodegradable hidrosoluble (o directamente) en el interior de la urna.'
        : 'Carefully pour the ashes into the water-soluble biodegradable bag (or directly) inside the Urn.',
      realImg:
        'https://static.wixstatic.com/media/45119e_b515104a49a642a1945b922955493527~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png',
      secondaryImg: activeModeUrnImg,
      imgMode: 'bag-into-urn',
    },
    {
      step: '04',
      sketchKey: 'step4-notes',
      phase: isEs ? 'Homenaje' : 'Tribute',
      title: isEs ? 'Escribe tus mensajes de despedida' : 'Write heartfelt farewell messages',
      desc: isEs
        ? 'Usa las hojas biodegradables y la pluma de soya para dedicar tus palabras de amor y colócalas dentro de la urna.'
        : 'Use the note cards and soy pen to write heartfelt words of love and farewell, and place them inside the Urn.',
      realImg: activeModeKitImg,
      imgMode: 'notes-zoom',
    },
    {
      step: '05',
      sketchKey: 'step5-close',
      phase: isEs ? 'Sellado' : 'Sealing',
      title: isEs ? 'Cierra la urna y desliza la celosía' : 'Close securely & slide the sleeve back',
      desc: isEs
        ? 'Cierra la urna con firmeza y desliza nuevamente la celosía impresa con tinta de soya para un acabado perfecto.'
        : 'Close the urn securely and slide the soy-ink lattice sleeve back around the urn for a smooth finish.',
      realImg: activeModeUrnImg,
      imgMode: 'urn-center',
    },
    {
      step: '06',
      sketchKey: 'step6-carry',
      phase: isEs ? 'Traslado' : 'Transport',
      title: isEs ? 'Llévala con cuidado sin voltearla' : 'Carry carefully without turning over',
      desc: isEs
        ? 'Sostén la urna con ambas manos por la base manteniendo siempre su posición horizontal hacia el lugar de ceremonia.'
        : 'Support the Urn gently with both hands from underneath, keeping it level without turning it over.',
      realImg: activeModeUrnImg,
      imgMode: 'urn-cradled',
    },
    ...(processEnvMode === 'water'
      ? [
          {
            step: '07',
            sketchKey: 'step7-water-prick',
            phase: isEs ? 'Ceremonia en Agua' : 'Water Ceremony',
            title: isEs
              ? 'Presiona los cuadros de cada esquina'
              : 'Gently prick the four corner squares',
            desc: isEs
              ? 'Antes de colocarla en el agua, presiona suavemente con tu dedo los pequeños cuadros en cada esquina para que el aire salga y se sumerja en paz.'
              : 'Before placing the urn into the water, gently prick the small squares at each corner with your finger so air escapes and it submerges peacefully.',
            realImg:
              'https://static.wixstatic.com/media/45119e_48478600018f46ffb3f1ac569e733471~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
            imgMode: 'urn-corners',
          },
          {
            step: '08',
            sketchKey: 'step8-water-float',
            phase: isEs ? 'Despedida en el Mar o Lago' : 'Ocean or Lake Farewell',
            title: isEs
              ? 'Deposítala suavemente sobre el agua'
              : 'Place gently onto the water surface',
            desc: isEs
              ? 'En el mar, lago o río, posa la urna sobre la superficie del agua. Tómate un momento para dar tu último adiós mientras desciende serenamente.'
              : "Once in the ocean, lake, or river, gently place the urn onto the water's surface. Take a moment to say your final goodbye as it descends.",
            realImg:
              'https://static.wixstatic.com/media/45119e_44f8f91ccd1b439098bf5760374cc702~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
            imgMode: 'urn-water-float',
          },
        ]
      : [
          {
            step: '07',
            sketchKey: 'step7-earth-bed',
            phase: isEs ? 'Ceremonia en Tierra' : 'Earth Ceremony',
            title: isEs
              ? 'Prepara el espacio en tierra fértil'
              : 'Prepare a resting bed in fertile soil',
            desc: isEs
              ? 'Cava un espacio en tierra o jardín de unos 30 cm de profundidad. Puedes acompañar la base con pétalos, hojas o semillas nativas.'
              : 'Prepare a resting space in soil or a garden about 12 inches deep. You may line the base with petals, leaves, or native seeds.',
            realImg:
              'https://static.wixstatic.com/media/45119e_277f4849b55642b1a9c570a911f20d37~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png',
            imgMode: 'urn-earth-bed',
          },
          {
            step: '08',
            sketchKey: 'step8-earth-bloom',
            phase: isEs ? 'Retorno al Bosque' : 'Return to the Forest',
            title: isEs
              ? 'Cubre con tierra y honra nueva vida'
              : 'Cover with soil & nurture new life',
            desc: isEs
              ? 'Deposita la urna con ambas manos, cúbrela con tierra húmeda y riega suavemente. En 2 a 4 semanas se biodegrada nutriendo el suelo.'
              : 'Place the urn gently with both hands, cover with moist soil, and water softly. Within 2–4 weeks it biodegradates to nourish new life.',
            realImg:
              'https://static.wixstatic.com/media/45119e_6fee7c273f3f487aba1e9f9e8aee9a72~mv2.png/v1/fit/w_1192,h_1036,q_90/file.png',
            imgMode: 'urn-earth-bloom',
          },
        ]),
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navigateToProduct = (slug, variantChoice = null) => {
    if (!slug) return;
    if (variantChoice) {
      navigate(`/product/${slug}?variant=${encodeURIComponent(variantChoice)}`);
    } else {
      navigate(`/product/${slug}`);
    }
  };

  const handleDirectBuy = (productData) => {
    const matched = products.find(
      (p) =>
        p.slug === productData.slug ||
        p.id === productData.id ||
        p._wixId === productData._wixId
    );
    const chosenVariant =
      productData.variantChoice ||
      productData.selectedVariant ||
      CLEAN_URN_DEFAULT_VARIANT[productData.slug] ||
      matched?.defaultVariant ||
      matched?.variants?.[0] ||
      null;

    const itemToAdd = matched
      ? {
          ...matched,
          explicitVariantId: productData.variantId || null,
        }
      : {
          id: productData._wixId || productData.id,
          _wixId: productData._wixId || productData.id,
          name: productData.name || productData.title,
          price: productData.priceOverride ?? productData.price,
          slug: productData.slug,
          images: [productData.img || productData.image],
          explicitVariantId: productData.variantId || null,
        };

    addToCart(itemToAdd, 1, chosenVariant);
    const feedbackKey =
      productData.feedbackKey ||
      (chosenVariant ? `${productData.slug}:${chosenVariant}` : productData.slug || productData.id);
    setAddedProductId(feedbackKey);
    setTimeout(() => setAddedProductId(null), 2200);
  };

  // Concise Polaroid Reviews (Bilingual ES / EN)
  const polaroidReviews = [
    {
      image: '/images/review-polaroid-1.png',
      title: isEs ? 'Paz infinita en el mar' : 'Infinite peace at sea',
      quote: isEs
        ? 'Flotó al amanecer antes de integrarse en el océano con una calma única.'
        : 'It floated at dawn before gently dissolving into the ocean with unique serenity.',
      author: 'Elena R.',
      location: 'San Diego, CA',
      edition: 'Aqua Urn',
    },
    {
      image: '/images/review-polaroid-2.png',
      title: isEs ? 'Regresó a la tierra' : 'Returned to the earth',
      quote: isEs
        ? 'Escribir nuestras cartas en las hojas biodegradables fue profundamente sanador.'
        : 'Writing our farewell notes on the biodegradable cards was deeply healing.',
      author: 'Marcus & Claudia',
      location: 'Austin, TX',
      edition: 'Terra Urn',
    },
    {
      image: '/images/review-polaroid-3.png',
      title: isEs ? 'Un lago en calma' : 'A calm mountain lake',
      quote: isEs
        ? 'Una despedida digna, silenciosa y 100% libre de químicos.'
        : 'A dignified, quiet, and 100% chemical-free farewell.',
      author: 'Javier L.',
      location: 'Vancouver, BC',
      edition: 'Angel Urn',
    },
    {
      image: '/images/review-polaroid-4.png',
      title: isEs ? 'Cuatro hogares unidos' : 'Four homes united',
      quote: isEs
        ? 'El Mini Set nos permitió a mis hermanos compartir su recuerdo en cada ciudad.'
        : 'The Mini Set allowed my siblings and me to share her memory across cities.',
      author: 'Sofía V.',
      location: 'Miami, FL',
      edition: 'Mini Set Flore',
    },
    {
      image: '/images/hero-earth-ceremony.png',
      title: isEs ? 'Belleza artesanal' : 'Handcrafted beauty',
      quote: isEs
        ? 'Parece una escultura orgánica. La banda Turtle es aún más linda en persona.'
        : 'It looks like an organic sculpture. The Turtle band is even lovelier in person.',
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
              <span className="kmb-brand-series">
                {cmsLanding?.city
                  ? `${cmsLanding.city}${cmsLanding.country ? ` · ${cmsLanding.country}` : ''}`
                  : isEs
                  ? 'COLECCIÓN ORGÁNICA'
                  : 'ORGANIC COLLECTION'}
              </span>
            </div>

            {cmsLanding?.pageTitle || cmsLanding?.title || fallbackZoneTitle ? (
              <h1 className="kmb-apple-h1">
                {cmsLanding?.pageTitle || cmsLanding?.title || fallbackZoneTitle}
                <span>
                  {isEs ? 'Regresa a la naturaleza.' : 'Return to nature.'}
                </span>
              </h1>
            ) : (
              <h1 className="kmb-apple-h1">
                {isEs ? 'Regresa a la naturaleza.' : 'Return to nature.'}
                <span>{isEs ? 'Nada menos.' : 'Nothing less.'}</span>
              </h1>
            )}

            <p className="kmb-apple-price-line">
              {cmsLanding?.excerpt ? (
                cmsLanding.excerpt
              ) : isEs ? (
                <>
                  Desde <strong>$76.50 USD</strong> en Urnas Adulto o{' '}
                  <strong>$49.99 USD</strong> en Mini Sets. Envío gratis.
                </>
              ) : (
                <>
                  From <strong>$76.50 USD</strong> on Adult Urns or{' '}
                  <strong>$49.99 USD</strong> on Mini Sets. Free shipping.
                </>
              )}
            </p>

            <div className="kmb-apple-cta-group">
              <button
                onClick={() => scrollToSection('comparativa')}
                className="kmb-pill-cta-solid"
              >
                {isEs ? 'Comprar' : 'Buy'}
              </button>

              <div className="kmb-apple-sublinks">
                <button
                  onClick={() => scrollToSection('catalogo')}
                  className="kmb-apple-link"
                >
                  {isEs ? 'Ver todos los modelos' : 'View all models'} <span>›</span>
                </button>
                <button
                  onClick={() => setActiveModal('how-it-works')}
                  className="kmb-apple-link"
                >
                  {isEs ? 'Cómo funciona' : 'How it works'} <span>ⓘ</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Giant Dual-Urn Studio Stage + Minimalist Ambient SVGs + Hover Detail Popovers */}
          <div className="kmb-dual-urn-stage">
            {/* Delicate Botanical & Landscape Line-Art SVGs per Environment */}
            <div className="kmb-hero-ambient-svg-wrap" aria-hidden="true">
              <AnimatePresence mode="wait">
                {heroPair === 'urns' && (
                  <motion.svg
                    key="svg-water"
                    viewBox="0 0 1100 440"
                    fill="none"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.6 }}
                    className="kmb-ambient-svg kmb-svg-water"
                  >
                    {/* Left Coastal Reeds, Water Grasses & Gentle Shore */}
                    <g opacity="0.52" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      {/* Shore contour */}
                      <path d="M 15 365 Q 115 352, 235 368 T 420 375" strokeWidth="1.1" />
                      <path d="M 35 382 Q 145 372, 265 384" strokeWidth="0.85" opacity="0.65" />
                      {/* Tall swaying reed 1 */}
                      <path d="M 78 364 Q 88 250, 128 142" strokeWidth="1.2" />
                      <path d="M 88 285 Q 62 252, 42 238" strokeWidth="0.95" />
                      <path d="M 96 245 Q 124 218, 148 205" strokeWidth="0.95" />
                      <path d="M 108 198 Q 84 172, 68 158" strokeWidth="0.9" />
                      <ellipse cx="131" cy="135" rx="3.2" ry="11" transform="rotate(18 131 135)" strokeWidth="1" />
                      {/* Tall swaying reed 2 */}
                      <path d="M 112 365 Q 130 272, 176 185" strokeWidth="1.1" />
                      <path d="M 128 295 Q 156 270, 178 258" strokeWidth="0.9" />
                      <path d="M 145 245 Q 122 220, 108 205" strokeWidth="0.9" />
                      <ellipse cx="180" cy="178" rx="2.8" ry="9.5" transform="rotate(24 180 178)" strokeWidth="0.95" />
                      {/* Delicate left sea-grasses */}
                      <path d="M 55 363 Q 48 295, 26 245" strokeWidth="1" />
                      <path d="M 64 364 Q 68 310, 56 268" strokeWidth="0.85" />
                      <path d="M 142 366 Q 162 315, 192 282" strokeWidth="0.95" />
                    </g>

                    {/* Right Botanical Sea Kelp, Graceful Sea Turtle & Ocean Waves */}
                    <g opacity="0.52" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      {/* Right ocean wave lines */}
                      <path d="M 690 374 Q 810 358, 925 370 T 1085 364" strokeWidth="1.1" />
                      <path d="M 745 388 Q 855 376, 965 386" strokeWidth="0.85" opacity="0.65" />
                      {/* Delicate swaying sea-kelp / botanical coral */}
                      <path d="M 995 366 C 982 310, 1012 255, 988 195 C 975 162, 995 135, 985 112" strokeWidth="1.15" />
                      <path d="M 992 310 C 968 298, 964 278, 988 284" strokeWidth="0.95" />
                      <path d="M 996 268 C 1020 255, 1024 235, 998 242" strokeWidth="0.95" />
                      <path d="M 991 225 C 968 212, 965 192, 988 198" strokeWidth="0.95" />
                      <path d="M 988 178 C 1012 165, 1014 146, 990 152" strokeWidth="0.9" />
                      {/* Second smaller kelp stem */}
                      <path d="M 1032 365 C 1024 320, 1045 278, 1030 232" strokeWidth="0.95" />
                      <path d="M 1032 315 C 1050 304, 1052 288, 1034 294" strokeWidth="0.85" />
                      <path d="M 1035 275 C 1016 265, 1016 250, 1034 255" strokeWidth="0.85" />
                      {/* Delicate Sea Turtle silhouette gliding */}
                      <g transform="translate(865, 148) rotate(-18)">
                        <ellipse cx="0" cy="0" rx="18" ry="13" strokeWidth="1.1" />
                        <ellipse cx="0" cy="0" rx="13" ry="9" strokeWidth="0.75" opacity="0.7" />
                        <path d="M 18 0 C 24 -2, 26 0, 24 3 C 22 4, 19 3, 18 0 Z" strokeWidth="0.95" />
                        <path d="M 8 -11 C 16 -24, 24 -22, 18 -8" strokeWidth="1" />
                        <path d="M 8 11 C 16 24, 24 22, 18 8" strokeWidth="1" />
                        <path d="M -14 -8 C -22 -14, -24 -10, -17 -5" strokeWidth="0.9" />
                        <path d="M -14 8 C -22 14, -24 10, -17 5" strokeWidth="0.9" />
                      </g>
                      {/* Distant Seabirds */}
                      <path d="M 215 92 Q 223 83, 231 91 Q 239 83, 247 92" strokeWidth="1" opacity="0.65" />
                      <path d="M 252 76 Q 258 69, 264 75 Q 270 69, 276 76" strokeWidth="0.85" opacity="0.5" />
                      <path d="M 825 84 Q 832 76, 839 83 Q 846 76, 853 84" strokeWidth="0.95" opacity="0.6" />
                    </g>
                  </motion.svg>
                )}

                {heroPair === 'earth' && (
                  <motion.svg
                    key="svg-earth"
                    viewBox="0 0 1100 440"
                    fill="none"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.6 }}
                    className="kmb-ambient-svg kmb-svg-earth"
                  >
                    {/* Left Delicate Forest Grove: Tall Pine, Young Pine & Branching Tree */}
                    <g opacity="0.55" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      {/* Mossy woodland ground */}
                      <path d="M 15 368 Q 130 342, 265 368 T 430 376" strokeWidth="1.15" />
                      {/* Tall Delicate Pine Tree (x=95) */}
                      <path d="M 95 92 L 95 358" strokeWidth="1.3" />
                      <path d="M 95 108 C 82 122, 74 126, 66 130 M 95 108 C 108 122, 116 126, 124 130" strokeWidth="1" />
                      <path d="M 95 136 C 78 154, 66 160, 54 165 M 95 136 C 112 154, 124 160, 136 165" strokeWidth="1.05" />
                      <path d="M 95 168 C 74 188, 58 196, 44 202 M 95 168 C 116 188, 132 196, 146 202" strokeWidth="1.05" />
                      <path d="M 95 202 C 70 225, 52 234, 36 240 M 95 202 C 120 225, 138 234, 154 240" strokeWidth="1.1" />
                      <path d="M 95 238 C 66 264, 46 272, 28 280 M 95 238 C 124 264, 144 272, 162 280" strokeWidth="1.1" />
                      <path d="M 95 276 C 64 302, 42 312, 24 318 M 95 276 C 126 302, 148 312, 166 318" strokeWidth="1.1" />
                      {/* Smaller Background Pine (x=48) */}
                      <path d="M 48 185 L 48 362" strokeWidth="1" opacity="0.7" />
                      <path d="M 48 202 L 30 222 M 48 202 L 66 222" strokeWidth="0.85" opacity="0.7" />
                      <path d="M 48 232 L 24 256 M 48 232 L 72 256" strokeWidth="0.85" opacity="0.7" />
                      <path d="M 48 265 L 20 292 M 48 265 L 76 292" strokeWidth="0.85" opacity="0.7" />
                      {/* Delicate Deciduous / Olive Tree with Fine Branches & Leaves (x=188) */}
                      <path d="M 188 360 C 188 315, 184 275, 190 225" strokeWidth="1.25" />
                      <path d="M 188 275 C 170 250, 154 232, 142 212" strokeWidth="1" />
                      <path d="M 189 252 C 208 232, 224 215, 238 195" strokeWidth="1" />
                      <path d="M 190 225 C 178 198, 170 176, 164 156" strokeWidth="0.95" />
                      <path d="M 190 225 C 202 198, 212 180, 220 162" strokeWidth="0.95" />
                      {/* Delicate canopy leaf clusters */}
                      <ellipse cx="140" cy="206" rx="8" ry="4" transform="rotate(-25 140 206)" strokeWidth="0.85" />
                      <ellipse cx="162" cy="150" rx="9" ry="4.5" transform="rotate(-15 162 150)" strokeWidth="0.85" />
                      <ellipse cx="222" cy="156" rx="9" ry="4.5" transform="rotate(20 222 156)" strokeWidth="0.85" />
                      <ellipse cx="242" cy="190" rx="8" ry="4" transform="rotate(30 242 190)" strokeWidth="0.85" />
                      <ellipse cx="192" cy="144" rx="10" ry="4.5" strokeWidth="0.85" />
                    </g>

                    {/* Right Delicate Forest Grove: Twin Pines, Eucalyptus & Floating Leaves */}
                    <g opacity="0.55" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      {/* Right mossy hill */}
                      <path d="M 670 376 Q 825 344, 965 364 T 1085 368" strokeWidth="1.15" />
                      {/* Tall Right Pine Tree (x=995) */}
                      <path d="M 995 102 L 995 362" strokeWidth="1.3" />
                      <path d="M 995 118 C 982 132, 974 136, 966 140 M 995 118 C 1008 132, 1016 136, 1024 140" strokeWidth="1" />
                      <path d="M 995 148 C 976 166, 964 172, 952 178 M 995 148 C 1014 166, 1026 172, 1038 178" strokeWidth="1.05" />
                      <path d="M 995 182 C 972 204, 956 212, 940 218 M 995 182 C 1018 204, 1034 212, 1050 218" strokeWidth="1.05" />
                      <path d="M 995 218 C 968 242, 948 252, 932 258 M 995 218 C 1022 242, 1042 252, 1058 258" strokeWidth="1.1" />
                      <path d="M 995 256 C 964 282, 942 292, 924 298 M 995 256 C 1026 282, 1048 292, 1066 298" strokeWidth="1.1" />
                      <path d="M 995 294 C 962 320, 940 328, 920 335 M 995 294 C 1028 320, 1050 328, 1070 335" strokeWidth="1.1" />
                      {/* Slender Birch / Eucalyptus Sapling (x=905) */}
                      <path d="M 905 358 Q 898 265, 882 168" strokeWidth="1.15" />
                      <path d="M 898 295 Q 872 276, 858 262" strokeWidth="0.95" />
                      <path d="M 894 252 Q 918 232, 932 216" strokeWidth="0.95" />
                      <path d="M 888 210 Q 864 192, 850 176" strokeWidth="0.95" />
                      <circle cx="854" cy="258" r="6" strokeWidth="0.85" />
                      <circle cx="935" cy="212" r="6.5" strokeWidth="0.85" />
                      <circle cx="846" cy="172" r="5.5" strokeWidth="0.85" />
                      <circle cx="880" cy="160" r="6" strokeWidth="0.85" />
                      {/* Floating botanical leaves in the breeze */}
                      <path d="M 275 112 C 282 104, 292 106, 286 116 C 280 122, 272 118, 275 112 Z" strokeWidth="0.9" opacity="0.65" />
                      <path d="M 812 105 C 820 98, 828 100, 822 110 C 816 116, 808 112, 812 105 Z" strokeWidth="0.9" opacity="0.65" />
                    </g>
                  </motion.svg>
                )}

                {heroPair === 'minis' && (
                  <motion.svg
                    key="svg-minis"
                    viewBox="0 0 1100 440"
                    fill="none"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.6 }}
                    className="kmb-ambient-svg kmb-svg-minis"
                  >
                    {/* Delicate Wildflower Meadow, Ginkgo Stems & Butterflies */}
                    <g opacity="0.55" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      {/* Left Meadow Stems & Blossoms */}
                      <path d="M 25 368 Q 145 352, 285 372" strokeWidth="1.05" />
                      {/* Wildflower stem 1 */}
                      <path d="M 88 362 Q 102 258, 142 152" strokeWidth="1.15" />
                      <circle cx="145" cy="145" r="4" strokeWidth="1" />
                      <ellipse cx="145" cy="133" rx="3" ry="6" strokeWidth="0.85" />
                      <ellipse cx="145" cy="157" rx="3" ry="6" strokeWidth="0.85" />
                      <ellipse cx="133" cy="145" rx="6" ry="3" strokeWidth="0.85" />
                      <ellipse cx="157" cy="145" rx="6" ry="3" strokeWidth="0.85" />
                      {/* Wildflower stem 2 (Lavender / Botanical spike) */}
                      <path d="M 132 364 Q 152 275, 196 192" strokeWidth="1.1" />
                      <ellipse cx="182" cy="218" rx="3" ry="6" transform="rotate(-30 182 218)" strokeWidth="0.85" />
                      <ellipse cx="192" cy="208" rx="3" ry="6" transform="rotate(45 192 208)" strokeWidth="0.85" />
                      <ellipse cx="190" cy="198" rx="3" ry="6" transform="rotate(-25 190 198)" strokeWidth="0.85" />
                      <ellipse cx="200" cy="188" rx="3" ry="6" transform="rotate(40 200 188)" strokeWidth="0.85" />
                      {/* Slender sapling on left */}
                      <path d="M 56 362 L 56 210" strokeWidth="1" />
                      <path d="M 56 235 L 38 252 M 56 235 L 74 252" strokeWidth="0.85" />
                      <path d="M 56 268 L 34 288 M 56 268 L 78 288" strokeWidth="0.85" />
                      <path d="M 56 302 L 30 324 M 56 302 L 82 324" strokeWidth="0.85" />

                      {/* Right Meadow Stems & Blossoms */}
                      <path d="M 815 372 Q 955 352, 1075 368" strokeWidth="1.05" />
                      <path d="M 1012 362 Q 998 258, 958 152" strokeWidth="1.15" />
                      <circle cx="955" cy="145" r="4" strokeWidth="1" />
                      <ellipse cx="955" cy="133" rx="3" ry="6" strokeWidth="0.85" />
                      <ellipse cx="955" cy="157" rx="3" ry="6" strokeWidth="0.85" />
                      <ellipse cx="943" cy="145" rx="6" ry="3" strokeWidth="0.85" />
                      <ellipse cx="967" cy="145" rx="6" ry="3" strokeWidth="0.85" />
                      {/* Right Lavender spike */}
                      <path d="M 968 364 Q 948 275, 904 192" strokeWidth="1.1" />
                      <ellipse cx="918" cy="218" rx="3" ry="6" transform="rotate(30 918 218)" strokeWidth="0.85" />
                      <ellipse cx="908" cy="208" rx="3" ry="6" transform="rotate(-45 908 208)" strokeWidth="0.85" />
                      <ellipse cx="910" cy="198" rx="3" ry="6" transform="rotate(25 910 198)" strokeWidth="0.85" />
                      {/* Slender sapling on right */}
                      <path d="M 1044 362 L 1044 210" strokeWidth="1" />
                      <path d="M 1044 235 L 1026 252 M 1044 235 L 1062 252" strokeWidth="0.85" />
                      <path d="M 1044 268 L 1022 288 M 1044 268 L 1066 288" strokeWidth="0.85" />
                      <path d="M 1044 302 L 1018 324 M 1044 302 L 1070 324" strokeWidth="0.85" />

                      {/* Two Delicate Line-Art Butterflies */}
                      <g transform="translate(225, 112) rotate(-15)">
                        <path d="M 0 -6 L 0 8" strokeWidth="1" />
                        <path d="M 0 0 C -12 -10, -16 2, 0 5 C -10 8, -8 14, 0 7" strokeWidth="0.9" />
                        <path d="M 0 0 C 12 -10, 16 2, 0 5 C 10 8, 8 14, 0 7" strokeWidth="0.9" />
                      </g>
                      <g transform="translate(875, 108) rotate(18)">
                        <path d="M 0 -6 L 0 8" strokeWidth="1" />
                        <path d="M 0 0 C -12 -10, -16 2, 0 5 C -10 8, -8 14, 0 7" strokeWidth="0.9" />
                        <path d="M 0 0 C 12 -10, 16 2, 0 5 C 10 8, 8 14, 0 7" strokeWidth="0.9" />
                      </g>
                    </g>
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
                  onClick={() =>
                    navigateToProduct(
                      activeHero.leftDetail.slug,
                      activeHero.leftDetail.variantChoice
                    )
                  }
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
                                feedbackKey: `hero-left-${activeHero.leftDetail.slug}`,
                              })
                            }
                            className="kmb-uhc-buy"
                          >
                            {addedProductId === `hero-left-${activeHero.leftDetail.slug}`
                              ? isEs
                                ? '✓ Añadido'
                                : '✓ Added'
                              : isEs
                              ? '+ Comprar'
                              : '+ Buy'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigateToProduct(
                                activeHero.leftDetail.slug,
                                activeHero.leftDetail.variantChoice
                              )
                            }
                            className="kmb-uhc-link"
                          >
                            {isEs ? 'Ver' : 'View'} <span>→</span>
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
                  onClick={() =>
                    navigateToProduct(
                      activeHero.rightDetail.slug,
                      activeHero.rightDetail.variantChoice
                    )
                  }
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
                                feedbackKey: `hero-right-${activeHero.rightDetail.slug}`,
                              })
                            }
                            className="kmb-uhc-buy"
                          >
                            {addedProductId === `hero-right-${activeHero.rightDetail.slug}`
                              ? isEs
                                ? '✓ Añadido'
                                : '✓ Added'
                              : isEs
                              ? '+ Comprar'
                              : '+ Buy'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigateToProduct(
                                activeHero.rightDetail.slug,
                                activeHero.rightDetail.variantChoice
                              )
                            }
                            className="kmb-uhc-link"
                          >
                            {isEs ? 'Ver' : 'View'} <span>→</span>
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
                        alt={isEs ? 'Urna Biodegradable Kamibi' : 'Kamibi Biodegradable Urn'}
                        className="kmb-af-big-urn"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="kmb-af-copy">
                  <span className="kmb-af-eyebrow">
                    {isEs ? 'Diseñada para florecer.' : 'Designed to bloom.'}
                  </span>
                  <h2 className="kmb-af-headline">
                    {isEs ? (
                      <>
                        Se integra con el{' '}
                        <em>{cardBioMode === 'water' ? 'océano' : 'bosque'}</em> sin dejar
                        rastro químico.
                      </>
                    ) : (
                      <>
                        Integrates with the{' '}
                        <em>{cardBioMode === 'water' ? 'ocean' : 'forest'}</em> leaving
                        zero chemical trace.
                      </>
                    )}
                  </h2>

                  <div className="kmb-af-pills">
                    <button
                      type="button"
                      onClick={() => setCardBioMode('water')}
                      className={`kmb-af-pill ${cardBioMode === 'water' ? 'active' : ''}`}
                    >
                      {isEs ? 'Agua & Mar' : 'Water & Sea'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardBioMode('earth')}
                      className={`kmb-af-pill ${cardBioMode === 'earth' ? 'active' : ''}`}
                    >
                      {isEs ? 'Tierra & Árbol' : 'Earth & Tree'}
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
                        navigateToProduct(
                          bandShowcase[activeBandIdx].slug,
                          bandShowcase[activeBandIdx].variantChoice
                        )
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
                  <span className="kmb-af-eyebrow">
                    {isEs ? '100% Fibras Orgánicas.' : '100% Organic Fibers.'}
                  </span>
                  <h2 className="kmb-af-headline">
                    {isEs ? (
                      <>
                        Celosías sostenibles.{' '}
                        <em>Impresas con tinta de soya.</em>
                      </>
                    ) : (
                      <>
                        Sustainable lattice sleeves.{' '}
                        <em>Printed with soy-based ink.</em>
                      </>
                    )}
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

            {/* STICKY CARD 3: KAMIBI TODO INCLUIDO (Real Product + Hand-Drawn Ink Illustrations) */}
            <StickyCardWrapper index={2} total={3}>
              <div className="kmb-apple-pack-card kmb-kit-included-card">
                <div className="kmb-ap-copy kmb-kit-copy">
                  <div className="kmb-brand-lockup kmb-lockup-left">
                    <span className="kmb-brand-leaf">✦</span>
                    <span className="kmb-brand-word">KAMIBI</span>
                    <span className="kmb-brand-series">
                      {isEs ? 'TODO INCLUIDO' : 'ALL INCLUDED'}
                    </span>
                  </div>

                  <h2 className="kmb-ap-headline kmb-kit-headline">
                    {isEs ? 'Una despedida única.' : 'A unique farewell.'}
                    <span>
                      {isEs
                        ? 'Cada detalle tiene un significado.'
                        : 'Every detail has meaning.'}
                    </span>
                  </h2>

                  <p className="kmb-kit-lead">
                    {isEs ? 'Tu urna Kamibi incluye:' : 'Your Kamibi urn includes:'}
                  </p>

                  <ul className="kmb-kit-checklist" role="list">
                    {kitIncludedItems.map((item, idx) => {
                      const isActive = activeIncludedIdx === idx;
                      return (
                        <li
                          key={item.id}
                          className={`kmb-kit-check-item ${isActive ? 'active' : ''}`}
                          onMouseEnter={() => setActiveIncludedIdx(idx)}
                          onClick={() => setActiveIncludedIdx(idx)}
                        >
                          <span className="kmb-kit-check-emoji" aria-hidden="true">
                            {item.icon}
                          </span>
                          <span className="kmb-kit-check-text">{item.title}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <p className="kmb-kit-closing">
                    {isEs
                      ? 'Una experiencia completa para honrar, recordar y despedir con amor.'
                      : 'A complete experience to honor, remember, and say goodbye with love.'}
                  </p>

                  <div className="kmb-ap-actions">
                    <button
                      type="button"
                      onClick={() => scrollToSection('comparativa')}
                      className="kmb-pill-cta-solid"
                    >
                      {isEs ? 'Descubre tu Kamibi' : 'Discover your Kamibi'}
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection('proceso-uso')}
                      className="kmb-apple-link"
                    >
                      {isEs ? 'Ver proceso de uso' : 'See how to use'} <span>›</span>
                    </button>
                  </div>
                </div>

                {/* RIGHT VISUAL STAGE: REAL PRODUCT + HAND-DRAWN INK ILLUSTRATION */}
                <div className="kmb-kit-visual-column">
                  <div className="kmb-kit-spotlight-stage">
                    <div className="kmb-kit-stage-badge">
                      <span>0{activeIncludedIdx + 1} / 05</span>
                      <strong>{kitIncludedItems[activeIncludedIdx].shortTag}</strong>
                      <em>{isEs ? 'Real + Dibujo' : 'Real + Sketch'}</em>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={kitIncludedItems[activeIncludedIdx].id}
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                        className="kmb-kit-hybrid-canvas"
                      >
                        {/* Real Studio Cutout Product Layer */}
                        <div
                          className={`kmb-kit-real-wrap ${kitIncludedItems[activeIncludedIdx].imgClass}`}
                        >
                          <img
                            src={kitIncludedItems[activeIncludedIdx].realImg}
                            alt={kitIncludedItems[activeIncludedIdx].shortTag}
                            className="kmb-kit-real-img"
                          />
                        </div>

                        {/* Hand-Drawn Ink Illustration Overlay Layer (Hands + Botanical Sketch) */}
                        <svg
                          viewBox="0 0 420 270"
                          fill="none"
                          className="kmb-kit-sketch-svg"
                          aria-hidden="true"
                        >
                          {activeIncludedIdx === 0 && (
                            <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                              {/* Drawn hands gently cradling the real urn from left and right */}
                              <path
                                d="M 32 214 C 54 196, 78 192, 108 198 C 122 201, 134 205, 140 212 C 132 220, 108 222, 82 220 C 62 218, 46 226, 26 238"
                                strokeWidth="1.6"
                              />
                              <path d="M 96 196 C 112 188, 128 190, 138 198" strokeWidth="1.3" />
                              <path
                                d="M 388 214 C 366 196, 342 192, 312 198 C 298 201, 286 205, 280 212 C 288 220, 312 222, 338 220 C 358 218, 374 226, 394 238"
                                strokeWidth="1.6"
                              />
                              <path d="M 324 196 C 308 188, 292 190, 282 198" strokeWidth="1.3" />
                              {/* Delicate botanical sprigs & dimension callout */}
                              <path d="M 68 82 Q 86 58, 114 48" strokeWidth="1.1" strokeDasharray="3 4" opacity="0.65" />
                              <circle cx="118" cy="46" r="3" fill="currentColor" />
                              <path d="M 56 122 Q 44 96, 62 72" strokeWidth="1.2" opacity="0.55" />
                              <ellipse cx="48" cy="98" rx="9" ry="4.5" transform="rotate(-30 48 98)" strokeWidth="1.1" opacity="0.55" />
                              <ellipse cx="64" cy="84" rx="8" ry="4" transform="rotate(24 64 84)" strokeWidth="1.1" opacity="0.55" />
                              <path d="M 356 118 Q 372 90, 352 66" strokeWidth="1.2" opacity="0.55" />
                              <ellipse cx="366" cy="92" rx="9" ry="4.5" transform="rotate(28 366 92)" strokeWidth="1.1" opacity="0.55" />
                            </g>
                          )}

                          {activeIncludedIdx === 1 && (
                            <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                              {/* Drawn hands sliding the soy-ink lattice sleeve around the urn */}
                              <path
                                d="M 48 112 C 72 98, 98 96, 122 106 C 128 110, 126 118, 114 122 C 94 126, 72 126, 44 136"
                                strokeWidth="1.6"
                              />
                              <path
                                d="M 372 152 C 348 138, 322 136, 298 146 C 292 150, 294 158, 306 162 C 326 166, 348 166, 376 176"
                                strokeWidth="1.6"
                              />
                              {/* Dashed lattice sleeve outline + sliding motion arrow */}
                              <path
                                d="M 145 48 L 265 28 L 292 44 L 172 64 Z"
                                strokeWidth="1.1"
                                strokeDasharray="4 4"
                                opacity="0.65"
                              />
                              <path d="M 308 62 C 334 52, 352 54, 368 64" strokeWidth="1.4" />
                              <path d="M 362 56 L 370 65 L 358 68" strokeWidth="1.4" />
                              {/* Soy leaf & ink drop sketch */}
                              <path d="M 74 208 C 74 192, 86 182, 86 172 C 86 182, 98 192, 98 208 C 98 216, 92 222, 86 222 C 80 222, 74 216, 74 208 Z" strokeWidth="1.3" />
                            </g>
                          )}

                          {activeIncludedIdx === 2 && (
                            <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                              {/* Drawn hands gently tying/holding the top of the water-soluble bag */}
                              <path
                                d="M 96 64 C 126 56, 152 58, 176 68 C 182 72, 180 80, 168 82 C 146 84, 124 82, 92 88"
                                strokeWidth="1.6"
                              />
                              <path
                                d="M 324 64 C 294 56, 268 58, 244 68 C 238 72, 240 80, 252 82 C 274 84, 296 82, 328 88"
                                strokeWidth="1.6"
                              />
                              {/* Water-soluble concentric ripples & dissolving bubbles at base */}
                              <ellipse cx="210" cy="226" rx="96" ry="18" strokeWidth="1.3" strokeDasharray="6 5" opacity="0.7" />
                              <ellipse cx="210" cy="226" rx="132" ry="26" strokeWidth="1" opacity="0.42" />
                              <circle cx="112" cy="182" r="4" strokeWidth="1.2" opacity="0.65" />
                              <circle cx="126" cy="164" r="2.5" strokeWidth="1.1" opacity="0.55" />
                              <circle cx="308" cy="176" r="4.5" strokeWidth="1.2" opacity="0.65" />
                              <circle cx="294" cy="156" r="2.5" strokeWidth="1.1" opacity="0.55" />
                            </g>
                          )}

                          {activeIncludedIdx === 3 && (
                            <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                              {/* Drawn hand holding farewell note card + drawn envelope & heart */}
                              <path
                                d="M 42 198 C 68 182, 94 176, 124 182 C 134 184, 136 194, 124 198 C 102 204, 78 206, 52 222"
                                strokeWidth="1.6"
                              />
                              {/* Illustrated floating farewell card with heart & lines */}
                              <rect x="272" y="42" width="88" height="64" rx="6" transform="rotate(8 272 42)" strokeWidth="1.4" />
                              <path
                                d="M 316 64 C 313 59, 306 59, 306 65 C 306 70, 316 76, 316 76 C 316 76, 326 70, 326 65 C 326 59, 319 59, 316 64 Z"
                                strokeWidth="1.3"
                              />
                              <line x1="286" y1="86" x2="338" y2="93" strokeWidth="1.1" opacity="0.65" />
                              <line x1="288" y1="95" x2="324" y2="100" strokeWidth="1.1" opacity="0.5" />
                            </g>
                          )}

                          {activeIncludedIdx === 4 && (
                            <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                              {/* Drawn hand holding the soy ink pen writing a flowing tribute line */}
                              <path
                                d="M 296 56 C 272 72, 250 92, 232 114 C 224 122, 232 132, 244 126 C 264 114, 286 98, 318 84"
                                strokeWidth="1.6"
                              />
                              <path d="M 228 118 L 210 134 L 226 126" strokeWidth="1.5" />
                              {/* Flowing soy-ink calligraphy curve */}
                              <path
                                d="M 76 206 C 112 184, 146 218, 184 194 C 212 176, 238 198, 272 182"
                                strokeWidth="1.5"
                                strokeDasharray="2 0"
                              />
                              {/* Botanical soy pod sketch */}
                              <path d="M 82 78 Q 104 62, 126 78 Q 104 94, 82 78 Z" strokeWidth="1.3" opacity="0.65" />
                              <circle cx="96" cy="78" r="3" strokeWidth="1.1" opacity="0.65" />
                              <circle cx="110" cy="78" r="3" strokeWidth="1.1" opacity="0.65" />
                            </g>
                          )}
                        </svg>
                      </motion.div>
                    </AnimatePresence>

                    <div className="kmb-kit-stage-caption">
                      <p>{kitIncludedItems[activeIncludedIdx].detail}</p>
                    </div>
                  </div>

                  {/* 5 Mini Interactive Thumbnails Bar */}
                  <div className="kmb-kit-mini-strip">
                    {kitIncludedItems.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveIncludedIdx(idx)}
                        className={`kmb-kit-mini-btn ${
                          activeIncludedIdx === idx ? 'active' : ''
                        }`}
                      >
                        <span className="kmb-kit-mini-icon">{item.icon}</span>
                        <span className="kmb-kit-mini-label">{item.shortTag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </StickyCardWrapper>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2.5 PROCESO DE USO PASO A PASO — HORIZONTAL SCROLL (AGUA & TIERRA)
              REAL PRODUCT CUTOUTS + HAND-DRAWN INK HANDS (IMG2)
         ===================================================================== */}
      <section className="kmb-process-scroll-section" id="proceso-uso">
        <div className="kmb-container">
          <div className="kmb-proc-header">
            <div className="kmb-proc-title-group">
              <span className="kmb-vt-eyebrow">
                {isEs
                  ? 'Instrucciones de uso · Paso a paso'
                  : 'Instructions for use · Step by step'}
              </span>
              <h2 className="kmb-proc-main-title">
                {isEs ? (
                  <>
                    Cómo preparar tu ceremonia en{' '}
                    <em>{processEnvMode === 'water' ? 'agua' : 'tierra'}</em>.
                  </>
                ) : (
                  <>
                    How to prepare your{' '}
                    <em>{processEnvMode === 'water' ? 'water' : 'earth'}</em>{' '}
                    ceremony.
                  </>
                )}
              </h2>
            </div>

            <div className="kmb-proc-controls-row">
              {/* Environment Divider: Agua vs Tierra */}
              <div className="kmb-proc-env-switch" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={processEnvMode === 'water'}
                  onClick={() => setProcessEnvMode('water')}
                  className={`kmb-proc-env-btn ${
                    processEnvMode === 'water' ? 'active' : ''
                  }`}
                >
                  <span>💧</span>
                  {isEs ? 'Ceremonia en Agua' : 'Water Ceremony'}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={processEnvMode === 'earth'}
                  onClick={() => setProcessEnvMode('earth')}
                  className={`kmb-proc-env-btn ${
                    processEnvMode === 'earth' ? 'active' : ''
                  }`}
                >
                  <span>🌿</span>
                  {isEs ? 'Ceremonia en Tierra' : 'Earth Ceremony'}
                </button>
              </div>

              {/* Horizontal Scroll Arrows */}
              <div className="kmb-carousel-arrows">
                <button
                  type="button"
                  onClick={() => slideProcessBy(-1)}
                  className="kmb-arrow-circle"
                  aria-label={isEs ? 'Paso anterior' : 'Previous step'}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => slideProcessBy(1)}
                  className="kmb-arrow-circle"
                  aria-label={isEs ? 'Siguiente paso' : 'Next step'}
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Scroll Viewport */}
          <div
            ref={procViewportRef}
            className={`kmb-proc-viewport ${isDraggingProc ? 'is-dragging' : ''}`}
            onPointerDown={handleProcPointerDown}
            onPointerMove={handleProcPointerMove}
            onPointerUp={handleProcPointerUp}
            onPointerLeave={handleProcPointerUp}
          >
            <motion.div
              ref={procTrackRef}
              style={{ x: procSmoothX }}
              className="kmb-proc-track"
            >
              {usageProcessSteps.map((st) => (
                <article
                  key={`${processEnvMode}-${st.step}`}
                  className={`kmb-proc-card kmb-proc-card--${processEnvMode}`}
                >
                  {/* TOP HYBRID STAGE: REAL PRODUCT PHOTO + HAND-DRAWN INK HANDS */}
                  <div className="kmb-proc-visual-stage">
                    <div className="kmb-proc-step-badge">
                      <span className="kmb-proc-step-num">
                        {isEs ? `PASO ${st.step}` : `STEP ${st.step}`}
                      </span>
                      <span className="kmb-proc-step-phase">{st.phase}</span>
                    </div>

                    {/* Real Product Photo Layer */}
                    <div className={`kmb-proc-real-layer kmb-proc-real--${st.imgMode}`}>
                      {st.secondaryImg && (
                        <img
                          src={st.secondaryImg}
                          alt=""
                          className="kmb-proc-real-secondary"
                          draggable={false}
                        />
                      )}
                      <img
                        src={st.realImg}
                        alt={st.title}
                        className="kmb-proc-real-primary"
                        draggable={false}
                      />
                    </div>

                    {/* Hand-Drawn Ink Hands + Gesture Line-Art SVG Layer (Inspired by Img2 Manual) */}
                    <svg
                      viewBox="0 0 340 230"
                      fill="none"
                      className="kmb-proc-sketch-svg"
                      aria-hidden="true"
                    >
                      {st.sketchKey === 'step1-sleeve' && (
                        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          {/* Dashed sleeve sliding off to the right + two ink hands pulling gently */}
                          <path
                            d="M 190 48 L 282 32 L 306 50 L 214 66 Z"
                            strokeWidth="1.2"
                            strokeDasharray="4 4"
                            opacity="0.7"
                          />
                          {/* Left hand holding box steady */}
                          <path
                            d="M 22 146 C 44 132, 68 128, 92 134 C 98 136, 98 144, 88 148 C 68 152, 48 156, 26 168"
                            strokeWidth="1.7"
                          />
                          {/* Right hand sliding sleeve off */}
                          <path
                            d="M 318 96 C 294 84, 268 82, 246 92 C 240 96, 242 104, 254 106 C 274 110, 294 112, 316 120"
                            strokeWidth="1.7"
                          />
                          {/* Curved arrow showing sleeve removal */}
                          <path d="M 244 56 C 272 44, 296 46, 316 58" strokeWidth="1.5" />
                          <path d="M 310 50 L 318 59 L 306 62" strokeWidth="1.5" />
                        </g>
                      )}

                      {st.sketchKey === 'step2-open' && (
                        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          {/* Hand lifting open lid + arrow pointing to note cards & soy pen on flat surface */}
                          <path
                            d="M 38 88 C 64 74, 92 72, 116 82 C 122 86, 120 94, 108 96 C 88 100, 64 100, 36 110"
                            strokeWidth="1.7"
                          />
                          <path d="M 134 72 C 148 46, 178 38, 206 46" strokeWidth="1.4" strokeDasharray="3 3" />
                          <path d="M 200 39 L 208 47 L 198 52" strokeWidth="1.4" />
                          {/* Sketched note card + pen icon in top-right */}
                          <rect x="242" y="38" width="54" height="38" rx="4" transform="rotate(-6 242 38)" strokeWidth="1.3" />
                          <line x1="252" y1="52" x2="284" y2="49" strokeWidth="1.1" />
                          <line x1="254" y1="61" x2="276" y2="59" strokeWidth="1.1" />
                          <path d="M 248 92 L 298 76 L 304 78 L 252 96 Z" strokeWidth="1.2" />
                        </g>
                      )}

                      {st.sketchKey === 'step3-ashes' && (
                        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          {/* Two ink hands gently lowering/pouring the ash bag into the open urn chamber */}
                          <path
                            d="M 68 58 C 94 48, 120 50, 142 62 C 148 66, 146 74, 134 76 C 114 78, 92 76, 64 82"
                            strokeWidth="1.7"
                          />
                          <path
                            d="M 272 58 C 246 48, 220 50, 198 62 C 192 66, 194 74, 206 76 C 226 78, 248 76, 276 82"
                            strokeWidth="1.7"
                          />
                          {/* Downward placement arrow + gentle ash/granule dots */}
                          <path d="M 170 92 L 170 138" strokeWidth="1.5" strokeDasharray="3 3" />
                          <path d="M 163 131 L 170 140 L 177 131" strokeWidth="1.5" />
                          <circle cx="156" cy="116" r="1.8" fill="currentColor" />
                          <circle cx="184" cy="122" r="1.8" fill="currentColor" />
                          <circle cx="162" cy="130" r="1.5" fill="currentColor" />
                        </g>
                      )}

                      {st.sketchKey === 'step4-notes' && (
                        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          {/* Hand holding soy pen writing heartfelt note with heart + curved arrow into urn */}
                          <rect x="44" y="34" width="76" height="58" rx="5" transform="rotate(-5 44 34)" strokeWidth="1.4" />
                          <path
                            d="M 78 52 C 75 47, 68 47, 68 53 C 68 58, 78 64, 78 64 C 78 64, 88 58, 88 53 C 88 47, 81 47, 78 52 Z"
                            strokeWidth="1.3"
                          />
                          <line x1="56" y1="73" x2="104" y2="69" strokeWidth="1.1" />
                          <line x1="58" y1="81" x2="92" y2="78" strokeWidth="1.1" />
                          {/* Writing hand with pen */}
                          <path
                            d="M 164 42 C 144 54, 126 68, 112 84 C 106 90, 112 96, 122 92 C 138 84, 154 72, 178 62"
                            strokeWidth="1.6"
                          />
                          <path d="M 110 86 L 96 96" strokeWidth="1.5" />
                          {/* Arrow placing note into the urn */}
                          <path d="M 88 104 C 98 132, 122 146, 150 144" strokeWidth="1.4" />
                          <path d="M 143 138 L 152 144 L 144 151" strokeWidth="1.4" />
                        </g>
                      )}

                      {st.sketchKey === 'step5-close' && (
                        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          {/* Both hands smoothing the closed box and sliding the sleeve into center */}
                          <path
                            d="M 28 118 C 54 104, 80 102, 106 112 C 112 116, 110 124, 98 128 C 76 132, 54 134, 24 144"
                            strokeWidth="1.7"
                          />
                          <path
                            d="M 312 118 C 286 104, 260 102, 234 112 C 228 116, 230 124, 242 128 C 264 132, 286 134, 316 144"
                            strokeWidth="1.7"
                          />
                          {/* Centering arrows */}
                          <path d="M 74 72 L 118 84" strokeWidth="1.4" />
                          <path d="M 111 76 L 120 85 L 108 88" strokeWidth="1.4" />
                          <path d="M 266 72 L 222 84" strokeWidth="1.4" />
                          <path d="M 229 76 L 220 85 L 232 88" strokeWidth="1.4" />
                        </g>
                      )}

                      {st.sketchKey === 'step6-carry' && (
                        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          {/* Two cradling palms supporting the urn from underneath without turning it over (Img2 Step 6) */}
                          <path
                            d="M 24 186 C 52 168, 84 164, 124 172 C 142 175, 156 180, 162 186 C 152 194, 124 196, 92 192 C 68 190, 46 198, 20 210"
                            strokeWidth="1.8"
                          />
                          <path d="M 106 168 C 124 160, 142 162, 154 170" strokeWidth="1.4" />
                          <path
                            d="M 316 186 C 288 168, 256 164, 216 172 C 198 175, 184 180, 178 186 C 188 194, 216 196, 248 192 C 272 190, 294 198, 320 210"
                            strokeWidth="1.8"
                          />
                          <path d="M 234 168 C 216 160, 198 162, 186 170" strokeWidth="1.4" />
                          {/* Horizontal level indicator */}
                          <line x1="96" y1="44" x2="244" y2="44" strokeWidth="1.1" strokeDasharray="4 4" opacity="0.65" />
                        </g>
                      )}

                      {st.sketchKey === 'step7-water-prick' && (
                        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          {/* Hand with index finger gently pricking the corner squares (Img2 Step 7) */}
                          <path
                            d="M 278 32 C 254 48, 232 68, 214 92 C 208 100, 216 108, 226 102 C 246 88, 268 72, 296 58"
                            strokeWidth="1.8"
                          />
                          {/* Corner perforation squares + concentric press rings */}
                          <rect x="198" y="94" width="12" height="10" rx="2" strokeWidth="1.5" />
                          <circle cx="204" cy="99" r="14" strokeWidth="1.1" strokeDasharray="3 3" />
                          <rect x="114" y="114" width="11" height="9" rx="2" strokeWidth="1.3" opacity="0.75" />
                          <circle cx="119" cy="118" r="11" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
                          <rect x="164" y="148" width="11" height="9" rx="2" strokeWidth="1.3" opacity="0.75" />
                          <circle cx="169" cy="152" r="11" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
                        </g>
                      )}

                      {st.sketchKey === 'step8-water-float' && (
                        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          {/* Gentle hands releasing the urn onto drawn ocean/lake waves (Img2 Step 8) */}
                          <path
                            d="M 26 98 C 48 86, 72 86, 94 94 C 100 98, 98 106, 88 108 C 68 110, 48 112, 22 120"
                            strokeWidth="1.6"
                          />
                          <path
                            d="M 314 98 C 292 86, 268 86, 246 94 C 240 98, 242 106, 252 108 C 272 110, 292 112, 318 120"
                            strokeWidth="1.6"
                          />
                          {/* Drawn water waves & peaceful descent ripples */}
                          <path
                            d="M 18 176 Q 58 162, 98 176 T 178 176 T 258 176 T 324 176"
                            strokeWidth="1.6"
                          />
                          <path
                            d="M 34 194 Q 74 182, 114 194 T 194 194 T 274 194 T 312 194"
                            strokeWidth="1.3"
                            opacity="0.7"
                          />
                          <path
                            d="M 64 210 Q 114 200, 164 210 T 264 210"
                            strokeWidth="1.1"
                            strokeDasharray="4 5"
                            opacity="0.55"
                          />
                        </g>
                      )}

                      {st.sketchKey === 'step7-earth-bed' && (
                        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          {/* Drawn hands preparing fertile soil cradle + petals & seeds */}
                          <path
                            d="M 26 112 C 52 98, 78 98, 102 108 C 108 112, 106 120, 94 122 C 74 124, 52 126, 24 136"
                            strokeWidth="1.6"
                          />
                          <path
                            d="M 314 112 C 288 98, 262 98, 238 108 C 232 112, 234 120, 246 122 C 266 124, 288 126, 316 136"
                            strokeWidth="1.6"
                          />
                          {/* Soil contour bed & botanical leaves */}
                          <path
                            d="M 24 172 C 74 174, 96 204, 170 204 C 244 204, 266 174, 316 172"
                            strokeWidth="1.6"
                          />
                          <path
                            d="M 44 188 C 88 192, 112 214, 170 214 C 228 214, 252 192, 296 188"
                            strokeWidth="1.2"
                            strokeDasharray="4 4"
                            opacity="0.65"
                          />
                        </g>
                      )}

                      {st.sketchKey === 'step8-earth-bloom' && (
                        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          {/* Drawn hands covering with soil + sprouting sapling emerging above */}
                          <path
                            d="M 34 142 C 60 128, 86 128, 110 138 C 116 142, 114 150, 102 152 C 82 154, 60 156, 32 164"
                            strokeWidth="1.6"
                          />
                          <path
                            d="M 306 142 C 280 128, 254 128, 230 138 C 224 142, 226 150, 238 152 C 258 154, 280 156, 308 164"
                            strokeWidth="1.6"
                          />
                          {/* Sprouting botanical tree sapling rising from the urn */}
                          <path d="M 170 106 Q 172 64, 170 26" strokeWidth="1.7" />
                          <path d="M 170 68 Q 144 54, 134 36 Q 158 38, 170 58" strokeWidth="1.4" />
                          <path d="M 170 54 Q 196 40, 206 22 Q 182 24, 170 44" strokeWidth="1.4" />
                          {/* Gentle soil horizon & roots */}
                          <path d="M 28 184 Q 102 172, 170 182 T 312 180" strokeWidth="1.5" />
                        </g>
                      )}
                    </svg>
                  </div>

                  {/* BOTTOM STEP DESCRIPTION */}
                  <div className="kmb-proc-body">
                    <h3 className="kmb-proc-card-title">{st.title}</h3>
                    <p className="kmb-proc-card-desc">{st.desc}</p>
                  </div>
                </article>
              ))}
            </motion.div>
          </div>

          {/* Progress Bar + Caption */}
          <div className="kmb-proc-footer-bar">
            <div className="kmb-carousel-progress-track">
              <div
                className="kmb-carousel-progress-fill"
                style={{
                  transform: `scaleX(${Math.max(0.15, procProgress)})`,
                }}
              />
            </div>
            <span className="kmb-proc-drag-hint">
              {isEs
                ? 'Desliza horizontalmente para ver los 8 pasos · Incluye instructivo impreso en cada urna'
                : 'Drag horizontally to explore all 8 steps · Printed guide included inside every urn'}
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. SECCIÓN 3 PRODUCTOS: VISUAL GALLERY CARDS (85% VISUAL, ZERO SPEC LISTS)
         ===================================================================== */}
      <section className="kmb-visual-trio-section" id="comparativa">
        <div className="kmb-container">
          <div className="kmb-vt-header">
            <span className="kmb-vt-eyebrow">
              {isEs ? 'Tres ediciones orgánicas' : 'Three organic editions'}
            </span>
            <h2 className="kmb-compare-main-title">
              {isEs ? '¿Qué Kamibi elegir?' : 'Which Kamibi is right for you?'}
            </h2>
          </div>

          <div className="kmb-visual-trio-grid">
            {appleComparisonCols.map((col) => {
              const activeIdx = compSwatchIdx[col.key] || 0;
              const activeSwatch = col.swatches[activeIdx] || col.swatches[0];
              const displayPrice = activeSwatch.priceOverride ?? col.price;
              const swatchFeedbackKey = `${activeSwatch.slug}:${activeSwatch.variantChoice || ''}`;

              return (
                <div
                  key={col.key}
                  className={`kmb-vt-card kmb-vt-card--${col.theme}`}
                  style={{ '--swatch-accent': activeSwatch.hex }}
                >
                  {/* TOP STUDIO PEDESTAL STAGE: ORGANIC ATMOSPHERE + DELICATE SVG + FLOATING 3D URN */}
                  <div
                    className={`kmb-vt-stage kmb-vt-stage--${col.theme}`}
                    onClick={() =>
                      navigateToProduct(activeSwatch.slug, activeSwatch.variantChoice)
                    }
                  >
                    {/* Dynamic Swatch Aura + Delicate Botanical/Coastal SVG Watermark */}
                    <div className="kmb-vt-ambient-glow" />

                    {col.theme === 'water' && (
                      <svg
                        className="kmb-vt-stage-svg"
                        viewBox="0 0 400 280"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="320" cy="64" r="38" stroke="currentColor" strokeWidth="1" opacity="0.28" />
                        <path d="M-20 220 C60 198, 140 242, 220 218 C300 194, 360 232, 420 212" stroke="currentColor" strokeWidth="1.2" opacity="0.32" />
                        <path d="M-20 242 C70 224, 150 258, 240 236 C320 216, 370 246, 420 232" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" opacity="0.24" />
                        {/* Coastal reeds left */}
                        <path d="M36 250 Q48 165 24 85" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
                        <path d="M50 250 Q66 175 78 102" stroke="currentColor" strokeWidth="1.1" opacity="0.28" />
                        <path d="M44 148 Q26 135 16 142" stroke="currentColor" strokeWidth="1" opacity="0.28" />
                        <path d="M58 166 Q76 152 88 158" stroke="currentColor" strokeWidth="1" opacity="0.25" />
                        {/* Sea kelp right */}
                        <path d="M362 248 C348 205, 374 165, 356 118" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
                        <path d="M360 168 C346 158, 344 144, 356 138" stroke="currentColor" strokeWidth="1" opacity="0.25" />
                      </svg>
                    )}

                    {col.theme === 'earth' && (
                      <svg
                        className="kmb-vt-stage-svg"
                        viewBox="0 0 400 280"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M-20 232 Q110 202 220 226 T420 216" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
                        {/* Delicate layered pine left */}
                        <line x1="46" y1="78" x2="46" y2="235" stroke="currentColor" strokeWidth="1.2" opacity="0.32" />
                        <path d="M46 84 L26 116 L66 116 Z" stroke="currentColor" strokeWidth="1.1" opacity="0.28" />
                        <path d="M46 106 L20 146 L72 146 Z" stroke="currentColor" strokeWidth="1.1" opacity="0.28" />
                        <path d="M46 132 L14 178 L78 178 Z" stroke="currentColor" strokeWidth="1.1" opacity="0.24" />
                        {/* Eucalyptus stem right */}
                        <path d="M356 234 Q344 162 366 88" stroke="currentColor" strokeWidth="1.2" opacity="0.32" />
                        <ellipse cx="345" cy="158" rx="11" ry="6" transform="rotate(-28 345 158)" stroke="currentColor" strokeWidth="1" opacity="0.28" />
                        <ellipse cx="367" cy="136" rx="11" ry="6" transform="rotate(24 367 136)" stroke="currentColor" strokeWidth="1" opacity="0.28" />
                        <ellipse cx="349" cy="114" rx="9" ry="5" transform="rotate(-22 349 114)" stroke="currentColor" strokeWidth="1" opacity="0.26" />
                      </svg>
                    )}

                    {col.theme === 'minis' && (
                      <svg
                        className="kmb-vt-stage-svg"
                        viewBox="0 0 400 280"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M-20 230 Q130 208 250 226 T420 218" stroke="currentColor" strokeWidth="1.1" opacity="0.3" />
                        {/* Wildflower stem left */}
                        <path d="M44 236 Q58 164 38 96" stroke="currentColor" strokeWidth="1.2" opacity="0.34" />
                        <circle cx="38" cy="92" r="4" stroke="currentColor" strokeWidth="1.1" opacity="0.36" />
                        <circle cx="38" cy="82" r="4.5" stroke="currentColor" strokeWidth="1" opacity="0.26" />
                        <circle cx="38" cy="102" r="4.5" stroke="currentColor" strokeWidth="1" opacity="0.26" />
                        <circle cx="28" cy="92" r="4.5" stroke="currentColor" strokeWidth="1" opacity="0.26" />
                        <circle cx="48" cy="92" r="4.5" stroke="currentColor" strokeWidth="1" opacity="0.26" />
                        {/* Lavender stem right */}
                        <path d="M356 236 Q342 168 364 102" stroke="currentColor" strokeWidth="1.2" opacity="0.32" />
                        <ellipse cx="356" cy="142" rx="6" ry="3.2" transform="rotate(-30 356 142)" stroke="currentColor" strokeWidth="1" opacity="0.28" />
                        <ellipse cx="366" cy="128" rx="6" ry="3.2" transform="rotate(30 366 128)" stroke="currentColor" strokeWidth="1" opacity="0.28" />
                        <ellipse cx="359" cy="114" rx="5.5" ry="3" transform="rotate(-28 359 114)" stroke="currentColor" strokeWidth="1" opacity="0.28" />
                      </svg>
                    )}

                    {/* Top Editorial Header inside Stage */}
                    <div className="kmb-vt-top-bar">
                      <span className="kmb-vt-env-pill">
                        <strong className="kmb-vt-index">{col.indexNum}</strong>
                        <span className="kmb-vt-env-dot" />
                        {col.envTag}
                      </span>
                      <span className={`kmb-vt-badge-pill kmb-vt-badge--${col.theme}`}>
                        {col.badge}
                      </span>
                    </div>

                    {/* Floating 3D Studio Cutout Urn + Grounded Plinth Shadow */}
                    <div className="kmb-vt-urn-center">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeSwatch.img}
                          src={activeSwatch.img}
                          alt={activeSwatch.name}
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.94, y: -6 }}
                          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                          className="kmb-vt-urn-img"
                        />
                      </AnimatePresence>
                      <div className="kmb-vt-floor-shadow" />
                    </div>

                    {/* Interactive Band Color Swatch Selector */}
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

                  {/* BOTTOM EDITORIAL BODY: DYNAMIC MODEL NAME + 3-COLUMN SPEC STRIP + PRICE CTA */}
                  <div className="kmb-vt-footer">
                    <div className="kmb-vt-heading-block">
                      <h3
                        className="kmb-vt-title"
                        onClick={() =>
                          navigateToProduct(activeSwatch.slug, activeSwatch.variantChoice)
                        }
                      >
                        {activeSwatch.modelTitle}
                      </h3>
                      <p className="kmb-vt-edition-sub">
                        {activeSwatch.editionSub}
                      </p>
                    </div>

                    {/* Clean 3-Column Architectural Spec Strip (Zero Emojis) */}
                    <div className="kmb-vt-spec-grid">
                      {col.specs.map((sp, idx) => (
                        <div key={idx} className="kmb-vt-spec-cell">
                          <strong>{sp.val}</strong>
                          <span>{sp.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price Lockup + Action Buttons */}
                    <div className="kmb-vt-cta-row">
                      <div className="kmb-vt-price-block">
                        <span className="kmb-vt-price-caption">
                          {isEs ? 'Precio' : 'Price'}
                        </span>
                        <div className="kmb-vt-price-values">
                          <strong>${Number(displayPrice).toFixed(2)}</strong>
                          <small>USD</small>
                          {col.originalPrice && !activeSwatch.priceOverride && (
                            <s>${Number(col.originalPrice).toFixed(2)}</s>
                          )}
                        </div>
                      </div>

                      <div className="kmb-vt-actions-right">
                        <button
                          type="button"
                          onClick={() =>
                            handleDirectBuy({
                              ...activeSwatch,
                              price: displayPrice,
                              feedbackKey: swatchFeedbackKey,
                            })
                          }
                          className={`kmb-pill-cta-solid kmb-vt-buy-btn ${
                            addedProductId === swatchFeedbackKey ? 'added' : ''
                          }`}
                        >
                          {addedProductId === swatchFeedbackKey
                            ? isEs
                              ? '✓ Añadido'
                              : '✓ Added'
                            : isEs
                            ? 'Comprar'
                            : 'Buy'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigateToProduct(activeSwatch.slug, activeSwatch.variantChoice)
                          }
                          className="kmb-vt-detail-btn"
                          title={isEs ? 'Ver ficha completa' : 'View full details'}
                          aria-label={isEs ? 'Ver detalles del producto' : 'View product details'}
                        >
                          ↗
                        </button>
                      </div>
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
            <h2 className="kmb-carousel-title">
              {isEs ? 'Toda la colección.' : 'The full collection.'}
            </h2>

            <div className="kmb-carousel-controls-row">
              <div className="kmb-carousel-filters">
                {[
                  { id: 'all', label: isEs ? 'Todos' : 'All' },
                  { id: 'urns', label: isEs ? 'Urnas ($76.50 – $90)' : 'Urns ($76.50 – $90)' },
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
                  aria-label={isEs ? 'Anterior' : 'Previous'}
                >
                  ‹
                </button>
                <button
                  onClick={() => slideCarouselBy(1)}
                  disabled={carouselProgress >= 0.98 && maxScroll > 0}
                  className="kmb-arrow-btn"
                  aria-label={isEs ? 'Siguiente' : 'Next'}
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
              <div className="kmb-carousel-loading">
                {isEs ? 'Cargando colección...' : 'Loading collection...'}
              </div>
            ) : (
              <motion.div
                ref={trackRef}
                style={{ x: smoothX }}
                className="kmb-spring-carousel-track"
              >
                <AnimatePresence mode="popLayout">
                  {filteredCarouselProducts.map((prod, idx) => {
                    const activeVarLabel =
                      carouselVariantMap[prod.slug] ||
                      CLEAN_URN_DEFAULT_VARIANT[prod.slug] ||
                      prod.defaultVariant ||
                      prod.variants?.[0] ||
                      null;
                    const activeVo =
                      prod.variantObjects?.find((v) => v.label === activeVarLabel) ||
                      null;
                    const cardDisplayImg =
                      activeVo?.cutoutImage ||
                      CLEAN_URN_CUTOUTS[prod.slug] ||
                      activeVo?.image ||
                      prod.images?.[0];
                    const catFeedbackKey = `cat-${prod.slug}-${activeVarLabel || 'default'}`;

                    return (
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
                            if (!isDraggingCarousel) {
                              navigateToProduct(prod.slug, activeVarLabel);
                            }
                          }}
                        >
                          <img
                            src={cardDisplayImg}
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
                          {prod.variantObjects?.length > 0 ? (
                            <div
                              className="kmb-prod-swatch-row"
                              onClick={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              <div className="kmb-prod-swatch-dots">
                                {prod.variantObjects.map((vo) => (
                                  <button
                                    key={vo.label}
                                    type="button"
                                    onClick={() =>
                                      setCarouselVariantMap((prev) => ({
                                        ...prev,
                                        [prod.slug]: vo.label,
                                      }))
                                    }
                                    className={`kmb-prod-swatch-dot ${
                                      activeVarLabel === vo.label ? 'active' : ''
                                    }`}
                                    style={{
                                      backgroundColor:
                                        VARIANT_HEX_MAP[vo.label] || '#8FA68E',
                                    }}
                                    title={vo.label}
                                    aria-label={vo.label}
                                  />
                                ))}
                              </div>
                              <span className="kmb-prod-color-name">
                                {activeVarLabel}
                              </span>
                            </div>
                          ) : (
                            <span className="kmb-prod-color-name">
                              {prod.category === 'minis'
                                ? isEs
                                  ? 'Set Familiar × 4'
                                  : 'Family Set × 4'
                                : 'Pack × 2'}
                            </span>
                          )}

                          <h3
                            className="kmb-prod-title"
                            onClick={() => {
                              if (!isDraggingCarousel) {
                                navigateToProduct(prod.slug, activeVarLabel);
                              }
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
                              onClick={() =>
                                handleDirectBuy({
                                  ...prod,
                                  variantChoice: activeVarLabel,
                                  variantId: activeVo?.variantId || null,
                                  img: cardDisplayImg,
                                  feedbackKey: catFeedbackKey,
                                })
                              }
                              className={`kmb-prod-buy-btn ${
                                addedProductId === catFeedbackKey ? 'added' : ''
                              }`}
                            >
                              {addedProductId === catFeedbackKey
                                ? isEs
                                  ? '✓ Añadido'
                                  : '✓ Added'
                                : isEs
                                ? 'Comprar'
                                : 'Buy'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
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
              <span>
                {isEs ? '4.9 / 5 • Familias Kamibi' : '4.9 / 5 • Kamibi Families'}
              </span>
            </div>
            <h2 className="kmb-section-heading">
              {isEs ? 'Recuerdos que permanecen.' : 'Memories that endure.'}
            </h2>
          </div>
        </div>

        <div className="kmb-polaroid-stage-wrap">
          <PolaroidLineCarousel
            slides={polaroidReviews}
            locale={locale}
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
                aria-label={isEs ? 'Cerrar' : 'Close'}
              >
                ✕
              </button>

              <div className="kmb-modal-body">
                <span className="kmb-section-eyebrow">
                  {isEs ? 'EL RITUAL KAMIBI' : 'THE KAMIBI RITUAL'}
                </span>
                <h3 className="kmb-modal-title">
                  {isEs ? 'Tres pasos simples.' : 'Three simple steps.'}
                </h3>

                <div className="kmb-modal-steps">
                  <div className="kmb-modal-step">
                    <span className="kmb-step-num">01</span>
                    <div>
                      <h4>
                        {isEs ? 'Mensajes de despedida' : 'Farewell messages'}
                      </h4>
                      <p>
                        {isEs
                          ? 'Escribe tus palabras en las hojas biodegradables con el lápiz compostable incluido y colócalas junto a las cenizas.'
                          : 'Write your thoughts on the biodegradable note cards using the included compostable pencil and place them beside the ashes.'}
                      </p>
                    </div>
                  </div>
                  <div className="kmb-modal-step">
                    <span className="kmb-step-num">02</span>
                    <div>
                      <h4>
                        {isEs
                          ? 'Ceremonia en Agua o Tierra'
                          : 'Water or Earth ceremony'}
                      </h4>
                      <p>
                        {isEs
                          ? 'Deposita la urna en el mar, lago o jardín natural.'
                          : 'Gently place the urn on the ocean, lake, or natural garden.'}
                      </p>
                    </div>
                  </div>
                  <div className="kmb-modal-step">
                    <span className="kmb-step-num">03</span>
                    <div>
                      <h4>
                        {isEs
                          ? 'Reintegración 100% orgánica'
                          : '100% organic return'}
                      </h4>
                      <p>
                        {isEs
                          ? 'Se funde con la naturaleza sin plásticos, pegamentos ni metales.'
                          : 'Blends gently back into nature with zero plastics, glues, or metals.'}
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
                    {isEs ? 'Elegir mi Kamibi' : 'Choose my Kamibi'}
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
