import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, OAuthStrategy, EMPTY_TOKENS } from '@wix/sdk';
import { products } from '@wix/stores';
import { currentCart, orders } from '@wix/ecom';
import { redirects } from '@wix/redirects';
import { posts } from '@wix/blog';
import { members } from '@wix/members';
import { WIX_CLIENT_ID, TOKEN_KEY } from '../lib/wixClient';

const MEMBER_FLAG = 'kamibi_is_member';

// ─── Member session helpers ──────────────────────────────────────────────────
/** Check if user has an active member session. */
export function isMemberSession() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(MEMBER_FLAG) === 'true';
}

/** Set/clear the member session flag. */
export function setMemberFlag(isMember) {
  if (typeof window === 'undefined') return;
  if (isMember) {
    localStorage.setItem(MEMBER_FLAG, 'true');
  } else {
    localStorage.removeItem(MEMBER_FLAG);
    localStorage.removeItem(TOKEN_KEY);
  }
}

// ─── Token storage (localStorage) ─────────────────────────────────────────────
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
      // Protect member tokens from being overwritten with visitor tokens
      const isMember = localStorage.getItem(MEMBER_FLAG) === 'true';
      if (isMember) {
        const currentRaw = localStorage.getItem(TOKEN_KEY);
        if (currentRaw) {
          try {
            const current = JSON.parse(currentRaw);
            const incomingRefresh = tokens?.refreshToken?.value;
            const currentRefresh = current?.refreshToken?.value;
            if (currentRefresh && incomingRefresh && currentRefresh !== incomingRefresh) {
              return; // Block visitor token overwrite
            }
          } catch {}
        }
      }
      try {
        localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
      } catch {}
    },
  };
}

// ─── Build client ──────────────────────────────────────────────────────────────
function buildWixClient() {
  return createClient({
    modules: { products, currentCart, orders, redirects, posts, members },
    auth: OAuthStrategy({
      clientId: WIX_CLIENT_ID,
      tokenStorage: createTokenStorage(),
    }),
  });
}

// ─── Context ───────────────────────────────────────────────────────────────────
export const WixContext = createContext(null);

export const WixContextProvider = ({ children }) => {
  const [wixClient] = useState(() => buildWixClient());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const existing = localStorage.getItem(TOKEN_KEY);
      if (!existing) {
        try {
          await wixClient.auth.generateVisitorTokens();
        } catch (err) {
          console.error('[Wix] Failed to generate visitor tokens:', err);
        }
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
