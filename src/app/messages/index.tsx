import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  Share,
  Switch,
  ImageBackground,
  BackHandler,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio, Video, ResizeMode } from 'expo-av';
import * as Sharing from 'expo-sharing';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

import {
  MessageCircle,
  Phone,
  Video as VideoIcon,
  Search,
  Plus,
  UserRound,
  Camera,
  Image as ImageIcon,
  FileText,
  Mic,
  Send,
  X,
  Settings,
  Bell,
  Lock,
  Archive,
  Pin,
  Star,
  Users,
  CheckCheck,
  PhoneCall,
  PhoneOff,
  Trash2,
  Share2,
  Download,
  Volume2,
  Play,
  Pause,
  UserPlus,
  Circle,
  Eye,
  ShieldCheck,
  Flag,
  Heart,
  ArrowLeft,
  Check,
  Edit3,
  UserCog,
  FolderOpen,
  Moon,
  Wifi,
  Info,
  RefreshCcw,
  CalendarDays,
  Clock,
  Palette,
  Wallpaper,
  MessageSquareText,
  Sparkles,
  SendHorizontal,
  Smile,
  History,
  ImagePlus,
  VideoOff,
  MoreVertical,
} from 'lucide-react-native';

type Tab = 'Chats' | 'Groups' | 'Updates' | 'Calls' | 'Contacts' | 'Settings';
type MessageType = 'text' | 'image' | 'video' | 'file' | 'audio';
type CallType = 'voice' | 'video';
type ThemeName = 'Emerald' | 'Royal' | 'Noor' | 'Rose' | 'Midnight';

type MediaItem = {
  id: string;
  type: MessageType;
  uri?: string;
  name?: string;
  mimeType?: string;
};

type MessageItem = {
  id: string;
  sender: 'me' | 'them';
  text?: string;
  type: MessageType;
  media?: MediaItem;
  time: string;
  read?: boolean;
  pinned?: boolean;
  archived?: boolean;
  liked?: boolean;
  edited?: boolean;
};

type ChatItem = {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  online: boolean;
  typing?: boolean;
  pinned?: boolean;
  archived?: boolean;
  muted?: boolean;
  blocked?: boolean;
  disappearing?: boolean;
  unread: number;
  isGroup?: boolean;
  members?: string[];
  wallpaper?: string;
  messages: MessageItem[];
};

type StatusComment = {
  id: string;
  author: string;
  text: string;
  time: string;
};

type StatusItem = {
  id: string;
  name: string;
  text: string;
  time: string;
  media?: MediaItem;
  views: number;
  mine?: boolean;
  liked?: boolean;
  likes: number;
  comments: StatusComment[];
};

type ChannelItem = {
  id: string;
  name: string;
  description: string;
  followers: number;
  time: string;
  unread: number;
  followed?: boolean;
  verified?: boolean;
  ownerId?: 'me' | 'other';
  allowComments?: boolean;
  emojiMode?: 'any' | 'default' | 'none';
  chosenEmojis?: string[];
  mutedNotifications?: boolean;
  posts?: StatusItem[];
};

type CallItem = {
  id: string;
  name: string;
  type: CallType;
  direction: 'incoming' | 'outgoing' | 'missed' | 'scheduled';
  time: string;
  participants?: string[];
  scheduledFor?: string;
};

type Profile = {
  name: string;
  username: string;
  bio: string;
  about: string;
  status: string;
  country: string;
  education?: string;
  occupation?: string;
  phone: string;
  avatar?: string;
};

type AppSettings = {
  darkMode: boolean;
  notifications: boolean;
  callNotifications: boolean;
  groupNotifications: boolean;
  privacyMode: boolean;
  dataSaver: boolean;
  autoDownloadMedia: boolean;
  readReceipts: boolean;
  onlineStatus: boolean;
  securityLock: boolean;
  selectedTheme: ThemeName;
  homeWallpaper?: string;
  chatWallpaper?: string;
};

type Theme = {
  name: ThemeName;
  primary: string;
  secondary: string;
  accent: string;
  soft: string;
  danger: string;
};

const THEMES: Record<ThemeName, Theme> = {
  Emerald: { name: 'Emerald', primary: '#064E3B', secondary: '#0D7054', accent: '#D4A017', soft: '#E6F1EC', danger: '#9F2D2D' },
  Royal: { name: 'Royal', primary: '#243B6B', secondary: '#38598C', accent: '#E0B84F', soft: '#E9EEF8', danger: '#9F2D2D' },
  Noor: { name: 'Noor', primary: '#4A3F23', secondary: '#8B6F2E', accent: '#F2C94C', soft: '#FBF4D7', danger: '#9F2D2D' },
  Rose: { name: 'Rose', primary: '#7A294A', secondary: '#B3456D', accent: '#F2B84B', soft: '#F8E8EF', danger: '#8B1E2D' },
  Midnight: { name: 'Midnight', primary: '#111827', secondary: '#334155', accent: '#D4A017', soft: '#E5E7EB', danger: '#B91C1C' },
};

const CREAM = '#F7F5EE';
const CARD = '#FFFDF8';
const TEXT = '#3C3A34';
const DARK_BG = '#111A15';
const DARK_CARD = '#1B2A23';

const STORAGE_PROFILE = 'CHAFADIA_COMM_PROFILE_PRO_V3';
const STORAGE_CHATS = 'CHAFADIA_COMM_CHATS_PRO_V3';
const STORAGE_STATUS = 'CHAFADIA_COMM_STATUS_PRO_V3';
const STORAGE_CALLS = 'CHAFADIA_COMM_CALLS_PRO_V3';
const STORAGE_CHANNELS = 'CHAFADIA_COMM_CHANNELS_PRO_V1';
const STORAGE_SETTINGS = 'CHAFADIA_COMM_SETTINGS_PRO_V3';

const COUNTRIES = [
  '🇨🇲 Cameroon', '🇳🇬 Nigeria', '🇬🇭 Ghana', '🇸🇳 Senegal', '🇬🇲 Gambia',
  '🇰🇪 Kenya', '🇹🇿 Tanzania', '🇺🇬 Uganda', '🇿🇦 South Africa', '🇲🇦 Morocco',
  '🇪🇬 Egypt', '🇸🇦 Saudi Arabia', '🇦🇪 United Arab Emirates', '🇬🇧 United Kingdom',
  '🇺🇸 United States', '🇨🇦 Canada', '🇫🇷 France', '🇩🇪 Germany', '🇮🇳 India', '🇵🇰 Pakistan'
];

const DEFAULT_PROFILE: Profile = {
  name: 'Sadiyatou',
  username: '@sadiyatou',
  bio: 'Building meaningful conversations, faith reminders and helpful community connections.',
  about: 'Available • Guided by Faith',
  status: 'Online',
  country: '🇨🇲 Cameroon',
  education: '',
  occupation: '',
  phone: '+237 6XX XXX XXX',
};

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  notifications: true,
  callNotifications: true,
  groupNotifications: true,
  privacyMode: false,
  dataSaver: false,
  autoDownloadMedia: true,
  readReceipts: true,
  onlineStatus: true,
  securityLock: false,
  selectedTheme: 'Emerald',
};

const DEFAULT_CHATS: ChatItem[] = [
  {
    id: '1',
    name: 'Aisha',
    phone: '+237 670 000 001',
    online: true,
    typing: true,
    pinned: true,
    unread: 2,
    messages: [
      { id: 'm1', sender: 'them', type: 'text', text: 'Assalamu alaikum, are you coming for the Quran class?', time: '09:10', read: true },
      { id: 'm2', sender: 'me', type: 'text', text: 'Wa alaikum salam, yes in shaa Allah.', time: '09:11', read: true },
    ],
  },
  {
    id: '2',
    name: 'Family Group',
    phone: 'Group',
    online: false,
    unread: 5,
    isGroup: true,
    members: ['Aisha', 'Maryam', 'Sadiyatou'],
    messages: [{ id: 'm3', sender: 'them', type: 'text', text: 'Reminder: family meeting after Maghrib.', time: 'Yesterday' }],
  },
  {
    id: '3',
    name: 'Maryam',
    phone: '+237 670 000 002',
    online: false,
    unread: 0,
    messages: [{ id: 'm4', sender: 'them', type: 'text', text: 'Jazakillahu khairan.', time: 'Mon' }],
  },
];

const DEFAULT_STATUS: StatusItem[] = [
  { id: 's1', name: 'My Status', text: 'Alhamdulillah for today.', time: 'Today', views: 18, mine: true, likes: 7, comments: [] },
  { id: 's2', name: 'Aisha', text: 'Quran reminder: read even one page today.', time: '30 min ago', views: 23, likes: 12, comments: [{ id: 'cm1', author: 'Maryam', text: 'Beautiful reminder 🤍', time: 'Now' }] },
];

const DEFAULT_CHANNELS: ChannelItem[] = [
  { id: 'islam-channel', name: 'Islam', description: 'Daily reminders, duas and beneficial knowledge.', followers: 13200, time: '2:30 PM', unread: 11, followed: true, verified: true, ownerId: 'other', allowComments: true, emojiMode: 'any', posts: [{ id: 'cp-islam-1', name: 'Islam', text: 'The Day of Arafah is a mercy and reminder to increase dua and good deeds.', time: '2:30 PM', views: 1200, likes: 245, comments: [] }] },
  { id: 'marriage-channel', name: 'Marriage Tips & Health', description: 'Family life, wellness and respectful advice.', followers: 9800, time: '12:54 PM', unread: 3, followed: true, ownerId: 'other', allowComments: true, emojiMode: 'default', posts: [{ id: 'cp-marriage-1', name: 'Marriage Tips & Health', text: 'Build homes with kindness, patience and honest communication.', time: '12:54 PM', views: 760, likes: 93, comments: [] }] },
  { id: 'world-health', name: 'World Health Organization', description: 'Health alerts and public safety updates.', followers: 2400000, time: '10:05 AM', unread: 99, followed: true, verified: true, ownerId: 'other', allowComments: true, emojiMode: 'any', posts: [{ id: 'cp-health-1', name: 'World Health Organization', text: 'Public health update: keep clean water, hygiene and trusted medical advice close to your family.', time: '10:05 AM', views: 5300, likes: 701, comments: [] }] },
  { id: 'real-pain', name: 'Real Pain 🌿🩸', description: 'Healing reflections and emotional support.', followers: 13000, time: 'Suggested', unread: 0 },
  { id: 'english-learning', name: 'English Learning', description: 'Daily learning, grammar and speaking practice.', followers: 151000, time: 'Suggested', unread: 0 },
  { id: 'future-motivation', name: 'Future Motivation', description: 'Motivation, discipline and growth.', followers: 18000, time: 'Suggested', unread: 0 },
];

const DEFAULT_CALLS: CallItem[] = [
  { id: 'c1', name: 'Aisha', type: 'voice', direction: 'outgoing', time: 'Today, 10:30', participants: ['Aisha'] },
  { id: 'c2', name: 'Maryam', type: 'video', direction: 'missed', time: 'Yesterday, 18:15', participants: ['Maryam'] },
];

