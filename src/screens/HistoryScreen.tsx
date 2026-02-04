import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { MonthCalendar } from '../components/MonthCalendar';
import { api } from '../lib';
import { lightColors as colors, spacing } from '../theme';
import type { HistoryItem } from '../types';
import type { DrawerParamList } from '../navigation/AppNavigator';

type HistoryScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'History'>;

export function HistoryScreen() {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) return;
      
      const data = await api.getHistory(token);
      setSessions(data);
    } catch (err) {
      setError('Failed to load history');
      console.error('History error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Build set of completed dates and map for lookup
  const { completedDates, sessionsByDate } = useMemo(() => {
    const dates = new Set<string>();
    const byDate = new Map<string, HistoryItem>();
    
    for (const session of sessions) {
      dates.add(session.date);
      byDate.set(session.date, session);
    }
    
    return { completedDates: dates, sessionsByDate: byDate };
  }, [sessions]);

  const handleDayPress = (date: string) => {
    const session = sessionsByDate.get(date);
    if (session) {
      (navigation as any).navigate('HistoryDetail', { item: session });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Ionicons name="menu" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.title}>History</Text>
        
        <View style={{ width: 44 }} />
      </View>

      {/* Loading state */}
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      )}

      {/* Error state */}
      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadHistory}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Calendar */}
      {!loading && !error && (
        <View style={styles.calendarContainer}>
          <MonthCalendar
            completedDates={completedDates}
            onDayPress={handleDayPress}
          />
          
          {sessions.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Your prayer history will appear here after your first session.
              </Text>
            </View>
          )}
          
          {sessions.length > 0 && (
            <View style={styles.stats}>
              <Text style={styles.statsText}>
                {sessions.length} {sessions.length === 1 ? 'day' : 'days'} of prayer
              </Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
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
  calendarContainer: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  stats: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  statsText: {
    fontSize: 15,
    color: colors.text.muted,
  },
});
