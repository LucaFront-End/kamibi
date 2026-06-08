import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWixClient } from './WixContext';
import { isMemberSession, setMemberFlag } from './WixContext';

const CACHE_EMAIL_KEY = 'kamibi_member_email';
const CACHE_NAME_KEY = 'kamibi_member_name';

// getMemberTokensForDirectLogin uses an iframe that can hang forever if
// the Wix authorize endpoint returns a non-200. Race it with a timeout.
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
  ]);
}

const MembersContext = createContext(null);

export const MembersProvider = ({ children }) => {
  const { wixClient, isReady } = useWixClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberName, setMemberName] = useState('');
  const [loadingMember, setLoadingMember] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Load cached profile immediately
  useEffect(() => {
    try {
      const cachedEmail = localStorage.getItem(CACHE_EMAIL_KEY);
      const cachedName = localStorage.getItem(CACHE_NAME_KEY);
      if (cachedEmail) setMemberEmail(cachedEmail);
      if (cachedName) setMemberName(cachedName);
    } catch {}
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    if (!isReady) return;
    const checkAuth = async () => {
      try {
        const hasMemberSession = isMemberSession();
        setIsLoggedIn(hasMemberSession);

        if (hasMemberSession) {
          // Extract memberId from JWT
          let memberId = '';
          try {
            const stored = localStorage.getItem('kamibi_wix_session');
            if (stored) {
              const parsed = JSON.parse(stored);
              const accessToken = parsed?.accessToken?.value || '';
              if (accessToken) {
                const parts = accessToken.split('.');
                if (parts.length >= 2) {
                  const payload = JSON.parse(atob(parts[1]));
                  const data = typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data;
                  memberId = data?.id || data?.memberId || '';
                }
              }
            }
          } catch {}

          // Fetch member profile via SDK
          if (memberId) {
            try {
              const member = await wixClient.members.getMember(memberId);
              if (member) {
                const email = member.loginEmail || '';
                const fullName = [member.profile?.nickname, member.contact?.firstName, member.contact?.lastName]
                  .filter(Boolean).join(' ') || email;
                setMemberEmail(email);
                setMemberName(fullName);
                try {
                  localStorage.setItem(CACHE_EMAIL_KEY, email);
                  localStorage.setItem(CACHE_NAME_KEY, fullName);
                } catch {}
              }
            } catch (err) {
              console.warn('[Members] Could not fetch member:', err);
            }
          }
        }
      } catch {
        setIsLoggedIn(false);
      }
      setLoadingMember(false);
    };
    checkAuth();
  }, [wixClient, isReady]);

  // Login with email/password (direct, no redirect)
  const login = useCallback(async (email, password) => {
    try {
      console.log('[Members] Attempting login for:', email);
      const response = await wixClient.auth.login({ email, password });
      console.log('[Members] Login response state:', response.loginState);

      if (response.loginState === 'SUCCESS' && response.data) {
        const sessionToken = response.data.sessionToken;
        try {
          console.log('[Members] Getting member tokens...');
          const memberTokens = await withTimeout(
            wixClient.auth.getMemberTokensForDirectLogin(sessionToken),
            8000
          );
          console.log('[Members] ✅ Member tokens received');
          setMemberFlag(true);
          wixClient.auth.setTokens(memberTokens);
        } catch (tokenErr) {
          console.error('[Members] getMemberTokensForDirectLogin failed:', tokenErr);
          // Still mark as logged in — tokens might already be set by the SDK
          setMemberFlag(true);
        }
        setIsLoggedIn(true);
        setMemberEmail(email);
        setMemberName(email);
        try {
          localStorage.setItem(CACHE_EMAIL_KEY, email);
          localStorage.setItem(CACHE_NAME_KEY, email);
        } catch {}
        return { success: true };
      } else if (response.loginState === 'FAILURE') {
        const errorCode = response.errorCode;
        if (errorCode === 'invalidEmail' || errorCode === 'invalidPassword') {
          return { success: false, error: 'invalidCredentials' };
        } else if (errorCode === 'emailAlreadyExists') {
          return { success: false, error: 'emailExists' };
        } else if (errorCode === 'resetPassword') {
          return { success: false, error: 'resetPassword' };
        }
        return { success: false, error: 'unknown' };
      } else if (response.loginState === 'EMAIL_VERIFICATION_REQUIRED') {
        return { success: false, error: 'emailVerification' };
      }
      return { success: false, error: 'unknown' };
    } catch (err) {
      console.error('[Members] Login error:', err);
      return { success: false, error: 'unknown' };
    }
  }, [wixClient]);

  // Register with email/password
  const register = useCallback(async (email, password) => {
    try {
      console.log('[Members] Attempting register for:', email);
      const response = await wixClient.auth.register({ email, password });
      console.log('[Members] Register response state:', response.loginState);

      if (response.loginState === 'SUCCESS' && response.data) {
        const sessionToken = response.data.sessionToken;
        try {
          console.log('[Members] Getting member tokens after register...');
          const memberTokens = await withTimeout(
            wixClient.auth.getMemberTokensForDirectLogin(sessionToken),
            8000
          );
          console.log('[Members] ✅ Member tokens received');
          setMemberFlag(true);
          wixClient.auth.setTokens(memberTokens);
        } catch (tokenErr) {
          console.error('[Members] getMemberTokensForDirectLogin failed:', tokenErr);
          setMemberFlag(true);
        }
        setIsLoggedIn(true);
        setMemberEmail(email);
        setMemberName(email);
        try {
          localStorage.setItem(CACHE_EMAIL_KEY, email);
          localStorage.setItem(CACHE_NAME_KEY, email);
        } catch {}
        return { success: true };
      } else if (response.loginState === 'FAILURE') {
        const errorCode = response.errorCode;
        if (errorCode === 'emailAlreadyExists') {
          return { success: false, error: 'emailExists' };
        }
        return { success: false, error: 'unknown' };
      } else if (response.loginState === 'EMAIL_VERIFICATION_REQUIRED') {
        return { success: false, error: 'emailVerification' };
      }
      return { success: false, error: 'unknown' };
    } catch (err) {
      console.error('[Members] Register error:', err);
      return { success: false, error: 'unknown' };
    }
  }, [wixClient]);

  // Logout
  const logout = useCallback(async () => {
    setIsLoggedIn(false);
    setMemberEmail('');
    setMemberName('');
    setOrders([]);
    setMemberFlag(false);
    try {
      localStorage.removeItem(CACHE_EMAIL_KEY);
      localStorage.removeItem(CACHE_NAME_KEY);
    } catch {}
    try {
      await wixClient.auth.logout(window.location.origin + '/mi-cuenta');
    } catch {
      window.location.href = '/mi-cuenta';
    }
  }, [wixClient]);

  // Fetch orders (called by AccountPage when logged in)
  const fetchOrders = useCallback(async () => {
    if (!isLoggedIn || !wixClient) return;
    setOrdersLoading(true);
    try {
      const result = await wixClient.orders.searchOrders({
        search: { cursorPaging: { limit: 20 } },
      });
      setOrders(result?.orders || []);
    } catch (err) {
      console.error('[Members] Could not load orders:', err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [isLoggedIn, wixClient]);

  return (
    <MembersContext.Provider value={{
      isLoggedIn,
      memberEmail,
      memberName,
      loadingMember,
      orders,
      ordersLoading,
      login,
      register,
      logout,
      fetchOrders,
    }}>
      {children}
    </MembersContext.Provider>
  );
};

export const useMembers = () => {
  const ctx = useContext(MembersContext);
  if (!ctx) throw new Error('useMembers must be used inside MembersProvider');
  return ctx;
};
