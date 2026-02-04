import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// DESIGN TOKENS — Contemplative Premium
// ============================================

const lightColors = {
  bg: {
    surface: '#F8F7F4',
    elevated: '#FFFFFF',
    subtle: '#F2F0EB',
  },
  text: {
    primary: '#1C1C1E',
    secondary: '#48484A',
    muted: '#8E8E93',
  },
  accent: '#3D5A47',
  accentSoft: 'rgba(61, 90, 71, 0.08)',
  border: '#E8E6E1',
};

const darkColors = {
  bg: {
    surface: '#0D0D0D',
    elevated: '#1A1A1A',
    subtle: '#252525',
  },
  text: {
    primary: '#F5F5F7',
    secondary: '#A1A1A6',
    muted: '#636366',
  },
  accent: '#D4A84B',
  accentSoft: 'rgba(212, 168, 75, 0.12)',
  border: '#2C2C2E',
};

// ============================================
// AUDIO-FIRST TODAY SCREEN PROTOTYPE
// ============================================

export function ComponentDemo() {
  const navigation = useNavigation();
  const [darkMode, setDarkMode] = useState(false);
  const colors = darkMode ? darkColors : lightColors;

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const totalTime = 272; // 4:32 in seconds

  const progress = useSharedValue(0);

  // Simulate playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < totalTime) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          progress.value = withTiming((next / totalTime) * 100, { duration: 900 });
          if (next >= totalTime) {
            setIsPlaying(false);
            setIsCompleted(true);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const handlePlayPause = () => {
    if (isCompleted) {
      // Reset for demo
      setIsCompleted(false);
      setCurrentTime(0);
      progress.value = 0;
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const resetDemo = () => {
    setIsCompleted(false);
    setIsPlaying(false);
    setCurrentTime(0);
    progress.value = 0;
  };

  const skipToEnd = () => {
    setCurrentTime(totalTime);
    progress.value = withTiming(100, { duration: 300 });
    setIsPlaying(false);
    setIsCompleted(true);
  };

  // ============================================
  // COMPLETED STATE
  // ============================================
  if (isCompleted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.surface }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
          </Pressable>
          <View style={styles.headerRight}>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#FFFFFF"
              style={styles.modeSwitch}
            />
          </View>
        </View>

        <Animated.View 
          entering={FadeIn.duration(600)} 
          style={styles.completedContainer}
        >
          {/* Checkmark */}
          <View style={[styles.checkCircle, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="checkmark" size={48} color={colors.accent} />
          </View>

          {/* Message */}
          <Text style={[styles.completedTitle, { color: colors.text.primary }]}>
            You're all set
          </Text>
          
          {/* Streak - only shows here */}
          <Text style={[styles.streakText, { color: colors.text.secondary }]}>
            7 days
          </Text>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Actions */}
          <Pressable style={styles.completedAction} onPress={resetDemo}>
            <Ionicons name="refresh-outline" size={20} color={colors.text.secondary} />
            <Text style={[styles.completedActionText, { color: colors.text.secondary }]}>
              Replay
            </Text>
          </Pressable>

          <Pressable style={styles.completedAction}>
            <Ionicons name="document-text-outline" size={20} color={colors.text.secondary} />
            <Text style={[styles.completedActionText, { color: colors.text.secondary }]}>
              Read scripture
            </Text>
          </Pressable>

          <Pressable style={styles.completedAction}>
            <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
            <Text style={[styles.completedActionText, { color: colors.text.secondary }]}>
              View history
            </Text>
          </Pressable>
        </Animated.View>

        {/* Demo label */}
        <View style={styles.demoLabel}>
          <Text style={[styles.demoLabelText, { color: colors.text.muted }]}>
            Completed State
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // PLAYING / READY STATE
  // ============================================
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerRight}>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
            style={styles.modeSwitch}
          />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Greeting */}
        <Text style={[styles.greeting, { color: colors.text.primary }]}>
          Good morning
        </Text>
        <Text style={[styles.date, { color: colors.text.muted }]}>
          February 4
        </Text>

        {/* Play Button */}
        <View style={styles.playerSection}>
          <Pressable 
            onPress={handlePlayPause}
            style={[styles.playButton, { backgroundColor: colors.accent }]}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={44} 
              color="#FFFFFF" 
              style={!isPlaying ? { marginLeft: 4 } : {}}
            />
          </Pressable>

          <Text style={[styles.prayerTitle, { color: colors.text.primary }]}>
            Today's Prayer
          </Text>
          <Text style={[styles.duration, { color: colors.text.muted }]}>
            {formatTime(totalTime - currentTime)} remaining
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={[styles.progressTrack, { backgroundColor: colors.bg.subtle }]}>
            <Animated.View 
              style={[styles.progressFill, { backgroundColor: colors.accent }, progressStyle]} 
            />
          </View>
          <View style={styles.progressTimes}>
            <Text style={[styles.progressTime, { color: colors.text.muted }]}>
              {formatTime(currentTime)}
            </Text>
            <Text style={[styles.progressTime, { color: colors.text.muted }]}>
              {formatTime(totalTime)}
            </Text>
          </View>
        </View>

        {/* Scripture Teaser */}
        <View style={styles.teaserSection}>
          <Text style={[styles.teaserText, { color: colors.text.secondary }]}>
            "Do not be anxious about anything..."
          </Text>
          
          <Pressable style={styles.seeFullReading}>
            <Text style={[styles.seeFullReadingText, { color: colors.accent }]}>
              See full reading
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </Pressable>
        </View>
      </View>

      {/* Demo Controls */}
      <View style={[styles.demoControls, { borderTopColor: colors.border }]}>
        <Pressable 
          style={[styles.demoButton, { backgroundColor: colors.bg.subtle }]}
          onPress={skipToEnd}
        >
          <Text style={[styles.demoButtonText, { color: colors.text.secondary }]}>
            Skip to completion →
          </Text>
        </Pressable>
      </View>
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
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
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
  modeSwitch: {
    transform: [{ scale: 0.85 }],
  },

  // Main Content
  mainContent: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },

  // Greeting
  greeting: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 48,
  },

  // Player
  playerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  playButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  prayerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  duration: {
    fontSize: 15,
  },

  // Progress
  progressSection: {
    marginBottom: 40,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  progressTime: {
    fontSize: 13,
  },

  // Teaser
  teaserSection: {
    alignItems: 'center',
  },
  teaserText: {
    fontSize: 17,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 16,
  },
  seeFullReading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeFullReadingText: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Completed State
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  streakText: {
    fontSize: 17,
    marginBottom: 40,
  },
  divider: {
    width: 48,
    height: 1,
    marginBottom: 32,
  },
  completedAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  completedActionText: {
    fontSize: 17,
    marginLeft: 12,
  },

  // Demo Controls
  demoControls: {
    padding: 20,
    borderTopWidth: 1,
  },
  demoButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  demoLabel: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  demoLabelText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
