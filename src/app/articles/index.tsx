import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Share,
  Image,
  KeyboardTypeOptions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import {
  Search,
  BookOpen,
  Star,
  Heart,
  Moon,
  Sparkles,
  ShieldCheck,
  ScrollText,
  HandHeart,
  Users,
  Sun,
  Feather,
  X,
  Share2,
  Bookmark,
  CheckCircle2,
  Flower2,
  Gem,
  BookMarked,
  GraduationCap,
  Compass,
  ListChecks,
  Scale,
  Calculator,
  Wallet,
  Coins,
  Landmark,
  Home,
  Briefcase,
  Wheat,
  CircleDollarSign,
  Info,
  RefreshCcw,
  ChevronRight,
  Clock,
  Target,
  RotateCcw,
  Plus,
  Minus,
} from 'lucide-react-native';

type Tab = 'Home' | 'Pillars' | 'Faith' | 'Shahadah' | 'Names' | 'Zakat' | 'Articles' | 'Saved';

type ArticleCategory =
  | 'Aqidah'
  | 'Hereafter'
  | 'Seerah'
  | 'Islamic History'
  | 'Halal Earnings'
  | 'Marriage'
  | 'Parenting'
  | 'Character Building'
  | 'Repentance'
  | 'Knowledge'
  | 'Community'
  | 'Dawah'
  | 'Heart Softening'
  | 'Zakat';

type ArticleItem = {
  id: string;
  title: string;
  category: ArticleCategory;
  summary: string;
  content: string[];
  keyPoints: string[];
  quote?: string;
};

type NameOfAllah = {
  id: number;
  arabic: string;
  transliteration: string;
  meaning: string;
  reflection: string;
  bestTime: string;
  suggestedCount: number;
  rewardNote: string;
};

type ZakatInputs = {
  cash: string;
  bankSavings: string;
  goldValue: string;
  silverValue: string;
  businessStock: string;
  moneyOwedToYou: string;
  investments: string;
  crypto: string;
  rentalIncomeSaved: string;
  agriculturalProduceValue: string;
  livestockValue: string;
  immediateDebts: string;
  billsDue: string;
  goldNisabValue: string;
  silverNisabValue: string;
  haramIncomeExcluded: string;
  useSilverNisab: boolean;
  agriculturalIsIrrigated: boolean;
};

const GREEN = '#064E3B';
const EMERALD = '#0D7054';
const GOLD = '#D4A017';
const CREAM = '#F7F5EE';
const CARD = '#FFFDF8';
const MINT = '#E6F1EC';
const TEXT = '#3C3A34';
const ROSE = '#9F2D2D';

const PILLARS_OF_ISLAM = [
  {
    title: 'Shahadah',
    subtitle: 'Testimony of Faith',
    text: 'To testify that none has the right to be worshipped except Allah, and that Muhammad ﷺ is the Messenger of Allah.',
    icon: 'شهادة',
  },
  {
    title: 'Salah',
    subtitle: 'Prayer',
    text: 'To establish the five daily prayers with sincerity, humility, purification, and obedience to Allah.',
    icon: 'صلاة',
  },
  {
    title: 'Zakat',
    subtitle: 'Obligatory Charity',
    text: 'To give the required portion of eligible halal wealth to those entitled to receive it.',
    icon: 'زكاة',
  },
  {
    title: 'Sawm',
    subtitle: 'Fasting Ramadan',
    text: 'To fast the month of Ramadan with faith, self-control, worship, patience, and hope for Allah’s reward.',
    icon: 'صوم',
  },
  {
    title: 'Hajj',
    subtitle: 'Pilgrimage',
    text: 'To perform Hajj to the Sacred House once in a lifetime for whoever is physically and financially able.',
    icon: 'حج',
  },
];

const DAILY_SALAHS = [
  { name: 'Fajr', arabic: 'الفجر', time: 'Before sunrise', rakahs: '2 obligatory rakahs', meaning: 'The dawn prayer begins the day with remembrance, discipline, and reliance upon Allah before worldly work begins.' },
  { name: 'Dhuhr', arabic: 'الظهر', time: 'After midday', rakahs: '4 obligatory rakahs', meaning: 'The noon prayer returns the heart to Allah in the middle of daily responsibilities and reminds the believer that success comes from Him.' },
  { name: 'Asr', arabic: 'العصر', time: 'Afternoon', rakahs: '4 obligatory rakahs', meaning: 'The afternoon prayer protects the believer from heedlessness when the day becomes busy and teaches respect for time.' },
  { name: 'Maghrib', arabic: 'المغرب', time: 'Just after sunset', rakahs: '3 obligatory rakahs', meaning: 'The sunset prayer closes the daylight with gratitude, reflection, and a renewed return to Allah.' },
  { name: 'Isha', arabic: 'العشاء', time: 'Night', rakahs: '4 obligatory rakahs', meaning: 'The night prayer ends the day with worship, calmness, accountability, and hope for Allah’s protection.' },
];


const SUNNAH_NAFL_SALAHS = [
  {
    prayer: 'Fajr',
    arabic: 'الفجر',
    obligatory: 'Fard / compulsory: 2 rakahs',
    sunnah: [
      { timing: 'Before Fajr', rakahs: '2 rakahs', type: 'Sunnah Mu’akkadah / emphasized Sunnah', note: 'This is an authentic and highly emphasized Sunnah prayed after the Fajr time enters and before the compulsory Fajr prayer. It should be protected with great care.' },
      { timing: 'After Fajr', rakahs: 'No regular Sunnah or general Nafl until sunrise has passed', type: 'Restricted voluntary time', note: 'After praying Fajr, general voluntary prayers are avoided until the sun has risen well. Prayers with a specific reason may have scholarly detail, so learn with a trusted teacher.' },
    ],
  },
  {
    prayer: 'Salatul Duha',
    arabic: 'صلاة الضحى',
    obligatory: 'Voluntary Nafl: not compulsory',
    sunnah: [
      { timing: 'After sunrise has risen well until before Dhuhr, with the best time later in the morning before Dhuhr', rakahs: 'Minimum 2 rakahs; commonly 2, 4, 6 or 8 rakahs according to ability', type: 'Authentic voluntary Duha prayer / Nafl', note: 'Salatul Duha is not compulsory, but it is a very beautiful voluntary prayer of gratitude. It is prayed after sunrise period has passed and before Dhuhr begins. Its emphasis is that the believer starts the working part of the day by thanking Allah for the body, time, health and provision. It softens the heart, builds consistency outside the compulsory prayers, brings calmness into the morning, and reminds the Muslim that real success and rizq come from Allah. Pray it sincerely, even two rakahs, without treating it as obligatory.' },
    ],
  },
  {
    prayer: 'Dhuhr',
    arabic: 'الظهر',
    obligatory: 'Fard / compulsory: 4 rakahs',
    sunnah: [
      { timing: 'Before Dhuhr', rakahs: '4 rakahs', type: 'Sunnah Mu’akkadah / emphasized Sunnah', note: 'An authentic regular Sunnah before Dhuhr. It is often prayed as two plus two, and it prepares the heart before the compulsory Dhuhr prayer.' },
      { timing: 'After Dhuhr', rakahs: '2 rakahs', type: 'Sunnah Mu’akkadah / emphasized Sunnah', note: 'An authentic regular Sunnah after Dhuhr that completes the worship around the noon prayer.' },
      { timing: 'Extra after Dhuhr', rakahs: '2 additional rakahs', type: 'Voluntary Nafl / recommended by many scholars', note: 'Some Muslims pray two more after Dhuhr, making four after Dhuhr in total. This is voluntary and should be done without treating it like the compulsory prayer.' },
    ],
  },
  {
    prayer: 'Asr',
    arabic: 'العصر',
    obligatory: 'Fard / compulsory: 4 rakahs',
    sunnah: [
      { timing: 'Before Asr', rakahs: '4 rakahs', type: 'Sunnah Ghayr Mu’akkadah / voluntary Nafl', note: 'A recommended voluntary prayer before Asr for those who can pray it calmly before the compulsory Asr prayer. It is not compulsory and not as emphasized as the regular Sunnah Mu’akkadah prayers.' },
      { timing: 'After Asr', rakahs: 'No regular Sunnah or general Nafl until Maghrib', type: 'Restricted voluntary time', note: 'After Asr, general voluntary prayers are avoided until sunset. Prayers with a specific reason may have scholarly detail, so learn with a trusted teacher.' },
    ],
  },
  {
    prayer: 'Maghrib',
    arabic: 'المغرب',
    obligatory: 'Fard / compulsory: 3 rakahs',
    sunnah: [
      { timing: 'Before Maghrib', rakahs: '2 light rakahs if time allows', type: 'Voluntary Nafl', note: 'Optional and short for those who can pray before the compulsory Maghrib without delaying the congregation. It is not compulsory.' },
      { timing: 'After Maghrib', rakahs: '2 rakahs', type: 'Sunnah Mu’akkadah / emphasized Sunnah', note: 'An authentic regular Sunnah after Maghrib that keeps worship connected after sunset.' },
      { timing: 'Extra after Maghrib', rakahs: 'Optional extra rakahs', type: 'Voluntary Nafl', note: 'A person may add voluntary prayers after the regular Sunnah according to ability and time, without treating them as compulsory.' },
    ],
  },
  {
    prayer: 'Isha',
    arabic: 'العشاء',
    obligatory: 'Fard / compulsory: 4 rakahs',
    sunnah: [
      { timing: 'Before Isha', rakahs: '2 light rakahs if time allows', type: 'Voluntary Nafl', note: 'Optional voluntary prayer before Isha for those who can pray without hardship. It is not compulsory.' },
      { timing: 'After Isha', rakahs: '2 rakahs', type: 'Sunnah Mu’akkadah / emphasized Sunnah', note: 'An authentic regular Sunnah after Isha, usually prayed before Witr if a person is praying Witr soon after.' },
      { timing: 'Witr after Isha', rakahs: 'Odd number: 1, 3, 5 or more', type: 'Witr / highly emphasized night prayer', note: 'Witr is strongly emphasized and is prayed after Isha until before Fajr. It is treated with special care, though scholars differ on its legal classification.' },
      { timing: 'Late night', rakahs: '2 by 2 as able', type: 'Tahajjud / Qiyam al-Layl / voluntary Nafl', note: 'A beautiful voluntary night prayer for Qur’an, dua, repentance, humility, and closeness to Allah. It is not compulsory.' },
    ],
  },
];

