import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

import {
  Bell,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  LocateFixed,
  MapPin,
  Moon,
  RefreshCw,
  Sparkles,
  Square,
  Sun,
  Target,
  Volume2,
  XCircle,
} from 'lucide-react-native';

import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PrayerTimes,
  Qibla,
} from 'adhan';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AZAN_SOUND = require('../../assets/sounds/azan mp3.png.mp3');

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const normalizeAngle = (angle: number) => {
  return ((angle % 360) + 360) % 360;
};

const getAngleDifference = (
  target: number,
  current: number
) => {
  const difference = Math.abs(
    normalizeAngle(target) - normalizeAngle(current)
  );

  return Math.min(difference, 360 - difference);
};

const getSignedAngleDifference = (
  target: number,
  current: number
) => {
  let difference =
    normalizeAngle(target) - normalizeAngle(current);

  if (difference > 180) difference -= 360;
  if (difference < -180) difference += 360;

  return difference;
};

const formatTime = (date?: Date | null) => {
  if (!date) return '--:--';

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const addMinutes = (date: Date, minutes: number) => {
  return new Date(date.getTime() + minutes * 60000);
};

const getPrayerKey = (date: Date) => {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
};

const isSamePrayerMinute = (
  now: Date,
  prayerTime: Date
) => {
  return (
    now.getFullYear() === prayerTime.getFullYear() &&
    now.getMonth() === prayerTime.getMonth() &&
    now.getDate() === prayerTime.getDate() &&
    now.getHours() === prayerTime.getHours() &&
    now.getMinutes() === prayerTime.getMinutes()
  );
};

const getPrayerTimesForDate = (
  latitude: number,
  longitude: number,
  date: Date
) => {
  const coordinates = new Coordinates(
    latitude,
    longitude
  );

  const params =
    CalculationMethod.MuslimWorldLeague();

  params.madhab = Madhab.Shafi;

  const prayerTimes = new PrayerTimes(
    coordinates,
    date,
    params
  );

  return {
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    duha: addMinutes(prayerTimes.sunrise, 25),
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
    qibla: Qibla(coordinates),
  };
};

const getDaysInMonth = (
  year: number,
  month: number
) => {
  return new Date(year, month + 1, 0).getDate();
};

export default function PrayerScreen() {
  const today = new Date();

  const soundRef = useRef<Audio.Sound | null>(null);

  const headingSubscriptionRef =
    useRef<Location.LocationSubscription | null>(
      null
    );

  const playedAzanKeysRef = useRef<Set<string>>(
    new Set()
  );

  const [locationName, setLocationName] =
    useState('Detecting your location...');

  const [coords, setCoords] =
    useState<{
      latitude: number;
      longitude: number;
    } | null>(null);

  const [prayerTimes, setPrayerTimes] =
    useState<any>(null);

  const [heading, setHeading] =
    useState(0);

  const [notificationsOn, setNotificationsOn] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [isAzanPlaying, setIsAzanPlaying] =
    useState(false);

  const [currentAzanPrayer, setCurrentAzanPrayer] =
    useState('');

  const [selectedMonth, setSelectedMonth] =
    useState(today.getMonth());

  const [selectedYear, setSelectedYear] =
    useState(today.getFullYear());

  const prayers = useMemo(() => {
    if (!prayerTimes) return [];

    return [
      {
        name: 'Fajr',
        arabic: 'الفجر',
        time: prayerTimes.fajr,
        icon: Moon,
        note: 'Begin your day with light',
      },
      {
        name: 'Salatul Duha',
        arabic: 'صلاة الضحى',
        time: prayerTimes.duha,
        icon: Sun,
        note: 'A prayer of gratitude and blessing',
      },
      {
        name: 'Dhuhr',
        arabic: 'الظهر',
        time: prayerTimes.dhuhr,
        icon: Sun,
        note: 'Pause and return to Allah',
      },
      {
        name: 'Asr',
        arabic: 'العصر',
        time: prayerTimes.asr,
        icon: Sun,
        note: 'A moment of discipline and mercy',
      },
      {
        name: 'Maghrib',
        arabic: 'المغرب',
        time: prayerTimes.maghrib,
        icon: Moon,
        note: 'End the day with remembrance',
      },
      {
        name: 'Isha',
        arabic: 'العشاء',
        time: prayerTimes.isha,
        icon: Moon,
        note: 'Close your night in peace',
      },
    ];
  }, [prayerTimes]);

  const nextPrayer = useMemo(() => {
    const now = new Date();

    return (
      prayers.find(prayer => prayer.time > now) ||
      prayers[0]
    );
  }, [prayers]);

  const monthlyPrayerCalendar = useMemo(() => {
    if (!coords) return [];

    const days = getDaysInMonth(
      selectedYear,
      selectedMonth
    );

    return Array.from({ length: days }, (_, index) => {
      const day = index + 1;

      const date = new Date(
        selectedYear,
        selectedMonth,
        day
      );

      const times = getPrayerTimesForDate(
        coords.latitude,
        coords.longitude,
        date
      );

      return {
        day,
        date,
        fajr: times.fajr,
        duha: times.duha,
        dhuhr: times.dhuhr,
        asr: times.asr,
        maghrib: times.maghrib,
        isha: times.isha,
      };
    });
  }, [coords, selectedMonth, selectedYear]);

  const qiblaBearing =
    prayerTimes?.qibla !== undefined
      ? normalizeAngle(prayerTimes.qibla)
      : 0;

  const qiblaRotation =
    prayerTimes?.qibla !== undefined
      ? getSignedAngleDifference(qiblaBearing, heading)
      : 0;

  const qiblaDifference =
    prayerTimes?.qibla !== undefined
      ? getAngleDifference(qiblaBearing, heading)
      : 999;

  const isQiblaAligned =
    prayerTimes?.qibla !== undefined &&
    qiblaDifference <= 7;

  const directionHint = useMemo(() => {
    if (prayerTimes?.qibla === undefined) {
      return 'Calculating Qibla direction...';
    }

    if (isQiblaAligned) {
      return 'Qibla aligned correctly';
    }

    const amount = Math.round(Math.abs(qiblaRotation));

    if (qiblaRotation > 0) {
      return `Turn right ${amount}°`;
    }

    return `Turn left ${amount}°`;
  }, [
    prayerTimes,
    isQiblaAligned,
    qiblaRotation,
  ]);

  const startHeadingUpdates = async () => {
    try {
      if (headingSubscriptionRef.current) {
        headingSubscriptionRef.current.remove();
      }

      headingSubscriptionRef.current =
        await Location.watchHeadingAsync(data => {
          const compassHeading =
            data.trueHeading && data.trueHeading > 0
              ? data.trueHeading
              : data.magHeading;

          setHeading(normalizeAngle(compassHeading || 0));
        });
    } catch {
      Alert.alert(
        'Compass Error',
        'Unable to start the compass. Please test Qibla on a real phone and keep location services enabled.'
      );
    }
  };

  const getLocationAndTimes = async () => {
    try {
      setLoading(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Needed',
          'Please allow location access so CHAFADIA NOOR can calculate accurate prayer times and Qibla direction.'
        );

        return;
      }

      const current =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const latitude = current.coords.latitude;
      const longitude = current.coords.longitude;

      setCoords({
        latitude,
        longitude,
      });

      const times = getPrayerTimesForDate(
        latitude,
        longitude,
        new Date()
      );

      setPrayerTimes(times);

      const reverse =
        await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

      if (reverse.length > 0) {
        const place = reverse[0];

        setLocationName(
          `${place.city || place.region || 'Your Area'}, ${
            place.country || ''
          }`
        );
      }

      await startHeadingUpdates();
    } catch {
      Alert.alert(
        'Error',
        'Unable to detect location or load prayer times. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const startAzanForPrayer = async (
    prayerName: string
  ) => {
    try {
      await stopAzan(false);

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound } =
        await Audio.Sound.createAsync(AZAN_SOUND);

      soundRef.current = sound;

      setCurrentAzanPrayer(prayerName);
      setIsAzanPlaying(true);

      sound.setOnPlaybackStatusUpdate(status => {
        if (
          status.isLoaded &&
          status.didJustFinish
        ) {
          setIsAzanPlaying(false);
          setCurrentAzanPrayer('');
          sound.unloadAsync();
          soundRef.current = null;
        }
      });

      await sound.playAsync();
    } catch {
      setIsAzanPlaying(false);
      setCurrentAzanPrayer('');

      Alert.alert(
        'Azan Audio',
        'Could not play Azan. Please confirm the file exists at src/assets/sounds/azan mp3.png.mp3.'
      );
    }
  };

  const stopAzan = async (
    showMessage = true
  ) => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      setIsAzanPlaying(false);
      setCurrentAzanPrayer('');

      if (showMessage) {
        Alert.alert(
          'Azan Stopped',
          'The Azan has been stopped.'
        );
      }
    } catch {
      setIsAzanPlaying(false);
      setCurrentAzanPrayer('');
    }
  };

  const handleAzanButtonPress = () => {
    if (isAzanPlaying) {
      stopAzan();
      return;
    }

    Alert.alert(
      'Azan Ready',
      'Azan will play automatically when it is time for prayer. You can stop it here when it starts.'
    );
  };

  const schedulePrayerNotifications = async () => {
    if (!prayerTimes) return;

    const { status } =
      await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Notifications Needed',
        'Please allow notifications to receive prayer reminders.'
      );

      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    for (const prayer of prayers) {
      if (prayer.time > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${prayer.name} Prayer Time`,
            body: `${prayer.arabic} • Azan will play in the app when CHAFADIA NOOR is open.`,
            sound:
              Platform.OS === 'android'
                ? 'default'
                : true,
          },
          trigger: {
            type:
              Notifications
                .SchedulableTriggerInputTypes
                .DATE,
            date: prayer.time,
          },
        });
      }
    }

    setNotificationsOn(true);

    Alert.alert(
      'Prayer Notifications Activated',
      'You will receive reminders for Fajr, Salatul Duha, Dhuhr, Asr, Maghrib and Isha.'
    );
  };

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  useEffect(() => {
    getLocationAndTimes();

    return () => {
      if (headingSubscriptionRef.current) {
        headingSubscriptionRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!prayers.length) return;

    const interval = setInterval(() => {
      const now = new Date();

      prayers.forEach(prayer => {
        if (
          isSamePrayerMinute(now, prayer.time)
        ) {
          const key = `${prayer.name}-${getPrayerKey(
            prayer.time
          )}`;

          if (
            !playedAzanKeysRef.current.has(key)
          ) {
            playedAzanKeysRef.current.add(key);

            startAzanForPrayer(prayer.name);
          }
        }
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [prayers]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#021F18"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bgCircleOne} />
        <View style={styles.bgCircleTwo} />
        <View style={styles.bgCircleThree} />

        <LinearGradient
          colors={['#021F18', '#064E3B', '#0F766E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroPatternOne} />
          <View style={styles.heroPatternTwo} />

          <View style={styles.heroBadge}>
            <Sparkles
              size={13}
              color="#F6D365"
            />

            <Text style={styles.heroBadgeText}>
              CHAFADIA NOOR
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            Prayer Times & Qibla
          </Text>

          <Text style={styles.heroSubtitle}>
            A refined Islamic companion for
            Salah, Qibla direction, Azan
            reminders and your monthly prayer
            calendar.
          </Text>

          <View style={styles.locationPill}>
            <MapPin
              size={14}
              color="#F6D365"
            />

            <Text style={styles.locationText}>
              {locationName}
            </Text>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['#FFFFFF', '#FFF8EA']}
          style={styles.nextPrayerCard}
        >
          <View style={styles.nextPrayerLeft}>
            <Text style={styles.nextLabel}>
              Next Prayer
            </Text>

            <Text style={styles.nextName}>
              {nextPrayer?.name || '--'}
            </Text>

            <Text style={styles.nextNote}>
              {nextPrayer?.note ||
                'May Allah accept your worship'}
            </Text>
          </View>

          <View style={styles.nextTimeBox}>
            <Text style={styles.nextTime}>
              {formatTime(nextPrayer?.time)}
            </Text>
          </View>
        </LinearGradient>

        {isAzanPlaying && (
          <LinearGradient
            colors={['#043B2D', '#064E3B']}
            style={styles.azanNowCard}
          >
            <Volume2
              size={18}
              color="#F6D365"
            />

            <View style={styles.azanNowTextBox}>
              <Text style={styles.azanNowTitle}>
                Azan is Playing
              </Text>

              <Text style={styles.azanNowSubtitle}>
                {currentAzanPrayer} prayer time has arrived.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.stopAzanButton}
              onPress={() => stopAzan()}
            >
              <Square
                size={13}
                color="#064E3B"
                fill="#064E3B"
              />

              <Text style={styles.stopAzanText}>
                Stop
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.actionButton}
            onPress={schedulePrayerNotifications}
          >
            {notificationsOn ? (
              <BellRing
                size={18}
                color="#064E3B"
              />
            ) : (
              <Bell
                size={18}
                color="#064E3B"
              />
            )}

            <Text style={styles.actionText}>
              {notificationsOn
                ? 'Alerts On'
                : 'Enable Alerts'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.actionButton,
              isAzanPlaying &&
                styles.stopActionButton,
            ]}
            onPress={handleAzanButtonPress}
          >
            {isAzanPlaying ? (
              <Square
                size={17}
                color="#8B1E1E"
                fill="#8B1E1E"
              />
            ) : (
              <Volume2
                size={18}
                color="#064E3B"
              />
            )}

            <Text
              style={[
                styles.actionText,
                isAzanPlaying &&
                  styles.stopActionText,
              ]}
            >
              {isAzanPlaying
                ? 'Stop Azan'
                : 'Azan Auto'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.actionButton}
            onPress={getLocationAndTimes}
          >
            <RefreshCw
              size={18}
              color="#064E3B"
            />

            <Text style={styles.actionText}>
              {loading ? 'Loading' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Today’s Prayer Times
            </Text>

            <Text style={styles.sectionSubtitle}>
              Including Salatul Duha
            </Text>
          </View>

          <View style={styles.sectionDecoration} />
        </View>

        <View style={styles.prayerGrid}>
          {prayers.map((prayer, index) => {
            const IconComponent = prayer.icon;

            const isNext =
              prayer.name === nextPrayer?.name;

            return (
              <LinearGradient
                key={index}
                colors={
                  isNext
                    ? ['#064E3B', '#0F766E']
                    : ['#FFFFFF', '#FFF8EA']
                }
                style={[
                  styles.prayerCard,
                  isNext &&
                    styles.activePrayerCard,
                ]}
              >
                <View
                  style={[
                    styles.prayerIconBox,
                    isNext &&
                      styles.activeIconBox,
                  ]}
                >
                  <IconComponent
                    size={18}
                    color={
                      isNext
                        ? '#F6D365'
                        : '#064E3B'
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.prayerName,
                    isNext &&
                      styles.activeText,
                  ]}
                >
                  {prayer.name}
                </Text>

                <Text
                  style={[
                    styles.prayerArabic,
                    isNext &&
                      styles.activeSoftText,
                  ]}
                >
                  {prayer.arabic}
                </Text>

                <Text
                  style={[
                    styles.prayerTime,
                    isNext &&
                      styles.activeGoldText,
                  ]}
                >
                  {formatTime(prayer.time)}
                </Text>
              </LinearGradient>
            );
          })}
        </View>

        <LinearGradient
          colors={
            isQiblaAligned
              ? ['#ECFDF5', '#FFFFFF']
              : ['#FFFFFF', '#FFF8EA']
          }
          style={[
            styles.qiblaCard,
            isQiblaAligned && styles.qiblaAlignedCard,
          ]}
        >
          <View style={styles.qiblaDecorOne} />
          <View style={styles.qiblaDecorTwo} />

          <View style={styles.qiblaHeader}>
            <View style={styles.qiblaIcon}>
              <Compass
                size={20}
                color="#064E3B"
              />
            </View>

            <View style={styles.qiblaHeaderText}>
              <Text style={styles.qiblaTitle}>
                Qibla Direction
              </Text>

              <Text style={styles.qiblaSubtitle}>
                Align the gold arrow with the top guide
              </Text>
            </View>

            <View
              style={[
                styles.qiblaStatusBadge,
                isQiblaAligned
                  ? styles.qiblaFoundBadge
                  : styles.qiblaSearchingBadge,
              ]}
            >
              {isQiblaAligned ? (
                <CheckCircle2
                  size={18}
                  color="#047857"
                />
              ) : (
                <XCircle
                  size={18}
                  color="#B91C1C"
                />
              )}
            </View>
          </View>

          <View
            style={[
              styles.qiblaStatusBox,
              isQiblaAligned &&
                styles.qiblaStatusBoxFound,
            ]}
          >
            <Target
              size={16}
              color={
                isQiblaAligned
                  ? '#047857'
                  : '#B45309'
              }
            />

            <View style={styles.qiblaStatusContent}>
              <Text
                style={[
                  styles.qiblaStatusTitle,
                  isQiblaAligned
                    ? styles.qiblaFoundText
                    : styles.qiblaSearchingText,
                ]}
              >
                {directionHint}
              </Text>

              <Text style={styles.qiblaStatusSubtext}>
                {isQiblaAligned
                  ? 'You are facing the correct Qibla direction.'
                  : 'Turn your phone slowly until the arrow reaches the top line.'}
              </Text>
            </View>
          </View>

          <View style={styles.compassContainer}>
            <LinearGradient
              colors={['#021F18', '#064E3B', '#0F766E']}
              style={styles.compassOuter}
            >
              <View style={styles.compassGlow} />

              <View style={styles.compassFace}>
                <View style={styles.compassRingLarge} />
                <View style={styles.compassRingMedium} />
                <View style={styles.compassRingSmall} />

                <Text style={styles.northLabel}>N</Text>
                <Text style={styles.southLabel}>S</Text>
                <Text style={styles.eastLabel}>E</Text>
                <Text style={styles.westLabel}>W</Text>

                <View style={styles.fixedTopGuide}>
                  <View style={styles.fixedTopDot} />
                  <View style={styles.fixedTopLine} />
                  <Text style={styles.faceText}>
                    FACE HERE
                  </Text>
                </View>

                <View
                  style={[
                    styles.qiblaArrowTrack,
                    {
                      transform: [
                        {
                          rotate: `${qiblaRotation}deg`,
                        },
                      ],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.qiblaArrowHead,
                      isQiblaAligned &&
                        styles.qiblaArrowHeadFound,
                    ]}
                  />
                  <View
                    style={[
                      styles.qiblaArrowBody,
                      isQiblaAligned &&
                        styles.qiblaArrowBodyFound,
                    ]}
                  />
                  <View
                    style={[
                      styles.qiblaArrowLabel,
                      isQiblaAligned &&
                        styles.qiblaArrowLabelFound,
                    ]}
                  >
                    <Text style={styles.qiblaArrowLabelText}>
                      QIBLA
                    </Text>
                  </View>
                </View>

                <LinearGradient
                  colors={
                    isQiblaAligned
                      ? ['#22C55E', '#047857']
                      : ['#EF4444', '#B91C1C']
                  }
                  style={styles.qiblaCenter}
                >
                  {isQiblaAligned ? (
                    <CheckCircle2
                      size={32}
                      color="#FFFFFF"
                    />
                  ) : (
                    <XCircle
                      size={32}
                      color="#FFFFFF"
                    />
                  )}
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.qiblaInfoRow}>
            <View style={styles.qiblaInfoPill}>
              <Text style={styles.qiblaInfoLabel}>
                Qibla
              </Text>

              <Text style={styles.qiblaInfoValue}>
                {prayerTimes?.qibla
                  ? `${Math.round(qiblaBearing)}°`
                  : '--'}
              </Text>
            </View>

            <View style={styles.qiblaInfoPill}>
              <Text style={styles.qiblaInfoLabel}>
                Phone
              </Text>

              <Text style={styles.qiblaInfoValue}>
                {`${Math.round(heading)}°`}
              </Text>
            </View>

            <View style={styles.qiblaInfoPill}>
              <Text style={styles.qiblaInfoLabel}>
                Off By
              </Text>

              <Text style={styles.qiblaInfoValue}>
                {prayerTimes?.qibla
                  ? `${Math.round(qiblaDifference)}°`
                  : '--'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.recalibrateButton}
            onPress={startHeadingUpdates}
          >
            <LocateFixed
              size={15}
              color="#064E3B"
            />

            <Text style={styles.recalibrateText}>
              Recalibrate Compass
            </Text>
          </TouchableOpacity>

          <Text style={styles.qiblaText}>
            Keep your phone flat, away from metal,
            and rotate slowly. The Qibla is correct
            when the gold arrow touches the top guide
            and the green tick appears.
          </Text>
        </LinearGradient>

        <LinearGradient
          colors={['#FFFFFF', '#FFF8EA']}
          style={styles.calendarCard}
        >
          <View style={styles.calendarTop}>
            <View style={styles.calendarTitleRow}>
              <View style={styles.calendarIcon}>
                <CalendarDays
                  size={18}
                  color="#064E3B"
                />
              </View>

              <View>
                <Text style={styles.calendarTitle}>
                  Prayer Time Calendar
                </Text>

                <Text style={styles.calendarSubtitle}>
                  View every day in any month
                  and year
                </Text>
              </View>
            </View>

            <View style={styles.monthControls}>
              <TouchableOpacity
                style={styles.monthButton}
                onPress={goToPreviousMonth}
              >
                <ChevronLeft
                  size={18}
                  color="#064E3B"
                />
              </TouchableOpacity>

              <Text style={styles.monthText}>
                {MONTHS[selectedMonth]}{' '}
                {selectedYear}
              </Text>

              <TouchableOpacity
                style={styles.monthButton}
                onPress={goToNextMonth}
              >
                <ChevronRight
                  size={18}
                  color="#064E3B"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.calendarTableHeader}>
            <Text style={styles.dayHead}>Day</Text>
            <Text style={styles.timeHead}>Fajr</Text>
            <Text style={styles.timeHead}>Duha</Text>
            <Text style={styles.timeHead}>Dhuhr</Text>
            <Text style={styles.timeHead}>Asr</Text>
            <Text style={styles.timeHead}>Magh.</Text>
            <Text style={styles.timeHead}>Isha</Text>
          </View>

          {monthlyPrayerCalendar.map(item => {
            const isToday =
              item.day === today.getDate() &&
              selectedMonth ===
                today.getMonth() &&
              selectedYear ===
                today.getFullYear();

            return (
              <View
                key={item.day}
                style={[
                  styles.calendarRow,
                  isToday && styles.todayRow,
                ]}
              >
                <Text
                  style={[
                    styles.dayCell,
                    isToday &&
                      styles.todayText,
                  ]}
                >
                  {item.day}
                </Text>

                <Text style={styles.timeCell}>
                  {formatTime(item.fajr)}
                </Text>

                <Text style={styles.timeCell}>
                  {formatTime(item.duha)}
                </Text>

                <Text style={styles.timeCell}>
                  {formatTime(item.dhuhr)}
                </Text>

                <Text style={styles.timeCell}>
                  {formatTime(item.asr)}
                </Text>

                <Text style={styles.timeCell}>
                  {formatTime(item.maghrib)}
                </Text>

                <Text style={styles.timeCell}>
                  {formatTime(item.isha)}
                </Text>
              </View>
            );
          })}
        </LinearGradient>

        <LinearGradient
          colors={['#021F18', '#064E3B']}
          style={styles.duaCard}
        >
          <Moon
            size={20}
            color="#F6D365"
          />

          <Text style={styles.duaTitle}>
            A Gentle Reminder
          </Text>

          <Text style={styles.duaText}>
            Salah is not only a duty; it is
            a meeting with Allah, a healing
            for the heart, and a light for
            the soul.
          </Text>
        </LinearGradient>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            May Allah accept your Salah,
            duas and remembrance.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3EBDD',
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 42,
    paddingBottom: 32,
  },

  bgCircleOne: {
    position: 'absolute',
    top: -135,
    right: -85,
    width: 270,
    height: 270,
    borderRadius: 999,
    backgroundColor: '#D8EFE7',
    opacity: 0.95,
  },

  bgCircleTwo: {
    position: 'absolute',
    top: 360,
    left: -70,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: '#F6D365',
    opacity: 0.18,
  },

  bgCircleThree: {
    position: 'absolute',
    bottom: -120,
    right: -80,
    width: 230,
    height: 230,
    borderRadius: 999,
    backgroundColor: '#064E3B',
    opacity: 0.08,
  },

  hero: {
    borderRadius: 34,
    paddingVertical: 34,
    paddingHorizontal: 22,
    marginTop: 10,
    marginBottom: 18,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#021F18',
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 10,
  },

  heroPatternOne: {
    position: 'absolute',
    top: -65,
    right: -45,
    width: 190,
    height: 190,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  heroPatternTwo: {
    position: 'absolute',
    bottom: -80,
    left: -55,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: 'rgba(246,211,101,0.13)',
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  heroBadgeText: {
    color: '#F6D365',
    marginLeft: 7,
    fontSize: 10.8,
    fontWeight: '900',
    letterSpacing: 0.9,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.4,
  },

  heroSubtitle: {
    color: '#DDF8EF',
    fontSize: 12.7,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
  },

  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.13)',
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.17)',
  },

  locationText: {
    color: '#FFFFFF',
    fontSize: 10.8,
    fontWeight: '800',
    marginLeft: 6,
  },

  nextPrayerCard: {
    borderRadius: 26,
    paddingVertical: 18,
    paddingHorizontal: 17,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EADDC7',
    shadowColor: '#5E4515',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.09,
    shadowRadius: 15,
    elevation: 4,
  },

  nextPrayerLeft: {
    flex: 1,
    paddingRight: 8,
  },

  nextLabel: {
    color: '#8B7D67',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  nextName: {
    color: '#021F18',
    fontSize: 21,
    fontWeight: '900',
    marginTop: 4,
  },

  nextNote: {
    color: '#6F6659',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
    lineHeight: 16,
  },

  nextTimeBox: {
    backgroundColor: '#F7E8BF',
    borderRadius: 19,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E8CD83',
  },

  nextTime: {
    color: '#855E09',
    fontSize: 15,
    fontWeight: '900',
  },

  azanNowCard: {
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  azanNowTextBox: {
    flex: 1,
    marginLeft: 10,
  },

  azanNowTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  azanNowSubtitle: {
    color: '#DDF8EF',
    fontSize: 10.6,
    fontWeight: '700',
    marginTop: 2,
  },

  stopAzanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6D365',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 999,
  },

  stopAzanText: {
    color: '#064E3B',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 4,
  },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  actionButton: {
    width: '32%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EADDC7',
    shadowColor: '#5E4515',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.07,
    shadowRadius: 11,
    elevation: 3,
  },

  stopActionButton: {
    backgroundColor: '#FDECEC',
    borderColor: '#F3CACA',
  },

  actionText: {
    color: '#064E3B',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 6,
    textAlign: 'center',
  },

  stopActionText: {
    color: '#8B1E1E',
  },

  sectionHeader: {
    marginBottom: 14,
    paddingHorizontal: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: '#021F18',
    fontSize: 18.5,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: '#6F6659',
    fontSize: 11.8,
    marginTop: 3,
    fontWeight: '600',
  },

  sectionDecoration: {
    width: 36,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#F6D365',
  },

  prayerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  prayerCard: {
    width: '31.5%',
    minHeight: 108,
    borderRadius: 21,
    paddingVertical: 14,
    paddingHorizontal: 6,
    marginBottom: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EADDC7',
    shadowColor: '#5E4515',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.07,
    shadowRadius: 11,
    elevation: 3,
  },

  activePrayerCard: {
    borderColor: '#064E3B',
  },

  prayerIconBox: {
    width: 35,
    height: 35,
    borderRadius: 13,
    backgroundColor: '#E6F4EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
  },

  activeIconBox: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  prayerName: {
    color: '#064E3B',
    fontSize: 10.9,
    fontWeight: '900',
    textAlign: 'center',
  },

  prayerArabic: {
    color: '#8B7D67',
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 2,
  },

  prayerTime: {
    color: '#021F18',
    fontSize: 13.2,
    fontWeight: '900',
    marginTop: 5,
  },

  activeText: {
    color: '#FFFFFF',
  },

  activeSoftText: {
    color: '#DDF8EF',
  },

  activeGoldText: {
    color: '#F6D365',
  },

  qiblaCard: {
    borderRadius: 34,
    paddingVertical: 22,
    paddingHorizontal: 17,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EADDC7',
    overflow: 'hidden',
    shadowColor: '#5E4515',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
  },

  qiblaAlignedCard: {
    borderColor: '#86EFAC',
  },

  qiblaDecorOne: {
    position: 'absolute',
    top: -50,
    right: -45,
    width: 135,
    height: 135,
    borderRadius: 999,
    backgroundColor: '#D8EFE7',
    opacity: 0.6,
  },

  qiblaDecorTwo: {
    position: 'absolute',
    bottom: -55,
    left: -45,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: '#F6D365',
    opacity: 0.13,
  },

  qiblaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  qiblaIcon: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: '#E6F4EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#CFE7DE',
  },

  qiblaHeaderText: {
    flex: 1,
  },

  qiblaTitle: {
    color: '#021F18',
    fontSize: 18,
    fontWeight: '900',
  },

  qiblaSubtitle: {
    color: '#6F6659',
    fontSize: 10.8,
    fontWeight: '600',
    marginTop: 3,
  },

  qiblaStatusBadge: {
    width: 38,
    height: 38,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  qiblaFoundBadge: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },

  qiblaSearchingBadge: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },

  qiblaStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EA',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#EADDC7',
    marginBottom: 18,
  },

  qiblaStatusBoxFound: {
    backgroundColor: '#ECFDF5',
    borderColor: '#86EFAC',
  },

  qiblaStatusContent: {
    flex: 1,
    marginLeft: 9,
  },

  qiblaStatusTitle: {
    fontSize: 13,
    fontWeight: '900',
  },

  qiblaFoundText: {
    color: '#047857',
  },

  qiblaSearchingText: {
    color: '#B45309',
  },

  qiblaStatusSubtext: {
    color: '#6F6659',
    fontSize: 10.4,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 15,
  },

  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },

  compassOuter: {
    width: 254,
    height: 254,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#021F18',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 7,
  },

  compassGlow: {
    position: 'absolute',
    width: 215,
    height: 215,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  compassFace: {
    width: 224,
    height: 224,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  compassRingLarge: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(246,211,101,0.34)',
  },

  compassRingMedium: {
    position: 'absolute',
    width: 145,
    height: 145,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  compassRingSmall: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(246,211,101,0.3)',
  },

  northLabel: {
    position: 'absolute',
    top: 13,
    color: '#F6D365',
    fontSize: 15,
    fontWeight: '900',
    zIndex: 5,
  },

  southLabel: {
    position: 'absolute',
    bottom: 13,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '900',
    zIndex: 5,
  },

  eastLabel: {
    position: 'absolute',
    right: 15,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '900',
    zIndex: 5,
  },

  westLabel: {
    position: 'absolute',
    left: 15,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '900',
    zIndex: 5,
  },

  fixedTopGuide: {
    position: 'absolute',
    top: 22,
    alignItems: 'center',
    zIndex: 30,
  },

  fixedTopDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#F6D365',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  fixedTopLine: {
    width: 4,
    height: 45,
    borderRadius: 999,
    backgroundColor: '#F6D365',
    marginTop: 4,
  },

  faceText: {
    color: '#F6D365',
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginTop: 4,
  },

  qiblaArrowTrack: {
    position: 'absolute',
    width: 224,
    height: 224,
    borderRadius: 999,
    alignItems: 'center',
    zIndex: 20,
  },

  qiblaArrowHead: {
    position: 'absolute',
    top: 24,
    width: 0,
    height: 0,
    borderLeftWidth: 13,
    borderRightWidth: 13,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#EF4444',
  },

  qiblaArrowHeadFound: {
    borderBottomColor: '#22C55E',
  },

  qiblaArrowBody: {
    position: 'absolute',
    top: 49,
    width: 8,
    height: 52,
    borderRadius: 999,
    backgroundColor: '#EF4444',
  },

  qiblaArrowBodyFound: {
    backgroundColor: '#22C55E',
  },

  qiblaArrowLabel: {
    position: 'absolute',
    top: 99,
    backgroundColor: '#EF4444',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  qiblaArrowLabelFound: {
    backgroundColor: '#22C55E',
  },

  qiblaArrowLabelText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  qiblaCenter: {
    width: 64,
    height: 64,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    zIndex: 40,
  },

  qiblaInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  qiblaInfoPill: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EADDC7',
  },

  qiblaInfoLabel: {
    color: '#8B7D67',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  qiblaInfoValue: {
    color: '#064E3B',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 3,
  },

  recalibrateButton: {
    marginTop: 14,
    backgroundColor: '#F7E8BF',
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8CD83',
  },

  recalibrateText: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 7,
  },

  qiblaText: {
    color: '#6F6659',
    fontSize: 10.9,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 11,
    fontWeight: '600',
  },

  calendarCard: {
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 13,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EADDC7',
    shadowColor: '#5E4515',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },

  calendarTop: {
    marginBottom: 15,
  },

  calendarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  calendarIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#E6F4EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
    borderWidth: 1,
    borderColor: '#CFE7DE',
  },

  calendarTitle: {
    color: '#021F18',
    fontSize: 16.5,
    fontWeight: '900',
  },

  calendarSubtitle: {
    color: '#6F6659',
    fontSize: 10.6,
    fontWeight: '600',
    marginTop: 2,
  },

  monthControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  monthButton: {
    width: 38,
    height: 38,
    borderRadius: 15,
    backgroundColor: '#F7E8BF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8CD83',
  },

  monthText: {
    color: '#064E3B',
    fontSize: 13.6,
    fontWeight: '900',
  },

  calendarTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#064E3B',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 8,
  },

  dayHead: {
    width: '10%',
    color: '#F6D365',
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
  },

  timeHead: {
    width: '15%',
    color: '#F6D365',
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
  },

  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },

  todayRow: {
    backgroundColor: '#F7E8BF',
    borderColor: '#F6D365',
  },

  dayCell: {
    width: '10%',
    color: '#021F18',
    fontSize: 8.9,
    fontWeight: '900',
    textAlign: 'center',
  },

  todayText: {
    color: '#855E09',
  },

  timeCell: {
    width: '15%',
    color: '#4B5563',
    fontSize: 7.7,
    fontWeight: '800',
    textAlign: 'center',
  },

  duaCard: {
    borderRadius: 27,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 22,
    overflow: 'hidden',
    shadowColor: '#021F18',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },

  duaTitle: {
    color: '#F6D365',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 8,
  },

  duaText: {
    color: '#E7F8F0',
    fontSize: 11.2,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
    fontWeight: '600',
  },

  footerContainer: {
    paddingBottom: 25,
    alignItems: 'center',
  },

  footerText: {
    color: '#8B7D67',
    fontSize: 10.6,
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});