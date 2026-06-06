// src/constants/colors.js

const COLORS = {
  // PRIMARY BRAND COLORS
  primary: '#064E3B',
  primaryDark: '#032D22',
  primaryLight: '#0D7054',

  // GOLD / ISLAMIC ACCENT COLORS
  gold: '#D8B85A',
  goldDark: '#B8902F',
  goldLight: '#F4E5AA',

  // BACKGROUND COLORS
  background: '#F5EFE3',
  backgroundSecondary: '#EFE5D2',
  backgroundDark: '#E6D9C3',

  // CARD COLORS
  card: '#FFFDF8',
  cardSecondary: '#F8F4EC',
  cardDark: '#E9DFC9',

  // TEXT COLORS
  text: '#1F2937',
  textSecondary: '#4B5563',
  textLight: '#6B7280',
  textMuted: '#9CA3AF',
  white: '#FFFFFF',

  // STATUS COLORS
  success: '#0D9488',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#2563EB',

  // ISLAMIC SPECIAL COLORS
  emerald: '#047857',
  emeraldDark: '#065F46',
  emeraldLight: '#D1FAE5',

  // CHAT COLORS
  myMessage: '#064E3B',
  otherMessage: '#FFFFFF',

  myMessageText: '#FFFFFF',
  otherMessageText: '#1F2937',

  online: '#10B981',
  offline: '#9CA3AF',

  // COMMUNITY COLORS
  like: '#EF4444',
  comment: '#3B82F6',
  share: '#10B981',
  save: '#F59E0B',

  // CALL COLORS
  callAccept: '#10B981',
  callDecline: '#DC2626',

  // QURAN COLORS
  quranGreen: '#14532D',
  quranGold: '#CA8A04',

  // ARABIC LEARNING COLORS
  lessonBlue: '#2563EB',
  lessonPurple: '#7C3AED',
  lessonOrange: '#EA580C',

  // RAMADAN COLORS
  ramadanNight: '#0F172A',
  ramadanMoon: '#EAB308',

  // SHADOW COLORS
  shadow: 'rgba(0,0,0,0.08)',
  shadowDark: 'rgba(0,0,0,0.18)',

  // BORDER COLORS
  border: '#E5D9C3',
  borderLight: '#EFE5D2',
  borderDark: '#CBB89D',

  // TRANSPARENT COLORS
  transparent: 'transparent',

  overlay: 'rgba(0,0,0,0.45)',

  overlayLight: 'rgba(255,255,255,0.2)',

  overlayDark: 'rgba(0,0,0,0.7)',

  // BADGE COLORS
  badgeGold: '#D8B85A',
  badgeGreen: '#064E3B',
  badgeRed: '#B91C1C',

  // ICON COLORS
  iconPrimary: '#064E3B',
  iconSecondary: '#D8B85A',
  iconMuted: '#6B7280',

  // PRAYER COLORS
  fajr: '#1E3A8A',
  dhuhr: '#D97706',
  asr: '#EA580C',
  maghrib: '#B45309',
  isha: '#312E81',

  // SPECIAL EFFECT COLORS
  glowGold: 'rgba(216,184,90,0.35)',
  glowGreen: 'rgba(6,78,59,0.25)',

  // PROFILE COLORS
  avatarBackground: '#E6F1EC',

  // SETTINGS COLORS
  settingsBackground: '#FAF7F0',

  // LEADERBOARD COLORS
  firstPlace: '#FFD700',
  secondPlace: '#C0C0C0',
  thirdPlace: '#CD7F32',
};

export const GRADIENTS = {
  primary: ['#032D22', '#064E3B'],

  emerald: ['#064E3B', '#0D7054'],

  gold: ['#D8B85A', '#C89B3C'],

  softGold: ['#F4E5AA', '#D8B85A'],

  light: ['#FFFDF8', '#F5EFE3'],

  quran: ['#14532D', '#064E3B'],

  ramadan: ['#0F172A', '#064E3B'],

  community: ['#064E3B', '#14532D'],

  prayer: ['#032D22', '#0D7054'],

  card: ['#FFFDF8', '#F8F4EC'],
};

export const THEME = {
  light: {
    background: COLORS.background,
    card: COLORS.card,
    text: COLORS.text,
    border: COLORS.border,
    primary: COLORS.primary,
  },

  dark: {
    background: '#0F172A',
    card: '#111827',
    text: '#FFFFFF',
    border: '#374151',
    primary: COLORS.gold,
  },
};

export default COLORS;