import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useNavigation, CommonActions } from '@react-navigation/native';

import { useTheme, spacing, radius, typography } from '../../theme';
import {
  CandleAnimation,
  CandleAnimationRef,
  MessagePreview,
  HoldToLightButton,
} from './components';
import { useCandleCount } from './hooks/useCandleCount';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Timing from spec
const CONFIRMATION_DURATION = 2200;
const CONFIRMATION_FADE_IN = 250;
const CONFIRMATION_FADE_OUT = 200;
const TRANSITION_TO_TODAY = 350;

type AnimationState = 'idle' | 'lighting' | 'sharing' | 'confirmed';

export function LightACandleScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const navigation = useNavigation();
  
  const candleRef = useRef<CandleAnimationRef>(null);
  const { incrementCandle } = useCandleCount();
  
  const [message, setMessage] = useState(MessagePreview.DEFAULT_MESSAGE);
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  
  // Confirmation animation
  const confirmationOpacity = useSharedValue(0);
  const confirmationScale = useSharedValue(0.95);

  const confirmationStyle = useAnimatedStyle(() => ({
    opacity: confirmationOpacity.value,
    transform: [{ scale: confirmationScale.value }],
  }));

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const showConfirmation = useCallback(() => {
    setAnimationState('confirmed');
    
    // Success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Animate in: fade + scale (0.95→1.0)
    confirmationOpacity.value = withTiming(1, {
      duration: CONFIRMATION_FADE_IN,
      easing: Easing.out(Easing.ease),
    });
    confirmationScale.value = withTiming(1, {
      duration: CONFIRMATION_FADE_IN,
      easing: Easing.out(Easing.ease),
    });
    
    // Auto-dismiss after CONFIRMATION_DURATION
    setTimeout(() => {
      dismissConfirmation();
    }, CONFIRMATION_DURATION);
  }, []);

  const dismissConfirmation = useCallback(() => {
    // Fade out
    confirmationOpacity.value = withTiming(0, {
      duration: CONFIRMATION_FADE_OUT,
      easing: Easing.inOut(Easing.ease),
    });
    
    // Navigate back after animation
    setTimeout(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // Fallback: reset to Main tab
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          })
        );
      }
    }, CONFIRMATION_FADE_OUT);
  }, [navigation]);

  const handleLightCandle = async () => {
    if (animationState !== 'idle') return;
    
    setAnimationState('lighting');
    
    // Play candle animation
    await candleRef.current?.playLightAnimation();
    
    // Increment candle count
    incrementCandle();
    
    // Show share sheet
    setAnimationState('sharing');
    
    const fullMessage = `${message}\n\n${MessagePreview.SIGNATURE}`;
    
    try {
      await Share.share({
        message: fullMessage,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
    
    // Show confirmation (regardless of share result)
    showConfirmation();
  };

  const handleConfirmationTap = () => {
    if (animationState === 'confirmed') {
      dismissConfirmation();
    }
  };

  const isButtonDisabled = animationState !== 'idle';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header with back button */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
        </Pressable>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Candle */}
        <View style={styles.candleSection}>
          <CandleAnimation ref={candleRef} />
        </View>

        {/* Message preview */}
        <View style={styles.messageSection}>
          <MessagePreview message={message} onMessageChange={setMessage} />
        </View>

        {/* Hold to light button */}
        <View style={styles.buttonSection}>
          <HoldToLightButton
            onLightCandle={handleLightCandle}
            disabled={isButtonDisabled}
          />
        </View>
      </View>

      {/* Confirmation overlay */}
      {animationState === 'confirmed' && (
        <Pressable
          style={styles.confirmationOverlay}
          onPress={handleConfirmationTap}
        >
          <Animated.View style={[styles.confirmationContent, confirmationStyle]}>
            <Text style={styles.confirmationText}>Your candle is lit 🕯️</Text>
            <Text style={styles.confirmationHint}>Tap to continue</Text>
          </Animated.View>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg.surface,
    },
    header: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
    },
    backButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    candleSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: SCREEN_HEIGHT * 0.35,
    },
    messageSection: {
      paddingVertical: spacing.lg,
    },
    buttonSection: {
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.lg,
    },

    // Confirmation overlay
    confirmationOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    confirmationContent: {
      backgroundColor: colors.bg.elevated,
      borderRadius: radius.xl,
      padding: spacing.xl,
      alignItems: 'center',
      marginHorizontal: spacing.xl,
    },
    confirmationText: {
      ...typography.displayMd,
      color: colors.text.primary,
      textAlign: 'center',
    },
    confirmationHint: {
      ...typography.caption,
      color: colors.text.muted,
      marginTop: spacing.md,
    },
  });
