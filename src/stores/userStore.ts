import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  // User data
  id: string | null;
  email: string | null;
  
  // Streak data
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  
  // First-run flags
  hasCompletedFirstSession: boolean;
  
  // Actions
  setUser: (user: { id: string; email: string }) => void;
  setStreak: (streak: { current_streak: number; longest_streak: number; total_sessions: number }) => void;
  setHasCompletedFirstSession: (value: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Initial state
      id: null,
      email: null,
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: 0,
      hasCompletedFirstSession: false,

      // Actions
      setUser: (user) => set({ id: user.id, email: user.email }),
      
      setStreak: (streak) => set({
        currentStreak: streak.current_streak,
        longestStreak: streak.longest_streak,
        totalSessions: streak.total_sessions,
      }),
      
      setHasCompletedFirstSession: (value) => set({ hasCompletedFirstSession: value }),
      
      clearUser: () => set({
        id: null,
        email: null,
        currentStreak: 0,
        longestStreak: 0,
        totalSessions: 0,
        hasCompletedFirstSession: false,
      }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
