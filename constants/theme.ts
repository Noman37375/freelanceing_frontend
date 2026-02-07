// App color palette: E5E4EA, F4F4F8, 282A32, 444751, C2C2C8
export const COLORS = {
  primary: '#0F172A', // Black / Slate 900
  primaryDark: '#020617', // Slate 950
  primaryLight: '#818CF8', // Indigo 400

  secondary: '#444751',
  secondaryDark: '#282A32',

  background: '#282A32',
  backgroundLight: '#F4F4F8',
  surface: '#444751',
  surfaceHighlight: '#444751',
  surfaceMuted: '#E5E4EA',
  border: '#E5E4EA',
  borderMuted: '#C2C2C8',

  textPrimary: '#282A32',
  textSecondary: '#444751',
  textTertiary: '#C2C2C8',

  success: '#10B981', // Emerald 500
  warning: '#F59E0B', // Amber 500
  error: '#EF4444', // Red 500
  info: '#0F172A', // Black

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Glassmorphism helpers
  glass: 'rgba(40, 42, 50, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glassLight: 'rgba(255, 255, 255, 0.05)',
  glassDark: 'rgba(40, 42, 50, 0.6)',
};

export const GRADIENTS = {
  primary: ['#444751', '#282A32'],
  secondary: ['#444751', '#282A32'],
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  error: ['#EF4444', '#DC2626'],
  info: ['#0F172A', '#1E293B'],
  purple: ['#8B5CF6', '#7C3AED'],
  ocean: ['#06B6D4', '#0891B2'],
  sunset: ['#F59E0B', '#EC4899'],
  midnight: ['#1E1B4B', '#312E81'],
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

export const BORDER_RADIUS = {
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  full: 9999,
};

export const OPACITY = {
  disabled: 0.5,
  hover: 0.8,
  pressed: 0.6,
  overlay: 0.9,
  subtle: 0.1,
  medium: 0.5,
};

export const ANIMATIONS = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    linear: 'linear' as const,
    easeIn: 'ease-in' as const,
    easeOut: 'ease-out' as const,
    easeInOut: 'ease-in-out' as const,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  glowSuccess: {
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  glowWarning: {
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
};
