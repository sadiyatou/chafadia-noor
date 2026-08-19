import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Moon, BookOpen, Users } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    Icon: Moon,
    title: 'Your Daily Prayer Guide',
    description:
      'Never miss a prayer. Get accurate prayer times, Qibla direction, Azan reminders, and the full Islamic calendar — all in one place.',
  },
  {
    id: '2',
    Icon: BookOpen,
    title: 'Quran, Hadith & Knowledge',
    description:
      'Read the Holy Quran, explore thousands of authentic Hadith, learn Arabic, make Dua, and ask our AI Islamic guide anything.',
  },
  {
    id: '3',
    Icon: Users,
    title: 'A Global Muslim Community',
    description:
      'Connect with Muslims worldwide. Share thoughts, chat in real-time, discover mosques near you, and grow together in faith.',
  },
];

const ONBOARDING_KEY = 'chafadia_onboarding_done';

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/auth/login');
  };

  const next = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      finish();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index ?? 0);
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#063B28" />

      {/* Skip */}
      <TouchableOpacity style={styles.skipBtn} onPress={finish} activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconOuter}>
              <View style={styles.iconInner}>
                <item.Icon size={52} color="#D4A017" strokeWidth={1.5} />
              </View>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.btn} onPress={next} activeOpacity={0.88}>
        <Text style={styles.btnText}>
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text style={styles.footer}>Guided by Faith • Inspired by Love</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#063B28',
    alignItems: 'center',
    paddingBottom: 40,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 12,
  },
  skipText: {
    color: '#CFE8DD',
    fontSize: 14,
    fontWeight: '700',
  },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingTop: 30,
  },
  iconOuter: {
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor: 'rgba(212,160,23,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(212,160,23,0.3)',
    marginBottom: 44,
  },
  iconInner: {
    width: 130,
    height: 130,
    borderRadius: 999,
    backgroundColor: 'rgba(212,160,23,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.4,
    marginBottom: 18,
  },
  description: {
    fontSize: 15,
    color: '#CFE8DD',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 44,
    marginBottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 5,
  },
  dotActive: {
    width: 28,
    backgroundColor: '#D4A017',
  },
  btn: {
    backgroundColor: '#D4A017',
    paddingVertical: 16,
    paddingHorizontal: 56,
    borderRadius: 18,
    marginBottom: 28,
    shadowColor: '#D4A017',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  btnText: {
    color: '#063B28',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  footer: {
    color: 'rgba(207,232,221,0.5)',
    fontSize: 12,
    fontWeight: '600',
  },
});
