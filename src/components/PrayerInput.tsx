import React, { useState, useRef } from 'react';
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
  SlideInDown,
} from 'react-native-reanimated';

import { usePrayerStore } from '../stores';
import { useTheme, spacing, radius } from '../theme';

interface PrayerInputProps {
  readingId?: string | null;
  readingDate?: string | null;
}

type InputState = 'input' | 'saving' | 'saved';

export function PrayerInput({ readingId, readingDate }: PrayerInputProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [prayerText, setPrayerText] = useState('');
  const [inputState, setInputState] = useState<InputState>('input');
  const inputRef = useRef<TextInput>(null);
  
  const { addPrayer, getTodaysPrayers } = usePrayerStore();
  
  // Check if user already prayed today
  const todaysPrayers = getTodaysPrayers();
  const hasPrayedToday = todaysPrayers.length > 0;
  
  const canSave = prayerText.trim().length > 0;

  async function handleSave() {
    if (!canSave) return;
    
    Keyboard.dismiss();
    setInputState('saving');
    
    try {
      await addPrayer(prayerText, readingId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setInputState('saved');
    } catch (error) {
      console.error('Failed to save prayer:', error);
      setInputState('input');
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

  function handleWriteAnother() {
    setPrayerText('');
    setInputState('input');
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // ============================================
  // SAVED STATE
  // ============================================
  if (inputState === 'saved') {
    return (
      <Animated.View 
        entering={FadeIn.duration(400)} 
        style={styles.container}
      >
        <View style={styles.savedContainer}>
          <Text style={styles.amenText}>Amen.</Text>
          
          <Pressable style={styles.shareLink} onPress={handleShare}>
            <Text style={styles.shareLinkText}>
              Let someone know you prayed for them
            </Text>
            <Ionicons name="arrow-forward" size={16} color={colors.accent} />
          </Pressable>
          
          <Pressable style={styles.writeAnotherLink} onPress={handleWriteAnother}>
            <Text style={styles.writeAnotherText}>Write another prayer</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  // ============================================
  // INPUT STATE
  // ============================================
  return (
    <Animated.View 
      entering={SlideInDown.duration(400).springify()} 
      style={styles.container}
    >
      <View style={styles.inputContainer}>
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
          editable={inputState === 'input'}
        />
        
        <View style={styles.inputFooter}>
          {hasPrayedToday && (
            <Text style={styles.prayedTodayHint}>
              You've prayed {todaysPrayers.length} time{todaysPrayers.length > 1 ? 's' : ''} today
            </Text>
          )}
          
          <Pressable
            style={[
              styles.saveButton,
              !canSave && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!canSave || inputState === 'saving'}
          >
            {inputState === 'saving' ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Amen</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

// ============================================
// STYLES
// ============================================

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: spacing.lg,
      marginTop: spacing.xl,
    },
    
    // Input state
    inputContainer: {
      backgroundColor: colors.bg.elevated,
      borderRadius: radius.lg,
      padding: spacing.md,
      minHeight: 140,
    },
    textInput: {
      flex: 1,
      fontSize: 17,
      lineHeight: 24,
      color: colors.text.primary,
      minHeight: 80,
      paddingTop: 0,
    },
    inputFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    prayedTodayHint: {
      fontSize: 13,
      color: colors.text.muted,
      flex: 1,
    },
    saveButton: {
      backgroundColor: colors.accent,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      minWidth: 80,
      alignItems: 'center',
    },
    saveButtonDisabled: {
      backgroundColor: colors.bg.subtle,
    },
    saveButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    
    // Saved state
    savedContainer: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
    amenText: {
      fontSize: 28,
      fontWeight: '600',
      fontStyle: 'italic',
      color: colors.text.primary,
      marginBottom: spacing.lg,
    },
    shareLink: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    shareLinkText: {
      fontSize: 15,
      color: colors.accent,
      marginRight: spacing.xs,
    },
    writeAnotherLink: {
      paddingVertical: spacing.md,
      marginTop: spacing.sm,
    },
    writeAnotherText: {
      fontSize: 15,
      color: colors.text.muted,
    },
  });
