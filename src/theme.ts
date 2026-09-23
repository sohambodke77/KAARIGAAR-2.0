export const colors = {
  background: '#0A0A0C',
  surface: '#131318',
  surfaceAlt: '#17171D',
  surfaceDeep: '#0E0E12',

  gold: '#C9A44C',
  goldBright: '#E6C97E',
  goldDeep: '#A9823A',
  goldDim: 'rgba(201, 164, 76, 0.30)',
  goldFaint: 'rgba(201, 164, 76, 0.10)',
  goldSoft: 'rgba(201, 164, 76, 0.16)',

  cream: '#F3ECDD',
  creamDim: 'rgba(243, 236, 221, 0.66)',
  creamFaint: 'rgba(243, 236, 221, 0.40)',
  line: 'rgba(243, 236, 221, 0.10)',
  lineStrong: 'rgba(243, 236, 221, 0.18)',

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