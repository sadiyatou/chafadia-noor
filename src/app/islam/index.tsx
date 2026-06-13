import React, { useEffect, useMemo, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Share,
  Dimensions,
} from 'react-native';
import type { ColorValue } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video, ResizeMode } from 'expo-av';

import {
  Search,
  BookOpen,
  Heart,
  HeartOff,
  PlayCircle,
  CheckCircle,
  X,
  Share2,
  Star,
  ShieldCheck,
  Eye,
  Sparkles,
  ListChecks,
  Clock,
  Flame,
  VideoIcon,
  Moon,
  HeartPulse,
  Plane,
  BadgeCheck,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const GREEN = '#064E3B';
const EMERALD = '#0D7054';
const GOLD = '#D4A017';
const CREAM = '#F7F5EE';
const CARD = '#FFFDF8';
const MINT = '#E6F1EC';
const SOFT_GOLD = '#F5E9C8';
const ROSE = '#9F2D2D';
const DARK = '#21372F';

const STORAGE_SAVED = 'ISLAMIC_ESSENTIALS_SAVED_V3';
const STORAGE_COMPLETED = 'ISLAMIC_ESSENTIALS_COMPLETED_V3';

const assets = {
  pillars: require('@/src/assets/images/5pillars-chafadia.jpeg'),
  adha: require('@/src/assets/images/adha-chafadia.jpeg'),
  hijjah: require('@/src/assets/images/dhul-hijjah chafadia.jpeg'),
  islam1: require('@/src/assets/images/islam-chafadia.jpeg'),
  islam2: require('@/src/assets/images/islam2-chafadia.jpeg'),
  janazah: require('@/src/assets/images/janazah-chafadia.jpeg'),
  salah: require('@/src/assets/images/salah-chafadia.jpeg'),
  salah2: require('@/src/assets/images/salah2-chafadia.jpeg'),
  sawm: require('@/src/assets/images/sawn-chafadia.jpeg'),
  wudu: require('@/src/assets/images/wudu-chafadia.jpeg'),
  zakat: require('@/src/assets/images/zakat-chafadia.jpeg'),
  essential1: require('@/src/assets/images/essentials1.jpeg'),
  ghusl1: require('@/src/assets/images/ghusl-chafadia.jpeg'),
  ghusl2: require('@/src/assets/images/ghusl2-chafadia.jpeg'),

  essential3: require('@/src/assets/sounds/essential3.mp4'),
  essential4: require('@/src/assets/sounds/essential4.mp4'),
  shroud: require('@/src/assets/sounds/shrouding-deceased.mp4'),

  // Hajj, Umrah, Adhkar and Women Guides
  tawaf: require('@/src/assets/images/tawaf.png'),
  sai: require('@/src/assets/images/sai.png'),
  morning: require('@/src/assets/images/morning-duas.png'),
  arafah: require('@/src/assets/images/arafah.png'),
  menstruation1: require('@/src/assets/images/menstraution1.jpeg'),
  menstruation2: require('@/src/assets/images/menstraution2.jpeg'),
  umrah1: require('@/src/assets/images/umrah-badal men.png'),
  umrah2: require('@/src/assets/images/umrah-badal women.png'),
  umrah3: require('@/src/assets/images/umrah-guide.png'),
  hadj2: require('@/src/assets/images/Hajj-Badal.png'),

  hajj: require('@/src/assets/images/hajj-chafadia.jpeg'),
};

type LessonType = 'image' | 'video';

type Lesson = {
  id: string;
  title: string;
  category: string;
  type: LessonType;
  media?: any;
  icon: string;
  level: string;
  duration: string;
  summary: string;
  points: string[];
  featured?: boolean;
  essential?: boolean;
};

const CATEGORIES = [
  'All',
  'Faith',
  'Purification',
  'Menstruation',
  'Salah',
  'Fasting',
  'Zakat',
  'Hajj & Umrah',
  'Death',
  'Eid',
  'Daily Life',
  'Videos',
  'Saved',
  'Completed',
];



const LESSONS: Lesson[] = [
  {
    id: 'pillars',
    title: '5 Pillars of Islam',
    category: 'Faith',
    type: 'image',
    media: assets.pillars,
    icon: '🕋',
    level: 'Essential',
    duration: '8 min',
    featured: true,
    essential: true,
    summary:
      'The foundation every Muslim must know: Shahadah, Salah, Zakat, Sawm and Hajj.',
    points: [
      'Shahadah is the foundation of Islam: worship Allah alone and follow Muhammad ﷺ.',
      'Salah connects the servant to Allah five times daily.',
      'Zakat purifies wealth and helps the needy.',
      'Sawm trains sincerity, patience and taqwa.',
      'Hajj is required once for those who are able.',
    ],
  },
  {
    id: 'wudu',
    title: 'How to Perform Wudu',
    category: 'Purification',
    type: 'image',
    media: assets.wudu,
    icon: '💧',
    level: 'Beginner',
    duration: '6 min',
    essential: true,
    summary: 'Learn the correct steps of wudu before salah.',
    points: [
      'Make intention in your heart.',
      'Say Bismillah.',
      'Wash hands, mouth, nose, face and arms.',
      'Wipe the head and ears.',
      'Wash both feet including ankles.',
      'Avoid wasting water.',
    ],
  },
  {
    id: 'ghusl-women',
    title: 'Ghusl for Women',
    category: 'Purification',
    type: 'image',
    media: assets.ghusl1,
    icon: '🚿',
    level: 'Important',
    duration: 'Guide',
    essential: true,
    summary:
      'A clear guide for women on performing ghusl after major impurity.',
    points: [
      'Make intention in the heart to purify yourself.',
      'Wash private areas properly.',
      'Perform wudu as you would for salah.',
      'Pour water over the head and body completely.',
      'Ensure water reaches hair roots and all parts of the body.',
      'Ghusl is required after menstruation, postpartum bleeding and major impurity.',
    ],
  },
  {
    id: 'ghusl-men',
    title: 'Ghusl for Men',
    category: 'Purification',
    type: 'image',
    media: assets.ghusl2,
    icon: '🚿',
    level: 'Important',
    duration: 'Guide',
    essential: true,
    summary:
      'A clear guide for men on performing ghusl after major impurity.',
    points: [
      'Make intention in the heart for purification.',
      'Wash private areas first.',
      'Perform wudu completely.',
      'Pour water over the head and whole body.',
      'Ensure no dry part remains.',
      'Ghusl is required after major impurity and before returning to salah.',
    ],
  },
  {
    id: 'salah-men',
    title: 'How to Perform Salah for Men',
    category: 'Salah',
    type: 'image',
    media: assets.salah,
    icon: '🤲',
    level: 'Essential',
    duration: '12 min',
    featured: true,
    essential: true,
    summary: 'Step-by-step salah guide for men.',
    points: [
      'Stand facing the Qibla.',
      'Make intention in the heart.',
      'Begin with Takbiratul Ihram.',
      'Recite Al-Fatihah and another surah.',
      'Perform ruku, sujood and tashahhud properly.',
      'End with salam to the right and left.',
    ],
  },
  {
    id: 'salah-women',
    title: 'How to Perform Salah for Women',
    category: 'Salah',
    type: 'image',
    media: assets.salah2,
    icon: '🌙',
    level: 'Essential',
    duration: '12 min',
    essential: true,
    summary: 'Step-by-step salah guide for women.',
    points: [
      'Ensure proper covering and purity.',
      'Face Qibla and make intention.',
      'Pray calmly with khushu.',
      'Follow the correct positions of prayer.',
      'Complete all pillars and obligations.',
    ],
  },
  {
    id: 'tawaf-step-by-step',
    title: 'Tawaf Step by Step',
    category: 'Hajj & Umrah',
    type: 'image',
    media: assets.tawaf,
    icon: '🕋',
    level: 'Essential',
    duration: '10 min',
    featured: true,
    essential: true,
    summary:
      'A clear step-by-step image guide for performing Tawaf around the Kaaba with calmness, dhikr and sincere dua.',
    points: [
      'Make intention in your heart before beginning Tawaf.',
      'Start from the Black Stone line if possible.',
      'Keep the Kaaba on your left side throughout Tawaf.',
      'Complete seven full circuits around the Kaaba.',
      'Remember Allah, make dua and avoid pushing or harming others.',
      'After Tawaf, pray two rakahs behind Maqam Ibrahim if possible, or anywhere in the Haram.',
      'Drink Zamzam and make sincere dua after completing Tawaf.',
    ],
  },
  {
    id: 'sai-step-by-step',
    title: 'Sa’i Step by Step',
    category: 'Hajj & Umrah',
    type: 'image',
    media: assets.sai,
    icon: '🏃',
    level: 'Essential',
    duration: '8 min',
    featured: true,
    essential: true,
    summary:
      'A practical step-by-step image guide for Sa’i between Safa and Marwah during Hajj or Umrah.',
    points: [
      'Begin Sa’i at Safa after completing Tawaf.',
      'Face the Kaaba, praise Allah and make dua.',
      'Walk from Safa to Marwah with remembrance and humility.',
      'Men may jog between the green markers where applicable.',
      'One trip from Safa to Marwah counts as one, and Marwah back to Safa counts as another.',
      'Complete seven trips in total.',
      'Finish Sa’i at Marwah and continue the next required ritual.',
    ],
  },
  {
    id: 'arafah-step-by-step',
    title: 'Arafah Step by Step',
    category: 'Hajj & Umrah',
    type: 'image',
    media: assets.arafah,
    icon: '🤲',
    level: 'Essential',
    duration: '12 min',
    featured: true,
    essential: true,
    summary:
      'A step-by-step guide for the Day of Arafah, the greatest pillar and most powerful day of Hajj.',
    points: [
      'Travel to Arafah on the 9th of Dhul Hijjah.',
      'Pray Dhuhr and Asr combined and shortened if following the Hajj arrangement.',
      'Spend the day in sincere dua, repentance, Quran and dhikr.',
      'Ask Allah for forgiveness, mercy, Jannah and protection from the Fire.',
      'Avoid wasting the day in unnecessary talking or distraction.',
      'Remain in Arafah until sunset.',
      'After sunset, proceed calmly to Muzdalifah.',
    ],
  },
  {
    id: 'umrah-step-by-step',
    title: 'Umrah Step by Step',
    category: 'Hajj & Umrah',
    type: 'image',
    media: assets.umrah1,
    icon: '🕋',
    level: 'Essential',
    duration: '15 min',
    featured: true,
    essential: true,
    summary:
      'A complete image guide for performing Umrah step by step from Ihram to completion.',
    points: [
      'Prepare yourself with ghusl, cleanliness and sincere repentance.',
      'Enter Ihram from the Miqat and make intention for Umrah.',
      'Recite the Talbiyah often: Labbayka Allahumma Labbayk.',
      'Arrive at the Haram and perform Tawaf around the Kaaba seven times.',
      'Pray two rakahs after Tawaf if possible.',
      'Perform Sa’i between Safa and Marwah seven trips.',
      'Men shave or shorten their hair; women trim a small portion.',
      'After this, Umrah is complete and Ihram restrictions end.',
    ],
  },
  {
    id: 'umrah-badal-women-step-by-step',
    title: 'Umrah Badal for Women Step by Step',
    category: 'Hajj & Umrah',
    type: 'image',
    media: assets.umrah2,
    icon: '🧕',
    level: 'Advanced',
    duration: 'Guide',
    essential: true,
    summary:
      'A step-by-step guide for a woman performing Umrah Badal on behalf of another person.',
    points: [
      'Ensure the person cannot perform Umrah due to death, illness or valid inability, and ask a scholar if unsure.',
      'Make intention clearly that this Umrah is on behalf of that person.',
      'Enter Ihram correctly from the Miqat.',
      'Perform Tawaf with humility and dua for the person.',
      'Perform Sa’i between Safa and Marwah.',
      'Trim a small portion of hair to complete Umrah.',
      'Make dua that Allah accepts it for the person and rewards both of you.',
    ],
  },
  {
    id: 'umrah-badal-men-step-by-step',
    title: 'Umrah Badal for Men Step by Step',
    category: 'Hajj & Umrah',
    type: 'image',
    media: assets.umrah3,
    icon: '👳',
    level: 'Advanced',
    duration: 'Guide',
    essential: true,
    summary:
      'A step-by-step guide for a man performing Umrah Badal on behalf of another person.',
    points: [
      'Confirm that Umrah Badal is Islamically valid for the person you are representing.',
      'Make intention for Umrah on behalf of that person before beginning.',
      'Enter Ihram from the Miqat and recite Talbiyah.',
      'Perform Tawaf around the Kaaba seven times.',
      'Pray two rakahs after Tawaf if possible.',
      'Perform Sa’i between Safa and Marwah.',
      'Shave or shorten the hair and make dua for acceptance.',
    ],
  },
  {
    id: 'hajj-badal-step-by-step',
    title: 'Hajj Badal Step by Step',
    category: 'Hajj & Umrah',
    type: 'image',
    media: assets.hadj2,
    icon: '🕋',
    level: 'Advanced',
    duration: '20 min',
    featured: true,
    essential: true,
    summary:
      'A step-by-step guide for performing Hajj Badal on behalf of someone who cannot perform Hajj themselves.',
    points: [
      'Hajj Badal should only be done when the Islamic conditions are met.',
      'The person performing Hajj Badal should have already completed their own obligatory Hajj.',
      'Make intention for Hajj on behalf of the person.',
      'Enter Ihram and perform the Hajj rites correctly.',
      'Stand at Arafah, spend the night at Muzdalifah and complete Mina rituals.',
      'Perform Tawaf Al-Ifadah and Sa’i according to the chosen Hajj type.',
      'Make dua throughout Hajj that Allah accepts it for the person.',
      'Ask a qualified scholar for personal cases and detailed rulings.',
    ],
  },
  {
    id: 'morning-azkar-image-guide',
    title: 'Morning Azkar',
    category: 'Daily Life',
    type: 'image',
    media: assets.morning,
    icon: '🌅',
    level: 'Daily',
    duration: '10 min',
    featured: true,
    essential: true,
    summary:
      'A beautiful morning Azkar image guide to begin the day with remembrance, protection and gratitude.',
    points: [
      'Read morning Azkar after Fajr or in the morning time.',
      'Begin the day with Tawheed, gratitude and reliance upon Allah.',
      'Recite Ayatul Kursi and the three Quls as part of your morning protection.',
      'Ask Allah for beneficial knowledge, pure provision and accepted deeds.',
      'Make dhikr slowly with presence of heart.',
      'Use morning Azkar to protect your heart before the day becomes busy.',
    ],
  },
  {
    id: 'menstruation-guide-one',
    title: 'Menstruation Guide for Women',
    category: 'Menstruation',
    type: 'image',
    media: assets.menstruation1,
    icon: '🌸',
    level: 'Important',
    duration: 'Guide',
    essential: true,
    summary:
      'A helpful guide for Muslim women on menstruation, worship, purity and returning to salah after purification.',
    points: [
      'During menstruation, a woman does not perform salah.',
      'Missed salah during menstruation is not made up later.',
      'Missed Ramadan fasts are made up after Ramadan.',
      'A woman can continue dhikr, dua, Islamic learning and listening to Quran.',
      'When menstruation ends, perform ghusl before resuming salah.',
      'Ask a qualified scholar if bleeding patterns are confusing or unusual.',
    ],
  },
  {
    id: 'menstruation-guide-two',
    title: 'Menstruation and Purification Guide',
    category: 'Menstruation',
    type: 'image',
    media: assets.menstruation2,
    icon: '🌷',
    level: 'Important',
    duration: 'Guide',
    essential: true,
    summary:
      'An additional women’s purification guide covering signs of purity, ghusl and returning to worship.',
    points: [
      'Learn the signs that menstruation has ended.',
      'Perform ghusl completely after purity is confirmed.',
      'Resume salah immediately after purification.',
      'Understand the difference between menstruation and irregular bleeding.',
      'Keep learning women’s purification rulings with reliable teachers.',
      'When unsure, seek guidance from a knowledgeable scholar or trusted teacher.',
    ],
  },
  {
  id: 'step-by-step-hajj',
  title: 'Step by Step Hajj Guide',
  category: 'Hajj & Umrah',
  type: 'image',
  media: assets.hajj,
  icon: '🕋',
  level: 'Essential',
  duration: '15 min',
  featured: true,
  essential: true,
  summary:
    'A complete beginner-friendly guide explaining the purpose, pillars, rituals and spiritual journey of Hajj step by step.',

  points: [
    'Hajj is the fifth pillar of Islam and is required once in a lifetime for Muslims who are physically and financially able.',

    'Before Hajj, sincerely repent to Allah, clear debts and learn the rulings of Hajj properly.',

    'Enter the state of Ihram from the Miqat and make the intention for Hajj.',

    'Wear the clothing of Ihram with humility, simplicity and remembrance of Allah.',

    'Recite the Talbiyah frequently: Labbayka Allahumma Labbayk.',

    'Arrive in Makkah and perform Tawaf around the Kaaba with calmness and sincerity.',

    'Pray two rak’ahs after Tawaf if possible.',

    'Perform Sa’i between Safa and Marwah remembering the struggle of Hajar.',

    'Travel to Mina on the 8th of Dhul Hijjah and spend the day in worship and preparation.',

    'On the Day of Arafah, stand in Arafah making sincere dua, repentance and remembrance of Allah.',

    'The Day of Arafah is the greatest day of Hajj and among the most powerful moments for dua.',

    'After sunset travel to Muzdalifah and collect pebbles for stoning.',

    'Pray Maghrib and Isha in Muzdalifah and spend the night remembering Allah.',

    'Return to Mina and stone Jamarat while saying Allahu Akbar.',

    'Offer the sacrificial animal if required.',

    'Men shave or shorten the hair while women shorten a small portion of hair.',

    'Perform Tawaf Al-Ifadah in Makkah after Mina rituals.',

    'Continue remembrance, takbir, dua and patience throughout the journey.',

    'Treat fellow pilgrims with mercy, patience and respect.',

    'Avoid arguments, sins and harming others during Hajj.',

    'Drink Zamzam and make sincere dua for dunya and akhirah.',

    'Use Hajj as a chance for total spiritual renewal and closeness to Allah.',

    'Before leaving Makkah, perform Tawaf Al-Wada (farewell tawaf).',

    'A sincere accepted Hajj can be a reason for complete forgiveness of sins.',

    'Continue obedience, salah and remembrance after returning home from Hajj.',
  ],
},
  {
    id: 'sawm',
    title: 'Fasting in Ramadan',
    category: 'Fasting',
    type: 'image',
    media: assets.sawm,
    icon: '🌙',
    level: 'Essential',
    duration: '8 min',
    essential: true,
    summary: 'Important rules and manners of fasting.',
    points: [
      'Fast from Fajr until Maghrib.',
      'Avoid food, drink and invalidators.',
      'Guard the tongue and actions.',
      'Increase Quran, dua and charity.',
      'Break fast with gratitude and dua.',
    ],
  },
  {
    id: 'zakat',
    title: 'Zakat Guidance',
    category: 'Zakat',
    type: 'image',
    media: assets.zakat,
    icon: '💰',
    level: 'Important',
    duration: '10 min',
    essential: true,
    summary: 'Understand the meaning and purpose of zakat.',
    points: [
      'Zakat purifies wealth and supports the needy.',
      'It becomes due when wealth reaches nisab and one lunar year passes.',
      'Common zakatable wealth includes cash, gold, silver and business goods.',
      'Ask a qualified scholar for exact calculations.',
    ],
  },
  {
    id: 'janazah',
    title: 'Janazah Prayer',
    category: 'Death',
    type: 'image',
    media: assets.janazah,
    icon: '🕊️',
    level: 'Essential',
    duration: '7 min',
    essential: true,
    summary: 'Learn the basics of janazah prayer.',
    points: [
      'Janazah prayer has no ruku or sujood.',
      'It is performed standing.',
      'There are multiple takbirs.',
      'Make dua for the deceased.',
      'It reminds us of the Hereafter.',
    ],
  },
  
  {
    id: 'washing-deceased-essential4',
    title: 'Washing and Shrouding the Deceased: Reminder',
    category: 'Death',
    type: 'video',
    media: assets.essential4,
    icon: '🕊️',
    level: 'Reminder',
    duration: 'Video',
    summary:
      'A reminder connected to death, preparation, washing and shrouding the deceased.',
    points: [
      'Death reminds us to repent sincerely.',
      'Families should learn janazah basics before they need them.',
      'Respect and gentleness are required with the deceased.',
    ],
  },
  {
    id: 'shrouding-deceased-video',
    title: 'Shrouding the Deceased',
    category: 'Death',
    type: 'video',
    media: assets.shroud,
    icon: '⚰️',
    level: 'Practical',
    duration: 'Video',
    essential: true,
    summary:
      'A focused lesson on shrouding the deceased with dignity and Islamic respect.',
    points: [
      'The shroud should be clean and simple.',
      'The deceased should be covered with dignity.',
      'The process should be calm, respectful and private.',
      'Seek scholar guidance for real-life situations.',
    ],
  },
  {
    id: 'female-deceased',
    title: 'How to Wash a Female Deceased',
    category: 'Death',
    type: 'image',
    media: assets.islam1,
    icon: '🕊️',
    level: 'Sensitive',
    duration: 'Guide',
    summary:
      'A respectful educational guide on washing a female deceased.',
    points: [
      'This should be done by knowledgeable women.',
      'Maintain privacy and dignity.',
      'Use clean water and follow Islamic washing rules.',
      'Handle the deceased with gentleness and respect.',
    ],
  },
  {
    id: 'male-deceased',
    title: 'How to Wash a Male Deceased',
    category: 'Death',
    type: 'image',
    media: assets.islam2,
    icon: '🕊️',
    level: 'Sensitive',
    duration: 'Guide',
    summary:
      'A respectful educational guide on washing a male deceased.',
    points: [
      'This should be done by knowledgeable men.',
      'Maintain dignity and privacy.',
      'Wash gently according to Islamic guidance.',
      'Prepare for shrouding and janazah prayer.',
    ],
  },
  {
    id: 'decomposition',
    title: 'Decomposition of the Human Body',
    category: 'Death',
    type: 'image',
    media: assets.essential1,
    icon: '⚰️',
    level: 'Awareness',
    duration: 'Reflection',
    summary:
      'A serious reminder about the temporary nature of worldly life.',
    points: [
      'Every soul shall taste death.',
      'This life is temporary.',
      'Prepare for the meeting with Allah.',
      'Increase repentance, prayer and good deeds.',
    ],
  },
  {
    id: 'adha',
    title: 'Eid Al-Adha',
    category: 'Eid',
    type: 'image',
    media: assets.adha,
    icon: '🐏',
    level: 'Seasonal',
    duration: '6 min',
    summary:
      'Learn about Eid Al-Adha and the spirit of sacrifice.',
    points: [
      'Eid Al-Adha reminds us of obedience to Allah.',
      'It is connected to Hajj and sacrifice.',
      'Share joy with family, neighbors and the needy.',
    ],
  },
  {
    id: 'hijjah',
    title: 'Dhul Hijjah',
    category: 'Eid',
    type: 'image',
    media: assets.hijjah,
    icon: '🕋',
    level: 'Seasonal',
    duration: '7 min',
    summary:
      'The first ten days of Dhul Hijjah are among the best days for worship.',
    points: [
      'Increase takbir, tahmid and tahlil.',
      'Fast if possible, especially the Day of Arafah.',
      'Give charity and do good deeds.',
      'Remember Allah abundantly.',
    ],
  },
];


function categoryIcon(category: string, color: string) {
  if (category === 'Faith') return <Sparkles size={15} color={color} />;
  if (category === 'Purification') return <ShieldCheck size={15} color={color} />;
  if (category === 'Menstruation') return <HeartPulse size={15} color={color} />;
  if (category === 'Salah') return <Moon size={15} color={color} />;
  if (category === 'Fasting') return <Moon size={15} color={color} />;
  if (category === 'Zakat') return <BadgeCheck size={15} color={color} />;
  if (category === 'Hajj & Umrah') return <Plane size={15} color={color} />;
  if (category === 'Death') return <HeartPulse size={15} color={color} />;
  if (category === 'Eid') return <Star size={15} color={color} />;
  if (category === 'Daily Life') return <ListChecks size={15} color={color} />;
  if (category === 'Videos') return <VideoIcon size={15} color={color} />;
  if (category === 'Saved') return <Heart size={15} color={color} />;
 
  return <BookOpen size={15} color={color} />;
}

type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];

