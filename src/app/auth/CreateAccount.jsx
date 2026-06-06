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
import { Eye, EyeOff } from 'lucide-react-native';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleSignup = () => {
    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        'Missing Information',
        'Please fill all fields.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password Error',
        'Passwords do not match.'
      );
      return;
    }

    console.log('SIGNUP DATA:', {
      fullName,
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
          <View style={styles.topGoldCircle} />
          <View style={styles.topGreenCircle} />
          <View style={styles.bottomGoldCircle} />
          <View style={styles.bottomGreenCircle} />

          <View style={styles.smallBadge}>
            <Text style={styles.smallBadgeText}>
              ✦ Join Us Today ✦
            </Text>
          </View>

          <View style={styles.logoGlow}>
            <Image
              source={require('../../assets/images/logo.jpeg')}
              style={styles.logo}
            />
          </View>

          <Text style={styles.title}>
            CREATE ACCOUNT
          </Text>

          <Text style={styles.subtitle}>
            Join the CHAFADIA NOOR community
          </Text>

          <View style={styles.titleLine} />

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#9B9B9B"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#9B9B9B"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

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
                <EyeOff size={20} color="#0B5D3B" />
              ) : (
                <Eye size={20} color="#0B5D3B" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password"
              placeholderTextColor="#9B9B9B"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              onPress={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              style={styles.eyeButton}
              activeOpacity={0.7}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color="#0B5D3B" />
              ) : (
                <Eye size={20} color="#0B5D3B" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
            activeOpacity={0.9}
          >
            <Text style={styles.signupButtonText}>
              Create Account
            </Text>
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <Text style={styles.accountText}>
              Already have an account?
            </Text>

            <Link
              href="/auth/login"
              style={styles.link}
            >
              Login
            </Link>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.dividerText}>
              CHAFADIA NOOR
            </Text>

            <View style={styles.divider} />
          </View>

          <Text style={styles.footer}>
            Guided by Faith • Inspired by Love
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;

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
  },

  titleLine: {
    width: 56,
    height: 3,
    backgroundColor: '#D4A017',
    borderRadius: 999,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 20,
  },

  input: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginBottom: 13,
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

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    paddingHorizontal: 18,
    marginBottom: 13,
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
    paddingVertical: 15,
    fontSize: 15,
    color: '#063B28',
  },

  eyeButton: {
    paddingLeft: 10,
  },

  signupButton: {
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

  signupButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

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

  footer: {
    textAlign: 'center',
    marginTop: 18,
    color: '#6b7280',
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '600',
  },
});