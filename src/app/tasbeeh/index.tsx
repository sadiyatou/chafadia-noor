import React, { useEffect, useMemo, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Vibration,
  Alert,
  TextInput,
  Share,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import {
  RotateCcw,
  Plus,
  Minus,
  Target,
  Bell,
  Share2,
  Trophy,
  Heart,
  Sparkles,
  Moon,
  CheckCircle,
  Settings,
  Volume2,
  Vibrate,
  Flame,
  Star,
  Sun,
  Clock,
  Shield,
  BookOpen,
} from 'lucide-react-native';

type Dhikr = {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  target: number;
  when: string;
  category: string;
  note: string;
};

const GREEN = '#064E3B';
const EMERALD = '#0D7054';
const GOLD = '#D4A017';
const CREAM = '#F7F5EE';
const CARD = '#FFFDF8';
const MINT = '#E6F1EC';
const ROSE = '#9F2D2D';

const STORAGE_STATE = 'CHAFADIA_TASBIH_STATE_V2';

const DHIKR_LIST: Dhikr[] = [
  {
    id: 'subhanallah-33',
    arabic: 'سُبْحَانَ الله',
    transliteration: 'SubhanAllah',
    meaning: 'Glory be to Allah',
    target: 33,
    when: 'After every obligatory prayer',
    category: 'After Prayer',
    note: 'Part of the common tasbih after salah.',
  },
  {
    id: 'alhamdulillah-33',
    arabic: 'الْحَمْدُ لِلَّه',
    transliteration: 'Alhamdulillah',
    meaning: 'All praise is for Allah',
    target: 33,
    when: 'After every obligatory prayer',
    category: 'After Prayer',
    note: 'Recited after salah with SubhanAllah and Allahu Akbar.',
  },
  {
    id: 'allahuakbar-34',
    arabic: 'اللهُ أَكْبَر',
    transliteration: 'Allahu Akbar',
    meaning: 'Allah is the Greatest',
    target: 34,
    when: 'After every obligatory prayer',
    category: 'After Prayer',
    note: 'Complete 100 with 33 SubhanAllah, 33 Alhamdulillah and 34 Allahu Akbar.',
  },
  {
    id: 'ayah-kursi',
    arabic: 'آيَةُ الْكُرْسِي',
    transliteration: 'Ayatul Kursi',
    meaning: 'Verse of the Throne',
    target: 1,
    when: 'After every obligatory prayer and before sleep',
    category: 'Protection',
    note: 'Read once after salah and before sleeping.',
  },
  {
    id: 'ikhlas-falaq-nas',
    arabic: 'الإِخْلَاص، الْفَلَق، النَّاس',
    transliteration: 'Surah Al-Ikhlas, Al-Falaq, An-Nas',
    meaning: 'Protection chapters',
    target: 3,
    when: 'Morning, evening and before sleep',
    category: 'Protection',
    note: 'Recite each surah 3 times in morning/evening.',
  },
  {
    id: 'morning-evening-master',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ',
    transliteration: 'Sayyidul Istighfar',
    meaning: 'Master supplication for forgiveness',
    target: 1,
    when: 'Morning and evening',
    category: 'Morning & Evening',
    note: 'A powerful dua of repentance and seeking forgiveness.',
  },
  {
    id: 'hasbiyallah',
    arabic: 'حَسْبِيَ اللهُ لَا إِلٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ',
    transliteration: 'HasbiyAllahu la ilaha illa Huwa',
    meaning: 'Allah is sufficient for me; upon Him I rely',
    target: 7,
    when: 'Morning and evening',
    category: 'Morning & Evening',
    note: 'Recite 7 times for reliance upon Allah.',
  },
  {
    id: 'raditu',
    arabic: 'رَضِيتُ بِاللهِ رَبًّا، وَبِالإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
    transliteration: 'Raditu billahi rabba...',
    meaning: 'I am pleased with Allah as Lord, Islam as religion, and Muhammad ﷺ as Prophet',
    target: 3,
    when: 'Morning and evening',
    category: 'Morning & Evening',
    note: 'Recite 3 times.',
  },
  {
    id: 'bismillah-protection',
    arabic: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ',
    transliteration: 'Bismillahilladhi la yadurru...',
    meaning: 'In the name of Allah, with whose name nothing can harm',
    target: 3,
    when: 'Morning and evening',
    category: 'Protection',
    note: 'Recite 3 times for protection by Allah’s permission.',
  },
  {
    id: 'aoodhu-kalimat',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَق',
    transliteration: 'A’udhu bikalimatillahit-tammati...',
    meaning: 'I seek refuge in the perfect words of Allah from the evil He created',
    target: 3,
    when: 'Evening or when stopping somewhere',
    category: 'Protection',
    note: 'Useful for protection, especially at night.',
  },
  {
    id: 'subhanallah-bihamdihi-100',
    arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
    transliteration: 'SubhanAllahi wa bihamdihi',
    meaning: 'Glory and praise be to Allah',
    target: 100,
    when: 'Morning or any time',
    category: 'Daily Dhikr',
    note: 'A beautiful daily dhikr.',
  },
  {
    id: 'astaghfirullah-100',
    arabic: 'أَسْتَغْفِرُ الله',
    transliteration: 'Astaghfirullah',
    meaning: 'I seek forgiveness from Allah',
    target: 100,
    when: 'Any time, especially morning/evening',
    category: 'Forgiveness',
    note: 'Good to repeat daily.',
  },
  {
    id: 'salawat-100',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّد',
    transliteration: 'Allahumma salli ala Muhammad',
    meaning: 'O Allah, send blessings upon Muhammad ﷺ',
    target: 100,
    when: 'Any time, especially Friday',
    category: 'Salawat',
    note: 'Increase salawat on Friday.',
  },
  {
    id: 'la-ilaha-100',
    arabic: 'لَا إِلٰهَ إِلَّا الله',
    transliteration: 'La ilaha illa Allah',
    meaning: 'There is no deity worthy of worship except Allah',
    target: 100,
    when: 'Any time',
    category: 'Daily Dhikr',
    note: 'The greatest statement of tawhid.',
  },
  {
    id: 'hawla-100',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِالله',
    transliteration: 'La hawla wa la quwwata illa billah',
    meaning: 'There is no power nor strength except by Allah',
    target: 100,
    when: 'Any time, during difficulty',
    category: 'Daily Dhikr',
    note: 'A treasure from the treasures of Paradise.',
  },
  {
    id: 'hasbunallah-100',
    arabic: 'حَسْبُنَا اللهُ وَنِعْمَ الْوَكِيل',
    transliteration: 'HasbunAllahu wa ni’mal wakeel',
    meaning: 'Allah is sufficient for us and the best disposer of affairs',
    target: 100,
    when: 'During hardship, fear or worry',
    category: 'Reliance',
    note: 'A dhikr of trust and calmness.',
  },
  {
    id: 'sleep-subhanallah',
    arabic: 'سُبْحَانَ الله',
    transliteration: 'SubhanAllah',
    meaning: 'Glory be to Allah',
    target: 33,
    when: 'Before sleep',
    category: 'Before Sleep',
    note: 'Part of bedtime tasbih.',
  },
  {
    id: 'sleep-alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّه',
    transliteration: 'Alhamdulillah',
    meaning: 'All praise is for Allah',
    target: 33,
    when: 'Before sleep',
    category: 'Before Sleep',
    note: 'Part of bedtime tasbih.',
  },
  {
    id: 'sleep-allahuakbar',
    arabic: 'اللهُ أَكْبَر',
    transliteration: 'Allahu Akbar',
    meaning: 'Allah is the Greatest',
    target: 34,
    when: 'Before sleep',
    category: 'Before Sleep',
    note: 'Part of bedtime tasbih.',
  },
  {
    id: 'wake-up',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا',
    transliteration: 'Alhamdulillahil-ladhi ahyana...',
    meaning: 'Praise be to Allah who gave us life after causing us to die',
    target: 1,
    when: 'When waking up',
    category: 'Morning',
    note: 'Say when waking from sleep.',
  },
  {
    id: 'enter-home',
    arabic: 'بِسْمِ اللهِ وَلَجْنَا، وَبِسْمِ اللهِ خَرَجْنَا',
    transliteration: 'Bismillahi walajna...',
    meaning: 'In Allah’s name we enter and in Allah’s name we leave',
    target: 1,
    when: 'When entering home',
    category: 'Daily Life',
    note: 'Remember Allah when entering home.',
  },
  {
    id: 'before-eating',
    arabic: 'بِسْمِ الله',
    transliteration: 'Bismillah',
    meaning: 'In the name of Allah',
    target: 1,
    when: 'Before eating or drinking',
    category: 'Daily Life',
    note: 'Say before food and drink.',
  },
  {
    id: 'after-eating',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا',
    transliteration: 'Alhamdulillahilladhi at’amani hadha',
    meaning: 'Praise be to Allah who fed me this',
    target: 1,
    when: 'After eating',
    category: 'Daily Life',
    note: 'Say after food.',
  },

  {
    id: 'la-ilaha-wahdahu-100',
    arabic: 'لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِير',
    transliteration: 'La ilaha illa Allah wahdahu la sharika lah',
    meaning: 'None has the right to be worshipped except Allah alone, without partner',
    target: 100,
    when: 'Morning or any time',
    category: 'Daily Dhikr',
    note: 'A great dhikr of tawhid and praise.',
  },
  {
    id: 'subhanallah-100',
    arabic: 'سُبْحَانَ الله',
    transliteration: 'SubhanAllah',
    meaning: 'Glory be to Allah',
    target: 100,
    when: 'Any time',
    category: 'Daily Dhikr',
    note: 'Simple, light on the tongue, and beautiful for daily remembrance.',
  },
  {
    id: 'alhamdulillah-100',
    arabic: 'الْحَمْدُ لِلَّه',
    transliteration: 'Alhamdulillah',
    meaning: 'All praise is for Allah',
    target: 100,
    when: 'Any time, especially after blessings',
    category: 'Gratitude',
    note: 'Use it to thank Allah throughout the day.',
  },
  {
    id: 'allahu-akbar-100',
    arabic: 'اللهُ أَكْبَر',
    transliteration: 'Allahu Akbar',
    meaning: 'Allah is the Greatest',
    target: 100,
    when: 'Any time',
    category: 'Daily Dhikr',
    note: 'A reminder that Allah is greater than every worry.',
  },
  {
    id: 'salawat-10',
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد',
    transliteration: 'Allahumma salli wa sallim ala nabiyyina Muhammad',
    meaning: 'O Allah, send prayers and peace upon our Prophet Muhammad ﷺ',
    target: 10,
    when: 'Morning, evening, and Friday',
    category: 'Salawat',
    note: 'A short daily salawat goal.',
  },
  {
    id: 'salawat-1000',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّد',
    transliteration: 'Allahumma salli ala Muhammad wa ala ali Muhammad',
    meaning: 'O Allah, send blessings upon Muhammad and the family of Muhammad ﷺ',
    target: 1000,
    when: 'Friday or any dedicated salawat session',
    category: 'Salawat',
    note: 'A larger target for days when you want more salawat.',
  },
  {
    id: 'istighfar-70',
    arabic: 'أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullaha wa atubu ilayh',
    meaning: 'I seek Allah’s forgiveness and repent to Him',
    target: 70,
    when: 'Morning, evening, or after mistakes',
    category: 'Forgiveness',
    note: 'A daily habit of repentance and renewal.',
  },
  {
    id: 'istighfar-1000',
    arabic: 'أَسْتَغْفِرُ الله',
    transliteration: 'Astaghfirullah',
    meaning: 'I seek forgiveness from Allah',
    target: 1000,
    when: 'Any quiet time',
    category: 'Forgiveness',
    note: 'A larger istighfar goal for focused sessions.',
  },
  {
    id: 'subhanallah-wa-bihamdihi-subhanallahil-azim',
    arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ، سُبْحَانَ اللهِ الْعَظِيم',
    transliteration: 'SubhanAllahi wa bihamdihi, SubhanAllahil Azim',
    meaning: 'Glory and praise be to Allah; glory be to Allah the Magnificent',
    target: 100,
    when: 'Any time',
    category: 'Daily Dhikr',
    note: 'Two beloved phrases of remembrance.',
  },
  {
    id: 'ya-hayyu-ya-qayyum',
    arabic: 'يَا حَيُّ يَا قَيُّومُ، بِرَحْمَتِكَ أَسْتَغِيث',
    transliteration: 'Ya Hayyu Ya Qayyum, bi rahmatika astaghith',
    meaning: 'O Ever-Living, O Sustainer, by Your mercy I seek help',
    target: 40,
    when: 'During worry, stress, or need',
    category: 'Dua',
    note: 'A powerful supplication for Allah’s help and mercy.',
  },
  {
    id: 'rabbi-ghfir-li',
    arabic: 'رَبِّ اغْفِرْ لِي',
    transliteration: 'Rabbi ghfir li',
    meaning: 'My Lord, forgive me',
    target: 100,
    when: 'Any time',
    category: 'Forgiveness',
    note: 'A short and beautiful dua for forgiveness.',
  },
  {
    id: 'rabbi-zidni-ilma',
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    transliteration: 'Rabbi zidni ilma',
    meaning: 'My Lord, increase me in knowledge',
    target: 40,
    when: 'Before studying or reading Quran',
    category: 'Knowledge',
    note: 'A Quranic dua for beneficial knowledge.',
  },
  {
    id: 'rabbi-ishrah-li-sadri',
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي، وَيَسِّرْ لِي أَمْرِي',
    transliteration: 'Rabbi ishrah li sadri wa yassir li amri',
    meaning: 'My Lord, expand my chest and make my matter easy',
    target: 7,
    when: 'Before tasks, study, exams, or speaking',
    category: 'Dua',
    note: 'A dua for ease, calmness, and confidence.',
  },
  {
    id: 'allahumma-inni-asaluka-ilman',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    transliteration: 'Allahumma inni as’aluka ilman nafian, wa rizqan tayyiban, wa amalan mutaqabbalan',
    meaning: 'O Allah, I ask You for beneficial knowledge, pure provision, and accepted deeds',
    target: 1,
    when: 'Morning',
    category: 'Morning',
    note: 'A beautiful morning dua for knowledge, rizq, and accepted worship.',
  },
  {
    id: 'allahumma-bika-asbahna',
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُور',
    transliteration: 'Allahumma bika asbahna wa bika amsayna',
    meaning: 'O Allah, by You we enter morning and evening, live and die, and to You is resurrection',
    target: 1,
    when: 'Morning',
    category: 'Morning',
    note: 'A morning remembrance of life, death, and return to Allah.',
  },
  {
    id: 'allahumma-bika-amsayna',
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِير',
    transliteration: 'Allahumma bika amsayna wa bika asbahna',
    meaning: 'O Allah, by You we enter evening and morning, live and die, and to You is the return',
    target: 1,
    when: 'Evening',
    category: 'Evening',
    note: 'An evening remembrance of reliance and return to Allah.',
  },
  {
    id: 'allahumma-anta-rabbi',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ',
    transliteration: 'Allahumma anta Rabbi la ilaha illa Anta',
    meaning: 'O Allah, You are my Lord; none has the right to be worshipped except You',
    target: 1,
    when: 'Morning and evening',
    category: 'Morning & Evening',
    note: 'A longer form of Sayyidul Istighfar for repentance.',
  },
  {
    id: 'allahumma-afini-fi-badani',
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي',
    transliteration: 'Allahumma afini fi badani, fi sami, fi basari',
    meaning: 'O Allah, grant wellness to my body, hearing, and sight',
    target: 3,
    when: 'Morning and evening',
    category: 'Protection',
    note: 'A dua asking Allah for health and protection.',
  },
  {
    id: 'allahumma-inni-asaluka-afiyah',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَة',
    transliteration: 'Allahumma inni as’alukal afiyah fid-dunya wal-akhirah',
    meaning: 'O Allah, I ask You for wellbeing in this world and the Hereafter',
    target: 3,
    when: 'Morning and evening',
    category: 'Protection',
    note: 'A comprehensive dua for wellbeing.',
  },
  {
    id: 'ya-muqallibal-qulub',
    arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',
    transliteration: 'Ya Muqallibal qulub, thabbit qalbi ala dinik',
    meaning: 'O Turner of hearts, keep my heart firm upon Your religion',
    target: 40,
    when: 'Any time, especially during trials',
    category: 'Faith',
    note: 'A dua for steadfastness and firmness in faith.',
  },
  {
    id: 'allahumma-inni-audhu-bika-minal-hammi',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَن',
    transliteration: 'Allahumma inni a’udhu bika minal hammi wal hazan',
    meaning: 'O Allah, I seek refuge in You from worry and sadness',
    target: 7,
    when: 'During sadness, stress, or anxiety',
    category: 'Dua',
    note: 'A dua for emotional relief and strength.',
  },
  {
    id: 'allahumma-la-sahla',
    arabic: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا',
    transliteration: 'Allahumma la sahla illa ma ja’altahu sahla',
    meaning: 'O Allah, nothing is easy except what You make easy',
    target: 7,
    when: 'Before difficult tasks',
    category: 'Dua',
    note: 'A dua for ease when something feels hard.',
  },
  {
    id: 'allahumma-akfini-bihalalika',
    arabic: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاك',
    transliteration: 'Allahummak-fini bi halalika an haramika',
    meaning: 'O Allah, suffice me with what is halal and enrich me by Your favor',
    target: 7,
    when: 'For provision, debt, or financial worry',
    category: 'Rizq',
    note: 'A dua for halal provision and independence from need.',
  },
  {
    id: 'rabbi-inni-lima-anzalta',
    arabic: 'رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِير',
    transliteration: 'Rabbi inni lima anzalta ilayya min khayrin faqir',
    meaning: 'My Lord, I am truly in need of whatever good You send down to me',
    target: 7,
    when: 'When seeking help, work, marriage, or provision',
    category: 'Rizq',
    note: 'A Quranic dua of need and humility.',
  },
  {
    id: 'allahumma-barik-lana',
    arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا',
    transliteration: 'Allahumma barik lana fima razaqtana',
    meaning: 'O Allah, bless us in what You have provided for us',
    target: 1,
    when: 'Before eating',
    category: 'Daily Life',
    note: 'Ask Allah to place blessing in your food and provision.',
  },
  {
    id: 'after-eating-full',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّة',
    transliteration: 'Alhamdulillahilladhi atamani hadha wa razaqanihi',
    meaning: 'Praise be to Allah who fed me this and provided it without power from me',
    target: 1,
    when: 'After eating',
    category: 'Daily Life',
    note: 'A fuller food gratitude dua.',
  },
  {
    id: 'leaving-home',
    arabic: 'بِسْمِ اللهِ، تَوَكَّلْتُ عَلَى اللهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِالله',
    transliteration: 'Bismillah, tawakkaltu ala Allah, la hawla wa la quwwata illa billah',
    meaning: 'In Allah’s name, I trust Allah; there is no power except by Allah',
    target: 1,
    when: 'When leaving home',
    category: 'Daily Life',
    note: 'A daily reminder of reliance when stepping outside.',
  },
  {
    id: 'entering-masjid',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'Allahumma aftah li abwaba rahmatik',
    meaning: 'O Allah, open for me the doors of Your mercy',
    target: 1,
    when: 'When entering the masjid',
    category: 'Masjid',
    note: 'Say when entering the mosque.',
  },
  {
    id: 'leaving-masjid',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    transliteration: 'Allahumma inni as’aluka min fadlik',
    meaning: 'O Allah, I ask You from Your bounty',
    target: 1,
    when: 'When leaving the masjid',
    category: 'Masjid',
    note: 'Say when leaving the mosque.',
  },
  {
    id: 'after-wudu',
    arabic: 'أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُه',
    transliteration: 'Ashhadu an la ilaha illa Allah...',
    meaning: 'I bear witness that none has the right to be worshipped except Allah and Muhammad ﷺ is His servant and Messenger',
    target: 1,
    when: 'After wudu',
    category: 'Prayer',
    note: 'A beautiful testimony after purification.',
  },
  {
    id: 'between-sajdah',
    arabic: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي',
    transliteration: 'Rabbi ghfir li, Rabbi ghfir li',
    meaning: 'My Lord, forgive me; my Lord, forgive me',
    target: 2,
    when: 'Between the two prostrations',
    category: 'Prayer',
    note: 'A short prayer remembrance inside salah.',
  },
  {
    id: 'after-salah-ayat-kursi',
    arabic: 'آيَةُ الْكُرْسِي',
    transliteration: 'Ayatul Kursi',
    meaning: 'Verse of the Throne',
    target: 1,
    when: 'After obligatory prayer',
    category: 'After Prayer',
    note: 'A key protection recitation after salah.',
  },
  {
    id: 'after-salah-la-ilaha',
    arabic: 'لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِير',
    transliteration: 'La ilaha illa Allah wahdahu la sharika lah',
    meaning: 'None has the right to be worshipped except Allah alone',
    target: 1,
    when: 'After obligatory prayer',
    category: 'After Prayer',
    note: 'A remembrance of tawhid after salah.',
  },
  {
    id: 'before-sleep-bismika',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amutu wa ahya',
    meaning: 'In Your name, O Allah, I die and I live',
    target: 1,
    when: 'Before sleep',
    category: 'Before Sleep',
    note: 'A short bedtime dua.',
  },
  {
    id: 'before-sleep-allahumma-qini',
    arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
    transliteration: 'Allahumma qini adhabaka yawma tabathu ibadak',
    meaning: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants',
    target: 3,
    when: 'Before sleep',
    category: 'Before Sleep',
    note: 'A bedtime protection supplication.',
  },
  {
    id: 'wake-up-full',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُور',
    transliteration: 'Alhamdulillahilladhi ahyana ba’da ma amatana wa ilayhin-nushur',
    meaning: 'Praise be to Allah who gave us life after causing us to die, and to Him is resurrection',
    target: 1,
    when: 'When waking up',
    category: 'Morning',
    note: 'A complete waking-up remembrance.',
  },
  {
    id: 'entering-toilet',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِث',
    transliteration: 'Allahumma inni a’udhu bika minal khubthi wal khabaith',
    meaning: 'O Allah, I seek refuge in You from male and female devils',
    target: 1,
    when: 'Before entering the bathroom',
    category: 'Daily Life',
    note: 'A protection dua before entering the bathroom.',
  },
  {
    id: 'leaving-toilet',
    arabic: 'غُفْرَانَكَ',
    transliteration: 'Ghufranak',
    meaning: 'I seek Your forgiveness',
    target: 1,
    when: 'After leaving the bathroom',
    category: 'Daily Life',
    note: 'A short dua after leaving the bathroom.',
  },
  {
    id: 'wearing-clothes',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا',
    transliteration: 'Alhamdulillahilladhi kasani hadha',
    meaning: 'Praise be to Allah who clothed me with this',
    target: 1,
    when: 'When wearing clothes',
    category: 'Daily Life',
    note: 'A gratitude dua for clothing.',
  },
  {
    id: 'travel-dua',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُون',
    transliteration: 'Subhanalladhi sakhkhara lana hadha...',
    meaning: 'Glory be to the One who subjected this to us, and to our Lord we will return',
    target: 1,
    when: 'When starting a journey or ride',
    category: 'Travel',
    note: 'A travel remembrance when using transport.',
  },
  {
    id: 'return-from-travel',
    arabic: 'آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُون',
    transliteration: 'Ayibuna, taibuna, abiduna, li Rabbina hamidun',
    meaning: 'We return repentant, worshipping, and praising our Lord',
    target: 1,
    when: 'Returning from travel',
    category: 'Travel',
    note: 'A remembrance when coming back from a journey.',
  },
  {
    id: 'rain-dua',
    arabic: 'اللَّهُمَّ صَيِّبًا نَافِعًا',
    transliteration: 'Allahumma sayyiban nafian',
    meaning: 'O Allah, make it beneficial rain',
    target: 1,
    when: 'When rain falls',
    category: 'Nature',
    note: 'A simple dua when seeing rain.',
  },
  {
    id: 'wind-dua',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَأَعُوذُ بِكَ مِنْ شَرِّهَا',
    transliteration: 'Allahumma inni as’aluka khayraha wa a’udhu bika min sharriha',
    meaning: 'O Allah, I ask You for its good and seek refuge in You from its harm',
    target: 1,
    when: 'When wind blows strongly',
    category: 'Nature',
    note: 'A dua during strong wind.',
  },
  {
    id: 'sneezing',
    arabic: 'الْحَمْدُ لِلَّه',
    transliteration: 'Alhamdulillah',
    meaning: 'All praise is for Allah',
    target: 1,
    when: 'After sneezing',
    category: 'Daily Life',
    note: 'Say after sneezing.',
  },
  {
    id: 'reply-sneeze',
    arabic: 'يَرْحَمُكَ الله',
    transliteration: 'YarhamukAllah',
    meaning: 'May Allah have mercy on you',
    target: 1,
    when: 'Replying to someone who sneezes and says Alhamdulillah',
    category: 'Manners',
    note: 'A beautiful sunnah of social kindness.',
  },
  {
    id: 'reply-yahdikumullah',
    arabic: 'يَهْدِيكُمُ اللهُ وَيُصْلِحُ بَالَكُم',
    transliteration: 'Yahdikumullahu wa yuslihu balakum',
    meaning: 'May Allah guide you and rectify your affairs',
    target: 1,
    when: 'Reply after someone says YarhamukAllah',
    category: 'Manners',
    note: 'Complete the beautiful exchange after sneezing.',
  },
  {
    id: 'seeing-afflicted',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي مِمَّا ابْتَلَاكَ بِهِ',
    transliteration: 'Alhamdulillahilladhi afani mimma ibtalaka bih',
    meaning: 'Praise be to Allah who protected me from what He tested you with',
    target: 1,
    when: 'Privately when seeing someone afflicted',
    category: 'Protection',
    note: 'Say quietly with humility, never to hurt someone.',
  },
  {
    id: 'market-dua',
    arabic: 'لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ حَيٌّ لَا يَمُوت',
    transliteration: 'La ilaha illa Allah wahdahu la sharika lah...',
    meaning: 'None has the right to be worshipped except Allah alone; to Him belongs dominion and praise',
    target: 1,
    when: 'Entering a marketplace',
    category: 'Daily Life',
    note: 'A remembrance for busy public places.',
  },
  {
    id: 'anger-audhu',
    arabic: 'أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيم',
    transliteration: 'A’udhu billahi minash-shaytanir-rajim',
    meaning: 'I seek refuge in Allah from the rejected Shaytan',
    target: 7,
    when: 'When angry or tempted',
    category: 'Protection',
    note: 'Use it to cool anger and seek Allah’s protection.',
  },
  {
    id: 'evil-eye-mashaallah',
    arabic: 'مَا شَاءَ اللهُ، لَا قُوَّةَ إِلَّا بِالله',
    transliteration: 'MashaAllah, la quwwata illa billah',
    meaning: 'What Allah wills; there is no power except by Allah',
    target: 1,
    when: 'When seeing something pleasing',
    category: 'Protection',
    note: 'A reminder to attribute blessings to Allah.',
  },
  {
    id: 'dua-for-parents',
    arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbi irhamhuma kama rabbayani saghira',
    meaning: 'My Lord, have mercy on them as they raised me when I was small',
    target: 7,
    when: 'Any time',
    category: 'Family',
    note: 'A Quranic dua for parents.',
  },
  {
    id: 'dua-family-good',
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ',
    transliteration: 'Rabbana hab lana min azwajina wa dhurriyyatina qurrata a’yun',
    meaning: 'Our Lord, grant us from our spouses and children comfort to our eyes',
    target: 7,
    when: 'For family and home',
    category: 'Family',
    note: 'A Quranic dua for a blessed family.',
  },
  {
    id: 'dua-for-guidance',
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا',
    transliteration: 'Rabbana la tuzigh qulubana ba’da idh hadaytana',
    meaning: 'Our Lord, do not let our hearts deviate after You have guided us',
    target: 7,
    when: 'Any time',
    category: 'Faith',
    note: 'A Quranic dua for guidance and firmness.',
  },
  {
    id: 'dua-for-good-world-hereafter',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّار',
    transliteration: 'Rabbana atina fid-dunya hasanah wa fil-akhirati hasanah',
    meaning: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the Fire',
    target: 7,
    when: 'Any time, especially in dua',
    category: 'Dua',
    note: 'A comprehensive Quranic dua.',
  },
  {
    id: 'dua-yunus',
    arabic: 'لَا إِلٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliteration: 'La ilaha illa Anta, subhanaka inni kuntu minaz-zalimin',
    meaning: 'None has the right to be worshipped except You; glory be to You, I was among the wrongdoers',
    target: 40,
    when: 'During hardship, repentance, or distress',
    category: 'Dua',
    note: 'The supplication of Prophet Yunus عليه السلام.',
  },
  {
    id: 'dua-for-mercy',
    arabic: 'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
    transliteration: 'Rabbana zalamna anfusana...',
    meaning: 'Our Lord, we have wronged ourselves; if You do not forgive and have mercy, we will be losers',
    target: 7,
    when: 'For repentance',
    category: 'Forgiveness',
    note: 'The repentance dua of Adam and Hawwa عليهما السلام.',
  },
  {
    id: 'dua-for-sabr',
    arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ',
    transliteration: 'Rabbana afrigh alayna sabran wa tawaffana muslimin',
    meaning: 'Our Lord, pour upon us patience and let us die as Muslims',
    target: 7,
    when: 'During trials',
    category: 'Dua',
    note: 'A Quranic dua for patience and a good ending.',
  },
  {
    id: 'dua-light',
    arabic: 'اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا',
    transliteration: 'Allahumma aj’al fi qalbi nura',
    meaning: 'O Allah, place light in my heart',
    target: 7,
    when: 'Morning, night prayer, or seeking guidance',
    category: 'Faith',
    note: 'A dua asking Allah for light and guidance.',
  },
  {
    id: 'dua-good-ending',
    arabic: 'اللَّهُمَّ أَحْسِنْ عَاقِبَتَنَا فِي الْأُمُورِ كُلِّهَا',
    transliteration: 'Allahumma ahsin aqibatana fil umuri kulliha',
    meaning: 'O Allah, make the outcome of all our affairs good',
    target: 7,
    when: 'Any time',
    category: 'Dua',
    note: 'A dua for a beautiful ending in every matter.',
  },
  {
    id: 'dua-protection-from-fire',
    arabic: 'اللَّهُمَّ أَجِرْنِي مِنَ النَّار',
    transliteration: 'Allahumma ajirni minan-nar',
    meaning: 'O Allah, save me from the Fire',
    target: 7,
    when: 'Morning and evening',
    category: 'Protection',
    note: 'A direct dua for safety in the Hereafter.',
  },
  {
    id: 'dua-jannah',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّة',
    transliteration: 'Allahumma inni as’alukal Jannah',
    meaning: 'O Allah, I ask You for Paradise',
    target: 7,
    when: 'Morning and evening',
    category: 'Dua',
    note: 'Ask Allah often for Jannah.',
  },
  {
    id: 'dua-refuge-from-hell',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ النَّار',
    transliteration: 'Allahumma inni a’udhu bika minan-nar',
    meaning: 'O Allah, I seek refuge in You from the Fire',
    target: 7,
    when: 'Morning and evening',
    category: 'Protection',
    note: 'Seek Allah’s protection from Hellfire.',
  },
  {
    id: 'dua-after-adhaan',
    arabic: 'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَة',
    transliteration: 'Allahumma Rabba hadhihid-da’watit-tammah...',
    meaning: 'O Allah, Lord of this perfect call and established prayer, grant Muhammad ﷺ al-Wasilah and virtue',
    target: 1,
    when: 'After the adhan',
    category: 'Prayer',
    note: 'A special dua after hearing the call to prayer.',
  },
  {
    id: 'repeat-adhaan-allahu-akbar',
    arabic: 'اللهُ أَكْبَر',
    transliteration: 'Allahu Akbar',
    meaning: 'Allah is the Greatest',
    target: 4,
    when: 'When repeating the adhan',
    category: 'Prayer',
    note: 'Repeat after the mu’adhdhin during the adhan.',
  },
  {
    id: 'repeat-adhaan-shahadah',
    arabic: 'أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا الله، أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ الله',
    transliteration: 'Ashhadu an la ilaha illa Allah, ashhadu anna Muhammadan Rasulullah',
    meaning: 'I bear witness that none is worthy of worship except Allah and Muhammad is His Messenger',
    target: 2,
    when: 'When repeating the adhan',
    category: 'Prayer',
    note: 'Part of responding to the adhan.',
  },
  {
    id: 'dhikr-after-witr',
    arabic: 'سُبْحَانَ الْمَلِكِ الْقُدُّوس',
    transliteration: 'Subhanal Malikil Quddus',
    meaning: 'Glory be to the Sovereign, the Most Holy',
    target: 3,
    when: 'After Witr prayer',
    category: 'Prayer',
    note: 'A remembrance after Witr.',
  },
];

const CATEGORIES = [
  'All',
  'After Prayer',
  'Morning & Evening',
  'Morning',
  'Evening',
  'Protection',
  'Daily Dhikr',
  'Forgiveness',
  'Salawat',
  'Before Sleep',
  'Daily Life',
  'Reliance',
  'Gratitude',
  'Dua',
  'Knowledge',
  'Faith',
  'Rizq',
  'Masjid',
  'Prayer',
  'Travel',
  'Nature',
  'Manners',
  'Family',
];

export default function TasbihCounterPage() {
  const [selectedDhikrId, setSelectedDhikrId] = useState(DHIKR_LIST[0].id);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [count, setCount] = useState(0);
  const [totalToday, setTotalToday] = useState(0);
  const [lifetimeTotal, setLifetimeTotal] = useState(0);
  const [completedRounds, setCompletedRounds] = useState(0);
  const [customTarget, setCustomTarget] = useState('');
  const [vibrationOn, setVibrationOn] = useState(true);
  const [soundOn, setSoundOn] = useState(false);

  const selectedDhikr = useMemo(() => {
    return DHIKR_LIST.find(item => item.id === selectedDhikrId) || DHIKR_LIST[0];
  }, [selectedDhikrId]);

  const target = useMemo(() => {
    const custom = Number(customTarget);
    return custom > 0 ? custom : selectedDhikr.target;
  }, [customTarget, selectedDhikr]);

  const progress = Math.min(100, Math.round((count / target) * 100));

  const filteredDhikr = useMemo(() => {
    const s = query.toLowerCase();

    return DHIKR_LIST.filter(item => {
      const matchesCategory = category === 'All' || item.category === category;

      const matchesSearch =
        item.arabic.includes(query) ||
        item.transliteration.toLowerCase().includes(s) ||
        item.meaning.toLowerCase().includes(s) ||
        item.when.toLowerCase().includes(s) ||
        item.category.toLowerCase().includes(s);

      return matchesCategory && matchesSearch;
    });
  }, [category, query]);

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    saveState();
  }, [
    selectedDhikrId,
    category,
    count,
    totalToday,
    lifetimeTotal,
    completedRounds,
    customTarget,
    vibrationOn,
    soundOn,
  ]);

  const loadState = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_STATE);
      if (!saved) return;

      const data = JSON.parse(saved);

      setSelectedDhikrId(data.selectedDhikrId || DHIKR_LIST[0].id);
      setCategory(data.category || 'All');
      setCount(data.count || 0);
      setTotalToday(data.totalToday || 0);
      setLifetimeTotal(data.lifetimeTotal || 0);
      setCompletedRounds(data.completedRounds || 0);
      setCustomTarget(data.customTarget || '');
      setVibrationOn(data.vibrationOn ?? true);
      setSoundOn(data.soundOn ?? false);
    } catch {}
  };

  const saveState = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_STATE,
        JSON.stringify({
          selectedDhikrId,
          category,
          count,
          totalToday,
          lifetimeTotal,
          completedRounds,
          customTarget,
          vibrationOn,
          soundOn,
        })
      );
    } catch {}
  };

  const increment = () => {
    const newCount = count + 1;

    setCount(newCount);
    setTotalToday(prev => prev + 1);
    setLifetimeTotal(prev => prev + 1);

    if (vibrationOn) Vibration.vibrate(18);

    if (newCount === target) {
      setCompletedRounds(prev => prev + 1);
      if (vibrationOn) Vibration.vibrate([0, 120, 80, 120]);

      Alert.alert(
        'Round Complete 🌙',
        `You completed ${target} ${selectedDhikr.transliteration}.`
      );
    }
  };

  const decrement = () => {
    if (count <= 0) return;

    setCount(prev => prev - 1);
    setTotalToday(prev => Math.max(0, prev - 1));
    setLifetimeTotal(prev => Math.max(0, prev - 1));
  };

  const resetCurrent = () => {
    Alert.alert('Reset Counter', 'Do you want to reset the current counter?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => setCount(0) },
    ]);
  };

  const switchDhikr = (id: string) => {
    if (count > 0) {
      Alert.alert('Switch Dhikr', 'Switching will reset the current count. Continue?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            setSelectedDhikrId(id);
            setCount(0);
            setCustomTarget('');
          },
        },
      ]);
      return;
    }

    setSelectedDhikrId(id);
    setCustomTarget('');
  };

  const scheduleReminder = async () => {
    try {
      const permission = await Notifications.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Please allow notifications.');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Morning Dhikr 🌅',
          body: 'Start your day with morning adhkar.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 6,
          minute: 0,
        },
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Evening Dhikr 🌙',
          body: 'Take a peaceful moment for evening adhkar.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 18,
          minute: 0,
        },
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'After Prayer Tasbih 🤲',
          body: 'Remember to complete your tasbih after salah.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 20,
          minute: 0,
        },
      });

      Alert.alert(
        'Reminders Saved',
        'Morning, evening and daily tasbih reminders have been set.'
      );
    } catch {
      Alert.alert('Reminder Error', 'Unable to schedule reminder.');
    }
  };

  const shareProgress = async () => {
    await Share.share({
      message: `My Tasbih Progress 🌙\n\nToday: ${totalToday}\nLifetime: ${lifetimeTotal}\nCurrent Dhikr: ${selectedDhikr.transliteration}\nCurrent Count: ${count}/${target}\nWhen: ${selectedDhikr.when}`,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.goldGlow} />
        <View style={styles.greenGlow} />

        <LinearGradient colors={[GREEN, EMERALD]} style={styles.hero}>
          <View style={styles.heroBadge}>
            <Sparkles size={13} color={GOLD} />
            <Text style={styles.heroBadgeText}>Complete Dhikr Counter</Text>
          </View>

          <Text style={styles.heroTitle}>Tasbih & Zhikr</Text>

          <Text style={styles.heroSubtitle}>
            Count daily dhikr with timing, target numbers, categories, reminders and progress.
          </Text>
        </LinearGradient>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Flame size={18} color={GOLD} />
            <Text style={styles.statNumber}>{totalToday}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>

          <View style={styles.statCard}>
            <Trophy size={18} color={GOLD} />
            <Text style={styles.statNumber}>{completedRounds}</Text>
            <Text style={styles.statLabel}>Rounds</Text>
          </View>

          <View style={styles.statCard}>
            <Star size={18} color={GOLD} />
            <Text style={styles.statNumber}>{lifetimeTotal}</Text>
            <Text style={styles.statLabel}>Lifetime</Text>
          </View>
        </View>

        <LinearGradient colors={[CARD, '#F7F0DC']} style={styles.counterCard}>
          <View style={styles.dhikrHeader}>
            <Moon size={20} color={GOLD} />
            <Text style={styles.selectedTitle}>{selectedDhikr.transliteration}</Text>
          </View>

          <Text style={styles.arabicText}>{selectedDhikr.arabic}</Text>
          <Text style={styles.meaningText}>{selectedDhikr.meaning}</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoPill}>
              <Clock size={14} color={GREEN} />
              <Text style={styles.infoText}>{selectedDhikr.when}</Text>
            </View>

            <View style={styles.infoPill}>
              <BookOpen size={14} color={GREEN} />
              <Text style={styles.infoText}>{selectedDhikr.category}</Text>
            </View>
          </View>

          <Text style={styles.noteText}>{selectedDhikr.note}</Text>

          <View style={styles.progressOuter}>
            <View style={[styles.progressInner, { width: `${progress}%` }]} />
          </View>

          <Text style={styles.progressText}>
            {count} / {target} • {progress}%
          </Text>

          <TouchableOpacity activeOpacity={0.88} style={styles.bigButton} onPress={increment}>
            <LinearGradient colors={[GREEN, EMERALD]} style={styles.bigButtonInner}>
              <Text style={styles.countText}>{count}</Text>
              <Text style={styles.tapText}>TAP TO COUNT</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.counterActions}>
            <TouchableOpacity style={styles.smallAction} onPress={decrement}>
              <Minus size={18} color={GREEN} />
              <Text style={styles.smallActionText}>Minus</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallAction} onPress={resetCurrent}>
              <RotateCcw size={18} color={GREEN} />
              <Text style={styles.smallActionText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallAction} onPress={increment}>
              <Plus size={18} color={GREEN} />
              <Text style={styles.smallActionText}>Add</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <LinearGradient colors={[CARD, '#FFF6E1']} style={styles.toolsCard}>
          <View style={styles.sectionHeader}>
            <Settings size={18} color={GOLD} />
            <Text style={styles.sectionTitle}>Tasbih Tools</Text>
          </View>

          <Text style={styles.inputLabel}>Custom Target</Text>
          <TextInput
            style={styles.targetInput}
            placeholder="Example: 100, 300, 1000"
            placeholderTextColor="#8A8172"
            keyboardType="numeric"
            value={customTarget}
            onChangeText={setCustomTarget}
          />

          <View style={styles.toolRow}>
            <TouchableOpacity
              style={[styles.toggleButton, vibrationOn && styles.toggleActive]}
              onPress={() => setVibrationOn(prev => !prev)}
            >
              <Vibrate size={17} color={vibrationOn ? '#FFFFFF' : GREEN} />
              <Text style={[styles.toggleText, vibrationOn && styles.toggleTextActive]}>
                Vibration
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleButton, soundOn && styles.toggleActive]}
              onPress={() => setSoundOn(prev => !prev)}
            >
              <Volume2 size={17} color={soundOn ? '#FFFFFF' : GREEN} />
              <Text style={[styles.toggleText, soundOn && styles.toggleTextActive]}>
                Sound
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toolRow}>
            <TouchableOpacity style={styles.mainToolButton} onPress={scheduleReminder}>
              <Bell size={18} color="#FFFFFF" />
              <Text style={styles.mainToolButtonText}>Smart Reminders</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mainToolButton} onPress={shareProgress}>
              <Share2 size={18} color="#FFFFFF" />
              <Text style={styles.mainToolButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search dhikr, timing, category..."
            placeholderTextColor="#8A8172"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map(item => {
            const active = item === category;

            return (
              <TouchableOpacity
                key={item}
                style={[styles.categoryPill, active && styles.categoryPillActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Heart size={18} color={GOLD} />
          <Text style={styles.sectionTitle}>Dhikr Library</Text>
        </View>

        {filteredDhikr.map(item => {
          const active = item.id === selectedDhikrId;

          return (
            <TouchableOpacity key={item.id} activeOpacity={0.85} onPress={() => switchDhikr(item.id)}>
              <LinearGradient
                colors={active ? [GREEN, EMERALD] : [CARD, '#F7F0DC']}
                style={styles.dhikrCard}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dhikrArabic, active && styles.activeText]}>
                    {item.arabic}
                  </Text>

                  <Text style={[styles.dhikrName, active && styles.activeText]}>
                    {item.transliteration}
                  </Text>

                  <Text style={[styles.dhikrMeaning, active && styles.activeSubText]}>
                    {item.meaning}
                  </Text>

                  <View style={styles.libraryMetaRow}>
                    <View style={[styles.libraryMetaPill, active && styles.libraryMetaPillActive]}>
                      <Clock size={12} color={active ? GREEN : GOLD} />
                      <Text style={[styles.libraryMetaText, active && styles.libraryMetaTextActive]}>
                        {item.when}
                      </Text>
                    </View>

                    <View style={[styles.libraryMetaPill, active && styles.libraryMetaPillActive]}>
                      <Shield size={12} color={active ? GREEN : GOLD} />
                      <Text style={[styles.libraryMetaText, active && styles.libraryMetaTextActive]}>
                        {item.category}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.targetPill, active && styles.targetPillActive]}>
                  <Target size={14} color={active ? GREEN : GOLD} />
                  <Text style={[styles.targetText, active && styles.targetTextActive]}>
                    {item.target}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}

        <LinearGradient colors={[GREEN, EMERALD]} style={styles.rewardCard}>
          <CheckCircle size={28} color={GOLD} />
          <Text style={styles.rewardTitle}>Daily Dhikr Goal</Text>
          <Text style={styles.rewardText}>
            Start with morning adhkar, complete tasbih after salah, and end your day with protection adhkar before sleep.
          </Text>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: CREAM },
  container: { flex: 1 },
  content: { paddingHorizontal: 13, paddingTop: 14, paddingBottom: 32 },

  goldGlow: {
    position: 'absolute',
    top: -86,
    right: -88,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: GOLD,
    opacity: 0.13,
  },

  greenGlow: {
    position: 'absolute',
    top: 330,
    left: -110,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: GREEN,
    opacity: 0.07,
  },

  hero: {
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 11,
    shadowColor: GREEN,
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },

  heroBadgeText: { color: GOLD, fontSize: 10.5, fontWeight: '900', marginLeft: 5 },
  heroTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '900', letterSpacing: 0.2 },

  heroSubtitle: {
    color: '#E6FFF4',
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 7,
    fontWeight: '700',
    maxWidth: 305,
  },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 11 },

  statCard: {
    width: '32%',
    backgroundColor: CARD,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EADFC8',
    shadowColor: '#3E2F13',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 2,
  },

  statNumber: { color: GREEN, fontSize: 13.5, fontWeight: '900', marginTop: 4 },
  statLabel: { color: '#746A5D', fontSize: 9.5, fontWeight: '800', marginTop: 2 },

  counterCard: {
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EADFC8',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#3E2F13',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },

  dhikrHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  selectedTitle: { color: GREEN, fontSize: 15.5, fontWeight: '900', marginLeft: 6 },

  arabicText: {
    color: GREEN,
    fontSize: 24,
    lineHeight: 36,
    textAlign: 'center',
    fontWeight: '900',
    writingDirection: 'rtl',
  },

  meaningText: {
    color: '#5F554B',
    fontSize: 11.5,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },

  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 9,
  },

  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MINT,
    borderRadius: 999,
    paddingVertical: 5.5,
    paddingHorizontal: 9,
    margin: 3,
    borderWidth: 1,
    borderColor: 'rgba(6,78,59,0.06)',
  },

  infoText: {
    color: GREEN,
    fontSize: 9.5,
    fontWeight: '900',
    marginLeft: 4,
  },

  noteText: {
    color: '#8A6A22',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 15,
  },

  progressOuter: {
    width: '100%',
    height: 10,
    backgroundColor: '#E8DFC8',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 13,
  },

  progressInner: { height: '100%', backgroundColor: GOLD, borderRadius: 999 },
  progressText: { color: GREEN, fontWeight: '900', marginTop: 7, fontSize: 11.5 },

  bigButton: {
    width: 168,
    height: 168,
    borderRadius: 999,
    marginTop: 15,
    shadowColor: GREEN,
    shadowOpacity: 0.20,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 12,
    elevation: 6,
  },

  bigButtonInner: {
    flex: 1,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: 'rgba(212,160,23,0.32)',
  },

  countText: { color: '#FFFFFF', fontSize: 50, fontWeight: '900' },
  tapText: { color: '#E6FFF4', fontSize: 10.5, fontWeight: '900', marginTop: 3, letterSpacing: 0.8 },

  counterActions: { flexDirection: 'row', marginTop: 14 },

  smallAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MINT,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 11,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: 'rgba(6,78,59,0.06)',
  },

  smallActionText: { color: GREEN, fontSize: 10, fontWeight: '900', marginLeft: 4 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { color: GREEN, fontSize: 14.5, fontWeight: '900', marginLeft: 6 },

  toolsCard: {
    borderRadius: 22,
    padding: 13,
    borderWidth: 1,
    borderColor: '#EADFC8',
    marginTop: 2,
    marginBottom: 11,
    shadowColor: '#3E2F13',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },

  inputLabel: { color: GREEN, fontSize: 11, fontWeight: '900', marginBottom: 6 },

  targetInput: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: '#EADFC8',
    borderRadius: 15,
    paddingHorizontal: 11,
    paddingVertical: 9,
    color: GREEN,
    fontWeight: '800',
    marginBottom: 10,
    fontSize: 12,
  },

  toolRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },

  toggleButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    backgroundColor: MINT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6,78,59,0.06)',
  },

  toggleActive: { backgroundColor: GREEN, borderColor: GREEN },

  toggleText: { color: GREEN, fontWeight: '900', fontSize: 10.5, marginLeft: 5 },
  toggleTextActive: { color: '#FFFFFF' },

  mainToolButton: {
    flex: 1,
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: GREEN,
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 2,
  },

  mainToolButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 10.5, marginLeft: 5 },

  searchBox: {
    backgroundColor: CARD,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EADFC8',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
    shadowColor: '#3E2F13',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 1,
  },

  searchInput: { color: GREEN, fontWeight: '800', fontSize: 12 },

  categoryScroll: { marginBottom: 11 },

  categoryPill: {
    backgroundColor: CARD,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: '#EADFC8',
    marginRight: 7,
  },

  categoryPillActive: { backgroundColor: GREEN, borderColor: GREEN },

  categoryText: { color: GREEN, fontSize: 10, fontWeight: '900' },
  categoryTextActive: { color: '#FFFFFF' },

  dhikrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 19,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EADFC8',
    marginBottom: 8,
    shadowColor: '#3E2F13',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 2,
  },

  dhikrArabic: {
    color: GREEN,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 27,
  },

  dhikrName: { color: GREEN, fontSize: 12, fontWeight: '900', marginTop: 3 },

  dhikrMeaning: {
    color: '#6B6257',
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2,
    lineHeight: 15,
  },

  activeText: { color: '#FFFFFF' },
  activeSubText: { color: '#DDF5EA' },

  libraryMetaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },

  libraryMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5E9C8',
    borderRadius: 999,
    paddingVertical: 4.5,
    paddingHorizontal: 7,
    marginRight: 5,
    marginBottom: 4,
  },

  libraryMetaPillActive: { backgroundColor: '#FFFFFF' },

  libraryMetaText: {
    color: '#8B5E16',
    fontSize: 8.7,
    fontWeight: '900',
    marginLeft: 3,
    maxWidth: 132,
  },

  libraryMetaTextActive: { color: GREEN },

  targetPill: {
    backgroundColor: '#F5E9C8',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },

  targetPillActive: { backgroundColor: '#FFFFFF' },
  targetText: { color: '#8B5E16', fontSize: 10, fontWeight: '900', marginLeft: 3 },
  targetTextActive: { color: GREEN },

  rewardCard: {
    borderRadius: 23,
    padding: 15,
    alignItems: 'center',
    marginTop: 5,
    shadowColor: GREEN,
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 12,
    elevation: 4,
  },

  rewardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', marginTop: 6 },

  rewardText: {
    color: '#E6FFF4',
    fontSize: 11.3,
    lineHeight: 17,
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 5,
  },
});