import React from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { 
  ScreenShell, 
  Button,
  DisplayMd, 
  Body,
  BodyStrong,
  Caption,
} from '../components';
import { useSettingsStore, useUserStore, useTodayStore } from '../stores';
import { api } from '../lib';
import { colors, spacing, radius } from '../theme';

// App version - update with each release
const APP_VERSION = '1.0.0';

export function SettingsScreen() {
  const navigation = useNavigation();
  const { signOut, getToken } = useAuth();
  const { user } = useUser();
  const { 
    dailyReminderEnabled, 
    reminderHour, 
    reminderMinute,
    setDailyReminderEnabled 
  } = useSettingsStore();
  const clearUser = useUserStore((state) => state.clearUser);
  const clearToday = useTodayStore((state) => state.clearToday);

  const handleToggleReminder = (value: boolean) => {
    // TODO: Handle notification permissions and scheduling
    setDailyReminderEnabled(value);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign out?',
      'You\'ll need to sign in again next time.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            clearUser();
            clearToday();
            // Navigation handled by auth state change
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
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
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

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
          <Body color="secondary">{user?.emailAddresses[0]?.emailAddress}</Body>
        </View>
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
          <TouchableOpacity style={[styles.row, styles.rowBorder]}>
            <BodyStrong>Reminder time</BodyStrong>
            <Body color="secondary">{formatTime(reminderHour, reminderMinute)}</Body>
          </TouchableOpacity>
        )}
      </View>

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
  actions: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  version: {
    textAlign: 'center',
    marginTop: spacing['3xl'],
  },
});
