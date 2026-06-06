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
} from 'react-native';

import { Link, router } from 'expo-router';

import {
  Eye,
  EyeOff,
} from 'lucide-react-native';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] =
    useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert(
        'Missing Information',
        'Please enter your email and password.'
      );
      return;
    }

    console.log('LOGIN DATA:', {
      email,
      password,
    });

    router.replace('/dashboard');
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

          {/* WELCOME BADGE */}
          <View style={styles.smallBadge}>
            <Text style={styles.smallBadgeText}>
              ✦ Welcome Back ✦
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
            CHAFADIA NOOR
          </Text>

          {/* SUBTITLE */}
          <Text style={styles.subtitle}>
            Guided by Faith • Inspired by Love
          </Text>

          <View style={styles.titleLine} />

          <Text style={styles.welcomeText}>
            Login to continue your peaceful Islamic
            journey
          </Text>

          {/* EMAIL */}
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#9B9B9B"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* PASSWORD */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#9B9B9B"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              onPress={() =>
                setShowPassword(!showPassword)
              }
              style={styles.eyeButton}
              activeOpacity={0.7}
            >
              {showPassword ? (
                <EyeOff
                  size={20}
                  color="#0B5D3B"
                />
              ) : (
                <Eye
                  size={20}
                  color="#0B5D3B"
                />
              )}
            </TouchableOpacity>
          </View>

          {/* LOGIN BUTTON */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.9}
          >
            <Text style={styles.loginButtonText}>
              Login
            </Text>
          </TouchableOpacity>

          {/* LINKS */}
          <View style={styles.linksContainer}>
            <Link
              href="/auth/CreateAccount"
              style={styles.link}
            >
              Create Account
            </Link>

            <Link
              href="/auth/ForgotPassword"
              style={styles.link}
            >
              Forgot Password?
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
            Your Complete Islamic Lifestyle Platform
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

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
    fontSize: 31,
    fontWeight: '900',
    color: '#063B28',
    textAlign: 'center',
    letterSpacing: 1.6,
  },

  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 8,
    fontSize: 15,
    fontWeight: '600',
  },

  titleLine: {
    width: 56,
    height: 3,
    backgroundColor: '#D4A017',
    borderRadius: 999,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 14,
  },

  welcomeText: {
    textAlign: 'center',
    color: '#475569',
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 22,
  },

  /* INPUTS */
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

  /* PASSWORD */
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
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

  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    color: '#063B28',
  },

  eyeButton: {
    paddingLeft: 10,
  },

  /* LOGIN BUTTON */
  loginButton: {
    backgroundColor: '#063B28',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 4,

    shadowColor: '#063B28',
    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.22,
    shadowRadius: 12,

    elevation: 6,
  },

  loginButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  /* LINKS */
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  link: {
    color: '#0B5D3B',
    fontWeight: '800',
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