export default function CommunicationPage() {
  const [tab, setTab] = useState<Tab>('Chats');
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [chats, setChats] = useState<ChatItem[]>(DEFAULT_CHATS);
  const [statuses, setStatuses] = useState<StatusItem[]>(DEFAULT_STATUS);
  const [calls, setCalls] = useState<CallItem[]>(DEFAULT_CALLS);
  const [channels, setChannels] = useState<ChannelItem[]>(DEFAULT_CHANNELS);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const theme = THEMES[settings.selectedTheme];
  const appBg = settings.darkMode ? DARK_BG : CREAM;
  const appCard = settings.darkMode ? DARK_CARD : CARD;
  const appText = settings.darkMode ? '#F9F5E8' : TEXT;

  const [query, setQuery] = useState('');
  const [updatesQuery, setUpdatesQuery] = useState('');
  const [profileCountryVisible, setProfileCountryVisible] = useState(false);
  const [updatesMenuVisible, setUpdatesMenuVisible] = useState(false);
  const [channelCreateVisible, setChannelCreateVisible] = useState(false);
  const [suggestedChannelsVisible, setSuggestedChannelsVisible] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelItem | null>(null);
  const [channelSettingsVisible, setChannelSettingsVisible] = useState(false);
  const [channelInfoVisible, setChannelInfoVisible] = useState(false);
  const [channelSearchVisible, setChannelSearchVisible] = useState(false);
  const [channelMediaVisible, setChannelMediaVisible] = useState(false);
  const [channelInfoQuery, setChannelInfoQuery] = useState('');
  const [channelCommentText, setChannelCommentText] = useState('');
  const [editingChannelComment, setEditingChannelComment] = useState<{ postId: string; commentId: string } | null>(null);
  const [selectedChannelCommentIds, setSelectedChannelCommentIds] = useState<string[]>([]);
  const [channelCommentSelectionPostId, setChannelCommentSelectionPostId] = useState<string | null>(null);
  const [channelPostText, setChannelPostText] = useState('');
  const [statusComposerMode, setStatusComposerMode] = useState<'text' | 'layout' | 'voice' | 'media'>('text');
  const [manageChatsVisible, setManageChatsVisible] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [recordedVoicePreview, setRecordedVoicePreview] = useState<MediaItem | null>(null);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [messageText, setMessageText] = useState('');
  const [editingMessage, setEditingMessage] = useState<MessageItem | null>(null);

  const [profileVisible, setProfileVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const [statusVisible, setStatusVisible] = useState(false);
  const [statusViewerVisible, setStatusViewerVisible] = useState(false);
  const [viewingStatus, setViewingStatus] = useState<StatusItem | null>(null);
  const [statusCommentText, setStatusCommentText] = useState('');
  const [callVisible, setCallVisible] = useState(false);
  const [contactProfileVisible, setContactProfileVisible] = useState(false);
  const [groupVisible, setGroupVisible] = useState(false);
  const [addPeopleVisible, setAddPeopleVisible] = useState(false);
  const [messageActionsVisible, setMessageActionsVisible] = useState(false);
  const [themeVisible, setThemeVisible] = useState(false);
  const [wallpaperVisible, setWallpaperVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [profileImageVisible, setProfileImageVisible] = useState(false);

  const [activeCall, setActiveCall] = useState<{ name: string; type: CallType; participants: string[] } | null>(null);
  const [scheduledCallName, setScheduledCallName] = useState('');
  const [scheduledCallTime, setScheduledCallTime] = useState('Today 8:00 PM');
  const [scheduledCallType, setScheduledCallType] = useState<CallType>('voice');

  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newStatusText, setNewStatusText] = useState('');
  const [newStatusMedia, setNewStatusMedia] = useState<MediaItem | undefined>();
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [keypadVisible, setKeypadVisible] = useState(false);
  const [dialName, setDialName] = useState('');
  const [dialNumber, setDialNumber] = useState('');
  const [dialCountry, setDialCountry] = useState('🇨🇲 Cameroon +237');
  const [channelShortcutIds, setChannelShortcutIds] = useState<string[]>([]);

  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraFacing, setCameraFacing] = useState<CameraType>('front');
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micMuted, setMicMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);

  useEffect(() => {
    loadSaved();
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (keypadVisible) { setKeypadVisible(false); return true; }
      if (messageActionsVisible) { setMessageActionsVisible(false); return true; }
      if (profileCountryVisible) { setProfileCountryVisible(false); return true; }
      if (updatesMenuVisible) { setUpdatesMenuVisible(false); return true; }
      if (channelCreateVisible) { setChannelCreateVisible(false); return true; }
      if (channelSearchVisible) { setChannelSearchVisible(false); return true; }
      if (channelMediaVisible) { setChannelMediaVisible(false); return true; }
      if (channelInfoVisible) { setChannelInfoVisible(false); return true; }
      if (channelSettingsVisible) { setChannelSettingsVisible(false); return true; }
      if (selectedChannel) { setSelectedChannel(null); return true; }
      if (suggestedChannelsVisible) { setSuggestedChannelsVisible(false); return true; }
      if (manageChatsVisible) { setManageChatsVisible(false); return true; }
      if (profileImageVisible) { setProfileImageVisible(false); return true; }
      if (profileVisible) { setProfileVisible(false); return true; }
      if (contactVisible) { setContactVisible(false); return true; }
      if (statusVisible) { setStatusVisible(false); return true; }
      if (statusViewerVisible) { setStatusViewerVisible(false); return true; }
      if (callVisible) { setCallVisible(false); setActiveCall(null); return true; }
      if (contactProfileVisible) { setContactProfileVisible(false); return true; }
      if (groupVisible) { setGroupVisible(false); return true; }
      if (addPeopleVisible) { setAddPeopleVisible(false); return true; }
      if (themeVisible) { setThemeVisible(false); return true; }
      if (wallpaperVisible) { setWallpaperVisible(false); return true; }
      if (historyVisible) { setHistoryVisible(false); return true; }
      if (scheduleVisible) { setScheduleVisible(false); return true; }
      if (selectedChat) { setSelectedChat(null); return true; }
      if (tab !== 'Chats') { setTab('Chats'); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [keypadVisible, messageActionsVisible, profileCountryVisible, updatesMenuVisible, channelCreateVisible, channelSearchVisible, channelMediaVisible, channelInfoVisible, channelSettingsVisible, selectedChannel, suggestedChannelsVisible, manageChatsVisible, profileImageVisible, profileVisible, contactVisible, statusVisible, statusViewerVisible, callVisible, contactProfileVisible, groupVisible, addPeopleVisible, themeVisible, wallpaperVisible, historyVisible, scheduleVisible, selectedChat, tab]);

  const loadSaved = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem(STORAGE_PROFILE);
      const savedChats = await AsyncStorage.getItem(STORAGE_CHATS);
      const savedStatus = await AsyncStorage.getItem(STORAGE_STATUS);
      const savedCalls = await AsyncStorage.getItem(STORAGE_CALLS);
      const savedChannels = await AsyncStorage.getItem(STORAGE_CHANNELS);
      const savedSettings = await AsyncStorage.getItem(STORAGE_SETTINGS);
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      if (savedChats) setChats(JSON.parse(savedChats));
      if (savedStatus) setStatuses(JSON.parse(savedStatus));
      if (savedCalls) setCalls(JSON.parse(savedCalls));
      if (savedChannels) setChannels(JSON.parse(savedChannels));
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch {
      Alert.alert('Storage Error', 'Some saved information could not be loaded.');
    }
  };

  const saveProfile = async (updated: Profile) => {
    setProfile(updated);
    await AsyncStorage.setItem(STORAGE_PROFILE, JSON.stringify(updated));
  };

  const saveChats = async (items: ChatItem[]) => {
    setChats(items);
    await AsyncStorage.setItem(STORAGE_CHATS, JSON.stringify(items));
  };

  const saveStatuses = async (items: StatusItem[]) => {
    setStatuses(items);
    await AsyncStorage.setItem(STORAGE_STATUS, JSON.stringify(items));
  };

  const saveCalls = async (items: CallItem[]) => {
    setCalls(items);
    await AsyncStorage.setItem(STORAGE_CALLS, JSON.stringify(items));
  };

  const saveChannels = async (items: ChannelItem[]) => {
    setChannels(items);
    await AsyncStorage.setItem(STORAGE_CHANNELS, JSON.stringify(items));
  };

  const saveSettings = async (updated: AppSettings) => {
    setSettings(updated);
    await AsyncStorage.setItem(STORAGE_SETTINGS, JSON.stringify(updated));
  };

  const regularContacts = chats.filter(chat => !chat.isGroup);

  const filteredChats = useMemo(() => {
    const s = query.toLowerCase();
    return chats.filter(chat => {
      const matches = chat.name.toLowerCase().includes(s) || chat.phone.toLowerCase().includes(s);
      if (tab === 'Groups') return matches && chat.isGroup;
      if (tab === 'Chats') return matches && !chat.archived;
      return matches;
    });
  }, [query, chats, tab]);

  const openChat = async (chat: ChatItem) => {
    const updated = chats.map(item => (item.id === chat.id ? { ...item, unread: 0 } : item));
    await saveChats(updated);
    const latest = updated.find(item => item.id === chat.id);
    setSelectedChat(latest || { ...chat, unread: 0 });
    setSelectionMode(false);
    setSelectedMessageIds([]);
  };

  const syncSelectedChat = (items: ChatItem[], chatId: string) => {
    const latest = items.find(chat => chat.id === chatId);
    if (latest) setSelectedChat(latest);
  };

  const sendMessage = async () => {
    if (!selectedChat || !messageText.trim()) return;

    if (editingMessage) {
      const updated = chats.map(chat =>
        chat.id === selectedChat.id
          ? { ...chat, messages: chat.messages.map(message => (message.id === editingMessage.id ? { ...message, text: messageText.trim(), edited: true } : message)) }
          : chat
      );
      await saveChats(updated);
      syncSelectedChat(updated, selectedChat.id);
      setMessageText('');
      setEditingMessage(null);
      return;
    }

    const newMessage: MessageItem = { id: `${Date.now()}`, sender: 'me', type: 'text', text: messageText.trim(), time: 'Now', read: true };
    const updated = chats.map(chat => (chat.id === selectedChat.id ? { ...chat, messages: [...chat.messages, newMessage] } : chat));
    await saveChats(updated);
    syncSelectedChat(updated, selectedChat.id);
    setMessageText('');
  };

  const sendMediaMessage = async (media: MediaItem) => {
    if (!selectedChat) return;
    const newMessage: MessageItem = { id: `${Date.now()}`, sender: 'me', type: media.type, media, time: 'Now', read: true };
    const updated = chats.map(chat => (chat.id === selectedChat.id ? { ...chat, messages: [...chat.messages, newMessage] } : chat));
    await saveChats(updated);
    syncSelectedChat(updated, selectedChat.id);
  };

  const pickProfilePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.9 });
    if (!result.canceled) saveProfile({ ...profile, avatar: result.assets[0].uri });
  };

  const takeProfilePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.9 });
    if (!result.canceled) saveProfile({ ...profile, avatar: result.assets[0].uri });
  };

  const pickImageOrVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.8, videoMaxDuration: 180 });
    if (!result.canceled) {
      const asset = result.assets[0];
      sendMediaMessage({ id: `${Date.now()}`, type: asset.type === 'video' ? 'video' : 'image', uri: asset.uri, name: asset.fileName || 'media', mimeType: asset.mimeType });
    }
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.8, videoMaxDuration: 120 });
    if (!result.canceled) {
      const asset = result.assets[0];
      sendMediaMessage({ id: `${Date.now()}`, type: asset.type === 'video' ? 'video' : 'image', uri: asset.uri, name: asset.fileName || 'camera-media', mimeType: asset.mimeType });
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
    if (!result.canceled) {
      const asset = result.assets[0];
      sendMediaMessage({ id: `${Date.now()}`, type: 'file', uri: asset.uri, name: asset.name, mimeType: asset.mimeType });
    }
  };

  const pickStatusMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.85, videoMaxDuration: 180 });
    if (!result.canceled) {
      const asset = result.assets[0];
      setNewStatusMedia({ id: `${Date.now()}`, type: asset.type === 'video' ? 'video' : 'image', uri: asset.uri, name: asset.fileName || 'status-media', mimeType: asset.mimeType });
      setStatusVisible(true);
      setStatusComposerMode('media');
    }
  };

  const takeStatusCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.85, videoMaxDuration: 180 });
    if (!result.canceled) {
      const asset = result.assets[0];
      setNewStatusMedia({ id: `${Date.now()}`, type: asset.type === 'video' ? 'video' : 'image', uri: asset.uri, name: asset.fileName || 'camera-status', mimeType: asset.mimeType });
      setNewStatusText('');
      setStatusComposerMode('media');
      setStatusVisible(true);
    }
  };

  const pickWallpaper = async (target: 'home' | 'chat' | 'currentChat') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (result.canceled) return;
    const uri = result.assets[0].uri;

    if (target === 'home') await saveSettings({ ...settings, homeWallpaper: uri });
    if (target === 'chat') await saveSettings({ ...settings, chatWallpaper: uri });
    if (target === 'currentChat' && selectedChat) {
      const updated = chats.map(chat => (chat.id === selectedChat.id ? { ...chat, wallpaper: uri } : chat));
      await saveChats(updated);
      syncSelectedChat(updated, selectedChat.id);
    }
    setWallpaperVisible(false);
  };

  const startVoiceRecording = async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) return;
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    setRecording(rec);
  };

  const stopVoiceRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    if (uri) setRecordedVoicePreview({ id: `${Date.now()}`, type: 'audio', uri, name: 'Voice note' });
    setRecording(null);
  };

  const sendRecordedVoiceNote = async () => {
    if (!recordedVoicePreview) return;
    await sendMediaMessage(recordedVoicePreview);
    setRecordedVoicePreview(null);
  };

  const deleteRecordedVoiceNote = async () => {
    setRecordedVoicePreview(null);
    if (recording) {
      await recording.stopAndUnloadAsync();
      setRecording(null);
    }
  };

  const stopAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setPlayingAudio(null);
  };

  const playAudio = async (uri: string) => {
    if (playingAudio === uri) {
      await stopAudio();
      return;
    }
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setPlayingAudio(null);
    }
    const { sound } = await Audio.Sound.createAsync({ uri });
    soundRef.current = sound;
    setPlayingAudio(uri);
    sound.setOnPlaybackStatusUpdate(status => {
      if ('didJustFinish' in status && status.didJustFinish) setPlayingAudio(null);
    });
    await sound.playAsync();
  };

  const shareMedia = async (media?: MediaItem) => {
    if (!media?.uri) return;
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(media.uri);
  };

  const addContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      Alert.alert('Missing Details', 'Please add name and phone number.');
      return;
    }
    const newChat: ChatItem = { id: `${Date.now()}`, name: newContactName.trim(), phone: newContactPhone.trim(), online: false, unread: 0, messages: [] };
    await saveChats([newChat, ...chats]);
    setNewContactName('');
    setNewContactPhone('');
    setContactVisible(false);
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Missing Group Name', 'Please write the group name.');
      return;
    }
    if (selectedMembers.length === 0) {
      Alert.alert('No Members', 'Please choose at least one person to add.');
      return;
    }
    const group: ChatItem = {
      id: `${Date.now()}`,
      name: newGroupName.trim(),
      phone: 'Group',
      online: false,
      unread: 0,
      isGroup: true,
      members: [profile.name, ...selectedMembers],
      messages: [{ id: `${Date.now()}-welcome`, sender: 'me', type: 'text', text: `Group created with ${selectedMembers.join(', ')}`, time: 'Now', read: true }],
    };
    await saveChats([group, ...chats]);
    setNewGroupName('');
    setSelectedMembers([]);
    setGroupVisible(false);
    setTab('Groups');
  };

  const createStatus = async () => {
    const statusMedia = newStatusMedia || (statusComposerMode === 'voice' ? recordedVoicePreview || undefined : undefined);
    if (!newStatusText.trim() && !statusMedia) {
      Alert.alert('Empty Status', 'Write something or add an image, video, layout text or voice note.');
      return;
    }
    const status: StatusItem = { id: `${Date.now()}`, name: 'My Status', text: newStatusText.trim(), media: statusMedia, time: 'Just now', views: 0, mine: true, likes: 0, comments: [] };
    await saveStatuses([status, ...statuses]);
    setNewStatusText('');
    setNewStatusMedia(undefined);
    setRecordedVoicePreview(null);
    setStatusComposerMode('text');
    setStatusVisible(false);
  };

  const openStatus = (status: StatusItem) => {
    const updated = statuses.map(item => (item.id === status.id ? { ...item, views: item.views + 1 } : item));
    setStatuses(updated);
    AsyncStorage.setItem(STORAGE_STATUS, JSON.stringify(updated));
    setViewingStatus(updated.find(item => item.id === status.id) || status);
    setStatusViewerVisible(true);
  };

  const likeStatus = async (statusId: string) => {
    const updated = statuses.map(status =>
      status.id === statusId
        ? { ...status, liked: !status.liked, likes: status.liked ? Math.max(0, status.likes - 1) : status.likes + 1 }
        : status
    );
    await saveStatuses(updated);
    const fresh = updated.find(status => status.id === statusId);
    if (fresh) setViewingStatus(fresh);
  };

  const commentOnStatus = async () => {
    if (!viewingStatus || !statusCommentText.trim()) return;
    const comment: StatusComment = { id: `${Date.now()}`, author: profile.name, text: statusCommentText.trim(), time: 'Now' };
    const updated = statuses.map(status => (status.id === viewingStatus.id ? { ...status, comments: [...status.comments, comment] } : status));
    await saveStatuses(updated);
    setViewingStatus(updated.find(status => status.id === viewingStatus.id) || viewingStatus);
    setStatusCommentText('');
  };

  const startCall = async (name: string, type: CallType, extraParticipants: string[] = []) => {
    if (type === 'video' && !cameraPermission?.granted) await requestCameraPermission();
    const participants = Array.from(new Set([name, ...extraParticipants].filter(Boolean)));
    const newCall: CallItem = { id: `${Date.now()}`, name, type, direction: 'outgoing', time: 'Now', participants };
    await saveCalls([newCall, ...calls]);
    setActiveCall({ name, type, participants });
    setCallVisible(true);
  };

  const scheduleCall = async () => {
    if (!scheduledCallName.trim() || !scheduledCallTime.trim()) {
      Alert.alert('Missing Schedule', 'Add who you want to call and when.');
      return;
    }
    const call: CallItem = {
      id: `${Date.now()}`,
      name: scheduledCallName.trim(),
      type: scheduledCallType,
      direction: 'scheduled',
      time: `Scheduled • ${scheduledCallTime.trim()}`,
      scheduledFor: scheduledCallTime.trim(),
      participants: [scheduledCallName.trim(), ...selectedMembers],
    };
    await saveCalls([call, ...calls]);
    setScheduledCallName('');
    setScheduledCallTime('Today 8:00 PM');
    setSelectedMembers([]);
    setScheduleVisible(false);
    setTab('Calls');
  };

  const addPersonToCall = (name: string) => {
    if (!activeCall || activeCall.participants.includes(name)) return;
    setActiveCall({ ...activeCall, participants: [...activeCall.participants, name] });
  };

  const saveDialContact = async () => {
    if (!dialName.trim() || !dialNumber.trim()) {
      Alert.alert('Missing Details', 'Please add a name and phone number.');
      return;
    }
    const newChat: ChatItem = {
      id: `${Date.now()}-dial`,
      name: dialName.trim(),
      phone: `${dialCountry.split(' ').pop()} ${dialNumber.trim()}`,
      online: false,
      unread: 0,
      messages: [],
    };
    await saveChats([newChat, ...chats]);
    setDialName('');
    setDialNumber('');
    setKeypadVisible(false);
    setTab('Contacts');
  };

  const dialCallNow = async (type: CallType = 'voice') => {
    const display = dialName.trim() || dialNumber.trim();
    if (!display) {
      Alert.alert('Number Required', 'Type a phone number or choose a contact first.');
      return;
    }
    setKeypadVisible(false);
    await startCall(display, type);
  };

  const toggleChannelShortcut = () => {
    if (!selectedChannel) return;
    setChannelShortcutIds(prev => prev.includes(selectedChannel.id) ? prev.filter(id => id !== selectedChannel.id) : [...prev, selectedChannel.id]);
    setChannelSettingsVisible(false);
    Alert.alert('Shortcut Updated', 'Your channel shortcut preference has been updated.');
  };

  const togglePin = async (chatId: string) => {
    const updated = chats.map(chat => (chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat));
    await saveChats(updated);
    syncSelectedChat(updated, chatId);
  };

  const toggleArchive = async (chatId: string) => {
    const updated = chats.map(chat => (chat.id === chatId ? { ...chat, archived: !chat.archived } : chat));
    await saveChats(updated);
    syncSelectedChat(updated, chatId);
  };

  const updateContactSetting = async (key: 'muted' | 'blocked' | 'disappearing') => {
    if (!selectedChat) return;
    const updated = chats.map(chat => (chat.id === selectedChat.id ? { ...chat, [key]: !chat[key] } : chat));
    await saveChats(updated);
    syncSelectedChat(updated, selectedChat.id);
  };

  const deleteChat = async (chatId: string) => {
    Alert.alert('Delete Chat', 'Do you want to delete this chat?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await saveChats(chats.filter(chat => chat.id !== chatId)); setSelectedChat(null); } },
    ]);
  };

  const clearMessages = async () => {
    if (!selectedChat) return;
    Alert.alert('Clear Messages', 'Delete all messages in this chat?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        const updated = chats.map(chat => (chat.id === selectedChat.id ? { ...chat, messages: [] } : chat));
        await saveChats(updated);
        syncSelectedChat(updated, selectedChat.id);
        setContactProfileVisible(false);
      } },
    ]);
  };

  const toggleSelectMessage = (messageId: string) => {
    if (selectedMessageIds.includes(messageId)) {
      const remaining = selectedMessageIds.filter(id => id !== messageId);
      setSelectedMessageIds(remaining);
      if (remaining.length === 0) setSelectionMode(false);
    } else {
      setSelectionMode(true);
      setSelectedMessageIds([...selectedMessageIds, messageId]);
    }
  };

  const deleteSelectedMessages = async () => {
    if (!selectedChat) return;
    const updated = chats.map(chat =>
      chat.id === selectedChat.id ? { ...chat, messages: chat.messages.filter(message => !selectedMessageIds.includes(message.id)) } : chat
    );
    await saveChats(updated);
    syncSelectedChat(updated, selectedChat.id);
    setSelectionMode(false);
    setSelectedMessageIds([]);
  };

  const updateMessage = async (messageId: string, updates: Partial<MessageItem>) => {
    if (!selectedChat) return;
    const updated = chats.map(chat =>
      chat.id === selectedChat.id ? { ...chat, messages: chat.messages.map(message => (message.id === messageId ? { ...message, ...updates } : message)) } : chat
    );
    await saveChats(updated);
    syncSelectedChat(updated, selectedChat.id);
    setMessageActionsVisible(false);
    setSelectedMessage(null);
  };

  const deleteOneMessage = async (messageId: string) => {
    if (!selectedChat) return;
    const updated = chats.map(chat => (chat.id === selectedChat.id ? { ...chat, messages: chat.messages.filter(message => message.id !== messageId) } : chat));
    await saveChats(updated);
    syncSelectedChat(updated, selectedChat.id);
    setMessageActionsVisible(false);
    setSelectedMessage(null);
  };

  const forwardMessage = async (message: MessageItem) => {
    const text = message.text || message.media?.name || 'Forwarded media/file';
    await Share.share({ message: text });
    setMessageActionsVisible(false);
  };

  const beginEditMessage = (message: MessageItem) => {
    if (message.sender !== 'me' || message.type !== 'text') {
      Alert.alert('Edit Not Available', 'You can only edit your own text messages.');
      return;
    }
    setEditingMessage(message);
    setMessageText(message.text || '');
    setMessageActionsVisible(false);
  };

  const openMessageActions = (message: MessageItem) => {
    setSelectedMessage(message);
    setMessageActionsVisible(true);
  };

  const addMembersToGroup = async () => {
    if (!selectedChat || !selectedChat.isGroup) return;
    const newMembers = selectedMembers.filter(member => !(selectedChat.members || []).includes(member));
    const updated = chats.map(chat => (chat.id === selectedChat.id ? { ...chat, members: [...(chat.members || []), ...newMembers] } : chat));
    await saveChats(updated);
    syncSelectedChat(updated, selectedChat.id);
    setSelectedMembers([]);
    setAddPeopleVisible(false);
  };

  const openNewChatPicker = () => {
    setContactVisible(true);
  };

  const startChatFromContact = (chat: ChatItem) => {
    setContactVisible(false);
    openChat(chat);
  };

  const createChannel = async () => {
    if (!newChannelName.trim()) {
      Alert.alert('Channel Name Required', 'Please enter a channel name.');
      return;
    }
    const channel: ChannelItem = {
      id: `${Date.now()}`,
      name: newChannelName.trim(),
      description: newChannelDescription.trim() || 'New community channel for useful updates.',
      followers: 1,
      time: 'Just now',
      unread: 0,
      followed: true,
      ownerId: 'me',
      allowComments: true,
      emojiMode: 'any',
      chosenEmojis: ['❤️', '👍', '🤲', '✨'],
      posts: [],
    };
    await saveChannels([channel, ...channels]);
    setNewChannelName('');
    setNewChannelDescription('');
    setChannelCreateVisible(false);
  };

  const toggleFollowChannel = async (channelId: string) => {
    const updated = channels.map(channel => channel.id === channelId ? { ...channel, followed: !channel.followed, followers: channel.followed ? Math.max(0, channel.followers - 1) : channel.followers + 1 } : channel);
    await saveChannels(updated);
  };

  const dismissSuggestedChannel = async (channelId: string) => {
    await saveChannels(channels.filter(channel => channel.id !== channelId));
  };
  const openChannel = (channel: ChannelItem) => {
    const updated = channels.map(item => item.id === channel.id ? { ...item, unread: 0 } : item);
    setChannels(updated);
    AsyncStorage.setItem(STORAGE_CHANNELS, JSON.stringify(updated));
    setSelectedChannel(updated.find(item => item.id === channel.id) || channel);
  };

  const syncSelectedChannel = (items: ChannelItem[], channelId: string) => {
    const fresh = items.find(item => item.id === channelId);
    if (fresh) setSelectedChannel(fresh);
  };

  const addChannelReaction = async (postId: string) => {
    if (!selectedChannel) return;
    if (selectedChannel.emojiMode === 'none') {
      Alert.alert('Reactions Off', 'This channel owner has turned off emoji reactions.');
      return;
    }
    const updated = channels.map(channel => channel.id === selectedChannel.id ? {
      ...channel,
      posts: (channel.posts || []).map(post => post.id === postId ? { ...post, liked: !post.liked, likes: post.liked ? Math.max(0, post.likes - 1) : post.likes + 1 } : post),
    } : channel);
    await saveChannels(updated);
    syncSelectedChannel(updated, selectedChannel.id);
  };

  const addChannelComment = async (postId: string) => {
    if (!selectedChannel) return;
    if (!selectedChannel.allowComments) {
      Alert.alert('Comments Off', 'Comments are disabled for this channel.');
      return;
    }
    if (!channelCommentText.trim()) return;

    if (editingChannelComment && editingChannelComment.postId === postId) {
      const updated = channels.map(channel => channel.id === selectedChannel.id ? {
        ...channel,
        posts: (channel.posts || []).map(post => post.id === postId ? {
          ...post,
          comments: post.comments.map(comment => comment.id === editingChannelComment.commentId ? { ...comment, text: channelCommentText.trim(), time: `${comment.time} • edited` } : comment),
        } : post),
      } : channel);
      await saveChannels(updated);
      setChannelCommentText('');
      setEditingChannelComment(null);
      syncSelectedChannel(updated, selectedChannel.id);
      return;
    }

    const comment: StatusComment = { id: `${Date.now()}`, author: profile.name, text: channelCommentText.trim(), time: 'Now' };
    const updated = channels.map(channel => channel.id === selectedChannel.id ? {
      ...channel,
      posts: (channel.posts || []).map(post => post.id === postId ? { ...post, comments: [...post.comments, comment] } : post),
    } : channel);
    await saveChannels(updated);
    setChannelCommentText('');
    syncSelectedChannel(updated, selectedChannel.id);
  };

  const startEditChannelComment = (postId: string, comment: StatusComment) => {
    if (comment.author !== profile.name) {
      Alert.alert('Edit Comment', 'You can only edit your own comments.');
      return;
    }
    setEditingChannelComment({ postId, commentId: comment.id });
    setChannelCommentText(comment.text);
  };

  const deleteChannelComment = async (postId: string, commentId: string) => {
    if (!selectedChannel) return;
    const updated = channels.map(channel => channel.id === selectedChannel.id ? {
      ...channel,
      posts: (channel.posts || []).map(post => post.id === postId ? {
        ...post,
        comments: post.comments.filter(comment => comment.id !== commentId),
      } : post),
    } : channel);
    await saveChannels(updated);
    setSelectedChannelCommentIds(ids => ids.filter(id => id !== commentId));
    syncSelectedChannel(updated, selectedChannel.id);
  };

  const toggleSelectChannelComment = (postId: string, commentId: string) => {
    if (channelCommentSelectionPostId && channelCommentSelectionPostId !== postId) {
      setSelectedChannelCommentIds([commentId]);
      setChannelCommentSelectionPostId(postId);
      return;
    }
    setChannelCommentSelectionPostId(postId);
    setSelectedChannelCommentIds(prev => {
      const next = prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId];
      if (next.length === 0) setChannelCommentSelectionPostId(null);
      return next;
    });
  };

  const deleteSelectedChannelComments = async (postId: string) => {
    if (!selectedChannel || selectedChannel.ownerId !== 'me' || selectedChannelCommentIds.length === 0) return;
    const ids = selectedChannelCommentIds;
    const updated = channels.map(channel => channel.id === selectedChannel.id ? {
      ...channel,
      posts: (channel.posts || []).map(post => post.id === postId ? {
        ...post,
        comments: post.comments.filter(comment => !ids.includes(comment.id)),
      } : post),
    } : channel);
    await saveChannels(updated);
    setSelectedChannelCommentIds([]);
    setChannelCommentSelectionPostId(null);
    syncSelectedChannel(updated, selectedChannel.id);
  };

  const postToOwnChannel = async () => {
    if (!selectedChannel || selectedChannel.ownerId !== 'me') return;
    if (!channelPostText.trim()) {
      Alert.alert('Empty Post', 'Write an update before posting to your channel.');
      return;
    }
    const post: StatusItem = { id: `${Date.now()}`, name: selectedChannel.name, text: channelPostText.trim(), time: 'Just now', views: 0, likes: 0, comments: [], mine: true };
    const updated = channels.map(channel => channel.id === selectedChannel.id ? { ...channel, posts: [post, ...(channel.posts || [])], time: 'Just now' } : channel);
    await saveChannels(updated);
    setChannelPostText('');
    syncSelectedChannel(updated, selectedChannel.id);
  };

  const updateChannelSettings = async (updates: Partial<ChannelItem>) => {
    if (!selectedChannel) return;
    const updated = channels.map(channel => channel.id === selectedChannel.id ? { ...channel, ...updates } : channel);
    await saveChannels(updated);
    syncSelectedChannel(updated, selectedChannel.id);
  };

  const shareChannel = async () => {
    if (!selectedChannel) return;
    await Share.share({ message: `Follow ${selectedChannel.name}: ${selectedChannel.description}` });
  };

  const openChannelInfo = () => {
    setChannelSettingsVisible(false);
    setChannelInfoVisible(true);
  };

  const openChannelSearchInfo = () => {
    setChannelSettingsVisible(false);
    setChannelSearchVisible(true);
  };

  const shareChannelToStatus = async () => {
    if (!selectedChannel) return;
    const status: StatusItem = { id: `${Date.now()}`, name: 'My Status', text: `Follow this channel: ${selectedChannel.name} — ${selectedChannel.description}`, time: 'Just now', views: 0, mine: true, likes: 0, comments: [] };
    await saveStatuses([status, ...statuses]);
    Alert.alert('Shared', 'Channel shared to your status.');
  };

  const reportOrUnfollowChannel = async () => {
    if (!selectedChannel) return;
    if (selectedChannel.ownerId === 'me') return;
    const updated = channels.map(channel => channel.id === selectedChannel.id ? { ...channel, followed: false } : channel);
    await saveChannels(updated);
    setSelectedChannel(null);
    Alert.alert('Updated', 'You have unfollowed this channel.');
  };


  const openUpdatesMenuAction = (action: 'advertise' | 'channel' | 'privacy' | 'archive' | 'settings') => {
    setUpdatesMenuVisible(false);
    if (action === 'channel') setChannelCreateVisible(true);
    if (action === 'settings') setTab('Settings');
    if (action === 'advertise') Alert.alert('Advertise', 'Create sponsored status or channel promotions for your community.');
    if (action === 'privacy') Alert.alert('Status Privacy', 'Choose who can view your status: everyone, contacts only, or selected contacts.');
    if (action === 'archive') Alert.alert('Status Archive', 'Your expired statuses will appear here when archive is enabled.');
  };

  const toggleSelectChatForManage = (chatId: string) => {
    setSelectedChatIds(prev => prev.includes(chatId) ? prev.filter(id => id !== chatId) : [...prev, chatId]);
  };

  const bulkMarkChatsRead = async () => {
    const updated = chats.map(chat => selectedChatIds.includes(chat.id) ? { ...chat, unread: 0 } : chat);
    await saveChats(updated);
    setSelectedChatIds([]);
  };

  const bulkArchiveChats = async () => {
    const updated = chats.map(chat => selectedChatIds.includes(chat.id) ? { ...chat, archived: true } : chat);
    await saveChats(updated);
    setSelectedChatIds([]);
  };

  const bulkDeleteChats = async () => {
    Alert.alert('Delete Chats', 'Delete selected conversations?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await saveChats(chats.filter(chat => !selectedChatIds.includes(chat.id)));
        setSelectedChatIds([]);
      } },
    ]);
  };

  const sharedFiles = useMemo(() => {
    if (!selectedChat) return [];
    return selectedChat.messages.filter(message => ['file', 'image', 'video'].includes(message.type));
  }, [selectedChat]);

  const channelSharedMedia = useMemo(() => {
    if (!selectedChannel) return [];
    return (selectedChannel.posts || [])
      .filter(post => post.media && post.media.type !== 'audio')
      .map(post => ({ id: post.id, media: post.media as MediaItem, text: post.text, time: post.time }));
  }, [selectedChannel]);

  const channelSharedLinks = useMemo(() => {
    if (!selectedChannel) return [];
    const linkRegex = /(https?:\/\/[^\s]+)/gi;
    return (selectedChannel.posts || []).flatMap(post => {
      const matches = post.text.match(linkRegex) || [];
      return matches.map((url, index) => ({ id: `${post.id}-link-${index}`, url, text: post.text, time: post.time }));
    });
  }, [selectedChannel]);

  const chatHistory = useMemo(() => {
    if (!selectedChat) return [];
    const counts = {
      total: selectedChat.messages.length,
      images: selectedChat.messages.filter(m => m.type === 'image').length,
      videos: selectedChat.messages.filter(m => m.type === 'video').length,
      files: selectedChat.messages.filter(m => m.type === 'file').length,
      pinned: selectedChat.messages.filter(m => m.pinned).length,
      liked: selectedChat.messages.filter(m => m.liked).length,
    };
    return [
      ['Total Messages', counts.total, MessageSquareText],
      ['Images', counts.images, ImageIcon],
      ['Videos', counts.videos, VideoIcon],
      ['Files', counts.files, FileText],
      ['Pinned', counts.pinned, Pin],
      ['Liked', counts.liked, Heart],
    ] as any[];
  }, [selectedChat]);

  const renderMainContent = () => {
    if (tab === 'Chats' || tab === 'Groups') {
      return (
        <>
          <StatsStrip />
          <FaithCard theme={theme} />

          {tab === 'Chats' && <TouchableOpacity style={[styles.floatingInlineButton, { backgroundColor: theme.primary }]} onPress={openNewChatPicker}><Plus size={18} color="#FFFFFF" /><Text style={styles.floatingInlineButtonText}>New chat</Text></TouchableOpacity>}

          {tab === 'Groups' && <ProfessionalButton title="Create New Group" icon={<Users size={18} color="#FFFFFF" />} onPress={() => setGroupVisible(true)} />}

          {filteredChats.sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned)).map(chat => (
            <TouchableOpacity key={chat.id} style={[styles.chatCardPro, { backgroundColor: appCard }]} onPress={() => openChat(chat)}>
              <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.avatarPro}>
                {chat.avatar ? <Image source={{ uri: chat.avatar }} style={styles.avatarImage} /> : chat.isGroup ? <Users size={24} color={theme.accent} /> : <UserRound size={24} color={theme.accent} />}
                {chat.online && !chat.isGroup && <View style={styles.onlineDot} />}
              </LinearGradient>

              <View style={{ flex: 1 }}>
                <View style={styles.chatTop}>
                  <Text style={[styles.chatName, { color: settings.darkMode ? '#FFFFFF' : theme.primary }]}>{chat.name}</Text>
                  <Text style={styles.chatTime}>{lastMessage(chat)?.time || 'New'}</Text>
                </View>
                <Text style={styles.chatPreview} numberOfLines={1}>{settings.privacyMode ? 'Message hidden' : chat.typing ? 'typing...' : lastMessageText(chat)}</Text>
                {chat.isGroup && <Text style={[styles.memberLine, { color: theme.accent }]}>{chat.members?.length || 0} members</Text>}
              </View>

              <View style={styles.chatSide}>
                {chat.pinned && <Pin size={14} color={theme.accent} />}
                {chat.muted && <Bell size={14} color="#8A8172" />}
                {chat.unread > 0 && <View style={[styles.unreadBadge, { backgroundColor: theme.accent }]}><Text style={styles.unreadText}>{chat.unread}</Text></View>}
              </View>
            </TouchableOpacity>
          ))}
        </>
      );
    }

    if (tab === 'Updates') {
      const followedChannels = channels.filter(channel => channel.followed && channel.name.toLowerCase().includes(updatesQuery.toLowerCase()));
      const suggestedChannels = channels.filter(channel => !channel.followed && channel.name.toLowerCase().includes(updatesQuery.toLowerCase()));
      return (
        <>
          <View style={styles.updatesHeaderClean}>
            <Text style={[styles.updatesTitleClean, { color: appText }]}>Updates</Text>
            <TouchableOpacity onPress={takeStatusCamera} style={styles.updatesHeaderIcon}><Camera size={23} color={appText} /></TouchableOpacity>
            <TouchableOpacity onPress={() => setSuggestedChannelsVisible(true)} style={styles.updatesHeaderIcon}><Search size={23} color={appText} /></TouchableOpacity>
            <TouchableOpacity onPress={() => setUpdatesMenuVisible(true)} style={styles.updatesHeaderIcon}><MoreVertical size={23} color={appText} /></TouchableOpacity>
          </View>

          <Text style={[styles.updatesSectionTitle, { color: appText }]}>Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusStoryRow}>
            <TouchableOpacity style={[styles.addStatusStory, { backgroundColor: appCard }]} onPress={() => { setStatusComposerMode('text'); setStatusVisible(true); }}>
              <View style={[styles.addStatusAvatar, { borderColor: theme.accent }]}>
                {profile.avatar ? <Image source={{ uri: profile.avatar }} style={styles.statusAvatarImage} /> : <UserRound size={24} color={theme.primary} />}
                <View style={[styles.storyPlusBadge, { backgroundColor: theme.primary }]}><Plus size={15} color="#FFFFFF" /></View>
              </View>
              <Text style={[styles.storyName, { color: appText }]}>Add status</Text>
            </TouchableOpacity>
            {statuses.filter(status => !status.mine).map(status => (
              <TouchableOpacity key={status.id} style={styles.statusStoryCard} onPress={() => openStatus(status)}>
                <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.statusStoryImageBox}>
                  <View style={[styles.statusStoryRing, { borderColor: '#18C66A' }]}>
                    <UserRound size={26} color="#FFFFFF" />
                  </View>
                  <Text style={styles.statusStoryName} numberOfLines={2}>{status.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.channelHeaderRow}>
            <Text style={[styles.updatesSectionTitle, { color: appText }]}>Channels</Text>
            <TouchableOpacity style={[styles.explorePill, { backgroundColor: settings.darkMode ? '#26392F' : '#F2F0EC' }]} onPress={() => setSuggestedChannelsVisible(true)}>
              <Text style={[styles.exploreText, { color: appText }]}>Explore</Text>
            </TouchableOpacity>
          </View>

          {followedChannels.map(channel => (
            <TouchableOpacity key={channel.id} style={[styles.channelRowPro, { backgroundColor: appCard }]} onPress={() => openChannel(channel)}>
              <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.channelAvatar}><Text style={styles.channelInitial}>{channel.name.charAt(0)}</Text></LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.channelName, { color: appText }]} numberOfLines={1}>{channel.name} {channel.verified ? '✅' : ''}</Text>
                <Text style={styles.channelPreview} numberOfLines={1}>▣ {channel.description}</Text>
              </View>
              <View style={styles.channelSideMeta}>
                <Text style={[styles.channelTime, { color: theme.secondary }]}>{channel.time}</Text>
                {channel.unread > 0 && <View style={[styles.channelUnread, { backgroundColor: theme.secondary }]}><Text style={styles.channelUnreadText}>{channel.unread > 99 ? '99+' : channel.unread}</Text></View>}
              </View>
              <TouchableOpacity onPress={(event) => { event.stopPropagation(); setSelectedChannel(channel); setChannelSettingsVisible(true); }} style={styles.channelMiniMenu}><MoreVertical size={19} color={theme.primary} /></TouchableOpacity>
            </TouchableOpacity>
          ))}

          {suggestedChannels.length > 0 && (
            <>
              <Text style={styles.suggestedChannelsTitle}>Find channels to follow</Text>
              {suggestedChannels.slice(0, 6).map(channel => (
                <View key={channel.id} style={[styles.suggestedChannelRow, { backgroundColor: appCard }]}>
                  <LinearGradient colors={[theme.soft, '#FFFFFF']} style={styles.suggestedChannelAvatar}><Text style={[styles.suggestedChannelInitial, { color: theme.primary }]}>{channel.name.charAt(0)}</Text></LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.channelName, { color: appText }]} numberOfLines={1}>{channel.name}</Text>
                    <Text style={styles.channelPreview}>{formatCount(channel.followers)} followers</Text>
                  </View>
                  <TouchableOpacity style={styles.followChannelButton} onPress={() => toggleFollowChannel(channel.id)}><Text style={styles.followChannelText}>Follow</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => dismissSuggestedChannel(channel.id)}><X size={20} color="#6B6257" /></TouchableOpacity>
                </View>
              ))}
            </>
          )}

          <View style={styles.statusFloatingActions} pointerEvents="box-none">
            <TouchableOpacity style={styles.statusPenFab} onPress={() => { setStatusComposerMode('text'); setStatusVisible(true); }}><Edit3 size={22} color={appText} /></TouchableOpacity>
            <TouchableOpacity style={styles.statusCameraFab} onPress={takeStatusCamera}><Camera size={26} color="#FFFFFF" /><Plus size={13} color="#FFFFFF" /></TouchableOpacity>
          </View>
        </>
      );
    }

    if (tab === 'Calls') {
      return (
        <>
          <View style={styles.quickCallRow}>
            <TouchableOpacity style={[styles.quickCallButton, { backgroundColor: theme.primary }]} onPress={() => setKeypadVisible(true)}>
              <PhoneCall size={18} color="#FFFFFF" />
              <Text style={styles.quickCallText}>Keypad</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickCallButton, { backgroundColor: theme.primary }]} onPress={() => setScheduleVisible(true)}>
              <CalendarDays size={18} color="#FFFFFF" />
              <Text style={styles.quickCallText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickCallButtonGold, { backgroundColor: theme.accent }]} onPress={() => setAddPeopleVisible(true)}>
              <VideoIcon size={18} color="#FFFFFF" />
              <Text style={styles.quickCallText}>Group</Text>
            </TouchableOpacity>
          </View>

          {calls.map(call => (
            <View key={call.id} style={[styles.callCardPro, { backgroundColor: appCard }]}>
              <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.avatarProSmall}>
                {call.direction === 'scheduled' ? <CalendarDays size={22} color={theme.accent} /> : <UserRound size={24} color={theme.accent} />}
              </LinearGradient>

              <View style={{ flex: 1 }}>
                <Text style={[styles.chatName, { color: settings.darkMode ? '#FFFFFF' : theme.primary }]}>{call.name}</Text>
                <Text style={[styles.chatPreview, call.direction === 'missed' && { color: theme.danger }]}>{call.direction} • {call.time}</Text>
                {call.participants && call.participants.length > 1 && <Text style={[styles.memberLine, { color: theme.accent }]}>{call.participants.length} participants</Text>}
              </View>

              <TouchableOpacity onPress={() => startCall(call.name, call.type, call.participants?.filter(p => p !== call.name) || [])}>
                {call.type === 'video' ? <VideoIcon size={22} color={theme.primary} /> : <Phone size={22} color={theme.primary} />}
              </TouchableOpacity>
            </View>
          ))}
        </>
      );
    }

    if (tab === 'Contacts') {
      return (
        <>
          <ProfessionalButton title="Add Contact" icon={<UserPlus size={18} color="#FFFFFF" />} onPress={() => setContactVisible(true)} />
          {regularContacts.map(chat => (
            <View key={chat.id} style={[styles.contactCardPro, { backgroundColor: appCard }]}>
              <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.avatarProSmall}>
                <UserRound size={24} color={theme.accent} />
              </LinearGradient>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => openChat(chat)}>
                <Text style={[styles.chatName, { color: settings.darkMode ? '#FFFFFF' : theme.primary }]}>{chat.name}</Text>
                <Text style={styles.chatPreview}>{chat.phone}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openChat(chat)} style={[styles.contactAction, { backgroundColor: theme.primary }]}><MessageCircle size={18} color="#FFFFFF" /></TouchableOpacity>
              <TouchableOpacity onPress={() => startCall(chat.name, 'voice')} style={[styles.contactActionGold, { backgroundColor: theme.accent }]}><Phone size={18} color="#FFFFFF" /></TouchableOpacity>
            </View>
          ))}
        </>
      );
    }

    return (
      <>
        <ProfessionalButton title="Manage Chats" icon={<Archive size={18} color="#FFFFFF" />} onPress={() => setManageChatsVisible(true)} />
        <ProfessionalButton title="Theme & Appearance" icon={<Palette size={18} color="#FFFFFF" />} onPress={() => setThemeVisible(true)} />
        <ProfessionalButton title="Wallpapers" icon={<Wallpaper size={18} color="#FFFFFF" />} onPress={() => setWallpaperVisible(true)} />
        <SettingSwitch title="Dark Mode" subtitle="Change app appearance" Icon={Moon} value={settings.darkMode} onValueChange={() => saveSettings({ ...settings, darkMode: !settings.darkMode })} />
        <SettingSwitch title="Notifications" subtitle="Message alerts" Icon={Bell} value={settings.notifications} onValueChange={() => saveSettings({ ...settings, notifications: !settings.notifications })} />
        <SettingSwitch title="Call Notifications" subtitle="Incoming audio and video call alerts" Icon={PhoneCall} value={settings.callNotifications} onValueChange={() => saveSettings({ ...settings, callNotifications: !settings.callNotifications })} />
        <SettingSwitch title="Group Notifications" subtitle="Group message alerts" Icon={Users} value={settings.groupNotifications} onValueChange={() => saveSettings({ ...settings, groupNotifications: !settings.groupNotifications })} />
        <SettingSwitch title="Privacy Mode" subtitle="Hide message previews" Icon={Lock} value={settings.privacyMode} onValueChange={() => saveSettings({ ...settings, privacyMode: !settings.privacyMode })} />
        <SettingSwitch title="Data Saver" subtitle="Use less mobile data" Icon={Wifi} value={settings.dataSaver} onValueChange={() => saveSettings({ ...settings, dataSaver: !settings.dataSaver })} />
        <SettingSwitch title="Auto Download Media" subtitle="Automatically save photos and files" Icon={Download} value={settings.autoDownloadMedia} onValueChange={() => saveSettings({ ...settings, autoDownloadMedia: !settings.autoDownloadMedia })} />
        <SettingSwitch title="Read Receipts" subtitle="Show message read marks" Icon={CheckCheck} value={settings.readReceipts} onValueChange={() => saveSettings({ ...settings, readReceipts: !settings.readReceipts })} />
        <SettingSwitch title="Online Status" subtitle="Show when you are online" Icon={Eye} value={settings.onlineStatus} onValueChange={() => saveSettings({ ...settings, onlineStatus: !settings.onlineStatus })} />
        <SettingSwitch title="Security Lock" subtitle="Protect communication area" Icon={ShieldCheck} value={settings.securityLock} onValueChange={() => saveSettings({ ...settings, securityLock: !settings.securityLock })} />

        <View style={[styles.settingCardPro, { backgroundColor: appCard }]}>
          <Info size={22} color={theme.accent} />
          <View style={styles.settingTextWrap}>
            <Text style={[styles.chatName, { color: settings.darkMode ? '#FFFFFF' : theme.primary }]}>About Chafadia Noor</Text>
            <Text style={styles.chatPreview}>A peaceful, elegant Islamic communication experience.</Text>
          </View>
        </View>
      </>
    );
  };

  const SettingSwitch = ({ title, subtitle, Icon, value, onValueChange }: any) => (
    <View style={[styles.settingCardPro, { backgroundColor: appCard }]}>
      <Icon size={22} color={theme.accent} />
      <View style={styles.settingTextWrap}>
        <Text style={[styles.chatName, { color: settings.darkMode ? '#FFFFFF' : theme.primary }]}>{title}</Text>
        <Text style={styles.chatPreview}>{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );

  const HomeWrapper = ({ children }: { children: React.ReactNode }) => {
    if (settings.homeWallpaper) {
      return <ImageBackground source={{ uri: settings.homeWallpaper }} style={{ flex: 1 }} imageStyle={{ opacity: settings.darkMode ? 0.22 : 0.18 }}>{children}</ImageBackground>;
    }
    return <>{children}</>;
  };

  const ChatBackground = ({ children }: { children: React.ReactNode }) => {
    const uri = selectedChat?.wallpaper || settings.chatWallpaper;
    if (uri) return <ImageBackground source={{ uri }} style={{ flex: 1 }} imageStyle={{ opacity: 0.2 }}>{children}</ImageBackground>;
    return <View style={{ flex: 1, backgroundColor: appBg }}>{children}</View>;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: appBg }]} edges={['top', 'left', 'right', 'bottom']}>
      <HomeWrapper>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.goldGlow, { backgroundColor: theme.accent }]} />
          <View style={[styles.greenGlow, { backgroundColor: theme.primary }]} />

          <View style={[styles.messagePageHeader, { backgroundColor: appCard }]}>
            <TouchableOpacity style={[styles.profileCompactButton, { borderColor: theme.accent }]} onPress={() => setProfileVisible(true)}>
              {profile.avatar ? <Image source={{ uri: profile.avatar }} style={styles.profileButtonImage} /> : <UserRound size={25} color={theme.primary} />}
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.messageHeaderTitle, { color: appText }]}>Messages</Text>
              <Text style={styles.messageHeaderSub}>Chats • Groups • Updates • Calls</Text>
            </View>
            <TouchableOpacity style={[styles.headerRoundTool, { backgroundColor: theme.soft }]} onPress={() => setTab('Settings')}>
              <MoreVertical size={23} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchMenuRow}>
            <View style={[styles.searchBoxPro, { backgroundColor: appCard, flex: 1 }]}>
              <Search size={18} color={theme.primary} />
              <TextInput style={[styles.searchInput, { color: settings.darkMode ? '#FFFFFF' : theme.primary }]} placeholder="Search chats, groups, contacts, calls..." placeholderTextColor="#8A8172" value={query} onChangeText={setQuery} />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
            {(['Chats', 'Groups', 'Updates', 'Calls', 'Contacts'] as Tab[]).map(item => {
              const active = tab === item;
              return (
                <TouchableOpacity key={item} style={[styles.tabPillPro, { backgroundColor: active ? theme.primary : appCard, borderColor: active ? theme.primary : '#E5D9C3' }]} onPress={() => setTab(item)}>
                  {tabIcon(item, active ? '#FFFFFF' : theme.primary)}
                  <Text style={[styles.tabText, { color: active ? '#FFFFFF' : theme.primary }]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {renderMainContent()}
        </ScrollView>
      </HomeWrapper>

      {/* CHAT ROOM */}
      <Modal visible={!!selectedChat} animationType="slide">
        <SafeAreaView style={[styles.safeArea, { backgroundColor: appBg }]}>
          {selectedChat && (
            <>
              <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.chatHeaderPro}>
                <TouchableOpacity onPress={() => setSelectedChat(null)}><ArrowLeft size={24} color="#FFFFFF" /></TouchableOpacity>
                <TouchableOpacity style={styles.chatHeaderAvatar} onPress={() => setContactProfileVisible(true)}>{selectedChat.isGroup ? <Users size={22} color={theme.accent} /> : <UserRound size={22} color={theme.accent} />}</TouchableOpacity>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => setContactProfileVisible(true)}>
                  <Text style={styles.chatHeaderName}>{selectedChat.name}</Text>
                  <Text style={styles.chatHeaderStatus}>{selectedChat.isGroup ? `${selectedChat.members?.length || 0} members • tap for info` : selectedChat.online ? 'online • tap for profile' : `${selectedChat.phone} • tap for profile`}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => startCall(selectedChat.name, 'voice', selectedChat.isGroup ? selectedChat.members || [] : [])}><Phone size={22} color="#FFFFFF" /></TouchableOpacity>
                <TouchableOpacity onPress={() => startCall(selectedChat.name, 'video', selectedChat.isGroup ? selectedChat.members || [] : [])}><VideoIcon size={22} color="#FFFFFF" /></TouchableOpacity>
                <TouchableOpacity onPress={() => setHistoryVisible(true)}><History size={22} color="#FFFFFF" /></TouchableOpacity>
              </LinearGradient>

              {selectionMode && (
                <View style={styles.selectionBar}>
                  <Text style={styles.selectionText}>{selectedMessageIds.length} selected</Text>
                  <TouchableOpacity style={styles.smallDangerButton} onPress={deleteSelectedMessages}><Trash2 size={15} color="#FFFFFF" /><Text style={styles.smallButtonText}>Delete</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => { setSelectionMode(false); setSelectedMessageIds([]); }}><X size={22} color={theme.primary} /></TouchableOpacity>
                </View>
              )}

              <ChatBackground>
                <ScrollView style={styles.messagesAreaTransparent} contentContainerStyle={styles.messagesContent}>
                  {selectedChat.messages.map(message => {
                    const selected = selectedMessageIds.includes(message.id);
                    return (
                      <View key={message.id} style={[styles.messageRow, message.sender === 'me' && styles.messageRowMine]}>
                        {selectionMode && <TouchableOpacity style={styles.selectBox} onPress={() => toggleSelectMessage(message.id)}>{selected ? <Check size={20} color={theme.accent} /> : <Circle size={20} color="#8A8172" />}</TouchableOpacity>}
                        <TouchableOpacity activeOpacity={0.85} onPress={() => (selectionMode ? toggleSelectMessage(message.id) : openMessageActions(message))} onLongPress={() => toggleSelectMessage(message.id)} style={[styles.messageBubblePro, message.sender === 'me' ? { backgroundColor: theme.soft } : { backgroundColor: appCard }, selected && { borderWidth: 2, borderColor: theme.accent }]}>
                          {message.pinned && <Text style={[styles.messageFlag, { color: theme.accent }]}>📌 pinned</Text>}
                          {message.archived && <Text style={[styles.messageFlag, { color: theme.accent }]}>Archived</Text>}
                          {renderMessageContent(message, playAudio, playingAudio, shareMedia, appText, theme)}
                          <View style={styles.messageMeta}>{message.liked && <Heart size={13} color={theme.danger} fill={theme.danger} />}{message.edited && <Text style={styles.editedText}>edited</Text>}<Text style={styles.messageTime}>{message.time}</Text>{message.sender === 'me' && settings.readReceipts && <CheckCheck size={13} color={theme.primary} />}</View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              </ChatBackground>

              {editingMessage && <View style={styles.editingBar}><Edit3 size={17} color={theme.primary} /><Text style={[styles.editingText, { color: theme.primary }]}>Editing message</Text><TouchableOpacity onPress={() => { setEditingMessage(null); setMessageText(''); }}><X size={18} color={theme.primary} /></TouchableOpacity></View>}

              {(recording || recordedVoicePreview) && <View style={[styles.voiceRecordBar, { backgroundColor: appCard }]}>
                <Mic size={18} color={recording ? theme.danger : theme.primary} />
                <Text style={[styles.voiceRecordText, { color: appText }]}>{recording ? 'Recording voice note...' : 'Voice note ready'}</Text>
                {recording && <TouchableOpacity style={styles.voiceRecordAction} onPress={stopVoiceRecording}><Pause size={16} color={theme.primary} /><Text style={[styles.voiceRecordActionText, { color: theme.primary }]}>Pause</Text></TouchableOpacity>}
                {recordedVoicePreview && <TouchableOpacity style={styles.voiceRecordAction} onPress={() => playAudio(recordedVoicePreview.uri || '')}>{playingAudio === recordedVoicePreview.uri ? <Pause size={16} color={theme.primary} /> : <Play size={16} color={theme.primary} />}<Text style={[styles.voiceRecordActionText, { color: theme.primary }]}>Preview</Text></TouchableOpacity>}
                {recordedVoicePreview && <TouchableOpacity style={[styles.voiceRecordAction, { backgroundColor: theme.primary }]} onPress={sendRecordedVoiceNote}><Send size={16} color="#FFFFFF" /><Text style={[styles.voiceRecordActionText, { color: '#FFFFFF' }]}>Send</Text></TouchableOpacity>}
                <TouchableOpacity style={[styles.voiceRecordAction, { backgroundColor: theme.danger }]} onPress={deleteRecordedVoiceNote}><Trash2 size={16} color="#FFFFFF" /><Text style={[styles.voiceRecordActionText, { color: '#FFFFFF' }]}>Delete</Text></TouchableOpacity>
              </View>}

              <View style={[styles.chatInputBarPro, { backgroundColor: appCard }]}>
                <TouchableOpacity onPress={pickImageOrVideo}><ImageIcon size={22} color={theme.primary} /></TouchableOpacity>
                <TouchableOpacity onPress={openCamera}><Camera size={22} color={theme.primary} /></TouchableOpacity>
                <TouchableOpacity onPress={pickFile}><FileText size={22} color={theme.primary} /></TouchableOpacity>
                <TouchableOpacity onPress={() => setWallpaperVisible(true)}><Wallpaper size={22} color={theme.primary} /></TouchableOpacity>
                <TextInput style={[styles.messageInput, { backgroundColor: settings.darkMode ? '#26392F' : CREAM, color: settings.darkMode ? '#FFFFFF' : theme.primary }]} placeholder="Message..." placeholderTextColor="#8A8172" value={messageText} onChangeText={setMessageText} />
                <TouchableOpacity onPress={recording ? stopVoiceRecording : startVoiceRecording}><Mic size={22} color={recording ? theme.danger : theme.primary} /></TouchableOpacity>
                <TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.primary }]} onPress={sendMessage}><SendHorizontal size={18} color="#FFFFFF" /></TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* CONTACT FULL PROFILE */}
      <Modal visible={contactProfileVisible} animationType="slide">
        <SafeAreaView style={[styles.safeArea, { backgroundColor: appBg }]}>
          {selectedChat && (
            <ScrollView contentContainerStyle={styles.contactProfilePage}>
              <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.contactProfileHeroPro}>
                <TouchableOpacity style={styles.backPill} onPress={() => setContactProfileVisible(false)}><ArrowLeft size={18} color={theme.primary} /><Text style={[styles.backPillText, { color: theme.primary }]}>Back</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.contactBigAvatar, { borderColor: theme.accent }]} onPress={() => setProfileImageVisible(true)}>{selectedChat.avatar ? <Image source={{ uri: selectedChat.avatar }} style={styles.bigAvatarImage} /> : selectedChat.isGroup ? <Users size={52} color={theme.accent} /> : <UserRound size={52} color={theme.accent} />}</TouchableOpacity>
                <Text style={styles.contactProfileName}>{selectedChat.name}</Text>
                <Text style={styles.contactProfilePhone}>{selectedChat.isGroup ? `${selectedChat.members?.length || 0} members` : selectedChat.phone}</Text>
              </LinearGradient>

              <View style={styles.profileActionGrid}>
                <TouchableOpacity style={[styles.profileAction, { backgroundColor: theme.primary }]} onPress={() => startCall(selectedChat.name, 'voice', selectedChat.isGroup ? selectedChat.members || [] : [])}><Phone size={22} color="#FFFFFF" /><Text style={styles.profileActionText}>Audio</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.profileActionGold, { backgroundColor: theme.accent }]} onPress={() => startCall(selectedChat.name, 'video', selectedChat.isGroup ? selectedChat.members || [] : [])}><VideoIcon size={22} color="#FFFFFF" /><Text style={styles.profileActionText}>Video</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.profileAction, { backgroundColor: theme.primary }]} onPress={() => setHistoryVisible(true)}><History size={22} color="#FFFFFF" /><Text style={styles.profileActionText}>History</Text></TouchableOpacity>
              </View>

              <SectionTitle icon={<UserCog size={18} color={theme.accent} />} title="Personal Settings" theme={theme} />
              <ContactSettingRow title="Mute notifications" value={!!selectedChat.muted} onPress={() => updateContactSetting('muted')} />
              <ContactSettingRow title="Disappearing messages" value={!!selectedChat.disappearing} onPress={() => updateContactSetting('disappearing')} />
              {!selectedChat.isGroup && <ContactSettingRow title="Block contact" value={!!selectedChat.blocked} onPress={() => updateContactSetting('blocked')} danger />}

              {selectedChat.isGroup && <><SectionTitle icon={<Users size={18} color={theme.accent} />} title="Group Members" theme={theme} />{(selectedChat.members || []).map(member => <View key={member} style={[styles.fileRowPro, { backgroundColor: appCard }]}><UserRound size={18} color={theme.accent} /><Text style={[styles.fileName, { color: settings.darkMode ? '#FFFFFF' : theme.primary }]}>{member}</Text></View>)}<ProfessionalButton title="Add People To Group" icon={<UserPlus size={18} color="#FFFFFF" />} onPress={() => setAddPeopleVisible(true)} /></>}

              <SectionTitle icon={<FolderOpen size={18} color={theme.accent} />} title="Shared Files & Documents" theme={theme} />
              {sharedFiles.length === 0 ? <EmptyFiles appCard={appCard} appText={appText} theme={theme} /> : sharedFiles.map(item => <TouchableOpacity key={item.id} style={[styles.fileRowPro, { backgroundColor: appCard }]} onPress={() => shareMedia(item.media)}><FileText size={18} color={theme.accent} /><View style={{ flex: 1 }}><Text style={[styles.fileName, { color: settings.darkMode ? '#FFFFFF' : theme.primary }]}>{item.media?.name || item.type}</Text><Text style={styles.fileType}>{item.type}</Text></View><Download size={18} color={theme.primary} /></TouchableOpacity>)}

              <TouchableOpacity style={[styles.dangerWideButton, { backgroundColor: theme.danger }]} onPress={clearMessages}><Trash2 size={18} color="#FFFFFF" /><Text style={styles.publishText}>Clear All Messages</Text></TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* MESSAGE ACTIONS */}
      <Modal visible={messageActionsVisible} transparent animationType="fade">
        <View style={styles.centerOverlay}><View style={[styles.actionSheetPro, { backgroundColor: appBg }]}>
          <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: settings.darkMode ? '#FFFFFF' : theme.primary }]}>Message Actions</Text><TouchableOpacity onPress={() => setMessageActionsVisible(false)}><X size={24} color={theme.primary} /></TouchableOpacity></View>
          <Text style={[styles.actionPreview, { backgroundColor: appCard, color: appText }]} numberOfLines={3}>{selectedMessage?.text || selectedMessage?.media?.name || selectedMessage?.type}</Text>
          {selectedMessage && <><ActionRow icon={<Trash2 size={18} color={theme.danger} />} title="Delete" onPress={() => deleteOneMessage(selectedMessage.id)} /><ActionRow icon={<Share2 size={18} color={theme.accent} />} title="Forward" onPress={() => forwardMessage(selectedMessage)} /><ActionRow icon={<Pin size={18} color={theme.accent} />} title={selectedMessage.pinned ? 'Unpin' : 'Pin'} onPress={() => updateMessage(selectedMessage.id, { pinned: !selectedMessage.pinned })} /><ActionRow icon={<Archive size={18} color={theme.accent} />} title={selectedMessage.archived ? 'Unarchive' : 'Archive'} onPress={() => updateMessage(selectedMessage.id, { archived: !selectedMessage.archived })} /><ActionRow icon={<Heart size={18} color={theme.danger} />} title={selectedMessage.liked ? 'Unlike' : 'Like'} onPress={() => updateMessage(selectedMessage.id, { liked: !selectedMessage.liked })} /><ActionRow icon={<Edit3 size={18} color={theme.accent} />} title="Edit" onPress={() => beginEditMessage(selectedMessage)} /><ActionRow icon={<Check size={18} color={theme.accent} />} title="Select message" onPress={() => { toggleSelectMessage(selectedMessage.id); setMessageActionsVisible(false); }} /></>}
        </View></View>
      </Modal>

      {/* STATUS VIEWER */}
      <Modal visible={statusViewerVisible} animationType="slide">
        <SafeAreaView style={[styles.safeArea, { backgroundColor: appBg }]}>
          {viewingStatus && <ScrollView contentContainerStyle={styles.statusViewerPage}>
            <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.statusViewerHero}>
              <TouchableOpacity style={styles.backPill} onPress={() => setStatusViewerVisible(false)}><ArrowLeft size={18} color={theme.primary} /><Text style={[styles.backPillText, { color: theme.primary }]}>Back</Text></TouchableOpacity>
              <Text style={styles.statusViewerName}>{viewingStatus.name}</Text>
              <Text style={styles.statusViewerTime}>{viewingStatus.time}</Text>
            </LinearGradient>
            <View style={[styles.statusViewerCard, { backgroundColor: appCard }]}>
              <Text style={[styles.statusViewerText, { color: appText }]}>{viewingStatus.text}</Text>
              {viewingStatus.media && <StatusMediaPreview media={viewingStatus.media} large />}
              <View style={styles.statusActionRow}><TouchableOpacity style={styles.statusActionButton} onPress={() => likeStatus(viewingStatus.id)}><Heart size={19} color={viewingStatus.liked ? theme.danger : theme.primary} fill={viewingStatus.liked ? theme.danger : 'transparent'} /><Text style={[styles.statusActionText, { color: theme.primary }]}>{viewingStatus.likes} Likes</Text></TouchableOpacity><View style={styles.statusActionButton}><Eye size={19} color={theme.primary} /><Text style={[styles.statusActionText, { color: theme.primary }]}>{viewingStatus.views} Views</Text></View></View>
            </View>
            <SectionTitle icon={<MessageSquareText size={18} color={theme.accent} />} title="Comments" theme={theme} />
            {viewingStatus.comments.map(comment => <View key={comment.id} style={[styles.commentCard, { backgroundColor: appCard }]}><Text style={[styles.commentAuthor, { color: theme.primary }]}>{comment.author}</Text><Text style={[styles.commentText, { color: appText }]}>{comment.text}</Text><Text style={styles.commentTime}>{comment.time}</Text></View>)}
            <View style={[styles.commentInputBar, { backgroundColor: appCard }]}><Smile size={20} color={theme.primary} /><TextInput style={[styles.commentInput, { color: appText }]} placeholder="Write a comment..." placeholderTextColor="#8A8172" value={statusCommentText} onChangeText={setStatusCommentText} /><TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.primary }]} onPress={commentOnStatus}><Send size={17} color="#FFFFFF" /></TouchableOpacity></View>
          </ScrollView>}
        </SafeAreaView>
      </Modal>

      {/* PROFILE */}
      <Modal visible={profileVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}><View style={[styles.modalCardPro, { backgroundColor: appBg }]}>
          <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: settings.darkMode ? '#FFFFFF' : theme.primary }]}>My Profile</Text><TouchableOpacity onPress={() => setProfileVisible(false)}><X size={24} color={theme.primary} /></TouchableOpacity></View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.profileHero}>
              <TouchableOpacity style={[styles.bigAvatar, { borderColor: theme.accent }]} onPress={() => profile.avatar ? setProfileImageVisible(true) : pickProfilePhoto()}>{profile.avatar ? <Image source={{ uri: profile.avatar }} style={styles.bigAvatarImage} /> : <UserRound size={42} color={theme.accent} />}</TouchableOpacity>
              <Text style={styles.profileFullName}>{profile.name}</Text>
              <Text style={styles.profileFullAbout}>{profile.bio}</Text>
              <View style={styles.profilePhotoActions}>
                <TouchableOpacity style={styles.changePhotoButton} onPress={() => profile.avatar ? setProfileImageVisible(true) : pickProfilePhoto()}><Eye size={15} color={theme.primary} /><Text style={[styles.changePhotoText, { color: theme.primary }]}>View</Text></TouchableOpacity>
                <TouchableOpacity style={styles.changePhotoButton} onPress={pickProfilePhoto}><ImageIcon size={15} color={theme.primary} /><Text style={[styles.changePhotoText, { color: theme.primary }]}>Gallery</Text></TouchableOpacity>
                <TouchableOpacity style={styles.changePhotoButton} onPress={takeProfilePhoto}><Camera size={15} color={theme.primary} /><Text style={[styles.changePhotoText, { color: theme.primary }]}>Camera</Text></TouchableOpacity>
              </View>
            </LinearGradient>
            <View style={styles.profileStatsGrid}>
              <ProfileStat label="Contacts" value={regularContacts.length} />
              <ProfileStat label="Groups" value={chats.filter(c => c.isGroup).length} />
              <ProfileStat label="Channels" value={channels.filter(c => c.followed).length} />
              <ProfileStat label="Calls" value={calls.length} />
            </View>
            <InputBlock label="Name" value={profile.name} onChangeText={text => saveProfile({ ...profile, name: text })} />
            <InputBlock label="Username" value={profile.username} onChangeText={text => saveProfile({ ...profile, username: text })} />
            <InputBlock label="Bio" value={profile.bio} onChangeText={text => saveProfile({ ...profile, bio: text })} />
            <InputBlock label="Status" value={profile.status} onChangeText={text => saveProfile({ ...profile, status: text })} />
            <TouchableOpacity style={[styles.countrySelector, { backgroundColor: appCard }]} onPress={() => setProfileCountryVisible(true)}><Text style={[styles.inputLabel, { color: theme.accent, marginTop: 0 }]}>Country</Text><Text style={[styles.countrySelectorText, { color: appText }]}>{profile.country}</Text></TouchableOpacity>
            <InputBlock label="Education (optional)" value={profile.education || ''} onChangeText={text => saveProfile({ ...profile, education: text })} />
            <InputBlock label="Occupation (optional)" value={profile.occupation || ''} onChangeText={text => saveProfile({ ...profile, occupation: text })} />
            <InputBlock label="Phone" value={profile.phone} onChangeText={text => saveProfile({ ...profile, phone: text })} />
          </ScrollView>
        </View></View>
      </Modal>

      {/* FULL PROFILE IMAGE */}
      <Modal visible={profileImageVisible} animationType="fade">
        <View style={styles.imageViewer}><TouchableOpacity style={styles.imageViewerBack} onPress={() => setProfileImageVisible(false)}><ArrowLeft size={22} color="#FFFFFF" /><Text style={styles.imageViewerBackText}>Back</Text></TouchableOpacity>{profile.avatar || selectedChat?.avatar ? <Image source={{ uri: selectedChat?.avatar || profile.avatar }} style={styles.fullProfileImage} resizeMode="contain" /> : <UserRound size={120} color="#FFFFFF" />}</View>
      </Modal>

      {/* CONTACTS / NEW CHAT */}
      <SimpleModal visible={contactVisible} title="Contacts & New Chat" onClose={() => setContactVisible(false)}>
        <Text style={[styles.inputLabel, { color: theme.accent }]}>Choose a contact to start chatting</Text>
        <ScrollView style={{ maxHeight: 230 }} showsVerticalScrollIndicator={false}>
          {regularContacts.map(contact => (
            <TouchableOpacity key={contact.id} style={[styles.memberPickerRow, { backgroundColor: appCard }]} onPress={() => startChatFromContact(contact)}>
              <UserRound size={20} color={theme.accent} />
              <View style={{ flex: 1 }}><Text style={[styles.memberPickerName, { color: appText }]}>{contact.name}</Text><Text style={styles.memberPickerPhone}>{contact.phone}</Text></View>
              <MessageCircle size={18} color={theme.primary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={[styles.inputLabel, { color: theme.accent }]}>Add a new contact</Text>
        <InputBlock label="Name" value={newContactName} onChangeText={setNewContactName} placeholder="Contact name" />
        <InputBlock label="Phone" value={newContactPhone} onChangeText={setNewContactPhone} placeholder="+237..." />
        <ProfessionalButton title="Save Contact" icon={<UserPlus size={18} color="#FFFFFF" />} onPress={addContact} />
      </SimpleModal>

      {/* CREATE GROUP */}
      <SimpleModal visible={groupVisible} title="Create Group" onClose={() => setGroupVisible(false)}>
        <InputBlock label="Group Name" value={newGroupName} onChangeText={setNewGroupName} placeholder="Example: Quran Sisters" />
        <Text style={[styles.inputLabel, { color: theme.accent }]}>Add People</Text>
        <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>{regularContacts.map(contact => <MemberPickerRow key={contact.id} contact={contact} />)}</ScrollView>
        <ProfessionalButton title="Create Group" icon={<Users size={18} color="#FFFFFF" />} onPress={createGroup} />
      </SimpleModal>

      {/* CREATE STATUS */}
      <SimpleModal visible={statusVisible} title="Add status" onClose={() => setStatusVisible(false)}>
        <View style={styles.statusComposerModeRow}>
          <TouchableOpacity style={[styles.statusModeCard, statusComposerMode === 'text' && { borderColor: theme.primary }]} onPress={() => setStatusComposerMode('text')}><Edit3 size={22} color={theme.primary} /><Text style={styles.statusModeText}>Text</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.statusModeCard, statusComposerMode === 'layout' && { borderColor: theme.primary }]} onPress={() => setStatusComposerMode('layout')}><Palette size={22} color={theme.primary} /><Text style={styles.statusModeText}>Layout</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.statusModeCard, statusComposerMode === 'voice' && { borderColor: theme.primary }]} onPress={() => setStatusComposerMode('voice')}><Mic size={22} color={theme.primary} /><Text style={styles.statusModeText}>Voice</Text></TouchableOpacity>
        </View>
        {statusComposerMode === 'layout' && (
          <View style={styles.layoutChoiceRow}>
            <TouchableOpacity style={[styles.layoutChoiceCard, { backgroundColor: theme.primary }]} onPress={() => setNewStatusText('Today I am grateful for...')}><Text style={styles.layoutChoiceText}>Gratitude</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.layoutChoiceCard, { backgroundColor: theme.secondary }]} onPress={() => setNewStatusText('Reminder: Speak with kindness and patience.')}><Text style={styles.layoutChoiceText}>Reminder</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.layoutChoiceCard, { backgroundColor: theme.accent }]} onPress={() => setNewStatusText('Alhamdulillah for every blessing.')}><Text style={styles.layoutChoiceText}>Noor</Text></TouchableOpacity>
          </View>
        )}
        {statusComposerMode === 'voice' && (
          <View style={[styles.statusVoicePanel, { backgroundColor: appCard }]}> 
            <Mic size={20} color={recording ? theme.danger : theme.primary} />
            <Text style={[styles.voiceRecordText, { color: appText }]}>{recording ? 'Recording voice status...' : recordedVoicePreview ? 'Voice status ready' : 'Record a voice status'}</Text>
            {!recording && !recordedVoicePreview && <TouchableOpacity style={styles.voiceRecordAction} onPress={startVoiceRecording}><Mic size={14} color={theme.primary} /><Text style={styles.voiceRecordActionText}>Record</Text></TouchableOpacity>}
            {recording && <TouchableOpacity style={styles.voiceRecordAction} onPress={stopVoiceRecording}><Pause size={14} color={theme.primary} /><Text style={styles.voiceRecordActionText}>Stop</Text></TouchableOpacity>}
            {recordedVoicePreview && <TouchableOpacity style={styles.voiceRecordAction} onPress={() => playAudio(recordedVoicePreview.uri || '')}>{playingAudio === recordedVoicePreview.uri ? <Pause size={14} color={theme.primary} /> : <Play size={14} color={theme.primary} />}<Text style={styles.voiceRecordActionText}>Preview</Text></TouchableOpacity>}
            {recordedVoicePreview && <TouchableOpacity style={styles.voiceRecordAction} onPress={deleteRecordedVoiceNote}><Trash2 size={14} color={theme.danger} /><Text style={styles.voiceRecordActionText}>Delete</Text></TouchableOpacity>}
          </View>
        )}
        <TextInput style={[styles.statusInputPro, statusComposerMode === 'layout' && styles.statusInputLayout, { backgroundColor: appCard, color: appText }]} value={newStatusText} onChangeText={setNewStatusText} placeholder={newStatusMedia ? "Write something about this status..." : statusComposerMode === 'voice' ? "Add caption to your voice status..." : "Type your status..."} placeholderTextColor="#8A8172" multiline />
        {newStatusMedia && <View style={[styles.selectedMediaBox, { backgroundColor: appCard }]}>{newStatusMedia.type === 'image' ? <ImageIcon size={18} color={theme.accent} /> : newStatusMedia.type === 'video' ? <VideoIcon size={18} color={theme.accent} /> : <FileText size={18} color={theme.accent} />}<Text style={[styles.fileName, { color: appText }]}>{newStatusMedia.name}</Text><TouchableOpacity onPress={() => setNewStatusMedia(undefined)}><X size={18} color={theme.danger} /></TouchableOpacity></View>}
        <View style={styles.statusMediaQuickRow}>
          <TouchableOpacity style={[styles.mediaButtonPro, { backgroundColor: theme.soft, flex: 1 }]} onPress={takeStatusCamera}><Camera size={18} color={theme.primary} /><Text style={[styles.mediaButtonText, { color: theme.primary }]}>Camera</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.mediaButtonPro, { backgroundColor: theme.soft, flex: 1 }]} onPress={pickStatusMedia}><ImagePlus size={18} color={theme.primary} /><Text style={[styles.mediaButtonText, { color: theme.primary }]}>Gallery</Text></TouchableOpacity>
        </View>
        <ProfessionalButton title="Post Status" icon={<Send size={18} color="#FFFFFF" />} onPress={createStatus} />
      </SimpleModal>


      {/* COUNTRY PICKER */}
      <SimpleModal visible={profileCountryVisible} title="Choose Country" onClose={() => setProfileCountryVisible(false)}>
        <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
          {COUNTRIES.map(country => (
            <TouchableOpacity key={country} style={[styles.memberPickerRow, { backgroundColor: appCard }]} onPress={() => { saveProfile({ ...profile, country }); setProfileCountryVisible(false); }}>
              <Text style={[styles.memberPickerName, { color: appText }]}>{country}</Text>
              {profile.country === country && <Check size={20} color={theme.accent} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SimpleModal>

      {/* UPDATES MENU */}
      <SimpleModal visible={updatesMenuVisible} title="Updates Tools" onClose={() => setUpdatesMenuVisible(false)}>
        <ActionRow icon={<Sparkles size={18} color={theme.accent} />} title="Advertise" onPress={() => openUpdatesMenuAction('advertise')} />
        <ActionRow icon={<Plus size={18} color={theme.accent} />} title="Create channel" onPress={() => openUpdatesMenuAction('channel')} />
        <ActionRow icon={<Lock size={18} color={theme.accent} />} title="Status privacy" onPress={() => openUpdatesMenuAction('privacy')} />
        <ActionRow icon={<Archive size={18} color={theme.accent} />} title="Status archive settings" onPress={() => openUpdatesMenuAction('archive')} />
        <ActionRow icon={<Settings size={18} color={theme.accent} />} title="Settings" onPress={() => openUpdatesMenuAction('settings')} />
      </SimpleModal>

      {/* CREATE CHANNEL */}
      <SimpleModal visible={channelCreateVisible} title="Create Channel" onClose={() => setChannelCreateVisible(false)}>
        <InputBlock label="Channel Name" value={newChannelName} onChangeText={setNewChannelName} placeholder="Example: Daily Noor" />
        <InputBlock label="Description" value={newChannelDescription} onChangeText={setNewChannelDescription} placeholder="What will this channel share?" />
        <ProfessionalButton title="Create Channel" icon={<Plus size={18} color="#FFFFFF" />} onPress={createChannel} />
      </SimpleModal>

      {/* SUGGESTED CHANNELS */}
      <SimpleModal visible={suggestedChannelsVisible} title="Find channels to follow" onClose={() => setSuggestedChannelsVisible(false)}>
        <View style={[styles.searchBoxPro, { backgroundColor: appCard, marginHorizontal: 0 }]}><Search size={18} color={theme.primary} /><TextInput style={[styles.searchInput, { color: appText }]} placeholder="Search channels..." placeholderTextColor="#8A8172" value={updatesQuery} onChangeText={setUpdatesQuery} /></View>
        <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
          {channels.filter(c => !c.followed && c.name.toLowerCase().includes(updatesQuery.toLowerCase())).map(channel => (
            <View key={channel.id} style={[styles.suggestedChannelRow, { backgroundColor: appCard }]}>
              <LinearGradient colors={[theme.soft, '#FFFFFF']} style={styles.suggestedChannelAvatar}><Text style={[styles.suggestedChannelInitial, { color: theme.primary }]}>{channel.name.charAt(0)}</Text></LinearGradient>
              <View style={{ flex: 1 }}><Text style={[styles.channelName, { color: appText }]}>{channel.name}</Text><Text style={styles.channelPreview}>{formatCount(channel.followers)} followers</Text></View>
              <TouchableOpacity style={styles.followChannelButton} onPress={() => toggleFollowChannel(channel.id)}><Text style={styles.followChannelText}>Follow</Text></TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </SimpleModal>

      {/* CHANNEL VIEW */}
      <Modal visible={!!selectedChannel} animationType="slide">
        <SafeAreaView style={[styles.safeArea, { backgroundColor: settings.darkMode ? DARK_BG : '#F6F1E8' }]}>
          {selectedChannel && (
            <>
              <View style={[styles.channelChatHeader, { backgroundColor: appCard }]}>
                <TouchableOpacity onPress={() => setSelectedChannel(null)}><ArrowLeft size={24} color={appText} /></TouchableOpacity>
                <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.channelHeaderAvatar}><Text style={styles.channelInitial}>{selectedChannel.name.charAt(0)}</Text></LinearGradient>
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.85} onPress={() => setChannelInfoVisible(true)}>
                  <Text style={[styles.channelPageTitle, { color: appText }]} numberOfLines={1}>{selectedChannel.name} {selectedChannel.verified ? '✅' : ''}</Text>
                  <Text style={styles.channelHeaderMetaLine}>{formatCount(selectedChannel.followers)} followers</Text>
                  <Text style={styles.channelHeaderHint}>Info</Text>
                </TouchableOpacity>
                {selectedChannel.ownerId !== 'me' && (
                  <TouchableOpacity
                    onPress={() => toggleFollowChannel(selectedChannel.id)}
                    style={[styles.channelHeaderFollowButton, { backgroundColor: selectedChannel.followed ? theme.soft : theme.primary }]}
                  >
                    <Text style={[styles.channelHeaderFollowText, { color: selectedChannel.followed ? theme.primary : '#FFFFFF' }]}>{selectedChannel.followed ? 'Following' : 'Follow'}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => updateChannelSettings({ mutedNotifications: !selectedChannel.mutedNotifications })}>{selectedChannel.mutedNotifications ? <Bell size={21} color={theme.danger} /> : <Bell size={21} color={appText} />}</TouchableOpacity>
                <TouchableOpacity onPress={shareChannel}><Share2 size={21} color={appText} /></TouchableOpacity>
                <TouchableOpacity onPress={() => setChannelSettingsVisible(true)}><MoreVertical size={24} color={appText} /></TouchableOpacity>
              </View>
              <View style={[styles.channelQuickTools, { backgroundColor: appCard }]}>
                <TouchableOpacity style={styles.channelQuickTool} onPress={() => setChannelInfoVisible(true)}><Info size={16} color={theme.primary} /><Text style={[styles.channelQuickToolText, { color: theme.primary }]}>Info</Text></TouchableOpacity>
                <TouchableOpacity style={styles.channelQuickTool} onPress={() => setChannelSearchVisible(true)}><Search size={16} color={theme.primary} /><Text style={[styles.channelQuickToolText, { color: theme.primary }]}>Search</Text></TouchableOpacity>
                <TouchableOpacity style={styles.channelQuickTool} onPress={() => setChannelMediaVisible(true)}><FolderOpen size={16} color={theme.primary} /><Text style={[styles.channelQuickToolText, { color: theme.primary }]}>Media</Text></TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.channelChatContent} showsVerticalScrollIndicator={false}>
                {selectedChannel.ownerId === 'me' && (
                  <View style={[styles.ownChannelGrowCard, { backgroundColor: appCard }]}>
                    <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.ownChannelLogo}><Text style={styles.channelInitial}>{selectedChannel.name.charAt(0)}</Text></LinearGradient>
                    <Text style={[styles.ownChannelTitle, { color: appText }]}>Start growing "{selectedChannel.name}"</Text>
                    <TouchableOpacity style={styles.ownChannelAction} onPress={shareChannelToStatus}><Sparkles size={18} color={theme.secondary} /><Text style={styles.ownChannelActionText}>Share to my status</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.ownChannelAction} onPress={() => Alert.alert('Invite Admin', 'Choose trusted contacts to manage this channel with you.')}><Plus size={18} color={theme.secondary} /><Text style={styles.ownChannelActionText}>Invite admins</Text></TouchableOpacity>
                  </View>
                )}

                {selectedChannel.ownerId === 'me' && (
                  <View style={[styles.channelComposerCompact, { backgroundColor: appCard }]}> 
                    <TextInput style={[styles.channelComposerInput, { color: appText }]} placeholder="Write an update" placeholderTextColor="#8A8172" value={channelPostText} onChangeText={setChannelPostText} multiline />
                    <TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.primary }]} onPress={postToOwnChannel}><Send size={17} color="#FFFFFF" /></TouchableOpacity>
                  </View>
                )}

              {(selectedChannel.posts || []).length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: appCard }]}><MessageSquareText size={30} color={theme.accent} /><Text style={[styles.emptyTitle, { color: appText }]}>No channel posts yet</Text><Text style={styles.emptySubtitle}>Updates from this channel will appear here.</Text></View>
              ) : (selectedChannel.posts || []).map(post => (
                <View key={post.id} style={[styles.channelPostCard, { backgroundColor: appCard }]}> 
                  <Text style={[styles.channelPostText, { color: appText }]}>{post.text}</Text>
                  {post.media && <StatusMediaPreview media={post.media} />}
                  <View style={styles.statusActionRow}>
                    <TouchableOpacity style={styles.statusActionButton} onPress={() => addChannelReaction(post.id)}><Heart size={19} color={post.liked ? theme.danger : theme.primary} fill={post.liked ? theme.danger : 'transparent'} /><Text style={[styles.statusActionText, { color: theme.primary }]}>{post.likes} React</Text></TouchableOpacity>
                    <View style={styles.statusActionButton}><Eye size={19} color={theme.primary} /><Text style={[styles.statusActionText, { color: theme.primary }]}>{post.views} Views</Text></View>
                  </View>
                  {selectedChannel.allowComments !== false && (
                    <View style={[styles.channelCommentComposer, { backgroundColor: settings.darkMode ? '#26392F' : CREAM }]}> 
                      {editingChannelComment?.postId === post.id && (
                        <View style={styles.channelEditingStrip}>
                          <Edit3 size={14} color={theme.primary} />
                          <Text style={[styles.channelEditingText, { color: theme.primary }]}>Editing your comment</Text>
                          <TouchableOpacity onPress={() => { setEditingChannelComment(null); setChannelCommentText(''); }}><X size={16} color={theme.primary} /></TouchableOpacity>
                        </View>
                      )}
                      <View style={styles.channelCommentInputRow}>
                        <TextInput style={[styles.commentInput, { color: appText }]} placeholder="Comment on this channel post..." placeholderTextColor="#8A8172" value={editingChannelComment && editingChannelComment.postId !== post.id ? '' : channelCommentText} onChangeText={setChannelCommentText} />
                        <TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.primary }]} onPress={() => addChannelComment(post.id)}><Send size={17} color="#FFFFFF" /></TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {selectedChannel.ownerId === 'me' && channelCommentSelectionPostId === post.id && selectedChannelCommentIds.length > 0 && (
                    <View style={[styles.channelCommentBulkBar, { backgroundColor: theme.soft }]}> 
                      <Text style={[styles.channelCommentBulkText, { color: theme.primary }]}>{selectedChannelCommentIds.length} selected</Text>
                      <TouchableOpacity style={[styles.channelCommentBulkDelete, { backgroundColor: theme.danger }]} onPress={() => deleteSelectedChannelComments(post.id)}>
                        <Trash2 size={14} color="#FFFFFF" />
                        <Text style={styles.channelCommentBulkDeleteText}>Delete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setSelectedChannelCommentIds([]); setChannelCommentSelectionPostId(null); }}><X size={18} color={theme.primary} /></TouchableOpacity>
                    </View>
                  )}

                  {post.comments.length > 0 && <Text style={styles.channelCommentsTitle}>Comments • {post.comments.length}</Text>}
                  {post.comments.map(comment => {
                    const canEdit = comment.author === profile.name;
                    const canDelete = canEdit || selectedChannel.ownerId === 'me';
                    const selectedComment = selectedChannelCommentIds.includes(comment.id);
                    return (
                      <TouchableOpacity
                        key={comment.id}
                        activeOpacity={0.9}
                        onLongPress={() => selectedChannel.ownerId === 'me' && toggleSelectChannelComment(post.id, comment.id)}
                        onPress={() => channelCommentSelectionPostId === post.id && toggleSelectChannelComment(post.id, comment.id)}
                        style={[styles.channelCommentCard, { backgroundColor: settings.darkMode ? '#26392F' : CREAM, borderColor: selectedComment ? theme.accent : '#E5D9C3' }]}
                      >
                        {selectedChannel.ownerId === 'me' && channelCommentSelectionPostId === post.id && (
                          <View style={styles.channelCommentSelectCircle}>{selectedComment ? <Check size={16} color={theme.accent} /> : <Circle size={16} color="#8A8172" />}</View>
                        )}
                        <View style={{ flex: 1 }}>
                          <View style={styles.channelCommentTopRow}>
                            <Text style={[styles.commentAuthor, { color: theme.primary }]}>{comment.author}</Text>
                            <Text style={styles.channelCommentTime}>{comment.time}</Text>
                          </View>
                          <Text style={[styles.commentText, { color: appText }]}>{comment.text}</Text>
                          {(canEdit || canDelete) && (
                            <View style={styles.channelCommentActionsRow}>
                              {canEdit && <TouchableOpacity style={styles.channelCommentAction} onPress={() => startEditChannelComment(post.id, comment)}><Edit3 size={13} color={theme.primary} /><Text style={[styles.channelCommentActionText, { color: theme.primary }]}>Edit</Text></TouchableOpacity>}
                              {canDelete && <TouchableOpacity style={styles.channelCommentAction} onPress={() => deleteChannelComment(post.id, comment.id)}><Trash2 size={13} color={theme.danger} /><Text style={[styles.channelCommentActionText, { color: theme.danger }]}>Delete</Text></TouchableOpacity>}
                              {selectedChannel.ownerId === 'me' && <TouchableOpacity style={styles.channelCommentAction} onPress={() => toggleSelectChannelComment(post.id, comment.id)}><Check size={13} color={theme.accent} /><Text style={[styles.channelCommentActionText, { color: theme.accent }]}>Select</Text></TouchableOpacity>}
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
            </>
          )}
        </SafeAreaView>
      </Modal>


      {/* CHANNEL INFO */}
      <SimpleModal visible={channelInfoVisible} title="Channel Info" onClose={() => setChannelInfoVisible(false)}>
        {selectedChannel && (
          <>
            <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.channelInfoHeroWide}>
              <View style={[styles.channelInfoBigAvatar, { borderColor: theme.accent }]}>
                <Text style={styles.channelInfoBigInitial}>{selectedChannel.name.charAt(0)}</Text>
              </View>
              <Text style={styles.channelInfoBigTitle}>{selectedChannel.name} {selectedChannel.verified ? '✅' : ''}</Text>
              <Text style={styles.channelInfoBigSubtitle}>{formatCount(selectedChannel.followers)} followers</Text>
              <Text style={styles.channelInfoDescription}>{selectedChannel.description}</Text>
            </LinearGradient>

            <View style={styles.channelInfoStatsRow}>
              <View style={[styles.channelInfoStatCard, { backgroundColor: appCard }]}>
                <Text style={[styles.channelInfoStatValue, { color: theme.primary }]}>{formatCount(selectedChannel.followers)}</Text>
                <Text style={styles.channelInfoStatLabel}>Followers</Text>
              </View>
              <View style={[styles.channelInfoStatCard, { backgroundColor: appCard }]}>
                <Text style={[styles.channelInfoStatValue, { color: theme.primary }]}>{selectedChannel.posts?.length || 0}</Text>
                <Text style={styles.channelInfoStatLabel}>Posts</Text>
              </View>
              <View style={[styles.channelInfoStatCard, { backgroundColor: appCard }]}>
                <Text style={[styles.channelInfoStatValue, { color: theme.primary }]}>{selectedChannel.allowComments === false ? 'Off' : 'On'}</Text>
                <Text style={styles.channelInfoStatLabel}>Comments</Text>
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: theme.accent }]}>Channel profile</Text>
            <View style={[styles.channelInfoDetailCard, { backgroundColor: appCard }]}>
              <Text style={[styles.channelInfoDetailTitle, { color: appText }]}>Owner</Text>
              <Text style={styles.channelInfoDetailText}>{selectedChannel.ownerId === 'me' ? profile.name : 'Channel owner'}</Text>
              <Text style={[styles.channelInfoDetailTitle, { color: appText }]}>Visibility</Text>
              <Text style={styles.channelInfoDetailText}>Public channel • visible to followers and viewers</Text>
              <Text style={[styles.channelInfoDetailTitle, { color: appText }]}>Reaction mode</Text>
              <Text style={styles.channelInfoDetailText}>{selectedChannel.emojiMode || 'any'} emojis</Text>
            </View>

            <ProfessionalButton title={selectedChannel.followed ? 'Following' : 'Follow Channel'} icon={<UserPlus size={18} color="#FFFFFF" />} onPress={() => toggleFollowChannel(selectedChannel.id)} />
            <ProfessionalButton title="Share Channel" icon={<Share2 size={18} color="#FFFFFF" />} onPress={shareChannel} />
          </>
        )}
      </SimpleModal>

      {/* CHANNEL INFORMATION SEARCH */}
      <SimpleModal visible={channelSearchVisible} title="Search Channel Information" onClose={() => setChannelSearchVisible(false)}>
        {selectedChannel && (
          <>
            <View style={[styles.searchBoxPro, { backgroundColor: appCard, marginHorizontal: 0 }]}>
              <Search size={18} color={theme.primary} />
              <TextInput style={[styles.searchInput, { color: appText }]} placeholder="Search posts, comments, topics..." placeholderTextColor="#8A8172" value={channelInfoQuery} onChangeText={setChannelInfoQuery} />
            </View>
            <ScrollView style={{ maxHeight: 430 }} showsVerticalScrollIndicator={false}>
              {(selectedChannel.posts || [])
                .filter(post => {
                  const q = channelInfoQuery.trim().toLowerCase();
                  if (!q) return true;
                  return [post.text, post.name, post.time, ...(post.comments || []).map(c => `${c.author} ${c.text}`)].join(' ').toLowerCase().includes(q);
                })
                .map(post => (
                  <View key={post.id} style={[styles.channelSearchResultCard, { backgroundColor: appCard }]}>
                    <Text style={[styles.channelSearchResultTitle, { color: appText }]} numberOfLines={3}>{post.text}</Text>
                    <Text style={styles.channelSearchResultMeta}>{post.time} • {post.views} views • {post.likes} reactions • {post.comments.length} comments</Text>
                  </View>
                ))}
              {(selectedChannel.posts || []).length === 0 && (
                <View style={[styles.emptyState, { backgroundColor: appCard }]}><Search size={26} color={theme.accent} /><Text style={[styles.emptyTitle, { color: appText }]}>No posts to search yet</Text></View>
              )}
            </ScrollView>
          </>
        )}
      </SimpleModal>

      {/* CHANNEL SETTINGS */}
      <SimpleModal visible={channelSettingsVisible} title="Channel Menu" onClose={() => setChannelSettingsVisible(false)}>
        {selectedChannel && selectedChannel.ownerId === 'me' ? (
          <>
            <ActionRow icon={<Info size={18} color={theme.accent} />} title="Channel info" onPress={openChannelInfo} />
            <ActionRow icon={<Search size={18} color={theme.accent} />} title="Search channel information" onPress={openChannelSearchInfo} />
            <ActionRow icon={<FolderOpen size={18} color={theme.accent} />} title="Media, documents and links" onPress={() => setChannelMediaVisible(true)} />
            <ContactSettingRow title="Mute notifications" value={!!selectedChannel.mutedNotifications} onPress={() => updateChannelSettings({ mutedNotifications: !selectedChannel.mutedNotifications })} />
            <ActionRow icon={<Share2 size={18} color={theme.accent} />} title="Share channel" onPress={shareChannel} />
            <ActionRow icon={<UserPlus size={18} color={theme.accent} />} title="Invite admins" onPress={() => Alert.alert('Invite Admin', 'Choose a trusted contact to help manage this channel.')} />
            <ContactSettingRow title="Allow comments" value={selectedChannel.allowComments !== false} onPress={() => updateChannelSettings({ allowComments: selectedChannel.allowComments === false })} />
            <ActionRow icon={<Smile size={18} color={theme.accent} />} title={`Emoji reactions: ${selectedChannel.emojiMode || 'any'}`} onPress={() => updateChannelSettings({ emojiMode: selectedChannel.emojiMode === 'any' ? 'default' : selectedChannel.emojiMode === 'default' ? 'none' : 'any' })} />
            <ActionRow icon={<Archive size={18} color={theme.accent} />} title={channelShortcutIds.includes(selectedChannel.id) ? 'Remove shortcut' : 'Add shortcut'} onPress={toggleChannelShortcut} /><ActionRow icon={<Sparkles size={18} color={theme.accent} />} title="Share channel to your status" onPress={shareChannelToStatus} />
          </>
        ) : selectedChannel ? (
          <>
            <ActionRow icon={<Info size={18} color={theme.accent} />} title="Channel info" onPress={openChannelInfo} />
            <ActionRow icon={<Search size={18} color={theme.accent} />} title="Search information" onPress={openChannelSearchInfo} />
            <ActionRow icon={<FolderOpen size={18} color={theme.accent} />} title="Media, documents and links" onPress={() => setChannelMediaVisible(true)} />
            <ContactSettingRow title="Mute notifications" value={!!selectedChannel.mutedNotifications} onPress={() => updateChannelSettings({ mutedNotifications: !selectedChannel.mutedNotifications })} />
            <ActionRow icon={<Archive size={18} color={theme.accent} />} title={channelShortcutIds.includes(selectedChannel.id) ? 'Remove shortcut' : 'Add shortcut'} onPress={toggleChannelShortcut} /><ActionRow icon={<Flag size={18} color={theme.danger} />} title="Report or unfollow" onPress={reportOrUnfollowChannel} />
          </>
        ) : null}
      </SimpleModal>

      {/* CHANNEL MEDIA / DOCUMENTS / LINKS */}
      <SimpleModal visible={channelMediaVisible} title="Media, Documents & Links" onClose={() => setChannelMediaVisible(false)}>
        {selectedChannel && (
          <>
            <Text style={[styles.inputLabel, { color: theme.accent }]}>Images, videos and documents</Text>
            {channelSharedMedia.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: appCard, marginHorizontal: 0 }]}><FolderOpen size={28} color={theme.accent} /><Text style={[styles.emptyTitle, { color: appText }]}>No shared media yet</Text><Text style={styles.emptySubtitle}>Files, documents, videos and images posted in this channel will appear here.</Text></View>
            ) : channelSharedMedia.map(item => (
              <TouchableOpacity key={item.id} style={[styles.channelMediaRow, { backgroundColor: appCard }]} onPress={() => shareMedia(item.media)}>
                {item.media.type === 'image' ? <ImageIcon size={20} color={theme.accent} /> : item.media.type === 'video' ? <VideoIcon size={20} color={theme.accent} /> : <FileText size={20} color={theme.accent} />}
                <View style={{ flex: 1 }}><Text style={[styles.fileName, { color: appText }]} numberOfLines={1}>{item.media.name || item.media.type}</Text><Text style={styles.fileType}>{item.media.type} • {item.time}</Text></View>
                <Download size={18} color={theme.primary} />
              </TouchableOpacity>
            ))}
            <Text style={[styles.inputLabel, { color: theme.accent, marginTop: 14 }]}>Links</Text>
            {channelSharedLinks.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: appCard, marginHorizontal: 0 }]}><Share2 size={28} color={theme.accent} /><Text style={[styles.emptyTitle, { color: appText }]}>No links yet</Text><Text style={styles.emptySubtitle}>Links shared in channel posts will be listed here.</Text></View>
            ) : channelSharedLinks.map(item => (
              <TouchableOpacity key={item.id} style={[styles.channelMediaRow, { backgroundColor: appCard }]} onPress={() => Share.share({ message: item.url })}>
                <Share2 size={20} color={theme.accent} />
                <View style={{ flex: 1 }}><Text style={[styles.fileName, { color: appText }]} numberOfLines={1}>{item.url}</Text><Text style={styles.fileType}>{item.time}</Text></View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </SimpleModal>

      {/* MANAGE CHATS */}
      <SimpleModal visible={manageChatsVisible} title="Manage Chats" onClose={() => setManageChatsVisible(false)}>
        <Text style={[styles.inputLabel, { color: theme.accent }]}>Select conversations</Text>
        <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
          {chats.map(chat => (
            <TouchableOpacity key={chat.id} style={[styles.memberPickerRow, { backgroundColor: appCard }]} onPress={() => toggleSelectChatForManage(chat.id)}>
              {selectedChatIds.includes(chat.id) ? <Check size={20} color={theme.accent} /> : <Circle size={20} color="#8A8172" />}
              <View style={{ flex: 1 }}><Text style={[styles.memberPickerName, { color: appText }]}>{chat.name}</Text><Text style={styles.memberPickerPhone}>{lastMessageText(chat)}</Text></View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.manageActionsRow}>
          <TouchableOpacity style={[styles.manageActionButton, { backgroundColor: theme.primary }]} onPress={bulkMarkChatsRead}><CheckCheck size={16} color="#FFFFFF" /><Text style={styles.quickCallText}>Mark read</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.manageActionButton, { backgroundColor: theme.accent }]} onPress={bulkArchiveChats}><Archive size={16} color="#FFFFFF" /><Text style={styles.quickCallText}>Archive</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.manageActionButton, { backgroundColor: theme.danger }]} onPress={bulkDeleteChats}><Trash2 size={16} color="#FFFFFF" /><Text style={styles.quickCallText}>Delete</Text></TouchableOpacity>
        </View>
      </SimpleModal>

      {/* THEME MODAL */}
      <SimpleModal visible={themeVisible} title="Themes" onClose={() => setThemeVisible(false)}>
        {(Object.keys(THEMES) as ThemeName[]).map(name => {
          const item = THEMES[name];
          const active = settings.selectedTheme === name;
          return <TouchableOpacity key={name} style={[styles.themeRow, { backgroundColor: active ? item.soft : appCard, borderColor: active ? item.accent : '#E5D9C3' }]} onPress={() => saveSettings({ ...settings, selectedTheme: name })}><LinearGradient colors={[item.primary, item.secondary]} style={styles.themeSwatch} /><View style={{ flex: 1 }}><Text style={[styles.themeName, { color: item.primary }]}>{name}</Text><Text style={styles.chatPreview}>Professional {name.toLowerCase()} theme</Text></View>{active && <Check size={20} color={item.accent} />}</TouchableOpacity>;
        })}
      </SimpleModal>

      {/* WALLPAPER MODAL */}
      <SimpleModal visible={wallpaperVisible} title="Wallpapers" onClose={() => setWallpaperVisible(false)}>
        <ProfessionalButton title="Change Home Screen Wallpaper" icon={<Wallpaper size={18} color="#FFFFFF" />} onPress={() => pickWallpaper('home')} />
        <ProfessionalButton title="Change All Chats Wallpaper" icon={<Wallpaper size={18} color="#FFFFFF" />} onPress={() => pickWallpaper('chat')} />
        {selectedChat && <ProfessionalButton title="Change This Chat Wallpaper" icon={<Wallpaper size={18} color="#FFFFFF" />} onPress={() => pickWallpaper('currentChat')} />}
        <TouchableOpacity style={[styles.dangerWideButton, { backgroundColor: theme.danger, marginHorizontal: 0 }]} onPress={() => saveSettings({ ...settings, homeWallpaper: undefined, chatWallpaper: undefined })}><Trash2 size={18} color="#FFFFFF" /><Text style={styles.publishText}>Remove App Wallpapers</Text></TouchableOpacity>
      </SimpleModal>

      {/* CHAT HISTORY */}
      <SimpleModal visible={historyVisible} title="Chat History" onClose={() => setHistoryVisible(false)}>
        {chatHistory.map(([title, value, Icon]: any) => <View key={title} style={[styles.historyRow, { backgroundColor: appCard }]}><Icon size={20} color={theme.accent} /><Text style={[styles.historyTitle, { color: settings.darkMode ? '#FFFFFF' : theme.primary }]}>{title}</Text><Text style={styles.historyValue}>{value}</Text></View>)}
      </SimpleModal>

      {/* SCHEDULE CALL */}
      <SimpleModal visible={scheduleVisible} title="Schedule Call" onClose={() => setScheduleVisible(false)}>
        <View style={styles.callTypeRow}><TouchableOpacity style={[styles.callTypePill, { backgroundColor: scheduledCallType === 'voice' ? theme.primary : appCard }]} onPress={() => setScheduledCallType('voice')}><Phone size={17} color={scheduledCallType === 'voice' ? '#FFFFFF' : theme.primary} /><Text style={[styles.callTypeText, { color: scheduledCallType === 'voice' ? '#FFFFFF' : theme.primary }]}>Audio</Text></TouchableOpacity><TouchableOpacity style={[styles.callTypePill, { backgroundColor: scheduledCallType === 'video' ? theme.primary : appCard }]} onPress={() => setScheduledCallType('video')}><VideoIcon size={17} color={scheduledCallType === 'video' ? '#FFFFFF' : theme.primary} /><Text style={[styles.callTypeText, { color: scheduledCallType === 'video' ? '#FFFFFF' : theme.primary }]}>Video</Text></TouchableOpacity></View>
        <InputBlock label="Call With" value={scheduledCallName} onChangeText={setScheduledCallName} placeholder="Aisha or Family Group" />
        <InputBlock label="Date and Time" value={scheduledCallTime} onChangeText={setScheduledCallTime} placeholder="Tomorrow 7:30 PM" />
        <Text style={[styles.inputLabel, { color: theme.accent }]}>Optional Participants</Text>
        <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>{regularContacts.map(contact => <MemberPickerRow key={contact.id} contact={contact} />)}</ScrollView>
        <ProfessionalButton title="Save Scheduled Call" icon={<CalendarDays size={18} color="#FFFFFF" />} onPress={scheduleCall} />
      </SimpleModal>

      {/* ADD PEOPLE */}
      <SimpleModal visible={addPeopleVisible} title="Add People" onClose={() => setAddPeopleVisible(false)}>
        <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>{regularContacts.map(contact => <TouchableOpacity key={contact.id} style={[styles.memberPickerRow, { backgroundColor: appCard }]} onPress={() => activeCall ? addPersonToCall(contact.name) : setSelectedMembers(selectedMembers.includes(contact.name) ? selectedMembers.filter(m => m !== contact.name) : [...selectedMembers, contact.name])}><UserRound size={20} color={theme.accent} /><View style={{ flex: 1 }}><Text style={[styles.memberPickerName, { color: settings.darkMode ? '#FFFFFF' : theme.primary }]}>{contact.name}</Text><Text style={styles.memberPickerPhone}>{contact.phone}</Text></View>{(activeCall?.participants.includes(contact.name) || selectedMembers.includes(contact.name)) && <Check size={20} color={theme.accent} />}</TouchableOpacity>)}</ScrollView>
        {selectedChat?.isGroup && !activeCall && <ProfessionalButton title="Add To Group" icon={<UserPlus size={18} color="#FFFFFF" />} onPress={addMembersToGroup} />}
      </SimpleModal>

      {/* CALL SCREEN */}
      {/* CALL KEYPAD */}
      <SimpleModal visible={keypadVisible} title="Call Keypad" onClose={() => setKeypadVisible(false)}>
        <Text style={[styles.inputLabel, { color: theme.accent }]}>Country code</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countryCodeScroll}>
          {['🇨🇲 Cameroon +237', '🇳🇬 Nigeria +234', '🇬🇭 Ghana +233', '🇺🇸 USA +1', '🇬🇧 UK +44', '🇫🇷 France +33', '🇸🇦 Saudi Arabia +966'].map(country => (
            <TouchableOpacity key={country} style={[styles.countryCodePill, { backgroundColor: dialCountry === country ? theme.primary : appCard, borderColor: dialCountry === country ? theme.primary : '#E5D9C3' }]} onPress={() => setDialCountry(country)}>
              <Text style={[styles.countryCodeText, { color: dialCountry === country ? '#FFFFFF' : appText }]}>{country}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <InputBlock label="Name" value={dialName} onChangeText={setDialName} placeholder="Optional contact name" />
        <InputBlock label="Phone Number" value={dialNumber} onChangeText={setDialNumber} placeholder="Type number" />
        <View style={styles.dialPadGrid}>
          {['1','2','3','4','5','6','7','8','9','*','0','#'].map(key => (
            <TouchableOpacity key={key} style={[styles.dialKey, { backgroundColor: appCard }]} onPress={() => setDialNumber(prev => prev + key)}>
              <Text style={[styles.dialKeyText, { color: appText }]}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.quickCallRow}>
          <TouchableOpacity style={[styles.quickCallButton, { backgroundColor: theme.primary }]} onPress={() => dialCallNow('voice')}><Phone size={18} color="#FFFFFF" /><Text style={styles.quickCallText}>Call</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.quickCallButtonGold, { backgroundColor: theme.accent }]} onPress={() => dialCallNow('video')}><VideoIcon size={18} color="#FFFFFF" /><Text style={styles.quickCallText}>Video</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.quickCallButton, { backgroundColor: theme.secondary }]} onPress={saveDialContact}><UserPlus size={18} color="#FFFFFF" /><Text style={styles.quickCallText}>Save</Text></TouchableOpacity>
        </View>
      </SimpleModal>

      <Modal visible={callVisible} animationType="fade">
        <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.callScreen}>{activeCall && <>
          <View style={styles.callTopBar}><TouchableOpacity style={styles.callTopButton} onPress={() => setCallVisible(false)}><ArrowLeft size={18} color="#FFFFFF" /><Text style={styles.callTopText}>Back</Text></TouchableOpacity><TouchableOpacity style={styles.callTopButton} onPress={() => setAddPeopleVisible(true)}><UserPlus size={18} color="#FFFFFF" /><Text style={styles.callTopText}>Add People</Text></TouchableOpacity></View>
          {activeCall.type === 'video' ? <View style={styles.videoStage}><View style={styles.remoteVideo}><UserRound size={90} color="#FFFFFF" /><Text style={styles.remoteVideoText}>{activeCall.name}</Text><Text style={styles.remoteVideoSub}>Remote video placeholder</Text></View><View style={styles.localPreview}>{cameraEnabled && cameraPermission?.granted ? <CameraView style={{ flex: 1 }} facing={cameraFacing} /> : <View style={styles.cameraOffBox}>{cameraPermission?.granted ? <VideoOff size={26} color="#FFFFFF" /> : <Camera size={26} color="#FFFFFF" />}<Text style={styles.cameraOffText}>{cameraPermission?.granted ? 'Camera Off' : 'Allow Camera'}</Text></View>}</View></View> : <View style={styles.voiceStage}><View style={[styles.callAvatar, { borderColor: theme.accent }]}><UserRound size={56} color={theme.accent} /></View><Text style={styles.callName}>{activeCall.name}</Text><Text style={styles.callStatus}>Voice call connected</Text></View>}
          <View style={styles.callParticipants}><Text style={styles.callParticipantsTitle}>Participants</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{activeCall.participants.map((person, index) => <View key={`${person}-${index}`} style={styles.participantChip}><UserRound size={13} color="#FFFFFF" /><Text style={styles.participantText}>{person}</Text></View>)}</ScrollView></View>
          <View style={styles.callActions}><TouchableOpacity style={[styles.callRoundButton, micMuted && { backgroundColor: theme.accent }]} onPress={() => setMicMuted(!micMuted)}><Mic size={25} color="#FFFFFF" /></TouchableOpacity><TouchableOpacity style={[styles.callRoundButton, speakerOn && { backgroundColor: theme.accent }]} onPress={() => setSpeakerOn(!speakerOn)}><Volume2 size={25} color="#FFFFFF" /></TouchableOpacity>{activeCall.type === 'video' && <><TouchableOpacity style={[styles.callRoundButton, !cameraEnabled && { backgroundColor: theme.accent }]} onPress={() => setCameraEnabled(!cameraEnabled)}><Camera size={25} color="#FFFFFF" /></TouchableOpacity><TouchableOpacity style={styles.callRoundButton} onPress={() => setCameraFacing(cameraFacing === 'front' ? 'back' : 'front')}><RefreshCcw size={25} color="#FFFFFF" /></TouchableOpacity></>}<TouchableOpacity style={styles.callRoundButton} onPress={() => setAddPeopleVisible(true)}><UserPlus size={25} color="#FFFFFF" /></TouchableOpacity><TouchableOpacity style={[styles.endCallButton, { backgroundColor: theme.danger }]} onPress={() => setCallVisible(false)}><PhoneOff size={28} color="#FFFFFF" /></TouchableOpacity></View>
        </>}</LinearGradient>
      </Modal>
    </SafeAreaView>
  );

  function StatsStrip() {
    return <View style={styles.statsRow}><View style={[styles.statCard, { backgroundColor: appCard }]}><MessageCircle size={18} color={theme.accent} /><Text style={[styles.statNumber, { color: theme.primary }]}>{chats.length}</Text><Text style={styles.statLabel}>Chats</Text></View><View style={[styles.statCard, { backgroundColor: appCard }]}><Users size={18} color={theme.accent} /><Text style={[styles.statNumber, { color: theme.primary }]}>{chats.filter(c => c.isGroup).length}</Text><Text style={styles.statLabel}>Groups</Text></View><View style={[styles.statCard, { backgroundColor: appCard }]}><CalendarDays size={18} color={theme.accent} /><Text style={[styles.statNumber, { color: theme.primary }]}>{calls.filter(c => c.direction === 'scheduled').length}</Text><Text style={styles.statLabel}>Scheduled</Text></View></View>;
  }

  function ProfessionalButton({ title, icon, onPress }: { title: string; icon: React.ReactNode; onPress: () => void }) {
    return <TouchableOpacity style={styles.professionalButtonWrap} onPress={onPress}><LinearGradient colors={[theme.primary, theme.secondary]} style={styles.professionalButton}>{icon}<Text style={styles.createStatusText}>{title}</Text></LinearGradient></TouchableOpacity>;
  }

  function SimpleModal({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
    return <Modal visible={visible} animationType="slide" transparent><View style={styles.modalOverlay}><View style={[styles.modalCardPro, { backgroundColor: appBg }]}><View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: settings.darkMode ? '#FFFFFF' : theme.primary }]}>{title}</Text><TouchableOpacity onPress={onClose}><X size={24} color={theme.primary} /></TouchableOpacity></View>{children}</View></View></Modal>;
  }

  function InputBlock({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (text: string) => void; placeholder?: string }) {
    return <><Text style={[styles.inputLabel, { color: theme.accent }]}>{label}</Text><TextInput style={[styles.modalInputPro, { backgroundColor: appCard, color: appText }]} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#8A8172" /></>;
  }

  function ActionRow({ icon, title, onPress }: { icon: React.ReactNode; title: string; onPress: () => void }) {
    return <TouchableOpacity style={styles.actionRow} onPress={onPress}>{icon}<Text style={[styles.actionRowText, { color: settings.darkMode ? '#FFFFFF' : theme.primary }]}>{title}</Text></TouchableOpacity>;
  }

  function ContactSettingRow({ title, value, onPress, danger }: { title: string; value: boolean; onPress: () => void; danger?: boolean }) {
    return <TouchableOpacity style={[styles.settingMiniPro, { backgroundColor: appCard }]} onPress={onPress}><Text style={[styles.settingMiniText, { color: danger ? theme.danger : settings.darkMode ? '#FFFFFF' : theme.primary }]}>{title}</Text><Text style={styles.settingMiniState}>{value ? 'On' : 'Off'}</Text></TouchableOpacity>;
  }

  function MemberPickerRow({ contact }: { contact: ChatItem }) {
    const selected = selectedMembers.includes(contact.name);
    return <TouchableOpacity style={[styles.memberPickerRow, { backgroundColor: appCard }]} onPress={() => setSelectedMembers(selected ? selectedMembers.filter(m => m !== contact.name) : [...selectedMembers, contact.name])}><UserRound size={20} color={theme.accent} /><View style={{ flex: 1 }}><Text style={[styles.memberPickerName, { color: settings.darkMode ? '#FFFFFF' : theme.primary }]}>{contact.name}</Text><Text style={styles.memberPickerPhone}>{contact.phone}</Text></View>{selected && <Check size={20} color={theme.accent} />}</TouchableOpacity>;
  }
}

