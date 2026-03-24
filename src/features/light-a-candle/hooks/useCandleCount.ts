import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CandleState {
  // Last date a candle was lit (YYYY-MM-DD)
  lastLitDate: string | null;
  // Number of candles lit today
  todayCount: number;
  
  // Actions
  incrementCandle: () => void;
  getTodayCount: () => number;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export const useCandleStore = create<CandleState>()(
  persist(
    (set, get) => ({
      lastLitDate: null,
      todayCount: 0,

      incrementCandle: () => {
        const today = getTodayString();
        const state = get();
        
        if (state.lastLitDate === today) {
          // Same day, increment
          set({ todayCount: state.todayCount + 1 });
        } else {
          // New day, reset to 1
          set({ lastLitDate: today, todayCount: 1 });
        }
      },

      getTodayCount: () => {
        const state = get();
        const today = getTodayString();
        
        if (state.lastLitDate === today) {
          return state.todayCount;
        }
        return 0;
      },
    }),
    {
      name: 'candle-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Convenience hook for components
export function useCandleCount() {
  const { todayCount, lastLitDate, incrementCandle } = useCandleStore();
  
  const today = getTodayString();
  const hasLitToday = lastLitDate === today && todayCount > 0;
  const count = hasLitToday ? todayCount : 0;
  
  return {
    count,
    hasLitToday,
    incrementCandle,
  };
}
