import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Reacticx Components
import { CircularProgress } from '../shared/ui/organisms/circular-progress';
import { RollingCounter } from '../shared/ui/organisms/rolling-counter';

// Daily Parish Design Tokens — Refined Minimal Palette
const lightColors = {
  bg: {
    surface: '#FAFAFA',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#4A4A4A',
    muted: '#717171',
  },
  accent: '#2D5A3F', // Forest green
  border: {
    subtle: '#E5E5E5',
  },
};

const darkColors = {
  bg: {
    surface: '#121212',
    elevated: '#1E1E1E',
  },
  text: {
    primary: '#F5F5F5',
    secondary: '#B0B0B0',
    muted: '#8A8A8A',
  },
  accent: '#C89B3C', // Gold — warmer in dark mode
  border: {
    subtle: '#2A2A2A',
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

  // Settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Dynamic colors based on mode
  const colors = darkMode ? darkColors : lightColors;

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.surface }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text.primary }]}>Component Demo</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>
          {darkMode ? 'Dark mode — gold accent' : 'Light mode — forest green accent'}
        </Text>

        {/* Circular Progress */}
        <View style={[styles.section, { backgroundColor: colors.bg.elevated, borderColor: colors.border.subtle }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>Completion</Text>
          
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
                <Text style={[styles.progressText, { color: colors.text.primary }]}>{progressValue}%</Text>
              )}
            />
          </View>
          <Text style={[styles.hint, { color: colors.text.muted }]}>Tap to increase</Text>
        </View>

        {/* Rolling Counter - Streak */}
        <View style={[styles.section, { backgroundColor: colors.bg.elevated, borderColor: colors.border.subtle }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>Consistency</Text>
          
          <View style={styles.streakContainer}>
            <Pressable onPress={incrementStreak} style={styles.streakRow}>
              <RollingCounter
                value={streakCount}
                height={40}
                width={28}
                fontSize={32}
                color={colors.text.primary}
              />
              <Text style={[styles.streakLabel, { color: colors.text.muted }]}>days</Text>
            </Pressable>
          </View>
          <Text style={[styles.hint, { color: colors.text.muted }]}>Tap to add a day</Text>
        </View>

        {/* Settings Switches */}
        <View style={[styles.section, { backgroundColor: colors.bg.elevated, borderColor: colors.border.subtle }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>Settings</Text>
          
          <View style={[styles.settingRow, { borderBottomColor: colors.border.subtle }]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Daily Reminders</Text>
              <Text style={[styles.settingDescText, { color: colors.text.muted }]}>
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
              <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Dark Mode</Text>
              <Text style={[styles.settingDescText, { color: colors.text.muted }]}>
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
        <View style={[styles.section, { backgroundColor: colors.bg.elevated, borderColor: colors.border.subtle }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>Actions</Text>
          
          <Pressable style={[styles.primaryButton, { backgroundColor: colors.accent }]}>
            <Text style={styles.primaryButtonText}>Mark as Complete</Text>
          </Pressable>

          <Pressable style={[styles.secondaryButton, { borderColor: colors.border.subtle }]}>
            <Text style={[styles.secondaryButtonText, { color: colors.text.primary }]}>View History</Text>
          </Pressable>

          <View style={styles.completedState}>
            <Ionicons name="checkmark" size={18} color={colors.accent} />
            <Text style={[styles.completedText, { color: colors.text.muted }]}>Completed</Text>
          </View>
        </View>

        {/* Info */}
        <View style={[styles.info, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
          <Text style={[styles.infoText, { color: colors.text.muted }]}>
            {darkMode 
              ? 'Dark: near-black bg + gold accent' 
              : 'Light: near-white bg + forest green accent'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 32,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
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
    fontWeight: '400',
    marginLeft: 6,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
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
  },
  settingDescText: {
    fontSize: 14,
    marginTop: 2,
  },
  primaryButton: {
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
  },
  secondaryButtonText: {
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
    marginLeft: 6,
  },
  info: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
