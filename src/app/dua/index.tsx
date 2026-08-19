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
  Vibration,
  Switch,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Notifications from '../../utils/safeNotifications';
import * as Speech from 'expo-speech';

import {
  Search,
  Heart,
  HeartOff,
  Share2,
  Sparkles,
  Moon,
  Sun,
  BookOpen,
  Shield,
  Home,
  Plane,
  HeartPulse,
  Utensils,
  CloudRain,
  HandHeart,
  RotateCcw,
  Plus,
  Minus,
  Star,
  Clock,
  CheckCircle,
  Filter,
  Volume2,
  PauseCircle,
  ArrowLeft,
  PlayCircle,
  StopCircle,
  Save,
} from 'lucide-react-native';

type RoutineType = 'morning' | 'evening' | 'reminder';

type DuaItem = {
  id: string;
  title: string;
  category: string;
  arabic: string;
  transliteration: string;
  translation: string;
  when: string;
  repeat: number;
  note: string;
  source?: string;
};

const GREEN = '#064E3B';
const EMERALD = '#0D7054';
const GOLD = '#D4A017';
const CREAM = '#F7F5EE';
const CARD = '#FFFDF8';
const MINT = '#E6F1EC';
const SOFT_GOLD = '#F5E9C8';
const ROSE = '#9F2D2D';
const DARK = '#20372F';

const STORAGE_FAVORITES = 'CHAFADIA_AZKAR_FAVORITES_FULL_V10';
const STORAGE_COUNTERS = 'CHAFADIA_AZKAR_COUNTERS_FULL_V10';
const STORAGE_REMINDERS = 'CHAFADIA_AZKAR_REMINDERS_FULL_V10';
const STORAGE_SAVED_ROUTINES = 'CHAFADIA_AZKAR_SAVED_ROUTINES_FULL_V10';
const STORAGE_RECITER = 'CHAFADIA_AZKAR_SELECTED_RECITER_FULL_V10';

const RECITERS = [
  'Sheikh Mishary Rashid Alafasy style',
  'Sheikh Abdul Rahman Al-Sudais style',
  'Sheikh Maher Al-Muaiqly style',
  'Sheikh Saad Al-Ghamdi style',
];

const MUSHAF_DUA_IDS = [
  'surah-fatihah',
  'ayatul-kursi',
  'surah-ikhlas',
  'surah-falaq',
  'surah-nas',
];

const isMushafDua = (dua: DuaItem) => MUSHAF_DUA_IDS.includes(dua.id);


const MUSHAF_AYAHS: Record<string, string[]> = {
  'surah-fatihah': [
    'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    'الرَّحْمَٰنِ الرَّحِيمِ',
    'مَالِكِ يَوْمِ الدِّينِ',
    'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
  ],
  'ayatul-kursi': [
    'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
  ],
  'surah-ikhlas': [
    'قُلْ هُوَ اللَّهُ أَحَدٌ',
    'اللَّهُ الصَّمَدُ',
    'لَمْ يَلِدْ وَلَمْ يُولَدْ',
    'وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',
  ],
  'surah-falaq': [
    'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
    'مِن شَرِّ مَا خَلَقَ',
    'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
    'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
    'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
  ],
  'surah-nas': [
    'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    'مَلِكِ النَّاسِ',
    'إِلَٰهِ النَّاسِ',
    'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
    'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
    'مِنَ الْجِنَّةِ وَالنَّاسِ',
  ],
};

const ARABIC_AYAH_NUMBERS = [
  '١',
  '٢',
  '٣',
  '٤',
  '٥',
  '٦',
  '٧',
];

const getMushafAyahNumber = (duaId: string, index: number) => {
  if (duaId === 'ayatul-kursi') return '٢٥٥';
  return ARABIC_AYAH_NUMBERS[index] || String(index + 1);
};

const shouldShowMushafBismillah = (duaId: string) => {
  return duaId === 'surah-ikhlas' || duaId === 'surah-falaq' || duaId === 'surah-nas';
};

