/**
 * Daily Parish Design Tokens
 * Based on Frontend-App/03-design-system.md
 */

export const colors = {
  bg: {
    surface: '#FAF9F6',
    surfaceAlt: '#F1EEE6',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#212121',
    secondary: '#4A4A4A',
    muted: '#777777',
  },
  brand: {
    primary: '#2D5A3F',
    primaryLight: '#3E7A56',
    primarySoft: '#E4EFE8',
  },
  accent: {
    gold: '#C89B3C',
    red: '#B5564A',
  },
  border: {
    subtle: '#E2DED2',
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
    fontFamily: 'System', // Will use Inter/Work Sans when configured
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
    fontFamily: 'Georgia', // Serif for scripture
  },
  scriptureBody: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    fontFamily: 'Georgia', // Serif for scripture
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
  pill: 999,
} as const;

export const shadow = {
  subtle: {
    // iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    // Android
    elevation: 1,
  },
} as const;
