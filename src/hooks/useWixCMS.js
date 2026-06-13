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
export function useWixLandings() {
  const { wixClient, isReady } = useWixClient();
  const [landings, setLandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const res = await wixClient.items.query(LANDINGS_COLLECTION).limit(100).find();
        if (!cancelled) setLandings((res.items || []).map(i => normalizeCMSItem(i)));
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

export function useWixLandingBySlug(slug) {
  const { wixClient, isReady } = useWixClient();
  const [landing, setLanding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isReady || !slug) return;
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
            setLanding(normalizeCMSItem(res.items[0]));
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
        const res = await wixClient.items.query(STORES_COLLECTION).limit(100).find();
        if (!cancelled) setStores((res.items || []).map(i => normalizeCMSItem(i, true)));
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
        const res = await wixClient.items.query(STORES_COLLECTION).limit(100).find();
        const allStores = (res.items || []).map(i => normalizeCMSItem(i, true));
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
