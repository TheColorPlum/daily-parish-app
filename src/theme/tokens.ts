/**
 * Votive Design Tokens
 * Chapel Energy — Quiet Confidence
 * 
 * Updated: 2026-02-12
 * Signed off by: Pelumi
 * 
 * Philosophy:
 * - Orange = action (warm, inviting)
 * - Green = presence (identity, trust)
 * - Gold = warmth in darkness (candlelight)
 * - Every value intentional. No magic numbers.
 */

// ===========================================
// COLORS
// ===========================================

// Light Mode (V1 ships light only)
export const lightColors = {
  bg: {
    surface: '#FAF9F6',      // Warm cream — chapel warmth
    elevated: '#FFFFFF',
    subtle: '#F2F0EB',       // Nested elements
  },
  text: {
    primary: '#1A1A1A',      // Soft black
    secondary: '#666666',
    muted: '#8E8E93',
    scripture: '#2C2C2E',    // Slightly warmer for reading
    inverse: '#FFFFFF',      // Text on dark backgrounds
  },
  accent: {
    primary: '#3D5A47',      // Forest green — identity, presence
    cta: '#F97316',          // Orange — action, buttons
    soft: 'rgba(61, 90, 71, 0.08)',
    ctaSoft: 'rgba(249, 115, 22, 0.08)',
  },
  semantic: {
    destructive: '#DC2626',
    destructiveSoft: 'rgba(220, 38, 38, 0.08)',
    success: '#16A34A',
    successSoft: '#E7F4EC',
  },
  border: '#E8E6E1',
  shadow: 'rgba(0, 0, 0, 0.04)',
};

// Dark Mode (ready for V2, not shipped in V1)
export const darkColors = {
  bg: {
    surface: '#0A1910',      // Green-black — liturgical warmth
    elevated: '#142318',
    subtle: '#1C2E22',
  },
  text: {
    primary: '#F5F5F5',
    secondary: '#A0A0A0',
    muted: '#636366',
    scripture: '#E5E5EA',
    inverse: '#1A1A1A',
  },
  accent: {
    primary: '#D4A84B',      // Warm gold — candlelight
    cta: '#FB923C',          // Lighter orange for dark contrast
    soft: 'rgba(212, 168, 75, 0.12)',
    ctaSoft: 'rgba(251, 146, 60, 0.12)',
  },
  semantic: {
    destructive: '#EF4444',
    destructiveSoft: 'rgba(239, 68, 68, 0.12)',
    success: '#22C55E',
    successSoft: 'rgba(34, 197, 94, 0.12)',
  },
  border: '#2C3E32',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

// Active palette (V1 = light only)
export const colors = lightColors;

// ===========================================
// TYPOGRAPHY
// Georgia for reverence. System for clarity.
// ===========================================

export const typography = {
  // Display — Georgia for weight and presence
  displayLg: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    fontFamily: 'Georgia',
  },
  displayMd: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    fontFamily: 'Georgia',
  },
  
  // Titles — Georgia for continuity
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
    fontFamily: 'Georgia',
  },
  
  // Body — System for clarity
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    fontFamily: 'System',
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
    fontFamily: 'System',
  },
  
  // Caption
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    fontFamily: 'System',
  },
  captionStrong: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
    fontFamily: 'System',
  },
  
  // Scripture — Georgia italic, contemplative size
  scripture: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '400' as const,
    fontFamily: 'Georgia',
    fontStyle: 'italic' as const,
  },
  scriptureReference: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
    fontFamily: 'System',
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  
  // Tab bar labels
  tabLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as const,
    fontFamily: 'System',
  },
} as const;

// ===========================================
// SPACING — Rhythm matters
// ===========================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
} as const;

// ===========================================
// RADIUS
// ===========================================

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

// ===========================================
// SHADOWS
// ===========================================

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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

// ===========================================
// ANIMATION TIMING
// Chapel energy: moments that breathe
// ===========================================

export const timing = {
  // Instant feedback
  instant: 100,
  
  // Standard transitions
  fast: 200,
  normal: 300,
  
  // Deliberate moments
  slow: 400,
  
  // Sacred pause
  breath: 1500,
  breathLong: 2000,
} as const;

export const easing = {
  standard: 'ease-in-out',
  enter: 'ease-out',
  exit: 'ease-in',
} as const;

// Toast-specific timing
export const toastTiming = {
  standard: {
    hold: 1500,
    fadeIn: 200,
    fadeOut: 300,
  },
  milestone: {
    hold: 2000,
    fadeIn: 300,
    fadeOut: 400,
    // Subtle pulse: 1.0 → 1.02 → 1.0 over 600ms
    pulse: {
      scale: 1.02,
      duration: 200, // per phase (up, hold, down)
    },
  },
} as const;

// ===========================================
// COMPONENT SPECS
// ===========================================

export const touchTargets = {
  minimum: 44,
  comfortable: 48,
  large: 56,
} as const;

export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

// TabBar
export const tabBar = {
  height: 56,
  iconSize: 24,
  labelSize: 11,
  activeColor: lightColors.accent.primary,
  inactiveColor: lightColors.text.muted,
} as const;

// PrayerInput
export const prayerInput = {
  minHeight: 120,
  padding: 16, // spacing.md
  borderRadius: 12, // radius.md
  borderWidth: 1,
  borderWidthFocused: 2,
  borderColor: lightColors.border,
  borderColorFocused: lightColors.accent.cta,
  placeholderColor: lightColors.text.muted,
  buttonDisabledOpacity: 0.4,
} as const;

// AudioCard
export const audioCard = {
  playButtonSize: 48,
  progressHeight: 4,
  progressTouchHeight: 24,
} as const;
