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
  ActivityIndicator,
  Alert,
  TextInput,
  Linking,
  BackHandler,
  Platform,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, Video, ResizeMode } from 'expo-av';
import * as Notifications from 'expo-notifications';

import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Headphones,
  Home,
  Menu,
  Pause,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Volume2,
  X,
  Bell,
  Square,
  Clock,
  CheckCircle,
  GraduationCap,
} from 'lucide-react-native';

const API_BASE = 'https://api.alquran.cloud/v1';
const TAFSIR_BASE = 'https://api.quran-tafseer.com/tafseer/1';
const TOTAL_QURAN_PAGES = 604;

const STORAGE_BOOKMARKS = 'CHAFADIA_QURAN_BOOKMARKS';
const STORAGE_PAGES = 'CHAFADIA_QURAN_PAGES_OFFLINE';
const STORAGE_SURAHS = 'CHAFADIA_QURAN_SURAHS_OFFLINE';
const STORAGE_REMINDER = 'CHAFADIA_QURAN_REMINDER';
const STORAGE_REMINDER_IDS = 'CHAFADIA_QURAN_REMINDER_IDS';

const QURAN_CHANNEL_ID = 'quran-reminders';

const BISMILLAH =
  'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const RECITERS = [
  { label: 'Mishary Alafasy', edition: 'ar.alafasy' },
  { label: 'Abdul Basit', edition: 'ar.abdulbasitmurattal' },
  { label: 'Minshawi', edition: 'ar.minshawi' },
  { label: 'Husary', edition: 'ar.husary' },
];

const DAYS = [
  { label: 'Sun', value: 1 },
  { label: 'Mon', value: 2 },
  { label: 'Tue', value: 3 },
  { label: 'Wed', value: 4 },
  { label: 'Thu', value: 5 },
  { label: 'Fri', value: 6 },
  { label: 'Sat', value: 7 },
];

const TAFSIR_VIDEO_ASSETS = {
  tafsir1: require('@/src/assets/sounds/Quran_Tafseer_01_27_-_Mufti_Menk(0).mp4'),
  tafsir2: require('@/src/assets/sounds/Quran_Tafseer_02_27_-_Mufti_Menk(0).mp4'),
  tafsir3: require('@/src/assets/sounds/Quran_Tafseer_03_27_-_Mufti_Menk(0).mp4'),
  tafsir4: require('@/src/assets/sounds/Quran_Tafseer_04_27_-_Mufti_Menk(0).mp4'),
  tafsir5: require('@/src/assets/sounds/Quran_Tafseer_05_27_-_Mufti_Menk(0).mp4'),
};

const TAFSIR_VIDEO_LESSONS = [
  {
    id: 'tafsir-01',
    episode: 1,
    title: 'Tafsir Journey 01',
    subtitle: 'Begin the Quran Tafsir journey with reflection, context and practical lessons.',
    media: TAFSIR_VIDEO_ASSETS.tafsir1,
  },
  {
    id: 'tafsir-02',
    episode: 2,
    title: 'Tafsir Journey 02',
    subtitle: 'Continue building your understanding of Allah’s words with a calm guided lesson.',
    media: TAFSIR_VIDEO_ASSETS.tafsir2,
  },
  {
    id: 'tafsir-03',
    episode: 3,
    title: 'Tafsir Journey 03',
    subtitle: 'Learn meanings, reminders and heart-softening lessons from the Quran.',
    media: TAFSIR_VIDEO_ASSETS.tafsir3,
  },
  {
    id: 'tafsir-04',
    episode: 4,
    title: 'Tafsir Journey 04',
    subtitle: 'A beautiful study session to connect recitation with understanding.',
    media: TAFSIR_VIDEO_ASSETS.tafsir4,
  },
  {
    id: 'tafsir-05',
    episode: 5,
    title: 'Tafsir Journey 05',
    subtitle: 'Reflect on Quranic guidance and how it shapes daily life.',
    media: TAFSIR_VIDEO_ASSETS.tafsir5,
  },
];


const GENERAL_TAFSIR_RESOURCES = [
  {
    title: 'Tafsir Ibn Kathir',
    description:
      'One of the most respected classical explanations of the Quran.',
    query: 'Tafsir Ibn Kathir Quran explanation',
  },
  {
    title: 'Tafsir As-Saadi',
    description:
      'A clear and beneficial explanation suitable for learning and reflection.',
    query: 'Tafsir As Saadi Quran explanation',
  },
  {
    title: 'Maarif-ul-Quran',
    description:
      'A detailed educational Tafsir useful for deeper study.',
    query: 'Maariful Quran Tafsir explanation',
  },
  {
    title: 'Tafsir Al-Jalalayn',
    description:
      'A concise classical Tafsir for quick understanding.',
    query: 'Tafsir Jalalayn Quran explanation',
  },
];

const LESSONS = [
  {
    title: 'Tafsir of the Quran for Beginners',
    query: 'Tafsir of Quran for beginners reliable Islamic lecture',
  },
  {
    title: 'How to Understand the Quran',
    query: 'How to understand Quran for beginners Islamic lecture',
  },
  {
    title: 'Tajweed Lessons for Beginners',
    query: 'Tajweed lessons for beginners Quran recitation',
  },
  {
    title: 'Quran Memorization Tips',
    query: 'Quran memorization tips Islamic lecture',
  },
  {
    title: 'Surah Al-Fatihah Tafsir',
    query: 'Surah Al Fatihah Tafsir reliable lecture',
  },
  {
    title: 'How to Reflect on the Quran',
    query: 'How to reflect on Quran Tadabbur lecture',
  },
  {
    title: 'Beautiful Quran Recitation',
    query: 'beautiful Quran recitation Mishary Alafasy',
  },
  {
    title: 'Quran Study Routine',
    query: 'daily Quran study routine Muslim lecture',
  },
  {
    title: 'Arabic Quran Reading Practice',
    query: 'Arabic Quran reading practice tajweed',
  },
  {
    title: 'Understanding Surah Al-Baqarah',
    query: 'Surah Al Baqarah explanation Tafsir lecture',
  },
  {
    title: 'Tafsir Juz Amma',
    query: 'Tafsir Juz Amma reliable Islamic lecture',
  },
  {
    title: 'Quran For Daily Life',
    query: 'Quran lessons for daily life Muslim lecture',
  },
];

type Section =
  | 'home'
  | 'read'
  | 'translation'
  | 'listening'
  | 'tafsir'
  | 'learn'
  | 'saved'
  | 'reminder';

type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
};

type Ayah = {
  number: number;
  numberInSurah: number;
  juz: number;
  page: number;
  text: string;
  audio?: string;
  surah: Surah;
};

type SurahData = {
  arabic: Ayah[];
  translation: Ayah[];
  audio: Ayah[];
};

type PageData = {
  arabic: Ayah[];
};

type TafsirItem = {
  ayah: number;
  arabic: string;
  translation?: string;
  text: string;
  source: string;
};

const cleanText = (text: string) => {
  return text.replace(/\u06DD/g, '').trim();
};

const toArabicNumber = (num: number) => {
  return String(num).replace(
    /\d/g,
    digit => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]
  );
};

const splitBismillah = (text: string) => {
  const cleaned = cleanText(text);

  const forms = [
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    'بسم الله الرحمن الرحيم',
  ];

  for (const form of forms) {
    if (cleaned.startsWith(form)) {
      return {
        hasBismillah: true,
        rest: cleaned.replace(form, '').trim(),
      };
    }
  }

  if (
    cleaned.includes('بِسْمِ') &&
    cleaned.includes('ٱللَّهِ') &&
    cleaned.includes('ٱلرَّحْمَٰنِ')
  ) {
    const parts = cleaned.split('ٱلرَّحِيمِ');

    if (parts.length > 1) {
      return {
        hasBismillah: true,
        rest: parts.slice(1).join('ٱلرَّحِيمِ').trim(),
      };
    }
  }

  return { hasBismillah: false, rest: cleaned };
};

const withTimeout = async (
  promise: Promise<Response>,
  ms = 7000
) => {
  return Promise.race([
    promise,
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ]);
};

const getNextReminderDate = (
  weekday: number,
  hour: number,
  minute: number,
  weekOffset: number
) => {
  const now = new Date();
  const target = new Date();

  target.setHours(hour);
  target.setMinutes(minute);
  target.setSeconds(0);
  target.setMilliseconds(0);

  const today = now.getDay() + 1;
  let daysUntil = weekday - today;

  if (daysUntil < 0) daysUntil += 7;
  if (daysUntil === 0 && target <= now) daysUntil = 7;

  target.setDate(
    target.getDate() + daysUntil + weekOffset * 7
  );

  return target;
};


type LearnTab = 'routine' | 'tajweed' | 'memorization' | 'adab';
type TajweedResult = 'correct' | 'practice';