const PILLAR_GUIDES: Record<string, { overview: string; importance: string[]; practice: string[]; mistakes: string[]; reflection: string }> = {
  Shahadah: {
    overview: 'The Shahadah is the foundation of Islam and the key to entering the religion. It is the testimony that worship belongs to Allah alone and that Muhammad ﷺ is His final Messenger. It is a statement of belief, surrender, love, obedience, sincerity, and lifelong commitment.',
    importance: [
      'It is a testimony of the tongue, belief of the heart, and commitment shown through actions.',
      'The first half, lā ilāha illā Allāh, rejects every false object of worship and affirms that worship belongs to Allah alone.',
      'The second half, Muḥammadur Rasūlullāh, means the Prophet ﷺ is believed, loved, obeyed, and followed as the final Messenger.',
      'Every prayer, charity, fast, sacrifice, hope, fear, reliance, and repentance must be directed to Allah with sincerity.',
    ],
    practice: [
      'Learn the Arabic wording, transliteration, and meaning so the heart understands what the tongue says.',
      'Protect Tawheed by avoiding shirk, superstition, showing off in worship, and relying on created things as if they control destiny.',
      'Follow the Sunnah in worship, manners, family life, business, justice, modesty, and mercy.',
      'Renew the Shahadah often through dhikr, repentance, learning, and sincere obedience.',
    ],
    mistakes: [
      'Saying the words without understanding their meaning or living by them.',
      'Separating love of Allah from obedience to Allah.',
      'Claiming love for the Prophet ﷺ while ignoring his guidance, mercy, truthfulness, and Sunnah.',
    ],
    reflection: 'The Shahadah is not a slogan. It is the direction of life: worship Allah alone and follow the Messenger ﷺ with love, humility, and seriousness.',
  },
  Salah: {
    overview: 'Salah is the daily meeting between the servant and Allah. It is performed five times every day and keeps faith alive through purification, recitation, bowing, prostration, remembrance, humility, and discipline.',
    importance: [
      'It is the greatest practical pillar after the Shahadah and the clearest daily sign of submission to Allah.',
      'Fajr is prayed before sunrise and trains the believer to begin the day with Allah.',
      'Dhuhr is prayed after midday and returns the heart to Allah during the work of the day.',
      'Asr is prayed in the afternoon and protects the believer from heedlessness as the day becomes busy.',
      'Maghrib is prayed just after sunset and teaches gratitude as the day closes.',
      'Isha is prayed at night and ends the day with worship, calmness, and accountability.',
    ],
    practice: [
      'Make wudu carefully and learn what breaks wudu, because purification is part of preparing to stand before Allah.',
      'Pray each prayer in its time, with calm movements, clear recitation, and respect for every pillar of the prayer.',
      'Learn the required recitations, the positions of standing, bowing, prostration, sitting, tashahhud, and salam.',
      'Build khushu by remembering that you are speaking to Allah, hearing His words, and asking Him for guidance in every rakah.',
      'Add voluntary prayers gradually: Sunnah prayers, Witr, Duha, and night prayer when able.',
    ],
    mistakes: [
      'Delaying prayers without a valid excuse until their time is gone.',
      'Rushing the bowing and prostration without calmness.',
      'Praying with the body while the heart is completely careless.',
      'Neglecting the rules of purification, covering, qiblah, and prayer times.',
    ],
    reflection: 'Salah is not just movement. It is discipline, forgiveness, light, and a daily return to Allah five times a day.',
  },
  Zakat: {
    overview: 'Zakat is the obligatory charity due on eligible halal wealth when it reaches the nisab and the required time has passed. It purifies wealth, protects society, and reminds the believer that money is a trust from Allah.',
    importance: [
      'It is worship through wealth and a sign that the heart is not owned by money.',
      'It supports the poor, needy, indebted, and other eligible recipients mentioned in Islamic law.',
      'It builds mercy, responsibility, and justice inside the Muslim community.',
      'The general zakat rate for cash, savings, trade goods, and similar wealth is 2.5% when conditions are met.',
    ],
    practice: [
      'Calculate halal cash, savings, gold, silver, business stock, money owed to you, and eligible investments.',
      'Subtract immediate debts and necessary bills that are due now, then compare the result to nisab.',
      'Pay zakat to eligible recipients with dignity, sincerity, and care.',
      'For business, agriculture, livestock, pensions, shares, crypto, or complex debts, ask a reliable scholar or qualified zakat expert.',
    ],
    mistakes: [
      'Replacing obligatory zakat with optional charity while ignoring the required calculation.',
      'Counting haram income as zakat instead of removing it responsibly from one’s wealth.',
      'Guessing the amount without checking assets, debts, nisab, and eligibility.',
    ],
    reflection: 'Zakat teaches that wealth should serve faith, family, justice, and compassion — not arrogance or neglect.',
  },
  Sawm: {
    overview: 'Sawm is fasting Ramadan from true dawn until sunset with faith and hope for Allah’s reward. It is not only leaving food and drink; it is training the heart, tongue, eyes, ears, and desires to obey Allah.',
    importance: [
      'Ramadan is a month of Qur’an, forgiveness, dua, charity, patience, and discipline.',
      'Fasting builds taqwa by teaching the believer to leave even what is normally halal for the sake of Allah.',
      'It softens the heart toward the poor and increases gratitude for food, water, health, and family.',
      'It trains self-control, sincerity, and awareness that Allah sees what is hidden.',
    ],
    practice: [
      'Make intention for fasting, eat suhoor when possible, and break the fast at Maghrib without unnecessary delay.',
      'Avoid what breaks the fast and also avoid sins that damage the reward, such as backbiting, lying, anger, and shameless speech.',
      'Increase Qur’an recitation, dua, charity, night prayer, repentance, and feeding others.',
      'Learn valid exemptions for illness, travel, menstruation, pregnancy, breastfeeding, and hardship, and learn how missed fasts are made up.',
    ],
    mistakes: [
      'Fasting from food while the tongue continues to harm people.',
      'Sleeping through prayers or neglecting Salah during Ramadan.',
      'Turning Ramadan into overeating, entertainment, and argument instead of worship.',
    ],
    reflection: 'The success of Sawm is seen after Ramadan: more taqwa, cleaner habits, softer speech, and a heart closer to Allah.',
  },
  Hajj: {
    overview: 'Hajj is the pilgrimage to the Sacred House in Makkah once in a lifetime for the Muslim who is physically and financially able. It gathers Tawheed, sacrifice, patience, humility, remembrance, equality, and repentance.',
    importance: [
      'It connects the believer to the legacy of Ibrahim عليه السلام, Hajar, Ismail عليه السلام, and the Prophet Muhammad ﷺ.',
      'Ihram reminds the pilgrim of humility, simplicity, equality, and the Day of Judgment.',
      'Standing at Arafah is a powerful moment of dua, repentance, and hope in Allah’s mercy.',
      'Tawaf, sa’i, Mina, Muzdalifah, stoning, sacrifice, and farewell tawaf all carry lessons of obedience and surrender.',
    ],
    practice: [
      'Prepare with halal wealth, sincere repentance, settled debts and rights where possible, and knowledge of the rites before travelling.',
      'Learn the order and meaning of ihram, talbiyah, tawaf, sa’i, Arafah, Muzdalifah, Mina, stoning, sacrifice, shaving or trimming, and tawaf al-wada.',
      'Protect the tongue from argument, harshness, showing off, and harming other pilgrims.',
      'Use the journey for dua, Qur’an, dhikr, patience, and returning home as a better servant of Allah.',
    ],
    mistakes: [
      'Going to Hajj without learning the rites and then becoming confused or careless.',
      'Focusing on pictures, shopping, status, or argument more than worship.',
      'Pushing, insulting, or harming others during crowded moments.',
    ],
    reflection: 'A blessed Hajj is not only a completed journey. It is a heart that returns more humble, more obedient, and more aware of the meeting with Allah.',
  },
};

const ARTICLES_OF_FAITH = [
  {
    title: 'Belief in Allah',
    text: 'To believe that Allah is One, the Creator, Sustainer, Lord of all worlds, and the only One worthy of worship.',
    content: [
      'Belief in Allah is the heart of Islam. It means knowing Allah through His Lordship, His right to be worshipped alone, and His perfect names and attributes.',
      'A Muslim believes Allah creates, provides, owns, controls, gives life, causes death, hears, sees, knows, and judges with perfect wisdom and justice.',
      'This belief should produce love, fear, hope, trust, gratitude, humility, repentance, and obedience.',
    ],
    keyPoints: ['Allah alone is the Creator and Sustainer.', 'Allah alone deserves worship.', 'Allah has perfect names and attributes without imperfection.'],
  },
  {
    title: 'Belief in the Angels',
    text: 'To believe that Allah created angels from light, and they obey Him completely in the duties He gave them.',
    content: [
      'Angels are honored servants of Allah. They do not disobey Him and they carry out the duties He commands.',
      'Among them are Jibril, who brought revelation; Mika’il, connected with provision and rain by Allah’s command; Israfil, who will blow the Trumpet; and the angels who record deeds.',
      'Belief in angels reminds the Muslim that life is serious, deeds are recorded, and Allah’s unseen creation is real.',
    ],
    keyPoints: ['Angels obey Allah perfectly.', 'They have assigned duties.', 'They are part of the unseen that Muslims believe in.'],
  },
  {
    title: 'Belief in the Revealed Books',
    text: 'To believe that Allah sent guidance through revealed books, and that the Qur’an is the final preserved revelation.',
    content: [
      'Allah revealed guidance to His messengers so people would know truth, worship Him correctly, and live with justice.',
      'Muslims believe in the original revelations Allah sent, including the Tawrah, Zabur, Injil, and the Qur’an.',
      'The Qur’an is the final revelation, preserved by Allah, and it confirms truth while serving as the final guidance for humanity.',
    ],
    keyPoints: ['Revelation is mercy and guidance.', 'The Qur’an is final and preserved.', 'A Muslim respects revelation and acts upon it.'],
  },
  {
    title: 'Belief in the Messengers',
    text: 'To believe that Allah sent prophets and messengers to call people to worship Allah alone and live righteously.',
    content: [
      'Allah sent messengers as guides and examples. They called their people to Tawheed, warned against wrongdoing, and taught obedience to Allah.',
      'Muslims believe in all prophets and messengers mentioned by Allah, including Adam, Nuh, Ibrahim, Musa, Isa, and Muhammad ﷺ.',
      'Muhammad ﷺ is the final Messenger. Loving him means believing him, following his guidance, and honoring his Sunnah.',
    ],
    keyPoints: ['All messengers called to worship Allah alone.', 'Muslims do not reject any true prophet.', 'Muhammad ﷺ is the final Messenger.'],
  },
  {
    title: 'Belief in the Last Day',
    text: 'To believe in resurrection, judgment, Paradise, Hellfire, accountability, reward, and justice.',
    content: [
      'Belief in the Last Day gives life direction. It teaches that death is not the end and that every person will return to Allah.',
      'The Last Day includes resurrection, standing before Allah, records of deeds, the scale, judgment, reward, punishment, Paradise, and Hellfire.',
      'This belief makes a Muslim careful with time, speech, money, worship, family rights, and hidden intentions.',
    ],
    keyPoints: ['Every soul will be resurrected.', 'Every deed will be judged with justice.', 'The believer lives with accountability and hope.'],
  },
  {
    title: 'Belief in Divine Decree',
    text: 'To believe that Allah knows, writes, wills, and creates all things with perfect wisdom and justice.',
    content: [
      'Belief in Qadar means Allah’s knowledge is complete, His writing is complete, His will occurs, and He creates all things with wisdom.',
      'This does not remove human responsibility. People choose and act, and Allah judges with perfect knowledge and justice.',
      'Qadar teaches patience during hardship, gratitude during ease, humility after success, and trust that Allah’s wisdom is greater than what we see.',
    ],
    keyPoints: ['Allah knows all things.', 'Allah’s decree is wise and just.', 'Humans remain responsible for their choices.'],
  },
];

const PRINCIPLES_OF_FAITH = [
  { title: 'Tawheed', text: 'The foundation of Islam: worship Allah alone without partners, rivals, or intermediaries.' },
  { title: 'Ikhlas', text: 'Sincerity: doing acts of worship for Allah alone, not for praise or showing off.' },
  { title: 'Following the Prophet ﷺ', text: 'Loving and following the Prophet Muhammad ﷺ in belief, worship, manners, and character.' },
  { title: 'Hope and Fear', text: 'A believer hopes for Allah’s mercy and fears displeasing Him, without despair or arrogance.' },
  { title: 'Certainty', text: 'Faith becomes strong when the heart trusts Allah’s promise and relies upon His wisdom.' },
  { title: 'Good Character', text: 'True faith beautifies speech, behavior, patience, forgiveness, modesty, and trustworthiness.' },
];

const SHAHADAH = {
  arabic: 'أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللهِ',
  transliteration: 'Ash-hadu an lā ilāha illā Allāh, wa ash-hadu anna Muḥammadan Rasūl Allāh.',
  meaning: 'I bear witness that there is no deity worthy of worship except Allah, and I bear witness that Muhammad is the Messenger of Allah.',
  explanation: [
    'The Shahadah is the testimony of faith and the entrance into Islam.',
    'It means worship belongs to Allah alone, and the guidance of Muhammad ﷺ is followed with love and obedience.',
    'It is not only a sentence of the tongue; it is a belief of the heart and a way of life shown through actions.',
    'The first part rejects worship of anything besides Allah. The second part accepts the Messenger ﷺ as the final guide sent by Allah.',
  ],
};

