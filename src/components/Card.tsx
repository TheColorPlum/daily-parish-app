import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, radius, shadow } from '../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'alt';
  withShadow?: boolean;
  style?: ViewStyle;
}

export function Card({ 
  children, 
  variant = 'elevated', 
  withShadow = false,
  style 
}: CardProps) {
  return (
    <View 
      style={[
        styles.base,
        variant === 'elevated' ? styles.elevated : styles.alt,
        withShadow && shadow.subtle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: spacing.xl,
    borderRadius: radius.lg,
  },
  elevated: {
    backgroundColor: colors.bg.elevated,
  },
  alt: {
    backgroundColor: colors.bg.subtle,
  },
});