const TAJWEED_LESSONS = [
  {
    id: 'makharij-throat',
    level: 'Beginner',
    title: 'Makharij: Throat Letters',
    rule: 'The throat letters are ء هـ ع ح غ خ. They must be pronounced clearly from their proper exit points.',
    example: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
    focus: 'Listen for ح in الحمد and ع in العالمين.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3',
    exercise: 'Which letter in الحمد comes from the middle throat?',
    options: ['ل', 'ح', 'د'],
    answer: 'ح',
  },
  {
    id: 'qalqalah',
    level: 'Beginner',
    title: 'Qalqalah: Echoing Letters',
    rule: 'Qalqalah happens on ق ط ب ج د when the letter has sukoon or when stopping on it.',
    example: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
    focus: 'Repeat قُلْ slowly and hear the light echo on ق.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6222.mp3',
    exercise: 'Which set contains the Qalqalah letters?',
    options: ['ق ط ب ج د', 'م ن و ي', 'ء هـ ع ح'],
    answer: 'ق ط ب ج د',
  },
  {
    id: 'ghunnah',
    level: 'Beginner',
    title: 'Ghunnah: Nasal Sound',
    rule: 'Ghunnah is the nasal sound held for two counts, especially on نّ and مّ.',
    example: 'مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ',
    focus: 'Hold the sound gently through the nose on نّ.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6236.mp3',
    exercise: 'How long is the common Ghunnah held?',
    options: ['One count', 'Two counts', 'Six counts'],
    answer: 'Two counts',
  },
  {
    id: 'ikhfa',
    level: 'Intermediate',
    title: 'Ikhfa: Hidden Noon Sound',
    rule: 'Ikhfa hides نْ or tanween with a soft nasal sound before its letters.',
    example: 'مِن شَرِّ مَا خَلَقَ',
    focus: 'Do not make the noon too clear or fully merge it.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6226.mp3',
    exercise: 'In مِن شَرِّ, what rule appears?',
    options: ['Ikhfa', 'Idgham', 'Qalqalah'],
    answer: 'Ikhfa',
  },
  {
    id: 'idgham',
    level: 'Intermediate',
    title: 'Idgham: Merging Sound',
    rule: 'Idgham merges نْ or tanween into the next letter when the next letter is one of ي ر م ل و ن.',
    example: 'مَن يَقُولُ',
    focus: 'Join the sounds smoothly instead of separating them harshly.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/9.mp3',
    exercise: 'Which letters are Idgham letters?',
    options: ['يرملون', 'قطبجد', 'ءهعحغخ'],
    answer: 'يرملون',
  },
  {
    id: 'madd-natural',
    level: 'Beginner',
    title: 'Madd Tabee‘i: Natural Stretch',
    rule: 'Natural Madd is stretched for two counts when ا و ي are Madd letters.',
    example: 'مَالِكِ يَوْمِ ٱلدِّينِ',
    focus: 'Stretch مَا gently for two counts, without overdoing it.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/4.mp3',
    exercise: 'How many counts is Madd Tabee‘i?',
    options: ['Two counts', 'Four counts', 'Six counts'],
    answer: 'Two counts',
  },
  {
    id: 'heavy-light',
    level: 'Intermediate',
    title: 'Heavy and Light Letters',
    rule: 'Some letters are pronounced heavy, such as ص ض ط ظ ق غ خ. Others remain light.',
    example: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
    focus: 'Keep ص in الصراط heavy and clear.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3',
    exercise: 'Which letter should be heavy in الصراط?',
    options: ['س', 'ص', 'ن'],
    answer: 'ص',
  },
  {
    id: 'waqf',
    level: 'Advanced',
    title: 'Waqf: Beautiful Stopping',
    rule: 'Stopping correctly protects meaning and makes recitation calm and mature.',
    example: 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ',
    focus: 'Stop with calmness, do not cut the meaning awkwardly.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6225.mp3',
    exercise: 'Why is Waqf important?',
    options: ['It protects meaning', 'It makes reading faster', 'It removes Tajweed'],
    answer: 'It protects meaning',
  },
  {
    id: 'makharij-lips',
    level: 'Beginner',
    title: 'Makharij: Lip Letters',
    rule: 'The lip letters include ف from the lower lip and upper teeth, and ب م و from the lips. Each letter must keep its natural sound without rushing.',
    example: 'فَوَيْلٌ لِّلْمُصَلِّينَ',
    focus: 'Practice ف clearly from the lower lip, then keep م soft without swallowing it.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6205.mp3',
    exercise: 'Which letter is pronounced from the lower lip and upper teeth?',
    options: ['ف', 'ق', 'ع'],
    answer: 'ف',
  },
  {
    id: 'makharij-tongue-tip',
    level: 'Beginner',
    title: 'Makharij: Tip of the Tongue',
    rule: 'Letters such as ت د ط ن ل ر are connected to the tip of the tongue. They need precision so the recitation stays clean.',
    example: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ',
    focus: 'Repeat ت and د gently from the tongue tip without making them heavy unless the letter is ط.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6217.mp3',
    exercise: 'Which letter is a heavy tongue-tip letter?',
    options: ['ط', 'ت', 'ن'],
    answer: 'ط',
  },
  {
    id: 'makharij-deep-throat',
    level: 'Intermediate',
    title: 'Makharij: Deep Throat Letters',
    rule: 'The deepest throat letters are ء and هـ. They should be pronounced clearly without adding extra vowels.',
    example: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    focus: 'Notice the clear hamzah sound at the beginning of إياك.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3',
    exercise: 'Which two letters come from the deepest throat?',
    options: ['ء هـ', 'ع ح', 'غ خ'],
    answer: 'ء هـ',
  },
  {
    id: 'makharij-middle-throat',
    level: 'Intermediate',
    title: 'Makharij: Middle Throat Letters',
    rule: 'The middle throat letters are ع and ح. They require calm practice because many learners confuse them with lighter sounds.',
    example: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    focus: 'Practice ح in الرحمن with an open throat and without turning it into ه.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
    exercise: 'Which letter is in the word الرحمن?',
    options: ['ح', 'خ', 'ه'],
    answer: 'ح',
  },
  {
    id: 'makharij-upper-throat',
    level: 'Intermediate',
    title: 'Makharij: Upper Throat Letters',
    rule: 'The upper throat letters are غ and خ. They should be clear and strong, but not exaggerated.',
    example: 'غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ',
    focus: 'Listen to غ in غير and keep it distinct from خ.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3',
    exercise: 'Which letters are from the upper throat?',
    options: ['غ خ', 'ع ح', 'ء هـ'],
    answer: 'غ خ',
  },
  {
    id: 'noon-sakinah-izhar',
    level: 'Intermediate',
    title: 'Noon Sakinah: Izhar',
    rule: 'Izhar means clear pronunciation of نْ or tanween when followed by throat letters ء هـ ع ح غ خ.',
    example: 'مِنْ عِلْمٍ',
    focus: 'Say نْ clearly before ع without nasal hiding or merging.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/255.mp3',
    exercise: 'What rule appears when نْ is followed by ع?',
    options: ['Izhar', 'Ikhfa', 'Iqlab'],
    answer: 'Izhar',
  },
  {
    id: 'noon-sakinah-iqlab',
    level: 'Intermediate',
    title: 'Noon Sakinah: Iqlab',
    rule: 'Iqlab changes نْ or tanween into a hidden م sound with ghunnah when followed by ب.',
    example: 'مِن بَعْدِ',
    focus: 'Do not pronounce a full ن. Turn it into a soft nasal م before ب.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/8.mp3',
    exercise: 'Which letter causes Iqlab?',
    options: ['ب', 'ل', 'خ'],
    answer: 'ب',
  },
  {
    id: 'noon-sakinah-idgham-ghunnah',
    level: 'Intermediate',
    title: 'Idgham With Ghunnah',
    rule: 'Idgham with ghunnah happens with ي ن م و. The sound merges and the nasal sound is held for two counts.',
    example: 'مَن يَعْمَلْ',
    focus: 'Merge ن into ي with a soft two-count nasal sound.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6142.mp3',
    exercise: 'Which group causes Idgham with ghunnah?',
    options: ['ينمو', 'لر', 'قطبجد'],
    answer: 'ينمو',
  },
  {
    id: 'noon-sakinah-idgham-no-ghunnah',
    level: 'Intermediate',
    title: 'Idgham Without Ghunnah',
    rule: 'Idgham without ghunnah happens with ل and ر. The نْ or tanween merges without nasal stretching.',
    example: 'مِن رَّبِّهِمْ',
    focus: 'Merge smoothly into ر without holding a nasal sound.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3.mp3',
    exercise: 'Which letters cause Idgham without ghunnah?',
    options: ['ل ر', 'ي ن م و', 'ق ط ب ج د'],
    answer: 'ل ر',
  },
  {
    id: 'meem-sakinah-ikhfa-shafawi',
    level: 'Intermediate',
    title: 'Meem Sakinah: Ikhfa Shafawi',
    rule: 'Ikhfa Shafawi happens when مْ is followed by ب. Hide the meem lightly with ghunnah from the lips.',
    example: 'تَرْمِيهِم بِحِجَارَةٍ',
    focus: 'Keep the lips soft and hold a gentle nasal sound before ب.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6181.mp3',
    exercise: 'When مْ is followed by ب, what rule appears?',
    options: ['Ikhfa Shafawi', 'Izhar Shafawi', 'Qalqalah'],
    answer: 'Ikhfa Shafawi',
  },
  {
    id: 'meem-sakinah-idgham-shafawi',
    level: 'Intermediate',
    title: 'Meem Sakinah: Idgham Shafawi',
    rule: 'Idgham Shafawi happens when مْ is followed by م. The two meems merge with ghunnah.',
    example: 'لَهُم مَّا يَشَاءُونَ',
    focus: 'Merge the two م sounds and hold the nasal sound for two counts.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2824.mp3',
    exercise: 'What happens when مْ meets م?',
    options: ['They merge with ghunnah', 'They become ق', 'They disappear completely'],
    answer: 'They merge with ghunnah',
  },
  {
    id: 'meem-sakinah-izhar-shafawi',
    level: 'Beginner',
    title: 'Meem Sakinah: Izhar Shafawi',
    rule: 'Izhar Shafawi means pronouncing مْ clearly when followed by any letter except م and ب.',
    example: 'أَمْ لَمْ تُنذِرْهُمْ',
    focus: 'Pronounce مْ clearly without hiding it when followed by ل or ت.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/8.mp3',
    exercise: 'Izhar Shafawi happens with مْ before most letters except:',
    options: ['م and ب', 'ق and ط', 'ء and هـ'],
    answer: 'م and ب',
  },
  {
    id: 'madd-wajib',
    level: 'Advanced',
    title: 'Madd Wajib Muttasil',
    rule: 'Madd Wajib Muttasil happens when a Madd letter and hamzah come in the same word. It is commonly stretched four to five counts.',
    example: 'جَاءَ',
    focus: 'Stretch جَا before the hamzah with control and beauty.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6140.mp3',
    exercise: 'Madd Wajib Muttasil is usually stretched:',
    options: ['Four to five counts', 'One count', 'No stretch'],
    answer: 'Four to five counts',
  },
  {
    id: 'madd-jaiz',
    level: 'Advanced',
    title: 'Madd Jaiz Munfasil',
    rule: 'Madd Jaiz Munfasil happens when a Madd letter is at the end of one word and hamzah begins the next word.',
    example: 'يَـٰٓأَيُّهَا',
    focus: 'Stretch the Madd before moving to the next word with hamzah.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
    exercise: 'Madd Jaiz Munfasil happens across:',
    options: ['Two words', 'One letter only', 'Only at the end of Quran'],
    answer: 'Two words',
  },
  {
    id: 'madd-lazim',
    level: 'Advanced',
    title: 'Madd Lazim',
    rule: 'Madd Lazim is stretched six counts when a Madd letter is followed by a permanent sukoon or shaddah.',
    example: 'ٱلضَّآلِّينَ',
    focus: 'Stretch ضَآ strongly for six counts before the doubled ل.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3',
    exercise: 'How long is Madd Lazim usually held?',
    options: ['Six counts', 'Two counts', 'One count'],
    answer: 'Six counts',
  },
  {
    id: 'madd-arid',
    level: 'Intermediate',
    title: 'Madd Arid Lissukun',
    rule: 'Madd Arid Lissukun appears when stopping on a word where the last letter becomes sakin because of the stop.',
    example: 'ٱلْعَـٰلَمِينَ',
    focus: 'When stopping, stretch the Madd beautifully and end calmly.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3',
    exercise: 'Madd Arid happens mostly when you:',
    options: ['Stop at a word', 'Start a new surah', 'Skip an ayah'],
    answer: 'Stop at a word',
  },
  {
    id: 'tafkhim-raa',
    level: 'Intermediate',
    title: 'Tafkhim of Raa',
    rule: 'The letter ر is heavy in some cases, such as when it has fathah or dammah.',
    example: 'رَبِّ ٱلْعَـٰلَمِينَ',
    focus: 'Make ر in رب heavy and full, but not harsh.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3',
    exercise: 'Raa is heavy when it has:',
    options: ['Fathah or dammah', 'Only kasrah', 'No sound'],
    answer: 'Fathah or dammah',
  },
  {
    id: 'tarqiq-raa',
    level: 'Intermediate',
    title: 'Tarqiq of Raa',
    rule: 'The letter ر is light in some cases, such as when it has kasrah.',
    example: 'غَيْرِ ٱلْمَغْضُوبِ',
    focus: 'Keep ر in غيرِ light because of the kasrah.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3',
    exercise: 'Raa is often light when it has:',
    options: ['Kasrah', 'Fathah', 'Dammah'],
    answer: 'Kasrah',
  },
  {
    id: 'lam-allah-heavy',
    level: 'Beginner',
    title: 'Heavy Lam in Allah',
    rule: 'The ل in Allah is heavy when it comes after fathah or dammah.',
    example: 'قَالَ ٱللَّهُ',
    focus: 'Say Allah with a full heavy sound after fathah.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/255.mp3',
    exercise: 'Lam in Allah is heavy after:',
    options: ['Fathah or dammah', 'Kasrah only', 'Sukoon only'],
    answer: 'Fathah or dammah',
  },
  {
    id: 'lam-allah-light',
    level: 'Beginner',
    title: 'Light Lam in Allah',
    rule: 'The ل in Allah is light when it comes after kasrah.',
    example: 'بِسْمِ ٱللَّهِ',
    focus: 'Say Allah lightly after the kasrah in بسمِ.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
    exercise: 'Lam in Allah is light after:',
    options: ['Kasrah', 'Fathah', 'Dammah'],
    answer: 'Kasrah',
  },
  {
    id: 'hams-letters',
    level: 'Advanced',
    title: 'Hams Letters',
    rule: 'Hams means breath flow. Its letters are ف ح ث ه ش خ ص س ك ت. Practice them gently without losing clarity.',
    example: 'فَصَلِّ لِرَبِّكَ وَٱنْحَرْ',
    focus: 'Notice the breath in ف and ح without making the sound weak.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6209.mp3',
    exercise: 'Which group contains Hams letters?',
    options: ['فحثه شخص سكت', 'قطبجد', 'يرملون'],
    answer: 'فحثه شخص سكت',
  },
  {
    id: 'shiddah-letters',
    level: 'Advanced',
    title: 'Shiddah Letters',
    rule: 'Shiddah means the sound is held back strongly. Its letters are أ ج د ق ط ب ك ت.',
    example: 'ٱللَّهُ أَكْبَرُ',
    focus: 'Notice the controlled strength in ك and ب.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
    exercise: 'Which letter is from Shiddah letters?',
    options: ['ق', 'م', 'ن'],
    answer: 'ق',
  },
  {
    id: 'isti-la-letters',
    level: 'Intermediate',
    title: 'Isti‘la: Heavy Letters',
    rule: 'The heavy letters are خ ص ض غ ط ق ظ. They are pronounced with elevation and heaviness.',
    example: 'صِرَٰطَ ٱلَّذِينَ',
    focus: 'Practice ص as heavy while keeping the surrounding letters clean.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3',
    exercise: 'Which group contains the heavy letters?',
    options: ['خص ضغط قظ', 'يرملون', 'ءهعحغخ'],
    answer: 'خص ضغط قظ',
  },
  {
    id: 'istifal-letters',
    level: 'Beginner',
    title: 'Istifal: Light Letters',
    rule: 'Most Arabic letters are light. Do not make light letters heavy unless the rule requires it.',
    example: 'نَسْتَعِينُ',
    focus: 'Keep ن س ت ع light and avoid unnecessary heaviness.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3',
    exercise: 'Most Arabic letters should be read:',
    options: ['Light', 'Always heavy', 'Without vowels'],
    answer: 'Light',
  },
  {
    id: 'sifaat-safeer',
    level: 'Intermediate',
    title: 'Safeer: Whistling Sound',
    rule: 'Safeer is a sharp whistling-like quality found in ص ز س. It should be clear but controlled.',
    example: 'وَٱلصَّـٰفَّـٰتِ صَفًّا',
    focus: 'Let ص have its natural strong sound without over-whistling.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3796.mp3',
    exercise: 'Which letters have Safeer?',
    options: ['ص ز س', 'ق ط ب', 'م ن و'],
    answer: 'ص ز س',
  },
  {
    id: 'tafkhim-kha',
    level: 'Beginner',
    title: 'Heavy Letter: Kha خ',
    rule: 'The letter خ is heavy. It comes from the upper throat and should not be read like ح.',
    example: 'مِن شَرِّ مَا خَلَقَ',
    focus: 'Practice خَلَقَ with a full sound from the upper throat.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6226.mp3',
    exercise: 'خ comes from:',
    options: ['Upper throat', 'Lips', 'Nose only'],
    answer: 'Upper throat',
  },
  {
    id: 'tafkhim-qaf',
    level: 'Beginner',
    title: 'Heavy Letter: Qaf ق',
    rule: 'The letter ق is heavy and pronounced from the back of the tongue.',
    example: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ',
    focus: 'Give ق its full sound without turning it into ك.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6226.mp3',
    exercise: 'ق is pronounced from:',
    options: ['Back of tongue', 'Lips', 'Middle throat'],
    answer: 'Back of tongue',
  },
  {
    id: 'tafkhim-ta',
    level: 'Beginner',
    title: 'Heavy Letter: Ta ط',
    rule: 'The letter ط is a strong heavy letter. It should not be confused with ت.',
    example: 'ٱلصِّرَٰطَ',
    focus: 'Practice ط in الصراط with heaviness and clarity.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3',
    exercise: 'Which is the heavy letter?',
    options: ['ط', 'ت', 'د'],
    answer: 'ط',
  },
  {
    id: 'alif-lam-shamsiyyah',
    level: 'Beginner',
    title: 'Alif Lam Shamsiyyah',
    rule: 'With sun letters, the ل of ال is not pronounced and the next letter is doubled.',
    example: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    focus: 'Do not pronounce the ل in الرحمن. Merge into رّ.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
    exercise: 'In الرحمن, the ل is:',
    options: ['Not pronounced', 'Clearly pronounced', 'Changed to ب'],
    answer: 'Not pronounced',
  },
  {
    id: 'alif-lam-qamariyyah',
    level: 'Beginner',
    title: 'Alif Lam Qamariyyah',
    rule: 'With moon letters, the ل of ال is pronounced clearly.',
    example: 'ٱلْحَمْدُ',
    focus: 'Pronounce the ل clearly in الحمد before ح.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3',
    exercise: 'In الحمد, the ل is:',
    options: ['Clearly pronounced', 'Hidden', 'Changed to ر'],
    answer: 'Clearly pronounced',
  },
  {
    id: 'hamzatul-wasl',
    level: 'Intermediate',
    title: 'Hamzatul Wasl',
    rule: 'Hamzatul Wasl is pronounced when starting, but dropped when continuing from the previous word.',
    example: 'ٱهْدِنَا ٱلصِّرَٰطَ',
    focus: 'When connecting, do not force an extra hamzah between words.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3',
    exercise: 'Hamzatul Wasl is dropped when:',
    options: ['Continuing recitation', 'Always stopping', 'Reading silently only'],
    answer: 'Continuing recitation',
  },
  {
    id: 'sukoon-practice',
    level: 'Beginner',
    title: 'Sukoon Practice',
    rule: 'A letter with sukoon has no vowel. Read it clearly without adding an extra a, i, or u sound.',
    example: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
    focus: 'Do not add vowels after مْ and دْ.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6224.mp3',
    exercise: 'A sakin letter has:',
    options: ['No vowel', 'Two vowels', 'Only dammah'],
    answer: 'No vowel',
  },
  {
    id: 'shaddah-practice',
    level: 'Beginner',
    title: 'Shaddah Practice',
    rule: 'Shaddah means the letter is doubled: first held, then released with a vowel.',
    example: 'إِيَّاكَ نَعْبُدُ',
    focus: 'Hold يّ briefly in إياك before moving on.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3',
    exercise: 'Shaddah means the letter is:',
    options: ['Doubled', 'Deleted', 'Always silent'],
    answer: 'Doubled',
  },

];

const TAJWEED_DRILLS = [
  'Listen once without reciting, then repeat slowly three times.',
  'Read the example while recording yourself on another phone if possible.',
  'Compare your sound with the reciter and mark Correct only if the rule is clear.',
  'Repeat difficult letters seven times before moving to the next lesson.',
  'Practice after Fajr or Maghrib when the heart is calm.',
  'Practice throat letters separately: ء هـ ع ح غ خ.',
  'Practice heavy letters slowly: خ ص ض غ ط ق ظ.',
  'Practice sun letters by skipping the ل in ال and doubling the next letter.',
  'Practice moon letters by clearly pronouncing the ل in ال.',
  'Choose one Madd rule daily and count with your fingers while reciting.',
  'Repeat Qalqalah letters ق ط ب ج د with sukoon until the echo is clean.',
  'Practice Noon Sakinah rules with examples: Izhar, Idgham, Iqlab and Ikhfa.',
  'Practice Meem Sakinah rules with the lips relaxed and controlled.',
  'Stop at the end of ayahs with calm Waqf and avoid cutting meanings badly.',
  'Mark Practice if your sound is unclear, then return to the same rule later.',
];


const TAJWEED_FOUNDATION_STEPS = [
  {
    title: 'What Tajweed Means',
    body:
      'Tajweed means giving every Quranic letter its right: the correct exit point, sound quality, length, heaviness, lightness and stopping. It beautifies recitation and protects the words from mistakes.',
  },
  {
    title: 'Why Tajweed Matters',
    body:
      'Tajweed helps the reader recite calmly, clearly and respectfully. The goal is not speed; the goal is accuracy, humility and a heart connected to Allah’s words.',
  },
  {
    title: 'How to Learn Tajweed',
    body:
      'Start with makharij, then letter qualities, then Noon Sakinah, Meem Sakinah, Madd, Qalqalah and stopping rules. Listen to a trusted reciter, repeat slowly, and revise daily.',
  },
];

const TAJWEED_PDF_RESOURCES = [
  {
    title: 'Beginner Tajweed PDF Lessons',
    description:
      'A structured beginner path covering Arabic letters, makharij, basic rules and daily practice.',
    query: 'beginner tajweed pdf lessons makharij noon sakinah meem sakinah madd',
  },
  {
    title: 'Noon Sakinah & Tanween Rules PDF',
    description:
      'Study Izhar, Idgham, Iqlab and Ikhfa with examples before attempting exercises.',
    query: 'Noon Sakinah Tanween Izhar Idgham Iqlab Ikhfa PDF',
  },
  {
    title: 'Madd Rules PDF',
    description:
      'Learn natural Madd, connected Madd, separated Madd, required Madd and stopping Madd.',
    query: 'Tajweed Madd rules PDF natural wajib jaiz lazim arid',
  },
  {
    title: 'Makharij & Sifaat PDF',
    description:
      'Understand where letters come from and the qualities that make each letter correct.',
    query: 'Makharij Sifaat tajweed PDF Arabic letters',
  },
];

