import { useState, useEffect } from 'react';
import { useWixClient } from '../context/WixContext';

export const LANDINGS_COLLECTION = 'LandingsdeCiudad';
export const ZONAS_COLLECTION = import.meta.env.VITE_WIX_ADS_CMS_COLLECTION || 'Zonas';
export const ADS_LANDINGS_COLLECTION = ZONAS_COLLECTION;
export const STORES_COLLECTION = 'TiendasDinamicas';

// ── Generate URL-safe slug from text ─────────────────────────────────────
export function generateSlug(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')    // remove special chars
    .replace(/\s+/g, '-')            // spaces to hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .replace(/^-|-$/g, '');          // trim leading/trailing hyphens
}

// ── Shared normalizer (supports all Wix CMS field key variations) ────────
export function normalizeCMSItem(item, useGeneratedSlug = false) {
  const data = item?.data || item || {};
  const title = data.title || data.tituloPgina || data.tituloPagina || data.ciudadOEstado || '';
  const rawSlug = data.slug ? generateSlug(data.slug) : '';
  return {
    _id: data._id,
    title,
    slug: useGeneratedSlug ? generateSlug(title) : (rawSlug || generateSlug(title)),
    city: data.ciudadOEstado || data.ciudad || data.city || '',
    country: data.pas || data.pais || data.country || '',
    pageTitle: data.tituloPgina || data.tituloPagina || data.pageTitle || title || '',
    excerpt: data.excerptPgina || data.excerptPagina || data.excerpt || '',
    seoTitle: data.tituloSeo || data.seoTitle || '',
    seoDescription:
      data.metadescripcinSeo || data.metadescripcionSeo || data.seoDescription || '',
    status: data._publishStatus || 'PUBLISHED',
    createdDate: data._createdDate || '',
    updatedDate: data._updatedDate || '',
  };
}

// Helper to fetch all items from a Wix Data collection with full pagination
async function fetchAllCollectionItems(wixClient, collectionName, useGeneratedSlug = false, onFirstBatch = null) {
  let res = await wixClient.items.query(collectionName).limit(100).find();
  let firstItems = (res.items || [])
    .map((i) => normalizeCMSItem(i, useGeneratedSlug))
    .filter((i) => i.slug && i.status !== 'DRAFT');

  if (onFirstBatch) {
    onFirstBatch(firstItems);
  }

  if (res.hasNext && res.hasNext()) {
    let fullList = [...firstItems];
    let nextRes = await wixClient.items.query(collectionName).skip(100).limit(1000).find();
    fullList = fullList.concat(
      (nextRes.items || [])
        .map((i) => normalizeCMSItem(i, useGeneratedSlug))
        .filter((i) => i.slug && i.status !== 'DRAFT')
    );
    while (nextRes.hasNext && nextRes.hasNext()) {
      nextRes = await nextRes.next();
      fullList = fullList.concat(
        (nextRes.items || [])
          .map((i) => normalizeCMSItem(i, useGeneratedSlug))
          .filter((i) => i.slug && i.status !== 'DRAFT')
      );
    }
    return fullList;
  }

  return firstItems;
}

