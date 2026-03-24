/**
 * LibraryScreen
 * 
 * Main Library tab screen.
 * Shows Recent Reflections (archive) and Devotions (Rosary, Examen).
 * V4 design: 0px radius, Cinzel/Cormorant, 1px borders.
 * 
 * Premium gating: Free users see locked content, premium users can access.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { RosarySheet, ExamenSheet } from './components';
import { ROSARY_MYSTERIES, RosaryMysteryData, getRosaryMystery } from './data';
import { v4Colors, v4Typography, v4Spacing, v4Border, v4Radius } from '../../theme/v4tokens';
import { useAudioStore, RosaryMystery } from '../../stores/audioStore';
import { useSubscriptionStore } from '../../stores';

export function LibraryScreen() {
  const [selectedMystery, setSelectedMystery] = useState<RosaryMysteryData | null>(null);
  const [showExamen, setShowExamen] = useState(false);
  
  // Subscription check for premium gating
  const isPremium = useSubscriptionStore((state) => state.isPremium);
  
  // Audio store for pending expand handling
  const { currentContent, pendingExpand, clearPendingExpand } = useAudioStore();

  // Handle pending expand when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (pendingExpand && currentContent) {
        // Clear the flag first
        clearPendingExpand();
        
        // Open the appropriate sheet based on content type
        if (currentContent.type === 'rosary' && currentContent.mystery) {
          const mystery = getRosaryMystery(currentContent.mystery);
          if (mystery) {
            setSelectedMystery(mystery);
          }
        } else if (currentContent.type === 'examen') {
          setShowExamen(true);
        }
      }
    }, [pendingExpand, currentContent])
  );

  const showPaywall = () => {
    Alert.alert(
      'Premium Content',
      'Upgrade to Votive+ to access guided Rosary and Evening Examen.',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Learn More', onPress: () => {
          // TODO: Navigate to subscription screen
        }},
      ]
    );
  };

  const handleRosaryPress = (mystery: RosaryMysteryData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!isPremium) {
      showPaywall();
      return;
    }
    
    setSelectedMystery(mystery);
  };

  const handleExamenPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!isPremium) {
      showPaywall();
      return;
    }
    
    setShowExamen(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>LIBRARY</Text>
        </View>

        {/* Recent Reflections Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT REFLECTIONS</Text>
          
          {/* Empty state for now - will be populated from archive */}
          <View style={styles.emptyArchive}>
            <Text style={styles.emptyText}>Your journey begins here.</Text>
            <Text style={styles.emptySubtext}>
              Complete today's reflection to build your archive.
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Devotions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DEVOTIONS</Text>

          {/* Rosary Card */}
          <Pressable style={styles.devotionCard} onPress={() => handleRosaryPress(ROSARY_MYSTERIES[0])}>
            <View style={styles.devotionCardContent}>
              <View style={styles.devotionHeader}>
                <Text style={styles.devotionTitle}>THE ROSARY</Text>
                {!isPremium && (
                  <View style={styles.lockBadge}>
                    <Ionicons name="lock-closed" size={12} color={v4Colors.accent.flame} />
                  </View>
                )}
              </View>
              <Text style={styles.devotionSubtitle}>4 Mysteries • 20-25 min each</Text>
              {!isPremium && <Text style={styles.devotionLabel}>Premium</Text>}
            </View>
          </Pressable>

          {/* Mystery Quick Access */}
          <View style={styles.mysteriesRow}>
            {ROSARY_MYSTERIES.map((mystery) => (
              <Pressable
                key={mystery.id}
                style={[styles.mysteryChip, isPremium && styles.mysteryChipActive]}
                onPress={() => handleRosaryPress(mystery)}
              >
                <Text style={[styles.mysteryChipText, isPremium && styles.mysteryChipTextActive]}>
                  {mystery.title.replace(' Mysteries', '')}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Examen Card */}
          <Pressable style={styles.devotionCard} onPress={handleExamenPress}>
            <View style={styles.devotionCardContent}>
              <View style={styles.devotionHeader}>
                <Text style={styles.devotionTitle}>EVENING EXAMEN</Text>
                {!isPremium && (
                  <View style={styles.lockBadge}>
                    <Ionicons name="lock-closed" size={12} color={v4Colors.accent.flame} />
                  </View>
                )}
              </View>
              <Text style={styles.devotionSubtitle}>Daily reflection • 5-12 min</Text>
              {!isPremium && <Text style={styles.devotionLabel}>Premium</Text>}
            </View>
          </Pressable>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: v4Spacing['3xl'] }} />
      </ScrollView>

      {/* Rosary Sheet */}
      <RosarySheet
        visible={selectedMystery !== null}
        mystery={selectedMystery}
        onClose={() => setSelectedMystery(null)}
      />

      {/* Examen Sheet */}
      <ExamenSheet
        visible={showExamen}
        onClose={() => setShowExamen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: v4Colors.bg.parchment,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: v4Spacing.lg,
  },
  header: {
    paddingTop: v4Spacing.lg,
    paddingBottom: v4Spacing.xl,
  },
  title: {
    ...v4Typography.displayLarge,
    color: v4Colors.ink.primary,
  },
  section: {
    paddingVertical: v4Spacing.md,
  },
  sectionTitle: {
    ...v4Typography.label,
    color: v4Colors.ink.muted,
    marginBottom: v4Spacing.lg,
  },
  divider: {
    height: v4Border.width,
    backgroundColor: v4Border.color,
    marginVertical: v4Spacing.lg,
  },
  emptyArchive: {
    padding: v4Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...v4Typography.body,
    color: v4Colors.ink.secondary,
    textAlign: 'center',
  },
  emptySubtext: {
    ...v4Typography.bodySmall,
    color: v4Colors.ink.muted,
    textAlign: 'center',
    marginTop: v4Spacing.sm,
  },
  devotionCard: {
    backgroundColor: v4Colors.bg.elevated,
    borderWidth: v4Border.width,
    borderColor: v4Border.color,
    borderRadius: v4Radius.none,
    marginBottom: v4Spacing.md,
    overflow: 'hidden',
  },
  devotionCardContent: {
    padding: v4Spacing.lg,
  },
  devotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  devotionTitle: {
    ...v4Typography.displayMedium,
    color: v4Colors.ink.primary,
    fontSize: 16,
  },
  lockBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: v4Colors.accent.flameLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  devotionSubtitle: {
    ...v4Typography.bodySmall,
    color: v4Colors.ink.secondary,
    marginTop: v4Spacing.xs,
  },
  devotionLabel: {
    ...v4Typography.label,
    color: v4Colors.accent.flame,
    marginTop: v4Spacing.sm,
    fontSize: 10,
  },
  mysteriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: v4Spacing.lg,
    marginTop: -v4Spacing.xs,
  },
  mysteryChip: {
    paddingVertical: v4Spacing.xs,
    paddingHorizontal: v4Spacing.sm,
    borderWidth: v4Border.width,
    borderColor: v4Border.color,
    marginRight: v4Spacing.xs,
    marginBottom: v4Spacing.xs,
  },
  mysteryChipActive: {
    borderColor: v4Colors.accent.forest,
  },
  mysteryChipText: {
    ...v4Typography.label,
    color: v4Colors.ink.secondary,
    fontSize: 9,
  },
  mysteryChipTextActive: {
    color: v4Colors.accent.forest,
  },
});
