/**
 * Wix eCommerce Order Details API Endpoint
 * URL: /api/order?orderId=...
 * 
 * Securely retrieves order details using server-side Wix credentials
 * and normalizes the response for the Thank You page.
 */

const WIX_API_BASE = 'https://www.wixapis.com';

async function wixFetch(path, options = {}) {
  const apiKey = process.env.WIX_API_KEY || '';
  const siteId = process.env.WIX_SITE_ID || '';

  const url = `${WIX_API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
      'wix-site-id': siteId,
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Wix API returned non-JSON (status ${res.status}): ${text.slice(0, 300)}`);
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.details?.validationError?.fieldViolations?.[0]?.description ||
      data?.details?.applicationError?.description ||
      JSON.stringify(data);
    const err = new Error(`Wix API error ${res.status}: ${msg}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const orderId = req.query?.orderId;
  if (!orderId) {
    return res.status(400).json({ error: 'Missing orderId parameter' });
  }

  let rawOrder = null;

  // 1. Try modern Wix eCommerce v1 endpoint
  try {
    const ecomRes = await wixFetch(`/ecom/v1/orders/${encodeURIComponent(orderId)}`);
    rawOrder = ecomRes.order || ecomRes;
  } catch (err1) {
    console.warn('[api/order] ecom v1 fetch failed:', err1.message);

    // 2. Fallback to stores v2 orders endpoint
    try {
      const storesRes = await wixFetch(`/stores/v2/orders/${encodeURIComponent(orderId)}`);
      rawOrder = storesRes.order || storesRes;
    } catch (err2) {
      console.warn('[api/order] stores v2 fetch failed:', err2.message);
    }
  }

  if (!rawOrder) {
    return res.status(404).json({
      error: 'Order not found',
      orderId,
    });
  }

  // Extract customer name
  const billingContact = rawOrder.billingInfo?.contactDetails || rawOrder.billingInfo?.address?.contactDetails || {};
  const shippingContact = rawOrder.shippingInfo?.logistics?.shippingDestination?.contactDetails || rawOrder.shippingInfo?.shipmentDetails?.address?.contactDetails || {};
  const buyerName =
    [billingContact.firstName, billingContact.lastName].filter(Boolean).join(' ') ||
    [shippingContact.firstName, shippingContact.lastName].filter(Boolean).join(' ') ||
    billingContact.fullName ||
    rawOrder.buyerInfo?.email ||
    '';

  const buyerEmail = rawOrder.buyerInfo?.email || billingContact.email || shippingContact.email || '';

  // Extract line items
  const rawItems = rawOrder.lineItems || [];
  const items = rawItems.map((item) => {
    // Media image URL extraction
    let imageUrl = '';
    if (item.image?.url) {
      imageUrl = item.image.url;
    } else if (item.mediaItem?.url) {
      imageUrl = item.mediaItem.url;
    } else if (typeof item.image === 'string') {
      imageUrl = item.image;
    }

    if (imageUrl && !imageUrl.startsWith('http')) {
      const match = imageUrl.match(/(45119e_[a-zA-Z0-9~_-]+\.(png|jpg|jpeg|webp))/i);
      if (match) {
        imageUrl = `https://static.wixstatic.com/media/${match[1]}`;
      } else {
        imageUrl = `https://static.wixstatic.com/media/${imageUrl.replace('wix:image://v1/', '').split('/')[0]}`;
      }
    }

    // Options / Cenefa details
    const options = (item.descriptionLines || []).map((line) => {
      if (line.plainText?.value) return line.plainText.value;
      if (line.name?.translated || line.name?.original) {
        const val = line.plainText?.value || line.colorInfo?.original || '';
        return `${line.name.translated || line.name.original}: ${val}`;
      }
      return '';
    }).filter(Boolean);

    const unitPrice =
      item.price?.formattedAmount ||
      (item.price?.amount ? `$${Number(item.price.amount).toFixed(2)}` : '') ||
      (item.price ? `$${Number(item.price).toFixed(2)}` : '');

    const itemTotal =
      item.totalPrice?.formattedAmount ||
      (item.totalPrice?.amount ? `$${Number(item.totalPrice.amount).toFixed(2)}` : '') ||
      unitPrice;

    return {
      id: item._id || item.id,
      name: item.productName?.translated || item.productName?.original || item.name || 'Kamibi Urn',
      quantity: item.quantity || 1,
      price: unitPrice,
      totalPrice: itemTotal,
      image: imageUrl,
      options,
    };
  });

  // Calculate total quantity
  const totalQuantity = items.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  // Price summary
  const summary = rawOrder.priceSummary || rawOrder.totals || {};
  const totalFormatted =
    summary.total?.formattedAmount ||
    summary.totalPrice?.formattedAmount ||
    (summary.total?.amount ? `$${Number(summary.total.amount).toFixed(2)}` : '') ||
    (summary.total ? `$${Number(summary.total).toFixed(2)}` : '');

  const subtotalFormatted =
    summary.subtotal?.formattedAmount ||
    (summary.subtotal?.amount ? `$${Number(summary.subtotal.amount).toFixed(2)}` : '');

  const shippingFormatted =
    summary.shipping?.formattedAmount ||
    (summary.shipping?.amount ? `$${Number(summary.shipping.amount).toFixed(2)}` : '');

  const taxFormatted =
    summary.tax?.formattedAmount ||
    (summary.tax?.amount ? `$${Number(summary.tax.amount).toFixed(2)}` : '');

  const discountFormatted =
    summary.discount?.formattedAmount ||
    (summary.discount?.amount ? `$${Number(summary.discount.amount).toFixed(2)}` : '');

  return res.status(200).json({
    orderId,
    orderNumber: rawOrder.number ? `#${rawOrder.number}` : orderId.substring(0, 8).toUpperCase(),
    customerName: buyerName,
    customerEmail: buyerEmail,
    items,
    totalQuantity,
    total: totalFormatted,
    subtotal: subtotalFormatted,
    shipping: shippingFormatted,
    tax: taxFormatted,
    discount: discountFormatted,
    currency: rawOrder.currency || 'USD',
    paymentStatus: rawOrder.paymentStatus || 'PAID',
    createdDate: rawOrder.createdDate || rawOrder._createdDate,
    _debug: {
      priceSummary: rawOrder.priceSummary,
      appliedDiscounts: rawOrder.appliedDiscounts,
      totals: rawOrder.totals,
      balanceSummary: rawOrder.balanceSummary,
      lineItemsPrices: (rawOrder.lineItems || []).map(li => ({
        name: li.productName,
        price: li.price,
        totalPrice: li.totalPrice,
        priceDescription: li.priceDescription,
        totalDiscount: li.totalDiscount,
      })),
    },
  });
}
