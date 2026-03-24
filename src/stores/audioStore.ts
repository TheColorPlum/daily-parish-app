/**
 * Global Audio Store
 * 
 * Manages audio playback state across the entire app.
 * Enables mini-player functionality when navigating away from playing content.
 * Persists playback position for resumability.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, AVPlaybackStatus } from 'expo-av';

export type AudioContentType = 'daily_reading' | 'rosary' | 'examen';

export type RosaryMystery = 'joyful' | 'sorrowful' | 'glorious' | 'luminous';
export type ExamenVersion = 'standard' | 'short' | 'emotions';

export interface AudioContent {
  id: string;
  type: AudioContentType;
  title: string;
  subtitle?: string;
  audioUrl: string;
  duration?: number; // milliseconds
  // For rosary/examen specifics
  mystery?: RosaryMystery;
  examenVersion?: ExamenVersion;
}

interface PlaybackProgress {
  contentId: string;
  position: number; // milliseconds
  lastUpdated: number; // timestamp
}

interface AudioState {
  // Current playback
  currentContent: AudioContent | null;
  isPlaying: boolean;
  isLoaded: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
  error: string | null;
  
  // Mini-player visibility
  showMiniPlayer: boolean;
  
  // Flag to trigger expand when navigating to Library
  pendingExpand: boolean;
  
  // Persisted progress (for resume functionality)
  savedProgress: Record<string, PlaybackProgress>;
  
  // Sound reference (not persisted)
  _sound: Audio.Sound | null;
}

interface AudioActions {
  // Playback controls
  loadContent: (content: AudioContent, autoPlay?: boolean) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  seekTo: (positionMs: number) => Promise<void>;
  stop: () => Promise<void>;
  
  // Mini-player
  showMini: () => void;
  hideMini: () => void;
  expandFromMini: () => void;
  clearPendingExpand: () => void;
  
  // Progress persistence
  saveProgress: () => void;
  getSavedPosition: (contentId: string) => number;
  clearSavedProgress: (contentId: string) => void;
  
  // Cleanup
  unload: () => Promise<void>;
  
  // Internal
  _onPlaybackStatusUpdate: (status: AVPlaybackStatus) => void;
}

type AudioStore = AudioState & AudioActions;

// Configure audio mode once
Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: true,
  shouldDuckAndroid: true,
});

export const useAudioStore = create<AudioStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentContent: null,
      isPlaying: false,
      isLoaded: false,
      isBuffering: false,
      position: 0,
      duration: 0,
      error: null,
      showMiniPlayer: false,
      pendingExpand: false,
      savedProgress: {},
      _sound: null,

      // Load and optionally play content
      loadContent: async (content: AudioContent, autoPlay = false) => {
        const state = get();
        
        // Unload any existing audio
        if (state._sound) {
          await state._sound.unloadAsync();
        }
        
        set({
          currentContent: content,
          isLoaded: false,
          isPlaying: false,
          isBuffering: true,
          position: 0,
          duration: content.duration || 0,
          error: null,
          showMiniPlayer: false,
        });

        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: content.audioUrl },
            { shouldPlay: autoPlay },
            get()._onPlaybackStatusUpdate
          );
          
          // Resume from saved position if available
          const savedPosition = get().getSavedPosition(content.id);
          if (savedPosition > 0) {
            await sound.setPositionAsync(savedPosition);
          }
          
          set({ _sound: sound, isBuffering: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load audio',
            isBuffering: false,
          });
        }
      },

      play: async () => {
        const { _sound } = get();
        if (_sound) {
          await _sound.playAsync();
        }
      },

      pause: async () => {
        const { _sound } = get();
        if (_sound) {
          await _sound.pauseAsync();
          get().saveProgress();
        }
      },

      togglePlayback: async () => {
        const { isPlaying, play, pause } = get();
        if (isPlaying) {
          await pause();
        } else {
          await play();
        }
      },

      seekTo: async (positionMs: number) => {
        const { _sound } = get();
        if (_sound) {
          await _sound.setPositionAsync(positionMs);
          set({ position: positionMs });
        }
      },

      stop: async () => {
        const { _sound, saveProgress } = get();
        saveProgress();
        
        if (_sound) {
          await _sound.stopAsync();
          await _sound.setPositionAsync(0);
        }
        
        set({
          isPlaying: false,
          position: 0,
          showMiniPlayer: false,
        });
      },

      showMini: () => {
        set({ showMiniPlayer: true });
      },

      hideMini: () => {
        set({ showMiniPlayer: false });
      },

      expandFromMini: () => {
        // Called when user taps mini-player to return to full view
        // Sets pendingExpand flag so LibraryScreen knows to open the sheet
        set({ showMiniPlayer: false, pendingExpand: true });
      },

      clearPendingExpand: () => {
        set({ pendingExpand: false });
      },

      saveProgress: () => {
        const { currentContent, position, savedProgress } = get();
        if (!currentContent) return;
        
        set({
          savedProgress: {
            ...savedProgress,
            [currentContent.id]: {
              contentId: currentContent.id,
              position,
              lastUpdated: Date.now(),
            },
          },
        });
      },

      getSavedPosition: (contentId: string) => {
        const { savedProgress } = get();
        const progress = savedProgress[contentId];
        
        // Only return position if saved within last 7 days
        if (progress) {
          const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
          if (Date.now() - progress.lastUpdated < sevenDaysMs) {
            return progress.position;
          }
        }
        return 0;
      },

      clearSavedProgress: (contentId: string) => {
        const { savedProgress } = get();
        const updated = { ...savedProgress };
        delete updated[contentId];
        set({ savedProgress: updated });
      },

      unload: async () => {
        const { _sound, saveProgress } = get();
        saveProgress();
        
        if (_sound) {
          await _sound.unloadAsync();
        }
        
        set({
          _sound: null,
          currentContent: null,
          isLoaded: false,
          isPlaying: false,
          position: 0,
          duration: 0,
          showMiniPlayer: false,
        });
      },

      _onPlaybackStatusUpdate: (status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
          set({
            isLoaded: false,
            error: status.error || null,
          });
          return;
        }

        set({
          isLoaded: true,
          isPlaying: status.isPlaying,
          isBuffering: status.isBuffering,
          position: status.positionMillis,
          duration: status.durationMillis || 0,
        });

        // Auto-save progress periodically during playback
        if (status.isPlaying && status.positionMillis % 10000 < 500) {
          get().saveProgress();
        }

        // Handle completion
        if (status.didJustFinish && !status.isLooping) {
          const { currentContent, clearSavedProgress } = get();
          if (currentContent) {
            clearSavedProgress(currentContent.id);
          }
          set({ isPlaying: false, showMiniPlayer: false });
        }
      },
    }),
    {
      name: 'votive-audio-progress',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedProgress: state.savedProgress,
      }),
    }
  )
);

// Helper hook for formatted time
export function formatTime(millis: number): string {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
