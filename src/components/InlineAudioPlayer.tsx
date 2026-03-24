/**
 * InlineAudioPlayer
 * 
 * Unified audio player component used across Library (Rosary, Examen).
 * Follows V4 design: 0px radius, Cinzel fonts, 1px borders.
 * 
 * Resting state: ▶  Begin Rosary                              20 min
 * Playing state: ▐▐  4:32 / 20:00  ━━━━━━━━━●━━━━━━━━━━━━━━━━━━━
 * Error state:   ⚠  Unable to load audio. Tap to retry.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAudioStore, formatTime, AudioContent } from '../stores/audioStore';
import { v4Colors, v4Typography, v4Spacing, v4Progress } from '../theme/v4tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface InlineAudioPlayerProps {
  content: AudioContent;
  onPlaybackComplete?: () => void;
}

export function InlineAudioPlayer({ content, onPlaybackComplete }: InlineAudioPlayerProps) {
  const {
    currentContent,
    isPlaying,
    isLoaded,
    isBuffering,
    position,
    duration,
    error,
    loadContent,
    togglePlayback,
    seekTo,
  } = useAudioStore();

  const isThisContent = currentContent?.id === content.id;
  const isActive = isThisContent && isLoaded;
  const isCurrentlyPlaying = isActive && isPlaying;
  const hasError = isThisContent && error;
  
  // Track previous playing state for completion detection
  const wasPlayingRef = useRef(false);

  // Detect playback completion
  useEffect(() => {
    if (isActive && duration > 0) {
      // Check if we just finished playing (was playing, now stopped, at end)
      const isAtEnd = position >= duration - 500; // Within 500ms of end
      
      if (wasPlayingRef.current && !isPlaying && isAtEnd) {
        // Playback completed
        onPlaybackComplete?.();
      }
      
      wasPlayingRef.current = isPlaying;
    }
  }, [isPlaying, position, duration, isActive, onPlaybackComplete]);

  // Progress animation
  const progressBarWidth = SCREEN_WIDTH - v4Spacing.md * 4;
  const progress = useSharedValue(0);

  // Sync progress with playback
  useEffect(() => {
    if (isActive && duration > 0) {
      progress.value = withTiming((position / duration) * 100, { duration: 100 });
    }
  }, [position, duration, isActive]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    left: `${progress.value}%`,
  }));

  // Scrubbing gestures
  const scrubGesture = Gesture.Pan()
    .onStart(() => {
      if (isCurrentlyPlaying) {
        runOnJS(togglePlayback)();
      }
    })
    .onUpdate((event) => {
      const newProgress = Math.max(0, Math.min(100, (event.x / progressBarWidth) * 100));
      progress.value = newProgress;
    })
    .onEnd((event) => {
      const newProgress = Math.max(0, Math.min(100, (event.x / progressBarWidth) * 100));
      runOnJS(handleSeek)(newProgress / 100);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    });

  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      const newProgress = Math.max(0, Math.min(100, (event.x / progressBarWidth) * 100));
      progress.value = withTiming(newProgress, { duration: 200 });
      runOnJS(handleSeek)(newProgress / 100);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    });

  const combinedGesture = Gesture.Race(scrubGesture, tapGesture);

  function handleSeek(normalizedPosition: number) {
    const positionMs = normalizedPosition * duration;
    seekTo(positionMs);
  }

  async function handlePlayPause() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!isThisContent || hasError) {
      // Load this content and start playing (or retry on error)
      await loadContent(content, true);
    } else {
      await togglePlayback();
    }
  }

  const formattedDuration = content.duration
    ? formatTime(content.duration)
    : '~20 min';

  // Error state
  if (hasError) {
    return (
      <Pressable style={styles.container} onPress={handlePlayPause}>
        <View style={styles.errorRow}>
          <Ionicons
            name="alert-circle"
            size={16}
            color={v4Colors.accent.flame}
          />
          <Text style={styles.errorText}>Unable to load audio. Tap to retry.</Text>
        </View>
      </Pressable>
    );
  }

  // Resting state - not playing this content
  if (!isActive || (!isCurrentlyPlaying && position === 0)) {
    return (
      <Pressable style={styles.container} onPress={handlePlayPause}>
        <View style={styles.restingRow}>
          {isBuffering && isThisContent ? (
            <ActivityIndicator size="small" color={v4Colors.ink.primary} />
          ) : (
            <Ionicons
              name="play"
              size={16}
              color={v4Colors.ink.primary}
              style={styles.playIcon}
            />
          )}
          <Text style={styles.beginText}>Begin {content.title}</Text>
          <Text style={styles.durationText}>{formattedDuration}</Text>
        </View>
      </Pressable>
    );
  }

  // Active/Playing state - show progress bar
  return (
    <View style={styles.container}>
      <View style={styles.playingRow}>
        <Pressable onPress={handlePlayPause} style={styles.playPauseButton}>
          {isBuffering ? (
            <ActivityIndicator size="small" color={v4Colors.ink.primary} />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={16}
              color={v4Colors.ink.primary}
              style={!isPlaying && styles.playIcon}
            />
          )}
        </Pressable>

        <Text style={styles.timeText}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>

        <View style={styles.progressContainer}>
          <GestureDetector gesture={combinedGesture}>
            <View style={styles.progressTouchArea}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, progressStyle]} />
              </View>
              <Animated.View style={[styles.progressThumb, thumbStyle]} />
            </View>
          </GestureDetector>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: v4Spacing.sm,
  },
  restingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playIcon: {
    marginLeft: 2,
  },
  beginText: {
    ...v4Typography.button,
    color: v4Colors.ink.primary,
    marginLeft: v4Spacing.sm,
    flex: 1,
  },
  durationText: {
    ...v4Typography.bodySmall,
    color: v4Colors.ink.muted,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    ...v4Typography.bodySmall,
    color: v4Colors.accent.flame,
    marginLeft: v4Spacing.sm,
    flex: 1,
  },
  playingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    ...v4Typography.button,
    color: v4Colors.ink.primary,
    marginLeft: v4Spacing.xs,
    minWidth: 80,
  },
  progressContainer: {
    flex: 1,
    marginLeft: v4Spacing.sm,
  },
  progressTouchArea: {
    height: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  progressTrack: {
    height: v4Progress.trackHeight,
    backgroundColor: v4Colors.border.rule,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: v4Progress.fillHeight,
    backgroundColor: v4Colors.accent.flame,
    marginTop: -0.5,
  },
  progressThumb: {
    position: 'absolute',
    top: '50%',
    width: v4Progress.thumbSize,
    height: v4Progress.thumbSize,
    borderRadius: v4Progress.thumbSize / 2,
    backgroundColor: v4Colors.accent.flame,
    marginTop: -v4Progress.thumbSize / 2,
    marginLeft: -v4Progress.thumbSize / 2,
  },
});
