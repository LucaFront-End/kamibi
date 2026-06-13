import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWixLandings, useWixStores } from '../hooks/useWixCMS';
import { useTranslation } from '../context/LanguageContext';
import { PageTransition } from '../components/layout/PageTransition';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { motion } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';
import './ZonasPage.css';

export const ZonasPage = () => {
  const { locale } = useTranslation();
  const { landings, loading: landingsLoading } = useWixLandings();
  const { stores, loading: storesLoading } = useWixStores();
  const loading = landingsLoading || storesLoading;

  useSEO({
    titleEn: 'Biodegradable Urns by Location | Kamibi Store',
    titleEs: 'Urnas Biodegradables por Ubicación | Kamibi Store',
    descEn: 'Find biodegradable urns and eco-friendly memorial stores near you.',
    descEs: 'Encuentra urnas biodegradables y tiendas de memoriales ecológicos cerca de ti.',
    locale,
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <PageTransition>
      <div className="zonas-page">
        <section className="zonas-hero">
          <div className="container">
            <ScrollReveal direction="up" className="zonas-hero-content">
              <span className="text-label zonas-tag">
                {locale === 'es' ? 'NUESTRAS ZONAS' : 'OUR LOCATIONS'}
              </span>
              <h1 className="heading-display zonas-title">
                {locale === 'es' ? 'Urnas Biodegradables por Ubicación' : 'Biodegradable Urns by Location'}
              </h1>
              <p className="zonas-subtitle text-body">
                {locale === 'es'
                  ? 'Encuentra información y tiendas de urnas biodegradables en tu estado.'
                  : 'Find biodegradable urn information and stores in your state.'}
              </p>
            </ScrollReveal>
          </div>
        </section>

        {loading && (
          <section className="zonas-loading">
            <div className="container">
              <div className="zonas-skeleton-grid">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="zona-skeleton-card">
                    <div className="zona-skeleton-top skeleton-pulse" />
                    <div className="zona-skeleton-body">
                      <div className="zona-skeleton-line skeleton-pulse" />
                      <div className="zona-skeleton-line short skeleton-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {!loading && landings.length > 0 && (
          <section className="zonas-section">
            <div className="container">
              <ScrollReveal direction="up" className="zonas-section-header">
                <span className="text-label">{locale === 'es' ? 'INFORMACIÓN POR ESTADO' : 'INFORMATION BY STATE'}</span>
                <h2 className="heading-section">{locale === 'es' ? 'Landings por Ciudad' : 'City Landings'}</h2>
              </ScrollReveal>
              <div className="zonas-grid">
                {landings.map((landing, i) => (
                  <ScrollReveal key={landing._id || i} direction="up" delay={Math.min(i * 0.03, 0.3)} className="zona-card-wrapper">
                    <motion.div className="zona-card" whileHover={{ y: -6 }} transition={{ duration: 0.3 }}>
                      <div className="zona-card-icon">📍</div>
                      <div className="zona-card-content">
                        <h3 className="zona-card-city">{landing.city || landing.title}</h3>
                        <span className="zona-card-country">{landing.country}</span>
                        <p className="zona-card-excerpt">{landing.excerpt}</p>
                      </div>
                      <div className="zona-card-actions">
                        <Link to={`/${landing.slug}`} className="zona-card-btn primary">
                          {locale === 'es' ? 'Ver Landing' : 'View Landing'}<span className="btn-arrow">→</span>
                        </Link>
                      </div>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {!loading && stores.length > 0 && (
          <section className="zonas-section zonas-stores-section">
            <div className="container">
              <ScrollReveal direction="up" className="zonas-section-header">
                <span className="text-label">{locale === 'es' ? 'TIENDAS POR ESTADO' : 'STORES BY STATE'}</span>
                <h2 className="heading-section">{locale === 'es' ? 'Tiendas por Ciudad' : 'Stores by City'}</h2>
              </ScrollReveal>
              <div className="zonas-grid">
                {stores.map((store, i) => (
                  <ScrollReveal key={store._id || i} direction="up" delay={Math.min(i * 0.03, 0.3)} className="zona-card-wrapper">
                    <motion.div className="zona-card zona-card-store" whileHover={{ y: -6 }} transition={{ duration: 0.3 }}>
                      <div className="zona-card-icon">🏪</div>
                      <div className="zona-card-content">
                        <h3 className="zona-card-city">{store.city || store.title}</h3>
                        <span className="zona-card-country">{store.country}</span>
                        <p className="zona-card-excerpt">{store.excerpt}</p>
                      </div>
                      <div className="zona-card-actions">
                        <Link to={`/tienda/${store.slug}`} className="zona-card-btn primary">
                          {locale === 'es' ? 'Ver Tienda' : 'View Store'}<span className="btn-arrow">→</span>
                        </Link>
                      </div>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {!loading && landings.length === 0 && stores.length === 0 && (
          <section className="zonas-empty">
            <div className="container">
              <span style={{ fontSize: '3rem' }}>🌍</span>
              <h2>{locale === 'es' ? 'Sin zonas disponibles' : 'No zones available'}</h2>
              <p className="text-body">{locale === 'es' ? 'Aún no hay landings o tiendas configuradas.' : 'No landings or stores configured yet.'}</p>
            </div>
          </section>
        )}
      </div>
    </PageTransition>
  );
};

export default ZonasPage;
