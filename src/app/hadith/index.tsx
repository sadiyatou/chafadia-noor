import React, { useEffect, useMemo, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import {
  BookOpen,
  Search,
  Heart,
  HeartOff,
  Star,
  Bell,
  Share2,
  Sparkles,
  ShieldCheck,
  Moon,
  Filter,
  Clock,
  Award,
  Feather,
} from 'lucide-react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type Hadith = {
  id: string;
  collection: string;
  book: string;
  number: string;
  arabic: string;
  english: string;
  narrator: string;
  grade: string;
  topic: string;
};

const STORAGE_FAVORITES = 'CHAFADIA_HADITH_FAVORITES';

const HADITHS: Hadith[] = [
  {
    id: 'nawawi-1',
    collection: '40 Hadith Nawawi',
    book: 'Intentions',
    number: '1',
    narrator: 'Umar ibn al-Khattab رضي الله عنه',
    grade: 'Sahih',
    topic: 'Intentions',
    arabic:
      'عَنْ أَمِيرِ الْمُؤْمِنِينَ أَبِي حَفْصٍ عُمَرَ بْنِ الْخَطَّابِ رضي الله عنه قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.',
    english:
      'The Messenger of Allah ﷺ taught that actions are judged by intentions, and every person will receive according to what they intended. Whoever migrated for Allah and His Messenger, then their migration was truly for Allah and His Messenger. Whoever migrated for worldly gain, status, wealth, or marriage, then their migration was for what they intended. This hadith teaches sincerity, purity of heart, and doing every action for Allah.',
  },
  {
    id: 'nawawi-2',
    collection: '40 Hadith Nawawi',
    book: 'Islam, Iman and Ihsan',
    number: '2',
    narrator: 'Umar ibn al-Khattab رضي الله عنه',
    grade: 'Sahih',
    topic: 'Faith',
    arabic:
      'عَنْ عُمَرَ رضي الله عنه قَالَ: بَيْنَمَا نَحْنُ جُلُوسٌ عِنْدَ رَسُولِ اللَّهِ ﷺ ذَاتَ يَوْمٍ إِذْ طَلَعَ عَلَيْنَا رَجُلٌ شَدِيدُ بَيَاضِ الثِّيَابِ، شَدِيدُ سَوَادِ الشَّعْرِ، لاَ يُرَى عَلَيْهِ أَثَرُ السَّفَرِ، وَلاَ يَعْرِفُهُ مِنَّا أَحَدٌ، حَتَّى جَلَسَ إِلَى النَّبِيِّ ﷺ، فَأَسْنَدَ رُكْبَتَيْهِ إِلَى رُكْبَتَيْهِ، وَوَضَعَ كَفَّيْهِ عَلَى فَخِذَيْهِ، وَقَالَ: يَا مُحَمَّدُ أَخْبِرْنِي عَنِ الإِسْلاَمِ. فَقَالَ رَسُولُ اللَّهِ ﷺ: الإِسْلاَمُ أَنْ تَشْهَدَ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَتُقِيمَ الصَّلاَةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ الْبَيْتَ إِنِ اسْتَطَعْتَ إِلَيْهِ سَبِيلاً. قَالَ: صَدَقْتَ. قَالَ: فَأَخْبِرْنِي عَنِ الإِيمَانِ. قَالَ: أَنْ تُؤْمِنَ بِاللَّهِ، وَمَلاَئِكَتِهِ، وَكُتُبِهِ، وَرُسُلِهِ، وَالْيَوْمِ الآخِرِ، وَتُؤْمِنَ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ. قَالَ: صَدَقْتَ. قَالَ: فَأَخْبِرْنِي عَنِ الإِحْسَانِ. قَالَ: أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ. ثُمَّ انْطَلَقَ، فَلَبِثْتُ مَلِيًّا، ثُمَّ قَالَ: يَا عُمَرُ أَتَدْرِي مَنِ السَّائِلُ؟ قُلْتُ: اللَّهُ وَرَسُولُهُ أَعْلَمُ. قَالَ: فَإِنَّهُ جِبْرِيلُ أَتَاكُمْ يُعَلِّمُكُمْ دِينَكُمْ.',
    english:
      'Jibril came to the Prophet ﷺ in the form of a man and asked about Islam, Iman, Ihsan, the Hour, and its signs. The Prophet ﷺ explained the pillars of Islam, the pillars of faith, and excellence in worship. Ihsan is to worship Allah as though you see Him, and if you do not see Him, know that He sees you. This hadith is a complete map of the religion.',
  },
  {
    id: 'nawawi-3',
    collection: '40 Hadith Nawawi',
    book: 'Pillars of Islam',
    number: '3',
    narrator: 'Abdullah ibn Umar رضي الله عنهما',
    grade: 'Sahih',
    topic: 'Faith',
    arabic:
      'عَنْ أَبِي عَبْدِ الرَّحْمَنِ عَبْدِ اللَّهِ بْنِ عُمَرَ بْنِ الْخَطَّابِ رضي الله عنهما قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ الْبَيْتِ، وَصَوْمِ رَمَضَانَ.',
    english:
      'Islam is built upon five foundations: testifying that there is no deity worthy of worship except Allah and that Muhammad ﷺ is His Messenger, establishing prayer, giving zakah, performing Hajj, and fasting Ramadan. These pillars support the Muslim’s life and faith.',
  },
  {
    id: 'nawawi-4',
    collection: '40 Hadith Nawawi',
    book: 'Creation and Decree',
    number: '4',
    narrator: 'Abdullah ibn Masud رضي الله عنه',
    grade: 'Sahih',
    topic: 'Faith',
    arabic:
      'عَنْ أَبِي عَبْدِ الرَّحْمَنِ عَبْدِ اللَّهِ بْنِ مَسْعُودٍ رضي الله عنه قَالَ: حَدَّثَنَا رَسُولُ اللَّهِ ﷺ وَهُوَ الصَّادِقُ الْمَصْدُوقُ: إِنَّ أَحَدَكُمْ يُجْمَعُ خَلْقُهُ فِي بَطْنِ أُمِّهِ أَرْبَعِينَ يَوْمًا نُطْفَةً، ثُمَّ يَكُونُ عَلَقَةً مِثْلَ ذَلِكَ، ثُمَّ يَكُونُ مُضْغَةً مِثْلَ ذَلِكَ، ثُمَّ يُرْسَلُ إِلَيْهِ الْمَلَكُ فَيَنْفُخُ فِيهِ الرُّوحَ، وَيُؤْمَرُ بِأَرْبَعِ كَلِمَاتٍ: بِكَتْبِ رِزْقِهِ، وَأَجَلِهِ، وَعَمَلِهِ، وَشَقِيٌّ أَوْ سَعِيدٌ.',
    english:
      'The Prophet ﷺ described the stages of human creation in the womb, then the angel writes four matters: provision, lifespan, deeds, and final outcome. This hadith teaches belief in decree, humility, fear of a bad ending, hope in Allah, and the need to remain steadfast.',
  },
  {
    id: 'nawawi-5',
    collection: '40 Hadith Nawawi',
    book: 'Innovation',
    number: '5',
    narrator: 'Aisha رضي الله عنها',
    grade: 'Sahih',
    topic: 'Sunnah',
    arabic:
      'عَنْ أُمِّ الْمُؤْمِنِينَ أُمِّ عَبْدِ اللَّهِ عَائِشَةَ رضي الله عنها قَالَتْ: قَالَ رَسُولُ اللَّهِ ﷺ: مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ. وَفِي رِوَايَةٍ لِمُسْلِمٍ: مَنْ عَمِلَ عَمَلاً لَيْسَ عَلَيْهِ أَمْرُنَا فَهُوَ رَدٌّ.',
    english:
      'Whoever introduces into this religion something that is not from it, it will be rejected. This hadith protects Islam from invented worship and teaches that religious acts must follow the Quran and authentic Sunnah.',
  },
  {
    id: 'nawawi-6',
    collection: '40 Hadith Nawawi',
    book: 'Halal and Haram',
    number: '6',
    narrator: 'Numan ibn Bashir رضي الله عنه',
    grade: 'Sahih',
    topic: 'Halal',
    arabic:
      'عَنْ أَبِي عَبْدِ اللَّهِ النُّعْمَانِ بْنِ بَشِيرٍ رضي الله عنهما قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: إِنَّ الْحَلاَلَ بَيِّنٌ وَإِنَّ الْحَرَامَ بَيِّنٌ، وَبَيْنَهُمَا أُمُورٌ مُشْتَبِهَاتٌ لاَ يَعْلَمُهُنَّ كَثِيرٌ مِنَ النَّاسِ، فَمَنِ اتَّقَى الشُّبُهَاتِ فَقَدِ اسْتَبْرَأَ لِدِينِهِ وَعِرْضِهِ، وَمَنْ وَقَعَ فِي الشُّبُهَاتِ وَقَعَ فِي الْحَرَامِ، كَالرَّاعِي يَرْعَى حَوْلَ الْحِمَى يُوشِكُ أَنْ يَرْتَعَ فِيهِ. أَلاَ وَإِنَّ فِي الْجَسَدِ مُضْغَةً، إِذَا صَلَحَتْ صَلَحَ الْجَسَدُ كُلُّهُ، وَإِذَا فَسَدَتْ فَسَدَ الْجَسَدُ كُلُّهُ، أَلاَ وَهِيَ الْقَلْبُ.',
    english:
      'The lawful is clear and the unlawful is clear, and between them are doubtful matters. Whoever avoids doubts protects religion and honor. The hadith ends by teaching that the heart controls the whole body: if the heart is sound, the body is sound; if corrupt, the body is corrupt.',
  },
  {
    id: 'nawawi-7',
    collection: '40 Hadith Nawawi',
    book: 'Sincere Advice',
    number: '7',
    narrator: 'Tamim ad-Dari رضي الله عنه',
    grade: 'Sahih',
    topic: 'Manners',
    arabic:
      'عَنْ أَبِي رُقَيَّةَ تَمِيمِ بْنِ أَوْسٍ الدَّارِيِّ رضي الله عنه أَنَّ النَّبِيَّ ﷺ قَالَ: الدِّينُ النَّصِيحَةُ. قُلْنَا: لِمَنْ؟ قَالَ: لِلَّهِ، وَلِكِتَابِهِ، وَلِرَسُولِهِ، وَلأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ.',
    english:
      'Religion is sincere advice: to Allah, His Book, His Messenger, Muslim leaders, and ordinary Muslims. This means sincerity, loyalty, guidance, honesty, and wishing good for others without deception.',
  },
  {
    id: 'nawawi-8',
    collection: '40 Hadith Nawawi',
    book: 'Sanctity of Muslims',
    number: '8',
    narrator: 'Abdullah ibn Umar رضي الله عنهما',
    grade: 'Sahih',
    topic: 'Community',
    arabic:
      'عَنِ ابْنِ عُمَرَ رضي الله عنهما أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: أُمِرْتُ أَنْ أُقَاتِلَ النَّاسَ حَتَّى يَشْهَدُوا أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَيُقِيمُوا الصَّلاَةَ، وَيُؤْتُوا الزَّكَاةَ، فَإِذَا فَعَلُوا ذَلِكَ عَصَمُوا مِنِّي دِمَاءَهُمْ وَأَمْوَالَهُمْ إِلاَّ بِحَقِّ الإِسْلاَمِ، وَحِسَابُهُمْ عَلَى اللَّهِ.',
    english:
      'The Prophet ﷺ taught that Islam has public foundations, and whoever enters Islam has protected their life and wealth except by legal right. Hidden realities and final judgment belong to Allah alone.',
  },
  {
    id: 'nawawi-9',
    collection: '40 Hadith Nawawi',
    book: 'Obedience',
    number: '9',
    narrator: 'Abu Hurairah رضي الله عنه',
    grade: 'Sahih',
    topic: 'Sunnah',
    arabic:
      'عَنْ أَبِي هُرَيْرَةَ رضي الله عنه قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: مَا نَهَيْتُكُمْ عَنْهُ فَاجْتَنِبُوهُ، وَمَا أَمَرْتُكُمْ بِهِ فَأْتُوا مِنْهُ مَا اسْتَطَعْتُمْ، فَإِنَّمَا أَهْلَكَ الَّذِينَ مِنْ قَبْلِكُمْ كَثْرَةُ مَسَائِلِهِمْ وَاخْتِلاَفُهُمْ عَلَى أَنْبِيَائِهِمْ.',
    english:
      'Avoid what the Prophet ﷺ forbade, and do what he commanded as much as you are able. This hadith teaches balance: avoid prohibitions fully, perform duties according to ability, and avoid unnecessary argumentation.',
  },
  {
    id: 'nawawi-10',
    collection: '40 Hadith Nawawi',
    book: 'Pure Provision',
    number: '10',
    narrator: 'Abu Hurairah رضي الله عنه',
    grade: 'Sahih',
    topic: 'Halal',
    arabic:
      'عَنْ أَبِي هُرَيْرَةَ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: إِنَّ اللَّهَ طَيِّبٌ لاَ يَقْبَلُ إِلاَّ طَيِّبًا، وَإِنَّ اللَّهَ أَمَرَ الْمُؤْمِنِينَ بِمَا أَمَرَ بِهِ الْمُرْسَلِينَ، فَقَالَ: يَا أَيُّهَا الرُّسُلُ كُلُوا مِنَ الطَّيِّبَاتِ وَاعْمَلُوا صَالِحًا، وَقَالَ: يَا أَيُّهَا الَّذِينَ آمَنُوا كُلُوا مِنْ طَيِّبَاتِ مَا رَزَقْنَاكُمْ. ثُمَّ ذَكَرَ الرَّجُلَ يُطِيلُ السَّفَرَ أَشْعَثَ أَغْبَرَ، يَمُدُّ يَدَيْهِ إِلَى السَّمَاءِ: يَا رَبِّ يَا رَبِّ، وَمَطْعَمُهُ حَرَامٌ، وَمَشْرَبُهُ حَرَامٌ، وَمَلْبَسُهُ حَرَامٌ، وَغُذِيَ بِالْحَرَامِ، فَأَنَّى يُسْتَجَابُ لَهُ؟',
    english:
      'Allah is pure and accepts only what is pure. The Prophet ﷺ described a traveler who raises his hands in dua, yet his food, drink, clothing, and nourishment are unlawful. This teaches that halal income and pure living are connected to accepted worship and answered dua.',
  },
  {
    id: 'nawawi-11',
    collection: '40 Hadith Nawawi',
    book: 'Leaving Doubt',
    number: '11',
    narrator: 'Hasan ibn Ali رضي الله عنهما',
    grade: 'Hasan Sahih',
    topic: 'Halal',
    arabic:
      'عَنْ أَبِي مُحَمَّدٍ الْحَسَنِ بْنِ عَلِيِّ بْنِ أَبِي طَالِبٍ سِبْطِ رَسُولِ اللَّهِ ﷺ وَرَيْحَانَتِهِ رضي الله عنهما قَالَ: حَفِظْتُ مِنْ رَسُولِ اللَّهِ ﷺ: دَعْ مَا يَرِيبُكَ إِلَى مَا لاَ يَرِيبُكَ.',
    english:
      'Leave what makes you doubt for what does not make you doubt. This hadith teaches peace of heart, caution, honesty, and choosing clarity over uncertainty in worship, business, food, speech, and relationships.',
  },
  {
    id: 'nawawi-12',
    collection: '40 Hadith Nawawi',
    book: 'Beneficial Concern',
    number: '12',
    narrator: 'Abu Hurairah رضي الله عنه',
    grade: 'Hasan',
    topic: 'Manners',
    arabic:
      'عَنْ أَبِي هُرَيْرَةَ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: مِنْ حُسْنِ إِسْلاَمِ الْمَرْءِ تَرْكُهُ مَا لاَ يَعْنِيهِ.',
    english:
      'Part of excellence in Islam is leaving what does not concern you. This hadith teaches dignity, focus, avoiding gossip, avoiding useless arguments, and protecting one’s time and heart.',
  },
  {
    id: 'nawawi-13',
    collection: '40 Hadith Nawawi',
    book: 'Brotherhood',
    number: '13',
    narrator: 'Anas ibn Malik رضي الله عنه',
    grade: 'Sahih',
    topic: 'Brotherhood',
    arabic:
      'عَنْ أَبِي حَمْزَةَ أَنَسِ بْنِ مَالِكٍ رضي الله عنه خَادِمِ رَسُولِ اللَّهِ ﷺ عَنِ النَّبِيِّ ﷺ قَالَ: لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.',
    english:
      'None of you truly believes until he loves for his brother what he loves for himself. This hadith removes envy and selfishness and builds a community of compassion, fairness, mercy, and brotherhood.',
  },
  {
    id: 'nawawi-14',
    collection: '40 Hadith Nawawi',
    book: 'Sanctity of Life',
    number: '14',
    narrator: 'Abdullah ibn Masud رضي الله عنه',
    grade: 'Sahih',
    topic: 'Justice',
    arabic:
      'عَنِ ابْنِ مَسْعُودٍ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: لاَ يَحِلُّ دَمُ امْرِئٍ مُسْلِمٍ يَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنِّي رَسُولُ اللَّهِ إِلاَّ بِإِحْدَى ثَلاَثٍ: الثَّيِّبُ الزَّانِي، وَالنَّفْسُ بِالنَّفْسِ، وَالتَّارِكُ لِدِينِهِ الْمُفَارِقُ لِلْجَمَاعَةِ.',
    english:
      'The blood of a Muslim is sacred and cannot be violated except in specific legal cases established by Islamic law and rightful authority. This teaches the sanctity of life, justice, and protection from chaos and oppression.',
  },
  {
    id: 'nawawi-15',
    collection: '40 Hadith Nawawi',
    book: 'Speech and Hospitality',
    number: '15',
    narrator: 'Abu Hurairah رضي الله عنه',
    grade: 'Sahih',
    topic: 'Manners',
    arabic:
      'عَنْ أَبِي هُرَيْرَةَ رضي الله عنه أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ.',
    english:
      'Whoever believes in Allah and the Last Day should speak good or remain silent, honor the neighbor, and honor the guest. This hadith connects faith with speech, social manners, hospitality, and kindness.',
  },
  {
    id: 'nawawi-16',
    collection: '40 Hadith Nawawi',
    book: 'Anger',
    number: '16',
    narrator: 'Abu Hurairah رضي الله عنه',
    grade: 'Sahih',
    topic: 'Manners',
    arabic:
      'عَنْ أَبِي هُرَيْرَةَ رضي الله عنه أَنَّ رَجُلاً قَالَ لِلنَّبِيِّ ﷺ: أَوْصِنِي. قَالَ: لاَ تَغْضَبْ. فَرَدَّدَ مِرَارًا، قَالَ: لاَ تَغْضَبْ.',
    english:
      'A man asked the Prophet ﷺ for advice, and he repeatedly said: Do not become angry. This hadith teaches self-control, emotional discipline, patience, and avoiding words or actions that bring regret.',
  },
  {
    id: 'nawawi-17',
    collection: '40 Hadith Nawawi',
    book: 'Excellence',
    number: '17',
    narrator: 'Shaddad ibn Aws رضي الله عنه',
    grade: 'Sahih',
    topic: 'Mercy',
    arabic:
      'عَنْ أَبِي يَعْلَى شَدَّادِ بْنِ أَوْسٍ رضي الله عنه عَنْ رَسُولِ اللَّهِ ﷺ قَالَ: إِنَّ اللَّهَ كَتَبَ الإِحْسَانَ عَلَى كُلِّ شَيْءٍ، فَإِذَا قَتَلْتُمْ فَأَحْسِنُوا الْقِتْلَةَ، وَإِذَا ذَبَحْتُمْ فَأَحْسِنُوا الذِّبْحَةَ، وَلْيُحِدَّ أَحَدُكُمْ شَفْرَتَهُ، وَلْيُرِحْ ذَبِيحَتَهُ.',
    english:
      'Allah has prescribed excellence in all things. Even in slaughtering an animal, Islam commands mercy and avoiding unnecessary suffering. This hadith teaches ihsan: excellence, professionalism, mercy, and doing every task beautifully.',
  },
  {
    id: 'nawawi-18',
    collection: '40 Hadith Nawawi',
    book: 'Taqwa and Character',
    number: '18',
    narrator: 'Abu Dharr رضي الله عنه',
    grade: 'Hasan',
    topic: 'Manners',
    arabic:
      'عَنْ أَبِي ذَرٍّ جُنْدُبِ بْنِ جُنَادَةَ وَأَبِي عَبْدِ الرَّحْمَنِ مُعَاذِ بْنِ جَبَلٍ رضي الله عنهما عَنْ رَسُولِ اللَّهِ ﷺ قَالَ: اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ.',
    english:
      'Fear Allah wherever you are, follow a bad deed with a good deed to erase it, and treat people with good character. This hadith combines private taqwa, repentance, and beautiful manners with creation.',
  },
  {
    id: 'nawawi-19',
    collection: '40 Hadith Nawawi',
    book: 'Reliance on Allah',
    number: '19',
    narrator: 'Abdullah ibn Abbas رضي الله عنهما',
    grade: 'Hasan Sahih',
    topic: 'Faith',
    arabic:
      'عَنِ ابْنِ عَبَّاسٍ رضي الله عنهما قَالَ: كُنْتُ خَلْفَ النَّبِيِّ ﷺ يَوْمًا فَقَالَ: يَا غُلاَمُ، إِنِّي أُعَلِّمُكَ كَلِمَاتٍ: احْفَظِ اللَّهَ يَحْفَظْكَ، احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ، إِذَا سَأَلْتَ فَاسْأَلِ اللَّهَ، وَإِذَا اسْتَعَنْتَ فَاسْتَعِنْ بِاللَّهِ، وَاعْلَمْ أَنَّ الأُمَّةَ لَوِ اجْتَمَعَتْ عَلَى أَنْ يَنْفَعُوكَ بِشَيْءٍ لَمْ يَنْفَعُوكَ إِلاَّ بِشَيْءٍ قَدْ كَتَبَهُ اللَّهُ لَكَ، وَإِنِ اجْتَمَعُوا عَلَى أَنْ يَضُرُّوكَ بِشَيْءٍ لَمْ يَضُرُّوكَ إِلاَّ بِشَيْءٍ قَدْ كَتَبَهُ اللَّهُ عَلَيْكَ، رُفِعَتِ الأَقْلاَمُ وَجَفَّتِ الصُّحُفُ.',
    english:
      'Be mindful of Allah and He will protect you. Ask Allah and seek help from Allah. If all people gathered to benefit or harm you, they could only do what Allah had written. This hadith teaches tawakkul, courage, reliance, and certainty in decree.',
  },
  {
    id: 'nawawi-20',
    collection: '40 Hadith Nawawi',
    book: 'Modesty',
    number: '20',
    narrator: 'Abu Masud رضي الله عنه',
    grade: 'Sahih',
    topic: 'Manners',
    arabic:
      'عَنْ أَبِي مَسْعُودٍ عُقْبَةَ بْنِ عَمْرٍو الأَنْصَارِيِّ الْبَدْرِيِّ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: إِنَّ مِمَّا أَدْرَكَ النَّاسُ مِنْ كَلاَمِ النُّبُوَّةِ الأُولَى: إِذَا لَمْ تَسْتَحْيِ فَاصْنَعْ مَا شِئْتَ.',
    english:
      'If you feel no shame, then do as you wish. This teaches that modesty is a shield against evil. When shame before Allah disappears, a person may fall into many wrong actions.',
  },

  {
    id: 'nawawi-21',
    collection: '40 Hadith Nawawi',
    book: 'Steadfastness',
    number: '21',
    narrator: 'Sufyan ibn Abdullah رضي الله عنه',
    grade: 'Sahih',
    topic: 'Faith',
    arabic:
      'عَنْ أَبِي عَمْرٍو، وَقِيلَ أَبِي عَمْرَةَ، سُفْيَانَ بْنِ عَبْدِ اللَّهِ رضي الله عنه قَالَ: قُلْتُ: يَا رَسُولَ اللَّهِ، قُلْ لِي فِي الإِسْلاَمِ قَوْلاً لاَ أَسْأَلُ عَنْهُ أَحَدًا غَيْرَكَ. قَالَ: قُلْ آمَنْتُ بِاللَّهِ ثُمَّ اسْتَقِمْ.',
    english:
      'A companion asked for a complete statement about Islam. The Prophet ﷺ said: Say, I believe in Allah, then remain steadfast. This hadith teaches faith, consistency, discipline, and firmness upon the truth.',
  },
  {
    id: 'nawawi-22',
    collection: '40 Hadith Nawawi',
    book: 'Path to Paradise',
    number: '22',
    narrator: 'Jabir ibn Abdullah رضي الله عنه',
    grade: 'Sahih',
    topic: 'Worship',
    arabic:
      'عَنْ أَبِي عَبْدِ اللَّهِ جَابِرِ بْنِ عَبْدِ اللَّهِ الأَنْصَارِيِّ رضي الله عنهما أَنَّ رَجُلاً سَأَلَ رَسُولَ اللَّهِ ﷺ فَقَالَ: أَرَأَيْتَ إِذَا صَلَّيْتُ الْمَكْتُوبَاتِ، وَصُمْتُ رَمَضَانَ، وَأَحْلَلْتُ الْحَلاَلَ، وَحَرَّمْتُ الْحَرَامَ، وَلَمْ أَزِدْ عَلَى ذَلِكَ شَيْئًا، أَأَدْخُلُ الْجَنَّةَ؟ قَالَ: نَعَمْ.',
    english:
      'A man asked if fulfilling obligations, fasting Ramadan, accepting halal and avoiding haram would enter him into Paradise. The Prophet ﷺ said yes. This teaches that Paradise begins with sincerity, obligations, and avoiding sins.',
  },
  {
    id: 'nawawi-23',
    collection: '40 Hadith Nawawi',
    book: 'Purity and Worship',
    number: '23',
    narrator: 'Abu Malik al-Ashari رضي الله عنه',
    grade: 'Sahih',
    topic: 'Worship',
    arabic:
      'عَنْ أَبِي مَالِكٍ الْحَارِثِ بْنِ عَاصِمٍ الأَشْعَرِيِّ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: الطُّهُورُ شَطْرُ الإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلآنِ أَوْ تَمْلأُ مَا بَيْنَ السَّمَاوَاتِ وَالأَرْضِ، وَالصَّلاَةُ نُورٌ، وَالصَّدَقَةُ بُرْهَانٌ، وَالصَّبْرُ ضِيَاءٌ، وَالْقُرْآنُ حُجَّةٌ لَكَ أَوْ عَلَيْكَ، كُلُّ النَّاسِ يَغْدُو، فَبَائِعٌ نَفْسَهُ فَمُعْتِقُهَا أَوْ مُوبِقُهَا.',
    english:
      'Purity is half of faith. Praise of Allah fills the scale. Prayer is light, charity is proof, patience is illumination, and the Quran is proof for or against you. Every person begins the day either freeing or destroying themselves.',
  },
  {
    id: 'nawawi-24',
    collection: '40 Hadith Nawawi',
    book: 'Divine Justice',
    number: '24',
    narrator: 'Abu Dharr رضي الله عنه',
    grade: 'Sahih',
    topic: 'Justice',
    arabic:
      'عَنْ أَبِي ذَرٍّ الْغِفَارِيِّ رضي الله عنه عَنِ النَّبِيِّ ﷺ فِيمَا يَرْوِيهِ عَنْ رَبِّهِ عَزَّ وَجَلَّ أَنَّهُ قَالَ: يَا عِبَادِي، إِنِّي حَرَّمْتُ الظُّلْمَ عَلَى نَفْسِي، وَجَعَلْتُهُ بَيْنَكُمْ مُحَرَّمًا فَلاَ تَظَالَمُوا. يَا عِبَادِي، كُلُّكُمْ ضَالٌّ إِلاَّ مَنْ هَدَيْتُهُ فَاسْتَهْدُونِي أَهْدِكُمْ. يَا عِبَادِي، كُلُّكُمْ جَائِعٌ إِلاَّ مَنْ أَطْعَمْتُهُ فَاسْتَطْعِمُونِي أُطْعِمْكُمْ. يَا عِبَادِي، كُلُّكُمْ عَارٍ إِلاَّ مَنْ كَسَوْتُهُ فَاسْتَكْسُونِي أَكْسُكُمْ. يَا عِبَادِي، إِنَّكُمْ تُخْطِئُونَ بِاللَّيْلِ وَالنَّهَارِ، وَأَنَا أَغْفِرُ الذُّنُوبَ جَمِيعًا فَاسْتَغْفِرُونِي أَغْفِرْ لَكُمْ. يَا عِبَادِي، إِنَّمَا هِيَ أَعْمَالُكُمْ أُحْصِيهَا لَكُمْ ثُمَّ أُوَفِّيكُمْ إِيَّاهَا، فَمَنْ وَجَدَ خَيْرًا فَلْيَحْمَدِ اللَّهَ، وَمَنْ وَجَدَ غَيْرَ ذَلِكَ فَلاَ يَلُومَنَّ إِلاَّ نَفْسَهُ.',
    english:
      'Allah forbids oppression, calls His servants to seek guidance, food, clothing, and forgiveness from Him, and reminds them that their deeds are recorded. Whoever finds good should praise Allah, and whoever finds otherwise should blame only themselves.',
  },
  {
    id: 'nawawi-25',
    collection: '40 Hadith Nawawi',
    book: 'Charity',
    number: '25',
    narrator: 'Abu Dharr رضي الله عنه',
    grade: 'Sahih',
    topic: 'Charity',
    arabic:
      'عَنْ أَبِي ذَرٍّ رضي الله عنه أَنَّ نَاسًا مِنْ أَصْحَابِ رَسُولِ اللَّهِ ﷺ قَالُوا لِلنَّبِيِّ ﷺ: يَا رَسُولَ اللَّهِ، ذَهَبَ أَهْلُ الدُّثُورِ بِالأُجُورِ، يُصَلُّونَ كَمَا نُصَلِّي، وَيَصُومُونَ كَمَا نَصُومُ، وَيَتَصَدَّقُونَ بِفُضُولِ أَمْوَالِهِمْ. قَالَ: أَوَلَيْسَ قَدْ جَعَلَ اللَّهُ لَكُمْ مَا تَصَدَّقُونَ؟ إِنَّ بِكُلِّ تَسْبِيحَةٍ صَدَقَةً، وَكُلِّ تَكْبِيرَةٍ صَدَقَةً، وَكُلِّ تَحْمِيدَةٍ صَدَقَةً، وَكُلِّ تَهْلِيلَةٍ صَدَقَةً، وَأَمْرٌ بِالْمَعْرُوفِ صَدَقَةٌ، وَنَهْيٌ عَنِ الْمُنْكَرِ صَدَقَةٌ.',
    english:
      'The companions worried that wealthy people could give more charity. The Prophet ﷺ explained that every tasbih, takbir, tahmid, tahlil, commanding good, forbidding evil, and lawful action can be charity. Goodness is open to everyone.',
  },
  {
    id: 'nawawi-26',
    collection: '40 Hadith Nawawi',
    book: 'Good Deeds',
    number: '26',
    narrator: 'Abu Hurairah رضي الله عنه',
    grade: 'Sahih',
    topic: 'Charity',
    arabic:
      'عَنْ أَبِي هُرَيْرَةَ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: كُلُّ سُلاَمَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ، تَعْدِلُ بَيْنَ اثْنَيْنِ صَدَقَةٌ، وَتُعِينُ الرَّجُلَ فِي دَابَّتِهِ فَتَحْمِلُهُ عَلَيْهَا أَوْ تَرْفَعُ لَهُ عَلَيْهَا مَتَاعَهُ صَدَقَةٌ، وَالْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ، وَبِكُلِّ خُطْوَةٍ تَمْشِيهَا إِلَى الصَّلاَةِ صَدَقَةٌ، وَتُمِيطُ الأَذَى عَنِ الطَّرِيقِ صَدَقَةٌ.',
    english:
      'Every joint owes charity daily. Justice between people is charity, helping someone is charity, good words are charity, every step to prayer is charity, and removing harm from the road is charity.',
  },
  {
    id: 'nawawi-27',
    collection: '40 Hadith Nawawi',
    book: 'Righteousness',
    number: '27',
    narrator: 'An-Nawwas ibn Saman رضي الله عنه',
    grade: 'Sahih',
    topic: 'Manners',
    arabic:
      'عَنِ النَّوَّاسِ بْنِ سَمْعَانَ رضي الله عنه عَنِ النَّبِيِّ ﷺ قَالَ: الْبِرُّ حُسْنُ الْخُلُقِ، وَالإِثْمُ مَا حَاكَ فِي نَفْسِكَ وَكَرِهْتَ أَنْ يَطَّلِعَ عَلَيْهِ النَّاسُ.',
    english:
      'Righteousness is good character, and sin is what troubles your heart and what you dislike people discovering. This teaches that good manners are central to faith and that the sincere heart recognizes the discomfort of sin.',
  },
  {
    id: 'nawawi-28',
    collection: '40 Hadith Nawawi',
    book: 'Following Sunnah',
    number: '28',
    narrator: 'Al-Irbad ibn Sariyah رضي الله عنه',
    grade: 'Hasan Sahih',
    topic: 'Sunnah',
    arabic:
      'عَنْ أَبِي نَجِيحٍ الْعِرْبَاضِ بْنِ سَارِيَةَ رضي الله عنه قَالَ: وَعَظَنَا رَسُولُ اللَّهِ ﷺ مَوْعِظَةً وَجِلَتْ مِنْهَا الْقُلُوبُ وَذَرَفَتْ مِنْهَا الْعُيُونُ، فَقُلْنَا: يَا رَسُولَ اللَّهِ، كَأَنَّهَا مَوْعِظَةُ مُوَدِّعٍ فَأَوْصِنَا. قَالَ: أُوصِيكُمْ بِتَقْوَى اللَّهِ، وَالسَّمْعِ وَالطَّاعَةِ، وَإِنْ تَأَمَّرَ عَلَيْكُمْ عَبْدٌ، فَإِنَّهُ مَنْ يَعِشْ مِنْكُمْ فَسَيَرَى اخْتِلاَفًا كَثِيرًا، فَعَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الْخُلَفَاءِ الرَّاشِدِينَ الْمَهْدِيِّينَ، عَضُّوا عَلَيْهَا بِالنَّوَاجِذِ، وَإِيَّاكُمْ وَمُحْدَثَاتِ الأُمُورِ.',
    english:
      'The Prophet ﷺ gave a powerful farewell-like advice: fear Allah, obey rightful leadership, hold firmly to his Sunnah and the Sunnah of the rightly guided caliphs, and beware of invented religious matters.',
  },
  {
    id: 'nawawi-29',
    collection: '40 Hadith Nawawi',
    book: 'Gates of Good',
    number: '29',
    narrator: 'Muadh ibn Jabal رضي الله عنه',
    grade: 'Hasan Sahih',
    topic: 'Worship',
    arabic:
      'عَنْ مُعَاذِ بْنِ جَبَلٍ رضي الله عنه قَالَ: قُلْتُ: يَا رَسُولَ اللَّهِ، أَخْبِرْنِي بِعَمَلٍ يُدْخِلُنِي الْجَنَّةَ وَيُبَاعِدُنِي عَنِ النَّارِ. قَالَ: لَقَدْ سَأَلْتَ عَنْ عَظِيمٍ، وَإِنَّهُ لَيَسِيرٌ عَلَى مَنْ يَسَّرَهُ اللَّهُ عَلَيْهِ: تَعْبُدُ اللَّهَ لاَ تُشْرِكُ بِهِ شَيْئًا، وَتُقِيمُ الصَّلاَةَ، وَتُؤْتِي الزَّكَاةَ، وَتَصُومُ رَمَضَانَ، وَتَحُجُّ الْبَيْتَ. ثُمَّ قَالَ: أَلاَ أَدُلُّكَ عَلَى أَبْوَابِ الْخَيْرِ؟ الصَّوْمُ جُنَّةٌ، وَالصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ، وَصَلاَةُ الرَّجُلِ مِنْ جَوْفِ اللَّيْلِ. ثُمَّ قَالَ: رَأْسُ الأَمْرِ الإِسْلاَمُ، وَعَمُودُهُ الصَّلاَةُ، وَذِرْوَةُ سَنَامِهِ الْجِهَادُ. ثُمَّ قَالَ: أَلاَ أُخْبِرُكَ بِمِلاَكِ ذَلِكَ كُلِّهِ؟ قُلْتُ: بَلَى. فَأَخَذَ بِلِسَانِهِ وَقَالَ: كُفَّ عَلَيْكَ هَذَا.',
    english:
      'Muadh asked for a deed leading to Paradise and away from Hell. The Prophet ﷺ mentioned worship, prayer, zakah, fasting, Hajj, fasting as protection, charity, night prayer, and controlling the tongue. This hadith is a complete guide to worship and self-discipline.',
  },
  {
    id: 'nawawi-30',
    collection: '40 Hadith Nawawi',
    book: 'Limits of Allah',
    number: '30',
    narrator: 'Abu Thalabah al-Khushani رضي الله عنه',
    grade: 'Hasan',
    topic: 'Halal',
    arabic:
      'عَنْ أَبِي ثَعْلَبَةَ الْخُشَنِيِّ جُرْثُومِ بْنِ نَاشِرٍ رضي الله عنه عَنْ رَسُولِ اللَّهِ ﷺ قَالَ: إِنَّ اللَّهَ فَرَضَ فَرَائِضَ فَلاَ تُضَيِّعُوهَا، وَحَدَّ حُدُودًا فَلاَ تَعْتَدُوهَا، وَحَرَّمَ أَشْيَاءَ فَلاَ تَنْتَهِكُوهَا، وَسَكَتَ عَنْ أَشْيَاءَ رَحْمَةً لَكُمْ غَيْرَ نِسْيَانٍ فَلاَ تَبْحَثُوا عَنْهَا.',
    english:
      'Allah has obligated duties, set limits, prohibited things, and remained silent about some matters out of mercy. This hadith teaches commitment, balance, respect for limits, and avoiding unnecessary hardship.',
  },
  {
    id: 'nawawi-31',
    collection: '40 Hadith Nawawi',
    book: 'Zuhd',
    number: '31',
    narrator: 'Sahl ibn Sad رضي الله عنه',
    grade: 'Hasan',
    topic: 'Spirituality',
    arabic:
      'عَنْ أَبِي الْعَبَّاسِ سَهْلِ بْنِ سَعْدٍ السَّاعِدِيِّ رضي الله عنه قَالَ: جَاءَ رَجُلٌ إِلَى النَّبِيِّ ﷺ فَقَالَ: يَا رَسُولَ اللَّهِ، دُلَّنِي عَلَى عَمَلٍ إِذَا عَمِلْتُهُ أَحَبَّنِي اللَّهُ وَأَحَبَّنِي النَّاسُ. فَقَالَ: ازْهَدْ فِي الدُّنْيَا يُحِبَّكَ اللَّهُ، وَازْهَدْ فِيمَا عِنْدَ النَّاسِ يُحِبَّكَ النَّاسُ.',
    english:
      'Detach your heart from excessive worldly attachment and Allah will love you. Do not crave what people possess and people will love you. This teaches contentment, dignity, and freedom from greed.',
  },
  {
    id: 'nawawi-32',
    collection: '40 Hadith Nawawi',
    book: 'No Harm',
    number: '32',
    narrator: 'Abu Said al-Khudri رضي الله عنه',
    grade: 'Hasan',
    topic: 'Justice',
    arabic:
      'عَنْ أَبِي سَعِيدٍ سَعْدِ بْنِ مَالِكِ بْنِ سِنَانٍ الْخُدْرِيِّ رضي الله عنه أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: لاَ ضَرَرَ وَلاَ ضِرَارَ.',
    english:
      'There should be neither harming nor reciprocating harm. This is a major Islamic principle that applies to family, business, neighbors, health, speech, contracts, and community life.',
  },
  {
    id: 'nawawi-33',
    collection: '40 Hadith Nawawi',
    book: 'Claims and Evidence',
    number: '33',
    narrator: 'Ibn Abbas رضي الله عنهما',
    grade: 'Hasan',
    topic: 'Justice',
    arabic:
      'عَنِ ابْنِ عَبَّاسٍ رضي الله عنهما أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: لَوْ يُعْطَى النَّاسُ بِدَعْوَاهُمْ لاَدَّعَى رِجَالٌ أَمْوَالَ قَوْمٍ وَدِمَاءَهُمْ، لَكِنِ الْبَيِّنَةُ عَلَى الْمُدَّعِي، وَالْيَمِينُ عَلَى مَنْ أَنْكَرَ.',
    english:
      'If people were given everything they claimed, some would claim the wealth and lives of others. Therefore proof is required from the claimant, and an oath from the one who denies. This teaches evidence, justice, and fairness.',
  },
  {
    id: 'nawawi-34',
    collection: '40 Hadith Nawawi',
    book: 'Changing Evil',
    number: '34',
    narrator: 'Abu Said al-Khudri رضي الله عنه',
    grade: 'Sahih',
    topic: 'Community',
    arabic:
      'عَنْ أَبِي سَعِيدٍ الْخُدْرِيِّ رضي الله عنه قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِلِسَانِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِقَلْبِهِ، وَذَلِكَ أَضْعَفُ الإِيمَانِ.',
    english:
      'Whoever sees evil should change it with hand, tongue, or heart according to ability and wisdom. This hadith teaches responsibility, reform, and hating evil without causing greater harm.',
  },
  {
    id: 'nawawi-35',
    collection: '40 Hadith Nawawi',
    book: 'Brotherhood',
    number: '35',
    narrator: 'Abu Hurairah رضي الله عنه',
    grade: 'Sahih',
    topic: 'Brotherhood',
    arabic:
      'عَنْ أَبِي هُرَيْرَةَ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: لاَ تَحَاسَدُوا، وَلاَ تَنَاجَشُوا، وَلاَ تَبَاغَضُوا، وَلاَ تَدَابَرُوا، وَلاَ يَبِعْ بَعْضُكُمْ عَلَى بَيْعِ بَعْضٍ، وَكُونُوا عِبَادَ اللَّهِ إِخْوَانًا. الْمُسْلِمُ أَخُو الْمُسْلِمِ، لاَ يَظْلِمُهُ، وَلاَ يَخْذُلُهُ، وَلاَ يَكْذِبُهُ، وَلاَ يَحْقِرُهُ. التَّقْوَى هَاهُنَا، وَيُشِيرُ إِلَى صَدْرِهِ ثَلاَثَ مَرَّاتٍ. بِحَسْبِ امْرِئٍ مِنَ الشَّرِّ أَنْ يَحْقِرَ أَخَاهُ الْمُسْلِمَ.',
    english:
      'Do not envy, hate, turn away, cheat in trade, or look down on one another. Be brothers. A Muslim does not oppress, abandon, lie to, or despise another Muslim. This hadith is a complete guide to brotherhood and social purity.',
  },
  {
    id: 'nawawi-36',
    collection: '40 Hadith Nawawi',
    book: 'Helping Others',
    number: '36',
    narrator: 'Abu Hurairah رضي الله عنه',
    grade: 'Sahih',
    topic: 'Community',
    arabic:
      'عَنْ أَبِي هُرَيْرَةَ رضي الله عنه عَنِ النَّبِيِّ ﷺ قَالَ: مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا، نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ، وَمَنْ يَسَّرَ عَلَى مُعْسِرٍ يَسَّرَ اللَّهُ عَلَيْهِ فِي الدُّنْيَا وَالآخِرَةِ، وَمَنْ سَتَرَ مُسْلِمًا سَتَرَهُ اللَّهُ فِي الدُّنْيَا وَالآخِرَةِ، وَاللَّهُ فِي عَوْنِ الْعَبْدِ مَا كَانَ الْعَبْدُ فِي عَوْنِ أَخِيهِ. وَمَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.',
    english:
      'Whoever relieves a believer’s hardship, Allah relieves their hardship on the Day of Resurrection. Whoever makes difficulty easy, conceals faults, helps others, and seeks knowledge receives Allah’s help and mercy.',
  },
  {
    id: 'nawawi-37',
    collection: '40 Hadith Nawawi',
    book: 'Allah’s Mercy',
    number: '37',
    narrator: 'Ibn Abbas رضي الله عنهما',
    grade: 'Sahih',
    topic: 'Mercy',
    arabic:
      'عَنِ ابْنِ عَبَّاسٍ رضي الله عنهما عَنْ رَسُولِ اللَّهِ ﷺ فِيمَا يَرْوِيهِ عَنْ رَبِّهِ تَبَارَكَ وَتَعَالَى قَالَ: إِنَّ اللَّهَ كَتَبَ الْحَسَنَاتِ وَالسَّيِّئَاتِ ثُمَّ بَيَّنَ ذَلِكَ، فَمَنْ هَمَّ بِحَسَنَةٍ فَلَمْ يَعْمَلْهَا كَتَبَهَا اللَّهُ عِنْدَهُ حَسَنَةً كَامِلَةً، وَإِنْ هَمَّ بِهَا فَعَمِلَهَا كَتَبَهَا اللَّهُ عِنْدَهُ عَشْرَ حَسَنَاتٍ إِلَى سَبْعِمِائَةِ ضِعْفٍ إِلَى أَضْعَافٍ كَثِيرَةٍ.',
    english:
      'Allah records good deeds and bad deeds with perfect mercy and justice. Intending a good deed is rewarded, doing it is multiplied, and leaving a bad deed for Allah is rewarded. This hadith shows Allah’s vast generosity.',
  },
  {
    id: 'nawawi-38',
    collection: '40 Hadith Nawawi',
    book: 'Love of Allah',
    number: '38',
    narrator: 'Abu Hurairah رضي الله عنه',
    grade: 'Sahih',
    topic: 'Spirituality',
    arabic:
      'عَنْ أَبِي هُرَيْرَةَ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: إِنَّ اللَّهَ تَعَالَى قَالَ: مَنْ عَادَى لِي وَلِيًّا فَقَدْ آذَنْتُهُ بِالْحَرْبِ، وَمَا تَقَرَّبَ إِلَيَّ عَبْدِي بِشَيْءٍ أَحَبَّ إِلَيَّ مِمَّا افْتَرَضْتُ عَلَيْهِ، وَلاَ يَزَالُ عَبْدِي يَتَقَرَّبُ إِلَيَّ بِالنَّوَافِلِ حَتَّى أُحِبَّهُ، فَإِذَا أَحْبَبْتُهُ كُنْتُ سَمْعَهُ الَّذِي يَسْمَعُ بِهِ، وَبَصَرَهُ الَّذِي يُبْصِرُ بِهِ، وَيَدَهُ الَّتِي يَبْطِشُ بِهَا، وَرِجْلَهُ الَّتِي يَمْشِي بِهَا، وَلَئِنْ سَأَلَنِي لأُعْطِيَنَّهُ، وَلَئِنِ اسْتَعَاذَنِي لأُعِيذَنَّهُ.',
    english:
      'Allah declares war against whoever shows hostility to His beloved servant. A servant comes closest through obligations, then voluntary deeds until Allah loves them, guides them, answers them, and protects them.',
  },
  {
    id: 'nawawi-39',
    collection: '40 Hadith Nawawi',
    book: 'Forgiveness',
    number: '39',
    narrator: 'Ibn Abbas رضي الله عنهما',
    grade: 'Hasan',
    topic: 'Mercy',
    arabic:
      'عَنِ ابْنِ عَبَّاسٍ رضي الله عنهما أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: إِنَّ اللَّهَ تَجَاوَزَ لِي عَنْ أُمَّتِي الْخَطَأَ، وَالنِّسْيَانَ، وَمَا اسْتُكْرِهُوا عَلَيْهِ.',
    english:
      'Allah has pardoned this nation for genuine mistakes, forgetfulness, and what they are forced to do. This hadith teaches Allah’s mercy, fairness, and that Islamic law considers intention and ability.',
  },
  {
    id: 'nawawi-40',
    collection: '40 Hadith Nawawi',
    book: 'The World',
    number: '40',
    narrator: 'Abdullah ibn Umar رضي الله عنهما',
    grade: 'Sahih',
    topic: 'Spirituality',
    arabic:
      'عَنِ ابْنِ عُمَرَ رضي الله عنهما قَالَ: أَخَذَ رَسُولُ اللَّهِ ﷺ بِمَنْكِبِي فَقَالَ: كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ. وَكَانَ ابْنُ عُمَرَ رضي الله عنهما يَقُولُ: إِذَا أَمْسَيْتَ فَلاَ تَنْتَظِرِ الصَّبَاحَ، وَإِذَا أَصْبَحْتَ فَلاَ تَنْتَظِرِ الْمَسَاءَ، وَخُذْ مِنْ صِحَّتِكَ لِمَرَضِكَ، وَمِنْ حَيَاتِكَ لِمَوْتِكَ.',
    english:
      'Be in this world as though you are a stranger or traveler. Use your health before sickness and your life before death. This hadith teaches urgency, preparation for the Hereafter, and wise use of time.',
  },
];

