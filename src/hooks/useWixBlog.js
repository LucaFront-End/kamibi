import { useState, useEffect } from 'react';
import { useWixClient } from '../context/WixContext';

/**
 * Fetches the list of blog posts from Wix Blog.
 * @param {number} limit - Maximum number of posts to fetch
 */
export function useWixPosts(limit = 10) {
  const { wixClient, isReady } = useWixClient();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;

    async function fetchPosts() {
      setLoading(true);
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

    fetchPosts();
    return () => { cancelled = true; };
  }, [wixClient, isReady, limit]);

  return { posts, loading, error };
}

/**
 * Fetches a single blog post by slug.
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

    async function fetchPost() {
      setLoading(true);
      setError(null);
      console.log('[Blog] Fetching post for slug:', slug);

      try {
        // Strategy 1: getPostBySlug with RICH_CONTENT fieldset
        let postData = null;
        try {
          const response = await wixClient.posts.getPostBySlug(slug, {
            fieldsets: ['RICH_CONTENT'],
          });
          console.log('[Blog] getPostBySlug raw response:', response);
          const candidate = response?.post || response;
          if (candidate && (candidate._id || candidate.id || candidate.title)) {
            postData = candidate;
            console.log('[Blog] Post found via getPostBySlug:', postData.title || postData._id);
          } else {
            console.warn('[Blog] getPostBySlug returned empty/null, trying queryPosts fallback...');
          }
        } catch (err) {
          console.warn('[Blog] getPostBySlug threw error:', err?.message, '— trying queryPosts fallback...');
        }

        // Strategy 2: queryPosts fallback (only if strategy 1 didn't find it)
        if (!postData) {
          const queryRes = await wixClient.posts
            .queryPosts({ fieldsets: ['RICH_CONTENT'] })
            .eq('slug', slug)
            .limit(1)
            .find();

          console.log('[Blog] queryPosts fallback result count:', queryRes.items?.length);
          if (queryRes.items && queryRes.items.length > 0) {
            postData = queryRes.items[0];
            console.log('[Blog] Post found via queryPosts:', postData.title);
          }
        }

        if (postData) {
          if (!cancelled) setPost(postData);
        } else {
          console.error('[Blog] Post not found for slug via either method:', slug);
          if (!cancelled) setError('Post not found');
        }
      } catch (err) {
        console.error('[Blog] Fatal error fetching post:', err?.message);
        if (!cancelled) setError(err?.message || 'Could not load article.');
      } finally {
        // Always called — even when strategy 1 succeeds immediately
        if (!cancelled) setLoading(false);
      }
    }

    fetchPost();
    return () => { cancelled = true; };
  }, [wixClient, isReady, slug]);

  return { post, loading, error };
}