const TAJWEED_RULE_GROUPS = [
  {
    title: 'Noon Sakinah & Tanween',
    rules: [
      {
        name: 'Izhar',
        arabic: 'إظهار',
        meaning:
          'Pronounce نْ or tanween clearly when followed by throat letters: ء هـ ع ح غ خ.',
        example: 'مِنْ عِلْمٍ',
      },
      {
        name: 'Idgham',
        arabic: 'إدغام',
        meaning:
          'Merge نْ or tanween into ي ر م ل و ن. Some letters merge with ghunnah and ل ر merge without ghunnah.',
        example: 'مَن يَقُولُ',
      },
      {
        name: 'Iqlab',
        arabic: 'إقلاب',
        meaning:
          'Change نْ or tanween into a hidden م sound with ghunnah when followed by ب.',
        example: 'مِن بَعْدِ',
      },
      {
        name: 'Ikhfa',
        arabic: 'إخفاء',
        meaning:
          'Hide نْ or tanween with a soft nasal sound before the Ikhfa letters.',
        example: 'مِن شَرِّ',
      },
    ],
  },
  {
    title: 'Meem Sakinah',
    rules: [
      {
        name: 'Ikhfa Shafawi',
        arabic: 'إخفاء شفوي',
        meaning:
          'When مْ is followed by ب, hide the meem gently with ghunnah from the lips.',
        example: 'تَرْمِيهِم بِحِجَارَةٍ',
      },
      {
        name: 'Idgham Shafawi',
        arabic: 'إدغام شفوي',
        meaning:
          'When مْ is followed by another م, merge both meems with ghunnah.',
        example: 'لَهُم مَّا',
      },
      {
        name: 'Izhar Shafawi',
        arabic: 'إظهار شفوي',
        meaning:
          'Pronounce مْ clearly before all letters except م and ب.',
        example: 'أَمْ لَمْ',
      },
    ],
  },
  {
    title: 'Madd Rules',
    rules: [
      {
        name: 'Madd Tabee‘i',
        arabic: 'مد طبيعي',
        meaning:
          'Natural stretch for two counts when ا و ي act as Madd letters.',
        example: 'مَالِكِ',
      },
      {
        name: 'Madd Wajib Muttasil',
        arabic: 'مد واجب متصل',
        meaning:
          'A Madd letter and hamzah appear in the same word; usually stretched four to five counts.',
        example: 'جَاءَ',
      },
      {
        name: 'Madd Jaiz Munfasil',
        arabic: 'مد جائز منفصل',
        meaning:
          'A Madd letter ends one word and hamzah begins the next word.',
        example: 'يَـٰٓأَيُّهَا',
      },
      {
        name: 'Madd Lazim',
        arabic: 'مد لازم',
        meaning:
          'A Madd letter is followed by permanent sukoon or shaddah; stretched six counts.',
        example: 'ٱلضَّآلِّينَ',
      },
    ],
  },
  {
    title: 'Letters, Heaviness & Stopping',
    rules: [
      {
        name: 'Makharij',
        arabic: 'مخارج الحروف',
        meaning:
          'Every Arabic letter has an exit point: throat, tongue, lips, nasal passage or mouth cavity.',
        example: 'ء هـ ع ح غ خ',
      },
      {
        name: 'Tafkhim',
        arabic: 'تفخيم',
        meaning:
          'Heavy pronunciation for letters such as خ ص ض غ ط ق ظ.',
        example: 'ٱلصِّرَٰطَ',
      },
      {
        name: 'Qalqalah',
        arabic: 'قلقلة',
        meaning:
          'A light echo on ق ط ب ج د when sakin or when stopping.',
        example: 'أَحَدٌ',
      },
      {
        name: 'Waqf',
        arabic: 'وقف',
        meaning:
          'Stopping properly so the meaning remains clear and the recitation stays calm.',
        example: 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ',
      },
    ],
  },
];

const TAJWEED_AUDIO_GUIDES = [
  {
    title: 'Surah Al-Fatihah Tajweed Listening',
    subtitle: 'Listen carefully to Madd, heavy letters, Bismillah and stopping.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
  },
  {
    title: 'Qalqalah Practice Audio',
    subtitle: 'Repeat Surah Al-Ikhlas and notice the echo on ق ط ب ج د sounds.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6222.mp3',
  },
  {
    title: 'Ikhfa Practice Audio',
    subtitle: 'Listen for the hidden nasal sound in مِن شَرِّ and repeat slowly.',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6226.mp3',
  },
];


const MEMORIZATION_STEPS = [
  'Listen to the ayah three times before reading it.',
  'Read from the Mushaf slowly five times.',
  'Cover the ayah and recite from memory.',
  'Connect the ayah before and after it.',
  'Review old memorization before adding new verses.',
];

