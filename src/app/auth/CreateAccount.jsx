import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
  Alert, Image, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Eye, EyeOff, ChevronDown, Search, X } from 'lucide-react-native';
import { registerUser } from '../../api/auth';

const COUNTRY_CODES = [
  { code: '+237', country: 'Cameroon', flag: '🇨🇲' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+221', country: 'Senegal', flag: '🇸🇳' },
  { code: '+225', country: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: '+223', country: 'Mali', flag: '🇲🇱' },
  { code: '+227', country: 'Niger', flag: '🇳🇪' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+229', country: 'Benin', flag: '🇧🇯' },
  { code: '+224', country: 'Guinea', flag: '🇬🇳' },
  { code: '+222', country: 'Mauritania', flag: '🇲🇷' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
  { code: '+249', country: 'Sudan', flag: '🇸🇩' },
  { code: '+252', country: 'Somalia', flag: '🇸🇴' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
];

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCodes = COUNTRY_CODES.filter(
    (c) =>
      c.country.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  );

  const handleSignup = async () => {
    if (!fullName.trim()) {
      Alert.alert('Missing Information', 'Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Missing Information', 'Please enter your email address.');
      return;
    }
    if (!password || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in both password fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    const fullPhone = phoneNumber.trim()
      ? `${countryCode.code}${phoneNumber.trim()}`
      : null;

    setLoading(true);
    const result = await registerUser({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: fullPhone,
      password,
    });
    setLoading(false);

    if (result.success && result.token) {
      router.replace('/dashboard');
    } else {
      Alert.alert('Registration Failed', result.message || 'Could not connect to server.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.topGoldCircle} />
          <View style={styles.topGreenCircle} />
          <View style={styles.bottomGoldCircle} />
          <View style={styles.bottomGreenCircle} />

          <View style={styles.smallBadge}>
            <Text style={styles.smallBadgeText}>✦ Join Us Today ✦</Text>
          </View>

          <View style={styles.logoGlow}>
            <Image source={require('../../assets/images/logo.jpeg')} style={styles.logo} />
          </View>

          <Text style={styles.title}>CREATE ACCOUNT</Text>
          <Text style={styles.subtitle}>Join the CHAFADIA NOOR community</Text>
          <View style={styles.titleLine} />

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#9B9B9B"
            value={fullName}
            onChangeText={setFullName}
          />

          {/* Email */}
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#9B9B9B"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Phone Number */}
          <Text style={styles.label}>Phone Number <Text style={styles.optional}>(optional)</Text></Text>
          <View style={styles.phoneRow}>
            <TouchableOpacity style={styles.countryBtn} onPress={() => setPickerVisible(true)} activeOpacity={0.8}>
              <Text style={styles.countryFlag}>{countryCode.flag}</Text>
              <Text style={styles.countryCodeText}>{countryCode.code}</Text>
              <ChevronDown size={14} color="#063B28" />
            </TouchableOpacity>
            <TextInput
              style={styles.phoneInput}
              placeholder="Phone number"
              placeholderTextColor="#9B9B9B"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="At least 6 characters"
              placeholderTextColor="#9B9B9B"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton} activeOpacity={0.7}>
              {showPassword ? <EyeOff size={20} color="#0B5D3B" /> : <Eye size={20} color="#0B5D3B" />}
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Re-enter your password"
              placeholderTextColor="#9B9B9B"
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton} activeOpacity={0.7}>
              {showConfirm ? <EyeOff size={20} color="#0B5D3B" /> : <Eye size={20} color="#0B5D3B" />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.signupButton, loading && { opacity: 0.7 }]}
            onPress={handleSignup}
            activeOpacity={0.9}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#ffffff" />
              : <Text style={styles.signupButtonText}>Create Account</Text>}
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <Text style={styles.accountText}>Already have an account?</Text>
            <Link href="/auth/login" style={styles.link}>Login</Link>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>CHAFADIA NOOR</Text>
            <View style={styles.divider} />
          </View>
          <Text style={styles.footer}>Guided by Faith • Inspired by Love</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Code Picker Modal */}
      <Modal visible={pickerVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country Code</Text>
              <TouchableOpacity onPress={() => { setPickerVisible(false); setSearch(''); }}>
                <X size={22} color="#063B28" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchRow}>
              <Search size={16} color="#9B9B9B" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search country or code..."
                placeholderTextColor="#9B9B9B"
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredCodes}
              keyExtractor={(item) => item.code + item.country}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    item.code === countryCode.code && item.country === countryCode.country && styles.countryItemActive,
                  ]}
                  onPress={() => {
                    setCountryCode(item);
                    setPickerVisible(false);
                    setSearch('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.itemFlag}>{item.flag}</Text>
                  <Text style={styles.itemCountry}>{item.country}</Text>
                  <Text style={styles.itemCode}>{item.code}</Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F5EE' },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24, overflow: 'hidden' },
  topGoldCircle: { position: 'absolute', top: -80, right: -70, width: 190, height: 190, borderRadius: 999, backgroundColor: '#D4A017', opacity: 0.16 },
  topGreenCircle: { position: 'absolute', top: 95, left: -95, width: 170, height: 170, borderRadius: 999, backgroundColor: '#0B5D3B', opacity: 0.08 },
  bottomGoldCircle: { position: 'absolute', bottom: 40, right: -90, width: 170, height: 170, borderRadius: 999, backgroundColor: '#D4A017', opacity: 0.1 },
  bottomGreenCircle: { position: 'absolute', bottom: -95, left: -80, width: 210, height: 210, borderRadius: 999, backgroundColor: '#063B28', opacity: 0.1 },
  smallBadge: { alignSelf: 'center', backgroundColor: '#F2E7C9', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#D8BD68' },
  smallBadgeText: { color: '#7A5A16', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  logoGlow: { width: 110, height: 110, borderRadius: 28, backgroundColor: '#F2E7C9', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 14, borderWidth: 1.5, borderColor: '#D4A017', shadowColor: '#0B5D3B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 8 },
  logo: { width: 92, height: 92, resizeMode: 'cover', borderRadius: 22 },
  title: { fontSize: 26, fontWeight: '900', color: '#063B28', textAlign: 'center', letterSpacing: 1.4 },
  subtitle: { textAlign: 'center', color: '#6b7280', marginTop: 6, fontSize: 13, fontWeight: '600' },
  titleLine: { width: 56, height: 3, backgroundColor: '#D4A017', borderRadius: 999, alignSelf: 'center', marginTop: 12, marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6, marginLeft: 2 },
  optional: { fontWeight: '500', color: '#9B9B9B' },
  input: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 14, fontSize: 15, color: '#063B28', borderWidth: 1.2, borderColor: '#E0D4BE', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  countryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 12, borderWidth: 1.2, borderColor: '#E0D4BE', gap: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  countryFlag: { fontSize: 18 },
  countryCodeText: { fontSize: 14, fontWeight: '700', color: '#063B28', minWidth: 36 },
  phoneInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, fontSize: 15, color: '#063B28', borderWidth: 1.2, borderColor: '#E0D4BE', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 16, paddingHorizontal: 16, marginBottom: 14, borderWidth: 1.2, borderColor: '#E0D4BE', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  passwordInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#063B28' },
  eyeButton: { paddingLeft: 10 },
  signupButton: { backgroundColor: '#063B28', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 6, shadowColor: '#063B28', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 12, elevation: 6 },
  signupButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  linksContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 18 },
  accountText: { color: '#6b7280', marginRight: 6, fontSize: 13, fontWeight: '600' },
  link: { color: '#0B5D3B', fontWeight: '900', fontSize: 13 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 26 },
  divider: { flex: 1, height: 1, backgroundColor: '#D8C8A8' },
  dividerText: { marginHorizontal: 10, color: '#9A6A16', fontSize: 12, fontWeight: '900', letterSpacing: 0.7 },
  footer: { textAlign: 'center', marginTop: 16, color: '#6b7280', fontSize: 13, lineHeight: 20, fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingHorizontal: 20, maxHeight: '75%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 17, fontWeight: '900', color: '#063B28' },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, color: '#063B28' },
  countryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 12 },
  countryItemActive: { backgroundColor: '#F0FDF4', borderRadius: 10, paddingHorizontal: 8 },
  itemFlag: { fontSize: 22, width: 32 },
  itemCountry: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  itemCode: { fontSize: 14, fontWeight: '800', color: '#063B28' },
});