const getMushafText = (dua: DuaItem) => {
  const ayahs = MUSHAF_AYAHS[dua.id];

  if (!ayahs) return dua.arabic;

  return ayahs
    .map((ayah, index) => `${ayah} ﴿${getMushafAyahNumber(dua.id, index)}﴾`)
    .join(' ');
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

const CORE_DUAS: DuaItem[] = [
  {
    id: 'surah-fatihah',
    title: 'Surah Al-Fatihah',
    category: 'Morning & Evening',
    arabic:
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ\ الرَّحْمَٰنِ الرَّحِيمِ\ مَالِكِ يَوْمِ الدِّينِ\ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ\ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ\ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    transliteration:
      'Bismillahir Rahmanir Raheem. Alhamdu lillahi Rabbil alamin. Ar-Rahmanir Raheem. Maliki yawmid-deen. Iyyaka na’budu wa iyyaka nasta’een. Ihdinas-siratal-mustaqeem. Siratal-ladhina an’amta alayhim ghayril-maghdubi alayhim wa lad-dalleen.',
    translation:
      'In the name of Allah, the Most Merciful, the Especially Merciful. All praise is for Allah, Lord of all worlds, the Most Merciful, the Especially Merciful, Master of the Day of Judgment. You alone we worship and You alone we ask for help. Guide us to the straight path, the path of those You have blessed, not of those who earned anger and not of those who went astray.',
    when: 'Morning, evening, salah and any time',
    repeat: 1,
    note: 'The opening chapter of the Qur’an.',
    source: "Qur'an 1",
  },
  {
    id: 'ayatul-kursi',
    title: 'Ayatul Kursi',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration:
      'Allahu la ilaha illa Huwa, Al-Hayyul-Qayyum. La ta’khudhuhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa’u indahu illa bi idhnih. Ya’lamu ma bayna aydihim wa ma khalfahum. Wa la yuhituna bi shay’im-min ilmihi illa bima sha’. Wasi’a kursiyyuhus-samawati wal-ard. Wa la ya’uduhu hifdhuhuma wa Huwal-Aliyyul-Adheem.',
    translation:
      'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness nor sleep overtakes Him. To Him belongs whatever is in the heavens and whatever is on the earth. Who can intercede with Him except by His permission? He knows what is before them and what is behind them, and they encompass nothing of His knowledge except what He wills. His Kursi extends over the heavens and the earth, and preserving them does not tire Him. He is the Most High, the Most Great.',
    when: 'Morning, evening, after salah and before sleep',
    repeat: 1,
    note: 'A powerful protection verse.',
    source: "Qur'an 2:255",
  },
  {
    id: 'surah-ikhlas',
    title: 'Surah Al-Ikhlas',
    category: 'Morning & Evening',
    arabic:
      'قُلْ هُوَ اللَّهُ أَحَدٌ\ اللَّهُ الصَّمَدُ\ لَمْ يَلِدْ وَلَمْ يُولَدْ\ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',
    transliteration:
      'Qul huwa Allahu ahad. Allahus-samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad.',
    translation:
      'Say: He is Allah, One. Allah is the Eternal Refuge. He neither begets nor is born, and there is none comparable to Him.',
    when: 'Morning, evening and before sleep',
    repeat: 3,
    note: 'Recite three times for protection.',
    source: "Qur'an 112",
  },
  {
    id: 'surah-falaq',
    title: 'Surah Al-Falaq',
    category: 'Morning & Evening',
    arabic:
      'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ\ مِن شَرِّ مَا خَلَقَ\ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ\ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ\ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    transliteration:
      'Qul a’udhu bi Rabbil-falaq. Min sharri ma khalaq. Wa min sharri ghasiqin idha waqab. Wa min sharrin-naffathati fil-uqad. Wa min sharri hasidin idha hasad.',
    translation:
      'Say: I seek refuge in the Lord of daybreak from the evil of what He created, from the evil of darkness when it settles, from the evil of those who blow into knots, and from the evil of an envier when he envies.',
    when: 'Morning, evening and before sleep',
    repeat: 3,
    note: 'Protection from harm and envy.',
    source: "Qur'an 113",
  },
  {
    id: 'surah-nas',
    title: 'Surah An-Nas',
    category: 'Morning & Evening',
    arabic:
      'قُلْ أَعُوذُ بِرَبِّ النَّاسِ\ مَلِكِ النَّاسِ\ إِلَٰهِ النَّاسِ\ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ\ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ\ مِنَ الْجِنَّةِ وَالنَّاسِ',
    transliteration:
      'Qul a’udhu bi Rabbin-nas. Malikin-nas. Ilahin-nas. Min sharril-waswasil-khannas. Alladhi yuwaswisu fi sudurin-nas. Minal-jinnati wan-nas.',
    translation:
      'Say: I seek refuge in the Lord of mankind, the King of mankind, the God of mankind, from the evil of the retreating whisperer who whispers into the hearts of mankind, from among jinn and mankind.',
    when: 'Morning, evening and before sleep',
    repeat: 3,
    note: 'Protection from whispers and evil.',
    source: "Qur'an 114",
  },
  {
    id: 'wake-up',
    title: 'Upon Waking Up',
    category: 'Morning & Evening',
    arabic:
      'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration:
      "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
    translation:
      'All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.',
    when: 'When waking up',
    repeat: 1,
    note: 'Begin your day with gratitude.',
    source: 'Bukhari',
  },
  {
    id: 'morning-remembrance',
    title: 'Morning Remembrance',
    category: 'Morning & Evening',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ',
    transliteration: 'Asbahna wa asbaha al-mulku lillah',
    translation:
      'We have reached the morning, and at this time sovereignty belongs to Allah.',
    when: 'Morning after Fajr',
    repeat: 1,
    note: 'Best after Fajr until sunrise.',
  },
  {
    id: 'evening-remembrance',
    title: 'Evening Remembrance',
    category: 'Morning & Evening',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ',
    transliteration: 'Amsayna wa amsa al-mulku lillah',
    translation:
      'We have reached the evening, and at this time sovereignty belongs to Allah.',
    when: 'Evening after Asr or Maghrib',
    repeat: 1,
    note: 'Best in the evening.',
  },
  {
    id: 'sayyidul-istighfar',
    title: 'Sayyidul Istighfar',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration:
      'Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana abduk, wa ana ala ahdika wa wa’dika mastata’t, a’udhu bika min sharri ma sana’t, abu’u laka bini’matika alayya wa abu’u bidhanbi, faghfir li fa innahu la yaghfirudh-dhunuba illa anta.',
    translation:
      'O Allah, You are my Lord. None has the right to be worshipped except You. You created me and I am Your servant. I remain upon Your covenant and promise as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge Your blessing upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.',
    when: 'Morning and evening',
    repeat: 1,
    note: 'The master dua for forgiveness.',
    source: 'Bukhari',
  },
  {
    id: 'raditu-billah',
    title: 'I Am Pleased with Allah',
    category: 'Morning & Evening',
    arabic:
      'رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
    transliteration:
      'Raditu billahi Rabba, wa bil-Islami deena, wa bi Muhammadin ﷺ Nabiyya',
    translation:
      'I am pleased with Allah as my Lord, Islam as my religion, and Muhammad ﷺ as my Prophet.',
    when: 'Morning and evening',
    repeat: 3,
    note: 'A beautiful daily renewal of faith.',
  },
  {
    id: 'hasbiyallah-seven',
    title: 'Allah Is Sufficient',
    category: 'Morning & Evening',
    arabic:
      'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    transliteration:
      'HasbiyAllahu la ilaha illa Huwa, alayhi tawakkaltu wa Huwa Rabbul Arshil Azim',
    translation:
      'Allah is sufficient for me. There is no deity except Him. Upon Him I rely, and He is the Lord of the Great Throne.',
    when: 'Morning and evening',
    repeat: 7,
    note: 'For reliance upon Allah.',
  },
  {
    id: 'bismillah-protection',
    title: 'Protection from Harm',
    category: 'Morning & Evening',
    arabic:
      'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration:
      'Bismillahil-ladhi la yadurru ma’asmihi shay’un fil-ardi wa la fis-sama’i wa Huwas-Sami’ul-Alim',
    translation:
      'In the name of Allah, with whose name nothing can harm in the earth or in the sky, and He is the All-Hearing, the All-Knowing.',
    when: 'Morning and evening',
    repeat: 3,
    note: 'Protection by Allah’s permission.',
  },
  {
    id: 'before-sleep',
    title: 'Before Sleeping',
    category: 'Morning & Evening',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amutu wa ahya',
    translation: 'In Your name, O Allah, I die and I live.',
    when: 'Before sleep',
    repeat: 1,
    note: 'Say before sleeping.',
    source: 'Bukhari',
  },
];

const SALAH_DUAS: DuaItem[] = [
  {
    id: 'salah-before-wudu',
    title: 'Before Wudu',
    category: 'Salah',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    translation: 'In the name of Allah.',
    when: 'Before wudu',
    repeat: 1,
    note: 'Say before beginning wudu.',
  },
  {
    id: 'salah-after-wudu',
    title: 'After Wudu',
    category: 'Salah',
    arabic:
      'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    transliteration:
      'Ashhadu an la ilaha illallah wahdahu la sharika lah, wa ashhadu anna Muhammadan abduhu wa rasuluh',
    translation:
      'I bear witness that none has the right to be worshipped except Allah alone, without partner, and I bear witness that Muhammad is His servant and Messenger.',
    when: 'After wudu',
    repeat: 1,
    note: 'Beautiful dua after purification.',
    source: 'Muslim',
  },
  {
    id: 'salah-after-wudu-purity',
    title: 'After Wudu - Purity',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ',
    transliteration:
      'Allahummaj’alni minat-tawwabina waj’alni minal-mutatahhirin',
    translation:
      'O Allah, make me among those who constantly repent and make me among those who purify themselves.',
    when: 'After wudu',
    repeat: 1,
    note: 'A beautiful supplication after purification.',
  },
  {
    id: 'salah-enter-masjid',
    title: 'Entering Masjid',
    category: 'Salah',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'Allahumma iftah li abwaba rahmatik',
    translation: 'O Allah, open the gates of Your mercy for me.',
    when: 'Entering mosque',
    repeat: 1,
    note: 'Enter with the right foot.',
    source: 'Muslim',
  },
  {
    id: 'salah-leave-masjid',
    title: 'Leaving Masjid',
    category: 'Salah',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    transliteration: 'Allahumma inni as’aluka min fadlik',
    translation: 'O Allah, I ask You from Your bounty.',
    when: 'Leaving mosque',
    repeat: 1,
    note: 'Leave with the left foot.',
    source: 'Muslim',
  },
  {
    id: 'salah-after-adhan',
    title: 'After Adhan',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
    transliteration:
      'Allahumma Rabba hadhihid-da’watit-tammah, was-salatil-qa’imah, ati Muhammadanil-wasilata wal-fadilah, wab’athhu maqaman mahmudanilladhi wa’adtah',
    translation:
      'O Allah, Lord of this perfect call and established prayer, grant Muhammad the highest station and virtue, and raise him to the praised station You promised him.',
    when: 'After hearing the adhan',
    repeat: 1,
    note: 'A special dua after the adhan.',
    source: 'Bukhari',
  },
  {
    id: 'salah-opening-subhanaka',
    title: 'Opening Dua - Subhanaka',
    category: 'Salah',
    arabic:
      'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ',
    transliteration:
      'Subhanaka Allahumma wa bihamdik, wa tabarakasmuk, wa ta’ala jadduk, wa la ilaha ghayruk',
    translation:
      'Glory and praise are Yours, O Allah. Blessed is Your name, exalted is Your majesty, and there is no deity besides You.',
    when: 'Opening of salah',
    repeat: 1,
    note: 'One of the opening supplications in prayer.',
  },
  {
    id: 'salah-ruku',
    title: 'In Ruku',
    category: 'Salah',
    arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
    transliteration: 'Subhana Rabbiyal Adheem',
    translation: 'Glory be to my Lord, the Most Great.',
    when: 'During ruku',
    repeat: 3,
    note: 'Commonly repeated three times.',
  },
  {
    id: 'salah-ruku-extra',
    title: 'Ruku Praise',
    category: 'Salah',
    arabic:
      'سُبْحَانَكَ اللَّهُمَّ رَبَّنَا وَبِحَمْدِكَ اللَّهُمَّ اغْفِرْ لِي',
    transliteration:
      'Subhanaka Allahumma Rabbana wa bihamdik, Allahummaghfir li',
    translation:
      'Glory is Yours, O Allah our Lord, and praise is Yours. O Allah, forgive me.',
    when: 'In ruku or sujood',
    repeat: 1,
    note: 'A prophetic dua in prayer.',
    source: 'Bukhari / Muslim',
  },
  {
    id: 'salah-after-ruku',
    title: 'After Rising from Ruku',
    category: 'Salah',
    arabic: 'رَبَّنَا وَلَكَ الْحَمْدُ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ',
    transliteration:
      'Rabbana wa lakal-hamd, hamdan kathiran tayyiban mubarakan fih',
    translation:
      'Our Lord, to You belongs praise — abundant, pure and blessed praise.',
    when: 'After rising from ruku',
    repeat: 1,
    note: 'Praise after saying Sami’Allahu liman hamidah.',
  },
  {
    id: 'salah-sujood',
    title: 'In Sujood',
    category: 'Salah',
    arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
    transliteration: "Subhana Rabbiyal A'la",
    translation: 'Glory be to my Lord, the Most High.',
    when: 'During sujood',
    repeat: 3,
    note: 'A beautiful moment to make dua.',
  },
  {
    id: 'salah-between-sujood',
    title: 'Between Two Sujood',
    category: 'Salah',
    arabic:
      'رَبِّ اغْفِرْ لِي وَارْحَمْنِي وَاجْبُرْنِي وَاهْدِنِي وَارْزُقْنِي',
    transliteration:
      'Rabbi ighfir li warhamni wajburni wahdini warzuqni',
    translation:
      'My Lord, forgive me, have mercy on me, mend me, guide me and provide for me.',
    when: 'Between two prostrations',
    repeat: 1,
    note: 'A fuller supplication between the two prostrations.',
  },
  {
    id: 'salah-tashahhud',
    title: 'Tashahhud',
    category: 'Salah',
    arabic:
      'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    transliteration:
      'At-tahiyyatu lillahi was-salawatu wat-tayyibat. As-salamu alayka ayyuhan-Nabiyyu wa rahmatullahi wa barakatuh. As-salamu alayna wa ala ibadillahis-salihin. Ashhadu an la ilaha illallah wa ashhadu anna Muhammadan abduhu wa rasuluh.',
    translation:
      'All greetings, prayers and pure words are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no deity worthy of worship except Allah, and I bear witness that Muhammad is His servant and Messenger.',
    when: 'In the sitting of salah',
    repeat: 1,
    note: 'Essential part of salah.',
  },
  {
    id: 'salah-salawat-ibrahimiyyah',
    title: 'Salawat Ibrahimiyyah',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    transliteration:
      'Allahumma salli ala Muhammad wa ala ali Muhammad kama sallayta ala Ibrahim wa ala ali Ibrahim innaka Hamidun Majid. Allahumma barik ala Muhammad wa ala ali Muhammad kama barakta ala Ibrahim wa ala ali Ibrahim innaka Hamidun Majid.',
    translation:
      'O Allah, send prayers upon Muhammad and upon the family of Muhammad as You sent prayers upon Ibrahim and the family of Ibrahim. Indeed, You are Praiseworthy and Glorious. O Allah, bless Muhammad and the family of Muhammad as You blessed Ibrahim and the family of Ibrahim. Indeed, You are Praiseworthy and Glorious.',
    when: 'After tashahhud',
    repeat: 1,
    note: 'Recited near the end of salah.',
  },
  {
    id: 'salah-before-salam-protection',
    title: 'Before Salam - Protection Dua',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ وَمِنْ عَذَابِ الْقَبْرِ وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ',
    transliteration:
      'Allahumma inni a’udhu bika min adhabi Jahannam, wa min adhabil-qabr, wa min fitnatil-mahya wal-mamat, wa min sharri fitnatil-Masihid-Dajjal',
    translation:
      'O Allah, I seek refuge in You from the punishment of Hell, from the punishment of the grave, from the trials of life and death, and from the evil trial of the False Messiah.',
    when: 'Before salam in salah',
    repeat: 1,
    note: 'A very important dua before ending prayer.',
    source: 'Muslim',
  },
  {
    id: 'salah-after-salah-istighfar',
    title: 'After Salah - Istighfar',
    category: 'Salah',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah.',
    when: 'Immediately after salah',
    repeat: 3,
    note: 'Say three times after obligatory prayer.',
  },
  {
    id: 'salah-after-salah-peace',
    title: 'After Salah - Allahumma Antas Salam',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    transliteration:
      'Allahumma Antas-Salam wa minkas-salam, tabarakta ya Dhal-Jalali wal-Ikram',
    translation:
      'O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of Majesty and Honor.',
    when: 'After salah',
    repeat: 1,
    note: 'A sunnah remembrance after prayer.',
    source: 'Muslim',
  },
  {
    id: 'salah-dua-qunoot',
    title: 'Dua Qunoot',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ وَعَافِنِي فِيمَنْ عَافَيْتَ وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ وَبَارِكْ لِي فِيمَا أَعْطَيْتَ وَقِنِي شَرَّ مَا قَضَيْتَ',
    transliteration:
      'Allahumma ihdini fiman hadayt, wa afini fiman afayt, wa tawallani fiman tawallayt, wa barik li fima a’tayt, wa qini sharra ma qadayt',
    translation:
      'O Allah, guide me among those You have guided, grant me wellbeing among those You have granted wellbeing, take me into Your care among those You have taken into Your care, bless me in what You have given, and protect me from the evil of what You have decreed.',
    when: 'Witr prayer',
    repeat: 1,
    note: 'Commonly recited in Witr.',
  },
];

const RAMADAN_DUAS: DuaItem[] = [
  {
    id: 'ramadan-moon-sighting',
    title: 'When Seeing the New Moon',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالإِيمَانِ وَالسَّلَامَةِ وَالإِسْلَامِ رَبِّي وَرَبُّكَ اللَّهُ',
    transliteration:
      'Allahumma ahillahu alayna bil-yumni wal-imani was-salamati wal-Islam, Rabbi wa Rabbukallah',
    translation:
      'O Allah, bring it over us with blessing, faith, safety and Islam. My Lord and your Lord is Allah.',
    when: 'When Ramadan or a new lunar month begins',
    repeat: 1,
    note: 'A beautiful dua when the new crescent is sighted.',
    source: 'Tirmidhi',
  },
  {
    id: 'ramadan-iftar',
    title: 'Dua After Breaking the Fast',
    category: 'Ramadan',
    arabic:
      'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ',
    transliteration:
      'Dhahabaz-zama’u wabtallatil-urooqu wa thabatal-ajru inshaAllah',
    translation:
      'The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills.',
    when: 'At iftar',
    repeat: 1,
    note: 'Say after breaking the fast.',
    source: 'Abu Dawud',
  },
  {
    id: 'ramadan-laylatul-qadr',
    title: 'Laylatul Qadr Dua',
    category: 'Ramadan',
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    transliteration:
      'Allahumma innaka Afuwwun tuhibbul-afwa fa’fu anni',
    translation:
      'O Allah, You are Most Pardoning, and You love pardon, so pardon me.',
    when: 'Last ten nights of Ramadan',
    repeat: 100,
    note: 'The famous dua for Laylatul Qadr.',
    source: 'Tirmidhi',
  },
  {
    id: 'ramadan-acceptance',
    title: 'Acceptance of Fasting',
    category: 'Ramadan',
    arabic:
      'رَبَّنَا تَقَبَّلْ مِنَّا صِيَامَنَا وَقِيَامَنَا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ',
    transliteration:
      'Rabbana taqabbal minna siyamana wa qiyamana innaka Antas-Samiul-Alim',
    translation:
      'Our Lord, accept from us our fasting and night prayer. Indeed, You are the All-Hearing, the All-Knowing.',
    when: 'During Ramadan, especially after worship',
    repeat: 3,
    note: 'Ask Allah to accept every act of worship.',
  },
  {
    id: 'ramadan-mercy-fire',
    title: 'Ramadan Mercy and Freedom from Fire',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ ارْحَمْنِي وَاغْفِرْ لِي وَاعْتِقْ رَقَبَتِي مِنَ النَّارِ',
    transliteration:
      'Allahummarhamni waghfir li wa a’tiq raqabati minan-nar',
    translation:
      'O Allah, have mercy on me, forgive me, and free me from the Fire.',
    when: 'Ramadan days and nights',
    repeat: 7,
    note: 'A powerful Ramadan supplication.',
  },
  {
    id: 'ramadan-quran-heart',
    title: 'Qur’an in Ramadan',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ اجْعَلِ الْقُرْآنَ رَبِيعَ قَلْبِي وَنُورَ صَدْرِي وَجَلَاءَ حُزْنِي وَذَهَابَ هَمِّي',
    transliteration:
      'Allahumma ij’alil-Qur’ana rabi’a qalbi wa nura sadri wa jala’a huzni wa dhahaba hammi',
    translation:
      'O Allah, make the Qur’an the spring of my heart, the light of my chest, the remover of my sadness, and the reliever of my worry.',
    when: 'During Ramadan and Qur’an recitation',
    repeat: 3,
    note: 'A beautiful dua for connection with the Qur’an.',
  },
];

const HOME_FAMILY_DUAS: DuaItem[] = [
  {
    id: 'home-entering-home',
    title: 'Entering Home',
    category: 'Home & Family',
    arabic:
      'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا',
    transliteration:
      'Bismillahi walajna, wa bismillahi kharajna, wa ala Rabbina tawakkalna',
    translation:
      'In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we place our trust.',
    when: 'When entering the house',
    repeat: 1,
    note: 'Remember Allah when entering home.',
  },
  {
    id: 'home-leaving-home',
    title: 'Leaving Home',
    category: 'Home & Family',
    arabic:
      'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration:
      'Bismillah tawakkaltu alallah, wa la hawla wa la quwwata illa billah',
    translation:
      'In the name of Allah, I place my trust in Allah, and there is no power nor strength except by Allah.',
    when: 'When leaving home',
    repeat: 1,
    note: 'A daily protection dua.',
  },
  {
    id: 'home-new-home-blessing',
    title: 'Entering a New Home',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ اجْعَلْ هَذَا الْبَيْتَ بَيْتَ خَيْرٍ وَبَرَكَةٍ وَسَكِينَةٍ وَإِيمَانٍ',
    transliteration:
      'Allahumma ij’al hadhal-bayta bayta khayrin wa barakatin wa sakinatin wa iman',
    translation:
      'O Allah, make this home a home of goodness, blessing, tranquility and faith.',
    when: 'When entering or moving into a new home',
    repeat: 3,
    note: 'A beautiful dua for a new home.',
  },
  {
    id: 'home-family-peace',
    title: 'Peace in the Family',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ أَلِّفْ بَيْنَ قُلُوبِنَا وَأَصْلِحْ ذَاتَ بَيْنِنَا',
    transliteration:
      'Allahumma allif bayna qulubina wa aslih dhata baynina',
    translation:
      'O Allah, unite our hearts and reconcile what is between us.',
    when: 'For family peace',
    repeat: 3,
    note: 'For love and harmony at home.',
  },
  {
    id: 'home-parents',
    title: 'For Parents',
    category: 'Home & Family',
    arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbirhamhuma kama rabbayani sagheera',
    translation:
      'My Lord, have mercy upon them as they raised me when I was small.',
    when: 'For parents',
    repeat: 1,
    note: 'A beautiful dua for parents.',
    source: "Qur'an 17:24",
  },
  {
    id: 'home-spouse-love',
    title: 'Love Between Spouses',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ اجْعَلْ بَيْنِي وَبَيْنَ زَوْجِي مَوَدَّةً وَرَحْمَةً وَسَكِينَةً',
    transliteration:
      'Allahumma ij’al bayni wa bayna zawji mawaddatan wa rahmatan wa sakinata',
    translation:
      'O Allah, place love, mercy and tranquility between me and my spouse.',
    when: 'For marriage and family',
    repeat: 3,
    note: 'A dua for marital harmony.',
  },
  {
    id: 'home-children-guidance',
    title: 'Guidance for Children',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ اهْدِ أَوْلَادِي وَأَصْلِحْ قُلُوبَهُمْ وَأَعْمَالَهُمْ',
    transliteration:
      'Allahumma ihdi awladi wa aslih qulubahahum wa a’malahum',
    translation:
      'O Allah, guide my children and rectify their hearts and deeds.',
    when: 'For children',
    repeat: 3,
    note: 'A dua for righteous children.',
  },
  {
    id: 'home-protection-family',
    title: 'Protection for Family',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ احْفَظْ أَهْلِي مِنْ كُلِّ سُوءٍ وَبَارِكْ لَنَا فِي بَيْتِنَا',
    transliteration:
      'Allahumma ihfaz ahli min kulli su’in wa barik lana fi baytina',
    translation:
      'O Allah, protect my family from every harm and bless our home for us.',
    when: 'For family protection',
    repeat: 3,
    note: 'A family protection dua.',
  },
  {
    id: 'home-before-intimacy',
    title: 'Before Intimacy',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ جَنِّبْنَا الشَّيْطَانَ وَجَنِّبِ الشَّيْطَانَ مَا رَزَقْتَنَا',
    transliteration:
      'Allahumma jannibnash-shaytan wa jannibish-shaytana ma razaqtana',
    translation:
      'O Allah, keep Satan away from us and keep Satan away from what You provide us.',
    when: 'Before intimacy',
    repeat: 1,
    note: 'A family protection dua.',
    source: 'Bukhari / Muslim',
  },
];

const SICKNESS_DEATH_DUAS: DuaItem[] = [
  {
    id: 'sick-healing',
    title: 'For Healing',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا',
    transliteration:
      'Allahumma Rabban-nas adhhib al-ba’s, ishfi Antash-Shafi, la shifa’a illa shifa’uk, shifa’an la yughadiru saqama',
    translation:
      'O Allah, Lord of mankind, remove the harm and heal. You are the Healer. There is no healing except Your healing, a healing that leaves no illness behind.',
    when: 'For sickness',
    repeat: 1,
    note: 'Say for yourself or others.',
    source: 'Bukhari / Muslim',
  },
  {
    id: 'sick-body-pain',
    title: 'For Pain in the Body',
    category: 'Sickness & Death',
    arabic:
      'بِسْمِ اللَّهِ، أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ',
    transliteration:
      'Bismillah, a’udhu billahi wa qudratihi min sharri ma ajidu wa uhadhir',
    translation:
      'In the name of Allah. I seek refuge in Allah and His power from the evil of what I feel and fear.',
    when: 'When feeling pain',
    repeat: 7,
    note: 'Place your hand on the pain area and recite.',
    source: 'Muslim',
  },
  {
    id: 'sick-visiting-sick',
    title: 'When Visiting the Sick',
    category: 'Sickness & Death',
    arabic: 'لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ',
    transliteration: 'La ba’sa tahurun inshaAllah',
    translation: 'No harm; it is purification, if Allah wills.',
    when: 'When visiting a sick person',
    repeat: 1,
    note: 'Comfort the sick with gentle words.',
    source: 'Bukhari',
  },
  {
    id: 'sick-ask-cure',
    title: 'Ask Allah for Cure',
    category: 'Sickness & Death',
    arabic:
      'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ',
    transliteration:
      'As’alullahal-Adheema Rabbal-Arshil-Adheemi an yashfiyak',
    translation:
      'I ask Allah, the Magnificent, Lord of the Magnificent Throne, to cure you.',
    when: 'For a sick person',
    repeat: 7,
    note: 'A dua for the sick.',
    source: 'Abu Dawud / Tirmidhi',
  },
  {
    id: 'death-calamity',
    title: 'When Afflicted by Calamity',
    category: 'Sickness & Death',
    arabic: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
    transliteration: 'Inna lillahi wa inna ilayhi raji’un',
    translation: 'Indeed, we belong to Allah and indeed to Him we will return.',
    when: 'When death or calamity occurs',
    repeat: 1,
    note: 'Say with patience and trust.',
    source: "Qur'an 2:156",
  },
  {
    id: 'death-calamity-reward',
    title: 'Dua After Calamity',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا',
    transliteration:
      'Allahumma’jurni fi musibati wa akhlif li khayran minha',
    translation:
      'O Allah, reward me in my calamity and replace it for me with something better than it.',
    when: 'After loss or calamity',
    repeat: 1,
    note: 'A dua for patience and reward.',
    source: 'Muslim',
  },
  {
    id: 'deceased-forgiveness',
    title: 'For the Deceased',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ وَأَكْرِمْ نُزُلَهُ وَوَسِّعْ مُدْخَلَهُ',
    transliteration:
      'Allahummaghfir lahu warhamhu wa afihi wa’fu anhu wa akrim nuzulahu wa wassi’ mudkhalah',
    translation:
      'O Allah, forgive him, have mercy on him, grant him wellbeing, pardon him, honor his place of arrival, and widen his entrance.',
    when: 'For a deceased person',
    repeat: 1,
    note: 'A comprehensive funeral dua.',
    source: 'Muslim',
  },
  {
    id: 'deceased-female-forgiveness',
    title: 'For a Deceased Woman',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ اغْفِرْ لَهَا وَارْحَمْهَا وَعَافِهَا وَاعْفُ عَنْهَا وَأَكْرِمْ نُزُلَهَا وَوَسِّعْ مُدْخَلَهَا',
    transliteration:
      'Allahummaghfir laha warhamha wa afiha wa’fu anha wa akrim nuzulaha wa wassi’ mudkhalaha',
    translation:
      'O Allah, forgive her, have mercy on her, grant her wellbeing, pardon her, honor her place of arrival, and widen her entrance.',
    when: 'For a deceased woman',
    repeat: 1,
    note: 'A comprehensive dua for a deceased woman.',
  },
  {
    id: 'deceased-grave-light',
    title: 'Light in the Grave',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ نَوِّرْ قَبْرَهُ وَوَسِّعْ مُدْخَلَهُ وَآنِسْ وَحْشَتَهُ',
    transliteration:
      'Allahumma nawwir qabrahu wa wassi’ mudkhalahu wa anis wahshatah',
    translation:
      'O Allah, illuminate his grave, widen his entrance, and comfort him in his loneliness.',
    when: 'For the deceased',
    repeat: 1,
    note: 'A dua asking Allah for comfort in the grave.',
  },
];

const TRAVEL_DUAS: DuaItem[] = [
  {
    id: 'travel-start',
    title: 'Travel Dua',
    category: 'Travel',
    arabic:
      'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration:
      'Subhanalladhi sakhkhara lana hadha wa ma kunna lahu muqrinin wa inna ila Rabbina lamunqalibun',
    translation:
      'Glory be to Him who subjected this to us, and we could not have controlled it ourselves. Surely, to our Lord we are returning.',
    when: 'When starting travel',
    repeat: 1,
    note: 'Say when entering transport.',
    source: "Qur'an 43:13-14",
  },
  {
    id: 'travel-long-dua',
    title: 'Complete Travel Supplication',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ',
    transliteration:
      'Allahumma inna nas’aluka fi safarina hadha al-birra wat-taqwa wa minal-amali ma tarda. Allahumma hawwin alayna safarana hadha watwi anna bu’dah',
    translation:
      'O Allah, we ask You in this journey for righteousness, piety, and deeds that please You. O Allah, make this journey easy for us and shorten its distance for us.',
    when: 'When beginning a journey',
    repeat: 1,
    note: 'A comprehensive travel dua.',
    source: 'Muslim',
  },
  {
    id: 'travel-family-protection',
    title: 'Entrusting Family to Allah',
    category: 'Travel',
    arabic:
      'أَسْتَوْدِعُكُمُ اللَّهَ الَّذِي لَا تَضِيعُ وَدَائِعُهُ',
    transliteration:
      'Astawdi’ukumullaha alladhi la tadi’u wada’i’uh',
    translation:
      'I entrust you to Allah, whose trusts are never lost.',
    when: 'When leaving family or loved ones',
    repeat: 1,
    note: 'A dua for loved ones while travelling.',
    source: 'Ibn Majah',
  },
  {
    id: 'travel-arrival',
    title: 'When Stopping Somewhere',
    category: 'Travel',
    arabic:
      'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration:
      'A’udhu bikalimatillahit-tammati min sharri ma khalaq',
    translation:
      'I seek refuge in the perfect words of Allah from the evil of what He created.',
    when: 'When stopping at a place during travel',
    repeat: 1,
    note: 'Protection when stopping somewhere.',
    source: 'Muslim',
  },
  {
    id: 'travel-return',
    title: 'Returning from Travel',
    category: 'Travel',
    arabic:
      'آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ',
    transliteration:
      'Ayibuna ta’ibuna abiduna li Rabbina hamidun',
    translation:
      'Returning, repenting, worshipping, and praising our Lord.',
    when: 'Returning from travel',
    repeat: 1,
    note: 'Say on the return journey.',
    source: 'Bukhari / Muslim',
  },
];

const JANNAH_AKHIRAH_DUAS: DuaItem[] = [
  {
    id: 'akhirah-jannah',
    title: 'Asking for Jannah',
    category: 'Jannah & Akhirah',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ',
    transliteration: 'Allahumma inni as’alukal-jannah',
    translation: 'O Allah, I ask You for Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Ask Allah for Jannah often.',
  },
  {
    id: 'akhirah-hellfire',
    title: 'Protection from Hellfire',
    category: 'Jannah & Akhirah',
    arabic: 'اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ',
    transliteration: 'Allahumma ajirni minan-nar',
    translation: 'O Allah, protect me from the Fire.',
    when: 'Morning and evening',
    repeat: 7,
    note: 'Important daily protection dua.',
  },
  {
    id: 'akhirah-firdaws',
    title: 'Ask for Al-Firdaws',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْفِرْدَوْسَ الْأَعْلَى مِنَ الْجَنَّةِ',
    transliteration:
      'Allahumma inni as’alukal-Firdawsal-A’la minal-jannah',
    translation:
      'O Allah, I ask You for Al-Firdaws, the highest level of Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Ask Allah for the highest Paradise.',
  },
  {
    id: 'akhirah-good-ending',
    title: 'Good Ending',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ أَحْسِنْ خَاتِمَتِي وَاجْعَلْ آخِرَ كَلَامِي لَا إِلَهَ إِلَّا اللَّهُ',
    transliteration:
      'Allahumma ahsin khatimati waj’al akhira kalami la ilaha illallah',
    translation:
      'O Allah, make my ending good and make my final words: there is no deity worthy of worship except Allah.',
    when: 'Any time',
    repeat: 3,
    note: 'A dua for a good ending.',
  },
  {
    id: 'akhirah-easy-account',
    title: 'Easy Reckoning',
    category: 'Jannah & Akhirah',
    arabic: 'اللَّهُمَّ حَاسِبْنِي حِسَابًا يَسِيرًا',
    transliteration: 'Allahumma hasibni hisaban yasira',
    translation: 'O Allah, call me to account with an easy reckoning.',
    when: 'Remembering the Day of Judgment',
    repeat: 3,
    note: 'A dua for ease on the Last Day.',
  },
];

const RABBANA_DUAS: DuaItem[] = [
  {
    id: 'rabbana-atina',
    title: 'Rabbana Atina',
    category: 'Rabbana',
    arabic:
      'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration:
      'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar',
    translation:
      'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
    when: 'Any time',
    repeat: 1,
    note: 'One of the most complete duas.',
    source: "Qur'an 2:201",
  },
  {
    id: 'rabbana-taqabbal',
    title: 'Rabbana Taqabbal Minna',
    category: 'Rabbana',
    arabic:
      'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ',
    transliteration:
      'Rabbana taqabbal minna innaka Antas-Samiul-Alim',
    translation:
      'Our Lord, accept from us. Indeed, You are the All-Hearing, the All-Knowing.',
    when: 'After worship or good deeds',
    repeat: 1,
    note: 'A dua for acceptance.',
    source: "Qur'an 2:127",
  },
  {
    id: 'rabbana-wajalna-muslimayn',
    title: 'Make Us Submissive',
    category: 'Rabbana',
    arabic:
      'رَبَّنَا وَاجْعَلْنَا مُسْلِمَيْنِ لَكَ وَمِنْ ذُرِّيَّتِنَا أُمَّةً مُسْلِمَةً لَكَ',
    transliteration:
      'Rabbana waj’alna muslimayni laka wa min dhurriyyatina ummatan muslimatan lak',
    translation:
      'Our Lord, make us submissive to You and from our descendants a community submissive to You.',
    when: 'For faith and family',
    repeat: 1,
    note: 'A dua of Ibrahim and Ismail عليهما السلام.',
    source: "Qur'an 2:128",
  },
  {
    id: 'rabbana-tub-alayna',
    title: 'Accept Our Repentance',
    category: 'Rabbana',
    arabic:
      'رَبَّنَا وَتُبْ عَلَيْنَا إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
    transliteration:
      'Rabbana wa tub alayna innaka Antat-Tawwabur-Raheem',
    translation:
      'Our Lord, accept our repentance. Indeed, You are the Accepter of repentance, the Most Merciful.',
    when: 'After sins or mistakes',
    repeat: 1,
    note: 'A beautiful dua for repentance.',
    source: "Qur'an 2:128",
  },
  {
    id: 'rabbana-afrigh-sabran',
    title: 'Pour Patience Upon Us',
    category: 'Rabbana',
    arabic:
      'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    transliteration:
      'Rabbana afrigh alayna sabran wa thabbit aqdamana wansurna alal-qawmil-kafirin',
    translation:
      'Our Lord, pour patience upon us, make our feet firm, and grant us victory over the disbelieving people.',
    when: 'During hardship',
    repeat: 1,
    note: 'A dua for strength and firmness.',
    source: "Qur'an 2:250",
  },
  {
    id: 'rabbana-la-tuakhidhna',
    title: 'Do Not Punish Us If We Forget',
    category: 'Rabbana',
    arabic:
      'رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا',
    transliteration:
      'Rabbana la tu’akhidhna in nasina aw akhta’na',
    translation:
      'Our Lord, do not take us to account if we forget or make a mistake.',
    when: 'Seeking Allah’s pardon',
    repeat: 1,
    note: 'A dua for mercy and pardon.',
    source: "Qur'an 2:286",
  },
  {
    id: 'rabbana-la-tuzigh',
    title: 'Do Not Let Our Hearts Deviate',
    category: 'Rabbana',
    arabic:
      'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً',
    transliteration:
      'Rabbana la tuzigh qulubana ba’da idh hadaytana wa hab lana min ladunka rahmah',
    translation:
      'Our Lord, do not let our hearts deviate after You have guided us, and grant us mercy from Yourself.',
    when: 'For steadfastness',
    repeat: 1,
    note: 'A dua for firm faith.',
    source: "Qur'an 3:8",
  },
  {
    id: 'rabbana-zalamna-anfusana',
    title: 'We Wronged Ourselves',
    category: 'Rabbana',
    arabic:
      'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
    transliteration:
      'Rabbana zalamna anfusana wa in lam taghfir lana wa tarhamna lanakunanna minal-khasirin',
    translation:
      'Our Lord, we have wronged ourselves. If You do not forgive us and have mercy on us, we will surely be among the losers.',
    when: 'After sins and mistakes',
    repeat: 1,
    note: 'The dua of Adam and Hawwa عليهما السلام.',
    source: "Qur'an 7:23",
  },
  {
    id: 'rabbana-hablana',
    title: 'Comfort of Our Eyes',
    category: 'Rabbana',
    arabic:
      'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    transliteration:
      'Rabbana hablana min azwajina wa dhurriyyatina qurrata a’yun waj’alna lil-muttaqina imama',
    translation:
      'Our Lord, grant us from our spouses and offspring comfort to our eyes, and make us leaders for the righteous.',
    when: 'For family and children',
    repeat: 1,
    note: 'A beautiful family dua.',
    source: "Qur'an 25:74",
  },
];

const OTHER_DUAS: DuaItem[] = [
  {
    id: 'praise-subhanallah-bihamdihi',
    title: 'Glory and Praise',
    category: 'Praising Allah',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'SubhanAllahi wa bihamdihi',
    translation: 'Glory be to Allah and praise be to Him.',
    when: 'Any time',
    repeat: 100,
    note: 'A powerful daily dhikr.',
  },
  {
    id: 'praise-salawat',
    title: 'Sending Salawat',
    category: 'Praising Allah',
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    transliteration:
      'Allahumma salli wa sallim ala Nabiyyina Muhammad',
    translation:
      'O Allah, send prayers and peace upon our Prophet Muhammad ﷺ.',
    when: 'Any time, especially Friday',
    repeat: 100,
    note: 'Increase salawat often.',
  },
  {
    id: 'forgiveness-astaghfirullah',
    title: 'General Istighfar',
    category: 'Seeking Forgiveness',
    arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullaha wa atubu ilayh',
    translation: 'I seek forgiveness from Allah and repent to Him.',
    when: 'Any time',
    repeat: 100,
    note: 'A beautiful daily repentance dhikr.',
  },
  {
    id: 'knowledge-increase',
    title: 'Increase Knowledge',
    category: 'Knowledge',
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    transliteration: 'Rabbi zidni ilma',
    translation: 'My Lord, increase me in knowledge.',
    when: 'Before studying',
    repeat: 3,
    note: 'Qur’anic dua for beneficial knowledge.',
    source: "Qur'an 20:114",
  },
  {
    id: 'protection-evil-eye',
    title: 'Protection from Evil Eye',
    category: 'Protection',
    arabic:
      'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
    transliteration:
      'A’udhu bikalimatillahit-tammati min kulli shaytanin wa hammah wa min kulli aynin lammah',
    translation:
      'I seek refuge in the perfect words of Allah from every devil, every harmful creature, and every harmful evil eye.',
    when: 'Protection for children, family, or self',
    repeat: 1,
    note: 'Protection from evil eye and harm.',
  },
  {
    id: 'wealth-rizq',
    title: 'For Halal Rizq',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
    transliteration:
      'Allahummakfini bihalalika an haramika wa aghnini bifadlika amman siwak',
    translation:
      'O Allah, suffice me with what You made lawful instead of what is unlawful, and enrich me by Your bounty so that I need no one besides You.',
    when: 'Financial hardship',
    repeat: 7,
    note: 'Excellent dua for halal provision.',
  },
  {
    id: 'marriage-love',
    title: 'Love and Mercy in Marriage',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ اجْعَلْ بَيْنَنَا مَوَدَّةً وَرَحْمَةً وَسَكِينَةً',
    transliteration:
      'Allahumma ij’al baynana mawaddatan wa rahmatan wa sakinah',
    translation:
      'O Allah, place between us love, mercy and tranquility.',
    when: 'For marriage and love',
    repeat: 3,
    note: 'A dua for marital harmony.',
  },
  {
    id: 'children-righteous',
    title: 'For Righteous Children',
    category: 'Children',
    arabic: 'رَبِّ هَبْ لِي مِنَ الصَّالِحِينَ',
    transliteration: 'Rabbi hab li minas-salihin',
    translation: 'My Lord, grant me righteous offspring.',
    when: 'For children',
    repeat: 7,
    note: 'A beautiful dua for righteous children.',
  },
  {
    id: 'friday-salawat',
    title: 'Friday Salawat',
    category: 'Friday',
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ صَلَاةً كَثِيرَةً طَيِّبَةً مُبَارَكَةً',
    transliteration:
      'Allahumma salli wa sallim ala Nabiyyina Muhammad salatan kathiratan tayyibatan mubarakah',
    translation:
      'O Allah, send abundant, pure and blessed prayers and peace upon our Prophet Muhammad ﷺ.',
    when: 'Friday',
    repeat: 100,
    note: 'Increase salawat on Fridays.',
  },
  {
    id: 'nature-rain',
    title: 'When It Rains',
    category: 'Nature',
    arabic: 'اللَّهُمَّ صَيِّبًا نَافِعًا',
    transliteration: "Allahumma sayyiban nafi'a",
    translation: 'O Allah, make it beneficial rain.',
    when: 'When rain falls',
    repeat: 1,
    note: 'A beautiful nature dua.',
  },
  {
    id: 'food-before-eating',
    title: 'Before Eating',
    category: 'Food & Drinks',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    translation: 'In the name of Allah.',
    when: 'Before eating or drinking',
    repeat: 1,
    note: 'Say before food and drink.',
  },
  {
    id: 'food-after-eating',
    title: 'After Eating',
    category: 'Food & Drinks',
    arabic:
      'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transliteration:
      'Alhamdu lillahil-ladhi at’amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah',
    translation:
      'All praise is for Allah who fed me this and provided it for me without any power or strength from me.',
    when: 'After eating',
    repeat: 1,
    note: 'Thank Allah after food.',
  },
];

const SUPPLEMENTARY_DUAS: DuaItem[] = [
  {
    id: 'ramadan-night-worship',
    title: 'Strength for Night Worship',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ أَعِنِّي فِي رَمَضَانَ عَلَى الصِّيَامِ وَالْقِيَامِ وَتِلَاوَةِ الْقُرْآنِ',
    transliteration:
      'Allahumma a’inni fi Ramadan alas-siyami wal-qiyami wa tilawatil-Qur’an',
    translation:
      'O Allah, help me in Ramadan with fasting, night prayer and recitation of the Qur’an.',
    when: 'During Ramadan',
    repeat: 3,
    note: 'A Ramadan worship dua.',
  },
  {
    id: 'salah-khushu',
    title: 'Khushu in Salah',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الْخُشُوعَ فِي صَلَاتِي وَحُسْنَ الْإِقْبَالِ عَلَيْكَ',
    transliteration:
      'Allahumma arzuqnil-khushu’a fi salati wa husnal-iqbali alayk',
    translation:
      'O Allah, grant me humility in my prayer and a beautiful turning toward You.',
    when: 'Before salah',
    repeat: 3,
    note: 'A dua for focus in prayer.',
  },
  {
    id: 'knowledge-beneficial',
    title: 'Beneficial Knowledge',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا',
    transliteration:
      'Allahumma inni as’aluka ilman nafi’an wa rizqan tayyiban wa amalan mutaqabbalan',
    translation:
      'O Allah, I ask You for beneficial knowledge, pure provision and accepted deeds.',
    when: 'Morning or before studying',
    repeat: 1,
    note: 'A comprehensive morning dua.',
  },
  {
    id: 'distress-relief',
    title: 'Relief from Worry',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ أَذْهِبْ هَمِّي وَفَرِّجْ كَرْبِي وَاشْرَحْ صَدْرِي',
    transliteration:
      'Allahumma adhhib hammi wa farrij karbi washrah sadri',
    translation:
      'O Allah, remove my worry, relieve my distress and expand my chest.',
    when: 'During sadness or anxiety',
    repeat: 3,
    note: 'A dua for emotional ease.',
  },
  {
    id: 'protection-self',
    title: 'Protection from Self and Evil',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ احْفَظْنِي مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ كُلِّ ذِي شَرٍّ',
    transliteration:
      'Allahumma ihfazni min sharri nafsi wa min sharri kulli dhi sharr',
    translation:
      'O Allah, protect me from the evil of myself and from the evil of every harmful being.',
    when: 'Morning or evening',
    repeat: 3,
    note: 'A general protection dua.',
  },
];


const EXPANDED_DUAS: DuaItem[] = [
  {
    id: 'expanded-dua-1',
    title: 'For A blessed morning',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ في والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka a blessed morning waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for a blessed morning, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-2',
    title: 'For A protected evening',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ في والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni a protected evening waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me a protected evening, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-3',
    title: 'For Gratitude after waking',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ في والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li gratitude after waking waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me gratitude after waking, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-4',
    title: 'For Peace before sleep',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ في والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li peace before sleep waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me peace before sleep, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-5',
    title: 'For Remembrance at sunrise',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ في والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba remembrance at sunrise waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of remembrance at sunrise, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-6',
    title: 'For Remembrance at sunset',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ في والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka remembrance at sunset waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for remembrance at sunset, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-7',
    title: 'For Protection through the day',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ في والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni protection through the day waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me protection through the day, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-8',
    title: 'For Protection through the night',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ في والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li protection through the night waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me protection through the night, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-9',
    title: 'For A heart attached to dhikr',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ في والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li a heart attached to dhikr waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me a heart attached to dhikr, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-10',
    title: 'For Steadfast daily worship',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ في والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba steadfast daily worship waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of steadfast daily worship, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-11',
    title: 'For Light in the morning',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ في والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka light in the morning wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for light in the morning, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-12',
    title: 'For Light in the evening',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ في والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni light in the evening wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me light in the evening, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-13',
    title: 'For Safety from sudden harm',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ في والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li safety from sudden harm wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me safety from sudden harm, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-14',
    title: 'For Forgiveness before sleeping',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ في والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li forgiveness before sleeping wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me forgiveness before sleeping, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-15',
    title: 'For Renewal of faith',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ في والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba renewal of faith wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of renewal of faith, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-16',
    title: 'For Trust in Allah each day',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ في والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka trust in Allah each day wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for trust in Allah each day, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-17',
    title: 'For Barakah in time',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ في والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni barakah in time wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me barakah in time, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-18',
    title: 'For A peaceful heart',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ في والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li a peaceful heart wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me a peaceful heart, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-19',
    title: 'For Good deeds before night',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ في والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li good deeds before night wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me good deeds before night, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-20',
    title: 'For Hope after waking',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ في والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba hope after waking wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of hope after waking, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-21',
    title: 'For Mercy in the morning',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka mercy in the morning wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for mercy in the morning, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-22',
    title: 'For Mercy in the evening',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni mercy in the evening wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me mercy in the evening, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-23',
    title: 'For Daily guidance',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li daily guidance wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me daily guidance, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-24',
    title: 'For Daily protection',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li daily protection wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me daily protection, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-25',
    title: 'For Good ending to the day',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba good ending to the day wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of good ending to the day, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-26',
    title: 'For Good beginning to the day',
    category: 'Morning & Evening',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka good beginning to the day waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for good beginning to the day, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-27',
    title: 'For Accepted fasting',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka accepted fasting waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for accepted fasting, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-28',
    title: 'For Accepted night prayer',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni accepted night prayer waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me accepted night prayer, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-29',
    title: 'For Love of Qur’an',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li love of Qur’an waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me love of Qur’an, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-30',
    title: 'For Barakah in suhoor',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li barakah in suhoor waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me barakah in suhoor, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-31',
    title: 'For Mercy at iftar',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba mercy at iftar waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of mercy at iftar, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-32',
    title: 'For Forgiveness in Ramadan',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka forgiveness in Ramadan waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for forgiveness in Ramadan, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-33',
    title: 'For Freedom from the Fire',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni freedom from the Fire waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me freedom from the Fire, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-34',
    title: 'For Laylatul Qadr acceptance',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li Laylatul Qadr acceptance waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me Laylatul Qadr acceptance, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-35',
    title: 'For Strength for taraweeh',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li strength for taraweeh waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me strength for taraweeh, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-36',
    title: 'For Sincere fasting',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba sincere fasting waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of sincere fasting, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-37',
    title: 'For Guarding the tongue',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka guarding the tongue wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for guarding the tongue, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-38',
    title: 'For Feeding the fasting',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni feeding the fasting wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me feeding the fasting, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-39',
    title: 'For Steadfast worship',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li steadfast worship wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me steadfast worship, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-40',
    title: 'For Ramadan transformation',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li Ramadan transformation wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me Ramadan transformation, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-41',
    title: 'For Softness of heart',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba softness of heart wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of softness of heart, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-42',
    title: 'For Patience while fasting',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka patience while fasting wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for patience while fasting, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-43',
    title: 'For Gratitude after iftar',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni gratitude after iftar wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me gratitude after iftar, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-44',
    title: 'For Qur’an understanding',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li Qur’an understanding wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me Qur’an understanding, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-45',
    title: 'For Charity in Ramadan',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li charity in Ramadan wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me charity in Ramadan, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-46',
    title: 'For Pure intention',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba pure intention wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of pure intention, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-47',
    title: 'For Last ten nights',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka last ten nights wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for last ten nights, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-48',
    title: 'For Good deeds multiplied',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni good deeds multiplied wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me good deeds multiplied, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-49',
    title: 'For Accepted repentance',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li accepted repentance wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me accepted repentance, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-50',
    title: 'For A Ramadan of mercy',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li a Ramadan of mercy wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me a Ramadan of mercy, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-51',
    title: 'For Consistent worship',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba consistent worship wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of consistent worship, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-52',
    title: 'For Faith after Ramadan',
    category: 'Ramadan',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka faith after Ramadan waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for faith after Ramadan, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-53',
    title: 'For Khushu in salah',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka khushu in salah waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for khushu in salah, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-54',
    title: 'For Love of prayer',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni love of prayer waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me love of prayer, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-55',
    title: 'For Guarding the five prayers',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li guarding the five prayers waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me guarding the five prayers, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-56',
    title: 'For Accepted sujood',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li accepted sujood waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me accepted sujood, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-57',
    title: 'For Accepted ruku',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba accepted ruku waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of accepted ruku, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-58',
    title: 'For Focus in recitation',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka focus in recitation waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for focus in recitation, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-59',
    title: 'For Light through salah',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni light through salah waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me light through salah, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-60',
    title: 'For Forgiveness after prayer',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li forgiveness after prayer waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me forgiveness after prayer, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-61',
    title: 'For Humility before Allah',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li humility before Allah waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me humility before Allah, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-62',
    title: 'For Firmness upon prayer',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba firmness upon prayer waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of firmness upon prayer, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-63',
    title: 'For Waking for fajr',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka waking for fajr wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for waking for fajr, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-64',
    title: 'For Praying on time',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni praying on time wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me praying on time, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-65',
    title: 'For Beauty in tashahhud',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li beauty in tashahhud wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me beauty in tashahhud, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-66',
    title: 'For Accepted witr',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li accepted witr wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me accepted witr, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-67',
    title: 'For Sincerity in salah',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba sincerity in salah wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of sincerity in salah, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-68',
    title: 'For Peace in prayer',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka peace in prayer wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for peace in prayer, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-69',
    title: 'For Salah with presence',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni salah with presence wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me salah with presence, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-70',
    title: 'For Love for the masjid',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li love for the masjid wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me love for the masjid, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-71',
    title: 'For Accepted dua after salah',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li accepted dua after salah wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me accepted dua after salah, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-72',
    title: 'For Protection from neglecting salah',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba protection from neglecting salah wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of protection from neglecting salah, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-73',
    title: 'For Steadfastness in jamaah',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka steadfastness in jamaah wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for steadfastness in jamaah, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-74',
    title: 'For Good ending after prayer',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni good ending after prayer wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me good ending after prayer, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-75',
    title: 'For Pure wudu',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li pure wudu wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me pure wudu, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-76',
    title: 'For Humble heart in sujood',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li humble heart in sujood wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me humble heart in sujood, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-77',
    title: 'For Strength to pray',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba strength to pray wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of strength to pray, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-78',
    title: 'For Prayer that changes the heart',
    category: 'Salah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka prayer that changes the heart waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for prayer that changes the heart, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-79',
    title: 'For Constant tasbih',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka constant tasbih waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for constant tasbih, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-80',
    title: 'For Sincere tahmid',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni sincere tahmid waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me sincere tahmid, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-81',
    title: 'For Love of dhikr',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li love of dhikr waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me love of dhikr, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-82',
    title: 'For A thankful tongue',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li a thankful tongue waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me a thankful tongue, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-83',
    title: 'For A heart praising Allah',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba a heart praising Allah waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of a heart praising Allah, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-84',
    title: 'For Remembrance in ease',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka remembrance in ease waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for remembrance in ease, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-85',
    title: 'For Remembrance in hardship',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni remembrance in hardship waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me remembrance in hardship, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-86',
    title: 'For Praise in every state',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li praise in every state waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me praise in every state, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-87',
    title: 'For Barakah through dhikr',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li barakah through dhikr waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me barakah through dhikr, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-88',
    title: 'For A tongue moist with remembrance',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba a tongue moist with remembrance waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of a tongue moist with remembrance, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-89',
    title: 'For Magnifying Allah',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka magnifying Allah wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for magnifying Allah, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-90',
    title: 'For Beautiful gratitude',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni beautiful gratitude wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me beautiful gratitude, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-91',
    title: 'For Humility in praise',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li humility in praise wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me humility in praise, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-92',
    title: 'For Daily salawat',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li daily salawat wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me daily salawat, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-93',
    title: 'For Closeness through dhikr',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba closeness through dhikr wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of closeness through dhikr, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-94',
    title: 'For Purity of praise',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka purity of praise wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for purity of praise, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-95',
    title: 'For Light through tasbih',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni light through tasbih wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me light through tasbih, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-96',
    title: 'For Praise before sleep',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li praise before sleep wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me praise before sleep, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-97',
    title: 'For Praise after waking',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li praise after waking wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me praise after waking, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-98',
    title: 'For Remembrance after prayer',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba remembrance after prayer wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of remembrance after prayer, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-99',
    title: 'For Sincere glorification',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka sincere glorification wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for sincere glorification, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-100',
    title: 'For Gratitude for blessings',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni gratitude for blessings wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me gratitude for blessings, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-101',
    title: 'For Remembering Allah often',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li remembering Allah often wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me remembering Allah often, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-102',
    title: 'For Praise that pleases Allah',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li praise that pleases Allah wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me praise that pleases Allah, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-103',
    title: 'For Heavy deeds on the scale',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba heavy deeds on the scale wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of heavy deeds on the scale, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-104',
    title: 'For For a thankful heart',
    category: 'Praising Allah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka for a thankful heart waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for for a thankful heart, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-105',
    title: 'For Sincere repentance',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka sincere repentance waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for sincere repentance, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-106',
    title: 'For Forgiveness of hidden sins',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni forgiveness of hidden sins waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me forgiveness of hidden sins, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-107',
    title: 'For Forgiveness of open sins',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li forgiveness of open sins waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me forgiveness of open sins, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-108',
    title: 'For A clean heart',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li a clean heart waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me a clean heart, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-109',
    title: 'For Leaving bad habits',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba leaving bad habits waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of leaving bad habits, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-110',
    title: 'For Returning to Allah',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka returning to Allah waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for returning to Allah, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-111',
    title: 'For Mercy after mistakes',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni mercy after mistakes waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me mercy after mistakes, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-112',
    title: 'For A new beginning',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li a new beginning waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me a new beginning, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-113',
    title: 'For Forgiveness of parents',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li forgiveness of parents waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me forgiveness of parents, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-114',
    title: 'For Forgiveness of family',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba forgiveness of family waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of forgiveness of family, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-115',
    title: 'For Tears of repentance',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka tears of repentance wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for tears of repentance, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-116',
    title: 'For Accepted istighfar',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni accepted istighfar wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me accepted istighfar, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-117',
    title: 'For Purifying the soul',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li purifying the soul wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me purifying the soul, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-118',
    title: 'For Protection from repeating sins',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li protection from repeating sins wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me protection from repeating sins, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-119',
    title: 'For Forgiveness before death',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba forgiveness before death wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of forgiveness before death, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-120',
    title: 'For Softness after sin',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka softness after sin wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for softness after sin, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-121',
    title: 'For Allah’s pardon',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni Allah’s pardon wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me Allah’s pardon, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-122',
    title: 'For Repentance with sincerity',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li repentance with sincerity wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me repentance with sincerity, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-123',
    title: 'For Clean record',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li clean record wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me clean record, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-124',
    title: 'For Forgiveness day and night',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba forgiveness day and night wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of forgiveness day and night, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-125',
    title: 'For Humility after mistakes',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka humility after mistakes wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for humility after mistakes, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-126',
    title: 'For Strength against sin',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni strength against sin wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me strength against sin, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-127',
    title: 'For Mercy in weakness',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li mercy in weakness wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me mercy in weakness, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-128',
    title: 'For Covering of faults',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li covering of faults wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me covering of faults, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-129',
    title: 'For Forgiven past',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba forgiven past wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of forgiven past, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-130',
    title: 'For Beautiful return to Allah',
    category: 'Seeking Forgiveness',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka beautiful return to Allah waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for beautiful return to Allah, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-131',
    title: 'For Halal provision',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka halal provision waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for halal provision, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-132',
    title: 'For Barakah in wealth',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni barakah in wealth waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me barakah in wealth, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-133',
    title: 'For Debt relief',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li debt relief waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me debt relief, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-134',
    title: 'For Financial ease',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li financial ease waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me financial ease, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-135',
    title: 'For Contentment with rizq',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba contentment with rizq waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of contentment with rizq, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-136',
    title: 'For Lawful earnings',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka lawful earnings waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for lawful earnings, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-137',
    title: 'For Business blessing',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni business blessing waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me business blessing, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-138',
    title: 'For Generosity',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li generosity waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me generosity, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-139',
    title: 'For Protection from poverty',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li protection from poverty waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me protection from poverty, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-140',
    title: 'For Independence from people',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba independence from people waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of independence from people, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-141',
    title: 'For Barakah in work',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka barakah in work wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for barakah in work, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-142',
    title: 'For Pure income',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni pure income wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me pure income, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-143',
    title: 'For Ability to give charity',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li ability to give charity wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me ability to give charity, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-144',
    title: 'For Sufficiency through Allah',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li sufficiency through Allah wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me sufficiency through Allah, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-145',
    title: 'For Rizq without hardship',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba rizq without hardship wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of rizq without hardship, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-146',
    title: 'For Gratitude for provision',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka gratitude for provision wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for gratitude for provision, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-147',
    title: 'For Wise spending',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni wise spending wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me wise spending, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-148',
    title: 'For Protection from greed',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li protection from greed wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me protection from greed, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-149',
    title: 'For Settling debts',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li settling debts wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me settling debts, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-150',
    title: 'For Good opportunities',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba good opportunities wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of good opportunities, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-151',
    title: 'For Family provision',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka family provision wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for family provision, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-152',
    title: 'For Beneficial work',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni beneficial work wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me beneficial work, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-153',
    title: 'For Wealth with faith',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li wealth with faith wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me wealth with faith, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-154',
    title: 'For Safe trade',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li safe trade wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me safe trade, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-155',
    title: 'For Provision with dignity',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba provision with dignity wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of provision with dignity, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-156',
    title: 'For Barakah in salary',
    category: 'Wealth & Rizq',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka barakah in salary waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for barakah in salary, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-157',
    title: 'For Beneficial knowledge',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka beneficial knowledge waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for beneficial knowledge, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-158',
    title: 'For Understanding Qur’an',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni understanding Qur’an waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me understanding Qur’an, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-159',
    title: 'For Wisdom',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li wisdom waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me wisdom, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-160',
    title: 'For Strong memory',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li strong memory waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me strong memory, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-161',
    title: 'For Focus in study',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba focus in study waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of focus in study, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-162',
    title: 'For Acting upon knowledge',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka acting upon knowledge waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for acting upon knowledge, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-163',
    title: 'For Teaching goodness',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni teaching goodness waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me teaching goodness, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-164',
    title: 'For Clarity in learning',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li clarity in learning waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me clarity in learning, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-165',
    title: 'For Protection from useless knowledge',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li protection from useless knowledge waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me protection from useless knowledge, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-166',
    title: 'For Knowledge with humility',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba knowledge with humility waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of knowledge with humility, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-167',
    title: 'For Success in exams',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka success in exams wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for success in exams, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-168',
    title: 'For Love of learning',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni love of learning wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me love of learning, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-169',
    title: 'For Knowledge that benefits others',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li knowledge that benefits others wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me knowledge that benefits others, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-170',
    title: 'For Guidance through knowledge',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li guidance through knowledge wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me guidance through knowledge, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-171',
    title: 'For Sincere study',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba sincere study wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of sincere study, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-172',
    title: 'For Understanding hadith',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka understanding hadith wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for understanding hadith, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-173',
    title: 'For Good teachers',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni good teachers wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me good teachers, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-174',
    title: 'For Remembering what is learned',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li remembering what is learned wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me remembering what is learned, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-175',
    title: 'For Light of knowledge',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li light of knowledge wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me light of knowledge, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-176',
    title: 'For Knowledge and patience',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba knowledge and patience wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of knowledge and patience, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-177',
    title: 'For Truth over confusion',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka truth over confusion wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for truth over confusion, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-178',
    title: 'For Learning Arabic',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni learning Arabic wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me learning Arabic, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-179',
    title: 'For Learning religion',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li learning religion wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me learning religion, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-180',
    title: 'For Knowledge with action',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li knowledge with action wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me knowledge with action, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-181',
    title: 'For Wisdom in speech',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba wisdom in speech wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of wisdom in speech, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-182',
    title: 'For Correct understanding',
    category: 'Knowledge',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka correct understanding waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for correct understanding, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-183',
    title: 'For Protection from envy',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka protection from envy waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for protection from envy, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-184',
    title: 'For Protection from evil eye',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni protection from evil eye waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me protection from evil eye, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-185',
    title: 'For Protection from shaytan',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li protection from shaytan waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me protection from shaytan, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-186',
    title: 'For Protection from fear',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li protection from fear waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me protection from fear, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-187',
    title: 'For Protection from sadness',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba protection from sadness waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of protection from sadness, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-188',
    title: 'For Safety from harm',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka safety from harm waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for safety from harm, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-189',
    title: 'For Protection from bad decisions',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni protection from bad decisions waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me protection from bad decisions, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-190',
    title: 'For Safety from trials',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li safety from trials waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me safety from trials, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-191',
    title: 'For Protection from hidden evil',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li protection from hidden evil waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me protection from hidden evil, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-192',
    title: 'For Protection from hardship',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba protection from hardship waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of protection from hardship, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-193',
    title: 'For Protection from accidents',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka protection from accidents wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for protection from accidents, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-194',
    title: 'For Protection from enemies',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni protection from enemies wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me protection from enemies, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-195',
    title: 'For Protection from whispers',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li protection from whispers wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me protection from whispers, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-196',
    title: 'For Protection from pride',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li protection from pride wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me protection from pride, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-197',
    title: 'For Protection from hypocrisy',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba protection from hypocrisy wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of protection from hypocrisy, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-198',
    title: 'For Protection from anger',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka protection from anger wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for protection from anger, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-199',
    title: 'For Protection from laziness',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni protection from laziness wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me protection from laziness, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-200',
    title: 'For Protection from poverty',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li protection from poverty wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me protection from poverty, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-201',
    title: 'For Protection from illness',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li protection from illness wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me protection from illness, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-202',
    title: 'For Protection for home',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba protection for home wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of protection for home, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-203',
    title: 'For Protection for children',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka protection for children wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for protection for children, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-204',
    title: 'For Protection while sleeping',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni protection while sleeping wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me protection while sleeping, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-205',
    title: 'For Protection while traveling',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li protection while traveling wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me protection while traveling, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-206',
    title: 'For Protection from temptation',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li protection from temptation wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me protection from temptation, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-207',
    title: 'For Protection from fitnah',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba protection from fitnah wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of protection from fitnah, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-208',
    title: 'For Protection from regret',
    category: 'Protection',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka protection from regret waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for protection from regret, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-209',
    title: 'For Righteous spouse',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka righteous spouse waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for righteous spouse, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-210',
    title: 'For Love with mercy',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni love with mercy waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me love with mercy, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-211',
    title: 'For Peace between spouses',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li peace between spouses waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me peace between spouses, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-212',
    title: 'For Halal marriage',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li halal marriage waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me halal marriage, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-213',
    title: 'For Patience in marriage',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba patience in marriage waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of patience in marriage, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-214',
    title: 'For Healing relationship',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka healing relationship waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for healing relationship, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-215',
    title: 'For Barakah in marriage',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni barakah in marriage waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me barakah in marriage, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-216',
    title: 'For Trust and kindness',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li trust and kindness waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me trust and kindness, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-217',
    title: 'For Protection from conflict',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li protection from conflict waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me protection from conflict, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-218',
    title: 'For Family stability',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba family stability waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of family stability, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-219',
    title: 'For Forgiveness between spouses',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka forgiveness between spouses wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for forgiveness between spouses, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-220',
    title: 'For Soft speech',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni soft speech wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me soft speech, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-221',
    title: 'For Respect in marriage',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li respect in marriage wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me respect in marriage, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-222',
    title: 'For Mercy in the home',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li mercy in the home wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me mercy in the home, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-223',
    title: 'For Marital understanding',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba marital understanding wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of marital understanding, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-224',
    title: 'For Good companionship',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka good companionship wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for good companionship, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-225',
    title: 'For A peaceful nikah',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni a peaceful nikah wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me a peaceful nikah, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-226',
    title: 'For Removing jealousy',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li removing jealousy wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me removing jealousy, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-227',
    title: 'For Strengthening love',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li strengthening love wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me strengthening love, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-228',
    title: 'For Protecting the family',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba protecting the family wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of protecting the family, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-229',
    title: 'For Good communication',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka good communication wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for good communication, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-230',
    title: 'For Raising children together',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni raising children together wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me raising children together, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-231',
    title: 'For Sincere loyalty',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li sincere loyalty wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me sincere loyalty, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-232',
    title: 'For Patience in difficulties',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li patience in difficulties wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me patience in difficulties, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-233',
    title: 'For Love for Allah’s sake',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba love for Allah’s sake wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of love for Allah’s sake, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-234',
    title: 'For Marriage with sakinah',
    category: 'Marriage & Love',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka marriage with sakinah waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for marriage with sakinah, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-235',
    title: 'For Righteous children',
    category: 'Children',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka righteous children waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for righteous children, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-236',
    title: 'For Children’s protection',
    category: 'Children',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni children’s protection waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me children’s protection, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-237',
    title: 'For Children’s guidance',
    category: 'Children',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li children’s guidance waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me children’s guidance, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-238',
    title: 'For Children’s knowledge',
    category: 'Children',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li children’s knowledge waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me children’s knowledge, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-239',
    title: 'For Children’s good manners',
    category: 'Children',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba children’s good manners waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of children’s good manners, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-240',
    title: 'For Children’s success',
    category: 'Children',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka children’s success waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for children’s success, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-241',
    title: 'For Children’s health',
    category: 'Children',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni children’s health waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me children’s health, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-242',
    title: 'For Children’s faith',
    category: 'Children',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li children’s faith waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me children’s faith, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-243',
    title: 'For Children’s future',
    category: 'Children',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li children’s future waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me children’s future, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-244',
    title: 'For Children’s love of salah',
    category: 'Children',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba children’s love of salah waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of children’s love of salah, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-245',
    title: 'For Children’s Qur’an love',
    category: 'Children',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka children’s Qur’an love wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for children’s Qur’an love, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-246',
    title: 'For Children’s obedience to Allah',
    category: 'Children',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni children’s obedience to Allah wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me children’s obedience to Allah, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-247',
    title: 'For Children’s safety',
    category: 'Children',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li children’s safety wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me children’s safety, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-248',
    title: 'For Children’s good friends',
    category: 'Children',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li children’s good friends wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me children’s good friends, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-249',
    title: 'For Children’s soft hearts',
    category: 'Children',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba children’s soft hearts wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of children’s soft hearts, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-250',
    title: 'For Children’s patience',
    category: 'Children',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka children’s patience wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for children’s patience, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-251',
    title: 'For Children’s wisdom',
    category: 'Children',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni children’s wisdom wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me children’s wisdom, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-252',
    title: 'For Children’s protection from evil',
    category: 'Children',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li children’s protection from evil wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me children’s protection from evil, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-253',
    title: 'For Children’s beneficial knowledge',
    category: 'Children',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li children’s beneficial knowledge wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me children’s beneficial knowledge, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-254',
    title: 'For Children’s good character',
    category: 'Children',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba children’s good character wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of children’s good character, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-255',
    title: 'For Children’s happiness',
    category: 'Children',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka children’s happiness wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for children’s happiness, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-256',
    title: 'For Children’s gratitude',
    category: 'Children',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni children’s gratitude wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me children’s gratitude, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-257',
    title: 'For Children’s respect for parents',
    category: 'Children',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li children’s respect for parents wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me children’s respect for parents, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-258',
    title: 'For Children’s good ending',
    category: 'Children',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li children’s good ending wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me children’s good ending, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-259',
    title: 'For Children’s barakah',
    category: 'Children',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba children’s barakah wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of children’s barakah, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-260',
    title: 'For Children’s strong iman',
    category: 'Children',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka children’s strong iman waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for children’s strong iman, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-261',
    title: 'For Highest Paradise',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka highest Paradise waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for highest Paradise, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-262',
    title: 'For Protection from Hellfire',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni protection from Hellfire waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me protection from Hellfire, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-263',
    title: 'For Easy reckoning',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li easy reckoning waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me easy reckoning, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-264',
    title: 'For Shade on the Last Day',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li shade on the Last Day waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me shade on the Last Day, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-265',
    title: 'For Light on the bridge',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba light on the bridge waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of light on the bridge, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-266',
    title: 'For Accepted good deeds',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka accepted good deeds waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for accepted good deeds, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-267',
    title: 'For Firmness at death',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni firmness at death waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me firmness at death, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-268',
    title: 'For Mercy on Judgment Day',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li mercy on Judgment Day waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me mercy on Judgment Day, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-269',
    title: 'For Forgiveness before death',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li forgiveness before death waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me forgiveness before death, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-270',
    title: 'For Meeting Allah pleased',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba meeting Allah pleased waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of meeting Allah pleased, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-271',
    title: 'For Good ending',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka good ending wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for good ending, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-272',
    title: 'For Protection from grave punishment',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni protection from grave punishment wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me protection from grave punishment, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-273',
    title: 'For Light in the grave',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li light in the grave wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me light in the grave, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-274',
    title: 'For Companionship of the righteous',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li companionship of the righteous wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me companionship of the righteous, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-275',
    title: 'For Drinking from the Prophet’s fountain',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba drinking from the Prophet’s fountain wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of drinking from the Prophet’s fountain, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-276',
    title: 'For Forgiveness on the Last Day',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka forgiveness on the Last Day wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for forgiveness on the Last Day, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-277',
    title: 'For Rising with believers',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni rising with believers wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me rising with believers, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-278',
    title: 'For Safety from fear',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li safety from fear wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me safety from fear, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-279',
    title: 'For Paradise without punishment',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li Paradise without punishment wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me Paradise without punishment, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-280',
    title: 'For Nearness to Allah',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba nearness to Allah wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of nearness to Allah, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-281',
    title: 'For Accepted repentance before death',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka accepted repentance before death wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for accepted repentance before death, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-282',
    title: 'For Record in the right hand',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni record in the right hand wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me record in the right hand, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-283',
    title: 'For Ease in the grave',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li ease in the grave wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me ease in the grave, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-284',
    title: 'For Protection from regret',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li protection from regret wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me protection from regret, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-285',
    title: 'For Joy in Akhirah',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba joy in Akhirah wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of joy in Akhirah, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-286',
    title: 'For Eternal mercy',
    category: 'Jannah & Akhirah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka eternal mercy waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for eternal mercy, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-287',
    title: 'For Friday blessings',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka Friday blessings waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for Friday blessings, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-288',
    title: 'For Accepted dua on Friday',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni accepted dua on Friday waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me accepted dua on Friday, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-289',
    title: 'For Increased salawat',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li increased salawat waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me increased salawat, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-290',
    title: 'For Light between Fridays',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li light between Fridays waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me light between Fridays, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-291',
    title: 'For Forgiveness on Friday',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba forgiveness on Friday waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of forgiveness on Friday, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-292',
    title: 'For Barakah in Jumuah',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka barakah in Jumuah waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for barakah in Jumuah, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-293',
    title: 'For Good deeds on Friday',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni good deeds on Friday waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me good deeds on Friday, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-294',
    title: 'For Mercy on Friday',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li mercy on Friday waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me mercy on Friday, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-295',
    title: 'For Qur’an on Friday',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li Qur’an on Friday waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me Qur’an on Friday, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-296',
    title: 'For Peace on Friday',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba peace on Friday waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of peace on Friday, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-297',
    title: 'For Arriving early to Jumuah',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka arriving early to Jumuah wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for arriving early to Jumuah, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-298',
    title: 'For Listening to khutbah',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni listening to khutbah wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me listening to khutbah, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-299',
    title: 'For Accepted charity on Friday',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li accepted charity on Friday wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me accepted charity on Friday, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-300',
    title: 'For Family blessing on Friday',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li family blessing on Friday wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me family blessing on Friday, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-301',
    title: 'For Clean heart on Friday',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba clean heart on Friday wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of clean heart on Friday, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-302',
    title: 'For Duas before Maghrib',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka duas before Maghrib wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for duas before Maghrib, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-303',
    title: 'For Salawat with love',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni salawat with love wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me salawat with love, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-304',
    title: 'For Forgiveness between Fridays',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li forgiveness between Fridays wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me forgiveness between Fridays, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-305',
    title: 'For Jumuah unity',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li Jumuah unity wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me Jumuah unity, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-306',
    title: 'For Friday gratitude',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba Friday gratitude wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of Friday gratitude, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-307',
    title: 'For Friday mercy for parents',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka Friday mercy for parents wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for Friday mercy for parents, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-308',
    title: 'For Friday light in heart',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni Friday light in heart wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me Friday light in heart, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-309',
    title: 'For Friday protection',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li Friday protection wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me Friday protection, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-310',
    title: 'For Friday repentance',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li Friday repentance wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me Friday repentance, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-311',
    title: 'For Friday rizq',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba Friday rizq wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of Friday rizq, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-312',
    title: 'For Friday good ending',
    category: 'Friday',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka Friday good ending waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for Friday good ending, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-313',
    title: 'For Safe journey',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka safe journey waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for safe journey, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-314',
    title: 'For Safe return',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni safe return waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me safe return, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-315',
    title: 'For Protection on the road',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li protection on the road waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me protection on the road, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-316',
    title: 'For Barakah in travel',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li barakah in travel waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me barakah in travel, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-317',
    title: 'For Ease during movement',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba ease during movement waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of ease during movement, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-318',
    title: 'For Protection for family left behind',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka protection for family left behind waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for protection for family left behind, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-319',
    title: 'For Good companions',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni good companions waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me good companions, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-320',
    title: 'For Beneficial journey',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li beneficial journey waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me beneficial journey, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-321',
    title: 'For Safety in transport',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li safety in transport waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me safety in transport, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-322',
    title: 'For Return with reward',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba return with reward waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of return with reward, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-323',
    title: 'For Protection from travel hardship',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka protection from travel hardship wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for protection from travel hardship, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-324',
    title: 'For Guidance while away',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni guidance while away wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me guidance while away, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-325',
    title: 'For Halal purpose in travel',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li halal purpose in travel wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me halal purpose in travel, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-326',
    title: 'For Safe arrival',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li safe arrival wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me safe arrival, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-327',
    title: 'For Peace during flight',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ في والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba peace during flight wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of peace during flight, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-328',
    title: 'For Safety at night travel',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ في والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka safety at night travel wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for safety at night travel, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-329',
    title: 'For Barakah in destination',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ في والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni barakah in destination wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me barakah in destination, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-330',
    title: 'For Protection in unfamiliar places',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ في والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li protection in unfamiliar places wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me protection in unfamiliar places, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-331',
    title: 'For Ease at borders',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ في والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li ease at borders wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me ease at borders, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-332',
    title: 'For Safe luggage',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ في والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba safe luggage wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of safe luggage, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-333',
    title: 'For Patience during delay',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ في والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka patience during delay wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for patience during delay, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-334',
    title: 'For Kind people on journey',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ في والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni kind people on journey wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me kind people on journey, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-335',
    title: 'For Safe driving',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ في والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li safe driving wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me safe driving, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-336',
    title: 'For Protection from accidents',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ في والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li protection from accidents wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me protection from accidents, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-337',
    title: 'For Family reunion',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ في والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba family reunion wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of family reunion, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-338',
    title: 'For Returning with gratitude',
    category: 'Travel',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ في والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka returning with gratitude waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for returning with gratitude, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-339',
    title: 'For Relief from worry',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ في والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka relief from worry waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for relief from worry, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-340',
    title: 'For Peace in the heart',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ في والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni peace in the heart waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me peace in the heart, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-341',
    title: 'For Strength in sadness',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ في والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li strength in sadness waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me strength in sadness, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-342',
    title: 'For Hope after hardship',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ في والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li hope after hardship waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me hope after hardship, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-343',
    title: 'For Ease after difficulty',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ في والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba ease after difficulty waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of ease after difficulty, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-344',
    title: 'For Patience during pain',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ في والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka patience during pain waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for patience during pain, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-345',
    title: 'For Calmness during fear',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni calmness during fear waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me calmness during fear, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-346',
    title: 'For Trust in Allah',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li trust in Allah waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me trust in Allah, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-347',
    title: 'For Joy after tears',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li joy after tears waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me joy after tears, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-348',
    title: 'For Contentment with decree',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba contentment with decree waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of contentment with decree, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-349',
    title: 'For Removing anxiety',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka removing anxiety wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for removing anxiety, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-350',
    title: 'For Healing broken heart',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni healing broken heart wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me healing broken heart, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-351',
    title: 'For Strength in loneliness',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li strength in loneliness wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me strength in loneliness, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-352',
    title: 'For Relief from grief',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li relief from grief wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me relief from grief, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-353',
    title: 'For Light in darkness',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba light in darkness wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of light in darkness, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-354',
    title: 'For Hope in dua',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka hope in dua wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for hope in dua, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-355',
    title: 'For Patience in trials',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni patience in trials wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me patience in trials, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-356',
    title: 'For Courage in hardship',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li courage in hardship wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me courage in hardship, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-357',
    title: 'For Peace after confusion',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li peace after confusion wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me peace after confusion, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-358',
    title: 'For Certainty in Allah',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba certainty in Allah wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of certainty in Allah, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-359',
    title: 'For Comfort in loss',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka comfort in loss wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for comfort in loss, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-360',
    title: 'For Opening closed doors',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni opening closed doors wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me opening closed doors, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-361',
    title: 'For Removing heaviness',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li removing heaviness wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me removing heaviness, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-362',
    title: 'For Sabr with beauty',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li sabr with beauty wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me sabr with beauty, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-363',
    title: 'For Ease in the chest',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba ease in the chest wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of ease in the chest, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-364',
    title: 'For Smile after sadness',
    category: 'Joy & Distress',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka smile after sadness waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for smile after sadness, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-365',
    title: 'For Beneficial rain',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka beneficial rain waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for beneficial rain, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-366',
    title: 'For Protection from storms',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni protection from storms waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me protection from storms, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-367',
    title: 'For Barakah in crops',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li barakah in crops waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me barakah in crops, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-368',
    title: 'For Mercy through rain',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li mercy through rain waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me mercy through rain, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-369',
    title: 'For Safe weather',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba safe weather waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of safe weather, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-370',
    title: 'For Gratitude for creation',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka gratitude for creation waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for gratitude for creation, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-371',
    title: 'For Protection from drought',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni protection from drought waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me protection from drought, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-372',
    title: 'For Good harvest',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li good harvest waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me good harvest, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-373',
    title: 'For Clean water',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li clean water waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me clean water, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-374',
    title: 'For Earthly blessings',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba earthly blessings waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of earthly blessings, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-375',
    title: 'For Protection from flood',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka protection from flood wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for protection from flood, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-376',
    title: 'For Gentle wind',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni gentle wind wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me gentle wind, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-377',
    title: 'For Safe thunderstorm',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li safe thunderstorm wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me safe thunderstorm, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-378',
    title: 'For Beneficial sunlight',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li beneficial sunlight wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me beneficial sunlight, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-379',
    title: 'For Barakah in land',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba barakah in land wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of barakah in land, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-380',
    title: 'For Healthy environment',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka healthy environment wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for healthy environment, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-381',
    title: 'For Protection from heat',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni protection from heat wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me protection from heat, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-382',
    title: 'For Protection from cold',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li protection from cold wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me protection from cold, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-383',
    title: 'For Mercy in seasons',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li mercy in seasons wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me mercy in seasons, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-384',
    title: 'For Good climate',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba good climate wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of good climate, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-385',
    title: 'For Fruitful gardens',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka fruitful gardens wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for fruitful gardens, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-386',
    title: 'For Safe animals',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni safe animals wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me safe animals, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-387',
    title: 'For Pure air',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li pure air wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me pure air, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-388',
    title: 'For Rain after drought',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li rain after drought wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me rain after drought, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-389',
    title: 'For Gratitude for earth',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba gratitude for earth wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of gratitude for earth, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-390',
    title: 'For Protection from natural harm',
    category: 'Nature',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka protection from natural harm waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for protection from natural harm, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-391',
    title: 'For Barakah in food',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka barakah in food waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for barakah in food, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-392',
    title: 'For Gratitude after eating',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni gratitude after eating waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me gratitude after eating, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-393',
    title: 'For Halal food',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li halal food waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me halal food, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-394',
    title: 'For Protection from hunger',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li protection from hunger waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me protection from hunger, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-395',
    title: 'For Food for the needy',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba food for the needy waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of food for the needy, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-396',
    title: 'For Strength through food',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka strength through food waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for strength through food, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-397',
    title: 'For Pure provision',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni pure provision waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me pure provision, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-398',
    title: 'For Thankfulness for water',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li thankfulness for water waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me thankfulness for water, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-399',
    title: 'For Sharing meals',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li sharing meals waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me sharing meals, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-400',
    title: 'For Health through nourishment',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba health through nourishment waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of health through nourishment, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-401',
    title: 'For Barakah in cooking',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka barakah in cooking wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for barakah in cooking, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-402',
    title: 'For Feeding guests',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni feeding guests wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me feeding guests, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-403',
    title: 'For Protection from waste',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li protection from waste wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me protection from waste, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-404',
    title: 'For Contentment with simple food',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li contentment with simple food wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me contentment with simple food, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-405',
    title: 'For Food with gratitude',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba food with gratitude wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of food with gratitude, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-406',
    title: 'For Family meals',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka family meals wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for family meals, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-407',
    title: 'For Blessing in water',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni blessing in water wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me blessing in water, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-408',
    title: 'For Safe drinking',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li safe drinking wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me safe drinking, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-409',
    title: 'For Halal earnings for food',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li halal earnings for food wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me halal earnings for food, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-410',
    title: 'For Feeding children',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba feeding children wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of feeding children, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-411',
    title: 'For Feeding parents',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka feeding parents wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for feeding parents, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-412',
    title: 'For Food with remembrance',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni food with remembrance wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me food with remembrance, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-413',
    title: 'For Protection from overeating',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li protection from overeating wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me protection from overeating, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-414',
    title: 'For Strength for worship',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li strength for worship wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me strength for worship, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-415',
    title: 'For Barakah in table',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba barakah in table wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of barakah in table, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-416',
    title: 'For Sharing with neighbors',
    category: 'Food & Drinks',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka sharing with neighbors waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for sharing with neighbors, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-417',
    title: 'For Healing from sickness',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka healing from sickness waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for healing from sickness, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-418',
    title: 'For Patience during illness',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni patience during illness waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me patience during illness, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-419',
    title: 'For Mercy for the deceased',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li mercy for the deceased waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me mercy for the deceased, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-420',
    title: 'For Light in the grave',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li light in the grave waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me light in the grave, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-421',
    title: 'For A good ending',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba a good ending waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of a good ending, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-422',
    title: 'For Comfort after loss',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka comfort after loss waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for comfort after loss, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-423',
    title: 'For Reward during hardship',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni reward during hardship waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me reward during hardship, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-424',
    title: 'For Protection from grave punishment',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li protection from grave punishment waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me protection from grave punishment, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-425',
    title: 'For Wellbeing in body and heart',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li wellbeing in body and heart waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me wellbeing in body and heart, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-426',
    title: 'For Forgiveness for the dead',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba forgiveness for the dead waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of forgiveness for the dead, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-427',
    title: 'For Ease in pain',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka ease in pain wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for ease in pain, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-428',
    title: 'For Healing for parents',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni healing for parents wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me healing for parents, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-429',
    title: 'For Healing for children',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li healing for children wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me healing for children, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-430',
    title: 'For Strength for caregivers',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li strength for caregivers wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me strength for caregivers, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-431',
    title: 'For Patience for family',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba patience for family wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of patience for family, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-432',
    title: 'For Mercy at death',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka mercy at death wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for mercy at death, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-433',
    title: 'For Firm shahadah at death',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni firm shahadah at death wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me firm shahadah at death, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-434',
    title: 'For Forgiveness in illness',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li forgiveness in illness wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me forgiveness in illness, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-435',
    title: 'For Removing fever',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li removing fever wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me removing fever, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-436',
    title: 'For Healing of heart',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba healing of heart wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of healing of heart, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-437',
    title: 'For Healing of mind',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka healing of mind wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for healing of mind, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-438',
    title: 'For Protection from despair',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni protection from despair wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me protection from despair, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-439',
    title: 'For Gentle passing',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li gentle passing wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me gentle passing, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-440',
    title: 'For Comfort in grief',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li comfort in grief wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me comfort in grief, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-441',
    title: 'For Cure without trace',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba cure without trace wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of cure without trace, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-442',
    title: 'For Mercy for all deceased Muslims',
    category: 'Sickness & Death',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka mercy for all deceased Muslims waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for mercy for all deceased Muslims, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-443',
    title: 'For Good in this world and the next',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka good in this world and the next waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for good in this world and the next, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-444',
    title: 'For Accepted repentance',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni accepted repentance waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me accepted repentance, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-445',
    title: 'For Firm hearts',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li firm hearts waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me firm hearts, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-446',
    title: 'For Forgiveness for parents',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li forgiveness for parents waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me forgiveness for parents, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-447',
    title: 'For Mercy from Allah',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba mercy from Allah waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of mercy from Allah, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-448',
    title: 'For Patience during hardship',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka patience during hardship waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for patience during hardship, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-449',
    title: 'For Protection from the Fire',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni protection from the Fire waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me protection from the Fire, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-450',
    title: 'For Righteous family',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li righteous family waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me righteous family, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-451',
    title: 'For Victory over evil',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li victory over evil waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me victory over evil, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-452',
    title: 'For Guidance after belief',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba guidance after belief waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of guidance after belief, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-453',
    title: 'For Acceptance of deeds',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka acceptance of deeds wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for acceptance of deeds, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-454',
    title: 'For Forgiveness of sins',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni forgiveness of sins wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me forgiveness of sins, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-455',
    title: 'For Light of faith',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li light of faith wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me light of faith, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-456',
    title: 'For Safety from shame',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li safety from shame wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me safety from shame, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-457',
    title: 'For Mercy in weakness',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba mercy in weakness wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of mercy in weakness, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-458',
    title: 'For Steadfastness',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka steadfastness wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for steadfastness, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-459',
    title: 'For Pure offspring',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni pure offspring wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me pure offspring, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-460',
    title: 'For Protection from oppression',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li protection from oppression wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me protection from oppression, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-461',
    title: 'For Knowledge with faith',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li knowledge with faith wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me knowledge with faith, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-462',
    title: 'For Forgiveness for believers',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba forgiveness for believers wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of forgiveness for believers, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-463',
    title: 'For Safe return to Allah',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka safe return to Allah wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for safe return to Allah, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-464',
    title: 'For Accepting worship',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni accepting worship wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me accepting worship, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-465',
    title: 'For Patience and certainty',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li patience and certainty wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me patience and certainty, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-466',
    title: 'For Guidance for community',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li guidance for community wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me guidance for community, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-467',
    title: 'For Mercy in both worlds',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba mercy in both worlds wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of mercy in both worlds, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-468',
    title: 'For Faith until death',
    category: 'Rabbana',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka faith until death waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for faith until death, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-469',
    title: 'For Peace in the home',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka peace in the home waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for peace in the home, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-470',
    title: 'For Protection for family',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma arzuqni protection for family waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, grant me protection for family, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-471',
    title: 'For Love between spouses',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma hab li love between spouses waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, bestow upon me love between spouses, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-472',
    title: 'For Righteous children',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma ij’al li righteous children waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, make for me righteous children, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-473',
    title: 'For Blessing in a new home',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma iftah li abwaba blessing in a new home waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, open for me the doors of blessing in a new home, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-474',
    title: 'For Mercy for parents',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma inni as’aluka mercy for parents waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, I ask You for mercy for parents, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-475',
    title: 'For Unity between relatives',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma arzuqni unity between relatives waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, grant me unity between relatives, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-476',
    title: 'For Barakah in household',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma hab li barakah in household waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, bestow upon me barakah in household, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-477',
    title: 'For Safety when leaving home',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma ij’al li safety when leaving home waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, make for me safety when leaving home, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-478',
    title: 'For Guidance for family',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاجْعَلْهُ سَبَبًا لِرِضَاكَ وَجَنَّتِكَ',
    transliteration:
      'Allahumma iftah li abwaba guidance for family waj’alhu sababan li ridaka wa jannatik',
    translation:
      'O Allah, open for me the doors of guidance for family, and make it a means to Your pleasure and Paradise.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-479',
    title: 'For Forgiveness in family',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma inni as’aluka forgiveness in family wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, I ask You for forgiveness in family, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-480',
    title: 'For Kindness to parents',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma arzuqni kindness to parents wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, grant me kindness to parents, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-481',
    title: 'For Good neighbors',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma hab li good neighbors wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, bestow upon me good neighbors, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-482',
    title: 'For Protection from conflict',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma ij’al li protection from conflict wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, make for me protection from conflict, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-483',
    title: 'For Home full of Qur’an',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَاصْرِفْ عَنِّي كُلَّ سُوءٍ وَشَرٍّ',
    transliteration:
      'Allahumma iftah li abwaba home full of Qur’an wasrif anni kulla su’in wa sharr',
    translation:
      'O Allah, open for me the doors of home full of Qur’an, and turn away from me every evil and harm.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-484',
    title: 'For Home full of dhikr',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma inni as’aluka home full of dhikr wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, I ask You for home full of dhikr, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-485',
    title: 'For Family prayer',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma arzuqni family prayer wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, grant me family prayer, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-486',
    title: 'For Family patience',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma hab li family patience wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, bestow upon me family patience, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-487',
    title: 'For Family rizq',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma ij’al li family rizq wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, make for me family rizq, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-488',
    title: 'For Family health',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَثَبِّتْنِي عَلَى الْحَقِّ حَتَّى أَلْقَاكَ',
    transliteration:
      'Allahumma iftah li abwaba family health wa thabbitni alal-haqqi hatta alqak',
    translation:
      'O Allah, open for me the doors of family health, and keep me firm upon truth until I meet You.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-489',
    title: 'For Family love',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma inni as’aluka family love wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, I ask You for family love, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-490',
    title: 'For Family mercy',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ ارْزُقْنِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma arzuqni family mercy wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, grant me family mercy, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 1,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-491',
    title: 'For Family forgiveness',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ هَبْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma hab li family forgiveness wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, bestow upon me family forgiveness, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 3,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-492',
    title: 'For Home safety',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ اجْعَلْ لِي الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma ij’al li home safety wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, make for me home safety, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 7,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-493',
    title: 'For Home tranquility',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ الخيرَ والبركةَ وَبَارِكْ لِي فِيهِ يَا أَرْحَمَ الرَّاحِمِينَ',
    transliteration:
      'Allahumma iftah li abwaba home tranquility wa barik li fihi ya Arhamar-Rahimin',
    translation:
      'O Allah, open for me the doors of home tranquility, and bless it for me, O Most Merciful of those who show mercy.',
    when: 'Any time',
    repeat: 33,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  },
  {
    id: 'expanded-dua-494',
    title: 'For Home of iman',
    category: 'Home & Family',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الخيرَ والبركةَ وَاجْعَلْهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ',
    transliteration:
      'Allahumma inni as’aluka home of iman waj’alhu khalisan li wajhikal-kareem',
    translation:
      'O Allah, I ask You for home of iman, and make it sincere for Your noble Face.',
    when: 'Any time',
    repeat: 100,
    note: 'Additional personal dua for daily faith, worship, family, protection and closeness to Allah.',
  }
];

function normalizeText(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/[،.]/g, '')
    .trim()
    .toLowerCase();
}

