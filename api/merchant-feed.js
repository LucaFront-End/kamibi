/**
 * Dynamic Google Merchant Center TSV Feed Endpoint
 * 
 * Serves real-time tab-separated values (TSV) directly to Google Merchant Center.
 * URL: https://kamibistore.com/api/merchant-feed
 */

import { createClient, OAuthStrategy } from '@wix/sdk';
import { products } from '@wix/stores';

const SITE_URL = 'https://kamibistore.com';
const WIX_CLIENT_ID = '296237fc-b597-4736-b888-367dd4fd1740';

function clean(str = '') {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatPrice(amount, currency = 'USD') {
  if (amount === undefined || amount === null || amount === '') return '';
  const num = Number(amount);
  if (isNaN(num)) return '';
  return `${num.toFixed(2)} ${currency}`;
}

function getProductMetadata(slug = '', name = '') {
  const s = slug.toLowerCase();

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

export default async function handler(req, res) {
  // CORS & headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'text/tab-separated-values; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="merchant-feed.tsv"');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const wixClient = createClient({
      modules: { products },
      auth: OAuthStrategy({ clientId: WIX_CLIENT_ID }),
    });
    await wixClient.auth.generateVisitorTokens();

    const result = await wixClient.products.queryProducts().find();
    const items = result.items || [];

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

      const allImages = (product.media?.items || [])
        .map(item => item.image?.url || item.thumbnail?.url)
        .filter(Boolean);

      const defaultMainImage = allImages[0] || `${SITE_URL}/products/placeholder.png`;
      const defaultAdditionalImages = allImages.slice(1, 11).join(',');

      const variantOption = (product.productOptions || []).find(
        opt => opt.name && (opt.name.toLowerCase().includes('selec') || opt.name.toLowerCase().includes('sleeve') || opt.name.toLowerCase().includes('band') || opt.name.toLowerCase().includes('diseño') || opt.name.toLowerCase().includes('color'))
      ) || (product.productOptions && product.productOptions[0]);

      if (variantOption && variantOption.choices && variantOption.choices.length > 0) {
        for (const choice of variantOption.choices) {
          const choiceLabel = choice.description || choice.value || 'Standard';
          const choiceSlug = choiceLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          const variantId = `KAMIBI-${product.slug.toUpperCase()}-${choiceSlug.toUpperCase()}`;
          const itemGroupId = `KAMIBI-${product.slug.toUpperCase()}`;
          const variantTitle = `${clean(product.name)} - ${choiceLabel} Sleeve`;

          const choiceImage = choice.media?.mainMedia?.image?.url ||
            choice.media?.items?.[0]?.image?.url ||
            choice.media?.mainMedia?.thumbnail?.url ||
            defaultMainImage;

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

    const tsvContent = [
      headers.join('\t'),
      ...rows.map(row => row.map(cell => clean(cell)).join('\t')),
    ].join('\n');

    return res.status(200).send(tsvContent);
  } catch (error) {
    console.error('Merchant TSV API Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate Merchant TSV feed' });
  }
}
