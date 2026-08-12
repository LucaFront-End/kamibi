/**
 * Wix CMS Data Collection API for Coupons Lead Generation
 * Inserts coupon submission leads into Wix Data Collection 'Cupones'
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
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(455 || 405).json({ error: 'Method Not Allowed' });
  }

  const { title, nombre, name, telefono, phone, correo, email } = req.body || {};

  const leadName = nombre || name || title || 'Nuevo Lead';
  const leadPhone = telefono || phone || '';
  const leadEmail = correo || email || '';

  if (!leadEmail) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const dataPayload = {
    title: leadName,
    nombre: leadName,
    name: leadName,
    telefono: leadPhone,
    phone: leadPhone,
    correo: leadEmail,
    email: leadEmail,
    _createdDate: new Date().toISOString(),
  };

  try {
    // Attempt 1: Wix Data v2 DataItems endpoint
    try {
      const result = await wixFetch('/wix-data/v2/items', {
        method: 'POST',
        body: JSON.stringify({
          dataCollectionId: 'Cupones',
          dataItem: {
            data: dataPayload,
          },
        }),
      });
      return res.status(200).json({ success: true, item: result });
    } catch (v2Err) {
      console.warn('[Coupon API] v2 items insert failed, trying v2 collection path:', v2Err.message);
    }

    // Attempt 2: Wix Data v2 collection-specific endpoint
    try {
      const result = await wixFetch('/wix-data/v2/data-collections/Cupones/data-items', {
        method: 'POST',
        body: JSON.stringify({
          dataItem: {
            data: dataPayload,
          },
        }),
      });
      return res.status(200).json({ success: true, item: result });
    } catch (v2ColErr) {
      console.warn('[Coupon API] v2 collection insert failed, trying v1:', v2ColErr.message);
    }

    // Attempt 3: Legacy Wix Data v1 endpoint
    const result = await wixFetch('/wix-data/v1/data-collections/Cupones/items', {
      method: 'POST',
      body: JSON.stringify({
        item: dataPayload,
      }),
    });

    return res.status(200).json({ success: true, item: result });
  } catch (error) {
    console.error('[Coupon API] Error saving lead to Cupones:', error);
    return res.status(500).json({
      error: error.message || 'Failed to save lead to Wix CMS',
      details: error.data || null,
    });
  }
}
