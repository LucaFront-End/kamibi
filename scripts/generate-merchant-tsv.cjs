/**
 * Google Merchant Center TSV Feed Generator for Kamibi
 * 
 * Generates:
 *  - public/merchant-feed.tsv (Static TSV feed compliant with Google Merchant Center specs)
 * 
 * Usage: node scripts/generate-merchant-tsv.cjs
 */

const { createClient, OAuthStrategy } = require('@wix/sdk');
const { products } = require('@wix/stores');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://kamibistore.com';
const WIX_CLIENT_ID = '296237fc-b597-4736-b888-367dd4fd1740';
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'merchant-feed.tsv');

// ── Clean string for TSV (removes tabs, newlines, raw HTML tags, and extra spaces) ───
function clean(str = '') {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]*>/g, ' ')       // remove HTML tags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[\r\n\t]+/g, ' ')     // remove newlines & tabs
    .replace(/\s+/g, ' ')           // collapse multiple spaces
    .trim();
}

// ── Format price string with currency (e.g. "90.00 USD") ───────────────────────────
function formatPrice(amount, currency = 'USD') {
  if (amount === undefined || amount === null || amount === '') return '';
  const num = Number(amount);
  if (isNaN(num)) return '';
  return `${num.toFixed(2)} ${currency}`;
}

// ── Map product slug to appropriate product type & material ────────────────────────
function getProductMetadata(slug = '', name = '') {
  const s = slug.toLowerCase();
  const n = name.toLowerCase();

  if (s.includes('terra')) {
    return {
      productType: 'Memorial Urns > Biodegradable Urns > Earth Burial Urns',
      material: 'Organic Plant Cellulose & Natural Clay',
      baseColor: 'Sand & Terracotta',
    };
  }
  if (s.includes('aqua')) {
    return {
      productType: 'Memorial Urns > Biodegradable Urns > Water Ceremony Urns',
      material: 'Water-Soluble Plant Cellulose',
      baseColor: 'Ocean Mint',
    };
  }
  if (s.includes('angel')) {
    return {
      productType: 'Memorial Urns > Biodegradable Urns > Water & Earth Burial Urns',
      material: 'Pure Organic Cellulose Paper',
      baseColor: 'Pure White',
    };
  }
  if (s.includes('flore')) {
    return {
      productType: 'Memorial Urns > Biodegradable Urns > Earth Burial Urns',
      material: 'Pressed Flower Petals & Plant Cellulose',
      baseColor: 'Floral Sage',
    };
  }
  if (s.includes('iris')) {
    return {
      productType: 'Memorial Urns > Biodegradable Urns > Earth Burial Urns',
      material: 'Organic Plant Cellulose & Natural Dyes',
      baseColor: 'Soft Rose',
    };
  }
  if (s.includes('mini')) {
    return {
      productType: 'Memorial Urns > Mini Urn Sets > Sharing Memorial Sets',
      material: '100% Biodegradable Cellulose & Organic Starches',
      baseColor: s.includes('ocean') ? 'Ocean Teal & White' : 'Natural Sage & White',
    };
  }
  if (s.includes('bag')) {
    return {
      productType: 'Funeral & Memorial Supplies > Cremation Burial Bags',
      material: 'Water-Soluble Biodegradable Paper',
      baseColor: s.includes('turtle') ? 'Turtle Sea Pattern' : 'Tree of Life Design',
    };
  }

  return {
    productType: 'Memorial Urns > Biodegradable Urns',
    material: 'Organic Biodegradable Cellulose',
    baseColor: 'Natural Earth Tones',
  };
}

