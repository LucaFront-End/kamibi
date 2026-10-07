import { useState, useEffect } from 'react';
import { useWixClient } from '../context/WixContext';

export const LEGAL_POLICIES_CONFIG = {
  privacy: {
    key: 'privacy',
    collection: 'AvisodePrivacidad',
    pathEn: '/privacy-policy',
    pathEs: '/aviso-de-privacidad',
    labelEn: 'Privacy Policy',
    labelEs: 'Aviso de Privacidad',
    metaTitleEn: 'Privacy Policy | Kamibi Store',
    metaTitleEs: 'Aviso de Privacidad | Kamibi Store',
    metaDescEn: 'Read the official Kamibi Store Privacy Policy. Learn how we collect, protect, and respect your personal information.',
    metaDescEs: 'Consulta el Aviso de Privacidad oficial de Kamibi Store. Conoce cómo protegemos y tratamos tu información personal.',
  },
  terms: {
    key: 'terms',
    collection: 'Temrinosycondiciones',
    pathEn: '/terms-of-service',
    pathEs: '/terminos-y-condiciones',
    labelEn: 'Terms and Conditions',
    labelEs: 'Términos y Condiciones',
    metaTitleEn: 'Terms and Conditions | Kamibi Store',
    metaTitleEs: 'Términos y Condiciones | Kamibi Store',
    metaDescEn: 'Review the Terms and Conditions for purchasing biodegradable urns and memorial products at Kamibi Store.',
    metaDescEs: 'Términos y Condiciones generales de uso y compra en Kamibi Store.',
  },
  shipping: {
    key: 'shipping',
    collection: 'PoliticadeEnvios',
    pathEn: '/shipping-policy',
    pathEs: '/politica-de-envios',
    labelEn: 'Shipping Policy',
    labelEs: 'Política de Envíos',
    metaTitleEn: 'Shipping Policy | Kamibi Store',
    metaTitleEs: 'Política de Envíos | Kamibi Store',
    metaDescEn: 'Explore shipping methods, delivery timeframes, tracking, and delivery guarantees at Kamibi Store across USA and Canada.',
    metaDescEs: 'Tiempos de entrega, métodos de envío, seguimiento y cobertura en USA y Canadá en Kamibi Store.',
  },
  refund: {
    key: 'refund',
    collection: 'PoliticadeReembolsos',
    pathEn: '/refund-policy',
    pathEs: '/politica-de-reembolsos',
    labelEn: 'Return & Refund Policy',
    labelEs: 'Política de Reembolsos',
    metaTitleEn: 'Return and Refund Policy | Kamibi Store',
    metaTitleEs: 'Política de Reembolsos y Devoluciones | Kamibi Store',
    metaDescEn: 'Information regarding returns, damage replacements, and refunds for biodegradable urns at Kamibi Store.',
    metaDescEs: 'Políticas de garantía, reemplazos por daño y reembolsos en Kamibi Store.',
  },
  cookies: {
    key: 'cookies',
    collection: 'PoliticasdeCookies',
    pathEn: '/cookie-policy',
    pathEs: '/politica-de-cookies',
    labelEn: 'Cookie Policy',
    labelEs: 'Política de Cookies',
    metaTitleEn: 'Cookie Policy | Kamibi Store',
    metaTitleEs: 'Política de Cookies | Kamibi Store',
    metaDescEn: 'Understand how Kamibi Store uses cookies to enhance your shopping experience and measure website performance.',
    metaDescEs: 'Información sobre el uso de cookies y tecnologías similares en el sitio web de Kamibi Store.',
  },
};

// In-memory cache across navigation sessions
const legalCache = new Map();

/**
 * Hook to dynamically fetch a legal policy from Wix CMS.
 * @param {string} policyKey - One of 'privacy' | 'terms' | 'shipping' | 'refund' | 'cookies'
 */
export function useWixLegal(policyKey = 'privacy') {
  const { wixClient, isReady } = useWixClient();
  const config = LEGAL_POLICIES_CONFIG[policyKey] || LEGAL_POLICIES_CONFIG.privacy;
  const cached = legalCache.get(config.key);

  const [data, setData] = useState(cached || null);
  const [loading, setLoading] = useState(cached ? false : true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (legalCache.has(config.key)) {
      setData(legalCache.get(config.key));
      setLoading(false);
      return;
    }

    if (!isReady) return;
    let cancelled = false;

    async function fetchPolicy() {
      setLoading(true);
      setError(null);
      try {
        const res = await wixClient.items.query(config.collection).limit(1).find();
        if (cancelled) return;

        if (res.items && res.items.length > 0) {
          const raw = res.items[0];
          const rawData = raw.data || raw;
          const htmlContent = rawData.descripcin || rawData.richtext || rawData.description || '';
          
          const normalized = {
            id: rawData._id,
            title: rawData.title || config.labelEn,
            content: htmlContent,
            lastUpdated: rawData._updatedDate || rawData._createdDate || null,
          };

          legalCache.set(config.key, normalized);
          setData(normalized);
        } else {
          setError(`No content found for collection ${config.collection}`);
        }
      } catch (err) {
        console.error(`[Wix CMS] Error fetching ${config.collection}:`, err);
        if (!cancelled) setError(err?.message || 'Error loading policy');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPolicy();
    return () => { cancelled = true; };
  }, [wixClient, isReady, config.key, config.collection]);

  return {
    config,
    data,
    content: data?.content || '',
    title: data?.title || config.labelEn,
    lastUpdated: data?.lastUpdated || null,
    loading,
    error,
    allPolicies: Object.values(LEGAL_POLICIES_CONFIG),
  };
}
