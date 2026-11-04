import { useState, useEffect } from 'react';
import { useWixClient } from '../context/WixContext';
import { fetchAllProducts, fetchProductBySlug } from '../lib/wixProducts';

let cachedProducts = null;

/**
 * Hook to fetch all products from Wix Stores in real time.
 * Revalidates automatically on mount and window focus so any Wix Stores edit/add/delete reflects immediately.
 * Returns { products, loading, error }
 */
export function useWixProducts() {
  const { wixClient, isReady } = useWixClient();
  const [products, setProducts] = useState(cachedProducts || []);
  const [loading, setLoading] = useState(cachedProducts ? false : true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isReady) return;

    let cancelled = false;

    async function load() {
      try {
        if (!cachedProducts) setLoading(true);
        setError(null);
        const data = await fetchAllProducts(wixClient);
        cachedProducts = data;
        if (!cancelled) setProducts(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load products');
          console.error('[useWixProducts]', err);
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
  }, [wixClient, isReady]);

  return { products, loading, error };
}

/**
 * Hook to fetch a single product by slug from Wix Stores in real time.
 * Returns { product, loading, error }
 */
export function useWixProduct(slug) {
  const { wixClient, isReady } = useWixClient();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isReady || !slug) {
      if (!slug) setLoading(false);
      return;
    }

    let cancelled = false;

    async function load(isInitial = false) {
      try {
        if (isInitial) setLoading(true);
        setError(null);
        const data = await fetchProductBySlug(wixClient, slug);
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load product');
          console.error('[useWixProduct]', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load(true);

    const handleFocus = () => load(false);
    window.addEventListener('focus', handleFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', handleFocus);
    };
  }, [wixClient, isReady, slug]);

  return { product, loading, error };
}
