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
  ArrowLeft,
  Bell,
  Home,
  Menu,
  Search,
  UserRound,
} from 'lucide-react-native';

import COLORS from '../constants/colors';

export default function MainLayout({
  children,
  title = 'CHAFADIA NOOR',
  subtitle = '',
  showHeader = true,
  showBack = false,
  showMenu = true,
  showSearch = true,
  showNotifications = true,
  showProfile = true,
  scrollable = true,
  onBackPress,
  onMenuPress,
  onSearchPress,
  onNotificationPress,
  onProfilePress,
  rightComponent = null,
}) {
  const HeaderContent = (
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

      <View style={styles.headerRow}>
        {showBack ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onBackPress}
          >
            <ArrowLeft size={22} color={COLORS.white} />
          </TouchableOpacity>
        ) : showMenu ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onMenuPress}
          >
            <Menu size={22} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        <View style={styles.titleBox}>
          <Text style={styles.appLabel}>CHAFADIA NOOR</Text>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          {rightComponent ? rightComponent : null}

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
              <UserRound size={19} color={COLORS.gold} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryDark}
      />

      <View style={styles.container}>
        {showHeader ? HeaderContent : null}

        {scrollable ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.nonScrollContent}>
            {children}
          </View>
        )}
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
    paddingBottom: 22,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },

  goldGlow: {
    position: 'absolute',
    top: -75,
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
    left: -65,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.28,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconPlaceholder: {
    width: 44,
    height: 44,
  },

  titleBox: {
    flex: 1,
    marginLeft: 12,
  },

  appLabel: {
    color: COLORS.gold,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 4,
  },

  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
  },

  subtitle: {
    color: '#E8FFF5',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 3,
    lineHeight: 16,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginLeft: 8,
  },

  smallIconButton: {
    width: 37,
    height: 37,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.gold,
  },

  profileButton: {
    width: 39,
    height: 39,
    borderRadius: 15,
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

  nonScrollContent: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 18,
  },
});