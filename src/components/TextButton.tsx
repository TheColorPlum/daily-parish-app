import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '../theme';

/**
 * TextButton - Three-tier button hierarchy using borders, not fills
 * 
 * Follows V5 Implementation Spec:
 * - Primary: top+bottom border, main forward action
 * - Secondary: no border, alternative action
 * - Tertiary: muted color, back/cancel/dismiss
 * 
 * Use for text-only buttons. For filled buttons, use Button component.
 */

export type TextButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface TextButtonProps {
  label: string;
  onPress: () => void;
  /** Button emphasis level. Default: secondary */
  variant?: TextButtonVariant;
  /** Direct color override (takes precedence over variant) */
  color?: string;
  /** Custom text style overrides */
  textStyle?: TextStyle;
  /** Custom container style overrides */
  style?: ViewStyle;
  disabled?: boolean;
  /** Whether to trigger haptic feedback */
  haptic?: boolean;
}

export function TextButton({
  label,
  onPress,
  variant = 'secondary',
  color,
  textStyle,
  style,
  disabled = false,
  haptic = false,
}: TextButtonProps) {
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handlePress = async () => {
    if (disabled) return;
    
    if (haptic) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  // Determine container styles based on variant
  const containerStyles: ViewStyle[] = [styles.container];
  
  if (variant === 'primary') {
    containerStyles.push(styles.primary);
  }
  
  if (isPressed) {
    containerStyles.push(styles.pressed);
  }
  
  if (disabled) {
    containerStyles.push(styles.disabled);
  }

  // Determine text color
  let textColor = colors.text.primary; // Default for primary/secondary
  
  if (color) {
    textColor = color;
  } else if (variant === 'tertiary' || disabled) {
    textColor = colors.text.muted;
  }

  return (
    <Pressable
      style={[...containerStyles, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Text style={[styles.label, { color: textColor }, textStyle]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,  // 16px — increased from 8px for better tap target
    paddingHorizontal: spacing.lg, // 24px
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Touch target minimum
  },
  // Primary: bordered for emphasis
  primary: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  // Secondary: no border (default)
  // Tertiary: no border, color handled in text
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...typography.bodyStrong,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
