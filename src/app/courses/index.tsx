// src/app/islamic-courses/index.tsx

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Alert,
  Share,
  Linking,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import {
  Search,
  BookOpen,
  GraduationCap,
  Award,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  X,
  CheckCircle2,
  Clock,
  Users,
  Globe2,
  Link as LinkIcon,
  Upload,
  FileText,
  Image as ImageIcon,
  Trophy,
  Target,
  BarChart3,
  Sparkles,
  PenLine,
  Send,
  ChevronRight,
  BookMarked,
  School,
  UserRound,
  RefreshCcw,
  ClipboardCheck,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Hash,
  ScrollText,
  Lock,
  Download,
  AlertTriangle,
  TimerReset,
  FileCheck2,
  Library,
  NotebookPen,
  BadgeCheck,
} from 'lucide-react-native';

type Tab = 'Home' | 'Register' | 'Courses' | 'Notes' | 'Exercises' | 'Exams' | 'Certificates' | 'Sites' | 'Post';
type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Scholar Track';
type CourseCategory = 'Aqidah' | 'Fiqh' | 'Seerah' | 'Arabic' | 'Hadith' | 'Tafsir' | 'Islamic Finance' | 'Character' | 'Youth' | 'Teacher Training';
type QuestionType = 'Multiple Choice' | 'Short Answer' | 'Reflection';

type StudentProfile = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  gender: string;
  dateOfBirth: string;
  studentId: string;
  registered: boolean;
};

type CourseNote = {
  title: string;
  content: string[];
  keyPoints: string[];
  pdfTitle?: string;
  pdfPages?: string[];
  assignment?: string;
};

type CourseQuestion = {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  answer?: string;
  explanation: string;
  points: number;
};

type CourseItem = {
  id: string;
  title: string;
  category: CourseCategory;
  level: CourseLevel;
  teacher: string;
  lessons: number;
  duration: string;
  certificate: boolean;
  description: string;
  outcomes: string[];
  notes: CourseNote[];
  exercises: CourseQuestion[];
  finalExam: CourseQuestion[];
  passMark: number;
  rating: number;
  students: number;
  progress: number;
  saved?: boolean;
};

type LearningSite = {
  id: string;
  name: string;
  url: string;
  certificate: boolean;
  level: CourseLevel;
  description: string;
  strengths: string[];
  reactions: SiteReaction[];
};

type SiteReaction = {
  id: string;
  user: string;
  level: CourseLevel;
  success: string;
  reaction: string;
  rating: number;
  certificateTitle?: string;
};

type CertificatePost = {
  id: string;
  certificateNo: string;
  courseId: string;
  title: string;
  student: string;
  studentId: string;
  site: string;
  level: CourseLevel;
  score: number;
  issueDate: string;
  success: string;
  imageUri?: string;
  documentName?: string;
  likes: number;
  comments: string[];
};

type NewCourseForm = {
  title: string;
  teacher: string;
  category: CourseCategory;
  level: CourseLevel;
  lessons: string;
  duration: string;
  description: string;
  certificate: boolean;
};

type ExamAttempt = {
  count: number;
  lastAttemptAt?: number;
  lastScore?: number;
};

const GREEN = '#064E3B';
const EMERALD = '#0D7054';
const GOLD = '#D4A017';
const CREAM = '#F7F5EE';
const CARD = '#FFFDF8';
const MINT = '#E6F1EC';
const TEXT = '#3C3A34';
const ROSE = '#9F2D2D';
const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_PASS_MARK = 60;
const MAX_RETAKES = 2;

const EMPTY_STUDENT: StudentProfile = {
  fullName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  gender: '',
  dateOfBirth: '',
  studentId: '',
  registered: false,
};

const EMPTY_COURSE_FORM: NewCourseForm = {
  title: '',
  teacher: '',
  category: 'Aqidah',
  level: 'Beginner',
  lessons: '',
  duration: '',
  description: '',
  certificate: true,
};

const CATEGORIES: CourseCategory[] = ['Aqidah', 'Fiqh', 'Seerah', 'Arabic', 'Hadith', 'Tafsir', 'Islamic Finance', 'Character', 'Youth', 'Teacher Training'];
const LEVELS: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Scholar Track'];

const foundationNotes: CourseNote[] = [
  {
    title: 'Lesson 1: The Meaning of Islamic Knowledge',
    content: [
      'Islamic knowledge is not only information. It is guidance that should bring a servant closer to Allah, improve worship, and beautify character.',
      'A serious student begins with sincerity, humility, respect for scholars, and a desire to act on what is learned.',
      'Knowledge without action can become a proof against a person, while knowledge with sincerity becomes light and guidance.',
    ],
    keyPoints: ['Sincerity comes first', 'Knowledge should produce action', 'Adab protects learning'],
    pdfTitle: 'PDF Handout: Etiquette of Seeking Knowledge',
    pdfPages: ['Page 1: Intention and sincerity', 'Page 2: Respect for teachers and books', 'Page 3: Revision plan and practical checklist'],
    assignment: 'Write your intention for studying this course and one habit you will improve.',
  },
  {
    title: 'Lesson 2: Tawheed as the Center of Life',
    content: [
      'Tawheed means to single out Allah in worship, lordship, and His perfect names and attributes.',
      'A believer understands that Allah created, owns, provides, commands, forgives, guides, and controls all affairs.',
      'The practical result of Tawheed is trust in Allah, sincere worship, protection from showing off, and freedom from depending on creation in the heart.',
    ],
    keyPoints: ['Allah alone creates', 'Allah alone deserves worship', 'The heart depends on Allah'],
    pdfTitle: 'PDF Handout: Tawheed Summary Map',
    pdfPages: ['Page 1: Tawheed of lordship', 'Page 2: Tawheed of worship', 'Page 3: Tawheed of names and attributes'],
    assignment: 'List five daily actions that can become worship with the right intention.',
  },
  {
    title: 'Lesson 3: Articles of Faith',
    content: [
      'The six articles of faith are belief in Allah, His angels, His books, His messengers, the Last Day, and Divine Decree.',
      'Each article strengthens the Muslim’s worldview. Belief in angels teaches accountability, belief in books teaches guidance, and belief in the Last Day teaches responsibility.',
      'Belief in Divine Decree gives calmness during hardship and gratitude during ease.',
    ],
    keyPoints: ['Faith has foundations', 'Accountability shapes choices', 'Divine Decree gives peace'],
    pdfTitle: 'PDF Handout: Six Articles of Faith Table',
    pdfPages: ['Page 1: Definitions', 'Page 2: Daily life examples', 'Page 3: Revision questions'],
    assignment: 'Choose one article of faith and explain how it changes your daily behavior.',
  },
  {
    title: 'Lesson 4: Faith and Character',
    content: [
      'True faith should appear in manners. Honesty, patience, mercy, modesty, and trustworthiness are signs that knowledge is entering the heart.',
      'A student should measure progress not only by completed lessons but by improved speech, prayer, humility, and treatment of people.',
      'The best learning is learning that makes the servant more obedient to Allah and more merciful to creation.',
    ],
    keyPoints: ['Faith beautifies manners', 'Progress includes behavior', 'Mercy is a sign of strength'],
    pdfTitle: 'PDF Handout: Character Self-Assessment',
    pdfPages: ['Page 1: Speech checklist', 'Page 2: Family manners', 'Page 3: Weekly improvement tracker'],
    assignment: 'Track one character trait for seven days and write your reflection.',
  },
];

