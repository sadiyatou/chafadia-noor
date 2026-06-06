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
  Modal,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import {
  Moon,
  Sun,
  CalendarDays,
  CheckCircle,
  BookOpen,
  Bell,
  Star,
  Utensils,
  ShieldCheck,
  ShieldAlert,
  Search,
  Share2,
  Sparkles,
  Flame,
  Gift,
  Soup,
  Landmark,
  HandHeart,
  Target,
  Heart,
  ChevronLeft,
  ChevronRight,
  Info,
  Edit3,
  RotateCcw,
  Save,
  X,
} from 'lucide-react-native';

type Tab =
  | 'home'
  | 'calendar'
  | 'worship'
  | 'food'
  | 'halal'
  | 'duas'
  | 'tracker'
  | 'quotes';

type CalendarCell = {
  date: Date;
  key: string;
  gregorianDay: number;
  hijriDay: number;
  hijriMonth: string;
  isCurrentMonth: boolean;
  isRamadan: boolean;
  isRamadanStart: boolean;
  isRamadanEnd: boolean;
  isWhiteDay: boolean;
  isMondayThursday: boolean;
};

type FoodPlanItem = {
  suhoor: string;
  iftar: string;
};

const GREEN = '#064E3B';
const EMERALD = '#0D7054';
const GOLD = '#D4A017';
const CREAM = '#F7F5EE';
const CARD = '#FFFDF8';
const SOFT_GOLD = '#F5E9C8';
const MINT = '#E6F1EC';
const ROSE = '#9F2D2D';
const TEXT = '#3C3A34';

const STORAGE_FASTS = 'CHAFADIA_RAMADAN_FASTS_PRO_CALENDAR';
const STORAGE_GOALS = 'CHAFADIA_RAMADAN_GOALS_PRO_CALENDAR';
const STORAGE_FOOD_PLAN = 'CHAFADIA_RAMADAN_CUSTOM_FOOD_PLAN_V1';

const RAMADAN_ESTIMATES: Record<number, string> = {
  2024: '2024-03-11',
  2025: '2025-03-01',
  2026: '2026-02-18',
  2027: '2027-02-08',
  2028: '2028-01-28',
  2029: '2029-01-16',
  2030: '2030-01-06',
  2031: '2030-12-26',
  2032: '2031-12-15',
  2033: '2032-12-04',
  2034: '2033-11-23',
  2035: '2034-11-12',
};

