import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { 
  ScreenShell, 
  Card, 
  DisplayMd, 
  Body,
  BodyStrong,
  Caption,
} from '../components';
import { api } from '../lib';
import { colors, spacing } from '../theme';
import type { HistoryItem } from '../types';

export function HistoryScreen() {
  const navigation = useNavigation();
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
      const token = await getToken();
      if (!token) return;
      
      const data = await api.getHistory(token);
      setSessions(data.sessions);
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Card style={styles.historyItem}>
      <BodyStrong>{formatDate(item.date)}</BodyStrong>
      <Caption color="secondary" style={styles.reference}>
        {item.first_reading_reference}
      </Caption>
      <Caption color="secondary">
        {item.gospel_reference}
      </Caption>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Body color="secondary" style={styles.emptyText}>
        Your prayer history will appear here after your first session.
      </Body>
    </View>
  );

  return (
    <ScreenShell scrollable={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <DisplayMd>History</DisplayMd>
      </View>

      {/* History List */}
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.session_id}
        renderItem={renderItem}
        ListEmptyComponent={!loading ? renderEmpty : null}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Loading state */}
      {loading && (
        <Body color="secondary" style={styles.loading}>
          Loading history...
        </Body>
      )}

      {/* Error state */}
      {error && (
        <View style={styles.error}>
          <Body color="secondary">{error}</Body>
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  backButton: {
    marginRight: spacing.lg,
  },
  list: {
    paddingBottom: spacing['2xl'],
  },
  historyItem: {
    marginBottom: spacing.sm,
  },
  reference: {
    marginTop: spacing.xs,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing['3xl'],
  },
  emptyText: {
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
    marginTop: spacing['3xl'],
  },
  error: {
    textAlign: 'center',
    marginTop: spacing['3xl'],
  },
});
