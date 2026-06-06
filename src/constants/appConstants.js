// src/constants/appConstants.js

export const APP_NAME = 'CHAFADIA NOOR';

export const APP_VERSION = '1.0.0';

export const COMPANY_NAME =
  'Chafadia';

export const SUPPORT_EMAIL =
  'support@chafadianoor.com';

export const WEBSITE =
  'https://www.chafadianoor.com';

export const PRIVACY_POLICY =
  'https://www.chafadianoor.com/privacy';

export const TERMS_OF_SERVICE =
  'https://www.chafadianoor.com/terms';

export const DEFAULT_LANGUAGE = 'en';

export const AVAILABLE_LANGUAGES = [
  {
    code: 'en',
    name: 'English',
  },

  {
    code: 'fr',
    name: 'Français',
  },

  {
    code: 'ar',
    name: 'العربية',
  },
];

export const STORAGE_KEYS = {
  USER: '@cn_user',

  TOKEN: '@cn_token',

  THEME: '@cn_theme',

  LANGUAGE: '@cn_language',

  CHAT_MESSAGES: '@cn_chat_messages',

  SAVED_POSTS: '@cn_saved_posts',

  COMMUNITY_POSTS: '@cn_community_posts',

  NOTIFICATIONS: '@cn_notifications',

  QURAN_BOOKMARKS: '@cn_quran_bookmarks',

  LAST_READ_SURAH: '@cn_last_read_surah',

  AZKAR_COUNTER: '@cn_azkar_counter',

  RAMADAN_TRACKER: '@cn_ramadan_tracker',

  DAILY_GOALS: '@cn_daily_goals',
};

export const FIREBASE_COLLECTIONS = {
  USERS: 'users',

  CHATS: 'chats',

  MESSAGES: 'messages',

  CALLS: 'calls',

  GROUPS: 'groups',

  COMMUNITY_POSTS: 'communityPosts',

  COMMENTS: 'comments',

  LIKES: 'likes',

  SAVED_POSTS: 'savedPosts',

  NOTIFICATIONS: 'notifications',

  REPORTS: 'reports',

  STATUS: 'statuses',

  FOLLOWERS: 'followers',

  FOLLOWING: 'following',

  EVENTS: 'events',

  CHARITY: 'charity',

  REMINDERS: 'reminders',
};

export const STORAGE_FOLDERS = {
  PROFILES: 'profilePictures',

  CHAT_IMAGES: 'chatImages',

  CHAT_VIDEOS: 'chatVideos',

  VOICE_NOTES: 'voiceNotes',

  DOCUMENTS: 'documents',

  COMMUNITY: 'community',

  STATUS: 'statuses',

  EVENTS: 'events',

  QURAN_AUDIO: 'quranAudio',

  DUA_AUDIO: 'duaAudio',
};

export const POST_TYPES = [
  'General',

  'Reminder',

  'Question',

  'Announcement',

  'Event',

  'Charity',

  'Education',
];

export const MESSAGE_TYPES = {
  TEXT: 'text',

  IMAGE: 'image',

  VIDEO: 'video',

  AUDIO: 'audio',

  FILE: 'file',
};

export const CALL_TYPES = {
  VOICE: 'voice',

  VIDEO: 'video',
};

export const USER_ROLES = {
  USER: 'user',

  MODERATOR: 'moderator',

  ADMIN: 'admin',
};

export const ISLAMIC_FEATURES = [
  'Prayer Times',

  'Qibla Compass',

  'Quran',

  'Tafsir',

  'Hadith',

  'Azkar & Dua',

  'Tasbeeh Counter',

  'Arabic Learning',

  'Ramadan Mode',

  'Islamic Calendar',

  'Mosque Finder',

  'Community Feed',
];

export const SOCIAL_REACTIONS = [
  '❤️',
  '👍',
  '🔥',
  '😍',
  '🤲',
  '😊',
  '😭',
  '🎉',
];

export const LEADERBOARD_TYPES = [
  'Arabic Learning',

  'Quran Reading',

  'Daily Dhikr',

  'Prayer Consistency',

  'Community Support',
];

export const RAMADAN_FEATURES = [
  'Fasting Tracker',

  'Suhoor Reminder',

  'Iftar Reminder',

  'Quran Goals',

  'Daily Duas',

  'Charity Tracker',

  'Ramadan Calendar',
];

export const AI_FEATURES = [
  'Islamic Assistant',

  'Arabic Tutor',

  'Prayer Guide',

  'Learning Suggestions',

  'Voice Conversation',

  'Pronunciation Correction',
];

export const DEFAULT_PROFILE = {
  fullName: '',

  username: '',

  phone: '',

  email: '',

  bio: '',

  profilePicture: '',

  followers: 0,

  following: 0,

  totalLikes: 0,

  verified: false,
};

export const COLORS = {
  PRIMARY: '#064E3B',

  PRIMARY_DARK: '#032D22',

  SECONDARY: '#D8B85A',

  BACKGROUND: '#F5EFE3',

  CARD: '#FFFDF8',

  TEXT: '#1F2937',

  TEXT_LIGHT: '#6B7280',

  WHITE: '#FFFFFF',

  SUCCESS: '#0D9488',

  ERROR: '#DC2626',

  WARNING: '#F59E0B',

  INFO: '#2563EB',
};

export const GRADIENTS = {
  PRIMARY: ['#032D22', '#064E3B'],

  GOLD: ['#D8B85A', '#C89B3C'],

  LIGHT: ['#FFFDF8', '#F5EFE3'],

  EMERALD: ['#064E3B', '#0D7054'],
};

export const SCREEN_NAMES = {
  HOME: 'Home',

  QURAN: 'Quran',

  HADITH: 'Hadith',

  AZKAR: 'Azkar',

  TASBEEH: 'Tasbeeh',

  PRAYER: 'Prayer',

  RAMADAN: 'Ramadan',

  MOSQUE: 'Mosque',

  CALENDAR: 'Calendar',

  ARABIC: 'Arabic',

  COMMUNITY: 'Community',

  COMMUNICATION: 'Communication',

  PROFILE: 'Profile',

  SETTINGS: 'Settings',
};

export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',

  CALL: 'call',

  REMINDER: 'reminder',

  EVENT: 'event',

  COMMUNITY: 'community',

  SYSTEM: 'system',
};

export const PERMISSIONS = {
  CAMERA: 'camera',

  MICROPHONE: 'microphone',

  LOCATION: 'location',

  STORAGE: 'storage',

  NOTIFICATIONS: 'notifications',
};

export const DUMMY_AVATAR =
  'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

export const DEFAULT_STATUS =
  'السلام عليكم ورحمة الله وبركاته';

export const ABOUT_APP = `
CHAFADIA NOOR is a complete Islamic lifestyle platform created with love, faith and remembrance.

This platform was designed to help Muslims pray, learn Islam, connect with community, grow spiritually and benefit the Ummah through knowledge, الخير and service.

May Allah place barakah, mercy and continuous reward in this work for everyone involved.
`;

export default {
  APP_NAME,

  APP_VERSION,

  COLORS,

  STORAGE_KEYS,

  FIREBASE_COLLECTIONS,

  STORAGE_FOLDERS,
};