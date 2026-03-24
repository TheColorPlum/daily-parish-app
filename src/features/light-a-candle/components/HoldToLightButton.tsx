import React, { useRef, useCallback } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme, spacing, radius, typography, timing } from '../../../theme';

const HOLD_DURATION = 1500; // 1.5 seconds

interface HoldToLightButtonProps {
  onLightCandle: () => void;
  disabled?: boolean;
}

export function HoldToLightButton({ onLightCandle, disabled = false }: HoldToLightButtonProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const progress = useSharedValue(0);
  const holdStartTime = useRef<number | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTriggered = useRef(false);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const triggerLight = useCallback(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;
    
    // Haptic moved to CandleAnimation (fires at 200ms into animation per spec)
    onLightCandle();
  }, [onLightCandle]);

  const handlePressIn = () => {
    if (disabled) return;
    
    hasTriggered.current = false;
    holdStartTime.current = Date.now();
    
    // Light haptic on hold start
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate progress
    progress.value = withTiming(1, {
      duration: HOLD_DURATION,
      easing: Easing.linear,
    });
    
    // Set timer to trigger at HOLD_DURATION
    holdTimer.current = setTimeout(() => {
      runOnJS(triggerLight)();
    }, HOLD_DURATION);
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    // Clear timer if released early
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    
    // Reset progress if not triggered
    if (!hasTriggered.current) {
      progress.value = withTiming(0, { duration: timing.fast });
    }
    
    holdStartTime.current = null;
  };

  return (
    <Pressable
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      {/* Progress fill background */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>
      
      {/* Button content */}
      <View style={styles.content}>
        <Text style={[styles.text, disabled && styles.textDisabled]}>
          Hold to Light 🕯️
        </Text>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    button: {
      height: 56,
      borderRadius: radius.pill,
      backgroundColor: colors.accent.cta,
      overflow: 'hidden',
      position: 'relative',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    progressContainer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent',
    },
    progressFill: {
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    content: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      ...typography.bodyStrong,
      color: colors.text.inverse,
      fontSize: 17,
    },
    textDisabled: {
      opacity: 0.7,
    },
  });
