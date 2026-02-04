import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore, useTodayStore } from '../stores';
import { cancelDailyReminder } from '../lib';
import { useTheme, spacing, radius } from '../theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface DrawerItemProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  isActive?: boolean;
  destructive?: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}

function DrawerItem({ icon, label, onPress, isActive, destructive, colors }: DrawerItemProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.drawerItem,
        isActive && { backgroundColor: colors.accentSoft },
      ]} 
      onPress={onPress}
    >
      <Ionicons 
        name={icon} 
        size={22} 
        color={destructive ? '#B5564A' : (isActive ? colors.accent : colors.text.secondary)} 
      />
      <Text 
        style={[
          styles.drawerItemLabel,
          { color: destructive ? '#B5564A' : (isActive ? colors.accent : colors.text.primary) },
          isActive && { fontWeight: '600' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function DrawerContent(props: DrawerContentComponentProps) {
  const { navigation, state } = props;
  const { colors } = useTheme();
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

  const dynamicStyles = createDynamicStyles(colors);

  return (
    <View style={[dynamicStyles.container, { paddingTop: insets.top }]}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.avatarText, { color: colors.accent }]}>{userInitial}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.email, { color: colors.text.primary }]} numberOfLines={1}>{userEmail}</Text>
            {currentStreak > 0 && (
              <Text style={[styles.streakText, { color: colors.text.muted }]}>
                🔥 {currentStreak} day streak
              </Text>
            )}
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Navigation Items */}
        <View style={styles.nav}>
          <DrawerItem
            icon="today-outline"
            label="Today"
            isActive={currentRoute === 'Today'}
            onPress={() => navigation.navigate('Today')}
            colors={colors}
          />
          <DrawerItem
            icon="time-outline"
            label="History"
            isActive={currentRoute === 'History'}
            onPress={() => navigation.navigate('History')}
            colors={colors}
          />
          <DrawerItem
            icon="settings-outline"
            label="Settings"
            isActive={currentRoute === 'Settings'}
            onPress={() => navigation.navigate('Settings')}
            colors={colors}
          />
          <DrawerItem
            icon="person-outline"
            label="Profile"
            isActive={currentRoute === 'Profile'}
            onPress={() => navigation.navigate('Profile')}
            colors={colors}
          />
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Sign Out */}
        <View style={styles.nav}>
          <DrawerItem
            icon="log-out-outline"
            label="Sign Out"
            destructive
            onPress={handleSignOut}
            colors={colors}
          />
        </View>
      </DrawerContentScrollView>

      {/* Version Footer */}
      <Text style={[styles.version, { color: colors.text.muted, paddingBottom: insets.bottom + spacing.lg }]}>
        Version 1.0.0
      </Text>
    </View>
  );
}

const createDynamicStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.surface,
  },
});

const styles = StyleSheet.create({
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  email: {
    fontSize: 16,
    marginBottom: 2,
  },
  streakText: {
    fontSize: 13,
  },
  divider: {
    height: 1,
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
  drawerItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: spacing.lg,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    paddingVertical: spacing.lg,
  },
});
