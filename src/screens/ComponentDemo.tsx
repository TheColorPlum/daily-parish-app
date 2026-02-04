import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedValue, withTiming, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Reacticx Components
import { CircularProgress } from '../shared/ui/organisms/circular-progress';
import { RollingCounter } from '../shared/ui/organisms/rolling-counter';

// ============================================
// DESIGN TOKENS — Contemplative Premium
// ============================================

const lightColors = {
  bg: {
    surface: '#F8F7F4',      // Warm paper white
    elevated: '#FFFFFF',
    subtle: '#F2F0EB',       // For nested elements
  },
  text: {
    primary: '#1C1C1E',      // Soft black
    secondary: '#48484A',
    muted: '#8E8E93',
    scripture: '#2C2C2E',    // Slightly warmer for reading
  },
  accent: '#3D5A47',         // Muted forest green (softer)
  accentSoft: 'rgba(61, 90, 71, 0.1)',
  border: '#E8E6E1',
  shadow: 'rgba(0, 0, 0, 0.04)',
};

const darkColors = {
  bg: {
    surface: '#1C1C1E',
    elevated: '#2C2C2E',
    subtle: '#252527',
  },
  text: {
    primary: '#F2F2F7',
    secondary: '#AEAEB2',
    muted: '#636366',
    scripture: '#E5E5EA',
  },
  accent: '#D4A84B',         // Warm gold
  accentSoft: 'rgba(212, 168, 75, 0.15)',
  border: '#38383A',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

// ============================================
// COMPONENT DEMO
// ============================================

export function ComponentDemo() {
  const navigation = useNavigation();
  const [darkMode, setDarkMode] = useState(false);
  const colors = darkMode ? darkColors : lightColors;

  // Interactive states
  const readingProgress = useSharedValue(65);
  const [progressValue, setProgressValue] = useState(65);
  const streakCount = useSharedValue(7);
  const [streak, setStreak] = useState(7);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const incrementProgress = () => {
    const newValue = progressValue >= 100 ? 0 : Math.min(progressValue + 20, 100);
    setProgressValue(newValue);
    readingProgress.value = withSpring(newValue, { damping: 15 });
  };

  const incrementStreak = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    streakCount.value = newStreak;
  };

  // ============================================
  // SHARED STYLES
  // ============================================
  
  const cardStyle = {
    backgroundColor: colors.bg.elevated,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.surface }]}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
          </Pressable>
          <View style={styles.headerRight}>
            <Text style={[styles.modeLabel, { color: colors.text.muted }]}>
              {darkMode ? 'Dark' : 'Light'}
            </Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#FFFFFF"
              style={styles.modeSwitch}
            />
          </View>
        </View>

        <Text style={[styles.pageTitle, { color: colors.text.primary }]}>Design System</Text>
        <Text style={[styles.pageSubtitle, { color: colors.text.muted }]}>
          Contemplative • Premium • Calm
        </Text>

        {/* ============================================ */}
        {/* SCRIPTURE BLOCK */}
        {/* ============================================ */}
        <View style={cardStyle}>
          <Text style={[styles.scriptureRef, { color: colors.text.muted }]}>
            Philippians 4:6-7
          </Text>
          <Text style={[styles.scriptureText, { color: colors.text.scripture }]}>
            Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.
          </Text>
          <View style={[styles.scriptureFooter, { borderTopColor: colors.border }]}>
            <Ionicons name="book-outline" size={16} color={colors.text.muted} />
            <Text style={[styles.scriptureFooterText, { color: colors.text.muted }]}>
              Today's Reading
            </Text>
          </View>
        </View>

        {/* ============================================ */}
        {/* AUDIO PLAYER */}
        {/* ============================================ */}
        <View style={cardStyle}>
          <View style={styles.audioHeader}>
            <View>
              <Text style={[styles.audioTitle, { color: colors.text.primary }]}>
                Listen
              </Text>
              <Text style={[styles.audioDuration, { color: colors.text.muted }]}>
                4:32
              </Text>
            </View>
            <Pressable 
              style={[styles.playButton, { backgroundColor: colors.accent }]}
            >
              <Ionicons name="play" size={24} color="#FFFFFF" style={{ marginLeft: 3 }} />
            </Pressable>
          </View>
          
          {/* Progress bar */}
          <View style={styles.audioProgress}>
            <View style={[styles.audioTrack, { backgroundColor: colors.bg.subtle }]}>
              <View 
                style={[
                  styles.audioFill, 
                  { backgroundColor: colors.accent, width: '35%' }
                ]} 
              />
              <View style={[styles.audioKnob, { backgroundColor: colors.accent }]} />
            </View>
            <View style={styles.audioTimes}>
              <Text style={[styles.audioTime, { color: colors.text.muted }]}>1:35</Text>
              <Text style={[styles.audioTime, { color: colors.text.muted }]}>4:32</Text>
            </View>
          </View>
        </View>

        {/* ============================================ */}
        {/* PROGRESS RING */}
        {/* ============================================ */}
        <View style={cardStyle}>
          <Text style={[styles.cardLabel, { color: colors.text.muted }]}>
            Today's Progress
          </Text>
          
          <Pressable onPress={incrementProgress} style={styles.progressWrapper}>
            <CircularProgress
              progress={readingProgress}
              size={140}
              strokeWidth={10}
              outerCircleColor={colors.bg.subtle}
              progressCircleColor={colors.accent}
              backgroundColor={colors.bg.elevated}
              renderIcon={() => (
                <View style={styles.progressInner}>
                  <Text style={[styles.progressNumber, { color: colors.text.primary }]}>
                    {progressValue}
                  </Text>
                  <Text style={[styles.progressUnit, { color: colors.text.muted }]}>
                    percent
                  </Text>
                </View>
              )}
            />
          </Pressable>
          
          <Text style={[styles.cardHint, { color: colors.text.muted }]}>
            Tap to update
          </Text>
        </View>

        {/* ============================================ */}
        {/* STREAK COUNTER */}
        {/* ============================================ */}
        <View style={cardStyle}>
          <Text style={[styles.cardLabel, { color: colors.text.muted }]}>
            Current Streak
          </Text>
          
          <Pressable onPress={incrementStreak} style={styles.streakWrapper}>
            <View style={styles.streakRow}>
              <RollingCounter
                value={streakCount}
                height={56}
                width={36}
                fontSize={44}
                color={colors.text.primary}
              />
              <Text style={[styles.streakUnit, { color: colors.text.secondary }]}>
                days
              </Text>
            </View>
          </Pressable>

          {/* Mini calendar hint */}
          <View style={styles.weekDots}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <View key={i} style={styles.dayColumn}>
                <Text style={[styles.dayLabel, { color: colors.text.muted }]}>{day}</Text>
                <View 
                  style={[
                    styles.dayDot,
                    { 
                      backgroundColor: i < streak % 7 ? colors.accent : colors.bg.subtle,
                      borderColor: i === (streak % 7) ? colors.accent : 'transparent',
                    }
                  ]} 
                />
              </View>
            ))}
          </View>
        </View>

        {/* ============================================ */}
        {/* SETTINGS CARD */}
        {/* ============================================ */}
        <View style={cardStyle}>
          <Text style={[styles.cardLabel, { color: colors.text.muted }]}>
            Preferences
          </Text>
          
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="notifications-outline" size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text.primary }]}>
                  Daily Reminder
                </Text>
                <Text style={[styles.settingValue, { color: colors.text.muted }]}>
                  {notificationsEnabled ? '7:00 AM' : 'Off'}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="time-outline" size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text.primary }]}>
                  Reading Time
                </Text>
                <Text style={[styles.settingValue, { color: colors.text.muted }]}>
                  ~5 minutes
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </View>
        </View>

        {/* ============================================ */}
        {/* ACTION BUTTONS */}
        {/* ============================================ */}
        <View style={cardStyle}>
          <Text style={[styles.cardLabel, { color: colors.text.muted }]}>
            Actions
          </Text>

          {!isCompleted ? (
            <Pressable 
              style={[styles.primaryButton, { backgroundColor: colors.accent }]}
              onPress={() => setIsCompleted(true)}
            >
              <Text style={styles.primaryButtonText}>Mark as Complete</Text>
            </Pressable>
          ) : (
            <View style={[styles.completedCard, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
              <Text style={[styles.completedText, { color: colors.accent }]}>
                Completed
              </Text>
            </View>
          )}

          <Pressable 
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() => setIsCompleted(false)}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text.primary }]}>
              {isCompleted ? 'Reset Demo' : 'View History'}
            </Text>
          </Pressable>
        </View>

        {/* Footer spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  modeSwitch: {
    transform: [{ scale: 0.85 }],
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    marginBottom: 32,
    letterSpacing: 0.3,
  },

  // Scripture
  scriptureRef: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  scriptureText: {
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 32,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  scriptureFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  scriptureFooterText: {
    fontSize: 13,
    marginLeft: 8,
  },

  // Audio Player
  audioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  audioTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  audioDuration: {
    fontSize: 14,
    marginTop: 2,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioProgress: {
    marginTop: 8,
  },
  audioTrack: {
    height: 6,
    borderRadius: 3,
    position: 'relative',
  },
  audioFill: {
    height: '100%',
    borderRadius: 3,
  },
  audioKnob: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    top: -4,
    left: '35%',
    marginLeft: -7,
  },
  audioTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  audioTime: {
    fontSize: 12,
  },

  // Card common
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
  },
  cardHint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },

  // Progress
  progressWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  progressInner: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
  },
  progressUnit: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: -2,
  },

  // Streak
  streakWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakUnit: {
    fontSize: 20,
    fontWeight: '400',
    marginLeft: 8,
  },
  weekDots: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 20,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 8,
  },
  dayDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },

  // Settings
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    marginTop: 2,
  },

  // Buttons
  primaryButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
  },
  completedText: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 10,
  },
});
