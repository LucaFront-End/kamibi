import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useWixProducts } from '../../hooks/useWixProducts';
import { ProductCard } from '../ui/ProductCard';
import { ScrollReveal } from '../ui/ScrollReveal';
import './SimilarProducts.css';

export const SimilarProducts = ({ currentId }) => {
  const { t } = useTranslation();
  const { products } = useWixProducts();

  // Find 3 products that are similar and not the current one, excluding mini-urns
  const similarList = products
    .filter((p) => p.id !== currentId && p.slug !== 'mini-urns')
    .slice(0, 3);

  if (similarList.length === 0) return null;

  return (
    <div className="similar-products">
      <ScrollReveal direction="up" className="similar-header text-center">
        <h3 className="heading-section similar-title">{t('product.similar.title')}</h3>
        <div className="divider-line-center"></div>
      </ScrollReveal>

      {/* Product grid list */}
      <div className="similar-grid">
        {similarList.map((product, idx) => (
          <ScrollReveal
            key={product.id}
            direction="up"
            delay={idx * 0.1}
          >
            <ProductCard product={product} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};
export default SimilarProducts;
