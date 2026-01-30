import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TodayScreenState = 
  | 'loading'
  | 'ready'
  | 'playing'
  | 'content_consumed'
  | 'completed'
  | 'error';

interface Reading {
  reference: string;
  text: string;
}

interface ReadingsData {
  date: string;
  first_reading: Reading;
  gospel: Reading;
  commentary: string;
  audioUrl: string;
}

interface TodayState {
  // Data
  date: string | null;
  firstReading: Reading | null;
  gospel: Reading | null;
  commentary: string | null;
  audioUrl: string | null;
  
  // Session
  sessionId: string | null;
  screenState: TodayScreenState;
  
  // Error
  errorMessage: string | null;
  
  // Actions
  setReadings: (data: ReadingsData) => void;
  setSessionId: (id: string) => void;
  setScreenState: (state: TodayScreenState) => void;
  setError: (message: string) => void;
  clearToday: () => void;
}

const initialState = {
  date: null,
  firstReading: null,
  gospel: null,
  commentary: null,
  audioUrl: null,
  sessionId: null,
  screenState: 'loading' as TodayScreenState,
  errorMessage: null,
};

export const useTodayStore = create<TodayState>()(
  persist(
    (set) => ({
      ...initialState,

      setReadings: (data) => set({
        date: data.date,
        firstReading: data.first_reading,
        gospel: data.gospel,
        commentary: data.commentary,
        audioUrl: data.audioUrl,
        errorMessage: null,
      }),
      
      setSessionId: (id) => set({ sessionId: id }),
      
      setScreenState: (state) => set({ screenState: state }),
      
      setError: (message) => set({ 
        screenState: 'error', 
        errorMessage: message 
      }),
      
      clearToday: () => set(initialState),
    }),
    {
      name: 'today-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist date and completion state for re-entry
      partialize: (state) => ({
        date: state.date,
        screenState: state.screenState === 'completed' ? 'completed' : 'loading',
      }),
    }
  )
);
