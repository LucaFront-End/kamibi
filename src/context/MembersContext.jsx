import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWixClient } from './WixContext';

const MembersContext = createContext(null);

export const MembersProvider = ({ children }) => {
  const { wixClient, isReady } = useWixClient();
  const [currentMember, setCurrentMember] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingMember, setLoadingMember] = useState(true);

  // Check if user is logged in on init
  const fetchCurrentMember = useCallback(async () => {
    if (!isReady) return;
    setLoadingMember(true);
    try {
      const member = await wixClient.members.getCurrentMember();
      setCurrentMember(member?.member || null);
      setIsLoggedIn(!!member?.member);
    } catch {
      setCurrentMember(null);
      setIsLoggedIn(false);
    } finally {
      setLoadingMember(false);
    }
  }, [wixClient, isReady]);

  useEffect(() => {
    if (isReady) fetchCurrentMember();
  }, [isReady, fetchCurrentMember]);

  // Login via Wix OAuth (opens Wix's managed login UI)
  const login = useCallback(async () => {
    try {
      const { authUrl } = await wixClient.auth.generateOAuthData({
        redirectUri: `${window.location.origin}/auth/callback`,
        originalUri: window.location.href,
      });
      window.location.href = authUrl;
    } catch (err) {
      console.error('[Members] Login error:', err);
    }
  }, [wixClient]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await wixClient.auth.logout(window.location.href);
      setCurrentMember(null);
      setIsLoggedIn(false);
    } catch (err) {
      console.error('[Members] Logout error:', err);
    }
  }, [wixClient]);

  return (
    <MembersContext.Provider value={{
      currentMember,
      isLoggedIn,
      loadingMember,
      login,
      logout,
      refetch: fetchCurrentMember,
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