function removeDuplicateDuas(items: DuaItem[]) {
  const seenIds = new Set<string>();
  const seenArabicInCategory = new Set<string>();

  return items.filter(item => {
    const idKey = item.id.trim();
    const arabicKey = `${item.category}-${normalizeText(item.arabic)}`;

    if (seenIds.has(idKey) || seenArabicInCategory.has(arabicKey)) {
      return false;
    }

    seenIds.add(idKey);
    seenArabicInCategory.add(arabicKey);
    return true;
  });
}
const ALL_DUAS: DuaItem[] = removeDuplicateDuas([
  ...CORE_DUAS,
  ...SALAH_DUAS,
  ...RAMADAN_DUAS,
  ...HOME_FAMILY_DUAS,
  ...SICKNESS_DEATH_DUAS,
  ...TRAVEL_DUAS,
  ...JANNAH_AKHIRAH_DUAS,
  ...RABBANA_DUAS,
  ...OTHER_DUAS,
  ...SUPPLEMENTARY_DUAS,
  ...EXPANDED_DUAS,
]);

const CATEGORIES = [
  'All',
  'Favorites',
  'Morning & Evening',
  'Ramadan',
  'Salah',
  'Praising Allah',
  'Seeking Forgiveness',
  'Wealth & Rizq',
  'Knowledge',
  'Protection',
  'Marriage & Love',
  'Children',
  'Jannah & Akhirah',
  'Friday',
  'Travel',
  'Joy & Distress',
  'Nature',
  'Food & Drinks',
  'Sickness & Death',
  'Rabbana',
  'Home & Family',
];

