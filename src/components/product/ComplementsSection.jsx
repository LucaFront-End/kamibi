import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { products } from '../../lib/productsData';
import { useCart } from '../../context/CartContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import './ComplementsSection.css';

export const ComplementsSection = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();

  // Find mini urns item details
  const miniUrns = products.find((p) => p.id === 'mini-urns');

  const handleAddComplement = () => {
    if (!miniUrns) return;
    const defaultVariant = miniUrns.variants ? miniUrns.variants[0] : null;
    addToCart(miniUrns, 1, defaultVariant);
  };

  if (!miniUrns) return null;

  return (
    <div className="complements-section">
      <ScrollReveal direction="up" className="complements-header text-center">
        <h3 className="heading-section complements-title">{t('product.complements.title')}</h3>
        <div className="divider-line-center"></div>
      </ScrollReveal>

      {/* Detail highlight card */}
      <ScrollReveal direction="up" delay={0.2} className="complement-spotlight">
        <div className="complement-img-wrapper">
          <img src={miniUrns.images[0]} alt={miniUrns.name} className="complement-img" />
        </div>

        <div className="complement-info">
          <span className="text-label complement-tag">SHARING MEMORIALS</span>
          <h4 className="complement-name">{miniUrns.name}</h4>
          <p className="complement-desc">{t('product.complements.desc')}</p>
          
          <div className="complement-action-row">
            <span className="complement-price">${miniUrns.price.toFixed(2)}</span>
            <button onClick={handleAddComplement} className="complement-buy-btn text-label">
              {t('product.complements.cta')}
            </button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
export default ComplementsSection;
