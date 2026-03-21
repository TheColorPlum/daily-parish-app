/**
 * MiniPlayer
 * 
 * Sticky bar that appears above the tab bar when user navigates away from playing audio.
 * Shows: play/pause, title, progress, close.
 * Tap anywhere → expands back to full playback modal.
 * ✕ stops audio but persists playback position.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAudioStore, formatTime } from '../stores/audioStore';
import { v4Colors, v4Typography, v4Spacing, v4Border, v4IconSize } from '../theme/v4tokens';

interface MiniPlayerProps {
  onExpand?: () => void;
}

export function MiniPlayer({ onExpand }: MiniPlayerProps) {
  const insets = useSafeAreaInsets();
  const {
    currentContent,
    isPlaying,
    isBuffering,
    position,
    duration,
    showMiniPlayer,
    togglePlayback,
    stop,
    saveProgress,
  } = useAudioStore();

  if (!showMiniPlayer || !currentContent) {
    return null;
  }

  const handlePlayPause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await togglePlayback();
  };

  const handleClose = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    saveProgress(); // Persist position before stopping
    await stop();
  };

  const handleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onExpand?.();
  };

  const formattedPosition = formatTime(position);
  const formattedDuration = formatTime(duration);
  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      exiting={FadeOutDown.duration(200)}
      style={[
        styles.container,
        { bottom: 56 + insets.bottom }, // Position above tab bar
      ]}
    >
      {/* Progress bar at top */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <Pressable style={styles.content} onPress={handleExpand}>
        {/* Play/Pause Button */}
        <Pressable style={styles.playButton} onPress={handlePlayPause}>
          {isBuffering ? (
            <ActivityIndicator size="small" color={v4Colors.ink.primary} />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={v4IconSize.md}
              color={v4Colors.ink.primary}
              style={!isPlaying && styles.playIconOffset}
            />
          )}
        </Pressable>

        {/* Title and Progress */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentContent.title}
          </Text>
          <Text style={styles.duration}>
            {formattedPosition} / {formattedDuration}
          </Text>
        </View>

        {/* Close Button */}
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={v4IconSize.md} color={v4Colors.ink.muted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: v4Colors.bg.parchment,
    borderTopWidth: v4Border.width,
    borderBottomWidth: v4Border.width,
    borderColor: v4Border.color,
  },
  progressTrack: {
    height: 1,
    backgroundColor: v4Colors.border.rule,
  },
  progressFill: {
    height: 2,
    backgroundColor: v4Colors.accent.flame,
    marginTop: -0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: v4Spacing.sm,
    paddingHorizontal: v4Spacing.md,
  },
  playButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconOffset: {
    marginLeft: 2,
  },
  info: {
    flex: 1,
    marginLeft: v4Spacing.sm,
    marginRight: v4Spacing.sm,
  },
  title: {
    ...v4Typography.button,
    color: v4Colors.ink.primary,
  },
  duration: {
    ...v4Typography.bodySmall,
    color: v4Colors.ink.muted,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
