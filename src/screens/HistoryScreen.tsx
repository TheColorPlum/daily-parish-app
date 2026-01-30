import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { 
  ScreenShell, 
  Card, 
  DisplayMd, 
  Body,
  BodyStrong,
  Caption,
  Button,
} from '../components';
import { api } from '../lib';
import { colors, spacing } from '../theme';
import type { HistoryItem } from '../types';
import type { MainStackParamList } from '../navigation';

type HistoryScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'History'>;

export function HistoryScreen() {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
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
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString + 'T12:00:00');
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleItemPress = (item: HistoryItem) => {
    navigation.navigate('HistoryDetail', { item });
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)} activeOpacity={0.7}>
      <Card style={styles.historyItem}>
        <View style={styles.itemHeader}>
          <BodyStrong>{formatDate(item.date)}</BodyStrong>
          <View style={styles.itemRight}>
            <Ionicons 
              name="checkmark-circle" 
              size={18} 
              color={colors.brand.primary} 
              style={styles.checkIcon}
            />
            <Ionicons 
              name="chevron-forward" 
              size={18} 
              color={colors.text.muted} 
            />
          </View>
        </View>
        <Caption color="secondary" style={styles.reference}>
          {item.first_reading.reference}
        </Caption>
        <Caption color="secondary">
          {item.gospel.reference}
        </Caption>
      </Card>
    </TouchableOpacity>
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

      {/* Error state */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Body color="secondary">{error}</Body>
          <Button
            title="Try again"
            variant="ghost"
            onPress={() => loadHistory()}
          />
        </View>
      )}

      {/* History List */}
      {!error && (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.date}
          renderItem={renderItem}
          ListEmptyComponent={!loading ? renderEmpty : null}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadHistory(true)}
              tintColor={colors.brand.primary}
            />
          }
        />
      )}

      {/* Loading state */}
      {loading && sessions.length === 0 && (
        <Body color="secondary" style={styles.loading}>
          Loading history...
        </Body>
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
    flexGrow: 1,
  },
  historyItem: {
    marginBottom: spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: spacing.xs,
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
  errorContainer: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
  },
});