const MORNING_ROUTINE_IDS = [
  'surah-fatihah',
  'ayatul-kursi',
  'surah-ikhlas',
  'surah-falaq',
  'surah-nas',
  'wake-up',
  'morning-remembrance',
  'sayyidul-istighfar',
  'raditu-billah',
  'hasbiyallah-seven',
  'bismillah-protection',
  'praise-subhanallah-bihamdihi',
  'praise-salawat',
];

const EVENING_ROUTINE_IDS = [
  'surah-fatihah',
  'ayatul-kursi',
  'surah-ikhlas',
  'surah-falaq',
  'surah-nas',
  'evening-remembrance',
  'sayyidul-istighfar',
  'raditu-billah',
  'hasbiyallah-seven',
  'bismillah-protection',
  'before-sleep',
  'praise-salawat',
];

const REMINDER_ROUTINE_IDS = [
  'rabbana-atina',
  'forgiveness-astaghfirullah',
  'praise-salawat',
  'praise-subhanallah-bihamdihi',
  'sick-healing',
  'home-leaving-home',
];

function categoryIcon(category: string, color: string) {
  if (category === 'Morning & Evening') return <Sun size={16} color={color} />;
  if (category === 'Ramadan') return <Moon size={16} color={color} />;
  if (category === 'Salah') return <Moon size={16} color={color} />;
  if (category === 'Praising Allah') return <Sparkles size={16} color={color} />;
  if (category === 'Seeking Forgiveness') return <RotateCcw size={16} color={color} />;
  if (category === 'Wealth & Rizq') return <Sparkles size={16} color={color} />;
  if (category === 'Knowledge') return <BookOpen size={16} color={color} />;
  if (category === 'Protection') return <Shield size={16} color={color} />;
  if (category === 'Marriage & Love') return <Heart size={16} color={color} />;
  if (category === 'Children') return <Star size={16} color={color} />;
  if (category === 'Jannah & Akhirah') return <Moon size={16} color={color} />;
  if (category === 'Friday') return <Sun size={16} color={color} />;
  if (category === 'Travel') return <Plane size={16} color={color} />;
  if (category === 'Joy & Distress') return <HandHeart size={16} color={color} />;
  if (category === 'Nature') return <CloudRain size={16} color={color} />;
  if (category === 'Food & Drinks') return <Utensils size={16} color={color} />;
  if (category === 'Sickness & Death') return <HeartPulse size={16} color={color} />;
  if (category === 'Home & Family') return <Home size={16} color={color} />;
  if (category === 'Rabbana') return <BookOpen size={16} color={color} />;
  if (category === 'Favorites') return <Heart size={16} color={color} />;
  return <Shield size={16} color={color} />;
}

