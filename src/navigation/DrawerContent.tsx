import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextStyle } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  DisplayMd, 
  Body, 
  BodyStrong,
  Caption,
} from '../components';
import { useUserStore, useTodayStore, useSettingsStore } from '../stores';
import { cancelDailyReminder } from '../lib';
import { colors, spacing, radius } from '../theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface DrawerItemProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  isActive?: boolean;
  destructive?: boolean;
}

function DrawerItem({ icon, label, onPress, isActive, destructive }: DrawerItemProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.drawerItem,
        isActive && styles.drawerItemActive,
      ]} 
      onPress={onPress}
    >
      <Ionicons 
        name={icon} 
        size={22} 
        color={destructive ? colors.accent.red : (isActive ? colors.brand.primary : colors.text.secondary)} 
      />
      <BodyStrong 
        style={StyleSheet.flatten([
          styles.drawerItemLabel,
          destructive && { color: colors.accent.red },
          isActive && { color: colors.brand.primary },
        ]) as TextStyle}
      >
        {label}
      </BodyStrong>
    </TouchableOpacity>
  );
}

export function DrawerContent(props: DrawerContentComponentProps) {
  const { navigation, state } = props;
  const { signOut } = useAuth();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  
  const { currentStreak } = useUserStore();
  const clearUser = useUserStore((state) => state.clearUser);
  const clearToday = useTodayStore((state) => state.clearToday);

  const currentRoute = state.routes[state.index]?.name;

  async function handleSignOut() {
    await cancelDailyReminder();
    await signOut();
    clearUser();
    clearToday();
  }

  const userEmail = user?.emailAddresses[0]?.emailAddress || '';
  const userInitial = userEmail.charAt(0).toUpperCase() || '?';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <BodyStrong style={styles.avatarText}>{userInitial}</BodyStrong>
          </View>
          <View style={styles.headerInfo}>
            <Body numberOfLines={1} style={styles.email}>{userEmail}</Body>
            {currentStreak > 0 && (
              <Caption color="muted">
                🔥 {currentStreak} day streak
              </Caption>
            )}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Navigation Items */}
        <View style={styles.nav}>
          <DrawerItem
            icon="today-outline"
            label="Today"
            isActive={currentRoute === 'Today'}
            onPress={() => navigation.navigate('Today')}
          />
          <DrawerItem
            icon="time-outline"
            label="History"
            isActive={currentRoute === 'History'}
            onPress={() => navigation.navigate('History')}
          />
          <DrawerItem
            icon="settings-outline"
            label="Settings"
            isActive={currentRoute === 'Settings'}
            onPress={() => navigation.navigate('Settings')}
          />
          <DrawerItem
            icon="person-outline"
            label="Profile"
            isActive={currentRoute === 'Profile'}
            onPress={() => navigation.navigate('Profile')}
          />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Sign Out */}
        <View style={styles.nav}>
          <DrawerItem
            icon="log-out-outline"
            label="Sign Out"
            destructive
            onPress={handleSignOut}
          />
        </View>
      </DrawerContentScrollView>

      {/* Version Footer */}
      <Caption color="muted" style={StyleSheet.flatten([styles.version, { paddingBottom: insets.bottom + spacing.lg }])}>
        Version 1.0.0
      </Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.surface,
  },
  scrollContent: {
    paddingTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.brand.primary,
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  email: {
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.md,
  },
  nav: {
    paddingHorizontal: spacing.lg,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  drawerItemActive: {
    backgroundColor: colors.brand.primarySoft,
  },
  drawerItemLabel: {
    marginLeft: spacing.lg,
  },
  version: {
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
