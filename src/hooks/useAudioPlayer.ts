import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';

interface UseAudioPlayerOptions {
  onPlaybackComplete?: () => void;
}

interface AudioPlayerState {
  isLoaded: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  position: number; // milliseconds
  duration: number; // milliseconds
  error: string | null;
}

export function useAudioPlayer(options: UseAudioPlayerOptions = {}) {
  const { onPlaybackComplete } = options;
  const soundRef = useRef<Audio.Sound | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isLoaded: false,
    isPlaying: false,
    isBuffering: false,
    position: 0,
    duration: 0,
    error: null,
  });

  // Configure audio mode on mount
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    return () => {
      // Cleanup on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      setState(prev => ({
        ...prev,
        isLoaded: false,
        error: status.error || null,
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoaded: true,
      isPlaying: status.isPlaying,
      isBuffering: status.isBuffering,
      position: status.positionMillis,
      duration: status.durationMillis || 0,
      error: null,
    }));

    // Check for playback completion
    if (status.didJustFinish && !status.isLooping) {
      onPlaybackComplete?.();
    }
  }, [onPlaybackComplete]);

  const loadAudio = useCallback(async (url: string) => {
    try {
      // Unload any existing audio
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      setState(prev => ({ ...prev, isLoaded: false, error: null }));

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load audio',
      }));
    }
  }, [onPlaybackStatusUpdate]);

  const play = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
    }
  }, []);

  const pause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
    }
  }, []);

  const togglePlayback = useCallback(async () => {
    if (state.isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [state.isPlaying, play, pause]);

  const seekTo = useCallback(async (positionMillis: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(positionMillis);
    }
  }, []);

  const replay = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(0);
      await soundRef.current.playAsync();
    }
  }, []);

  // Format time helper
  const formatTime = useCallback((millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    isLoaded: state.isLoaded,
    isPlaying: state.isPlaying,
    isBuffering: state.isBuffering,
    position: state.position,
    duration: state.duration,
    error: state.error,
    
    // Computed
    progress: state.duration > 0 ? state.position / state.duration : 0,
    formattedPosition: formatTime(state.position),
    formattedDuration: formatTime(state.duration),
    
    // Actions
    loadAudio,
    play,
    pause,
    togglePlayback,
    seekTo,
    replay,
  };
}