// Helper to fetch a single item by slug from a Wix Data collection (supports both native slug & title-generated slug)
async function fetchCollectionItemBySlug(wixClient, collectionName, targetSlug, useGeneratedSlug = false) {
  const normalizedTarget = generateSlug(targetSlug);

  if (!useGeneratedSlug) {
    try {
      const directRes = await wixClient.items
        .query(collectionName)
        .eq('slug', targetSlug)
        .limit(1)
        .find();
      if (directRes.items?.length > 0) {
        const item = normalizeCMSItem(directRes.items[0], false);
        if (item.status !== 'DRAFT') return item;
      }
      if (normalizedTarget && normalizedTarget !== targetSlug) {
        const normRes = await wixClient.items
          .query(collectionName)
          .eq('slug', normalizedTarget)
          .limit(1)
          .find();
        if (normRes.items?.length > 0) {
          const item = normalizeCMSItem(normRes.items[0], false);
          if (item.status !== 'DRAFT') return item;
        }
      }
    } catch {
      // Collection may not have a native 'slug' column indexed; fall through to full scan
    }
  }

  // Full paginated scan for items whose native or title-generated slug matches
  let res = await wixClient.items.query(collectionName).limit(1000).find();
  let allItems = res.items || [];
  while (res.hasNext && res.hasNext()) {
    res = await res.next();
    allItems = allItems.concat(res.items || []);
  }

  for (const raw of allItems) {
    const normalized = normalizeCMSItem(raw, useGeneratedSlug);
    if (
      normalized.status !== 'DRAFT' &&
      (normalized.slug === targetSlug || normalized.slug === normalizedTarget)
    ) {
      return normalized;
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. Landings de Ciudad (SEO: /ciudades/:slug — Collection: LandingsdeCiudad)
// ═══════════════════════════════════════════════════════════════════════════
let allLandingsCache = null;
const landingCache = new Map();

export function useWixLandings() {
  const { wixClient, isReady } = useWixClient();
  const [landings, setLandings] = useState(allLandingsCache || []);
  const [loading, setLoading] = useState(allLandingsCache ? false : true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;

    async function load() {
      if (!allLandingsCache) setLoading(true);
      setError(null);
      try {
        const fullList = await fetchAllCollectionItems(
          wixClient,
          LANDINGS_COLLECTION,
          false,
          (firstBatch) => {
            if (!cancelled && !allLandingsCache) {
              setLandings(firstBatch);
              setLoading(false);
            }
          }
        );
        allLandingsCache = fullList;
        if (!cancelled) {
          setLandings(fullList);
        }
      } catch (err) {
        console.error('[CMS] Error fetching LandingsdeCiudad:', err);
        if (!cancelled) setError(err?.message || 'Could not load landings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    const handleFocus = () => load();
    window.addEventListener('focus', handleFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', handleFocus);
    };
  }, [wixClient, isReady]);

  return { landings, loading, error };
}

export function useWixLandingBySlug(slug) {
  const { wixClient, isReady } = useWixClient();
  const cached = slug ? landingCache.get(slug) : null;
  const [landing, setLanding] = useState(cached || null);
  const [loading, setLoading] = useState(cached ? false : true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLanding(null);
      setLoading(false);
      return;
    }
    if (!isReady) return;
    let cancelled = false;

    async function load() {
      if (!landingCache.has(slug)) setLoading(true);
      setError(null);
      try {
        const found = await fetchCollectionItemBySlug(
          wixClient,
          LANDINGS_COLLECTION,
          slug,
          false
        );
        if (!cancelled) {
          if (found) {
            landingCache.set(slug, found);
            setLanding(found);
            setError(null);
          } else {
            landingCache.delete(slug);
            setLanding(null);
            setError('Landing not found');
          }
        }
      } catch (err) {
        console.error('[CMS] Error fetching landing by slug:', err);
        if (!cancelled) {
          landingCache.delete(slug);
          setLanding(null);
          setError(err?.message || 'Error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    const handleFocus = () => load();
    window.addEventListener('focus', handleFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', handleFocus);
    };
  }, [wixClient, isReady, slug]);

  return { landing, loading, error };
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Zonas / Landings de Anuncios (/zonas/:slug — Collection: Zonas)
// ═══════════════════════════════════════════════════════════════════════════
let allZonasCache = null;
const zonaCache = new Map();

export function useWixAdLandings() {
  const { wixClient, isReady } = useWixClient();
  const [adLandings, setAdLandings] = useState(allZonasCache || []);
  const [loading, setLoading] = useState(allZonasCache ? false : true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;

    async function load() {
      if (!allZonasCache) setLoading(true);
      setError(null);
      try {
        const fullList = await fetchAllCollectionItems(
          wixClient,
          ZONAS_COLLECTION,
          false,
          (firstBatch) => {
            if (!cancelled && !allZonasCache) {
              setAdLandings(firstBatch);
              setLoading(false);
            }
          }
        );
        allZonasCache = fullList;
        if (!cancelled) {
          setAdLandings(fullList);
        }
      } catch (err) {
        console.warn('[CMS] Error fetching Zonas collection:', err?.message);
        if (!cancelled) setError(err?.message || 'Could not load zonas.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    const handleFocus = () => load();
    window.addEventListener('focus', handleFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', handleFocus);
    };
  }, [wixClient, isReady]);

  return { adLandings, loading, error };
}

export function useWixAdLandingBySlug(slug) {
  const { wixClient, isReady } = useWixClient();
  const cached = slug ? zonaCache.get(slug) : null;
  const [landing, setLanding] = useState(cached || null);
  const [loading, setLoading] = useState(cached ? false : true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLanding(null);
      setLoading(false);
      return;
    }
    if (!isReady) return;
    let cancelled = false;

    async function load() {
      if (!zonaCache.has(slug)) setLoading(true);
      setError(null);
      try {
        const found = await fetchCollectionItemBySlug(
          wixClient,
          ZONAS_COLLECTION,
          slug,
          false
        );
        if (!cancelled) {
          if (found) {
            zonaCache.set(slug, found);
            setLanding(found);
            setError(null);
          } else {
            zonaCache.delete(slug);
            setLanding(null);
            setError('Zona not found in CMS');
          }
        }
      } catch (err) {
        console.warn('[CMS] Error fetching zona by slug:', err?.message);
        if (!cancelled) {
          zonaCache.delete(slug);
          setLanding(null);
          setError(err?.message || 'Error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    const handleFocus = () => load();
    window.addEventListener('focus', handleFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', handleFocus);
    };
  }, [wixClient, isReady, slug]);

  return { landing, loading, error };
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Tiendas Dinámicas (/tienda/:slug — Collection: TiendasDinamicas)
// ═══════════════════════════════════════════════════════════════════════════
let allStoresCache = null;
const storeCache = new Map();

export function useWixStores() {
  const { wixClient, isReady } = useWixClient();
  const [stores, setStores] = useState(allStoresCache || []);
  const [loading, setLoading] = useState(allStoresCache ? false : true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;

    async function load() {
      if (!allStoresCache) setLoading(true);
      setError(null);
      try {
        const fullList = await fetchAllCollectionItems(
          wixClient,
          STORES_COLLECTION,
          true
        );
        allStoresCache = fullList;
        if (!cancelled) {
          setStores(fullList);
        }
      } catch (err) {
        console.error('[CMS] Error fetching TiendasDinamicas:', err);
        if (!cancelled) setError(err?.message || 'Could not load stores.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    const handleFocus = () => load();
    window.addEventListener('focus', handleFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', handleFocus);
    };
  }, [wixClient, isReady]);

  return { stores, loading, error };
}

export function useWixStoreBySlug(slug) {
  const { wixClient, isReady } = useWixClient();
  const cached = slug ? storeCache.get(slug) : null;
  const [store, setStore] = useState(cached || null);
  const [loading, setLoading] = useState(cached ? false : true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setStore(null);
      setLoading(false);
      return;
    }
    if (!isReady) return;
    let cancelled = false;

    async function load() {
      if (!storeCache.has(slug)) setLoading(true);
      setError(null);
      try {
        const found = await fetchCollectionItemBySlug(
          wixClient,
          STORES_COLLECTION,
          slug,
          true
        );
        if (!cancelled) {
          if (found) {
            storeCache.set(slug, found);
            setStore(found);
            setError(null);
          } else {
            storeCache.delete(slug);
            setStore(null);
            setError('Store not found');
          }
        }
      } catch (err) {
        console.error('[CMS] Error fetching store by slug:', err);
        if (!cancelled) {
          storeCache.delete(slug);
          setStore(null);
          setError(err?.message || 'Error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    const handleFocus = () => load();
    window.addEventListener('focus', handleFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', handleFocus);
    };
  }, [wixClient, isReady, slug]);

  return { store, loading, error };
}
