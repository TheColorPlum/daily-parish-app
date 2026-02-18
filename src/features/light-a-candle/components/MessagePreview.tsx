import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, spacing, radius, typography } from '../../../theme';

const DEFAULT_MESSAGE = "I held you in my heart this morning.";
const SIGNATURE = "Sent with Votive";

interface MessagePreviewProps {
  message: string;
  onMessageChange: (message: string) => void;
}

export function MessagePreview({ message, onMessageChange }: MessagePreviewProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [modalVisible, setModalVisible] = useState(false);
  const [editText, setEditText] = useState(message);

  const handleTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditText(message);
    setModalVisible(true);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMessageChange(editText.trim() || DEFAULT_MESSAGE);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditText(DEFAULT_MESSAGE);
  };

  return (
    <>
      <Pressable style={styles.container} onPress={handleTap}>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{message}</Text>
          <Text style={styles.signature}>{SIGNATURE}</Text>
        </View>
        <View style={styles.editHint}>
          <Ionicons name="pencil-outline" size={14} color={colors.text.muted} />
          <Text style={styles.editHintText}>Tap to edit</Text>
        </View>
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancel}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalHeader}>
            <Pressable onPress={handleCancel} style={styles.headerButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Edit Message</Text>
            <Pressable onPress={handleSave} style={styles.headerButton}>
              <Text style={styles.saveText}>Done</Text>
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.textInput}
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
              placeholder="Write your message..."
              placeholderTextColor={colors.text.muted}
              maxLength={280}
            />
            
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>Preview</Text>
              <Text style={styles.previewText}>{editText || DEFAULT_MESSAGE}</Text>
              <Text style={styles.previewSignature}>{SIGNATURE}</Text>
            </View>

            <Pressable onPress={handleReset} style={styles.resetButton}>
              <Ionicons name="refresh-outline" size={16} color={colors.accent.primary} />
              <Text style={styles.resetText}>Reset to default</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

MessagePreview.DEFAULT_MESSAGE = DEFAULT_MESSAGE;
MessagePreview.SIGNATURE = SIGNATURE;

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    messageBox: {
      backgroundColor: colors.bg.elevated,
      borderRadius: radius.lg,
      padding: spacing.lg,
      width: '100%',
      maxWidth: 300,
      borderWidth: 1,
      borderColor: colors.border,
    },
    messageText: {
      ...typography.body,
      color: colors.text.primary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    signature: {
      ...typography.caption,
      color: colors.text.muted,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    editHint: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    editHintText: {
      ...typography.caption,
      color: colors.text.muted,
      marginLeft: spacing.xs,
    },

    // Modal
    modalContainer: {
      flex: 1,
      backgroundColor: colors.bg.surface,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerButton: {
      minWidth: 60,
    },
    modalTitle: {
      ...typography.bodyStrong,
      color: colors.text.primary,
    },
    cancelText: {
      ...typography.body,
      color: colors.text.secondary,
    },
    saveText: {
      ...typography.bodyStrong,
      color: colors.accent.primary,
      textAlign: 'right',
    },
    modalContent: {
      flex: 1,
      padding: spacing.lg,
    },
    textInput: {
      ...typography.body,
      color: colors.text.primary,
      backgroundColor: colors.bg.elevated,
      borderRadius: radius.md,
      padding: spacing.md,
      minHeight: 120,
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewBox: {
      backgroundColor: colors.bg.subtle,
      borderRadius: radius.md,
      padding: spacing.md,
      marginTop: spacing.lg,
    },
    previewLabel: {
      ...typography.captionStrong,
      color: colors.text.muted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.sm,
    },
    previewText: {
      ...typography.body,
      color: colors.text.primary,
      fontStyle: 'italic',
    },
    previewSignature: {
      ...typography.caption,
      color: colors.text.muted,
      marginTop: spacing.xs,
    },
    resetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.lg,
      padding: spacing.sm,
    },
    resetText: {
      ...typography.caption,
      color: colors.accent.primary,
      marginLeft: spacing.xs,
    },
  });
