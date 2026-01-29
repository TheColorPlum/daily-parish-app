import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { 
  ScreenShell, 
  Card, 
  DisplayMd, 
  Body, 
  Caption,
  ScriptureHeading,
  ScriptureBody,
} from '../components';
import { useTodayStore, useUserStore } from '../stores';
import { api } from '../lib';
import { colors, spacing } from '../theme';

export function TodayScreen() {
  const navigation = useNavigation();
  const { getToken } = useAuth();
  const { 
    date, 
    firstReading, 
    gospel, 
    commentary,
    screenState,
    setReadings,
    setError,
  } = useTodayStore();
  const { hasCompletedFirstSession } = useUserStore();

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const data = await api.getTodayReadings(token);
      setReadings(data);
    } catch (error) {
      setError('Failed to load today\'s readings');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

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
      {!hasCompletedFirstSession && (
        <Card variant="alt" style={styles.section}>
          <Body>
            Today's prayer takes about 5 minutes. Press play to listen, or read along below.
          </Body>
        </Card>
      )}

      {/* Audio Player Placeholder */}
      <Card style={styles.section}>
        <View style={styles.audioPlayer}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '0%' }]} />
            </View>
            <Caption color="muted">0:00 / 5:00</Caption>
          </View>
        </View>
      </Card>

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

      {/* Loading/Error states would go here */}
      {screenState === 'loading' && !firstReading && (
        <Body color="secondary" style={styles.loading}>
          Loading today's readings...
        </Body>
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
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 2,
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
  loading: {
    textAlign: 'center',
    marginTop: spacing['3xl'],
  },
});