const NAME_DATA: Omit<NameOfAllah, 'bestTime' | 'suggestedCount' | 'rewardNote'>[] = [
  { id: 1, arabic: 'الرَّحْمَنُ', transliteration: 'Ar-Rahman', meaning: 'The Most Merciful', reflection: 'Allah’s mercy is vast and reaches all creation.' },
  { id: 2, arabic: 'الرَّحِيمُ', transliteration: 'Ar-Raheem', meaning: 'The Especially Merciful', reflection: 'Allah gives special mercy to the believers.' },
  { id: 3, arabic: 'الْمَلِكُ', transliteration: 'Al-Malik', meaning: 'The King', reflection: 'All authority belongs to Allah alone.' },
  { id: 4, arabic: 'الْقُدُّوسُ', transliteration: 'Al-Quddus', meaning: 'The Most Holy', reflection: 'Allah is pure from every imperfection.' },
  { id: 5, arabic: 'السَّلَامُ', transliteration: 'As-Salam', meaning: 'The Source of Peace', reflection: 'True peace comes from Allah.' },
  { id: 6, arabic: 'الْمُؤْمِنُ', transliteration: 'Al-Mu’min', meaning: 'The Giver of Security', reflection: 'Allah grants safety, faith, and reassurance.' },
  { id: 7, arabic: 'الْمُهَيْمِنُ', transliteration: 'Al-Muhaymin', meaning: 'The Guardian', reflection: 'Allah watches over and preserves all things.' },
  { id: 8, arabic: 'الْعَزِيزُ', transliteration: 'Al-Aziz', meaning: 'The Almighty', reflection: 'Allah is Mighty and cannot be overcome.' },
  { id: 9, arabic: 'الْجَبَّارُ', transliteration: 'Al-Jabbar', meaning: 'The Compeller, The Restorer', reflection: 'Allah mends what is broken and enforces His will.' },
  { id: 10, arabic: 'الْمُتَكَبِّرُ', transliteration: 'Al-Mutakabbir', meaning: 'The Supreme', reflection: 'Allah is above all creation in majesty.' },
  { id: 11, arabic: 'الْخَالِقُ', transliteration: 'Al-Khaliq', meaning: 'The Creator', reflection: 'Allah creates everything from nothing.' },
  { id: 12, arabic: 'الْبَارِئُ', transliteration: 'Al-Bari’', meaning: 'The Originator', reflection: 'Allah brings creation into existence perfectly.' },
  { id: 13, arabic: 'الْمُصَوِّرُ', transliteration: 'Al-Musawwir', meaning: 'The Fashioner', reflection: 'Allah shapes every creation with wisdom.' },
  { id: 14, arabic: 'الْغَفَّارُ', transliteration: 'Al-Ghaffar', meaning: 'The All-Forgiving', reflection: 'Allah repeatedly forgives those who return to Him.' },
  { id: 15, arabic: 'الْقَهَّارُ', transliteration: 'Al-Qahhar', meaning: 'The Subduer', reflection: 'All creation is under Allah’s power.' },
  { id: 16, arabic: 'الْوَهَّابُ', transliteration: 'Al-Wahhab', meaning: 'The Bestower', reflection: 'Allah gives gifts without needing anything in return.' },
  { id: 17, arabic: 'الرَّزَّاقُ', transliteration: 'Ar-Razzaq', meaning: 'The Provider', reflection: 'Every provision comes from Allah.' },
  { id: 18, arabic: 'الْفَتَّاحُ', transliteration: 'Al-Fattah', meaning: 'The Opener', reflection: 'Allah opens doors of mercy, guidance, and relief.' },
  { id: 19, arabic: 'الْعَلِيمُ', transliteration: 'Al-Aleem', meaning: 'The All-Knowing', reflection: 'Allah knows what is hidden and what is open.' },
  { id: 20, arabic: 'الْقَابِضُ', transliteration: 'Al-Qabid', meaning: 'The Withholder', reflection: 'Allah withholds by wisdom and justice.' },
  { id: 21, arabic: 'الْبَاسِطُ', transliteration: 'Al-Basit', meaning: 'The Expander', reflection: 'Allah expands provision, mercy, and hearts.' },
  { id: 22, arabic: 'الْخَافِضُ', transliteration: 'Al-Khafid', meaning: 'The Abaser', reflection: 'Allah lowers arrogance and falsehood.' },
  { id: 23, arabic: 'الرَّافِعُ', transliteration: 'Ar-Rafi’', meaning: 'The Exalter', reflection: 'Allah raises whom He wills in rank and honor.' },
  { id: 24, arabic: 'الْمُعِزُّ', transliteration: 'Al-Mu’izz', meaning: 'The Giver of Honor', reflection: 'True honor is granted by Allah.' },
  { id: 25, arabic: 'المُذِلُّ', transliteration: 'Al-Mudhill', meaning: 'The Giver of Humility', reflection: 'Allah humbles those who reject truth arrogantly.' },
  { id: 26, arabic: 'السَّمِيعُ', transliteration: 'As-Samee’', meaning: 'The All-Hearing', reflection: 'Allah hears every voice, prayer, and whisper.' },
  { id: 27, arabic: 'الْبَصِيرُ', transliteration: 'Al-Baseer', meaning: 'The All-Seeing', reflection: 'Nothing is hidden from Allah’s sight.' },
  { id: 28, arabic: 'الْحَكَمُ', transliteration: 'Al-Hakam', meaning: 'The Judge', reflection: 'Allah judges with perfect justice.' },
  { id: 29, arabic: 'الْعَدْلُ', transliteration: 'Al-Adl', meaning: 'The Just', reflection: 'Allah never wrongs anyone.' },
  { id: 30, arabic: 'اللَّطِيفُ', transliteration: 'Al-Lateef', meaning: 'The Subtle, The Gentle', reflection: 'Allah’s care reaches us in hidden gentle ways.' },
  { id: 31, arabic: 'الْخَبِيرُ', transliteration: 'Al-Khabeer', meaning: 'The All-Aware', reflection: 'Allah knows the inner reality of everything.' },
  { id: 32, arabic: 'الْحَلِيمُ', transliteration: 'Al-Haleem', meaning: 'The Forbearing', reflection: 'Allah gives time and does not hasten punishment.' },
  { id: 33, arabic: 'الْعَظِيمُ', transliteration: 'Al-Adheem', meaning: 'The Magnificent', reflection: 'Allah’s greatness is beyond imagination.' },
  { id: 34, arabic: 'الْغَفُورُ', transliteration: 'Al-Ghafoor', meaning: 'The Most Forgiving', reflection: 'Allah forgives great sins for sincere repentance.' },
  { id: 35, arabic: 'الشَّكُورُ', transliteration: 'Ash-Shakoor', meaning: 'The Appreciative', reflection: 'Allah rewards even small sincere deeds greatly.' },
  { id: 36, arabic: 'الْعَلِيُّ', transliteration: 'Al-Aliyy', meaning: 'The Most High', reflection: 'Allah is above all in status and perfection.' },
  { id: 37, arabic: 'الْكَبِيرُ', transliteration: 'Al-Kabeer', meaning: 'The Greatest', reflection: 'Allah is greater than everything.' },
  { id: 38, arabic: 'الْحَفِيظُ', transliteration: 'Al-Hafeedh', meaning: 'The Preserver', reflection: 'Allah protects and preserves His creation.' },
  { id: 39, arabic: 'المُقِيتُ', transliteration: 'Al-Muqeet', meaning: 'The Sustainer', reflection: 'Allah provides strength and nourishment.' },
  { id: 40, arabic: 'الْحَسِيبُ', transliteration: 'Al-Haseeb', meaning: 'The Reckoner', reflection: 'Allah is sufficient and will call all to account.' },
  { id: 41, arabic: 'الْجَلِيلُ', transliteration: 'Al-Jaleel', meaning: 'The Majestic', reflection: 'Allah possesses perfect majesty and honor.' },
  { id: 42, arabic: 'الْكَرِيمُ', transliteration: 'Al-Kareem', meaning: 'The Generous', reflection: 'Allah gives generously beyond what we deserve.' },
  { id: 43, arabic: 'الرَّقِيبُ', transliteration: 'Ar-Raqeeb', meaning: 'The Watchful', reflection: 'Allah observes every action and intention.' },
  { id: 44, arabic: 'الْمُجِيبُ', transliteration: 'Al-Mujeeb', meaning: 'The Responsive', reflection: 'Allah responds to sincere supplication.' },
  { id: 45, arabic: 'الْوَاسِعُ', transliteration: 'Al-Wasi’', meaning: 'The All-Encompassing', reflection: 'Allah’s mercy, knowledge, and power are vast.' },
  { id: 46, arabic: 'الْحَكِيمُ', transliteration: 'Al-Hakeem', meaning: 'The All-Wise', reflection: 'Everything Allah does has perfect wisdom.' },
  { id: 47, arabic: 'الْوَدُودُ', transliteration: 'Al-Wadood', meaning: 'The Most Loving', reflection: 'Allah loves His righteous servants and is loved by them.' },
  { id: 48, arabic: 'الْمَجِيدُ', transliteration: 'Al-Majeed', meaning: 'The Glorious', reflection: 'Allah is full of glory, honor, and generosity.' },
  { id: 49, arabic: 'الْبَاعِثُ', transliteration: 'Al-Ba’ith', meaning: 'The Resurrector', reflection: 'Allah will raise all people after death.' },
  { id: 50, arabic: 'الشَّهِيدُ', transliteration: 'Ash-Shaheed', meaning: 'The Witness', reflection: 'Allah witnesses all things.' },
  { id: 51, arabic: 'الْحَقُّ', transliteration: 'Al-Haqq', meaning: 'The Truth', reflection: 'Allah is the ultimate truth and His promise is true.' },
  { id: 52, arabic: 'الْوَكِيلُ', transliteration: 'Al-Wakeel', meaning: 'The Trustee', reflection: 'Allah is the best One to rely upon.' },
  { id: 53, arabic: 'الْقَوِيُّ', transliteration: 'Al-Qawiyy', meaning: 'The Strong', reflection: 'Allah has perfect strength.' },
  { id: 54, arabic: 'الْمَتِينُ', transliteration: 'Al-Mateen', meaning: 'The Firm', reflection: 'Allah’s power is firm and never weakens.' },
  { id: 55, arabic: 'الْوَلِيُّ', transliteration: 'Al-Waliyy', meaning: 'The Protecting Friend', reflection: 'Allah protects and supports the believers.' },
  { id: 56, arabic: 'الْحَمِيدُ', transliteration: 'Al-Hameed', meaning: 'The Praiseworthy', reflection: 'Allah deserves all praise in every situation.' },
  { id: 57, arabic: 'الْمُحْصِي', transliteration: 'Al-Muhsi', meaning: 'The Counter', reflection: 'Allah records and encompasses all things.' },
  { id: 58, arabic: 'الْمُبْدِئُ', transliteration: 'Al-Mubdi’', meaning: 'The Originator', reflection: 'Allah begins creation as He wills.' },
  { id: 59, arabic: 'الْمُعِيدُ', transliteration: 'Al-Mu’eed', meaning: 'The Restorer', reflection: 'Allah will restore life after death.' },
  { id: 60, arabic: 'الْمُحْيِي', transliteration: 'Al-Muhyi', meaning: 'The Giver of Life', reflection: 'Allah gives life to bodies and hearts.' },
  { id: 61, arabic: 'الْمُمِيتُ', transliteration: 'Al-Mumeet', meaning: 'The Bringer of Death', reflection: 'Death comes only by Allah’s decree.' },
  { id: 62, arabic: 'الْحَيُّ', transliteration: 'Al-Hayy', meaning: 'The Ever-Living', reflection: 'Allah lives forever and never dies.' },
  { id: 63, arabic: 'الْقَيُّومُ', transliteration: 'Al-Qayyum', meaning: 'The Sustainer of All', reflection: 'All creation depends on Allah.' },
  { id: 64, arabic: 'الْوَاجِدُ', transliteration: 'Al-Wajid', meaning: 'The Finder', reflection: 'Allah lacks nothing and finds all He wills.' },
  { id: 65, arabic: 'الْمَاجِدُ', transliteration: 'Al-Majid', meaning: 'The Noble', reflection: 'Allah is noble, glorious, and generous.' },
  { id: 66, arabic: 'الْواحِدُ', transliteration: 'Al-Wahid', meaning: 'The One', reflection: 'Allah is uniquely One without partner.' },
  { id: 67, arabic: 'الصَّمَدُ', transliteration: 'As-Samad', meaning: 'The Self-Sufficient', reflection: 'All creation needs Allah, and He needs none.' },
  { id: 68, arabic: 'الْقَادِرُ', transliteration: 'Al-Qadir', meaning: 'The Able', reflection: 'Allah has power over all things.' },
  { id: 69, arabic: 'الْمُقْتَدِرُ', transliteration: 'Al-Muqtadir', meaning: 'The Powerful', reflection: 'Allah’s power is complete and perfect.' },
  { id: 70, arabic: 'الْمُقَدِّمُ', transliteration: 'Al-Muqaddim', meaning: 'The Expediter', reflection: 'Allah brings forward whom and what He wills.' },
  { id: 71, arabic: 'الْمُؤَخِّرُ', transliteration: 'Al-Mu’akhkhir', meaning: 'The Delayer', reflection: 'Allah delays by wisdom and knowledge.' },
  { id: 72, arabic: 'الأَوَّلُ', transliteration: 'Al-Awwal', meaning: 'The First', reflection: 'Allah existed before everything.' },
  { id: 73, arabic: 'الآخِرُ', transliteration: 'Al-Akhir', meaning: 'The Last', reflection: 'Allah remains after everything.' },
  { id: 74, arabic: 'الظَّاهِرُ', transliteration: 'Az-Dhahir', meaning: 'The Manifest', reflection: 'Allah’s signs are clear throughout creation.' },
  { id: 75, arabic: 'الْبَاطِنُ', transliteration: 'Al-Batin', meaning: 'The Hidden', reflection: 'Allah is beyond full human perception.' },
  { id: 76, arabic: 'الْوَالِي', transliteration: 'Al-Wali', meaning: 'The Governor', reflection: 'Allah manages and governs all affairs.' },
  { id: 77, arabic: 'الْمُتَعَالِي', transliteration: 'Al-Muta’ali', meaning: 'The Most Exalted', reflection: 'Allah is exalted above every imperfection.' },
  { id: 78, arabic: 'الْبَرُّ', transliteration: 'Al-Barr', meaning: 'The Source of Goodness', reflection: 'Allah is kind and good to His servants.' },
  { id: 79, arabic: 'التَّوَّابُ', transliteration: 'At-Tawwab', meaning: 'The Acceptor of Repentance', reflection: 'Allah accepts sincere repentance again and again.' },
  { id: 80, arabic: 'الْمُنْتَقِمُ', transliteration: 'Al-Muntaqim', meaning: 'The Avenger', reflection: 'Allah gives justice against wrongdoing.' },
  { id: 81, arabic: 'العَفُوُّ', transliteration: 'Al-Afuww', meaning: 'The Pardoner', reflection: 'Allah erases sins completely when He pardons.' },
  { id: 82, arabic: 'الرَّؤُوفُ', transliteration: 'Ar-Ra’oof', meaning: 'The Most Kind', reflection: 'Allah is gentle and compassionate.' },
  { id: 83, arabic: 'مَالِكُ الْمُلْكِ', transliteration: 'Malik-ul-Mulk', meaning: 'Owner of Sovereignty', reflection: 'All dominion belongs to Allah.' },
  { id: 84, arabic: 'ذُو الْجَلَالِ وَالإكْرَامِ', transliteration: 'Dhul-Jalali wal-Ikram', meaning: 'Lord of Majesty and Honor', reflection: 'Allah deserves awe, love, and honor.' },
  { id: 85, arabic: 'الْمُقْسِطُ', transliteration: 'Al-Muqsit', meaning: 'The Equitable', reflection: 'Allah establishes justice and fairness.' },
  { id: 86, arabic: 'الْجَامِعُ', transliteration: 'Al-Jami’', meaning: 'The Gatherer', reflection: 'Allah will gather all people on the Last Day.' },
  { id: 87, arabic: 'الْغَنِيُّ', transliteration: 'Al-Ghaniyy', meaning: 'The Self-Sufficient', reflection: 'Allah is free of need.' },
  { id: 88, arabic: 'الْمُغْنِي', transliteration: 'Al-Mughni', meaning: 'The Enricher', reflection: 'Allah enriches hearts and lives as He wills.' },
  { id: 89, arabic: 'الْمَانِعُ', transliteration: 'Al-Mani’', meaning: 'The Preventer', reflection: 'Allah prevents harm and withholds by wisdom.' },
  { id: 90, arabic: 'الضَّارُ', transliteration: 'Ad-Darr', meaning: 'The Distresser', reflection: 'Hardship happens by Allah’s wisdom and decree.' },
  { id: 91, arabic: 'النَّافِعُ', transliteration: 'An-Nafi’', meaning: 'The Benefactor', reflection: 'All benefit comes only through Allah’s permission.' },
  { id: 92, arabic: 'النُّورُ', transliteration: 'An-Noor', meaning: 'The Light', reflection: 'Allah guides hearts with light.' },
  { id: 93, arabic: 'الْهَادِي', transliteration: 'Al-Hadi', meaning: 'The Guide', reflection: 'Allah guides whom He wills to truth.' },
  { id: 94, arabic: 'الْبَدِيعُ', transliteration: 'Al-Badi’', meaning: 'The Incomparable Originator', reflection: 'Allah creates with unmatched beauty and wisdom.' },
  { id: 95, arabic: 'الْبَاقِي', transliteration: 'Al-Baqi', meaning: 'The Everlasting', reflection: 'Allah remains forever.' },
  { id: 96, arabic: 'الْوَارِثُ', transliteration: 'Al-Warith', meaning: 'The Inheritor', reflection: 'Everything returns to Allah.' },
  { id: 97, arabic: 'الرَّشِيدُ', transliteration: 'Ar-Rasheed', meaning: 'The Guide to the Right Path', reflection: 'Allah guides with perfect wisdom.' },
  { id: 98, arabic: 'الصَّبُورُ', transliteration: 'As-Saboor', meaning: 'The Patient', reflection: 'Allah does not hasten punishment and gives time.' },
  { id: 99, arabic: 'الْوَاحِدُ', transliteration: 'Al-Wahid', meaning: 'The Unique One', reflection: 'Allah is One, unique, and without equal.' },
];

