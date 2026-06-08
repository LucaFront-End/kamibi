import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useWixProduct } from '../hooks/useWixProducts';
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
  const { addToCart, isLoading: cartLoading } = useCart();
  const { product, loading, error } = useWixProduct(slug);

  // Fetch the mini-urns product for the sharing set option
  const MINI_URNS_SLUG = 'mini-biodegradables-urn-set';
  const { product: miniUrnsProduct } = useWixProduct(
    slug !== MINI_URNS_SLUG ? MINI_URNS_SLUG : null
  );

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' | 'benefits' | 'whyUs'
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [addSharingSet, setAddSharingSet] = useState(false);


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

  // Reset state when product loads
  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0] : null);
      setQuantity(1);
      setAddSharingSet(false);
    }
    window.scrollTo(0, 0);
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    
    try {
      await addToCart(product, quantity, selectedVariant);

      // Also add mini-urns sharing set if toggled
      if (addSharingSet && miniUrnsProduct) {
        // Use the first variant of the mini urns
        const miniVariant = miniUrnsProduct.variants?.[0] || null;
        await addToCart(miniUrnsProduct, 1, miniVariant);
      }

      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  // Loading state — skeleton that mimics the product layout
  if (loading) {
    return (
      <div className="product-page" style={{ paddingTop: 'var(--nav-height, 80px)' }}>
        <section className="product-showcase-section container">
          <div className="product-showcase-grid">
            <div>
              <div className="skeleton-pulse" style={{ aspectRatio: '3/4', borderRadius: 'var(--radius-lg, 12px)', width: '100%' }}></div>
            </div>
            <div className="product-purchase-details" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '2rem' }}>
              <div className="skeleton-pulse" style={{ height: '14px', width: '120px', borderRadius: '4px' }}></div>
              <div className="skeleton-pulse" style={{ height: '32px', width: '70%', borderRadius: '4px' }}></div>
              <div className="skeleton-pulse" style={{ height: '22px', width: '100px', borderRadius: '4px' }}></div>
              <div className="skeleton-pulse" style={{ height: '14px', width: '100%', borderRadius: '4px', marginTop: '0.5rem' }}></div>
              <div className="skeleton-pulse" style={{ height: '14px', width: '95%', borderRadius: '4px' }}></div>
              <div className="skeleton-pulse" style={{ height: '14px', width: '80%', borderRadius: '4px' }}></div>
              <div className="skeleton-pulse" style={{ height: '48px', width: '100%', borderRadius: '8px', marginTop: '1.5rem' }}></div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-not-found container section-padding text-center">
        <h2 className="heading-section">⚠️ Error loading product</h2>
        <p className="text-body">{error}</p>
        <Link to="/store" className="back-link">Return to Collection</Link>
      </div>
    );
  }

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
            <ScrollReveal direction="right" className="product-gallery-sticky">
              <ProductGallery images={product.images} name={product.name} />
            </ScrollReveal>

            {/* Product Details & Selection Column */}
            <ScrollReveal direction="left" className="product-purchase-details">
              <span className="text-label product-purchase-category">
                {t(`store.filters.${product.category}`)}
              </span>

              {/* Amazon Trust Badge */}
              <div className="amazon-trust-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>{locale === 'es' ? 'Tienda Amazon Verificada' : 'Verified Amazon Storefront'}</span>
              </div>
              
              <h1 className="heading-display product-purchase-title">{product.name}</h1>
              
              <span className="product-purchase-price">${product.price.toFixed(2)}</span>
              
              <div
                className="product-purchase-desc text-body product-description-html"
                dangerouslySetInnerHTML={{
                  __html: locale === 'en'
                    ? product.descriptionHtmlEn || product.descriptionEn
                    : product.descriptionHtml || product.description
                }}
              />

              {/* Personalization & Customizer Card */}
              {product.variants && product.variants.length > 0 && (
                <div className="product-customizer-card">
                  <div className="customizer-header">
                    <span className="text-label customizer-badge">
                      {locale === 'en' ? 'Personalization' : 'Personalización'}
                    </span>
                    <p className="customizer-subtitle text-body">
                      {locale === 'en' 
                        ? 'Interchangeable sleeves & bands' 
                        : 'Cenefas y cintas intercambiables'}
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


                </div>
              )}

              {/* Sharing Set Option — shown on all products except mini-urns itself */}
              {product.slug !== MINI_URNS_SLUG && miniUrnsProduct && (
                <div
                  className={`sharing-set-card ${addSharingSet ? 'active' : ''}`}
                  onClick={() => setAddSharingSet(!addSharingSet)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="sharing-set-toggle">
                    <div className={`sharing-set-checkbox ${addSharingSet ? 'checked' : ''}`}>
                      {addSharingSet && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div className="sharing-set-info">
                      <span className="sharing-set-title">
                        {locale === 'en'
                          ? 'Add Sharing Set — 4 Mini Urns'
                          : 'Agregar Set para Compartir — 4 Mini Urnas'}
                      </span>
                      <span className="sharing-set-desc text-body">
                        {locale === 'en'
                          ? 'Share portions with loved ones across the world'
                          : 'Comparte porciones con seres queridos en cualquier lugar'}
                      </span>
                    </div>
                  </div>
                  <span className="sharing-set-price">
                    +${miniUrnsProduct.price?.toFixed(2)}
                  </span>
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
                  disabled={isAdding || cartLoading}
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
              {product.features && product.features.length > 0 && (
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
              )}
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
        {product.slug !== MINI_URNS_SLUG && (
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
              disabled={isAdding || cartLoading}
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
