import React, { useEffect, useCallback, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useTodayStore, useUserStore } from '../stores';
import { useAudioPlayer, useAppStateRefresh } from '../hooks';
import { api, ApiError } from '../lib';
import { lightColors as colors, spacing, radius, shadow } from '../theme';
import { RollingCounter } from '../shared/ui/organisms/rolling-counter';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function TodayScreen() {
  const navigation = useNavigation();
  const { getToken } = useAuth();
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  const [showReading, setShowReading] = useState(false);
  
  // Stores
  const { 
    date, 
    firstReading, 
    gospel, 
    commentary,
    audioUrl,
    sessionId,
    screenState,
    setReadings,
    setSessionId,
    setScreenState,
    setError,
  } = useTodayStore();
  
  const { 
    hasCompletedFirstSession, 
    setHasCompletedFirstSession,
    setStreak,
    currentStreak,
  } = useUserStore();

  // Streak animation
  const streakValue = useSharedValue(currentStreak);
  const [displayStreak, setDisplayStreak] = useState(currentStreak);

  // Audio player
  const audioPlayer = useAudioPlayer({
    onPlaybackComplete: handleAudioComplete,
  });

  // Progress animation for scrubbing
  const progressBarWidth = SCREEN_WIDTH - 64;
  const progress = useSharedValue(0);

  // Sync progress with audio
  useEffect(() => {
    if (audioPlayer.progress !== undefined) {
      progress.value = withTiming(audioPlayer.progress * 100, { duration: 100 });
    }
  }, [audioPlayer.progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const knobStyle = useAnimatedStyle(() => ({
    left: `${progress.value}%`,
  }));

  // Scrubbing gestures
  const scrubGesture = Gesture.Pan()
    .onStart(() => {
      if (audioPlayer.isPlaying) {
        runOnJS(audioPlayer.togglePlayback)();
      }
    })
    .onUpdate((event) => {
      const newProgress = Math.max(0, Math.min(100, (event.x / progressBarWidth) * 100));
      progress.value = newProgress;
    })
    .onEnd((event) => {
      const newProgress = Math.max(0, Math.min(100, (event.x / progressBarWidth) * 100));
      runOnJS(handleSeek)(newProgress / 100);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    });

  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      const newProgress = Math.max(0, Math.min(100, (event.x / progressBarWidth) * 100));
      progress.value = withTiming(newProgress, { duration: 200 });
      runOnJS(handleSeek)(newProgress / 100);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    });

  const combinedGesture = Gesture.Race(scrubGesture, tapGesture);

  function handleSeek(position: number) {
    // position is 0-1, seekTo expects milliseconds
    const positionMs = position * audioPlayer.duration;
    audioPlayer.seekTo(positionMs);
  }

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getFormattedRemaining = () => {
    const remaining = audioPlayer.duration - audioPlayer.position;
    return formatTime(remaining);
  };

  // Refresh when app comes to foreground on new day
  useAppStateRefresh(loadTodayData);

  // Load data on mount
  useEffect(() => {
    loadTodayData();
  }, []);

  // Load audio when URL is available
  useEffect(() => {
    console.log('[TodayScreen] Audio state:', { audioUrl, screenState, isLoaded: audioPlayer.isLoaded });
    if (audioUrl && (screenState === 'ready' || screenState === 'playing')) {
      audioPlayer.loadAudio(audioUrl);
    }
  }, [audioUrl, screenState]);

  async function loadTodayData() {
    try {
      setScreenState('loading');
      const token = await getToken();
      
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const [readings, session] = await Promise.all([
        api.getTodayReadings(token),
        api.startSession(token).catch((err: ApiError) => {
          if (err.status === 409) {
            return { session_id: null, already_completed: true };
          }
          throw err;
        }),
      ]);

      console.log('[TodayScreen] API Response:', JSON.stringify(readings, null, 2));

      setReadings({
        date: readings.date,
        first_reading: readings.first_reading,
        gospel: readings.gospel,
        commentary: readings.commentary_unified,
        audioUrl: readings.audio_unified_url,
      });

      if ('already_completed' in session && session.already_completed) {
        setScreenState('completed');
      } else if (session.session_id) {
        setSessionId(session.session_id);
        setScreenState('ready');
      }
    } catch (error) {
      console.error('Failed to load today data:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          setError('Today\'s readings are not available right now.');
        } else if (error.status === 401) {
          setError('Session expired. Please sign in again.');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        setError('Daily Parish needs an internet connection.');
      }
    }
  }

  async function handleAudioComplete() {
    if (screenState === 'completed' || isCompletingSession) return;
    await completeSession();
  }

  const completeSession = useCallback(async () => {
    if (!sessionId || isCompletingSession) return;
    
    setIsCompletingSession(true);
    try {
      const token = await getToken();
      if (!token) return;

      const result = await api.completeSession(token, sessionId);
      
      if (result.success) {
        setStreak({
          current_streak: result.streak.current_streak,
          longest_streak: result.streak.longest_streak,
          total_sessions: result.streak.current_streak,
        });
        
        if (!hasCompletedFirstSession) {
          setHasCompletedFirstSession(true);
        }
        
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setScreenState('completed');

        // Delayed streak animation
        setTimeout(() => {
          setDisplayStreak(result.streak.current_streak);
          streakValue.value = result.streak.current_streak;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, 800);
      }
    } catch (error) {
      console.error('Failed to complete session:', error);
      setScreenState('completed');
    } finally {
      setIsCompletingSession(false);
    }
  }, [sessionId, isCompletingSession, getToken, hasCompletedFirstSession]);

  function handlePlayPause() {
    console.log('[TodayScreen] Play pressed:', { isLoaded: audioPlayer.isLoaded, isPlaying: audioPlayer.isPlaying, error: audioPlayer.error });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    audioPlayer.togglePlayback();
    
    if (!hasCompletedFirstSession && !audioPlayer.isPlaying) {
      setHasCompletedFirstSession(true);
    }
    
    if (screenState === 'ready' && !audioPlayer.isPlaying) {
      setScreenState('playing');
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const d = new Date(dateString + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getScriptureTeaser = () => {
    if (firstReading?.text) {
      const words = firstReading.text.split(' ').slice(0, 8).join(' ');
      return `"${words}..."`;
    }
    return '';
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (screenState === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (screenState === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={{ width: 44 }} />
          <Pressable 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text.secondary} />
          </Pressable>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            {useTodayStore.getState().errorMessage || 'Something went wrong.'}
          </Text>
          <Pressable style={styles.retryButton} onPress={loadTodayData}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // COMPLETED STATE
  // ============================================
  if (screenState === 'completed') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Reading Modal */}
        <Modal
          visible={showReading}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowReading(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Today's Reading</Text>
              <Pressable onPress={() => setShowReading(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </Pressable>
            </View>
            <ScrollView 
              style={styles.modalScroll}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {firstReading && (
                <>
                  <Text style={styles.scriptureRef}>{firstReading.reference}</Text>
                  <Text style={styles.scriptureText}>{firstReading.text}</Text>
                </>
              )}
              {gospel && (
                <>
                  <View style={styles.modalDivider} />
                  <Text style={styles.scriptureRef}>{gospel.reference}</Text>
                  <Text style={styles.scriptureText}>{gospel.text}</Text>
                </>
              )}
              {commentary && (
                <>
                  <View style={styles.modalDivider} />
                  <Text style={styles.commentaryLabel}>Commentary</Text>
                  <Text style={styles.commentaryText}>{commentary}</Text>
                </>
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </Modal>

        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 44 }} />
          <Pressable 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text.secondary} />
          </Pressable>
        </View>

        <Animated.View entering={FadeIn.duration(600)} style={styles.completedContainer}>
          {/* Checkmark */}
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={48} color={colors.accent} />
          </View>

          {/* Message */}
          <Text style={styles.completedTitle}>Go in peace</Text>

          {/* Divider */}
          <View style={styles.completedDivider} />
          
          {/* Streak */}
          <Text style={styles.streakIntro}>You've prayed</Text>
          <View style={styles.streakRow}>
            <RollingCounter
              value={streakValue}
              height={44}
              width={28}
              fontSize={36}
              color={colors.text.primary}
            />
            <Text style={styles.streakDays}> days</Text>
          </View>
          <Text style={styles.streakOutro}>in a row</Text>

          {/* Spacer */}
          <View style={{ height: 32 }} />

          {/* Actions */}
          <Pressable style={styles.completedAction} onPress={() => {
            // Reset for replay
            setScreenState('ready');
            audioPlayer.seekTo(0);
          }}>
            <Ionicons name="refresh-outline" size={20} color={colors.text.secondary} />
            <Text style={styles.completedActionText}>Replay</Text>
          </Pressable>

          <Pressable style={styles.completedAction} onPress={() => setShowReading(true)}>
            <Ionicons name="document-text-outline" size={20} color={colors.text.secondary} />
            <Text style={styles.completedActionText}>Read scripture</Text>
          </Pressable>

          <Pressable 
            style={styles.completedAction}
            onPress={() => navigation.navigate('History' as never)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
            <Text style={styles.completedActionText}>View history</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ============================================
  // READY / PLAYING STATE (Audio-First)
  // ============================================
  return (
    <SafeAreaView style={styles.container}>
      {/* Reading Modal */}
      <Modal
        visible={showReading}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReading(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Today's Reading</Text>
            <Pressable onPress={() => setShowReading(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </Pressable>
          </View>
          <ScrollView 
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {firstReading && (
              <>
                <Text style={styles.scriptureRef}>{firstReading.reference}</Text>
                <Text style={styles.scriptureText}>{firstReading.text}</Text>
              </>
            )}
            {gospel && (
              <>
                <View style={styles.modalDivider} />
                <Text style={styles.scriptureRef}>{gospel.reference}</Text>
                <Text style={styles.scriptureText}>{gospel.text}</Text>
              </>
            )}
            {commentary && (
              <>
                <View style={styles.modalDivider} />
                <Text style={styles.commentaryLabel}>Commentary</Text>
                <Text style={styles.commentaryText}>{commentary}</Text>
              </>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 44 }} />
        <Pressable 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings' as never)}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text.secondary} />
        </Pressable>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Greeting */}
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.date}>{formatDate(date)}</Text>

        {/* Play Button */}
        <View style={styles.playerSection}>
          <Pressable 
            onPress={handlePlayPause}
            style={[styles.playButton, !audioPlayer.isLoaded && { opacity: 0.7 }]}
          >
            {audioPlayer.isBuffering ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons 
                name={audioPlayer.isPlaying ? "pause" : "play"} 
                size={44} 
                color="#FFFFFF" 
                style={!audioPlayer.isPlaying ? { marginLeft: 4 } : {}}
              />
            )}
          </Pressable>

          <Text style={styles.prayerTitle}>Today's Prayer</Text>
          <Text style={styles.duration}>
            {audioPlayer.isPlaying 
              ? `${getFormattedRemaining()} remaining`
              : audioPlayer.formattedDuration || '~5 min'
            }
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <GestureDetector gesture={combinedGesture}>
            <View style={styles.progressTouchArea}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, progressStyle]} />
                <Animated.View style={[styles.progressKnob, knobStyle]} />
              </View>
            </View>
          </GestureDetector>
          <View style={styles.progressTimes}>
            <Text style={styles.progressTime}>{audioPlayer.formattedPosition || '0:00'}</Text>
            <Text style={styles.progressTime}>{audioPlayer.formattedDuration || '0:00'}</Text>
          </View>
        </View>

        {/* Scripture Teaser */}
        <View style={styles.teaserSection}>
          <Text style={styles.teaserText}>{getScriptureTeaser()}</Text>
          
          <Pressable 
            style={styles.seeFullReading}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowReading(true);
            }}
          >
            <Text style={styles.seeFullReadingText}>See full reading</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </Pressable>
        </View>
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
    backgroundColor: colors.bg.surface,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
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
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 17,
    color: colors.text.muted,
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
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...shadow.medium,
  },
  prayerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  duration: {
    fontSize: 15,
    color: colors.text.muted,
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
    backgroundColor: colors.bg.subtle,
    overflow: 'visible',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  progressKnob: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    top: -6,
    marginLeft: -8,
    ...shadow.subtle,
  },
  progressTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  progressTime: {
    fontSize: 13,
    color: colors.text.muted,
  },

  // Teaser
  teaserSection: {
    alignItems: 'center',
  },
  teaserText: {
    fontSize: 17,
    fontStyle: 'italic',
    color: colors.text.secondary,
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
    color: colors.accent,
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
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
  },
  completedDivider: {
    width: 48,
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
  streakIntro: {
    fontSize: 15,
    color: colors.text.muted,
    marginBottom: 4,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakDays: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.text.primary,
  },
  streakOutro: {
    fontSize: 15,
    color: colors.text.muted,
    marginTop: 4,
  },
  completedAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  completedActionText: {
    fontSize: 17,
    color: colors.text.secondary,
    marginLeft: 12,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.bg.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
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
    color: colors.text.muted,
    marginBottom: 16,
  },
  scriptureText: {
    fontSize: 22,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    lineHeight: 34,
    color: colors.text.scripture,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 32,
  },
  commentaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.text.muted,
    marginBottom: 16,
  },
  commentaryText: {
    fontSize: 17,
    lineHeight: 28,
    color: colors.text.primary,
  },

  // Loading & Error
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: colors.text.muted,
    marginTop: spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.accent,
  },
});
