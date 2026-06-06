// src/styles/theme.js

import COLORS, { GRADIENTS } from '../constants/colors';

const FONT = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  black: 'System',
};

const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 26,
  title: 32,
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

const RADIUS = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 30,
  full: 999,
};

const SHADOWS = {
  soft: {
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  medium: {
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },

  strong: {
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 9,
  },

  gold: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 7,
  },
};

const LIGHT_THEME = {
  mode: 'light',

  colors: {
    background: COLORS.background,
    card: COLORS.card,
    cardSecondary: COLORS.cardSecondary,
    text: COLORS.text,
    textSecondary: COLORS.textSecondary,
    textLight: COLORS.textLight,
    primary: COLORS.primary,
    primaryDark: COLORS.primaryDark,
    primaryLight: COLORS.primaryLight,
    accent: COLORS.gold,
    border: COLORS.border,
    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.error,
    white: COLORS.white,
  },
};

const DARK_THEME = {
  mode: 'dark',

  colors: {
    background: '#07130F',
    card: '#10251E',
    cardSecondary: '#143328',
    text: '#FFFFFF',
    textSecondary: '#D1D5DB',
    textLight: '#9CA3AF',
    primary: COLORS.gold,
    primaryDark: '#020A07',
    primaryLight: '#0D7054',
    accent: COLORS.goldLight,
    border: '#244A3D',
    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.error,
    white: COLORS.white,
  },
};

const COMPONENTS = {
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },

  header: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    backgroundColor: COLORS.primary,
    ...SHADOWS.medium,
  },

  title: {
    fontSize: SIZES.xxl,
    fontWeight: '900',
    color: COLORS.primary,
  },

  subtitle: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textSecondary,
    lineHeight: 21,
  },

  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonGold: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '900',
  },

  buttonGoldText: {
    color: COLORS.primaryDark,
    fontSize: SIZES.md,
    fontWeight: '900',
  },

  input: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.primary,
    fontWeight: '800',
  },

  badge: {
    backgroundColor: COLORS.goldLight,
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  badgeText: {
    color: COLORS.primary,
    fontSize: SIZES.xs,
    fontWeight: '900',
  },
};

const theme = {
  COLORS,
  GRADIENTS,
  FONT,
  SIZES,
  SPACING,
  RADIUS,
  SHADOWS,
  LIGHT_THEME,
  DARK_THEME,
  COMPONENTS,
};

export {
  COLORS,
  GRADIENTS,
  FONT,
  SIZES,
  SPACING,
  RADIUS,
  SHADOWS,
  LIGHT_THEME,
  DARK_THEME,
  COMPONENTS,
};

export default theme;