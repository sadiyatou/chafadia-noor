import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';

import { Link, router } from 'expo-router';

import { resetPassword } from '../../api/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(
        'Missing Email',
        'Please enter your email address.'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(email.trim());

      if (result.success) {
        Alert.alert(
          'Password Reset',
          'A password reset link has been sent to your email.'
        );
        router.replace('/auth/login');
      } else {
        Alert.alert('Error', result.message || 'Could not send reset email.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* BACKGROUND DESIGNS */}
          <View style={styles.topGoldCircle} />
          <View style={styles.topGreenCircle} />
          <View style={styles.bottomGoldCircle} />
          <View style={styles.bottomGreenCircle} />

          {/* BADGE */}
          <View style={styles.smallBadge}>
            <Text style={styles.smallBadgeText}>
              ✦ Secure Password Reset ✦
            </Text>
          </View>

          {/* LOGO */}
          <View style={styles.logoGlow}>
            <Image
              source={require('../../assets/images/logo.jpeg')}
              style={styles.logo}
            />
          </View>

          {/* TITLE */}
          <Text style={styles.title}>
            FORGOT PASSWORD
          </Text>

          {/* SUBTITLE */}
          <Text style={styles.subtitle}>
            Enter your email address to reset
            your password
          </Text>

          <View style={styles.titleLine} />

          <Text style={styles.infoText}>
            We will send a secure password reset
            link to your registered email address
          </Text>

          {/* EMAIL INPUT */}
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#9B9B9B"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* RESET BUTTON */}
          <TouchableOpacity
            style={[styles.resetButton, loading && { opacity: 0.7 }]}
            onPress={handleResetPassword}
            activeOpacity={0.9}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.resetButtonText}>
                Send Reset Link
              </Text>
            )}
          </TouchableOpacity>

          {/* LOGIN LINK */}
          <View style={styles.linksContainer}>
            <Text style={styles.accountText}>
              Remember your password?
            </Text>

            <Link
              href="/auth/login"
              style={styles.link}
            >
              Login
            </Link>
          </View>

          {/* DIVIDER */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.dividerText}>
              CHAFADIA NOOR
            </Text>

            <View style={styles.divider} />
          </View>

          {/* FOOTER */}
          <Text style={styles.footer}>
            Guided by Faith • Inspired by Love
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F5EE',
  },

  flex: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    overflow: 'hidden',
  },

  /* BACKGROUND DESIGNS */
  topGoldCircle: {
    position: 'absolute',
    top: -80,
    right: -70,
    width: 190,
    height: 190,
    borderRadius: 999,
    backgroundColor: '#D4A017',
    opacity: 0.16,
  },

  topGreenCircle: {
    position: 'absolute',
    top: 95,
    left: -95,
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor: '#0B5D3B',
    opacity: 0.08,
  },

  bottomGoldCircle: {
    position: 'absolute',
    bottom: 40,
    right: -90,
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor: '#D4A017',
    opacity: 0.1,
  },

  bottomGreenCircle: {
    position: 'absolute',
    bottom: -95,
    left: -80,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: '#063B28',
    opacity: 0.1,
  },

  /* BADGE */
  smallBadge: {
    alignSelf: 'center',
    backgroundColor: '#F2E7C9',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D8BD68',
  },

  smallBadgeText: {
    color: '#7A5A16',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  /* LOGO */
  logoGlow: {
    width: 138,
    height: 138,
    borderRadius: 34,
    backgroundColor: '#F2E7C9',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#D4A017',

    shadowColor: '#0B5D3B',
    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.12,
    shadowRadius: 16,

    elevation: 8,
  },

  logo: {
    width: 118,
    height: 118,
    resizeMode: 'cover',
    borderRadius: 28,
  },

  /* TITLE */
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#063B28',
    textAlign: 'center',
    letterSpacing: 1.4,
  },

  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 8,
    fontSize: 14.5,
    fontWeight: '600',
    lineHeight: 22,
  },

  titleLine: {
    width: 56,
    height: 3,
    backgroundColor: '#D4A017',
    borderRadius: 999,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 18,
  },

  infoText: {
    textAlign: 'center',
    color: '#475569',
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 22,
    lineHeight: 20,
  },

  /* INPUT */
  input: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 14,
    fontSize: 15,
    color: '#063B28',
    borderWidth: 1.2,
    borderColor: '#E0D4BE',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.04,
    shadowRadius: 8,

    elevation: 2,
  },

  /* BUTTON */
  resetButton: {
    backgroundColor: '#063B28',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 5,

    shadowColor: '#063B28',
    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.22,
    shadowRadius: 12,

    elevation: 6,
  },

  resetButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  /* LINKS */
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },

  accountText: {
    color: '#6b7280',
    marginRight: 6,
    fontSize: 13,
    fontWeight: '600',
  },

  link: {
    color: '#0B5D3B',
    fontWeight: '900',
    fontSize: 13,
  },

  /* DIVIDER */
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#D8C8A8',
  },

  dividerText: {
    marginHorizontal: 10,
    color: '#9A6A16',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  /* FOOTER */
  footer: {
    textAlign: 'center',
    marginTop: 18,
    color: '#6b7280',
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '600',
  },
});