import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useWixStoreBySlug } from '../hooks/useWixCMS';
import { useTranslation } from '../context/LanguageContext';
import { useWixProducts } from '../hooks/useWixProducts';
import { ProductCard } from '../components/ui/ProductCard';
import { PageTransition } from '../components/layout/PageTransition';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';
import './StorePage.css';

export const DynamicStorePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, locale } = useTranslation();
  const { store, loading: cmsLoading, error: cmsError } = useWixStoreBySlug(slug);
  const { products, loading: productsLoading, error: productsError } = useWixProducts();
  const [filter, setFilter] = useState('all');

  // Dynamic SEO from CMS data
  useSEO({
    titleEn: store?.seoTitle || store?.pageTitle || 'Kamibi Store',
    titleEs: store?.seoTitle || store?.pageTitle || 'Kamibi Store',
    descEn: store?.seoDescription || store?.excerpt || '',
    descEs: store?.seoDescription || store?.excerpt || '',
    locale,
  });

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Sync category filter with query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    if (cat && ['all', 'water', 'earth', 'minis'].includes(cat)) {
      setFilter(cat);
    } else {
      setFilter('all');
    }
  }, [location.search]);

  // Filter by category
  const filteredProducts = filter === 'all'
    ? products
    : products.filter((p) => (p.categories || [p.category]).includes(filter));

  // ── CMS Loading State ──────────────────────────────────────────
  if (cmsLoading) {
    return (
      <PageTransition>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-cream, #FAF7F2)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2.5rem',
              animation: 'spin 2s ease-in-out infinite',
            }}>🌿</div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // ── 404 State ──────────────────────────────────────────────────
  if (cmsError || !store) {
    return (
      <PageTransition>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          background: 'var(--color-cream, #FAF7F2)',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🍃</span>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            color: 'var(--color-charcoal)',
            marginBottom: '0.75rem',
          }}>Page Not Found</h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-stone)',
            marginBottom: '2rem',
          }}>This store page doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            style={{
              fontFamily: 'var(--font-body)',
              padding: '0.75rem 2rem',
              background: 'var(--color-charcoal)',
              color: '#fff',
              border: 'none',
              borderRadius: '100px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              letterSpacing: '0.05em',
            }}
          >
            Back to Home
          </button>
        </div>
      </PageTransition>
    );
  }

  // ── Store Page (exact clone of StorePage with CMS overrides) ───
  return (
    <PageTransition>
      <div className="store-page">
        {/* Hero Header — with CMS overrides */}
        <section className="store-hero">
          <div className="container">
            <ScrollReveal direction="up" className="store-hero-content">
              <h1 className="heading-display store-title">
                {store.pageTitle || store.title}
              </h1>
              <p className="store-subtitle text-body">
                {store.excerpt}
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Catalog Section — identical to StorePage */}
        <section className="store-catalog container">
          {/* Filters Bar */}
          <div className="store-filters">
            {['all', 'water', 'earth', 'minis'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`filter-btn text-label ${filter === cat ? 'active' : ''}`}
              >
                {t(`store.filters.${cat}`)}
              </button>
            ))}
          </div>

          {/* Loading State — Skeleton Cards */}
          {productsLoading && (
            <div className="store-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-image skeleton-pulse"></div>
                  <div className="skeleton-info">
                    <div className="skeleton-title skeleton-pulse"></div>
                    <div className="skeleton-tagline skeleton-pulse"></div>
                    <div className="skeleton-price skeleton-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {productsError && !productsLoading && (
            <div className="store-error">
              <p className="text-body">⚠️ {productsError}</p>
            </div>
          )}

          {/* Products Grid */}
          {!productsLoading && !productsError && (
            <motion.div layout className="store-grid">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </div>
    </PageTransition>
  );
};

export default DynamicStorePage;