const DEFAULT_COURSES: CourseItem[] = [
  {
    id: 'c1',
    title: 'Foundations of Islamic Belief',
    category: 'Aqidah',
    level: 'Beginner',
    teacher: 'Ustadha Amina',
    lessons: 12,
    duration: '8 weeks',
    certificate: true,
    description: 'A complete beginner course covering Tawheed, faith, sincerity, the six articles of Iman, and the effect of belief on daily character.',
    outcomes: ['Understand the six articles of faith', 'Explain Tawheed clearly', 'Avoid common mistakes in belief', 'Build confidence in Islamic identity', 'Connect belief to daily manners'],
    passMark: 70,
    rating: 4.9,
    students: 1280,
    progress: 0,
    notes: foundationNotes,
    exercises: [
      { id: 'c1e1', type: 'Multiple Choice', question: 'What is the foundation of Islamic belief?', options: ['Tawheed', 'Wealth', 'Tribe', 'Language'], answer: 'Tawheed', explanation: 'Tawheed is worshipping Allah alone.', points: 10 },
      { id: 'c1e2', type: 'Short Answer', question: 'Mention all six articles of faith.', answer: 'Allah, angels, books, messengers, last day, divine decree', explanation: 'The six articles are belief in Allah, angels, books, messengers, the Last Day and Divine Decree.', points: 15 },
      { id: 'c1e3', type: 'Reflection', question: 'Write five ways belief in Allah can improve your daily life.', explanation: 'Reflection helps connect belief to worship and manners.', points: 15 },
      { id: 'c1e4', type: 'Short Answer', question: 'What is sincerity and why does it matter?', answer: 'Doing worship for Allah alone', explanation: 'Sincerity means seeking Allah’s pleasure, not showing off.', points: 10 },
      { id: 'c1e5', type: 'Reflection', question: 'Describe one character trait you will improve because of this course.', explanation: 'Knowledge should produce better character.', points: 10 },
    ],
    finalExam: [
      { id: 'c1f1', type: 'Multiple Choice', question: 'Who alone deserves worship?', options: ['Allah', 'Angels', 'Prophets', 'People'], answer: 'Allah', explanation: 'Worship belongs to Allah alone.', points: 15 },
      { id: 'c1f2', type: 'Multiple Choice', question: 'How many articles of faith are commonly taught?', options: ['3', '5', '6', '10'], answer: '6', explanation: 'There are six articles of faith.', points: 15 },
      { id: 'c1f3', type: 'Short Answer', question: 'Explain Tawheed in one sentence.', answer: 'Worship Allah alone', explanation: 'The answer should show that worship belongs only to Allah.', points: 25 },
      { id: 'c1f4', type: 'Short Answer', question: 'Mention three effects of sincere belief on character.', answer: 'honesty, patience, mercy', explanation: 'A correct answer may mention honesty, patience, humility, mercy or trustworthiness.', points: 20 },
      { id: 'c1f5', type: 'Reflection', question: 'Write a personal plan for protecting your faith and improving your manners.', explanation: 'A complete answer should mention worship, learning, environment and character.', points: 25 },
    ],
  },
  {
    id: 'c2',
    title: 'Practical Fiqh for Daily Life',
    category: 'Fiqh',
    level: 'Intermediate',
    teacher: 'Shaykh Musa',
    lessons: 14,
    duration: '10 weeks',
    certificate: true,
    description: 'Practical fiqh covering purification, worship, transactions, family basics, debt, halal earnings, and everyday rulings.',
    outcomes: ['Understand practical rulings', 'Ask better questions', 'Practice Islam with clarity', 'Know when to consult scholars', 'Respect valid scholarly differences'],
    passMark: 75,
    rating: 4.8,
    students: 930,
    progress: 0,
    notes: [
      {
        title: 'Lesson 1: What Fiqh Is',
        content: ['Fiqh is understanding Islamic rulings related to worship and daily life.', 'It covers purification, prayer, fasting, zakat, marriage, business, family, food, and personal conduct.', 'Fiqh should be learned gradually and respectfully because scholars may differ in detailed matters.'],
        keyPoints: ['Fiqh guides action', 'Learn from qualified teachers', 'Respect differences'],
        pdfTitle: 'PDF Handout: Fiqh Learning Roadmap',
        pdfPages: ['Page 1: Worship topics', 'Page 2: Family and money topics', 'Page 3: Questions to ask a scholar'],
        assignment: 'Write three fiqh topics you need most in your life right now.',
      },
      {
        title: 'Lesson 2: Purification and Prayer Readiness',
        content: ['Purification prepares the body, clothing, and place for worship.', 'A student should know the basics of wudu, ghusl, impurities, and conditions of prayer.', 'Correct knowledge removes unnecessary doubt and helps a person worship calmly.'],
        keyPoints: ['Purification matters', 'Avoid obsessive doubt', 'Prayer needs preparation'],
        pdfTitle: 'PDF Handout: Purification Checklist',
        pdfPages: ['Page 1: Wudu essentials', 'Page 2: Common mistakes', 'Page 3: Prayer readiness checklist'],
        assignment: 'Create your personal prayer preparation checklist.',
      },
      {
        title: 'Lesson 3: Halal Transactions',
        content: ['Islamic transactions should be based on honesty, clarity, consent, and fairness.', 'Cheating, deception, riba, exploitation, and hiding defects are harmful and sinful.', 'When a transaction is complex, the safest path is to ask qualified scholars before entering it.'],
        keyPoints: ['Honesty is required', 'Contracts must be clear', 'Avoid riba and deception'],
        pdfTitle: 'PDF Handout: Halal Transaction Review Sheet',
        pdfPages: ['Page 1: Contract clarity', 'Page 2: Red flags', 'Page 3: Scholar consultation notes'],
        assignment: 'Review one common transaction and list whether it is clear, fair and halal.',
      },
    ],
    exercises: [
      { id: 'c2e1', type: 'Multiple Choice', question: 'Fiqh mostly helps with what?', options: ['Practical rulings', 'Cooking only', 'Tribal history', 'Business names'], answer: 'Practical rulings', explanation: 'Fiqh covers practical Islamic rulings.', points: 10 },
      { id: 'c2e2', type: 'Short Answer', question: 'Why should fiqh be learned with humility?', answer: 'Scholars may differ', explanation: 'Differences in detailed rulings require respect and humility.', points: 10 },
      { id: 'c2e3', type: 'Reflection', question: 'Write your prayer preparation checklist.', explanation: 'This exercise connects fiqh to worship readiness.', points: 15 },
      { id: 'c2e4', type: 'Short Answer', question: 'Mention two signs of a halal transaction.', answer: 'honesty and clarity', explanation: 'Honesty, clarity, consent and fairness are important signs.', points: 15 },
    ],
    finalExam: [
      { id: 'c2f1', type: 'Multiple Choice', question: 'What is a major purpose of fiqh?', options: ['To guide worship and daily life', 'To replace sincerity', 'To ignore scholars', 'To create arguments'], answer: 'To guide worship and daily life', explanation: 'Fiqh guides practice.', points: 20 },
      { id: 'c2f2', type: 'Short Answer', question: 'Mention two areas covered by fiqh.', answer: 'Prayer and transactions', explanation: 'Examples include worship, marriage, business, family, and purification.', points: 25 },
      { id: 'c2f3', type: 'Short Answer', question: 'Mention three conditions of ethical transactions.', answer: 'honesty, clarity, fairness', explanation: 'A good answer includes honesty, clarity, fairness and avoiding deception.', points: 25 },
      { id: 'c2f4', type: 'Reflection', question: 'How can fiqh improve your worship and money habits?', explanation: 'A good answer should mention clarity, correctness, and halal conduct.', points: 30 },
    ],
  },
  {
    id: 'c3',
    title: 'Arabic Reading Starter',
    category: 'Arabic',
    level: 'Beginner',
    teacher: 'Ustadh Kareem',
    lessons: 16,
    duration: '12 weeks',
    certificate: true,
    description: 'Learn Arabic letters, joining, pronunciation, reading discipline, and beginner confidence for Islamic texts.',
    outcomes: ['Recognize Arabic letters', 'Read joined letters', 'Improve pronunciation', 'Prepare for Qur’an reading', 'Build a weekly reading habit'],
    passMark: 70,
    rating: 4.7,
    students: 2140,
    progress: 0,
    notes: [
      {
        title: 'Lesson 1: Arabic Letter Recognition',
        content: ['Arabic letters have isolated, beginning, middle and ending forms.', 'Students should recognize each letter slowly before trying to read fast.', 'Strong reading begins with patient repetition and correct sound recognition.'],
        keyPoints: ['Know letter shapes', 'Practice slowly', 'Repeat daily'],
        pdfTitle: 'PDF Handout: Arabic Letter Chart',
        pdfPages: ['Page 1: Isolated letters', 'Page 2: Connected forms', 'Page 3: Daily drill table'],
        assignment: 'Practice ten letters and write the forms you find difficult.',
      },
      {
        title: 'Lesson 2: Joining and Vowels',
        content: ['Letters join differently depending on their position.', 'Short vowels help students pronounce words correctly.', 'Reading without understanding vowels can cause repeated mistakes, so accuracy matters.'],
        keyPoints: ['Joining changes shapes', 'Vowels guide sound', 'Accuracy before speed'],
        pdfTitle: 'PDF Handout: Joining and Harakat Practice',
        pdfPages: ['Page 1: Joining examples', 'Page 2: Fatha, kasra, damma', 'Page 3: Reading practice'],
        assignment: 'Read five simple Arabic words slowly and mark the vowels.',
      },
      {
        title: 'Lesson 3: Reading Routine',
        content: ['Short daily practice is better than rare long practice.', 'A beginner should combine looking, listening, repeating and teacher correction.', 'Confidence grows when the student accepts slow progress and keeps returning.'],
        keyPoints: ['Practice daily', 'Listen and repeat', 'Use teacher correction'],
        pdfTitle: 'PDF Handout: 30-Day Reading Tracker',
        pdfPages: ['Page 1: Daily minutes', 'Page 2: Difficult letters', 'Page 3: Weekly reflection'],
        assignment: 'Create a seven-day Arabic reading schedule.',
      },
    ],
    exercises: [
      { id: 'c3e1', type: 'Multiple Choice', question: 'Arabic letters can change shape based on what?', options: ['Position in word', 'Weather', 'Age', 'Country'], answer: 'Position in word', explanation: 'Arabic letters have different connected forms.', points: 10 },
      { id: 'c3e2', type: 'Short Answer', question: 'Mention the three short vowels.', answer: 'fatha, kasra, damma', explanation: 'The common short vowels are fatha, kasra and damma.', points: 15 },
      { id: 'c3e3', type: 'Reflection', question: 'Write your Arabic reading plan for one week.', explanation: 'Consistency is important for reading progress.', points: 15 },
    ],
    finalExam: [
      { id: 'c3f1', type: 'Multiple Choice', question: 'What should come before speed in reading?', options: ['Accuracy', 'Guessing', 'Skipping letters', 'Decoration'], answer: 'Accuracy', explanation: 'Accuracy should come before speed.', points: 25 },
      { id: 'c3f2', type: 'Short Answer', question: 'Mention two ways to improve Arabic reading.', answer: 'Practice and listening', explanation: 'Practice, listening, repetition, and teacher correction help.', points: 30 },
      { id: 'c3f3', type: 'Reflection', question: 'Write a realistic 30-day plan to improve Arabic reading.', explanation: 'A good plan should include daily reading, listening and revision.', points: 45 },
    ],
  },
  {
    id: 'c4',
    title: 'Hadith Study and Character',
    category: 'Hadith',
    level: 'Intermediate',
    teacher: 'Dr. Hafsa',
    lessons: 12,
    duration: '8 weeks',
    certificate: true,
    description: 'Selected hadith lessons focused on sincerity, mercy, patience, trustworthiness, humility and worship.',
    outcomes: ['Reflect on hadith', 'Improve character', 'Apply prophetic guidance', 'Connect knowledge with manners'],
    passMark: 75,
    rating: 4.9,
    students: 1500,
    progress: 0,
    notes: [
      {
        title: 'Lesson 1: Hadith as Practical Guidance',
        content: ['Hadith teaches the sayings, actions, approvals and character of the Prophet ﷺ.', 'Studying hadith helps Muslims understand how to live Islamic teachings practically.', 'Hadith study should lead to better worship, manners, humility and mercy.'],
        keyPoints: ['Hadith teaches practice', 'Knowledge should change behavior', 'Prophetic manners are central'],
        pdfTitle: 'PDF Handout: Hadith Reflection Journal',
        pdfPages: ['Page 1: Hadith text', 'Page 2: Lessons learned', 'Page 3: Action plan'],
        assignment: 'Choose one hadith lesson and write how you will practice it.',
      },
      {
        title: 'Lesson 2: Sincerity and Intention',
        content: ['Intention is central to worship and learning.', 'A student should study to please Allah, remove ignorance, serve others and improve the self.', 'Showing off can harm deeds, while hidden sincerity gives deeds value.'],
        keyPoints: ['Intention matters', 'Avoid showing off', 'Renew intention often'],
        pdfTitle: 'PDF Handout: Intention Renewal Sheet',
        pdfPages: ['Page 1: Why am I learning?', 'Page 2: Signs of sincerity', 'Page 3: Weekly renewal'],
        assignment: 'Write three signs that your learning is becoming sincere.',
      },
      {
        title: 'Lesson 3: Mercy and Patience',
        content: ['The Prophet ﷺ taught mercy in family, community and leadership.', 'Patience is not weakness; it is strength guided by faith.', 'A student of hadith should become easier to live with, kinder in speech, and more forgiving.'],
        keyPoints: ['Mercy is strength', 'Patience needs practice', 'Knowledge should soften speech'],
        pdfTitle: 'PDF Handout: Mercy Practice Tracker',
        pdfPages: ['Page 1: Family mercy', 'Page 2: Patience moments', 'Page 3: Forgiveness reflection'],
        assignment: 'Record three moments where you practiced patience this week.',
      },
    ],
    exercises: [
      { id: 'c4e1', type: 'Multiple Choice', question: 'Hadith study should improve what?', options: ['Character', 'Pride', 'Arguments only', 'Neglect'], answer: 'Character', explanation: 'Beneficial knowledge improves manners.', points: 10 },
      { id: 'c4e2', type: 'Short Answer', question: 'Why is intention important?', answer: 'It gives deeds value', explanation: 'Intention affects the value and direction of deeds.', points: 15 },
      { id: 'c4e3', type: 'Reflection', question: 'Choose one prophetic character trait to practice this week.', explanation: 'Reflection helps apply hadith.', points: 15 },
      { id: 'c4e4', type: 'Reflection', question: 'Write a short mercy and patience plan for your family or community.', explanation: 'Knowledge should become action.', points: 10 },
    ],
    finalExam: [
      { id: 'c4f1', type: 'Multiple Choice', question: 'What is a sign of beneficial hadith study?', options: ['Better manners', 'More arrogance', 'Less worship', 'Ignoring people'], answer: 'Better manners', explanation: 'Hadith study should improve character.', points: 25 },
      { id: 'c4f2', type: 'Short Answer', question: 'Mention three traits taught by hadith.', answer: 'mercy, honesty, patience', explanation: 'Traits include sincerity, mercy, honesty, patience and humility.', points: 30 },
      { id: 'c4f3', type: 'Short Answer', question: 'How can a student renew intention?', answer: 'study for Allah', explanation: 'A good answer mentions seeking Allah’s pleasure and avoiding showing off.', points: 20 },
      { id: 'c4f4', type: 'Reflection', question: 'How can you apply one hadith lesson at home?', explanation: 'A good answer should connect knowledge to action.', points: 25 },
    ],
  },
  {
    id: 'c5',
    title: 'Islamic Finance Basics',
    category: 'Islamic Finance',
    level: 'Advanced',
    teacher: 'Mufti Idris',
    lessons: 14,
    duration: '7 weeks',
    certificate: true,
    description: 'Learn halal earnings, riba, contracts, zakat basics, debt responsibility, business ethics and wealth purification.',
    outcomes: ['Avoid riba', 'Recognize halal contracts', 'Improve wealth purification', 'Understand basic zakat', 'Build ethical money habits'],
    passMark: 80,
    rating: 4.6,
    students: 760,
    progress: 0,
    notes: [
      {
        title: 'Lesson 1: Halal Income and Barakah',
        content: ['Halal income is wealth earned through lawful and ethical means.', 'A Muslim seeks barakah, not only quantity. Wealth should be clean, honest and beneficial.', 'Cheating, exploitation and unlawful income harm the heart and society.'],
        keyPoints: ['Seek halal wealth', 'Avoid cheating', 'Barakah matters'],
        pdfTitle: 'PDF Handout: Halal Income Checklist',
        pdfPages: ['Page 1: Income source review', 'Page 2: Red flags', 'Page 3: Barakah habits'],
        assignment: 'Review one source of income and list how to keep it halal.',
      },
      {
        title: 'Lesson 2: Riba and Unclear Contracts',
        content: ['Riba is a major prohibition and must be avoided carefully.', 'Contracts should be clear, fair and free from deception.', 'When financial matters are complex, Muslims should consult qualified scholars.'],
        keyPoints: ['Avoid riba', 'Use clear contracts', 'Ask qualified scholars'],
        pdfTitle: 'PDF Handout: Contract Safety Sheet',
        pdfPages: ['Page 1: Contract clarity', 'Page 2: Riba warnings', 'Page 3: Questions for scholars'],
        assignment: 'Write five questions you should ask before signing a financial contract.',
      },
      {
        title: 'Lesson 3: Zakat and Wealth Purification',
        content: ['Zakat is paid on eligible halal wealth when conditions are met.', 'It purifies wealth, supports those in need and reminds the believer that wealth is a trust.', 'Haram income is not purified by zakat; it should be removed responsibly without intending reward.'],
        keyPoints: ['Zakat applies to eligible halal wealth', 'Wealth is a trust', 'Haram income must be removed'],
        pdfTitle: 'PDF Handout: Zakat Preparation Sheet',
        pdfPages: ['Page 1: Asset list', 'Page 2: Debts and liabilities', 'Page 3: Zakat calculation notes'],
        assignment: 'Create a personal list of assets and debts for zakat review.',
      },
    ],
    exercises: [
      { id: 'c5e1', type: 'Multiple Choice', question: 'What should a Muslim seek in earnings?', options: ['Halal and barakah', 'Any income', 'Cheating', 'Riba'], answer: 'Halal and barakah', explanation: 'Islam teaches lawful and ethical earnings.', points: 10 },
      { id: 'c5e2', type: 'Short Answer', question: 'Why should contracts be clear?', answer: 'To avoid deception', explanation: 'Clear contracts protect fairness.', points: 15 },
      { id: 'c5e3', type: 'Short Answer', question: 'What should happen to haram income?', answer: 'Remove it responsibly', explanation: 'Haram income is not purified by zakat.', points: 15 },
      { id: 'c5e4', type: 'Reflection', question: 'Write three ways to improve your money habits Islamically.', explanation: 'This helps apply Islamic finance knowledge.', points: 10 },
    ],
    finalExam: [
      { id: 'c5f1', type: 'Multiple Choice', question: 'Riba is considered what?', options: ['Prohibited', 'Always recommended', 'Required', 'A language'], answer: 'Prohibited', explanation: 'Riba is prohibited.', points: 20 },
      { id: 'c5f2', type: 'Short Answer', question: 'Mention three signs of ethical Islamic finance.', answer: 'halal income, clear contracts, fairness', explanation: 'Halal income, fairness, clarity and avoiding riba are key.', points: 30 },
      { id: 'c5f3', type: 'Short Answer', question: 'What is the relationship between zakat and halal wealth?', answer: 'zakat is paid on eligible halal wealth', explanation: 'Zakat is due on eligible halal wealth, not haram income.', points: 25 },
      { id: 'c5f4', type: 'Reflection', question: 'How can you make your financial habits more halal?', explanation: 'A good answer should include practical improvements.', points: 25 },
    ],
  },
  {
    id: 'c6',
    title: 'Seerah: Mercy and Leadership',
    category: 'Seerah',
    level: 'Beginner',
    teacher: 'Ustadh Bilal',
    lessons: 12,
    duration: '8 weeks',
    certificate: true,
    description: 'Study selected moments from the life of the Prophet ﷺ with focus on mercy, patience, leadership and family character.',
    outcomes: ['Love the Prophet ﷺ more', 'Learn leadership with mercy', 'Apply Seerah lessons daily', 'Improve family and community behavior'],
    passMark: 70,
    rating: 4.8,
    students: 1180,
    progress: 0,
    notes: [
      {
        title: 'Lesson 1: Why Study Seerah?',
        content: ['The Seerah helps Muslims understand the Prophet ﷺ as a mercy, teacher, leader, husband, friend and worshipper.', 'It gives practical examples for dealing with hardship, success, family, community and opposition.', 'Learning Seerah increases love and helps Muslims follow the Sunnah with understanding.'],
        keyPoints: ['Seerah builds love', 'Seerah teaches action', 'Seerah gives real examples'],
        pdfTitle: 'PDF Handout: Seerah Reflection Timeline',
        pdfPages: ['Page 1: Major events', 'Page 2: Lessons from hardship', 'Page 3: Daily application'],
        assignment: 'Choose one Seerah event and write two lessons from it.',
      },
      {
        title: 'Lesson 2: Mercy in Leadership',
        content: ['The Prophet ﷺ led people with justice, mercy and patience.', 'Leadership in Islam is a responsibility, not a way to feel superior.', 'A leader should consult, forgive, protect rights and serve people sincerely.'],
        keyPoints: ['Leadership is service', 'Mercy strengthens leadership', 'Justice protects people'],
        pdfTitle: 'PDF Handout: Prophetic Leadership Checklist',
        pdfPages: ['Page 1: Mercy', 'Page 2: Consultation', 'Page 3: Responsibility'],
        assignment: 'Write how mercy can improve one leadership role in your life.',
      },
    ],
    exercises: [
      { id: 'c6e1', type: 'Reflection', question: 'Mention one leadership quality of the Prophet ﷺ.', explanation: 'Examples include mercy, patience, consultation, truthfulness and courage.', points: 15 },
      { id: 'c6e2', type: 'Short Answer', question: 'Why is Seerah important?', answer: 'It teaches how to follow the Prophet', explanation: 'Seerah gives practical examples from the Prophet’s life.', points: 15 },
      { id: 'c6e3', type: 'Reflection', question: 'How can mercy improve your family or community role?', explanation: 'This applies Seerah to life.', points: 10 },
    ],
    finalExam: [
      { id: 'c6f1', type: 'Multiple Choice', question: 'Studying Seerah should increase what?', options: ['Love and following', 'Neglect', 'Pride only', 'Confusion'], answer: 'Love and following', explanation: 'Seerah increases love and understanding.', points: 30 },
      { id: 'c6f2', type: 'Short Answer', question: 'Mention two leadership qualities from the Seerah.', answer: 'mercy and patience', explanation: 'Examples include mercy, justice, patience, consultation and courage.', points: 30 },
      { id: 'c6f3', type: 'Reflection', question: 'How can one Seerah lesson improve your family life?', explanation: 'A good answer connects mercy and patience to real life.', points: 40 },
    ],
  },
  {
    id: 'c7',
    title: 'Teacher Training for Islamic Classes',
    category: 'Teacher Training',
    level: 'Scholar Track',
    teacher: 'Ustadha Sumayya',
    lessons: 18,
    duration: '12 weeks',
    certificate: true,
    description: 'A professional course for teachers who want to prepare Islamic lessons, notes, exercises, exams, student tracking and certificates.',
    outcomes: ['Prepare lesson plans', 'Design fair exams', 'Guide students with adab', 'Track student progress', 'Create professional Islamic learning materials'],
    passMark: 85,
    rating: 4.9,
    students: 420,
    progress: 0,
    notes: [
      {
        title: 'Lesson 1: Teaching with Amanah',
        content: ['Teaching Islamic knowledge is a trust. The teacher should be sincere, careful, humble and organized.', 'Students need clear notes, gentle correction, review questions and practical examples.', 'A teacher should avoid speaking without knowledge and refer difficult issues to qualified scholars.'],
        keyPoints: ['Teaching is a trust', 'Be organized', 'Know your limits'],
        pdfTitle: 'PDF Handout: Islamic Teacher Code of Conduct',
        pdfPages: ['Page 1: Sincerity', 'Page 2: Accuracy', 'Page 3: Student care'],
        assignment: 'Write your teacher intention and classroom principles.',
      },
      {
        title: 'Lesson 2: Designing Notes and Exercises',
        content: ['Professional notes should have objectives, definitions, examples, key points and revision tasks.', 'Exercises should test understanding, reflection and application, not memorization only.', 'A good teacher balances mercy with standards so students learn properly.'],
        keyPoints: ['Clear objectives', 'Practical exercises', 'Balanced standards'],
        pdfTitle: 'PDF Handout: Lesson Design Template',
        pdfPages: ['Page 1: Objective planning', 'Page 2: Note writing', 'Page 3: Exercise design'],
        assignment: 'Design one mini lesson with three questions.',
      },
      {
        title: 'Lesson 3: Fair Exams and Certificates',
        content: ['Exams should measure what the course actually taught.', 'A certificate should represent real effort, completed exercises and a passing exam score.', 'Retakes should be limited and spaced out to encourage revision, not guessing.'],
        keyPoints: ['Exam what you teach', 'Certificate requires effort', 'Retakes need discipline'],
        pdfTitle: 'PDF Handout: Certificate Integrity Policy',
        pdfPages: ['Page 1: Exam fairness', 'Page 2: Retake rules', 'Page 3: Certificate requirements'],
        assignment: 'Write a fair certificate policy for one course.',
      },
    ],
    exercises: [
      { id: 'c7e1', type: 'Short Answer', question: 'Mention three qualities of a good Islamic teacher.', answer: 'sincerity, knowledge, patience', explanation: 'Qualities include sincerity, knowledge, patience, humility, organization and mercy.', points: 20 },
      { id: 'c7e2', type: 'Reflection', question: 'Design one mini Islamic lesson with objective, notes and three questions.', explanation: 'This develops teaching skill.', points: 25 },
      { id: 'c7e3', type: 'Short Answer', question: 'Why should certificates require exercises and exams?', answer: 'to prove learning', explanation: 'Certificates should represent real learning and effort.', points: 15 },
    ],
    finalExam: [
      { id: 'c7f1', type: 'Short Answer', question: 'Write a short plan for teaching one Islamic topic.', answer: 'topic, objectives, notes, questions', explanation: 'A good plan should include objectives, notes, activities and assessment.', points: 40 },
      { id: 'c7f2', type: 'Reflection', question: 'How will you protect sincerity while teaching?', explanation: 'A good answer should mention intention, humility and seeking Allah’s pleasure.', points: 30 },
      { id: 'c7f3', type: 'Short Answer', question: 'What makes an exam fair?', answer: 'it tests what was taught', explanation: 'A fair exam tests course content clearly and appropriately.', points: 30 },
    ],
  },
];

