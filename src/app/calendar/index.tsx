import React, { useEffect, useMemo, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Bell,
  Search,
  Share2,
  Plus,
  Trash2,
  CheckCircle,
  Sparkles,
  Landmark,
  Info,
  Star,
  Heart,
} from 'lucide-react-native';

type CalendarCell = {
  date: Date;
  key: string;

  gregorianDay: number;
  gregorianMonthEnglish: string;
  gregorianMonthArabic: string;
  gregorianWeekdayEnglish: string;
  gregorianWeekdayArabic: string;
  gregorianYear: number;

  islamicDay: number;
  islamicMonthEnglish: string;
  islamicMonthArabic: string;
  islamicMonthNumber: number;
  islamicYear: number;

  lamsoDayShort: string;
  lamsoDayFull: string;
  lamsoDayNumber: number;
  lamsoMonth: string;
  lamsoYear: number;

  isCurrentMonth: boolean;
  isToday: boolean;
  isFriday: boolean;
  isMondayThursday: boolean;
  isWhiteDay: boolean;
  isRamadan: boolean;
  isEidFitr: boolean;
  isEidAdha: boolean;
};

type NoteItem = {
  id: string;
  dateKey: string;
  text: string;
};

const GREEN = '#064E3B';
const EMERALD = '#0D7054';
const GOLD = '#D4A017';
const CREAM = '#F7F5EE';
const CARD = '#FFFDF8';
const MINT = '#E6F1EC';
const SOFT_GOLD = '#F5E9C8';
const ROSE = '#9F2D2D';
const TEXT = '#3C3A34';
const TODAY_BLUE = '#2563EB';

const STORAGE_NOTES = 'CHAFADIA_LAMSO_CALENDAR_NOTES_V2';
const STORAGE_MARKED_DAYS = 'CHAFADIA_LAMSO_CALENDAR_MARKED_DAYS_V2';

