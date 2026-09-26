import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useWixLandings, useWixStores } from '../hooks/useWixCMS';
import { useTranslation } from '../context/LanguageContext';
import { PageTransition } from '../components/layout/PageTransition';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { useSEO } from '../hooks/useSEO';
import './ZonasPage.css';

const ITEMS_PER_PAGE = 24;

export const ZonasPage = () => {
  const { locale } = useTranslation();
  const { landings, loading: landingsLoading } = useWixLandings();
  const { stores, loading: storesLoading } = useWixStores();
  const loading = landingsLoading && landings.length === 0;

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef(null);

  useSEO({
    titleEn: 'Biodegradable Urns by Location | Kamibi Store',
    titleEs: 'Urnas Biodegradables por Ubicación | Kamibi Store',
    descEn: 'Find biodegradable urns and eco-friendly memorial stores across USA and Canada.',
    descEs: 'Encuentra urnas biodegradables y tiendas de memoriales ecológicos en tu zona.',
    locale,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter landings based on search query
  const filteredLandings = useMemo(() => {
    if (!searchQuery.trim()) return landings;
    const q = searchQuery.toLowerCase().trim();
    return landings.filter((l) => {
      const title = (l.title || '').toLowerCase();
      const city = (l.city || '').toLowerCase();
      const country = (l.country || '').toLowerCase();
      const excerpt = (l.excerpt || '').toLowerCase();
      return title.includes(q) || city.includes(q) || country.includes(q) || excerpt.includes(q);
    });
  }, [landings, searchQuery]);

  // Reset page when search query changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredLandings.length / ITEMS_PER_PAGE) || 1;
  const paginatedLandings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLandings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLandings, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Generate page numbers array with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <PageTransition>
      <div className="zonas-page">
        {/* Hero with Search Bar */}
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
                  ? 'Encuentra información y opciones de despedida ecológica disponibles para tu ciudad o estado.'
                  : 'Find eco-friendly memorial information and biodegradable urn options for your city or state.'}
              </p>

              {/* Search Box */}
              <div className="zonas-search-container">
                <div className="zonas-search-box">
                  <span className="zonas-search-icon">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={
                      locale === 'es'
                        ? 'Buscar por ciudad, estado o palabra clave...'
                        : 'Search by city, state, or keyword...'
                    }
                    className="zonas-search-input"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="zonas-clear-btn"
                      title={locale === 'es' ? 'Borrar búsqueda' : 'Clear search'}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="zonas-search-count">
                  {landings.length > 0 && (
                    <span className="zonas-count-badge">
                      <span className="zonas-count-dot" />
                      {searchQuery
                        ? locale === 'es'
                          ? `${filteredLandings.length} zonas encontradas`
                          : `${filteredLandings.length} locations found`
                        : locale === 'es'
                        ? `${landings.length.toLocaleString()} zonas registradas`
                        : `${landings.length.toLocaleString()} registered locations`}
                    </span>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Loading Skeleton */}
        {loading && (
          <section className="zonas-loading">
            <div className="container">
              <div className="zonas-skeleton-grid">
                {[...Array(6)].map((_, i) => (
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

        {/* Landings Grid */}
        {!loading && filteredLandings.length > 0 && (
          <section ref={sectionRef} className="zonas-section">
            <div className="container">
              <div className="zonas-section-header">
                <span className="text-label">
                  {locale === 'es' ? 'PÁGINAS Y CIUDADES' : 'PAGES & CITIES'}
                </span>
                <h2 className="heading-section">
                  {locale === 'es' ? 'Landings por Ciudad' : 'City Landings'}
                </h2>
                <p className="text-body" style={{ color: 'var(--color-stone)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  {locale === 'es'
                    ? `Mostrando ${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(currentPage * ITEMS_PER_PAGE, filteredLandings.length)} de ${filteredLandings.length.toLocaleString()} zonas`
                    : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(currentPage * ITEMS_PER_PAGE, filteredLandings.length)} of ${filteredLandings.length.toLocaleString()} locations`}
                </p>
              </div>

              {/* Fast Pure CSS Grid */}
              <div className="zonas-grid">
                {paginatedLandings.map((landing, i) => (
                  <div key={landing._id || landing.slug || i} className="zona-card">
                    <div className="zona-card-icon">📍</div>
                    <div className="zona-card-content">
                      <h3 className="zona-card-city">{landing.pageTitle || landing.city || landing.title}</h3>
                      <span className="zona-card-country">{landing.country || 'USA'}</span>
                      <p className="zona-card-excerpt">
                        {landing.excerpt ||
                          (locale === 'es'
                            ? 'Descubre urnas biodegradables respetuosas con la naturaleza disponibles para entrega en tu localidad.'
                            : 'Discover respectful, biodegradable memorial urns available for prompt delivery in your location.')}
                      </p>
                    </div>
                    <div className="zona-card-actions">
                      <Link to={`/${landing.slug}`} className="zona-card-btn primary">
                        {locale === 'es' ? 'Ver Landing' : 'View Landing'}
                        <span className="btn-arrow">→</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="zonas-pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="zonas-page-btn"
                  >
                    ← {locale === 'es' ? 'Anterior' : 'Previous'}
                  </button>

                  {getPageNumbers().map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="zonas-page-ellipsis">
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        onClick={() => handlePageChange(p)}
                        className={`zonas-page-btn ${currentPage === p ? 'active' : ''}`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="zonas-page-btn"
                  >
                    {locale === 'es' ? 'Siguiente' : 'Next'} →
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Empty Search Results */}
        {!loading && filteredLandings.length === 0 && searchQuery && (
          <section className="zonas-empty">
            <div className="container">
              <span style={{ fontSize: '3rem' }}>🔍</span>
              <h3>
                {locale === 'es' ? 'No se encontraron zonas' : 'No locations found'}
              </h3>
              <p className="text-body" style={{ color: 'var(--color-stone)' }}>
                {locale === 'es'
                  ? `No encontramos resultados para "${searchQuery}". Intenta con otra ciudad o estado.`
                  : `No results found for "${searchQuery}". Try searching for another city or state.`}
              </p>
              <button onClick={clearSearch} className="zonas-reset-search-btn">
                {locale === 'es' ? 'Ver todas las zonas' : 'View all locations'}
              </button>
            </div>
          </section>
        )}

        {/* Dynamic Stores Section */}
        {!loading && stores.length > 0 && (
          <section className="zonas-section zonas-stores-section">
            <div className="container">
              <div className="zonas-section-header">
                <span className="text-label">
                  {locale === 'es' ? 'TIENDAS POR ESTADO' : 'STORES BY STATE'}
                </span>
                <h2 className="heading-section">
                  {locale === 'es' ? 'Tiendas por Ciudad' : 'Stores by City'}
                </h2>
              </div>
              <div className="zonas-grid">
                {stores.map((store, i) => (
                  <div key={store._id || store.slug || i} className="zona-card zona-card-store">
                    <div className="zona-card-icon">🏪</div>
                    <div className="zona-card-content">
                      <h3 className="zona-card-city">{store.pageTitle || store.city || store.title}</h3>
                      <span className="zona-card-country">{store.country || 'USA'}</span>
                      <p className="zona-card-excerpt">{store.excerpt}</p>
                    </div>
                    <div className="zona-card-actions">
                      <Link to={`/tienda/${store.slug}`} className="zona-card-btn primary">
                        {locale === 'es' ? 'Ver Tienda' : 'View Store'}
                        <span className="btn-arrow">→</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </PageTransition>
  );
};

export default ZonasPage;
