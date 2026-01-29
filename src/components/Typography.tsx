import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

type TypographyVariant = keyof typeof typography;

interface TypographyProps {
  variant?: TypographyVariant;
  color?: 'primary' | 'secondary' | 'muted';
  children: React.ReactNode;
  style?: TextStyle;
  numberOfLines?: number;
}

export function Text({
  variant = 'body',
  color = 'primary',
  children,
  style,
  numberOfLines,
}: TypographyProps) {
  const textColor = colors.text[color];
  const variantStyle = typography[variant];

  return (
    <RNText
      style={[
        { color: textColor },
        variantStyle,
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  );
}

// Convenience components for common patterns
export function DisplayLg({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Text variant="displayLg" {...props}>{children}</Text>;
}

export function DisplayMd({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Text variant="displayMd" {...props}>{children}</Text>;
}

export function Title({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Text variant="title" {...props}>{children}</Text>;
}

export function Body({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Text variant="body" {...props}>{children}</Text>;
}

export function BodyStrong({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Text variant="bodyStrong" {...props}>{children}</Text>;
}

export function Caption({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Text variant="caption" {...props}>{children}</Text>;
}

export function ScriptureHeading({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Text variant="scriptureHeading" {...props}>{children}</Text>;
}

export function ScriptureBody({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Text variant="scriptureBody" {...props}>{children}</Text>;
}
