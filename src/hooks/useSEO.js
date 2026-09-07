import { useEffect } from 'react';

/**
 * useSEO — Dynamically updates <title>, <meta> tags, Open Graph, Twitter Cards,
 * canonical URLs, and optional JSON-LD structured data per page.
 * 
 * @param {Object} params
 * @param {string} params.titleEn     - Page title in English
 * @param {string} params.titleEs     - Page title in Spanish
 * @param {string} params.descEn      - Meta description in English
 * @param {string} params.descEs      - Meta description in Spanish
 * @param {string} params.locale      - Current locale ('en' | 'es')
 * @param {string} [params.image]     - Social share image URL (defaults to Kamibi logo)
 * @param {string} [params.type]      - OG type ('website' | 'product' | 'article')
 * @param {string} [params.keywords]  - Meta keywords string
 * @param {string} [params.canonical] - Custom canonical URL
 * @param {Object} [params.schema]    - Structured Data object for JSON-LD (e.g. Schema.org Product)
 */
export const useSEO = ({
  titleEn,
  titleEs,
  descEn,
  descEs,
  locale = 'en',
  image,
  type = 'website',
  keywords,
  canonical,
  schema,
}) => {
  useEffect(() => {
    const title = locale === 'es' ? (titleEs || titleEn) : (titleEn || titleEs);
    const desc  = locale === 'es' ? (descEs  || descEn)  : (descEn  || descEs);
    const lang  = locale === 'es' ? 'es' : 'en';

    // Title
    if (title) {
      document.title = title;
    }

    // Helper to set or create a <meta> tag by attribute (name or property)
    const setMeta = (attr, val, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    // Description meta & OG & Twitter
    if (desc) {
      setMeta('name', 'description', desc);
      setMeta('property', 'og:description', desc);
      setMeta('name', 'twitter:description', desc);
    }

    // Title OG & Twitter
    if (title) {
      setMeta('property', 'og:title', title);
      setMeta('name', 'twitter:title', title);
    }

    // Lang attribute on <html>
    document.documentElement.lang = lang;

    // Social share image
    const shareImage = image || 'https://kamibistore.com/images/kamibi-logo-dark.png';
    setMeta('property', 'og:image', shareImage);
    setMeta('name', 'twitter:image', shareImage);
    setMeta('name', 'twitter:card', 'summary_large_image');

    // OG type & site name
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', 'Kamibi Store');

    // Keywords
    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }

    // Canonical link
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.rel = 'canonical';
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = canonical || `https://kamibistore.com${window.location.pathname}`;

    // Dynamic JSON-LD Structured Data
    let schemaScript = document.getElementById('dynamic-json-ld');
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'dynamic-json-ld';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }

    return () => {
      // Cleanup dynamically injected schema when component unmounts or changes
      const s = document.getElementById('dynamic-json-ld');
      if (s) s.remove();
    };
  }, [titleEn, titleEs, descEn, descEs, locale, image, type, keywords, canonical, schema]);
};