export default function QuranScreen() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const fullSurahQueueRef = useRef<Ayah[]>([]);
  const fullSurahIndexRef = useRef(0);
  const stoppedRef = useRef(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState<Section>('home');
  const [mushafTheme, setMushafTheme] = useState<'classic' | 'cream' | 'focus'>('classic');
  const [learnTab, setLearnTab] = useState<LearnTab>('routine');
  const [tajweedDrillOpen, setTajweedDrillOpen] = useState(false);
  const [tajweedResults, setTajweedResults] = useState<Record<string, TajweedResult>>({});

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');

  const [selectedSurah, setSelectedSurah] =
    useState<Surah | null>(null);

  const [selectedReadSurah, setSelectedReadSurah] =
    useState<Surah | null>(null);

  const [surahData, setSurahData] =
    useState<SurahData | null>(null);

  const [selectedPage, setSelectedPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');

  const [pageData, setPageData] =
    useState<PageData | null>(null);

  const [selectedReciter, setSelectedReciter] =
    useState(RECITERS[0]);

  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [offlinePages, setOfflinePages] =
    useState<number[]>([]);
  const [offlineSurahs, setOfflineSurahs] =
    useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [playingAyah, setPlayingAyah] =
    useState<number | null>(null);

  const [isFullSurahPlaying, setIsFullSurahPlaying] =
    useState(false);

  const [isPaused, setIsPaused] = useState(false);

  const [tafsirItems, setTafsirItems] = useState<
    TafsirItem[]
  >([]);

  const [tafsirLoading, setTafsirLoading] =
    useState(false);

  const [tafsirProgress, setTafsirProgress] =
    useState('');

  const [activeTafsirVideo, setActiveTafsirVideo] =
    useState<string | null>(null);

  const [reminderHour, setReminderHour] = useState('18');
  const [reminderMinute, setReminderMinute] =
    useState('30');

  const [selectedDays, setSelectedDays] = useState<
    number[]
  >([1, 2, 3, 4, 5, 6, 7]);

  const [reminderActive, setReminderActive] =
    useState(false);

  const filteredSurahs = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return surahs;

    return surahs.filter(
      item =>
        item.englishName.toLowerCase().includes(q) ||
        item.englishNameTranslation
          .toLowerCase()
          .includes(q) ||
        item.name.includes(search) ||
        String(item.number).includes(q)
    );
  }, [search, surahs]);

  const pageSurahs = useMemo(() => {
    if (!pageData?.arabic?.length) return [];

    const map = new Map<number, Surah>();

    pageData.arabic.forEach(ayah => {
      if (ayah.surah) {
        map.set(ayah.surah.number, ayah.surah);
      }
    });

    return Array.from(map.values());
  }, [pageData]);

  const activeBookmarkKey = selectedSurah
    ? `surah-${selectedSurah.number}`
    : `page-${selectedPage}`;

  const isBookmarked =
    bookmarks.includes(activeBookmarkKey);

  const setupNotificationChannel = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        QURAN_CHANNEL_ID,
        {
          name: 'Quran Reminders',
          importance:
            Notifications.AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#064E3B',
        }
      );
    }
  };

  const handleInternalBack = () => {
    if (menuOpen) {
      setMenuOpen(false);
      return true;
    }

    if (selectedSurah) {
      stopAudio();
      setSelectedSurah(null);
      setSurahData(null);
      setTafsirItems([]);
      setTafsirProgress('');
      return true;
    }

    if (selectedReadSurah) {
      setSelectedReadSurah(null);
      setPageData(null);
      setSearch('');
      return true;
    }

    if (section !== 'home') {
      stopAudio();
      setSection('home');
      setSearch('');
      return true;
    }

    return false;
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const savedBookmarks =
        await AsyncStorage.getItem(STORAGE_BOOKMARKS);
      const savedPages =
        await AsyncStorage.getItem(STORAGE_PAGES);
      const savedSurahs =
        await AsyncStorage.getItem(STORAGE_SURAHS);
      const savedReminder =
        await AsyncStorage.getItem(STORAGE_REMINDER);
      const savedReminderIds =
        await AsyncStorage.getItem(STORAGE_REMINDER_IDS);
      const offlineSurahList =
        await AsyncStorage.getItem('CHAFADIA_SURAH_LIST');

      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
      if (savedPages) setOfflinePages(JSON.parse(savedPages));
      if (savedSurahs) setOfflineSurahs(JSON.parse(savedSurahs));

      if (savedReminder) {
        const parsed = JSON.parse(savedReminder);
        setReminderHour(parsed.hour || '18');
        setReminderMinute(parsed.minute || '30');
        setSelectedDays(
          parsed.days || [1, 2, 3, 4, 5, 6, 7]
        );
      }

      if (savedReminderIds) {
        const ids = JSON.parse(savedReminderIds);
        setReminderActive(
          Array.isArray(ids) && ids.length > 0
        );
      }

      if (offlineSurahList) {
        setSurahs(JSON.parse(offlineSurahList));
      }

      const res = await fetch(`${API_BASE}/surah`);
      const json = await res.json();
      const list = json.data || [];

      setSurahs(list);

      await AsyncStorage.setItem(
        'CHAFADIA_SURAH_LIST',
        JSON.stringify(list)
      );
    } catch {
      const offlineSurahList =
        await AsyncStorage.getItem('CHAFADIA_SURAH_LIST');

      if (offlineSurahList) {
        setSurahs(JSON.parse(offlineSurahList));
      } else {
        Alert.alert(
          'Quran Loading Error',
          'Connect once to load the Quran list.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPage = async (pageNumber = selectedPage) => {
    try {
      setLoading(true);

      const saved = await AsyncStorage.getItem(
        `CHAFADIA_PAGE_${pageNumber}`
      );

      if (saved) {
        setPageData(JSON.parse(saved));
      }

      const arabicRes = await fetch(
        `${API_BASE}/page/${pageNumber}/quran-uthmani`
      );

      const arabicJson = await arabicRes.json();

      const data = {
        arabic: arabicJson.data.ayahs || [],
      };

      setPageData(data);
    } catch {
      if (!pageData) {
        Alert.alert(
          'Offline Page',
          'This page is not saved yet. Open it once with internet, then save it.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const openSurah = async (
    surah: Surah,
    targetSection: Section = section
  ) => {
    try {
      setSelectedSurah(surah);
      setSection(targetSection);
      setLoading(true);
      setTafsirItems([]);
      setTafsirProgress('');

      const saved = await AsyncStorage.getItem(
        `CHAFADIA_SURAH_${surah.number}`
      );

      if (saved) {
        setSurahData(JSON.parse(saved));
      }

      const [arabicRes, translationRes, audioRes] =
        await Promise.all([
          fetch(
            `${API_BASE}/surah/${surah.number}/quran-uthmani`
          ),
          fetch(`${API_BASE}/surah/${surah.number}/en.sahih`),
          fetch(
            `${API_BASE}/surah/${surah.number}/${selectedReciter.edition}`
          ),
        ]);

      const arabicJson = await arabicRes.json();
      const translationJson = await translationRes.json();
      const audioJson = await audioRes.json();

      const data = {
        arabic: arabicJson.data.ayahs || [],
        translation: translationJson.data.ayahs || [],
        audio: audioJson.data.ayahs || [],
      };

      setSurahData(data);
    } catch {
      if (!surahData) {
        Alert.alert(
          'Offline Surah',
          'This Surah is not saved yet. Open it once with internet, then save it.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const openSurahInReadMode = async (surah: Surah) => {
    try {
      setSelectedReadSurah(surah);
      setSearch('');
      setSection('read');
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/surah/${surah.number}/quran-uthmani`
      );

      const json = await res.json();
      const firstAyah = json.data.ayahs?.[0];

      if (firstAyah?.page) {
        setSelectedPage(firstAyah.page);
        setPageInput(String(firstAyah.page));
      }
    } catch {
      Alert.alert(
        'Open Surah',
        'Unable to open this Surah page now.'
      );
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentPage = async () => {
    if (!pageData) return;

    const updated = offlinePages.includes(selectedPage)
      ? offlinePages
      : [...offlinePages, selectedPage];

    await AsyncStorage.setItem(
      `CHAFADIA_PAGE_${selectedPage}`,
      JSON.stringify(pageData)
    );

    await AsyncStorage.setItem(
      STORAGE_PAGES,
      JSON.stringify(updated)
    );

    setOfflinePages(updated);

    Alert.alert(
      'Saved',
      `Page ${selectedPage} is now available offline.`
    );
  };

  const saveCurrentSurah = async () => {
    if (!selectedSurah || !surahData) return;

    const offlineSafeData = {
      arabic: surahData.arabic,
      translation: surahData.translation,
      audio: [],
    };

    const updated = offlineSurahs.includes(
      selectedSurah.number
    )
      ? offlineSurahs
      : [...offlineSurahs, selectedSurah.number];

    await AsyncStorage.setItem(
      `CHAFADIA_SURAH_${selectedSurah.number}`,
      JSON.stringify(offlineSafeData)
    );

    await AsyncStorage.setItem(
      STORAGE_SURAHS,
      JSON.stringify(updated)
    );

    setOfflineSurahs(updated);

    Alert.alert(
      'Saved',
      `${selectedSurah.englishName} text and translation are now available offline.`
    );
  };

  const downloadFullQuran = async () => {
    try {
      Alert.alert(
        'Download Full Quran',
        'This saves Quran text and English translation offline. Audio and videos remain online.'
      );

      setDownloading(true);

      const savedNumbers: number[] = [];

      for (const surah of surahs) {
        const [arabicRes, translationRes] =
          await Promise.all([
            fetch(
              `${API_BASE}/surah/${surah.number}/quran-uthmani`
            ),
            fetch(
              `${API_BASE}/surah/${surah.number}/en.sahih`
            ),
          ]);

        const arabicJson = await arabicRes.json();
        const translationJson =
          await translationRes.json();

        const data = {
          arabic: arabicJson.data.ayahs || [],
          translation: translationJson.data.ayahs || [],
          audio: [],
        };

        await AsyncStorage.setItem(
          `CHAFADIA_SURAH_${surah.number}`,
          JSON.stringify(data)
        );

        savedNumbers.push(surah.number);
      }

      await AsyncStorage.setItem(
        STORAGE_SURAHS,
        JSON.stringify(savedNumbers)
      );

      setOfflineSurahs(savedNumbers);

      Alert.alert(
        'Downloaded',
        'Full Quran text and English translation are now saved offline.'
      );
    } catch {
      Alert.alert(
        'Download Error',
        'Download was interrupted. Please try again.'
      );
    } finally {
      setDownloading(false);
    }
  };

  const toggleBookmark = async () => {
    const updated = isBookmarked
      ? bookmarks.filter(
          item => item !== activeBookmarkKey
        )
      : [...bookmarks, activeBookmarkKey];

    setBookmarks(updated);

    await AsyncStorage.setItem(
      STORAGE_BOOKMARKS,
      JSON.stringify(updated)
    );
  };

  const stopAudio = async () => {
    stoppedRef.current = true;

    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    setPlayingAyah(null);
    setIsFullSurahPlaying(false);
    setIsPaused(false);
    fullSurahQueueRef.current = [];
    fullSurahIndexRef.current = 0;
  };

  const playAyah = async (
    ayahNumber: number,
    audioUrl?: string
  ) => {
    try {
      if (!audioUrl) {
        Alert.alert(
          'Audio Online',
          'Audio needs internet connection.'
        );
        return;
      }

      await stopAudio();
      stoppedRef.current = false;

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });

      const { sound } =
        await Audio.Sound.createAsync({
          uri: audioUrl,
        });

      soundRef.current = sound;
      setPlayingAyah(ayahNumber);

      sound.setOnPlaybackStatusUpdate(status => {
        if (
          status.isLoaded &&
          status.didJustFinish
        ) {
          setPlayingAyah(null);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });

      await sound.playAsync();
    } catch {
      Alert.alert(
        'Audio Error',
        'Unable to play this recitation.'
      );
    }
  };

  const playFullSurahFromIndex = async (
    startIndex: number
  ) => {
    try {
      const queue = fullSurahQueueRef.current;

      if (!queue.length) return;

      stoppedRef.current = false;
      setIsFullSurahPlaying(true);
      setIsPaused(false);

      for (let i = startIndex; i < queue.length; i++) {
        if (stoppedRef.current) break;

        fullSurahIndexRef.current = i;

        const ayah = queue[i];

        if (!ayah.audio) continue;

        setPlayingAyah(ayah.number);

        const { sound } =
          await Audio.Sound.createAsync({
            uri: ayah.audio,
          });

        soundRef.current = sound;

        await sound.playAsync();

        await new Promise<void>(resolve => {
          sound.setOnPlaybackStatusUpdate(status => {
            if (
              status.isLoaded &&
              status.didJustFinish
            ) {
              sound.unloadAsync();
              soundRef.current = null;
              resolve();
            }
          });
        });
      }
    } catch {
      Alert.alert(
        'Audio Error',
        'Unable to play full Surah.'
      );
    } finally {
      setPlayingAyah(null);
      setIsFullSurahPlaying(false);
      setIsPaused(false);
      soundRef.current = null;
    }
  };

  const playFullSurah = async () => {
    if (!surahData?.audio?.length) {
      Alert.alert(
        'Audio Online',
        'Please open a Surah with internet to load audio.'
      );
      return;
    }

    await stopAudio();

    fullSurahQueueRef.current = surahData.audio;
    fullSurahIndexRef.current = 0;

    playFullSurahFromIndex(0);
  };

  const pauseAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPaused(true);
    }
  };

  const resumeAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPaused(false);
    }
  };

  const loadTafsirForSurah = async () => {
    if (!selectedSurah || !surahData?.arabic) return;

    try {
      setTafsirLoading(true);
      setTafsirItems([]);
      setTafsirProgress('Preparing Tafsir...');

      const results: TafsirItem[] = [];

      for (let i = 0; i < surahData.arabic.length; i++) {
        const ayah = surahData.arabic[i];
        const translation = surahData.translation[i]?.text;

        setTafsirProgress(
          `Loading Tafsir ${i + 1}/${surahData.arabic.length}`
        );

        try {
          const res = await withTimeout(
            fetch(
              `${TAFSIR_BASE}/${selectedSurah.number}/${ayah.numberInSurah}`
            ),
            7000
          );

          const json = await res.json();

          results.push({
            ayah: ayah.numberInSurah,
            arabic: ayah.text,
            translation,
            text:
              json.text ||
              json.tafsir ||
              translation ||
              'Brief meaning unavailable.',
            source:
              json.text || json.tafsir
                ? 'Tafsir'
                : 'Translation fallback',
          });
        } catch {
          results.push({
            ayah: ayah.numberInSurah,
            arabic: ayah.text,
            translation,
            text:
              translation ||
              'Tafsir is temporarily unavailable for this ayah.',
            source: 'Translation fallback',
          });
        }

        setTafsirItems([...results]);
      }

      setTafsirProgress('Tafsir loaded.');
    } finally {
      setTafsirLoading(false);
    }
  };

  const goToPage = (value: number) => {
    const safe = Math.min(
      Math.max(value, 1),
      TOTAL_QURAN_PAGES
    );

    setSelectedPage(safe);
    setPageInput(String(safe));
    setSection('read');
  };

  const submitPage = () => {
    const pageNumber = Number(pageInput);

    if (
      !pageNumber ||
      pageNumber < 1 ||
      pageNumber > TOTAL_QURAN_PAGES
    ) {
      Alert.alert(
        'Invalid Page',
        'Enter a page number between 1 and 604.'
      );
      return;
    }

    goToPage(pageNumber);
  };

  const openVideo = (query: string) => {
    Linking.openURL(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(
        query
      )}`
    );
  };

  const openTafsirResource = (query: string) => {
    Linking.openURL(
      `https://www.google.com/search?q=${encodeURIComponent(
        query
      )}`
    );
  };

  const toggleReminderDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(item => item !== day)
        : [...prev, day]
    );
  };

  const scheduleQuranReminder = async () => {
    try {
      const hour = Number(reminderHour);
      const minute = Number(reminderMinute);

      if (
        Number.isNaN(hour) ||
        Number.isNaN(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      ) {
        Alert.alert(
          'Invalid Time',
          'Please enter a valid hour and minute.'
        );
        return;
      }

      if (!selectedDays.length) {
        Alert.alert(
          'Select Days',
          'Please choose at least one day.'
        );
        return;
      }

      await setupNotificationChannel();

      const { status } =
        await Notifications.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Notifications Needed',
          'Please allow notifications for Quran reminders.'
        );
        return;
      }

      const oldIds = await AsyncStorage.getItem(
        STORAGE_REMINDER_IDS
      );

      if (oldIds) {
        const parsedIds = JSON.parse(oldIds);

        for (const id of parsedIds) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
      }

      const ids: string[] = [];
      const triggerTypes =
        Notifications.SchedulableTriggerInputTypes as any;

      for (const weekday of selectedDays) {
        for (let week = 0; week < 12; week++) {
          const date = getNextReminderDate(
            weekday,
            hour,
            minute,
            week
          );

          const id =
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Quran Reminder',
                body: 'Spend a few minutes with the Quran today. Read, listen, reflect, and grow.',
                sound: 'default',
              },
              trigger: {
                type: triggerTypes.DATE,
                date,
                channelId: QURAN_CHANNEL_ID,
              } as any,
            });

          ids.push(id);
        }
      }

      await AsyncStorage.setItem(
        STORAGE_REMINDER,
        JSON.stringify({
          hour: reminderHour,
          minute: reminderMinute,
          days: selectedDays,
        })
      );

      await AsyncStorage.setItem(
        STORAGE_REMINDER_IDS,
        JSON.stringify(ids)
      );

      setReminderActive(true);

      Alert.alert(
        'Reminder Set',
        `Your Quran reminder is active for ${selectedDays.length} day(s) at ${String(
          hour
        ).padStart(2, '0')}:${String(minute).padStart(2, '0')}.`
      );
    } catch (error) {
      console.log('QURAN REMINDER ERROR:', error);

      Alert.alert(
        'Reminder Error',
        'Unable to schedule the reminder. Please restart with npx expo start -c. On Android, make sure notification permission is allowed in phone settings.'
      );
    }
  };

  const cancelQuranReminder = async () => {
    const oldIds = await AsyncStorage.getItem(
      STORAGE_REMINDER_IDS
    );

    if (oldIds) {
      const parsedIds = JSON.parse(oldIds);

      for (const id of parsedIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    }

    await AsyncStorage.removeItem(STORAGE_REMINDER_IDS);
    setReminderActive(false);

    Alert.alert(
      'Reminder Cancelled',
      'Your Quran reminder has been turned off.'
    );
  };

  useEffect(() => {
    setupNotificationChannel();
    loadInitialData();
  }, []);

  useEffect(() => {
    if (section === 'read' && selectedReadSurah) {
      fetchPage(selectedPage);
    }
  }, [selectedPage, section, selectedReadSurah]);

  useEffect(() => {
    if (selectedSurah) {
      openSurah(selectedSurah, section);
    }
  }, [selectedReciter]);

  useEffect(() => {
    const backSub = BackHandler.addEventListener(
      'hardwareBackPress',
      handleInternalBack
    );

    return () => backSub.remove();
  }, [section, selectedSurah, selectedReadSurah, menuOpen]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const renderMenu = () => {
    const items = [
      ['home', 'Home', Home],
      ['read', 'Read', BookOpen],
      ['translation', 'Translation', Star],
      ['listening', 'Listening', Headphones],
      ['tafsir', 'Tafsir', Sparkles],
      ['learn', 'Learn', ExternalLink],
      ['saved', 'Saved', Download],
      ['reminder', 'Reminder', Bell],
    ] as const;

    return (
      <View style={styles.menuCard}>
        {items.map(([key, label, Icon]) => {
          const active = section === key;

          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.menuItem,
                active && styles.menuItemActive,
              ]}
              onPress={() => {
                stopAudio();
                setSelectedSurah(null);
                setSelectedReadSurah(null);
                setSurahData(null);
                setTafsirItems([]);
                setTafsirProgress('');
                setActiveTafsirVideo(null);
                setSearch('');
                setSection(key);
                setMenuOpen(false);
              }}
            >
              <Icon
                size={15}
                color={
                  active ? '#D8B85A' : '#064E3B'
                }
              />

              <Text
                style={[
                  styles.menuText,
                  active && styles.menuTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderReadSurahList = () => (
    <LinearGradient
      colors={['#FFFDF8', '#F6EFE2']}
      style={styles.card}
    >
      <Text style={styles.sectionTitle}>
        Read Quran
      </Text>

      <Text style={styles.sectionSubtitle}>
        Choose any Surah, then read it page by page in a clean Mushaf style.
      </Text>

      <View style={styles.searchBox}>
        <Search size={15} color="#064E3B" />

        <TextInput
          placeholder="Search Surah..."
          placeholderTextColor="#867B6B"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {filteredSurahs.map(surah => (
        <TouchableOpacity
          key={surah.number}
          style={styles.surahRow}
          onPress={() => openSurahInReadMode(surah)}
        >
          <View style={styles.surahNumber}>
            <Text style={styles.surahNumberText}>
              {surah.number}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.surahName}>
              {surah.englishName} • {surah.name}
            </Text>

            <Text style={styles.surahMeaning}>
              Meaning: {surah.englishNameTranslation}
            </Text>

            <Text style={styles.surahMeta}>
              {surah.numberOfAyahs} Ayahs •{' '}
              {surah.revelationType}
            </Text>
          </View>

          <ChevronRight size={18} color="#9A6A16" />
        </TouchableOpacity>
      ))}
    </LinearGradient>
  );

  const renderSurahList = (
    target:
      | 'translation'
      | 'listening'
      | 'tafsir' = section as any
  ) => (
    <LinearGradient
      colors={['#FFFDF8', '#F6EFE2']}
      style={styles.card}
    >
      <Text style={styles.sectionTitle}>
        Full Quran Surah List
      </Text>

      <Text style={styles.sectionSubtitle}>
        Search Arabic, English, meaning or Surah number
      </Text>

      <View style={styles.searchBox}>
        <Search size={15} color="#064E3B" />

        <TextInput
          placeholder="Search Surah..."
          placeholderTextColor="#867B6B"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {filteredSurahs.map(surah => (
        <TouchableOpacity
          key={surah.number}
          style={styles.surahRow}
          onPress={() => openSurah(surah, target)}
        >
          <View style={styles.surahNumber}>
            <Text style={styles.surahNumberText}>
              {surah.number}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.surahName}>
              {surah.englishName} • {surah.name}
            </Text>

            <Text style={styles.surahMeaning}>
              Meaning: {surah.englishNameTranslation}
            </Text>

            <Text style={styles.surahMeta}>
              {surah.numberOfAyahs} Ayahs •{' '}
              {surah.revelationType}
            </Text>
          </View>

          {offlineSurahs.includes(surah.number) && (
            <Download size={15} color="#9A6A16" />
          )}
        </TouchableOpacity>
      ))}
    </LinearGradient>
  );

  const renderSurahReader = () => {
    if (!selectedSurah) return renderSurahList();

    return (
      <LinearGradient
        colors={['#FFFDF8', '#F6EFE2']}
        style={styles.card}
      >
        <TouchableOpacity onPress={handleInternalBack}>
          <Text style={styles.backText}>
            ← Back inside Quran
          </Text>
        </TouchableOpacity>

        <View style={styles.surahBanner}>
          <Text style={styles.surahHeaderArabic}>
            {selectedSurah.name}
          </Text>

          <Text style={styles.surahHeaderTitle}>
            {selectedSurah.englishName}
          </Text>

          <Text style={styles.surahHeaderMeaning}>
            Meaning: {selectedSurah.englishNameTranslation}
          </Text>

          <Text style={styles.surahHeaderMeta}>
            Surah {selectedSurah.number} •{' '}
            {selectedSurah.numberOfAyahs} Ayahs •{' '}
            {selectedSurah.revelationType}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.smallAction}
            onPress={toggleBookmark}
          >
            {isBookmarked ? (
              <BookmarkCheck size={15} color="#064E3B" />
            ) : (
              <Bookmark size={15} color="#064E3B" />
            )}

            <Text style={styles.smallActionText}>
              Bookmark
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.smallAction}
            onPress={saveCurrentSurah}
          >
            <Download size={15} color="#064E3B" />

            <Text style={styles.smallActionText}>
              Save Offline
            </Text>
          </TouchableOpacity>
        </View>

        {section === 'listening' && (
          <View style={styles.playerPanel}>
            <TouchableOpacity
              style={styles.playerButton}
              onPress={playFullSurah}
            >
              <Play size={14} color="#064E3B" />

              <Text style={styles.playerText}>
                Full Surah
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playerButton}
              onPress={isPaused ? resumeAudio : pauseAudio}
            >
              {isPaused ? (
                <Play size={14} color="#064E3B" />
              ) : (
                <Pause size={14} color="#064E3B" />
              )}

              <Text style={styles.playerText}>
                {isPaused ? 'Continue' : 'Pause'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopAudio}
            >
              <Square
                size={13}
                color="#8B1E1E"
                fill="#8B1E1E"
              />

              <Text style={styles.stopText}>
                Stop
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <ActivityIndicator color="#064E3B" />
        )}

        {surahData?.arabic?.map((ayah, index) => {
          const translation =
            surahData.translation[index];

          const audio = surahData.audio[index];

          return (
            <View
              key={ayah.number}
              style={styles.ayahCard}
            >
              <View style={styles.ayahTop}>
                <Text style={styles.ayahMeta}>
                  Ayah {ayah.numberInSurah} • Page{' '}
                  {ayah.page} • Juz {ayah.juz}
                </Text>
              </View>

              <Text style={styles.arabicText}>
                {cleanText(ayah.text)}
              </Text>

              {section === 'translation' && (
                <Text style={styles.translationText}>
                  {translation?.text}
                </Text>
              )}

              {section === 'listening' && (
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={() =>
                    playingAyah === ayah.number
                      ? stopAudio()
                      : playAyah(
                          ayah.number,
                          audio?.audio
                        )
                  }
                >
                  {playingAyah === ayah.number ? (
                    <Pause size={15} color="#D8B85A" />
                  ) : (
                    <Volume2
                      size={15}
                      color="#064E3B"
                    />
                  )}

                  <Text style={styles.audioText}>
                    {playingAyah === ayah.number
                      ? 'Stop'
                      : 'Listen Ayah'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </LinearGradient>
    );
  };

  const renderPageReader = () => {
    if (!selectedReadSurah) return renderReadSurahList();

    const densePage = (pageData?.arabic?.length || 0) > 9;
    const veryDensePage = (pageData?.arabic?.length || 0) > 14;
    const currentSurahTitle = pageSurahs.length > 0
      ? pageSurahs.map(s => s.name).join('   ۞   ')
      : selectedReadSurah.name;

    return (
      <View style={styles.readerFullWidth}>
        <TouchableOpacity
          onPress={handleInternalBack}
          style={styles.readerBack}
        >
          <Text style={styles.backText}>
            ← Back to Surah List
          </Text>
        </TouchableOpacity>

        <LinearGradient
          colors={['#FFF8EA', '#F0E2BD', '#FFFDF8']}
          style={styles.madinaA6Header}
        >
          <Text style={styles.madinaHeaderArabic}>{selectedReadSurah.name}</Text>
          <Text style={styles.madinaHeaderTitle}>{selectedReadSurah.englishName}</Text>
          <Text style={styles.madinaHeaderMeta}>
            {selectedReadSurah.englishNameTranslation} • Surah {selectedReadSurah.number} • {selectedReadSurah.numberOfAyahs} Ayahs • {selectedReadSurah.revelationType}
          </Text>
        </LinearGradient>

        <View style={styles.readerThemeRow}>
          {[
            { key: 'classic', label: 'Madina A6' },
            { key: 'cream', label: 'Golden Mushaf' },
            { key: 'focus', label: 'Focus Page' },
          ].map(item => {
            const active = mushafTheme === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.readerThemePill,
                  active && styles.readerThemePillActive,
                ]}
                onPress={() =>
                  setMushafTheme(item.key as 'classic' | 'cream' | 'focus')
                }
              >
                <Text
                  style={[
                    styles.readerThemeText,
                    active && styles.readerThemeTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View
          style={[
            styles.madinaA6Paper,
            mushafTheme === 'cream' && styles.madinaA6PaperGold,
            mushafTheme === 'focus' && styles.madinaA6PaperFocus,
          ]}
        >
          <View style={styles.madinaOrnamentHeader}>
            <View style={styles.madinaRosette}>
              <Text style={styles.madinaRosetteText}>{toArabicNumber(selectedReadSurah.number)}</Text>
            </View>

            <View style={styles.madinaSurahNamePlate}>
              <Text style={styles.madinaSurahName} numberOfLines={1}>{currentSurahTitle}</Text>
            </View>

            <View style={styles.madinaRosette}>
              <Text style={styles.madinaRosetteText}>{toArabicNumber(selectedPage)}</Text>
            </View>
          </View>

          <View style={styles.madinaPageBadge}>
            <Text style={styles.madinaPageBadgeText}>Page {selectedPage} / 604</Text>
          </View>

          {loading && (
            <ActivityIndicator color="#064E3B" />
          )}

          <View style={styles.madinaTextArea}>
            <Text
              style={[
                styles.madinaArabicText,
                densePage && styles.madinaArabicTextDense,
                veryDensePage && styles.madinaArabicTextVeryDense,
              ]}
            >
              {pageData?.arabic?.map(ayah => {
                const parts = splitBismillah(ayah.text);

                return (
                  <React.Fragment key={ayah.number}>
                    {parts.hasBismillah && (
                      <Text
                        style={[
                          styles.madinaBismillahInline,
                          densePage && styles.madinaBismillahInlineDense,
                        ]}
                      >
                        {'\n'}{BISMILLAH}{'\n'}
                      </Text>
                    )}

                    {parts.rest.length > 0 && (
                      <Text>
                        {parts.rest}
                        <Text style={styles.madinaAyahNumber}>
                          {' '}۝{toArabicNumber(ayah.numberInSurah)}{' '}
                        </Text>
                      </Text>
                    )}
                  </React.Fragment>
                );
              })}
            </Text>
          </View>

          <View style={styles.madinaFooterPanel}>
            <View style={styles.madinaFooterLine} />
            <Text style={styles.madinaFooterText}>صدق الله العظيم</Text>
            <View style={styles.madinaFooterLine} />
          </View>
        </View>

        <View style={styles.mushafControlsPremium}>
          <TouchableOpacity
            style={styles.mushafArrowPremium}
            onPress={() => goToPage(selectedPage - 1)}
          >
            <ChevronLeft size={29} color="#D47A11" />
          </TouchableOpacity>

          <View style={styles.mushafPageCirclePremium}>
            <Text style={styles.mushafPageTextPremium}>
              {selectedPage}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.mushafArrowPremium}
            onPress={() => goToPage(selectedPage + 1)}
          >
            <ChevronRight size={29} color="#D47A11" />
          </TouchableOpacity>
        </View>

        <View style={styles.pageInputArea}>
          <TextInput
            value={pageInput}
            onChangeText={setPageInput}
            keyboardType="number-pad"
            style={styles.pageInput}
          />

          <TouchableOpacity
            style={styles.goButton}
            onPress={submitPage}
          >
            <Text style={styles.goText}>Go</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRowReader}>
          <TouchableOpacity
            style={styles.smallAction}
            onPress={saveCurrentPage}
          >
            <Download size={15} color="#064E3B" />
            <Text style={styles.smallActionText}>
              Save Page
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.smallAction}
            onPress={() => fetchPage(selectedPage)}
          >
            <RefreshCw size={15} color="#064E3B" />
            <Text style={styles.smallActionText}>
              Refresh
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTafsir = () => {
    const filteredTafsirVideos = TAFSIR_VIDEO_LESSONS.slice(0, 5).filter(video => {
      const q = search.toLowerCase().trim();

      if (!q) return true;

      return (
        video.title.toLowerCase().includes(q) ||
        video.subtitle.toLowerCase().includes(q) ||
        String(video.episode).includes(q)
      );
    });

    return (
      <>
        <LinearGradient
          colors={['#FFFDF8', '#F6EFE2']}
          style={styles.tafsirIntroCard}
        >
          <View style={styles.tafsirIntroIcon}>
            <BookOpen size={22} color="#D8B85A" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.tafsirIntroTitle}>
              How to use this Tafsir section
            </Text>

            <Text style={styles.tafsirIntroText}>
              Start from episode 1, watch with focus, pause when needed, and write
              one action point after each lesson. Tafsir should increase love,
              humility and obedience to Allah.
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.tafsirSearchBox}>
          <Search size={15} color="#064E3B" />

          <TextInput
            placeholder="Search Tafsir episode..."
            placeholderTextColor="#867B6B"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.tafsirPathCard}>
          <Text style={styles.tafsirPathTitle}>
            Recommended Study Method
          </Text>

          {[
            'Begin with Bismillah and a sincere intention.',
            'Watch one lesson at a time without rushing.',
            'Write down the main lesson that touched your heart.',
            'Return to the Mushaf and read the related verses.',
            'Make dua that Allah makes the Quran light in your life.',
          ].map((point, index) => (
            <View key={point} style={styles.tafsirPathRow}>
              <View style={styles.tafsirPathNumber}>
                <Text style={styles.tafsirPathNumberText}>{index + 1}</Text>
              </View>

              <Text style={styles.tafsirPathText}>{point}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.tafsirSectionHeading}>
          Tafsir Video Lessons
        </Text>

        {filteredTafsirVideos.map(video => {
          const isActive = activeTafsirVideo === video.id;

          return (
            <LinearGradient
              key={video.id}
              colors={['#FFFDF8', '#F7F0DC']}
              style={styles.tafsirVideoCard}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  setActiveTafsirVideo(isActive ? null : video.id)
                }
              >
                <LinearGradient
                  colors={['#043B2D', '#064E3B', '#0D7054']}
                  style={styles.tafsirVideoTop}
                >
                  <View style={styles.tafsirVideoPatternOne} />
                  <View style={styles.tafsirVideoPatternTwo} />

                  <View style={styles.tafsirVideoTopRow}>
                    <View style={styles.tafsirEpisodePill}>
                      <Text style={styles.tafsirEpisodeText}>
                        Episode {video.episode}
                      </Text>
                    </View>

                    <View style={styles.tafsirPlayCircle}>
                      {isActive ? (
                        <Pause size={23} color="#FFFFFF" />
                      ) : (
                        <Play size={23} color="#FFFFFF" />
                      )}
                    </View>
                  </View>

                  <View>
                    <Text style={styles.tafsirVideoTitle}>
                      {video.title}
                    </Text>

                    <Text style={styles.tafsirVideoSubtitle}>
                      Mufti Menk Quran Tafsir Series
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.tafsirVideoBody}>
                <Text style={styles.tafsirVideoDescription}>
                  {video.subtitle}
                </Text>

                <View style={styles.tafsirVideoMetaRow}>
                  <View style={styles.tafsirMetaPill}>
                    <Headphones size={12} color="#064E3B" />
                    <Text style={styles.tafsirMetaText}>Watch & reflect</Text>
                  </View>

                  <View style={styles.tafsirMetaPill}>
                    <BookOpen size={12} color="#064E3B" />
                    <Text style={styles.tafsirMetaText}>Quran meaning</Text>
                  </View>
                </View>

                {isActive && (
                  <View style={styles.tafsirPlayerWrap}>
                    <Video
                      source={video.media}
                      style={styles.tafsirVideoPlayer}
                      resizeMode={ResizeMode.CONTAIN}
                      useNativeControls
                      shouldPlay={false}
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={styles.tafsirWatchButton}
                  onPress={() =>
                    setActiveTafsirVideo(isActive ? null : video.id)
                  }
                >
                  {isActive ? (
                    <Pause size={15} color="#D8B85A" />
                  ) : (
                    <Play size={15} color="#D8B85A" />
                  )}

                  <Text style={styles.tafsirWatchButtonText}>
                    {isActive ? 'Hide Video' : 'Open Video Lesson'}
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          );
        })}
      </>
    );
  };

  const playTajweedSample = async (audioUrl: string) => {
    try {
      await stopAudio();
      stoppedRef.current = false;

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      soundRef.current = sound;
      await sound.playAsync();
    } catch {
      Alert.alert('Audio Error', 'Unable to play this Tajweed sample now.');
    }
  };

  const markTajweedResult = (lessonId: string, result: TajweedResult) => {
    setTajweedResults(prev => ({
      ...prev,
      [lessonId]: result,
    }));

    Alert.alert(
      result === 'correct' ? 'Excellent 🌙' : 'Keep Practicing',
      result === 'correct'
        ? 'Beautiful. Keep revising so the rule becomes natural.'
        : 'Repeat the audio slowly, focus on the rule, then try again.'
    );
  };

  const renderLearn = () => {
    const learningPlan = [
      'Choose a fixed Quran time, even if it is only ten minutes.',
      'Read one page slowly before checking translation or Tafsir.',
      'Listen to a trusted reciter and repeat difficult ayahs.',
      'Write one lesson, one dua, and one action point from your reading.',
      'Review yesterday’s portion before moving to a new page.',
    ];

    const learnerMistakes = [
      'Rushing through pages without understanding.',
      'Starting too much at once and then stopping completely.',
      'Ignoring revision after memorizing.',
      'Feeling ashamed to restart after a long break.',
    ];

    const tajweedCompleted = Object.values(tajweedResults).filter(item => item === 'correct').length;

    const renderRoutineTab = () => (
      <>
        <LinearGradient
          colors={['#FFFDF8', '#F6EFE2']}
          style={styles.learnPlanCard}
        >
          <Text style={styles.learnSectionTitle}>Beautiful Quran Study Plan</Text>
          <Text style={styles.learnSectionSubtitle}>
            Follow this gentle routine so reading becomes something your heart looks forward to.
          </Text>

          {learningPlan.map((point, index) => (
            <View key={point} style={styles.learnPlanRow}>
              <View style={styles.learnPlanNumber}>
                <Text style={styles.learnPlanNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.learnPlanText}>{point}</Text>
            </View>
          ))}
        </LinearGradient>
      </>
    );

    const renderTajweedTab = () => (
      <>
        <LinearGradient colors={['#FFF7E6', '#FFFDF8']} style={styles.tajweedIntroCard}>
          <View style={styles.tajweedIntroTop}>
            <View style={styles.tajweedMedal}>
              <Volume2 size={24} color="#D8B85A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tajweedIntroTitle}>Complete Tajweed Learning Path</Text>
              <Text style={styles.tajweedIntroText}>
                Start with the meaning of Tajweed, study the rules carefully, listen to examples, then answer the exercises. This is a self-check trainer and learning support, not a replacement for a qualified teacher.
              </Text>
            </View>
          </View>

          <View style={styles.tajweedStatsRow}>
            <View style={styles.tajweedStatBox}>
              <Text style={styles.tajweedStatNumber}>{TAJWEED_RULE_GROUPS.length}</Text>
              <Text style={styles.tajweedStatLabel}>Rule Sets</Text>
            </View>
            <View style={styles.tajweedStatBox}>
              <Text style={styles.tajweedStatNumber}>{TAJWEED_LESSONS.length}</Text>
              <Text style={styles.tajweedStatLabel}>Exercises</Text>
            </View>
            <View style={styles.tajweedStatBox}>
              <Text style={styles.tajweedStatNumber}>{tajweedCompleted}</Text>
              <Text style={styles.tajweedStatLabel}>Correct</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.tajweedFoundationWrap}>
          {TAJWEED_FOUNDATION_STEPS.map(item => (
            <View key={item.title} style={styles.tajweedFoundationCard}>
              <Text style={styles.tajweedFoundationTitle}>{item.title}</Text>
              <Text style={styles.tajweedFoundationText}>{item.body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tajweedPdfSection}>
          <Text style={styles.tajweedSectionHeading}>PDF Lessons & Study Notes</Text>
          <Text style={styles.tajweedSectionSubtext}>
            Use these study resources before the exercises so the rules feel clear and organized.
          </Text>

          {TAJWEED_PDF_RESOURCES.map(resource => (
            <TouchableOpacity
              key={resource.title}
              activeOpacity={0.86}
              style={styles.tajweedPdfCard}
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/search?q=${encodeURIComponent(resource.query)}`
                )
              }
            >
              <View style={styles.tajweedPdfIcon}>
                <BookOpen size={18} color="#D8B85A" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.tajweedPdfTitle}>{resource.title}</Text>
                <Text style={styles.tajweedPdfText}>{resource.description}</Text>
              </View>

              <ExternalLink size={15} color="#064E3B" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tajweedRulesSection}>
          <Text style={styles.tajweedSectionHeading}>Rules of Tajweed</Text>
          <Text style={styles.tajweedSectionSubtext}>
            Learn these foundations first, then continue to listening practice and exercises.
          </Text>

          {TAJWEED_RULE_GROUPS.map(group => (
            <LinearGradient
              key={group.title}
              colors={['#FFFDF8', '#F6EFE2']}
              style={styles.tajweedRuleGroupCard}
            >
              <Text style={styles.tajweedRuleGroupTitle}>{group.title}</Text>

              {group.rules.map(rule => (
                <View key={`${group.title}-${rule.name}`} style={styles.tajweedRuleItem}>
                  <View style={styles.tajweedRuleNameRow}>
                    <Text style={styles.tajweedRuleName}>{rule.name}</Text>
                    <Text style={styles.tajweedRuleArabic}>{rule.arabic}</Text>
                  </View>
                  <Text style={styles.tajweedRuleMeaning}>{rule.meaning}</Text>
                  <Text style={styles.tajweedRuleExample}>{rule.example}</Text>
                </View>
              ))}
            </LinearGradient>
          ))}
        </View>

        <View style={styles.tajweedAudioSection}>
          <Text style={styles.tajweedSectionHeading}>Listen Before You Practice</Text>
          <Text style={styles.tajweedSectionSubtext}>
            Hear the rule first, repeat softly, then answer the questions below.
          </Text>

          {TAJWEED_AUDIO_GUIDES.map(guide => (
            <TouchableOpacity
              key={guide.title}
              activeOpacity={0.86}
              style={styles.tajweedAudioCard}
              onPress={() => playTajweedSample(guide.audio)}
            >
              <View style={styles.tajweedAudioIcon}>
                <Play size={16} color="#FFFFFF" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.tajweedAudioTitle}>{guide.title}</Text>
                <Text style={styles.tajweedAudioText}>{guide.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <LinearGradient colors={['#032D22', '#064E3B']} style={styles.tajweedDrillCard}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.tajweedDrillHeader}
            onPress={() => setTajweedDrillOpen(prev => !prev)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.tajweedDrillTitle}>Daily Tajweed Drill</Text>
              <Text style={styles.tajweedDrillSubtitle}>
                Open this when you want a focused daily practice checklist.
              </Text>
            </View>

            <View style={styles.tajweedDrillToggle}>
              <Text style={styles.tajweedDrillToggleText}>
                {tajweedDrillOpen ? 'Hide' : 'Open'}
              </Text>
              <Text style={styles.tajweedDrillChevron}>
                {tajweedDrillOpen ? '⌃' : '⌄'}
              </Text>
            </View>
          </TouchableOpacity>

          {tajweedDrillOpen && (
            <View style={styles.tajweedDrillBody}>
              {TAJWEED_DRILLS.map((drill, index) => (
                <View key={drill} style={styles.tajweedDrillRow}>
                  <View style={styles.tajweedDrillNumber}>
                    <Text style={styles.tajweedDrillNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.tajweedDrillText}>{drill}</Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>

        <View style={styles.tajweedExerciseSectionHeader}>
          <Text style={styles.tajweedSectionHeading}>Practice Exercises</Text>
          <Text style={styles.tajweedSectionSubtext}>
            After studying the rules and listening, test yourself gently. Mark “Needs practice” whenever you are unsure.
          </Text>
        </View>

        {TAJWEED_LESSONS.map(lesson => {
          const result = tajweedResults[lesson.id];

          return (
            <LinearGradient key={lesson.id} colors={['#FFFDF8', '#F6EFE2']} style={styles.tajweedLessonCard}>
              <View style={styles.tajweedLessonHeader}>
                <View style={styles.tajweedLessonIcon}>
                  <Text style={styles.tajweedLessonIconText}>ت</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tajweedLessonLevel}>{lesson.level}</Text>
                  <Text style={styles.tajweedLessonTitle}>{lesson.title}</Text>
                </View>
                {result ? (
                  <View style={[styles.tajweedResultPill, result === 'correct' ? styles.tajweedCorrectPill : styles.tajweedPracticePill]}>
                    <Text style={styles.tajweedResultText}>{result === 'correct' ? 'Correct' : 'Practice'}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.tajweedRule}>{lesson.rule}</Text>

              <View style={styles.tajweedExampleBox}>
                <Text style={styles.tajweedExampleArabic}>{lesson.example}</Text>
                <Text style={styles.tajweedFocus}>{lesson.focus}</Text>
              </View>

              <View style={styles.tajweedButtonRow}>
                <TouchableOpacity style={styles.tajweedListenButton} onPress={() => playTajweedSample(lesson.audio)}>
                  <Play size={15} color="#FFFFFF" />
                  <Text style={styles.tajweedListenText}>Listen</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tajweedRepeatButton} onPress={() => playTajweedSample(lesson.audio)}>
                  <RefreshCw size={15} color="#064E3B" />
                  <Text style={styles.tajweedRepeatText}>Repeat</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.tajweedExerciseTitle}>{lesson.exercise}</Text>

              <View style={styles.tajweedOptionsWrap}>
                {lesson.options.map(option => {
                  const selectedCorrect = result && option === lesson.answer;

                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.tajweedOption, selectedCorrect && styles.tajweedOptionCorrect]}
                      onPress={() => markTajweedResult(lesson.id, option === lesson.answer ? 'correct' : 'practice')}
                    >
                      <Text style={[styles.tajweedOptionText, selectedCorrect && styles.tajweedOptionTextCorrect]}>{option}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.tajweedSelfCheckRow}>
                <TouchableOpacity style={styles.tajweedSelfCorrect} onPress={() => markTajweedResult(lesson.id, 'correct')}>
                  <CheckCircle size={15} color="#FFFFFF" />
                  <Text style={styles.tajweedSelfTextWhite}>I recited it correctly</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tajweedSelfPractice} onPress={() => markTajweedResult(lesson.id, 'practice')}>
                  <RefreshCw size={15} color="#064E3B" />
                  <Text style={styles.tajweedSelfTextGreen}>Needs practice</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          );
        })}
      </>
    );

    const renderMemorizationTab = () => (
      <LinearGradient colors={['#FFFDF8', '#F6EFE2']} style={styles.learnPlanCard}>
        <Text style={styles.learnSectionTitle}>Memorization Method</Text>
        <Text style={styles.learnSectionSubtitle}>A calm method for memorizing without pressure.</Text>
        {MEMORIZATION_STEPS.map((step, index) => (
          <View key={step} style={styles.learnPlanRow}>
            <View style={styles.learnPlanNumber}>
              <Text style={styles.learnPlanNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.learnPlanText}>{step}</Text>
          </View>
        ))}
      </LinearGradient>
    );

    const renderAdabTab = () => (
      <LinearGradient
        colors={['#FFFDF8', '#F6EFE2']}
        style={styles.learnPlanCard}
      >
        <Text style={styles.learnSectionTitle}>Avoid These Common Mistakes</Text>
        <Text style={styles.learnSectionSubtitle}>
          Learning Quran should feel peaceful and steady, not heavy and confusing.
        </Text>

        {learnerMistakes.map(point => (
          <View key={point} style={styles.learnMistakeRow}>
            <View style={styles.learnMistakeDot} />
            <Text style={styles.learnMistakeText}>{point}</Text>
          </View>
        ))}
      </LinearGradient>
    );

    return (
      <>
        <View style={styles.learnCompactHeader}>
          <View style={styles.learnCompactIcon}>
            <GraduationCap size={15} color="#D8B85A" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.learnCompactTitle}>Quran Learning Hub</Text>
            <Text style={styles.learnCompactText}>Routine, Tajweed, memorization and Adab in one calm learning space.</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.learnTabScroll}>
          {[
            { key: 'routine', label: 'Routine' },
            { key: 'tajweed', label: 'Tajweed' },
            { key: 'memorization', label: 'Memorization' },
            { key: 'adab', label: 'read with purity' },
          ].map(tab => {
            const active = learnTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.learnTabPill, active && styles.learnTabPillActive]}
                onPress={() => setLearnTab(tab.key as LearnTab)}
              >
                <Text style={[styles.learnTabText, active && styles.learnTabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {learnTab === 'routine' && renderRoutineTab()}
        {learnTab === 'tajweed' && renderTajweedTab()}
        {learnTab === 'memorization' && renderMemorizationTab()}
        {learnTab === 'adab' && renderAdabTab()}

        <LinearGradient
          colors={['#043B2D', '#064E3B']}
          style={styles.learnReminderCard}
        >
          <Sparkles size={24} color="#D8B85A" />
          <Text style={styles.learnReminderTitle}>A sincere reminder</Text>
          <Text style={styles.learnReminderText}>
            The best Quran routine is the one you can continue. Start small,
            return often, and ask Allah to make the Quran the light of your heart.
          </Text>
        </LinearGradient>
      </>
    );
  };

  const renderReminder = () => (
    <LinearGradient
      colors={['#FFFDF8', '#F6EFE2']}
      style={styles.card}
    >
      <Text style={styles.sectionTitle}>
        Quran Reading Reminder
      </Text>

      <Text style={styles.sectionSubtitle}>
        Choose days and time to be reminded.
      </Text>

      {reminderActive && (
        <View style={styles.activeReminderBox}>
          <CheckCircle size={17} color="#064E3B" />

          <Text style={styles.activeReminderText}>
            Reminder active at{' '}
            {reminderHour.padStart(2, '0')}:
            {reminderMinute.padStart(2, '0')}
          </Text>
        </View>
      )}

      <View style={styles.timeRow}>
        <View style={styles.timeBox}>
          <Clock size={15} color="#064E3B" />

          <TextInput
            value={reminderHour}
            onChangeText={setReminderHour}
            keyboardType="number-pad"
            style={styles.timeInput}
            placeholder="Hour"
          />
        </View>

        <Text style={styles.colon}>:</Text>

        <View style={styles.timeBox}>
          <TextInput
            value={reminderMinute}
            onChangeText={setReminderMinute}
            keyboardType="number-pad"
            style={styles.timeInput}
            placeholder="Min"
          />
        </View>
      </View>

      <View style={styles.daysRow}>
        {DAYS.map(day => {
          const active = selectedDays.includes(day.value);

          return (
            <TouchableOpacity
              key={day.value}
              style={[
                styles.dayPill,
                active && styles.dayPillActive,
              ]}
              onPress={() =>
                toggleReminderDay(day.value)
              }
            >
              <Text
                style={[
                  styles.dayText,
                  active && styles.dayTextActive,
                ]}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.downloadFullButton}
        onPress={scheduleQuranReminder}
      >
        <Bell size={17} color="#D8B85A" />

        <Text style={styles.downloadFullText}>
          Save Quran Reminder
        </Text>
      </TouchableOpacity>

      {reminderActive && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={cancelQuranReminder}
        >
          <Text style={styles.cancelButtonText}>
            Cancel Reminder
          </Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );

  const renderSaved = () => (
    <LinearGradient
      colors={['#FFFDF8', '#F6EFE2']}
      style={styles.card}
    >
      <Text style={styles.sectionTitle}>
        Saved Quran
      </Text>

      <Text style={styles.sectionSubtitle}>
        Offline Quran text saved inside your app.
      </Text>

      <TouchableOpacity
        style={styles.downloadFullButton}
        onPress={downloadFullQuran}
        disabled={downloading}
      >
        <Download size={17} color="#D8B85A" />

        <Text style={styles.downloadFullText}>
          {downloading
            ? 'Downloading Quran...'
            : 'Download Full Quran Text'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.savedInfo}>
        Saved Surahs: {offlineSurahs.length}/114
      </Text>

      <Text style={styles.savedInfo}>
        Saved Pages: {offlinePages.length}/604
      </Text>

      <Text style={styles.savedInfo}>
        Bookmarks: {bookmarks.length}
      </Text>
    </LinearGradient>
  );

  const renderHome = () => {
    const homeCards = [
      {
        title: 'Read Quran',
        subtitle: 'Open any Surah in a clean Mushaf page.',
        sectionKey: 'read' as Section,
        Icon: BookOpen,
        tag: 'Mushaf',
        colors: ['#FFFDF8', '#F4E8C8'] as const,
      },
      {
        title: 'Translation',
        subtitle: 'Read Arabic with clear English meaning.',
        sectionKey: 'translation' as Section,
        Icon: Star,
        tag: 'Meaning',
        colors: ['#FFFDF8', '#EAF3ED'] as const,
      },
      {
        title: 'Listening',
        subtitle: 'Play ayahs or complete Surah recitation.',
        sectionKey: 'listening' as Section,
        Icon: Headphones,
        tag: 'Audio',
        colors: ['#FFFDF8', '#EEE9FF'] as const,
      },
      {
        title: 'Tafsir',
        subtitle: 'Watch the Tafsir series and reflect deeply.',
        sectionKey: 'tafsir' as Section,
        Icon: Sparkles,
        tag: 'Reflect',
        colors: ['#FFFDF8', '#F8E8D7'] as const,
      },
      {
        title: 'Learn',
        subtitle: 'Tajweed, Quran routine and memorization.',
        sectionKey: 'learn' as Section,
        Icon: GraduationCap,
        tag: 'Grow',
        colors: ['#FFFDF8', '#E8F1F8'] as const,
      },
      {
        title: 'Reminder',
        subtitle: 'Build a peaceful daily Quran habit.',
        sectionKey: 'reminder' as Section,
        Icon: Bell,
        tag: 'Habit',
        colors: ['#FFFDF8', '#F5EBD2'] as const,
      },
    ];

    return (
      <>
        <LinearGradient
          colors={['#FFFDF8', '#F7F0DC']}
          style={styles.homeWelcomeCard}
        >
          <View style={styles.homeWelcomeTop}>
            <View style={styles.homeWelcomeIcon}>
              <BookOpen size={20} color="#D8B85A" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.homeWelcomeTitle}>Begin with the Quran</Text>
              <Text style={styles.homeWelcomeSubtitle}>
                Choose a path below: read, listen, reflect, memorize, or learn Tajweed.
              </Text>
            </View>
          </View>

          <View style={styles.homeStatsRow}>
            <View style={styles.homeStatPill}>
              <Text style={styles.homeStatNumber}>604</Text>
              <Text style={styles.homeStatLabel}>Pages</Text>
            </View>

            <View style={styles.homeStatPill}>
              <Text style={styles.homeStatNumber}>114</Text>
              <Text style={styles.homeStatLabel}>Surahs</Text>
            </View>

            <View style={styles.homeStatPill}>
              <Text style={styles.homeStatNumber}>5</Text>
              <Text style={styles.homeStatLabel}>Tafsir</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.bentoGrid}>
          {homeCards.map(item => {
            const Icon = item.Icon;

            return (
              <TouchableOpacity
                key={item.title}
                style={styles.bentoTouchable}
                activeOpacity={0.88}
                onPress={() => {
                  setSearch('');
                  setSelectedReadSurah(null);
                  setSelectedSurah(null);
                  setSection(item.sectionKey);
                }}
              >
                <LinearGradient
                  colors={item.colors}
                  style={styles.bentoCard}
                >
                  <View style={styles.bentoTopRow}>
                    <View style={styles.bentoIconWrap}>
                      <Icon size={18} color="#064E3B" />
                    </View>

                    <View style={styles.bentoTag}>
                      <Text style={styles.bentoTagText}>{item.tag}</Text>
                    </View>
                  </View>

                  <Text style={styles.bentoTitle}>{item.title}</Text>
                  <Text style={styles.bentoSub}>{item.subtitle}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        <LinearGradient
          colors={['#064E3B', '#0D7054']}
          style={styles.downloadFullButton}
        >
          <TouchableOpacity
            style={styles.downloadFullTouchable}
            onPress={downloadFullQuran}
            disabled={downloading}
            activeOpacity={0.88}
          >
            <Download size={17} color="#D8B85A" />

            <Text style={styles.downloadFullText}>
              {downloading
                ? 'Downloading...'
                : 'Download Quran Text for Offline'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </>
    );
  };

  const renderContent = () => {
    if (section === 'home') return renderHome();
    if (section === 'read') return renderPageReader();

    if (section === 'translation')
      return selectedSurah
        ? renderSurahReader()
        : renderSurahList('translation');

    if (section === 'listening')
      return (
        <>
          <LinearGradient
            colors={['#FFFDF8', '#F6EFE2']}
            style={styles.card}
          >
            <Text style={styles.sectionTitle}>
              Choose Reciter
            </Text>

            <Text style={styles.sectionSubtitle}>
              Listen ayah by ayah or full Surah.
            </Text>

            <View style={styles.reciterRow}>
              {RECITERS.map(reciter => (
                <TouchableOpacity
                  key={reciter.edition}
                  style={[
                    styles.reciterPill,
                    selectedReciter.edition ===
                      reciter.edition &&
                      styles.reciterPillActive,
                  ]}
                  onPress={() =>
                    setSelectedReciter(reciter)
                  }
                >
                  <Text
                    style={[
                      styles.reciterText,
                      selectedReciter.edition ===
                        reciter.edition &&
                        styles.reciterTextActive,
                    ]}
                  >
                    {reciter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>

          {selectedSurah
            ? renderSurahReader()
            : renderSurahList('listening')}
        </>
      );

    if (section === 'tafsir') return renderTafsir();
    if (section === 'learn') return renderLearn();
    if (section === 'saved') return renderSaved();
    if (section === 'reminder') return renderReminder();

    return null;
  };

  const isReadingMushafPage = section === 'read' && !!selectedReadSurah;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#032D22"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          isReadingMushafPage && styles.scrollContentReaderOnly,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!isReadingMushafPage && (
          <>
            <View style={styles.topCircle} />
            <View style={styles.goldBlur} />
            <View style={styles.bottomCircle} />

            <LinearGradient
              colors={['#032D22', '#064E3B', '#0D7054']}
              style={styles.hero}
            >
          <View style={styles.heroBadge}>
            <Sparkles size={10} color="#D8B85A" />

            <Text style={styles.heroBadgeText}>
              Quran & Tafsir
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            Read • Listen • Reflect
          </Text>

          <View style={styles.heroLine} />

          <Text style={styles.heroSubtitle}>
            Clean Quran reading, translations,
            online recitations, Tafsir, reminders
            and learning.
          </Text>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X size={16} color="#064E3B" />
            ) : (
              <Menu size={16} color="#064E3B" />
            )}

            <Text style={styles.menuButtonText}>
              Quran Menu
            </Text>
          </TouchableOpacity>
            </LinearGradient>

            {menuOpen && renderMenu()}
          </>
        )}

        {renderContent()}

        {!isReadingMushafPage && (
          <LinearGradient
            colors={['#043B2D', '#064E3B']}
            style={styles.footerCard}
          >
            <BookOpen size={18} color="#D8B85A" />

            <Text style={styles.footerTitle}>
              A Beautiful Reminder
            </Text>

            <Text style={styles.footerText}>
              The Quran is not only recited; it is
              understood, reflected upon, loved,
              memorized and lived.
            </Text>
          </LinearGradient>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5EFE3' },
  container: { flex: 1 },

  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 58,
    paddingBottom: 32,
  },

  scrollContentReaderOnly: {
    paddingTop: 18,
    paddingBottom: 24,
  },

  topCircle: {
    position: 'absolute',
    top: -130,
    right: -82,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: '#D9EAE2',
    opacity: 0.88,
  },

  goldBlur: {
    position: 'absolute',
    top: 280,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: '#D8B85A',
    opacity: 0.14,
  },

  bottomCircle: {
    position: 'absolute',
    bottom: -120,
    left: -80,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: '#D8B85A',
    opacity: 0.12,
  },

  hero: {
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 18,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#021F18',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 6,
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  heroBadgeText: {
    color: '#D8B85A',
    marginLeft: 5,
    fontSize: 9,
    fontWeight: '800',
  },

  heroTitle: {
    color: '#ffffff',
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  heroLine: {
    width: 42,
    height: 2,
    backgroundColor: '#D8B85A',
    borderRadius: 999,
    marginVertical: 8,
  },

  heroSubtitle: {
    color: '#DAF3E9',
    fontSize: 11.5,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600',
    maxWidth: 295,
  },

  menuButton: {
    marginTop: 14,
    backgroundColor: '#D8B85A',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },

  menuButtonText: {
    color: '#064E3B',
    marginLeft: 5,
    fontWeight: '900',
    fontSize: 10,
  },

  menuCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    padding: 6,
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: '#E5D9C3',
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 6,
    elevation: 1,
  },

  menuItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 11,
  },

  menuItemActive: {
    backgroundColor: '#064E3B',
  },

  menuText: {
    marginTop: 4,
    color: '#064E3B',
    fontSize: 8.5,
    fontWeight: '900',
  },

  menuTextActive: {
    color: '#D8B85A',
  },

  homeWelcomeCard: {
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 13,
    marginTop: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6DCC9',
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.045,
    shadowRadius: 8,
    elevation: 2,
  },

  homeWelcomeTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  homeWelcomeIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  homeWelcomeTitle: {
    color: '#032D22',
    fontSize: 15,
    fontWeight: '900',
  },

  homeWelcomeSubtitle: {
    color: '#6F665A',
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: '700',
    marginTop: 3,
  },

  homeStatsRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 11,
  },

  homeStatPill: {
    flex: 1,
    backgroundColor: 'rgba(6,78,59,0.08)',
    borderRadius: 14,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6,78,59,0.08)',
  },

  homeStatNumber: {
    color: '#064E3B',
    fontSize: 14,
    fontWeight: '900',
  },

  homeStatLabel: {
    color: '#8A6A21',
    fontSize: 8.5,
    fontWeight: '900',
    marginTop: 1,
  },

  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 2,
  },

  bentoTouchable: {
    width: '48.6%',
    marginBottom: 9,
  },

  bentoCard: {
    minHeight: 104,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: '#E6DCC9',
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.045,
    shadowRadius: 7,
    elevation: 2,
  },

  bentoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  bentoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: 'rgba(6,78,59,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bentoTag: {
    backgroundColor: '#064E3B',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 7,
  },

  bentoTagText: {
    color: '#D8B85A',
    fontSize: 7.5,
    fontWeight: '900',
  },

  bentoTitle: {
    color: '#032D22',
    fontSize: 13.5,
    fontWeight: '900',
  },

  bentoSub: {
    color: '#675E54',
    marginTop: 4,
    fontSize: 9.4,
    lineHeight: 14,
    fontWeight: '700',
  },

  card: {
    borderRadius: 17,
    paddingVertical: 11,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6DCC9',
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 1,
  },

  sectionTitle: {
    color: '#032D22',
    fontSize: 14.5,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.15,
  },

  sectionSubtitle: {
    color: '#746A5D',
    fontSize: 9.8,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
    fontWeight: '600',
    lineHeight: 15,
  },

  searchBox: {
    backgroundColor: '#F5EFE3',
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#032D22',
    fontWeight: '700',
  },

  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 13,
    paddingVertical: 7,
    paddingHorizontal: 9,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E6DCC9',
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.025,
    shadowRadius: 3,
    elevation: 1,
  },

  surahNumber: {
    width: 26,
    height: 26,
    borderRadius: 10,
    backgroundColor: '#E6F1EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  surahNumberText: {
    color: '#064E3B',
    fontSize: 10,
    fontWeight: '900',
  },

  surahName: {
    color: '#032D22',
    fontSize: 10.5,
    fontWeight: '900',
  },

  surahMeaning: {
    color: '#746A5D',
    fontSize: 8.7,
    marginTop: 1,
    fontWeight: '700',
  },

  surahMeta: {
    color: '#9A6A16',
    fontSize: 8.2,
    marginTop: 1,
    fontWeight: '800',
  },

  backText: {
    color: '#064E3B',
    fontWeight: '900',
    marginBottom: 10,
  },

  surahBanner: {
    backgroundColor: '#F7F0DC',
    borderRadius: 26,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#B69A5B',
    marginBottom: 16,
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },

  surahHeaderArabic: {
    color: '#032D22',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },

  surahHeaderTitle: {
    color: '#9A6A16',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 4,
  },

  surahHeaderMeaning: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },

  surahHeaderMeta: {
    color: '#746A5D',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 10,
  },

  actionRowReader: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 9,
    marginBottom: 12,
  },

  smallAction: {
    backgroundColor: '#E6F1EC',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  smallActionText: {
    color: '#064E3B',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 5,
  },

  playerPanel: {
    backgroundColor: '#F5EFE3',
    borderRadius: 18,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  playerButton: {
    backgroundColor: '#E6F1EC',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  playerText: {
    color: '#064E3B',
    marginLeft: 4,
    fontSize: 9,
    fontWeight: '900',
  },

  stopButton: {
    backgroundColor: '#F5E7E7',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  stopText: {
    color: '#8B1E1E',
    marginLeft: 4,
    fontSize: 9,
    fontWeight: '900',
  },

  ayahCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  ayahTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  ayahMeta: {
    color: '#9A6A16',
    fontSize: 9.5,
    fontWeight: '900',
  },

  arabicText: {
    color: '#111827',
    fontSize: 22,
    lineHeight: 43,
    textAlign: 'right',
    fontWeight: '700',
    marginTop: 10,
  },

  translationText: {
    color: '#374151',
    marginTop: 12,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '600',
  },

  audioButton: {
    marginTop: 12,
    backgroundColor: '#E6F1EC',
    borderRadius: 15,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  audioText: {
    color: '#064E3B',
    marginLeft: 6,
    fontSize: 10,
    fontWeight: '900',
  },

  readerFullWidth: {
    marginHorizontal: -16,
    marginBottom: 20,
    paddingTop: 8,
  },

  readerBack: {
    paddingHorizontal: 14,
    paddingTop: 24,
    marginBottom: 6,
  },

  pageSurahInfo: {
    backgroundColor: '#F7F0DC',
    borderRadius: 25,
    paddingVertical: 17,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B69A5B',
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.08,
    shadowRadius: 13,
    elevation: 3,
  },

  pageSurahArabic: {
    color: '#032D22',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },

  pageSurahEnglish: {
    color: '#9A6A16',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 4,
  },

  pageSurahMeta: {
    color: '#746A5D',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 16,
  },

  mushafPaper: {
    width: '100%',
    backgroundColor: '#FFFDF8',
    borderWidth: 1.2,
    borderColor: '#D6C197',
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 16,
    minHeight: 690,
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 5,
  },

  mushafTopDecor: {
    minHeight: 58,
    borderWidth: 1.1,
    borderColor: '#B69A5B',
    backgroundColor: '#F8F2E4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 9,
    marginBottom: 12,
    borderRadius: 3,
  },

  surahTitlePill: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#FFFDF8',
    borderRadius: 999,
    borderWidth: 1.3,
    borderColor: '#8A7443',
    paddingVertical: 7,
    paddingHorizontal: 8,
  },

  decorCircle: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: '#FFFDF8',
    borderWidth: 1.3,
    borderColor: '#8A7443',
    alignItems: 'center',
    justifyContent: 'center',
  },

  decorCircleText: {
    color: '#5E4A22',
    fontSize: 11,
    fontWeight: '900',
  },

  mushafOrnamentText: {
    color: '#064E3B',
    fontWeight: '900',
    textAlign: 'center',
    fontSize: 16,
  },

  pageNumberBadge: {
    alignSelf: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },

  pageNumberText: {
    color: '#D47A11',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 10.5,
  },

  mushafTextArea: {
    flex: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#C9B47D',
    paddingHorizontal: 12,
    paddingVertical: 16,
    justifyContent: 'flex-start',
  },

  bismillahText: {
    color: '#032D22',
    fontSize: 27,
    lineHeight: 48,
    textAlign: 'center',
    fontWeight: '900',
    marginVertical: 12,
    writingDirection: 'rtl',
  },

  pageArabic: {
    color: '#1B1A16',
    fontSize: 23,
    lineHeight: 46,
    textAlign: 'center',
    fontWeight: '700',
    writingDirection: 'rtl',
  },

  pageArabicDense: {
    fontSize: 21,
    lineHeight: 40,
  },

  inlineAyahNumber: {
    color: '#C77816',
    fontSize: 16,
    fontWeight: '900',
  },

  mushafBottomDecor: {
    borderWidth: 1.2,
    borderColor: '#80623A',
    backgroundColor: '#EFE3C6',
    minHeight: 34,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mushafBottomText: {
    color: '#064E3B',
    fontSize: 14,
    fontWeight: '900',
  },

  mushafControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },

  mushafArrow: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  mushafPageCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 18,
    borderWidth: 3,
    borderColor: '#D8B85A',
  },

  mushafPageText: {
    color: '#D8B85A',
    fontSize: 18,
    fontWeight: '900',
  },

  pageInputArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
    gap: 8,
  },

  pageInput: {
    width: 82,
    backgroundColor: '#FFFDF8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    paddingVertical: 8,
    textAlign: 'center',
    color: '#064E3B',
    fontWeight: '900',
  },

  goButton: {
    backgroundColor: '#064E3B',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 18,
  },

  goText: {
    color: '#D8B85A',
    fontWeight: '900',
  },

  reciterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  reciterPill: {
    width: '48%',
    backgroundColor: '#E6F1EC',
    borderRadius: 15,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
  },

  reciterPillActive: {
    backgroundColor: '#064E3B',
  },

  reciterText: {
    color: '#064E3B',
    fontSize: 10,
    fontWeight: '900',
  },

  reciterTextActive: {
    color: '#D8B85A',
  },

  tafsirProgress: {
    color: '#9A6A16',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },

  tafsirBox: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 10,
  },

  tafsirTitle: {
    color: '#9A6A16',
    fontWeight: '900',
    fontSize: 10,
  },

  tafsirArabic: {
    color: '#111827',
    fontSize: 21,
    lineHeight: 38,
    textAlign: 'right',
    fontWeight: '700',
    marginTop: 8,
  },

  tafsirTranslation: {
    color: '#374151',
    fontSize: 11.5,
    lineHeight: 19,
    fontWeight: '700',
    marginTop: 8,
  },

  tafsirText: {
    color: '#4B5563',
    fontSize: 11.2,
    lineHeight: 19,
    fontWeight: '600',
    marginTop: 8,
  },

  resourceCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  resourceTitle: {
    color: '#032D22',
    fontSize: 12,
    fontWeight: '900',
  },

  resourceText: {
    color: '#746A5D',
    fontSize: 10.5,
    lineHeight: 16,
    fontWeight: '600',
    marginTop: 3,
  },

  videoCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 10,
  },

  videoIconBox: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  videoInfo: {
    flex: 1,
  },

  videoTitle: {
    color: '#032D22',
    fontSize: 12,
    fontWeight: '900',
  },

  videoSub: {
    color: '#746A5D',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  timeBox: {
    width: 92,
    backgroundColor: '#F5EFE3',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  timeInput: {
    flex: 1,
    color: '#032D22',
    fontWeight: '900',
    textAlign: 'center',
  },

  colon: {
    color: '#064E3B',
    fontSize: 22,
    fontWeight: '900',
    marginHorizontal: 8,
  },

  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12,
  },

  dayPill: {
    backgroundColor: '#E6F1EC',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    margin: 3,
  },

  dayPillActive: {
    backgroundColor: '#064E3B',
  },

  dayText: {
    color: '#064E3B',
    fontSize: 10,
    fontWeight: '900',
  },

  dayTextActive: {
    color: '#D8B85A',
  },

  activeReminderBox: {
    backgroundColor: '#E6F1EC',
    borderRadius: 16,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  activeReminderText: {
    color: '#064E3B',
    fontSize: 10.5,
    fontWeight: '900',
    marginLeft: 6,
  },

  downloadFullButton: {
    borderRadius: 17,
    marginTop: 3,
    marginBottom: 10,
    shadowColor: '#021F18',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 9,
    elevation: 3,
  },

  downloadFullTouchable: {
    paddingVertical: 12,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  downloadFullText: {
    color: '#ffffff',
    fontSize: 10.8,
    fontWeight: '900',
    marginLeft: 7,
  },

  cancelButton: {
    backgroundColor: '#F5E7E7',
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#8B1E1E',
    fontSize: 10.5,
    fontWeight: '900',
  },

  savedInfo: {
    color: '#064E3B',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },


  tafsirHero: {
    borderRadius: 32,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#021F18',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },

  tafsirGlowOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(216,184,90,0.16)',
    top: -70,
    right: -70,
  },

  tafsirGlowTwo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    bottom: -55,
    left: -45,
  },

  tafsirHeroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 999,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  tafsirHeroBadgeText: {
    color: '#D8B85A',
    marginLeft: 6,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  tafsirHeroTitle: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 34,
  },

  tafsirHeroText: {
    color: '#E7F8F0',
    fontSize: 12.3,
    lineHeight: 20,
    marginTop: 9,
    fontWeight: '700',
  },

  tafsirStatsRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 17,
  },

  tafsirStatBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  tafsirStatNumber: {
    color: '#D8B85A',
    fontSize: 18,
    fontWeight: '900',
  },

  tafsirStatLabel: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    marginTop: 3,
  },

  tafsirIntroCard: {
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 13,
    marginTop: -2,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  tafsirIntroIcon: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  tafsirIntroTitle: {
    color: '#032D22',
    fontSize: 15,
    fontWeight: '900',
  },

  tafsirIntroText: {
    color: '#5E5548',
    fontSize: 11.5,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 4,
  },

  tafsirSearchBox: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 1,
  },

  tafsirPathCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 12,
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  tafsirPathTitle: {
    color: '#032D22',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 9,
  },

  tafsirPathRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },

  tafsirPathNumber: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  tafsirPathNumberText: {
    color: '#D8B85A',
    fontSize: 11,
    fontWeight: '900',
  },

  tafsirPathText: {
    flex: 1,
    color: '#3D382F',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    paddingTop: 3,
  },

  tafsirSectionHeading: {
    color: '#032D22',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 12,
  },

  tafsirVideoCard: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },

  tafsirVideoTop: {
    height: 160,
    padding: 14,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  tafsirVideoPatternOne: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(216,184,90,0.17)',
    right: -55,
    top: -50,
  },

  tafsirVideoPatternTwo: {
    position: 'absolute',
    width: 115,
    height: 115,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    left: -45,
    bottom: -45,
  },

  tafsirVideoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tafsirEpisodePill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  tafsirEpisodeText: {
    color: '#D8B85A',
    fontSize: 10.5,
    fontWeight: '900',
  },

  tafsirPlayCircle: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tafsirVideoTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },

  tafsirVideoSubtitle: {
    color: '#E7F8F0',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },

  tafsirVideoBody: {
    padding: 15,
  },

  tafsirVideoDescription: {
    color: '#3D382F',
    fontSize: 12.4,
    lineHeight: 19,
    fontWeight: '700',
  },

  tafsirVideoMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 11,
  },

  tafsirMetaPill: {
    backgroundColor: '#E6F1EC',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  tafsirMetaText: {
    color: '#064E3B',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 5,
  },

  tafsirPlayerWrap: {
    marginTop: 13,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  tafsirVideoPlayer: {
    width: '100%',
    height: 230,
    backgroundColor: '#000000',
  },

  tafsirWatchButton: {
    backgroundColor: '#064E3B',
    borderRadius: 17,
    paddingVertical: 12,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 13,
  },

  tafsirWatchButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 7,
  },


  readerPremiumHeader: {
    backgroundColor: '#FFFDF8',
    borderRadius: 27,
    paddingVertical: 18,
    paddingHorizontal: 15,
    marginHorizontal: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#D6C197',
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 13,
    elevation: 3,
  },

  readerPremiumArabic: {
    color: '#032D22',
    fontSize: 27,
    fontWeight: '900',
    textAlign: 'center',
    writingDirection: 'rtl',
  },

  readerPremiumTitle: {
    color: '#9A6A16',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 5,
  },

  readerPremiumMeta: {
    color: '#746A5D',
    fontSize: 10.5,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 16,
  },

  readerThemeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 9,
    paddingHorizontal: 12,
    gap: 7,
  },

  readerThemePill: {
    backgroundColor: '#FFFDF8',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  readerThemePillActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },

  readerThemeText: {
    color: '#064E3B',
    fontSize: 10,
    fontWeight: '900',
  },

  readerThemeTextActive: {
    color: '#D8B85A',
  },

  mushafPremiumPaper: {
    width: '100%',
    backgroundColor: '#FBFAF4',
    borderWidth: 1,
    borderColor: '#B79C5B',
    padding: 8,
    minHeight: 720,
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },

  mushafPremiumPaperCream: {
    backgroundColor: '#FFF8EA',
  },

  mushafPremiumPaperFocus: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E6E0D3',
  },

  mushafOuterFrame: {
    flex: 1,
    borderWidth: 1.3,
    borderColor: '#8A7443',
    padding: 7,
    backgroundColor: 'rgba(255,255,255,0.42)',
  },

  mushafInnerFrame: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D6C197',
    paddingTop: 10,
    paddingHorizontal: 8,
    paddingBottom: 11,
  },

  mushafFloralHeader: {
    minHeight: 62,
    borderWidth: 1,
    borderColor: '#B69A5B',
    backgroundColor: '#F3E8C9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 10,
  },

  mushafCornerRosette: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: '#FFFDF8',
    borderWidth: 1.2,
    borderColor: '#8A7443',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mushafCornerText: {
    color: '#5E4A22',
    fontSize: 12,
    fontWeight: '900',
  },

  mushafTitleCartouche: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#FFFDF8',
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: '#8A7443',
    paddingVertical: 9,
    paddingHorizontal: 8,
  },

  mushafTitleArabic: {
    color: '#064E3B',
    fontWeight: '900',
    textAlign: 'center',
    fontSize: 17,
    writingDirection: 'rtl',
  },

  mushafPageBadgePremium: {
    alignSelf: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },

  mushafPageBadgeTextPremium: {
    color: '#D47A11',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 10.5,
  },

  mushafPremiumTextArea: {
    flex: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#C9B47D',
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  mushafAyahWrap: {
    marginBottom: 5,
  },

  mushafLineWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mushafBismillahWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },

  bismillahPremiumText: {
    color: '#032D22',
    fontSize: 30,
    lineHeight: 52,
    textAlign: 'center',
    fontWeight: '900',
    writingDirection: 'rtl',
  },

  bismillahPremiumTextDense: {
    fontSize: 27,
    lineHeight: 46,
  },

  pageArabicPremium: {
    color: '#15140F',
    fontSize: 26,
    lineHeight: 49,
    textAlign: 'center',
    fontWeight: '800',
    writingDirection: 'rtl',
    letterSpacing: 0.2,
  },

  pageArabicPremiumDense: {
    fontSize: 24,
    lineHeight: 44,
  },

  inlineAyahPremiumNumber: {
    color: '#B66C12',
    fontSize: 16,
    fontWeight: '900',
  },

  mushafFooterSeal: {
    borderWidth: 1,
    borderColor: '#80623A',
    backgroundColor: '#EFE3C6',
    minHeight: 38,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },

  mushafFooterLine: {
    height: 1,
    flex: 1,
    backgroundColor: '#C7AE74',
  },

  mushafFooterTextPremium: {
    color: '#064E3B',
    fontSize: 14,
    fontWeight: '900',
    marginHorizontal: 10,
  },

  mushafControlsPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 11,
    marginBottom: 8,
    gap: 12,
  },

  mushafArrowPremium: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#FFFDF8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  mushafPageCirclePremium: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mushafPageTextPremium: {
    color: '#D47A11',
    fontSize: 22,
    fontWeight: '900',
  },


  learnCompactHeader: {
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: -4,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  learnCompactIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  learnCompactTitle: {
    color: '#032D22',
    fontSize: 14,
    fontWeight: '900',
  },

  learnCompactText: {
    color: '#746A5D',
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: '700',
    marginTop: 2,
  },

  learnHeroCard: {
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 13,
    overflow: 'hidden',
  },

  learnHeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  learnHeroBadgeText: {
    color: '#D8B85A',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 6,
    letterSpacing: 0.5,
  },

  learnHeroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 31,
  },

  learnHeroText: {
    color: '#DAF3E9',
    fontSize: 12.5,
    lineHeight: 20,
    fontWeight: '700',
    marginTop: 9,
  },

  learnPlanCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 17,
    paddingVertical: 12,
    paddingHorizontal: 13,
    marginTop: 0,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  learnSectionTitle: {
    color: '#032D22',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },

  learnSectionSubtitle: {
    color: '#746A5D',
    fontSize: 11.3,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
    fontWeight: '700',
    lineHeight: 17,
  },

  learnPlanRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  learnPlanNumber: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  learnPlanNumberText: {
    color: '#D8B85A',
    fontSize: 11,
    fontWeight: '900',
  },

  learnPlanText: {
    flex: 1,
    color: '#3D362D',
    fontSize: 12.2,
    lineHeight: 19,
    fontWeight: '700',
    paddingTop: 3,
  },

  learnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  learnFeatureCard: {
    width: '48.5%',
    backgroundColor: '#FFFDF8',
    borderRadius: 17,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  learnFeatureIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  learnFeatureTitle: {
    color: '#032D22',
    fontSize: 13.5,
    fontWeight: '900',
    marginBottom: 5,
  },

  learnFeatureText: {
    color: '#746A5D',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '700',
  },

  learnMistakeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 9,
  },

  learnMistakeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#D8B85A',
    marginTop: 6,
    marginRight: 9,
  },

  learnMistakeText: {
    flex: 1,
    color: '#3D362D',
    fontSize: 12.2,
    lineHeight: 18,
    fontWeight: '700',
  },

  learnReminderCard: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#021F18',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 5,
  },

  learnReminderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 9,
  },

  learnReminderText: {
    color: '#DAF3E9',
    fontSize: 12.2,
    lineHeight: 19,
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 7,
  },

  footerCard: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#021F18',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
  },

  footerTitle: {
    color: '#D8B85A',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 5,
  },

  footerText: {
    color: '#E7F8F0',
    fontSize: 9.8,
    lineHeight: 15.5,
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '600',
  },

  /* ================================
     COMPLETE MADINA A6 MUSHAF STYLES
     ================================ */

  madinaA6Header: {
    borderRadius: 18,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  madinaHeaderArabic: {
    color: '#032D22',
    fontSize: 27,
    fontWeight: '900',
    textAlign: 'center',
    writingDirection: 'rtl',
  },

  madinaHeaderTitle: {
    color: '#9A6A16',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 4,
  },

  madinaHeaderMeta: {
    color: '#746A5D',
    fontSize: 10.5,
    lineHeight: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 5,
  },


  madinaA6Paper: {
    backgroundColor: '#FFFDF3',
    borderRadius: 18,
    paddingVertical: 9,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#8B6F32',
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 9,
    elevation: 3,
  },

  madinaA6PaperGold: {
    backgroundColor: '#FFF7DF',
    borderColor: '#B8892D',
  },

  madinaA6PaperFocus: {
    backgroundColor: '#FDFBF2',
    borderColor: '#064E3B',
  },

  madinaOuterBorder: {
    borderWidth: 0,
    borderColor: 'transparent',
    padding: 0,
    minHeight: 0,
  },

  madinaMiddleBorder: {
    borderWidth: 0,
    borderColor: 'transparent',
    padding: 0,
    minHeight: 0,
  },

  madinaInnerBorder: {
    borderWidth: 0,
    borderColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
    minHeight: 0,
  },

  madinaOrnamentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  madinaRosette: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#F8EBC2',
    borderWidth: 1,
    borderColor: '#8B6F32',
    alignItems: 'center',
    justifyContent: 'center',
  },

  madinaRosetteText: {
    color: '#064E3B',
    fontSize: 12,
    fontWeight: '900',
  },

  madinaSurahNamePlate: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 999,
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: '#8B6F32',
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  madinaSurahName: {
    color: '#064E3B',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    writingDirection: 'rtl',
  },

  madinaPageBadge: {
    alignSelf: 'center',
    backgroundColor: '#FFF4DC',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 13,
    marginBottom: 7,
  },

  madinaPageBadgeText: {
    color: '#C77713',
    fontSize: 10,
    fontWeight: '900',
  },

  madinaTextArea: {
    paddingHorizontal: 2,
    paddingVertical: 6,
    alignItems: 'stretch',
    width: '100%',
  },

  madinaAyahBlock: {
    width: '100%',
    alignItems: 'stretch',
    justifyContent: 'center',
    marginBottom: 2,
  },

  madinaBismillah: {
    color: '#064E3B',
    fontSize: 29,
    lineHeight: 49,
    textAlign: 'center',
    fontWeight: '900',
    writingDirection: 'rtl',
    marginBottom: 5,
  },

  madinaBismillahDense: {
    fontSize: 26,
    lineHeight: 44,
    marginBottom: 3,
  },

  madinaBismillahInline: {
    color: '#064E3B',
    fontSize: 30,
    lineHeight: 54,
    textAlign: 'center',
    fontWeight: '900',
    writingDirection: 'rtl',
  },

  madinaBismillahInlineDense: {
    fontSize: 27,
    lineHeight: 48,
  },

  madinaArabicText: {
    color: '#111827',
    fontSize: 27,
    lineHeight: 49,
    textAlign: 'justify',
    fontWeight: '700',
    writingDirection: 'rtl',
    width: '100%',
  },

  madinaArabicTextDense: {
    fontSize: 24.5,
    lineHeight: 44,
  },

  madinaArabicTextVeryDense: {
    fontSize: 22.5,
    lineHeight: 40,
  },

  madinaAyahNumber: {
    color: '#B46B12',
    fontSize: 18,
    fontWeight: '900',
  },

  madinaFooterPanel: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },

  madinaFooterLine: {
    width: '70%',
    height: 1,
    backgroundColor: '#B69A5B',
    marginVertical: 5,
  },

  madinaFooterText: {
    color: '#064E3B',
    fontSize: 15,
    fontWeight: '900',
  },

 



  /* ================================
     COMPLETE LEARN / TAJWEED STYLES
     ================================ */

  learnHero: {
    borderRadius: 30,
    paddingVertical: 26,
    paddingHorizontal: 18,
    marginBottom: 16,
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#021F18',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 7,
  },

  learnTabScroll: {
    marginTop: 0,
    marginBottom: 8,
    maxHeight: 38,
    flexGrow: 0,
  },

  learnTabPill: {
    backgroundColor: '#FFFDF8',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  learnTabPillActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },

  learnTabText: {
    color: '#064E3B',
    fontSize: 10,
    fontWeight: '900',
  },

  learnTabTextActive: {
    color: '#D8B85A',
  },

  learnInfoCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  learnInfoTitle: {
    color: '#032D22',
    fontSize: 16,
    fontWeight: '900',
  },

  learnInfoText: {
    color: '#4B4034',
    fontSize: 12,
    lineHeight: 19,
    fontWeight: '700',
    marginTop: 7,
  },

  learnPathCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  learnPathRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },

  learnPathNumber: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  learnPathNumberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  learnPathText: {
    flex: 1,
    color: '#21372F',
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: '700',
    paddingTop: 3,
  },

  tajweedIntroCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 26,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    shadowColor: '#5E4515',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  tajweedIntroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  tajweedMedal: {
    width: 44,
    height: 44,
    borderRadius: 17,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  tajweedIntroTitle: {
    color: '#032D22',
    fontSize: 17,
    fontWeight: '900',
  },

  tajweedIntroText: {
    color: '#4B4034',
    fontSize: 12.2,
    lineHeight: 19,
    fontWeight: '700',
  },

  tajweedStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },

  tajweedStatBox: {
    flex: 1,
    backgroundColor: '#FFFDF8',
    borderRadius: 20,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  tajweedStatNumber: {
    color: '#D8B85A',
    fontSize: 18,
    fontWeight: '900',
  },

  tajweedStatLabel: {
    color: '#064E3B',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
  },

  tajweedDrillCard: {
    backgroundColor: '#064E3B',
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 13,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D8B85A',
  },

  tajweedDrillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  tajweedDrillSubtitle: {
    color: '#F5E9C8',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 3,
  },

  tajweedDrillToggle: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216,184,90,0.45)',
  },

  tajweedDrillToggleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  tajweedDrillChevron: {
    color: '#D8B85A',
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 5,
    marginTop: -2,
  },

  tajweedDrillBody: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(216,184,90,0.28)',
  },

  tajweedDrillTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  tajweedDrillRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },

  tajweedDrillNumber: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: '#D8B85A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  tajweedDrillNumberText: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '900',
  },

  tajweedDrillText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13.5,
    lineHeight: 22,
    fontWeight: '800',
    paddingTop: 2,
  },

  tajweedLessonCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  tajweedLessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  tajweedLessonIcon: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  tajweedLessonIconText: {
    color: '#D8B85A',
    fontSize: 18,
    fontWeight: '900',
  },

  tajweedLessonTitle: {
    color: '#032D22',
    fontSize: 16,
    fontWeight: '900',
  },

  tajweedLessonLevel: {
    color: '#9A6A16',
    fontSize: 10.5,
    fontWeight: '900',
    marginTop: 3,
  },

  tajweedRule: {
    color: '#064E3B',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '800',
    marginTop: 10,
  },

  tajweedExampleBox: {
    backgroundColor: '#FFF7DF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  tajweedExampleArabic: {
    color: '#064E3B',
    fontSize: 25,
    lineHeight: 42,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontWeight: '900',
  },

  tajweedFocus: {
    color: '#9A6A16',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 7,
  },

  tajweedButtonRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 12,
  },

  tajweedListenButton: {
    flex: 1,
    backgroundColor: '#064E3B',
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  tajweedListenText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  tajweedRepeatButton: {
    flex: 1,
    backgroundColor: '#E6F1EC',
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  tajweedRepeatText: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  tajweedExerciseTitle: {
    color: '#032D22',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 14,
    marginBottom: 9,
  },

  tajweedOptionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  tajweedOption: {
    backgroundColor: '#FFFDF8',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  tajweedOptionCorrect: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },

  tajweedOptionText: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '900',
  },

  tajweedOptionTextCorrect: {
    color: '#FFFFFF',
  },

  tajweedSelfCheckRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  tajweedSelfCorrect: {
    flex: 1,
    backgroundColor: '#064E3B',
    borderRadius: 15,
    paddingVertical: 10,
    alignItems: 'center',
  },

  tajweedSelfPractice: {
    flex: 1,
    backgroundColor: '#FFF7DF',
    borderRadius: 15,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  tajweedSelfTextWhite: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  tajweedSelfTextGreen: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '900',
  },

  tajweedResultPill: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
    backgroundColor: '#E6F1EC',
  },

  tajweedCorrectPill: {
    backgroundColor: '#064E3B',
  },

  tajweedPracticePill: {
    backgroundColor: '#FFF7DF',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  tajweedResultText: {
    color: '#064E3B',
    fontSize: 10.5,
    fontWeight: '900',
  },

  tajweedFoundationWrap: {
    marginBottom: 10,
  },

  tajweedFoundationCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 13,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  tajweedFoundationTitle: {
    color: '#064E3B',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 5,
  },

  tajweedFoundationText: {
    color: '#4B5563',
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '700',
  },

  tajweedPdfSection: {
    marginTop: 2,
    marginBottom: 12,
  },

  tajweedRulesSection: {
    marginTop: 2,
    marginBottom: 12,
  },

  tajweedAudioSection: {
    marginTop: 2,
    marginBottom: 12,
  },

  tajweedExerciseSectionHeader: {
    marginTop: 4,
    marginBottom: 10,
  },

  tajweedSectionHeading: {
    color: '#032D22',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 5,
  },

  tajweedSectionSubtext: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 19,
    fontWeight: '700',
    marginBottom: 9,
  },

  tajweedPdfCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    flexDirection: 'row',
    alignItems: 'center',
  },

  tajweedPdfIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  tajweedPdfTitle: {
    color: '#064E3B',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 3,
  },

  tajweedPdfText: {
    color: '#6B7280',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '700',
  },

  tajweedRuleGroupCard: {
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  tajweedRuleGroupTitle: {
    color: '#064E3B',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 9,
  },

  tajweedRuleItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EFE3C6',
  },

  tajweedRuleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  tajweedRuleName: {
    color: '#032D22',
    fontSize: 13,
    fontWeight: '900',
  },

  tajweedRuleArabic: {
    color: '#B46B12',
    fontSize: 14,
    fontWeight: '900',
    writingDirection: 'rtl',
  },

  tajweedRuleMeaning: {
    color: '#4B5563',
    fontSize: 11,
    lineHeight: 18,
    fontWeight: '700',
    marginBottom: 6,
  },

  tajweedRuleExample: {
    color: '#064E3B',
    fontSize: 20,
    lineHeight: 34,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontWeight: '900',
  },

  tajweedAudioCard: {
    backgroundColor: '#064E3B',
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8B85A',
  },

  tajweedAudioIcon: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#0B6B52',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  tajweedAudioTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 3,
  },

  tajweedAudioText: {
    color: '#E8F3EE',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '700',
  },


});
