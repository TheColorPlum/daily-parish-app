import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import { 
  ScreenShell, 
  Card, 
  Button,
  DisplayMd, 
  Body, 
  Caption,
  ScriptureHeading,
  ScriptureBody,
} from '../components';
import { useTodayStore, useUserStore } from '../stores';
import { useAudioPlayer, useAppStateRefresh } from '../hooks';
import { api, ApiError } from '../lib';
import { colors, spacing } from '../theme';

export function TodayScreen() {
  const navigation = useNavigation();
  const { getToken } = useAuth();
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  
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

  // Audio player
  const audioPlayer = useAudioPlayer({
    onPlaybackComplete: handleAudioComplete,
  });

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

  async function loadTodayData() {
    try {
      setScreenState('loading');
      const token = await getToken();
      
      // Debug logging
      console.log('[TodayScreen] Token received:', token ? `${token.substring(0, 20)}...` : 'NULL');
      
      if (!token) {
        setError('Not authenticated');
        return;
      }

      // Fetch readings and start session in parallel
      const [readings, session] = await Promise.all([
        api.getTodayReadings(token),
        api.startSession(token).catch((err: ApiError) => {
          // 409 = already completed today
          if (err.status === 409) {
            return { session_id: null, already_completed: true };
          }
          throw err;
        }),
      ]);

      // Update store with readings
      setReadings({
        date: readings.date,
        first_reading: readings.first_reading,
        gospel: readings.gospel,
        commentary: readings.commentary_unified,
        audioUrl: readings.audio_unified_url,
      });

      // Handle session state
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
    
    setScreenState('content_consumed');
    await completeSession();
  }

  async function completeSession() {
    if (!sessionId || isCompletingSession) return;
    
    setIsCompletingSession(true);
    try {
      const token = await getToken();
      if (!token) return;

      const result = await api.completeSession(token, sessionId);
      
      if (result.success) {
        // Update streak
        setStreak({
          current_streak: result.streak.current_streak,
          longest_streak: result.streak.longest_streak,
          total_sessions: result.streak.current_streak, // Using current as approximation
        });
        
        // Mark first session complete
        if (!hasCompletedFirstSession) {
          setHasCompletedFirstSession(true);
        }
        
        // Haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        setScreenState('completed');
      }
    } catch (error) {
      console.error('Failed to complete session:', error);
      // Still show completion UI (optimistic)
      setScreenState('completed');
    } finally {
      setIsCompletingSession(false);
    }
  }

  function handlePlayPause() {
    audioPlayer.togglePlayback();
    
    // Dismiss orientation card on first play
    if (!hasCompletedFirstSession && !audioPlayer.isPlaying) {
      setHasCompletedFirstSession(true);
    }
    
    // Update screen state
    if (screenState === 'ready' && !audioPlayer.isPlaying) {
      setScreenState('playing');
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const d = new Date(dateString + 'T12:00:00'); // Avoid timezone issues
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Loading state
  if (screenState === 'loading') {
    return (
      <ScreenShell>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Body color="secondary" style={styles.loadingText}>
            Loading today's readings...
          </Body>
        </View>
      </ScreenShell>
    );
  }

  // Error state
  if (screenState === 'error') {
    return (
      <ScreenShell>
        <View style={styles.errorHeader}>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Body color="secondary" style={styles.errorText}>
            {useTodayStore.getState().errorMessage || 'Something went wrong.'}
          </Body>
          <Button 
            title="Try again" 
            variant="ghost" 
            onPress={loadTodayData}
            style={styles.retryButton}
          />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings' as never)}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        
        <DisplayMd>Today's Prayer</DisplayMd>
        <Caption color="secondary">{formatDate(date)}</Caption>
      </View>

      {/* Orientation Card - First session only */}
      {!hasCompletedFirstSession && screenState === 'ready' && (
        <TouchableOpacity onPress={() => setHasCompletedFirstSession(true)}>
          <Card variant="alt" style={styles.section}>
            <Body>
              Today's prayer takes about 5 minutes. Press play to listen, or read along below.
            </Body>
          </Card>
        </TouchableOpacity>
      )}

      {/* Audio Player */}
      {screenState !== 'completed' ? (
        <Card style={styles.section}>
          <View style={styles.audioPlayer}>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={handlePlayPause}
              disabled={!audioPlayer.isLoaded && !audioPlayer.error}
            >
              {audioPlayer.isBuffering ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons 
                  name={audioPlayer.isPlaying ? 'pause' : 'play'} 
                  size={24} 
                  color="#FFFFFF" 
                />
              )}
            </TouchableOpacity>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${audioPlayer.progress * 100}%` }
                  ]} 
                />
              </View>
              <Caption color="muted">
                {audioPlayer.formattedPosition} / {audioPlayer.formattedDuration}
              </Caption>
            </View>
          </View>
        </Card>
      ) : (
        // Completed audio state - minimal
        <Card style={styles.section}>
          <View style={styles.completedAudio}>
            <Ionicons name="checkmark" size={16} color={colors.brand.primary} />
            <Caption color="muted" style={styles.completedAudioText}>
              Today's audio
            </Caption>
          </View>
        </Card>
      )}

      {/* First Reading */}
      {firstReading && (
        <Card style={styles.section}>
          <ScriptureHeading style={styles.reference}>
            {firstReading.reference}
          </ScriptureHeading>
          <View style={styles.divider} />
          <ScriptureBody>{firstReading.text}</ScriptureBody>
        </Card>
      )}

      {/* Gospel */}
      {gospel && (
        <Card style={styles.section}>
          <ScriptureHeading style={styles.reference}>
            {gospel.reference}
          </ScriptureHeading>
          <View style={styles.divider} />
          <ScriptureBody>{gospel.text}</ScriptureBody>
        </Card>
      )}

      {/* Commentary */}
      {commentary && (
        <Card variant="alt" style={styles.section}>
          <Caption color="muted" style={styles.commentaryLabel}>
            Commentary
          </Caption>
          <Body>{commentary}</Body>
        </Card>
      )}

      {/* Mark as Complete button (for silent readers) */}
      {screenState === 'content_consumed' && !isCompletingSession && (
        <Button
          title="Mark as complete"
          variant="ghost"
          onPress={completeSession}
          style={styles.completeButton}
        />
      )}

      {/* Completion Panel */}
      {screenState === 'completed' && (
        <Card style={styles.completionPanel}>
          <Ionicons name="checkmark" size={32} color={colors.accent.gold} />
          <DisplayMd style={styles.completionTitle}>You prayed today.</DisplayMd>
          <Body color="secondary">
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'} of prayer
          </Body>
          <Button
            title="View History"
            variant="ghost"
            onPress={() => navigation.navigate('History' as never)}
            style={styles.historyButton}
          />
        </Card>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing['2xl'],
  },
  settingsButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: spacing.sm,
    zIndex: 1,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border.subtle,
    borderRadius: 2,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 2,
  },
  completedAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  completedAudioText: {
    marginLeft: spacing.xs,
  },
  reference: {
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginBottom: spacing.lg,
  },
  commentaryLabel: {
    marginBottom: spacing.sm,
  },
  completeButton: {
    alignSelf: 'center',
    marginBottom: spacing['2xl'],
  },
  completionPanel: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    marginBottom: spacing['2xl'],
  },
  completionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  historyButton: {
    marginTop: spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  loadingText: {
    marginTop: spacing.lg,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  retryButton: {
    marginTop: spacing.sm,
  },
});
