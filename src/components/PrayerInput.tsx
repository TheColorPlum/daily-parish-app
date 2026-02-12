import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Share,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

import { usePrayerStore, useUserStore, MilestoneType } from '../stores';
import { 
  useTheme, 
  spacing, 
  radius, 
  timing,
  toastTiming,
  shadow,
  touchTargets,
} from '../theme';

interface PrayerInputProps {
  readingId?: string | null;
  readingDate?: string | null;
}

// Milestone toast messages (from product spec)
const MILESTONE_MESSAGES: Record<MilestoneType, string> = {
  '1_day': 'Your first prayer. Welcome. 🙏',
  '2_days': 'You came back.',
  '1_week': 'A week of showing up.',
  '2_weeks': 'Two weeks. The rhythm is yours.',
  '1_month': 'One month. This is becoming practice.',
  '6_months': 'Six months. You stayed.',
  '1_year': 'A year. 🙏',
};

export function PrayerInput({ readingId }: PrayerInputProps) {
  const { colors } = useTheme();
  
  const [prayerText, setPrayerText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Saved.');
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [isMilestoneToast, setIsMilestoneToast] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  const { addPrayer, getUnseenMilestone, markMilestoneSeen } = usePrayerStore();
  const { 
    hasSeenSaveMessage,
    setHasSeenSaveMessage,
  } = useUserStore();
  
  const canSave = prayerText.trim().length > 0;

  // Toast animation values
  const toastOpacity = useSharedValue(0);
  const toastTranslateY = useSharedValue(20);
  const toastScale = useSharedValue(1);

  // Auto-hide toast after delay
  useEffect(() => {
    if (showToast) {
      const holdTime = isMilestoneToast 
        ? toastTiming.milestone.hold 
        : toastTiming.standard.hold;
      const fadeOutTime = isMilestoneToast
        ? toastTiming.milestone.fadeOut
        : toastTiming.standard.fadeOut;

      const timer = setTimeout(() => {
        // Animate out
        toastOpacity.value = withTiming(0, { 
          duration: fadeOutTime,
          easing: Easing.in(Easing.ease),
        });
        toastTranslateY.value = withTiming(20, { 
          duration: fadeOutTime,
          easing: Easing.in(Easing.ease),
        });
        
        // Clean up state after animation
        setTimeout(() => {
          setShowToast(false);
          setShowSaveMessage(false);
          setIsMilestoneToast(false);
        }, fadeOutTime);
      }, holdTime);
      
      return () => clearTimeout(timer);
    }
  }, [showToast, isMilestoneToast]);

  function showToastWithAnimation(isMilestone: boolean) {
    const fadeInTime = isMilestone
      ? toastTiming.milestone.fadeIn
      : toastTiming.standard.fadeIn;

    // Reset values
    toastOpacity.value = 0;
    toastTranslateY.value = 20;
    toastScale.value = 1;

    // Animate in
    toastOpacity.value = withTiming(1, { 
      duration: fadeInTime,
      easing: Easing.out(Easing.ease),
    });
    toastTranslateY.value = withTiming(0, { 
      duration: fadeInTime,
      easing: Easing.out(Easing.ease),
    });

    // Milestone pulse: 1.0 → 1.02 → 1.0
    if (isMilestone) {
      toastScale.value = withSequence(
        withTiming(1.02, { duration: 200, easing: Easing.out(Easing.ease) }),
        withTiming(1.02, { duration: 200 }), // hold
        withTiming(1, { duration: 200, easing: Easing.in(Easing.ease) })
      );
    }

    setShowToast(true);
  }

  const toastAnimatedStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
    transform: [
      { translateY: toastTranslateY.value },
      { scale: toastScale.value },
    ],
  }));

  async function handleSave() {
    if (!canSave) return;
    
    Keyboard.dismiss();
    setIsSaving(true);
    
    const shouldShowSaveMessage = !hasSeenSaveMessage;
    
    try {
      await addPrayer(prayerText, readingId);
      
      // Check for milestone after saving
      const milestone = getUnseenMilestone();
      
      // Hold for breath moment, then show toast
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPrayerText('');
        setIsSaving(false);
        
        // Set toast message based on milestone
        if (milestone) {
          setToastMessage(MILESTONE_MESSAGES[milestone.type]);
          setIsMilestoneToast(true);
          markMilestoneSeen(milestone.type);
          showToastWithAnimation(true);
        } else {
          setToastMessage('Saved.');
          setIsMilestoneToast(false);
          showToastWithAnimation(false);
        }
        
        // Show one-time save message (only on first prayer, not milestones)
        if (shouldShowSaveMessage && !milestone) {
          setShowSaveMessage(true);
          setHasSeenSaveMessage(true);
        }
      }, timing.breath); // 1500ms hold
    } catch (error) {
      console.error('Failed to save prayer:', error);
      setIsSaving(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  async function handleShare() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await Share.share({
        message: 'You were on my heart today. 🙏',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }

  const styles = createStyles(colors, isFocused, canSave);

  return (
    <View style={styles.container}>
      {/* Input Area */}
      <View style={styles.inputWrapper}>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          placeholder="What's on your heart today?"
          placeholderTextColor={colors.text.muted}
          value={prayerText}
          onChangeText={setPrayerText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline
          textAlignVertical="top"
          returnKeyType="default"
          blurOnSubmit={false}
          editable={!isSaving}
        />
      </View>
      
      {/* Amen Button - Full Width */}
      <Pressable
        style={[
          styles.amenButton,
          !canSave && styles.amenButtonDisabled,
          isSaving && styles.amenButtonSaving,
        ]}
        onPress={handleSave}
        disabled={!canSave || isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={colors.text.inverse} />
        ) : (
          <Text style={styles.amenButtonText}>
            Amen
          </Text>
        )}
      </Pressable>
      
      {/* Soft Copy */}
      <Text style={styles.softCopy}>
        A prayer, a thought, or nothing at all.
      </Text>

      {/* Toast */}
      {showToast && (
        <Animated.View style={[styles.toast, toastAnimatedStyle]}>
          <View style={styles.toastContent}>
            <Text style={[
              styles.toastText, 
              isMilestoneToast && styles.toastTextMilestone
            ]}>
              {toastMessage}
            </Text>
            {showSaveMessage && (
              <Text style={styles.toastSubtext}>
                Saved to Prayers. Only on this device.
              </Text>
            )}
          </View>
          {!isMilestoneToast && (
            <Pressable 
              style={styles.toastShareButton} 
              onPress={handleShare}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.toastShareText}>Share</Text>
              <Ionicons 
                name="arrow-forward" 
                size={14} 
                color={colors.accent.primary} 
              />
            </Pressable>
          )}
        </Animated.View>
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const createStyles = (
  colors: ReturnType<typeof useTheme>['colors'],
  isFocused: boolean,
  hasText: boolean
) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    
    // Input wrapper with border states
    inputWrapper: {
      backgroundColor: colors.bg.elevated,
      borderRadius: radius.md, // 12px
      borderWidth: isFocused ? 2 : 1,
      borderColor: isFocused ? colors.accent.cta : colors.border,
      minHeight: 120,
      padding: spacing.md, // 16px
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      lineHeight: 24,
      color: colors.text.primary,
      minHeight: 88, // 120 - 32 (padding)
      paddingTop: 0,
      paddingBottom: 0,
    },
    
    // Amen Button - Full width below input
    amenButton: {
      backgroundColor: colors.accent.cta, // Orange
      height: 52,
      borderRadius: radius.sm, // 8px
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.sm, // 8px
    },
    amenButtonDisabled: {
      opacity: 0.4,
    },
    amenButtonSaving: {
      opacity: 0.8,
    },
    amenButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.inverse,
    },
    
    // Soft Copy
    softCopy: {
      fontSize: 14,
      color: colors.text.muted,
      textAlign: 'center',
      marginTop: spacing.md, // 16px
    },

    // Toast - positioned above TabBar
    toast: {
      position: 'absolute',
      bottom: -80, // Position above TabBar
      left: 0,
      right: 0,
      backgroundColor: colors.bg.elevated,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...shadow.medium,
    },
    toastContent: {
      flex: 1,
    },
    toastText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text.primary,
    },
    toastTextMilestone: {
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '600',
    },
    toastSubtext: {
      fontSize: 13,
      color: colors.text.muted,
      marginTop: 2,
    },
    toastShareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.xs,
      paddingLeft: spacing.sm,
      minHeight: touchTargets.minimum, // 44px touch target
    },
    toastShareText: {
      fontSize: 15,
      color: colors.accent.primary, // Green for links
      fontWeight: '500',
      marginRight: spacing.xs,
    },
  });
