import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { 
  ScreenShell, 
  Button,
  DisplayMd, 
  Body,
  BodyStrong,
  Caption,
} from '../components';
import { useSettingsStore, useUserStore, useTodayStore } from '../stores';
import { 
  api, 
  requestNotificationPermissions, 
  scheduleDailyReminder, 
  cancelDailyReminder,
  checkNotificationPermissions,
} from '../lib';
import { colors, spacing, radius } from '../theme';

// App version - update with each release
const APP_VERSION = '1.0.0';

export function SettingsScreen() {
  const navigation = useNavigation();
  const { signOut, getToken } = useAuth();
  const { user } = useUser();
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const { 
    dailyReminderEnabled, 
    reminderHour, 
    reminderMinute,
    notificationPermissionGranted,
    setDailyReminderEnabled,
    setReminderTime,
    setNotificationPermissionGranted,
  } = useSettingsStore();
  
  const { currentStreak } = useUserStore();
  const clearUser = useUserStore((state) => state.clearUser);
  const clearToday = useTodayStore((state) => state.clearToday);

  // Check notification permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  async function checkPermissions() {
    const granted = await checkNotificationPermissions();
    setNotificationPermissionGranted(granted);
  }

  async function handleToggleReminder(value: boolean) {
    if (value) {
      // Enabling - request permissions first
      const granted = await requestNotificationPermissions();
      setNotificationPermissionGranted(granted);
      
      if (!granted) {
        Alert.alert(
          'Notifications disabled',
          'Please enable notifications in your device settings to receive daily reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Schedule the notification
      await scheduleDailyReminder(reminderHour, reminderMinute);
      setDailyReminderEnabled(true);
    } else {
      // Disabling - cancel notifications
      await cancelDailyReminder();
      setDailyReminderEnabled(false);
    }
  }

  function handleTimePress() {
    setShowTimePicker(true);
  }

  async function handleTimeChange(event: DateTimePickerEvent, selectedDate?: Date) {
    setShowTimePicker(Platform.OS === 'ios');
    
    if (event.type === 'set' && selectedDate) {
      const hour = selectedDate.getHours();
      const minute = selectedDate.getMinutes();
      
      setReminderTime(hour, minute);
      
      // Reschedule notification with new time
      if (dailyReminderEnabled) {
        await scheduleDailyReminder(hour, minute);
      }
    }
  }

  function handleSignOut() {
    Alert.alert(
      'Sign out?',
      'You\'ll need to sign in again next time.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await cancelDailyReminder();
            await signOut();
            clearUser();
            clearToday();
          },
        },
      ]
    );
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete account?',
      'This will permanently delete your account, prayer history, and reflections. This can\'t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              if (token) {
                await api.deleteUser(token);
              }
              await cancelDailyReminder();
              await signOut();
              clearUser();
              clearToday();
            } catch (error) {
              Alert.alert('Error', 'Something went wrong. Please try again.');
            }
          },
        },
      ]
    );
  }

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  // Create a Date object for the time picker
  const timePickerDate = new Date();
  timePickerDate.setHours(reminderHour);
  timePickerDate.setMinutes(reminderMinute);

  return (
    <ScreenShell>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <DisplayMd>Settings</DisplayMd>
      </View>

      {/* Account Section */}
      <Caption color="muted" style={styles.sectionLabel}>Account</Caption>
      <View style={styles.section}>
        <View style={styles.row}>
          <BodyStrong>Email</BodyStrong>
          <Body color="secondary" numberOfLines={1} style={styles.emailText}>
            {user?.emailAddresses[0]?.emailAddress || '—'}
          </Body>
        </View>
        {currentStreak > 0 && (
          <View style={[styles.row, styles.rowBorder]}>
            <BodyStrong>Current streak</BodyStrong>
            <Body color="secondary">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </Body>
          </View>
        )}
      </View>

      {/* Notifications Section */}
      <Caption color="muted" style={styles.sectionLabel}>Notifications</Caption>
      <View style={styles.section}>
        <View style={styles.row}>
          <BodyStrong>Daily reminder</BodyStrong>
          <Switch
            value={dailyReminderEnabled}
            onValueChange={handleToggleReminder}
            trackColor={{ 
              false: colors.border.subtle, 
              true: colors.brand.primarySoft 
            }}
            thumbColor={dailyReminderEnabled ? colors.brand.primary : '#f4f3f4'}
          />
        </View>
        
        {dailyReminderEnabled && (
          <TouchableOpacity 
            style={[styles.row, styles.rowBorder]}
            onPress={handleTimePress}
          >
            <BodyStrong>Reminder time</BodyStrong>
            <View style={styles.timeRow}>
              <Body color="secondary">{formatTime(reminderHour, reminderMinute)}</Body>
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color={colors.text.muted} 
                style={styles.chevron}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={timePickerDate}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}

      {/* Actions Section */}
      <View style={styles.actions}>
        <Button
          title="Sign Out"
          variant="ghost"
          destructive
          onPress={handleSignOut}
        />
        <Button
          title="Delete Account"
          variant="ghost"
          destructive
          onPress={handleDeleteAccount}
        />
      </View>

      {/* Version Footer */}
      <Caption color="muted" style={styles.version}>
        Version {APP_VERSION}
      </Caption>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  backButton: {
    marginRight: spacing.lg,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  section: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.md,
    marginBottom: spacing['2xl'],
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  emailText: {
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.lg,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: spacing.xs,
  },
  actions: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  version: {
    textAlign: 'center',
    marginTop: spacing['3xl'],
  },
});
