import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useTheme, spacing, radius, typography, touchTargets } from '../theme';

interface DatePickerSheetProps {
  visible: boolean;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

/**
 * Get the last 7 days as an array of date strings (YYYY-MM-DD)
 */
function getLast7Days(): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  
  return dates;
}

/**
 * Format date for display
 */
function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Check if date is today
 */
function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

export function DatePickerSheet({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
}: DatePickerSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);
  
  const dates = getLast7Days();

  function handleSelectDate(date: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectDate(date);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Date</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </Pressable>
        </View>

        {/* Date List */}
        <View style={styles.dateList}>
          {dates.map((date) => {
            const isSelected = date === selectedDate;
            const today = isToday(date);

            return (
              <Pressable
                key={date}
                style={[
                  styles.dateRow,
                  isSelected && styles.dateRowSelected,
                ]}
                onPress={() => handleSelectDate(date)}
              >
                <Text
                  style={[
                    styles.dateText,
                    isSelected && styles.dateTextSelected,
                  ]}
                >
                  {formatDateDisplay(date)}
                </Text>
                {today && (
                  <Text style={styles.todayLabel}>← Today</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
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
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      ...typography.title,
      color: colors.text.primary,
    },
    closeButton: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      minHeight: touchTargets.minimum,
      justifyContent: 'center',
    },
    closeText: {
      ...typography.bodyStrong,
      color: colors.accent.primary,
    },
    dateList: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
    dateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      marginBottom: spacing.xs,
      minHeight: touchTargets.comfortable,
    },
    dateRowSelected: {
      backgroundColor: colors.accent.soft,
    },
    dateText: {
      ...typography.body,
      color: colors.text.primary,
    },
    dateTextSelected: {
      ...typography.bodyStrong,
      color: colors.accent.primary,
    },
    todayLabel: {
      ...typography.caption,
      color: colors.text.muted,
    },
  });