async function main() {
  console.log('🚀 Connecting to Wix Stores API for Merchant Feed...');
  const wixClient = createClient({
    modules: { products },
    auth: OAuthStrategy({ clientId: WIX_CLIENT_ID }),
  });
  await wixClient.auth.generateVisitorTokens();

  const result = await wixClient.products.queryProducts().find();
  const items = result.items || [];
  console.log(`📦 Found ${items.length} base products in catalog.`);

  // ── Define Google Merchant Center TSV Header Columns ──────────────────────────────
  const headers = [
    'id',
    'item_group_id',
    'title',
    'description',
    'link',
    'image_link',
    'additional_image_link',
    'availability',
    'price',
    'sale_price',
    'google_product_category',
    'product_type',
    'brand',
    'condition',
    'color',
    'material',
    'identifier_exists',
    'shipping',
  ];

  const rows = [];

  for (const product of items) {
    const rawPrice = product.priceData?.price;
    const rawDiscountedPrice = product.priceData?.discountedPrice;
    const currency = product.priceData?.currency || 'USD';

    let regularPrice = formatPrice(rawPrice, currency);
    let salePrice = '';

    if (rawDiscountedPrice && rawPrice && rawPrice > rawDiscountedPrice) {
      salePrice = formatPrice(rawDiscountedPrice, currency);
    }

    const inStock = product.stock?.inStock !== false;
    const availability = inStock ? 'in_stock' : 'out_of_stock';
    const productLink = `${SITE_URL}/product/${product.slug}`;
    const cleanDesc = clean(product.description || product.name);
    const meta = getProductMetadata(product.slug, product.name);

    // Extract all media image URLs
    const allImages = (product.media?.items || [])
      .map(item => item.image?.url || item.thumbnail?.url)
      .filter(Boolean);

    const defaultMainImage = allImages[0] || `${SITE_URL}/products/placeholder.png`;
    const defaultAdditionalImages = allImages.slice(1, 11).join(',');

    // Check for Sleeve / Band variants in productOptions
    const variantOption = (product.productOptions || []).find(
      opt => opt.name && (opt.name.toLowerCase().includes('selec') || opt.name.toLowerCase().includes('sleeve') || opt.name.toLowerCase().includes('band') || opt.name.toLowerCase().includes('diseño') || opt.name.toLowerCase().includes('color'))
    ) || (product.productOptions && product.productOptions[0]);

    if (variantOption && variantOption.choices && variantOption.choices.length > 0) {
      // Create a row for each variant / sleeve option
      for (const choice of variantOption.choices) {
        const choiceLabel = choice.description || choice.value || 'Standard';
        const choiceSlug = choiceLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const variantId = `KAMIBI-${product.slug.toUpperCase()}-${choiceSlug.toUpperCase()}`;
        const itemGroupId = `KAMIBI-${product.slug.toUpperCase()}`;

        const variantTitle = `${clean(product.name)} - ${choiceLabel} Sleeve`;

        // Variant-specific image if mapped in Wix
        const choiceImage = choice.media?.mainMedia?.image?.url ||
          choice.media?.items?.[0]?.image?.url ||
          choice.media?.mainMedia?.thumbnail?.url ||
          defaultMainImage;

        // Additional images excluding the main one
        const variantAdditionalImages = allImages
          .filter(img => img !== choiceImage)
          .slice(0, 10)
          .join(',');

        rows.push([
          variantId,
          itemGroupId,
          variantTitle,
          cleanDesc,
          productLink,
          choiceImage,
          variantAdditionalImages,
          availability,
          regularPrice,
          salePrice,
          'Home & Garden > Decor > Cremation Urns',
          meta.productType,
          'KAMIBI',
          'new',
          choiceLabel,
          meta.material,
          'no',
          'US:::0.00 USD',
        ]);
      }
    } else {
      // Standalone product without options (e.g. Mini Sets or Burial Bags)
      const productId = `KAMIBI-${product.slug.toUpperCase()}`;

      rows.push([
        productId,
        productId,
        clean(product.name),
        cleanDesc,
        productLink,
        defaultMainImage,
        defaultAdditionalImages,
        availability,
        regularPrice,
        salePrice,
        'Home & Garden > Decor > Cremation Urns',
        meta.productType,
        'KAMIBI',
        'new',
        meta.baseColor,
        meta.material,
        'no',
        'US:::0.00 USD',
      ]);
    }
  }

  // ── Construct Tab-Separated Values (TSV) String ──────────────────────────────────
  const tsvLines = [
    headers.join('\t'),
    ...rows.map(row => row.map(cell => clean(cell)).join('\t')),
  ];
  const tsvContent = tsvLines.join('\n');

  // Ensure public directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, tsvContent, 'utf8');
  console.log(`✅ Successfully generated TSV feed with ${rows.length} product/variant entries!`);
  console.log(`📁 File saved to: ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('❌ Error generating Merchant TSV feed:', err);
  process.exit(1);
});
