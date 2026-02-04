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

// Daily Parish Design Tokens — Refined Minimal Palette
const colors = {
  bg: {
    surface: '#FAFAFA',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#4A4A4A',
    muted: '#717171',
  },
  accent: '#2D5A3F', // Forest green — ONE accent only
  border: {
    subtle: '#E5E5E5',
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
          <Text style={styles.sectionTitle}>Completion</Text>
          <Text style={styles.sectionDesc}>Tap to increase</Text>
          
          <View style={styles.progressContainer}>
            <CircularProgress
              progress={readingProgress}
              size={100}
              strokeWidth={6}
              outerCircleColor={colors.border.subtle}
              progressCircleColor={colors.accent}
              backgroundColor={colors.bg.elevated}
              onPress={incrementProgress}
              renderIcon={() => (
                <Text style={styles.progressText}>{progressValue}%</Text>
              )}
            />
          </View>
        </View>

        {/* Rolling Counter - Streak */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consistency</Text>
          <Text style={styles.sectionDesc}>Tap to add a day</Text>
          
          <View style={styles.streakContainer}>
            <Pressable onPress={incrementStreak} style={styles.streakRow}>
              <RollingCounter
                value={streakCount}
                height={40}
                width={28}
                fontSize={32}
                color={colors.text.primary}
              />
              <Text style={styles.streakLabel}>days</Text>
            </Pressable>
          </View>
        </View>

        {/* Settings Switches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Daily Reminders</Text>
              <Text style={styles.settingDescText}>
                {notificationsEnabled ? '7:00 AM' : 'Off'}
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border.subtle, true: colors.accent }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescText}>
                {darkMode ? 'On' : 'Off'}
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.border.subtle, true: colors.accent }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>

        {/* Sample CTA Button */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Mark as Complete</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>View History</Text>
          </Pressable>

          <View style={styles.completedState}>
            <Ionicons name="checkmark" size={18} color={colors.accent} />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.infoText}>
            Minimal palette: black, white, gray{'\n'}
            + one accent color
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
    padding: 24,
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
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.muted,
    marginBottom: 32,
  },
  section: {
    backgroundColor: colors.bg.elevated,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  sectionDesc: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  streakContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakLabel: {
    fontSize: 18,
    color: colors.text.muted,
    fontWeight: '400',
    marginLeft: 6,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
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
    fontWeight: '400',
    color: colors.text.primary,
  },
  settingDescText: {
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  completedState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  completedText: {
    fontSize: 15,
    color: colors.text.muted,
    marginLeft: 6,
  },
  info: {
    padding: 16,
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
