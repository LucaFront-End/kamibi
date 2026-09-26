import { useState, useEffect } from 'react';
import { useWixClient } from '../context/WixContext';

const LANDINGS_COLLECTION = 'LandingsdeCiudad';
const STORES_COLLECTION = 'TiendasDinamicas';

// ── Generate slug from title ─────────────────────────────────────────────
function generateSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/-+/g, '-')            // collapse multiple hyphens
    .replace(/^-|-$/g, '');         // trim leading/trailing hyphens
}

// ── Shared normalizer (both collections have the same field structure) ────
function normalizeCMSItem(item, useGeneratedSlug = false) {
  const data = item.data || item;
  const title = data.title || '';
  return {
    _id: data._id,
    title,
    slug: useGeneratedSlug ? generateSlug(title) : (data.slug || ''),
    city: data.ciudadOEstado || '',
    country: data.pas || '',
    pageTitle: data.tituloPgina || title || '',
    excerpt: data.excerptPgina || '',
    seoTitle: data.tituloSeo || '',
    seoDescription: data.metadescripcinSeo || '',
    status: data._publishStatus || 'PUBLISHED',
    createdDate: data._createdDate || '',
    updatedDate: data._updatedDate || '',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Landings de Ciudad — has native slug field
// ═══════════════════════════════════════════════════════════════════════════
let allLandingsCache = null;

export function useWixLandings() {
  const { wixClient, isReady } = useWixClient();
  const [landings, setLandings] = useState(allLandingsCache || []);
  const [loading, setLoading] = useState(allLandingsCache ? false : true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (allLandingsCache && allLandingsCache.length > 0) {
      setLandings(allLandingsCache);
      setLoading(false);
      return;
    }

    if (!isReady) return;
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        // Step 1: Fetch first 100 items immediately so UI renders in <300ms
        let res = await wixClient.items.query(LANDINGS_COLLECTION).limit(100).find();
        let items = (res.items || []).map(i => normalizeCMSItem(i));
        if (!cancelled) {
          setLandings(items);
          setLoading(false);
        }

        // Step 2: Fetch remaining items in background without freezing UI
        if (res.hasNext && res.hasNext()) {
          let fullList = [...items];
          let nextRes = await wixClient.items.query(LANDINGS_COLLECTION).skip(100).limit(1000).find();
          fullList = fullList.concat((nextRes.items || []).map(i => normalizeCMSItem(i)));
          while (nextRes.hasNext && nextRes.hasNext()) {
            nextRes = await nextRes.next();
            fullList = fullList.concat((nextRes.items || []).map(i => normalizeCMSItem(i)));
          }
          allLandingsCache = fullList;
          if (!cancelled) {
            setLandings(fullList);
          }
        } else {
          allLandingsCache = items;
        }
      } catch (err) {
        console.error('[CMS] Error fetching landings:', err);
        if (!cancelled) setError(err?.message || 'Could not load landings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [wixClient, isReady]);

  return { landings, loading, error };
}

const landingCache = new Map();

export function useWixLandingBySlug(slug) {
  const { wixClient, isReady } = useWixClient();
  const cached = slug ? landingCache.get(slug) : null;
  const [landing, setLanding] = useState(cached || null);
  const [loading, setLoading] = useState(cached ? false : true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    if (landingCache.has(slug)) {
      setLanding(landingCache.get(slug));
      setLoading(false);
      return;
    }

    if (!isReady) return;
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const res = await wixClient.items
          .query(LANDINGS_COLLECTION)
          .eq('slug', slug)
          .limit(1)
          .find();

        if (!cancelled) {
          if (res.items?.length > 0) {
            const normalized = normalizeCMSItem(res.items[0]);
            landingCache.set(slug, normalized);
            setLanding(normalized);
          } else {
            setLanding(null);
            setError('Landing not found');
          }
        }
      } catch (err) {
        console.error('[CMS] Error fetching landing:', err);
        if (!cancelled) { setError(err?.message || 'Error'); setLanding(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [wixClient, isReady, slug]);

  return { landing, loading, error };
}

// ═══════════════════════════════════════════════════════════════════════════
// Tiendas Dinámicas — NO native slug field, slug generated from title
// ═══════════════════════════════════════════════════════════════════════════
export function useWixStores() {
  const { wixClient, isReady } = useWixClient();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        let allItems = [];
        let res = await wixClient.items.query(STORES_COLLECTION).limit(1000).find();
        allItems = allItems.concat(res.items || []);
        while (res.hasNext && res.hasNext()) {
          res = await res.next();
          allItems = allItems.concat(res.items || []);
        }
        if (!cancelled) setStores(allItems.map(i => normalizeCMSItem(i, true)));
      } catch (err) {
        console.error('[CMS] Error fetching stores:', err);
        if (!cancelled) setError(err?.message || 'Could not load stores.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [wixClient, isReady]);

  return { stores, loading, error };
}

/**
 * Fetch a store by slug — fetches ALL stores and matches by generated slug.
 * (Because TiendasDinamicas doesn't have a native slug field)
 */
export function useWixStoreBySlug(slug) {
  const { wixClient, isReady } = useWixClient();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isReady || !slug) return;
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        let allItems = [];
        let res = await wixClient.items.query(STORES_COLLECTION).limit(1000).find();
        allItems = allItems.concat(res.items || []);
        while (res.hasNext && res.hasNext()) {
          res = await res.next();
          allItems = allItems.concat(res.items || []);
        }
        const allStores = allItems.map(i => normalizeCMSItem(i, true));
        const match = allStores.find(s => s.slug === slug);

        if (!cancelled) {
          if (match) {
            setStore(match);
          } else {
            setStore(null);
            setError('Store not found');
          }
        }
      } catch (err) {
        console.error('[CMS] Error fetching store by slug:', err);
        if (!cancelled) { setError(err?.message || 'Error'); setStore(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [wixClient, isReady, slug]);

  return { store, loading, error };
}
