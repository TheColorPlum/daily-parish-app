/**
 * RosarySheet
 * 
 * Modal bottom sheet for Rosary prayers.
 * Shows mystery details, decades list, and inline audio player.
 * V4 design: 0px radius, Cinzel/Cormorant, 1px borders.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { InlineAudioPlayer } from '../../../components/InlineAudioPlayer';
import { useAudioStore, AudioContent } from '../../../stores/audioStore';
import { RosaryMysteryData } from '../data/rosaryContent';
import { v4Colors, v4Typography, v4Spacing, v4Border } from '../../../theme/v4tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RosarySheetProps {
  visible: boolean;
  mystery: RosaryMysteryData | null;
  onClose: () => void;
  onExpand?: () => void;
}

export function RosarySheet({ visible, mystery, onClose, onExpand }: RosarySheetProps) {
  const insets = useSafeAreaInsets();
  const { showMini, currentContent, isPlaying } = useAudioStore();

  if (!mystery) return null;

  const audioContent: AudioContent = {
    id: `rosary-${mystery.id}`,
    type: 'rosary',
    title: mystery.title,
    subtitle: mystery.displayTitle,
    audioUrl: mystery.audioUrl,
    duration: mystery.durationMs,
    mystery: mystery.id,
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // If this content is playing, show mini-player
    if (currentContent?.id === audioContent.id && isPlaying) {
      showMini();
    }
    
    onClose();
  };

  const handleDragClose = () => {
    // Same logic as handleClose
    if (currentContent?.id === audioContent.id && isPlaying) {
      showMini();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {/* Drag Handle */}
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.sectionLabel}>THE ROSARY</Text>
            <Text style={styles.mysteryTitle}>{mystery.displayTitle}</Text>
            <Text style={styles.duration}>{mystery.duration}</Text>

            <View style={styles.quoteContainer}>
              <Text style={styles.quote}>"{mystery.quote}"</Text>
              <Text style={styles.quoteAttribution}>— {mystery.quoteAttribution}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Audio Player */}
          <View style={styles.playerSection}>
            <InlineAudioPlayer content={audioContent} />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Decades List */}
          <View style={styles.decadesSection}>
            <Text style={styles.decadesTitle}>THE FIVE MYSTERIES</Text>

            {mystery.decades.map((decade, index) => (
              <View key={index} style={styles.decadeItem}>
                <Text style={styles.decadeTitle}>{decade.title}</Text>
                <Text style={styles.decadeScripture}>{decade.scripture}</Text>
              </View>
            ))}
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: v4Spacing['3xl'] }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: v4Colors.bg.parchment,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: v4Spacing.sm,
    paddingBottom: v4Spacing.md,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: v4Colors.border.rule,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: v4Spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: v4Spacing.xl,
  },
  sectionLabel: {
    ...v4Typography.label,
    color: v4Colors.ink.muted,
  },
  mysteryTitle: {
    ...v4Typography.displayMedium,
    color: v4Colors.ink.primary,
    marginTop: v4Spacing.sm,
    textAlign: 'center',
  },
  duration: {
    ...v4Typography.bodySmall,
    color: v4Colors.ink.muted,
    marginTop: v4Spacing.xs,
  },
  quoteContainer: {
    marginTop: v4Spacing.xl,
    alignItems: 'center',
  },
  quote: {
    ...v4Typography.quote,
    color: v4Colors.ink.secondary,
    textAlign: 'center',
    paddingHorizontal: v4Spacing.md,
  },
  quoteAttribution: {
    ...v4Typography.bodySmall,
    color: v4Colors.ink.muted,
    marginTop: v4Spacing.sm,
  },
  divider: {
    height: v4Border.width,
    backgroundColor: v4Border.color,
    marginVertical: v4Spacing['2xl'],
  },
  playerSection: {
    // Player is inline
  },
  decadesSection: {
    paddingTop: v4Spacing.md,
  },
  decadesTitle: {
    ...v4Typography.label,
    color: v4Colors.ink.muted,
    marginBottom: v4Spacing.xl,
  },
  decadeItem: {
    marginBottom: v4Spacing.md,
  },
  decadeTitle: {
    ...v4Typography.bodyLarge,
    color: v4Colors.ink.primary,
    fontWeight: '600',
  },
  decadeScripture: {
    ...v4Typography.bodySmall,
    color: v4Colors.ink.secondary,
    marginTop: v4Spacing.xs,
    fontStyle: 'italic',
  },
});
