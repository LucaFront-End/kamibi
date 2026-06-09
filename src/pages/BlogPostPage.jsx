import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { useWixPost } from '../hooks/useWixBlog';
import { PageTransition } from '../components/layout/PageTransition';
import './BlogPostPage.css';

function formatDate(dateStr, locale) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(
    locale === 'es' ? 'es-AR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
}

// Converts wix:image://v1/{fileId}/... to wixstatic CDN URL
function wixImageUrl(wixUri, width = 1200, height = 630) {
  if (!wixUri || typeof wixUri !== 'string') return null;
  if (wixUri.startsWith('http')) return wixUri;
  const withoutProto = wixUri.replace('wix:image://v1/', '');
  const fileId = withoutProto.split('/')[0].split('#')[0];
  if (!fileId) return null;
  return `https://static.wixstatic.com/media/${fileId}/v1/fill/w_${width},h_${height},al_c,q_85,usm_0.33_1.00_0.00/file.jpg`;
}

export const BlogPostPage = () => {
  const { slug } = useParams();
  const { locale } = useTranslation();
  const { post, loading, error } = useWixPost(slug);

  if (loading) {
    return (
      <PageTransition>
        <div className="blog-post-page">
          <div className="blog-post-skeleton container">
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
        <div className="blog-post-page">
          <div className="container blog-post-error">
            <p>{locale === 'es' ? 'No se encontró el artículo.' : 'Article not found.'}</p>
            <Link to="/blog" className="blog-back-link">
              ← {locale === 'es' ? 'Volver al diario' : 'Back to journal'}
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  const coverUrl = wixImageUrl(post.media?.wixMedia?.image, 1400, 600);

  return (
    <PageTransition>
      <article className="blog-post-page">
        {/* Cover image */}
        {coverUrl && (
          <div className="blog-post-cover">
            <img src={coverUrl} alt={post.title} className="blog-post-cover-img" />
            <div className="blog-post-cover-overlay" />
          </div>
        )}

        <div className="container blog-post-container">
          {/* Back link */}
          <Link to="/blog" className="blog-back-link">
            ← {locale === 'es' ? 'Volver al diario' : 'Back to journal'}
          </Link>

          {/* Meta */}
          <header className="blog-post-header">
            <span className="text-label blog-post-date">
              {formatDate(post.firstPublishedDate, locale)}
            </span>
            <h1 className="blog-post-title heading-display">{post.title}</h1>
            {post.excerpt && (
              <p className="blog-post-excerpt text-body">{post.excerpt}</p>
            )}
          </header>

          <div className="blog-post-divider" />

          {/* Content rendered from Wix rich text */}
          <div
            className="blog-post-content text-body"
            dangerouslySetInnerHTML={{ __html: post.content || post.richContent?.nodes?.map(n => n.textData?.text || '').join('') || '' }}
          />
        </div>
      </article>
    </PageTransition>
  );
};

export default BlogPostPage;
