/**
 * Wix eCommerce Order Details API Endpoint
 * URL: /api/order?orderId=...
 * 
 * Securely retrieves live order details using server-side Wix credentials
 * and normalizes the response 100% dynamically for the Thank You page.
 */

const WIX_API_BASE = 'https://www.wixapis.com';

function formatCurrency(amount, currency = 'USD') {
  const num = typeof amount === 'number' ? amount : (Number(amount) || 0);
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `$${num.toFixed(2)}`;
  }
}

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

  const currency = rawOrder.currency || 'USD';

  // Extract customer contact details dynamically
  const billingContact = rawOrder.billingInfo?.contactDetails || rawOrder.billingInfo?.address?.contactDetails || {};
  const shippingContact = rawOrder.shippingInfo?.logistics?.shippingDestination?.contactDetails || rawOrder.shippingInfo?.shipmentDetails?.address?.contactDetails || {};
  const buyerName =
    [billingContact.firstName, billingContact.lastName].filter(Boolean).join(' ') ||
    [shippingContact.firstName, shippingContact.lastName].filter(Boolean).join(' ') ||
    billingContact.fullName ||
    shippingContact.fullName ||
    rawOrder.buyerInfo?.email ||
    '';

  const buyerEmail = rawOrder.buyerInfo?.email || billingContact.email || shippingContact.email || '';
  const buyerPhone = billingContact.phone || shippingContact.phone || '';

  // Extract shipping destination address dynamically
  const shippingDest =
    rawOrder.shippingInfo?.logistics?.shippingDestination?.address ||
    rawOrder.shippingInfo?.shipmentDetails?.address ||
    rawOrder.billingInfo?.address ||
    {};

  const street = [shippingDest.addressLine1 || shippingDest.addressLine, shippingDest.addressLine2]
    .filter(Boolean)
    .join(' ');
  const cityStateZip = [
    shippingDest.city,
    shippingDest.subdivision || shippingDest.subdivisionName,
    shippingDest.postalCode,
  ].filter(Boolean).join(', ');
  const country = shippingDest.country || '';
  const formattedAddress = [street, cityStateZip, country].filter(Boolean).join(' • ');

  // Extract coupon details & total discounts dynamically
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
      } else if (d.discount?.amount?.amount) {
        totalDiscountAmount += Number(d.discount.amount.amount) || 0;
      } else if (Array.isArray(d.lineItemDiscounts)) {
        for (const lid of d.lineItemDiscounts) {
          totalDiscountAmount += Number(lid.totalDiscount?.amount ?? lid.amount?.amount ?? 0) || 0;
        }
      }
    }
  }

  const summary = rawOrder.priceSummary || rawOrder.totals || {};
  const summaryDiscountNum = Number(summary.discount?.amount ?? summary.discount ?? 0) || 0;
  if (summaryDiscountNum > totalDiscountAmount) {
    totalDiscountAmount = summaryDiscountNum;
  }

  // Extract line items with original and discounted values
  const rawItems = rawOrder.lineItems || [];
  const items = rawItems.map((item) => {
    // Media image URL extraction
    let imageUrl = '';
    if (item.image?.url) {
      imageUrl = item.image.url;
    } else if (item.image?.src) {
      imageUrl = item.image.src;
    } else if (item.mediaItem?.url) {
      imageUrl = item.mediaItem.url;
    } else if (item.mediaItem?.src) {
      imageUrl = item.mediaItem.src;
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
      const colorVal = line.colorInfo?.original?.trim?.() || line.colorInfo?.name?.trim?.() || '';
      const val = plainVal || colorVal;
      const labelName = (line.name?.translated || line.name?.original || '').replace(/:+$/, '').trim();
      if (val) {
        return labelName ? `${labelName}: ${val}` : val;
      }
      return '';
    }).filter(Boolean);

    if (options.length === 0 && Array.isArray(item.options)) {
      item.options.forEach((opt) => {
        const name = (opt.option || opt.name || '').replace(/:+$/, '').trim();
        const val = (opt.selection || opt.value || '').trim();
        if (val) {
          options.push(name ? `${name}: ${val}` : val);
        }
      });
    }

    // Calculate line item discount
    let itemDiscount = 0;
    if (Array.isArray(rawOrder.appliedDiscounts)) {
      for (const d of rawOrder.appliedDiscounts) {
        if (Array.isArray(d.lineItemDiscounts)) {
          const match = d.lineItemDiscounts.find(
            (lid) => lid.id === item._id || lid.id === item.id || lid.lineItemId === item._id || lid.lineItemId === item.id
          );
          if (match) {
            itemDiscount += Number(match.totalDiscount?.amount ?? match.amount?.amount ?? 0) || 0;
          }
        }
      }
    }
    if (!itemDiscount && item.totalDiscount?.amount) {
      itemDiscount = Number(item.totalDiscount.amount) || 0;
    } else if (!itemDiscount && item.discount?.amount) {
      itemDiscount = Number(item.discount.amount) || 0;
    } else if (!itemDiscount && totalDiscountAmount > 0 && rawItems.length === 1) {
      itemDiscount = totalDiscountAmount;
    }

    const qty = item.quantity || 1;
    const unitNetPrice = Number(item.price?.amount ?? item.price ?? 0);
    const unitDiscount = qty > 0 ? (itemDiscount / qty) : itemDiscount;
    const unitOriginalPrice = unitNetPrice + unitDiscount;

    const unitPriceFormatted = unitOriginalPrice > 0
      ? formatCurrency(unitOriginalPrice, currency)
      : (item.price?.formattedAmount || formatCurrency(0, currency));

    const itemTotalFormatted = unitOriginalPrice > 0
      ? formatCurrency(unitOriginalPrice * qty, currency)
      : (item.totalPrice?.formattedAmount || unitPriceFormatted);

    return {
      id: item._id || item.id,
      name: item.productName?.translated || item.productName?.original || item.name || item.itemName || '',
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

  const rawSubtotalNum = Number(summary.subtotal?.amount ?? summary.subtotal ?? 0) || 0;
  const finalSubtotalNum = calculatedSubtotal > rawSubtotalNum ? calculatedSubtotal : rawSubtotalNum;
  const subtotalFormatted = formatCurrency(finalSubtotalNum, currency);

  // Shipping
  const rawShippingNum =
    Number(summary.shipping?.amount) ||
    Number(rawOrder.shippingInfo?.logistics?.deliveryCost?.amount) ||
    Number(summary.shipping) ||
    0;
  const isFreeShipping = rawShippingNum === 0;
  const shippingFormatted =
    summary.shipping?.formattedAmount ||
    formatCurrency(rawShippingNum, currency);

  // Taxes
  const rawTaxNum =
    Number(summary.tax?.amount) ||
    Number(summary.taxSummary?.taxAmount?.amount) ||
    Number(rawOrder.taxSummary?.totalTax?.amount) ||
    Number(summary.tax) ||
    0;
  const taxFormatted =
    summary.tax?.formattedAmount ||
    formatCurrency(rawTaxNum, currency);

  // Discount
  const discountFormatted = totalDiscountAmount > 0
    ? `-${formatCurrency(totalDiscountAmount, currency)}`
    : (summary.discount?.formattedAmount && summary.discount.formattedAmount !== '$0.00' ? `-${summary.discount.formattedAmount}` : null);

  // Grand Total
  const rawTotalNum = Number(summary.total?.amount ?? summary.totalPrice?.amount ?? summary.total ?? 0);
  const totalFormatted =
    summary.total?.formattedAmount ||
    summary.totalPrice?.formattedAmount ||
    formatCurrency(rawTotalNum, currency);

  return res.status(200).json({
    orderId,
    orderNumber: rawOrder.number ? `#${rawOrder.number}` : `#${orderId.substring(0, 8).toUpperCase()}`,
    customerName: buyerName,
    customerEmail: buyerEmail,
    customerPhone: buyerPhone,
    shippingAddress: formattedAddress || null,
    items,
    totalQuantity,
    total: totalFormatted,
    totalAmount: rawTotalNum,
    subtotal: subtotalFormatted,
    subtotalAmount: finalSubtotalNum,
    shipping: shippingFormatted,
    shippingAmount: rawShippingNum,
    isFreeShipping,
    tax: taxFormatted,
    taxAmount: rawTaxNum,
    discount: discountFormatted,
    discountAmount: totalDiscountAmount,
    couponCode: couponCode || couponName || '',
    currency,
    paymentStatus: rawOrder.paymentStatus || 'PAID',
    createdDate: rawOrder.createdDate || rawOrder._createdDate,
  });
}

