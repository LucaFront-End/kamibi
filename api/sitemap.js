/**
 * Dynamic Sitemap XML Endpoint for Kamibi
 * 
 * Serves real-time XML sitemaps directly from Wix CMS, Wix Stores & Wix Blog.
 * Includes Edge CDN caching (1 hour) with background revalidation.
 * 
 * Types supported:
 *  - /api/sitemap?type=index     → Sitemap index
 *  - /api/sitemap?type=pages     → Static pages
 *  - /api/sitemap?type=productos → Products from Wix Stores
 *  - /api/sitemap?type=landings  → Dynamic CMS LandingsdeCiudad (2000+ items)
 *  - /api/sitemap?type=tiendas   → Dynamic CMS TiendasDinamicas
 *  - /api/sitemap?type=blog      → Wix Blog posts
 */

import { createClient, OAuthStrategy } from '@wix/sdk';
import { products } from '@wix/stores';
import { items } from '@wix/data';
import { posts } from '@wix/blog';

const SITE_URL = 'https://kamibistore.com';
const WIX_CLIENT_ID = '296237fc-b597-4736-b888-367dd4fd1740';

function today() {
  return new Date().toISOString().split('T')[0];
}

function xmlEscape(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildUrlEntry(loc, lastmod, changefreq = 'weekly', priority = '0.5') {
  return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function generateSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function getWixClient() {
  const wixClient = createClient({
    modules: { products, items, posts },
    auth: OAuthStrategy({ clientId: WIX_CLIENT_ID }),
  });
  await wixClient.auth.generateVisitorTokens();
  return wixClient;
}

function generatePagesSitemap() {
  const pages = [
    { path: '/',        changefreq: 'daily',   priority: '1.0' },
    { path: '/store',   changefreq: 'daily',   priority: '0.9' },
    { path: '/blog',    changefreq: 'daily',   priority: '0.8' },
    { path: '/about',   changefreq: 'monthly', priority: '0.6' },
    { path: '/contact', changefreq: 'monthly', priority: '0.6' },
    { path: '/zonas',   changefreq: 'weekly',  priority: '0.7' },
  ];

  const entries = pages
    .map(p => buildUrlEntry(`${SITE_URL}${p.path}`, today(), p.changefreq, p.priority))
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

async function generateProductsSitemap(wixClient) {
  let productItems = [];
  let result = await wixClient.products.queryProducts().limit(100).find();
  productItems = productItems.concat(result.items || []);
  while (result.hasNext && result.hasNext()) {
    result = await result.next();
    productItems = productItems.concat(result.items || []);
  }

  const entries = productItems
    .map(p => {
      const slug = p.slug;
      if (!slug) return null;
      return buildUrlEntry(
        `${SITE_URL}/product/${slug}`,
        p.lastUpdated ? new Date(p.lastUpdated).toISOString().split('T')[0] : today(),
        'weekly',
        '0.8'
      );
    })
    .filter(Boolean)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

async function generateLandingsSitemap(wixClient) {
  let landingItems = [];
  let result = await wixClient.items
    .query('LandingsdeCiudad')
    .limit(1000)
    .find();
  
  landingItems = landingItems.concat(result.items || []);
  while (result.hasNext && result.hasNext()) {
    result = await result.next();
    landingItems = landingItems.concat(result.items || []);
  }

  const entries = landingItems
    .map(item => {
      const data = item.data || item;
      const slug = data.slug || '';
      if (!slug) return null;
      const lastmod = data._updatedDate
        ? new Date(data._updatedDate).toISOString().split('T')[0]
        : today();
      return buildUrlEntry(`${SITE_URL}/${slug}`, lastmod, 'weekly', '0.7');
    })
    .filter(Boolean)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

async function generateTiendasSitemap(wixClient) {
  let storeItems = [];
  let result = await wixClient.items
    .query('TiendasDinamicas')
    .limit(1000)
    .find();
  
  storeItems = storeItems.concat(result.items || []);
  while (result.hasNext && result.hasNext()) {
    result = await result.next();
    storeItems = storeItems.concat(result.items || []);
  }

  const entries = storeItems
    .map(item => {
      const data = item.data || item;
      const title = data.title || '';
      const slug = generateSlug(title);
      if (!slug) return null;
      const lastmod = data._updatedDate
        ? new Date(data._updatedDate).toISOString().split('T')[0]
        : today();
      return buildUrlEntry(`${SITE_URL}/tienda/${slug}`, lastmod, 'weekly', '0.7');
    })
    .filter(Boolean)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

async function generateBlogSitemap(wixClient) {
  let blogItems = [];
  let result = await wixClient.posts.queryPosts().limit(100).find();
  blogItems = blogItems.concat(result.items || []);
  while (result.hasNext && result.hasNext()) {
    result = await result.next();
    blogItems = blogItems.concat(result.items || []);
  }

  const entries = blogItems
    .map(post => {
      const slug = post.slug;
      if (!slug) return null;
      const lastmod = post.lastPublishedDate
        ? new Date(post.lastPublishedDate).toISOString().split('T')[0]
        : (post.firstPublishedDate ? new Date(post.firstPublishedDate).toISOString().split('T')[0] : today());
      return buildUrlEntry(`${SITE_URL}/blog/${slug}`, lastmod, 'weekly', '0.7');
    })
    .filter(Boolean)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

function generateSitemapIndex() {
  const sitemaps = [
    'sitemap-pages.xml',
    'sitemap-productos.xml',
    'sitemap-landings.xml',
    'sitemap-tiendas.xml',
    'sitemap-blog.xml',
  ];

  const entries = sitemaps
    .map(name => `  <sitemap>
    <loc>${SITE_URL}/${name}</loc>
    <lastmod>${today()}</lastmod>
  </sitemap>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
}

export default async function handler(req, res) {
  // CORS & headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  // Cache for 1 hour at edge, serve stale while revalidating
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  const type = req.query?.type || 'index';

  try {
    let xml = '';

    if (type === 'pages') {
      xml = generatePagesSitemap();
    } else {
      const wixClient = await getWixClient();

      switch (type) {
        case 'productos':
          xml = await generateProductsSitemap(wixClient);
          break;
        case 'landings':
          xml = await generateLandingsSitemap(wixClient);
          break;
        case 'tiendas':
          xml = await generateTiendasSitemap(wixClient);
          break;
        case 'blog':
          xml = await generateBlogSitemap(wixClient);
          break;
        case 'index':
        default:
          xml = generateSitemapIndex();
          break;
      }
    }

    return res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap API Error:', error);
    return res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?><error>${xmlEscape(error.message || 'Failed to generate sitemap')}</error>`);
  }
}
