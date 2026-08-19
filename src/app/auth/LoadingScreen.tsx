import React, { useEffect } from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAuthenticated } from '../../api/auth';

const ONBOARDING_KEY = 'chafadia_onboarding_done';

export default function LoadingScreen() {
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [onboardingDone, loggedIn] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_KEY),
          isAuthenticated(),
        ]);
        setTimeout(() => {
          if (!onboardingDone) {
            router.replace('/auth/Onboarding');
          } else if (loggedIn) {
            router.replace('/dashboard');
          } else {
            router.replace('/auth/login');
          }
        }, 2000);
      } catch (_) {
        router.replace('/auth/login');
      }
    };

    bootstrap();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#063B28" />

      <View style={styles.goldGlowOne} />
      <View style={styles.greenGlow} />
      <View style={styles.goldGlowTwo} />

      <View style={styles.content}>
        <View style={styles.logoOuter}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/images/logo.jpeg')}
              style={styles.logo}
            />
          </View>
        </View>

        <Text style={styles.title}>CHAFADIA NOOR</Text>
        <Text style={styles.subtitle}>Guided by Faith • Inspired by Love</Text>

        <View style={styles.divider} />

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D4A017" />
          <Text style={styles.loadingText}>Loading...</Text>
          <Text style={styles.loadingSubText}>
            Preparing your peaceful Islamic space
          </Text>
        </View>

        <View style={styles.footerWrapper}>
          <Text style={styles.footer}>Your Complete Islamic Lifestyle Platform</Text>
          <View style={styles.builtByContainer}>
            <View style={styles.smallLine} />
            <Text style={styles.builtBy}>
              Built By <Text style={styles.nameText}>Sadiyatou Chafiou</Text>
            </Text>
            <View style={styles.smallLine} />
          </View>
        </View>
      </View>
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
  logoWrapper: {
    width: 170,
    height: 170,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDF7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    width: 145,
    height: 145,
    borderRadius: 30,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5EF',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
  },
  divider: {
    width: 62,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#D4A017',
    marginTop: 22,
  },
  loaderContainer: {
    marginTop: 42,
    marginBottom: 35,
    alignItems: 'center',
  },
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
  footerWrapper: {
    marginTop: 30,
    alignItems: 'center',
  },
  footer: {
    color: '#D8EDE4',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
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
