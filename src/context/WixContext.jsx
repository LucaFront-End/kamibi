import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, OAuthStrategy, EMPTY_TOKENS } from '@wix/sdk';
import { products } from '@wix/stores';
import { currentCart } from '@wix/ecom';
import { redirects } from '@wix/redirects';
import { WIX_CLIENT_ID, TOKEN_KEY } from '../lib/wixClient';

// ─── Token storage (localStorage) ─────────────────────────────────────────────
// Mirrors the reference project exactly.
// Returns EMPTY_TOKENS (not undefined) when no valid tokens exist —
// the Wix SDK requires EMPTY_TOKENS as the "no token" sentinel value.
function createTokenStorage() {
  return {
    getTokens() {
      if (typeof window === 'undefined') return EMPTY_TOKENS;
      try {
        const raw = localStorage.getItem(TOKEN_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.accessToken?.value && parsed?.refreshToken?.value) {
            return parsed;
          }
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      }
      return EMPTY_TOKENS;
    },
    setTokens(tokens) {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
      } catch {}
    },
  };
}

// ─── Build client ──────────────────────────────────────────────────────────────
function buildWixClient() {
  return createClient({
    modules: { products, currentCart, redirects },
    auth: OAuthStrategy({
      clientId: WIX_CLIENT_ID,
      tokenStorage: createTokenStorage(),
    }),
  });
}

// ─── Context ───────────────────────────────────────────────────────────────────
// Default value is null — prevents a second client being created at module load.
// The real client is created inside WixContextProvider via useState.
export const WixContext = createContext(null);

export const WixContextProvider = ({ children }) => {
  // useState factory ensures exactly ONE client instance for the whole app
  const [wixClient] = useState(() => buildWixClient());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const tokens = wixClient.auth.getTokens();
        // EMPTY_TOKENS has no accessToken value — generate visitor tokens
        if (!tokens?.accessToken?.value) {
          console.log('[Wix] Generating visitor tokens...');
          await wixClient.auth.generateVisitorTokens();
          console.log('[Wix] ✅ Visitor tokens ready');
        } else {
          console.log('[Wix] ✅ Existing tokens found');
        }
      } catch (err) {
        console.error('[Wix] Failed to generate visitor tokens:', err);
      }
      setIsReady(true);
    };
    init();
  }, [wixClient]);

  return (
    <WixContext.Provider value={{ wixClient, isReady }}>
      {children}
    </WixContext.Provider>
  );
};

export const useWixClient = () => {
  const ctx = useContext(WixContext);
  if (!ctx) throw new Error('useWixClient must be used inside WixContextProvider');
  return ctx;
};