const GREGORIAN_WEEK_DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const GREGORIAN_WEEK_DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const GREGORIAN_MONTHS_EN = [
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

const GREGORIAN_MONTHS_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const ISLAMIC_MONTHS_EN = [
  'Muharram',
  'Safar',
  'Rabi Al-Awwal',
  'Rabi Al-Thani',
  'Jumada Al-Awwal',
  'Jumada Al-Thani',
  'Rajab',
  'Sha’ban',
  'Ramadan',
  'Shawwal',
  'Dhul Qi’dah',
  'Dhul Hijjah',
];

const ISLAMIC_MONTHS_AR = [
  'مُحَرَّم',
  'صَفَر',
  'رَبِيع الأَوَّل',
  'رَبِيع الثَّانِي',
  'جُمَادَى الأُولَى',
  'جُمَادَى الثَّانِيَة',
  'رَجَب',
  'شَعْبَان',
  'رَمَضَان',
  'شَوَّال',
  'ذُو القَعْدَة',
  'ذُو الحِجَّة',
];

const LAMSO_MONTHS = [
  'Mfiilum',
  'Kifir',
  'Kiŋmgbù ke wuu',
  'Vishévti',
  "Ma'an san",
  "Ma'an saar",
  'Ntoòbiŋ',
  'Tònŋkin',
  'ŋkivin',
  'Verə̀mrə̀m',
  'Sán',
  'Ntinen Saar',
];

const LAMSO_DAYS_SHORT = ['Ka', 'Rə', 'Ki', 'Ns', 'Ge', 'ŋg', 'Wa', 'Nt'];

const LAMSO_DAYS_FULL = [
  'Kaáví',
  'Rəəvəy',
  'Kiloòvəy',
  'Nsəərí',
  'Geegee',
  'Ŋgòylùm',
  'Wáylùn',
  'Ntàŋrìn',
];

// Ya Nso’ 2026 starts Mfiilum with Ka.
const LAMSO_REFERENCE_DATE = new Date(2026, 0, 1);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function sameDate(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getIslamicDateEstimate(date: Date) {
  const islamicEpoch = new Date(622, 6, 16).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const daysSinceEpoch = Math.floor((date.getTime() - islamicEpoch) / dayMs);

  let islamicYear = Math.floor((30 * daysSinceEpoch + 10646) / 10631);

  const firstDayOfYear =
    Math.floor((islamicYear - 1) * 354 + Math.floor((3 + 11 * islamicYear) / 30));

  let dayOfYear = daysSinceEpoch - firstDayOfYear + 1;

  if (dayOfYear <= 0) {
    islamicYear -= 1;

    const previousFirstDay =
      Math.floor((islamicYear - 1) * 354 + Math.floor((3 + 11 * islamicYear) / 30));

    dayOfYear = daysSinceEpoch - previousFirstDay + 1;
  }

  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];

  let monthIndex = 0;

  while (dayOfYear > monthLengths[monthIndex] && monthIndex < 11) {
    dayOfYear -= monthLengths[monthIndex];
    monthIndex += 1;
  }

  return {
    day: dayOfYear,
    monthNumber: monthIndex + 1,
    monthEnglish: ISLAMIC_MONTHS_EN[monthIndex],
    monthArabic: ISLAMIC_MONTHS_AR[monthIndex],
    year: islamicYear,
  };
}

function getLamsoDate(date: Date) {
  const diff = Math.floor(
    (date.getTime() - LAMSO_REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );

  const cycleIndex = ((diff % 8) + 8) % 8;

  return {
    dayShort: LAMSO_DAYS_SHORT[cycleIndex],
    dayFull: LAMSO_DAYS_FULL[cycleIndex],
    dayNumber: cycleIndex + 1,
    month: LAMSO_MONTHS[date.getMonth()],
    year: date.getFullYear(),
  };
}

function buildMonthCells(currentMonth: Date): CalendarCell[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  const today = new Date();

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    const islamic = getIslamicDateEstimate(date);
    const lamso = getLamsoDate(date);
    const weekday = date.getDay();
    const gregorianMonth = date.getMonth();

    return {
      date,
      key: dateKey(date),

      gregorianDay: date.getDate(),
      gregorianMonthEnglish: GREGORIAN_MONTHS_EN[gregorianMonth],
      gregorianMonthArabic: GREGORIAN_MONTHS_AR[gregorianMonth],
      gregorianWeekdayEnglish: GREGORIAN_WEEK_DAYS_EN[weekday],
      gregorianWeekdayArabic: GREGORIAN_WEEK_DAYS_AR[weekday],
      gregorianYear: date.getFullYear(),

      islamicDay: islamic.day,
      islamicMonthEnglish: islamic.monthEnglish,
      islamicMonthArabic: islamic.monthArabic,
      islamicMonthNumber: islamic.monthNumber,
      islamicYear: islamic.year,

      lamsoDayShort: lamso.dayShort,
      lamsoDayFull: lamso.dayFull,
      lamsoDayNumber: lamso.dayNumber,
      lamsoMonth: lamso.month,
      lamsoYear: lamso.year,

      isCurrentMonth: date.getMonth() === month,
      isToday: sameDate(date, today),
      isFriday: weekday === 5,
      isMondayThursday: weekday === 1 || weekday === 4,
      isWhiteDay: islamic.day === 13 || islamic.day === 14 || islamic.day === 15,
      isRamadan: islamic.monthNumber === 9,
      isEidFitr: islamic.monthNumber === 10 && islamic.day === 1,
      isEidAdha: islamic.monthNumber === 12 && islamic.day === 10,
    };
  });
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarCell | null>(null);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [markedDays, setMarkedDays] = useState<string[]>([]);
  const [noteText, setNoteText] = useState('');
  const [query, setQuery] = useState('');

  const cells = useMemo(() => buildMonthCells(currentMonth), [currentMonth]);

  const calendarRows = useMemo(() => {
    const rows: CalendarCell[][] = [];
    for (let index = 0; index < cells.length; index += 7) {
      rows.push(cells.slice(index, index + 7));
    }
    return rows;
  }, [cells]);

  const currentMonthLamso = LAMSO_MONTHS[currentMonth.getMonth()];
  const currentMonthArabic = GREGORIAN_MONTHS_AR[currentMonth.getMonth()];
  const currentMonthEnglish = GREGORIAN_MONTHS_EN[currentMonth.getMonth()];

  const todayDateDetails = useMemo(() => {
    const date = new Date();
    const islamic = getIslamicDateEstimate(date);
    const lamso = getLamsoDate(date);
    const weekday = date.getDay();
    const month = date.getMonth();

    return {
      gregorian: `${GREGORIAN_WEEK_DAYS_EN[weekday]}, ${GREGORIAN_MONTHS_EN[month]} ${date.getDate()}, ${date.getFullYear()}`,
      islamic: `${islamic.day} ${islamic.monthEnglish} ${islamic.year} AH`,
      lamso: `${lamso.dayFull} (${lamso.dayShort}), ${lamso.month} ${lamso.year}`,
    };
  }, []);

  const selectedNotes = useMemo(() => {
    if (!selectedDay) return [];
    return notes.filter(note => note.dateKey === selectedDay.key);
  }, [notes, selectedDay]);

  const filteredCells = useMemo(() => {
    const s = query.toLowerCase();

    if (!s.trim()) return [];

    return cells.filter(
      cell =>
        cell.gregorianMonthEnglish.toLowerCase().includes(s) ||
        cell.gregorianMonthArabic.includes(query) ||
        cell.islamicMonthEnglish.toLowerCase().includes(s) ||
        cell.islamicMonthArabic.includes(query) ||
        cell.lamsoDayFull.toLowerCase().includes(s) ||
        cell.lamsoDayShort.toLowerCase().includes(s) ||
        cell.lamsoMonth.toLowerCase().includes(s) ||
        formatFullDate(cell.date).toLowerCase().includes(s)
    );
  }, [query, cells]);

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    const savedNotes = await AsyncStorage.getItem(STORAGE_NOTES);
    const savedMarked = await AsyncStorage.getItem(STORAGE_MARKED_DAYS);

    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedMarked) setMarkedDays(JSON.parse(savedMarked));
  };

  const saveNotes = async (items: NoteItem[]) => {
    setNotes(items);
    await AsyncStorage.setItem(STORAGE_NOTES, JSON.stringify(items));
  };

  const saveMarkedDays = async (items: string[]) => {
    setMarkedDays(items);
    await AsyncStorage.setItem(STORAGE_MARKED_DAYS, JSON.stringify(items));
  };

  const changeMonth = (direction: number) => {
    setSelectedDay(null);
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const goToday = () => {
    const today = new Date();
    const month = new Date(today.getFullYear(), today.getMonth(), 1);
    const todayCell = buildMonthCells(month).find(cell => cell.isToday);

    setCurrentMonth(month);
    if (todayCell) setSelectedDay(todayCell);
  };

  const addNote = async () => {
    if (!selectedDay) {
      Alert.alert('Select a date', 'Please select a day first.');
      return;
    }

    if (!noteText.trim()) {
      Alert.alert('Empty note', 'Please write something.');
      return;
    }

    const newNote: NoteItem = {
      id: `${Date.now()}`,
      dateKey: selectedDay.key,
      text: noteText.trim(),
    };

    await saveNotes([newNote, ...notes]);
    setNoteText('');
  };

  const deleteNote = async (id: string) => {
    await saveNotes(notes.filter(note => note.id !== id));
  };

  const toggleMarkedDay = async (key: string) => {
    const updated = markedDays.includes(key)
      ? markedDays.filter(item => item !== key)
      : [...markedDays, key];

    await saveMarkedDays(updated);
  };

  const scheduleDailyReminder = async () => {
    try {
      const permission = await Notifications.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Please allow notifications.');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Calendar Reminder 📅',
          body: 'Check today’s Gregorian, Islamic and Lamso calendar details.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 7,
          minute: 0,
        },
      });

      Alert.alert('Reminder Saved', 'Daily calendar reminder has been set.');
    } catch {
      Alert.alert('Reminder Error', 'Unable to schedule reminder.');
    }
  };

  const shareSelectedDate = async () => {
    if (!selectedDay) {
      Alert.alert('Select a date', 'Please select a date to share.');
      return;
    }

    await Share.share({
      message:
        `${formatFullDate(selectedDay.date)}\n\n` +
        `Gregorian: ${selectedDay.gregorianWeekdayEnglish}, ${selectedDay.gregorianMonthEnglish} ${selectedDay.gregorianDay}, ${selectedDay.gregorianYear}\n` +
        `Arabic Gregorian: ${selectedDay.gregorianWeekdayArabic}، ${selectedDay.gregorianMonthArabic}\n` +
        `Islamic: ${selectedDay.islamicDay} ${selectedDay.islamicMonthEnglish} / ${selectedDay.islamicMonthArabic} ${selectedDay.islamicYear} AH\n` +
        `Lamso: ${selectedDay.lamsoDayFull} (${selectedDay.lamsoDayShort}), ${selectedDay.lamsoMonth} ${selectedDay.lamsoYear}`,
    });
  };

  const todayCell = cells.find(cell => cell.isToday);
  const markedCount = markedDays.length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.goldGlow} />
        <View style={styles.greenGlow} />

        <LinearGradient colors={[GREEN, EMERALD]} style={styles.hero}>
          <View style={styles.heroBadge}>
            <CalendarDays size={14} color={GOLD} />
            <Text style={styles.heroBadgeText}>Complete Calendar</Text>
          </View>

          <Text style={styles.heroTitle}>3-in-1 Calendar</Text>

          <Text style={styles.heroSubtitle}>
            Gregorian, Islamic Hijri and Lamso calendar together, with Arabic, English and Lamso names.
          </Text>

          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroButton} onPress={goToday}>
              <Sun size={17} color="#FFFFFF" />
              <Text style={styles.heroButtonText}>Today</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.heroButtonGold} onPress={scheduleDailyReminder}>
              <Bell size={17} color="#FFFFFF" />
              <Text style={styles.heroButtonText}>Reminder</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.todayBanner}>
          <View style={styles.todayCircle}>
            <Text style={styles.todayCircleText}>{todayCell?.gregorianDay || new Date().getDate()}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.todayTitle}>TODAY IS HIGHLIGHTED IN BLUE</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Sun size={18} color={GOLD} />
            <Text style={styles.statNumber}>{todayCell?.gregorianDay || new Date().getDate()}</Text>
            <Text style={styles.statLabel}>Gregorian</Text>
          </View>

          <View style={styles.statCard}>
            <Moon size={18} color={GOLD} />
            <Text style={styles.statNumber}>{todayCell?.islamicDay || '-'}</Text>
            <Text style={styles.statLabel}>Islamic</Text>
          </View>

          <View style={styles.statCard}>
            <Landmark size={18} color={GOLD} />
            <Text style={styles.statNumber}>{todayCell?.lamsoDayShort || '-'}</Text>
            <Text style={styles.statLabel}>Lamso</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Search size={18} color={GREEN} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search English, Arabic, Islamic or Lamso..."
            placeholderTextColor="#8A8172"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {query.trim().length > 0 && (
          <LinearGradient colors={[CARD, '#F7F0DC']} style={styles.searchResultCard}>
            <Text style={styles.searchTitle}>Search Results</Text>

            {filteredCells.length === 0 && (
              <Text style={styles.cardText}>No date found in this visible month.</Text>
            )}

            {filteredCells.map(cell => (
              <TouchableOpacity
                key={cell.key}
                style={styles.searchResultRow}
                onPress={() => {
                  setSelectedDay(cell);
                  setQuery('');
                }}
              >
                <CalendarDays size={16} color={GOLD} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.searchResultTitle}>{formatFullDate(cell.date)}</Text>
                  <Text style={styles.searchResultText}>
                    Islamic: {cell.islamicDay} {cell.islamicMonthEnglish} • Lamso: {cell.lamsoDayFull}, {cell.lamsoMonth}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </LinearGradient>
        )}

        <LinearGradient colors={[CARD, '#F8F1DF']} style={styles.fullDateCard}>
          <View style={styles.fullDateHeader}>
            <View style={styles.fullDateIcon}>
              <CalendarDays size={20} color={GOLD} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.fullDateTitle}>Today’s Full Date</Text>
              <Text style={styles.fullDateSubtitle}>Gregorian • Islamic • Lamso</Text>
            </View>
          </View>

          <View style={styles.fullDateRow}>
            <Sun size={16} color={GOLD} />
            <View style={styles.fullDateTextWrap}>
              <Text style={styles.fullDateLabel}>Gregorian</Text>
              <Text style={styles.fullDateText}>{todayDateDetails.gregorian}</Text>
            </View>
          </View>

          <View style={styles.fullDateRow}>
            <Moon size={16} color={GOLD} />
            <View style={styles.fullDateTextWrap}>
              <Text style={styles.fullDateLabel}>Islamic</Text>
              <Text style={styles.fullDateText}>{todayDateDetails.islamic}</Text>
            </View>
          </View>

          <View style={styles.fullDateRowLast}>
            <Landmark size={16} color={GOLD} />
            <View style={styles.fullDateTextWrap}>
              <Text style={styles.fullDateLabel}>Lamso</Text>
              <Text style={styles.fullDateText}>{todayDateDetails.lamso}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.calendarHeader}>
          <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth(-1)}>
            <ChevronLeft size={22} color={GREEN} />
          </TouchableOpacity>

          <View style={styles.monthCenter}>
            <Text style={styles.monthTitle}>{currentMonthEnglish} {currentMonth.getFullYear()}</Text>
            <Text style={styles.monthSubArabic}>{currentMonthArabic}</Text>
            <Text style={styles.monthSub}>Lamso: {currentMonthLamso}</Text>
          </View>

          <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth(1)}>
            <ChevronRight size={22} color={GREEN} />
          </TouchableOpacity>
        </View>

        <View style={styles.lamsoWeekRow}>
          {LAMSO_DAYS_FULL.map((day, index) => (
            <View key={day} style={styles.lamsoWeekPill}>
              <Text style={styles.lamsoWeekShort}>{LAMSO_DAYS_SHORT[index]}</Text>
              <Text style={styles.lamsoWeekFull} numberOfLines={1}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.legendGrid}>
          <Legend color={TODAY_BLUE} text="Today" />
          <Legend color={GREEN} text="Ramadan / Eid" />
          <Legend color={GOLD} text="White days" />
          <Legend color={ROSE} text="Marked day" />
        </View>

        <View style={styles.calendarFrame}>
          <View style={styles.weekRow}>
            {GREGORIAN_WEEK_DAYS_EN.map((day, index) => (
              <View key={day} style={styles.weekCell}>
                <Text style={styles.weekText}>{day}</Text>
                <Text style={styles.weekArabicText}>{GREGORIAN_WEEK_DAYS_AR[index]}</Text>
              </View>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarRows.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.calendarRow}>
                {row.map(cell => {
                  const marked = markedDays.includes(cell.key);
                  const selected = selectedDay?.key === cell.key;
                  const islamicEvent = cell.isRamadan || cell.isEidFitr || cell.isEidAdha;

                  return (
                    <TouchableOpacity
                      key={cell.key}
                      activeOpacity={0.82}
                      style={[
                        styles.dateCell,
                        !cell.isCurrentMonth && styles.dateCellDim,
                        cell.isMondayThursday && !islamicEvent && styles.sunnahCell,
                        cell.isWhiteDay && !islamicEvent && styles.whiteDayCell,
                        islamicEvent && styles.ramadanCell,
                        marked && styles.markedCell,
                        selected && styles.selectedCell,
                        cell.isToday && styles.todayCell,
                      ]}
                      onPress={() => setSelectedDay(cell)}
                    >
                      <Text style={[styles.gregorianText, (islamicEvent || cell.isToday) && styles.lightText, !cell.isCurrentMonth && styles.dimText]}>
                        {cell.gregorianDay}
                      </Text>

                      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={[styles.islamicText, (islamicEvent || cell.isToday) && styles.lightText, !cell.isCurrentMonth && styles.dimText]}>
                        {cell.islamicDay} {cell.islamicMonthArabic}
                      </Text>

                      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={[styles.lamsoText, (islamicEvent || cell.isToday) && styles.lightText, !cell.isCurrentMonth && styles.dimText]}>
                        {cell.lamsoDayShort} • {cell.lamsoMonth}
                      </Text>

                      <View style={styles.dotRow}>
                        {cell.isToday && <View style={styles.todayDot} />}
                        {cell.isRamadan && <View style={styles.goldDot} />}
                        {cell.isWhiteDay && <View style={styles.whiteDot} />}
                        {cell.isMondayThursday && <View style={styles.mintDot} />}
                        {marked && <View style={styles.roseDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {selectedDay && (
          <LinearGradient colors={[CARD, '#F7F0DC']} style={styles.selectedCard}>
            <View style={styles.selectedTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedTitle}>{formatFullDate(selectedDay.date)}</Text>
                <Text style={styles.selectedSub}>Full date details</Text>
              </View>

              <TouchableOpacity style={styles.shareSmall} onPress={shareSelectedDate}>
                <Share2 size={17} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Detail
              icon={<Sun size={18} color={GOLD} />}
              title="Gregorian / English"
              text={`${selectedDay.gregorianWeekdayEnglish}, ${selectedDay.gregorianMonthEnglish} ${selectedDay.gregorianDay}, ${selectedDay.gregorianYear}`}
            />

            <Detail
              icon={<Sun size={18} color={GOLD} />}
              title="Gregorian / Arabic"
              text={`${selectedDay.gregorianWeekdayArabic}، ${selectedDay.gregorianMonthArabic} ${selectedDay.gregorianDay}, ${selectedDay.gregorianYear}`}
            />

            <Detail
              icon={<Moon size={18} color={GOLD} />}
              title="Islamic / English + Arabic"
              text={`${selectedDay.islamicDay} ${selectedDay.islamicMonthEnglish} / ${selectedDay.islamicMonthArabic} ${selectedDay.islamicYear} AH`}
            />

            <Detail
              icon={<Landmark size={18} color={GOLD} />}
              title="Lamso"
              text={`${selectedDay.lamsoDayFull} (${selectedDay.lamsoDayShort}), ${selectedDay.lamsoMonth} ${selectedDay.lamsoYear}`}
            />

            {selectedDay.isToday && <Special text="🔵 Today / Current date" />}
            {selectedDay.isRamadan && <Special text="🌙 Ramadan day" />}
            {selectedDay.isEidFitr && <Special text="✨ Eid al-Fitr" />}
            {selectedDay.isEidAdha && <Special text="🐏 Eid al-Adha" />}
            {selectedDay.isFriday && <Special text="🕌 Friday / Jumu’ah" />}
            {selectedDay.isWhiteDay && <Special text="⭐ White day fast: 13th, 14th or 15th Hijri" />}
            {selectedDay.isMondayThursday && <Special text="☀️ Sunnah fast: Monday or Thursday" />}

            <TouchableOpacity
              style={[styles.markButton, markedDays.includes(selectedDay.key) && styles.markButtonActive]}
              onPress={() => toggleMarkedDay(selectedDay.key)}
            >
              <CheckCircle size={17} color="#FFFFFF" />
              <Text style={styles.markButtonText}>
                {markedDays.includes(selectedDay.key) ? 'Remove Mark' : 'Mark This Day'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.noteLabel}>Add Note or Event</Text>

            <View style={styles.noteInputRow}>
              <TextInput
                style={styles.noteInput}
                placeholder="Write note, event, reminder..."
                placeholderTextColor="#8A8172"
                value={noteText}
                onChangeText={setNoteText}
              />

              <TouchableOpacity style={styles.addButton} onPress={addNote}>
                <Plus size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {selectedNotes.map(note => (
              <View key={note.id} style={styles.noteRow}>
                <Text style={styles.noteText}>{note.text}</Text>
                <TouchableOpacity onPress={() => deleteNote(note.id)}>
                  <Trash2 size={18} color={ROSE} />
                </TouchableOpacity>
              </View>
            ))}
          </LinearGradient>
        )}

        <LinearGradient colors={[CARD, '#F7F0DC']} style={styles.infoCard}>
          <Info size={22} color={GOLD} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Calendar Notes</Text>
            <Text style={styles.infoText}>
              Islamic dates are estimated and may differ by one day depending on moon sighting. Lamso uses the 8-day cycle: Kaáví, Rəəvəy, Kiloòvəy, Nsəərí, Geegee, Ŋgòylùm, Wáylùn, Ntàŋrìn.
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Sparkles size={18} color={GOLD} />
          <Text style={styles.sectionTitle}>Useful Features</Text>
        </View>

        {[
          `Marked days saved: ${markedCount}`,
          'Today is automatically highlighted and moves to the new date daily.',
          'View Gregorian month/day names in English and Arabic.',
          'View Islamic month names in English and Arabic.',
          'View Lamso month and full Lamso day names.',
          'Track Ramadan, Eid, white days and Monday/Thursday fasts.',
          'Add notes for appointments, family events and reminders.',
        ].map(item => (
          <View key={item} style={styles.featureRow}>
            <CheckCircle size={18} color={GREEN} />
            <Text style={styles.featureText}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{text}</Text>
    </View>
  );
}

function Detail({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <View style={styles.detailCard}>
      {icon}
      <Text style={styles.detailTitle}>{title}</Text>
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

function Special({ text }: { text: string }) {
  return <Text style={styles.specialText}>{text}</Text>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: CREAM },
  container: { flex: 1 },
  content: { paddingHorizontal: 13, paddingTop: 22, paddingBottom: 34 },

  goldGlow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: GOLD,
    opacity: 0.15,
  },

  greenGlow: {
    position: 'absolute',
    top: 390,
    left: -100,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: GREEN,
    opacity: 0.08,
  },

  hero: {
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: GREEN,
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  heroBadgeText: { color: GOLD, fontSize: 11, fontWeight: '900', marginLeft: 6 },
  heroTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '900', letterSpacing: 0.2 },

  heroSubtitle: {
    color: '#E6FFF4',
    fontSize: 11.5,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 9,
    fontWeight: '700',
  },

  heroActions: { flexDirection: 'row', marginTop: 13, gap: 8 },

  heroButton: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 15,
    paddingVertical: 9,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroButtonGold: {
    backgroundColor: GOLD,
    borderRadius: 15,
    paddingVertical: 9,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroButtonText: { color: '#FFFFFF', fontWeight: '900', marginLeft: 7, fontSize: 12 },

  todayBanner: {
    backgroundColor: '#EAF1FF',
    borderRadius: 18,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBD0FF',
    marginBottom: 14,
  },

  todayCircle: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: TODAY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  todayCircleText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },

  todayTitle: {
    color: TODAY_BLUE,
    fontSize: 14,
    fontWeight: '900',
  },

  todayText: {
    color: TEXT,
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 4,
  },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 11 },

  statCard: {
    width: '32%',
    backgroundColor: CARD,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  statNumber: { color: GREEN, fontSize: 13.5, fontWeight: '900', marginTop: 4 },
  statLabel: { color: '#746A5D', fontSize: 9.5, fontWeight: '800', marginTop: 2 },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 12,
  },

  searchInput: { flex: 1, color: GREEN, fontWeight: '800', marginLeft: 8 },

  searchResultCard: {
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 12,
  },

  searchTitle: { color: GREEN, fontSize: 15, fontWeight: '900', marginBottom: 8 },

  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MINT,
    borderRadius: 16,
    padding: 10,
    marginBottom: 7,
  },

  searchResultTitle: { color: GREEN, fontSize: 12, fontWeight: '900', marginLeft: 8 },

  searchResultText: {
    color: '#6B6257',
    fontSize: 10.5,
    fontWeight: '700',
    marginLeft: 8,
    marginTop: 2,
  },

  fullDateCard: {
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E9DEC8',
    marginBottom: 12,
    shadowColor: '#3E2F13',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 14,
    elevation: 3,
  },

  fullDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  fullDateIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(6,78,59,0.06)',
  },

  fullDateTitle: {
    color: GREEN,
    fontSize: 15,
    fontWeight: '900',
  },

  fullDateSubtitle: {
    color: '#8A6A22',
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 2,
  },

  fullDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(230,241,236,0.72)',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 10,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: 'rgba(6,78,59,0.05)',
  },

  fullDateRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,233,200,0.72)',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.14)',
  },

  fullDateTextWrap: { flex: 1, marginLeft: 9 },

  fullDateLabel: {
    color: '#8A6A22',
    fontSize: 9.8,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  fullDateText: {
    color: GREEN,
    fontSize: 12.3,
    lineHeight: 17,
    fontWeight: '900',
    marginTop: 2,
  },

  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: MINT,
    justifyContent: 'center',
    alignItems: 'center',
  },

  monthCenter: { flex: 1, alignItems: 'center' },
  monthTitle: { color: GREEN, fontSize: 16, fontWeight: '900' },
  monthSubArabic: { color: GOLD, fontSize: 14.5, fontWeight: '900', marginTop: 2 },
  monthSub: { color: '#8A6A22', fontSize: 11, fontWeight: '800', marginTop: 3 },

  lamsoWeekRow: {
    flexDirection: 'row',
    backgroundColor: SOFT_GOLD,
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 10,
  },

  lamsoWeekPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  lamsoWeekShort: {
    color: '#8A6A22',
    fontSize: 11,
    fontWeight: '900',
  },

  lamsoWeekFull: {
    color: GREEN,
    fontSize: 6.5,
    fontWeight: '900',
    marginTop: 1,
    textAlign: 'center',
  },

  legendGrid: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },

  legendItem: { width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  legendDot: { width: 13, height: 13, borderRadius: 999, marginRight: 7 },
  legendText: { color: GREEN, fontSize: 10.5, fontWeight: '900' },

  calendarFrame: {
    backgroundColor: '#E3D6BC',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D8C9AA',
    marginBottom: 14,
    shadowColor: '#3E2F13',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 3,
  },

  weekRow: {
    flexDirection: 'row',
    backgroundColor: GREEN,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },

  weekCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },

  weekText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },

  weekArabicText: {
    color: GOLD,
    fontSize: 7,
    fontWeight: '900',
    marginTop: 2,
  },

 calendarGrid: {
    backgroundColor: '#E3D6BC',
  },

  calendarRow: {
    flexDirection: 'row',
    width: '100%',
  },

 dateCell: {
    flex: 1,
    minWidth: 0,
    height: 60,
    backgroundColor: CARD,
    borderWidth: 0.5,
    borderColor: '#E1D4BA',
    paddingVertical: 5,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dateCellDim: { backgroundColor: '#F1EEE6' },
  ramadanCell: { backgroundColor: GREEN },
  whiteDayCell: { backgroundColor: '#FFF7D9' },
  sunnahCell: { backgroundColor: '#EAF5EF' },
  todayCell: { backgroundColor: TODAY_BLUE, borderColor: '#93C5FD', borderWidth: 2.2 },
  markedCell: { borderColor: ROSE, borderWidth: 2 },
  selectedCell: { borderColor: GOLD, borderWidth: 2 },

  gregorianText: { color: GREEN, fontSize: 15.5, fontWeight: '900' },
  islamicText: { color: '#746A5D', fontSize: 6.7, fontWeight: '800', marginTop: 1, width: '100%', textAlign: 'center' },
  lamsoText: { color: GOLD, fontSize: 6.6, fontWeight: '900', marginTop: 1, width: '100%', textAlign: 'center' },
  dimText: { color: '#A39A8D' },
  lightText: { color: '#FFFFFF' },

  dotRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  todayDot: { width: 6, height: 6, borderRadius: 10, backgroundColor: '#FFFFFF', marginRight: 3 },
  goldDot: { width: 6, height: 6, borderRadius: 10, backgroundColor: GOLD, marginRight: 3 },
  whiteDot: { width: 6, height: 6, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: GOLD, marginRight: 3 },
  mintDot: { width: 6, height: 6, borderRadius: 10, backgroundColor: EMERALD, marginRight: 3 },
  roseDot: { width: 6, height: 6, borderRadius: 10, backgroundColor: ROSE, marginRight: 3 },

  selectedCard: {
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 14,
  },

  selectedTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  selectedTitle: { color: GREEN, fontSize: 15.5, fontWeight: '900' },
  selectedSub: { color: '#8A6A22', fontSize: 11, fontWeight: '800', marginTop: 3 },

  shareSmall: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailCard: {
    backgroundColor: MINT,
    borderRadius: 15,
    padding: 10,
    marginBottom: 9,
  },

  detailTitle: { color: GREEN, fontSize: 12, fontWeight: '900', marginTop: 7 },
  detailText: { color: TEXT, fontSize: 12.5, fontWeight: '700', marginTop: 4, lineHeight: 18 },

  specialText: { color: '#8A6A22', fontSize: 12.2, fontWeight: '900', marginTop: 7 },

  markButton: {
    backgroundColor: GREEN,
    borderRadius: 17,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 14,
  },

  markButtonActive: { backgroundColor: ROSE },
  markButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', marginLeft: 7 },

  noteLabel: { color: GREEN, fontSize: 14, fontWeight: '900', marginTop: 16, marginBottom: 8 },

  noteInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },

  noteInput: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    color: GREEN,
    fontWeight: '800',
  },

  addButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  noteRow: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  noteText: { flex: 1, color: TEXT, fontSize: 12.5, fontWeight: '800', lineHeight: 18 },

  infoCard: {
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  infoTitle: { color: GREEN, fontSize: 15, fontWeight: '900' },
  infoText: { color: TEXT, fontSize: 12, lineHeight: 18, fontWeight: '700', marginTop: 5 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 5 },
  sectionTitle: { color: GREEN, fontSize: 16, fontWeight: '900', marginLeft: 7 },

  featureRow: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  featureText: { color: TEXT, fontSize: 12.5, fontWeight: '800', marginLeft: 9, flex: 1, lineHeight: 18 },

  cardText: { color: TEXT, fontSize: 12.5, lineHeight: 20, fontWeight: '700' },
});