const TOPICS = [
  'All',
  'Intentions',
  'Faith',
  'Sunnah',
  'Halal',
  'Manners',
  'Brotherhood',
  'Justice',
  'Mercy',
  'Worship',
  'Charity',
  'Community',
  'Spirituality',
];

const REMINDERS = [
  'Read one hadith today and practice one lesson from it.',
  'Good manners are among the clearest signs of faith.',
  'Protect your tongue and speak only good.',
  'Consistency in small deeds is beloved to Allah.',
  'Seek beneficial knowledge and act upon it.',
];

const getWordCount = (text: string) => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const getReadingTime = (text: string) => {
  const words = getWordCount(text);
  return Math.max(1, Math.ceil(words / 180));
};

export default function HadithPage() {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(REMINDERS[0]);

  useEffect(() => {
    loadFavorites();
    setDailyReminder(
      REMINDERS[Math.floor(Math.random() * REMINDERS.length)]
    );
  }, []);

  const loadFavorites = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_FAVORITES);
      if (saved) setFavorites(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  const saveFavorites = async (items: string[]) => {
    await AsyncStorage.setItem(
      STORAGE_FAVORITES,
      JSON.stringify(items)
    );
  };

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter(item => item !== id)
      : [...favorites, id];

    setFavorites(updated);
    saveFavorites(updated);
  };

  const scheduleReminder = async () => {
    try {
      const permission =
        await Notifications.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Needed',
          'Please allow notifications.'
        );
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Hadith Reminder 🌙',
          body: 'Read one hadith today and practice one lesson.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 7,
          minute: 30,
        },
      });

      Alert.alert(
        'Reminder Saved',
        'Daily Hadith reminder set for 7:30 AM.'
      );
    } catch {
      Alert.alert(
        'Reminder Error',
        'Unable to schedule reminder.'
      );
    }
  };

  const filteredHadiths = useMemo(() => {
    const search = query.toLowerCase();

    return HADITHS.filter(item => {
      const matchesTopic =
        topic === 'All' || item.topic === topic;

      const matchesSearch =
        item.english.toLowerCase().includes(search) ||
        item.arabic.includes(query) ||
        item.collection.toLowerCase().includes(search) ||
        item.book.toLowerCase().includes(search) ||
        item.topic.toLowerCase().includes(search) ||
        item.narrator.toLowerCase().includes(search) ||
        item.number.includes(query);

      return matchesTopic && matchesSearch;
    });
  }, [query, topic]);

  const shareHadith = async (hadith: Hadith) => {
    await Share.share({
      message: `${hadith.collection} #${hadith.number}\n\n${hadith.arabic}\n\n${hadith.english}\n\nNarrator: ${hadith.narrator}\nGrade: ${hadith.grade}`,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingPage}>
          <ActivityIndicator
            color="#064E3B"
            size="large"
          />
          <Text style={styles.loadingText}>
            Loading Hadith Library...
          </Text>
        </View>
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
        <View style={styles.goldGlow} />
        <View style={styles.greenGlow} />

        <LinearGradient
          colors={['#032D22', '#064E3B', '#0D7054']}
          style={styles.hero}
        >
          <View style={styles.heroBadge}>
            <Sparkles size={13} color="#D8B85A" />
            <Text style={styles.heroBadgeText}>
              40 Hadith Nawawi
            </Text>
          </View>

          <View style={styles.heroIcon}>
            <BookOpen size={35} color="#D8B85A" />
          </View>

          <Text style={styles.heroTitle}>
            Hadith Library
          </Text>

          <Text style={styles.heroSubtitle}>
            Beautiful Arabic hadiths with English meanings, topics,
            length, reminders, favorites and sharing.
          </Text>
        </LinearGradient>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Award size={19} color="#D8B85A" />
            <Text style={styles.statNumber}>{HADITHS.length}</Text>
            <Text style={styles.statLabel}>Hadiths</Text>
          </View>

          <View style={styles.statCard}>
            <ShieldCheck size={19} color="#D8B85A" />
            <Text style={styles.statNumber}>Nawawi</Text>
            <Text style={styles.statLabel}>Collection</Text>
          </View>

          <View style={styles.statCard}>
            <Heart size={19} color="#D8B85A" />
            <Text style={styles.statNumber}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>

        <LinearGradient
          colors={['#FFFDF8', '#F6EFE2']}
          style={styles.reminderCard}
        >
          <View style={styles.sectionHeader}>
            <Moon size={17} color="#9A6A16" />
            <Text style={styles.sectionTitle}>
              Today’s Hadith Reminder
            </Text>
          </View>

          <Text style={styles.reminderText}>
            {dailyReminder}
          </Text>

          <TouchableOpacity
            style={styles.reminderButton}
            onPress={scheduleReminder}
          >
            <Bell size={17} color="#FFFFFF" />
            <Text style={styles.reminderButtonText}>
              Set Daily Reminder
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.searchBox}>
          <Search size={18} color="#064E3B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hadith, topic, narrator, number..."
            placeholderTextColor="#8A8172"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.topicHeader}>
          <Filter size={16} color="#064E3B" />
          <Text style={styles.topicTitle}>
            Topics
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.topicScroll}
        >
          {TOPICS.map(item => {
            const active = topic === item;

            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.topicPill,
                  active && styles.topicPillActive,
                ]}
                onPress={() => setTopic(item)}
              >
                <Text
                  style={[
                    styles.topicText,
                    active && styles.topicTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Star size={17} color="#9A6A16" />
          <Text style={styles.sectionTitle}>
            Showing {filteredHadiths.length} Hadith
          </Text>
        </View>

        {filteredHadiths.map(hadith => {
          const saved = favorites.includes(hadith.id);
          const englishWordCount = getWordCount(hadith.english);
          const arabicWordCount = getWordCount(hadith.arabic);
          const readingTime = getReadingTime(
            `${hadith.arabic} ${hadith.english}`
          );

          return (
            <LinearGradient
              key={hadith.id}
              colors={['#FFFDF8', '#F7F0DC']}
              style={styles.hadithCard}
            >
              <View style={styles.cardTop}>
                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>
                    #{hadith.number}
                  </Text>
                </View>

                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeText}>
                    {hadith.grade}
                  </Text>
                </View>
              </View>

              <Text style={styles.collectionText}>
                {hadith.collection}
              </Text>

              <Text style={styles.bookTitle}>
                {hadith.book}
              </Text>

              <View style={styles.arabicFrame}>
                <Feather size={18} color="#D8B85A" />
                <Text style={styles.arabicLabel}>
                  Arabic Text
                </Text>
              </View>

              <Text style={styles.hadithArabic}>
                {hadith.arabic}
              </Text>

              <Text style={styles.englishLabel}>
                English Meaning
              </Text>

              <Text style={styles.hadithEnglish}>
                {hadith.english}
              </Text>

              <View style={styles.lengthRow}>
                <View style={styles.lengthPill}>
                  <Clock size={13} color="#064E3B" />
                  <Text style={styles.lengthText}>
                    {arabicWordCount} Arabic words
                  </Text>
                </View>

                <View style={styles.lengthPill}>
                  <BookOpen size={13} color="#064E3B" />
                  <Text style={styles.lengthText}>
                    {englishWordCount} English words
                  </Text>
                </View>

                <View style={styles.lengthPill}>
                  <Clock size={13} color="#064E3B" />
                  <Text style={styles.lengthText}>
                    {readingTime} min read
                  </Text>
                </View>
              </View>

              <View style={styles.metaBox}>
                <Text style={styles.metaText}>
                  Book: {hadith.book}
                </Text>
                <Text style={styles.metaText}>
                  Narrator: {hadith.narrator}
                </Text>
                <Text style={styles.metaText}>
                  Topic: {hadith.topic}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => toggleFavorite(hadith.id)}
                >
                  {saved ? (
                    <HeartOff size={17} color="#8B1E1E" />
                  ) : (
                    <Heart size={17} color="#064E3B" />
                  )}

                  <Text style={styles.actionText}>
                    {saved ? 'Remove' : 'Save'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => shareHadith(hadith)}
                >
                  <Share2 size={17} color="#064E3B" />
                  <Text style={styles.actionText}>
                    Share
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          );
        })}

        <View style={styles.footerCard}>
          <Clock size={18} color="#064E3B" />
          <Text style={styles.footerText}>
            Read slowly, reflect deeply, and practice one prophetic teaching at a time.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3EFE5',
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 28,
  },

  loadingPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3EFE5',
  },

  loadingText: {
    marginTop: 10,
    color: '#064E3B',
    fontSize: 12,
    fontWeight: '800',
  },

  goldGlow: {
    position: 'absolute',
    top: -95,
    right: -85,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: '#D4A017',
    opacity: 0.16,
  },

  greenGlow: {
    position: 'absolute',
    top: 330,
    left: -95,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: '#064E3B',
    opacity: 0.09,
  },

  hero: {
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(216,184,90,0.36)',
    shadowColor: '#032D22',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: 'rgba(216,184,90,0.24)',
  },

  heroBadgeText: {
    color: '#F1D988',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 5,
    letterSpacing: 0.3,
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(216,184,90,0.55)',
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  heroSubtitle: {
    color: '#EAF7EF',
    fontSize: 11.5,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
    fontWeight: '600',
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  statCard: {
    width: '31.7%',
    backgroundColor: '#FFFDF8',
    borderRadius: 17,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9DDC6',
    shadowColor: '#6B5A32',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  statNumber: {
    color: '#032D22',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 5,
  },

  statLabel: {
    color: '#746A5D',
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 2,
  },

  reminderCard: {
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E7D9BE',
    marginBottom: 10,
    shadowColor: '#6B5A32',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  sectionTitle: {
    color: '#032D22',
    fontSize: 13.5,
    fontWeight: '900',
    marginLeft: 6,
  },

  reminderText: {
    color: '#5F554B',
    fontSize: 11.8,
    lineHeight: 17.5,
    fontWeight: '700',
    marginBottom: 10,
  },

  reminderButton: {
    backgroundColor: '#064E3B',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#064E3B',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  reminderButtonText: {
    color: '#FFFFFF',
    fontSize: 11.2,
    fontWeight: '900',
    marginLeft: 6,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 17,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E7D9BE',
    marginBottom: 10,
    shadowColor: '#6B5A32',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    color: '#032D22',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    paddingVertical: 2,
  },

  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  topicTitle: {
    color: '#032D22',
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 5,
  },

  topicScroll: {
    marginBottom: 11,
  },

  topicPill: {
    backgroundColor: '#FFFDF8',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginRight: 7,
    borderWidth: 1,
    borderColor: '#E7D9BE',
  },

  topicPillActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },

  topicText: {
    color: '#064E3B',
    fontSize: 10.5,
    fontWeight: '800',
  },

  topicTextActive: {
    color: '#FFFFFF',
  },

  hadithCard: {
    borderRadius: 22,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E6D7BC',
    marginBottom: 11,
    shadowColor: '#5A4A28',
    shadowOpacity: 0.11,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  numberBadge: {
    backgroundColor: '#064E3B',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },

  numberText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },

  gradeBadge: {
    backgroundColor: '#F3E6BF',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E5CE8E',
  },

  gradeText: {
    color: '#8B5E16',
    fontSize: 10.5,
    fontWeight: '900',
  },

  collectionText: {
    color: '#9A6A16',
    fontSize: 10.8,
    fontWeight: '900',
    marginBottom: 5,
    letterSpacing: 0.2,
  },

  bookTitle: {
    color: '#032D22',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 9,
  },

  arabicFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    alignSelf: 'flex-end',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
  },

  arabicLabel: {
    color: '#FFFFFF',
    fontSize: 10.4,
    fontWeight: '900',
    marginLeft: 5,
  },

  hadithArabic: {
    color: '#032D22',
    fontSize: 20,
    lineHeight: 34,
    textAlign: 'right',
    fontWeight: '700',
    marginBottom: 11,
    writingDirection: 'rtl',
  },

  englishLabel: {
    color: '#9A6A16',
    fontSize: 11.2,
    fontWeight: '900',
    marginBottom: 6,
  },

  hadithEnglish: {
    color: '#26352F',
    fontSize: 12,
    lineHeight: 18.5,
    fontWeight: '700',
    marginBottom: 10,
  },

  lengthRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 9,
  },

  lengthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F0EA',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#D3E4DC',
  },

  lengthText: {
    color: '#064E3B',
    fontSize: 9.8,
    fontWeight: '900',
    marginLeft: 4,
  },

  metaBox: {
    backgroundColor: 'rgba(255,253,248,0.82)',
    borderRadius: 15,
    padding: 9,
    borderWidth: 1,
    borderColor: '#E7D9BE',
  },

  metaText: {
    color: '#5F554B',
    fontSize: 10.2,
    lineHeight: 15.5,
    fontWeight: '700',
  },

  actions: {
    flexDirection: 'row',
    marginTop: 9,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F0EA',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
    marginRight: 7,
    borderWidth: 1,
    borderColor: '#D3E4DC',
  },

  actionText: {
    color: '#064E3B',
    fontSize: 10.5,
    fontWeight: '900',
    marginLeft: 5,
  },

  footerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFDF8',
    borderRadius: 17,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E7D9BE',
    marginTop: 3,
    shadowColor: '#6B5A32',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  footerText: {
    flex: 1,
    color: '#5F554B',
    fontSize: 10.2,
    lineHeight: 15.8,
    marginLeft: 8,
    fontWeight: '600',
  },
});
