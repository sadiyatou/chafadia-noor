// src/styles/commonStyle.js

import {
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';

import COLORS from '../constants/colors';

const { width, height } =
  Dimensions.get('window');

const commonStyle =
  StyleSheet.create({
    /* ======================================================
       CONTAINERS
    ====================================================== */

    flex: {
      flex: 1,
    },

    container: {
      flex: 1,

      backgroundColor:
        COLORS.background,
    },

    safeContainer: {
      flex: 1,

      backgroundColor:
        COLORS.background,

      paddingHorizontal: 16,
    },

    centered: {
      flex: 1,

      justifyContent: 'center',

      alignItems: 'center',
    },

    row: {
      flexDirection: 'row',

      alignItems: 'center',
    },

    rowBetween: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    rowAround: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-around',
    },

    wrapRow: {
      flexDirection: 'row',

      flexWrap: 'wrap',
    },

    /* ======================================================
       CARD STYLES
    ====================================================== */

    card: {
      backgroundColor:
        COLORS.card,

      borderRadius: 22,

      padding: 16,

      marginBottom: 16,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      shadowColor: '#000',

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity: 0.08,

      shadowRadius: 6,

      elevation: 3,
    },

    glassCard: {
      backgroundColor:
        'rgba(255,255,255,0.08)',

      borderRadius: 24,

      borderWidth: 1,

      borderColor:
        'rgba(255,255,255,0.12)',

      padding: 18,
    },

    darkCard: {
      backgroundColor:
        COLORS.primaryDark,

      borderRadius: 22,

      padding: 18,
    },

    /* ======================================================
       TEXT
    ====================================================== */

    title: {
      fontSize: 28,

      fontWeight: '900',

      color: COLORS.text,
    },

    heading: {
      fontSize: 22,

      fontWeight: '800',

      color: COLORS.text,
    },

    subHeading: {
      fontSize: 18,

      fontWeight: '700',

      color: COLORS.text,
    },

    bodyText: {
      fontSize: 15,

      lineHeight: 24,

      color: COLORS.text,
    },

    smallText: {
      fontSize: 12,

      color:
        COLORS.textSecondary,
    },

    mutedText: {
      color:
        COLORS.textSecondary,

      fontSize: 14,
    },

    whiteText: {
      color: COLORS.white,
    },

    goldText: {
      color: COLORS.gold,
    },

    centerText: {
      textAlign: 'center',
    },

    boldText: {
      fontWeight: 'bold',
    },

    arabicText: {
      fontSize: 28,

      lineHeight: 45,

      textAlign: 'right',

      color: COLORS.text,

      fontWeight: '700',
    },

    quranText: {
      fontSize: 30,

      lineHeight: 58,

      textAlign: 'right',

      color: COLORS.text,

      fontWeight: '700',
    },

    /* ======================================================
       BUTTONS
    ====================================================== */

    button: {
      height: 56,

      borderRadius: 18,

      justifyContent: 'center',

      alignItems: 'center',

      paddingHorizontal: 18,
    },

    primaryButton: {
      backgroundColor:
        COLORS.primary,
    },

    secondaryButton: {
      backgroundColor:
        COLORS.gold,
    },

    darkButton: {
      backgroundColor:
        COLORS.primaryDark,
    },

    outlineButton: {
      borderWidth: 1.5,

      borderColor:
        COLORS.primary,

      backgroundColor:
        'transparent',
    },

    buttonText: {
      color: COLORS.white,

      fontSize: 16,

      fontWeight: '800',
    },

    goldButtonText: {
      color:
        COLORS.primaryDark,

      fontSize: 16,

      fontWeight: '800',
    },

    /* ======================================================
       INPUTS
    ====================================================== */

    input: {
      height: 56,

      borderRadius: 18,

      backgroundColor:
        COLORS.card,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      paddingHorizontal: 16,

      fontSize: 15,

      color: COLORS.text,

      marginBottom: 14,
    },

    textArea: {
      minHeight: 120,

      borderRadius: 20,

      backgroundColor:
        COLORS.card,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      paddingHorizontal: 16,

      paddingTop: 14,

      fontSize: 15,

      color: COLORS.text,

      textAlignVertical: 'top',
    },

    inputLabel: {
      fontSize: 14,

      fontWeight: '700',

      color: COLORS.text,

      marginBottom: 8,
    },

    /* ======================================================
       IMAGES
    ====================================================== */

    avatar: {
      width: 50,

      height: 50,

      borderRadius: 999,
    },

    largeAvatar: {
      width: 120,

      height: 120,

      borderRadius: 999,
    },

    storyAvatar: {
      width: 74,

      height: 74,

      borderRadius: 999,

      borderWidth: 3,

      borderColor:
        COLORS.gold,
    },

    image: {
      width: '100%',

      height: 220,

      borderRadius: 18,
    },

    /* ======================================================
       SHADOWS
    ====================================================== */

    shadow: {
      shadowColor: '#000',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.08,

      shadowRadius: 5,

      elevation: 3,
    },

    strongShadow: {
      shadowColor: '#000',

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity: 0.18,

      shadowRadius: 10,

      elevation: 6,
    },

    /* ======================================================
       SPACING
    ====================================================== */

    mt5: {
      marginTop: 5,
    },

    mt10: {
      marginTop: 10,
    },

    mt15: {
      marginTop: 15,
    },

    mt20: {
      marginTop: 20,
    },

    mt30: {
      marginTop: 30,
    },

    mb5: {
      marginBottom: 5,
    },

    mb10: {
      marginBottom: 10,
    },

    mb15: {
      marginBottom: 15,
    },

    mb20: {
      marginBottom: 20,
    },

    mb30: {
      marginBottom: 30,
    },

    p10: {
      padding: 10,
    },

    p15: {
      padding: 15,
    },

    p20: {
      padding: 20,
    },

    /* ======================================================
       BADGES
    ====================================================== */

    badge: {
      paddingHorizontal: 10,

      paddingVertical: 5,

      borderRadius: 999,

      alignSelf: 'flex-start',
    },

    goldBadge: {
      backgroundColor:
        COLORS.gold,
    },

    greenBadge: {
      backgroundColor:
        COLORS.primary,
    },

    badgeText: {
      fontSize: 11,

      fontWeight: '800',

      color:
        COLORS.primaryDark,
    },

    /* ======================================================
       DIVIDERS
    ====================================================== */

    divider: {
      height: 1,

      backgroundColor:
        COLORS.border,

      marginVertical: 14,
    },

    /* ======================================================
       ICON BOXES
    ====================================================== */

    iconBox: {
      width: 50,

      height: 50,

      borderRadius: 18,

      justifyContent: 'center',

      alignItems: 'center',

      backgroundColor:
        COLORS.primary,
    },

    goldIconBox: {
      backgroundColor:
        COLORS.gold,
    },

    /* ======================================================
       ABSOLUTE
    ====================================================== */

    absoluteFill: {
      position: 'absolute',

      top: 0,

      bottom: 0,

      left: 0,

      right: 0,
    },

    /* ======================================================
       SCREEN SIZE
    ====================================================== */

    screenWidth: {
      width,
    },

    screenHeight: {
      height,
    },

    /* ======================================================
       PLATFORM
    ====================================================== */

    iosPadding: {
      paddingBottom:
        Platform.OS === 'ios'
          ? 24
          : 12,
    },
  });

export default commonStyle;