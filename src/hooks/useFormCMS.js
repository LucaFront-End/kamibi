/**
 * useFormCMS — Submits form data to the Wix CMS collection "KamibiFormSubmissions"
 *
 * CMS Fields:
 *   type        — 'contact' | 'newsletter' | 'review'
 *   name        — submitter's name (optional for newsletter)
 *   email       — submitter's email
 *   message     — message or comment body (optional for newsletter)
 *   locale      — 'en' | 'es'
 *   source      — which form/page triggered this (e.g. 'contact-page', 'footer', 'product-review')
 *   status      — 'new' (default on creation)
 *   submittedAt — ISO timestamp
 */

import { useWixClient } from '../context/WixContext';

const COLLECTION_ID = 'KamibiFormSubmissions';

/**
 * Returns a function that saves a form submission to the Wix CMS.
 * Fire-and-forget — does NOT block the form's own success flow.
 *
 * @returns {Function} submitToCMS(payload)
 *   payload: { type, name?, email, message?, locale, source }
 */
export function useFormCMS() {
  const { wixClient, isReady } = useWixClient();

  async function submitToCMS({ type, name = '', email, message = '', locale = 'en', source }) {
    if (!isReady || !wixClient) {
      console.warn('[FormCMS] Wix client not ready, skipping CMS submission.');
      return;
    }

    const payload = {
      type,
      name,
      email,
      message,
      locale,
      source,
      status: 'new',
      submittedAt: new Date().toISOString(),
    };

    try {
      await wixClient.items.insert(COLLECTION_ID, payload);
      console.log('[FormCMS] Submission saved to CMS:', type, source);
    } catch (err) {
      // Non-blocking — log but don't disrupt the user experience
      console.error('[FormCMS] Failed to save to CMS:', err);
    }
  }

  return { submitToCMS };
}
