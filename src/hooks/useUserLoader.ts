import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useUserStore } from '../stores';
import { api, ApiError } from '../lib';

/**
 * Hook to load user profile and streak data on auth.
 * Should be called once at app level when user is authenticated.
 */
export function useUserLoader() {
  const { isSignedIn, getToken, signOut } = useAuth();
  const { user } = useUser();
  const { setUser, clearUser } = useUserStore();

  useEffect(() => {
    if (isSignedIn && user) {
      console.log('[UserLoader] User signed in, loading profile for:', user.id);
      loadUserProfile();
    } else {
      console.log('[UserLoader] User not signed in, isSignedIn:', isSignedIn);
    }
  }, [isSignedIn, user?.id]);

  async function loadUserProfile() {
    try {
      console.log('[UserLoader] Getting Clerk token...');
      const token = await getToken();
      
      if (!token) {
        console.error('[UserLoader] No token returned from Clerk - user may need to re-authenticate');
        return;
      }
      
      console.log('[UserLoader] Token received, length:', token.length, 'prefix:', token.substring(0, 20) + '...');

      const userData = await api.getUser(token);
      console.log('[UserLoader] User profile loaded:', userData.id);
      
      setUser({
        id: userData.id,
        email: userData.email,
      });
    } catch (error) {
      console.error('[UserLoader] Failed to load user profile:', error);
      
      // If 401, the token is invalid - sign user out to force re-auth
      if (error instanceof ApiError && error.status === 401) {
        console.error('[UserLoader] 401 from API - token invalid, signing out');
        clearUser();
        try {
          await signOut();
        } catch (signOutError) {
          console.error('[UserLoader] Error during sign out:', signOutError);
        }
      }
    }
  }

  return { loadUserProfile };
}