export default function AzkarDuaPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [selectedDua, setSelectedDua] = useState<DuaItem | null>(null);

  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [savedRoutines, setSavedRoutines] = useState<RoutineType[]>([]);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);

  const [activeRoutine, setActiveRoutine] = useState<RoutineType | null>(null);
  const [routineIndex, setRoutineIndex] = useState(0);
  const [routinePlaying, setRoutinePlaying] = useState(false);
  const [nowReciting, setNowReciting] = useState('');

  const loadSavedData = async () => {
    try {
      const fav = await AsyncStorage.getItem(STORAGE_FAVORITES);
      const count = await AsyncStorage.getItem(STORAGE_COUNTERS);
      const reminder = await AsyncStorage.getItem(STORAGE_REMINDERS);
      const routines = await AsyncStorage.getItem(STORAGE_SAVED_ROUTINES);
      const reciter = await AsyncStorage.getItem(STORAGE_RECITER);

      if (fav) setFavorites(JSON.parse(fav));
      if (count) setCounters(JSON.parse(count));
      if (reminder) setRemindersEnabled(JSON.parse(reminder));
      if (routines) setSavedRoutines(JSON.parse(routines));
      if (reciter) setSelectedReciter(reciter);
    } catch {}
  };

  useEffect(() => {
    loadSavedData();

    return () => {
      Speech.stop();
    };
  }, []);

  const saveFavorites = async (items: string[]) => {
    setFavorites(items);
    await AsyncStorage.setItem(STORAGE_FAVORITES, JSON.stringify(items));
  };

  const saveCounters = async (items: Record<string, number>) => {
    setCounters(items);
    await AsyncStorage.setItem(STORAGE_COUNTERS, JSON.stringify(items));
  };

  const saveSavedRoutines = async (items: RoutineType[]) => {
    setSavedRoutines(items);
    await AsyncStorage.setItem(STORAGE_SAVED_ROUTINES, JSON.stringify(items));
  };

  const saveReciter = async (reciter: string) => {
    setSelectedReciter(reciter);
    await AsyncStorage.setItem(STORAGE_RECITER, reciter);
  };

  const getRoutineIds = (routine: RoutineType) => {
    if (routine === 'morning') return MORNING_ROUTINE_IDS;
    if (routine === 'evening') return EVENING_ROUTINE_IDS;
    return REMINDER_ROUTINE_IDS;
  };

  const getRoutineDuas = (routine: RoutineType) => {
    return getRoutineIds(routine)
      .map(id => ALL_DUAS.find(item => item.id === id))
      .filter(Boolean) as DuaItem[];
  };

  const getReciterVoiceSettings = () => {
    if (selectedReciter.includes('Sudais')) return { rate: 0.68, pitch: 0.92 };
    if (selectedReciter.includes('Maher')) return { rate: 0.7, pitch: 0.96 };
    if (selectedReciter.includes('Ghamdi')) return { rate: 0.66, pitch: 0.9 };
    return { rate: 0.72, pitch: 1 };
  };

  const speakRoutineItem = (routine: RoutineType, index: number) => {
    const items = getRoutineDuas(routine);
    const item = items[index];

    if (!item) {
      setRoutinePlaying(false);
      setActiveRoutine(null);
      setRoutineIndex(0);
      setNowReciting('');
      Alert.alert('Completed 🌙', 'The recitation routine has finished.');
      return;
    }

    setActiveRoutine(routine);
    setRoutineIndex(index);
    setRoutinePlaying(true);
    setNowReciting(item.title);

    const repeatCount = Math.max(1, item.repeat || 1);
    const textToRead = Array.from({ length: repeatCount })
      .map(() => item.arabic)
      .join('\n\n');

    const voice = getReciterVoiceSettings();

    Speech.stop();
    Speech.speak(textToRead, {
      language: 'ar',
      rate: voice.rate,
      pitch: voice.pitch,
      onDone: () => {
        setTimeout(() => speakRoutineItem(routine, index + 1), 650);
      },
      onStopped: () => {
        setRoutinePlaying(false);
      },
      onError: () => {
        speakRoutineItem(routine, index + 1);
      },
    });
  };

  const startRoutine = (routine: RoutineType) => {
    speakRoutineItem(routine, 0);
  };

  const continueRoutine = () => {
    if (!activeRoutine) {
      Alert.alert('No Routine', 'Please start morning or evening recitation first.');
      return;
    }

    speakRoutineItem(activeRoutine, routineIndex);
  };

  const stopRoutine = () => {
    Speech.stop();
    setRoutinePlaying(false);
    setNowReciting('');
  };

  const toggleSavedRoutine = (routine: RoutineType) => {
    const updated = savedRoutines.includes(routine)
      ? savedRoutines.filter(item => item !== routine)
      : [...savedRoutines, routine];

    saveSavedRoutines(updated);
  };

  const toggleRecitationReminders = async (value: boolean) => {
    try {
      if (value) {
        const permission = await Notifications.requestPermissionsAsync();

        if (!permission.granted) {
          Alert.alert('Permission Needed', 'Please allow notifications.');
          return;
        }

        await Notifications.cancelAllScheduledNotificationsAsync();

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Morning Azkar Recitation 🌅',
            body: 'Begin your day with Qur’an, protection and remembrance.',
            sound: true,
            data: { routine: 'morning' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 6,
            minute: 0,
          },
        });

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Evening Azkar Recitation 🌙',
            body: 'End your day with protection, forgiveness and remembrance.',
            sound: true,
            data: { routine: 'evening' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 18,
            minute: 0,
          },
        });

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Islamic Reminder ✨',
            body: 'Take a peaceful moment for dhikr, salawat or istighfar.',
            sound: true,
            data: { routine: 'reminder' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 12,
            minute: 30,
          },
        });
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
        stopRoutine();
      }

      setRemindersEnabled(value);
      await AsyncStorage.setItem(STORAGE_REMINDERS, JSON.stringify(value));

      Alert.alert(
        value ? 'Notifications On' : 'Notifications Off',
        value
          ? 'Morning, evening and Islamic reminder notifications have been set.'
          : 'All azkar recitation notifications have been turned off.'
      );
    } catch {
      Alert.alert('Notification Error', 'Unable to update notifications.');
    }
  };

  const filteredDuas = useMemo(() => {
    const s = query.toLowerCase();

    return ALL_DUAS.filter(item => {
      const matchesCategory =
        category === 'All' ||
        item.category === category ||
        (category === 'Favorites' && favorites.includes(item.id));

      const matchesSearch =
        item.title.toLowerCase().includes(s) ||
        item.category.toLowerCase().includes(s) ||
        item.arabic.includes(query) ||
        item.transliteration.toLowerCase().includes(s) ||
        item.translation.toLowerCase().includes(s) ||
        item.when.toLowerCase().includes(s);

      return matchesCategory && matchesSearch;
    });
  }, [query, category, favorites]);

  const totalCompleted = Object.values(counters).reduce(
    (sum, value) => sum + value,
    0
  );

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter(item => item !== id)
      : [...favorites, id];

    saveFavorites(updated);
  };

  const incrementCounter = (id: string, repeat: number) => {
    const current = counters[id] || 0;
    const updated = { ...counters, [id]: current + 1 };

    saveCounters(updated);
    Vibration.vibrate(15);

    if (repeat > 0 && current + 1 === repeat) {
      Vibration.vibrate([0, 120, 80, 120]);
      Alert.alert('Completed 🌙', 'You completed the recommended repetition.');
    }
  };

  const decrementCounter = (id: string) => {
    const current = counters[id] || 0;
    saveCounters({ ...counters, [id]: Math.max(0, current - 1) });
  };

  const resetCounter = (id: string) => {
    saveCounters({ ...counters, [id]: 0 });
  };

  const speakArabic = (dua: DuaItem) => {
    const voice = getReciterVoiceSettings();

    Speech.stop();
    Speech.speak(dua.arabic, {
      language: 'ar',
      rate: voice.rate,
      pitch: voice.pitch,
    });
  };

  const speakEnglish = (dua: DuaItem) => {
    Speech.stop();
    Speech.speak(dua.translation, { language: 'en', rate: 0.85, pitch: 1 });
  };

  const stopAudio = () => {
    Speech.stop();
  };

  const shareDua = async (dua: DuaItem) => {
    await Share.share({
      message: `${dua.title}\n\nArabic:\n${dua.arabic}\n\nTransliteration:\n${dua.transliteration}\n\nEnglish:\n${dua.translation}\n\nWhen: ${dua.when}\nRepeat: ${
        dua.repeat || 'As much as possible'
      }`,
    });
  };

  const openRandomDua = () => {
    const random = ALL_DUAS[Math.floor(Math.random() * ALL_DUAS.length)];
    setSelectedDua(random);
  };

  const renderRoutineCard = () => {
    return (
      <LinearGradient colors={[CARD, '#F9F2DF']} style={styles.routineCard}>
        <View style={styles.routineHeader}>
          <View style={styles.routineIcon}>
            <Volume2 size={18} color="#FFFFFF" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.routineTitle}>Azkar Recitation & Reminders</Text>
            <Text style={styles.routineSubtitle}>
              Listen to the complete morning and evening azkar, choose a reciter style,
              and save your reminder preferences.
            </Text>
          </View>
        </View>

        <View style={styles.reminderSwitchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.reminderSwitchTitle}>Daily Azkar Notifications</Text>
            <Text style={styles.reminderSwitchText}>
              Morning, evening and Islamic reminder notifications.
            </Text>
          </View>

          <Switch
            value={remindersEnabled}
            onValueChange={toggleRecitationReminders}
            thumbColor={remindersEnabled ? GOLD : '#FFFFFF'}
            trackColor={{ false: '#D9CDB8', true: GREEN }}
          />
        </View>

        <Text style={styles.reciterLabel}>Reciter Style</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.reciterScroll}
        >
          {RECITERS.map(reciter => {
            const active = selectedReciter === reciter;

            return (
              <TouchableOpacity
                key={reciter}
                style={[styles.reciterPill, active && styles.reciterPillActive]}
                onPress={() => saveReciter(reciter)}
              >
                <Text style={[styles.reciterText, active && styles.reciterTextActive]}>
                  {reciter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {nowReciting ? (
          <View style={styles.nowRecitingBox}>
            <Text style={styles.nowRecitingTitle}>Now Reciting</Text>
            <Text style={styles.nowRecitingText}>{nowReciting}</Text>
            <Text style={styles.nowRecitingSub}>
              {routinePlaying ? 'Playing' : 'Paused'} • {selectedReciter}
            </Text>
          </View>
        ) : null}

        <View style={styles.routineButtonGrid}>
          <TouchableOpacity style={styles.routineButton} onPress={() => startRoutine('morning')}>
            <PlayCircle size={17} color="#FFFFFF" />
            <Text style={styles.routineButtonText}>Play Morning</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.routineButtonEvening}
            onPress={() => startRoutine('evening')}
          >
            <PlayCircle size={17} color="#FFFFFF" />
            <Text style={styles.routineButtonText}>Play Evening</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.routineSoftButton} onPress={continueRoutine}>
            <Volume2 size={17} color={GREEN} />
            <Text style={styles.routineSoftText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.routineSoftButton} onPress={stopRoutine}>
            <StopCircle size={17} color={ROSE} />
            <Text style={styles.routineSoftText}>Stop</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.saveRoutineRow}>
          {(['morning', 'evening', 'reminder'] as RoutineType[]).map(item => {
            const active = savedRoutines.includes(item);

            return (
              <TouchableOpacity
                key={item}
                style={[styles.saveRoutinePill, active && styles.saveRoutinePillActive]}
                onPress={() => toggleSavedRoutine(item)}
              >
                <Save size={14} color={active ? '#FFFFFF' : GREEN} />
                <Text style={[styles.saveRoutineText, active && styles.saveRoutineTextActive]}>
                  Save {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    );
  };

  const renderMushafAyahs = (
    dua: DuaItem,
    arabicStyle: object,
    ayahNumberStyle: object
  ) => {
    const ayahs = MUSHAF_AYAHS[dua.id] || [dua.arabic];

    return (
      <Text style={arabicStyle}>
        {ayahs.map((ayah, index) => (
          <React.Fragment key={`${dua.id}-${index}`}>
            {ayah}
            <Text style={ayahNumberStyle}>{` ۝${getMushafAyahNumber(dua.id, index)} `}</Text>
          </React.Fragment>
        ))}
      </Text>
    );
  };

  const renderArabicPreview = (dua: DuaItem) => {
    if (!isMushafDua(dua)) {
      return <Text style={styles.arabic}>{dua.arabic}</Text>;
    }

    return (
      <View style={styles.mushafPreviewFrame}>
        <View style={styles.mushafInnerBorder}>
          <View style={styles.mushafCornerTopLeft} />
          <View style={styles.mushafCornerTopRight} />
          {shouldShowMushafBismillah(dua.id) && (
            <View style={styles.mushafTopOrnament}>
              <View style={styles.mushafLine} />
              <Text style={styles.mushafBismillah}>﷽</Text>
              <View style={styles.mushafLine} />
            </View>
          )}
          {renderMushafAyahs(
            dua,
            styles.mushafArabicPreview,
            styles.mushafAyahNumberPreview
          )}
          <View style={styles.mushafBottomOrnament}>
            <View style={styles.mushafDot} />
            <View style={styles.mushafSmallLine} />
            <View style={styles.mushafDot} />
          </View>
        </View>
      </View>
    );
  };

  const renderArabicDetail = (dua: DuaItem) => {
    if (!isMushafDua(dua)) {
      return <Text style={styles.detailArabic}>{dua.arabic}</Text>;
    }

    return (
      <View style={styles.mushafDetailFrame}>
        <View style={styles.mushafDetailInnerBorder}>
          <View style={styles.mushafDetailCornerTopLeft} />
          <View style={styles.mushafDetailCornerTopRight} />
          <View style={styles.mushafDetailCornerBottomLeft} />
          <View style={styles.mushafDetailCornerBottomRight} />
          {shouldShowMushafBismillah(dua.id) && (
            <View style={styles.mushafDetailHeader}>
              <View style={styles.mushafDetailLine} />
              <Text style={styles.mushafDetailBismillah}>﷽</Text>
              <View style={styles.mushafDetailLine} />
            </View>
          )}
          {renderMushafAyahs(
            dua,
            styles.mushafArabicDetail,
            styles.mushafAyahNumberDetail
          )}
          <View style={styles.mushafDetailFooter}>
            <View style={styles.mushafDetailDot} />
            <View style={styles.mushafDetailSmallLine} />
            <View style={styles.mushafDetailDot} />
          </View>
        </View>
      </View>
    );
  };

  if (selectedDua) {
    const current = counters[selectedDua.id] || 0;
    const progress =
      selectedDua.repeat > 0
        ? Math.min(100, Math.round((current / selectedDua.repeat) * 100))
        : 0;

    const saved = favorites.includes(selectedDua.id);

    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <View style={styles.detailHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              stopAudio();
              setSelectedDua(null);
            }}
          >
            <ArrowLeft size={22} color={GREEN} />
          </TouchableOpacity>

          <Text style={styles.detailHeaderTitle}>Full Dua</Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => toggleFavorite(selectedDua.id)}
          >
            {saved ? (
              <HeartOff size={22} color={ROSE} />
            ) : (
              <Heart size={22} color={GREEN} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
        >
          <LinearGradient colors={[GREEN, EMERALD]} style={styles.detailHero}>
            <Text style={styles.detailTitle}>{selectedDua.title}</Text>
            <Text style={styles.detailWhen}>{selectedDua.when}</Text>
          </LinearGradient>

          <LinearGradient colors={[CARD, '#F9F2DF']} style={styles.detailCard}>
            <Text style={styles.label}>Arabic</Text>
            {renderArabicDetail(selectedDua)}

            <View style={styles.audioRow}>
              <TouchableOpacity
                style={styles.audioButton}
                onPress={() => speakArabic(selectedDua)}
              >
                <Volume2 size={17} color="#FFFFFF" />
                <Text style={styles.audioText}>Listen Arabic</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.stopButton} onPress={stopAudio}>
                <PauseCircle size={17} color={GREEN} />
                <Text style={styles.stopText}>Stop</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Transliteration</Text>
            <Text style={styles.detailTransliteration}>
              {selectedDua.transliteration}
            </Text>

            <Text style={styles.label}>English Translation</Text>
            <Text style={styles.detailTranslation}>
              {selectedDua.translation}
            </Text>

            <TouchableOpacity
              style={styles.audioButtonEnglish}
              onPress={() => speakEnglish(selectedDua)}
            >
              <Volume2 size={17} color="#FFFFFF" />
              <Text style={styles.audioText}>Listen English</Text>
            </TouchableOpacity>

            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Clock size={13} color={GREEN} />
                <Text style={styles.metaText}>{selectedDua.when}</Text>
              </View>

              <View style={styles.metaPill}>
                <RotateCcw size={13} color={GREEN} />
                <Text style={styles.metaText}>
                  {selectedDua.repeat > 0 ? `${selectedDua.repeat}x` : 'Repeat often'}
                </Text>
              </View>
            </View>

            <Text style={styles.note}>{selectedDua.note}</Text>

            {selectedDua.repeat > 1 && (
              <>
                <View style={styles.progressOuter}>
                  <View style={[styles.progressInner, { width: `${progress}%` }]} />
                </View>

                <Text style={styles.counterText}>
                  {current} / {selectedDua.repeat} completed
                </Text>

                <View style={styles.counterActions}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => decrementCounter(selectedDua.id)}
                  >
                    <Minus size={16} color={GREEN} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.countButton}
                    onPress={() => incrementCounter(selectedDua.id, selectedDua.repeat)}
                  >
                    <Plus size={17} color="#FFFFFF" />
                    <Text style={styles.countButtonText}>Count</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => resetCounter(selectedDua.id)}
                  >
                    <RotateCcw size={16} color={GREEN} />
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => shareDua(selectedDua)}
            >
              <Share2 size={16} color="#FFFFFF" />
              <Text style={styles.shareText}>Share Dua</Text>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={[GREEN, EMERALD]} style={styles.hero}>
          <View style={styles.heroBadge}>
            <Sparkles size={13} color={GOLD} />
            <Text style={styles.heroBadgeText}>Complete Dua Collection</Text>
          </View>

          <Text style={styles.heroTitle}>Azkar & Duas</Text>

          <Text style={styles.heroSubtitle}>
            A refined Islamic dua library for Ramadan, salah, protection, home,
            family, sickness, death, travel and Akhirah.
          </Text>

          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroButtonGold} onPress={openRandomDua}>
              <Star size={17} color="#FFFFFF" />
              <Text style={styles.heroButtonText}>Open Random Dua</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <BookOpen size={18} color={GOLD} />
            <Text style={styles.statNumber}>{ALL_DUAS.length}</Text>
            <Text style={styles.statLabel}>Duas</Text>
          </View>

          <View style={styles.statCard}>
            <Heart size={18} color={GOLD} />
            <Text style={styles.statNumber}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>

          <View style={styles.statCard}>
            <CheckCircle size={18} color={GOLD} />
            <Text style={styles.statNumber}>{totalCompleted}</Text>
            <Text style={styles.statLabel}>Counted</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Search size={18} color={GREEN} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dua, Arabic, meaning or category..."
            placeholderTextColor="#8A8172"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {CATEGORIES.map(item => {
            const active = item === category;

            return (
              <TouchableOpacity
                key={item}
                style={[styles.categoryPill, active && styles.categoryPillActive]}
                onPress={() => setCategory(item)}
              >
                {categoryIcon(item, active ? '#FFFFFF' : GREEN)}
                <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {category === 'Morning & Evening' && renderRoutineCard()}

        <View style={styles.sectionHeader}>
          <Filter size={18} color={GOLD} />
          <Text style={styles.sectionTitle}>Dua Collection</Text>
        </View>

        {filteredDuas.map(dua => {
          const saved = favorites.includes(dua.id);

          return (
            <LinearGradient
              key={dua.id}
              colors={[CARD, '#F9F2DF']}
              style={styles.duaCard}
            >
              <View style={styles.duaTopClean}>
                <Text style={styles.duaTitle}>{dua.title}</Text>

                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => toggleFavorite(dua.id)}
                >
                  {saved ? (
                    <HeartOff size={20} color={ROSE} />
                  ) : (
                    <Heart size={20} color={GREEN} />
                  )}
                </TouchableOpacity>
              </View>

              {renderArabicPreview(dua)}

              <Text style={styles.previewEnglish} numberOfLines={3}>
                {dua.translation}
              </Text>

              <TouchableOpacity
                style={styles.openFullButton}
                onPress={() => setSelectedDua(dua)}
              >
                <Text style={styles.openFullText}>Open full dua</Text>
                <Volume2 size={16} color={GOLD} />
              </TouchableOpacity>
            </LinearGradient>
          );
        })}

        <LinearGradient colors={[GREEN, EMERALD]} style={styles.footerCard}>
          <CheckCircle size={28} color={GOLD} />
          <Text style={styles.footerTitle}>Daily Azkar Plan</Text>
          <Text style={styles.footerText}>
            Begin with morning azkar, remember Allah after salah, use daily-life duas,
            and end the day with evening and sleep adhkar.
          </Text>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CREAM,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 36,
    paddingBottom: 46,
  },

  hero: {
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
    shadowColor: GREEN,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 5,
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  heroBadgeText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  heroSubtitle: {
    color: '#E6FFF4',
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '700',
    maxWidth: 310,
  },

  heroActions: {
    flexDirection: 'row',
    marginTop: 11,
    justifyContent: 'center',
  },

  heroButtonGold: {
    backgroundColor: GOLD,
    borderRadius: 15,
    paddingVertical: 9,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginLeft: 7,
    fontSize: 12,
  },

  routineCard: {
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9DEC6',
    marginBottom: 12,
    shadowColor: '#2B2110',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },

  routineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  routineIcon: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  routineTitle: {
    color: GREEN,
    fontSize: 15,
    fontWeight: '900',
  },

  routineSubtitle: {
    color: '#746A5D',
    fontSize: 11.3,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 4,
  },

  reminderSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SOFT_GOLD,
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
  },

  reminderSwitchTitle: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '900',
  },

  reminderSwitchText: {
    color: '#746A5D',
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 3,
  },

  reciterLabel: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
  },

  reciterScroll: {
    marginBottom: 11,
  },

  reciterPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginRight: 8,
  },

  reciterPillActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  reciterText: {
    color: GREEN,
    fontSize: 10.3,
    fontWeight: '900',
  },

  reciterTextActive: {
    color: '#FFFFFF',
  },

  nowRecitingBox: {
    backgroundColor: SOFT_GOLD,
    borderRadius: 17,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1D2AD',
  },

  nowRecitingTitle: {
    color: '#8B5E16',
    fontSize: 10.4,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  nowRecitingText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },

  nowRecitingSub: {
    color: '#746A5D',
    fontSize: 9.5,
    fontWeight: '800',
    marginTop: 2,
  },

  routineButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  routineButton: {
    width: '48.5%',
    backgroundColor: GREEN,
    borderRadius: 15,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },

  routineButtonEvening: {
    width: '48.5%',
    backgroundColor: '#243B55',
    borderRadius: 15,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },

  routineButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  routineSoftButton: {
    width: '48.5%',
    backgroundColor: MINT,
    borderRadius: 15,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },

  routineSoftText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  saveRoutineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 3,
  },

  saveRoutinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  saveRoutinePillActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  saveRoutineText: {
    color: GREEN,
    fontSize: 10.3,
    fontWeight: '900',
    marginLeft: 5,
  },

  saveRoutineTextActive: {
    color: '#FFFFFF',
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  statCard: {
    width: '32%',
    backgroundColor: CARD,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9DEC6',
    shadowColor: '#2B2110',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  statNumber: {
    color: GREEN,
    fontSize: 13.5,
    fontWeight: '900',
    marginTop: 4,
  },

  statLabel: {
    color: '#746A5D',
    fontSize: 9.5,
    fontWeight: '800',
    marginTop: 2,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 17,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E9DEC6',
    marginBottom: 11,
    shadowColor: '#2B2110',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  searchInput: {
    flex: 1,
    color: GREEN,
    fontWeight: '800',
    marginLeft: 8,
  },

  categoryScroll: {
    marginBottom: 15,
  },

  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: '#E9DEC6',
    marginRight: 7,
  },

  categoryPillActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  categoryText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  categoryTextActive: {
    color: '#FFFFFF',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 2,
  },

  sectionTitle: {
    color: GREEN,
    fontSize: 14.5,
    fontWeight: '900',
    marginLeft: 6,
  },

  duaCard: {
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9DEC6',
    marginBottom: 11,
    shadowColor: '#2B2110',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },

  duaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  duaCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SOFT_GOLD,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },

  duaCategoryText: {
    color: '#8B5E16',
    fontSize: 10.5,
    fontWeight: '900',
    marginLeft: 5,
  },

  duaTitle: {
    color: GREEN,
    fontSize: 16.5,
    fontWeight: '900',
    marginTop: 8,
  },

  arabic: {
    color: GREEN,
    fontSize: 21,
    lineHeight: 34,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontWeight: '900',
    marginTop: 9,
  },

  duaTopClean: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  favoriteButton: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: 'rgba(230,241,236,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(6,78,59,0.08)',
  },

  mushafPreviewFrame: {
    marginTop: 10,
    borderRadius: 24,
    padding: 6,
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: '#E0C36E',
    shadowColor: '#8B5E16',
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 14,
    elevation: 3,
  },

  mushafInnerBorder: {
    borderRadius: 19,
    paddingVertical: 15,
    paddingHorizontal: 13,
    backgroundColor: '#FFFCF3',
    borderWidth: 1,
    borderColor: 'rgba(139,94,22,0.20)',
    overflow: 'hidden',
  },

  mushafCornerTopLeft: {
    position: 'absolute',
    top: 7,
    left: 7,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#D4A017',
    borderTopLeftRadius: 12,
    opacity: 0.75,
  },

  mushafCornerTopRight: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#D4A017',
    borderTopRightRadius: 12,
    opacity: 0.75,
  },

  mushafTopOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  mushafLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D8B85A',
    opacity: 0.65,
  },

  mushafBismillah: {
    color: '#8B5E16',
    fontSize: 21,
    fontWeight: '900',
    marginHorizontal: 11,
    textAlign: 'center',
    textShadowColor: 'rgba(212,160,23,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  mushafArabicPreview: {
    color: '#153A30',
    fontSize: 23.5,
    lineHeight: 47,
    textAlign: 'center',
    writingDirection: 'rtl',
    fontWeight: '900',
    letterSpacing: 0.12,
  },

  mushafAyahNumberPreview: {
    color: '#B98512',
    fontSize: 17,
    lineHeight: 47,
    fontWeight: '900',
  },

  mushafBottomOrnament: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mushafSmallLine: {
    width: 54,
    height: 1,
    backgroundColor: '#D8B85A',
    opacity: 0.55,
    marginHorizontal: 8,
  },

  mushafDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#D4A017',
    opacity: 0.8,
  },

  previewEnglish: {
    color: DARK,
    fontSize: 11.3,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 6,
  },

  openFullButton: {
    marginTop: 10,
    backgroundColor: MINT,
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  openFullText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '900',
  },

  detailHeader: {
    height: 74,
    paddingTop: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 15,
    backgroundColor: CARD,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9DEC6',
  },

  detailHeaderTitle: {
    color: GREEN,
    fontSize: 18,
    fontWeight: '900',
  },

  detailHero: {
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
    shadowColor: GREEN,
    shadowOpacity: 0.13,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  duaCategoryWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },

  duaCategoryWhiteText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  detailTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 11,
  },

  detailWhen: {
    color: '#E6FFF4',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },

  detailCard: {
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E9DEC6',
    shadowColor: '#2B2110',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  label: {
    color: GREEN,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 6,
  },

  detailArabic: {
    color: GREEN,
    fontSize: 25,
    lineHeight: 42,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontWeight: '900',
  },

  mushafDetailFrame: {
    borderRadius: 30,
    padding: 7,
    backgroundColor: '#FFF5DD',
    borderWidth: 1.2,
    borderColor: '#D7B861',
    shadowColor: '#8B5E16',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 4,
  },

  mushafDetailInnerBorder: {
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 17,
    backgroundColor: '#FFFCF3',
    borderWidth: 1,
    borderColor: 'rgba(139,94,22,0.22)',
    overflow: 'hidden',
  },

  mushafDetailCornerTopLeft: {
    position: 'absolute',
    top: 9,
    left: 9,
    width: 34,
    height: 34,
    borderTopWidth: 2.2,
    borderLeftWidth: 2.2,
    borderColor: '#D4A017',
    borderTopLeftRadius: 16,
    opacity: 0.78,
  },

  mushafDetailCornerTopRight: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 34,
    height: 34,
    borderTopWidth: 2.2,
    borderRightWidth: 2.2,
    borderColor: '#D4A017',
    borderTopRightRadius: 16,
    opacity: 0.78,
  },

  mushafDetailCornerBottomLeft: {
    position: 'absolute',
    bottom: 9,
    left: 9,
    width: 34,
    height: 34,
    borderBottomWidth: 2.2,
    borderLeftWidth: 2.2,
    borderColor: '#D4A017',
    borderBottomLeftRadius: 16,
    opacity: 0.65,
  },

  mushafDetailCornerBottomRight: {
    position: 'absolute',
    bottom: 9,
    right: 9,
    width: 34,
    height: 34,
    borderBottomWidth: 2.2,
    borderRightWidth: 2.2,
    borderColor: '#D4A017',
    borderBottomRightRadius: 16,
    opacity: 0.65,
  },

  mushafDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  mushafDetailLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D8B85A',
    opacity: 0.6,
  },

  mushafDetailBismillah: {
    color: '#8B5E16',
    fontSize: 27,
    fontWeight: '900',
    marginHorizontal: 13,
    textAlign: 'center',
    textShadowColor: 'rgba(212,160,23,0.22)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  mushafArabicDetail: {
    color: '#153A30',
    fontSize: 30,
    lineHeight: 58,
    textAlign: 'center',
    writingDirection: 'rtl',
    fontWeight: '900',
    letterSpacing: 0.1,
  },

  mushafAyahNumberDetail: {
    color: '#B98512',
    fontSize: 20,
    lineHeight: 58,
    fontWeight: '900',
  },

  mushafDetailFooter: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mushafDetailSmallLine: {
    width: 82,
    height: 1,
    backgroundColor: '#D8B85A',
    opacity: 0.58,
    marginHorizontal: 10,
  },

  mushafDetailDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#D4A017',
    opacity: 0.85,
  },

  detailTransliteration: {
    color: GOLD,
    fontSize: 12.5,
    lineHeight: 20,
    fontWeight: '900',
  },

  detailTranslation: {
    color: '#34312C',
    fontSize: 12.5,
    lineHeight: 20,
    fontWeight: '700',
  },

  audioRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 13,
    marginBottom: 4,
  },

  audioButton: {
    flex: 1,
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  audioButtonEnglish: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },

  audioText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 6,
  },

  stopButton: {
    flex: 1,
    backgroundColor: MINT,
    borderRadius: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  stopText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 6,
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },

  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MINT,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginRight: 7,
    marginBottom: 7,
  },

  metaText: {
    color: GREEN,
    fontSize: 10.5,
    fontWeight: '900',
    marginLeft: 5,
  },

  note: {
    color: '#8A6A22',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
    lineHeight: 17,
  },

  progressOuter: {
    width: '100%',
    height: 12,
    backgroundColor: '#E8DFC8',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 13,
  },

  progressInner: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 999,
  },

  counterText: {
    color: GREEN,
    fontSize: 11.5,
    fontWeight: '900',
    marginTop: 8,
  },

  counterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  counterButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: MINT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },

  countButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 7,
  },

  countButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginLeft: 6,
  },

  shareButton: {
    backgroundColor: GREEN,
    borderRadius: 15,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 11,
  },

  shareText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 7,
  },

  footerCard: {
    borderRadius: 24,
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },

  footerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 7,
  },

  footerText: {
    color: '#E6FFF4',
    fontSize: 11.3,
    lineHeight: 17,
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 6,
  },
});