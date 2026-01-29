import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TodayResponse } from '../types';

type TodayScreenState = 'loading' | 'ready' | 'playing' | 'content_consumed' | 'completed' | 'error';

interface TodayState {
  // Data
  date: string | null;
  firstReading: { reference: string; text: string } | null;
  gospel: { reference: string; text: string } | null;
  commentary: string | null;
  audioUrl: string | null;
  
  // Session
  sessionId: string | null;
  screenState: TodayScreenState;
  
  // Audio state
  isPlaying: boolean;
  playbackPosition: number;
  playbackDuration: number;
  
  // Error
  errorMessage: string | null;
  
  // Actions
  setReadings: (data: TodayResponse) => void;
  setSessionId: (id: string) => void;
  setScreenState: (state: TodayScreenState) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackPosition: (position: number) => void;
  setPlaybackDuration: (duration: number) => void;
  setError: (message: string) => void;
  clearToday: () => void;
}

export const useTodayStore = create<TodayState>()(
  persist(
    (set) => ({
      // Initial state
      date: null,
      firstReading: null,
      gospel: null,
      commentary: null,
      audioUrl: null,
      sessionId: null,
      screenState: 'loading',
      isPlaying: false,
      playbackPosition: 0,
      playbackDuration: 0,
      errorMessage: null,

      // Actions
      setReadings: (data) => set({
        date: data.date,
        firstReading: data.first_reading,
        gospel: data.gospel,
        commentary: data.commentary,
        audioUrl: data.audio_url,
        screenState: 'ready',
        errorMessage: null,
      }),
      
      setSessionId: (id) => set({ sessionId: id }),
      
      setScreenState: (state) => set({ screenState: state }),
      
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      
      setPlaybackPosition: (position) => set({ playbackPosition: position }),
      
      setPlaybackDuration: (duration) => set({ playbackDuration: duration }),
      
      setError: (message) => set({ 
        screenState: 'error', 
        errorMessage: message 
      }),
      
      clearToday: () => set({
        date: null,
        firstReading: null,
        gospel: null,
        commentary: null,
        audioUrl: null,
        sessionId: null,
        screenState: 'loading',
        isPlaying: false,
        playbackPosition: 0,
        playbackDuration: 0,
        errorMessage: null,
      }),
    }),
    {
      name: 'today-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist date and readings, not ephemeral state
      partialize: (state) => ({
        date: state.date,
        firstReading: state.firstReading,
        gospel: state.gospel,
        commentary: state.commentary,
        audioUrl: state.audioUrl,
      }),
    }
  )
);
