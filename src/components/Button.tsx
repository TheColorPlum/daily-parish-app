import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, radius, spacing } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  destructive?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  destructive = false,
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const handlePress = async () => {
    if (variant === 'primary') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const buttonStyles: ViewStyle[] = [styles.base];
  const textStyles: TextStyle[] = [styles.text];

  switch (variant) {
    case 'primary':
      buttonStyles.push(styles.primary);
      textStyles.push(styles.primaryText);
      break;
    case 'secondary':
      buttonStyles.push(styles.secondary);
      textStyles.push(styles.secondaryText);
      break;
    case 'ghost':
      buttonStyles.push(styles.ghost);
      textStyles.push(
        destructive ? styles.ghostDestructiveText : styles.ghostText
      );
      break;
  }

  if (disabled || loading) {
    buttonStyles.push(styles.disabled);
  }

  return (
    <TouchableOpacity
      style={[...buttonStyles, style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? colors.text.inverse : colors.accent.cta} 
          size="small" 
        />
      ) : (
        <Text style={[...textStyles, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.sm, // 8px per spec
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  text: {
    ...typography.bodyStrong,
  },
  // Primary - Orange CTA
  primary: {
    backgroundColor: colors.accent.cta,
  },
  primaryText: {
    color: colors.text.inverse,
  },
  // Secondary - Outlined
  secondary: {
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.text.primary,
  },
  // Ghost - Text only
  ghost: {
    backgroundColor: 'transparent',
    height: 'auto',
    paddingVertical: spacing.md,
  },
  ghostText: {
    color: colors.accent.primary, // Green for links
  },
  ghostDestructiveText: {
    color: colors.semantic.destructive,
  },
  // Disabled
  disabled: {
    opacity: 0.5,
  },
});