function getCategoryColors(category: string): GradientColors {
  switch (category) {
    case 'Death':
      return ['#2F2F2F', '#064E3B'];


    case 'Salah':
      return ['#064E3B', '#0D7054'];

    case 'Purification':
      return ['#075985', '#0D7054'];

    case 'Menstruation':
      return ['#9F2D2D', '#7C2D4C'];


    case 'Daily Life':
      return ['#0F766E', '#064E3B'];

    case 'Faith':
      return ['#14532D', '#0D7054'];

    case 'Fasting':
      return ['#1E3A8A', '#0D7054'];

    case 'Zakat':
      return ['#7C2D12', '#0D7054'];

    case 'Hajj & Umrah':
      return ['#92400E', '#064E3B'];



    case 'Eid':
      return ['#92400E', '#065F46'];

    case 'Videos':
      return ['#111827', '#065F46'];

    default:
      return [GREEN, EMERALD];
  }
}

export default function IslamicEssentialsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [fullImage, setFullImage] = useState<any>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedItems = await AsyncStorage.getItem(STORAGE_SAVED);
      const completedItems = await AsyncStorage.getItem(STORAGE_COMPLETED);

      if (savedItems) setSaved(JSON.parse(savedItems));
      if (completedItems) setCompleted(JSON.parse(completedItems));
    } catch {}
  };

  const saveSaved = async (items: string[]) => {
    setSaved(items);
    await AsyncStorage.setItem(STORAGE_SAVED, JSON.stringify(items));
  };

  const saveCompleted = async (items: string[]) => {
    setCompleted(items);
    await AsyncStorage.setItem(STORAGE_COMPLETED, JSON.stringify(items));
  };

  const filtered = useMemo(() => {
    const search = query.toLowerCase();

    return LESSONS.filter(item => {
      const matchCategory =
        category === 'All' ||
        item.category === category ||
        (category === 'Videos' && item.type === 'video') ||
        (category === 'Saved' && saved.includes(item.id)) ||
        (category === 'Completed' && completed.includes(item.id));

      const matchSearch =
        item.title.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search) ||
        item.summary.toLowerCase().includes(search) ||
        item.points.join(' ').toLowerCase().includes(search);

      return matchCategory && matchSearch;
    });
  }, [query, category, saved, completed]);

  const featuredLessons = LESSONS.filter(item => item.featured).slice(0, 8);
  const essentialLessons = LESSONS.filter(item => item.essential);
  const videoLessons = LESSONS.filter(item => item.type === 'video');
  const spotlight = featuredLessons[0] || LESSONS[0];
  const progress = LESSONS.length ? Math.round((completed.length / LESSONS.length) * 100) : 0;

  const toggleSave = (id: string) => {
    const next = saved.includes(id)
      ? saved.filter(item => item !== id)
      : [...saved, id];

    saveSaved(next);
  };

  const toggleComplete = (id: string) => {
    const next = completed.includes(id)
      ? completed.filter(item => item !== id)
      : [...completed, id];

    saveCompleted(next);
  };

  const shareLesson = async (lesson: Lesson) => {
    await Share.share({
      message: `${lesson.title}\n\n${lesson.summary}\n\nKey Points:\n- ${lesson.points.join(
        '\n- '
      )}\n\nCHAFADIA NOOR Islamic Essentials`,
    });
  };

  const renderMediaPreview = (item: Lesson, compact = false) => {
    const colors = getCategoryColors(item.category);

    if (item.type === 'video') {
      return (
        <LinearGradient colors={colors} style={[styles.videoThumb, compact && styles.compactMedia]}>
          <View style={styles.mediaPatternOne} />
          <View style={styles.mediaPatternTwo} />

          <View style={styles.mediaTopRow}>
            <View style={styles.typePillDark}>
              <VideoIcon size={12} color="#FFFFFF" />
              <Text style={styles.typePillDarkText}>Video</Text>
            </View>

            <Text style={styles.mediaCategory}>{item.category}</Text>
          </View>

          <View style={styles.playOrb}>
            <PlayCircle size={compact ? 42 : 56} color="#FFFFFF" />
          </View>

          <Text style={styles.videoText}>{item.title}</Text>
          <Text style={styles.videoSubText}>Tap to watch lesson</Text>
        </LinearGradient>
      );
    }

    if (item.media) {
      return (
        <TouchableOpacity activeOpacity={0.95} onPress={() => setFullImage(item.media)}>
          <Image source={item.media} style={[styles.lessonImage, compact && styles.compactMedia]} />

          <LinearGradient colors={['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.55)']} style={styles.imageFade}>
            <View style={styles.mediaTopRow}>
              <View style={styles.typePillDark}>
                <Eye size={12} color="#FFFFFF" />
                <Text style={styles.typePillDarkText}>Image Guide</Text>
              </View>
              <Text style={styles.mediaCategory}>{item.category}</Text>
            </View>

            <View style={styles.imageBottomText}>
              <Text style={styles.imageTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.imageHint}>Tap image to view full</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <LinearGradient colors={colors} style={[styles.guideThumb, compact && styles.compactMedia]}>
        <View style={styles.mediaPatternOne} />
        <View style={styles.mediaPatternTwo} />
        <Text style={styles.guideIcon}>{item.icon}</Text>
        <Text style={styles.guideText}>Islamic Teaching</Text>
        <Text style={styles.guideSubText}>{item.category}</Text>
      </LinearGradient>
    );
  };

  const renderLessonCard = (item: Lesson, index: number) => {
    const isSaved = saved.includes(item.id);
    const isDone = completed.includes(item.id);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.lessonCard}
        activeOpacity={0.92}
        onPress={() => setSelected(item)}
      >
        {renderMediaPreview(item)}

        <View style={styles.lessonBody}>
          <View style={styles.lessonTop}>
            <View style={styles.lessonIconCircle}>
              <Text style={styles.lessonIcon}>{item.icon}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.lessonLabelRow}>
                <Text style={styles.lessonNumber}>Lesson {index + 1}</Text>
                {item.essential ? <Text style={styles.essentialText}>Essential</Text> : null}
              </View>

              <Text style={styles.lessonTitle}>{item.title}</Text>

              <Text style={styles.lessonMeta}>
                {item.category} • {item.level} • {item.duration}
              </Text>
            </View>

            <TouchableOpacity style={styles.heartButton} onPress={() => toggleSave(item.id)}>
              {isSaved ? (
                <HeartOff size={20} color={ROSE} />
              ) : (
                <Heart size={20} color={GREEN} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.lessonSummary}>{item.summary}</Text>

          <View style={styles.badgeRow}>
            {item.essential ? (
              <View style={styles.smallBadge}>
                <BadgeCheck size={12} color={GREEN} />
                <Text style={styles.smallBadgeText}>Essential</Text>
              </View>
            ) : null}

            {item.type === 'video' ? (
              <View style={styles.smallBadge}>
                <VideoIcon size={12} color={GREEN} />
                <Text style={styles.smallBadgeText}>Video</Text>
              </View>
            ) : null}

            <View style={styles.smallBadge}>
              <Clock size={12} color={GREEN} />
              <Text style={styles.smallBadgeText}>{item.duration}</Text>
            </View>
          </View>

          <View style={styles.lessonActions}>
            <TouchableOpacity
              style={[styles.actionBtn, isDone && styles.doneBtn]}
              onPress={() => toggleComplete(item.id)}
            >
              <CheckCircle size={16} color="#FFFFFF" />
              <Text style={styles.actionText}>{isDone ? 'Completed' : 'Mark Done'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.softBtn} onPress={() => shareLesson(item)}>
              <Share2 size={16} color={GREEN} />
              <Text style={styles.softText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[GREEN, EMERALD, '#0B7A5B']} style={styles.hero}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.heroTop}>
            <View style={styles.heroBadge}>
              <BookOpen size={15} color={GOLD} />
              <Text style={styles.heroBadgeText}>CHAFADIA NOOR</Text>
            </View>

            <View style={styles.heroRoundIcon}>
              <Sparkles size={20} color={GOLD} />
            </View>
          </View>

          <Text style={styles.heroTitle}>Islamic Essentials</Text>

          <Text style={styles.heroText}>
            A beautiful learning space for faith, purification, salah, fasting,
            zakat, Hajj, Umrah, janazah, marriage, Quran, manners and daily reminders.
          </Text>


          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>{LESSONS.length}</Text>
              <Text style={styles.heroStatLabel}>Lessons</Text>
            </View>

            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>{videoLessons.length}</Text>
              <Text style={styles.heroStatLabel}>Videos</Text>
            </View>

            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>{essentialLessons.length}</Text>
              <Text style={styles.heroStatLabel}>Essentials</Text>
            </View>

            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>{completed.length}</Text>
              <Text style={styles.heroStatLabel}>Done</Text>
            </View>
          </View>
        </LinearGradient>

        <LinearGradient colors={[CARD, '#F7F0DC']} style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.progressTitle}>Your Learning Progress</Text>
              <Text style={styles.progressText}>
                Complete the essentials step by step and build confidence in your deen.
              </Text>
            </View>

            <View style={styles.progressCircle}>
              <Text style={styles.progressPercent}>{progress}%</Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <LinearGradient colors={[GOLD, '#F3C95E']} style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </LinearGradient>

        <View style={styles.searchBox}>
          <Search size={18} color={GREEN} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#8A8172"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {CATEGORIES.map(cat => {
            const active = category === cat;

            return (
              <TouchableOpacity
                key={cat}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setCategory(cat)}
              >
                {categoryIcon(cat, active ? '#FFFFFF' : GREEN)}
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>


        <LinearGradient colors={[CARD, '#F7F0DC']} style={styles.guidanceCard}>
          <View style={styles.guidanceIconWrap}>
            <ShieldCheck size={24} color={GOLD} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.guidanceTitle}>Start With What Matters Most</Text>
            <Text style={styles.guidanceText}>
              Begin with Tawheed, pillars of Islam, purification, wudu, ghusl and salah.
              Then grow through Quran, fasting, zakat, Hajj, Umrah, manners, marriage, family life and preparation for the Hereafter.
            </Text>
          </View>
        </LinearGradient>

        

        

        {category === 'All' && (
          <>
            <View style={styles.sectionRow}>
              <View style={styles.sectionIconCircle}>
                <Flame size={19} color={GOLD} />
              </View>
              <Text style={styles.sectionTitle}>Featured Essentials</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
              {featuredLessons.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.featuredCard}
                  activeOpacity={0.9}
                  onPress={() => setSelected(item)}
                >
                  <LinearGradient colors={getCategoryColors(item.category)} style={styles.featuredTop}>
                    <Text style={styles.featuredIcon}>{item.icon}</Text>
                    {item.type === 'video' ? <PlayCircle size={24} color="#FFFFFF" /> : null}
                  </LinearGradient>

                  <Text style={styles.featuredTitle} numberOfLines={2}>
                    {item.title}
                  </Text>

                  <Text style={styles.featuredMeta}>
                    {item.category} • {item.type === 'video' ? 'Video' : item.level}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <View style={styles.sectionRow}>
          <View style={styles.sectionIconCircle}>
            <BookOpen size={19} color={GOLD} />
          </View>
          <Text style={styles.sectionTitle}>
            {category === 'All' ? 'Essential Lessons' : `${category} Lessons`}
          </Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Sparkles size={28} color={GOLD} />
            <Text style={styles.emptyTitle}>No lesson found</Text>
            <Text style={styles.emptyText}>
              Try searching another Islamic topic or choose another category.
            </Text>
          </View>
        ) : (
          filtered.map((item, index) => renderLessonCard(item, index))
        )}
      </ScrollView>

      <Modal visible={!!selected} animationType="slide">
        {selected && (
          <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                  <X size={22} color={GREEN} />
                </TouchableOpacity>

                <Text style={styles.modalHeaderTitle}>Lesson Details</Text>

                <TouchableOpacity style={styles.closeBtn} onPress={() => toggleSave(selected.id)}>
                  {saved.includes(selected.id) ? (
                    <HeartOff size={22} color={ROSE} />
                  ) : (
                    <Heart size={22} color={GREEN} />
                  )}
                </TouchableOpacity>
              </View>

              <LinearGradient colors={getCategoryColors(selected.category)} style={styles.modalHero}>
                <View style={styles.modalPatternOne} />
                <View style={styles.modalPatternTwo} />
                <Text style={styles.modalIcon}>{selected.icon}</Text>
                <Text style={styles.modalTitle}>{selected.title}</Text>
                <Text style={styles.modalMeta}>
                  {selected.category} • {selected.level} • {selected.duration}
                </Text>
              </LinearGradient>

              {selected.type === 'video' ? (
                <Video
                  source={selected.media}
                  style={styles.video}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  shouldPlay={false}
                />
              ) : selected.media ? (
                <TouchableOpacity activeOpacity={0.95} onPress={() => setFullImage(selected.media)}>
                  <Image source={selected.media} style={styles.modalImage} />
                  <View style={styles.fullImageHint}>
                    <Eye size={16} color="#FFFFFF" />
                    <Text style={styles.fullImageHintText}>Tap image to view full size</Text>
                  </View>
                </TouchableOpacity>
              ) : null}

              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>What You Will Learn</Text>
                <Text style={styles.detailSummary}>{selected.summary}</Text>

                {selected.points.map((point, index) => (
                  <View key={index} style={styles.pointRow}>
                    <View style={styles.pointIcon}>
                      <Star size={13} color="#FFFFFF" />
                    </View>
                    <Text style={styles.pointText}>{point}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.completeLargeBtn}
                  onPress={() => toggleComplete(selected.id)}
                >
                  <CheckCircle size={18} color="#FFFFFF" />
                  <Text style={styles.completeLargeText}>
                    {completed.includes(selected.id)
                      ? 'Completed'
                      : 'Mark This Lesson as Completed'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareLargeBtn} onPress={() => shareLesson(selected)}>
                  <Share2 size={18} color={GREEN} />
                  <Text style={styles.shareLargeText}>Share Lesson</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal visible={!!fullImage} transparent animationType="fade">
        <View style={styles.fullImageModal}>
          <TouchableOpacity style={styles.fullImageClose} onPress={() => setFullImage(null)}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.zoomHint}>Pinch to zoom • Move image to inspect details</Text>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.zoomContainer}
            maximumZoomScale={5}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            centerContent
          >
            {fullImage && <Image source={fullImage} style={styles.fullImage} resizeMode="contain" />}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: CREAM,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 34,
  },

  hero: {
    borderRadius: 28,
    padding: 18,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: GREEN,
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  heroGlowOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 120,
    backgroundColor: 'rgba(212,160,23,0.18)',
    top: -70,
    right: -55,
  },

  heroGlowTwo: {
    position: 'absolute',
    width: 145,
    height: 145,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.10)',
    bottom: -70,
    left: -50,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 999,
  },

  heroBadgeText: {
    color: GOLD,
    fontWeight: '900',
    marginLeft: 7,
    fontSize: 11,
    letterSpacing: 0.8,
  },

  heroRoundIcon: {
    width: 43,
    height: 43,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  heroText: {
    color: '#E6FFF4',
    fontSize: 12.4,
    lineHeight: 19,
    marginTop: 8,
    fontWeight: '700',
  },

  heroSpotlight: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 22,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  spotlightIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  spotlightEmoji: {
    fontSize: 25,
  },

  spotlightLabel: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },

  spotlightTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },

  spotlightSub: {
    color: '#DDF7EF',
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 2,
  },

  heroStats: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 13,
  },

  heroStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 15,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
  },

  heroStatNumber: {
    color: GOLD,
    fontSize: 18,
    fontWeight: '900',
  },

  heroStatLabel: {
    color: '#FFFFFF',
    fontSize: 9.7,
    fontWeight: '800',
    marginTop: 3,
  },

  progressCard: {
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 14,
    shadowColor: GREEN,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressTitle: {
    color: GREEN,
    fontSize: 16,
    fontWeight: '900',
  },

  progressText: {
    color: '#6A6257',
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 3,
    fontWeight: '700',
  },

  progressCircle: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: SOFT_GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

  progressPercent: {
    color: GOLD,
    fontSize: 20,
    fontWeight: '900',
  },

  progressBar: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#E2D7BE',
    marginTop: 13,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
  },

  searchBox: {
    backgroundColor: CARD,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 13,
    shadowColor: GREEN,
    shadowOpacity: 0.05,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    color: GREEN,
    fontWeight: '800',
  },

  tabs: {
    marginBottom: 15,
  },

  tab: {
    backgroundColor: CARD,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    flexDirection: 'row',
    alignItems: 'center',
  },

  tabActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
    shadowColor: GREEN,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  tabText: {
    color: GREEN,
    fontWeight: '900',
    fontSize: 11,
    marginLeft: 6,
  },

  tabTextActive: {
    color: '#FFFFFF',
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  quickCard: {
    width: '48.5%',
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 9,
    shadowColor: GREEN,
    shadowOpacity: 0.05,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  quickTitle: {
    color: GREEN,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 8,
  },

  quickText: {
    color: '#7A7164',
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 3,
  },

  guidanceCard: {
    borderRadius: 20,
    padding: 13,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 14,
    shadowColor: GREEN,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  guidanceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: SOFT_GOLD,
    justifyContent: 'center',
    alignItems: 'center',
  },

  guidanceTitle: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '900',
  },

  guidanceText: {
    color: '#4A443A',
    fontSize: 11.3,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 4,
  },

  pathCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 14,
    shadowColor: GREEN,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },


  dailyHeaderCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownContent: {
    marginTop: 8,
  },

  dropdownIconBox: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: MINT,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  dropdownIconOpen: {
    transform: [{ rotate: '180deg' }],
  },

  pathRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },

  pathLineWrap: {
    alignItems: 'center',
    marginRight: 10,
  },

  pathNumber: {
    width: 27,
    height: 27,
    borderRadius: 999,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pathNumberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  pathLine: {
    width: 2,
    height: 20,
    backgroundColor: '#D8CCB7',
    marginTop: 4,
  },

  pathText: {
    flex: 1,
    color: DARK,
    fontSize: 12.6,
    lineHeight: 19,
    fontWeight: '700',
    paddingTop: 4,
  },

  dailyCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 16,
    shadowColor: GREEN,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  dailyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  sectionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 15,
    backgroundColor: SOFT_GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  dailyTitle: {
    color: GREEN,
    fontSize: 15,
    fontWeight: '900',
  },

  dailySubTitle: {
    color: '#7A7164',
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 2,
  },

  dailyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },

  checkDot: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  dailyText: {
    flex: 1,
    color: '#3D3A33',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    paddingTop: 2,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
    marginTop: 2,
  },

  sectionTitle: {
    color: GREEN,
    fontSize: 19,
    fontWeight: '900',
  },

  featuredScroll: {
    marginBottom: 16,
  },

  featuredCard: {
    width: 146,
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 9,
    marginRight: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    shadowColor: GREEN,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  featuredTop: {
    height: 74,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },

  featuredIcon: {
    fontSize: 30,
  },

  featuredTitle: {
    color: GREEN,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    marginTop: 10,
  },

  featuredMeta: {
    color: '#7A7164',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 7,
  },

  emptyCard: {
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  emptyTitle: {
    color: GREEN,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 9,
  },

  emptyText: {
    color: '#6A6257',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 5,
    fontWeight: '700',
  },

  lessonCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    shadowColor: GREEN,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  lessonImage: {
    width: '100%',
    height: 178,
  },

  compactMedia: {
    height: 165,
  },

  imageFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: 12,
    justifyContent: 'space-between',
  },

  imageBottomText: {
    alignSelf: 'stretch',
  },

  imageTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  imageHint: {
    color: '#F4F8F5',
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 3,
  },

  videoThumb: {
    height: 178,
    padding: 13,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  mediaPatternOne: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: -40,
    right: -30,
  },

  mediaPatternTwo: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 80,
    backgroundColor: 'rgba(212,160,23,0.18)',
    bottom: -35,
    left: -25,
  },

  mediaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  typePillDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  typePillDarkText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 5,
  },

  mediaCategory: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },

  playOrb: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    width: 72,
    height: 72,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },

  videoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
    textAlign: 'center',
  },

  videoSubText: {
    color: '#E6FFF4',
    fontWeight: '800',
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
  },

  guideThumb: {
    height: 178,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  guideIcon: {
    fontSize: 50,
  },

  guideText: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: 8,
    fontSize: 15,
  },

  guideSubText: {
    color: '#E6FFF4',
    fontWeight: '800',
    fontSize: 11,
    marginTop: 4,
  },

  lessonBody: {
    padding: 16,
  },

  lessonTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  lessonIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  lessonIcon: {
    fontSize: 25,
  },

  lessonLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },

  lessonNumber: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '900',
    marginRight: 7,
    textTransform: 'uppercase',
  },

  essentialText: {
    color: GREEN,
    fontSize: 9.5,
    fontWeight: '900',
    backgroundColor: MINT,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },

  lessonTitle: {
    color: GREEN,
    fontSize: 18,
    fontWeight: '900',
  },

  lessonMeta: {
    color: '#8A8172',
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 3,
  },

  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: '#F7F2E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  lessonSummary: {
    color: '#3D3A33',
    fontSize: 12.6,
    lineHeight: 19,
    fontWeight: '700',
    marginTop: 12,
  },

  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 12,
  },

  smallBadge: {
    backgroundColor: MINT,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  smallBadgeText: {
    color: GREEN,
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 5,
  },

  lessonActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },

  actionBtn: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  doneBtn: {
    backgroundColor: GOLD,
  },

  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  softBtn: {
    backgroundColor: MINT,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  softText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  modalHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  closeBtn: {
    width: 43,
    height: 43,
    borderRadius: 16,
    backgroundColor: CARD,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  modalHeaderTitle: {
    color: GREEN,
    fontSize: 17,
    fontWeight: '900',
  },

  modalHero: {
    borderRadius: 30,
    padding: 22,
    alignItems: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },

  modalPatternOne: {
    position: 'absolute',
    width: 145,
    height: 145,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: -55,
    right: -40,
  },

  modalPatternTwo: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 90,
    backgroundColor: 'rgba(212,160,23,0.18)',
    bottom: -45,
    left: -35,
  },

  modalIcon: {
    fontSize: 44,
  },

  modalTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
  },

  modalMeta: {
    color: '#E6FFF4',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 6,
  },

  modalImage: {
    width: '100%',
    height: 280,
    borderRadius: 26,
    marginBottom: 14,
  },

  fullImageHint: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  fullImageHintText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '900',
    fontSize: 11,
  },

  video: {
    width: '100%',
    height: 280,
    backgroundColor: '#000',
    borderRadius: 26,
    marginBottom: 14,
  },

  detailCard: {
    backgroundColor: CARD,
    borderRadius: 27,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    shadowColor: GREEN,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  detailTitle: {
    color: GREEN,
    fontSize: 19,
    fontWeight: '900',
  },

  detailSummary: {
    color: '#3D3A33',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
    marginTop: 7,
    marginBottom: 14,
  },

  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  pointIcon: {
    width: 25,
    height: 25,
    borderRadius: 999,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
    marginTop: 1,
  },

  pointText: {
    flex: 1,
    color: '#3D3A33',
    fontSize: 12.8,
    lineHeight: 20,
    fontWeight: '700',
  },

  completeLargeBtn: {
    backgroundColor: GREEN,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 12,
  },

  completeLargeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginLeft: 7,
  },

  shareLargeBtn: {
    backgroundColor: MINT,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 9,
  },

  shareLargeText: {
    color: GREEN,
    fontWeight: '900',
    marginLeft: 7,
  },

  fullImageModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
  },

  fullImageClose: {
    position: 'absolute',
    top: 45,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    width: 45,
    height: 45,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },

  zoomHint: {
    position: 'absolute',
    top: 95,
    alignSelf: 'center',
    color: '#FFFFFF',
    zIndex: 10,
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },

  zoomContainer: {
    minWidth: width,
    minHeight: height,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullImage: {
    width,
    height: height * 0.86,
  },
});