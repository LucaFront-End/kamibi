/**
 * Sitemap Generator for Kamibi
 * 
 * Generates:
 *  - sitemap.xml            → Sitemap index referencing all sub-sitemaps
 *  - sitemap-pages.xml      → Static pages (home, store, etc.)
 *  - sitemap-productos.xml  → All product pages fetched from Wix
 *  - sitemap-landings.xml   → Dynamic CMS landing pages (LandingsdeCiudad)
 *  - sitemap-tiendas.xml    → Dynamic CMS store pages (TiendasDinamicas)
 *
 * Usage: node scripts/generate-sitemap.cjs
 * Run after build or as part of the build pipeline.
 */

const { createClient, OAuthStrategy } = require('@wix/sdk');
const { products } = require('@wix/stores');
const { items } = require('@wix/data');
const fs = require('fs');
const path = require('path');

// ─── Config ────────────────────────────────────────────────────────────────────
const SITE_URL = 'https://kamibi.vercel.app';
const WIX_CLIENT_ID = '296237fc-b597-4736-b888-367dd4fd1740';
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public');

// ─── Helpers ───────────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().split('T')[0];
}

function xmlEscape(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
    modules: { products, items },
    auth: OAuthStrategy({ clientId: WIX_CLIENT_ID }),
  });
  await wixClient.auth.generateVisitorTokens();
  return wixClient;
}

// ─── Static Pages ──────────────────────────────────────────────────────────────
function generatePagesSitemap() {
  const pages = [
    { path: '/',        changefreq: 'daily',  priority: '1.0' },
    { path: '/store',   changefreq: 'daily',  priority: '0.9' },
    { path: '/blog',    changefreq: 'daily',  priority: '0.8' },
    { path: '/about',   changefreq: 'monthly', priority: '0.6' },
    { path: '/contact', changefreq: 'monthly', priority: '0.6' },
    { path: '/zonas',   changefreq: 'weekly', priority: '0.7' },
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
  const result = await wixClient.products.queryProducts().find();
  const productItems = result.items || [];
  console.log(`   Found ${productItems.length} products`);

  const entries = productItems
    .map(p => buildUrlEntry(
      `${SITE_URL}/product/${p.slug}`,
      p.lastUpdated ? new Date(p.lastUpdated).toISOString().split('T')[0] : today(),
      'weekly',
      '0.8'
    ))
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

// ─── Landing Pages (LandingsdeCiudad) ──────────────────────────────────────────
async function generateLandingsSitemap(wixClient) {
  console.log('📍 Fetching landings from CMS...');
  const result = await wixClient.items
    .query('LandingsdeCiudad')
    .limit(100)
    .find();
  const landingItems = result.items || [];
  console.log(`   Found ${landingItems.length} landings`);

  const entries = landingItems
    .map(item => {
      const data = item.data || item;
      const slug = data.slug || '';
      const lastmod = data._updatedDate
        ? new Date(data._updatedDate).toISOString().split('T')[0]
        : today();
      return buildUrlEntry(`${SITE_URL}/${slug}`, lastmod, 'weekly', '0.7');
    })
    .filter(entry => entry) // skip empty slugs
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

// ─── Store Pages (TiendasDinamicas) ────────────────────────────────────────────
async function generateTiendasSitemap(wixClient) {
  console.log('🏪 Fetching tiendas from CMS...');
  const result = await wixClient.items
    .query('TiendasDinamicas')
    .limit(100)
    .find();
  const storeItems = result.items || [];
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

// ─── Sitemap Index ─────────────────────────────────────────────────────────────
function generateSitemapIndex() {
  const sitemaps = [
    'sitemap-pages.xml',
    'sitemap-productos.xml',
    'sitemap-landings.xml',
    'sitemap-tiendas.xml',
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

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🗺️  Generating sitemaps...\n');

  const wixClient = await createWixClient();

  // 1. Static pages
  const pagesSitemap = generatePagesSitemap();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-pages.xml'), pagesSitemap, 'utf-8');
  console.log('✅ sitemap-pages.xml');

  // 2. Products
  const productsSitemap = await generateProductsSitemap(wixClient);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-productos.xml'), productsSitemap, 'utf-8');
  console.log('✅ sitemap-productos.xml');

  // 3. Landings (dynamic from CMS)
  const landingsSitemap = await generateLandingsSitemap(wixClient);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-landings.xml'), landingsSitemap, 'utf-8');
  console.log('✅ sitemap-landings.xml');

  // 4. Tiendas (dynamic from CMS)
  const tiendasSitemap = await generateTiendasSitemap(wixClient);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-tiendas.xml'), tiendasSitemap, 'utf-8');
  console.log('✅ sitemap-tiendas.xml');

  // 5. Sitemap index
  const sitemapIndex = generateSitemapIndex();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemapIndex, 'utf-8');
  console.log('✅ sitemap.xml (index)\n');

  console.log('🎉 All sitemaps generated in /public/');
}

main().catch(err => {
  console.error('❌ Sitemap generation failed:', err);
  process.exit(1);
});
