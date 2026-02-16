import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

import { useTodayStore, useUserStore, useSettingsStore } from '../stores';
import { useAudioPlayer, useAppStateRefresh } from '../hooks';
import { api, ApiError, formatReference, checkNotificationPermissions } from '../lib';
import { useTheme, spacing, radius, shadow, typography, touchTargets } from '../theme';
import { PrayerInput, NotificationPrompt, DatePickerSheet } from '../components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function TodayScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { getToken } = useAuth();
  const [showReading, setShowReading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [audioExpanded, setAudioExpanded] = useState(true);
  const [audioCompleted, setAudioCompleted] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [hasCheckedNotifications, setHasCheckedNotifications] = useState(false);
  
  // Determine if viewing a past date
  const todayStr = new Date().toISOString().split('T')[0];
  const viewingPastDate = selectedDate !== null && selectedDate !== todayStr;
  
  // Stores
  const { 
    date, 
    firstReading,
    responsorialPsalm,
    gospel, 
    commentary,
    audioUrl,
    sessionId,
    screenState,
    season,
    feast,
    setReadings,
    setSessionId,
    setScreenState,
    setError,
  } = useTodayStore();
  
  const { 
    hasCompletedFirstSession, 
    setHasCompletedFirstSession,
    hasCompletedFirstPrayer,
    sessionCount,
    incrementSessionCount,
  } = useUserStore();
  
  const { notificationPermissionGranted, dailyReminderEnabled } = useSettingsStore();

  // Check if we should show notification prompt
  // Show after: second session OR first prayer, AND notifications not already enabled
  useEffect(() => {
    async function checkNotificationPrompt() {
      if (hasCheckedNotifications) return;
      if (notificationPermissionGranted || dailyReminderEnabled) return;
      
      const alreadyGranted = await checkNotificationPermissions();
      if (alreadyGranted) return;
      
      // Show prompt after second session or first prayer
      const shouldShow = sessionCount >= 2 || hasCompletedFirstPrayer;
      if (shouldShow) {
        setShowNotificationPrompt(true);
      }
      setHasCheckedNotifications(true);
    }
    
    if (screenState === 'ready') {
      checkNotificationPrompt();
    }
  }, [screenState, sessionCount, hasCompletedFirstPrayer, notificationPermissionGranted, dailyReminderEnabled]);

  // Audio player
  const audioPlayer = useAudioPlayer({
    onPlaybackComplete: handleAudioComplete,
  });

  // Progress animation for scrubbing
  const progressBarWidth = SCREEN_WIDTH - 80;
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
    const positionMs = position * audioPlayer.duration;
    audioPlayer.seekTo(positionMs);
  }

  async function loadReadingsForDate(targetDate?: string) {
    try {
      setScreenState('loading');
      setAudioCompleted(false); // Reset audio state for new date
      const token = await getToken();
      
      if (!token) {
        setError('Not authenticated');
        return;
      }

      // If loading a specific date, just get readings (no session tracking)
      if (targetDate && targetDate !== todayStr) {
        const readings = await api.getReadingsByDate(token, targetDate);
        
        setReadings({
          date: readings.date,
          first_reading: readings.first_reading,
          responsorial_psalm: readings.responsorial_psalm,
          gospel: readings.gospel,
          commentary: readings.commentary_unified,
          audioUrl: readings.audio_unified_url,
          season: readings.season,
          feast: readings.feast,
        });
        
        setScreenState('ready');
        return;
      }

      // Loading today - include session tracking
      const [readings, session] = await Promise.all([
        api.getTodayReadings(token),
        api.startSession(token).catch((err: ApiError) => {
          if (err.status === 409) {
            return { session_id: null, already_completed: true };
          }
          throw err;
        }),
      ]);

      setReadings({
        date: readings.date,
        first_reading: readings.first_reading,
        responsorial_psalm: readings.responsorial_psalm,
        gospel: readings.gospel,
        commentary: readings.commentary_unified,
        audioUrl: readings.audio_unified_url,
        // Liturgical calendar (when available from API)
        season: readings.season,
        feast: readings.feast,
      });

      if (session.session_id) {
        setSessionId(session.session_id);
      }
      setScreenState('ready');
    } catch (error) {
      console.error('Failed to load readings:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          setError('Readings not available for this date.');
        } else if (error.status === 401) {
          setError('Session expired. Please sign in again.');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        setError('Votive needs an internet connection.');
      }
    }
  }

  // Alias for backward compatibility
  const loadTodayData = () => loadReadingsForDate();

  // Refresh when app comes to foreground on new day
  useAppStateRefresh(loadTodayData);

  // Load data on mount
  useEffect(() => {
    loadTodayData();
  }, []);

  // Load audio when URL is available
  useEffect(() => {
    if (audioUrl && screenState === 'ready') {
      audioPlayer.loadAudio(audioUrl);
    }
  }, [audioUrl, screenState]);

  // Handle date selection from picker
  function handleSelectDate(newDate: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(newDate);
    loadReadingsForDate(newDate);
  }

  // Return to today
  function handleBackToToday() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(null);
    loadReadingsForDate();
  }

  async function handleAudioComplete() {
    // Mark audio as completed (show badge)
    setAudioCompleted(true);
    
    // Increment session count for notification prompt timing
    incrementSessionCount();
    
    // Mark session as completed on server
    if (sessionId) {
      try {
        const token = await getToken();
        if (token) {
          await api.completeSession(token, sessionId);
        }
      } catch (error) {
        console.error('Failed to complete session:', error);
      }
    }
    
    if (!hasCompletedFirstSession) {
      setHasCompletedFirstSession(true);
    }
    
    // Gentle haptic on completion
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handlePlayPause() {
    if (!audioUrl) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowReading(true);
      return;
    }
    
    if (!audioPlayer.isLoaded) {
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    audioPlayer.togglePlayback();
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const d = new Date(dateString + 'T12:00:00');
    return d.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (screenState === 'loading') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.text.muted} />
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
  // MAIN SCREEN - Audio + Prayer side by side
  // ============================================
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
                <Text style={styles.scriptureRef}>{formatReference(firstReading.reference)}</Text>
                <Text style={styles.scriptureText}>{firstReading.text}</Text>
              </>
            )}
            {responsorialPsalm && (
              <>
                <View style={styles.modalDivider} />
                <Text style={styles.scriptureRef}>{formatReference(responsorialPsalm.reference)}</Text>
                {responsorialPsalm.text && (
                  <Text style={styles.scriptureText}>{responsorialPsalm.text}</Text>
                )}
              </>
            )}
            {gospel && (
              <>
                <View style={styles.modalDivider} />
                <Text style={styles.scriptureRef}>{formatReference(gospel.reference)}</Text>
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

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            {viewingPastDate ? (
              <Pressable onPress={handleBackToToday} style={styles.backToToday}>
                <Ionicons name="arrow-back" size={16} color={colors.accent.primary} />
                <Text style={styles.backToTodayText}>Today</Text>
              </Pressable>
            ) : (
              <Text style={styles.greeting}>{getGreeting()}</Text>
            )}
            <Pressable 
              style={styles.dateRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowDatePicker(true);
              }}
            >
              <Text style={styles.date}>{formatDate(date)}</Text>
              <Ionicons 
                name="chevron-down" 
                size={16} 
                color={colors.text.muted} 
                style={styles.dateChevron}
              />
            </Pressable>
            {(feast || season) && (
              <Text style={styles.liturgicalInfo}>• {feast || season}</Text>
            )}
          </View>

          {/* Date Picker Sheet */}
          <DatePickerSheet
            visible={showDatePicker}
            selectedDate={selectedDate || todayStr}
            onSelectDate={handleSelectDate}
            onClose={() => setShowDatePicker(false)}
          />

          {/* Audio Card */}
          <View style={styles.audioCard}>
            <Pressable 
              style={styles.audioCardHeader}
              onPress={() => {
                if (audioPlayer.isLoaded) {
                  setAudioExpanded(!audioExpanded);
                } else {
                  handlePlayPause();
                }
              }}
            >
              <View style={styles.audioCardLeft}>
                <Pressable 
                  style={styles.playButton}
                  onPress={handlePlayPause}
                >
                  {!audioUrl ? (
                    <Ionicons name="book-outline" size={24} color="#FFFFFF" />
                  ) : !audioPlayer.isLoaded || audioPlayer.isBuffering ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Ionicons 
                      name={audioPlayer.isPlaying ? "pause" : "play"} 
                      size={24} 
                      color="#FFFFFF" 
                      style={!audioPlayer.isPlaying ? { marginLeft: 2 } : {}}
                    />
                  )}
                </Pressable>
                <View style={styles.audioCardInfo}>
                  <View style={styles.audioCardTitleRow}>
                    <Text style={styles.audioCardTitle}>Today's Reading</Text>
                    {audioCompleted && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.semantic.success} style={styles.completedBadge} />
                    )}
                  </View>
                  <Text style={styles.audioCardDuration}>
                    {!audioUrl 
                      ? 'Tap to read'
                      : audioPlayer.isPlaying 
                        ? `${audioPlayer.formattedPosition} / ${audioPlayer.formattedDuration}`
                        : audioPlayer.formattedDuration || '~5 min'
                    }
                  </Text>
                </View>
              </View>
              {audioUrl && audioPlayer.isLoaded && (
                <Ionicons 
                  name={audioExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.text.muted} 
                />
              )}
            </Pressable>

            {/* Progress Bar (expanded) */}
            {audioUrl && audioExpanded && audioPlayer.isLoaded && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.progressSection}>
                <GestureDetector gesture={combinedGesture}>
                  <View style={styles.progressTouchArea}>
                    <View style={styles.progressTrack}>
                      <Animated.View style={[styles.progressFill, progressStyle]} />
                    </View>
                  </View>
                </GestureDetector>
                <Pressable 
                  style={styles.seeReadingLink}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowReading(true);
                  }}
                >
                  <Text style={styles.seeReadingText}>See full reading</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.accent.primary} />
                </Pressable>
              </Animated.View>
            )}
          </View>

          {/* Prayer Input */}
          <View style={styles.prayerSection}>
            <PrayerInput readingId={date} readingDate={date} />
          </View>

          {/* Notification Prompt (shown once, after second session or first prayer) */}
          {showNotificationPrompt && (
            <NotificationPrompt onDismiss={() => setShowNotificationPrompt(false)} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.surface,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  // Header
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  greeting: {
    ...typography.displayLg,
    fontSize: 28, // Between displayLg (32) and displayMd (24)
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  backToToday: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    minHeight: touchTargets.minimum, // Ensure tappable
  },
  backToTodayText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.accent.primary,
    marginLeft: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  date: {
    ...typography.body,
    color: colors.text.muted,
  },
  dateChevron: {
    marginLeft: spacing.xs,
  },
  liturgicalInfo: {
    ...typography.caption,
    color: colors.accent.primary,
    marginTop: 2,
    fontStyle: 'italic',
  },

  // Audio Card
  audioCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  audioCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  audioCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent.primary, // Green for identity
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.subtle,
  },
  audioCardInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  audioCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioCardTitle: {
    ...typography.bodyStrong,
    color: colors.text.primary,
  },
  completedBadge: {
    marginLeft: spacing.xs,
  },
  audioCardDuration: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  progressSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  progressTouchArea: {
    height: 24,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.bg.subtle,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.accent.primary,
  },
  seeReadingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  seeReadingText: {
    ...typography.caption,
    color: colors.accent.primary,
    fontWeight: '500',
  },

  // Prayer Section
  prayerSection: {
    flex: 1,
  },

  // Loading & Error
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  retryText: {
    ...typography.bodyStrong,
    color: colors.accent.primary,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.title,
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
    padding: spacing.lg,
  },
  scriptureRef: {
    ...typography.scriptureReference,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  scriptureText: {
    ...typography.scripture,
    color: colors.text.scripture,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xl,
  },
  commentaryLabel: {
    ...typography.captionStrong,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  commentaryText: {
    ...typography.body,
    lineHeight: 28,
    color: colors.text.primary,
  },
});
