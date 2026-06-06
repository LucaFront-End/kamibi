import { useState, useEffect } from 'react';
import { useWixClient } from '../context/WixContext';
import { fetchAllProducts, fetchProductBySlug } from '../lib/wixProducts';

/**
 * Hook to fetch all products from Wix Stores.
 * Waits for the Wix SDK to be ready (visitor tokens generated) before fetching.
 * Returns { products, loading, error }
 */
export function useWixProducts() {
  const { wixClient, isReady } = useWixClient();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isReady) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllProducts(wixClient);
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
    return () => { cancelled = true; };
  }, [wixClient, isReady]);

  return { products, loading, error };
}

/**
 * Hook to fetch a single product by slug from Wix Stores.
 * Waits for the Wix SDK to be ready before fetching.
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

    async function load() {
      try {
        setLoading(true);
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

    load();
    return () => { cancelled = true; };
  }, [wixClient, isReady, slug]);

  return { product, loading, error };
}
