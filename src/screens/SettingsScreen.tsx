import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useSettingsStore } from '../stores';
import { 
  requestNotificationPermissions, 
  scheduleDailyReminder, 
  cancelDailyReminder,
  checkNotificationPermissions,
} from '../lib';
import { useTheme, spacing, radius } from '../theme';

type ThemeMode = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
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
      
      await scheduleDailyReminder(reminderHour, reminderMinute);
      setDailyReminderEnabled(true);
    } else {
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

  const timePickerDate = new Date();
  timePickerDate.setHours(reminderHour);
  timePickerDate.setMinutes(reminderMinute);

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Appearance Section */}
      <Text style={styles.sectionLabel}>Appearance</Text>
      <View style={styles.section}>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.themeOption,
                mode === option.value && styles.themeOptionActive,
                index < THEME_OPTIONS.length - 1 && styles.themeOptionBorder,
              ]}
              onPress={() => setMode(option.value)}
            >
              <Text style={[
                styles.themeOptionText,
                mode === option.value && styles.themeOptionTextActive,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notifications Section */}
      <Text style={styles.sectionLabel}>Notifications</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Daily reminder</Text>
          <Switch
            value={dailyReminderEnabled}
            onValueChange={handleToggleReminder}
            trackColor={{ 
              false: colors.border, 
              true: colors.accentSoft 
            }}
            thumbColor={dailyReminderEnabled ? colors.accent : '#f4f3f4'}
          />
        </View>
        
        {dailyReminderEnabled && (
          <TouchableOpacity 
            style={[styles.row, styles.rowBorder]}
            onPress={handleTimePress}
          >
            <Text style={styles.rowLabel}>Reminder time</Text>
            <View style={styles.timeRow}>
              <Text style={styles.rowValue}>{formatTime(reminderHour, reminderMinute)}</Text>
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
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    paddingTop: spacing.md,
  },
  menuButton: {
    marginRight: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    borderTopColor: colors.border,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  rowValue: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: spacing.xs,
  },
  themeRow: {
    flexDirection: 'row',
  },
  themeOption: {
    flex: 1,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  themeOptionActive: {
    backgroundColor: colors.accentSoft,
  },
  themeOptionBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  themeOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  themeOptionTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
});
