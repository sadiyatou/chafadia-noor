import React, { useEffect, useMemo, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  Switch,
  Alert,
  Image,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

import { logoutUser, getCurrentUser, getMe } from '../../api/auth';
import { registerPushToken } from '../../utils/registerPushToken';

import {
  MessageCircle,
  BookOpen,
  Bell,
  Heart,
  Moon,
  Users,
  Brain,
  MapPin,
  Calendar,
  Download,
  BookText,
  Languages,
  Newspaper,
  GraduationCap,
  CircleDot,
  Sparkles,
  Star,
  X,
  Globe2,
  Flag,
  Info,
  Send,
  Settings,
  ShieldCheck,
  HelpCircle,
  Sun,
  Eye,
  Volume2,
  Lock,
  Wifi,
  Database,
  ChevronRight,
  Menu,
  Grid3X3,
  ChevronDown,
  UserPlus,
  UserCog,
  Trash2,
  Edit3,
  Ban,
  AlertTriangle,
  CheckCircle,
  Crown,
  Shield,
  Briefcase,
  Camera,
  Image as ImageIcon,
  MoreVertical,
} from 'lucide-react-native';

const STORAGE_LANGUAGE = 'CHAFADIA_GLOBAL_LANGUAGE';
const STORAGE_COUNTRY = 'CHAFADIA_GLOBAL_COUNTRY';
const STORAGE_THEME = 'CHAFADIA_GLOBAL_THEME';
const STORAGE_ADMIN_PROFILE = 'CHAFADIA_ADMIN_PROFILE_V1';
const STORAGE_ADMIN_STATE = 'CHAFADIA_ADMIN_STATE_V1';

const cards = [
  {
    title: 'Prayer Times\n& Qibla',
    icon: Bell,
    route: '/prayertimes-qibla',
    color: '#047857',
    softColor: '#DDF7EA',
  },
  {
    title: 'Quran\n& Tafsir',
    icon: BookOpen,
    route: '/quran',
    color: '#B7791F',
    softColor: '#FFF1C7',
  },
  {
    title: 'AI Islamic\nAssistant',
    icon: Brain,
    route: '/ai',
    color: '#2563EB',
    softColor: '#DBEAFE',
  },
  {
    title: 'Hadith',
    icon: BookText,
    route: '/hadith',
    color: '#4F46E5',
    softColor: '#EDE9FE',
  },
  {
    title: 'Arabic\nLearning',
    icon: Languages,
    route: '/arabic',
    color: '#B45309',
    softColor: '#FFEDD5',
  },
  {
    title: 'Tasbeeh\nCounter',
    icon: CircleDot,
    route: '/tasbeeh',
    color: '#059669',
    softColor: '#D1FAE5',
  },
  {
    title: 'Azkar\n& Dua',
    icon: Heart,
    route: '/dua',
    color: '#BE123C',
    softColor: '#FFE4E6',
  },
  {
    title: 'Ramadan\nMode',
    icon: Moon,
    route: '/ramadan',
    color: '#334155',
    softColor: '#E2E8F0',
  },
  {
    title: 'Mosque\nFinder',
    icon: MapPin,
    route: '/mosques',
    color: '#0F766E',
    softColor: '#CCFBF1',
  },
  {
    title: 'Islamic | Banso\n| Gregorian\nCalendar',
    icon: Calendar,
    route: '/calendar',
    color: '#A16207',
    softColor: '#FEF3C7',
  },
  {
    title: 'Community\nFeed',
    icon: Users,
    route: '/community',
    color: '#0369A1',
    softColor: '#E0F2FE',
  },
  {
    title: 'Communication',
    icon: MessageCircle,
    route: '/messages',
    color: '#475569',
    softColor: '#F1F5F9',
  },
  {
    title: 'Islamic\nArticles',
    icon: Newspaper,
    route: '/articles',
    color: '#CA8A04',
    softColor: '#FEF9C3',
  },
  {
    title: 'Islamic\nCourses',
    icon: GraduationCap,
    route: '/courses',
    color: '#0D9488',
    softColor: '#CCFBF1',
  },
  {
    title: 'Offline\nDownloads',
    icon: Download,
    route: '/downloads',
    color: '#1D4ED8',
    softColor: '#DBEAFE',
  },
  {
    title: 'Islamic\nEssentials',
    icon: Users,
    route: '/islam',
    color: '#9F1239',
    softColor: '#FFE4E6',
  },
];

const WORLD_LANGUAGES = [
  { name: 'English', native: 'English', flag: '🇬🇧' },
  { name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { name: 'French', native: 'Français', flag: '🇫🇷' },
  { name: 'Lamso', native: 'Lamso', flag: '🇨🇲' },
  { name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  { name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  { name: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
  { name: 'Urdu', native: 'اردو', flag: '🇵🇰' },
  { name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { name: 'Swahili', native: 'Kiswahili', flag: '🇹🇿' },
  { name: 'Hausa', native: 'Hausa', flag: '🇳🇬' },
  { name: 'Yoruba', native: 'Yorùbá', flag: '🇳🇬' },
  { name: 'Fulfulde', native: 'Fulfulde', flag: '🇨🇲' },
];

const COUNTRIES = [
  { name: 'Cameroon', flag: '🇨🇲' },
  { name: 'Nigeria', flag: '🇳🇬' },
  { name: 'Ghana', flag: '🇬🇭' },
  { name: 'Senegal', flag: '🇸🇳' },
  { name: 'Egypt', flag: '🇪🇬' },
  { name: 'Morocco', flag: '🇲🇦' },
  { name: 'Algeria', flag: '🇩🇿' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'United Arab Emirates', flag: '🇦🇪' },
  { name: 'Qatar', flag: '🇶🇦' },
  { name: 'Turkey', flag: '🇹🇷' },
  { name: 'Malaysia', flag: '🇲🇾' },
  { name: 'Indonesia', flag: '🇮🇩' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Germany', flag: '🇩🇪' },
];

const LAMSO_DAYS = [
  'Lah',
  'Vsen',
  'Vtar',
  'Vki',
  'Vtan',
  'Vfen',
  'Sari',
];

const LAMSO_MONTHS = [
  'Nduŋmbi',
  'Nduŋba',
  'Nduŋtar',
  'Nduŋki',
  'Nduŋtan',
  'Nduŋfen',
  'Nduŋsamba',
  'Nduŋwum',
  'Nduŋkom',
  'Nduŋgham',
  'Nduŋvee',
  'Nduŋbaa',
];


const DEFAULT_ADMIN_PROFILE = {
  displayName: 'Sadiyatou Chafiou',
  username: '@sadiyatou.chafadia',
  publicBio:
    'Founder of CHAFADIA NOOR, building a sincere Islamic space for knowledge, community, remembrance and service.',
  publicEmail: 'kikasadiyatou@gmail.com',
  publicLocation: 'Cameroon',
  avatar: '',
  country: 'Cameroon',
  role: 'Main Admin',
  communityAccount: 'Chafadia Noor Community',
  channelName: 'Chafadia Noor Official',
  visibleToPublic: true,
  suggestedFirst: true,
  followers: 12800,
  channels: 1,
  communities: 1,
};

const DEFAULT_TOP_SUGGESTIONS = [
  { id: 'sug-1', name: 'Aisha Ibrahim', handle: '@aisha.learns', reason: 'Active Quran learner', followed: false },
  { id: 'sug-2', name: 'Maryam Bello', handle: '@maryam.community', reason: 'Helpful community member', followed: false },
  { id: 'sug-3', name: 'Abdul Rahman', handle: '@abdul.reminders', reason: 'Posts beneficial reminders', followed: false },
];

const DEFAULT_FOLLOW_REQUESTS = [
  { id: 'req-1', name: 'Fatima Noor', handle: '@fatimanoor', status: 'pending' },
  { id: 'req-2', name: 'Hassan Musa', handle: '@hassan.musa', status: 'pending' },
];

type AdminAccessKey =
  | 'profile'
  | 'content'
  | 'reports'
  | 'admins'
  | 'settings';

type AdminAccess = Record<AdminAccessKey, boolean>;

type AdminUser = {
  id: string;
  name: string;
  handle: string;
  role: string;
  active: boolean;
  access: AdminAccess;
};

const DEFAULT_ADMIN_ACCESS: AdminAccess = {
  profile: false,
  content: false,
  reports: false,
  admins: false,
  settings: false,
};

const normalizeAdmin = (admin: Partial<AdminUser>): AdminUser => ({
  id: admin.id || `admin-${Date.now()}`,
  name: admin.name || '',
  handle: admin.handle || '',
  role: admin.role || 'Admin',
  active: typeof admin.active === 'boolean' ? admin.active : true,
  access: {
    ...DEFAULT_ADMIN_ACCESS,
    ...(admin.access || {}),
  },
});

const DEFAULT_ADMINS: AdminUser[] = [
  { id: 'admin-main', name: 'Sadiyatou Chafiou', handle: '@sadiyatou.chafadia', role: 'Main Admin', active: true, access: { profile: true, content: true, reports: true, admins: true, settings: true } },
  { id: 'admin-2', name: 'Aisha Moderator', handle: '@aisha.mod', role: 'Content Admin', active: true, access: { profile: false, content: true, reports: true, admins: false, settings: false } },
];

const DEFAULT_REPORTS = [
  { id: 'rep-1', account: 'Disturbing Account', handle: '@bad.account', reason: 'Harassment in community comments', status: 'open' },
  { id: 'rep-2', account: 'Spam Sender', handle: '@spam.sender', reason: 'Repeated unwanted messages', status: 'open' },
];

const DEFAULT_ADMIN_TASKS = [
  { id: 'task-1', title: 'Review new community posts for respectful language', assignedTo: '@aisha.mod', status: 'open', priority: 'High', due: 'Today' },
  { id: 'task-2', title: 'Check reported accounts and update moderation status', assignedTo: '@sadiyatou.chafadia', status: 'open', priority: 'High', due: 'Tomorrow' },
  { id: 'task-3', title: 'Prepare weekly beneficial channel reminders', assignedTo: '@aisha.mod', status: 'done', priority: 'Medium', due: 'This week' },
];

const DEFAULT_ADMIN_CONTROLS = {
  ownerOnlyDashboard: true,
  requireOwnerApproval: true,
  allowAdminProfileEdit: false,
  allowContentModeration: true,
  allowReportModeration: true,
  allowChannelManagement: true,
  allowCommunityManagement: true,
  publicProfileVisible: true,
  notifyOnReports: true,
  notifyOnFollowInvites: true,
  allowTaskAssignment: true,
  allowAdminRemoval: true,
  allowFeatureLimits: true,
  requireReportReason: true,
  archiveResolvedReports: true,
  protectMainAdmin: true,
};

const TRANSLATIONS: any = {
  English: {
    platform: 'Islamic Lifestyle Platform',
    title: 'CHAFADIA NOOR',
    subtitle: 'Guided by Faith • Inspired by Love',
    description:
      'Your elegant Islamic companion for worship, learning, remembrance and service to the Ummah.',
    explore: 'Explore Features',
    exploreSub: 'Everything you need in one beautiful place',
    tools: '16 Tools',
    before: '🌙 Before you continue...',
    dua: 'Please spare 2 minutes for the sake of Allah 🤍',
    duaTap: 'Tap here to make a dua for a very special person 🤍',
    light: 'Light',
    dark: 'Dark',
    footer: 'Built with ❤️ for the Ummah',
  },
  Arabic: {
    platform: 'منصة إسلامية للحياة اليومية',
    title: 'شفادية نور',
    subtitle: 'بهداية الإيمان • وبإلهام الحب',
    description:
      'رفيقك الإسلامي للعبادة، العلم، الذكر وخدمة الأمة.',
    explore: 'استكشف الميزات',
    exploreSub: 'كل ما تحتاجه في مكان جميل واحد',
    tools: '١٦ أداة',
    before: '🌙 قبل أن تواصل...',
    dua: 'خصص دقيقتين لوجه الله 🤍',
    duaTap: 'اضغط هنا للدعاء لشخص عزيز جدًا 🤍',
    light: 'فاتح',
    dark: 'داكن',
    footer: 'صنع بحب للأمة',
  },
  French: {
    platform: 'Plateforme Islamique',
    title: 'CHAFADIA NOOR',
    subtitle: 'Guidé par la foi • Inspiré par l’amour',
    description:
      'Votre compagnon islamique pour l’adoration, la connaissance, le rappel et le service.',
    explore: 'Explorer',
    exploreSub: 'Tout ce dont vous avez besoin dans un bel espace',
    tools: '16 outils',
    before: '🌙 Avant de continuer...',
    dua: 'Prenez 2 minutes pour Allah 🤍',
    duaTap: 'Appuyez ici pour faire une dua spéciale 🤍',
    light: 'Clair',
    dark: 'Sombre',
    footer: 'Créé avec ❤️ pour la Ummah',
  },
  Lamso: {
    platform: 'Islamic Lifestyle Platform',
    title: 'CHAFADIA NOOR',
    subtitle: 'Guided by Faith • Inspired by Love',
    description:
      'A beautiful Islamic companion for worship, learning and remembrance.',
    explore: 'Explore Features',
    exploreSub: 'Everything you need in one beautiful place',
    tools: '16 Tools',
    before: '🌙 Before you continue...',
    dua: 'Please spare 2 minutes for the sake of Allah 🤍',
    duaTap: 'Tap here to make a dua for a very special person 🤍',
    light: 'Light',
    dark: 'Dark',
    footer: 'Built with ❤️ for the Ummah',
  },
};

export default function Dashboard() {
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedCountry, setSelectedCountry] = useState('Cameroon');

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('Overview');
  const [adminProfile, setAdminProfile] = useState(DEFAULT_ADMIN_PROFILE);
  const [topSuggestions, setTopSuggestions] = useState(DEFAULT_TOP_SUGGESTIONS);
  const [followRequests, setFollowRequests] = useState(DEFAULT_FOLLOW_REQUESTS);
  const [admins, setAdmins] = useState<AdminUser[]>(DEFAULT_ADMINS);
  const [reports, setReports] = useState(DEFAULT_REPORTS);
  const [adminTasks, setAdminTasks] = useState(DEFAULT_ADMIN_TASKS);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminHandle, setNewAdminHandle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('Today');
  const [newTaskAdminHandle, setNewTaskAdminHandle] = useState(DEFAULT_ADMINS[1]?.handle || DEFAULT_ADMINS[0].handle);
  const [newChannelName, setNewChannelName] = useState('');
  const [newCommunityName, setNewCommunityName] = useState('');
  const [adminSettingsOpen, setAdminSettingsOpen] = useState(false);
  const [adminToolsMenuVisible, setAdminToolsMenuVisible] = useState(false);
  const [adminProfileImageOpen, setAdminProfileImageOpen] = useState(false);
  const [adminControls, setAdminControls] = useState(DEFAULT_ADMIN_CONTROLS);


  const selectedCountryData =
    COUNTRIES.find(item => item.name === selectedCountry) ||
    COUNTRIES[0];

  const selectedLanguageData =
    WORLD_LANGUAGES.find(item => item.name === selectedLanguage) ||
    WORLD_LANGUAGES[0];

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.English;

  useEffect(() => {
    const loadUser = async () => {
      const cached = await getCurrentUser();
      if (cached) setLoggedInUser(cached);

      const fresh = await getMe();
      if (fresh.success && fresh.user) setLoggedInUser(fresh.user);
      if (fresh.success) registerPushToken();
    };

    const loadSettings = async () => {
      const language = await AsyncStorage.getItem(STORAGE_LANGUAGE);
      const country = await AsyncStorage.getItem(STORAGE_COUNTRY);
      const theme = await AsyncStorage.getItem(STORAGE_THEME);
      const savedAdminProfile = await AsyncStorage.getItem(STORAGE_ADMIN_PROFILE);
      const savedAdminState = await AsyncStorage.getItem(STORAGE_ADMIN_STATE);

      if (language) setSelectedLanguage(language);
      if (country) setSelectedCountry(country);
      if (theme) setDarkMode(theme === 'dark');
      if (savedAdminProfile) setAdminProfile(JSON.parse(savedAdminProfile));
      if (savedAdminState) {
        const parsed = JSON.parse(savedAdminState);
        if (parsed.topSuggestions) setTopSuggestions(parsed.topSuggestions);
        if (parsed.followRequests) setFollowRequests(parsed.followRequests);
        if (parsed.admins) setAdmins(parsed.admins.map(normalizeAdmin));
        if (parsed.reports) setReports(parsed.reports);
        if (parsed.adminTasks) setAdminTasks(parsed.adminTasks);
        if (parsed.adminControls) setAdminControls(parsed.adminControls);
      }
    };

    loadUser();
    loadSettings();

    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const saveLanguage = async (language: string) => {
    setSelectedLanguage(language);
    await AsyncStorage.setItem(STORAGE_LANGUAGE, language);

    Alert.alert(
      'Language Updated',
      `${language} has been saved globally.`
    );
  };

  const saveCountry = async (country: string) => {
    setSelectedCountry(country);
    await AsyncStorage.setItem(STORAGE_COUNTRY, country);

    Alert.alert(
      'Country Updated',
      `${country} has been saved for location-based features.`
    );
  };

  const toggleTheme = async (value: boolean) => {
    setDarkMode(value);
    await AsyncStorage.setItem(STORAGE_THEME, value ? 'dark' : 'light');
  };


  const saveAdminProfile = async (profile: typeof DEFAULT_ADMIN_PROFILE) => {
    setAdminProfile(profile);
    await AsyncStorage.setItem(STORAGE_ADMIN_PROFILE, JSON.stringify(profile));
  };

  const saveAdminState = async (next?: any) => {
    const payload = next || { topSuggestions, followRequests, admins, reports, adminTasks, adminControls };
    await AsyncStorage.setItem(STORAGE_ADMIN_STATE, JSON.stringify(payload));
  };

  const createCommunityAccount = async () => {
    if (!newCommunityName.trim()) {
      Alert.alert('Community Name Required', 'Please write the community feed account name.');
      return;
    }
    await saveAdminProfile({
      ...adminProfile,
      communityAccount: newCommunityName.trim(),
      communities: adminProfile.communities + 1,
      suggestedFirst: true,
    });
    setNewCommunityName('');
    Alert.alert('Community Created', 'Your community feed account is ready and will appear first in suggested follows.');
  };

  const createOfficialChannel = async () => {
    if (!newChannelName.trim()) {
      Alert.alert('Channel Name Required', 'Please write your channel name.');
      return;
    }
    await saveAdminProfile({
      ...adminProfile,
      channelName: newChannelName.trim(),
      channels: adminProfile.channels + 1,
      suggestedFirst: true,
    });
    setNewChannelName('');
    Alert.alert('Channel Created', 'Your official channel is ready and prioritized in suggested channels.');
  };

  const toggleFollowSuggestion = async (id: string) => {
    const updated = topSuggestions.map(item =>
      item.id === id ? { ...item, followed: !item.followed } : item
    );
    setTopSuggestions(updated);
    await saveAdminState({ topSuggestions: updated, followRequests, admins, reports, adminTasks, adminControls });
  };

  const updateFollowRequest = async (id: string, status: string) => {
    const updated = followRequests.map(item =>
      item.id === id ? { ...item, status } : item
    );
    setFollowRequests(updated);
    await saveAdminState({ topSuggestions, followRequests: updated, admins, reports, adminTasks, adminControls });
  };

  const addAdmin = async () => {
    if (!newAdminName.trim() || !newAdminHandle.trim()) {
      Alert.alert('Admin Details Required', 'Please add the admin name and handle.');
      return;
    }
    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      name: newAdminName.trim(),
      handle: newAdminHandle.trim(),
      role: 'Admin',
      active: true,
      access: {
        profile: false,
        content: true,
        reports: false,
        admins: false,
        settings: false,
      },
    };

    const updated: AdminUser[] = [...admins.map(normalizeAdmin), newAdmin];

    setAdmins(updated);
    setNewAdminName('');
    setNewAdminHandle('');
    await saveAdminState({ topSuggestions, followRequests, admins: updated, reports, adminTasks, adminControls });
  };

  const toggleAdminActive = async (id: string) => {
    const updated = admins.map(admin =>
      admin.id === id && admin.role !== 'Main Admin'
        ? { ...admin, active: !admin.active }
        : admin
    );
    setAdmins(updated);
    await saveAdminState({ topSuggestions, followRequests, admins: updated, reports, adminTasks, adminControls });
  };

  const deleteAdmin = async (id: string) => {
    const updated = admins.filter(admin => admin.id !== id || admin.role === 'Main Admin');
    setAdmins(updated);
    await saveAdminState({ topSuggestions, followRequests, admins: updated, reports, adminTasks, adminControls });
  };

  const moderateReport = async (id: string, action: string) => {
    const updated = reports.map(report =>
      report.id === id ? { ...report, status: action } : report
    );
    setReports(updated);
    await saveAdminState({ topSuggestions, followRequests, admins, reports: updated, adminTasks, adminControls });
    Alert.alert('Report Updated', `The account has been marked as ${action}.`);
  };

  const saveAdminControls = async (updates: Partial<typeof DEFAULT_ADMIN_CONTROLS>) => {
    const updated = { ...adminControls, ...updates };
    setAdminControls(updated);
    await saveAdminState({ topSuggestions, followRequests, admins, reports, adminTasks, adminControls: updated });
  };

  const assignAdminTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Task Required', 'Please write the task you want to assign.');
      return;
    }
    const task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      assignedTo: newTaskAdminHandle,
      status: 'open',
      priority: 'Medium',
      due: newTaskDue.trim() || 'Today',
    };
    const updated = [task, ...adminTasks];
    setAdminTasks(updated);
    setNewTaskTitle('');
    setNewTaskDue('Today');
    await saveAdminState({ topSuggestions, followRequests, admins, reports, adminTasks: updated, adminControls });
  };

  const toggleAdminTaskStatus = async (id: string) => {
    const updated = adminTasks.map(task =>
      task.id === id ? { ...task, status: task.status === 'done' ? 'open' : 'done' } : task
    );
    setAdminTasks(updated);
    await saveAdminState({ topSuggestions, followRequests, admins, reports, adminTasks: updated, adminControls });
  };

  const deleteAdminTask = async (id: string) => {
    const updated = adminTasks.filter(task => task.id !== id);
    setAdminTasks(updated);
    await saveAdminState({ topSuggestions, followRequests, admins, reports, adminTasks: updated, adminControls });
  };

  const reassignAdminTask = async (id: string, handle: string) => {
    const updated = adminTasks.map(task => task.id === id ? { ...task, assignedTo: handle } : task);
    setAdminTasks(updated);
    await saveAdminState({ topSuggestions, followRequests, admins, reports, adminTasks: updated, adminControls });
  };

  const pickAdminProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Needed', 'Please allow gallery access to choose a profile image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled) {
      await saveAdminProfile({ ...adminProfile, avatar: result.assets[0].uri });
    }
  };

  const takeAdminProfileImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Needed', 'Please allow camera access to take a profile photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled) {
      await saveAdminProfile({ ...adminProfile, avatar: result.assets[0].uri });
    }
  };

  const removeAdminProfileImage = async () => {
    await saveAdminProfile({ ...adminProfile, avatar: '' });
    setAdminProfileImageOpen(false);
  };

  const toggleAdminAccess = async (id: string, key: AdminAccessKey) => {
    const updated: AdminUser[] = admins.map(admin => {
      const safeAdmin = normalizeAdmin(admin);

      if (safeAdmin.id !== id || safeAdmin.role === 'Main Admin') {
        return safeAdmin;
      }

      return {
        ...safeAdmin,
        access: {
          ...safeAdmin.access,
          [key]: !safeAdmin.access[key],
        },
      };
    });

    setAdmins(updated);
    await saveAdminState({ topSuggestions, followRequests, admins: updated, reports, adminTasks, adminControls });
  };

  const openAdminToolsMenu = () => {
    setAdminToolsMenuVisible(true);
  };

  const chooseAdminTool = (target: string) => {
    setAdminToolsMenuVisible(false);
    if (target === 'SettingsModal') {
      setAdminSettingsOpen(true);
      return;
    }
    if (target === 'MainMenu') {
      setAdminDashboardOpen(false);
      setMenuOpen(true);
      return;
    }
    setAdminTab(target);
  };


  const theme = darkMode
    ? {
        background: '#071A15',
        surface: '#102820',
        text: '#FFFFFF',
        muted: '#C7D8D0',
        border: 'rgba(255,255,255,0.12)',
      }
    : {
        background: '#F4EFE5',
        surface: '#FFFDF8',
        text: '#032D22',
        muted: '#746A5D',
        border: '#E5D9C3',
      };

  const gregorianDate = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [currentDate]);

  const islamicDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-US-u-ca-islamic', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(currentDate);
    } catch {
      return 'Islamic date unavailable';
    }
  }, [currentDate]);

  const lamsoDate = useMemo(() => {
    const day = LAMSO_DAYS[currentDate.getDay()];
    const month = LAMSO_MONTHS[currentDate.getMonth()];

    return `${day}, ${currentDate.getDate()} ${month} ${currentDate.getFullYear()}`;
  }, [currentDate]);

  const openRoute = (route: string) => {
    router.push({
      pathname: route as any,
    });
  };

  const submitRating = () => {
    Alert.alert(
      'Thank You',
      `You rated CHAFADIA NOOR ${rating}/5.\n\nComment:\n${
        ratingComment || 'No comment added.'
      }\n\nConnect this form to Firebase, Supabase or your backend later to save public reviews.`
    );

    setRatingComment('');
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topCircle} />
        <View style={styles.topCircleSmall} />
        <View style={styles.goldBlur} />
        <View style={styles.greenBlur} />

        <View style={styles.topControls}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.bentoButton}
            onPress={() => setMenuOpen(true)}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F8E7B8']}
              style={styles.bentoIconGradient}
            >
              <Grid3X3 size={18} color="#064E3B" />
              <View style={styles.bentoDot} />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.themeControl}>
            <Sun size={13} color="#D8B85A" />

            <Text style={styles.themeText}>
              {darkMode ? t.dark : t.light}
            </Text>

            <Switch
              value={darkMode}
              onValueChange={toggleTheme}
              thumbColor={darkMode ? '#D8B85A' : '#F1E7D5'}
              trackColor={{
                false: '#D9CDB8',
                true: '#064E3B',
              }}
            />
          </View>
        </View>

        {loggedInUser && (
          <View style={styles.greetingBar}>
            <Text style={[styles.greetingText, { color: theme.text }]}>
              Assalamu Alaikum, {loggedInUser.fullName}
            </Text>
            <Text style={[styles.greetingEmail, { color: theme.muted }]}>
              {loggedInUser.email}
            </Text>
          </View>
        )}

        <LinearGradient
          colors={['#021F18', '#064E3B', '#0D7054']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerGlow} />
          <View style={styles.headerGlowTwo} />
          <View style={styles.headerRing} />

          <View style={styles.badge}>
            <Sparkles size={9} color="#F6D365" />
            <Text style={styles.badgeText}>{t.platform}</Text>
          </View>

          <View style={styles.logoOrb}>
            <Moon size={22} color="#F6D365" />

            <Sparkles
              size={9}
              color="#FFFFFF"
              style={styles.logoSparkle}
            />
          </View>

          <Text style={styles.title}>{t.title}</Text>

          <View style={styles.centerLine} />

          <Text style={styles.subtitle}>{t.subtitle}</Text>

          <Text style={styles.description}>
            {t.description}
          </Text>

          <View style={styles.headerStatsRow}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatNumber}>16</Text>
              <Text style={styles.headerStatLabel}>Tools</Text>
            </View>

            <View style={styles.headerStatDivider} />

            <View style={styles.headerStat}>
              <Text
                numberOfLines={1}
                style={styles.headerStatNumber}
              >
                {selectedCountryData.flag} {selectedCountry}
              </Text>

              <Text style={styles.headerStatLabel}>Country</Text>
            </View>

            <View style={styles.headerStatDivider} />

            <View style={styles.headerStat}>
              <Text style={styles.headerStatNumber}>
                {selectedLanguageData.flag}
              </Text>
              <Text style={styles.headerStatLabel}>
                {selectedLanguage}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['#FFFDF8', '#F8EEDC']}
          style={styles.dateCard}
        >
          <View style={styles.dateHeader}>
            <View style={styles.dateIconBox}>
              <Calendar size={14} color="#064E3B" />
            </View>

            <View>
              <Text style={styles.dateMainTitle}>
                Today’s Date
              </Text>
              <Text style={styles.dateMainSub}>
                Gregorian • Lamso • Islamic
              </Text>
            </View>
          </View>

          <View style={styles.dateDivider} />

          <Text style={styles.datePrimaryLine}>
            {gregorianDate}  |  {lamsoDate}
          </Text>

          <Text style={styles.dateArabicLine}>
            Islamic Date: {islamicDate}
          </Text>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text },
              ]}
            >
              {t.explore}
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: theme.muted },
              ]}
            >
              {t.exploreSub}
            </Text>
          </View>

          <View style={styles.sectionPill}>
            <Sparkles size={8} color="#9A6A16" />
            <Text style={styles.sectionPillText}>{t.tools}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.duaCard}
          onPress={() => openRoute('/remembrance')}
        >
          <View style={styles.duaGlow} />
          <View style={styles.duaGoldGlow} />

          <View style={styles.duaIconWrapper}>
            <Moon color="#ffffff" size={15} strokeWidth={2.6} />

            <Sparkles
              color="#F6D365"
              size={9}
              style={styles.sparkle}
            />
          </View>

          <View style={styles.duaTextContainer}>
            <Text style={styles.duaTitle}>{t.before}</Text>
            <Text style={styles.duaDescription}>{t.dua}</Text>
            <Text style={styles.duaButtonText}>{t.duaTap}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.grid}>
          {cards.map((card, index) => {
            const IconComponent = card.icon;
            const isLastCard = index === cards.length - 1;

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                style={[
                  styles.card,
                  {
                    backgroundColor: darkMode ? '#102820' : '#FFFDF8',
                    borderColor: darkMode
                      ? 'rgba(255,255,255,0.1)'
                      : '#E5D9C3',
                  },
                  isLastCard && styles.lastCard,
                ]}
                onPress={() => openRoute(card.route)}
              >
                <View
                  style={[
                    styles.cardGlow,
                    { backgroundColor: card.softColor },
                  ]}
                />

                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: card.softColor,
                      borderColor: `${card.color}35`,
                    },
                  ]}
                >
                  <IconComponent
                    color={card.color}
                    size={12.8}
                    strokeWidth={2.7}
                  />
                </View>

                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: darkMode ? '#FFFFFF' : card.color,
                      fontSize: largeText ? 8.4 : 7.7,
                    },
                  ]}
                >
                  {card.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.footerLine} />

          <Text
            style={[
              styles.footer,
              { color: theme.muted },
            ]}
          >
            {t.footer}
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.sideOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.sideBackdrop}
            onPress={() => setMenuOpen(false)}
          />

          <View style={styles.sideMenu}>
            <LinearGradient
              colors={['#021F18', '#064E3B']}
              style={styles.sideMenuHeader}
            >
              <View style={styles.sideMenuTop}>
                <View>
                  <Text style={styles.sideTitle}>{loggedInUser?.fullName || 'MENU'}</Text>
                  <Text style={styles.sideSubtitle}>
                    {loggedInUser?.email || 'Settings & personalization'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setMenuOpen(false)}
                >
                  <X size={17} color="#064E3B" />
                </TouchableOpacity>
              </View>

              <View style={styles.sideBadge}>
                <Menu size={14} color="#D8B85A" />
                <Text style={styles.sideBadgeText}>
                  CHAFADIA NOOR Control Center
                </Text>
              </View>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.menuSection}>
                <View style={styles.menuTitleRow}>
                  <Globe2 size={16} color="#064E3B" />
                  <Text style={styles.menuSectionTitle}>
                    App Language
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.dropdownBox}
                  onPress={() =>
                    setLanguageDropdownOpen(!languageDropdownOpen)
                  }
                >
                  <Text style={styles.dropdownFlag}>
                    {selectedLanguageData.flag}
                  </Text>

                  <View style={styles.dropdownTextBox}>
                    <Text style={styles.dropdownLabel}>
                      {selectedLanguage}
                    </Text>
                    <Text style={styles.dropdownSub}>
                      {selectedLanguageData.native}
                    </Text>
                  </View>

                  <ChevronDown size={17} color="#064E3B" />
                </TouchableOpacity>

                {languageDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {WORLD_LANGUAGES.map(language => (
                      <TouchableOpacity
                        key={language.name}
                        style={styles.dropdownItem}
                        onPress={() => {
                          saveLanguage(language.name);
                          setLanguageDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownFlag}>
                          {language.flag}
                        </Text>

                        <View style={styles.dropdownTextBox}>
                          <Text style={styles.dropdownLabel}>
                            {language.name}
                          </Text>
                          <Text style={styles.dropdownSub}>
                            {language.native}
                          </Text>
                        </View>

                        {selectedLanguage === language.name && (
                          <Star
                            size={14}
                            color="#D8B85A"
                            fill="#D8B85A"
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <Text style={styles.menuNote}>
                  This saves globally with AsyncStorage. Other screens
                  should read CHAFADIA_GLOBAL_LANGUAGE to update
                  automatically.
                </Text>
              </View>

              <View style={styles.menuSection}>
                <View style={styles.menuTitleRow}>
                  <Flag size={16} color="#064E3B" />
                  <Text style={styles.menuSectionTitle}>
                    Country
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.dropdownBox}
                  onPress={() =>
                    setCountryDropdownOpen(!countryDropdownOpen)
                  }
                >
                  <Text style={styles.dropdownFlag}>
                    {selectedCountryData.flag}
                  </Text>

                  <View style={styles.dropdownTextBox}>
                    <Text style={styles.dropdownLabel}>
                      {selectedCountry}
                    </Text>
                    <Text style={styles.dropdownSub}>
                      Location-based features
                    </Text>
                  </View>

                  <ChevronDown size={17} color="#064E3B" />
                </TouchableOpacity>

                {countryDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {COUNTRIES.map(country => (
                      <TouchableOpacity
                        key={country.name}
                        style={styles.dropdownItem}
                        onPress={() => {
                          saveCountry(country.name);
                          setCountryDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownFlag}>
                          {country.flag}
                        </Text>

                        <View style={styles.dropdownTextBox}>
                          <Text style={styles.dropdownLabel}>
                            {country.name}
                          </Text>
                          <Text style={styles.dropdownSub}>
                            Prayer, Qibla, mosque & calendar
                          </Text>
                        </View>

                        {selectedCountry === country.name && (
                          <Star
                            size={14}
                            color="#D8B85A"
                            fill="#D8B85A"
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.menuSection}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.aboutToggle}
                  onPress={() => setAboutOpen(!aboutOpen)}
                >
                  <View style={styles.aboutToggleLeft}>
                    <View style={styles.aboutIconBox}>
                      <Info size={16} color="#D8B85A" />
                    </View>

                    <View style={styles.aboutTitleBox}>
                      <Text style={styles.menuSectionTitle}>
                        About CHAFADIA NOOR
                      </Text>

                      <Text style={styles.aboutPreview}>
                        Touch to {aboutOpen ? 'hide' : 'read'} the legacy,
                        story and purpose of the app.
                      </Text>
                    </View>
                  </View>

                  <ChevronDown
                    size={18}
                    color="#064E3B"
                    style={aboutOpen && styles.aboutChevronOpen}
                  />
                </TouchableOpacity>

                {aboutOpen && (
                  <View style={styles.aboutContent}>
                    <View style={styles.aboutQuoteBox}>
                      <Text style={styles.aboutQuote}>
                        “True love for the sake of Allah never fades.”
                      </Text>
                    </View>

                    <Text style={styles.aboutText}>
                      CHAFADIA NOOR is more than an app; it is a legacy
                      of love, faith and remembrance dedicated to my
                      beloved late husband.
                      {'\n\n'}
                      His kindness, sacrifice, patience, strength,
                      support and beautiful soul continue to live in my
                      heart and inspire this journey every day.
                      {'\n\n'}
                      Through this platform, his memory is carried with
                      dignity through الخير, prayer, Islamic knowledge,
                      remembrance of Allah, service to the Ummah and
                      every good deed that benefits others.
                      {'\n\n'}
                      CHAFADIA NOOR was created to help Muslims pray on
                      time, learn their Deen, remember Allah, grow
                      spiritually, find useful Islamic tools, connect
                      with community and bring light into everyday life.
                      {'\n\n'}
                      We are all travelers and passengers in this
                      temporary world, returning one day to our Creator.
                      Nothing remains except faith, sincerity and the
                      good we leave behind.
                      {'\n\n'}
                      O Allah, make this platform a source of guidance,
                      mercy, forgiveness and benefit for everyone who
                      uses it. Place barakah in every feature, every
                      prayer, every reminder and every act of الخير
                      shared through it.
                      {'\n\n'}
                      O Allah, make CHAFADIA NOOR a continuous sadaqah
                      jariyah for us in this world and after our return
                      to You. Forgive our sins, accept our intentions,
                      increase us in sincerity, and let this work become
                      a light for us in our graves and a means of mercy
                      on the Day we meet You.
                      {'\n\n'}
                      May Allah forgive him, elevate his rank, expand
                      his grave with light, reunite us in Jannatul
                      Firdaus, and place endless reward and acceptance in
                      this work.
                      {'\n\n'}
                      Chafiou Hamidou & Sadiyatou Chafiou
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.menuSection}>
                <View style={styles.menuTitleRow}>
                  <Star size={16} color="#064E3B" />
                  <Text style={styles.menuSectionTitle}>
                    Rate Us
                  </Text>
                </View>

                <Text style={styles.menuNote}>
                  Rate the app and write what you love, what should be
                  removed, and what should be added.
                </Text>

                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map(item => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setRating(item)}
                    >
                      <Star
                        size={24}
                        color="#D8B85A"
                        fill={item <= rating ? '#D8B85A' : 'transparent'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.ratingInput}
                  placeholder="Write your review, suggestions, advantages, disadvantages, what to add or remove..."
                  placeholderTextColor="#8A8172"
                  multiline
                  value={ratingComment}
                  onChangeText={setRatingComment}
                />

                <TouchableOpacity
                  style={styles.submitReviewButton}
                  onPress={submitRating}
                >
                  <Send size={15} color="#FFFFFF" />
                  <Text style={styles.submitReviewText}>
                    Submit Review
                  </Text>
                </TouchableOpacity>
              </View>


              <View style={styles.menuSection}>
                <View style={styles.menuTitleRow}>
                  <ShieldCheck size={16} color="#064E3B" />
                  <Text style={styles.menuSectionTitle}>Admin Dashboard</Text>
                </View>

                <LinearGradient colors={['#FDF8E7', '#E6F1EC']} style={styles.adminMenuPreviewCard}>
                  <View style={styles.adminMenuPreviewTop}>
                    <View style={styles.adminMenuCrown}><Crown size={18} color="#064E3B" /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.adminMenuPreviewTitle}>Admin Dashboard</Text>
                      <Text style={styles.adminMenuPreviewText}>Choose what you want to manage: profile, community, channels, admins, tasks, reports, safety and app settings.</Text>
                    </View>
                  </View>
                  <View style={styles.adminMenuMetricRow}>
                    <View style={styles.adminMenuMetric}><Text style={styles.adminMenuMetricNumber}>{admins.length}</Text><Text style={styles.adminMenuMetricLabel}>Admins</Text></View>
                    <View style={styles.adminMenuMetric}><Text style={styles.adminMenuMetricNumber}>{adminTasks.filter(t => t.status !== 'done').length}</Text><Text style={styles.adminMenuMetricLabel}>Tasks</Text></View>
                    <View style={styles.adminMenuMetric}><Text style={styles.adminMenuMetricNumber}>{reports.filter(r => r.status === 'open').length}</Text><Text style={styles.adminMenuMetricLabel}>Reports</Text></View>
                  </View>
                </LinearGradient>

                <TouchableOpacity
                  style={styles.adminOpenButton}
                  onPress={() => {
                    setMenuOpen(false);
                    setAdminDashboardOpen(true);
                  }}
                >
                  <Crown size={16} color="#FFFFFF" />
                  <Text style={styles.adminOpenText}>Open Admin Dashboard</Text>
                  <ChevronRight size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.menuSection}>
                <View style={styles.menuTitleRow}>
                  <Settings size={16} color="#064E3B" />
                  <Text style={styles.menuSectionTitle}>
                    Helpful Settings
                  </Text>
                </View>

                <SettingRow
                  icon={Bell}
                  title="Notifications"
                  subtitle="Prayer alerts, reminders and updates."
                  value={notifications}
                  onValueChange={setNotifications}
                />

                <SettingRow
                  icon={MapPin}
                  title="Location Services"
                  subtitle="Qibla, prayer times and mosque finder."
                  value={locationServices}
                  onValueChange={setLocationServices}
                />

                <SettingRow
                  icon={Volume2}
                  title="Sound & Audio"
                  subtitle="Azan, Quran recitation and reminders."
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                />

                <SettingRow
                  icon={Eye}
                  title="Large Text"
                  subtitle="Make dashboard text easier to read."
                  value={largeText}
                  onValueChange={setLargeText}
                />

                <SettingRow
                  icon={Lock}
                  title="Privacy Mode"
                  subtitle="Reduce personal details on shared devices."
                  value={privacyMode}
                  onValueChange={setPrivacyMode}
                />

                <SettingRow
                  icon={Wifi}
                  title="Offline Mode"
                  subtitle="Prioritize saved content."
                  value={offlineMode}
                  onValueChange={setOfflineMode}
                />

                <SettingRow
                  icon={Database}
                  title="Auto Sync"
                  subtitle="Keep settings and saved data updated."
                  value={autoSync}
                  onValueChange={setAutoSync}
                />

                <SettingRow
                  icon={ShieldCheck}
                  title="Safe Islamic Guidance"
                  subtitle="Verify serious fatwa matters with scholars."
                  value={true}
                  onValueChange={() => {}}
                />

                <SettingRow
                  icon={HelpCircle}
                  title="Help & Support"
                  subtitle="FAQ, support and user guidance."
                  value={true}
                  onValueChange={() => {}}
                />
              </View>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => {
                  Alert.alert(
                    'Logout',
                    'Are you sure you want to logout?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Logout',
                        style: 'destructive',
                        onPress: async () => {
                          setMenuOpen(false);
                          await logoutUser();
                          router.replace('/auth/login');
                        },
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.logoutButtonText}>
                  Logout
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setMenuOpen(false)}
              >
                <Text style={styles.doneButtonText}>
                  Save & Close
                </Text>

                <ChevronRight size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={adminDashboardOpen}
        animationType="slide"
        onRequestClose={() => { setAdminDashboardOpen(false); setMenuOpen(true); }}
      >
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}> 
          <ScrollView style={styles.container} contentContainerStyle={styles.adminContent} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#021F18', '#064E3B', '#0D7054']} style={styles.adminHero}>
              <View style={styles.adminHeroTop}>
                <TouchableOpacity
                  style={styles.adminBackButton}
                  onPress={() => { setAdminDashboardOpen(false); setMenuOpen(true); }}
                >
                  <ChevronRight size={16} color="#064E3B" style={{ transform: [{ rotate: '180deg' }] }} />
                  <Text style={styles.adminBackText}>Menu</Text>
                </TouchableOpacity>
                <View style={styles.adminTopActions}>
                  <TouchableOpacity style={styles.adminCloseButton} onPress={openAdminToolsMenu}>
                    <MoreVertical size={19} color="#064E3B" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.adminHeroTitle}>Admin Dashboard</Text>
              <Text style={styles.adminHeroText}>
                Choose what you want to manage. This owner-only dashboard controls public profile, official channels, community account, admin access, tasks, follow requests, reports, safety and app maintenance.
              </Text>
              <View style={styles.adminStatsRow}>
                <View style={styles.adminStatBox}><Text style={styles.adminStatNumber}>{adminProfile.followers.toLocaleString()}</Text><Text style={styles.adminStatLabel}>Followers</Text></View>
                <View style={styles.adminStatBox}><Text style={styles.adminStatNumber}>{adminProfile.channels}</Text><Text style={styles.adminStatLabel}>Channels</Text></View>
                <View style={styles.adminStatBox}><Text style={styles.adminStatNumber}>{adminTasks.filter(t => t.status !== 'done').length}</Text><Text style={styles.adminStatLabel}>Tasks</Text></View>
                <View style={styles.adminStatBox}><Text style={styles.adminStatNumber}>{reports.filter(r => r.status === 'open').length}</Text><Text style={styles.adminStatLabel}>Reports</Text></View>
              </View>
            </LinearGradient>


            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.adminTabs}>
              {['Overview', 'Profile', 'Create', 'Suggestions', 'Requests', 'Admins', 'Tasks', 'Reports', 'Settings'].map(item => {
                const active = adminTab === item;
                return (
                  <TouchableOpacity key={item} style={[styles.adminTabPill, active && styles.adminTabPillActive]} onPress={() => setAdminTab(item)}>
                    <Text style={[styles.adminTabText, active && styles.adminTabTextActive]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {adminTab !== 'Overview' && (
              <TouchableOpacity style={styles.adminInlineBackButton} onPress={() => setAdminTab('Overview')}>
                <ChevronRight size={16} color="#064E3B" style={{ transform: [{ rotate: '180deg' }] }} />
                <Text style={styles.adminInlineBackText}>Back to Admin Dashboard</Text>
              </TouchableOpacity>
            )}

            {adminTab === 'Overview' && (
              <>
                <View style={styles.adminProfileCard}>
                  <TouchableOpacity style={styles.adminAvatar} onPress={() => adminProfile.avatar ? setAdminProfileImageOpen(true) : pickAdminProfileImage()}>
                    {adminProfile.avatar ? <Image source={{ uri: adminProfile.avatar }} style={styles.adminAvatarImage} /> : <Text style={styles.adminAvatarText}>SN</Text>}
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.adminProfileName}>{adminProfile.displayName}</Text>
                    <Text style={styles.adminProfileHandle}>{adminProfile.username} • {adminProfile.role}</Text>
                    <Text style={styles.adminProfileBio}>{adminProfile.publicBio}</Text>
                    <Text style={styles.adminProfilePublicLine}>{adminProfile.publicLocation} • {adminProfile.publicEmail}</Text>
                  </View>
                </View>
                <View style={styles.adminNoticeCard}>
                  <Sparkles size={18} color="#D8B85A" />
                  <Text style={styles.adminNoticeText}>Your profile is marked as first suggested in Community Feed and Channels: {adminProfile.suggestedFirst ? 'Enabled' : 'Disabled'}.</Text>
                </View>
              </>
            )}

            {adminTab === 'Profile' && (
              <View style={styles.adminPanelCard}>
                <Text style={styles.adminPanelTitle}>Public Profile</Text>
                <View style={styles.adminPhotoTools}>
                  <TouchableOpacity style={styles.adminProfilePhotoLarge} onPress={() => adminProfile.avatar ? setAdminProfileImageOpen(true) : pickAdminProfileImage()}>
                    {adminProfile.avatar ? <Image source={{ uri: adminProfile.avatar }} style={styles.adminProfilePhotoImage} /> : <UserCog size={32} color="#D8B85A" />}
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.adminPhotoTitle}>Admin public photo</Text>
                    <Text style={styles.adminPhotoSub}>People can see this on your public profile and suggested follows.</Text>
                    <View style={styles.adminPhotoActionRow}>
                      <TouchableOpacity style={styles.adminPhotoButton} onPress={pickAdminProfileImage}><ImageIcon size={13} color="#064E3B" /><Text style={styles.adminPhotoButtonText}>Gallery</Text></TouchableOpacity>
                      <TouchableOpacity style={styles.adminPhotoButton} onPress={takeAdminProfileImage}><Camera size={13} color="#064E3B" /><Text style={styles.adminPhotoButtonText}>Camera</Text></TouchableOpacity>
                      {adminProfile.avatar ? <TouchableOpacity style={styles.adminPhotoDanger} onPress={removeAdminProfileImage}><Trash2 size={13} color="#FFFFFF" /></TouchableOpacity> : null}
                    </View>
                  </View>
                </View>
                <TextInput style={styles.adminInput} value={adminProfile.displayName} onChangeText={text => saveAdminProfile({ ...adminProfile, displayName: text })} placeholder="Display name" />
                <TextInput style={styles.adminInput} value={adminProfile.username} onChangeText={text => saveAdminProfile({ ...adminProfile, username: text })} placeholder="Username" />
                <TextInput style={[styles.adminInput, styles.adminTextArea]} value={adminProfile.publicBio} onChangeText={text => saveAdminProfile({ ...adminProfile, publicBio: text })} placeholder="Public bio" multiline />
                <TextInput style={styles.adminInput} value={adminProfile.country} onChangeText={text => saveAdminProfile({ ...adminProfile, country: text, publicLocation: text })} placeholder="Country" />
                <TextInput style={styles.adminInput} value={adminProfile.publicEmail} onChangeText={text => saveAdminProfile({ ...adminProfile, publicEmail: text })} placeholder="Public email or contact" />
                <View style={styles.adminSwitchRow}>
                  <Text style={styles.adminSwitchTitle}>Public can view and follow profile</Text>
                  <Switch value={adminProfile.visibleToPublic} onValueChange={value => saveAdminProfile({ ...adminProfile, visibleToPublic: value })} />
                </View>
                <View style={styles.adminSwitchRow}>
                  <Text style={styles.adminSwitchTitle}>Show first in suggested follows</Text>
                  <Switch value={adminProfile.suggestedFirst} onValueChange={value => saveAdminProfile({ ...adminProfile, suggestedFirst: value })} />
                </View>
              </View>
            )}

            {adminTab === 'Create' && (
              <View style={styles.adminPanelCard}>
                <View style={styles.adminPanelTitleRow}>
                  <Text style={styles.adminPanelTitle}>Create Accounts</Text>
                  <TouchableOpacity
                    style={styles.adminCancelPill}
                    onPress={() => { setNewCommunityName(''); setNewChannelName(''); setAdminTab('Overview'); }}
                  >
                    <X size={13} color='#064E3B' />
                    <Text style={styles.adminCancelPillText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
                <TextInput style={styles.adminInput} value={newCommunityName} onChangeText={setNewCommunityName} placeholder="Community feed account name" />
                <TouchableOpacity style={styles.adminPrimaryButton} onPress={createCommunityAccount}><Users size={16} color="#FFFFFF" /><Text style={styles.adminPrimaryText}>Create Community Feed Account</Text></TouchableOpacity>
                <TextInput style={styles.adminInput} value={newChannelName} onChangeText={setNewChannelName} placeholder="Official channel name" />
                <TouchableOpacity style={styles.adminPrimaryButton} onPress={createOfficialChannel}><Newspaper size={16} color="#FFFFFF" /><Text style={styles.adminPrimaryText}>Create Official Channel</Text></TouchableOpacity>
              </View>
            )}

            {adminTab === 'Suggestions' && (
              <View style={styles.adminPanelCard}>
                <Text style={styles.adminPanelTitle}>Top Followers To Follow</Text>
                {topSuggestions.map(item => (
                  <View key={item.id} style={styles.adminListRow}>
                    <View style={styles.adminMiniAvatar}><Text style={styles.adminMiniAvatarText}>{item.name.charAt(0)}</Text></View>
                    <View style={{ flex: 1 }}><Text style={styles.adminListTitle}>{item.name}</Text><Text style={styles.adminListSub}>{item.handle} • {item.reason}</Text></View>
                    <TouchableOpacity style={[styles.adminSmallButton, item.followed && styles.adminSmallButtonDone]} onPress={() => toggleFollowSuggestion(item.id)}><Text style={styles.adminSmallButtonText}>{item.followed ? 'Following' : 'Follow'}</Text></TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {adminTab === 'Requests' && (
              <View style={styles.adminPanelCard}>
                <Text style={styles.adminPanelTitle}>Follow Invite Requests</Text>
                {followRequests.map(item => (
                  <View key={item.id} style={styles.adminListRow}>
                    <Bell size={18} color="#D8B85A" />
                    <View style={{ flex: 1 }}><Text style={styles.adminListTitle}>{item.name}</Text><Text style={styles.adminListSub}>{item.handle} • {item.status}</Text></View>
                    {item.status === 'pending' && <>
                      <TouchableOpacity style={styles.adminAcceptButton} onPress={() => updateFollowRequest(item.id, 'accepted')}><CheckCircle size={15} color="#FFFFFF" /></TouchableOpacity>
                      <TouchableOpacity style={styles.adminRejectButton} onPress={() => updateFollowRequest(item.id, 'rejected')}><X size={15} color="#FFFFFF" /></TouchableOpacity>
                    </>}
                  </View>
                ))}
              </View>
            )}

            {adminTab === 'Admins' && (
              <View style={styles.adminPanelCard}>
                <Text style={styles.adminPanelTitle}>Admin Team & Access Limits</Text>
                <Text style={styles.adminSectionNote}>Add admins, pause their access, remove them, or limit exactly which admin features they can use. The main owner remains protected.</Text>
                <TextInput style={styles.adminInput} value={newAdminName} onChangeText={setNewAdminName} placeholder="New admin name" />
                <TextInput style={styles.adminInput} value={newAdminHandle} onChangeText={setNewAdminHandle} placeholder="New admin handle" />
                <TouchableOpacity style={styles.adminPrimaryButton} onPress={addAdmin}><UserPlus size={16} color="#FFFFFF" /><Text style={styles.adminPrimaryText}>Add Admin</Text></TouchableOpacity>
                {admins.map(item => (
                  <View key={item.id} style={styles.adminListRow}>
                    <Shield size={18} color="#064E3B" />
                    <View style={{ flex: 1 }}><Text style={styles.adminListTitle}>{item.name}</Text><Text style={styles.adminListSub}>{item.handle} • {item.role} • {item.active ? 'Active' : 'Paused'}</Text>
                    {item.role !== 'Main Admin' && <View style={styles.adminAccessChips}>
                      {(['profile', 'content', 'reports', 'admins', 'settings'] as AdminAccessKey[]).map(key => (
                        <TouchableOpacity key={key} style={[styles.adminAccessChip, item.access[key] && styles.adminAccessChipActive]} onPress={() => toggleAdminAccess(item.id, key)}>
                          <Text style={[styles.adminAccessChipText, item.access[key] && styles.adminAccessChipTextActive]}>{key}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>}
                    </View>
                    {item.role !== 'Main Admin' && <>
                      <TouchableOpacity style={styles.adminIconButton} onPress={() => toggleAdminActive(item.id)}><Edit3 size={15} color="#064E3B" /></TouchableOpacity>
                      <TouchableOpacity style={styles.adminDangerIconButton} onPress={() => deleteAdmin(item.id)}><Trash2 size={15} color="#FFFFFF" /></TouchableOpacity>
                    </>}
                  </View>
                ))}
              </View>
            )}

            {adminTab === 'Tasks' && (
              <View style={styles.adminPanelCard}>
                <View style={styles.adminPanelTitleRow}>
                  <Text style={styles.adminPanelTitle}>Assign Tasks To Admins</Text>
                  <TouchableOpacity
                    style={styles.adminCancelPill}
                    onPress={() => { setNewTaskTitle(''); setNewTaskDue('Today'); setAdminTab('Overview'); }}
                  >
                    <X size={13} color='#064E3B' />
                    <Text style={styles.adminCancelPillText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.adminSectionNote}>Create work for other admins, choose who should handle it, then mark it complete or delete it when finished.</Text>
                <TextInput style={styles.adminInput} value={newTaskTitle} onChangeText={setNewTaskTitle} placeholder="Task title, example: Review reports today" />
                <TextInput style={styles.adminInput} value={newTaskDue} onChangeText={setNewTaskDue} placeholder="Due date, example: Today / Tomorrow" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.adminAssigneeScroll}>
                  {admins.filter(admin => admin.active).map(admin => {
                    const active = newTaskAdminHandle === admin.handle;
                    return (
                      <TouchableOpacity key={admin.id} style={[styles.adminAssigneePill, active && styles.adminAssigneePillActive]} onPress={() => setNewTaskAdminHandle(admin.handle)}>
                        <Text style={[styles.adminAssigneeText, active && styles.adminAssigneeTextActive]}>{admin.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity style={styles.adminPrimaryButton} onPress={assignAdminTask}><Calendar size={16} color="#FFFFFF" /><Text style={styles.adminPrimaryText}>Assign Task</Text></TouchableOpacity>
                {adminTasks.map(task => (
                  <View key={task.id} style={[styles.adminTaskCard, task.status === 'done' && styles.adminTaskCardDone]}>
                    <View style={styles.adminTaskTop}>
                      <TouchableOpacity style={[styles.taskCheck, task.status === 'done' && styles.taskCheckDone]} onPress={() => toggleAdminTaskStatus(task.id)}>
                        <CheckCircle size={15} color={task.status === 'done' ? '#FFFFFF' : '#064E3B'} />
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.adminTaskTitle}>{task.title}</Text>
                        <Text style={styles.adminTaskSub}>{task.assignedTo} • {task.priority} priority • Due {task.due} • {task.status}</Text>
                      </View>
                      <TouchableOpacity style={styles.adminDangerIconButton} onPress={() => deleteAdminTask(task.id)}><Trash2 size={15} color="#FFFFFF" /></TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.adminTaskReassignRow}>
                      {admins.filter(admin => admin.active).map(admin => (
                        <TouchableOpacity key={admin.id} style={[styles.adminAccessChip, task.assignedTo === admin.handle && styles.adminAccessChipActive]} onPress={() => reassignAdminTask(task.id, admin.handle)}>
                          <Text style={[styles.adminAccessChipText, task.assignedTo === admin.handle && styles.adminAccessChipTextActive]}>{admin.handle}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ))}
              </View>
            )}

            {adminTab === 'Settings' && (
              <View style={styles.adminPanelCard}>
                <Text style={styles.adminPanelTitle}>Admin Controls</Text>
                <AdminControlSwitch title="Owner-only dashboard" subtitle="Only the main owner should open this dashboard." value={adminControls.ownerOnlyDashboard} onValueChange={(value: any) => saveAdminControls({ ownerOnlyDashboard: value })} />
                <AdminControlSwitch title="Require owner approval" subtitle="New admins need approval before accessing features." value={adminControls.requireOwnerApproval} onValueChange={(value: any) => saveAdminControls({ requireOwnerApproval: value })} />
                <AdminControlSwitch title="Allow admin profile edits" subtitle="Let approved admins update limited profile details." value={adminControls.allowAdminProfileEdit} onValueChange={(value: any) => saveAdminControls({ allowAdminProfileEdit: value })} />
                <AdminControlSwitch title="Content moderation" subtitle="Allow admins to manage posts, comments and channels." value={adminControls.allowContentModeration} onValueChange={(value: any) => saveAdminControls({ allowContentModeration: value })} />
                <AdminControlSwitch title="Report moderation" subtitle="Allow admins to block, suspend, remove or delete reported accounts." value={adminControls.allowReportModeration} onValueChange={(value: any) => saveAdminControls({ allowReportModeration: value })} />
                <AdminControlSwitch title="Channel management" subtitle="Allow channel creation, settings and visibility controls." value={adminControls.allowChannelManagement} onValueChange={(value: any) => saveAdminControls({ allowChannelManagement: value })} />
                <AdminControlSwitch title="Community management" subtitle="Allow community feed account and suggestion management." value={adminControls.allowCommunityManagement} onValueChange={(value: any) => saveAdminControls({ allowCommunityManagement: value })} />
                <AdminControlSwitch title="Public profile visible" subtitle="Show your admin profile for people to follow." value={adminControls.publicProfileVisible} onValueChange={(value: any) => saveAdminControls({ publicProfileVisible: value })} />
                <AdminControlSwitch title="Report notifications" subtitle="Receive alerts when people report disturbing accounts." value={adminControls.notifyOnReports} onValueChange={(value: any) => saveAdminControls({ notifyOnReports: value })} />
                <AdminControlSwitch title="Invite notifications" subtitle="Receive follow invite and request notifications." value={adminControls.notifyOnFollowInvites} onValueChange={(value: any) => saveAdminControls({ notifyOnFollowInvites: value })} />
                <AdminControlSwitch title="Task assignment" subtitle="Allow the owner to assign work to admins." value={adminControls.allowTaskAssignment} onValueChange={(value: any) => saveAdminControls({ allowTaskAssignment: value })} />
                <AdminControlSwitch title="Admin removal" subtitle="Allow removing admins except the main owner." value={adminControls.allowAdminRemoval} onValueChange={(value: any) => saveAdminControls({ allowAdminRemoval: value })} />
                <AdminControlSwitch title="Feature limits" subtitle="Allow limiting admin access to selected tools only." value={adminControls.allowFeatureLimits} onValueChange={(value: any) => saveAdminControls({ allowFeatureLimits: value })} />
                <AdminControlSwitch title="Require report reason" subtitle="Make moderators record a reason before actions." value={adminControls.requireReportReason} onValueChange={(value: any) => saveAdminControls({ requireReportReason: value })} />
                <AdminControlSwitch title="Archive resolved reports" subtitle="Keep completed safety reports stored for review." value={adminControls.archiveResolvedReports} onValueChange={(value: any) => saveAdminControls({ archiveResolvedReports: value })} />
                <AdminControlSwitch title="Protect main admin" subtitle="Main owner cannot be removed or limited by other admins." value={adminControls.protectMainAdmin} onValueChange={(value: any) => saveAdminControls({ protectMainAdmin: value })} />
              </View>
            )}

            {adminTab === 'Reports' && (
              <View style={styles.adminPanelCard}>
                <Text style={styles.adminPanelTitle}>Safety Reports</Text>
                {reports.map(item => (
                  <View key={item.id} style={styles.reportCard}>
                    <View style={styles.reportTopRow}>
                      <AlertTriangle size={18} color="#9F1239" />
                      <View style={{ flex: 1 }}><Text style={styles.adminListTitle}>{item.account}</Text><Text style={styles.adminListSub}>{item.handle} • {item.status}</Text></View>
                    </View>
                    <Text style={styles.reportReason}>{item.reason}</Text>
                    <View style={styles.reportActionRow}>
                      <TouchableOpacity style={styles.reportButton} onPress={() => moderateReport(item.id, 'blocked')}><Ban size={14} color="#FFFFFF" /><Text style={styles.reportButtonText}>Block</Text></TouchableOpacity>
                      <TouchableOpacity style={styles.reportButton} onPress={() => moderateReport(item.id, 'suspended')}><Lock size={14} color="#FFFFFF" /><Text style={styles.reportButtonText}>Suspend</Text></TouchableOpacity>
                      <TouchableOpacity style={styles.reportDangerButton} onPress={() => moderateReport(item.id, 'deleted')}><Trash2 size={14} color="#FFFFFF" /><Text style={styles.reportButtonText}>Delete</Text></TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>



      <Modal visible={adminToolsMenuVisible} transparent animationType="fade" onRequestClose={() => setAdminToolsMenuVisible(false)}>
        <View style={styles.adminToolsOverlay}>
          <View style={styles.adminToolsCard}>
            <LinearGradient colors={['#021F18', '#064E3B']} style={styles.adminToolsHeader}>
              <View style={styles.adminToolsHeaderTop}>
                <TouchableOpacity style={styles.adminToolsBackButton} onPress={() => setAdminToolsMenuVisible(false)}>
                  <ChevronRight size={16} color="#064E3B" style={{ transform: [{ rotate: '180deg' }] }} />
                  <Text style={styles.adminToolsBackText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.adminToolsCloseButton} onPress={() => setAdminToolsMenuVisible(false)}>
                  <X size={18} color="#064E3B" />
                </TouchableOpacity>
              </View>
              <Text style={styles.adminToolsTitle}>Admin Dashboard</Text>
              <Text style={styles.adminToolsSubtitle}>Choose what you want to manage</Text>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.adminToolsList}>
              <TouchableOpacity style={styles.adminToolOption} onPress={() => chooseAdminTool('Profile')}>
                <View style={styles.adminToolIcon}><UserCog size={18} color="#D8B85A" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminToolTitle}>Profile & public visibility</Text>
                  <Text style={styles.adminToolText}>Edit your public admin profile and suggestion visibility.</Text>
                </View>
                <ChevronRight size={17} color="#064E3B" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.adminToolOption} onPress={() => chooseAdminTool('Create')}>
                <View style={styles.adminToolIcon}><Users size={18} color="#D8B85A" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminToolTitle}>Create community or channel</Text>
                  <Text style={styles.adminToolText}>Create your community feed account and official channel.</Text>
                </View>
                <ChevronRight size={17} color="#064E3B" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.adminToolOption} onPress={() => chooseAdminTool('Tasks')}>
                <View style={styles.adminToolIcon}><Calendar size={18} color="#D8B85A" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminToolTitle}>Assign Admin Task</Text>
                  <Text style={styles.adminToolText}>Give work to admins, cancel, reassign, complete, or delete tasks.</Text>
                </View>
                <ChevronRight size={17} color="#064E3B" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.adminToolOption} onPress={() => chooseAdminTool('Admins')}>
                <View style={styles.adminToolIcon}><Shield size={18} color="#D8B85A" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminToolTitle}>Admin access limits</Text>
                  <Text style={styles.adminToolText}>Add admins, remove admins, pause access, and limit features.</Text>
                </View>
                <ChevronRight size={17} color="#064E3B" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.adminToolOption} onPress={() => chooseAdminTool('Reports')}>
                <View style={styles.adminToolIcon}><AlertTriangle size={18} color="#D8B85A" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminToolTitle}>Reports & safety</Text>
                  <Text style={styles.adminToolText}>Block, suspend, remove, or delete disturbing accounts.</Text>
                </View>
                <ChevronRight size={17} color="#064E3B" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.adminToolOption} onPress={() => chooseAdminTool('SettingsModal')}>
                <View style={styles.adminToolIcon}><Settings size={18} color="#D8B85A" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminToolTitle}>Advanced admin settings</Text>
                  <Text style={styles.adminToolText}>Control owner-only access, approvals, reports, alerts, and moderation.</Text>
                </View>
                <ChevronRight size={17} color="#064E3B" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.adminToolBackWide} onPress={() => setAdminToolsMenuVisible(false)}>
                <X size={16} color="#064E3B" />
                <Text style={styles.adminToolBackWideText}>Cancel and return to Admin Dashboard</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={adminProfileImageOpen} transparent animationType="fade" onRequestClose={() => setAdminProfileImageOpen(false)}>
        <View style={styles.profileImageOverlay}>
          <TouchableOpacity style={styles.profileImageClose} onPress={() => setAdminProfileImageOpen(false)}>
            <X size={22} color="#FFFFFF" />
          </TouchableOpacity>
          {adminProfile.avatar ? <Image source={{ uri: adminProfile.avatar }} style={styles.profileImageFull} resizeMode="contain" /> : null}
          <View style={styles.profileImageActions}>
            <TouchableOpacity style={styles.profileImageAction} onPress={pickAdminProfileImage}><ImageIcon size={16} color="#064E3B" /><Text style={styles.profileImageActionText}>Change</Text></TouchableOpacity>
            <TouchableOpacity style={styles.profileImageAction} onPress={takeAdminProfileImage}><Camera size={16} color="#064E3B" /><Text style={styles.profileImageActionText}>Camera</Text></TouchableOpacity>
            <TouchableOpacity style={styles.profileImageDanger} onPress={removeAdminProfileImage}><Trash2 size={16} color="#FFFFFF" /><Text style={styles.profileImageDangerText}>Remove</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={adminSettingsOpen} transparent animationType="fade" onRequestClose={() => setAdminSettingsOpen(false)}>
        <View style={styles.adminSettingsOverlay}>
          <View style={styles.adminSettingsCard}>
            <View style={styles.adminSettingsHeader}>
              <Text style={styles.adminSettingsTitle}>Admin Settings</Text>
              <TouchableOpacity onPress={() => setAdminSettingsOpen(false)}><X size={22} color="#064E3B" /></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.adminSettingsAction} onPress={() => { setAdminSettingsOpen(false); setAdminTab('Settings'); }}><Settings size={18} color="#D8B85A" /><Text style={styles.adminSettingsActionText}>Access & permissions</Text></TouchableOpacity>
            <TouchableOpacity style={styles.adminSettingsAction} onPress={() => { setAdminSettingsOpen(false); setAdminTab('Admins'); }}><UserCog size={18} color="#D8B85A" /><Text style={styles.adminSettingsActionText}>Admin team</Text></TouchableOpacity>
            <TouchableOpacity style={styles.adminSettingsAction} onPress={() => { setAdminSettingsOpen(false); setAdminTab('Reports'); }}><AlertTriangle size={18} color="#D8B85A" /><Text style={styles.adminSettingsActionText}>Safety reports</Text></TouchableOpacity>
            <TouchableOpacity style={styles.adminSettingsAction} onPress={() => { setAdminSettingsOpen(false); setAdminTab('Profile'); }}><Eye size={18} color="#D8B85A" /><Text style={styles.adminSettingsActionText}>Public profile visibility</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 13,
    paddingTop: 56,
    paddingBottom: 28,
  },

  topCircle: {
    position: 'absolute',
    top: -70,
    right: -78,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: '#D9EAE2',
    opacity: 0.82,
  },

  topCircleSmall: {
    position: 'absolute',
    top: 165,
    left: -55,
    width: 105,
    height: 105,
    borderRadius: 999,
    backgroundColor: '#E3D0A0',
    opacity: 0.3,
  },

  goldBlur: {
    position: 'absolute',
    top: 360,
    right: -56,
    width: 105,
    height: 105,
    borderRadius: 999,
    backgroundColor: '#D8B85A',
    opacity: 0.12,
  },

  greenBlur: {
    position: 'absolute',
    bottom: 180,
    left: -72,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: '#064E3B',
    opacity: 0.055,
  },

  greetingBar: {
    marginBottom: 12,
    paddingHorizontal: 2,
  },

  greetingText: {
    fontSize: 17,
    fontWeight: '800',
  },

  greetingEmail: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },

  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  bentoButton: {
    borderRadius: 18,
    shadowColor: '#2B2418',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  bentoIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  bentoDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#D8B85A',
  },

  themeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    paddingVertical: 5,
    paddingLeft: 10,
    paddingRight: 4,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  themeText: {
    color: '#064E3B',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 6,
    marginRight: 2,
  },

  header: {
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 11,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#021F18',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 7,
  },

  headerGlow: {
    position: 'absolute',
    top: -58,
    right: -35,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  headerGlowTwo: {
    position: 'absolute',
    bottom: -65,
    left: -45,
    width: 158,
    height: 158,
    borderRadius: 999,
    backgroundColor: 'rgba(216,184,90,0.12)',
  },

  headerRing: {
    position: 'absolute',
    top: 48,
    left: -70,
    width: 108,
    height: 108,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    marginBottom: 9,
  },

  badgeText: {
    color: '#F6D365',
    marginLeft: 5,
    fontSize: 8.8,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  logoOrb: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
    borderWidth: 1,
    borderColor: 'rgba(246,211,101,0.5)',
  },

  logoSparkle: {
    position: 'absolute',
    top: 8,
    right: 10,
  },

  title: {
    color: '#ffffff',
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: 1.9,
    textAlign: 'center',
  },

  centerLine: {
    width: 42,
    height: 2.2,
    backgroundColor: '#F6D365',
    borderRadius: 999,
    marginVertical: 8,
  },

  subtitle: {
    color: '#F6D365',
    fontSize: 10.8,
    fontWeight: '900',
    textAlign: 'center',
  },

  description: {
    color: '#DAF3E9',
    marginTop: 6,
    fontSize: 10.1,
    lineHeight: 15.2,
    textAlign: 'center',
    paddingHorizontal: 5,
    fontWeight: '600',
  },

  headerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderRadius: 16,
    paddingVertical: 6.5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },

  headerStat: {
    alignItems: 'center',
    minWidth: 50,
    maxWidth: 82,
  },

  headerStatNumber: {
    color: '#FFFFFF',
    fontSize: 9.6,
    fontWeight: '900',
    textAlign: 'center',
  },

  headerStatLabel: {
    color: '#DDF8EF',
    fontSize: 7.2,
    fontWeight: '800',
    marginTop: 1,
  },

  headerStatDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: 5,
  },

  dateCard: {
    borderRadius: 18,
    padding: 10,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    shadowColor: '#2B2418',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.045,
    shadowRadius: 8,
    elevation: 2,
  },

  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  dateIconBox: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: '#E6F1EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  dateMainTitle: {
    color: '#032D22',
    fontSize: 12.2,
    fontWeight: '900',
  },

  dateMainSub: {
    color: '#746A5D',
    fontSize: 8.4,
    fontWeight: '700',
    marginTop: 1,
  },

  dateDivider: {
    height: 1,
    backgroundColor: '#E5D9C3',
    marginBottom: 7,
  },

  datePrimaryLine: {
    color: '#032D22',
    fontSize: 10.3,
    fontWeight: '800',
    lineHeight: 14.5,
    marginBottom: 4,
  },

  dateArabicLine: {
    color: '#9A6A16',
    fontSize: 10.2,
    fontWeight: '900',
    lineHeight: 14,
  },

  sectionHeader: {
    marginBottom: 8,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 15.4,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  sectionSubtitle: {
    marginTop: 1.5,
    fontSize: 10.1,
    fontWeight: '600',
  },

  sectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    paddingVertical: 4.5,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E1D2AD',
  },

  sectionPillText: {
    color: '#032D22',
    fontSize: 8.2,
    fontWeight: '900',
    marginLeft: 3,
  },

  duaCard: {
    backgroundColor: '#043B2D',
    borderRadius: 17,
    paddingVertical: 9,
    paddingHorizontal: 10,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#021F18',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.13,
    shadowRadius: 9,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
  },

  duaGlow: {
    position: 'absolute',
    right: -18,
    top: -22,
    width: 98,
    height: 98,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  duaGoldGlow: {
    position: 'absolute',
    left: -25,
    bottom: -28,
    width: 82,
    height: 82,
    borderRadius: 999,
    backgroundColor: 'rgba(246,211,101,0.1)',
  },

  duaIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  sparkle: {
    position: 'absolute',
    top: 6,
    right: 6,
  },

  duaTextContainer: {
    flex: 1,
  },

  duaTitle: {
    color: '#ffffff',
    fontSize: 11.6,
    fontWeight: '900',
    marginBottom: 2,
  },

  duaDescription: {
    color: '#E7F8F0',
    fontSize: 9.3,
    lineHeight: 12.8,
    marginBottom: 3,
    fontWeight: '600',
  },

  duaButtonText: {
    color: '#F6D365',
    fontSize: 9.2,
    fontWeight: '900',
    lineHeight: 12.6,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 16,
  },

  card: {
    width: '29.9%',
    marginHorizontal: '1.7%',
    borderRadius: 13,
    paddingVertical: 6.2,
    paddingHorizontal: 3.5,
    marginBottom: 6.5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    overflow: 'hidden',
    shadowColor: '#2B2418',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
  },

  lastCard: {
    marginLeft: '35.05%',
    marginRight: '35.05%',
  },

  cardGlow: {
    position: 'absolute',
    top: -18,
    right: -18,
    width: 48,
    height: 48,
    borderRadius: 999,
    opacity: 0.8,
  },

  iconContainer: {
    width: 25,
    height: 25,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
  },

  cardTitle: {
    textAlign: 'center',
    fontWeight: '900',
    lineHeight: 10.2,
    letterSpacing: 0.01,
  },

  footerContainer: {
    paddingBottom: 20,
    alignItems: 'center',
  },

  footerLine: {
    width: 34,
    height: 2.4,
    borderRadius: 999,
    backgroundColor: '#D8B85A',
    marginBottom: 6,
  },

  footer: {
    fontSize: 10,
    fontWeight: '800',
  },

  sideOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(244,239,229,0.55)',
  },

  sideBackdrop: {
    flex: 1,
  },

  sideMenu: {
    width: '84%',
    maxWidth: 345,
    height: '100%',
    backgroundColor: '#F4EFE5',
    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },

  sideMenuHeader: {
    paddingTop: 42,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },

  sideMenuTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sideTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },

  sideSubtitle: {
    color: '#DDF8EF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: '#FFFDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 999,
  },

  sideBadgeText: {
    color: '#D8B85A',
    marginLeft: 6,
    fontSize: 10,
    fontWeight: '900',
  },

  menuSection: {
    backgroundColor: '#FFFDF8',
    borderRadius: 19,
    padding: 12,
    marginHorizontal: 12,
    marginTop: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  menuSectionTitle: {
    color: '#032D22',
    fontSize: 13.2,
    fontWeight: '900',
    marginLeft: 6,
  },

  menuNote: {
    color: '#746A5D',
    fontSize: 9.6,
    lineHeight: 14,
    fontWeight: '600',
    marginTop: 8,
  },

  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFE3',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    overflow: 'hidden',
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E7D8',
  },

  dropdownFlag: {
    fontSize: 20,
    marginRight: 9,
  },

  dropdownTextBox: {
    flex: 1,
  },

  dropdownLabel: {
    color: '#032D22',
    fontSize: 11.2,
    fontWeight: '900',
  },

  dropdownSub: {
    color: '#746A5D',
    fontSize: 8.8,
    fontWeight: '700',
    marginTop: 1,
  },

  aboutToggle: {
    backgroundColor: '#F5EFE3',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  aboutToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  aboutIconBox: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  aboutTitleBox: {
    flex: 1,
  },

  aboutPreview: {
    color: '#746A5D',
    fontSize: 8.8,
    lineHeight: 12,
    fontWeight: '700',
    marginLeft: 6,
    marginTop: 2,
  },

  aboutChevronOpen: {
    transform: [{ rotate: '180deg' }],
  },

  aboutContent: {
    marginTop: 10,
  },

  aboutQuoteBox: {
    backgroundColor: '#064E3B',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 11,
    marginBottom: 10,
  },

  aboutQuote: {
    color: '#D8B85A',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 16,
  },

  aboutText: {
    color: '#4B4036',
    fontSize: 10.3,
    lineHeight: 16.8,
    fontWeight: '600',
    textAlign: 'center',
  },

  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },

  ratingInput: {
    minHeight: 82,
    backgroundColor: '#F5EFE3',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    padding: 10,
    color: '#032D22',
    fontSize: 10.5,
    fontWeight: '600',
    textAlignVertical: 'top',
  },

  submitReviewButton: {
    backgroundColor: '#064E3B',
    borderRadius: 15,
    paddingVertical: 10,
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitReviewText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
    marginLeft: 6,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFE3',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 9,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  settingIcon: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  settingTextBox: {
    flex: 1,
  },

  settingTitle: {
    color: '#032D22',
    fontSize: 10.5,
    fontWeight: '900',
  },

  settingSubtitle: {
    color: '#746A5D',
    fontSize: 8.8,
    lineHeight: 12,
    fontWeight: '600',
    marginTop: 1,
  },

  logoutButton: {
    backgroundColor: '#991B1B',
    borderRadius: 17,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    marginTop: 16,
  },

  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  doneButton: {
    backgroundColor: '#064E3B',
    borderRadius: 17,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 22,
  },

  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginRight: 5,
  },

  adminOpenButton: {
    backgroundColor: '#064E3B',
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  adminOpenText: {
    color: '#FFFFFF',
    fontSize: 10.8,
    fontWeight: '900',
    marginHorizontal: 7,
  },

  adminContent: {
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 38,
  },

  adminHero: {
    borderRadius: 27,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },

  adminHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  adminBadgeGold: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8E7B8',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
  },

  adminBadgeGoldText: {
    color: '#064E3B',
    marginLeft: 6,
    fontSize: 10,
    fontWeight: '900',
  },

  adminCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: '#FFFDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  adminHeroTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
  },

  adminHeroText: {
    color: '#DDF8EF',
    fontSize: 11.2,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 6,
  },

  adminStatsRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 14,
  },

  adminStatBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 15,
    paddingVertical: 9,
    alignItems: 'center',
  },

  adminStatNumber: {
    color: '#F6D365',
    fontSize: 14,
    fontWeight: '900',
  },

  adminStatLabel: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 2,
  },

  adminTabs: {
    marginBottom: 12,
  },

  adminTabPill: {
    backgroundColor: '#FFFDF8',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 13,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  adminTabPillActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },

  adminTabText: {
    color: '#064E3B',
    fontSize: 10,
    fontWeight: '900',
  },

  adminTabTextActive: {
    color: '#FFFFFF',
  },

  adminProfileCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 12,
  },

  adminAvatar: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  adminAvatarText: {
    color: '#D8B85A',
    fontSize: 17,
    fontWeight: '900',
  },

  adminProfileName: {
    color: '#032D22',
    fontSize: 16,
    fontWeight: '900',
  },

  adminProfileHandle: {
    color: '#9A6A16',
    fontSize: 10.4,
    fontWeight: '900',
    marginTop: 2,
  },

  adminProfileBio: {
    color: '#746A5D',
    fontSize: 10.4,
    lineHeight: 15,
    fontWeight: '700',
    marginTop: 6,
  },

  adminNoticeCard: {
    backgroundColor: '#043B2D',
    borderRadius: 18,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  adminNoticeText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: '800',
    marginLeft: 9,
  },

  adminPanelCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 22,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 14,
  },

  adminPanelTitle: {
    color: '#032D22',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 10,
  },

  adminInput: {
    backgroundColor: '#F5EFE3',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    color: '#032D22',
    paddingVertical: 10,
    paddingHorizontal: 11,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 9,
  },

  adminTextArea: {
    minHeight: 86,
    textAlignVertical: 'top',
  },

  adminSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5EFE3',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 7,
  },

  adminSwitchTitle: {
    color: '#032D22',
    fontSize: 10.6,
    fontWeight: '900',
    flex: 1,
  },

  adminPrimaryButton: {
    backgroundColor: '#064E3B',
    borderRadius: 15,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },

  adminPrimaryText: {
    color: '#FFFFFF',
    fontSize: 10.8,
    fontWeight: '900',
    marginLeft: 7,
  },

  adminListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFE3',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  adminMiniAvatar: {
    width: 37,
    height: 37,
    borderRadius: 14,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  adminMiniAvatarText: {
    color: '#D8B85A',
    fontWeight: '900',
  },

  adminListTitle: {
    color: '#032D22',
    fontSize: 11.4,
    fontWeight: '900',
  },

  adminListSub: {
    color: '#746A5D',
    fontSize: 9.2,
    fontWeight: '700',
    marginTop: 2,
  },

  adminSmallButton: {
    backgroundColor: '#064E3B',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },

  adminSmallButtonDone: {
    backgroundColor: '#9A6A16',
  },

  adminSmallButtonText: {
    color: '#FFFFFF',
    fontSize: 9.4,
    fontWeight: '900',
  },

  adminAcceptButton: {
    width: 31,
    height: 31,
    borderRadius: 12,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  adminRejectButton: {
    width: 31,
    height: 31,
    borderRadius: 12,
    backgroundColor: '#9F1239',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  adminIconButton: {
    width: 31,
    height: 31,
    borderRadius: 12,
    backgroundColor: '#E6F1EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  adminDangerIconButton: {
    width: 31,
    height: 31,
    borderRadius: 12,
    backgroundColor: '#9F1239',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  reportCard: {
    backgroundColor: '#F5EFE3',
    borderRadius: 17,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 10,
  },

  reportTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  reportReason: {
    color: '#4B4036',
    fontSize: 10.2,
    lineHeight: 15,
    fontWeight: '700',
    marginTop: 8,
  },

  reportActionRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 10,
  },

  reportButton: {
    flex: 1,
    backgroundColor: '#064E3B',
    borderRadius: 13,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  reportDangerButton: {
    flex: 1,
    backgroundColor: '#9F1239',
    borderRadius: 13,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 9.4,
    fontWeight: '900',
    marginLeft: 5,
  },


  adminTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  adminAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
  },

  adminProfilePublicLine: {
    color: '#9A6A16',
    fontSize: 9.2,
    fontWeight: '800',
    marginTop: 4,
  },

  adminPhotoTools: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFE3',
    borderRadius: 18,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 10,
  },

  adminProfilePhotoLarge: {
    width: 74,
    height: 74,
    borderRadius: 26,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D8B85A',
  },

  adminProfilePhotoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },

  adminPhotoTitle: {
    color: '#032D22',
    fontSize: 12.5,
    fontWeight: '900',
  },

  adminPhotoSub: {
    color: '#746A5D',
    fontSize: 9.2,
    fontWeight: '700',
    lineHeight: 13,
    marginTop: 2,
  },

  adminPhotoActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 8,
  },

  adminPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  adminPhotoButtonText: {
    color: '#064E3B',
    fontSize: 9,
    fontWeight: '900',
    marginLeft: 4,
  },

  adminPhotoDanger: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#9F1239',
    alignItems: 'center',
    justifyContent: 'center',
  },

  adminAccessChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 7,
  },

  adminAccessChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D9CDB8',
    backgroundColor: '#FFFDF8',
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  adminAccessChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },

  adminAccessChipText: {
    color: '#064E3B',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'capitalize',
  },

  adminAccessChipTextActive: {
    color: '#FFFFFF',
  },

  adminControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFE3',
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  adminControlTitle: {
    color: '#032D22',
    fontSize: 11.2,
    fontWeight: '900',
  },

  adminControlSub: {
    color: '#746A5D',
    fontSize: 8.8,
    lineHeight: 12.5,
    fontWeight: '700',
    marginTop: 2,
    paddingRight: 8,
  },

  profileImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  profileImageClose: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },

  profileImageFull: {
    width: '100%',
    height: '72%',
  },

  profileImageActions: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 30,
    flexDirection: 'row',
    gap: 8,
  },

  profileImageAction: {
    flex: 1,
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  profileImageActionText: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  profileImageDanger: {
    flex: 1,
    backgroundColor: '#9F1239',
    borderRadius: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  profileImageDangerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  adminSettingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2,31,24,0.55)',
    justifyContent: 'center',
    padding: 20,
  },

  adminSettingsCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 24,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  adminSettingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  adminSettingsTitle: {
    color: '#032D22',
    fontSize: 17,
    fontWeight: '900',
  },

  adminSettingsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFE3',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 11,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  adminSettingsActionText: {
    color: '#032D22',
    fontSize: 11.5,
    fontWeight: '900',
    marginLeft: 8,
  },


  adminMenuPreviewCard: {
    borderRadius: 18,
    padding: 12,
    marginTop: 9,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  adminMenuPreviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  adminMenuCrown: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: '#FFFDF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E1D2AD',
  },

  adminMenuPreviewTitle: {
    color: '#032D22',
    fontSize: 13.2,
    fontWeight: '900',
  },

  adminMenuPreviewText: {
    color: '#746A5D',
    fontSize: 9.5,
    lineHeight: 13.5,
    fontWeight: '700',
    marginTop: 2,
  },

  adminMenuMetricRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 11,
  },

  adminMenuMetric: {
    flex: 1,
    backgroundColor: '#FFFDF8',
    borderRadius: 14,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  adminMenuMetricNumber: {
    color: '#064E3B',
    fontSize: 14,
    fontWeight: '900',
  },

  adminMenuMetricLabel: {
    color: '#9A6A16',
    fontSize: 8.2,
    fontWeight: '900',
    marginTop: 2,
  },

  adminBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 11,
  },

  adminBackText: {
    color: '#064E3B',
    fontSize: 10.5,
    fontWeight: '900',
    marginLeft: 3,
  },

  adminQuickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 12,
  },

  adminQuickCard: {
    width: '48.6%',
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  adminQuickTitle: {
    color: '#032D22',
    fontSize: 11.5,
    fontWeight: '900',
    marginTop: 7,
  },

  adminQuickText: {
    color: '#746A5D',
    fontSize: 8.8,
    lineHeight: 12.5,
    fontWeight: '700',
    marginTop: 3,
  },

  adminSectionNote: {
    color: '#746A5D',
    fontSize: 10,
    lineHeight: 14.5,
    fontWeight: '700',
    marginBottom: 10,
  },

  adminAssigneeScroll: {
    marginBottom: 10,
  },

  adminAssigneePill: {
    backgroundColor: '#F5EFE3',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 7,
  },

  adminAssigneePillActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },

  adminAssigneeText: {
    color: '#064E3B',
    fontSize: 9.5,
    fontWeight: '900',
  },

  adminAssigneeTextActive: {
    color: '#FFFFFF',
  },

  adminTaskCard: {
    backgroundColor: '#F5EFE3',
    borderRadius: 17,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 10,
  },

  adminTaskCardDone: {
    opacity: 0.78,
    backgroundColor: '#EEF4EE',
  },

  adminTaskTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  taskCheck: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#FFFDF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  taskCheckDone: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },

  adminTaskTitle: {
    color: '#032D22',
    fontSize: 11.2,
    fontWeight: '900',
    lineHeight: 15.5,
  },

  adminTaskSub: {
    color: '#746A5D',
    fontSize: 8.8,
    fontWeight: '700',
    marginTop: 3,
  },

  adminTaskReassignRow: {
    marginTop: 10,
  },


  adminManageHeader: {
    backgroundColor: '#FFFDF8',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  adminManageTitle: {
    color: '#032D22',
    fontSize: 15.5,
    fontWeight: '900',
  },

  adminManageSubtitle: {
    color: '#746A5D',
    fontSize: 10.2,
    lineHeight: 15,
    fontWeight: '700',
    marginTop: 3,
  },

  adminManageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  adminManageCard: {
    width: '48.5%',
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 9,
    shadowColor: '#021F18',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.045,
    shadowRadius: 8,
    elevation: 2,
  },

  adminManageCardActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },

  adminManageIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: '#E6F1EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  adminManageIconActive: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },

  adminManageCardTitle: {
    color: '#032D22',
    fontSize: 12.3,
    fontWeight: '900',
  },

  adminManageCardTitleActive: {
    color: '#FFFFFF',
  },

  adminManageCardSub: {
    color: '#746A5D',
    fontSize: 9.3,
    lineHeight: 13,
    fontWeight: '700',
    marginTop: 2,
  },

  adminManageCardSubActive: {
    color: '#DDF8EF',
  },

  adminPanelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  adminCancelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFE3',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  adminCancelPillText: {
    color: '#064E3B',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 4,
  },


  adminInlineBackButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    marginTop: -2,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  adminInlineBackText: {
    color: '#064E3B',
    fontSize: 10.5,
    fontWeight: '900',
    marginLeft: 4,
  },

  adminToolsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3,45,34,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  adminToolsCard: {
    backgroundColor: '#F4EFE5',
    borderRadius: 28,
    overflow: 'hidden',
    maxHeight: '86%',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  adminToolsHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },

  adminToolsHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  adminToolsBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 11,
  },

  adminToolsBackText: {
    color: '#064E3B',
    fontSize: 10.5,
    fontWeight: '900',
    marginLeft: 3,
  },

  adminToolsCloseButton: {
    width: 35,
    height: 35,
    borderRadius: 14,
    backgroundColor: '#FFFDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  adminToolsTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  adminToolsSubtitle: {
    color: '#D8B85A',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
  },

  adminToolsList: {
    padding: 12,
    paddingBottom: 18,
  },

  adminToolOption: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    padding: 12,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    flexDirection: 'row',
    alignItems: 'center',
  },

  adminToolIcon: {
    width: 39,
    height: 39,
    borderRadius: 15,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  adminToolTitle: {
    color: '#032D22',
    fontSize: 12.2,
    fontWeight: '900',
  },

  adminToolText: {
    color: '#746A5D',
    fontSize: 9.5,
    fontWeight: '700',
    lineHeight: 13.5,
    marginTop: 2,
  },

  adminToolBackWide: {
    marginTop: 3,
    borderRadius: 17,
    paddingVertical: 12,
    backgroundColor: '#E6F1EC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D9CDB8',
  },

  adminToolBackWideText: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

});

const SettingRow = ({
  icon: Icon,
  title,
  subtitle,
  value,
  onValueChange,
}: any) => (
  <View style={styles.settingRow}>
    <View style={styles.settingIcon}>
      <Icon size={15} color="#D8B85A" />
    </View>

    <View style={styles.settingTextBox}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingSubtitle}>{subtitle}</Text>
    </View>

    <Switch
      value={value}
      onValueChange={onValueChange}
      thumbColor={value ? '#D8B85A' : '#F1E7D5'}
      trackColor={{
        false: '#D9CDB8',
        true: '#064E3B',
      }}
    />
  </View>
);

const AdminControlSwitch = ({ title, subtitle, value, onValueChange }: any) => (
  <View style={styles.adminControlRow}>
    <View style={{ flex: 1 }}>
      <Text style={styles.adminControlTitle}>{title}</Text>
      <Text style={styles.adminControlSub}>{subtitle}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      thumbColor={value ? '#D8B85A' : '#F1E7D5'}
      trackColor={{ false: '#D9CDB8', true: '#064E3B' }}
    />
  </View>
);