import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

import { usePrayerStore, Prayer } from '../stores';
import { useTheme, spacing, radius, touchTargets } from '../theme';

type FilterMode = 'active' | 'answered' | 'all';

export function PrayScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [filterMode, setFilterMode] = useState<FilterMode>('active');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { 
    prayers, 
    deletePrayer, 
    markAnswered, 
    unmarkAnswered,
    getActivePrayers,
    getAnsweredPrayers,
  } = usePrayerStore();

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Force re-render to get latest prayers
    }, [prayers])
  );

  const filteredPrayers = (() => {
    switch (filterMode) {
      case 'active':
        return getActivePrayers();
      case 'answered':
        return getAnsweredPrayers();
      case 'all':
      default:
        return prayers;
    }
  })();

  function handleDelete(prayer: Prayer) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Use native Alert per Edna's spec
    Alert.alert(
      'Delete this prayer?',
      undefined, // No message body
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePrayer(prayer.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }

  function handleToggleAnswered(prayer: Prayer) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (prayer.answeredAt) {
      unmarkAnswered(prayer.id);
    } else {
      markAnswered(prayer.id);
    }
  }

  async function handleShare(prayer: Prayer) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: 'You were on my heart today. 🙏',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  }

  // Group prayers by date
  const groupedPrayers = filteredPrayers.reduce((groups, prayer) => {
    const dateKey = prayer.createdAt.split('T')[0];
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(prayer);
    return groups;
  }, {} as Record<string, Prayer[]>);

  const sections = Object.entries(groupedPrayers)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, prayers]) => ({ date, prayers }));

  const renderPrayerItem = ({ item: prayer }: { item: Prayer }) => {
    const isExpanded = expandedId === prayer.id;
    const isAnswered = prayer.answeredAt !== null;

    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        layout={Layout.springify()}
      >
        <Pressable
          style={[styles.prayerCard, isAnswered && styles.prayerCardAnswered]}
          onPress={() => setExpandedId(isExpanded ? null : prayer.id)}
        >
          <View style={styles.prayerHeader}>
            {isAnswered && (
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={colors.semantic.success}
                style={styles.answeredIcon}
              />
            )}
            <Text
              style={[styles.prayerText, isAnswered && styles.prayerTextAnswered]}
              numberOfLines={isExpanded ? undefined : 2}
            >
              {prayer.content}
            </Text>
          </View>

          {isExpanded && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={styles.prayerActions}
            >
              <Pressable
                style={styles.actionButton}
                onPress={() => handleToggleAnswered(prayer)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={isAnswered ? 'close-circle-outline' : 'checkmark-circle-outline'}
                  size={20}
                  color={colors.text.secondary}
                />
                <Text style={styles.actionText}>
                  {isAnswered ? 'Unmark' : 'Answered'}
                </Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => handleShare(prayer)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="share-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.actionText}>Share</Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => handleDelete(prayer)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons 
                  name="trash-outline" 
                  size={20} 
                  color={colors.semantic.destructive} 
                />
                <Text style={[styles.actionText, styles.actionTextDestructive]}>
                  Delete
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  const renderSectionHeader = (date: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionDate}>{formatDate(date)}</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.accent.soft }]}>
        <Ionicons name="heart-outline" size={48} color={colors.accent.primary} />
      </View>
      <Text style={styles.emptyTitle}>
        {filterMode === 'answered' ? 'No answered prayers yet' : 'No prayers yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {filterMode === 'answered'
          ? 'Mark prayers as answered when God moves'
          : 'Your prayers will appear here'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prayers</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <Pressable
          style={[styles.filterTab, filterMode === 'active' && styles.filterTabActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setFilterMode('active');
          }}
        >
          <Text
            style={[
              styles.filterTabText,
              filterMode === 'active' && styles.filterTabTextActive,
            ]}
          >
            Active
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, filterMode === 'answered' && styles.filterTabActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setFilterMode('answered');
          }}
        >
          <Text
            style={[
              styles.filterTabText,
              filterMode === 'answered' && styles.filterTabTextActive,
            ]}
          >
            Answered
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, filterMode === 'all' && styles.filterTabActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setFilterMode('all');
          }}
        >
          <Text
            style={[
              styles.filterTabText,
              filterMode === 'all' && styles.filterTabTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>
      </View>

      {/* Prayer List */}
      <FlatList
        data={sections}
        keyExtractor={(item) => item.date}
        renderItem={({ item: section }) => (
          <View>
            {renderSectionHeader(section.date)}
            {section.prayers.map((prayer) => (
              <View key={prayer.id}>{renderPrayerItem({ item: prayer })}</View>
            ))}
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg.surface,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '600',
      color: colors.text.primary,
      fontFamily: 'Georgia',
    },

    // Filter Tabs
    filterTabs: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    filterTab: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginRight: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.bg.subtle,
      minHeight: touchTargets.minimum,
      justifyContent: 'center',
    },
    filterTabActive: {
      backgroundColor: colors.accent.primary, // Green for identity
    },
    filterTabText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text.secondary,
    },
    filterTabTextActive: {
      color: colors.text.inverse,
    },

    // List
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      flexGrow: 1,
    },

    // Section
    sectionHeader: {
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    sectionDate: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // Prayer Card
    prayerCard: {
      backgroundColor: colors.bg.elevated,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    prayerCardAnswered: {
      opacity: 0.7,
    },
    prayerHeader: {
      flexDirection: 'row',
    },
    answeredIcon: {
      marginRight: spacing.xs,
      marginTop: 2,
    },
    prayerText: {
      flex: 1,
      fontSize: 16,
      lineHeight: 24,
      color: colors.text.primary,
    },
    prayerTextAnswered: {
      color: colors.text.secondary,
    },

    // Actions
    prayerActions: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: spacing.lg,
      paddingVertical: spacing.xs,
      minHeight: touchTargets.minimum,
    },
    actionText: {
      fontSize: 14,
      color: colors.text.secondary,
      marginLeft: spacing.xs,
    },
    actionTextDestructive: {
      color: colors.semantic.destructive,
    },

    // Empty State
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 80,
    },
    emptyIconContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.sm,
      fontFamily: 'Georgia',
    },
    emptySubtitle: {
      fontSize: 15,
      color: colors.text.secondary,
      textAlign: 'center',
      paddingHorizontal: spacing.xl,
      lineHeight: 22,
    },
  });