const LEARNING_SITES: LearningSite[] = [
  { id: 's1', name: 'SeekersGuidance Academy', url: 'https://academy.seekersguidance.org/', certificate: true, level: 'Beginner', description: 'Flexible on-demand Islamic courses and learning paths for modern Muslims.', strengths: ['On-demand learning', 'Structured Islamic studies', 'Beginner friendly'], reactions: [{ id: 'r1', user: 'Maryam', level: 'Beginner', success: 'Completed Aqidah basics', reaction: 'The lessons were clear and easy to follow.', rating: 5, certificateTitle: 'Foundations Certificate' }] },
  { id: 's2', name: 'International Open University', url: 'https://iou.edu.gm/', certificate: true, level: 'Advanced', description: 'Online Islamic higher education with certificate and degree pathways.', strengths: ['Certificate programs', 'Degree pathways', 'Structured semesters'], reactions: [{ id: 'r2', user: 'Aisha', level: 'Intermediate', success: 'Started Certificate in Islamic Studies', reaction: 'It feels like a serious academic path.', rating: 5, certificateTitle: 'Islamic Studies Certificate' }] },
  { id: 's3', name: 'Mishkah University', url: 'https://mishkahu.com/', certificate: true, level: 'Intermediate', description: 'Online Islamic education with faculty-led learning and Islamic studies programs.', strengths: ['Faculty-led', 'Online university model', 'Islamic education focus'], reactions: [{ id: 'r3', user: 'Fatima', level: 'Advanced', success: 'Improved Islamic studies discipline', reaction: 'The program helped me stay consistent.', rating: 4, certificateTitle: 'Course Completion' }] },
  { id: 's4', name: 'Qalam Institute / Qalam Academy', url: 'https://www.qalam.institute/online-classes', certificate: true, level: 'Beginner', description: 'Online and structured classes for children, adults, literacy, and Islamic foundations.', strengths: ['Youth and adult options', 'Foundational tracks', 'Literacy support'], reactions: [{ id: 'r4', user: 'Hafsa', level: 'Beginner', success: 'Joined online foundations', reaction: 'Very organized and family-friendly.', rating: 5, certificateTitle: 'Foundations Track' }] },
];

