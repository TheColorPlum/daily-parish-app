import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { 
  ScreenShell, 
  DisplayMd,
  Body,
  BodyStrong,
  Caption,
} from '../components';
import { useUserStore, useTodayStore } from '../stores';
import { api, cancelDailyReminder } from '../lib';
import { colors, spacing, radius } from '../theme';
import type { DrawerParamList } from '../navigation/AppNavigator';

export function ProfileScreen() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const { signOut, getToken } = useAuth();
  const { user } = useUser();
  
  const { currentStreak } = useUserStore();
  const clearUser = useUserStore((state) => state.clearUser);
  const clearToday = useTodayStore((state) => state.clearToday);

  const userEmail = user?.emailAddresses[0]?.emailAddress || '';
  const userInitial = userEmail.charAt(0).toUpperCase() || '?';

  async function handleSignOut() {
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
        
        <DisplayMd>Profile</DisplayMd>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <BodyStrong style={styles.avatarText}>{userInitial}</BodyStrong>
        </View>
        <Body style={styles.email}>{userEmail}</Body>
      </View>

      {/* Stats Section */}
      <Caption color="muted" style={styles.sectionLabel}>Your Journey</Caption>
      <View style={styles.section}>
        <View style={styles.row}>
          <BodyStrong>Current streak</BodyStrong>
          <Body color="secondary">
            {currentStreak > 0 ? `🔥 ${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}` : '—'}
          </Body>
        </View>
      </View>

      {/* Account Section */}
      <Caption color="muted" style={styles.sectionLabel}>Account</Caption>
      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={handleSignOut}>
          <BodyStrong>Sign Out</BodyStrong>
          <Ionicons name="log-out-outline" size={20} color={colors.text.muted} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={handleDeleteAccount}>
          <BodyStrong style={{ color: colors.accent.red }}>Delete Account</BodyStrong>
          <Ionicons name="trash-outline" size={20} color={colors.accent.red} />
        </TouchableOpacity>
      </View>
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
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brand.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarText: {
    color: colors.brand.primary,
    fontSize: 32,
  },
  email: {
    color: colors.text.secondary,
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
});
