import { useState, useEffect } from 'react';
import { useWixClient } from '../context/WixContext';

/**
 * Fetches the list of blog posts from Wix Blog with live revalidation on window focus.
 * @param {number} limit - Maximum number of posts to fetch
 */
export function useWixPosts(limit = 50) {
  const { wixClient, isReady } = useWixClient();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;

    async function fetchPosts(showLoader = true) {
      if (showLoader) setLoading(true);
      setError(null);
      try {
        const response = await wixClient.posts
          .queryPosts()
          .limit(limit)
          .find();

        if (!cancelled) {
          setPosts(response.items || []);
        }
      } catch (err) {
        console.error('[Blog] Error fetching posts:', err?.message);
        if (!cancelled) setError(err?.message || 'Could not load articles.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPosts(true);
    const onFocus = () => fetchPosts(false);
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, [wixClient, isReady, limit]);

  return { posts, loading, error };
}

/**
 * Fetches a single blog post by slug with live revalidation on window focus.
 * Tries getPostBySlug first (with RICH_CONTENT fieldset for full content),
 * then falls back to queryPosts().eq('slug', slug) if not found.
 */
export function useWixPost(slug) {
  const { wixClient, isReady } = useWixClient();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isReady || !slug) {
      if (!slug) setLoading(false);
      return;
    }
    let cancelled = false;

    async function fetchPost(showLoader = true) {
      if (showLoader) setLoading(true);
      setError(null);

      try {
        let postData = null;
        try {
          const response = await wixClient.posts.getPostBySlug(slug, {
            fieldsets: ['RICH_CONTENT'],
          });
          const candidate = response?.post || response;
          if (candidate && (candidate._id || candidate.id || candidate.title)) {
            postData = candidate;
          }
        } catch (err) {
          // Fallback to queryPosts below
        }

        if (!postData) {
          const queryRes = await wixClient.posts
            .queryPosts({ fieldsets: ['RICH_CONTENT'] })
            .eq('slug', slug)
            .limit(1)
            .find();

          if (queryRes.items && queryRes.items.length > 0) {
            postData = queryRes.items[0];
          }
        }

        if (postData) {
          if (!cancelled) {
            setPost(postData);
            setError(null);
          }
        } else {
          if (!cancelled) {
            setPost(null);
            setError('Post not found');
          }
        }
      } catch (err) {
        console.error('[Blog] Fatal error fetching post:', err?.message);
        if (!cancelled) setError(err?.message || 'Could not load article.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPost(true);
    const onFocus = () => fetchPost(false);
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, [wixClient, isReady, slug]);

  return { post, loading, error };
}