function formatCount(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return `${value}`;
}

function lastMessage(chat: ChatItem) {
  return chat.messages[chat.messages.length - 1];
}

function lastMessageText(chat: ChatItem) {
  const message = lastMessage(chat);
  if (!message) return 'No messages yet';
  if (message.type === 'text') return message.text || '';
  if (message.type === 'image') return '📷 Image';
  if (message.type === 'video') return '🎥 Video';
  if (message.type === 'audio') return '🎤 Voice note';
  return '📎 File';
}

function tabIcon(tab: Tab, color: string) {
  if (tab === 'Chats') return <MessageCircle size={15} color={color} />;
  if (tab === 'Groups') return <Users size={15} color={color} />;
  if (tab === 'Updates') return <Circle size={15} color={color} />;
  if (tab === 'Calls') return <PhoneCall size={15} color={color} />;
  if (tab === 'Contacts') return <UserRound size={15} color={color} />;
  return <Settings size={15} color={color} />;
}

function renderMessageContent(message: MessageItem, playAudio: (uri: string) => void, playingAudio: string | null, shareMedia: (media?: MediaItem) => void, textColor: string, theme: Theme) {
  if (message.type === 'text') return <Text style={[styles.messageText, { color: textColor }]}>{message.text}</Text>;
  if (message.type === 'image' && message.media?.uri) return <TouchableOpacity onLongPress={() => shareMedia(message.media)}><Image source={{ uri: message.media.uri }} style={styles.messageImage} /></TouchableOpacity>;
  if (message.type === 'video' && message.media?.uri) return <Video source={{ uri: message.media.uri }} style={styles.messageVideo} resizeMode={ResizeMode.COVER} useNativeControls />;
  if (message.type === 'audio' && message.media?.uri) return <TouchableOpacity style={styles.voiceBubble} onPress={() => playAudio(message.media!.uri!)}>{playingAudio === message.media.uri ? <Pause size={20} color={theme.primary} /> : <Play size={20} color={theme.primary} />}<Text style={[styles.messageText, { color: textColor }]}>{message.media.name || 'Voice note'}</Text></TouchableOpacity>;
  return <TouchableOpacity style={styles.fileBubble} onPress={() => shareMedia(message.media)}><FileText size={22} color={theme.primary} /><Text style={[styles.messageText, { color: textColor }]}>{message.media?.name || 'File'}</Text><Download size={18} color={theme.primary} /></TouchableOpacity>;
}

