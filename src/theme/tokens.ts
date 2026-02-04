/**
 * Daily Parish Design Tokens
 * Refined Minimal Palette — Contemplative Premium
 */

// Light Mode
export const lightColors = {
  bg: {
    surface: '#F8F7F4',      // Warm paper white
    elevated: '#FFFFFF',
    subtle: '#F2F0EB',       // For nested elements
  },
  text: {
    primary: '#1C1C1E',      // Soft black
    secondary: '#48484A',
    muted: '#8E8E93',
    scripture: '#2C2C2E',    // Slightly warmer for reading
  },
  accent: '#3D5A47',         // Muted forest green
  accentSoft: 'rgba(61, 90, 71, 0.08)',
  border: '#E8E6E1',
  shadow: 'rgba(0, 0, 0, 0.04)',
};

// Dark Mode
export const darkColors = {
  bg: {
    surface: '#0D0D0D',
    elevated: '#1A1A1A',
    subtle: '#252525',
  },
  text: {
    primary: '#F5F5F7',
    secondary: '#A1A1A6',
    muted: '#636366',
    scripture: '#E5E5EA',
  },
  accent: '#D4A84B',         // Warm gold
  accentSoft: 'rgba(212, 168, 75, 0.12)',
  border: '#2C2C2E',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

// Legacy colors (for backwards compatibility during migration)
export const colors = {
  bg: {
    surface: lightColors.bg.surface,
    surfaceAlt: lightColors.bg.subtle,
    elevated: lightColors.bg.elevated,
  },
  text: {
    primary: lightColors.text.primary,
    secondary: lightColors.text.secondary,
    muted: lightColors.text.muted,
  },
  brand: {
    primary: lightColors.accent,
    primaryLight: '#4A6B54',
    primarySoft: lightColors.accentSoft,
  },
  accent: {
    gold: darkColors.accent,
    red: '#B5564A',
  },
  border: {
    subtle: lightColors.border,
    strong: '#C9C3B3',
  },
  state: {
    successBg: '#E7F4EC',
    errorBg: '#FBECEC',
  },
} as const;

export const typography = {
  displayLg: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600' as const,
    fontFamily: 'System',
  },
  displayMd: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    fontFamily: 'System',
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
    fontFamily: 'System',
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400' as const,
    fontFamily: 'System',
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500' as const,
    fontFamily: 'System',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    fontFamily: 'System',
  },
  scriptureHeading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    fontFamily: 'Georgia',
  },
  scriptureBody: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    fontFamily: 'Georgia',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const shadow = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;
