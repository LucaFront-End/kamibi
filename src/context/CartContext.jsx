import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWixClient } from './WixContext';
import { WIX_STORES_APP_ID } from '../lib/wixClient';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { wixClient, isReady } = useWixClient();
  const [cart, setCart] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Fetch the current cart (404 if empty — expected)
  const refreshCart = useCallback(async () => {
    if (!isReady) return;
    try {
      const currentCart = await wixClient.currentCart.getCurrentCart();
      console.log('[Cart] refreshCart response:', JSON.stringify({
        _id: currentCart?._id,
        lineItemCount: currentCart?.lineItems?.length,
        lineItems: currentCart?.lineItems?.map(i => ({
          id: i._id,
          name: i.productName?.original,
          qty: i.quantity,
        })),
      }, null, 2));
      setCart(currentCart);
    } catch (err) {
      if (err?.details?.applicationError?.code !== 'OWNED_CART_NOT_FOUND') {
        console.warn('[Cart] Error fetching cart:', err);
      }
      setCart(null);
    }
  }, [wixClient, isReady]);

  // Fetch cart once SDK is ready
  useEffect(() => {
    if (isReady) {
      refreshCart();
    }
  }, [isReady, refreshCart]);

  /**
   * Add a product to the Wix eCommerce cart.
   * @param {object} product - Normalized product from wixProducts.js
   * @param {number} quantity - How many to add
   * @param {string|null} selectedVariant - Text label of the selected variant (e.g. "Miniurns Flore")
   */
  const addToCart = async (product, quantity = 1, selectedVariant = null) => {
    if (!isReady) {
      console.warn('[Cart] SDK not ready yet');
      return;
    }
    setIsLoading(true);
    try {
      // Resolve the real Wix variant UUID from the text label
      let resolvedVariantId = null;

      if (product.wixVariants && product.wixVariants.length > 0) {
        if (selectedVariant) {
          // Find the wixVariant whose choice value matches the selected text
          const matched = product.wixVariants.find(v => {
            if (!v.choices) return false;
            return Object.values(v.choices).some(
              choiceVal => choiceVal === selectedVariant
            );
          });
          if (matched) {
            resolvedVariantId = matched._id;
          }
        }

        // If no match found but product has only one variant, use it
        if (!resolvedVariantId && product.wixVariants.length === 1) {
          resolvedVariantId = product.wixVariants[0]._id;
        }

        // If still no match, use the first variant as fallback
        if (!resolvedVariantId) {
          resolvedVariantId = product.wixVariants[0]._id;
        }
      }

      const catalogReference = {
        appId: WIX_STORES_APP_ID,
        catalogItemId: product._wixId || product.id,
      };

      // Only add options.variantId if we have a real variant
      if (resolvedVariantId) {
        catalogReference.options = { variantId: resolvedVariantId };
      }

      console.log('[Cart] Adding to cart:', JSON.stringify({
        catalogItemId: catalogReference.catalogItemId,
        productName: product.name,
        quantity,
        resolvedVariantId,
        selectedVariant,
      }, null, 2));

      const addResponse = await wixClient.currentCart.addToCurrentCart({
        lineItems: [{ catalogReference, quantity }],
      });

      console.log('[Cart] addToCurrentCart response:', JSON.stringify({
        cartId: addResponse?.cart?._id,
        lineItems: addResponse?.cart?.lineItems?.length,
      }, null, 2));

      // Re-fetch the full cart to get complete lineItems
      await refreshCart();

      // Notify other components (e.g. Navbar badge)
      window.dispatchEvent(new Event('cart-updated'));

      setTimeout(() => setIsCartOpen(true), 150);
    } catch (err) {
      console.error('[Cart] ❌ Error adding to cart:', err);
      const msg = err?.details?.applicationError?.description || err?.message || 'Error adding to cart';
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove a line item from the cart.
   */
  const removeFromCart = async (lineItemId) => {
    setIsLoading(true);
    try {
      const response = await wixClient.currentCart.removeLineItemsFromCurrentCart([lineItemId]);
      setCart(response.cart);
    } catch (err) {
      console.error('[Cart] Error removing:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update quantity of a line item.
   */
  const updateQuantity = async (lineItemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(lineItemId);
      return;
    }
    setIsLoading(true);
    try {
      const response = await wixClient.currentCart.updateCurrentCartLineItemQuantity([
        { _id: lineItemId, quantity },
      ]);
      setCart(response.cart);
    } catch (err) {
      console.error('[Cart] Error updating quantity:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear the entire cart.
   */
  const clearCart = async () => {
    setIsLoading(true);
    try {
      await wixClient.currentCart.deleteCurrentCart();
      setCart(null);
    } catch (err) {
      console.error('[Cart] Error clearing cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Redirect to Wix-managed checkout.
   */
  const handleCheckout = async () => {
    if (!cart?.lineItems?.length) return;
    setCheckoutLoading(true);
    try {
      const checkout = await wixClient.currentCart.createCheckoutFromCurrentCart({
        channelType: 'WEB',
      });

      console.log('[Cart] Checkout created:', checkout.checkoutId);

      const WIX_BASE_DOMAIN = 'dilodigitalmx.wixsite.com/kamibi-store';
      const BROKEN_DOMAIN = 'www.kamibistore.com';

      const { redirectSession } = await wixClient.redirects.createRedirectSession({
        ecomCheckout: { checkoutId: checkout.checkoutId },
        callbacks: {
          postFlowUrl: window.location.origin,
          thankYouPageUrl: `${window.location.origin}/thank-you`,
        },
      });

      // The Wix SDK generates URLs using the custom domain (kamibistore.com)
      // which doesn't work. Replace it with the base Wix domain that does work.
      let checkoutUrl = redirectSession.fullUrl;
      checkoutUrl = checkoutUrl.replaceAll(BROKEN_DOMAIN, WIX_BASE_DOMAIN);
      // Also fix any URL-encoded versions of the broken domain
      checkoutUrl = checkoutUrl.replaceAll(encodeURIComponent(BROKEN_DOMAIN), encodeURIComponent(WIX_BASE_DOMAIN));
      checkoutUrl = checkoutUrl.replaceAll(
        encodeURIComponent(`https://${BROKEN_DOMAIN}`),
        encodeURIComponent(`https://${WIX_BASE_DOMAIN}`)
      );

      console.log('[Cart] Original URL:', redirectSession.fullUrl);
      console.log('[Cart] Fixed URL:', checkoutUrl);
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('[Cart] Checkout error:', err);
      alert('Error initiating checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const cartItems = cart?.lineItems || [];

  const getSubtotal = () => {
    if (cart?.subtotal?.amount) return Number(cart.subtotal.amount);
    return cartItems.reduce((total, item) => {
      return total + Number(item.price?.amount || 0) * item.quantity;
    }, 0);
  };

  const getItemCount = () => cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        isCartOpen,
        setIsCartOpen,
        isLoading,
        checkoutLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        handleCheckout,
        getSubtotal,
        getItemCount,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
