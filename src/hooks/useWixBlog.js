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
          .descending('publishedDate')
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
      try {
        const response = await wixClient.posts.getPostBySlug(slug);
        if (!cancelled) setPost(response);
      } catch (err) {
        console.error('[Blog] Error fetching post:', err);
        if (!cancelled) setError(err?.message || 'Could not load article.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPost();
    return () => { cancelled = true; };
  }, [wixClient, isReady, slug]);

  return { post, loading, error };
}
