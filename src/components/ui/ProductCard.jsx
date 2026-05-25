import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

export const ProductCard = ({ product }) => {
  const { t, locale } = useTranslation();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation(); // Avoid navigating when clicking the buy button
    const defaultVariant = product.variants ? product.variants[0] : null;
    addToCart(product, 1, defaultVariant);
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      {/* Image Panel */}
      <div className="product-card-img-wrapper">
        <img
          src={product.images[0]}
          alt={product.name}
          className="product-card-img"
          loading="lazy"
        />
        <div className="product-card-hover-actions">
          <button className="product-card-quickview text-label">
            {t('store.quickView')}
          </button>
        </div>
        <span className="product-card-badge text-label">
          {t(`store.filters.${product.category}`)}
        </span>
      </div>

      {/* Info Panel */}
      <div className="product-card-info">
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-tagline">
          {locale === 'en' ? product.tagline : product.shortDescription.substring(0, 60) + '...'}
        </p>
        
        <div className="product-card-footer">
          <span className="product-card-price">${product.price.toFixed(2)}</span>
          <button
            onClick={handleAddToCartClick}
            className="product-card-buy-btn"
            aria-label="Add to cart"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