const HIJRI_MONTHS = [
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

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CAMEROONIAN_FOOD_PLAN: FoodPlanItem[] = [
  {
    suhoor:
      'Meal: Fried potatoe and Eggs\nFruit/Salad: Banana and pawpaw fruit salad\nDrink: Warm tea or fresh ginger drink',
    iftar:
      'Starter: Dates, water, pap/Ogi and Akara\nMain meal: Eru and water fufu\nDrink: Natural pineapple juice',
  },
  {
    suhoor:
      'Meal: poulet DJ, Apples, banana and groundnuts\nFruit/Salad: Apple and watermelon fruit salad\nDrink: Kossam/Yogurt or water',
    iftar:
      'Starter: Dates, water, puff-puff and pap\nMain meal: Ndolé with ripe plantain\nDrink: Baobab juice or soft drink',
  },
  {
    suhoor:
      'Meal: Boiled yam with Egg Sauce\nFruit/Salad: Pineapple and pawpaw fruit salad\nDrink: Mint tea or water',
    iftar:
      'Starter: Dates, water, Massa and tea\nMain meal: Grilled fish with Miondo\nDrink: Foléré/Bissap drink',
  },
  {
    suhoor:
      'Meal: Spaghetti omelette with vegetables and avocado\nFruit/Salad: Cucumber, tomato and lettuce salad\nDrink: Lemon water or warm tea',
    iftar:
      'Starter: Dates, water, fried plantain and pap\nMain meal: Achu soup\nDrink: Fresh orange juice',
  },
  {
    suhoor:
      'Meal: Corn chaff with vegetables and small fish pieces\nFruit/Salad: Mango and banana fruit salad\nDrink: Water or milk',
    iftar:
      'Starter: Dates, water, Akara and pap\nMain meal: Poulet DG\nDrink: Ginger pineapple juice',
  },
  {
    suhoor:
      'Meal: Beans and boiled plantain with avocado\nFruit/Salad: Cabbage, carrot and cucumber salad\nDrink: Warm water or hibiscus drink',
    iftar:
      'Starter: Dates, water, puff-puff and tea\nMain meal: Pepper soup fish\nDrink: Lemon mint drink',
  },
  {
    suhoor:
      'Meal: Fried Plantain and Eggs\nFruit/Salad: Orange and banana fruit salad\nDrink: Kossam/Yogurt or water',
    iftar:
      'Starter: Dates, water, Massa and pap\nMain meal: Jollof rice Cameroon style\nDrink: Mango juice or soft drink',
  },
  {
    suhoor:
      'Meal: Tea with bread, peanut paste, boiled egg and avocado\nFruit/Salad: Apple and grapes fruit salad\nDrink: Warm tea or water',
    iftar:
      'Starter: Dates, water, Akara and pap\nMain meal: Mbongo Tchobi\nDrink: Pineapple ginger juice',
  },
  {
    suhoor:
      'Meal: Rice pudding with milk, banana and dates\nFruit/Salad: Cucumber and tomato salad\nDrink: Water or milk tea',
    iftar:
      'Starter: Dates, water, plantain and pap\nMain meal: Okra soup and fufu\nDrink: Foléré/Bissap drink',
  },
  {
    suhoor:
      'Meal: Fried sapaghetti with chicken or meat Sauce\nFruit/Salad: Pawpaw and banana fruit salad\nDrink: Lemon water or tea',
    iftar:
      'Starter: Dates, water, puff-puff and tea\nMain meal: Kwacoco Bible\nDrink: Natural orange juice',
  },
  {
    suhoor:
      'Meal: Bread with sardine and egg spread plus avocado\nFruit/Salad: Lettuce, tomato and cucumber salad\nDrink: Ginger drink or water',
    iftar:
      'Starter: Dates, water, Massa and pap\nMain meal: Bobolo and grilled fish\nDrink: Baobab juice',
  },
  {
    suhoor:
      'Meal: Koki beans with small ripe plantain\nFruit/Salad: Pineapple and watermelon fruit salad\nDrink: Warm water or tea',
    iftar:
      'Starter: Dates, water, Akara and pap\nMain meal: Egusi soup and fufu\nDrink: Mango juice',
  },
  {
    suhoor:
      'Meal: Plantain porridge with vegetables and fish\nFruit/Salad: Cabbage and carrot salad\nDrink: Water or lemon drink',
    iftar:
      'Starter: Dates, water, puff-puff and pap\nMain meal: Rice and tomato stew\nDrink: Fresh ginger juice',
  },
  {
    suhoor:
      'Meal: Pancake, Bread and Chocolate\nFruit/Salad: Banana and pawpaw fruit salad\nDrink: Kossam/Yogurt or water',
    iftar:
      'Starter: Dates, water, Massa and tea\nMain meal: Fried rice Cameroon style\nDrink: Soft drink or pineapple juice',
  },
  {
    suhoor:
      'Meal: Egg Fried rice \nFruit/Salad: Cucumber and lettuce salad\nDrink: Water or mint tea',
    iftar:
      'Starter: Dates, water, Akara and pap\nMain meal: Ndolé with yam\nDrink: Foléré/Bissap drink',
  },
  {
    suhoor:
      'Meal: Spaghetti and egg\nFruit/Salad: Orange and apple fruit salad\nDrink: Milk tea or water',
    iftar:
      'Starter: Dates, water, plantain and pap\nMain meal: Eru and garri\nDrink: Natural pineapple juice',
  },
  {
    suhoor:
      'Meal: Beans and plantain with avocado and a small egg\nFruit/Salad: Tomato, onion and lettuce salad\nDrink: Warm water or ginger drink',
    iftar:
      'Starter: Dates, water, puff-puff and tea\nMain meal: Grilled chicken and plantain\nDrink: Lemon mint drink',
  },
  {
    suhoor:
      'Meal: Rice and Tomamto Sauce\nFruit/Salad: Mango and banana fruit salad\nDrink: Water or yogurt',
    iftar:
      'Starter: Dates, water, Massa and pap\nMain meal: Pepper soup meat\nDrink: Baobab juice',
  },
  {
    suhoor:
      'Meal: Tea with bread, avocado and vegetable omelette\nFruit/Salad: Cucumber and carrot salad\nDrink: Tea or water',
    iftar:
      'Starter: Dates, water, Akara and pap\nMain meal: Achu and yellow soup\nDrink: Orange juice',
  },
  {
    suhoor:
      'Meal: Corn chaff with vegetables, beans and small fish\nFruit/Salad: Pineapple and pawpaw fruit salad\nDrink: Water or hibiscus drink',
    iftar:
      'Starter: Dates, water, puff-puff and pap\nMain meal: Fish stew and rice\nDrink: Mango juice',
  },
  {
    suhoor:
      'Meal: Spaghetti with egg, tomato and vegetables\nFruit/Salad: Watermelon and orange fruit salad\nDrink: Warm tea or water',
    iftar:
      'Starter: Dates, water, Massa and tea\nMain meal: Mbongo Tchobi\nDrink: Pineapple juice',
  },
  {
    suhoor:
      'Meal: Hot pot(Potato porridge\nFruit/Salad: Lettuce and cucumber salad\nDrink: Water or lemon drink',
    iftar:
      'Starter: Dates, water, Akara and pap\nMain meal: Okra soup and couscous\nDrink: Foléré/Bissap drink',
  },
  {
    suhoor:
      'Meal: Boiled yam with egg sauce \nFruit/Salad: Pawpaw and pineapple fruit salad\nDrink: Ginger drink or water',
    iftar:
      'Starter: Dates, water, puff-puff and pap\nMain meal: Poulet DG\nDrink: Soft drink or orange juice',
  },
  {
    suhoor:
      'Meal: Bread with omelette, avocado and peanut paste\nFruit/Salad: Apple and banana fruit salad\nDrink: Tea or water',
    iftar:
      'Starter: Dates, water, Massa and tea\nMain meal: Ndolé and plantain\nDrink: Baobab juice',
  },
  {
    suhoor:
      'Meal: rice and stew with chicken, meat or fish\nFruit/Salad: Cabbage, carrot and cucumber salad\nDrink: Milk tea or water',
    iftar:
      'Starter: Dates, water, fried plantain and pap\nMain meal: Bobolo and grilled fish\nDrink: Pineapple ginger juice',
  },
  {
    suhoor:
      'Meal: Koki beans with boiled plantain and avocado\nFruit/Salad: Mango and orange fruit salad\nDrink: Kossam/Yogurt or water',
    iftar:
      'Starter: Dates, water, Akara and pap\nMain meal: Jollof rice and chicken\nDrink: Mango juice',
  },
  {
    suhoor:
      'Meal: Fried potatoes and eggs \nFruit/Salad: Cucumber, tomato and lettuce salad\nDrink: Mint tea or water',
    iftar:
      'Starter: Dates, water, puff-puff and tea\nMain meal: Eru and water fufu\nDrink: Foléré/Bissap drink',
  },
  {
    suhoor:
      'Meal: Corn chaff with vegetables and boiled egg\nFruit/Salad: Pineapple and watermelon fruit salad\nDrink: Warm water or ginger drink',
    iftar:
      'Starter: Dates, water, Massa and pap\nMain meal: Fried rice Cameroon style\nDrink: Natural orange juice',
  },
  {
    suhoor:
      'Meal: Tea with bread, boiled egg and sardine\nFruit/Salad: Pawpaw and banana fruit salad\nDrink: Water or milk tea',
    iftar:
      'Starter: Dates, water, Akara and pap\nMain meal: Pepper soup fish\nDrink: Lemon mint drink',
  },
  {
    suhoor:
      'Meal: rice and beans\nFruit/Salad: Apple, orange and watermelon fruit salad\nDrink: Warm tea or water',
    iftar:
      'Starter: Dates, water, puff-puff, Massa and pap\nMain meal: Family Eid Eve Meal\nDrink: Natural juice or soft drink',
  },
];

const WORSHIP_SECTIONS = [
  ['Fasting', 'Fast sincerely and avoid sins of the tongue, eyes, ears and heart.'],
  ['Quran', 'Read daily. Aim for one juz, half juz, or at least one page.'],
  ['Taraweeh', 'Pray at night consistently, even if you can only do a few rakats.'],
  ['Tahajjud', 'Wake before Fajr for dua, istighfar and quiet worship.'],
  ['Dua Before Iftar', 'Use the minutes before Maghrib to ask Allah sincerely.'],
  ['Charity', 'Give daily charity, feed fasting people and support needy families.'],
  ['Adhkar', 'Do morning and evening adhkar every day.'],
  ['Istighfar', 'Seek forgiveness often and leave bad habits.'],
  ['Salawat', 'Send blessings on Prophet Muhammad ﷺ daily.'],
  ['Family Worship', 'Teach children duas and make the home peaceful.'],
  ['Good Character', 'Avoid anger, gossip, insults and arguments.'],
  ['Last 10 Nights', 'Seek Laylatul Qadr with Quran, salah, dua and charity.'],
  ['I’tikaf', 'Spend focused time in worship if possible.'],
  ['Zakat', 'Calculate zakat and zakat al-fitr properly.'],
];

const HALAL_ACTS = [
  'Pray all five prayers on time.',
  'Read Quran every day.',
  'Break fast with dates or water.',
  'Make dua before iftar.',
  'Wake for suhoor.',
  'Give charity daily.',
  'Feed fasting people.',
  'Respect parents and elders.',
  'Help with cooking and cleaning.',
  'Speak gently.',
  'Forgive people.',
  'Visit or call relatives.',
  'Reduce social media.',
  'Do morning and evening adhkar.',
  'Pray Taraweeh.',
];

const AVOID_ACTS = [
  'Backbiting and gossip.',
  'Lying.',
  'Insulting people.',
  'Missing salah.',
  'Haram videos or content.',
  'Overeating until worship becomes hard.',
  'Wasting food.',
  'Showing off worship.',
  'Sleeping all day and neglecting duties.',
  'Cheating in business, school or work.',
  'Mocking people.',
];

const RAMADAN_DUAS = [
  {
    title: 'Breaking Fast',
    arabic:
      'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ',
    translation:
      'The thirst has gone, the veins are moistened, and the reward is confirmed if Allah wills.',
  },
  {
    title: 'Laylatul Qadr',
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    translation: 'O Allah, You are Pardoning and love pardon, so pardon me.',
  },
  {
    title: 'Good in Both Worlds',
    arabic:
      'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    translation:
      'Our Lord, give us good in this world and the Hereafter, and protect us from the Fire.',
  },
  {
    title: 'Forgiveness',
    arabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
    translation:
      'My Lord, forgive me and accept my repentance. You are the Accepter of repentance, Most Merciful.',
  },
];

const RAMADAN_QUOTES = [
  'Ramadan is not only about hunger; it is about feeding the soul.',
  'The best Ramadan is the one that changes you after it leaves.',
  'A small deed done daily can become a mountain of reward.',
  'Guard your tongue as much as you guard your fast.',
  'Before iftar, raise your hands; Allah hears every sincere dua.',
  'Ramadan trains the heart to prefer Allah over desire.',
  'Do not let the last ten nights pass like ordinary nights.',
  'Charity in Ramadan beautifies the soul.',
  'The Quran is the companion of Ramadan.',
  'Fasting is a shield; protect it with good character.',
];

const WORSHIP_GOALS = [
  'Fasted today',
  'Prayed Fajr',
  'Prayed Dhuhr',
  'Prayed Asr',
  'Prayed Maghrib',
  'Prayed Isha',
  'Read Quran',
  'Prayed Taraweeh',
  'Gave charity',
  'Made dua before iftar',
  'Morning adhkar',
  'Evening adhkar',
  'Avoided gossip',
  'Helped someone',
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function sameDate(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function monthTitle(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function getRamadanStartForYear(year: number) {
  if (RAMADAN_ESTIMATES[year]) return parseDate(RAMADAN_ESTIMATES[year]);

  const nearestYear = 2026;
  const nearestStart = parseDate(RAMADAN_ESTIMATES[nearestYear]);
  const difference = year - nearestYear;

  return addDays(nearestStart, Math.round(difference * -10.875));
}

function getHijriEstimate(date: Date) {
  const year = date.getFullYear();
  const ramadanStart = getRamadanStartForYear(year);

  const diff = Math.floor(
    (date.getTime() - ramadanStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  let hijriMonthIndex = 8;
  let hijriDay = diff + 1;

  while (hijriDay < 1) {
    hijriMonthIndex -= 1;
    if (hijriMonthIndex < 0) hijriMonthIndex = 11;
    hijriDay += 29;
  }

  while (hijriDay > 30) {
    hijriMonthIndex += 1;
    if (hijriMonthIndex > 11) hijriMonthIndex = 0;
    hijriDay -= 30;
  }

  return {
    day: hijriDay,
    month: HIJRI_MONTHS[hijriMonthIndex],
  };
}

function buildMonthCells(currentMonth: Date): CalendarCell[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  const ramadanStart = getRamadanStartForYear(year);
  const ramadanEnd = addDays(ramadanStart, 29);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    const hijri = getHijriEstimate(date);
    const isRamadan = date >= ramadanStart && date <= ramadanEnd;

    return {
      date,
      key: dateKey(date),
      gregorianDay: date.getDate(),
      hijriDay: hijri.day,
      hijriMonth: hijri.month,
      isCurrentMonth: date.getMonth() === month,
      isRamadan,
      isRamadanStart: sameDate(date, ramadanStart),
      isRamadanEnd: sameDate(date, ramadanEnd),
      isWhiteDay: hijri.day === 13 || hijri.day === 14 || hijri.day === 15,
      isMondayThursday: date.getDay() === 1 || date.getDay() === 4,
    };
  });
}

export default function RamadanPage() {
  const [tab, setTab] = useState<Tab>('home');
  const [query, setQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [today, setToday] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarCell | null>(null);
  const [completedFasts, setCompletedFasts] = useState<string[]>([]);
  const [completedGoals, setCompletedGoals] = useState<string[]>([]);
  const [customFoodPlan, setCustomFoodPlan] = useState<FoodPlanItem[]>(CAMEROONIAN_FOOD_PLAN);
  const [editFoodOpen, setEditFoodOpen] = useState(false);
  const [editingFoodDay, setEditingFoodDay] = useState<number | null>(null);
  const [editingSuhoor, setEditingSuhoor] = useState('');
  const [editingIftar, setEditingIftar] = useState('');

  const cells = useMemo(() => buildMonthCells(currentMonth), [currentMonth]);

  const selectedYear = currentMonth.getFullYear();
  const ramadanStart = getRamadanStartForYear(selectedYear);
  const ramadanEnd = addDays(ramadanStart, 29);

  const progress = Math.round((completedFasts.length / 30) * 100);

  const foodCalendar = useMemo(() => {
    return customFoodPlan.map((meal, index) => {
      const date = addDays(ramadanStart, index);

      return {
        day: index + 1,
        date,
        ...meal,
      };
    });
  }, [ramadanStart, customFoodPlan]);

  const filteredFoodDays = useMemo(() => {
    const s = query.toLowerCase();

    return foodCalendar.filter(
      item =>
        item.suhoor.toLowerCase().includes(s) ||
        item.iftar.toLowerCase().includes(s) ||
        formatDate(item.date).toLowerCase().includes(s)
    );
  }, [query, foodCalendar]);

  useEffect(() => {
    loadSaved();
  }, []);

  useEffect(() => {
    const updateToday = () => setToday(new Date());
    updateToday();

    const timer = setInterval(updateToday, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  const loadSaved = async () => {
    const fasts = await AsyncStorage.getItem(STORAGE_FASTS);
    const goals = await AsyncStorage.getItem(STORAGE_GOALS);
    const foodPlan = await AsyncStorage.getItem(STORAGE_FOOD_PLAN);

    if (fasts) setCompletedFasts(JSON.parse(fasts));
    if (goals) setCompletedGoals(JSON.parse(goals));

    if (foodPlan) {
      const parsed = JSON.parse(foodPlan);

      if (Array.isArray(parsed) && parsed.length === 30) {
        setCustomFoodPlan(parsed);
      }
    }
  };

  const toggleFast = async (date: Date) => {
    const key = dateKey(date);

    const updated = completedFasts.includes(key)
      ? completedFasts.filter(item => item !== key)
      : [...completedFasts, key];

    setCompletedFasts(updated);
    await AsyncStorage.setItem(STORAGE_FASTS, JSON.stringify(updated));
  };

  const toggleGoal = async (goal: string) => {
    const updated = completedGoals.includes(goal)
      ? completedGoals.filter(item => item !== goal)
      : [...completedGoals, goal];

    setCompletedGoals(updated);
    await AsyncStorage.setItem(STORAGE_GOALS, JSON.stringify(updated));
  };

  const changeMonth = (direction: number) => {
    setSelectedDay(null);
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const goToRamadanMonth = () => {
    setSelectedDay(null);
    setCurrentMonth(new Date(ramadanStart.getFullYear(), ramadanStart.getMonth(), 1));
  };

  const scheduleRamadanReminders = async () => {
    try {
      const permission = await Notifications.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Please allow notifications.');
        return;
      }

      const reminders = [
        ['Suhoor Reminder 🌙', 'Wake up for suhoor, drink water and make intention.', 4, 20],
        ['Fajr Prayer Reminder 🕌', 'Pray Fajr on time after suhoor.', 5, 0],
        ['Quran Reminder 📖', 'Read your daily Quran portion.', 10, 0],
        ['Charity Reminder 🎁', 'Give even a small charity today.', 13, 0],
        ['Iftar Dua Reminder 🤲', 'Make dua before breaking your fast.', 18, 10],
        ['Maghrib Reminder 🌅', 'Break your fast and pray Maghrib.', 18, 20],
        ['Taraweeh Reminder 🕌', 'Prepare for Isha and Taraweeh.', 20, 0],
        ['Last Third Reminder ✨', 'Wake for tahajjud and istighfar.', 3, 30],
      ];

      for (const [title, body, hour, minute] of reminders as any[]) {
        await Notifications.scheduleNotificationAsync({
          content: { title, body, sound: true },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
          },
        });
      }

      Alert.alert('Reminders Saved', 'Ramadan reminders have been activated.');
    } catch {
      Alert.alert('Reminder Error', 'Unable to schedule reminders.');
    }
  };

  const shareProgress = async () => {
    await Share.share({
      message: `My Ramadan Progress 🌙\n\nFasting days marked: ${completedFasts.length}\nProgress: ${progress}%\nToday’s goals: ${completedGoals.length}/${WORSHIP_GOALS.length}`,
    });
  };

  const openEditFoodDay = (day: number) => {
    const meal = customFoodPlan[day - 1];

    if (!meal) return;

    setEditingFoodDay(day);
    setEditingSuhoor(meal.suhoor);
    setEditingIftar(meal.iftar);
    setEditFoodOpen(true);
  };

  const closeEditFoodDay = () => {
    setEditFoodOpen(false);
    setEditingFoodDay(null);
    setEditingSuhoor('');
    setEditingIftar('');
  };

  const saveFoodDay = async () => {
    if (!editingFoodDay) return;

    if (!editingSuhoor.trim() || !editingIftar.trim()) {
      Alert.alert('Menu Required', 'Please write both Suhoor and Iftar meals.');
      return;
    }

    const updated = customFoodPlan.map((meal, index) =>
      index === editingFoodDay - 1
        ? {
            suhoor: editingSuhoor.trim(),
            iftar: editingIftar.trim(),
          }
        : meal
    );

    setCustomFoodPlan(updated);
    await AsyncStorage.setItem(STORAGE_FOOD_PLAN, JSON.stringify(updated));

    closeEditFoodDay();

    Alert.alert('Menu Saved', `Day ${editingFoodDay} menu has been updated.`);
  };

  const resetFoodPlan = () => {
    Alert.alert(
      'Reset Food Plan',
      'This will restore the default CHAFADIA NOOR Ramadan food plan. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setCustomFoodPlan(CAMEROONIAN_FOOD_PLAN);
            await AsyncStorage.removeItem(STORAGE_FOOD_PLAN);
            Alert.alert('Food Plan Restored', 'The default food plan has been restored.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.goldGlow} />
        <View style={styles.greenGlow} />

        <LinearGradient colors={[GREEN, EMERALD]} style={styles.hero}>
          <View style={styles.heroBadge}>
            <Moon size={14} color={GOLD} />
            <Text style={styles.heroBadgeText}>Ramadan Mode</Text>
          </View>

          <Text style={styles.heroTitle}>Ramadan Guide</Text>

          <Text style={styles.heroSubtitle}>
            A clearer Islamic calendar with Gregorian dates, Hijri dates, Ramadan marking, white days and sunnah fasts.
          </Text>

          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroButton} onPress={scheduleRamadanReminders}>
              <Bell size={17} color="#FFFFFF" />
              <Text style={styles.heroButtonText}>Reminders</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.heroButtonGold} onPress={shareProgress}>
              <Share2 size={17} color="#FFFFFF" />
              <Text style={styles.heroButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Flame size={18} color={GOLD} />
            <Text style={styles.statNumber}>{completedFasts.length}</Text>
            <Text style={styles.statLabel}>Fast Days</Text>
          </View>

          <View style={styles.statCard}>
            <Target size={18} color={GOLD} />
            <Text style={styles.statNumber}>{progress}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>

          <View style={styles.statCard}>
            <CalendarDays size={18} color={GOLD} />
            <Text style={styles.statNumber}>{selectedYear}</Text>
            <Text style={styles.statLabel}>Year</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          {[
            ['home', 'Home', Moon],
            ['calendar', 'Calendar', CalendarDays],
            ['worship', 'Worship', Landmark],
            ['food', 'Food Plan', Utensils],
            ['halal', 'Halal/Haram', ShieldCheck],
            ['duas', 'Duas', HandHeart],
            ['tracker', 'Tracker', CheckCircle],
            ['quotes', 'Quotes', Star],
          ].map(([key, label, Icon]: any) => {
            const active = tab === key;

            return (
              <TouchableOpacity
                key={key}
                style={[styles.tabPill, active && styles.tabPillActive]}
                onPress={() => setTab(key)}
              >
                <Icon size={15} color={active ? '#FFFFFF' : GREEN} />
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {tab === 'home' && (
          <>
            <View style={styles.sectionHeader}>
              <Sparkles size={18} color={GOLD} />
              <Text style={styles.sectionTitle}>Ramadan Overview</Text>
            </View>

            <LinearGradient colors={[CARD, '#F7F0DC']} style={styles.bigCard}>
              <Text style={styles.cardTitle}>Estimated Ramadan for {selectedYear}</Text>
              <Text style={styles.cardText}>Start: {formatDate(ramadanStart)}</Text>
              <Text style={styles.cardText}>End: {formatDate(ramadanEnd)}</Text>
              <Text style={styles.smallNote}>
                Dates are estimated. Final Ramadan start and Eid depend on moon sighting in your country.
              </Text>

              <TouchableOpacity style={styles.goButton} onPress={() => {
                setTab('calendar');
                goToRamadanMonth();
              }}>
                <CalendarDays size={17} color="#FFFFFF" />
                <Text style={styles.goButtonText}>Open Ramadan Calendar</Text>
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.quickGrid}>
              <MiniCard icon={<Moon size={20} color={GOLD} />} title="Ramadan" text="Dark green days." />
              <MiniCard icon={<Star size={20} color={GOLD} />} title="White Days" text="13, 14, 15 Hijri." />
              <MiniCard icon={<Sun size={20} color={GOLD} />} title="Sunnah Fast" text="Monday & Thursday." />
              <MiniCard icon={<Gift size={20} color={GOLD} />} title="Charity" text="Give something daily." />
            </View>
          </>
        )}

        {tab === 'calendar' && (
          <>
            <View style={styles.sectionHeader}>
              <CalendarDays size={18} color={GOLD} />
              <Text style={styles.sectionTitle}>Professional Islamic Calendar</Text>
            </View>


            <View style={styles.calendarHeader}>
              <TouchableOpacity style={styles.monthBtn} onPress={() => changeMonth(-1)}>
                <ChevronLeft size={22} color={GREEN} />
              </TouchableOpacity>

              <View style={styles.monthCenter}>
                <Text style={styles.calendarTitle}>{monthTitle(currentMonth)}</Text>
                <Text style={styles.calendarSub}>
                  Ramadan: {formatDate(ramadanStart)} - {formatDate(ramadanEnd)}
                </Text>
              </View>

              <TouchableOpacity style={styles.monthBtn} onPress={() => changeMonth(1)}>
                <ChevronRight size={22} color={GREEN} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.ramadanJumpButton} onPress={goToRamadanMonth}>
              <Moon size={16} color="#FFFFFF" />
              <Text style={styles.ramadanJumpText}>Jump to Ramadan {selectedYear}</Text>
            </TouchableOpacity>

            <View style={styles.legendGrid}>
              <Legend color={GREEN} text="Ramadan" />
              <Legend color={GOLD} text="White Days" />
              <Legend color="#CDEBDD" text="Mon/Thu Sunnah" />
              <Legend color="#1D4ED8" text="Today" />
              <Legend color={ROSE} text="Fasted" />
            </View>

            <View style={styles.weekRow}>
              {WEEK_DAYS.map(day => (
                <View key={day} style={styles.weekCell}>
                  <Text style={styles.weekText}>{day}</Text>
                </View>
              ))}
            </View>

            <View style={styles.calendarCard}>
              {cells.map(cell => {
                const fasted = completedFasts.includes(cell.key);
                const selected = selectedDay?.key === cell.key;
                const isTodayCell = sameDate(cell.date, today);

                return (
                  <TouchableOpacity
                    key={cell.key}
                    style={[
                      styles.dateCell,
                      !cell.isCurrentMonth && styles.dateCellDim,
                      cell.isMondayThursday && !cell.isRamadan && styles.sunnahCell,
                      cell.isWhiteDay && !cell.isRamadan && styles.whiteDayCell,
                      cell.isRamadan && styles.ramadanCell,
                      isTodayCell && styles.todayCell,
                      fasted && styles.fastedCell,
                      selected && styles.selectedCell,
                    ]}
                    onPress={() => setSelectedDay(cell)}
                  >
                    <Text
                      style={[
                        styles.gregText,
                        cell.isRamadan && styles.lightText,
                        isTodayCell && styles.todayText,
                        !cell.isCurrentMonth && styles.dimText,
                      ]}
                    >
                      {cell.gregorianDay}
                    </Text>

                    <Text
                      style={[
                        styles.hijriText,
                        cell.isRamadan && styles.lightText,
                        isTodayCell && styles.todayText,
                        !cell.isCurrentMonth && styles.dimText,
                      ]}
                      numberOfLines={1}
                    >
                      {cell.hijriDay} {cell.hijriMonth.slice(0, 3)}
                    </Text>

                    <View style={styles.markerRow}>
                      {isTodayCell && <View style={styles.dotToday} />}
                      {cell.isRamadan && <View style={styles.dotGold} />}
                      {cell.isWhiteDay && <View style={styles.dotWhite} />}
                      {cell.isMondayThursday && <View style={styles.dotMint} />}
                      {fasted && <View style={styles.dotRose} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedDay && (
              <LinearGradient colors={[CARD, '#F7F0DC']} style={styles.selectedCard}>
                <Text style={styles.selectedTitle}>{formatDate(selectedDay.date)}</Text>

                <Text style={styles.selectedLine}>
                  Hijri: {selectedDay.hijriDay} {selectedDay.hijriMonth}
                </Text>

                {selectedDay.isRamadan && (
                  <Text style={styles.selectedSpecial}>🌙 Ramadan Day</Text>
                )}

                {selectedDay.isRamadanStart && (
                  <Text style={styles.selectedSpecial}>✨ Estimated Ramadan Start</Text>
                )}

                {selectedDay.isRamadanEnd && (
                  <Text style={styles.selectedSpecial}>🌙 Estimated Ramadan End</Text>
                )}

                {selectedDay.isWhiteDay && (
                  <Text style={styles.selectedSpecial}>⭐ White Day Fast: 13th, 14th or 15th Hijri</Text>
                )}

                {selectedDay.isMondayThursday && (
                  <Text style={styles.selectedSpecial}>☀️ Sunnah Fast: Monday/Thursday</Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.markFastButton,
                    completedFasts.includes(selectedDay.key) && styles.markFastButtonDone,
                  ]}
                  onPress={() => toggleFast(selectedDay.date)}
                >
                  <CheckCircle size={17} color="#FFFFFF" />
                  <Text style={styles.markFastText}>
                    {completedFasts.includes(selectedDay.key)
                      ? 'Remove Fasted Mark'
                      : 'Mark This Day as Fasted'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </>
        )}

        {tab === 'worship' && (
          <>
            <View style={styles.sectionHeader}>
              <Landmark size={18} color={GOLD} />
              <Text style={styles.sectionTitle}>Ramadan Worship Guide</Text>
            </View>

            {WORSHIP_SECTIONS.map(([title, text]) => (
              <LinearGradient key={title} colors={[CARD, '#F7F0DC']} style={styles.infoCard}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardText}>{text}</Text>
              </LinearGradient>
            ))}
          </>
        )}

        {tab === 'food' && (
          <>
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

            <View style={styles.sectionHeader}>
              <Soup size={18} color={GOLD} />
              <Text style={styles.sectionTitle}>30-Day Cameroonian Food Plan</Text>
            </View>

            <View style={styles.foodTableIntroClean}>
              <Text style={styles.foodTableTitle}>Ramadan Meals: Day 1 to Day 30</Text>
              <Text style={styles.foodTableSub}>
                Use the default Cameroonian meal ideas or edit each day with your own preferred Suhoor and Iftar menu.
              </Text>

              <TouchableOpacity style={styles.resetFoodButton} onPress={resetFoodPlan}>
                <RotateCcw size={15} color={GREEN} />
                <Text style={styles.resetFoodText}>Reset to Default Food Plan</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.foodTableWideWrap}>
              <View style={styles.foodTableOuterBorder}>
                <LinearGradient colors={[GREEN, EMERALD]} style={styles.foodTableHeaderGradient}>
                  <Text style={[styles.foodTableHeaderText, styles.foodDayCol]}>Day</Text>
                  <Text style={[styles.foodTableHeaderText, styles.foodMealCol]}>Suhoor</Text>
                  <Text style={[styles.foodTableHeaderText, styles.foodMealColLast]}>Iftar</Text>
                </LinearGradient>

                {filteredFoodDays.map((day, index) => (
                  <View
                    key={day.day}
                    style={[
                      styles.foodTableRow,
                      index % 2 === 0 ? styles.foodTableRowEven : styles.foodTableRowOdd,
                    ]}
                  >
                    <View style={styles.foodDayCol}>
                      <Text style={styles.foodDayText}>Day</Text>
                      <Text style={styles.foodDayNumber}>{day.day}</Text>

                      <TouchableOpacity
                        style={styles.editFoodMiniButton}
                        onPress={() => openEditFoodDay(day.day)}
                      >
                        <Edit3 size={10} color="#FFFFFF" />
                        <Text style={styles.editFoodMiniText}>Edit</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.foodMealCol}>
                      <Text style={styles.foodMealText}>{day.suhoor}</Text>
                    </View>

                    <View style={styles.foodMealColLast}>
                      <Text style={styles.foodMealText}>{day.iftar}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {tab === 'halal' && (
          <>
            <View style={styles.sectionHeader}>
              <ShieldCheck size={18} color={GOLD} />
              <Text style={styles.sectionTitle}>Good Acts to Increase</Text>
            </View>

            {HALAL_ACTS.map(item => (
              <View key={item} style={styles.checkRow}>
                <CheckCircle size={19} color={GREEN} />
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}

            <View style={styles.sectionHeader}>
              <ShieldAlert size={18} color={ROSE} />
              <Text style={styles.sectionTitle}>Things to Avoid</Text>
            </View>

            {AVOID_ACTS.map(item => (
              <View key={item} style={styles.avoidRow}>
                <ShieldAlert size={19} color={ROSE} />
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </>
        )}

        {tab === 'duas' && (
          <>
            <View style={styles.sectionHeader}>
              <HandHeart size={18} color={GOLD} />
              <Text style={styles.sectionTitle}>Ramadan Duas</Text>
            </View>

            {RAMADAN_DUAS.map(dua => (
              <LinearGradient key={dua.title} colors={[CARD, '#F7F0DC']} style={styles.duaCard}>
                <Text style={styles.cardTitle}>{dua.title}</Text>
                <Text style={styles.arabic}>{dua.arabic}</Text>
                <Text style={styles.cardText}>{dua.translation}</Text>
              </LinearGradient>
            ))}
          </>
        )}

        {tab === 'tracker' && (
          <>
            <View style={styles.sectionHeader}>
              <CheckCircle size={18} color={GOLD} />
              <Text style={styles.sectionTitle}>Fasting Tracker</Text>
            </View>

            <LinearGradient colors={[CARD, '#F7F0DC']} style={styles.bigCard}>
              <Text style={styles.cardTitle}>Marked fasting days: {completedFasts.length}</Text>

              <View style={styles.progressOuter}>
                <View style={[styles.progressInner, { width: `${Math.min(progress, 100)}%` }]} />
              </View>

              <Text style={styles.cardText}>Progress toward 30 days: {progress}%</Text>
            </LinearGradient>

            <View style={styles.sectionHeader}>
              <Heart size={18} color={GOLD} />
              <Text style={styles.sectionTitle}>Today’s Worship Tracker</Text>
            </View>

            {WORSHIP_GOALS.map(goal => {
              const done = completedGoals.includes(goal);

              return (
                <TouchableOpacity key={goal} style={styles.goalRow} onPress={() => toggleGoal(goal)}>
                  <CheckCircle size={23} color={done ? GREEN : '#C9BFAE'} />
                  <Text style={[styles.goalText, done && styles.goalDone]}>{goal}</Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {tab === 'quotes' && (
          <>
            <View style={styles.sectionHeader}>
              <Star size={18} color={GOLD} />
              <Text style={styles.sectionTitle}>Ramadan Quotes</Text>
            </View>

            {RAMADAN_QUOTES.map((quote, index) => (
              <LinearGradient key={quote} colors={[CARD, '#F7F0DC']} style={styles.quoteCard}>
                <Text style={styles.quoteNumber}>{index + 1}</Text>
                <Text style={styles.quoteText}>“{quote}”</Text>
              </LinearGradient>
            ))}
          </>
        )}
      </ScrollView>

      <Modal
        visible={editFoodOpen}
        transparent
        animationType="fade"
        onRequestClose={closeEditFoodDay}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalCard}>
            <View style={styles.editModalHeader}>
              <View>
                <Text style={styles.editModalTitle}>Edit Food Plan</Text>
                <Text style={styles.editModalSub}>
                  {editingFoodDay ? `Ramadan Day ${editingFoodDay}` : 'Custom Menu'}
                </Text>
              </View>

              <TouchableOpacity style={styles.editModalClose} onPress={closeEditFoodDay}>
                <X size={20} color={GREEN} />
              </TouchableOpacity>
            </View>

            <Text style={styles.editLabel}>Suhoor</Text>
            <TextInput
              style={styles.editMealInput}
              multiline
              placeholder="Write your Suhoor meal, salad/fruit and drink..."
              placeholderTextColor="#8A8172"
              value={editingSuhoor}
              onChangeText={setEditingSuhoor}
            />

            <Text style={styles.editLabel}>Iftar</Text>
            <TextInput
              style={styles.editMealInput}
              multiline
              placeholder="Write your Iftar starter, main meal and drink..."
              placeholderTextColor="#8A8172"
              value={editingIftar}
              onChangeText={setEditingIftar}
            />

            <View style={styles.editModalActions}>
              <TouchableOpacity style={styles.cancelEditButton} onPress={closeEditFoodDay}>
                <Text style={styles.cancelEditText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveEditButton} onPress={saveFoodDay}>
                <Save size={16} color="#FFFFFF" />
                <Text style={styles.saveEditText}>Save Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function MiniCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.miniCard}>
      {icon}
      <Text style={styles.miniTitle}>{title}</Text>
      <Text style={styles.miniText}>{text}</Text>
    </View>
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: CREAM },
  container: { flex: 1 },
  content: { paddingHorizontal: 15, paddingTop: 18, paddingBottom: 40 },

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
    top: 370,
    left: -100,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: GREEN,
    opacity: 0.08,
  },

  hero: {
    borderRadius: 30,
    paddingVertical: 26,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 14,
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
  heroTitle: { color: '#FFFFFF', fontSize: 30, fontWeight: '900' },

  heroSubtitle: {
    color: '#E6FFF4',
    fontSize: 12.5,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 9,
    fontWeight: '700',
  },

  heroActions: { flexDirection: 'row', marginTop: 15, gap: 10 },

  heroButton: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroButtonGold: {
    backgroundColor: GOLD,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroButtonText: { color: '#FFFFFF', fontWeight: '900', marginLeft: 7, fontSize: 12 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },

  statCard: {
    width: '32%',
    backgroundColor: CARD,
    borderRadius: 20,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  statNumber: { color: GREEN, fontSize: 15, fontWeight: '900', marginTop: 5 },
  statLabel: { color: '#746A5D', fontSize: 10.5, fontWeight: '800', marginTop: 3 },

  tabScroll: { marginBottom: 16 },

  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginRight: 8,
  },

  tabPillActive: { backgroundColor: GREEN, borderColor: GREEN },
  tabText: { color: GREEN, fontSize: 11, fontWeight: '900', marginLeft: 6 },
  tabTextActive: { color: '#FFFFFF' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },

  sectionTitle: { color: GREEN, fontSize: 16, fontWeight: '900', marginLeft: 7 },

  bigCard: {
    borderRadius: 27,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 14,
  },

  infoCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 12,
  },

  cardTitle: { color: GREEN, fontSize: 18, fontWeight: '900' },

  cardText: {
    color: TEXT,
    fontSize: 12.5,
    lineHeight: 20,
    fontWeight: '700',
    marginTop: 7,
  },

  smallNote: {
    color: '#8A6A22',
    fontSize: 11.5,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 9,
  },

  goButton: {
    backgroundColor: GREEN,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },

  goButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', marginLeft: 7 },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  miniCard: {
    width: '48%',
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 12,
  },

  miniTitle: { color: GREEN, fontSize: 14, fontWeight: '900', marginTop: 8 },

  miniText: {
    color: '#6B6257',
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 4,
  },

  calendarInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: SOFT_GOLD,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },

  calendarInfoText: {
    flex: 1,
    color: '#7A5815',
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '800',
    marginLeft: 8,
  },

  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  monthCenter: {
    flex: 1,
    paddingHorizontal: 8,
  },

  monthBtn: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: MINT,
    justifyContent: 'center',
    alignItems: 'center',
  },

  calendarTitle: {
    color: GREEN,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },

  calendarSub: {
    color: '#8A6A22',
    fontSize: 10.5,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 3,
  },

  ramadanJumpButton: {
    backgroundColor: GREEN,
    borderRadius: 18,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },

  ramadanJumpText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 7,
  },

  legendGrid: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },

  legendItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  legendDot: {
    width: 13,
    height: 13,
    borderRadius: 999,
    marginRight: 7,
  },

  legendText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '900',
  },

  weekRow: {
    flexDirection: 'row',
    backgroundColor: GREEN,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingVertical: 9,
  },

  weekCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
  },

  weekText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },

  calendarCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#E5D9C3',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
  },

  dateCell: {
    width: `${100 / 7}%`,
    minHeight: 72,
    backgroundColor: CARD,
    borderWidth: 0.45,
    borderColor: '#E5D9C3',
    padding: 5,
  },

  dateCellDim: {
    backgroundColor: '#F1EEE6',
  },

  ramadanCell: {
    backgroundColor: GREEN,
  },

  whiteDayCell: {
    backgroundColor: '#FFF7D9',
  },

  sunnahCell: {
    backgroundColor: '#EAF5EF',
  },

  todayCell: {
    backgroundColor: '#1D4ED8',
    borderColor: '#F6D365',
    borderWidth: 2.5,
  },

  fastedCell: {
    borderColor: ROSE,
    borderWidth: 2,
  },

  selectedCell: {
    borderColor: GOLD,
    borderWidth: 2,
  },

  gregText: {
    color: GREEN,
    fontSize: 17,
    fontWeight: '900',
  },

  hijriText: {
    color: '#746A5D',
    fontSize: 8.5,
    fontWeight: '800',
    marginTop: 1,
  },

  dimText: {
    color: '#A39A8D',
  },

  lightText: {
    color: '#FFFFFF',
  },

  todayText: {
    color: '#FFFFFF',
  },

  markerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },

  dotGold: {
    width: 6,
    height: 6,
    borderRadius: 10,
    backgroundColor: GOLD,
    marginRight: 3,
    marginBottom: 3,
  },

  dotWhite: {
    width: 6,
    height: 6,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: GOLD,
    marginRight: 3,
    marginBottom: 3,
  },

  dotMint: {
    width: 6,
    height: 6,
    borderRadius: 10,
    backgroundColor: EMERALD,
    marginRight: 3,
    marginBottom: 3,
  },

  dotToday: {
    width: 6,
    height: 6,
    borderRadius: 10,
    backgroundColor: '#F6D365',
    marginRight: 3,
    marginBottom: 3,
  },

  dotRose: {
    width: 6,
    height: 6,
    borderRadius: 10,
    backgroundColor: ROSE,
    marginRight: 3,
    marginBottom: 3,
  },

  selectedCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 14,
  },

  selectedTitle: {
    color: GREEN,
    fontSize: 18,
    fontWeight: '900',
  },

  selectedLine: {
    color: TEXT,
    fontSize: 12.5,
    fontWeight: '800',
    marginTop: 7,
  },

  selectedSpecial: {
    color: '#8A6A22',
    fontSize: 12.2,
    fontWeight: '900',
    marginTop: 7,
  },

  markFastButton: {
    backgroundColor: GREEN,
    borderRadius: 17,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 14,
  },

  markFastButtonDone: {
    backgroundColor: ROSE,
  },

  markFastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 7,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 12,
  },

  searchInput: { flex: 1, color: GREEN, fontWeight: '800', marginLeft: 8 },

  foodCard: {
    borderRadius: 24,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 12,
  },

  foodTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  foodName: { color: GREEN, fontSize: 16, fontWeight: '900', flex: 1 },

  foodBadge: {
    backgroundColor: SOFT_GOLD,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 8,
  },

  foodBadgeText: { color: '#8B5E16', fontSize: 10, fontWeight: '900' },

  foodTableIntroClean: {
    marginBottom: 10,
    paddingHorizontal: 2,
  },

  foodTableTitle: {
    color: GREEN,
    fontSize: 18,
    fontWeight: '900',
  },

  foodTableSub: {
    color: '#7A5815',
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '800',
    marginTop: 4,
  },

  foodTableWideWrap: {
    marginHorizontal: -15,
    marginBottom: 18,
  },

  foodTableOuterBorder: {
    overflow: 'hidden',
    backgroundColor: CARD,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D8C69C',
  },

  foodTableHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
  },

  foodTableRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: '#E5D9C3',
  },

  foodTableRowEven: {
    backgroundColor: '#FFFDF8',
  },

  foodTableRowOdd: {
    backgroundColor: '#F7F0DC',
  },

  foodTableHeaderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    paddingVertical: 13,
    paddingHorizontal: 6,
    letterSpacing: 0.3,
  },

  foodDayCol: {
    width: 58,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#D8C69C',
  },

  foodMealCol: {
    flex: 1,
    minWidth: 138,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#D8C69C',
  },

  foodMealColLast: {
    flex: 1,
    minWidth: 138,
    justifyContent: 'center',
  },

  foodDayText: {
    color: '#8A6A22',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  foodDayNumber: {
    color: GREEN,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 2,
  },

  foodMealText: {
    color: TEXT,
    fontSize: 10.6,
    lineHeight: 16.5,
    fontWeight: '800',
    paddingVertical: 12,
    paddingHorizontal: 7,
  },

  resetFoodButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SOFT_GOLD,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 13,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E1CA8F',
  },

  resetFoodText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  editFoodMiniButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginTop: 6,
  },

  editFoodMiniText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    marginLeft: 3,
  },

  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 31, 24, 0.72)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  editModalCard: {
    backgroundColor: CARD,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },

  editModalTitle: {
    color: GREEN,
    fontSize: 20,
    fontWeight: '900',
  },

  editModalSub: {
    color: '#8A6A22',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },

  editModalClose: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editLabel: {
    color: GREEN,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 7,
    marginTop: 8,
  },

  editMealInput: {
    minHeight: 112,
    backgroundColor: '#F7F0DC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: TEXT,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '700',
    textAlignVertical: 'top',
  },

  editModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16,
  },

  cancelEditButton: {
    flex: 1,
    borderRadius: 17,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFE7D8',
  },

  cancelEditText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '900',
  },

  saveEditButton: {
    flex: 1,
    borderRadius: 17,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    flexDirection: 'row',
  },

  saveEditText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 7,
  },

  checkRow: {
    backgroundColor: CARD,
    borderRadius: 17,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  avoidRow: {
    backgroundColor: '#FFF3F0',
    borderRadius: 17,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1C4BC',
  },

  checkText: {
    color: TEXT,
    fontSize: 12.5,
    fontWeight: '800',
    marginLeft: 9,
    flex: 1,
    lineHeight: 18,
  },

  duaCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 12,
  },

  arabic: {
    color: GREEN,
    fontSize: 24,
    lineHeight: 42,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontWeight: '900',
    marginTop: 12,
  },

  progressOuter: {
    height: 13,
    backgroundColor: '#E8DFC8',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 14,
  },

  progressInner: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 999,
  },

  goalRow: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  goalText: { color: GREEN, fontSize: 13, fontWeight: '900', marginLeft: 10 },

  goalDone: {
    textDecorationLine: 'line-through',
    color: '#8A8172',
  },

  quoteCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 12,
  },

  quoteNumber: {
    color: GOLD,
    fontSize: 16,
    fontWeight: '900',
  },

  quoteText: {
    color: GREEN,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 23,
    marginTop: 8,
  },
});