// src/layouts/AuthLayout.js

import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import COLORS from '../constants/colors';

export default function AuthLayout({
  children,
  title = 'Welcome to CHAFADIA NOOR',
  subtitle = 'A place of prayer, learning, remembrance, community and light.',
  showLogo = true,
  footerText = '',
  footerActionText = '',
  onFooterPress,
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary, COLORS.primaryLight]}
        style={styles.background}
      >
        <View style={styles.goldCircle} />
        <View style={styles.greenCircle} />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.header}>
              {showLogo && (
                <View style={styles.logoWrap}>
                  <Text style={styles.logoText}>ن</Text>
                </View>
              )}

              <Text style={styles.appName}>CHAFADIA NOOR</Text>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <View style={styles.card}>{children}</View>

            {(footerText || footerActionText) && (
              <View style={styles.footer}>
                {footerText ? (
                  <Text style={styles.footerText}>{footerText}</Text>
                ) : null}

                {footerActionText ? (
                  <TouchableOpacity onPress={onFooterPress}>
                    <Text style={styles.footerAction}>
                      {footerActionText}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },

  background: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 35,
    justifyContent: 'center',
  },

  goldCircle: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: COLORS.gold,
    opacity: 0.18,
  },

  greenCircle: {
    position: 'absolute',
    bottom: -90,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.25,
  },

  header: {
    alignItems: 'center',
    marginBottom: 25,
  },

  logoWrap: {
    width: 86,
    height: 86,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  logoText: {
    color: COLORS.gold,
    fontSize: 42,
    fontWeight: '900',
  },

  appName: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  title: {
    color: COLORS.white,
    fontSize: 27,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 34,
  },

  subtitle: {
    color: '#E8FFF5',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 330,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },

  footer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerText: {
    color: '#E8FFF5',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },

  footerAction: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 7,
    textAlign: 'center',
  },
});