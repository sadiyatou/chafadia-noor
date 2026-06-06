import COLORS from './colors';

export const currentUser = {
  id: 'u1',

  fullName: 'Sadiyatou Chafiou',

  username: '@sadiyatou',

  email: 'sadiyatou@gmail.com',

  phone: '+237 6XX XXX XXX',

  bio: 'Guided by faith, love and الخير',

  avatar:
    'https://randomuser.me/api/portraits/women/65.jpg',

  followers: 2450,

  following: 532,

  friends: 180,

  totalLikes: 58200,

  verified: true,

  online: true,
};

export const users = [
  currentUser,

  {
    id: 'u2',

    fullName: 'Abdoul Karim',

    username: '@abdoul',

    avatar:
      'https://randomuser.me/api/portraits/men/33.jpg',

    followers: 1200,

    following: 320,

    totalLikes: 25000,

    online: true,
  },

  {
    id: 'u3',

    fullName: 'Fatima Noor',

    username: '@fatima',

    avatar:
      'https://randomuser.me/api/portraits/women/44.jpg',

    followers: 850,

    following: 210,

    totalLikes: 12000,

    online: false,
  },
];

export const stories = [
  {
    id: 's1',

    user: users[1],

    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb',

    createdAt: '2h ago',
  },

  {
    id: 's2',

    user: users[2],

    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330',

    createdAt: '4h ago',
  },
];

export const communityPosts = [
  {
    id: 'p1',

    user: users[1],

    type: 'Reminder',

    caption:
      'Never forget that Salah is the peace of the believer.',

    image:
      'https://images.unsplash.com/photo-1542810634-71277d95dcbb',

    likes: 230,

    comments: 45,

    shares: 18,

    saved: 50,

    createdAt: '1h ago',
  },

  {
    id: 'p2',

    user: users[2],

    type: 'Question',

    caption:
      'Can someone explain the benefits of Salatul Duha?',

    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',

    likes: 120,

    comments: 33,

    shares: 5,

    saved: 14,

    createdAt: '3h ago',
  },

  {
    id: 'p3',

    user: currentUser,

    type: 'Charity',

    caption:
      'Food distribution project for Ramadan begins tomorrow in Yaoundé.',

    image:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c',

    likes: 980,

    comments: 210,

    shares: 300,

    saved: 120,

    createdAt: '5h ago',
  },
];

export const chats = [
  {
    id: 'c1',

    user: users[1],

    lastMessage:
      'السلام عليكم ورحمة الله',

    unread: 2,

    online: true,

    time: '09:45 AM',
  },

  {
    id: 'c2',

    user: users[2],

    lastMessage:
      'Did you complete today’s lesson?',

    unread: 0,

    online: false,

    time: 'Yesterday',
  },
];

export const messages = [
  {
    id: 'm1',

    senderId: 'u2',

    text:
      'السلام عليكم ورحمة الله وبركاته',

    time: '09:40 AM',

    type: 'text',
  },

  {
    id: 'm2',

    senderId: 'u1',

    text:
      'وعليكم السلام ورحمة الله وبركاته',

    time: '09:41 AM',

    type: 'text',
  },

  {
    id: 'm3',

    senderId: 'u2',

    text:
      'How are your Quran lessons going?',

    time: '09:42 AM',

    type: 'text',
  },
];

export const groups = [
  {
    id: 'g1',

    name: 'Arabic Learning Circle',

    members: 120,

    image:
      'https://images.unsplash.com/photo-1513258496099-48168024aec0',
  },

  {
    id: 'g2',

    name: 'Ramadan Preparation',

    members: 340,

    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
  },
];

export const leaderboard = [
  {
    id: 'l1',

    name: 'Amina Yusuf',

    points: 1250,

    level: 'Advanced',
  },

  {
    id: 'l2',

    name: 'Abdoul Karim',

    points: 1180,

    level: 'Intermediate',
  },

  {
    id: 'l3',

    name: 'Fatima Noor',

    points: 970,

    level: 'Intermediate',
  },
];

export const arabicLessons = [
  {
    id: 'a1',

    title: 'Arabic Alphabet',

    level: 'Beginner',

    lessons: 28,

    color: COLORS.lessonBlue,
  },

  {
    id: 'a2',

    title: 'Basic Conversations',

    level: 'Intermediate',

    lessons: 15,

    color: COLORS.lessonPurple,
  },

  {
    id: 'a3',

    title: 'Quranic Arabic',

    level: 'Advanced',

    lessons: 42,

    color: COLORS.lessonOrange,
  },
];

export const prayerTimes = [
  {
    name: 'Fajr',

    time: '05:01 AM',

    color: COLORS.fajr,
  },

  {
    name: 'Dhuhr',

    time: '12:24 PM',

    color: COLORS.dhuhr,
  },

  {
    name: 'Asr',

    time: '03:45 PM',

    color: COLORS.asr,
  },

  {
    name: 'Maghrib',

    time: '06:31 PM',

    color: COLORS.maghrib,
  },

  {
    name: 'Isha',

    time: '07:48 PM',

    color: COLORS.isha,
  },
];

export const duas = [
  {
    id: 'd1',

    title: 'Morning Dua',

    arabic:
      'اللّهـمَّ بِكَ أَصْـبَحْنا وَبِكَ أَمْسَـينا',

    english:
      'O Allah, by You we enter the morning and by You we enter the evening.',
  },

  {
    id: 'd2',

    title: 'Before Sleeping',

    arabic:
      'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',

    english:
      'In Your name O Allah, I die and I live.',
  },
];

export const notifications = [
  {
    id: 'n1',

    title: 'Prayer Reminder',

    message:
      'Dhuhr prayer begins in 15 minutes.',

    time: '10 min ago',
  },

  {
    id: 'n2',

    title: 'Arabic Lesson',

    message:
      'Your pronunciation exercise is ready.',

    time: '30 min ago',
  },
];

export const ramadanMeals = [
  {
    id: 'r1',

    day: 1,

    suhoor:
      'Koki beans, pap and avocado',

    iftar:
      'Dates, foléré juice and ndolé with plantains',
  },

  {
    id: 'r2',

    day: 2,

    suhoor:
      'Rice porridge and eggs',

    iftar:
      'Puff-puff, beans and grilled fish',
  },
];

export const islamicQuotes = [
  {
    id: 'q1',

    quote:
      'Indeed, prayer prohibits immorality and wrongdoing.',

    source: 'Quran 29:45',
  },

  {
    id: 'q2',

    quote:
      'The best among you are those who learn the Quran and teach it.',

    source: 'Sahih al-Bukhari',
  },
];

export default {
  currentUser,

  users,

  chats,

  messages,

  groups,

  stories,

  leaderboard,

  communityPosts,

  arabicLessons,

  prayerTimes,

  duas,

  notifications,

  ramadanMeals,

  islamicQuotes,
};