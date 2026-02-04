import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { 
  ScreenShell, 
  DisplayMd, 
  Body,
  BodyStrong,
  Caption,
} from '../components';
import { useSettingsStore } from '../stores';
import { 
  requestNotificationPermissions, 
  scheduleDailyReminder, 
  cancelDailyReminder,
  checkNotificationPermissions,
} from '../lib';
import { colors, spacing, radius } from '../theme';

export function SettingsScreen() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
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
          style={styles.menuButton}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Ionicons name="menu" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <DisplayMd>Settings</DisplayMd>
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
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  menuButton: {
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: spacing.xs,
  },
});
