import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useWixAdLandingBySlug } from '../hooks/useWixCMS';
import { UrnaBiodegradableLanding } from './UrnaBiodegradableLanding';

function formatSlugToTitle(slug = '') {
  if (!slug) return '';
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => {
      const lower = w.toLowerCase();
      if (
        [
          'in',
          'for',
          'at',
          'and',
          'or',
          'of',
          'to',
          'on',
          'the',
          'a',
          'an',
          'en',
          'de',
          'para',
          'y',
          'con',
          'del',
          'la',
          'el',
          'las',
          'los',
        ].includes(lower)
      ) {
        return lower;
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

/**
 * Dynamic Ads Landing Page (/zonas/:slug)
 * Duplicates the dynamic CMS landing architecture from /ciudades/:slug (CityLandingPage),
 * using the Ads Landing experience (UrnaBiodegradableLanding) with dynamic CMS fields.
 */
export const ZonaAdLandingPage = () => {
  const { slug } = useParams();
  const { landing, loading } = useWixAdLandingBySlug(slug);

  const fallbackTitle = useMemo(() => formatSlugToTitle(slug), [slug]);

  return (
    <UrnaBiodegradableLanding
      cmsLanding={landing}
      cmsLoading={loading}
      zoneSlug={slug}
      fallbackZoneTitle={fallbackTitle}
    />
  );
};

export default ZonaAdLandingPage;

