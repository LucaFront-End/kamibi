import React from 'react';
import { useCart } from '../../context/CartContext';
import { useTranslation } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import './CartDrawer.css';

export const CartDrawer = () => {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, getSubtotal } = useCart();
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="cart-overlay"
          />

          {/* Slide-out Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="cart-drawer"
          >
            {/* Header */}
            <div className="cart-drawer-header">
              <h3 className="cart-drawer-title">{t('cart.title')}</h3>
              <button
                onClick={() => setIsCartOpen(false)}
                className="cart-close-btn"
                aria-label="Close cart"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content Body */}
            <div className="cart-drawer-body">
              {cartItems.length === 0 ? (
                <div className="cart-empty-state">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="cart-empty-icon"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <p>{t('cart.empty')}</p>
                  <button onClick={() => setIsCartOpen(false)} className="cart-continue-shopping">
                    {t('cart.continue')}
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cartItems.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      key={`${item.id}-${item.variant || ''}`}
                      className="cart-item-card"
                    >
                      <div className="cart-item-img-wrapper">
                        <img src={item.images[0]} alt={item.name} className="cart-item-img" />
                      </div>
                      
                      <div className="cart-item-details">
                        <div className="cart-item-row-top">
                          <h4 className="cart-item-name">{item.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.id, item.variant)}
                            className="cart-item-remove-btn"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                        
                        {item.variant && <p className="cart-item-variant">{item.variant}</p>}
                        
                        <div className="cart-item-row-bottom">
                          <div className="quantity-controller">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                              className="qty-btn"
                            >
                              -
                            </button>
                            <span className="qty-val">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                              className="qty-btn"
                            >
                              +
                            </button>
                          </div>
                          <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary (if items present) */}
            {cartItems.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-subtotal-row">
                  <span>{t('cart.subtotal')}</span>
                  <span className="cart-subtotal-val">${getSubtotal().toFixed(2)}</span>
                </div>
                <p className="cart-shipping-notice">Shipping and taxes calculated at checkout.</p>
                <button
                  onClick={() => alert("Checkout redirection will occur here in Phase 2!")}
                  className="cart-checkout-btn"
                >
                  {t('cart.checkout')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
