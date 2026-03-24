import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hydration state for waiting on AsyncStorage
let hasHydrated = false;

interface UserState {
  // User data
  id: string | null;
  email: string | null;
  
  // First-run flags
  hasCompletedFirstSession: boolean;
  hasSeenWelcome: boolean;
  hasCompletedOnboarding: boolean; // Completed notification time + completion screens
  hasCompletedFirstPrayer: boolean;
  hasSeenSaveMessage: boolean;
  sessionCount: number; // Track for notification prompt timing
  
  // Actions
  setUser: (user: { id: string; email: string }) => void;
  setHasCompletedFirstSession: (value: boolean) => void;
  setHasSeenWelcome: (value: boolean) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  setHasCompletedFirstPrayer: (value: boolean) => void;
  setHasSeenSaveMessage: (value: boolean) => void;
  incrementSessionCount: () => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Initial state
      id: null,
      email: null,
      hasCompletedFirstSession: false,
      hasSeenWelcome: false,
      hasCompletedOnboarding: false,
      hasCompletedFirstPrayer: false,
      hasSeenSaveMessage: false,
      sessionCount: 0,

      // Actions
      setUser: (user) => set({ id: user.id, email: user.email }),
      
      setHasCompletedFirstSession: (value) => set({ hasCompletedFirstSession: value }),
      
      setHasSeenWelcome: (value) => set({ hasSeenWelcome: value }),
      
      setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
      
      setHasCompletedFirstPrayer: (value) => set({ hasCompletedFirstPrayer: value }),
      
      setHasSeenSaveMessage: (value) => set({ hasSeenSaveMessage: value }),
      
      incrementSessionCount: () => set((state) => ({ sessionCount: state.sessionCount + 1 })),
      
      clearUser: () => set({
        id: null,
        email: null,
        hasCompletedFirstSession: false,
        // Note: Don't reset device flags on sign out
      }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        hasHydrated = true;
      },
    }
  )
);

/**
 * Check if the user store has been hydrated from AsyncStorage
 * Use this to prevent flash of default state on app launch
 */
export function useUserStoreHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(hasHydrated);
  
  React.useEffect(() => {
    // If already hydrated, we're done
    if (hasHydrated) {
      setHydrated(true);
      return;
    }
    
    // Otherwise, subscribe to changes
    const unsub = useUserStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    
    return () => unsub();
  }, []);
  
  return hydrated;
}
