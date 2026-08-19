import React, { useEffect, useMemo, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Notifications from '../../utils/safeNotifications';
import * as Speech from 'expo-speech';
import { Audio } from '../../utils/safeAV';

import {
  Home,
  BookOpen,
  Star,
  Trophy,
  Users,
  MessageCircle,
  Mic,
  MicOff,
  Volume2,
  CheckCircle,
  XCircle,
  Search,
  Sparkles,
  Brain,
  Share2,
  RefreshCw,
  Lock,
  Flame,
  Gem,
  Zap,
  Globe2,
  Bot,
  Award,
  Crown,
  Library,
} from 'lucide-react-native';
import api from '../../api/client';

type Tab = 'path' | 'learn' | 'quiz' | 'speak' | 'ai' | 'rank' | 'connect' | 'resources';

type Lesson = {
  id: string;
  section: number;
  unit: number;
  title: string;
  subtitle: string;
  type: string;
  color: string;
};

type WordItem = {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  category: string;
};

type QuizItem = {
  question: string;
  answer: string;
  options: string[];
};

type RecordingInfo = {
  uri: string;
  score: number;
  remark: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const GREEN = '#064E3B';
const EMERALD = '#0D7054';
const MINT = '#E6F7EF';
const GOLD = '#D4A017';
const SOFT_GOLD = '#FFF2C6';
const CREAM = '#F7F5EE';
const CARD = '#FFFDF8';
const ROSE = '#F97BA6';
const PURPLE = '#A56CF5';
const SKY = '#2DA7E0';
const ORANGE = '#F59E0B';
const TEAL = '#14B8A6';

const STORAGE_PROGRESS = 'ARABIC_PROGRESS_V6';
const STORAGE_POINTS = 'ARABIC_POINTS_V6';
const STORAGE_STREAK = 'ARABIC_STREAK_V6';
const STORAGE_GEMS = 'ARABIC_GEMS_V6';
const STORAGE_ENERGY = 'ARABIC_ENERGY_V6';
const STORAGE_RECORDINGS = 'ARABIC_RECORDINGS_V6';

const LESSONS: Lesson[] = [
  { id: 's1u1', section: 1, unit: 1, title: 'Arabic Letters', subtitle: 'Pair letters and sounds', type: 'letters', color: GREEN },
  { id: 's1u2', section: 1, unit: 2, title: 'Short Vowels', subtitle: 'Fatha, kasra, damma', type: 'harakat', color: TEAL },
  { id: 's1u3', section: 1, unit: 3, title: 'Names & People', subtitle: 'Identify simple names', type: 'words', color: PURPLE },
  { id: 's1u4', section: 1, unit: 4, title: 'Your House', subtitle: 'Talk about your home', type: 'sentences', color: GOLD },
  { id: 's1u5', section: 1, unit: 5, title: 'Objects', subtitle: 'Things around you', type: 'words', color: SKY },
  { id: 's1u6', section: 1, unit: 6, title: 'Greetings', subtitle: 'Start conversations', type: 'conversation', color: ROSE },
  { id: 's1u7', section: 1, unit: 7, title: 'Quran Words', subtitle: 'Common Quran vocabulary', type: 'quran', color: EMERALD },
  { id: 's1u8', section: 1, unit: 8, title: 'Sentence Builder', subtitle: 'Build simple sentences', type: 'sentences', color: ORANGE },

  { id: 's2u1', section: 2, unit: 1, title: 'Family', subtitle: 'Mother, father, brother', type: 'words', color: GREEN },
  { id: 's2u2', section: 2, unit: 2, title: 'Manners', subtitle: 'Polite Islamic speech', type: 'conversation', color: TEAL },
  { id: 's2u3', section: 2, unit: 3, title: 'Numbers', subtitle: 'Count in Arabic', type: 'words', color: SKY },
  { id: 's2u4', section: 2, unit: 4, title: 'Ask Questions', subtitle: 'Where, what, who', type: 'sentences', color: PURPLE },
  { id: 's2u5', section: 2, unit: 5, title: 'Feelings', subtitle: 'Happy, tired, fine', type: 'words', color: ROSE },

  { id: 's3u1', section: 3, unit: 1, title: 'Food & Drink', subtitle: 'Water, bread, dates', type: 'words', color: ORANGE },
  { id: 's3u2', section: 3, unit: 2, title: 'At the Market', subtitle: 'Buying and asking', type: 'conversation', color: GOLD },
  { id: 's3u3', section: 3, unit: 3, title: 'Colors', subtitle: 'Describe objects', type: 'grammar', color: SKY },
  { id: 's3u4', section: 3, unit: 4, title: 'Descriptions', subtitle: 'Big, small, beautiful', type: 'sentences', color: TEAL },

  { id: 's4u1', section: 4, unit: 1, title: 'Prayer Words', subtitle: 'Salah vocabulary', type: 'quran', color: GREEN },
  { id: 's4u2', section: 4, unit: 2, title: 'At the Mosque', subtitle: 'Mosque conversations', type: 'conversation', color: EMERALD },
  { id: 's4u3', section: 4, unit: 3, title: 'Directions', subtitle: 'Left, right, near, far', type: 'sentences', color: PURPLE },
  { id: 's4u4', section: 4, unit: 4, title: 'Daily Worship', subtitle: 'Wudu, prayer, dua', type: 'quran', color: GOLD },

  { id: 's5u1', section: 5, unit: 1, title: 'Countries', subtitle: 'Talk about places', type: 'conversation', color: ROSE },
  { id: 's5u2', section: 5, unit: 2, title: 'Travel Arabic', subtitle: 'Airport and journey', type: 'sentences', color: SKY },
  { id: 's5u3', section: 5, unit: 3, title: 'Requests', subtitle: 'Please, I want, give me', type: 'conversation', color: ORANGE },
  { id: 's5u4', section: 5, unit: 4, title: 'Daily Routine', subtitle: 'Morning and evening', type: 'sentences', color: TEAL },

  { id: 's6u1', section: 6, unit: 1, title: 'Grammar Basics', subtitle: 'Past and present', type: 'grammar', color: GREEN },
  { id: 's6u2', section: 6, unit: 2, title: 'Verbs', subtitle: 'Go, read, write, learn', type: 'grammar', color: PURPLE },
  { id: 's6u3', section: 6, unit: 3, title: 'Listening Challenge', subtitle: 'Hear and choose', type: 'conversation', color: SKY },
  { id: 's6u4', section: 6, unit: 4, title: 'Voice Challenge', subtitle: 'Pronunciation scoring', type: 'voice', color: ROSE },

  { id: 's7u1', section: 7, unit: 1, title: 'Quran Essentials', subtitle: 'Mercy, light, guidance', type: 'quran', color: EMERALD },
  { id: 's7u2', section: 7, unit: 2, title: 'Islamic Phrases', subtitle: 'Beautiful daily phrases', type: 'conversation', color: GOLD },
  { id: 's7u3', section: 7, unit: 3, title: 'Final Review', subtitle: 'Full Arabic practice', type: 'grammar', color: GREEN },
  { id: 's7u4', section: 7, unit: 4, title: 'Arabic Champion', subtitle: 'Final challenge', type: 'conversation', color: ORANGE },
];

const WORDS: WordItem[] = [
  { id: 'w1', arabic: 'بَيْت', transliteration: 'bayt', english: 'house', category: 'Objects' },
  { id: 'w2', arabic: 'كِتَاب', transliteration: 'kitaab', english: 'book', category: 'Objects' },
  { id: 'w3', arabic: 'قَلَم', transliteration: 'qalam', english: 'pen', category: 'Objects' },
  { id: 'w4', arabic: 'بَاب', transliteration: 'baab', english: 'door', category: 'Objects' },
  { id: 'w5', arabic: 'كُرْسِيّ', transliteration: 'kursiyy', english: 'chair', category: 'Objects' },
  { id: 'w6', arabic: 'مَكْتَب', transliteration: 'maktab', english: 'desk / office', category: 'Objects' },

  { id: 'w7', arabic: 'مَسْجِد', transliteration: 'masjid', english: 'mosque', category: 'Places' },
  { id: 'w8', arabic: 'مَدْرَسَة', transliteration: 'madrasah', english: 'school', category: 'Places' },
  { id: 'w9', arabic: 'سُوق', transliteration: 'sooq', english: 'market', category: 'Places' },
  { id: 'w10', arabic: 'مَدِينَة', transliteration: 'madeenah', english: 'city', category: 'Places' },

  { id: 'w11', arabic: 'أَنَا', transliteration: 'anaa', english: 'I / me', category: 'Pronouns' },
  { id: 'w12', arabic: 'أَنْتَ', transliteration: 'anta', english: 'you male', category: 'Pronouns' },
  { id: 'w13', arabic: 'أَنْتِ', transliteration: 'anti', english: 'you female', category: 'Pronouns' },
  { id: 'w14', arabic: 'هُوَ', transliteration: 'huwa', english: 'he', category: 'Pronouns' },
  { id: 'w15', arabic: 'هِيَ', transliteration: 'hiya', english: 'she', category: 'Pronouns' },
  { id: 'w16', arabic: 'نَحْنُ', transliteration: 'nahnu', english: 'we', category: 'Pronouns' },

  { id: 'w17', arabic: 'السَّلَامُ عَلَيْكُمْ', transliteration: 'as-salamu alaykum', english: 'peace be upon you', category: 'Conversation' },
  { id: 'w18', arabic: 'وَعَلَيْكُمُ السَّلَام', transliteration: 'wa alaykum as-salam', english: 'and peace be upon you', category: 'Conversation' },
  { id: 'w19', arabic: 'شُكْرًا', transliteration: 'shukran', english: 'thank you', category: 'Conversation' },
  { id: 'w20', arabic: 'عَفْوًا', transliteration: 'afwan', english: 'you are welcome', category: 'Conversation' },
  { id: 'w21', arabic: 'مِنْ فَضْلِكَ', transliteration: 'min fadlik', english: 'please', category: 'Conversation' },
  { id: 'w22', arabic: 'كَيْفَ حَالُكَ؟', transliteration: 'kayfa haaluk?', english: 'how are you?', category: 'Conversation' },

  { id: 'w23', arabic: 'الله', transliteration: 'Allah', english: 'Allah', category: 'Quran' },
  { id: 'w24', arabic: 'رَحْمَة', transliteration: 'rahmah', english: 'mercy', category: 'Quran' },
  { id: 'w25', arabic: 'نُور', transliteration: 'noor', english: 'light', category: 'Quran' },
  { id: 'w26', arabic: 'هُدًى', transliteration: 'huda', english: 'guidance', category: 'Quran' },
  { id: 'w27', arabic: 'حَقّ', transliteration: 'haqq', english: 'truth', category: 'Quran' },
  { id: 'w28', arabic: 'خَيْر', transliteration: 'khayr', english: 'goodness', category: 'Quran' },
  { id: 'w29', arabic: 'صَبْر', transliteration: 'sabr', english: 'patience', category: 'Quran' },
  { id: 'w30', arabic: 'قَلْب', transliteration: 'qalb', english: 'heart', category: 'Quran' },

  { id: 'w31', arabic: 'أُمّ', transliteration: 'umm', english: 'mother', category: 'Family' },
  { id: 'w32', arabic: 'أَب', transliteration: 'ab', english: 'father', category: 'Family' },
  { id: 'w33', arabic: 'أَخ', transliteration: 'akh', english: 'brother', category: 'Family' },
  { id: 'w34', arabic: 'أُخْت', transliteration: 'ukht', english: 'sister', category: 'Family' },
  { id: 'w35', arabic: 'طِفْل', transliteration: 'tifl', english: 'child', category: 'Family' },

  { id: 'w36', arabic: 'مَاء', transliteration: 'maa', english: 'water', category: 'Food' },
  { id: 'w37', arabic: 'خُبْز', transliteration: 'khubz', english: 'bread', category: 'Food' },
  { id: 'w38', arabic: 'تَمْر', transliteration: 'tamr', english: 'dates', category: 'Food' },
  { id: 'w39', arabic: 'لَبَن', transliteration: 'laban', english: 'milk', category: 'Food' },
  { id: 'w40', arabic: 'طَعَام', transliteration: 'ta’aam', english: 'food', category: 'Food' },

  { id: 'w41', arabic: 'أَحْمَر', transliteration: 'ahmar', english: 'red', category: 'Colors' },
  { id: 'w42', arabic: 'أَخْضَر', transliteration: 'akhdar', english: 'green', category: 'Colors' },
  { id: 'w43', arabic: 'أَبْيَض', transliteration: 'abyad', english: 'white', category: 'Colors' },
  { id: 'w44', arabic: 'أَسْوَد', transliteration: 'aswad', english: 'black', category: 'Colors' },

  { id: 'w45', arabic: 'جَمِيل', transliteration: 'jameel', english: 'beautiful', category: 'Description' },
  { id: 'w46', arabic: 'كَبِير', transliteration: 'kabeer', english: 'big', category: 'Description' },
  { id: 'w47', arabic: 'صَغِير', transliteration: 'sagheer', english: 'small', category: 'Description' },

  { id: 'w48', arabic: 'وَاحِد', transliteration: 'waahid', english: 'one', category: 'Numbers' },
  { id: 'w49', arabic: 'اِثْنَان', transliteration: 'ithnaan', english: 'two', category: 'Numbers' },
  { id: 'w50', arabic: 'ثَلَاثَة', transliteration: 'thalaathah', english: 'three', category: 'Numbers' },
  { id: 'w51', arabic: 'أَرْبَعَة', transliteration: 'arba’ah', english: 'four', category: 'Numbers' },
  { id: 'w52', arabic: 'خَمْسَة', transliteration: 'khamsah', english: 'five', category: 'Numbers' },
];

const SENTENCES = [
  { arabic: 'أَنَا فِي الْبَيْتِ', transliteration: 'anaa fil-bayt', english: 'I am in the house.' },
  { arabic: 'هَذَا كِتَابٌ', transliteration: 'haadhaa kitaabun', english: 'This is a book.' },
  { arabic: 'أَيْنَ الْمَسْجِدُ؟', transliteration: 'ayna al-masjid?', english: 'Where is the mosque?' },
  { arabic: 'أُرِيدُ أَنْ أَتَعَلَّمَ الْعَرَبِيَّةَ', transliteration: 'ureedu an ata’allama al-arabiyyah', english: 'I want to learn Arabic.' },
  { arabic: 'هَذَا بَيْتٌ جَمِيلٌ', transliteration: 'haadhaa baytun jameel', english: 'This is a beautiful house.' },
  { arabic: 'أَنَا أَقْرَأُ الْقُرْآنَ', transliteration: 'anaa aqra’u al-qur’an', english: 'I read the Quran.' },
];

const QUIZZES: QuizItem[] = [
  { question: 'What does بَيْت mean?', answer: 'house', options: ['book', 'house', 'school', 'light'] },
  { question: 'Choose the Arabic word for “book”.', answer: 'كِتَاب', options: ['بَيْت', 'كِتَاب', 'مَسْجِد', 'نُور'] },
  { question: 'What does السَّلَامُ عَلَيْكُمْ mean?', answer: 'peace be upon you', options: ['thank you', 'peace be upon you', 'where is it?', 'I am fine'] },
  { question: 'Choose the Arabic word for “guidance”.', answer: 'هُدًى', options: ['رَحْمَة', 'هُدًى', 'نُور', 'صَبْر'] },
  { question: 'What does أُمّ mean?', answer: 'mother', options: ['father', 'sister', 'mother', 'child'] },
  { question: 'Choose the Arabic word for “water”.', answer: 'مَاء', options: ['مَاء', 'خُبْز', 'تَمْر', 'لَبَن'] },
];

const LEADERBOARD = [
  { name: 'Amina', country: 'Morocco', points: 2450, streak: 22 },
  { name: 'Yusuf', country: 'Egypt', points: 2180, streak: 18 },
  { name: 'Sadiyatou', country: 'Cameroon', points: 1925, streak: 15 },
  { name: 'Maryam', country: 'Nigeria', points: 1740, streak: 12 },
  { name: 'Ibrahim', country: 'Saudi Arabia', points: 1605, streak: 10 },
];

const STUDENTS = [
  { name: 'Fatima', country: 'Qatar', interest: 'Quran Arabic partner' },
  { name: 'Zainab', country: 'Ghana', interest: 'Conversation practice' },
  { name: 'Omar', country: 'UAE', interest: 'Vocabulary challenge' },
];

export default function ArabicLearningPage() {
  const [tab, setTab] = useState<Tab>('path');
  const [query, setQuery] = useState('');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [points, setPoints] = useState(458);
  const [streak, setStreak] = useState(5);
  const [gems, setGems] = useState(25);
  const [energy, setEnergy] = useState(25);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<{ id: number; title: string; type: string; url?: string; description?: string }[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);

  useEffect(() => {
    if (tab !== 'resources') return;
    setResourcesLoading(true);
    api.get('/arabic-resources').then(res => {
      if (res.data?.resources) setResources(res.data.resources);
    }).catch(() => {}).finally(() => setResourcesLoading(false));
  }, [tab]);

  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [quizCorrect, setQuizCorrect] = useState(0);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [activeRecordWordId, setActiveRecordWordId] = useState('');
  const [recordings, setRecordings] = useState<Record<string, RecordingInfo>>({});

  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'ai',
      text: 'Assalamu Alaikum! I am your Arabic practice partner. Ask me about Arabic words, pronunciation, sentences, or conversation.',
    },
  ]);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_PROGRESS);
      const savedPoints = await AsyncStorage.getItem(STORAGE_POINTS);
      const savedStreak = await AsyncStorage.getItem(STORAGE_STREAK);
      const savedGems = await AsyncStorage.getItem(STORAGE_GEMS);
      const savedEnergy = await AsyncStorage.getItem(STORAGE_ENERGY);
      const savedRecordings = await AsyncStorage.getItem(STORAGE_RECORDINGS);

      if (saved) setCompletedLessons(JSON.parse(saved));
      if (savedPoints) setPoints(Number(savedPoints));
      if (savedStreak) setStreak(Number(savedStreak));
      if (savedGems) setGems(Number(savedGems));
      if (savedEnergy) setEnergy(Number(savedEnergy));
      if (savedRecordings) setRecordings(JSON.parse(savedRecordings));
    } finally {
      setLoading(false);
    }
  };

  const saveStats = async (
    newPoints = points,
    newStreak = streak,
    newGems = gems,
    newEnergy = energy
  ) => {
    setPoints(newPoints);
    setStreak(newStreak);
    setGems(newGems);
    setEnergy(newEnergy);

    await AsyncStorage.setItem(STORAGE_POINTS, String(newPoints));
    await AsyncStorage.setItem(STORAGE_STREAK, String(newStreak));
    await AsyncStorage.setItem(STORAGE_GEMS, String(newGems));
    await AsyncStorage.setItem(STORAGE_ENERGY, String(newEnergy));
  };

  const saveProgress = async (items: string[]) => {
    setCompletedLessons(items);
    await AsyncStorage.setItem(STORAGE_PROGRESS, JSON.stringify(items));
  };

  const addReward = async (amount: number) => {
    await saveStats(
      points + amount,
      streak,
      gems + Math.ceil(amount / 10),
      Math.max(0, energy - 1)
    );
  };

  const scheduleRevisionReminder = async () => {
    try {
      const permission = await Notifications.requestPermissionsAsync();
      if (!permission.granted) return;

      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Arabic Revision Reminder 🌙',
          body: 'Complete one Arabic lesson today and keep your streak alive.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 19,
          minute: 30,
        },
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Morning Arabic Practice ✨',
          body: 'Practice one Arabic word, sentence, or voice exercise today.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 8,
          minute: 0,
        },
      });
    } catch {}
  };

  useEffect(() => {
    loadProgress();
    scheduleRevisionReminder();
  }, []);

  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: 'ar',
      rate: 0.78,
      pitch: 1,
    });
  };

  const completeLesson = async (lessonId: string) => {
    if (completedLessons.includes(lessonId)) return;

    const updated = [...completedLessons, lessonId];
    await saveProgress(updated);
    await addReward(25);

    Alert.alert('Lesson Complete 🎉', 'You earned 25 points and gems. Keep learning!');
  };

  const filteredWords = useMemo(() => {
    const s = query.toLowerCase();

    return WORDS.filter(
      item =>
        item.arabic.includes(query) ||
        item.english.toLowerCase().includes(s) ||
        item.transliteration.toLowerCase().includes(s) ||
        item.category.toLowerCase().includes(s)
    );
  }, [query]);

  const answerQuiz = async (option: string) => {
    if (selected) return;

    setSelected(option);

    if (option === QUIZZES[quizIndex].answer) {
      setQuizCorrect(prev => prev + 1);
      await addReward(10);
      Alert.alert('Correct ✅', 'Excellent! You earned 10 points.');
    } else {
      Alert.alert('Correction ❌', `Correct answer: ${QUIZZES[quizIndex].answer}`);
    }
  };

  const nextQuiz = () => {
    if (!selected) {
      Alert.alert('Choose answer', 'Please select an answer first.');
      return;
    }

    if (quizIndex < QUIZZES.length - 1) {
      setQuizIndex(prev => prev + 1);
      setSelected('');
    } else {
      Alert.alert('Quiz Finished', `Your score: ${quizCorrect}/${QUIZZES.length}`);
      setQuizIndex(0);
      setSelected('');
      setQuizCorrect(0);
    }
  };

  const getPronunciationScore = (word: WordItem) => {
    const base = word.arabic.length * 9;
    const randomBonus = Math.floor(Math.random() * 18);
    const score = Math.min(98, Math.max(55, base + randomBonus));

    let remark = 'Good attempt. Repeat slowly and clearly.';

    if (score >= 85) remark = 'Excellent pronunciation. Very clear!';
    else if (score >= 70) remark = 'Good pronunciation. Improve rhythm slightly.';
    else remark = 'Keep practicing. Listen again and repeat slower.';

    return { score, remark };
  };

  const startRecording = async (wordId: string) => {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Allow microphone access.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();

      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      await newRecording.startAsync();

      setActiveRecordWordId(wordId);
      setRecording(newRecording);
    } catch {
      Alert.alert('Recording Error', 'Unable to start recording.');
    }
  };

  const stopRecording = async (word: WordItem) => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      const result = getPronunciationScore(word);

      const updated = {
        ...recordings,
        [word.id]: {
          uri: uri || '',
          score: result.score,
          remark: result.remark,
        },
      };

      setRecording(null);
      setActiveRecordWordId('');
      setRecordings(updated);

      await AsyncStorage.setItem(STORAGE_RECORDINGS, JSON.stringify(updated));
      await addReward(result.score >= 70 ? 15 : 5);

      Alert.alert(
        result.score >= 70 ? 'Pronunciation Mark ✅' : 'Practice Needed',
        `${result.score}%\n${result.remark}`
      );
    } catch {
      Alert.alert('Recording Error', 'Unable to stop recording.');
    }
  };

  const playRecording = async (wordId: string) => {
    const item = recordings[wordId];

    if (!item?.uri) {
      Alert.alert('No Recording', 'Record this particular word first.');
      return;
    }

    const { sound } = await Audio.Sound.createAsync({ uri: item.uri });
    await sound.playAsync();
  };

  const askAI = async () => {
    const text = aiInput.trim();
    if (!text) return;

    const lower = text.toLowerCase();

    let answer =
      'Good question. Practice this way: listen first, repeat slowly, then use the word in a short Arabic sentence.';

    if (lower.includes('house')) {
      answer = 'House in Arabic is بَيْت. Sentence: أَنَا فِي الْبَيْتِ — I am in the house.';
    } else if (lower.includes('thank')) {
      answer = 'Thank you is شُكْرًا. Reply with عَفْوًا, meaning you are welcome.';
    } else if (lower.includes('mosque')) {
      answer = 'Mosque is مَسْجِد. Sentence: أَيْنَ الْمَسْجِدُ؟ — Where is the mosque?';
    } else if (lower.includes('quran')) {
      answer = 'Useful Quran words: هُدًى means guidance, نُور means light, رَحْمَة means mercy.';
    }

    setAiMessages(prev => [
      ...prev,
      { role: 'user', text },
      { role: 'ai', text: answer },
    ]);

    setAiInput('');
    await addReward(3);
  };

  const shareProgress = async () => {
    await Share.share({
      message: `I am learning Arabic! Points: ${points}, Gems: ${gems}, Lessons completed: ${completedLessons.length}/${LESSONS.length}`,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingPage}>
          <ActivityIndicator color={GREEN} size="large" />
          <Text style={styles.loadingText}>Loading Arabic Learning...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentLesson =
    LESSONS.find(item => !completedLessons.includes(item.id)) || LESSONS[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <LinearGradient colors={[CREAM, '#FFF7E6']} style={styles.topBar}>
        <View style={styles.statMini}>
          <Flame size={19} color={ORANGE} />
          <Text style={styles.statMiniText}>{streak}</Text>
        </View>

        <View style={styles.statMini}>
          <Star size={19} color={GOLD} />
          <Text style={styles.statMiniText}>{completedLessons.length}</Text>
        </View>

        <View style={styles.statMini}>
          <Gem size={19} color={SKY} />
          <Text style={styles.blueStat}>{points}</Text>
        </View>

        <View style={styles.statMini}>
          <Zap size={19} color={PURPLE} />
          <Text style={styles.purpleStat}>{energy}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'path' && (
          <>
            <LinearGradient
              colors={[currentLesson.color, GREEN]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.unitHeader}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.unitSmall}>
                  SECTION {currentLesson.section}, UNIT {currentLesson.unit}
                </Text>

                <Text style={styles.unitTitle}>
                  {currentLesson.title}
                </Text>

                <Text style={styles.unitSubtitle}>
                  {currentLesson.subtitle}
                </Text>
              </View>

              <BookOpen size={34} color="#FFFFFF" />
            </LinearGradient>

            <View style={styles.mapArea}>
              {LESSONS.map((lesson, index) => {
                const done = completedLessons.includes(lesson.id);
                const active = lesson.id === currentLesson.id;
                const locked =
                  !done && !active && index > completedLessons.length + 1;

                return (
                  <View
                    key={lesson.id}
                    style={[
                      styles.lessonRow,
                      index % 2 === 0 ? styles.lessonLeft : styles.lessonRight,
                    ]}
                  >
                    {index === completedLessons.length && (
                      <View style={styles.jumpBubble}>
                        <Text style={styles.jumpText}>
                          CONTINUE HERE
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.lessonCircle,
                        { backgroundColor: locked ? '#E2E2E2' : lesson.color },
                        done && styles.doneCircle,
                        active && styles.activeCircle,
                      ]}
                      onPress={() => {
                        if (locked) {
                          Alert.alert('Locked', 'Complete previous lessons first.');
                          return;
                        }

                        setTab('learn');
                      }}
                    >
                      {locked ? (
                        <Lock size={30} color="#AFAFAF" />
                      ) : done ? (
                        <CheckCircle size={34} color="#FFFFFF" />
                      ) : (
                        <Star size={34} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>

                    <Text style={styles.lessonTitle}>
                      {lesson.title}
                    </Text>

                    <Text style={styles.lessonSub}>
                      {lesson.subtitle}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {tab === 'learn' && (
          <>
            <LinearGradient colors={[GREEN, EMERALD]} style={styles.heroCard}>
              <Sparkles size={28} color={GOLD} />

              <Text style={styles.heroTitle}>
                Learn Arabic Tools
              </Text>

              <Text style={styles.heroText}>
                More words, sentences, objects, Quran vocabulary and conversations.
              </Text>
            </LinearGradient>

            <View style={styles.searchBox}>
              <Search size={18} color={GREEN} />

              <TextInput
                style={styles.searchInput}
                placeholder="Search Arabic, English, category..."
                placeholderTextColor="#8A8172"
                value={query}
                onChangeText={setQuery}
              />
            </View>

            {filteredWords.map(item => (
              <LinearGradient
                key={item.id}
                colors={[CARD, item.category === 'Quran' ? MINT : '#FFF4E0']}
                style={styles.wordCard}
              >
                <View style={styles.wordTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.wordArabic}>
                      {item.arabic}
                    </Text>

                    <Text style={styles.wordTrans}>
                      {item.transliteration}
                    </Text>

                    <Text style={styles.wordEnglish}>
                      {item.english}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.soundButton}
                    onPress={() => speak(item.arabic)}
                  >
                    <Volume2 size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {item.category}
                  </Text>
                </View>
              </LinearGradient>
            ))}

            <Text style={styles.sectionTitle}>
              Sentences
            </Text>

            {SENTENCES.map(item => (
              <View key={item.arabic} style={styles.sentenceCard}>
                <Text style={styles.wordArabic}>
                  {item.arabic}
                </Text>

                <Text style={styles.wordTrans}>
                  {item.transliteration}
                </Text>

                <Text style={styles.wordEnglish}>
                  {item.english}
                </Text>

                <TouchableOpacity
                  style={styles.practiceButton}
                  onPress={() => speak(item.arabic)}
                >
                  <Volume2 size={17} color="#FFFFFF" />
                  <Text style={styles.practiceButtonText}>Listen</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => completeLesson(currentLesson.id)}
            >
              <CheckCircle size={20} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>
                Complete Lesson
              </Text>
            </TouchableOpacity>
          </>
        )}

        {tab === 'quiz' && (
          <LinearGradient colors={[CARD, '#FFF1D6']} style={styles.quizCard}>
            <Brain size={38} color={GREEN} />

            <Text style={styles.quizTitle}>
              Arabic Quiz
            </Text>

            <Text style={styles.quizCount}>
              Question {quizIndex + 1} of {QUIZZES.length}
            </Text>

            <Text style={styles.quizQuestion}>
              {QUIZZES[quizIndex].question}
            </Text>

            {QUIZZES[quizIndex].options.map(option => {
              const isSelected = selected === option;
              const isCorrect = option === QUIZZES[quizIndex].answer;

              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    isSelected && isCorrect && styles.optionCorrect,
                    isSelected && !isCorrect && styles.optionWrong,
                  ]}
                  onPress={() => answerQuiz(option)}
                >
                  {isSelected ? (
                    isCorrect ? (
                      <CheckCircle size={20} color={GREEN} />
                    ) : (
                      <XCircle size={20} color="#8B1E1E" />
                    )
                  ) : (
                    <Star size={18} color={GOLD} />
                  )}

                  <Text style={styles.optionText}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {selected.length > 0 && (
              <View style={styles.correctionBox}>
                <Text style={styles.correctionTitle}>
                  Correction
                </Text>

                <Text style={styles.correctionText}>
                  Correct answer: {QUIZZES[quizIndex].answer}
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.nextButton} onPress={nextQuiz}>
              <RefreshCw size={18} color="#FFFFFF" />

              <Text style={styles.nextButtonText}>
                Next Question
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {tab === 'speak' && (
          <>
            <LinearGradient colors={[GREEN, EMERALD]} style={styles.heroCard}>
              <Mic size={34} color={GOLD} />

              <Text style={styles.heroTitle}>
                Voice Exercise
              </Text>

              <Text style={styles.heroText}>
                Each word keeps its own recording, score and correction.
              </Text>
            </LinearGradient>

            {WORDS.slice(0, 18).map(item => {
              const rec = recordings[item.id];
              const isRecordingThis =
                Boolean(recording) && activeRecordWordId === item.id;

              return (
                <View key={item.id} style={styles.speakCard}>
                  <Text style={styles.wordArabic}>
                    {item.arabic}
                  </Text>

                  <Text style={styles.wordTrans}>
                    {item.transliteration}
                  </Text>

                  <Text style={styles.wordEnglish}>
                    {item.english}
                  </Text>

                  {rec && (
                    <View style={styles.scoreBox}>
                      <Text style={styles.scoreText}>
                        Pronunciation mark: {rec.score}%
                      </Text>

                      <Text style={styles.scoreRemark}>
                        {rec.remark}
                      </Text>
                    </View>
                  )}

                  <View style={styles.speakActions}>
                    <TouchableOpacity
                      style={styles.listenBtn}
                      onPress={() => speak(item.arabic)}
                    >
                      <Volume2 size={18} color="#FFFFFF" />
                      <Text style={styles.listenText}>Listen</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.listenBtn,
                        isRecordingThis && styles.recordingBtn,
                      ]}
                      onPress={() =>
                        isRecordingThis
                          ? stopRecording(item)
                          : startRecording(item.id)
                      }
                    >
                      {isRecordingThis ? (
                        <MicOff size={18} color="#FFFFFF" />
                      ) : (
                        <Mic size={18} color="#FFFFFF" />
                      )}

                      <Text style={styles.listenText}>
                        {isRecordingThis ? 'Stop' : 'Record'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.listenBtn}
                      onPress={() => playRecording(item.id)}
                    >
                      <Volume2 size={18} color="#FFFFFF" />
                      <Text style={styles.listenText}>Replay</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {tab === 'ai' && (
          <>
            <LinearGradient colors={[GREEN, EMERALD]} style={styles.heroCard}>
              <Bot size={35} color={GOLD} />

              <Text style={styles.heroTitle}>
                Mini Arabic AI
              </Text>

              <Text style={styles.heroText}>
                Ask questions and practice Arabic sentences.
              </Text>
            </LinearGradient>

            {aiMessages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.aiBubble,
                  msg.role === 'user' && styles.aiUserBubble,
                ]}
              >
                <Text
                  style={[
                    styles.aiText,
                    msg.role === 'user' && styles.aiUserText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            ))}

            <View style={styles.aiInputRow}>
              <TextInput
                style={styles.aiInput}
                placeholder="Ask: how do I say house?"
                placeholderTextColor="#8A8172"
                value={aiInput}
                onChangeText={setAiInput}
              />

              <TouchableOpacity style={styles.aiSend} onPress={askAI}>
                <MessageCircle size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {tab === 'rank' && (
          <>
            <LinearGradient colors={[GOLD, ORANGE]} style={styles.rankHero}>
              <Crown size={42} color="#FFFFFF" />

              <Text style={styles.rankTitle}>
                Arabic Leaderboard
              </Text>

              <Text style={styles.rankText}>
                See top learners and challenge yourself.
              </Text>
            </LinearGradient>

            {LEADERBOARD.map((item, index) => (
              <View key={item.name} style={styles.rankCard}>
                <View style={styles.rankNumber}>
                  <Text style={styles.rankNumberText}>{index + 1}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.rankName}>{item.name}</Text>
                  <Text style={styles.rankCountry}>
                    {item.country} • {item.streak} day streak
                  </Text>
                </View>

                <Text style={styles.rankPoints}>
                  {item.points}
                </Text>
              </View>
            ))}

            <TouchableOpacity style={styles.shareProgress} onPress={shareProgress}>
              <Share2 size={18} color="#FFFFFF" />

              <Text style={styles.shareProgressText}>
                Share My Progress
              </Text>
            </TouchableOpacity>
          </>
        )}

        {tab === 'resources' && (
          <>
            <LinearGradient colors={[GREEN, TEAL]} style={styles.rankHero}>
              <Library size={42} color="#FFFFFF" />
              <Text style={styles.rankTitle}>Arabic Resources</Text>
              <Text style={styles.rankText}>Books, audio, and materials uploaded by admins.</Text>
            </LinearGradient>
            {resourcesLoading && (
              <View style={{ padding: 30, alignItems: 'center' }}>
                <ActivityIndicator color={GREEN} />
              </View>
            )}
            {!resourcesLoading && resources.length === 0 && (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Library size={36} color="#C4B89A" />
                <Text style={{ color: '#6B6257', fontWeight: '800', marginTop: 10, textAlign: 'center' }}>No resources uploaded yet. Check back soon.</Text>
              </View>
            )}
            {resources.map(r => (
              <View key={r.id} style={styles.studentCard}>
                <View style={styles.studentAvatar}><Library size={22} color="#FFFFFF" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rankName}>{r.title}</Text>
                  <Text style={styles.rankCountry}>{r.type}</Text>
                  {r.description ? <Text style={styles.studentInterest}>{r.description}</Text> : null}
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'connect' && (
          <>
            <LinearGradient colors={[GREEN, TEAL]} style={styles.rankHero}>
              <Globe2 size={42} color="#FFFFFF" />

              <Text style={styles.rankTitle}>
                Connect with Learners
              </Text>

              <Text style={styles.rankText}>
                Find students from other countries for practice.
              </Text>
            </LinearGradient>

            {STUDENTS.map(item => (
              <View key={item.name} style={styles.studentCard}>
                <View style={styles.studentAvatar}>
                  <Users size={24} color="#FFFFFF" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.rankName}>{item.name}</Text>
                  <Text style={styles.rankCountry}>{item.country}</Text>
                  <Text style={styles.studentInterest}>{item.interest}</Text>
                </View>

                <TouchableOpacity
                  style={styles.connectBtn}
                  onPress={() =>
                    Alert.alert(
                      'Coming Soon',
                      'Real student chat needs login/backend. The design is ready for connection.'
                    )
                  }
                >
                  <MessageCircle size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        {[
          { key: 'path', icon: Home },
          { key: 'learn', icon: BookOpen },
          { key: 'quiz', icon: Trophy },
          { key: 'speak', icon: Mic },
          { key: 'ai', icon: Bot },
          { key: 'rank', icon: Award },
          { key: 'connect', icon: Users },
          { key: 'resources', icon: Library },
        ].map(item => {
          const Icon = item.icon;
          const active = tab === item.key;

          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, active && styles.navActive]}
              onPress={() => setTab(item.key as Tab)}
            >
              <Icon size={22} color={active ? GREEN : '#9A9A9A'} />
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: CREAM },

  loadingPage: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  loadingText: { marginTop: 12, color: GREEN, fontWeight: '900' },

  topBar: {
    height: 58,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statMini: { flexDirection: 'row', alignItems: 'center' },

  statMiniText: { marginLeft: 6, color: GREEN, fontSize: 16, fontWeight: '900' },

  blueStat: { marginLeft: 6, color: SKY, fontSize: 16, fontWeight: '900' },

  purpleStat: { marginLeft: 6, color: PURPLE, fontSize: 16, fontWeight: '900' },

  container: { flex: 1 },

  content: { paddingHorizontal: 20, paddingBottom: 105 },

  unitHeader: {
    minHeight: 118,
    borderRadius: 28,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.45)',
  },

  unitSmall: { color: '#E9FFF5', fontSize: 14, fontWeight: '900', marginBottom: 6 },

  unitTitle: { color: '#FFFFFF', fontSize: 23, fontWeight: '900' },

  unitSubtitle: { color: '#FDF7DC', fontSize: 12, fontWeight: '800', marginTop: 5 },

  mapArea: { alignItems: 'center', minHeight: 1600 },

  lessonRow: { width: '100%', alignItems: 'center', marginBottom: 28 },

  lessonLeft: { paddingRight: 105 },

  lessonRight: { paddingLeft: 105 },

  lessonCircle: {
    width: 78,
    height: 78,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 7,
    borderBottomColor: 'rgba(0,0,0,0.16)',
  },

  doneCircle: { backgroundColor: GOLD },

  activeCircle: { transform: [{ scale: 1.1 }], borderWidth: 5, borderColor: SOFT_GOLD },

  lessonTitle: {
    marginTop: 8,
    color: GREEN,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    width: 165,
  },

  lessonSub: {
    marginTop: 2,
    color: '#8A8172',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    width: 165,
  },

  jumpBubble: {
    backgroundColor: CARD,
    borderWidth: 2,
    borderColor: '#E5D9C3',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 8,
  },

  jumpText: { fontSize: 14, fontWeight: '900', color: GREEN },

  heroCard: {
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
  },

  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', marginTop: 10 },

  heroText: {
    color: '#E8FFF4',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 7,
    fontWeight: '700',
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  searchInput: { flex: 1, marginLeft: 9, color: '#333333', fontWeight: '700' },

  wordCard: {
    borderRadius: 24,
    padding: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  wordTop: { flexDirection: 'row', alignItems: 'center' },

  wordArabic: {
    color: GREEN,
    fontSize: 31,
    lineHeight: 44,
    fontWeight: '900',
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  wordTrans: { color: GOLD, fontSize: 13, fontWeight: '900', marginTop: 3 },

  wordEnglish: { color: '#4B4B4B', fontSize: 14, fontWeight: '800', marginTop: 6 },

  soundButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

  badge: {
    backgroundColor: MINT,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
    alignSelf: 'flex-start',
    marginTop: 12,
  },

  badgeText: { color: GREEN, fontSize: 11, fontWeight: '900' },

  sectionTitle: {
    color: GREEN,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 14,
    marginBottom: 12,
  },

  sentenceCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 12,
  },

  practiceButton: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginTop: 12,
  },

  practiceButtonText: { color: '#FFFFFF', fontWeight: '900', marginLeft: 7 },

  completeButton: {
    backgroundColor: GREEN,
    borderRadius: 20,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 14,
  },

  completeButtonText: { color: '#FFFFFF', fontWeight: '900', marginLeft: 8, fontSize: 15 },

  quizCard: {
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    alignItems: 'center',
  },

  quizTitle: { color: GREEN, fontSize: 24, fontWeight: '900', marginTop: 10 },

  quizCount: { color: GOLD, fontWeight: '900', marginTop: 7 },

  quizQuestion: {
    color: '#333333',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginVertical: 18,
    lineHeight: 25,
  },

  optionButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E5D9C3',
  },

  optionCorrect: { backgroundColor: MINT, borderColor: GREEN },

  optionWrong: { backgroundColor: '#FFE8E8', borderColor: '#8B1E1E' },

  optionText: { marginLeft: 10, color: '#333333', fontSize: 14, fontWeight: '900' },

  correctionBox: {
    width: '100%',
    backgroundColor: MINT,
    borderRadius: 16,
    padding: 13,
    marginTop: 6,
  },

  correctionTitle: { color: GREEN, fontWeight: '900', marginBottom: 4 },

  correctionText: { color: '#4B4B4B', fontWeight: '800' },

  nextButton: {
    backgroundColor: GREEN,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    marginTop: 15,
    alignItems: 'center',
  },

  nextButtonText: { color: '#FFFFFF', fontWeight: '900', marginLeft: 8 },

  speakCard: {
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  scoreBox: {
    backgroundColor: MINT,
    borderRadius: 16,
    padding: 11,
    marginTop: 11,
  },

  scoreText: { color: GREEN, fontWeight: '900' },

  scoreRemark: { color: '#4B4B4B', fontWeight: '700', marginTop: 4 },

  speakActions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 13 },

  listenBtn: {
    flexDirection: 'row',
    backgroundColor: GREEN,
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
  },

  recordingBtn: { backgroundColor: ROSE },

  listenText: { color: '#FFFFFF', fontWeight: '900', marginLeft: 6 },

  aiBubble: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
    maxWidth: '88%',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  aiUserBubble: { backgroundColor: GREEN, alignSelf: 'flex-end' },

  aiText: { color: '#333333', fontWeight: '700', lineHeight: 20 },

  aiUserText: { color: '#FFFFFF' },

  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  aiInput: { flex: 1, color: '#333333', fontWeight: '700' },

  aiSend: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },

  rankHero: {
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },

  rankTitle: { color: '#FFFFFF', fontSize: 23, fontWeight: '900', marginTop: 10 },

  rankText: {
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '700',
  },

  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 14,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  rankNumber: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: SOFT_GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  rankNumberText: { color: '#8B5E16', fontWeight: '900' },

  rankName: { color: GREEN, fontSize: 15, fontWeight: '900' },

  rankCountry: {
    color: '#777777',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },

  rankPoints: { color: GOLD, fontSize: 16, fontWeight: '900' },

  shareProgress: {
    backgroundColor: GREEN,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },

  shareProgressText: { color: '#FFFFFF', fontWeight: '900', marginLeft: 8 },

  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 14,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  studentInterest: { color: GOLD, fontSize: 12, fontWeight: '900', marginTop: 4 },

  connectBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomNav: {
    height: 78,
    borderTopWidth: 1,
    borderTopColor: '#E5D9C3',
    backgroundColor: CARD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },

  navItem: {
    width: 43,
    height: 43,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  navActive: {
    backgroundColor: MINT,
    borderWidth: 2,
    borderColor: GREEN,
  },
});