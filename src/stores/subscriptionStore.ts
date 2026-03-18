import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Subscription status values from backend
 */
export type SubscriptionStatus = 'free' | 'premium' | 'expired' | 'grace_period';

interface SubscriptionState {
  // Subscription status from backend
  status: SubscriptionStatus;
  
  // Loading state for subscription checks
  isLoading: boolean;
  
  // Error state
  error: string | null;
  
  // Last sync timestamp (for stale checks)
  lastSyncedAt: number | null;
  
  // Derived state
  isPremium: boolean;
  
  // Actions
  setStatus: (status: SubscriptionStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  syncFromUser: (subscriptionStatus: string) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  status: 'free' as SubscriptionStatus,
  isLoading: false,
  error: null,
  lastSyncedAt: null,
  isPremium: false,
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setStatus: (status) => set({ 
        status, 
        isPremium: status === 'premium' || status === 'grace_period',
        lastSyncedAt: Date.now(),
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      /**
       * Sync subscription status from /api/user response
       * This is the primary way subscription status gets updated
       */
      syncFromUser: (subscriptionStatus: string) => {
        // Normalize the status from backend
        let normalizedStatus: SubscriptionStatus = 'free';
        
        if (subscriptionStatus === 'premium' || subscriptionStatus === 'active') {
          normalizedStatus = 'premium';
        } else if (subscriptionStatus === 'expired') {
          normalizedStatus = 'expired';
        } else if (subscriptionStatus === 'grace_period') {
          normalizedStatus = 'grace_period';
        }
        
        const isPremium = normalizedStatus === 'premium' || normalizedStatus === 'grace_period';
        
        console.log(`[subscriptionStore] Synced status: ${normalizedStatus} (isPremium: ${isPremium})`);
        
        set({
          status: normalizedStatus,
          isPremium,
          lastSyncedAt: Date.now(),
          error: null,
        });
      },
      
      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist status and lastSyncedAt, not loading/error states
      partialize: (state) => ({
        status: state.status,
        isPremium: state.isPremium,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

/**
 * Hook to check if subscription data is stale (>1 hour old)
 */
export function useIsSubscriptionStale(): boolean {
  const lastSyncedAt = useSubscriptionStore((state) => state.lastSyncedAt);
  
  if (!lastSyncedAt) return true;
  
  const ONE_HOUR = 60 * 60 * 1000;
  return Date.now() - lastSyncedAt > ONE_HOUR;
}
