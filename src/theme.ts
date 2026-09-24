export const colors = {
  background: '#120B07',
  surface: '#1E140E',
  surfaceAlt: '#271A12',
  surfaceDeep: '#160E09',

  // Walnut & Chocolate Browns
  walnut: '#1F140E',
  walnutDark: '#140C07',
  chocolate: '#372317',
  chocolateDark: '#2A1A10',
  caramel: '#8B5E34',
  caramelWarm: '#A77038',

  // Warm Golds
  gold: '#D4A359',
  goldBright: '#F0C875',
  goldGradientStart: '#D9A94A',
  goldGradientEnd: '#F0C875',
  goldDeep: '#A9823A',
  goldBorder: 'rgba(220, 175, 95, 0.30)',
  goldBorderFocus: 'rgba(230, 194, 122, 0.85)',
  goldDim: 'rgba(212, 163, 89, 0.32)',
  goldFaint: 'rgba(212, 163, 89, 0.12)',
  goldSoft: 'rgba(212, 163, 89, 0.20)',

  // Cream & Ivory
  cream: '#FAF6F0',
  creamMuted: '#EDE4D3',
  creamDim: 'rgba(250, 246, 240, 0.70)',
  creamFaint: 'rgba(250, 246, 240, 0.45)',
  beige: '#D9CBB7',

  // Glassmorphism Card
  glassCard: 'rgba(55, 35, 23, 0.65)',
  glassCardBorder: 'rgba(220, 175, 95, 0.30)',
  glassButton: 'rgba(40, 24, 15, 0.50)',

  // Form Elements
  inputBorder: 'rgba(220, 175, 95, 0.35)',
  inputBorderActive: '#E6C27A',
  inputPlaceholder: 'rgba(237, 228, 211, 0.50)',
  buttonText: '#2A1A10',

  line: 'rgba(250, 246, 240, 0.12)',
  lineStrong: 'rgba(220, 175, 95, 0.30)',

  danger: '#E26D5C',
} as const;

export const fonts = {
  serif: {
    regular: 'PlayfairDisplay_400Regular',
    medium: 'PlayfairDisplay_500Medium',
    semibold: 'PlayfairDisplay_600SemiBold',
    bold: 'PlayfairDisplay_700Bold',
  },
  sans: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  huge: 48,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
} as const;