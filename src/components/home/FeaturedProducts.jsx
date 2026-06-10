import React, { useRef } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useWixProducts } from '../../hooks/useWixProducts';
import { ScrollReveal } from '../ui/ScrollReveal';
import { useNavigate } from 'react-router-dom';
import './FeaturedProducts.css';

export const FeaturedProducts = () => {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const { products, loading } = useWixProducts();

  // Filter main urns for featured section (excluding mini-urns for clean visual balance)
  const mainUrns = products.filter((p) => p.slug !== 'mini-urns');

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Don't render the section if still loading or no products
  if (loading || mainUrns.length === 0) {
    return (
      <section className="featured-products section-padding">
        <div className="container">
          <div className="featured-header">
            <div className="featured-title-block">
              <ScrollReveal direction="up" className="text-label featured-tag">
                {t('home.featured.tag')}
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.15}>
                <h2 className="heading-section featured-title">
                  {t('home.featured.title')}
                </h2>
              </ScrollReveal>
            </div>
          </div>
          {loading && (
            <div className="carousel-viewport">
              <div className="carousel-container">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="featured-product-card" style={{ pointerEvents: 'none' }}>
                    <div className="card-image-wrapper">
                      <div className="skeleton-image skeleton-pulse" style={{ aspectRatio: '3/4', borderRadius: 'var(--radius-lg, 12px)' }}></div>
                    </div>
                    <div className="card-info">
                      <div className="skeleton-title skeleton-pulse" style={{ height: '16px', width: '65%', borderRadius: '4px' }}></div>
                      <div className="skeleton-tagline skeleton-pulse" style={{ height: '12px', width: '85%', borderRadius: '4px', marginTop: '6px' }}></div>
                      <div className="skeleton-price skeleton-pulse" style={{ height: '14px', width: '30%', borderRadius: '4px', marginTop: '8px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="featured-products section-padding">
      <div className="container">
        {/* Header row */}
        <div className="featured-header">
          <div className="featured-title-block">
            <ScrollReveal direction="up" className="text-label featured-tag">
              {t('home.featured.tag')}
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.15}>
              <h2 className="heading-section featured-title">
                {t('home.featured.title')}
              </h2>
            </ScrollReveal>
          </div>
          
          {/* Scroll Nav buttons */}
          <ScrollReveal direction="left" className="carousel-nav">
            <button onClick={scrollLeft} className="carousel-nav-btn" aria-label="Scroll left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <button onClick={scrollRight} className="carousel-nav-btn" aria-label="Scroll right">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </ScrollReveal>
        </div>

        {/* Carousel Grid */}
        <div className="carousel-viewport" ref={carouselRef}>
          <div className="carousel-container">
            {mainUrns.map((product, idx) => (
              <ScrollReveal
                key={product.id}
                direction="up"
                delay={idx * 0.1}
                className="featured-product-card"
                onClick={() => navigate(`/product/${product.slug}`)}
              >
                <div className="card-image-wrapper">
                  <img src={product.images[0]} alt={product.name} className="card-image" />
                  <div className="card-hover-overlay">
                    <span className="card-hover-action text-label">
                      {t('home.featured.view')}
                    </span>
                  </div>
                  {/* Category tag bubble */}
                  <span className="product-category-badge text-label">
                    {(product.categories && product.categories.length > 0
                      ? product.categories
                      : [product.category]
                    ).map(cat => t(`store.filters.${cat}`)).join(' / ')}
                  </span>
                </div>

                <div className="card-info">
                  <h3 className="card-name">{product.name}</h3>
                  <p className="card-tagline">
                    {locale === 'en' ? product.tagline : product.shortDescription.substring(0, 70) + '...'}
                  </p>
                  <div className="card-footer">
                    <span className="card-price">${product.price.toFixed(2)}</span>
                    <span className="card-link-arrow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
export default FeaturedProducts;
