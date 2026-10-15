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

  // Extract coupon details & total discounts from appliedDiscounts
  let totalDiscountAmount = 0;
  let couponCode = '';
  let couponName = '';

  if (Array.isArray(rawOrder.appliedDiscounts)) {
    for (const d of rawOrder.appliedDiscounts) {
      if (d.coupon?.code) couponCode = d.coupon.code;
      if (d.coupon?.name) couponName = d.coupon.name;

      if (d.coupon?.amount?.amount) {
        totalDiscountAmount += Number(d.coupon.amount.amount) || 0;
      } else if (d.merchantDiscount?.amount?.amount) {
        totalDiscountAmount += Number(d.merchantDiscount.amount.amount) || 0;
      } else if (Array.isArray(d.lineItemDiscounts)) {
        for (const lid of d.lineItemDiscounts) {
          totalDiscountAmount += Number(lid.totalDiscount?.amount) || 0;
        }
      }
    }
  }

  const summary = rawOrder.priceSummary || rawOrder.totals || {};
  const summaryDiscountNum = Number(summary.discount?.amount) || 0;
  if (summaryDiscountNum > totalDiscountAmount) {
    totalDiscountAmount = summaryDiscountNum;
  }

  // Extract line items with original prices
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

    // Options / Cenefa details — filter out empty or incomplete labels (prevents "Selec:: ")
    const options = (item.descriptionLines || []).map((line) => {
      const plainVal = line.plainText?.value?.trim?.() || '';
      const colorVal = line.colorInfo?.original?.trim?.() || '';
      const val = plainVal || colorVal;
      const labelName = (line.name?.translated || line.name?.original || '').replace(/:+$/, '').trim();
      if (val) {
        return labelName ? `${labelName}: ${val}` : val;
      }
      return '';
    }).filter(Boolean);

    // Calculate line item discount
    let itemDiscount = 0;
    if (Array.isArray(rawOrder.appliedDiscounts)) {
      for (const d of rawOrder.appliedDiscounts) {
        if (Array.isArray(d.lineItemDiscounts)) {
          const match = d.lineItemDiscounts.find(lid => lid.id === item._id || lid.id === item.id);
          if (match?.totalDiscount?.amount) {
            itemDiscount += Number(match.totalDiscount.amount) || 0;
          }
        }
      }
    }
    if (!itemDiscount && item.totalDiscount?.amount) {
      itemDiscount = Number(item.totalDiscount.amount) || 0;
    }

    const qty = item.quantity || 1;
    const unitNetPrice = Number(item.price?.amount ?? item.price ?? 0);
    const unitDiscount = qty > 0 ? (itemDiscount / qty) : itemDiscount;
    const unitOriginalPrice = unitNetPrice + unitDiscount;

    const unitPriceFormatted = unitOriginalPrice > 0
      ? `$${unitOriginalPrice.toFixed(2)}`
      : (item.price?.formattedAmount || '$0.00');

    const itemTotalFormatted = unitOriginalPrice > 0
      ? `$${(unitOriginalPrice * qty).toFixed(2)}`
      : (item.totalPrice?.formattedAmount || unitPriceFormatted);

    return {
      id: item._id || item.id,
      name: item.productName?.translated || item.productName?.original || item.name || 'Kamibi Urn',
      quantity: qty,
      price: unitPriceFormatted,
      totalPrice: itemTotalFormatted,
      originalPriceNum: unitOriginalPrice,
      netPriceNum: unitNetPrice,
      discountAmount: itemDiscount,
      isFree: unitNetPrice === 0 && unitOriginalPrice > 0,
      image: imageUrl,
      options,
    };
  });

  // Calculate total quantity
  const totalQuantity = items.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  // Calculate subtotal from original prices
  let calculatedSubtotal = 0;
  items.forEach((it) => {
    calculatedSubtotal += (it.originalPriceNum || 0) * (it.quantity || 1);
  });

  const rawSubtotalNum = Number(summary.subtotal?.amount) || 0;
  const finalSubtotalNum = calculatedSubtotal > rawSubtotalNum ? calculatedSubtotal : rawSubtotalNum;
  const subtotalFormatted = `$${finalSubtotalNum.toFixed(2)}`;

  // Shipping
  const rawShippingNum = Number(summary.shipping?.amount) || 0;
  const shippingFormatted = summary.shipping?.formattedAmount || `$${rawShippingNum.toFixed(2)}`;
  const isFreeShipping = rawShippingNum === 0;

  // Taxes
  const rawTaxNum = Number(summary.tax?.amount) || 0;
  const taxFormatted = summary.tax?.formattedAmount || `$${rawTaxNum.toFixed(2)}`;

  // Discount
  const discountFormatted = totalDiscountAmount > 0
    ? `-$${totalDiscountAmount.toFixed(2)}`
    : (summary.discount?.formattedAmount && summary.discount.formattedAmount !== '$0.00' ? `-${summary.discount.formattedAmount}` : null);

  // Total
  const totalFormatted =
    summary.total?.formattedAmount ||
    summary.totalPrice?.formattedAmount ||
    `$${Number(summary.total?.amount ?? summary.total ?? 0).toFixed(2)}`;

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
    isFreeShipping,
    tax: taxFormatted,
    taxAmount: rawTaxNum,
    discount: discountFormatted,
    discountAmount: totalDiscountAmount,
    couponCode: couponCode || couponName || '',
    currency: rawOrder.currency || 'USD',
    paymentStatus: rawOrder.paymentStatus || 'PAID',
    createdDate: rawOrder.createdDate || rawOrder._createdDate,
  });
}
