import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useWixProducts } from '../hooks/useWixProducts';
import { ProductCard } from '../components/ui/ProductCard';
import { PageTransition } from '../components/layout/PageTransition';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';
import './StorePage.css';

export const StorePage = () => {
  const { t, locale } = useTranslation();

  useSEO({
    titleEn: 'Shop Biodegradable Urns | Water Burial, Earth Burial & Memorial Urns',
    titleEs: 'Comprar Urnas Biodegradables | Urnas para Agua, Tierra y Memoriales',
    descEn:  'Browse biodegradable urns, eco friendly urns, ash scattering urns, burial at sea urns, and sustainable funeral urns. Premium memorial products with free shipping across USA and Canada.',
    descEs:  'Explora urnas biodegradables, urnas ecológicas, urnas para esparcir cenizas y entierros en el mar. Productos memoriales premium con envío gratis a USA y Canadá.',
    locale,
  });
  const location = useLocation();
  const [filter, setFilter] = useState('all');
  const { products, loading, error } = useWixProducts();

  // Sync category filter with query params if any
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    if (cat && ['all', 'urns', 'minis', 'bags'].includes(cat)) {
      setFilter(cat);
    } else {
      setFilter('all');
    }
  }, [location.search]);

  // Ensure we start at top of page on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter by category — uses categories array so a product can appear in multiple filters
  const filteredProducts = filter === 'all'
    ? products
    : products.filter((p) => (p.categories || [p.category]).includes(filter));

  return (
    <PageTransition>
      <div className="store-page">
        {/* Hero Header */}
        <section className="store-hero">
          <div className="container">
            <ScrollReveal direction="up" className="store-hero-content">
              <h1 className="heading-display store-title">{t('store.title')}</h1>
              <p className="store-subtitle text-body">{t('store.subtitle')}</p>
            </ScrollReveal>
          </div>
        </section>

        {/* Catalog Section */}
        <section className="store-catalog container">
          {/* Filters Bar */}
          <div className="store-filters">
            {['all', 'urns', 'minis', 'bags'].map((cat) => (
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
          {loading && (
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
          {error && !loading && (
            <div className="store-error">
              <p className="text-body">⚠️ {error}</p>
            </div>
          )}

          {/* Grid Products list with smooth layout transition animations */}
          {!loading && !error && (
            <motion.div 
              layout 
              className="store-grid"
            >
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
export default StorePage;
