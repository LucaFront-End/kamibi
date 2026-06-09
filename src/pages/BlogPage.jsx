import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { useWixPosts } from '../hooks/useWixBlog';
import { PageTransition } from '../components/layout/PageTransition';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { motion } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';
import './BlogPage.css';

function formatDate(dateStr, locale) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(
    locale === 'es' ? 'es-AR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
}

export const BlogPage = () => {
  const { t, locale } = useTranslation();
  const { posts, loading, error } = useWixPosts(20);

  useSEO({
    titleEn: 'Biodegradable Urn Resources & Green Funeral Guides | Kamibi Store Blog',
    titleEs: 'Guías de Urnas Biodegradables y Funerales Ecológicos | Blog Kamibi Store',
    descEn:  'Explore articles about biodegradable urns, water burials, natural burials, eco friendly funerals, cremation resources, and sustainable memorial ideas from Kamibi Store.',
    descEs:  'Descubre artículos sobre urnas biodegradables, entierros en agua, funerales ecológicos, recursos de cremación y memoriales sustentables en el blog de Kamibi Store.',
    locale,
  });

  // DEBUG — log first post structure to identify correct field names
  if (posts.length > 0) {
    console.log('[Blog DEBUG] First post keys:', Object.keys(posts[0]));
    console.log('[Blog DEBUG] First post media:', JSON.stringify(posts[0].media, null, 2));
    console.log('[Blog DEBUG] First post coverImage:', JSON.stringify(posts[0].coverImage, null, 2));
    console.log('[Blog DEBUG] First post title:', posts[0].title);
    console.log('[Blog DEBUG] First post excerpt:', posts[0].excerpt);
    console.log('[Blog DEBUG] Full first post:', JSON.stringify(posts[0], null, 2));
  }

  return (
    <PageTransition>
      <div className="blog-page">
        {/* Hero */}
        <section className="blog-hero">
          <div className="container">
            <ScrollReveal direction="up" className="blog-hero-content">
              <span className="text-label blog-tag">
                {locale === 'es' ? 'REFLEXIONES & RITUALES' : 'REFLECTIONS & RITUALS'}
              </span>
              <h1 className="heading-display blog-title">
                {locale === 'es' ? 'El Diario Kamibi' : 'The Kamibi Journal'}
              </h1>
              <p className="text-body blog-subtitle">
                {locale === 'es'
                  ? 'Historias sobre la naturaleza, el duelo consciente y el arte de honrar la vida.'
                  : 'Stories on nature, conscious grief, and the art of honoring life.'}
              </p>
            </ScrollReveal>
          </div>
        </section>

        <div className="blog-divider" />

        {/* Posts Grid */}
        <section className="blog-catalog container">
          {loading ? (
            <div className="blog-skeleton-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="blog-card-skeleton">
                  <div className="skeleton-img" />
                  <div className="skeleton-text" />
                  <div className="skeleton-text short" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="blog-error">
              <p>{locale === 'es' ? 'No se pudieron cargar los artículos.' : 'Could not load articles.'}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="blog-empty">
              <p>{locale === 'es' ? 'Próximamente — el diario está en preparación.' : 'Coming soon — the journal is being crafted.'}</p>
            </div>
          ) : (
            <div className="blog-grid">
              {/* Featured first post */}
              {posts[0] && (
                <ScrollReveal direction="up" className="blog-card blog-card--featured">
                  <Link to={`/blog/${posts[0].slug}`} className="blog-card-link">
                    <div className="blog-card-img-wrapper">
                      {posts[0].media?.wixMedia?.image?.url ? (
                        <img
                          src={posts[0].media.wixMedia.image.url}
                          alt={posts[0].title}
                          className="blog-card-img"
                        />
                      ) : (
                        <div className="blog-card-img-placeholder" />
                      )}
                      <div className="blog-card-overlay" />
                    </div>
                    <div className="blog-card-body">
                      <span className="text-label blog-card-date">
                        {formatDate(posts[0]._createdDate, locale)}
                      </span>
                      <h2 className="blog-card-title heading-section">{posts[0].title}</h2>
                      <p className="blog-card-excerpt text-body">
                        {posts[0].excerpt || posts[0].paidContent?.slice(0, 120)}
                      </p>
                      <span className="blog-card-readmore">
                        {locale === 'es' ? 'Leer artículo' : 'Read article'} →
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              )}

              {/* Rest of posts */}
              <div className="blog-grid-secondary">
                {posts.slice(1).map((post, i) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="blog-card blog-card--small"
                  >
                    <Link to={`/blog/${post.slug}`} className="blog-card-link">
                      <div className="blog-card-img-wrapper">
                        {post.media?.wixMedia?.image?.url ? (
                          <img
                            src={post.media.wixMedia.image.url}
                            alt={post.title}
                            className="blog-card-img"
                          />
                        ) : (
                          <div className="blog-card-img-placeholder" />
                        )}
                        <div className="blog-card-overlay" />
                      </div>
                      <div className="blog-card-body">
                        <span className="text-label blog-card-date">
                          {formatDate(post._createdDate, locale)}
                        </span>
                        <h3 className="blog-card-title">{post.title}</h3>
                        <span className="blog-card-readmore">
                          {locale === 'es' ? 'Leer' : 'Read'} →
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
};

export default BlogPage;