function practiceForName(id: number, transliteration: string) {
  const bestTimes = [
    'After Fajr or during morning adhkar',
    'After Maghrib or during evening adhkar',
    'After any obligatory prayer',
    'During quiet reflection before sleep',
    'When making personal dua',
  ];
  const counts = [33, 99, 100, 11, 7];
  return {
    bestTime: bestTimes[(id - 1) % bestTimes.length],
    suggestedCount: counts[(id - 1) % counts.length],
    rewardNote: `A beautiful way to remember Allah through ${transliteration}. The exact reward is with Allah; use it with sincerity, humility, and hope for mercy.`,
  };
}

const NAMES_OF_ALLAH: NameOfAllah[] = NAME_DATA.map(item => ({ ...item, ...practiceForName(item.id, item.transliteration) }));

const ARTICLES: ArticleItem[] = [
  {
    id: 'aqidah-1',
    title: 'Understanding Tawheed',
    category: 'Aqidah',
    summary: 'The foundation of Islam is to worship Allah alone.',
    quote: 'Tawheed gives the heart direction, peace, and purpose.',
    keyPoints: ['Allah alone creates and provides.', 'Allah alone deserves worship.', 'Allah has perfect names and attributes.'],
    content: [
      'Tawheed means affirming the Oneness of Allah in lordship, worship, and His perfect names and attributes.',
      'It teaches the believer to depend upon Allah, worship Him sincerely, and avoid anything that competes with devotion to Him.',
      'A life built upon Tawheed becomes balanced because the heart knows its Creator, its purpose, and its final return.',
    ],
  },
  {
    id: 'hereafter-1',
    title: 'Remembering the Hereafter',
    category: 'Hereafter',
    summary: 'The Hereafter gives meaning to patience, justice, worship, and choices.',
    keyPoints: ['Life is temporary.', 'Every deed is recorded.', 'Allah’s justice is complete.'],
    content: [
      'Belief in the Hereafter shapes the Muslim’s priorities. It reminds the believer that this world is not the final home.',
      'Every word, intention, and action matters. Remembering accountability encourages sincerity, patience, and repentance.',
      'The believer hopes for Allah’s mercy and works for a meeting with Him that is full of forgiveness and success.',
    ],
  },
  {
    id: 'seerah-1',
    title: 'Lessons from the Seerah',
    category: 'Seerah',
    summary: 'The life of the Prophet ﷺ teaches mercy, courage, patience, and leadership.',
    keyPoints: ['Mercy in hardship.', 'Truthfulness in speech.', 'Patience in calling to Allah.'],
    content: [
      'The Seerah is not only history; it is guidance for real life. It shows how the Prophet ﷺ lived with sincerity, mercy, courage, and wisdom.',
      'Through his life, Muslims learn how to face hardship, forgive others, build community, and remain faithful to Allah.',
      'Studying the Seerah increases love for the Messenger ﷺ and helps a believer follow his example with understanding.',
    ],
  },
  {
    id: 'history-1',
    title: 'The Value of Islamic History',
    category: 'Islamic History',
    summary: 'Islamic history carries lessons of knowledge, sacrifice, justice, and civilization.',
    keyPoints: ['Learn from righteous people.', 'Understand sacrifice.', 'Build identity with wisdom.'],
    content: [
      'Islamic history is filled with examples of scholars, leaders, mothers, fathers, youth, and communities who served the religion with dedication.',
      'Studying history protects identity and teaches Muslims how faith shaped families, learning, charity, and justice.',
      'The goal is not pride alone, but learning lessons that help Muslims live better today.',
    ],
  },
  {
    id: 'earnings-1',
    title: 'Halal Earnings and Trust',
    category: 'Halal Earnings',
    summary: 'A Muslim’s income should be clean, honest, and pleasing to Allah.',
    keyPoints: ['Avoid cheating.', 'Honor contracts.', 'Seek barakah over greed.'],
    content: [
      'Halal earnings are part of worship. A believer seeks income through honest, lawful, and ethical means.',
      'Cheating, deception, exploitation, and unlawful transactions remove blessing from wealth and harm the heart.',
      'The Muslim seeks barakah, not only quantity. Wealth earned with honesty can become a source of charity, family care, and good deeds.',
    ],
  },
  {
    id: 'marriage-1',
    title: 'Marriage with Mercy',
    category: 'Marriage',
    summary: 'A strong Muslim marriage is built on mercy, responsibility, patience, and respect.',
    keyPoints: ['Kind speech.', 'Shared responsibility.', 'Forgiveness and patience.'],
    content: [
      'Marriage is a serious trust. It requires mercy, communication, patience, and a willingness to grow together for the sake of Allah.',
      'A beautiful home is not built by perfection, but by sincere effort, respectful speech, and forgiveness.',
      'When both spouses remember Allah, they become more careful with each other’s hearts and rights.',
    ],
  },
  {
    id: 'parenting-1',
    title: 'Raising Children with Faith',
    category: 'Parenting',
    summary: 'Children need love, Islamic identity, discipline, and good examples.',
    keyPoints: ['Teach by example.', 'Make faith loved.', 'Balance mercy and discipline.'],
    content: [
      'Islamic parenting begins with example. Children learn from what they see in the home more than what they only hear.',
      'Parents should make faith meaningful and beautiful through prayer, reminders, stories, manners, and love.',
      'Discipline is important, but it should be balanced with mercy, understanding, and emotional safety.',
    ],
  },
  {
    id: 'character-1',
    title: 'Building Noble Character',
    category: 'Character Building',
    summary: 'Character is one of the clearest signs of a heart touched by faith.',
    keyPoints: ['Truthfulness.', 'Humility.', 'Mercy and patience.'],
    content: [
      'Islam beautifies the character of the believer. Good manners are not small matters; they are signs of sincere faith.',
      'Truthfulness, trustworthiness, humility, patience, and mercy bring light into families and communities.',
      'A believer works on their character daily, especially when angry, tired, or tested.',
    ],
  },
  {
    id: 'repentance-1',
    title: 'The Door of Repentance',
    category: 'Repentance',
    summary: 'No matter how many times a servant falls, Allah loves sincere return.',
    keyPoints: ['Stop the sin.', 'Feel regret.', 'Resolve to improve.'],
    content: [
      'Repentance is a gift from Allah. It allows the believer to return after mistakes with humility and hope.',
      'Sincere repentance includes leaving the sin, regretting it, asking Allah for forgiveness, and intending not to return to it.',
      'A Muslim should never despair of Allah’s mercy. The door of repentance remains open while life remains.',
    ],
  },
  {
    id: 'knowledge-1',
    title: 'Seeking Beneficial Knowledge',
    category: 'Knowledge',
    summary: 'Knowledge guides worship, corrects mistakes, and strengthens faith.',
    keyPoints: ['Learn gradually.', 'Act upon knowledge.', 'Stay humble.'],
    content: [
      'Beneficial knowledge helps the believer worship Allah correctly and live with wisdom.',
      'Knowledge should produce humility, better worship, better manners, and service to others.',
      'The best learner is consistent, sincere, and careful about where they take their religion from.',
    ],
  },
  {
    id: 'community-1',
    title: 'Serving the Muslim Community',
    category: 'Community',
    summary: 'Strong communities are built through mercy, service, trust, and cooperation.',
    keyPoints: ['Help the needy.', 'Protect unity.', 'Serve sincerely.'],
    content: [
      'Islam encourages believers to care for one another. Community service can include teaching, charity, visiting the sick, feeding others, and resolving conflicts.',
      'A healthy community protects dignity, avoids gossip, and supports people in hardship.',
      'Serving others for Allah’s sake is a noble act that brings hearts together.',
    ],
  },
  {
    id: 'dawah-1',
    title: 'Calling to Allah with Wisdom',
    category: 'Dawah',
    summary: 'Dawah should be sincere, gentle, wise, and rooted in good manners.',
    keyPoints: ['Speak with wisdom.', 'Be patient.', 'Show Islam through character.'],
    content: [
      'Dawah is inviting others to goodness and truth. It requires knowledge, sincerity, patience, and beautiful manners.',
      'A harsh approach can push people away, while gentle wisdom can open hearts by Allah’s permission.',
      'The caller to Allah should live what they teach and rely upon Allah for results.',
    ],
  },
  {
    id: 'heart-1',
    title: 'Softening the Heart',
    category: 'Heart Softening',
    summary: 'The heart needs remembrance, repentance, gratitude, and reflection.',
    keyPoints: ['Remember Allah often.', 'Avoid hardening sins.', 'Reflect on blessings.'],
    content: [
      'The heart can become hard when it is distant from remembrance, repentance, and reflection.',
      'Softening the heart includes remembering Allah, reading beneficial reminders, visiting the sick, reflecting on death, and showing mercy to others.',
      'A soft heart is not weak. It is alive, humble, and responsive to guidance.',
    ],
  },
  {
    id: 'zakat-1',
    title: 'Understanding Zakat',
    category: 'Zakat',
    summary: 'Zakat purifies halal wealth and supports those in need.',
    keyPoints: ['Calculate halal zakatable assets.', 'Subtract immediate liabilities.', 'Pay if above nisab.'],
    content: [
      'Zakat is an obligation on eligible halal wealth that has reached nisab and remained for a lunar year, depending on the category of wealth.',
      'Common zakatable assets include halal cash, savings, gold, silver, business stock, money owed to you, and halal investments.',
      'The general zakat rate for money and trade assets is 2.5%. Agricultural produce has separate rates depending on irrigation costs.',
      'Haram income is not purified by zakat. It should be removed from one’s wealth and disposed of responsibly without intending zakat reward.',
    ],
  },
];


const FAITH_ARTICLES: ArticleItem[] = ARTICLES_OF_FAITH.map((item, index) => ({
  id: `faith-article-${index + 1}`,
  title: item.title,
  category: 'Aqidah',
  summary: item.text,
  quote: index === 0 ? 'Iman is not only information; it is certainty that shapes worship, character, and choices.' : undefined,
  keyPoints: item.keyPoints,
  content: item.content,
}));

const DEFAULT_ZAKAT_INPUTS: ZakatInputs = {
  cash: '',
  bankSavings: '',
  goldValue: '',
  silverValue: '',
  businessStock: '',
  moneyOwedToYou: '',
  investments: '',
  crypto: '',
  rentalIncomeSaved: '',
  agriculturalProduceValue: '',
  livestockValue: '',
  immediateDebts: '',
  billsDue: '',
  goldNisabValue: '',
  silverNisabValue: '',
  haramIncomeExcluded: '',
  useSilverNisab: true,
  agriculturalIsIrrigated: true,
};