export default function IslamicCoursesPage() {
  const [tab, setTab] = useState<Tab>('Home');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'All'>('All');
  const [student, setStudent] = useState<StudentProfile>(EMPTY_STUDENT);
  const [courses, setCourses] = useState<CourseItem[]>(DEFAULT_COURSES);
  const [certificates, setCertificates] = useState<CertificatePost[]>([]);
  const [sites, setSites] = useState<LearningSite[]>(LEARNING_SITES);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [selectedSite, setSelectedSite] = useState<LearningSite | null>(null);
  const [selectedNotesCourse, setSelectedNotesCourse] = useState<CourseItem | null>(null);
  const [selectedExerciseCourse, setSelectedExerciseCourse] = useState<CourseItem | null>(null);
  const [selectedExamCourse, setSelectedExamCourse] = useState<CourseItem | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [examAttempts, setExamAttempts] = useState<Record<string, ExamAttempt>>({});
  const [lastExamScore, setLastExamScore] = useState<number | null>(null);
  const [newCourse, setNewCourse] = useState<NewCourseForm>(EMPTY_COURSE_FORM);
  const [newCertificateTitle, setNewCertificateTitle] = useState('');
  const [newCertificateStudent, setNewCertificateStudent] = useState('');
  const [newCertificateSite, setNewCertificateSite] = useState('');
  const [newCertificateSuccess, setNewCertificateSuccess] = useState('');
  const [newCertificateLevel, setNewCertificateLevel] = useState<CourseLevel>('Beginner');
  const [certificateImage, setCertificateImage] = useState<string | undefined>();
  const [certificateDocumentName, setCertificateDocumentName] = useState<string | undefined>();
  const [reviewText, setReviewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewLevel, setReviewLevel] = useState<CourseLevel>('Beginner');
  const [reviewCertificateTitle, setReviewCertificateTitle] = useState('');

  const filteredCourses = useMemo(() => {
    const s = query.toLowerCase();
    return courses.filter(course => {
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      const matchesText = course.title.toLowerCase().includes(s) || course.category.toLowerCase().includes(s) || course.level.toLowerCase().includes(s) || course.teacher.toLowerCase().includes(s);
      return matchesCategory && matchesText;
    });
  }, [courses, query, selectedCategory]);

  const averageProgress = courses.length ? Math.round(courses.reduce((sum, item) => sum + item.progress, 0) / courses.length) : 0;
  const totalLessons = courses.reduce((sum, item) => sum + item.lessons, 0);
  const completedCourses = courses.filter(item => item.progress >= 100).length;

  const getAttemptKey = (courseId: string) => `${student.studentId || 'guest'}-${courseId}`;
  const getExerciseKey = (courseId: string) => `${student.studentId || 'guest'}-${courseId}`;

  const registerStudent = () => {
    if (!student.fullName.trim() || !student.email.trim() || !student.phone.trim() || !student.country.trim()) {
      Alert.alert('Registration Required', 'Please add your full name, email, phone and country.');
      return;
    }
    const studentId = student.studentId || `CN-${Date.now().toString().slice(-6)}`;
    setStudent({ ...student, studentId, registered: true });
    Alert.alert('Registered', `Welcome ${student.fullName}. Your student ID is ${studentId}.`);
    setTab('Courses');
  };

  const updateProgress = (courseId: string, amount: number) => {
    setCourses(prev => prev.map(course => course.id === courseId ? { ...course, progress: Math.max(0, Math.min(100, course.progress + amount)) } : course));
    if (selectedCourse?.id === courseId) setSelectedCourse(prev => prev ? { ...prev, progress: Math.max(0, Math.min(100, prev.progress + amount)) } : prev);
  };

  const toggleSaveCourse = (courseId: string) => {
    setCourses(prev => prev.map(course => course.id === courseId ? { ...course, saved: !course.saved } : course));
    if (selectedCourse?.id === courseId) setSelectedCourse({ ...selectedCourse, saved: !selectedCourse.saved });
  };

  const submitCourse = () => {
    if (!newCourse.title.trim() || !newCourse.teacher.trim() || !newCourse.description.trim()) {
      Alert.alert('Missing Details', 'Please add course title, teacher and description.');
      return;
    }
    const course: CourseItem = {
      id: `${Date.now()}`,
      title: newCourse.title.trim(),
      teacher: newCourse.teacher.trim(),
      category: newCourse.category,
      level: newCourse.level,
      lessons: Number(newCourse.lessons) || 1,
      duration: newCourse.duration.trim() || 'Self-paced',
      certificate: newCourse.certificate,
      description: newCourse.description.trim(),
      outcomes: ['Complete all notes', 'Complete all exercises', 'Pass final exam', 'Apply knowledge with sincerity'],
      passMark: 70,
      rating: 5,
      students: 1,
      progress: 0,
      notes: [
        { title: 'Course Introduction', content: [newCourse.description.trim(), 'Students must read the notes, complete all exercises, and pass the final exam before certificate approval.'], keyPoints: ['Read notes', 'Complete exercises', 'Pass final exam'], pdfTitle: 'PDF Handout: Course Introduction', pdfPages: ['Page 1: Objectives', 'Page 2: Summary notes', 'Page 3: Student checklist'], assignment: 'Write three learning goals for this course.' },
        { title: 'Professional Study Guide', content: ['Set a weekly study time and review previous lessons before starting new ones.', 'Use a notebook for definitions, examples, personal reflections and questions for teachers.', 'Do not rush to the certificate. The real goal is beneficial knowledge and action.'], keyPoints: ['Plan study time', 'Take notes', 'Seek beneficial knowledge'], pdfTitle: 'PDF Handout: Student Study Plan', pdfPages: ['Page 1: Weekly planner', 'Page 2: Revision method', 'Page 3: Final exam preparation'], assignment: 'Create your personal study timetable.' },
      ],
      exercises: [
        { id: `${Date.now()}-e1`, type: 'Reflection', question: 'Write five things you learned from this course introduction.', explanation: 'This exercise helps students reflect before the final exam.', points: 20 },
        { id: `${Date.now()}-e2`, type: 'Short Answer', question: 'Mention three goals of this course.', answer: 'learn, practice, apply', explanation: 'A good answer should mention learning and application.', points: 20 },
      ],
      finalExam: [
        { id: `${Date.now()}-f1`, type: 'Short Answer', question: 'Summarize the main lesson of this course.', answer: 'main lesson', explanation: 'Teacher review may be needed for custom courses.', points: 50 },
        { id: `${Date.now()}-f2`, type: 'Reflection', question: 'How will you apply this course in your daily life?', explanation: 'Application is a sign of beneficial knowledge.', points: 50 },
      ],
    };
    setCourses(prev => [course, ...prev]);
    setNewCourse(EMPTY_COURSE_FORM);
    setTab('Courses');
  };

  const pickCertificateImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!result.canceled) setCertificateImage(result.assets[0].uri);
  };

  const pickCertificateDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
    if (!result.canceled) setCertificateDocumentName(result.assets[0].name);
  };

  const postCertificate = () => {
    if (!newCertificateTitle.trim() || !newCertificateStudent.trim()) {
      Alert.alert('Missing Certificate Details', 'Please add certificate title and student name.');
      return;
    }
    const post: CertificatePost = { id: `${Date.now()}`, certificateNo: `CN-MANUAL-${Date.now().toString().slice(-6)}`, courseId: 'manual', title: newCertificateTitle.trim(), student: newCertificateStudent.trim(), studentId: student.studentId || 'Manual', site: newCertificateSite.trim() || 'Islamic Course Platform', level: newCertificateLevel, score: 100, issueDate: new Date().toLocaleDateString(), success: newCertificateSuccess.trim() || 'Completed an Islamic learning milestone.', imageUri: certificateImage, documentName: certificateDocumentName, likes: 0, comments: [] };
    setCertificates(prev => [post, ...prev]);
    setNewCertificateTitle(''); setNewCertificateStudent(''); setNewCertificateSite(''); setNewCertificateSuccess(''); setCertificateImage(undefined); setCertificateDocumentName(undefined); setTab('Certificates');
  };

  const likeCertificate = (id: string) => setCertificates(prev => prev.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item));

  const addSiteReaction = () => {
    if (!selectedSite || !reviewText.trim()) { Alert.alert('Missing Review', 'Please write your reaction about this site.'); return; }
    const reaction: SiteReaction = { id: `${Date.now()}`, user: student.fullName || 'Student', level: reviewLevel, success: reviewSuccess.trim() || 'Shared learning experience', reaction: reviewText.trim(), rating: Math.max(1, Math.min(5, Number(reviewRating) || 5)), certificateTitle: reviewCertificateTitle.trim() || undefined };
    const updatedSites = sites.map(site => site.id === selectedSite.id ? { ...site, reactions: [reaction, ...site.reactions] } : site);
    setSites(updatedSites); setSelectedSite(updatedSites.find(site => site.id === selectedSite.id) || selectedSite); setReviewText(''); setReviewSuccess(''); setReviewRating('5'); setReviewCertificateTitle('');
  };

  const answerExercise = (questionId: string, answer: string) => setExerciseAnswers(prev => ({ ...prev, [questionId]: answer }));
  const answerExam = (questionId: string, answer: string) => setExamAnswers(prev => ({ ...prev, [questionId]: answer }));

  const completedAllExercises = (course: CourseItem) => {
    const allAnswered = course.exercises.every(q => (exerciseAnswers[q.id] || '').trim().length > 0);
    return completedExercises[getExerciseKey(course.id)] || allAnswered;
  };

  const markExercisesComplete = (course: CourseItem) => {
    const unanswered = course.exercises.filter(q => !(exerciseAnswers[q.id] || '').trim()).length;
    if (unanswered > 0) { Alert.alert('Exercises Not Complete', `Please answer all exercises first. Remaining: ${unanswered}`); return; }
    setCompletedExercises(prev => ({ ...prev, [getExerciseKey(course.id)]: true }));
    updateProgress(course.id, 35);
    Alert.alert('Exercises Completed', 'MashaAllah. You can now prepare for the final exam.');
  };

  const calculateExamScore = (course: CourseItem) => {
    const total = course.finalExam.reduce((sum, q) => sum + q.points, 0);
    const earned = course.finalExam.reduce((sum, q) => {
      const userAnswer = (examAnswers[q.id] || '').trim().toLowerCase();
      const correct = (q.answer || '').trim().toLowerCase();
      if (!userAnswer) return sum;
      if (q.type === 'Reflection') return userAnswer.length >= 25 ? sum + q.points : userAnswer.length >= 15 ? sum + q.points * 0.6 : sum;
      if (!correct) return userAnswer.length >= 8 ? sum + q.points * 0.7 : sum;
      return userAnswer.includes(correct) || correct.includes(userAnswer) ? sum + q.points : sum;
    }, 0);
    return Math.round((earned / total) * 100);
  };

  const submitFinalExam = (course: CourseItem) => {
    if (!student.registered) { Alert.alert('Register First', 'Please register before writing the final exam and receiving a certificate.'); setTab('Register'); return; }
    if (!completedAllExercises(course)) { Alert.alert('Exercises Required', 'You must complete all exercises before writing the final exam.'); setSelectedExerciseCourse(course); return; }

    const attemptKey = getAttemptKey(course.id);
    const attempt = examAttempts[attemptKey] || { count: 0 };
    const alreadyCertified = certificates.some(cert => cert.courseId === course.id && cert.studentId === student.studentId);
    if (alreadyCertified) { Alert.alert('Certificate Already Issued', 'This student already has one certificate for this course. A second certificate cannot be issued.'); return; }
    if (attempt.count >= MAX_RETAKES + 1) { Alert.alert('Attempts Finished', 'You have used the first attempt and two retakes. Please contact the academy for support.'); return; }
    if (attempt.count > 0 && attempt.lastAttemptAt && Date.now() - attempt.lastAttemptAt < DAY_MS) {
      const hours = Math.ceil((DAY_MS - (Date.now() - attempt.lastAttemptAt)) / (60 * 60 * 1000));
      Alert.alert('Retake Locked', `Please revise your notes. You can retake after about ${hours} hour(s).`);
      return;
    }

    const unanswered = course.finalExam.filter(q => !(examAnswers[q.id] || '').trim()).length;
    if (unanswered > 0) { Alert.alert('Exam Not Complete', `Please answer all exam questions. Remaining: ${unanswered}`); return; }

    const score = calculateExamScore(course);
    setLastExamScore(score);
    setExamAttempts(prev => ({ ...prev, [attemptKey]: { count: attempt.count + 1, lastAttemptAt: Date.now(), lastScore: score } }));

    if (score < MIN_PASS_MARK) { Alert.alert('Fail Attempt', `Your score is ${score}%. Below ${MIN_PASS_MARK}% is a fail. Certificate cannot be granted. You may retake twice, with a one-day interval.`); return; }
    if (score < course.passMark) { Alert.alert('Not Yet Passed', `Your score is ${score}%. This course pass mark is ${course.passMark}%. Revise and retake after one day.`); return; }

    const certificate: CertificatePost = { id: `${Date.now()}`, certificateNo: `CN-${course.id.toUpperCase()}-${student.studentId}-${Date.now().toString().slice(-5)}`, courseId: course.id, title: `Certificate of Completion: ${course.title}`, student: student.fullName, studentId: student.studentId, site: 'Chafadia Noor Academy', level: course.level, score, issueDate: new Date().toLocaleDateString(), success: `${student.fullName} completed all exercises, passed the final exam with ${score}%, and earned this certificate.`, likes: 0, comments: [] };
    setCertificates(prev => [certificate, ...prev]);
    setCourses(prev => prev.map(item => item.id === course.id ? { ...item, progress: 100 } : item));
    Alert.alert('MashaAllah! Certificate Issued', `You passed with ${score}%. Your certificate has been created automatically.`);
    setSelectedExamCourse(null); setExamAnswers({}); setTab('Certificates');
  };

  const openSite = async (url: string) => { const canOpen = await Linking.canOpenURL(url); if (canOpen) await Linking.openURL(url); };
  const shareCourse = async (course: CourseItem) => Share.share({ message: `${course.title}\n${course.description}\nLevel: ${course.level}\nTeacher: ${course.teacher}` });

  const renderContent = () => {
    if (tab === 'Home') return <><StatsRow /><LinearGradient colors={[GREEN, EMERALD]} style={styles.featureCard}><Text style={styles.featureKicker}>Chafadia Noor Academy</Text><Text style={styles.featureTitle}>Unique notes, PDF-style handouts, exercises, exams and certificates.</Text><Text style={styles.featureText}>Certificates are only granted after registration, all exercises completed, final exam passed, and one certificate per student per course.</Text></LinearGradient>{!student.registered && <TouchableOpacity style={styles.primaryButtonGold} onPress={() => setTab('Register')}><UserRound size={18} color="#FFFFFF" /><Text style={styles.primaryButtonText}>Register Before Exam</Text></TouchableOpacity>}<SectionTitle icon={<Library size={18} color={GOLD} />} title="Professional Courses" />{courses.slice(0, 5).map(course => <CourseCard key={course.id} course={course} />)}</>;
    if (tab === 'Register') return <><SectionTitle icon={<UserRound size={18} color={GOLD} />} title="Student Registration" /><View style={styles.registrationCard}><Text style={styles.registrationTitle}>{student.registered ? 'Registered Student' : 'Register to Receive Certificates'}</Text><Text style={styles.registrationText}>Your certificate will use your registered name. Each student can receive only one certificate per course after completing all exercises and passing the final exam.</Text>{student.registered && <Text style={styles.studentIdText}>Student ID: {student.studentId}</Text>}</View><InputBlock label="Full Name" value={student.fullName} onChangeText={text => setStudent({ ...student, fullName: text })} placeholder="Your certificate name" icon={<UserRound size={17} color={GOLD} />} /><InputBlock label="Email" value={student.email} onChangeText={text => setStudent({ ...student, email: text })} placeholder="email@example.com" icon={<Mail size={17} color={GOLD} />} /><InputBlock label="Phone" value={student.phone} onChangeText={text => setStudent({ ...student, phone: text })} placeholder="Phone number" icon={<Phone size={17} color={GOLD} />} /><InputBlock label="Country" value={student.country} onChangeText={text => setStudent({ ...student, country: text })} placeholder="Country" icon={<MapPin size={17} color={GOLD} />} /><InputBlock label="City" value={student.city} onChangeText={text => setStudent({ ...student, city: text })} placeholder="City" icon={<MapPin size={17} color={GOLD} />} /><InputBlock label="Gender" value={student.gender} onChangeText={text => setStudent({ ...student, gender: text })} placeholder="Optional" icon={<Users size={17} color={GOLD} />} /><InputBlock label="Date of Birth" value={student.dateOfBirth} onChangeText={text => setStudent({ ...student, dateOfBirth: text })} placeholder="DD/MM/YYYY" icon={<CalendarDays size={17} color={GOLD} />} /><TouchableOpacity style={styles.primaryButton} onPress={registerStudent}><CheckCircle2 size={18} color="#FFFFFF" /><Text style={styles.primaryButtonText}>{student.registered ? 'Update Registration' : 'Complete Registration'}</Text></TouchableOpacity></>;
    if (tab === 'Courses') return <><ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>{(['All', ...CATEGORIES] as (CourseCategory | 'All')[]).map(category => { const active = selectedCategory === category; return <TouchableOpacity key={category} style={[styles.categoryPill, active && styles.categoryPillActive]} onPress={() => setSelectedCategory(category)}><Text style={[styles.categoryText, active && styles.categoryTextActive]}>{category}</Text></TouchableOpacity>; })}</ScrollView>{filteredCourses.map(course => <CourseCard key={course.id} course={course} />)}</>;
    if (tab === 'Notes') return <><SectionTitle icon={<BookMarked size={18} color={GOLD} />} title="Course Notes & PDF Handouts" />{courses.map(course => <TouchableOpacity key={course.id} style={styles.noteCourseCard} onPress={() => setSelectedNotesCourse(course)}><BookMarked size={22} color={GOLD} /><View style={{ flex: 1 }}><Text style={styles.noteCourseTitle}>{course.title}</Text><Text style={styles.noteCourseMeta}>{course.notes.length} notes • PDF-style handouts • assignments</Text></View><ChevronRight size={20} color={GREEN} /></TouchableOpacity>)}</>;
    if (tab === 'Exercises') return <><SectionTitle icon={<ClipboardCheck size={18} color={GOLD} />} title="Required Exercises" />{courses.map(course => <TouchableOpacity key={course.id} style={styles.noteCourseCard} onPress={() => setSelectedExerciseCourse(course)}><ClipboardCheck size={22} color={GOLD} /><View style={{ flex: 1 }}><Text style={styles.noteCourseTitle}>{course.title}</Text><Text style={styles.noteCourseMeta}>{course.exercises.length} exercises • {completedExercises[getExerciseKey(course.id)] ? 'Completed' : 'Required before exam'}</Text></View>{completedExercises[getExerciseKey(course.id)] ? <BadgeCheck size={21} color={GOLD} /> : <ChevronRight size={20} color={GREEN} />}</TouchableOpacity>)}</>;
    if (tab === 'Exams') return <><SectionTitle icon={<Trophy size={18} color={GOLD} />} title="Final Exams" />{!student.registered && <View style={styles.warningCard}><ShieldCheck size={20} color={ROSE} /><Text style={styles.warningText}>Register first so your certificate can be issued with your name after passing.</Text></View>}{courses.map(course => { const key = getAttemptKey(course.id); const attempt = examAttempts[key]; const alreadyCertified = certificates.some(cert => cert.courseId === course.id && cert.studentId === student.studentId); const locked = attempt?.lastAttemptAt && Date.now() - attempt.lastAttemptAt < DAY_MS && attempt.count > 0; return <TouchableOpacity key={course.id} style={styles.examCourseCard} onPress={() => setSelectedExamCourse(course)}><Trophy size={22} color={GOLD} /><View style={{ flex: 1 }}><Text style={styles.noteCourseTitle}>{course.title}</Text><Text style={styles.noteCourseMeta}>Pass: {course.passMark}% • Fail below 60% • Attempts: {attempt?.count || 0}/3</Text><Text style={styles.examStatusText}>{alreadyCertified ? 'Certificate already issued' : locked ? 'Retake locked for one day' : completedExercises[getExerciseKey(course.id)] ? 'Ready for exam' : 'Complete exercises first'}</Text></View>{alreadyCertified ? <BadgeCheck size={21} color={GOLD} /> : locked ? <Lock size={20} color={ROSE} /> : <ChevronRight size={20} color={GREEN} />}</TouchableOpacity>; })}</>;
    if (tab === 'Certificates') return <><TouchableOpacity style={styles.primaryButton} onPress={() => setTab('Post')}><Upload size={18} color="#FFFFFF" /><Text style={styles.primaryButtonText}>Post External Certificate</Text></TouchableOpacity>{certificates.length === 0 && <View style={styles.emptyCard}><Award size={38} color={GOLD} /><Text style={styles.emptyTitle}>No certificates yet</Text><Text style={styles.emptyText}>Complete exercises and pass a final exam to automatically receive your certificate.</Text></View>}{certificates.map(cert => <CertificateCard key={cert.id} cert={cert} />)}</>;
    if (tab === 'Sites') return <>{sites.map(site => <SiteCard key={site.id} site={site} />)}</>;
    return <PostPage />;
  };

  function StatsRow() { return <View style={styles.statsGrid}><StatCard icon={<BookOpen size={21} color={GOLD} />} value={`${courses.length}`} label="Courses" /><StatCard icon={<Award size={21} color={GOLD} />} value={`${certificates.length}`} label="Certificates" /><StatCard icon={<BarChart3 size={21} color={GOLD} />} value={`${averageProgress}%`} label="Progress" /></View>; }
  function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) { return <View style={styles.statCard}>{icon}<Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
  function CourseCard({ course }: { course: CourseItem }) { return <TouchableOpacity style={styles.courseCard} onPress={() => setSelectedCourse(course)}><LinearGradient colors={[GREEN, EMERALD]} style={styles.courseIconBox}><BookOpen size={24} color={GOLD} /></LinearGradient><View style={{ flex: 1 }}><View style={styles.courseTopRow}><Text style={styles.courseCategory}>{course.category}</Text>{course.certificate && <View style={styles.certPill}><Award size={11} color="#FFFFFF" /><Text style={styles.certPillText}>Certificate</Text></View>}</View><Text style={styles.courseTitle}>{course.title}</Text><Text style={styles.courseMeta}>{course.level} • {course.lessons} lessons • {course.duration}</Text><Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text><View style={styles.courseBadges}><Text style={styles.courseBadgeText}>{course.notes.length} Notes</Text><Text style={styles.courseBadgeText}>{course.exercises.length} Exercises</Text><Text style={styles.courseBadgeText}>Pass {course.passMark}%</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${course.progress}%` }]} /></View><Text style={styles.progressText}>{course.progress}% complete</Text></View><TouchableOpacity onPress={() => toggleSaveCourse(course.id)}><Bookmark size={21} color={course.saved ? GOLD : GREEN} fill={course.saved ? GOLD : 'transparent'} /></TouchableOpacity></TouchableOpacity>; }
  function SiteCard({ site }: { site: LearningSite }) { const avgRating = site.reactions.length ? (site.reactions.reduce((s, r) => s + r.rating, 0) / site.reactions.length).toFixed(1) : '0.0'; return <TouchableOpacity style={styles.siteCard} onPress={() => setSelectedSite(site)}><View style={styles.siteIcon}><Globe2 size={23} color={GOLD} /></View><View style={{ flex: 1 }}><Text style={styles.siteName}>{site.name}</Text><Text style={styles.siteDesc} numberOfLines={2}>{site.description}</Text><View style={styles.siteMetaRow}><Star size={13} color={GOLD} fill={GOLD} /><Text style={styles.siteMeta}>{avgRating}</Text><Text style={styles.siteMeta}>• {site.level}</Text><Text style={styles.siteMeta}>• {site.certificate ? 'Certificates' : 'No certificate'}</Text></View></View><ChevronRight size={20} color={GREEN} /></TouchableOpacity>; }
  function CertificateCard({ cert }: { cert: CertificatePost }) { return <View style={styles.certificateCard}><LinearGradient colors={[GREEN, EMERALD]} style={styles.autoCertificate}><Text style={styles.certOfficial}>CERTIFICATE OF COMPLETION</Text><Text style={styles.certAwarded}>This certifies that</Text><Text style={styles.certStudent}>{cert.student}</Text><Text style={styles.certText}>completed all exercises and successfully passed</Text><Text style={styles.certCourse}>{cert.title.replace('Certificate of Completion: ', '')}</Text><Text style={styles.certScore}>Score: {cert.score}% • Level: {cert.level}</Text><Text style={styles.certNo}>No: {cert.certificateNo}</Text><Text style={styles.certDate}>Issued: {cert.issueDate}</Text></LinearGradient><Text style={styles.successText}>{cert.success}</Text>{cert.imageUri && <Image source={{ uri: cert.imageUri }} style={styles.certificateImage} />}{cert.documentName && <View style={styles.documentPill}><FileText size={15} color={GREEN} /><Text style={styles.documentName}>{cert.documentName}</Text></View>}<View style={styles.reactionRow}><TouchableOpacity style={styles.reactionButton} onPress={() => likeCertificate(cert.id)}><Heart size={17} color={ROSE} /><Text style={styles.reactionText}>{cert.likes}</Text></TouchableOpacity><TouchableOpacity style={styles.reactionButton} onPress={() => Share.share({ message: `${cert.title}\n${cert.success}\nCertificate No: ${cert.certificateNo}` })}><Share2 size={17} color={GREEN} /><Text style={styles.reactionText}>Share</Text></TouchableOpacity></View></View>; }
  function ProgressCard({ course }: { course: CourseItem }) { return <View style={styles.progressCard}><View style={styles.progressCardTop}><BookMarked size={21} color={GOLD} /><View style={{ flex: 1 }}><Text style={styles.progressCourseTitle}>{course.title}</Text><Text style={styles.progressCourseMeta}>{course.level} • {course.lessons} lessons</Text></View><Text style={styles.progressPercent}>{course.progress}%</Text></View><View style={styles.progressTrackLarge}><View style={[styles.progressFill, { width: `${course.progress}%` }]} /></View><View style={styles.progressButtons}><TouchableOpacity style={styles.smallButton} onPress={() => updateProgress(course.id, -10)}><RefreshCcw size={14} color="#FFFFFF" /><Text style={styles.smallButtonText}>-10%</Text></TouchableOpacity><TouchableOpacity style={styles.smallButtonGold} onPress={() => updateProgress(course.id, 10)}><CheckCircle2 size={14} color="#FFFFFF" /><Text style={styles.smallButtonText}>+10%</Text></TouchableOpacity><TouchableOpacity style={styles.smallButton} onPress={() => updateProgress(course.id, 100)}><Trophy size={14} color="#FFFFFF" /><Text style={styles.smallButtonText}>Complete</Text></TouchableOpacity></View></View>; }
  function QuestionBlock({ q, answers, onAnswer }: { q: CourseQuestion; answers: Record<string, string>; onAnswer: (id: string, answer: string) => void }) { return <View style={styles.questionCard}><Text style={styles.questionPoints}>{q.points} points • {q.type}</Text><Text style={styles.questionText}>{q.question}</Text>{q.options?.map(option => <TouchableOpacity key={option} style={[styles.optionButton, answers[q.id] === option && styles.optionSelected]} onPress={() => onAnswer(q.id, option)}><Text style={[styles.optionText, answers[q.id] === option && styles.optionTextSelected]}>{option}</Text></TouchableOpacity>)}{!q.options && <TextInput style={styles.answerInput} value={answers[q.id] || ''} onChangeText={text => onAnswer(q.id, text)} placeholder="Write your answer..." placeholderTextColor="#8A8172" multiline />}<Text style={styles.explanation}>{q.explanation}</Text></View>; }
  function PickerRow({ title, options, value, onChange }: { title: string; options: string[]; value: string; onChange: (value: string) => void }) { return <><Text style={styles.inputLabel}>{title}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>{options.map(option => { const active = value === option; return <TouchableOpacity key={option} style={[styles.pickerPill, active && styles.pickerPillActive]} onPress={() => onChange(option)}><Text style={[styles.pickerText, active && styles.pickerTextActive]}>{option}</Text></TouchableOpacity>; })}</ScrollView></>; }
  function InputBlock({ label, value, onChangeText, placeholder, multiline, keyboardType, icon }: { label: string; value: string; onChangeText: (text: string) => void; placeholder?: string; multiline?: boolean; keyboardType?: 'default' | 'numeric'; icon?: React.ReactNode }) { return <><Text style={styles.inputLabel}>{label}</Text><View style={[styles.inputWrap, multiline && styles.textAreaWrap]}>{icon}<TextInput style={[styles.input, multiline && styles.textArea]} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#8A8172" multiline={multiline} keyboardType={keyboardType || 'default'} /></View></>; }

  function PostPage() { return <><SectionTitle icon={<PenLine size={18} color={GOLD} />} title="Post Educational Course" /><InputBlock label="Course Title" value={newCourse.title} onChangeText={text => setNewCourse({ ...newCourse, title: text })} placeholder="Example: Foundations of Aqidah" icon={<BookOpen size={17} color={GOLD} />} /><InputBlock label="Teacher / Instructor" value={newCourse.teacher} onChangeText={text => setNewCourse({ ...newCourse, teacher: text })} placeholder="Teacher name" icon={<UserRound size={17} color={GOLD} />} /><PickerRow title="Category" options={CATEGORIES} value={newCourse.category} onChange={(value) => setNewCourse({ ...newCourse, category: value as CourseCategory })} /><PickerRow title="Level" options={LEVELS} value={newCourse.level} onChange={(value) => setNewCourse({ ...newCourse, level: value as CourseLevel })} /><InputBlock label="Number of Lessons" value={newCourse.lessons} onChangeText={text => setNewCourse({ ...newCourse, lessons: text })} placeholder="12" keyboardType="numeric" icon={<Hash size={17} color={GOLD} />} /><InputBlock label="Duration" value={newCourse.duration} onChangeText={text => setNewCourse({ ...newCourse, duration: text })} placeholder="6 weeks" icon={<Clock size={17} color={GOLD} />} /><InputBlock label="Description / Notes Intro" value={newCourse.description} onChangeText={text => setNewCourse({ ...newCourse, description: text })} placeholder="What students will learn" multiline icon={<ScrollText size={17} color={GOLD} />} /><TouchableOpacity style={styles.toggleRow} onPress={() => setNewCourse({ ...newCourse, certificate: !newCourse.certificate })}><Award size={18} color={GOLD} /><Text style={styles.toggleLabel}>Certificate Available</Text><Text style={styles.toggleState}>{newCourse.certificate ? 'Yes' : 'No'}</Text></TouchableOpacity><TouchableOpacity style={styles.primaryButton} onPress={submitCourse}><Send size={18} color="#FFFFFF" /><Text style={styles.primaryButtonText}>Publish Course</Text></TouchableOpacity><SectionTitle icon={<Award size={18} color={GOLD} />} title="Post External Certificate / Success" /><InputBlock label="Certificate Title" value={newCertificateTitle} onChangeText={setNewCertificateTitle} placeholder="Completed Islamic Studies Level 1" icon={<Award size={17} color={GOLD} />} /><InputBlock label="Student Name" value={newCertificateStudent} onChangeText={setNewCertificateStudent} placeholder="Your name" icon={<UserRound size={17} color={GOLD} />} /><InputBlock label="Site / Academy" value={newCertificateSite} onChangeText={setNewCertificateSite} placeholder="Where you studied" icon={<School size={17} color={GOLD} />} /><PickerRow title="Level" options={LEVELS} value={newCertificateLevel} onChange={(value) => setNewCertificateLevel(value as CourseLevel)} /><InputBlock label="Success Story" value={newCertificateSuccess} onChangeText={setNewCertificateSuccess} placeholder="What you achieved" multiline icon={<Trophy size={17} color={GOLD} />} /><View style={styles.uploadRow}><TouchableOpacity style={styles.uploadButton} onPress={pickCertificateImage}><ImageIcon size={18} color={GREEN} /><Text style={styles.uploadButtonText}>Image</Text></TouchableOpacity><TouchableOpacity style={styles.uploadButton} onPress={pickCertificateDocument}><FileText size={18} color={GREEN} /><Text style={styles.uploadButtonText}>Document</Text></TouchableOpacity></View>{(certificateImage || certificateDocumentName) && <View style={styles.uploadPreview}>{certificateImage && <Image source={{ uri: certificateImage }} style={styles.certificatePreviewImage} />}{certificateDocumentName && <Text style={styles.documentName}>{certificateDocumentName}</Text>}</View>}<TouchableOpacity style={styles.primaryButtonGold} onPress={postCertificate}><Award size={18} color="#FFFFFF" /><Text style={styles.primaryButtonText}>Post Certificate</Text></TouchableOpacity></>; }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.goldGlow} /><View style={styles.greenGlow} />
        <LinearGradient colors={[GREEN, EMERALD]} style={styles.hero}><View style={styles.heroHeader}><View style={{ flex: 1 }}><View style={styles.brandRow}><Sparkles size={18} color={GOLD} /><Text style={styles.heroKicker}>Chafadia Noor Academy</Text></View><Text style={styles.heroTitle}>Islamic Courses</Text><Text style={styles.heroSubtitle}>Professional Notes • Exercises • Exams • Certificates</Text></View><View style={styles.heroIcon}><GraduationCap size={32} color={GOLD} /></View></View><Text style={styles.heroArabic}>طَلَبُ الْعِلْمِ نُورٌ</Text><Text style={styles.heroDua}>Seeking beneficial knowledge brings light to the heart.</Text></LinearGradient>
        <View style={styles.searchBox}><Search size={18} color={GREEN} /><TextInput style={styles.searchInput} placeholder="Search courses, teachers, levels..." placeholderTextColor="#8A8172" value={query} onChangeText={setQuery} /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>{(['Home', 'Register', 'Courses', 'Notes', 'Exercises', 'Exams', 'Certificates', 'Sites', 'Post'] as Tab[]).map(item => { const active = tab === item; return <TouchableOpacity key={item} style={[styles.tabPill, active && styles.tabPillActive]} onPress={() => setTab(item)}>{tabIcon(item, active ? '#FFFFFF' : GREEN)}<Text style={[styles.tabText, active && styles.tabTextActive]}>{item}</Text></TouchableOpacity>; })}</ScrollView>
        {renderContent()}
      </ScrollView>

      <Modal visible={!!selectedCourse} animationType="slide"><SafeAreaView style={styles.safeArea}>{selectedCourse && <ScrollView contentContainerStyle={styles.detailPage}><LinearGradient colors={[GREEN, EMERALD]} style={styles.detailHero}><View style={styles.detailHeroTop}><TouchableOpacity style={styles.closeButton} onPress={() => setSelectedCourse(null)}><X size={20} color={GREEN} /></TouchableOpacity><TouchableOpacity style={styles.closeButton} onPress={() => shareCourse(selectedCourse)}><Share2 size={20} color={GREEN} /></TouchableOpacity></View><Text style={styles.detailCategory}>{selectedCourse.category}</Text><Text style={styles.detailTitle}>{selectedCourse.title}</Text><Text style={styles.detailSub}>{selectedCourse.level} • {selectedCourse.lessons} lessons • Pass {selectedCourse.passMark}%</Text></LinearGradient><View style={styles.detailCard}><Text style={styles.detailSectionTitle}>About this course</Text><Text style={styles.detailText}>{selectedCourse.description}</Text><Text style={styles.teacherLine}>Teacher: {selectedCourse.teacher}</Text><View style={styles.detailStatsRow}><View style={styles.detailStat}><Star size={17} color={GOLD} fill={GOLD} /><Text style={styles.detailStatText}>{selectedCourse.rating}</Text></View><View style={styles.detailStat}><Users size={17} color={GOLD} /><Text style={styles.detailStatText}>{selectedCourse.students} students</Text></View><View style={styles.detailStat}><Award size={17} color={GOLD} /><Text style={styles.detailStatText}>Certificate</Text></View></View></View><SectionTitle icon={<Target size={18} color={GOLD} />} title="Learning Outcomes" />{selectedCourse.outcomes.map(item => <View key={item} style={styles.pointRow}><CheckCircle2 size={18} color={GOLD} /><Text style={styles.pointText}>{item}</Text></View>)}<View style={styles.actionGrid}><TouchableOpacity style={styles.actionGridButton} onPress={() => setSelectedNotesCourse(selectedCourse)}><BookMarked size={19} color="#FFFFFF" /><Text style={styles.actionGridText}>Notes</Text></TouchableOpacity><TouchableOpacity style={styles.actionGridButtonGold} onPress={() => setSelectedExerciseCourse(selectedCourse)}><ClipboardCheck size={19} color="#FFFFFF" /><Text style={styles.actionGridText}>Exercises</Text></TouchableOpacity><TouchableOpacity style={styles.actionGridButton} onPress={() => setSelectedExamCourse(selectedCourse)}><Trophy size={19} color="#FFFFFF" /><Text style={styles.actionGridText}>Exam</Text></TouchableOpacity></View><ProgressCard course={selectedCourse} /><TouchableOpacity style={styles.primaryButton} onPress={() => toggleSaveCourse(selectedCourse.id)}><Bookmark size={18} color="#FFFFFF" fill={selectedCourse.saved ? '#FFFFFF' : 'transparent'} /><Text style={styles.primaryButtonText}>{selectedCourse.saved ? 'Saved' : 'Save Course'}</Text></TouchableOpacity></ScrollView>}</SafeAreaView></Modal>
      <Modal visible={!!selectedNotesCourse} animationType="slide"><SafeAreaView style={styles.safeArea}>{selectedNotesCourse && <ScrollView contentContainerStyle={styles.detailPage}><TopModalHeader title="Course Notes & Handouts" onClose={() => setSelectedNotesCourse(null)} />{selectedNotesCourse.notes.map((note, index) => <View key={note.title} style={styles.noteCard}><Text style={styles.noteNumber}>Lesson {index + 1}</Text><Text style={styles.noteTitle}>{note.title}</Text>{note.content.map((p, i) => <Text key={i} style={styles.noteParagraph}>{p}</Text>)}<Text style={styles.keyTitle}>Key Points</Text>{note.keyPoints.map(point => <View key={point} style={styles.pointInline}><CheckCircle2 size={16} color={GOLD} /><Text style={styles.pointInlineText}>{point}</Text></View>)}{note.pdfTitle && <View style={styles.pdfBox}><FileCheck2 size={20} color={GOLD} /><View style={{ flex: 1 }}><Text style={styles.pdfTitle}>{note.pdfTitle}</Text>{note.pdfPages?.map(page => <Text key={page} style={styles.pdfPage}>{page}</Text>)}</View><Download size={18} color={GREEN} /></View>}{note.assignment && <View style={styles.assignmentBox}><NotebookPen size={18} color={GOLD} /><Text style={styles.assignmentText}>{note.assignment}</Text></View>}</View>)}</ScrollView>}</SafeAreaView></Modal>
      <Modal visible={!!selectedExerciseCourse} animationType="slide"><SafeAreaView style={styles.safeArea}>{selectedExerciseCourse && <ScrollView contentContainerStyle={styles.detailPage}><TopModalHeader title="Required Exercises" onClose={() => setSelectedExerciseCourse(null)} /><View style={styles.examHeaderCard}><ClipboardCheck size={30} color={GOLD} /><Text style={styles.examHeaderTitle}>{selectedExerciseCourse.title}</Text><Text style={styles.examHeaderText}>All exercises must be completed before the final exam is unlocked.</Text></View>{selectedExerciseCourse.exercises.map(q => <QuestionBlock key={q.id} q={q} answers={exerciseAnswers} onAnswer={answerExercise} />)}<TouchableOpacity style={styles.primaryButton} onPress={() => markExercisesComplete(selectedExerciseCourse)}><CheckCircle2 size={18} color="#FFFFFF" /><Text style={styles.primaryButtonText}>Mark Exercises Complete</Text></TouchableOpacity></ScrollView>}</SafeAreaView></Modal>
      <Modal visible={!!selectedExamCourse} animationType="slide"><SafeAreaView style={styles.safeArea}>{selectedExamCourse && <ScrollView contentContainerStyle={styles.detailPage}><TopModalHeader title="Final Exam" onClose={() => setSelectedExamCourse(null)} /><View style={styles.examHeaderCard}><Trophy size={30} color={GOLD} /><Text style={styles.examHeaderTitle}>{selectedExamCourse.title}</Text><Text style={styles.examHeaderText}>Certificate requires completed exercises and exam pass. Below 60% is fail. Two retakes are allowed with a one-day interval.</Text>{lastExamScore !== null && <Text style={styles.lastScoreText}>Last score: {lastExamScore}%</Text>}</View>{selectedExamCourse.finalExam.map(q => <QuestionBlock key={q.id} q={q} answers={examAnswers} onAnswer={answerExam} />)}<TouchableOpacity style={styles.primaryButtonGold} onPress={() => submitFinalExam(selectedExamCourse)}><Award size={18} color="#FFFFFF" /><Text style={styles.primaryButtonText}>Submit Final Exam</Text></TouchableOpacity></ScrollView>}</SafeAreaView></Modal>
      <Modal visible={!!selectedSite} animationType="slide"><SafeAreaView style={styles.safeArea}>{selectedSite && <ScrollView contentContainerStyle={styles.detailPage}><LinearGradient colors={[GREEN, EMERALD]} style={styles.detailHero}><View style={styles.detailHeroTop}><TouchableOpacity style={styles.closeButton} onPress={() => setSelectedSite(null)}><X size={20} color={GREEN} /></TouchableOpacity><TouchableOpacity style={styles.closeButton} onPress={() => openSite(selectedSite.url)}><LinkIcon size={20} color={GREEN} /></TouchableOpacity></View><Text style={styles.detailCategory}>{selectedSite.level}</Text><Text style={styles.detailTitle}>{selectedSite.name}</Text><Text style={styles.detailSub}>{selectedSite.certificate ? 'Certificates available' : 'Learning resource'}</Text></LinearGradient><View style={styles.detailCard}><Text style={styles.detailSectionTitle}>About this site</Text><Text style={styles.detailText}>{selectedSite.description}</Text>{selectedSite.strengths.map(item => <View key={item} style={styles.pointInline}><CheckCircle2 size={16} color={GOLD} /><Text style={styles.pointInlineText}>{item}</Text></View>)}<TouchableOpacity style={styles.primaryButton} onPress={() => openSite(selectedSite.url)}><Globe2 size={18} color="#FFFFFF" /><Text style={styles.primaryButtonText}>Open Website</Text></TouchableOpacity></View><SectionTitle icon={<MessageCircle size={18} color={GOLD} />} title="Student Reactions" />{selectedSite.reactions.map(reaction => <View key={reaction.id} style={styles.reactionCard}><View style={styles.reactionTop}><UserRound size={18} color={GOLD} /><Text style={styles.reactionUser}>{reaction.user}</Text><Text style={styles.reactionRating}>★ {reaction.rating}</Text></View><Text style={styles.reactionSuccess}>{reaction.success}</Text><Text style={styles.reactionBody}>{reaction.reaction}</Text>{reaction.certificateTitle && <Text style={styles.reactionCert}>Certificate: {reaction.certificateTitle}</Text>}</View>)}<SectionTitle icon={<PenLine size={18} color={GOLD} />} title="Add Your Reaction" /><InputBlock label="Success / Level Reached" value={reviewSuccess} onChangeText={setReviewSuccess} placeholder="Example: Completed beginner level" icon={<Trophy size={17} color={GOLD} />} /><PickerRow title="Your Level" options={LEVELS} value={reviewLevel} onChange={(value) => setReviewLevel(value as CourseLevel)} /><InputBlock label="Rating 1 - 5" value={reviewRating} onChangeText={setReviewRating} placeholder="5" keyboardType="numeric" icon={<Star size={17} color={GOLD} />} /><InputBlock label="Certificate Title" value={reviewCertificateTitle} onChangeText={setReviewCertificateTitle} placeholder="Optional" icon={<Award size={17} color={GOLD} />} /><InputBlock label="Reaction" value={reviewText} onChangeText={setReviewText} placeholder="How was your experience?" multiline icon={<MessageCircle size={17} color={GOLD} />} /><TouchableOpacity style={styles.primaryButtonGold} onPress={addSiteReaction}><Send size={18} color="#FFFFFF" /><Text style={styles.primaryButtonText}>Post Reaction</Text></TouchableOpacity></ScrollView>}</SafeAreaView></Modal>
    </SafeAreaView>
  );

  function TopModalHeader({ title, onClose }: { title: string; onClose: () => void }) { return <LinearGradient colors={[GREEN, EMERALD]} style={styles.simpleModalHeader}><TouchableOpacity style={styles.closeButton} onPress={onClose}><X size={20} color={GREEN} /></TouchableOpacity><Text style={styles.simpleModalTitle}>{title}</Text></LinearGradient>; }
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) { return <View style={styles.sectionTitle}>{icon}<Text style={styles.sectionTitleText}>{title}</Text></View>; }
function tabIcon(tab: Tab, color: string) { if (tab === 'Home') return <School size={15} color={color} />; if (tab === 'Register') return <UserRound size={15} color={color} />; if (tab === 'Courses') return <BookOpen size={15} color={color} />; if (tab === 'Notes') return <BookMarked size={15} color={color} />; if (tab === 'Exercises') return <ClipboardCheck size={15} color={color} />; if (tab === 'Exams') return <Trophy size={15} color={color} />; if (tab === 'Certificates') return <Award size={15} color={color} />; if (tab === 'Sites') return <Globe2 size={15} color={color} />; return <PenLine size={15} color={color} />; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: CREAM }, container: { flex: 1 }, content: { paddingHorizontal: 15, paddingTop: 18, paddingBottom: 45 },
  goldGlow: { position: 'absolute', top: -80, right: -90, width: 230, height: 230, borderRadius: 999, backgroundColor: GOLD, opacity: 0.16 }, greenGlow: { position: 'absolute', top: 420, left: -110, width: 240, height: 240, borderRadius: 999, backgroundColor: GREEN, opacity: 0.08 },
  hero: { borderRadius: 34, padding: 19, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 18, elevation: 8 }, heroHeader: { flexDirection: 'row', alignItems: 'center' }, brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 }, heroKicker: { color: GOLD, fontSize: 13, fontWeight: '900' }, heroTitle: { color: '#FFFFFF', fontSize: 31, fontWeight: '900', marginTop: 4, letterSpacing: -0.5 }, heroSubtitle: { color: '#E6FFF4', fontSize: 12, fontWeight: '700', marginTop: 6, lineHeight: 18 }, heroIcon: { width: 58, height: 58, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center' }, heroArabic: { color: '#FFFFFF', fontSize: 23, fontWeight: '900', textAlign: 'center', marginTop: 18 }, heroDua: { color: '#FFF4D6', textAlign: 'center', marginTop: 6, fontWeight: '800' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }, searchInput: { flex: 1, color: GREEN, fontWeight: '800', marginLeft: 8 }, tabScroll: { marginBottom: 14 }, tabPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#E5D9C3', marginRight: 8 }, tabPillActive: { backgroundColor: GREEN, borderColor: GREEN }, tabText: { color: GREEN, fontSize: 11, fontWeight: '900', marginLeft: 6 }, tabTextActive: { color: '#FFFFFF' },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 }, statCard: { flex: 1, backgroundColor: CARD, borderRadius: 24, borderWidth: 1, borderColor: '#E5D9C3', padding: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }, statValue: { color: GREEN, fontSize: 20, fontWeight: '900', marginTop: 6 }, statLabel: { color: '#8A8172', fontSize: 10, fontWeight: '900', textAlign: 'center', marginTop: 3 }, featureCard: { borderRadius: 28, padding: 18, marginBottom: 15 }, featureKicker: { color: GOLD, fontWeight: '900', fontSize: 12 }, featureTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginTop: 7 }, featureText: { color: '#E6FFF4', fontSize: 13, fontWeight: '700', lineHeight: 20, marginTop: 8 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, marginBottom: 10 }, sectionTitleText: { color: GREEN, fontSize: 17, fontWeight: '900' }, registrationCard: { backgroundColor: CARD, borderRadius: 26, padding: 15, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 10 }, registrationTitle: { color: GREEN, fontWeight: '900', fontSize: 18 }, registrationText: { color: '#6B6257', fontWeight: '700', lineHeight: 20, marginTop: 7 }, studentIdText: { color: GOLD, fontWeight: '900', marginTop: 9 },
  categoryScroll: { marginBottom: 12 }, categoryPill: { backgroundColor: CARD, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 13, borderWidth: 1, borderColor: '#E5D9C3', marginRight: 8 }, categoryPillActive: { backgroundColor: GREEN, borderColor: GREEN }, categoryText: { color: GREEN, fontWeight: '900', fontSize: 11 }, categoryTextActive: { color: '#FFFFFF' },
  courseCard: { backgroundColor: CARD, borderRadius: 26, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', gap: 12, marginBottom: 11, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 9, elevation: 2 }, courseIconBox: { width: 54, height: 54, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }, courseTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, courseCategory: { color: GOLD, fontWeight: '900', fontSize: 10 }, certPill: { backgroundColor: GOLD, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }, certPillText: { color: '#FFFFFF', fontWeight: '900', fontSize: 9 }, courseTitle: { color: GREEN, fontWeight: '900', fontSize: 15, marginTop: 4 }, courseMeta: { color: '#8A8172', fontWeight: '800', fontSize: 11, marginTop: 3 }, courseDesc: { color: '#6B6257', fontWeight: '700', fontSize: 12, lineHeight: 18, marginTop: 5 }, courseBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 7 }, courseBadgeText: { backgroundColor: MINT, color: GREEN, fontWeight: '900', fontSize: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }, progressTrack: { height: 8, borderRadius: 999, backgroundColor: '#E5D9C3', overflow: 'hidden', marginTop: 9 }, progressFill: { height: '100%', backgroundColor: GOLD, borderRadius: 999 }, progressText: { color: GREEN, fontWeight: '900', fontSize: 10, marginTop: 4 },
  noteCourseCard: { backgroundColor: CARD, borderRadius: 24, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 10 }, examCourseCard: { backgroundColor: CARD, borderRadius: 24, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 10 }, noteCourseTitle: { color: GREEN, fontWeight: '900', fontSize: 15 }, noteCourseMeta: { color: '#8A8172', fontWeight: '800', marginTop: 4, fontSize: 11 }, examStatusText: { color: GOLD, fontWeight: '900', fontSize: 11, marginTop: 3 }, warningCard: { backgroundColor: '#FFF0F0', borderRadius: 22, padding: 14, borderWidth: 1, borderColor: '#F3C5C5', flexDirection: 'row', gap: 9, marginBottom: 10 }, warningText: { flex: 1, color: ROSE, fontWeight: '800', lineHeight: 19 }, emptyCard: { backgroundColor: CARD, borderRadius: 28, padding: 25, borderWidth: 1, borderColor: '#E5D9C3', alignItems: 'center' }, emptyTitle: { color: GREEN, fontWeight: '900', fontSize: 18, marginTop: 10 }, emptyText: { color: '#6B6257', fontWeight: '700', textAlign: 'center', lineHeight: 20, marginTop: 6 },
  siteCard: { backgroundColor: CARD, borderRadius: 26, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 11 }, siteIcon: { width: 50, height: 50, borderRadius: 18, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' }, siteName: { color: GREEN, fontWeight: '900', fontSize: 15 }, siteDesc: { color: '#6B6257', fontWeight: '700', lineHeight: 18, marginTop: 4, fontSize: 12 }, siteMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }, siteMeta: { color: '#8A8172', fontWeight: '900', fontSize: 11 },
  certificateCard: { backgroundColor: CARD, borderRadius: 28, padding: 15, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 12 }, autoCertificate: { borderRadius: 26, padding: 18, alignItems: 'center', borderWidth: 2, borderColor: GOLD }, certOfficial: { color: GOLD, fontWeight: '900', fontSize: 13, letterSpacing: 1 }, certAwarded: { color: '#E6FFF4', fontWeight: '800', marginTop: 12 }, certStudent: { color: '#FFFFFF', fontWeight: '900', fontSize: 27, textAlign: 'center', marginTop: 5 }, certText: { color: '#E6FFF4', fontWeight: '800', marginTop: 8, textAlign: 'center' }, certCourse: { color: GOLD, fontWeight: '900', fontSize: 18, textAlign: 'center', marginTop: 5 }, certScore: { color: '#FFFFFF', fontWeight: '900', marginTop: 10 }, certNo: { color: '#FFF4D6', fontWeight: '800', fontSize: 11, marginTop: 8 }, certDate: { color: '#FFF4D6', fontWeight: '800', fontSize: 11, marginTop: 3 }, successText: { color: TEXT, fontWeight: '700', lineHeight: 20, marginTop: 12 }, certificateImage: { width: '100%', height: 220, borderRadius: 22, marginTop: 12 }, documentPill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: MINT, borderRadius: 16, padding: 10, marginTop: 10 }, documentName: { color: GREEN, fontWeight: '900', flex: 1 }, reactionRow: { flexDirection: 'row', gap: 9, marginTop: 13 }, reactionButton: { backgroundColor: MINT, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }, reactionText: { color: GREEN, fontWeight: '900', fontSize: 12 },
  inputLabel: { color: GOLD, fontSize: 13, fontWeight: '900', marginBottom: 7, marginTop: 8 }, inputWrap: { backgroundColor: CARD, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 8 }, textAreaWrap: { alignItems: 'flex-start', paddingTop: 12 }, input: { flex: 1, color: GREEN, fontWeight: '800', paddingVertical: 8 }, textArea: { minHeight: 95, textAlignVertical: 'top' }, pickerScroll: { marginBottom: 8 }, pickerPill: { backgroundColor: CARD, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 13, borderWidth: 1, borderColor: '#E5D9C3', marginRight: 8 }, pickerPillActive: { backgroundColor: GREEN, borderColor: GREEN }, pickerText: { color: GREEN, fontWeight: '900', fontSize: 11 }, pickerTextActive: { color: '#FFFFFF' }, toggleRow: { backgroundColor: CARD, borderRadius: 18, borderWidth: 1, borderColor: '#E5D9C3', padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }, toggleLabel: { flex: 1, color: GREEN, fontWeight: '900' }, toggleState: { color: GOLD, fontWeight: '900' }, uploadRow: { flexDirection: 'row', gap: 10, marginTop: 10 }, uploadButton: { flex: 1, backgroundColor: MINT, borderRadius: 18, paddingVertical: 13, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 7 }, uploadButtonText: { color: GREEN, fontWeight: '900' }, uploadPreview: { backgroundColor: CARD, borderRadius: 20, padding: 12, borderWidth: 1, borderColor: '#E5D9C3', marginTop: 10 }, certificatePreviewImage: { width: '100%', height: 200, borderRadius: 18 }, primaryButton: { backgroundColor: GREEN, borderRadius: 20, paddingVertical: 14, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 8 }, primaryButtonGold: { backgroundColor: GOLD, borderRadius: 20, paddingVertical: 14, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 8 }, primaryButtonText: { color: '#FFFFFF', fontWeight: '900' },
  detailPage: { paddingBottom: 35 }, detailHero: { padding: 18, borderBottomLeftRadius: 34, borderBottomRightRadius: 34 }, detailHeroTop: { flexDirection: 'row', justifyContent: 'space-between' }, closeButton: { width: 42, height: 42, borderRadius: 999, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }, detailCategory: { color: GOLD, fontWeight: '900', marginTop: 18 }, detailTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginTop: 8 }, detailSub: { color: '#E6FFF4', fontWeight: '800', marginTop: 8 }, detailCard: { backgroundColor: CARD, borderRadius: 26, padding: 16, borderWidth: 1, borderColor: '#E5D9C3', margin: 15 }, detailSectionTitle: { color: GREEN, fontWeight: '900', fontSize: 17 }, detailText: { color: TEXT, fontWeight: '700', lineHeight: 21, marginTop: 8 }, teacherLine: { color: GOLD, fontWeight: '900', marginTop: 10 }, detailStatsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 13 }, detailStat: { backgroundColor: MINT, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 5 }, detailStatText: { color: GREEN, fontWeight: '900', fontSize: 11 }, pointRow: { marginHorizontal: 15, backgroundColor: CARD, borderRadius: 18, padding: 13, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 }, pointText: { flex: 1, color: TEXT, fontWeight: '800' },
  actionGrid: { flexDirection: 'row', gap: 9, marginHorizontal: 15, marginTop: 8 }, actionGridButton: { flex: 1, backgroundColor: GREEN, borderRadius: 18, paddingVertical: 13, alignItems: 'center', gap: 5 }, actionGridButtonGold: { flex: 1, backgroundColor: GOLD, borderRadius: 18, paddingVertical: 13, alignItems: 'center', gap: 5 }, actionGridText: { color: '#FFFFFF', fontWeight: '900', fontSize: 11 }, progressCard: { backgroundColor: CARD, borderRadius: 24, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', marginHorizontal: 15, marginTop: 10, marginBottom: 10 }, progressCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 }, progressCourseTitle: { color: GREEN, fontWeight: '900' }, progressCourseMeta: { color: '#8A8172', fontWeight: '800', fontSize: 11, marginTop: 3 }, progressPercent: { color: GOLD, fontWeight: '900', fontSize: 16 }, progressTrackLarge: { height: 10, borderRadius: 999, backgroundColor: '#E5D9C3', overflow: 'hidden', marginTop: 12 }, progressButtons: { flexDirection: 'row', gap: 8, marginTop: 12 }, smallButton: { flex: 1, backgroundColor: GREEN, borderRadius: 999, paddingVertical: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5 }, smallButtonGold: { flex: 1, backgroundColor: GOLD, borderRadius: 999, paddingVertical: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5 }, smallButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 11 },
  simpleModalHeader: { padding: 18, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 12 }, simpleModalTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 24 }, noteCard: { backgroundColor: CARD, borderRadius: 26, padding: 16, borderWidth: 1, borderColor: '#E5D9C3', margin: 15, marginBottom: 0 }, noteNumber: { color: GOLD, fontWeight: '900', fontSize: 12 }, noteTitle: { color: GREEN, fontWeight: '900', fontSize: 20, marginTop: 5 }, noteParagraph: { color: TEXT, fontWeight: '700', lineHeight: 23, marginTop: 10 }, keyTitle: { color: GOLD, fontWeight: '900', marginTop: 13 }, pointInline: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 9 }, pointInlineText: { color: TEXT, fontWeight: '800', flex: 1 }, pdfBox: { backgroundColor: MINT, borderRadius: 20, padding: 13, flexDirection: 'row', gap: 10, marginTop: 14, borderWidth: 1, borderColor: '#D7C7A7' }, pdfTitle: { color: GREEN, fontWeight: '900' }, pdfPage: { color: '#6B6257', fontWeight: '700', fontSize: 12, marginTop: 4 }, assignmentBox: { backgroundColor: '#FFF8E7', borderRadius: 18, padding: 12, flexDirection: 'row', gap: 8, marginTop: 12 }, assignmentText: { flex: 1, color: TEXT, fontWeight: '800', lineHeight: 19 },
  questionCard: { backgroundColor: CARD, borderRadius: 26, padding: 15, borderWidth: 1, borderColor: '#E5D9C3', margin: 15, marginBottom: 0 }, questionPoints: { color: GOLD, fontWeight: '900', fontSize: 11 }, questionText: { color: GREEN, fontWeight: '900', fontSize: 16, lineHeight: 23, marginTop: 6 }, optionButton: { backgroundColor: CREAM, borderRadius: 16, borderWidth: 1, borderColor: '#E5D9C3', padding: 12, marginTop: 8 }, optionSelected: { backgroundColor: GREEN, borderColor: GREEN }, optionText: { color: GREEN, fontWeight: '800' }, optionTextSelected: { color: '#FFFFFF' }, answerInput: { backgroundColor: CREAM, borderRadius: 16, borderWidth: 1, borderColor: '#E5D9C3', padding: 12, marginTop: 10, minHeight: 80, color: GREEN, fontWeight: '800', textAlignVertical: 'top' }, explanation: { color: '#6B6257', fontWeight: '700', lineHeight: 19, marginTop: 8 }, examHeaderCard: { backgroundColor: CARD, borderRadius: 28, padding: 18, borderWidth: 1, borderColor: '#E5D9C3', margin: 15, alignItems: 'center' }, examHeaderTitle: { color: GREEN, fontWeight: '900', fontSize: 20, textAlign: 'center', marginTop: 8 }, examHeaderText: { color: '#6B6257', fontWeight: '700', textAlign: 'center', lineHeight: 20, marginTop: 8 }, lastScoreText: { color: GOLD, fontWeight: '900', marginTop: 8 },
  reactionCard: { backgroundColor: CARD, borderRadius: 22, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', marginHorizontal: 15, marginBottom: 10 }, reactionTop: { flexDirection: 'row', alignItems: 'center', gap: 7 }, reactionUser: { flex: 1, color: GREEN, fontWeight: '900' }, reactionRating: { color: GOLD, fontWeight: '900' }, reactionSuccess: { color: GOLD, fontWeight: '900', marginTop: 8 }, reactionBody: { color: TEXT, fontWeight: '700', lineHeight: 20, marginTop: 5 }, reactionCert: { color: GREEN, fontWeight: '900', marginTop: 7 },
});
