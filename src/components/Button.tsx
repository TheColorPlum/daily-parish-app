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
          color={variant === 'primary' ? '#FFFFFF' : colors.brand.primary} 
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
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  text: {
    ...typography.bodyStrong,
  },
  // Primary
  primary: {
    backgroundColor: colors.brand.primary,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  // Secondary
  secondary: {
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  secondaryText: {
    color: colors.text.primary,
  },
  // Ghost
  ghost: {
    backgroundColor: 'transparent',
    height: 'auto',
    paddingVertical: spacing.md,
  },
  ghostText: {
    color: colors.brand.primary,
  },
  ghostDestructiveText: {
    color: colors.accent.red,
  },
  // Disabled
  disabled: {
    opacity: 0.5,
  },
});
