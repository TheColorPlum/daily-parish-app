import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useUserStore, useTodayStore } from '../stores';
import { api, cancelDailyReminder } from '../lib';
import { useTheme, spacing, radius } from '../theme';
import type { DrawerParamList } from '../navigation/AppNavigator';

export function ProfileScreen() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const { colors } = useTheme();
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

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Ionicons name="menu" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userInitial}</Text>
        </View>
        <Text style={styles.email}>{userEmail}</Text>
      </View>

      {/* Stats Section */}
      <Text style={styles.sectionLabel}>Your Journey</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Current streak</Text>
          <Text style={styles.rowValue}>
            {currentStreak > 0 ? `🔥 ${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}` : '—'}
          </Text>
        </View>
      </View>

      {/* Account Section */}
      <Text style={styles.sectionLabel}>Account</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={handleSignOut}>
          <Text style={styles.rowLabel}>Sign Out</Text>
          <Ionicons name="log-out-outline" size={20} color={colors.text.muted} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={handleDeleteAccount}>
          <Text style={styles.destructiveText}>Delete Account</Text>
          <Ionicons name="trash-outline" size={20} color="#B5564A" />
        </TouchableOpacity>
      </View>
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
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.accent,
  },
  email: {
    fontSize: 16,
    color: colors.text.secondary,
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
  destructiveText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#B5564A',
  },
});
