/**
 * Sitemap Generator for Kamibi
 * 
 * Generates:
 *  - sitemap.xml          → Sitemap index referencing all sub-sitemaps
 *  - sitemap-pages.xml    → Static pages (home, store, etc.)
 *  - sitemap-productos.xml → All product pages fetched from Wix
 *
 * Usage: node scripts/generate-sitemap.js
 * Run after build or as part of the build pipeline.
 */

const { createClient, OAuthStrategy } = require('@wix/sdk');
const { products } = require('@wix/stores');
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

// ─── Static Pages ──────────────────────────────────────────────────────────────
function generatePagesSitemap() {
  const pages = [
    { path: '/',       changefreq: 'daily',  priority: '1.0' },
    { path: '/store',  changefreq: 'daily',  priority: '0.9' },
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
async function fetchAllProductSlugs() {
  const wixClient = createClient({
    modules: { products },
    auth: OAuthStrategy({ clientId: WIX_CLIENT_ID }),
  });

  await wixClient.auth.generateVisitorTokens();
  const result = await wixClient.products.queryProducts().find();

  return (result.items || []).map(p => ({
    slug: p.slug,
    lastModified: p.lastUpdated
      ? new Date(p.lastUpdated).toISOString().split('T')[0]
      : today(),
  }));
}

async function generateProductsSitemap() {
  console.log('📦 Fetching products from Wix...');
  const productSlugs = await fetchAllProductSlugs();
  console.log(`   Found ${productSlugs.length} products`);

  const entries = productSlugs
    .map(p => buildUrlEntry(
      `${SITE_URL}/product/${p.slug}`,
      p.lastModified,
      'weekly',
      '0.8'
    ))
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

  // 1. Static pages
  const pagesSitemap = generatePagesSitemap();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-pages.xml'), pagesSitemap, 'utf-8');
  console.log('✅ sitemap-pages.xml');

  // 2. Products
  const productsSitemap = await generateProductsSitemap();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-productos.xml'), productsSitemap, 'utf-8');
  console.log('✅ sitemap-productos.xml');

  // 3. Sitemap index
  const sitemapIndex = generateSitemapIndex();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemapIndex, 'utf-8');
  console.log('✅ sitemap.xml (index)\n');

  console.log('🎉 All sitemaps generated in /public/');
}

main().catch(err => {
  console.error('❌ Sitemap generation failed:', err);
  process.exit(1);
});
