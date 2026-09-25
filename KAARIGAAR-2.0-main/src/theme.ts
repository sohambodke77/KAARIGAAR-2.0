export const colors = {
  // Dark / Workshop Theme (Auth screen & Hero banner)
  background: '#120B07',
  surface: '#1E140E',
  surfaceAlt: '#271A12',
  surfaceDeep: '#160E09',

  // Marketplace Light / Cream Theme (References 1, 2, 3)
  marketplaceBg: '#FAF7F2',
  cardBg: '#FFFFFF',
  cardBgAlt: '#F5EFE6',
  cardBorder: '#EFE9DF',
  cardBorderSubtle: 'rgba(0, 0, 0, 0.06)',
  cardBorderHover: '#D4A359',

  // Walnut & Chocolate Browns
  walnut: '#1F140E',
  walnutDark: '#140C07',
  chocolate: '#372317',
  chocolateDark: '#2A1A10',
  caramel: '#8B5E34',
  caramelWarm: '#A77038',

  // Warm Golds & Mustards
  gold: '#C59341',
  goldLight: '#D4A359',
  goldBright: '#F0C875',
  goldGradientStart: '#D9A94A',
  goldGradientEnd: '#F0C875',
  goldDeep: '#A9823A',
  goldBorder: 'rgba(220, 175, 95, 0.30)',
  goldBorderFocus: 'rgba(230, 194, 122, 0.85)',
  goldDim: 'rgba(197, 147, 65, 0.32)',
  goldFaint: 'rgba(197, 147, 65, 0.12)',
  goldSoft: 'rgba(197, 147, 65, 0.20)',

  // Charcoal & Matte Black
  charcoal: '#1A1613',
  charcoalSoft: '#28231F',
  charcoalMuted: '#3D3631',

  // Neutral Cream & Ivory
  cream: '#FAF6F0',
  creamMuted: '#EDE4D3',
  creamDim: 'rgba(250, 246, 240, 0.70)',
  creamFaint: 'rgba(250, 246, 240, 0.45)',
  beige: '#D9CBB7',

  // Text Colors (Marketplace)
  textPrimary: '#1A1613',
  textSecondary: '#6E655F',
  textMuted: '#9C9288',
  textLight: '#FAF7F2',

  // Accents
  terracotta: '#C86D51',
  terracottaDark: '#A85437',
  terracottaFaint: 'rgba(200, 109, 81, 0.12)',
  ecoGreen: '#2E7D32',
  ecoGreenFaint: 'rgba(46, 125, 50, 0.12)',

  // Glassmorphism Card (Auth)
  glassCard: 'rgba(55, 35, 23, 0.65)',
  glassCardBorder: 'rgba(220, 175, 95, 0.30)',
  glassButton: 'rgba(40, 24, 15, 0.50)',

  // Form Elements
  inputBorder: 'rgba(220, 175, 95, 0.35)',
  inputBorderActive: '#E6C27A',
  inputPlaceholder: 'rgba(237, 228, 211, 0.50)',
  inputBorderLight: '#E5DED3',
  inputBgLight: '#FFFFFF',
  buttonText: '#2A1A10',

  line: 'rgba(250, 246, 240, 0.12)',
  lineLight: '#EFE8DE',
  lineStrong: 'rgba(220, 175, 95, 0.30)',

  danger: '#E26D5C',
  success: '#2E7D32',
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
  full: 9999,
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
  soft: {
    shadowColor: '#1A1613',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#1A1613',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;