import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useWixProduct } from '../../hooks/useWixProducts';
import { products as staticProducts } from '../../lib/productsData';
import { useCart } from '../../context/CartContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import './ComplementsSection.css';

export const ComplementsSection = ({ complementProduct }) => {
  const { t, locale } = useTranslation();
  const { addToCart, isLoading: cartLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // If complementProduct wasn't provided by parent, fetch the default mini urn set from Wix
  const { product: fallbackWixProduct } = useWixProduct(
    !complementProduct ? 'mini-biodegradables-urn-set' : null
  );

  const staticFallback = staticProducts.find(
    (p) => p.slug === 'mini-biodegradables-urn-set' || p.id === 'mini-urns'
  );

  const miniUrns = complementProduct || fallbackWixProduct || staticFallback;

  if (!miniUrns) return null;

  const handleAddComplement = async () => {
    if (!miniUrns || isAdding || cartLoading) return;
    setIsAdding(true);
    try {
      const defaultVariant = miniUrns.variants && miniUrns.variants.length > 0
        ? (miniUrns.variantObjects?.[0]?.label || miniUrns.variants[0])
        : null;
      await addToCart(miniUrns, 1, defaultVariant);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (err) {
      console.error('Error adding complement to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const title = miniUrns.name?.includes('OCEAN')
    ? (locale === 'es' ? 'Mini Urnas Ocean — Sets para Compartir' : 'Mini Urns Ocean — Sharing Memorial Set')
    : (locale === 'es' ? 'Mini Urnas — Sets para Compartir' : 'Mini Urns — Sharing Memorial Set');

  const priceFormatted = miniUrns.price !== undefined
    ? Number(miniUrns.price).toFixed(2)
    : '49.99';

  const imageSrc = miniUrns.images?.[0] || '/products/mini-urns.png';

  return (
    <div className="complements-section">
      <ScrollReveal direction="up" className="complements-header text-center">
        <h3 className="heading-section complements-title">{t('product.complements.title')}</h3>
        <div className="divider-line-center"></div>
      </ScrollReveal>

      {/* Detail highlight card */}
      <ScrollReveal direction="up" delay={0.2} className="complement-spotlight">
        <div className="complement-img-wrapper">
          <img src={imageSrc} alt={title} className="complement-img" />
        </div>

        <div className="complement-info">
          <span className="text-label complement-tag">SHARING MEMORIALS</span>
          <h4 className="complement-name">{title}</h4>
          <p className="complement-desc">{t('product.complements.desc')}</p>
          
          <div className="complement-action-row">
            <span className="complement-price">${priceFormatted}</span>
            <button
              onClick={handleAddComplement}
              className={`complement-buy-btn text-label ${isAdding ? 'loading' : ''} ${addedSuccess ? 'success' : ''}`}
              disabled={isAdding || cartLoading}
            >
              {isAdding ? (
                <span className="complement-btn-inner">
                  <span className="btn-spinner-sm"></span>
                  {locale === 'es' ? 'Agregando...' : 'Adding...'}
                </span>
              ) : addedSuccess ? (
                <span className="complement-btn-inner">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t('product.added')}
                </span>
              ) : (
                t('product.complements.cta')
              )}
            </button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
export default ComplementsSection;