function StatusMediaPreview({ media, large }: { media: MediaItem; large?: boolean }) {
  if (media.type === 'image' && media.uri) return <Image source={{ uri: media.uri }} style={large ? styles.statusLargeImage : styles.statusPreviewImage} />;
  if (media.type === 'video' && media.uri) return <Video source={{ uri: media.uri }} style={large ? styles.statusLargeVideo : styles.statusPreviewVideo} resizeMode={ResizeMode.COVER} useNativeControls />;
  return <View style={styles.statusFilePreview}><FileText size={22} color="#064E3B" /><Text style={styles.statusFileName}>{media.name || 'Attached file'}</Text></View>;
}

function FaithCard({ theme }: { theme: Theme }) {
  return <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.faithCardPro}><Text style={[styles.faithTitle, { color: theme.accent }]}>Chafadia Noor</Text><Text style={styles.faithArabic}>ٱلسَّلَامُ عَلَيْكُمْ</Text><Text style={styles.faithText}>A peaceful place for elegant messages, family groups and kind communication.</Text></LinearGradient>;
}

function SectionTitle({ icon, title, theme }: { icon: React.ReactNode; title: string; theme: Theme }) {
  return <View style={styles.sectionTitle}>{icon}<Text style={[styles.sectionTitleText, { color: theme.accent }]}>{title}</Text></View>;
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.profileStatBox}>
      <Text style={styles.profileStatValue}>{value}</Text>
      <Text style={styles.profileStatLabel}>{label}</Text>
    </View>
  );
}

