import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Reacticx Components
import { CircularProgress } from '../shared/ui/organisms/circular-progress';
import { RollingCounter } from '../shared/ui/organisms/rolling-counter';
// GooeySwitch requires dev build (Skia + Worklets) - using native Switch for now

// Daily Parish Design Tokens
const colors = {
  bg: {
    surface: '#FAF9F6',
    surfaceAlt: '#F1EEE6',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#212121',
    secondary: '#4A4A4A',
    muted: '#777777',
  },
  brand: {
    primary: '#2D5A3F',
    primaryLight: '#3E7A56',
    primarySoft: '#E4EFE8',
  },
  accent: {
    gold: '#C89B3C',
    goldSoft: '#F5EED9',
  },
  border: {
    subtle: '#E2DED2',
  },
};

export function ComponentDemo() {
  const navigation = useNavigation();
  
  // Circular Progress - reading progress
  const readingProgress = useSharedValue(0);
  const [progressValue, setProgressValue] = useState(0);

  // Rolling Counter - streak counter
  const streakCount = useSharedValue(7);
  const [streak, setStreak] = useState(7);

  // Gooey Switch - settings toggle
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Demo controls
  const incrementProgress = () => {
    const newValue = Math.min(progressValue + 20, 100);
    setProgressValue(newValue);
    readingProgress.value = withTiming(newValue, { duration: 500 });
  };

  const incrementStreak = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    streakCount.value = newStreak;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.title}>Component Demo</Text>
        </View>
        <Text style={styles.subtitle}>Reacticx UI with Daily Parish palette</Text>

        {/* Circular Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading Progress</Text>
          <Text style={styles.sectionDesc}>Tap the circle to increase</Text>
          
          <View style={styles.progressContainer}>
            <CircularProgress
              progress={readingProgress}
              size={120}
              strokeWidth={8}
              outerCircleColor={colors.border.subtle}
              progressCircleColor={colors.brand.primary}
              backgroundColor={colors.brand.primarySoft}
              onPress={incrementProgress}
              renderIcon={() => (
                <Text style={styles.progressText}>{progressValue}%</Text>
              )}
            />
          </View>
        </View>

        {/* Rolling Counter - Streak */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Day Streak</Text>
          <Text style={styles.sectionDesc}>Tap the number to add a day</Text>
          
          <View style={styles.streakContainer}>
            <Pressable onPress={incrementStreak} style={styles.streakBadge}>
              <RollingCounter
                value={streakCount}
                height={48}
                width={32}
                fontSize={36}
                color={colors.accent.gold}
              />
              <Text style={styles.streakLabel}>days 🔥</Text>
            </Pressable>
          </View>
        </View>

        {/* Settings Switches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <Text style={styles.sectionDesc}>Native switches with Daily Parish colors</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Daily Reminders</Text>
              <Text style={styles.settingDesc}>
                {notificationsEnabled ? 'On at 7:00 AM' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border.subtle, true: colors.brand.primarySoft }}
              thumbColor={notificationsEnabled ? colors.brand.primary : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDesc}>
                {darkMode ? 'Easier on the eyes' : 'Light theme'}
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.border.subtle, true: colors.brand.primarySoft }}
              thumbColor={darkMode ? colors.brand.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Sample CTA Button */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Primary Action</Text>
          <Text style={styles.sectionDesc}>Forest green CTA with gold accent</Text>
          
          <Pressable style={styles.primaryButton}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Mark as Complete</Text>
          </Pressable>

          <View style={styles.completedBadge}>
            <Ionicons name="checkmark" size={16} color={colors.accent.gold} />
            <Text style={styles.completedText}>7 days of prayer this month</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.infoText}>
            These components use Daily Parish's{'\n'}
            green + gold + warm neutral palette.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.surface,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  section: {
    backgroundColor: colors.bg.elevated,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  progressText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.brand.primary,
  },
  streakContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.goldSoft,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  streakLabel: {
    fontSize: 20,
    color: colors.accent.gold,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  settingDesc: {
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  completedText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 6,
  },
  info: {
    padding: 16,
    backgroundColor: colors.brand.primarySoft,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.brand.primary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
