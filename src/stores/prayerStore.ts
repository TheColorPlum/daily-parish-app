import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// ============================================
// TYPES
// ============================================

export interface Prayer {
  id: string;
  readingId: string | null; // Links to daily reading, optional
  content: string;
  createdAt: string; // ISO timestamp
  answeredAt: string | null; // ISO timestamp when marked answered
}

interface PrayerState {
  prayers: Prayer[];
  
  // Actions
  addPrayer: (content: string, readingId?: string | null) => Promise<Prayer>;
  deletePrayer: (id: string) => void;
  markAnswered: (id: string) => void;
  unmarkAnswered: (id: string) => void;
  
  // Queries
  getPrayersByDate: (date: string) => Prayer[];
  getActivePrayers: () => Prayer[];
  getAnsweredPrayers: () => Prayer[];
  getTodaysPrayers: () => Prayer[];
}

// ============================================
// HELPERS
// ============================================

function generateId(): string {
  // Simple UUID-like ID using timestamp + random
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function getDateFromTimestamp(timestamp: string): string {
  return timestamp.split('T')[0];
}

// ============================================
// STORE
// ============================================

export const usePrayerStore = create<PrayerState>()(
  persist(
    (set, get) => ({
      prayers: [],

      // Add a new prayer
      addPrayer: async (content: string, readingId: string | null = null): Promise<Prayer> => {
        const prayer: Prayer = {
          id: generateId(),
          readingId,
          content: content.trim(),
          createdAt: new Date().toISOString(),
          answeredAt: null,
        };

        set((state) => ({
          prayers: [prayer, ...state.prayers],
        }));

        return prayer;
      },

      // Delete a prayer
      deletePrayer: (id: string) => {
        set((state) => ({
          prayers: state.prayers.filter((p) => p.id !== id),
        }));
      },

      // Mark prayer as answered
      markAnswered: (id: string) => {
        set((state) => ({
          prayers: state.prayers.map((p) =>
            p.id === id ? { ...p, answeredAt: new Date().toISOString() } : p
          ),
        }));
      },

      // Unmark prayer as answered
      unmarkAnswered: (id: string) => {
        set((state) => ({
          prayers: state.prayers.map((p) =>
            p.id === id ? { ...p, answeredAt: null } : p
          ),
        }));
      },

      // Get prayers for a specific date (YYYY-MM-DD)
      getPrayersByDate: (date: string): Prayer[] => {
        const { prayers } = get();
        return prayers.filter((p) => getDateFromTimestamp(p.createdAt) === date);
      },

      // Get all active (unanswered) prayers
      getActivePrayers: (): Prayer[] => {
        const { prayers } = get();
        return prayers.filter((p) => p.answeredAt === null);
      },

      // Get all answered prayers
      getAnsweredPrayers: (): Prayer[] => {
        const { prayers } = get();
        return prayers.filter((p) => p.answeredAt !== null);
      },

      // Get today's prayers
      getTodaysPrayers: (): Prayer[] => {
        const today = getTodayDateString();
        return get().getPrayersByDate(today);
      },
    }),
    {
      name: 'prayer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
