/**
 * Votive V4 Design Tokens
 * Library & Premium Content Design System
 * 
 * Philosophy:
 * - 0px radius (sharp, intentional)
 * - Cinzel for headings (liturgical gravitas)
 * - Cormorant for body (readable elegance)
 * - Parchment background (warmth)
 * - Thin 1px borders (delicate structure)
 */

export const v4Colors = {
  bg: {
    parchment: '#FAF9F6',   // Primary background
    elevated: '#FFFFFF',
    card: '#FFFFFF',
  },
  ink: {
    primary: '#1A1A1A',     // Primary text
    secondary: '#4A4A4A',
    muted: '#8E8E93',
    inverse: '#FFFFFF',
  },
  accent: {
    flame: '#C9954A',       // Burnished gold — progress, active states
    forest: '#3D5A47',      // Forest green — brand
    flameLight: 'rgba(201, 149, 74, 0.15)',
    forestLight: 'rgba(61, 90, 71, 0.08)',
  },
  border: {
    rule: '#E8E6E1',        // 1px dividers
    subtle: '#F0EDE8',
  },
  semantic: {
    success: '#16A34A',
    destructive: '#DC2626',
  },
} as const;

export const v4Typography = {
  // Cinzel — Display & Headers (liturgical gravitas)
  displayLarge: {
    fontFamily: 'Cinzel',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '400' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  displayMedium: {
    fontFamily: 'Cinzel',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  label: {
    fontFamily: 'Cinzel',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontFamily: 'Cinzel',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  
  // Cormorant — Body & Reading (elegant readability)
  bodyLarge: {
    fontFamily: 'Cormorant',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400' as const,
  },
  body: {
    fontFamily: 'Cormorant',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontFamily: 'Cormorant',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  quote: {
    fontFamily: 'Cormorant',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400' as const,
    fontStyle: 'italic' as const,
  },
} as const;

export const v4Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  '2xl': 60,
  '3xl': 80,
} as const;

// V4: All radii are 0px for sharp, intentional edges
export const v4Radius = {
  none: 0,
  pill: 999, // Exception for circular buttons
} as const;

export const v4Border = {
  width: 1,
  color: v4Colors.border.rule,
} as const;

export const v4IconSize = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

export const v4TouchTargets = {
  minimum: 44,
  standard: 48,
} as const;

// Progress bar specs
export const v4Progress = {
  trackHeight: 1,
  fillHeight: 2,
  thumbSize: 8,
} as const;
