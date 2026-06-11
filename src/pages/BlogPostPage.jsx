import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { useWixPost } from '../hooks/useWixBlog';
import { PageTransition } from '../components/layout/PageTransition';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { motion } from 'framer-motion';
import './BlogPostPage.css';

function formatDate(dateStr, locale) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(
    locale === 'es' ? 'es-AR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
}

// Converts wix:image://v1/{fileId}/... to wixstatic CDN URL
function wixImageUrl(wixUri, width = 1400, height = 700) {
  if (!wixUri || typeof wixUri !== 'string') return null;
  if (wixUri.startsWith('http')) return wixUri;
  const withoutProto = wixUri.replace('wix:image://v1/', '');
  const fileId = withoutProto.split('/')[0].split('#')[0];
  if (!fileId) return null;
  return `https://static.wixstatic.com/media/${fileId}/v1/fill/w_${width},h_${height},al_c,q_90,usm_0.33_1.00_0.00/file.jpg`;
}

export const BlogPostPage = () => {
  const { slug } = useParams();
  const { locale } = useTranslation();
  const { post, loading, error } = useWixPost(slug);

  if (loading) {
    return (
      <PageTransition>
        <div className="blog-post-page loading-state">
          <div className="blog-post-skeleton container">
            <div className="skeleton-cover" />
            <div className="skeleton-line wide" />
            <div className="skeleton-line medium" />
            <div className="skeleton-block" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error || !post) {
    return (
      <PageTransition>
        <div className="blog-post-page error-state">
          <div className="container blog-post-error">
            <h2 className="heading-display">{locale === 'es' ? 'Ups, algo salió mal' : 'Oops, something went wrong'}</h2>
            <p className="text-body">{locale === 'es' ? 'No se pudo encontrar el artículo que buscas.' : 'Could not find the article you are looking for.'}</p>
            <Link to="/blog" className="blog-back-btn">
              <span>←</span> {locale === 'es' ? 'Volver al diario' : 'Back to journal'}
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  const coverUrl = wixImageUrl(post?.media?.wixMedia?.image, 1600, 800);

  // Best available content to render
  const htmlContent = post?.content || '';
  const textContent = post?.contentText || post?.excerpt || '';

  // Calculate reading time
  const wordCount = post?.contentText ? post.contentText.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 225)); // average reading speed 225 wpm

  return (
    <PageTransition>
      <article className="blog-post-page">
        {/* Editorial Hero Banner */}
        <div className={`blog-post-hero ${coverUrl ? 'has-cover' : 'no-cover'}`}>
          {coverUrl && (
            <div className="blog-post-hero-image-wrapper">
              <motion.img 
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.95 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                src={coverUrl} 
                alt={post.title} 
                className="blog-post-hero-image" 
              />
              <div className="blog-post-hero-overlay" />
            </div>
          )}

          <div className="blog-post-hero-content-wrapper">
            <div className="container">
              <ScrollReveal direction="fade" delay={0.2}>
                <Link to="/blog" className="blog-hero-back-link">
                  <span className="arrow">←</span> {locale === 'es' ? 'Volver al diario' : 'Back to journal'}
                </Link>
              </ScrollReveal>

              <div className="blog-post-hero-meta">
                <ScrollReveal direction="up" delay={0.3}>
                  <div className="blog-meta-row">
                    <span className="text-label blog-meta-item">
                      {locale === 'es' ? 'Diario' : 'Journal'}
                    </span>
                    <span className="blog-meta-dot">•</span>
                    <span className="text-label blog-meta-item">
                      {formatDate(post.firstPublishedDate, locale)}
                    </span>
                    <span className="blog-meta-dot">•</span>
                    <span className="text-label blog-meta-item highlight">
                      {locale === 'es' ? `${readingTime} min de lectura` : `${readingTime} min read`}
                    </span>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.4}>
                  <h1 className="blog-post-hero-title heading-display">{post.title}</h1>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="blog-post-body-container">
          <div className="container">
            <div className="blog-post-inner-layout">
              <ScrollReveal direction="up" delay={0.2} threshold={0.05}>
                <div className="blog-post-content-wrapper">
                  <div className="blog-post-body text-body">
                    {htmlContent ? (
                      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    ) : textContent ? (
                      <p>{textContent}</p>
                    ) : (
                      <p className="no-content-message">{locale === 'es' ? 'Contenido no disponible.' : 'Content not available.'}</p>
                    )}
                  </div>
                </div>
              </ScrollReveal>

              {/* End of article footer */}
              <ScrollReveal direction="up" delay={0.3} className="blog-post-footer">
                <div className="blog-post-footer-divider" />
                <div className="blog-post-footer-content">
                  <h3 className="heading-display">{locale === 'es' ? 'Gracias por leer' : 'Thank you for reading'}</h3>
                  <p className="text-body">{locale === 'es' ? 'Explora más reflexiones en nuestro diario sobre vida, naturaleza y trascendencia.' : 'Explore more reflections in our journal on life, nature, and transcendence.'}</p>
                  <Link to="/blog" className="blog-post-footer-btn">
                    {locale === 'es' ? 'Volver al diario completo' : 'Return to full journal'}
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </article>
    </PageTransition>
  );
};

export default BlogPostPage;

