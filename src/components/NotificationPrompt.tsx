import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useUserStore, useSettingsStore } from '../stores';
import { requestNotificationPermissions, scheduleDailyReminder } from '../lib';
import { useTheme, spacing, radius } from '../theme';

interface NotificationPromptProps {
  onDismiss: () => void;
}

export function NotificationPrompt({ onDismiss }: NotificationPromptProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [isRequesting, setIsRequesting] = useState(false);
  
  const { setDailyReminderEnabled, setNotificationPermissionGranted, reminderHour, reminderMinute } = useSettingsStore();

  async function handleEnable() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRequesting(true);
    
    try {
      const granted = await requestNotificationPermissions();
      
      if (granted) {
        setNotificationPermissionGranted(true);
        setDailyReminderEnabled(true);
        await scheduleDailyReminder(reminderHour, reminderMinute);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onDismiss();
      } else {
        Alert.alert(
          'Notifications Disabled',
          'You can enable notifications later in Settings.',
          [{ text: 'OK', onPress: onDismiss }]
        );
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      onDismiss();
    } finally {
      setIsRequesting(false);
    }
  }

  function handleDismiss() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  }

  return (
    <Animated.View 
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      <View style={styles.card}>
        <Ionicons name="notifications-outline" size={24} color={colors.accent.primary} style={styles.icon} />
        <Text style={styles.title}>A quiet reminder each day?</Text>
        <Text style={styles.subtitle}>We'll send a gentle nudge at 7am.</Text>
        
        <View style={styles.buttons}>
          <Pressable 
            style={styles.dismissButton} 
            onPress={handleDismiss}
            disabled={isRequesting}
          >
            <Text style={styles.dismissText}>Not now</Text>
          </Pressable>
          
          <Pressable 
            style={styles.enableButton} 
            onPress={handleEnable}
            disabled={isRequesting}
          >
            <Text style={styles.enableText}>
              {isRequesting ? 'Enabling...' : 'Yes, please'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      marginTop: spacing.lg,
    },
    card: {
      backgroundColor: colors.bg.elevated,
      borderRadius: radius.lg,
      padding: spacing.lg,
      alignItems: 'center',
    },
    icon: {
      marginBottom: spacing.sm,
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: 14,
      color: colors.text.muted,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    buttons: {
      flexDirection: 'row',
      width: '100%',
    },
    dismissButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    dismissText: {
      fontSize: 15,
      color: colors.text.muted,
    },
    enableButton: {
      flex: 1,
      backgroundColor: colors.accent.cta, // Orange for CTA
      paddingVertical: spacing.sm,
      borderRadius: radius.sm, // 8px per spec
      alignItems: 'center',
    },
    enableText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.inverse,
    },
  });
