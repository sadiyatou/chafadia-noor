import React, { useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import {
  Heart,
  Sparkles,
  Moon,
  Stars,
  X,
} from 'lucide-react-native';

export default function RemembranceScreen() {
  const [selectedImage, setSelectedImage] =
    useState<any>(null);

  const openImage = (image: any) => {
    setSelectedImage(image);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#032D22"
      />

      <Modal
        visible={selectedImage !== null}
        transparent
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.closeButton}
            onPress={closeImage}
          >
            <X size={20} color="#ffffff" />
          </Pressable>

          <Image
            source={selectedImage}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topCircle} />
        <View style={styles.topCircle2} />
        <View style={styles.bottomCircle} />
        <View style={styles.goldBlur} />
        <View style={styles.greenBlur} />

        <LinearGradient
          colors={['#021F18', '#064E3B', '#0D7054']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroGlow} />
          <View style={styles.heroGlowGold} />
          <View style={styles.heroRing} />

          <View style={styles.ornamentTop} />

          <View style={styles.iconWrapper}>
            <Moon
              size={21}
              color="#F6D365"
              strokeWidth={2.6}
            />

            <Sparkles
              size={11}
              color="#F6D365"
              style={styles.sparkle}
            />
          </View>

          <Text style={styles.heroTitle}>
            In Loving Remembrance
          </Text>

          <View style={styles.heroLine} />

          <Text style={styles.heroSubtitle}>
            Inspired by the Mercy of Allah
            and the love shared between
            Chafiou & Sadiya
          </Text>

          <Text style={styles.heroDescription}>
            A bond built on faith, love,
            sacrifice and sincerity —
            everlasting in Jannah.
          </Text>

          <View style={styles.ornamentBottom} />
        </LinearGradient>

        <LinearGradient
          colors={['#FFFDF8', '#F8EEDC']}
          style={styles.messageCard}
        >
          <View style={styles.messageIconRow}>
            <View style={styles.messageIconBadge}>
              <Heart
                size={14}
                color="#9A6A16"
                fill="#9A6A16"
              />

              <Stars
                size={12}
                color="#9A6A16"
                style={{ marginLeft: 7 }}
              />
            </View>
          </View>

          <Text style={styles.messageText}>
            Everything about CHAFADIA NOOR
            is a legacy of love for my late
            husband. His kindness,
            sacrifice, unwavering support,
            strength and beautiful soul
            continue to inspire me every
            day.
          </Text>

          <Text style={styles.messageText}>
            Through this platform, his
            memory lives on through
            الخير, remembrance, prayer,
            knowledge and service to the
            Ummah.
          </Text>

          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>
              “True love for the sake of
              Allah never fades.”
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.imagesSection}>
          <View style={styles.sideImageContainer}>
            <View style={styles.imageGlow} />

            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() =>
                openImage(
                  require('@/src/assets/images/alhadj-chafiou.jpeg')
                )
              }
            >
              <Image
                source={require('@/src/assets/images/alhadj-chafiou.jpeg')}
                style={styles.sideImage}
              />
            </TouchableOpacity>

            <Text style={styles.imageLabel}>
              Chafiou Hamidou
            </Text>
          </View>

          <View style={styles.centerImageContainer}>
            <View style={styles.centerImageGlow} />

            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() =>
                openImage(
                  require('@/src/assets/images/chafiou-sadiya.jpeg')
                )
              }
            >
              <Image
                source={require('@/src/assets/images/chafiou-sadiya.jpeg')}
                style={styles.centerImage}
              />
            </TouchableOpacity>

            <Text style={styles.centerImageLabel}>
              Forever in Love & Faith
            </Text>
          </View>

          <View style={styles.sideImageContainer}>
            <View style={styles.imageGlow} />

            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() =>
                openImage(
                  require('@/src/assets/images/sadiya .jpeg')
                )
              }
            >
              <Image
                source={require('@/src/assets/images/sadiya .jpeg')}
                style={styles.sideImage}
              />
            </TouchableOpacity>

            <Text style={styles.imageLabel}>
              Sadiyatou Chafiou
            </Text>
          </View>
        </View>

        <LinearGradient
          colors={['#FFFDF8', '#F8EEDC']}
          style={styles.duaCard}
        >
          <View style={styles.duaHeader}>
            <View style={styles.duaSmallLine} />

            <Text style={styles.arabicTitle}>
              دعاء ورحمة
            </Text>

            <View style={styles.duaSmallLine} />
          </View>

          <Text style={styles.arabicText}>
            اللَّهُمَّ اغْفِرْ لَهُ
            وَارْحَمْهُ، وَاجْعَلْ
            رَحْمَتَكَ تُظِلُّهُ فِي
            كُلِّ حِينٍ.

            {'\n\n'}

            اللَّهُمَّ أَنْزِلْ عَلَيْهِ
            السَّكِينَةَ وَالسَّلَامَ،
            وَأَكْرِمْ مَنْزِلَهُ
            وَمَثْوَاهُ.

            {'\n\n'}

            اللَّهُمَّ وَسِّعْ قَبْرَهُ،
            وَاجْعَلْهُ رَوْضَةً مِنْ
            رِيَاضِ الْجَنَّةِ،
            وَامْلَأْهُ نُورًا
            وَطُمَأْنِينَةً.

            {'\n\n'}

            اللَّهُمَّ اغْسِلْ
            خَطَايَاهُ بِالْمَاءِ
            وَالثَّلْجِ وَالْبَرَدِ،
            وَنَقِّهِ مِنَ الذُّنُوبِ
            كَمَا يُنَقَّى الثَّوْبُ
            الْأَبْيَضُ مِنَ الدَّنَسِ.

            {'\n\n'}

            اللَّهُمَّ أَبْدِلْهُ دَارًا
            خَيْرًا مِنْ دَارِهِ،
            وَأَدْخِلْهُ الْفِرْدَوْسَ
            الْأَعْلَى بِغَيْرِ
            حِسَابٍ.

            {'\n\n'}

            اللَّهُمَّ اجْمَعْنَا بِهِ
            فِي جَنَّاتِ الْفِرْدَوْسِ.

            {'\n\n'}

            آمِين يَا رَبَّ
            الْعَالَمِينَ
          </Text>

          <View style={styles.translationBox}>
            <Text style={styles.translationTitle}>
              English Translation
            </Text>

            <Text style={styles.translationText}>
              O Allah, forgive him and
              shower him with Your mercy.

              {'\n\n'}

              Grant him peace, pardon him,
              and honor his resting place.

              {'\n\n'}

              Expand and illuminate his
              grave with light and
              tranquility.

              {'\n\n'}

              Wash away his sins completely,
              just as a white garment is
              cleansed from every stain.

              {'\n\n'}

              Replace his earthly home with
              a better home in Jannah.

              {'\n\n'}

              Surround him with Your mercy,
              Your light and Your
              forgiveness.

              {'\n\n'}

              Reunite us again in Jannatul
              Firdaus.

              {'\n\n'}

              Ameen.
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.footerContainer}>
          <View style={styles.footerLine} />

          <Text style={styles.footerText}>
            “Love for the sake of Allah
            never dies.”
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EFE5',
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 54,
    paddingBottom: 26,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(2, 18, 14, 0.97)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButton: {
    position: 'absolute',
    top: 60,
    right: 22,
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.13)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  fullImage: {
    width: '90%',
    height: '70%',
    borderRadius: 24,
  },

  topCircle: {
    position: 'absolute',
    top: -70,
    right: -75,
    width: 230,
    height: 230,
    borderRadius: 999,
    backgroundColor: '#D9EAE2',
    opacity: 0.82,
  },

  topCircle2: {
    position: 'absolute',
    top: 210,
    left: -54,
    width: 116,
    height: 116,
    borderRadius: 999,
    backgroundColor: '#E3D0A0',
    opacity: 0.34,
  },

  bottomCircle: {
    position: 'absolute',
    bottom: -120,
    left: -82,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: '#D8B85A',
    opacity: 0.13,
  },

  goldBlur: {
    position: 'absolute',
    top: 430,
    right: -60,
    width: 118,
    height: 118,
    borderRadius: 999,
    backgroundColor: '#D8B85A',
    opacity: 0.12,
  },

  greenBlur: {
    position: 'absolute',
    top: 640,
    left: -80,
    width: 155,
    height: 155,
    borderRadius: 999,
    backgroundColor: '#064E3B',
    opacity: 0.07,
  },

  heroSection: {
    borderRadius: 31,
    paddingVertical: 27,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#021F18',
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.24,
    shadowRadius: 22,
    elevation: 9,
  },

  heroGlow: {
    position: 'absolute',
    top: -55,
    right: -30,
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.075)',
  },

  heroGlowGold: {
    position: 'absolute',
    bottom: -78,
    left: -48,
    width: 185,
    height: 185,
    borderRadius: 999,
    backgroundColor: 'rgba(216,184,90,0.14)',
  },

  heroRing: {
    position: 'absolute',
    top: 42,
    left: -68,
    width: 120,
    height: 120,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  ornamentTop: {
    width: 56,
    height: 2.2,
    backgroundColor: '#F6D365',
    borderRadius: 999,
    marginBottom: 16,
  },

  ornamentBottom: {
    width: 56,
    height: 2.2,
    backgroundColor: '#F6D365',
    borderRadius: 999,
    marginTop: 16,
  },

  iconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.13)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
    borderWidth: 1,
    borderColor: 'rgba(246,211,101,0.42)',
  },

  sparkle: {
    position: 'absolute',
    top: 9,
    right: 9,
  },

  heroTitle: {
    color: '#ffffff',
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 5,
  },

  heroLine: {
    width: 42,
    height: 2.2,
    backgroundColor: '#F6D365',
    borderRadius: 999,
    marginVertical: 11,
  },

  heroSubtitle: {
    color: '#F6D365',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 18.5,
  },

  heroDescription: {
    color: '#DAF3E9',
    marginTop: 9,
    textAlign: 'center',
    fontSize: 10.8,
    lineHeight: 17,
    fontWeight: '600',
  },

  messageCard: {
    borderRadius: 25,
    paddingVertical: 17,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    shadowColor: '#2B2418',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },

  messageIconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },

  messageIconBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EAD5',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E1D2AD',
  },

  messageText: {
    color: '#374151',
    fontSize: 11,
    lineHeight: 18.6,
    marginBottom: 9,
    textAlign: 'center',
    fontWeight: '600',
  },

  quoteBox: {
    backgroundColor: '#064E3B',
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 17,
    marginTop: 7,
    borderWidth: 1,
    borderColor: 'rgba(216,184,90,0.35)',
  },

  quoteText: {
    color: '#F6D365',
    fontSize: 10.5,
    fontStyle: 'italic',
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 17,
  },

  imagesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 21,
    paddingHorizontal: 2,
  },

  sideImageContainer: {
    alignItems: 'center',
    width: '26%',
  },

  centerImageContainer: {
    alignItems: 'center',
    width: '42%',
  },

  imageGlow: {
    position: 'absolute',
    top: 12,
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: '#D8B85A',
    opacity: 0.18,
  },

  centerImageGlow: {
    position: 'absolute',
    top: 10,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: '#D8B85A',
    opacity: 0.2,
  },

  sideImage: {
    width: 66,
    height: 94,
    borderRadius: 20,
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: '#FFFDF8',
    shadowColor: '#2B2418',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.11,
    shadowRadius: 8,
    elevation: 4,
  },

  centerImage: {
    width: 113,
    height: 148,
    borderRadius: 26,
    resizeMode: 'cover',
    borderWidth: 3,
    borderColor: '#FFFDF8',
    shadowColor: '#2B2418',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 13,
    elevation: 6,
  },

  imageLabel: {
    marginTop: 7,
    color: '#064E3B',
    fontSize: 9.4,
    fontWeight: '900',
    textAlign: 'center',
  },

  centerImageLabel: {
    marginTop: 8,
    color: '#064E3B',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },

  duaCard: {
    borderRadius: 27,
    paddingVertical: 20,
    paddingHorizontal: 17,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    shadowColor: '#2B2418',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.065,
    shadowRadius: 14,
    elevation: 4,
  },

  duaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  duaSmallLine: {
    width: 26,
    height: 1.9,
    backgroundColor: '#D8B85A',
    borderRadius: 999,
  },

  arabicTitle: {
    color: '#064E3B',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginHorizontal: 8,
  },

  arabicText: {
    color: '#111827',
    fontSize: 14.3,
    lineHeight: 31,
    textAlign: 'right',
    marginBottom: 19,
    fontWeight: '700',
  },

  translationBox: {
    backgroundColor: '#F5EFE3',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E1D2AD',
  },

  translationTitle: {
    color: '#064E3B',
    fontSize: 13.2,
    fontWeight: '900',
    marginBottom: 9,
    textAlign: 'center',
  },

  translationText: {
    color: '#374151',
    fontSize: 10.8,
    lineHeight: 19.4,
    textAlign: 'center',
    fontWeight: '600',
  },

  footerContainer: {
    paddingBottom: 26,
    alignItems: 'center',
  },

  footerLine: {
    width: 38,
    height: 2.4,
    borderRadius: 999,
    backgroundColor: '#D8B85A',
    marginBottom: 8,
  },

  footerText: {
    color: '#867B6B',
    fontSize: 10,
    fontStyle: 'italic',
    fontWeight: '800',
    textAlign: 'center',
  },
});