import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useSEO — Dynamically updates <title> and <meta> tags per page.
 * @param {Object} params
 * @param {string} params.titleEn  - Page title in English
 * @param {string} params.titleEs  - Page title in Spanish
 * @param {string} params.descEn   - Meta description in English
 * @param {string} params.descEs   - Meta description in Spanish
 * @param {string} params.locale   - Current locale ('en' | 'es')
 */
export const useSEO = ({ titleEn, titleEs, descEn, descEs, locale }) => {
  useEffect(() => {
    const title  = locale === 'es' ? titleEs : titleEn;
    const desc   = locale === 'es' ? descEs  : descEn;
    const lang   = locale === 'es' ? 'es'    : 'en';

    // Title
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = desc;

    // Lang attribute on <html>
    document.documentElement.lang = lang;

    // OG tags
    const setOG = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setOG('og:title',       title);
    setOG('og:description', desc);
    setOG('og:type',        'website');
    setOG('og:site_name',   'Kamibi Store');
    setOG('og:image',       'https://kamibistore.com/images/kamibi-logo-dark.png');

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `https://kamibistore.com${window.location.pathname}`;

  }, [titleEn, titleEs, descEn, descEs, locale]);
};
