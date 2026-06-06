import React, { useEffect } from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';

import { MotiView } from 'moti';
import { router } from 'expo-router';

export default function LoadingScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/auth/login');
    }, 5600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#063B28"
      />

      {/* BEAUTIFUL BACKGROUND GLOWS */}
      <View style={styles.goldGlowOne} />
      <View style={styles.greenGlow} />
      <View style={styles.goldGlowTwo} />

      <MotiView
        from={{
          opacity: 0,
          translateY: 20,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          translateY: 0,
          scale: 1,
        }}
        transition={{
          type: 'timing',
          duration: 900,
        }}
        style={styles.content}
      >
        {/* LOGO */}
        <View style={styles.logoOuter}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/images/logo.jpeg')}
              style={styles.logo}
            />
          </View>
        </View>

        {/* TITLE */}
        <Text style={styles.title}>
          CHAFADIA NOOR
        </Text>

        {/* SUBTITLE */}
        <Text style={styles.subtitle}>
          Guided by Faith • Inspired by Love
        </Text>

        {/* DIVIDER */}
        <View style={styles.divider} />

        {/* LOADER */}
        <View style={styles.loaderContainer}>
          <MotiView
            from={{
              rotate: '0deg',
              scale: 1,
            }}
            animate={{
              rotate: '360deg',
              scale: 1.08,
            }}
            transition={{
              loop: true,
              type: 'timing',
              duration: 1200,
            }}
            style={styles.loader}
          />

          {/* LOADING TEXT */}
          <Text style={styles.loadingText}>
            Loading...
          </Text>

          <Text style={styles.loadingSubText}>
            Preparing your peaceful Islamic space
          </Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footerWrapper}>
          <Text style={styles.footer}>
            Your Complete Islamic Lifestyle Platform
          </Text>

          {/* BUILT BY */}
          <View style={styles.builtByContainer}>
            <View style={styles.smallLine} />

            <Text style={styles.builtBy}>
              ✨ Built By{' '}
              <Text style={styles.nameText}>
                Sadiyatou Chafiou
              </Text>
            </Text>

            <View style={styles.smallLine} />
          </View>
        </View>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#063B28',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },

  content: {
    width: '100%',
    alignItems: 'center',
  },

  /* GLOW EFFECTS */
  goldGlowOne: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: '#D4A017',
    opacity: 0.2,
  },

  greenGlow: {
    position: 'absolute',
    bottom: 110,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: '#0B5D3B',
    opacity: 0.55,
  },

  goldGlowTwo: {
    position: 'absolute',
    bottom: -75,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: '#D4A017',
    opacity: 0.16,
  },

  /* LOGO OUTER */
  logoOuter: {
    width: 188,
    height: 188,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(212,160,23,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.45)',
    marginBottom: 30,
  },

  /* LOGO BOX */
  logoWrapper: {
    width: 170,
    height: 170,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDF7',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
  },

  /* LOGO */
  logo: {
    width: 145,
    height: 145,
    borderRadius: 30,
    resizeMode: 'cover',
  },

  /* TITLE */
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2.5,
    textAlign: 'center',
  },

  /* SUBTITLE */
  subtitle: {
    fontSize: 16,
    color: '#E8F5EF',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
  },

  /* DIVIDER */
  divider: {
    width: 62,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#D4A017',
    marginTop: 22,
  },

  /* LOADER CONTAINER */
  loaderContainer: {
    marginTop: 42,
    marginBottom: 35,
    alignItems: 'center',
  },

  /* LOADER */
  loader: {
    width: 58,
    height: 58,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.35)',
    borderTopColor: '#D4A017',
    borderRightColor: '#F8E7B0',
    borderRadius: 999,
  },

  /* LOADING */
  loadingText: {
    marginTop: 18,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  loadingSubText: {
    marginTop: 7,
    color: '#CFE8DD',
    fontSize: 12.5,
    textAlign: 'center',
    fontWeight: '600',
  },

  /* FOOTER WRAPPER */
  footerWrapper: {
    position: 'absolute',
    bottom: -70,
    alignItems: 'center',
  },

  /* FOOTER */
  footer: {
    color: '#D8EDE4',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  /* BUILT BY SECTION */
  builtByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },

  smallLine: {
    width: 38,
    height: 1.5,
    backgroundColor: 'rgba(212,160,23,0.6)',
    marginHorizontal: 10,
  },

  builtBy: {
    color: '#F4E8B2',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  nameText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});