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
  SlideInUp,
  SlideOutDown,
} from 'react-native-reanimated';

import { usePrayerStore, useUserStore } from '../stores';
import { useTheme, spacing, radius } from '../theme';

interface PrayerInputProps {
  readingId?: string | null;
  readingDate?: string | null;
}

export function PrayerInput({ readingId }: PrayerInputProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [prayerText, setPrayerText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isFirstPrayer, setIsFirstPrayer] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  const { addPrayer } = usePrayerStore();
  const { 
    hasCompletedFirstPrayer, 
    setHasCompletedFirstPrayer,
    hasSeenSaveMessage,
    setHasSeenSaveMessage,
  } = useUserStore();
  
  const canSave = prayerText.trim().length > 0;

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
        setIsFirstPrayer(false);
        setShowSaveMessage(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  async function handleSave() {
    if (!canSave) return;
    
    Keyboard.dismiss();
    setIsSaving(true);
    
    // Check if this is the first prayer before saving
    const willBeFirstPrayer = !hasCompletedFirstPrayer;
    const shouldShowSaveMessage = !hasSeenSaveMessage;
    
    try {
      await addPrayer(prayerText, readingId);
      
      // Hold for a moment, then show toast and clear
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPrayerText('');
        setIsSaving(false);
        
        // Set first prayer state for toast message
        if (willBeFirstPrayer) {
          setIsFirstPrayer(true);
          setHasCompletedFirstPrayer(true);
        }
        
        // Show one-time save message
        if (shouldShowSaveMessage) {
          setShowSaveMessage(true);
          setHasSeenSaveMessage(true);
        }
        
        setShowToast(true);
      }, 800);
    } catch (error) {
      console.error('Failed to save prayer:', error);
      setIsSaving(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  async function handleShare() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowToast(false);
    
    try {
      await Share.share({
        message: 'You were on my heart today. 🙏',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }

  // Get the appropriate toast message
  const getToastMessage = () => {
    if (isFirstPrayer) {
      return 'Your first prayer. Welcome. 🙏';
    }
    return 'Amen. 🙏';
  };

  return (
    <View style={styles.container}>
      {/* Input Card */}
      <View style={styles.inputCard}>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          placeholder="What's on your heart today?"
          placeholderTextColor={colors.text.muted}
          value={prayerText}
          onChangeText={setPrayerText}
          multiline
          textAlignVertical="top"
          returnKeyType="default"
          blurOnSubmit={false}
          editable={!isSaving}
        />
        
        <View style={styles.inputFooter}>
          <View style={styles.spacer} />
          
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
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[
                styles.amenButtonText,
                !canSave && styles.amenButtonTextDisabled,
              ]}>
                Amen
              </Text>
            )}
          </Pressable>
        </View>
      </View>
      
      {/* Soft Copy */}
      <Text style={styles.softCopy}>
        A prayer, a thought, or nothing at all.
      </Text>

      {/* Toast */}
      {showToast && (
        <Animated.View 
          entering={SlideInUp.duration(300).springify()}
          exiting={SlideOutDown.duration(200)}
          style={styles.toast}
        >
          <View style={styles.toastContent}>
            <Text style={styles.toastText}>{getToastMessage()}</Text>
            {showSaveMessage && (
              <Text style={styles.toastSubtext}>Saved to Prayers. Only on this device.</Text>
            )}
          </View>
          <Pressable style={styles.toastShareButton} onPress={handleShare}>
            <Text style={styles.toastShareText}>Share</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.accent} />
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    
    // Input Card
    inputCard: {
      backgroundColor: colors.bg.elevated,
      borderRadius: radius.lg,
      padding: spacing.md,
      minHeight: 160,
    },
    textInput: {
      flex: 1,
      fontSize: 17,
      lineHeight: 24,
      color: colors.text.primary,
      minHeight: 100,
      paddingTop: 0,
    },
    inputFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    spacer: {
      flex: 1,
    },
    amenButton: {
      backgroundColor: colors.accent,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.md,
      minWidth: 90,
      alignItems: 'center',
    },
    amenButtonDisabled: {
      backgroundColor: colors.bg.subtle,
    },
    amenButtonSaving: {
      backgroundColor: colors.accent,
      opacity: 0.8,
    },
    amenButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    amenButtonTextDisabled: {
      color: colors.text.muted,
    },
    
    // Soft Copy
    softCopy: {
      fontSize: 14,
      color: colors.text.muted,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
    },

    // Toast
    toast: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.bg.elevated,
      borderRadius: radius.lg,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    toastContent: {
      flex: 1,
    },
    toastText: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text.primary,
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
      paddingHorizontal: spacing.sm,
    },
    toastShareText: {
      fontSize: 15,
      color: colors.accent,
      fontWeight: '500',
      marginRight: spacing.xs,
    },
  });
