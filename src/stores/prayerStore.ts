import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// TYPES
// ============================================

export interface Prayer {
  id: string;
  readingId: string | null;
  content: string;
  createdAt: string;
  answeredAt: string | null;
}

export type MilestoneType = 
  | '1_day' 
  | '2_days' 
  | '1_week' 
  | '2_weeks' 
  | '1_month' 
  | '6_months' 
  | '1_year';

export interface Milestone {
  type: MilestoneType;
  label: string;
  daysRequired: number;
  uniqueDaysRequired?: number; // For "2 days" milestone
}

export const MILESTONES: Milestone[] = [
  { type: '1_day', label: 'First prayer', daysRequired: 0 },
  { type: '2_days', label: '2 days', daysRequired: 0, uniqueDaysRequired: 2 },
  { type: '1_week', label: '1 week', daysRequired: 7 },
  { type: '2_weeks', label: '2 weeks', daysRequired: 14 },
  { type: '1_month', label: '1 month', daysRequired: 30 },
  { type: '6_months', label: '6 months', daysRequired: 180 },
  { type: '1_year', label: '1 year', daysRequired: 365 },
];

interface PrayerState {
  prayers: Prayer[];
  firstPrayerDate: string | null; // ISO date string (YYYY-MM-DD)
  daysWithPrayers: string[]; // Array of unique date strings
  seenMilestones: MilestoneType[];
  
  // Actions
  addPrayer: (content: string, readingId?: string | null) => Promise<Prayer>;
  deletePrayer: (id: string) => void;
  markAnswered: (id: string) => void;
  unmarkAnswered: (id: string) => void;
  markMilestoneSeen: (type: MilestoneType) => void;
  
  // Queries
  getPrayersByDate: (date: string) => Prayer[];
  getActivePrayers: () => Prayer[];
  getAnsweredPrayers: () => Prayer[];
  getTodaysPrayers: () => Prayer[];
  getUnseenMilestone: () => Milestone | null;
  getDaysSinceFirstPrayer: () => number;
  getUniquePrayerDays: () => number;
}

// ============================================
// HELPERS
// ============================================

function generateId(): string {
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

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// ============================================
// STORE
// ============================================

export const usePrayerStore = create<PrayerState>()(
  persist(
    (set, get) => ({
      prayers: [],
      firstPrayerDate: null,
      daysWithPrayers: [],
      seenMilestones: [],

      // Add a new prayer
      addPrayer: async (content: string, readingId: string | null = null): Promise<Prayer> => {
        const today = getTodayDateString();
        const state = get();
        
        const prayer: Prayer = {
          id: generateId(),
          readingId,
          content: content.trim(),
          createdAt: new Date().toISOString(),
          answeredAt: null,
        };

        // Track first prayer date
        const isFirstPrayer = state.firstPrayerDate === null;
        const newFirstPrayerDate = isFirstPrayer ? today : state.firstPrayerDate;
        
        // Track unique days with prayers
        const newDaysWithPrayers = state.daysWithPrayers.includes(today)
          ? state.daysWithPrayers
          : [...state.daysWithPrayers, today];

        set({
          prayers: [prayer, ...state.prayers],
          firstPrayerDate: newFirstPrayerDate,
          daysWithPrayers: newDaysWithPrayers,
        });

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

      // Mark a milestone as seen
      markMilestoneSeen: (type: MilestoneType) => {
        set((state) => ({
          seenMilestones: [...state.seenMilestones, type],
        }));
      },

      // Get prayers for a specific date
      getPrayersByDate: (date: string): Prayer[] => {
        const { prayers } = get();
        return prayers.filter((p) => getDateFromTimestamp(p.createdAt) === date);
      },

      // Get all active prayers
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

      // Get days since first prayer
      getDaysSinceFirstPrayer: (): number => {
        const { firstPrayerDate } = get();
        if (!firstPrayerDate) return 0;
        return daysBetween(firstPrayerDate, getTodayDateString());
      },

      // Get number of unique days with prayers
      getUniquePrayerDays: (): number => {
        return get().daysWithPrayers.length;
      },

      // Get the next unseen milestone (if any)
      getUnseenMilestone: (): Milestone | null => {
        const state = get();
        const daysSinceFirst = state.getDaysSinceFirstPrayer();
        const uniqueDays = state.getUniquePrayerDays();
        
        for (const milestone of MILESTONES) {
          // Skip if already seen
          if (state.seenMilestones.includes(milestone.type)) continue;
          
          // Check if milestone is achieved
          if (milestone.type === '1_day') {
            // First prayer - achieved when firstPrayerDate is set
            if (state.firstPrayerDate) return milestone;
          } else if (milestone.type === '2_days') {
            // 2 different days
            if (uniqueDays >= 2) return milestone;
          } else {
            // Time-based milestones
            if (daysSinceFirst >= milestone.daysRequired) return milestone;
          }
        }
        
        return null;
      },
    }),
    {
      name: 'prayer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
