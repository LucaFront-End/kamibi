import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { products } from '../lib/productsData';
import { ProductGallery } from '../components/product/ProductGallery';
import { UsageGuide } from '../components/product/UsageGuide';
import { BenefitsSection } from '../components/product/BenefitsSection';
import { WhyChooseUs } from '../components/product/WhyChooseUs';
import { ReviewsSection } from '../components/product/ReviewsSection';
import { ComplementsSection } from '../components/product/ComplementsSection';
import { SimilarProducts } from '../components/product/SimilarProducts';
import { PageTransition } from '../components/layout/PageTransition';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { MagneticButton } from '../components/ui/MagneticButton';
import './ProductPage.css';

export const ProductPage = () => {
  const { slug } = useParams();
  const { t, locale } = useTranslation();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' | 'benefits' | 'whyUs'
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [hasEngraving, setHasEngraving] = useState(false);
  const [engravingText, setEngravingText] = useState('');

  // Sync scroll detection for mobile sticky action bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch product based on URL slug
  useEffect(() => {
    const foundProduct = products.find((p) => p.slug === slug);
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedVariant(foundProduct.variants ? foundProduct.variants[0] : null);
      setQuantity(1);
      setHasEngraving(false);
      setEngravingText('');
    }
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    setIsAdding(true);
    
    // Simulate loading for premium microinteraction
    setTimeout(() => {
      // Append personalization options if enabled
      const finalVariant = hasEngraving 
        ? `${selectedVariant} (Engraving: "${engravingText}")` 
        : selectedVariant;

      addToCart(product, quantity, finalVariant);
      setIsAdding(false);
      setAddedSuccess(true);
      
      setTimeout(() => {
        setAddedSuccess(false);
      }, 2000);
    }, 1000);
  };

  if (!product) {
    return (
      <div className="product-not-found container section-padding text-center">
        <h2 className="heading-section">Product not found</h2>
        <Link to="/store" className="back-link">Return to Collection</Link>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="product-page">
        {/* Core Product Presentation */}
        <section className="product-showcase-section container">
          <div className="product-showcase-grid">
            {/* Gallery Column */}
            <ScrollReveal direction="right">
              <ProductGallery images={product.images} name={product.name} />
            </ScrollReveal>

            {/* Product Details & Selection Column */}
            <ScrollReveal direction="left" className="product-purchase-details">
              <span className="text-label product-purchase-category">
                {t(`store.filters.${product.category}`)}
              </span>
              
              <h1 className="heading-display product-purchase-title">{product.name}</h1>
              
              <span className="product-purchase-price">${product.price.toFixed(2)}</span>
              
              <p className="product-purchase-desc text-body">
                {locale === 'en' ? product.descriptionEn : product.description}
              </p>

              {/* Personalization & Customizer Card */}
              {product.variants && (
                <div className="product-customizer-card">
                  <div className="customizer-header">
                    <span className="text-label customizer-badge">
                      {locale === 'en' ? 'Personalization' : 'Personalización'}
                    </span>
                    <p className="customizer-subtitle text-body">
                      {locale === 'en' 
                        ? 'Interchangeable sleeves, bands & custom engraving' 
                        : 'Cenefas intercambiables, cintas y grabado personalizado'}
                    </p>
                  </div>

                  {/* Sleeve / Band Swatches */}
                  <div className="product-purchase-options">
                    <span className="text-label option-label">
                      {locale === 'en' ? 'Select Sleeve / Band Design' : 'Seleccionar Diseño de Cenefa / Cinta'}
                    </span>
                    <div className="variant-swatches">
                      {product.variants.map((v) => (
                        <button
                          key={v}
                          onClick={() => setSelectedVariant(v)}
                          className={`swatch-btn ${selectedVariant === v ? 'active' : ''}`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Engraving Toggle */}
                  <div className="engraving-customizer">
                    <label className="engraving-checkbox-container">
                      <input
                        type="checkbox"
                        checked={hasEngraving}
                        onChange={(e) => setHasEngraving(e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-text text-body">
                        {locale === 'en' 
                          ? 'Add Custom Memorial Engraving (+ $15.00)' 
                          : 'Agregar Grabado Conmemorativo (+ $15.00)'}
                      </span>
                    </label>

                    {/* Animated Text Input */}
                    {hasEngraving && (
                      <div className="engraving-input-wrapper">
                        <input
                          type="text"
                          maxLength={25}
                          value={engravingText}
                          onChange={(e) => setEngravingText(e.target.value)}
                          placeholder={locale === 'en' ? 'Enter initials, name or dates (e.g. A.D. 1954 - 2026)' : 'Escribe iniciales, nombre o fechas (ej. A.D. 1954 - 2026)'}
                          className="engraving-text-input"
                        />
                        <span className="engraving-char-count text-label">
                          {engravingText.length} / 25
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add actions row */}
              <div className="product-purchase-actions">
                <div className="quantity-adjuster">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <span className="qty-val">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>

                <MagneticButton
                  variant="primary"
                  onClick={handleAddToCart}
                  className={`purchase-add-btn ${addedSuccess ? 'success' : ''}`}
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <span className="btn-spinner"></span>
                  ) : addedSuccess ? (
                    <span className="success-icon-wrap">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {t('product.added')}
                    </span>
                  ) : (
                    t('product.addToCart')
                  )}
                </MagneticButton>
              </div>

              {/* Bullet Features */}
              <ul className="product-quick-bullets">
                {(locale === 'en' ? product.featuresEn : product.features).map((feat, idx) => (
                  <li key={idx}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="bullet-check">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>
        </section>

        {/* Tabbed Info details block */}
        <section className="product-tabs-section">
          <div className="container">
            {/* Tabs Trigger Headers */}
            <div className="tabs-header">
              <button
                onClick={() => setActiveTab('guide')}
                className={`tab-trigger-btn text-label ${activeTab === 'guide' ? 'active' : ''}`}
              >
                {t('product.tabs.guide')}
              </button>
              <button
                onClick={() => setActiveTab('benefits')}
                className={`tab-trigger-btn text-label ${activeTab === 'benefits' ? 'active' : ''}`}
              >
                {t('product.tabs.benefits')}
              </button>
              <button
                onClick={() => setActiveTab('whyUs')}
                className={`tab-trigger-btn text-label ${activeTab === 'whyUs' ? 'active' : ''}`}
              >
                {t('product.tabs.whyUs')}
              </button>
            </div>

            {/* Tabs Viewports */}
            <div className="tab-viewport">
              {activeTab === 'guide' && <UsageGuide />}
              {activeTab === 'benefits' && <BenefitsSection />}
              {activeTab === 'whyUs' && <WhyChooseUs />}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="product-reviews-container container">
          <ReviewsSection />
        </section>

        {/* Sharing Set Showcase */}
        {product.id !== 'mini-urns' && (
          <section className="product-complements-container container">
            <ComplementsSection />
          </section>
        )}

        {/* Similar product models */}
        <section className="product-similar-container container">
          <SimilarProducts currentId={product.id} />
        </section>

        {/* Mobile Sticky Add to Cart bottom bar */}
        <div className={`sticky-action-bar ${showStickyBar ? 'visible' : ''}`}>
          <div className="sticky-bar-container">
            <div className="sticky-bar-info">
              <span className="sticky-product-name">{product.name}</span>
              <span className="sticky-product-price">${product.price.toFixed(2)}</span>
            </div>
            
            <button
              onClick={handleAddToCart}
              className="sticky-purchase-btn"
              disabled={isAdding}
            >
              {isAdding ? "..." : t('product.addToCart')}
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
export default ProductPage;
