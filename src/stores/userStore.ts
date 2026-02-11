import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  // User data
  id: string | null;
  email: string | null;
  
  // First-run flags
  hasCompletedFirstSession: boolean;
  hasSeenWelcome: boolean;
  
  // Actions
  setUser: (user: { id: string; email: string }) => void;
  setHasCompletedFirstSession: (value: boolean) => void;
  setHasSeenWelcome: (value: boolean) => void;
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

      // Actions
      setUser: (user) => set({ id: user.id, email: user.email }),
      
      setHasCompletedFirstSession: (value) => set({ hasCompletedFirstSession: value }),
      
      setHasSeenWelcome: (value) => set({ hasSeenWelcome: value }),
      
      clearUser: () => set({
        id: null,
        email: null,
        hasCompletedFirstSession: false,
        // Note: Don't reset hasSeenWelcome on sign out - it's a device flag
      }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