function EmptyFiles({ appCard, appText, theme }: { appCard: string; appText: string; theme: Theme }) {
  return <View style={[styles.emptyState, { backgroundColor: appCard }]}><FileText size={30} color={theme.accent} /><Text style={[styles.emptyTitle, { color: appText }]}>No shared files yet</Text><Text style={styles.emptySubtitle}>Images, videos, files and documents shared here will appear here.</Text></View>;
}

const styles = StyleSheet.create({

  channelChatHeader: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#E7DDCF' },
  channelHeaderAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  channelChatContent: { paddingHorizontal: 8, paddingTop: 12, paddingBottom: 110, gap: 12 },
  ownChannelGrowCard: { borderRadius: 24, padding: 22, alignItems: 'center', marginHorizontal: 2, marginVertical: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 14, elevation: 3 },
  ownChannelLogo: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  ownChannelTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  ownChannelAction: { width: '100%', borderWidth: 1, borderColor: '#D8D0C4', borderRadius: 24, paddingVertical: 13, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 },
  ownChannelActionText: { fontSize: 15, fontWeight: '800', color: '#0D7054' },
  channelComposerCompact: { borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ECE2D4' },
  channelComposerInput: { flex: 1, minHeight: 42, maxHeight: 120, fontSize: 16, paddingVertical: 6 },
  countryCodeScroll: { marginBottom: 10 },
  countryCodePill: { borderWidth: 1, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8 },
  countryCodeText: { fontWeight: '800' },
  dialPadGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 14, gap: 8 },
  dialKey: { width: '30%', height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5D9C3' },
  dialKeyText: { fontSize: 24, fontWeight: '800' },
  safeArea: { flex: 1, backgroundColor: CREAM },
  container: { flex: 1 },
  content: { paddingHorizontal: 4, paddingTop: 14, paddingBottom: 40 },
  goldGlow: { position: 'absolute', top: -80, right: -80, width: 220, height: 220, borderRadius: 999, opacity: 0.16 },
  greenGlow: { position: 'absolute', top: 360, left: -100, width: 210, height: 210, borderRadius: 999, opacity: 0.08 },
  heroPro: { borderRadius: 30, paddingVertical: 18, paddingHorizontal: 18, marginHorizontal: 0, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 16, elevation: 7 },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroKicker: { fontSize: 13, fontWeight: '900', marginBottom: 3 },
  heroTitle: { color: '#FFFFFF', fontSize: 29, fontWeight: '900', letterSpacing: -0.5 },
  heroSubtitle: { color: '#E6FFF4', fontSize: 11.8, marginTop: 5, fontWeight: '700' },
  noorText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginTop: 10 },
  noorSmall: { color: '#FFF4D6', fontSize: 12, fontWeight: '800', marginTop: 5 },
  profileButtonPro: { width: 52, height: 52, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center', marginLeft: 'auto', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  profileButtonImage: { width: '100%', height: '100%' },
  heroActions: { flexDirection: 'row', marginTop: 14, gap: 6, flexWrap: 'wrap' },
  heroButtonGlass: { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' },
  heroButtonGold: { borderRadius: 16, paddingVertical: 10, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' },
  heroButtonText: { color: '#FFFFFF', fontWeight: '900', marginLeft: 5, fontSize: 10.8 },
  searchBoxPro: { marginHorizontal: 2, flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 10, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 7, elevation: 2 },
  searchInput: { flex: 1, fontWeight: '800', marginLeft: 8 },
  tabScroll: { marginVertical: 8, marginBottom: 12, paddingLeft: 0 },
  tabPillPro: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 8, borderWidth: 1, marginRight: 5, minWidth: 61, justifyContent: 'center' },
  tabText: { fontSize: 10.2, fontWeight: '900', marginLeft: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 22, padding: 12, borderWidth: 1, borderColor: '#E5D9C3', alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '900', marginTop: 5 },
  statLabel: { color: '#8A8172', fontSize: 10, fontWeight: '900', marginTop: 2 },
  chatCardPro: { marginHorizontal: 2, marginVertical: 5,  borderRadius: 24, padding: 12, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', marginBottom: 11, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  avatarPro: { width: 56, height: 56, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  avatarProSmall: { width: 52, height: 52, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  onlineDot: { position: 'absolute', right: 2, bottom: 2, width: 13, height: 13, borderRadius: 999, backgroundColor: '#22C55E', borderWidth: 2, borderColor: CARD },
  chatTop: { flexDirection: 'row', alignItems: 'center' },
  chatName: { flex: 1, fontSize: 15, fontWeight: '900' },
  chatTime: { color: '#8A8172', fontSize: 10.5, fontWeight: '800' },
  chatPreview: { color: '#8A8172', fontSize: 12, fontWeight: '700', marginTop: 4 },
  memberLine: { fontSize: 11, fontWeight: '900', marginTop: 4 },
  chatSide: { alignItems: 'center', marginLeft: 8, gap: 5 },
  unreadBadge: { borderRadius: 999, minWidth: 22, height: 22, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  unreadText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  professionalButtonWrap: { marginBottom: 13 },
  professionalButton: { borderRadius: 20, paddingVertical: 14, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 },
  createStatusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', marginLeft: 7 },
  faithCardPro: { borderRadius: 26, padding: 17, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, elevation: 3 },
  faithTitle: { fontSize: 13, fontWeight: '900' },
  faithArabic: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginTop: 8, textAlign: 'center' },
  faithText: { color: '#E6FFF4', fontSize: 12, fontWeight: '800', marginTop: 8, textAlign: 'center' },
  statusCardPro: { borderRadius: 24, padding: 12, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  statusTop: { flexDirection: 'row', alignItems: 'center' },
  statusRing: { width: 48, height: 48, borderRadius: 999, borderWidth: 2.5, justifyContent: 'center', alignItems: 'center', marginRight: 10, overflow: 'hidden' },
  statusMiniStats: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusViews: { color: '#064E3B', fontSize: 12, fontWeight: '900' },
  statusText: { fontSize: 12.4, fontWeight: '800', lineHeight: 18, marginTop: 8 },
  statusPreviewImage: { width: '100%', height: 190, borderRadius: 20, marginTop: 10 },
  statusPreviewVideo: { width: '100%', height: 205, borderRadius: 20, marginTop: 10 },
  statusLargeImage: { width: '100%', height: 380, borderRadius: 24, marginTop: 12 },
  statusLargeVideo: { width: '100%', height: 380, borderRadius: 24, marginTop: 12 },
  statusFilePreview: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F7F5EE', borderRadius: 18, padding: 14, marginTop: 12 },
  statusFileName: { color: '#064E3B', fontWeight: '900', flex: 1 },
  commentCount: { color: '#8A8172', fontWeight: '900', fontSize: 11, marginTop: 10 },
  quickCallRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  quickCallButton: { flex: 1, borderRadius: 20, padding: 13, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  quickCallButtonGold: { flex: 1, borderRadius: 20, padding: 13, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  quickCallText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12, marginLeft: 7 },
  callCardPro: { borderRadius: 26, padding: 13, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  contactCardPro: { borderRadius: 26, padding: 13, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  contactAction: { width: 38, height: 38, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginLeft: 7 },
  contactActionGold: { width: 38, height: 38, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginLeft: 7 },
  settingCardPro: { borderRadius: 24, padding: 15, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  settingTextWrap: { flex: 1, marginLeft: 12 },
  chatHeaderPro: { paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  chatHeaderAvatar: { width: 42, height: 42, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center' },
  chatHeaderName: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  chatHeaderStatus: { color: '#D9FFF0', fontSize: 11, fontWeight: '700', marginTop: 2 },
  selectionBar: { backgroundColor: '#E6F1EC', padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderColor: '#D7C7A7' },
  selectionText: { flex: 1, color: '#064E3B', fontWeight: '900' },
  smallDangerButton: { backgroundColor: '#9F2D2D', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 5 },
  smallButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 11 },
  messagesAreaTransparent: { flex: 1 },
  messagesContent: { padding: 14, paddingBottom: 25 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', alignSelf: 'flex-start' },
  messageRowMine: { alignSelf: 'flex-end' },
  selectBox: { paddingRight: 6, paddingBottom: 12 },
  messageBubblePro: { maxWidth: '82%', borderRadius: 22, padding: 11, marginBottom: 9, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  messageFlag: { fontSize: 10, fontWeight: '900', marginBottom: 4 },
  messageText: { fontSize: 13, fontWeight: '700', lineHeight: 19 },
  messageMeta: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4, gap: 3 },
  messageTime: { color: '#6B6257', fontSize: 9.5, fontWeight: '800', marginRight: 3 },
  editedText: { color: '#6B6257', fontSize: 9.5, fontWeight: '800' },
  messageImage: { width: 220, height: 220, borderRadius: 16 },
  messageVideo: { width: 240, height: 250, borderRadius: 16 },
  voiceBubble: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  fileBubble: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editingBar: { backgroundColor: '#E6F1EC', paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  editingText: { flex: 1, fontWeight: '900' },
  chatInputBarPro: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderColor: '#E5D9C3', gap: 9 },
  messageInput: { flex: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, fontWeight: '800' },
  sendButton: { width: 40, height: 40, borderRadius: 999, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  centerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 20 },
  modalCardPro: { borderTopLeftRadius: 34, borderTopRightRadius: 34, padding: 18, maxHeight: '92%' },
  actionSheetPro: { borderRadius: 28, padding: 18 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  modalTitle: { flex: 1, fontSize: 20, fontWeight: '900' },
  actionPreview: { fontWeight: '800', borderRadius: 16, padding: 12, marginBottom: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderColor: '#E5D9C3', gap: 12 },
  actionRowText: { fontSize: 14, fontWeight: '900' },
  profileHero: { borderRadius: 28, padding: 20, alignItems: 'center', marginBottom: 14 },
  bigAvatar: { width: 110, height: 110, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 3 },
  bigAvatarImage: { width: '100%', height: '100%' },
  profileFullName: { color: '#FFFFFF', fontWeight: '900', fontSize: 22, marginTop: 12 },
  profileFullAbout: { color: '#E6FFF4', fontWeight: '800', marginTop: 5 },
  changePhotoButton: { backgroundColor: '#FFFFFF', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', marginTop: 13 },
  changePhotoText: { fontSize: 12, fontWeight: '900', marginLeft: 6 },
  inputLabel: { fontSize: 13, fontWeight: '900', marginBottom: 7, marginTop: 8 },
  modalInputPro: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#E5D9C3', fontWeight: '800' },
  statusInputPro: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#E5D9C3', fontWeight: '800', minHeight: 115, textAlignVertical: 'top' },
  selectedMediaBox: { marginTop: 12, borderRadius: 18, padding: 13, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 10 },
  mediaButtonPro: { borderRadius: 18, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 12 },
  mediaButtonText: { fontSize: 12, fontWeight: '900', marginLeft: 7 },
  publishText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', marginLeft: 7 },
  memberPickerRow: { borderRadius: 18, padding: 12, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  memberPickerName: { fontWeight: '900', flex: 1 },
  memberPickerPhone: { color: '#8A8172', fontWeight: '800', fontSize: 11 },
  contactProfilePage: { paddingBottom: 30 },
  contactProfileHeroPro: { padding: 18, alignItems: 'center', borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  backPill: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  backPillText: { fontWeight: '900' },
  contactBigAvatar: { width: 118, height: 118, borderRadius: 44, borderWidth: 3, backgroundColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center', marginTop: 16, overflow: 'hidden' },
  contactProfileName: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', marginTop: 16 },
  contactProfilePhone: { color: '#D9FFF0', fontWeight: '800', marginTop: 6 },
  profileActionGrid: { flexDirection: 'row', padding: 14, gap: 10 },
  profileAction: { flex: 1, borderRadius: 20, padding: 12, alignItems: 'center', gap: 5 },
  profileActionGold: { flex: 1, borderRadius: 20, padding: 12, alignItems: 'center', gap: 5 },
  profileActionText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginTop: 15, marginBottom: 9, gap: 8 },
  sectionTitleText: { fontSize: 15, fontWeight: '900' },
  settingMiniPro: { marginHorizontal: 15, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  settingMiniText: { fontWeight: '900' },
  settingMiniState: { color: '#8A8172', fontWeight: '900' },
  fileRowPro: { marginHorizontal: 15, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  fileName: { flex: 1, fontWeight: '900' },
  fileType: { color: '#8A8172', fontWeight: '800', fontSize: 11 },
  dangerWideButton: { marginHorizontal: 15, borderRadius: 20, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 16, marginBottom: 20 },
  emptyState: { marginHorizontal: 15, borderRadius: 26, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: '#E5D9C3' },
  emptyTitle: { fontWeight: '900', fontSize: 17, marginTop: 10 },
  emptySubtitle: { color: '#6B6257', fontWeight: '700', textAlign: 'center', marginTop: 6 },
  statusViewerPage: { paddingBottom: 28 },
  statusViewerHero: { padding: 18, borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  statusViewerName: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', marginTop: 20 },
  statusViewerTime: { color: '#D9FFF0', fontWeight: '800', marginTop: 6 },
  statusViewerCard: { margin: 15, borderRadius: 28, padding: 16, borderWidth: 1, borderColor: '#E5D9C3' },
  statusViewerText: { fontSize: 16, fontWeight: '800', lineHeight: 24 },
  statusActionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statusActionButton: { flex: 1, borderRadius: 18, padding: 12, backgroundColor: '#F7F5EE', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 },
  statusActionText: { fontWeight: '900' },
  commentCard: { marginHorizontal: 15, marginBottom: 8, borderRadius: 18, padding: 12, borderWidth: 1, borderColor: '#E5D9C3' },
  commentAuthor: { fontWeight: '900' },
  commentText: { fontWeight: '700', marginTop: 4 },
  commentTime: { color: '#8A8172', fontSize: 10, fontWeight: '900', marginTop: 5 },
  commentInputBar: { marginHorizontal: 15, marginTop: 8, borderRadius: 999, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E5D9C3' },
  commentInput: { flex: 1, fontWeight: '800' },
  themeRow: { borderRadius: 20, padding: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  themeSwatch: { width: 44, height: 44, borderRadius: 16 },
  themeName: { fontWeight: '900', fontSize: 15 },
  historyRow: { borderRadius: 18, padding: 13, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  historyTitle: { flex: 1, fontWeight: '900' },
  historyValue: { color: '#8A8172', fontWeight: '900' },
  callTypeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  callTypePill: { flex: 1, borderRadius: 18, padding: 13, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 },
  callTypeText: { fontWeight: '900' },
  imageViewer: { flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  imageViewerBack: { position: 'absolute', top: 50, left: 16, zIndex: 3, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 7 },
  imageViewerBackText: { color: '#FFFFFF', fontWeight: '900' },
  fullProfileImage: { width: '100%', height: '80%' },
  callScreen: { flex: 1, paddingTop: 50, paddingHorizontal: 16, paddingBottom: 28 },
  callTopBar: { flexDirection: 'row', justifyContent: 'space-between' },
  callTopButton: { backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', gap: 7, alignItems: 'center' },
  callTopText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  videoStage: { flex: 1, marginTop: 22, borderRadius: 34, overflow: 'hidden', backgroundColor: '#042F25' },
  remoteVideo: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  remoteVideoText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', marginTop: 10 },
  remoteVideoSub: { color: '#D9FFF0', fontWeight: '800', marginTop: 5 },
  localPreview: { position: 'absolute', right: 14, top: 14, width: 118, height: 160, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 2, borderColor: '#D4A017' },
  cameraOffBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraOffText: { color: '#FFFFFF', fontWeight: '900', fontSize: 11, marginTop: 6 },
  voiceStage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  callAvatar: { width: 120, height: 120, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center', borderWidth: 3 },
  callName: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginTop: 25 },
  callStatus: { color: '#D9FFF0', fontSize: 14, fontWeight: '700', marginTop: 8 },
  callParticipants: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, padding: 12, marginTop: 15 },
  callParticipantsTitle: { color: '#FFFFFF', fontWeight: '900', marginBottom: 8 },
  participantChip: { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', marginRight: 8, gap: 5 },
  participantText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  callActions: { flexDirection: 'row', gap: 10, marginTop: 18, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
  callRoundButton: { width: 55, height: 55, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)', justifyContent: 'center', alignItems: 'center' },
  endCallButton: { width: 68, height: 68, borderRadius: 999, justifyContent: 'center', alignItems: 'center' },

  messagePageHeader: { marginHorizontal: 15, marginTop: 10, marginBottom: 10, borderRadius: 26, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E5D9C3' },
  profileCompactButton: { width: 50, height: 50, borderRadius: 18, borderWidth: 2, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  messageHeaderTitle: { fontSize: 24, fontWeight: '900' },
  messageHeaderSub: { color: '#8A8172', fontWeight: '800', marginTop: 2, fontSize: 12 },
  headerRoundTool: { width: 46, height: 46, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  searchMenuRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 14 },
  chocolateMenuButton: { width: 48, height: 48, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5D9C3' },
  floatingInlineButton: { marginHorizontal: 15, marginBottom: 10, borderRadius: 22, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  floatingInlineButtonText: { color: '#FFFFFF', fontWeight: '900' },
  updatesHeaderClean: { marginHorizontal: 15, marginTop: 4, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  updatesTitleClean: { flex: 1, fontSize: 30, fontWeight: '900' },
  updatesHeaderIcon: { width: 42, height: 42, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  updatesSectionTitle: { fontSize: 22, fontWeight: '900', marginHorizontal: 15, marginBottom: 12 },
  statusStoryRow: { paddingLeft: 15, paddingRight: 14, paddingBottom: 14, gap: 10 },
  addStatusStory: { marginRight: 8, width: 104, height: 138, borderRadius: 24, borderWidth: 1, borderColor: '#E5D9C3', alignItems: 'center', justifyContent: 'center', padding: 9 },
  addStatusAvatar: { width: 54, height: 54, borderRadius: 22, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  statusAvatarImage: { width: '100%', height: '100%', borderRadius: 22 },
  storyPlusBadge: { position: 'absolute', right: -4, bottom: -4, width: 24, height: 24, borderRadius: 999, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  storyName: { fontWeight: '900', textAlign: 'center', marginTop: 8, fontSize: 11.2 },
  statusStoryCard: { marginRight: 9, width: 116, height: 138, borderRadius: 24, overflow: 'hidden' },
  statusStoryImageBox: { flex: 1, justifyContent: 'space-between', padding: 8 },
  statusStoryRing: { width: 52, height: 52, borderRadius: 20, borderWidth: 2.5, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.14)' },
  statusStoryName: { color: '#FFFFFF', fontWeight: '900', fontSize: 11.2, lineHeight: 14, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 4 },
  channelHeaderRow: { flexDirection: 'row', alignItems: 'center', marginRight: 15, marginTop: 6 },
  explorePill: { borderRadius: 999, paddingVertical: 10, paddingHorizontal: 22 },
  exploreText: { fontWeight: '900' },
  channelRowPro: { marginHorizontal: 2, marginVertical: 5, marginBottom: 10, borderRadius: 22, padding: 12, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 12 },
  channelAvatar: { width: 54, height: 54, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  channelInitial: { color: '#FFFFFF', fontSize: 21, fontWeight: '900' },
  channelName: { fontSize: 16, fontWeight: '900' },
  channelPreview: { color: '#6B6257', fontWeight: '800', marginTop: 3, fontSize: 12.2 },
  channelSideMeta: { alignItems: 'flex-end', gap: 5 },
  channelTime: { fontWeight: '900', fontSize: 12 },
  channelUnread: { minWidth: 28, height: 24, borderRadius: 999, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 7 },
  channelUnreadText: { color: '#FFFFFF', fontWeight: '900', fontSize: 11 },
  suggestedChannelsTitle: { color: '#6B6257', fontSize: 16, fontWeight: '900', marginHorizontal: 15, marginTop: 18, marginBottom: 8 },
  suggestedChannelRow: { marginHorizontal: 1, marginVertical: 5, marginBottom: 10, borderRadius: 22, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E5D9C3' },
  suggestedChannelAvatar: { width: 54, height: 54, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  suggestedChannelInitial: { fontSize: 21, fontWeight: '900' },
  followChannelButton: { backgroundColor: '#F2F0EC', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 18 },
  followChannelText: { color: '#111827', fontWeight: '900' },
  statusFloatingActions: { position: 'absolute', right: 18, bottom: 28, alignItems: 'center', gap: 12 },
  statusPenFab: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#F3F0EA', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 8, elevation: 5 },
  statusCameraFab: { width: 70, height: 70, borderRadius: 22, backgroundColor: '#111111', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, elevation: 7 },
  profilePhotoActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 },
  profileStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 2, marginBottom: 10 },
  profileStatBox: { flex: 1, minWidth: '45%', borderRadius: 18, backgroundColor: '#F7F5EE', padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5D9C3' },
  profileStatValue: { fontSize: 18, fontWeight: '900', color: '#064E3B' },
  profileStatLabel: { color: '#6B6257', fontWeight: '800', marginTop: 3, fontSize: 11 },
  countrySelector: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 8 },
  countrySelectorText: { fontWeight: '900' },
  statusComposerModeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statusModeCard: { flex: 1, borderRadius: 18, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5D9C3', gap: 6 },
  statusModeText: { fontWeight: '900', color: '#111827' },
  statusMediaQuickRow: { flexDirection: 'row', gap: 10 },
  manageActionsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  manageActionButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  voiceRecordBar: { marginHorizontal: 10, marginBottom: 6, borderRadius: 18, padding: 9, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  voiceRecordText: { flex: 1, fontWeight: '900' },
  voiceRecordAction: { borderRadius: 999, backgroundColor: '#F3F0EA', paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  voiceRecordActionText: { fontSize: 11, fontWeight: '900' },

  layoutChoiceRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  layoutChoiceCard: { flex: 1, minHeight: 72, borderRadius: 18, padding: 10, justifyContent: 'flex-end' },
  layoutChoiceText: { color: '#FFFFFF', fontWeight: '900' },
  statusVoicePanel: { borderRadius: 18, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  statusInputLayout: { minHeight: 150, textAlignVertical: 'center', fontSize: 20, fontWeight: '900' },
  channelMiniMenu: { width: 34, height: 34, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  channelPageContent: { padding: 16, paddingBottom: 40 },
  channelTopBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  channelPageTitle: { fontSize: 15.5, fontWeight: '900' },
  channelInfoHero: { borderRadius: 28, padding: 18, marginBottom: 14 },
  channelInfoTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  channelInfoText: { color: 'rgba(255,255,255,0.88)', fontWeight: '700', marginTop: 6, lineHeight: 20 },
  channelInfoActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  channelActionPill: { backgroundColor: '#FFFFFF', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  channelActionText: { color: '#064E3B', fontWeight: '900' },
  channelComposer: { borderRadius: 22, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5D9C3' },
  channelPostCard: { borderRadius: 22, padding: 14, marginHorizontal: 0, marginBottom: 14, borderWidth: 1, borderColor: '#E5D9C3', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  channelPostText: { fontSize: 15.5, fontWeight: '800', lineHeight: 23, marginBottom: 10 },


  channelInfoHeroWide: { borderRadius: 28, padding: 18, alignItems: 'center', marginBottom: 12 },
  channelInfoBigAvatar: { width: 82, height: 82, borderRadius: 32, borderWidth: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.16)', marginBottom: 10 },
  channelInfoBigInitial: { color: '#FFFFFF', fontSize: 34, fontWeight: '900' },
  channelInfoBigTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  channelInfoBigSubtitle: { color: '#F9E7B1', fontWeight: '900', marginTop: 4 },
  channelInfoDescription: { color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontWeight: '700', lineHeight: 20, marginTop: 8 },
  channelInfoStatsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  channelInfoStatCard: { flex: 1, borderRadius: 18, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5D9C3' },
  channelInfoStatValue: { fontSize: 16, fontWeight: '900' },
  channelInfoStatLabel: { color: '#8A8172', fontSize: 10, fontWeight: '900', marginTop: 3 },
  channelInfoDetailCard: { borderRadius: 22, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 12 },
  channelInfoDetailTitle: { fontSize: 13, fontWeight: '900', marginTop: 6 },
  channelInfoDetailText: { color: '#6B6257', fontWeight: '700', marginTop: 3, marginBottom: 6, lineHeight: 19 },
  channelSearchResultCard: { borderRadius: 20, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5D9C3' },
  channelSearchResultTitle: { fontSize: 15, fontWeight: '800', lineHeight: 21 },
  channelSearchResultMeta: { color: '#8A8172', fontWeight: '800', marginTop: 8, fontSize: 11 },

  channelHeaderFollowButton: { borderRadius: 999, paddingVertical: 7, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5D9C3', backgroundColor: '#FFFFFF', minWidth: 76 },
  channelHeaderFollowText: { fontSize: 11, fontWeight: '900', color: '#064E3B' },
  channelQuickTools: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  channelQuickTool: { flexGrow: 1, minWidth: '30%', borderRadius: 18, paddingVertical: 11, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, borderWidth: 1, borderColor: '#E5D9C3', backgroundColor: '#FFFDF8' },
  channelQuickToolText: { fontSize: 12, fontWeight: '900', color: '#064E3B' },
  channelMediaRow: { borderRadius: 18, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E5D9C3', backgroundColor: '#FFFDF8', flexDirection: 'row', alignItems: 'center', gap: 10 },
   channelHeaderMetaLine: {
  flexDirection: 'row',
  alignItems: 'center',
  flexWrap: 'wrap',
  marginTop: 4,
  gap: 6,
},

channelHeaderHint: {
  fontSize: 11.5,
  color: '#8D8578',
  fontWeight: '700',
  lineHeight: 15,
  letterSpacing: 0.2,
},

  channelCommentComposer: { borderRadius: 18, padding: 10, marginTop: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E5D9C3' },
  channelCommentInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  channelEditingStrip: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, paddingHorizontal: 6 },
  channelEditingText: { flex: 1, fontSize: 12, fontWeight: '900' },
  channelCommentBulkBar: { borderRadius: 18, paddingVertical: 10, paddingHorizontal: 12, marginTop: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E5D9C3' },
  channelCommentBulkText: { flex: 1, fontSize: 12, fontWeight: '900' },
  channelCommentBulkDelete: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  channelCommentBulkDeleteText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  channelCommentsTitle: { color: '#8A8172', fontSize: 12, fontWeight: '900', marginTop: 8, marginBottom: 6 },
  channelCommentCard: { borderRadius: 18, padding: 11, marginBottom: 8, borderWidth: 1, flexDirection: 'row', gap: 8 },
  channelCommentSelectCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  channelCommentTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  channelCommentTime: { color: '#8A8172', fontSize: 10.5, fontWeight: '800' },
  channelCommentActionsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 9 },
  channelCommentAction: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 8, backgroundColor: 'rgba(255,255,255,0.62)' },
  channelCommentActionText: { fontSize: 11, fontWeight: '900' },

});
