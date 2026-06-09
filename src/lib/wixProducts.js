// No static client import — client is passed as parameter from WixContext

/**
 * Strips HTML tags and decodes common HTML entities from a string.
 * Wix Stores returns descriptions as rich text with raw HTML.
 */
function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  // Create a temporary DOM element to parse HTML properly
  if (typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || '';
    } catch (e) {
      // Fallback to regex if DOMParser fails
    }
  }
  // Regex fallback: strip tags, then decode common entities
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes a Wix Stores product into the shape expected by the app components.
 * This maps the Wix API response fields to the internal product structure.
 */
// Wix Collection ID → app category mapping
const COLLECTION_CATEGORY_MAP = {
  'f84954f0-2bce-3f7a-2c98-203577ac2a14': 'water',  // Agua
  '82f0b8b7-6684-6b61-4c58-89a6d4265429': 'earth',  // Tierra
  'e730e772-0355-ef09-12aa-a6fd3a61a6d5': 'minis',  // Mini
};

export function normalizeProduct(wixProduct) {
  const {
    _id,
    slug,
    name,
    description,
    priceData,
    media,
    productOptions,
    additionalInfoSections,
    ribbon,
    productType,
    numericId,
    collectionIds,
    variants: wixVariants,
  } = wixProduct;

  // Extract price
  const price = priceData?.price ?? 0;

  // Extract images from Wix media
  const images = (media?.items || []).map((item) => {
    // Wix media item can be image or video
    if (item.image) {
      return item.image.url;
    }
    if (item.thumbnail) {
      return item.thumbnail.url;
    }
    return '';
  }).filter(Boolean);

  // Derive all categories from Wix collectionIds.
  // A product can belong to multiple categories (e.g. both water and earth).
  const categories = [];
  if (collectionIds && collectionIds.length > 0) {
    for (const id of collectionIds) {
      const cat = COLLECTION_CATEGORY_MAP[id];
      if (cat && !categories.includes(cat)) {
        categories.push(cat);
      }
    }
  }
  // Primary category for legacy usage (most specific wins)
  const primaryCategory = categories.includes('minis') ? 'minis'
    : categories.includes('earth') ? 'earth'
    : categories.includes('water') ? 'water'
    : 'earth';

  // Extract variants from productOptions (e.g., "Sleeve / Band" choices)
  const variants = [];
  if (productOptions && productOptions.length > 0) {
    // Use the first option's choices as variants
    const firstOption = productOptions[0];
    if (firstOption.choices) {
      firstOption.choices.forEach((choice) => {
        variants.push(choice.description || choice.value);
      });
    }
  }

  // Extract color info from additionalInfoSections or productOptions
  let colorName = '';
  let colorHex = '#E8DED1';
  if (additionalInfoSections) {
    const colorSection = additionalInfoSections.find(
      (s) => s.title?.toLowerCase().includes('color')
    );
    if (colorSection) {
      colorName = stripHtml(colorSection.description || '');
    }
  }

  // Extract features from additional info sections
  const features = [];
  const featuresEn = [];
  if (additionalInfoSections) {
    const featureSection = additionalInfoSections.find(
      (s) => s.title?.toLowerCase().includes('features') || s.title?.toLowerCase().includes('características')
    );
    if (featureSection && featureSection.description) {
      // Split by newlines to get individual features
      // Strip HTML from the whole block, then split by newlines
      const cleaned = stripHtml(featureSection.description);
      const lines = cleaned.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);
      features.push(...lines);
      featuresEn.push(...lines);
    }
  }

  // Extract tagline from short description or additionalInfoSections
  let tagline = '';
  let shortDescription = '';
  let shortDescriptionEn = '';
  if (additionalInfoSections) {
    const taglineSection = additionalInfoSections.find(
      (s) => s.title?.toLowerCase().includes('tagline') || s.title?.toLowerCase().includes('eslogan')
    );
    if (taglineSection) {
      tagline = stripHtml(taglineSection.description || '');
    }

    const shortDescSection = additionalInfoSections.find(
      (s) => s.title?.toLowerCase().includes('short') || s.title?.toLowerCase().includes('resumen')
    );
    if (shortDescSection) {
      shortDescription = stripHtml(shortDescSection.description || '');
      shortDescriptionEn = shortDescription;
    }
  }

  // Clean main description of HTML
  const cleanDescription = stripHtml(description);

  // Fallbacks: if no tagline/shortDescription from sections, derive from cleaned description
  if (!tagline && cleanDescription) {
    tagline = cleanDescription.substring(0, 60) + (cleanDescription.length > 60 ? '...' : '');
  }
  if (!shortDescription && cleanDescription) {
    shortDescription = cleanDescription.substring(0, 120) + (cleanDescription.length > 120 ? '...' : '');
    shortDescriptionEn = shortDescription;
  }

  return {
    id: _id,
    slug: slug || _id,
    name: name || 'Untitled Product',
    tagline,
    price: Number(price),
    category: primaryCategory,   // Primary category (most specific)
    categories,                  // All matching categories
    colorName,
    colorHex,
    shortDescription,
    shortDescriptionEn,
    description: cleanDescription,          // Plain text for cards/summaries
    descriptionEn: cleanDescription,
    descriptionHtml: description || '',      // Raw HTML for product page rendering
    descriptionHtmlEn: description || '',
    features,
    featuresEn,
    images: images.length > 0 ? images : ['/products/placeholder.png'],
    variants,                               // Text labels for UI swatches
    wixVariants: wixVariants || [],         // Raw Wix variant objects with real UUIDs
    // Keep original Wix ID for cart operations
    _wixId: _id,
  };
}

/**
 * Fetch all products from Wix Stores.
 * @param {object} wixClient - Client from WixContext
 */
export async function fetchAllProducts(wixClient) {
  try {
    const result = await wixClient.products.queryProducts().find();
    return (result.items || []).map(normalizeProduct);
  } catch (error) {
    console.error('[Wix] Failed to fetch products:', error);
    const msg = error?.message
      || error?.details?.applicationError?.description
      || 'Error loading products from Wix';
    throw new Error(msg);
  }
}

/**
 * Fetch a single product by slug from Wix Stores.
 * @param {object} wixClient - Client from WixContext
 * @param {string} slug - Product URL slug
 */
export async function fetchProductBySlug(wixClient, slug) {
  try {
    const result = await wixClient.products
      .queryProducts()
      .eq('slug', slug)
      .find();

    if (result.items && result.items.length > 0) {
      return normalizeProduct(result.items[0]);
    }
    return null;
  } catch (error) {
    console.error('[Wix] Failed to fetch product by slug:', error);
    const msg = error?.message
      || error?.details?.applicationError?.description
      || 'Error loading product from Wix';
    throw new Error(msg);
  }
}
