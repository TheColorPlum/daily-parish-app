import { useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useSubscriptionStore } from '../stores';
import { api, ApiError } from '../lib';

/**
 * Hook to refresh subscription status from the backend.
 * Call this after purchases, on app foreground, or periodically.
 */
export function useSubscriptionSync() {
  const { getToken, signOut } = useAuth();
  const { syncFromUser, setLoading, setError, reset } = useSubscriptionStore();

  const refreshSubscription = useCallback(async () => {
    console.log('[SubscriptionSync] Refreshing subscription status...');
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      
      if (!token) {
        console.error('[SubscriptionSync] No token - cannot refresh subscription');
        setError('Not authenticated');
        setLoading(false);
        return false;
      }

      const userData = await api.getUser(token);
      console.log('[SubscriptionSync] Got user data, subscription:', userData.subscription_status);
      
      syncFromUser(userData.subscription_status);
      setLoading(false);
      return true;
      
    } catch (error) {
      console.error('[SubscriptionSync] Failed to refresh subscription:', error);
      
      if (error instanceof ApiError) {
        if (error.status === 401) {
          console.error('[SubscriptionSync] 401 - token invalid');
          reset();
          setError('Session expired');
        } else {
          setError(`Failed to sync: ${error.message}`);
        }
      } else {
        setError('Failed to check subscription status');
      }
      
      setLoading(false);
      return false;
    }
  }, [getToken, syncFromUser, setLoading, setError, reset]);

  return { refreshSubscription };
}