export default function IslamicArticlesPage() {
  const [tab, setTab] = useState<Tab>('Home');
  const [query, setQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<(typeof PILLARS_OF_ISLAM)[number] | null>(null);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [savedNames, setSavedNames] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | 'All'>('All');
  const [zakat, setZakat] = useState<ZakatInputs>(DEFAULT_ZAKAT_INPUTS);
  const [nameCounts, setNameCounts] = useState<Record<number, number>>({});
  const [nameSessions, setNameSessions] = useState<Record<number, number>>({});

  const filteredArticles = useMemo(() => {
    const s = query.toLowerCase();
    return ARTICLES.filter(article => {
      const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
      const matchesText = article.title.toLowerCase().includes(s) || article.summary.toLowerCase().includes(s) || article.category.toLowerCase().includes(s);
      return matchesCategory && matchesText;
    });
  }, [query, selectedCategory]);

  const filteredFaithArticles = useMemo(() => {
    const s = query.toLowerCase();
    return FAITH_ARTICLES.filter(article => article.title.toLowerCase().includes(s) || article.summary.toLowerCase().includes(s) || article.content.join(' ').toLowerCase().includes(s));
  }, [query]);

  const filteredNames = useMemo(() => {
    const s = query.toLowerCase();
    return NAMES_OF_ALLAH.filter(item => item.arabic.includes(query) || item.transliteration.toLowerCase().includes(s) || item.meaning.toLowerCase().includes(s));
  }, [query]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(ARTICLES.map(item => item.category)))] as (ArticleCategory | 'All')[], []);

  const n = (value: string) => Number(value.replace(/,/g, '')) || 0;
  const halalMoneyAssets = n(zakat.cash) + n(zakat.bankSavings) + n(zakat.goldValue) + n(zakat.silverValue) + n(zakat.businessStock) + n(zakat.moneyOwedToYou) + n(zakat.investments) + n(zakat.crypto) + n(zakat.rentalIncomeSaved) + n(zakat.livestockValue);
  const haramExcluded = n(zakat.haramIncomeExcluded);
  const liabilities = n(zakat.immediateDebts) + n(zakat.billsDue);
  const netZakatableMoney = Math.max(0, halalMoneyAssets - liabilities);
  const nisab = zakat.useSilverNisab ? n(zakat.silverNisabValue) : n(zakat.goldNisabValue);
  const aboveNisab = nisab > 0 && netZakatableMoney >= nisab;
  const moneyZakat = aboveNisab ? netZakatableMoney * 0.025 : 0;
  const agricultureRate = zakat.agriculturalIsIrrigated ? 0.05 : 0.1;
  const agricultureZakat = n(zakat.agriculturalProduceValue) * agricultureRate;
  const totalZakat = moneyZakat + agricultureZakat;

  const toggleSaveArticle = (id: string) => setSavedArticles(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  const toggleSaveName = (id: number) => setSavedNames(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  const shareText = async (title: string, text: string) => Share.share({ message: `${title}

${text}` });
  const updateZakat = (key: keyof ZakatInputs, value: string | boolean) => setZakat(prev => ({ ...prev, [key]: value }));

  const incrementName = (id: number) => setNameCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const decrementName = (id: number) => setNameCounts(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  const resetName = (id: number) => setNameCounts(prev => ({ ...prev, [id]: 0 }));
  const completeNameSession = (name: NameOfAllah) => {
    setNameSessions(prev => ({ ...prev, [name.id]: (prev[name.id] || 0) + 1 }));
    setNameCounts(prev => ({ ...prev, [name.id]: 0 }));
  };

  const savedItems = ARTICLES.filter(item => savedArticles.includes(item.id));
  const savedAllahNames = NAMES_OF_ALLAH.filter(item => savedNames.includes(item.id));
  const totalDhikrToday = Object.values(nameCounts).reduce((sum, value) => sum + value, 0);
  const completedSessions = Object.values(nameSessions).reduce((sum, value) => sum + value, 0);

  const renderContent = () => {
    if (tab === 'Home') {
      return (
        <>
          <View style={styles.statsGrid}>
            <StatCard icon={<ShieldCheck size={21} color={GOLD} />} value="5" label="Pillars" />
            <StatCard icon={<Gem size={21} color={GOLD} />} value="99" label="Names of Allah" />
            <StatCard icon={<Calculator size={21} color={GOLD} />} value="2.5%" label="Zakat" />
          </View>
          <LinearGradient colors={[GREEN, EMERALD]} style={styles.featureCard}>
            <Text style={styles.featureKicker}>Chafadia Noor Library</Text>
            <Text style={styles.featureTitle}>A serious Islamic knowledge space for worship, belief and daily practice.</Text>
            <Text style={styles.featureText}>Study the five pillars, the six articles of faith, the Shahadah, the 99 Names of Allah and zakat with clean, respectful organization.</Text>
          </LinearGradient>
          <SectionTitle icon={<ListChecks size={18} color={GOLD} />} title="Pillars of Islam" />
          {PILLARS_OF_ISLAM.map(item => <PillarCard key={item.title} item={item} onPress={() => setSelectedPillar(item)} />)}
          <SectionTitle icon={<BookOpen size={18} color={GOLD} />} title="Six Articles of Faith" />
          {FAITH_ARTICLES.map(article => <ArticleCard key={article.id} article={article} />)}
        </>
      );
    }

    if (tab === 'Pillars') {
      return (
        <>
          <SectionTitle icon={<ListChecks size={18} color={GOLD} />} title="The Five Pillars of Islam" />
          {PILLARS_OF_ISLAM.map(item => <PillarDetailCard key={item.title} item={item} onPress={() => setSelectedPillar(item)} />)}
        </>
      );
    }

    if (tab === 'Faith') {
      return (
        <>
          <SectionTitle icon={<ShieldCheck size={18} color={GOLD} />} title="Six Articles of Faith" />
          {ARTICLES_OF_FAITH.map(item => <FaithDetailCard key={item.title} title={item.title} text={item.text} />)}
          <TouchableOpacity style={styles.visualGuideCard} onPress={() => setTab('Articles')}>
            <Text style={styles.visualGuideTitle}>Open full Articles of Faith guide</Text>
            <Text style={styles.visualGuideText}>Read the six articles with key points, structured explanations and a visual summary.</Text>
          </TouchableOpacity>
          <SectionTitle icon={<ListChecks size={18} color={GOLD} />} title="Principles of Faith" />
          {PRINCIPLES_OF_FAITH.map(item => <FaithDetailCard key={item.title} title={item.title} text={item.text} />)}
        </>
      );
    }

    if (tab === 'Shahadah') {
      return (
        <>
          <LinearGradient colors={[GREEN, EMERALD]} style={styles.shahadahCard}>
            <View style={styles.shahadahGlowCircle} />
            <Text style={styles.shahadahArabic}>{SHAHADAH.arabic}</Text>
            <View style={styles.shahadahDivider} />
            <Text style={styles.shahadahTrans}>{SHAHADAH.transliteration}</Text>
            <Text style={styles.shahadahMeaning}>{SHAHADAH.meaning}</Text>
          </LinearGradient>
          <SectionTitle icon={<GraduationCap size={18} color={GOLD} />} title="What It Means" />
          {SHAHADAH.explanation.map((text, index) => <View key={index} style={styles.lessonCard}><View style={styles.numberBadge}><Text style={styles.numberBadgeText}>{index + 1}</Text></View><Text style={styles.lessonText}>{text}</Text></View>)}
        </>
      );
    }

    if (tab === 'Names') {
      return (
        <>
          <View style={styles.trackerRow}>
            <TrackerBox title="Current Counts" value={`${totalDhikrToday}`} />
            <TrackerBox title="Completed Sessions" value={`${completedSessions}`} />
          </View>
          <SectionTitle icon={<Gem size={18} color={GOLD} />} title="99 Names of Allah with Counter" />
          <Text style={styles.sectionIntro}>Tap any name to view the best time, suggested count, reward note, and tracker. The reward notes avoid unauthenticated promises; exact reward is with Allah.</Text>
          <View style={styles.namesGrid}>{filteredNames.map(item => <TouchableOpacity key={`${item.id}-${item.transliteration}`} style={styles.nameCard} onPress={() => setSelectedName(item)}><Text style={styles.nameNumber}>{item.id}</Text><Text style={styles.nameArabic}>{item.arabic}</Text><Text style={styles.nameTrans}>{item.transliteration}</Text><Text style={styles.nameMeaning}>{item.meaning}</Text><View style={styles.smallCounterRow}><Target size={12} color={GOLD} /><Text style={styles.smallCounterText}>{nameCounts[item.id] || 0}/{item.suggestedCount}</Text></View></TouchableOpacity>)}</View>
        </>
      );
    }

    if (tab === 'Zakat') return <ZakatCalculator />;

    if (tab === 'Articles') {
      return (
        <>
          <LinearGradient colors={[GREEN, EMERALD]} style={styles.faithVisualCard}>
            <View style={styles.visualHeaderRow}>
              <BookOpen size={22} color={GOLD} />
              <Text style={styles.faithVisualTitle}>Six Articles of Faith</Text>
            </View>
            <Text style={styles.faithVisualText}>A Muslim’s iman is built upon these six foundations. They connect the heart to Allah, the unseen, revelation, guidance, accountability and trust in divine wisdom. Tap each article below to read a clear explanation.</Text>
            <View style={styles.faithVisualGrid}>
              {ARTICLES_OF_FAITH.map((item, index) => (
                <View key={item.title} style={styles.faithVisualItem}>
                  <Text style={styles.faithVisualNumber}>{index + 1}</Text>
                  <Text style={styles.faithVisualItemText}>{item.title.replace('Belief in ', '')}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
          {filteredFaithArticles.map(article => <ArticleCard key={article.id} article={article} />)}
        </>
      );
    }

    return (
      <>
        <SectionTitle icon={<Bookmark size={18} color={GOLD} />} title="Saved Items" />
        {savedItems.length === 0 && savedAllahNames.length === 0 ? <View style={styles.emptyCard}><Bookmark size={34} color={GOLD} /><Text style={styles.emptyTitle}>No saved items yet</Text><Text style={styles.emptyText}>Save articles or Allah’s names to find them here quickly.</Text></View> : <>{savedItems.map(article => <ArticleCard key={article.id} article={article} />)}{savedAllahNames.map(item => <TouchableOpacity key={item.id} style={styles.savedNameCard} onPress={() => setSelectedName(item)}><Text style={styles.nameArabic}>{item.arabic}</Text><Text style={styles.nameTrans}>{item.transliteration}</Text><Text style={styles.nameMeaning}>{item.meaning}</Text></TouchableOpacity>)}</>}
      </>
    );
  };

  function ArticleCard({ article }: { article: ArticleItem }) {
    const saved = savedArticles.includes(article.id);
    return <TouchableOpacity style={styles.articleCard} onPress={() => setSelectedArticle(article)}><View style={styles.articleIconBox}>{categoryIcon(article.category)}</View><View style={{ flex: 1 }}><Text style={styles.articleCategory}>{article.category}</Text><Text style={styles.articleTitle}>{article.title}</Text><Text style={styles.articleSummary}>{article.summary}</Text></View><TouchableOpacity onPress={() => toggleSaveArticle(article.id)}><Bookmark size={21} color={saved ? GOLD : GREEN} fill={saved ? GOLD : 'transparent'} /></TouchableOpacity></TouchableOpacity>;
  }

  function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
    return <View style={styles.statCard}>{icon}<Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
  }

  function TrackerBox({ title, value }: { title: string; value: string }) {
    return <View style={styles.trackerBox}><Text style={styles.trackerValue}>{value}</Text><Text style={styles.trackerTitle}>{title}</Text></View>;
  }

  function ZakatInput({ label, value, onChangeText, placeholder, icon, keyboardType = 'numeric' }: { label: string; value: string; onChangeText: (text: string) => void; placeholder?: string; icon: React.ReactNode; keyboardType?: KeyboardTypeOptions }) {
    return <View style={styles.zakatInputCard}><View style={styles.zakatInputTop}>{icon}<Text style={styles.zakatInputLabel}>{label}</Text></View><TextInput style={styles.zakatInput} value={value} onChangeText={onChangeText} keyboardType={keyboardType} placeholder={placeholder || '0'} placeholderTextColor="#9A9187" /></View>;
  }

  function ZakatCalculator() {
    return (
      <>
        <LinearGradient colors={[GREEN, EMERALD]} style={styles.zakatHero}>
          <Text style={styles.zakatHeroKicker}>Halal Zakat Calculator</Text>
          <Text style={styles.zakatHeroTitle}>{formatMoney(totalZakat)}</Text>
          <Text style={styles.zakatHeroText}>Estimated zakat due from halal zakatable wealth only. Haram income is excluded and should not be counted as zakat.</Text>
        </LinearGradient>

        <View style={styles.resultGrid}>
          <ResultBox title="Halal Assets" value={formatMoney(halalMoneyAssets)} />
          <ResultBox title="Liabilities" value={formatMoney(liabilities)} />
          <ResultBox title="Net Wealth" value={formatMoney(netZakatableMoney)} />
          <ResultBox title="Nisab Used" value={formatMoney(nisab)} />
          
        </View>

        <View style={styles.zakatStatusCard}>
          <Info size={20} color={aboveNisab ? GREEN : ROSE} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.zakatStatusTitle, { color: aboveNisab ? GREEN : ROSE }]}>{aboveNisab ? 'You are above nisab' : 'Below nisab or nisab missing'}</Text>
            <Text style={styles.zakatStatusText}>{aboveNisab ? 'Money, gold, silver, trade goods, receivables and halal investments are calculated at 2.5% after immediate liabilities.' : 'Enter today’s gold or silver nisab value. If your net halal wealth is below nisab, money zakat is not due.'}</Text>
          </View>
        </View>

        <View style={styles.halalNotice}>
          <ShieldCheck size={20} color={GOLD} />
          <Text style={styles.halalNoticeText}>Only enter halal wealth in the zakatable asset fields. Haram income should be removed from your wealth and not counted as zakat. For complex business, livestock, agriculture or investment cases, confirm with a qualified scholar.</Text>
        </View>

        <SectionTitle icon={<Scale size={18} color={GOLD} />} title="Choose Nisab" />
        <View style={styles.nisabToggleRow}>
          <TouchableOpacity style={[styles.nisabPill, zakat.useSilverNisab && styles.nisabPillActive]} onPress={() => updateZakat('useSilverNisab', true)}><Text style={[styles.nisabPillText, zakat.useSilverNisab && styles.nisabPillTextActive]}>Silver Nisab</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.nisabPill, !zakat.useSilverNisab && styles.nisabPillActive]} onPress={() => updateZakat('useSilverNisab', false)}><Text style={[styles.nisabPillText, !zakat.useSilverNisab && styles.nisabPillTextActive]}>Gold Nisab</Text></TouchableOpacity>
        </View>
        <ZakatInput label="Today’s Silver Nisab Value" value={zakat.silverNisabValue} onChangeText={text => updateZakat('silverNisabValue', text)} icon={<Coins size={18} color={GOLD} />} />
        <ZakatInput label="Today’s Gold Nisab Value" value={zakat.goldNisabValue} onChangeText={text => updateZakat('goldNisabValue', text)} icon={<Gem size={18} color={GOLD} />} />

        <SectionTitle icon={<Wallet size={18} color={GOLD} />} title="Halal Cash, Savings and Personal Wealth" />
        <ZakatInput label="Halal Cash at Home / Wallet" value={zakat.cash} onChangeText={text => updateZakat('cash', text)} icon={<Wallet size={18} color={GOLD} />} />
        <ZakatInput label="Halal Bank Savings / Current Accounts" value={zakat.bankSavings} onChangeText={text => updateZakat('bankSavings', text)} icon={<Landmark size={18} color={GOLD} />} />
        <ZakatInput label="Gold Value" value={zakat.goldValue} onChangeText={text => updateZakat('goldValue', text)} icon={<Gem size={18} color={GOLD} />} />
        <ZakatInput label="Silver Value" value={zakat.silverValue} onChangeText={text => updateZakat('silverValue', text)} icon={<Coins size={18} color={GOLD} />} />
        <ZakatInput label="Halal Money Owed To You" value={zakat.moneyOwedToYou} onChangeText={text => updateZakat('moneyOwedToYou', text)} icon={<CircleDollarSign size={18} color={GOLD} />} />

        <SectionTitle icon={<Briefcase size={18} color={GOLD} />} title="Halal Business, Investments and Modern Assets" />
        <ZakatInput label="Halal Business Stock / Goods for Sale" value={zakat.businessStock} onChangeText={text => updateZakat('businessStock', text)} icon={<Briefcase size={18} color={GOLD} />} />
        <ZakatInput label="Halal Investments / Shares Value" value={zakat.investments} onChangeText={text => updateZakat('investments', text)} icon={<Scale size={18} color={GOLD} />} />
        <ZakatInput label="Halal Crypto / Digital Assets Value" value={zakat.crypto} onChangeText={text => updateZakat('crypto', text)} icon={<CircleDollarSign size={18} color={GOLD} />} />
        <ZakatInput label="Saved Halal Rental Income" value={zakat.rentalIncomeSaved} onChangeText={text => updateZakat('rentalIncomeSaved', text)} icon={<Home size={18} color={GOLD} />} />
        <ZakatInput label="Livestock Estimated Zakat Value" value={zakat.livestockValue} onChangeText={text => updateZakat('livestockValue', text)} icon={<Scale size={18} color={GOLD} />} />

        <SectionTitle icon={<Wheat size={18} color={GOLD} />} title="Agriculture" />
        <View style={styles.nisabToggleRow}>
          <TouchableOpacity style={[styles.nisabPill, zakat.agriculturalIsIrrigated && styles.nisabPillActive]} onPress={() => updateZakat('agriculturalIsIrrigated', true)}><Text style={[styles.nisabPillText, zakat.agriculturalIsIrrigated && styles.nisabPillTextActive]}>Irrigated / Costly Water 5%</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.nisabPill, !zakat.agriculturalIsIrrigated && styles.nisabPillActive]} onPress={() => updateZakat('agriculturalIsIrrigated', false)}><Text style={[styles.nisabPillText, !zakat.agriculturalIsIrrigated && styles.nisabPillTextActive]}>Natural Rain 10%</Text></TouchableOpacity>
        </View>
        <ZakatInput label="Halal Agricultural Produce Value" value={zakat.agriculturalProduceValue} onChangeText={text => updateZakat('agriculturalProduceValue', text)} icon={<Wheat size={18} color={GOLD} />} />

        <SectionTitle icon={<RefreshCcw size={18} color={GOLD} />} title="Debts, Bills and Exclusions" />
        <ZakatInput label="Immediate Debts Due" value={zakat.immediateDebts} onChangeText={text => updateZakat('immediateDebts', text)} icon={<RefreshCcw size={18} color={GOLD} />} />
        <ZakatInput label="Bills Due Now" value={zakat.billsDue} onChangeText={text => updateZakat('billsDue', text)} icon={<ScrollText size={18} color={GOLD} />} />
        <ZakatInput label="Haram Income Excluded from Zakat" value={zakat.haramIncomeExcluded} onChangeText={text => updateZakat('haramIncomeExcluded', text)} icon={<ShieldCheck size={18} color={GOLD} />} />

        <View style={styles.finalZakatCard}>
          <Text style={styles.finalZakatLabel}>Total Zakat to Give</Text>
          <Text style={styles.finalZakatAmount}>{formatMoney(totalZakat)}</Text>
          <Text style={styles.finalZakatBreakdown}>Money/Trade Zakat: {formatMoney(moneyZakat)} • Agriculture Zakat: {formatMoney(agricultureZakat)}</Text>
          <TouchableOpacity style={styles.resetButton} onPress={() => setZakat(DEFAULT_ZAKAT_INPUTS)}><RefreshCcw size={17} color="#FFFFFF" /><Text style={styles.resetButtonText}>Reset Calculator</Text></TouchableOpacity>
        </View>
      </>
    );
  }

  function ResultBox({ title, value }: { title: string; value: string }) {
    return <View style={styles.resultBox}><Text style={styles.resultTitle}>{title}</Text><Text style={styles.resultValue}>{value}</Text></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.goldGlow} />
        <View style={styles.greenGlow} />
        <LinearGradient colors={[GREEN, EMERALD]} style={styles.hero}>
          <View style={styles.heroHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.brandRow}><Sparkles size={18} color={GOLD} /><Text style={styles.heroKicker}>Chafadia Noor Library</Text></View>
              <Text style={styles.heroTitle}>Islamic Knowledge</Text>
              <Text style={styles.heroSubtitle}>Five Pillars • Six Articles of Faith • Shahadah • 99 Names of Allah • Zakat</Text>
            </View>
            <View style={styles.heroIcon}><BookMarked size={30} color={GOLD} /></View>
          </View>
          <Text style={styles.heroArabic}>رَبِّ زِدْنِي عِلْمًا</Text>
          <Text style={styles.heroDua}>My Lord, increase me in knowledge.</Text>
        </LinearGradient>

        <View style={styles.searchBox}><Search size={18} color={GREEN} /><TextInput style={styles.searchInput} placeholder="Search pillars, faith, zakat, 99 Names of Allah..." placeholderTextColor="#8A8172" value={query} onChangeText={setQuery} /></View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>{(['Home', 'Pillars', 'Faith', 'Shahadah', 'Names', 'Zakat', 'Articles', 'Saved'] as Tab[]).map(item => { const active = tab === item; return <TouchableOpacity key={item} style={[styles.tabPill, active && styles.tabPillActive]} onPress={() => setTab(item)}>{tabIcon(item, active ? '#FFFFFF' : GREEN)}<Text style={[styles.tabText, active && styles.tabTextActive]}>{tabLabel(item)}</Text></TouchableOpacity>; })}</ScrollView>
        {renderContent()}
      </ScrollView>

      <Modal visible={!!selectedPillar} animationType="slide">
        <SafeAreaView style={styles.safeArea}>
          {selectedPillar && (
            <ScrollView contentContainerStyle={styles.pillarPage} showsVerticalScrollIndicator={false}>
              <LinearGradient colors={[GREEN, EMERALD]} style={styles.pillarPageHero}>
                <View style={styles.articleHeroTop}>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPillar(null)}><X size={20} color={GREEN} /></TouchableOpacity>
                  <TouchableOpacity style={styles.closeButton} onPress={() => shareText(selectedPillar.title, PILLAR_GUIDES[selectedPillar.title].overview)}><Share2 size={20} color={GREEN} /></TouchableOpacity>
                </View>
                {selectedPillar.title === 'Shahadah' ? (
                  <View style={styles.pillarShahadahBox}>
                    <Text style={styles.pillarShahadahArabic}>{SHAHADAH.arabic}</Text>
                    <View style={styles.pillarShahadahDivider} />
                    <Text style={styles.pillarShahadahTrans}>{SHAHADAH.transliteration}</Text>
                    <Text style={styles.pillarShahadahMeaning}>{SHAHADAH.meaning}</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.pillarPageArabic}>{selectedPillar.icon}</Text>
                    <Text style={styles.pillarPageTitle}>{selectedPillar.title}</Text>
                    <Text style={styles.pillarPageSubtitle}>{selectedPillar.subtitle}</Text>
                    <Text style={styles.pillarPageOverview}>{PILLAR_GUIDES[selectedPillar.title].overview}</Text>
                  </>
                )}
              </LinearGradient>
              <SectionTitle icon={<Star size={18} color={GOLD} />} title="Why this pillar matters" />
              {PILLAR_GUIDES[selectedPillar.title].importance.map((point, index) => <View key={`importance-${index}`} style={styles.seriousPointRow}><CheckCircle2 size={18} color={GOLD} /><Text style={styles.seriousPointText}>{point}</Text></View>)}
              <SectionTitle icon={<ListChecks size={18} color={GOLD} />} title="How to live this pillar" />
              {PILLAR_GUIDES[selectedPillar.title].practice.map((point, index) => <View key={`practice-${index}`} style={styles.seriousPointRow}><CheckCircle2 size={18} color={GREEN} /><Text style={styles.seriousPointText}>{point}</Text></View>)}
              {selectedPillar.title === 'Salah' && (
                <>
                  <SectionTitle icon={<Clock size={18} color={GOLD} />} title="The five compulsory daily prayers" />
                  <View style={styles.dailySalahGrid}>
                    {DAILY_SALAHS.map((prayer) => (
                      <LinearGradient key={prayer.name} colors={[CARD, '#FFF8E7']} style={styles.dailySalahCard}>
                        <View style={styles.dailySalahTop}>
                          <Text style={styles.dailySalahArabic}>{prayer.arabic}</Text>
                          <View style={styles.dailySalahBadge}><Text style={styles.dailySalahBadgeText}>{prayer.rakahs}</Text></View>
                        </View>
                        <Text style={styles.dailySalahName}>{prayer.name}</Text>
                        <Text style={styles.dailySalahTime}>{prayer.time}</Text>
                        <Text style={styles.dailySalahMeaning}>{prayer.meaning}</Text>
                      </LinearGradient>
                    ))}
                  </View>
                  <SectionTitle icon={<Moon size={18} color={GOLD} />} title="Sunnah and Nafl prayers around the daily prayers" />
                  <Text style={styles.sunnahIntroText}>This section separates compulsory Fard prayers from authentic Sunnah and voluntary Nafl prayers. Keep the five compulsory prayers first, then add emphasized Sunnah, Salatul Duha, Witr, and other Nafl prayers according to ability, time, sincerity, and sound learning. Salatul Duha is especially beautiful as a morning prayer of gratitude, calmness, and reliance upon Allah.</Text>
                  <View style={styles.sunnahSalahGrid}>
                    {SUNNAH_NAFL_SALAHS.map((group) => (
                      <LinearGradient key={group.prayer} colors={[CARD, '#FFF8E7']} style={styles.sunnahSalahCard}>
                        <View style={styles.sunnahSalahHeader}>
                          <View>
                            <Text style={styles.sunnahSalahArabic}>{group.arabic}</Text>
                            <Text style={styles.sunnahSalahName}>{group.prayer}</Text>
                          </View>
                          <Text style={styles.sunnahObligatoryBadge}>{group.obligatory}</Text>
                        </View>
                        {group.sunnah.map((item, index) => (
                          <View key={`${group.prayer}-${index}`} style={styles.sunnahPrayerRow}>
                            <View style={styles.sunnahDot} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.sunnahTiming}>{item.timing}</Text>
                              <Text style={styles.sunnahRakahs}>{item.rakahs} • {item.type}</Text>
                              <Text style={styles.sunnahNote}>{item.note}</Text>
                            </View>
                          </View>
                        ))}
                      </LinearGradient>
                    ))}
                  </View>
                  <View style={styles.sunnahReminderCard}>
                    <Info size={18} color={GOLD} />
                    <Text style={styles.sunnahReminderText}>Fard means compulsory and must not be missed intentionally. Sunnah Mu’akkadah means emphasized Sunnah and should be guarded with care. Nafl means voluntary worship that brings extra reward by Allah’s mercy. Some details differ by school of fiqh, so learn practical rulings with a trusted teacher or scholar.</Text>
                  </View>
                </>
              )}
              <SectionTitle icon={<ShieldCheck size={18} color={GOLD} />} title="Common mistakes to avoid" />
              {PILLAR_GUIDES[selectedPillar.title].mistakes.map((point, index) => <View key={`mistake-${index}`} style={styles.warningPointRow}><Info size={18} color={ROSE} /><Text style={styles.seriousPointText}>{point}</Text></View>)}
              <LinearGradient colors={[CARD, '#FFF8E7']} style={styles.reflectionCard}>
                <Text style={styles.reflectionTitle}>Serious Reflection</Text>
                <Text style={styles.reflectionText}>{PILLAR_GUIDES[selectedPillar.title].reflection}</Text>
              </LinearGradient>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      <Modal visible={!!selectedArticle} animationType="slide">
        <SafeAreaView style={styles.safeArea}>{selectedArticle && <ScrollView contentContainerStyle={styles.articlePage} showsVerticalScrollIndicator={false}><LinearGradient colors={[GREEN, EMERALD]} style={styles.articleHero}><View style={styles.articleHeroTop}><TouchableOpacity style={styles.closeButton} onPress={() => setSelectedArticle(null)}><X size={20} color={GREEN} /></TouchableOpacity><TouchableOpacity style={styles.closeButton} onPress={() => shareText(selectedArticle.title, selectedArticle.summary)}><Share2 size={20} color={GREEN} /></TouchableOpacity></View><Text style={styles.articleHeroCategory}>{selectedArticle.category}</Text><Text style={styles.articleHeroTitle}>{selectedArticle.title}</Text><Text style={styles.articleHeroSummary}>{selectedArticle.summary}</Text></LinearGradient>{selectedArticle.quote && <Text style={styles.articleQuote}>“{selectedArticle.quote}”</Text>}<SectionTitle icon={<CheckCircle2 size={18} color={GOLD} />} title="Key Points" />{selectedArticle.keyPoints.map(point => <View key={point} style={styles.pointRow}><CheckCircle2 size={18} color={GOLD} /><Text style={styles.pointText}>{point}</Text></View>)}<SectionTitle icon={<ScrollText size={18} color={GOLD} />} title="Article" />{selectedArticle.content.map((paragraph, index) => <Text key={index} style={styles.paragraph}>{paragraph}</Text>)}<TouchableOpacity style={styles.saveWideButton} onPress={() => toggleSaveArticle(selectedArticle.id)}><Bookmark size={18} color="#FFFFFF" fill={savedArticles.includes(selectedArticle.id) ? '#FFFFFF' : 'transparent'} /><Text style={styles.saveWideText}>{savedArticles.includes(selectedArticle.id) ? 'Saved' : 'Save Article'}</Text></TouchableOpacity></ScrollView>}</SafeAreaView>
      </Modal>

      <Modal visible={!!selectedName} transparent animationType="fade">
        <View style={styles.modalOverlay}>{selectedName && <View style={styles.nameModalCard}><View style={styles.modalHeader}><Text style={styles.modalTitle}>Name of Allah</Text><TouchableOpacity onPress={() => setSelectedName(null)}><X size={24} color={GREEN} /></TouchableOpacity></View><Text style={styles.modalNameNumber}>#{selectedName.id}</Text><Text style={styles.modalArabic}>{selectedName.arabic}</Text><Text style={styles.modalTrans}>{selectedName.transliteration}</Text><Text style={styles.modalMeaning}>{selectedName.meaning}</Text><Text style={styles.modalReflection}>{selectedName.reflection}</Text><View style={styles.practiceCard}><View style={styles.practiceRow}><Clock size={17} color={GOLD} /><Text style={styles.practiceText}>Best time: {selectedName.bestTime}</Text></View><View style={styles.practiceRow}><Target size={17} color={GOLD} /><Text style={styles.practiceText}>Suggested count: {selectedName.suggestedCount}</Text></View><View style={styles.practiceRow}><Heart size={17} color={GOLD} /><Text style={styles.practiceText}>{selectedName.rewardNote}</Text></View></View><View style={styles.counterPanel}><Text style={styles.counterTitle}>Dhikr Counter</Text><Text style={styles.counterValue}>{nameCounts[selectedName.id] || 0}</Text><Text style={styles.counterGoal}>Goal: {selectedName.suggestedCount} • Completed: {nameSessions[selectedName.id] || 0}</Text><View style={styles.counterButtons}><TouchableOpacity style={styles.counterButton} onPress={() => decrementName(selectedName.id)}><Minus size={20} color="#FFFFFF" /></TouchableOpacity><TouchableOpacity style={styles.counterMainButton} onPress={() => incrementName(selectedName.id)}><Plus size={26} color="#FFFFFF" /></TouchableOpacity><TouchableOpacity style={styles.counterButton} onPress={() => resetName(selectedName.id)}><RotateCcw size={20} color="#FFFFFF" /></TouchableOpacity></View><TouchableOpacity style={styles.completeButton} onPress={() => completeNameSession(selectedName)}><CheckCircle2 size={17} color="#FFFFFF" /><Text style={styles.completeButtonText}>Mark Session Complete</Text></TouchableOpacity></View><View style={styles.modalActions}><TouchableOpacity style={styles.modalActionButton} onPress={() => toggleSaveName(selectedName.id)}><Bookmark size={17} color="#FFFFFF" fill={savedNames.includes(selectedName.id) ? '#FFFFFF' : 'transparent'} /><Text style={styles.modalActionText}>{savedNames.includes(selectedName.id) ? 'Saved' : 'Save'}</Text></TouchableOpacity><TouchableOpacity style={styles.modalActionButtonGold} onPress={() => shareText(selectedName.transliteration, `${selectedName.arabic}
${selectedName.transliteration}
${selectedName.meaning}
${selectedName.reflection}`)}><Share2 size={17} color="#FFFFFF" /><Text style={styles.modalActionText}>Share</Text></TouchableOpacity></View></View>}</View>
      </Modal>
    </SafeAreaView>
  );
}

function formatMoney(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function PillarCard({ item, onPress }: { item: { title: string; subtitle: string; text: string; icon: string }; onPress?: () => void }) {
  return <TouchableOpacity style={styles.pillarCard} onPress={onPress} activeOpacity={0.88}><View style={styles.pillarIcon}><Text style={styles.pillarIconText}>{item.icon}</Text></View><View style={{ flex: 1 }}><Text style={styles.pillarTitle}>{item.title}</Text><Text style={styles.pillarSubtitle}>{item.subtitle}</Text><Text style={styles.pillarText}>{item.text}</Text><Text style={styles.learnMoreText}>Open full explanation</Text></View><ChevronRight size={20} color={GOLD} /></TouchableOpacity>;
}

function PillarDetailCard({ item, onPress }: { item: { title: string; subtitle: string; text: string; icon: string }; onPress?: () => void }) {
  if (item.title === 'Shahadah') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.92}>
        <LinearGradient colors={[CARD, '#FFF8E7']} style={styles.pillarDetailCard}>
          <View style={styles.pillarDetailTopRow}>
            <View style={styles.pillarDetailMiniIcon}>
              <Text style={styles.pillarDetailMiniIconText}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pillarDetailTitle}>{item.title}</Text>
              <Text style={styles.pillarDetailSubtitle}>{item.subtitle}</Text>
            </View>
            <ChevronRight size={19} color={GOLD} />
          </View>

          <View style={styles.shahadahPreviewPanel}>
            <Text style={styles.shahadahPreviewArabic}>{SHAHADAH.arabic}</Text>
            <View style={styles.shahadahPreviewDivider} />
            <Text style={styles.shahadahPreviewTrans}>{SHAHADAH.transliteration}</Text>
            <Text style={styles.shahadahPreviewMeaning}>{SHAHADAH.meaning}</Text>
          </View>

          <Text style={styles.shahadahPreviewNote}>Open full explanation</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return <TouchableOpacity onPress={onPress} activeOpacity={0.9}><LinearGradient colors={[CARD, '#FFF8E7']} style={styles.pillarDetailCard}><Text style={styles.pillarBigIcon}>{item.icon}</Text><Text style={styles.pillarDetailTitle}>{item.title}</Text><Text style={styles.pillarDetailSubtitle}>{item.subtitle}</Text><Text style={styles.pillarDetailText}>{item.text}</Text><View style={styles.detailOpenRow}><Text style={styles.learnMoreText}>Read everything about {item.title}</Text><ChevronRight size={18} color={GOLD} /></View></LinearGradient></TouchableOpacity>;
}

function FaithDetailCard({ title, text }: { title: string; text: string }) {
  return <LinearGradient colors={[CARD, '#FFF8E7']} style={styles.faithDetailCard}><View style={styles.faithDetailIcon}><ShieldCheck size={22} color={GOLD} /></View><Text style={styles.faithDetailTitle}>{title}</Text><Text style={styles.faithDetailText}>{text}</Text></LinearGradient>;
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <View style={styles.sectionTitle}>{icon}<Text style={styles.sectionTitleText}>{title}</Text></View>;
}

function tabLabel(tab: Tab) {
  if (tab === 'Names') return '99 Names of Allah';
  return tab;
}

function tabIcon(tab: Tab, color: string) {
  if (tab === 'Home') return <Home size={15} color={color} />;
  if (tab === 'Pillars') return <ListChecks size={15} color={color} />;
  if (tab === 'Faith') return <ShieldCheck size={15} color={color} />;
  if (tab === 'Shahadah') return <ScrollText size={15} color={color} />;
  if (tab === 'Names') return <Gem size={15} color={color} />;
  if (tab === 'Zakat') return <Calculator size={15} color={color} />;
  if (tab === 'Articles') return <BookOpen size={15} color={color} />;
  return <Bookmark size={15} color={color} />;
}

function categoryIcon(category: ArticleCategory) {
  if (category === 'Aqidah') return <ShieldCheck size={21} color={GOLD} />;
  if (category === 'Hereafter') return <Moon size={21} color={GOLD} />;
  if (category === 'Seerah') return <Feather size={21} color={GOLD} />;
  if (category === 'Islamic History') return <BookMarked size={21} color={GOLD} />;
  if (category === 'Halal Earnings') return <Briefcase size={21} color={GOLD} />;
  if (category === 'Marriage') return <Heart size={21} color={GOLD} />;
  if (category === 'Parenting') return <Users size={21} color={GOLD} />;
  if (category === 'Character Building') return <Flower2 size={21} color={GOLD} />;
  if (category === 'Repentance') return <RefreshCcw size={21} color={GOLD} />;
  if (category === 'Knowledge') return <GraduationCap size={21} color={GOLD} />;
  if (category === 'Community') return <HandHeart size={21} color={GOLD} />;
  if (category === 'Dawah') return <Compass size={21} color={GOLD} />;
  if (category === 'Heart Softening') return <Sun size={21} color={GOLD} />;
  return <Calculator size={21} color={GOLD} />;
}

const styles = StyleSheet.create({

  pillarDetailTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  pillarDetailMiniIcon: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: '#F3E7C9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },
  pillarDetailMiniIconText: {
    color: GREEN,
    fontSize: 18,
    fontWeight: '900',
  },
  shahadahPreviewPanel: {
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9DFC8',
    marginTop: 4,
  },
  shahadahPreviewArabic: {
    color: GREEN,
    fontSize: 23,
    lineHeight: 42,
    fontWeight: '900',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  shahadahPreviewDivider: {
    height: 1,
    width: '70%',
    alignSelf: 'center',
    backgroundColor: '#E9DFC8',
    marginVertical: 12,
  },
  shahadahPreviewTrans: {
    color: '#5C564B',
    fontSize: 14.5,
    lineHeight: 23,
    textAlign: 'center',
    fontWeight: '700',
    fontStyle: 'italic',
  },
  shahadahPreviewMeaning: {
    color: TEXT,
    fontSize: 13.5,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 10,
  },
  shahadahPreviewNote: {
    alignSelf: 'flex-start',
    color: GOLD,
    fontWeight: '900',
    fontSize: 12,
    marginTop: 12,
  },

  pillarShahadahBox: {
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 30,
    paddingVertical: 26,
    paddingHorizontal: 18,
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: '#E9DFC8',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  pillarShahadahArabic: {
    fontSize: 27,
    lineHeight: 48,
    textAlign: 'center',
    color: GREEN,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  pillarShahadahDivider: {
    height: 1,
    backgroundColor: '#E9DFC8',
    marginVertical: 15,
    width: '72%',
    alignSelf: 'center',
  },
  pillarShahadahTrans: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    color: '#5C564B',
    fontWeight: '700',
    fontStyle: 'italic',
  },
  pillarShahadahMeaning: {
    marginTop: 12,
    fontSize: 14.5,
    lineHeight: 24,
    textAlign: 'center',
    color: TEXT,
    fontWeight: '600',
  },
  safeArea: { flex: 1, backgroundColor: CREAM },
  container: { flex: 1 },
  content: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 48 },
  goldGlow: { position: 'absolute', top: -80, right: -90, width: 230, height: 230, borderRadius: 999, backgroundColor: GOLD, opacity: 0.16 },
  greenGlow: { position: 'absolute', top: 420, left: -110, width: 240, height: 240, borderRadius: 999, backgroundColor: GREEN, opacity: 0.08 },
  hero: { borderRadius: 32, padding: 20, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 18, elevation: 8 },
  heroHeader: { flexDirection: 'row', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroKicker: { color: GOLD, fontSize: 13, fontWeight: '900' },
  heroTitle: { color: '#FFFFFF', fontSize: 31, fontWeight: '900', marginTop: 4, letterSpacing: -0.5 },
  heroSubtitle: { color: '#E6FFF4', fontSize: 12, fontWeight: '700', marginTop: 6, lineHeight: 18 },
  heroIcon: { width: 58, height: 58, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center' },
  heroArabic: { color: '#FFFFFF', fontSize: 23, fontWeight: '900', textAlign: 'center', marginTop: 18 },
  heroDua: { color: '#FFF4D6', textAlign: 'center', marginTop: 6, fontWeight: '800' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  searchInput: { flex: 1, color: GREEN, fontWeight: '800', marginLeft: 8 },
  tabScroll: { marginBottom: 14 },
  tabPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 13, borderWidth: 1, borderColor: '#E5D9C3', marginRight: 8 },
  tabPillActive: { backgroundColor: GREEN, borderColor: GREEN },
  tabText: { color: GREEN, fontSize: 10.5, fontWeight: '900', marginLeft: 6 },
  tabTextActive: { color: '#FFFFFF' },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 24, borderWidth: 1, borderColor: '#E5D9C3', padding: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  statValue: { color: GREEN, fontSize: 20, fontWeight: '900', marginTop: 6 },
  statLabel: { color: '#8A8172', fontSize: 9.5, fontWeight: '900', textAlign: 'center', marginTop: 3, lineHeight: 12 },
  featureCard: { borderRadius: 30, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 14, elevation: 5 },
  featureKicker: { color: GOLD, fontWeight: '900', fontSize: 12 },
  featureTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginTop: 7 },
  featureText: { color: '#E6FFF4', fontSize: 13, fontWeight: '700', lineHeight: 20, marginTop: 8 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, marginBottom: 10 },
  sectionTitleText: { color: GREEN, fontSize: 17, fontWeight: '900' },
  sectionIntro: { color: '#6B6257', fontWeight: '700', lineHeight: 20, marginBottom: 12 },
  pillarCard: { backgroundColor: CARD, borderRadius: 20, padding: 12, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  pillarIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' },
  pillarIconText: { color: GOLD, fontSize: 15, fontWeight: '900' },
  pillarTitle: { color: GREEN, fontWeight: '900', fontSize: 15 },
  pillarSubtitle: { color: GOLD, fontWeight: '900', fontSize: 11, marginTop: 2 },
  pillarText: { color: '#6B6257', fontWeight: '700', lineHeight: 17, marginTop: 4, fontSize: 11.5 },
  pillarDetailCard: { borderRadius: 22, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 12 },
  pillarBigIcon: { color: GREEN, fontWeight: '900', fontSize: 24, textAlign: 'center' },
  pillarDetailTitle: { color: GREEN, fontWeight: '900', fontSize: 19, textAlign: 'center', marginTop: 8 },
  pillarDetailSubtitle: { color: GOLD, fontWeight: '900', textAlign: 'center', marginTop: 3 },
  pillarDetailText: { color: TEXT, fontWeight: '700', lineHeight: 20, textAlign: 'center', marginTop: 10 },
  faithDetailCard: { borderRadius: 26, padding: 16, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 11 },
  faithDetailIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  faithDetailTitle: { color: GREEN, fontWeight: '900', fontSize: 17 },
  faithDetailText: { color: TEXT, fontWeight: '700', lineHeight: 21, marginTop: 7 },
  shahadahCard: { borderRadius: 36, paddingHorizontal: 20, paddingVertical: 28, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212,160,23,0.42)', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 20, elevation: 8 },
  shahadahGlowCircle: { position: 'absolute', width: 170, height: 170, borderRadius: 999, backgroundColor: GOLD, opacity: 0.12, right: -56, top: -62 },
  shahadahArabic: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', lineHeight: 46, textAlign: 'center', writingDirection: 'rtl' },
  shahadahDivider: { width: 86, height: 3, borderRadius: 99, backgroundColor: GOLD, alignSelf: 'center', marginTop: 18, marginBottom: 14, opacity: 0.95 },
  shahadahTrans: { color: '#FFF4D6', fontWeight: '900', lineHeight: 23, textAlign: 'center', fontSize: 13.5, letterSpacing: 0.2 },
  shahadahMeaning: { color: '#E6FFF4', fontWeight: '800', lineHeight: 22, textAlign: 'center', marginTop: 13, fontSize: 13 },
  lessonCard: { backgroundColor: CARD, borderRadius: 22, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', gap: 10, marginBottom: 10 },
  numberBadge: { width: 30, height: 30, borderRadius: 999, backgroundColor: GOLD, justifyContent: 'center', alignItems: 'center' },
  numberBadgeText: { color: '#FFFFFF', fontWeight: '900' },
  lessonText: { flex: 1, color: TEXT, fontWeight: '700', lineHeight: 20 },
  trackerRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  trackerBox: { flex: 1, backgroundColor: CARD, borderRadius: 22, borderWidth: 1, borderColor: '#E5D9C3', padding: 14, alignItems: 'center' },
  trackerValue: { color: GREEN, fontSize: 24, fontWeight: '900' },
  trackerTitle: { color: '#8A8172', fontWeight: '900', fontSize: 11, marginTop: 4, textAlign: 'center' },
  namesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  nameCard: { width: '48.5%', backgroundColor: CARD, borderRadius: 18, padding: 10, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 9, minHeight: 142, shadowColor: '#000', shadowOpacity: 0.035, shadowRadius: 6, elevation: 1 },
  nameNumber: { color: GOLD, fontWeight: '900', fontSize: 11 },
  nameArabic: { color: GREEN, fontSize: 19, fontWeight: '900', textAlign: 'center', marginTop: 5 },
  nameTrans: { color: TEXT, fontWeight: '900', textAlign: 'center', marginTop: 5, fontSize: 12 },
  nameMeaning: { color: '#6B6257', fontWeight: '700', textAlign: 'center', marginTop: 4, fontSize: 10.5, lineHeight: 14 },
  smallCounterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 6 },
  smallCounterText: { color: GOLD, fontWeight: '900', fontSize: 11 },
  categoryScroll: { marginBottom: 12 },
  categoryPill: { backgroundColor: CARD, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 13, borderWidth: 1, borderColor: '#E5D9C3', marginRight: 8 },
  categoryPillActive: { backgroundColor: GREEN, borderColor: GREEN },
  categoryText: { color: GREEN, fontWeight: '900', fontSize: 11 },
  categoryTextActive: { color: '#FFFFFF' },
  articleCard: { backgroundColor: CARD, borderRadius: 26, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 11, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 9, elevation: 2 },
  articleIconBox: { width: 48, height: 48, borderRadius: 18, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' },
  articleCategory: { color: GOLD, fontWeight: '900', fontSize: 10 },
  articleTitle: { color: GREEN, fontWeight: '900', fontSize: 15, marginTop: 2 },
  articleSummary: { color: '#6B6257', fontWeight: '700', fontSize: 12, lineHeight: 18, marginTop: 4 },
  emptyCard: { backgroundColor: CARD, borderRadius: 28, padding: 25, borderWidth: 1, borderColor: '#E5D9C3', alignItems: 'center' },
  emptyTitle: { color: GREEN, fontWeight: '900', fontSize: 18, marginTop: 10 },
  emptyText: { color: '#6B6257', fontWeight: '700', textAlign: 'center', lineHeight: 20, marginTop: 6 },
  savedNameCard: { backgroundColor: CARD, borderRadius: 24, padding: 15, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 10 },
  articlePage: { paddingBottom: 35 },
  articleHero: { padding: 18, borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  articleHeroTop: { flexDirection: 'row', justifyContent: 'space-between' },
  closeButton: { width: 42, height: 42, borderRadius: 999, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  articleHeroCategory: { color: GOLD, fontWeight: '900', marginTop: 18 },
  articleHeroTitle: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', marginTop: 8 },
  articleHeroSummary: { color: '#E6FFF4', fontWeight: '700', lineHeight: 21, marginTop: 8 },
  articleQuote: { color: GREEN, backgroundColor: '#FFF8E7', borderRadius: 22, padding: 15, margin: 15, fontWeight: '900', lineHeight: 23, textAlign: 'center' },
  pointRow: { marginHorizontal: 15, backgroundColor: CARD, borderRadius: 18, padding: 13, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 },
  pointText: { flex: 1, color: TEXT, fontWeight: '800' },
  paragraph: { color: TEXT, fontWeight: '700', lineHeight: 24, fontSize: 14, marginHorizontal: 15, marginBottom: 12 },
  saveWideButton: { margin: 15, backgroundColor: GREEN, borderRadius: 20, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 },
  saveWideText: { color: '#FFFFFF', fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.38)', justifyContent: 'center', padding: 16 },
  nameModalCard: { backgroundColor: CREAM, borderRadius: 30, padding: 18, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center' },
  modalTitle: { flex: 1, color: GREEN, fontSize: 20, fontWeight: '900' },
  modalNameNumber: { color: GOLD, fontWeight: '900', textAlign: 'center', marginTop: 12 },
  modalArabic: { color: GREEN, fontSize: 42, fontWeight: '900', textAlign: 'center', marginTop: 10 },
  modalTrans: { color: TEXT, fontSize: 20, fontWeight: '900', textAlign: 'center', marginTop: 10 },
  modalMeaning: { color: GOLD, fontSize: 16, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  modalReflection: { color: '#6B6257', fontWeight: '700', lineHeight: 22, textAlign: 'center', marginTop: 12 },
  practiceCard: { backgroundColor: CARD, borderRadius: 22, padding: 13, borderWidth: 1, borderColor: '#E5D9C3', marginTop: 14 },
  practiceRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  practiceText: { flex: 1, color: TEXT, fontWeight: '700', lineHeight: 19 },
  counterPanel: { backgroundColor: GREEN, borderRadius: 24, padding: 15, marginTop: 12, alignItems: 'center' },
  counterTitle: { color: GOLD, fontWeight: '900' },
  counterValue: { color: '#FFFFFF', fontSize: 44, fontWeight: '900', marginTop: 4 },
  counterGoal: { color: '#E6FFF4', fontWeight: '800', marginTop: 2 },
  counterButtons: { flexDirection: 'row', gap: 12, marginTop: 14, alignItems: 'center' },
  counterButton: { width: 48, height: 48, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  counterMainButton: { width: 66, height: 66, borderRadius: 999, backgroundColor: GOLD, justifyContent: 'center', alignItems: 'center' },
  completeButton: { backgroundColor: GOLD, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 },
  completeButtonText: { color: '#FFFFFF', fontWeight: '900' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  modalActionButton: { flex: 1, backgroundColor: GREEN, borderRadius: 18, paddingVertical: 13, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 },
  modalActionButtonGold: { flex: 1, backgroundColor: GOLD, borderRadius: 18, paddingVertical: 13, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 },
  modalActionText: { color: '#FFFFFF', fontWeight: '900' },
  zakatHero: { borderRadius: 30, padding: 20, marginBottom: 13 },
  zakatHeroKicker: { color: GOLD, fontWeight: '900', fontSize: 13 },
  zakatHeroTitle: { color: '#FFFFFF', fontSize: 36, fontWeight: '900', marginTop: 8 },
  zakatHeroText: { color: '#E6FFF4', fontWeight: '700', lineHeight: 20, marginTop: 6 },
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  resultBox: { width: '48.5%', backgroundColor: CARD, borderRadius: 22, padding: 13, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 10 },
  resultTitle: { color: '#8A8172', fontWeight: '900', fontSize: 11 },
  resultValue: { color: GREEN, fontWeight: '900', fontSize: 17, marginTop: 5 },
  zakatStatusCard: { backgroundColor: CARD, borderRadius: 22, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', gap: 10, marginBottom: 8 },
  zakatStatusTitle: { fontWeight: '900', fontSize: 14 },
  zakatStatusText: { color: '#6B6257', fontWeight: '700', lineHeight: 19, marginTop: 4 },
  halalNotice: { backgroundColor: '#FFF8E7', borderRadius: 22, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', gap: 10, marginBottom: 8 },
  halalNoticeText: { flex: 1, color: TEXT, fontWeight: '700', lineHeight: 19 },
  nisabToggleRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  nisabPill: { flex: 1, backgroundColor: CARD, borderRadius: 18, borderWidth: 1, borderColor: '#E5D9C3', paddingVertical: 11, paddingHorizontal: 10, alignItems: 'center' },
  nisabPillActive: { backgroundColor: GREEN, borderColor: GREEN },
  nisabPillText: { color: GREEN, fontWeight: '900', fontSize: 11, textAlign: 'center' },
  nisabPillTextActive: { color: '#FFFFFF' },
  zakatInputCard: { backgroundColor: CARD, borderRadius: 22, padding: 13, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 9 },
  zakatInputTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  zakatInputLabel: { color: GREEN, fontWeight: '900', flex: 1 },
  zakatInput: { backgroundColor: CREAM, borderRadius: 16, paddingHorizontal: 13, paddingVertical: 11, color: GREEN, fontWeight: '900' },
  finalZakatCard: { backgroundColor: GREEN, borderRadius: 30, padding: 20, marginTop: 12, marginBottom: 20 },
  finalZakatLabel: { color: GOLD, fontWeight: '900', fontSize: 14 },
  finalZakatAmount: { color: '#FFFFFF', fontWeight: '900', fontSize: 38, marginTop: 8 },
  finalZakatBreakdown: { color: '#E6FFF4', fontWeight: '700', lineHeight: 20, marginTop: 8 },
  resetButton: { alignSelf: 'flex-start', backgroundColor: GOLD, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 },
  resetButtonText: { color: '#FFFFFF', fontWeight: '900' },

  learnMoreText: { color: GOLD, fontWeight: '900', fontSize: 11.5, marginTop: 8 },
  detailOpenRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  visualGuideCard: { backgroundColor: CARD, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 14 },
  visualGuideTitle: { color: GREEN, fontWeight: '900', fontSize: 16 },
  visualGuideText: { color: '#6B6257', fontWeight: '700', lineHeight: 20, marginTop: 5 },
  faithVisualCard: { borderRadius: 30, padding: 18, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, elevation: 6 },
  visualHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  faithVisualTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  faithVisualText: { color: '#E6FFF4', fontWeight: '700', lineHeight: 20, marginBottom: 12 },
  faithVisualGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  faithVisualItem: { width: '48%', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  faithVisualNumber: { color: GOLD, fontWeight: '900', fontSize: 16 },
  faithVisualItemText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12.5, marginTop: 4, lineHeight: 17 },
  faithVisualSource: { color: '#CDEDE0', fontSize: 10.5, fontWeight: '700', marginTop: 12, lineHeight: 16 },
  dailySalahGrid: { paddingHorizontal: 15, marginBottom: 10 },
  dailySalahCard: { borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  dailySalahTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  dailySalahArabic: { color: GREEN, fontSize: 24, fontWeight: '900' },
  dailySalahBadge: { backgroundColor: '#F5E9C8', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#E4D29B' },
  dailySalahBadgeText: { color: GREEN, fontSize: 10, fontWeight: '900' },
  dailySalahName: { color: GREEN, fontSize: 18, fontWeight: '900', marginTop: 8 },
  dailySalahTime: { color: GOLD, fontSize: 12, fontWeight: '900', marginTop: 2 },
  dailySalahMeaning: { color: TEXT, fontSize: 12.5, fontWeight: '700', lineHeight: 19, marginTop: 7 },

  sunnahIntroText: { color: '#6B6257', fontWeight: '700', lineHeight: 20, marginHorizontal: 15, marginTop: -4, marginBottom: 11 },
  sunnahSalahGrid: { paddingHorizontal: 15, marginBottom: 10 },
  sunnahSalahCard: { borderRadius: 22, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 11, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  sunnahSalahHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
  sunnahSalahArabic: { color: GREEN, fontSize: 22, fontWeight: '900' },
  sunnahSalahName: { color: GREEN, fontSize: 16, fontWeight: '900', marginTop: 2 },
  sunnahObligatoryBadge: { maxWidth: '48%', color: GREEN, backgroundColor: '#F5E9C8', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#E4D29B', fontSize: 10.5, fontWeight: '900', textAlign: 'center', overflow: 'hidden' },
  sunnahPrayerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingTop: 10, marginTop: 8, borderTopWidth: 1, borderTopColor: '#EFE5D1' },
  sunnahDot: { width: 9, height: 9, borderRadius: 999, backgroundColor: GOLD, marginTop: 5 },
  sunnahTiming: { color: GREEN, fontSize: 13.5, fontWeight: '900' },
  sunnahRakahs: { color: GOLD, fontSize: 12, fontWeight: '900', marginTop: 2 },
  sunnahNote: { color: TEXT, fontSize: 12.5, fontWeight: '700', lineHeight: 19, marginTop: 5 },
  sunnahReminderCard: { backgroundColor: '#FFF8E7', borderRadius: 22, padding: 14, marginHorizontal: 15, marginBottom: 13, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  sunnahReminderText: { flex: 1, color: TEXT, fontWeight: '700', lineHeight: 19 },
  pillarPage: { paddingBottom: 34, backgroundColor: CREAM },
  pillarPageHero: { borderBottomLeftRadius: 34, borderBottomRightRadius: 34, padding: 20, paddingBottom: 26, marginBottom: 16 },
  pillarPageArabic: { color: GOLD, fontSize: 46, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  pillarPageTitle: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  pillarPageSubtitle: { color: GOLD, fontSize: 15, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  pillarPageOverview: { color: '#E6FFF4', fontWeight: '700', lineHeight: 22, textAlign: 'center', marginTop: 12 },
  seriousPointRow: { backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: '#E5D9C3', padding: 14, marginHorizontal: 15, marginBottom: 9, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  warningPointRow: { backgroundColor: '#FFF4EF', borderRadius: 20, borderWidth: 1, borderColor: '#F0D1C8', padding: 14, marginHorizontal: 15, marginBottom: 9, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  seriousPointText: { flex: 1, color: TEXT, fontWeight: '700', lineHeight: 20 },
  reflectionCard: { marginHorizontal: 15, marginTop: 8, borderRadius: 24, padding: 17, borderWidth: 1, borderColor: '#E5D9C3' },
  reflectionTitle: { color: GREEN, fontWeight: '900', fontSize: 16 },
  reflectionText: { color: TEXT, fontWeight: '700', lineHeight: 21, marginTop: 7 },
});
