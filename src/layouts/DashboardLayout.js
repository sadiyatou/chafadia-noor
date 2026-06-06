// src/layouts/DashboardLayout.js

import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import {
  Bell,
  Menu,
  Search,
  UserRound,
  Sparkles,
  ArrowLeft,
} from 'lucide-react-native';

import COLORS from '../constants/colors';

export default function DashboardLayout({
  children,
  title = 'CHAFADIA NOOR',
  subtitle = 'Islamic lifestyle, learning and community',
  showBack = false,
  showSearch = true,
  showNotifications = true,
  showProfile = true,
  onBackPress,
  onMenuPress,
  onSearchPress,
  onNotificationPress,
  onProfilePress,
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryDark}
      />

      <View style={styles.container}>
        <LinearGradient
          colors={[
            COLORS.primaryDark,
            COLORS.primary,
            COLORS.primaryLight,
          ]}
          style={styles.header}
        >
          <View style={styles.goldGlow} />
          <View style={styles.greenGlow} />

          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={showBack ? onBackPress : onMenuPress}
            >
              {showBack ? (
                <ArrowLeft size={22} color={COLORS.white} />
              ) : (
                <Menu size={22} color={COLORS.white} />
              )}
            </TouchableOpacity>

            <View style={styles.brandBox}>
              <View style={styles.brandBadge}>
                <Sparkles size={11} color={COLORS.gold} />
                <Text style={styles.brandBadgeText}>NOOR</Text>
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <View style={styles.headerActions}>
              {showSearch ? (
                <TouchableOpacity
                  style={styles.smallIconButton}
                  onPress={onSearchPress}
                >
                  <Search size={18} color={COLORS.white} />
                </TouchableOpacity>
              ) : null}

              {showNotifications ? (
                <TouchableOpacity
                  style={styles.smallIconButton}
                  onPress={onNotificationPress}
                >
                  <Bell size={18} color={COLORS.white} />
                  <View style={styles.notificationDot} />
                </TouchableOpacity>
              ) : null}

              {showProfile ? (
                <TouchableOpacity
                  style={styles.profileButton}
                  onPress={onProfilePress}
                >
                  <UserRound size={20} color={COLORS.gold} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    paddingTop: 18,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
  },

  goldGlow: {
    position: 'absolute',
    top: -70,
    right: -70,
    width: 190,
    height: 190,
    borderRadius: 999,
    backgroundColor: COLORS.gold,
    opacity: 0.16,
  },

  greenGlow: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.28,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconButton: {
    width: 45,
    height: 45,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandBox: {
    flex: 1,
    marginLeft: 12,
  },

  brandBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginBottom: 7,
  },

  brandBadgeText: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: 4,
  },

  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  subtitle: {
    color: '#E8FFF5',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  smallIconButton: {
    width: 38,
    height: 38,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.gold,
  },

  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingBottom: 40,
  },
});