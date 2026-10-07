/**
 * Sitemap Generator for Kamibi
 * 
 * Generates:
 *  - sitemap.xml            → Sitemap index referencing all sub-sitemaps
 *  - sitemap-pages.xml      → Static pages (home, store, etc.)
 *  - sitemap-productos.xml  → All product pages fetched from Wix Stores
 *  - sitemap-landings.xml   → Dynamic CMS landing pages (LandingsdeCiudad - fully paginated 2000+ items)
 *  - sitemap-tiendas.xml    → Dynamic CMS store pages (TiendasDinamicas)
 *  - sitemap-blog.xml       → Wix Blog articles
 *
 * Usage: node scripts/generate-sitemap.cjs
 */

const { createClient, OAuthStrategy } = require('@wix/sdk');
const { products } = require('@wix/stores');
const { items } = require('@wix/data');
const { posts } = require('@wix/blog');
const fs = require('fs');
const path = require('path');

// ─── Config ────────────────────────────────────────────────────────────────────
const SITE_URL = 'https://kamibistore.com';
const WIX_CLIENT_ID = '296237fc-b597-4736-b888-367dd4fd1740';
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public');
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

// ─── Helpers ───────────────────────────────────────────────────────────────────
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

// ─── Create Wix Client (shared) ────────────────────────────────────────────────
async function createWixClient() {
  const wixClient = createClient({
    modules: { products, items, posts },
    auth: OAuthStrategy({ clientId: WIX_CLIENT_ID }),
  });
  await wixClient.auth.generateVisitorTokens();
  return wixClient;
}

// ─── Static Pages ──────────────────────────────────────────────────────────────
function generatePagesSitemap() {
  const pages = [
    { path: '/',        changefreq: 'daily',   priority: '1.0' },
    { path: '/store',   changefreq: 'daily',   priority: '0.9' },
    { path: '/blog',    changefreq: 'daily',   priority: '0.8' },
    { path: '/about',   changefreq: 'monthly', priority: '0.6' },
    { path: '/contact', changefreq: 'monthly', priority: '0.6' },
    { path: '/zonas',   changefreq: 'weekly',  priority: '0.7' },
    { path: '/privacy-policy',        changefreq: 'monthly', priority: '0.5' },
    { path: '/aviso-de-privacidad',    changefreq: 'monthly', priority: '0.5' },
    { path: '/terms-of-service',      changefreq: 'monthly', priority: '0.5' },
    { path: '/terminos-y-condiciones', changefreq: 'monthly', priority: '0.5' },
    { path: '/shipping-policy',       changefreq: 'monthly', priority: '0.5' },
    { path: '/politica-de-envios',     changefreq: 'monthly', priority: '0.5' },
    { path: '/refund-policy',         changefreq: 'monthly', priority: '0.5' },
    { path: '/politica-de-reembolsos', changefreq: 'monthly', priority: '0.5' },
    { path: '/cookie-policy',         changefreq: 'monthly', priority: '0.5' },
    { path: '/politica-de-cookies',    changefreq: 'monthly', priority: '0.5' },
  ];

  const entries = pages
    .map(p => buildUrlEntry(`${SITE_URL}${p.path}`, today(), p.changefreq, p.priority))
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

// ─── Product Pages ─────────────────────────────────────────────────────────────
async function generateProductsSitemap(wixClient) {
  console.log('📦 Fetching products from Wix...');
  let productItems = [];
  let result = await wixClient.products.queryProducts().limit(100).find();
  productItems = productItems.concat(result.items || []);
  while (result.hasNext && result.hasNext()) {
    result = await result.next();
    productItems = productItems.concat(result.items || []);
  }
  console.log(`   Found ${productItems.length} products`);

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

// ─── Landing Pages (LandingsdeCiudad) ──────────────────────────────────────────
async function generateLandingsSitemap(wixClient) {
  console.log('📍 Fetching landings from CMS (paginated)...');
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
  console.log(`   Found ${landingItems.length} landings`);

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

// ─── Store Pages (TiendasDinamicas) ────────────────────────────────────────────
async function generateTiendasSitemap(wixClient) {
  console.log('🏪 Fetching tiendas from CMS (paginated)...');
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
  console.log(`   Found ${storeItems.length} tiendas`);

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

// ─── Blog Posts ────────────────────────────────────────────────────────────────
async function generateBlogSitemap(wixClient) {
  console.log('📝 Fetching blog articles from Wix...');
  let blogItems = [];
  let result = await wixClient.posts.queryPosts().limit(100).find();
  blogItems = blogItems.concat(result.items || []);
  while (result.hasNext && result.hasNext()) {
    result = await result.next();
    blogItems = blogItems.concat(result.items || []);
  }
  console.log(`   Found ${blogItems.length} blog articles`);

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

// ─── Sitemap Index ─────────────────────────────────────────────────────────────
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

function saveFile(filename, content) {
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), content, 'utf-8');
  if (fs.existsSync(DIST_DIR)) {
    fs.writeFileSync(path.join(DIST_DIR, filename), content, 'utf-8');
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🗺️  Generating sitemaps with full pagination...\n');

  const wixClient = await createWixClient();

  // 1. Static pages
  const pagesSitemap = generatePagesSitemap();
  saveFile('sitemap-pages.xml', pagesSitemap);
  console.log('✅ sitemap-pages.xml');

  // 2. Products
  const productsSitemap = await generateProductsSitemap(wixClient);
  saveFile('sitemap-productos.xml', productsSitemap);
  console.log('✅ sitemap-productos.xml');

  // 3. Landings (dynamic from CMS, 2000+ items)
  const landingsSitemap = await generateLandingsSitemap(wixClient);
  saveFile('sitemap-landings.xml', landingsSitemap);
  console.log('✅ sitemap-landings.xml');

  // 4. Tiendas (dynamic from CMS)
  const tiendasSitemap = await generateTiendasSitemap(wixClient);
  saveFile('sitemap-tiendas.xml', tiendasSitemap);
  console.log('✅ sitemap-tiendas.xml');

  // 5. Blog articles
  const blogSitemap = await generateBlogSitemap(wixClient);
  saveFile('sitemap-blog.xml', blogSitemap);
  console.log('✅ sitemap-blog.xml');

  // 6. Sitemap index
  const sitemapIndex = generateSitemapIndex();
  saveFile('sitemap.xml', sitemapIndex);
  console.log('✅ sitemap.xml (index)\n');

  console.log('🎉 All sitemaps successfully generated in /public/ and /dist/!');
}

main().catch(err => {
  console.error('❌ Sitemap generation failed:', err);
  process.exit(1);
});
