/**
 * ExamenSheet
 * 
 * Modal bottom sheet for Evening Examen.
 * Shows version selector (Standard, Short, Emotions), 5 steps, and inline audio player.
 * V4 design: 0px radius, Cinzel/Cormorant, 1px borders.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { InlineAudioPlayer } from '../../../components/InlineAudioPlayer';
import { useAudioStore, AudioContent, ExamenVersion } from '../../../stores/audioStore';
import { EXAMEN_VERSIONS, getExamenVersion, ExamenVersionData } from '../data/examenContent';
import { v4Colors, v4Typography, v4Spacing, v4Border } from '../../../theme/v4tokens';

interface ExamenSheetProps {
  visible: boolean;
  onClose: () => void;
  onExpand?: () => void;
}

export function ExamenSheet({ visible, onClose, onExpand }: ExamenSheetProps) {
  const insets = useSafeAreaInsets();
  const { showMini, currentContent, isPlaying } = useAudioStore();
  const [selectedVersion, setSelectedVersion] = useState<ExamenVersion>('standard');

  const examen = getExamenVersion(selectedVersion);

  if (!examen) return null;

  const audioContent: AudioContent = {
    id: `examen-${examen.id}`,
    type: 'examen',
    title: 'Evening Examen',
    subtitle: examen.displayTitle,
    audioUrl: examen.audioUrl,
    duration: examen.durationMs,
    examenVersion: examen.id,
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // If this content is playing, show mini-player
    if (currentContent?.type === 'examen' && isPlaying) {
      showMini();
    }
    
    onClose();
  };

  const handleVersionSelect = (version: ExamenVersion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedVersion(version);
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
            <Text style={styles.title}>EVENING EXAMEN</Text>
            <Text style={styles.duration}>{examen.duration}</Text>

            <Text style={styles.description}>{examen.description}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Version Selector */}
          <View style={styles.versionSelector}>
            {EXAMEN_VERSIONS.map((version) => (
              <Pressable
                key={version.id}
                style={[
                  styles.versionTab,
                  selectedVersion === version.id && styles.versionTabActive,
                ]}
                onPress={() => handleVersionSelect(version.id)}
              >
                <Text
                  style={[
                    styles.versionTabText,
                    selectedVersion === version.id && styles.versionTabTextActive,
                  ]}
                >
                  {version.displayTitle}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Audio Player */}
          <View style={styles.playerSection}>
            <InlineAudioPlayer content={audioContent} />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Five Steps */}
          <View style={styles.stepsSection}>
            <Text style={styles.stepsTitle}>THE FIVE STEPS</Text>

            {examen.steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={styles.stepNumber}>{index + 1}.</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
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
  title: {
    ...v4Typography.displayMedium,
    color: v4Colors.ink.primary,
    textAlign: 'center',
  },
  duration: {
    ...v4Typography.bodySmall,
    color: v4Colors.ink.muted,
    marginTop: v4Spacing.xs,
  },
  description: {
    ...v4Typography.body,
    color: v4Colors.ink.secondary,
    textAlign: 'center',
    marginTop: v4Spacing.lg,
    paddingHorizontal: v4Spacing.md,
  },
  divider: {
    height: v4Border.width,
    backgroundColor: v4Border.color,
    marginVertical: v4Spacing['2xl'],
  },
  versionSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: v4Spacing.xl,
  },
  versionTab: {
    paddingVertical: v4Spacing.sm,
    paddingHorizontal: v4Spacing.md,
    marginHorizontal: v4Spacing.xs,
  },
  versionTabActive: {
    borderBottomWidth: v4Border.width,
    borderBottomColor: v4Colors.ink.primary,
  },
  versionTabText: {
    ...v4Typography.label,
    color: v4Colors.ink.muted,
  },
  versionTabTextActive: {
    color: v4Colors.ink.primary,
  },
  playerSection: {
    // Player is inline
  },
  stepsSection: {
    paddingTop: v4Spacing.md,
  },
  stepsTitle: {
    ...v4Typography.label,
    color: v4Colors.ink.muted,
    marginBottom: v4Spacing.xl,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: v4Spacing.md,
  },
  stepNumber: {
    ...v4Typography.bodyLarge,
    color: v4Colors.ink.primary,
    fontWeight: '600',
    width: 24,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...v4Typography.bodyLarge,
    color: v4Colors.ink.primary,
    fontWeight: '600',
  },
  stepDescription: {
    ...v4Typography.body,
    color: v4Colors.ink.secondary,
    marginTop: v4Spacing.xs,
  },
});
