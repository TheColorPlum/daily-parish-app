import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useUserStore } from '../stores';
import { api } from '../lib';

/**
 * Hook to load user profile and streak data on auth.
 * Should be called once at app level when user is authenticated.
 */
export function useUserLoader() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { setUser, setStreak } = useUserStore();

  useEffect(() => {
    if (isSignedIn && user) {
      loadUserProfile();
    }
  }, [isSignedIn, user?.id]);

  async function loadUserProfile() {
    try {
      const token = await getToken();
      if (!token) return;

      const userData = await api.getUser(token);
      
      setUser({
        id: userData.id,
        email: userData.email,
      });

      // Note: User endpoint may not return streak data
      // Streak is updated after session complete
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Non-critical - app can still function
    }
  }

  return { loadUserProfile };
}
