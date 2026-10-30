import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useWixProducts } from '../hooks/useWixProducts';
import { useSEO } from '../hooks/useSEO';
import './UrnaBiodegradableLanding.css';

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
    titleEs: 'Urna Biodegradable Kamibi — Regresa a la Naturaleza. Nada Menos.',
    titleEn: 'Kamibi Biodegradable Urn — Return to Nature. Nothing Less.',
    descEs: 'Una despedida ecológica, digna y eterna. Urna biodegradable 100% orgánica para ceremonias en tierra o mar.',
    descEn: 'An eco-friendly, dignified and eternal farewell. 100% organic biodegradable urn for earth or water ceremonies.',
    locale,
    noindex: true,
  });

  // Interactive states
  const [activeModal, setActiveModal] = useState(null); // 'how-it-works' | 'materials' | null
  const [featureTab, setFeatureTab] = useState('earth'); // 'earth' | 'water'
  const [addedProductId, setAddedProductId] = useState(null);

  // Comparison models definition
  const comparisonModels = [
    {
      id: 'terra-urn',
      slug: 'terra-urn',
      name: 'Kamibi Bios',
      edition: 'Tierra & Árbol',
      image: '/products/terra-urn.png',
      price: 189.00,
      originalPrice: null,
      palette: ['#C4856A', '#E8DED1', '#8B9E8B'],
      specs: {
        material: 'Sustrato vegetal, celulosa virgen y semillas',
        time: '2 a 4 semanas en tierra',
        capacity: '3.5 L (Adulto completo)',
        memory: 'Cápsula de germinación y semillas de árbol',
        ceremony: 'Bosque memorial, jardín privado o parque',
        tsa: 'Certificada TSA para cabina'
      }
    },
    {
      id: 'aqua-urn',
      slug: 'aqua-urn',
      name: 'Kamibi Ocean',
      edition: 'Mar & Agua',
      image: '/products/aqua-urn.png',
      price: 165.75,
      originalPrice: 195.00,
      badge: 'Más Elegida',
      palette: ['#B8C5C5', '#FFFFFF', '#9BB1B1'],
      specs: {
        material: 'Sal marina mineral y celulosa hidrosoluble',
        time: '30 minutos en agua (flota 5-10 min)',
        capacity: '3.2 L (Adulto completo)',
        memory: 'Disolución marina limpia sin residuos',
        ceremony: 'Altamar, lago, laguna o río abierto',
        tsa: 'Certificada TSA para cabina'
      }
    },
    {
      id: 'mini-urns',
      slug: 'mini-biodegradables-urn-set',
      name: 'Kamibi Mini',
      edition: 'Set Familiar & Mascotas',
      image: '/products/mini-urns.png',
      price: 49.99,
      originalPrice: null,
      palette: ['#E8DED1', '#C4856A', '#D4A5A5'],
      specs: {
        material: 'Fibra vegetal compacta y aglutinantes botánicos',
        time: '1 a 3 semanas en tierra o agua dulce',
        capacity: '0.4 L × 4 unidades (Set de 4)',
        memory: 'Homenaje compartido entre varios familiares',
        ceremony: 'Ceremonias múltiples o memorial de mascotas',
        tsa: 'Certificada TSA para cabina'
      }
    }
  ];

  // Carousel ref and scroll handling
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
    setTimeout(checkScroll, 350);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Direct Add To Cart handler
  const handleDirectBuy = (productData) => {
    const matched = products.find(p => p.slug === productData.slug || p.id === productData.id);
    const itemToAdd = matched || {
      id: productData.id,
      _wixId: productData._wixId,
      name: productData.name,
      price: productData.price,
      slug: productData.slug,
      images: [productData.image],
    };

    addToCart(itemToAdd, 1);
    setAddedProductId(productData.id);
    setTimeout(() => setAddedProductId(null), 2200);
  };

  // Testimonials
  const reviews = [
    {
      id: 1,
      quote: "Hicimos la ceremonia en el mar al amanecer. La urna flotó con una serenidad indescriptible antes de sumergirse suavemente. Saber que no dejamos químicos en el océano hizo el momento perfecto.",
      author: "Elena R. de Mendoza",
      location: "Barcelona, España",
      edition: "Kamibi Ocean (Aqua)",
      date: "Octubre 2026"
    },
    {
      id: 2,
      quote: "Plantamos la urna con las semillas de árbol en el jardín familiar. Ver brotar nueva vida en el mismo lugar transformó nuestra despedida en una hermosa memoria viva.",
      author: "Marcus & Claudia G.",
      location: "Ciudad de México",
      edition: "Kamibi Bios (Terra)",
      date: "Septiembre 2026"
    },
    {
      id: 3,
      quote: "El set mini nos permitió a mis tres hermanos rendir un homenaje íntimo en el lugar favorito de nuestra madre. La calidad, el empaque y la textura son de un nivel insuperable.",
      author: "Sofía Valenzuela",
      location: "Santiago, Chile",
      edition: "Kamibi Mini (Set)",
      date: "Octubre 2026"
    }
  ];

  return (
    <div className="apple-landing">

      {/* =========================================================
          1. HERO SECTION (Apple Watch Style)
         ========================================================= */}
      <section className="apple-hero">
        <div className="apple-hero-container">

          {/* Minimalist Sub-brand Eyebrow */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="apple-hero-eyebrow"
          >
            <span className="eyebrow-brand">KAMIBI</span>
            <span className="eyebrow-divider">|</span>
            <span className="eyebrow-model">URNA BIODEGRADABLE</span>
          </motion.div>

          {/* Huge Apple-style H1 Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="apple-hero-h1"
          >
            Regresa a la naturaleza.<br className="br-desktop" /> Nada menos.
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="apple-hero-sub"
          >
            Una despedida ecológica, digna y eterna. Fabricada con materiales 100% orgánicos que se integran armónicamente con el planeta.
          </motion.p>

          {/* Primary & Secondary Action buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="apple-hero-cta-group"
          >
            <button 
              onClick={() => scrollToSection('comparativa')}
              className="apple-btn-pill"
            >
              Comprar ahora
            </button>
            <button 
              onClick={() => setActiveModal('how-it-works')}
              className="apple-link-chevron"
            >
              Ver cómo funciona <span className="chevron-arrow">›</span>
            </button>
          </motion.div>

          {/* Price line */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="apple-hero-price-line"
          >
            <span>Desde $165.75 USD</span>
            <span className="dot-sep">•</span>
            <span>Envío prioritario express incluido</span>
          </motion.div>

          {/* Twin Urns Floating Centerpiece (Apple Watch Duo composition) */}
          <div className="apple-hero-stage">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 35 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="apple-duo-wrapper"
            >
              {/* Urn 1: Terra (Front Left - floating with subtle angle) */}
              <div className="duo-item duo-terra">
                <img 
                  src="/products/terra-urn.png" 
                  alt="Urna Biodegradable Kamibi Terra cerrada con acabados orgánicos" 
                  className="duo-img"
                />
                <div className="duo-shadow"></div>
                <div className="duo-pill-label">
                  <span className="dot-terra"></span> Kamibi Bios
                </div>
              </div>

              {/* Urn 2: Aqua (Angled Right - intertwining in perspective) */}
              <div className="duo-item duo-aqua">
                <img 
                  src="/products/aqua-urn.png" 
                  alt="Urna Biodegradable Kamibi Aqua para ceremonia en el agua" 
                  className="duo-img"
                />
                <div className="duo-shadow"></div>
                <div className="duo-pill-label">
                  <span className="dot-aqua"></span> Kamibi Ocean
                </div>
              </div>
            </motion.div>

            {/* Apple micro-badges */}
            <div className="apple-badges-row">
              <span className="micro-badge">100% Orgánica</span>
              <span className="micro-badge">Disolución Marina o Tierra</span>
              <span className="micro-badge">Aprobada TSA</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          2. ENFOQUE EN CARACTERÍSTICAS (Apple Split-Feature Card)
         ========================================================= */}
      <section className="apple-feature-section" id="caracteristicas">
        <div className="apple-container">
          
          <div className="apple-feature-canvas">
            
            {/* Left Column: Massive High-Definition Urn Visual */}
            <div className="feature-visual-pane">
              <AnimatePresence mode="wait">
                <motion.div
                  key={featureTab}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="feature-img-box"
                >
                  <img 
                    src={featureTab === 'earth' ? '/products/terra-urn.png' : '/products/aqua-urn.png'} 
                    alt="Detalle de diseño e ingeniería biodegradable Kamibi"
                    className="feature-hero-img"
                  />
                  <div className="feature-soft-shadow"></div>
                </motion.div>
              </AnimatePresence>

              {/* Apple-style Interactive Toggle Pills */}
              <div className="feature-toggle-bar">
                <button 
                  onClick={() => setFeatureTab('earth')}
                  className={`toggle-pill ${featureTab === 'earth' ? 'active' : ''}`}
                >
                  Tierra & Árbol
                </button>
                <button 
                  onClick={() => setFeatureTab('water')}
                  className={`toggle-pill ${featureTab === 'water' ? 'active' : ''}`}
                >
                  Agua & Mar
                </button>
              </div>
            </div>

            {/* Right Column: Clean spacious typography */}
            <div className="feature-text-pane">
              <span className="apple-eyebrow-green">Diseñada para florecer.</span>
              
              <h2 className="feature-headline">
                Biodegradación natural controlada en tierra o agua.
              </h2>

              <p className="feature-paragraph">
                Kamibi está fabricada con compuestos orgánicos que protegen las cenizas de tu ser querido hasta el momento de su contacto con la naturaleza, disolviéndose de manera segura sin dejar residuos químicos ni alterar el ecosistema.
              </p>

              {/* Minimalist Key Metrics */}
              <div className="feature-metrics-grid">
                <div className="metric-box">
                  <span className="metric-number">100%</span>
                  <span className="metric-label">Compuestos botánicos y arcilla mineral</span>
                </div>
                <div className="metric-box">
                  <span className="metric-number">0%</span>
                  <span className="metric-label">Residuos químicos, resinas o metales</span>
                </div>
                <div className="metric-box">
                  <span className="metric-number">{featureTab === 'earth' ? '2 a 4 sem' : '30 min'}</span>
                  <span className="metric-label">{featureTab === 'earth' ? 'Integración en el suelo' : 'Disolución en el agua'}</span>
                </div>
              </div>

              {/* Buttons: Saber más > Ver materiales > */}
              <div className="feature-links-row">
                <button 
                  onClick={() => setActiveModal('how-it-works')}
                  className="apple-link-chevron"
                >
                  Saber más <span className="chevron-arrow">›</span>
                </button>
                <button 
                  onClick={() => setActiveModal('materials')}
                  className="apple-link-chevron"
                >
                  Ver materiales <span className="chevron-arrow">›</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          3. SECCIÓN SECUNDARIA (Bloque con Contraste Suave)
         ========================================================= */}
      <section className="apple-contrast-section" id="memorial-pack">
        <div className="apple-container">
          
          <div className="apple-pastel-card">
            
            <div className="pastel-card-text">
              <span className="pastel-eyebrow">COLECCIÓN MEMORIAL</span>
              
              <h2 className="pastel-title">
                Todo lo que buscas para un homenaje único. Por menos de lo que imaginas.
              </h2>

              <p className="pastel-desc">
                Cada urna Kamibi incluye su kit completo de homenaje: urna de celulosa ecológica, bolsa hidrosoluble de transferencia segura, semillas nativas y empaque biodegradable conmemorativo.
              </p>

              <div className="pastel-actions">
                <button 
                  onClick={() => scrollToSection('comparativa')}
                  className="apple-btn-pill"
                >
                  Ver precios y paquetes <span className="chevron-arrow">›</span>
                </button>
              </div>

              <div className="pastel-pillars">
                <span>✓ Kit de siembra incluido</span>
                <span>✓ Envío prioritario 24-48h</span>
                <span>✓ Garantía total de satisfacción</span>
              </div>
            </div>

            <div className="pastel-card-art">
              <div className="art-composition-wrap">
                <img 
                  src="/images/caja-terra.png" 
                  alt="Empaque conmemorativo ecológico Kamibi"
                  className="art-box-img"
                  onError={(e) => { e.currentTarget.src = '/products/terra-urn.png'; }}
                />
                <img 
                  src="/products/aqua-urn.png" 
                  alt="Urna Kamibi Ocean"
                  className="art-floating-urn"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          4. SECCIÓN COMPARATIVA: "¿Qué Urna Kamibi Elegir?"
         ========================================================= */}
      <section className="apple-comparison" id="comparativa">
        <div className="apple-container">
          
          <div className="comparison-header">
            <h2 className="comparison-title">¿Qué Urna Kamibi elegir?</h2>
            <p className="comparison-sub">
              Tres maneras puras de honrar una vida y regresar en paz al ciclo de la naturaleza.
            </p>
          </div>

          {/* 3 Columns Comparison Matrix (Apple Watch Exact Style) */}
          <div className="comparison-matrix">
            {comparisonModels.map((model) => (
              <div key={model.id} className="comparison-column">
                
                {model.badge && (
                  <span className="column-top-badge">{model.badge}</span>
                )}

                {/* Model Image */}
                <div className="column-img-wrap">
                  <img src={model.image} alt={model.name} className="column-product-img" />
                </div>

                {/* Color dots */}
                <div className="column-palette">
                  {model.palette.map((c, i) => (
                    <span key={i} className="swatch-circle" style={{ backgroundColor: c }} />
                  ))}
                </div>

                {/* Model Titles */}
                <h3 className="column-model-name">{model.name}</h3>
                <p className="column-model-edition">{model.edition}</p>

                {/* Price block */}
                <div className="column-price-box">
                  <span className="price-lead">Desde</span>
                  <span className="price-val">${model.price.toFixed(2)} USD</span>
                  {model.originalPrice && (
                    <span className="price-old">${model.originalPrice.toFixed(2)} USD</span>
                  )}
                </div>

                {/* Direct CTA */}
                <button 
                  onClick={() => handleDirectBuy(model)}
                  className={`column-buy-btn ${addedProductId === model.id ? 'is-added' : ''}`}
                >
                  {addedProductId === model.id ? '✓ Añadido al Carrito' : 'Comprar'}
                </button>

                <button 
                  onClick={() => navigate(`/product/${model.slug}`)}
                  className="column-details-link"
                >
                  Ver ficha técnica <span className="chevron-arrow">›</span>
                </button>

                {/* Apple-style Hairline */}
                <div className="column-hairline"></div>

                {/* Clean Specs List */}
                <div className="column-specs">
                  <div className="spec-row">
                    <span className="spec-label">Material</span>
                    <span className="spec-content">{model.specs.material}</span>
                  </div>

                  <div className="spec-row">
                    <span className="spec-label">Tiempo de integración</span>
                    <span className="spec-content spec-highlight">{model.specs.time}</span>
                  </div>

                  <div className="spec-row">
                    <span className="spec-label">Capacidad</span>
                    <span className="spec-content">{model.specs.capacity}</span>
                  </div>

                  <div className="spec-row">
                    <span className="spec-label">Tipo de recuerdo</span>
                    <span className="spec-content">{model.specs.memory}</span>
                  </div>

                  <div className="spec-row">
                    <span className="spec-label">Ceremonia sugerida</span>
                    <span className="spec-content">{model.specs.ceremony}</span>
                  </div>

                  <div className="spec-row">
                    <span className="spec-label">Viaje aéreo</span>
                    <span className="spec-content spec-highlight">{model.specs.tsa}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================
          5. CARRUSEL DE PRODUCTOS PARA COMPRAR
         ========================================================= */}
      <section className="apple-carousel-wrap" id="catalogo">
        <div className="apple-container">
          
          <div className="carousel-top-bar">
            <div>
              <span className="carousel-eyebrow">COLECCIÓN KAMIBI</span>
              <h2 className="carousel-h2">Elige tu urna y recíbela en tu hogar.</h2>
            </div>

            <div className="carousel-nav-arrows">
              <button 
                onClick={() => scrollCarousel('left')}
                disabled={!canScrollLeft}
                className="arrow-circle"
                aria-label="Ver productos anteriores"
              >
                ‹
              </button>
              <button 
                onClick={() => scrollCarousel('right')}
                disabled={!canScrollRight}
                className="arrow-circle"
                aria-label="Ver productos siguientes"
              >
                ›
              </button>
            </div>
          </div>

          <div 
            className="carousel-track-smooth"
            ref={carouselRef}
            onScroll={checkScroll}
          >
            {productsLoading ? (
              <div className="carousel-loading-msg">Cargando colección de urnas...</div>
            ) : (
              products.map((prod) => (
                <div key={prod.id} className="carousel-card-clean">
                  <div 
                    className="card-clean-visual"
                    onClick={() => navigate(`/product/${prod.slug}`)}
                  >
                    <img 
                      src={prod.images?.[0] || '/products/terra-urn.png'} 
                      alt={prod.name} 
                      className="clean-urn-img"
                      loading="lazy"
                    />
                    {prod.originalPrice && prod.originalPrice > prod.price && (
                      <span className="clean-sale-tag">Promoción</span>
                    )}
                  </div>

                  <div className="card-clean-body">
                    <h3 
                      className="clean-product-title"
                      onClick={() => navigate(`/product/${prod.slug}`)}
                    >
                      {prod.name}
                    </h3>
                    <p className="clean-product-desc">
                      {locale === 'es' ? (prod.shortDescription?.substring(0, 68) + '...') : prod.tagline}
                    </p>

                    <div className="clean-footer">
                      <div className="clean-prices">
                        <span className="price-current">${Number(prod.price).toFixed(2)}</span>
                        {prod.originalPrice && (
                          <span className="price-previous">${Number(prod.originalPrice).toFixed(2)}</span>
                        )}
                      </div>

                      <button 
                        onClick={() => handleDirectBuy(prod)}
                        className={`clean-buy-btn ${addedProductId === prod.id ? 'is-added' : ''}`}
                      >
                        {addedProductId === prod.id ? '✓ Añadido' : 'Comprar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* =========================================================
          6. SECCIÓN DE RESEÑAS (Citas Editoriales de Familias)
         ========================================================= */}
      <section className="apple-reviews" id="resenas">
        <div className="apple-container">
          
          <div className="reviews-top">
            <div className="stars-pill">
              <span className="stars-text">★★★★★</span>
              <span className="rating-num">4.9 / 5</span>
            </div>
            <h2 className="reviews-title">
              Palabras de quienes han despedido en paz.
            </h2>
            <p className="reviews-sub">
              Más de 250 familias han confiado en Kamibi para brindar un homenaje sereno y en armonía con el planeta.
            </p>
          </div>

          <div className="reviews-grid-clean">
            {reviews.map((rev) => (
              <div key={rev.id} className="review-quote-card">
                <span className="quote-mark">“</span>
                <p className="quote-body">{rev.quote}</p>
                <div className="quote-footer">
                  <div className="quote-author-info">
                    <span className="author-name">{rev.author}</span>
                    <span className="author-loc">{rev.location}</span>
                  </div>
                  <span className="quote-edition-tag">{rev.edition}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="apple-guarantee-ribbon">
            <div className="ribbon-item">
              <span className="ribbon-icon">✓</span>
              <span>Envío express asegurado y embalaje neutro</span>
            </div>
            <div className="ribbon-item">
              <span className="ribbon-icon">✓</span>
              <span>Materiales 100% biodegradables certificados</span>
            </div>
            <div className="ribbon-item">
              <span className="ribbon-icon">✓</span>
              <span>Atención humana y respetuosa las 24 horas</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          7. MODALES INTERACTIVOS (Apple Frosted Glass Overlay)
         ========================================================= */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            className="apple-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div 
              className="apple-modal-panel"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="modal-x-btn"
                onClick={() => setActiveModal(null)}
                aria-label="Cerrar modal"
              >
                ✕
              </button>

              {activeModal === 'how-it-works' && (
                <div className="modal-inner">
                  <span className="modal-tag">GUÍA DE CEREMONIA</span>
                  <h3 className="modal-title">Cómo funciona el ritual Kamibi</h3>
                  <p className="modal-p">
                    Diseñado para que la ceremonia de despedida sea serena, sencilla y respetuosa con los deseos de la familia.
                  </p>

                  <div className="steps-container">
                    <div className="step-block">
                      <span className="step-idx">01</span>
                      <div>
                        <h4 className="step-h4">Preparación respetuosa</h4>
                        <p className="step-p">
                          Coloca las cenizas en la bolsa hidrosoluble incluida e introdúcelas en la urna Kamibi. Si elegiste la versión de siembra, añade la cápsula con sustrato y semillas vivas.
                        </p>
                      </div>
                    </div>

                    <div className="step-block">
                      <span className="step-idx">02</span>
                      <div>
                        <h4 className="step-h4">La ceremonia de despedida</h4>
                        <p className="step-p">
                          <strong>En tierra:</strong> Entierra la urna a 25-30 cm de profundidad en un jardín o bosque.<br/>
                          <strong>En agua:</strong> Deposita la urna sobre la superficie; flotará suavemente unos minutos antes de sumergirse.
                        </p>
                      </div>
                    </div>

                    <div className="step-block">
                      <span className="step-idx">03</span>
                      <div>
                        <h4 className="step-h4">Retorno a la vida</h4>
                        <p className="step-p">
                          En pocas semanas, los componentes orgánicos se integran completamente al ecosistema sin generar residuos tóxicos, dando vida a un nuevo árbol o reintegrándose al ciclo del agua.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="modal-cta-box">
                    <button 
                      onClick={() => {
                        setActiveModal(null);
                        scrollToSection('comparativa');
                      }}
                      className="apple-btn-pill"
                    >
                      Elegir mi urna Kamibi
                    </button>
                  </div>
                </div>
              )}

              {activeModal === 'materials' && (
                <div className="modal-inner">
                  <span className="modal-tag">INGENIERÍA ECOLÓGICA</span>
                  <h3 className="modal-title">Composición 100% Orgánica & Certificada</h3>
                  <p className="modal-p">
                    Kamibi prescinde de cualquier adhesivo químico, plástico o resina sintética. Cada urna procede de recursos naturales renovables.
                  </p>

                  <div className="materials-list-clean">
                    <div className="material-item">
                      <h4 className="material-h4">Celulosa Virgen Pura</h4>
                      <p className="material-p">
                        Fibras botánicas prensadas sin blanqueadores químicos que se degradan de forma armónica en contacto con la humedad del suelo o el agua.
                      </p>
                    </div>

                    <div className="material-item">
                      <h4 className="material-h4">Sal Marina & Arcilla Porosa</h4>
                      <p className="material-p">
                        Compuestos de pH neutro que enriquecen los microorganismos del ecosistema sin dejar metales pesados ni alterar la fauna marina.
                      </p>
                    </div>

                    <div className="material-item">
                      <h4 className="material-h4">Semillas Nativas Certificadas</h4>
                      <p className="material-p">
                        Especies botánicas no invasivas seleccionadas cuidadosamente para germinar con fuerza y transformar el homenaje en un memorial vivo.
                      </p>
                    </div>

                    <div className="material-item">
                      <h4 className="material-h4">Aglutinantes de Almidón Vegetal</h4>
                      <p className="material-p">
                        Extractos de maíz y yuca que aportan solidez estructural en seco y se disuelven de forma completamente limpia en humedad.
                      </p>
                    </div>
                  </div>

                  <div className="modal-cta-box">
                    <button 
                      onClick={() => {
                        setActiveModal(null);
                        scrollToSection('comparativa');
                      }}
                      className="apple-btn-pill"
                    >
                      Ver modelos disponibles
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
