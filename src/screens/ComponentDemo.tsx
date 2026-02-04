import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Switch, 
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSpring,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import { 
  Gesture, 
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

// Reacticx Components
import { RollingCounter } from '../shared/ui/organisms/rolling-counter';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// DESIGN TOKENS
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
    scripture: '#2C2C2E',
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
    scripture: '#E5E5EA',
  },
  accent: '#D4A84B',
  accentSoft: 'rgba(212, 168, 75, 0.12)',
  border: '#2C2C2E',
};

// ============================================
// SCRIPTURE CONTENT
// ============================================

const SCRIPTURE = {
  reference: 'Philippians 4:6-7',
  text: `Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.`,
  commentary: `Paul wrote these words from prison — not from comfort, but from chains. His peace wasn't circumstantial; it was rooted in something deeper.

The invitation here isn't to stop feeling anxious through willpower. It's to bring that anxiety somewhere — to prayer, to petition, to thanksgiving. Notice how thanksgiving comes before the request. Gratitude reorients us before we even ask.

And the promise isn't that God will fix everything. It's that peace will guard your heart. A peace that doesn't make sense given the circumstances. A peace that watches over you like a sentinel.

Today, what anxiety are you carrying? What would it look like to bring it — not fix it, just bring it?`,
};

// ============================================
// COMPONENT
// ============================================

export function ComponentDemo() {
  const navigation = useNavigation();
  const [darkMode, setDarkMode] = useState(false);
  const colors = darkMode ? darkColors : lightColors;

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [streak, setStreak] = useState(6); // Start at 6 so completion bumps to 7
  const totalTime = 272; // 4:32

  // Bottom sheet state
  const [showReading, setShowReading] = useState(false);

  // Animated values
  const progress = useSharedValue(0);
  const streakValue = useSharedValue(6);

  // Progress bar width for scrubbing
  const progressBarWidth = SCREEN_WIDTH - 64; // 32px padding each side

  // Simulate playback - only depends on isPlaying, not currentTime
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalTime) {
            clearInterval(interval);
            setIsPlaying(false);
            handleCompletion();
            return prev;
          }
          const next = prev + 1;
          progress.value = withTiming((next / totalTime) * 100, { duration: 900 });
          if (next >= totalTime) {
            clearInterval(interval);
            setIsPlaying(false);
            handleCompletion();
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleCompletion = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsCompleted(true);
    // Animate streak
    setStreak(prev => {
      const newStreak = prev + 1;
      streakValue.value = newStreak;
      return newStreak;
    });
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const knobStyle = useAnimatedStyle(() => ({
    left: `${progress.value}%`,
  }));

  // Scrubbing gesture
  const scrubGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(setIsPlaying)(false);
    })
    .onUpdate((event) => {
      const newProgress = Math.max(0, Math.min(100, (event.x / progressBarWidth) * 100));
      progress.value = newProgress;
      const newTime = Math.floor((newProgress / 100) * totalTime);
      runOnJS(setCurrentTime)(newTime);
    })
    .onEnd(() => {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    });

  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      const newProgress = Math.max(0, Math.min(100, (event.x / progressBarWidth) * 100));
      progress.value = withTiming(newProgress, { duration: 200 });
      const newTime = Math.floor((newProgress / 100) * totalTime);
      runOnJS(setCurrentTime)(newTime);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    });

  const combinedGesture = Gesture.Race(scrubGesture, tapGesture);

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPlaying(!isPlaying);
  };

  const resetDemo = () => {
    setIsCompleted(false);
    setIsPlaying(false);
    setCurrentTime(0);
    progress.value = 0;
    setStreak(6);
    streakValue.value = 6;
  };

  const skipToEnd = () => {
    setCurrentTime(totalTime);
    progress.value = withTiming(100, { duration: 300 });
    setIsPlaying(false);
    setTimeout(() => handleCompletion(), 400);
  };

  // ============================================
  // READING MODAL
  // ============================================
  const ReadingModal = () => (
    <Modal
      visible={showReading}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowReading(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.bg.surface }]}>
        {/* Modal Header */}
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
            Today's Reading
          </Text>
          <Pressable onPress={() => setShowReading(false)} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </Pressable>
        </View>

        <ScrollView 
          style={styles.modalScroll}
          contentContainerStyle={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Scripture */}
          <Text style={[styles.scriptureRef, { color: colors.text.muted }]}>
            {SCRIPTURE.reference}
          </Text>
          <Text style={[styles.scriptureText, { color: colors.text.scripture }]}>
            {SCRIPTURE.text}
          </Text>

          {/* Divider */}
          <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />

          {/* Commentary */}
          <Text style={[styles.commentaryLabel, { color: colors.text.muted }]}>
            Commentary
          </Text>
          <Text style={[styles.commentaryText, { color: colors.text.primary }]}>
            {SCRIPTURE.commentary}
          </Text>

          {/* Bottom spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );

  // ============================================
  // COMPLETED STATE
  // ============================================
  if (isCompleted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.surface }]}>
        <ReadingModal />
        
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
          
          {/* Animated Streak */}
          <View style={styles.streakRow}>
            <RollingCounter
              value={streakValue}
              height={28}
              width={18}
              fontSize={22}
              color={colors.text.secondary}
            />
            <Text style={[styles.streakLabel, { color: colors.text.secondary }]}>
              {' '}days
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Actions */}
          <Pressable style={styles.completedAction} onPress={resetDemo}>
            <Ionicons name="refresh-outline" size={20} color={colors.text.secondary} />
            <Text style={[styles.completedActionText, { color: colors.text.secondary }]}>
              Replay
            </Text>
          </Pressable>

          <Pressable style={styles.completedAction} onPress={() => setShowReading(true)}>
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
      </SafeAreaView>
    );
  }

  // ============================================
  // PLAYING / READY STATE
  // ============================================
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.surface }]}>
      <ReadingModal />

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
            {isPlaying ? formatTime(totalTime - currentTime) + ' remaining' : formatTime(totalTime)}
          </Text>
        </View>

        {/* Scrubbable Progress Bar */}
        <View style={styles.progressSection}>
          <GestureDetector gesture={combinedGesture}>
            <View style={styles.progressTouchArea}>
              <View style={[styles.progressTrack, { backgroundColor: colors.bg.subtle }]}>
                <Animated.View 
                  style={[styles.progressFill, { backgroundColor: colors.accent }, progressStyle]} 
                />
                {/* Scrub knob */}
                <Animated.View 
                  style={[
                    styles.progressKnob, 
                    { backgroundColor: colors.accent },
                    knobStyle,
                  ]} 
                />
              </View>
            </View>
          </GestureDetector>
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
          
          <Pressable 
            style={styles.seeFullReading}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowReading(true);
            }}
          >
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
  progressTouchArea: {
    height: 24,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'visible',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressKnob: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -6,
    marginLeft: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 40,
  },
  streakLabel: {
    fontSize: 17,
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

  // Modal
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: 24,
  },
  scriptureRef: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  scriptureText: {
    fontSize: 22,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    lineHeight: 34,
  },
  modalDivider: {
    height: 1,
    marginVertical: 32,
  },
  commentaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  commentaryText: {
    fontSize: 17,
    lineHeight: 28,
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
});
