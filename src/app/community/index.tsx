import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Share,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Switch,
  BackHandler,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { Audio, Video, ResizeMode } from "expo-av";
import * as Sharing from "expo-sharing";

import {
  CameraView,
  CameraType,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";

import {
  Users,
  Search,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  Megaphone,
  HelpCircle,
  CalendarDays,
  HandHeart,
  ShieldCheck,
  Flag,
  X,
  Send,
  Star,
  Filter,
  MapPin,
  Clock,
  UserRound,
  Camera,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Mic,
  Music,
  Repeat2,
  Download,
  Eye,
  UserPlus,
  UserCheck,
  Play,
  Pause,
  Trash2,
  Radio,
  Gift,
  RotateCcw,
  MicOff,
  VideoOff,
  Crown,
  PhoneCall,
  PhoneOff,
  BriefcaseBusiness,
  ClipboardCheck,
  GraduationCap,
  Building2,
  UsersRound,
  Rocket,
  MessageSquareText,
  Menu,
  Maximize2,
  Minimize2,
  Settings,
  Home,
  Bell,
  MoreVertical,
} from "lucide-react-native";

type PostType =
  | "All"
  | "Jobs"
  | "Announcement"
  | "Question"
  | "Event"
  | "Charity"
  | "Reminder"
  | "General";

type ReactionType = "like" | "love" | "amin" | "support" | "insight";
type MediaType = "image" | "video" | "file" | "audio";
type LiveReaction = "heart" | "amin" | "star" | "flower" | "gift";
type DashboardView = "posts" | "followers" | "lives" | "jobPosts" | "applications" | "groups";
type AppSection = "home" | "jobs" | "notifications" | "charity" | "events" | "profile" | "menu";

type MediaItem = {
  id: string;
  type: MediaType;
  uri: string;
  name?: string;
  mimeType?: string;
};

type CommentItem = {
  id: string;
  author: string;
  text: string;
  time: string;
  reactions: Record<ReactionType, number>;
};

type UserProfile = {
  id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  avatar?: string;
  friends: number;
};

type ContactInvite = {
  id: string;
  name: string;
  phone: string;
  status: "contact" | "follower" | "following" | "invited" | "requested";
};

type PostItem = {
  id: string;
  type: Exclude<PostType, "All">;
  authorId: string;
  author: string;
  username: string;
  avatar?: string;
  title: string;
  body: string;
  location?: string;
  time: string;
  likes: number;
  views: number;
  reposts: number;
  verified?: boolean;
  media: MediaItem[];
  backgroundAudio?: MediaItem;
  reactions: Record<ReactionType, number>;
  comments: CommentItem[];
  updates?: string[];
};

type LiveComment = {
  id: string;
  author: string;
  text: string;
  time: string;
};

type LiveGift = {
  id: string;
  name: string;
  icon: string;
  value: number;
};

type MessageItem = {
  id: string;
  recipient: string;
  text: string;
  time: string;
  media: MediaItem[];
  status: "sent" | "request" | "received";
};

type JobGroup = {
  id: string;
  name: string;
  profession: string;
  description: string;
  members: number;
  mentor: string;
};

type JobApplication = {
  id: string;
  postId: string;
  applicant: string;
  role: string;
  message: string;
  time: string;
};

const GREEN = "#064E3B";
const EMERALD = "#0D7054";
const GOLD = "#D4A017";
const CREAM = "#F7F5EE";
const CARD = "#FFFDF8";
const MINT = "#E6F1EC";
const SOFT_GOLD = "#F5E9C8";
const ROSE = "#9F2D2D";
const TEXT = "#3C3A34";
const KEYBOARD_VERTICAL_OFFSET = Platform.OS === "ios" ? 72 : 0;

const STORAGE_POSTS = "CHAFADIA_COMMUNITY_ADVANCED_POSTS_V4";
const STORAGE_LIKES = "CHAFADIA_COMMUNITY_ADVANCED_LIKES_V4";
const STORAGE_SAVED = "CHAFADIA_COMMUNITY_ADVANCED_SAVED_V4";
const STORAGE_PROFILE = "CHAFADIA_COMMUNITY_PROFILE_V4";
const STORAGE_FOLLOWING = "CHAFADIA_COMMUNITY_FOLLOWING_V4";
const STORAGE_FOLLOWERS = "CHAFADIA_COMMUNITY_FOLLOWERS_V4";
const STORAGE_BLOCKED_FOLLOWERS = "CHAFADIA_COMMUNITY_BLOCKED_FOLLOWERS_V1";
const STORAGE_JOB_GROUPS = "CHAFADIA_COMMUNITY_JOB_GROUPS_V1";
const STORAGE_JOB_APPLICATIONS = "CHAFADIA_COMMUNITY_JOB_APPLICATIONS_V1";
const STORAGE_SEARCH_HISTORY = "CHAFADIA_COMMUNITY_SEARCH_HISTORY_V1";
const STORAGE_MESSAGES = "CHAFADIA_COMMUNITY_MESSAGES_V1";
const STORAGE_DRAFTS = "CHAFADIA_COMMUNITY_POST_DRAFTS_V1";
const STORAGE_SETTINGS = "CHAFADIA_COMMUNITY_SETTINGS_V2";
const STORAGE_CONTACT_INVITES = "CHAFADIA_COMMUNITY_CONTACT_INVITES_V1";

const TABS: PostType[] = [
  "All",
  "Jobs",
  "Announcement",
  "Question",
  "Event",
  "Charity",
  "Reminder",
  "General",
];

const REACTION_LABELS: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  amin: "آمين",
  support: "🤲",
  insight: "✨",
};

const LIVE_REACTIONS: Record<LiveReaction, string> = {
  heart: "❤️",
  amin: "آمين",
  star: "⭐",
  flower: "🌸",
  gift: "🎁",
};

const LIVE_GIFTS: LiveGift[] = [
  { id: "rose", name: "Rose", icon: "🌹", value: 1 },
  { id: "dua", name: "Dua", icon: "🤲", value: 2 },
  { id: "star", name: "Star", icon: "⭐", value: 3 },
  { id: "heart", name: "Heart", icon: "❤️", value: 4 },
  { id: "crown", name: "Crown", icon: "👑", value: 10 },
];


const PROFILE_IMAGE_FOLDER = "chafadia-profile-images/";

function getDocumentDirectory() {
  const fs = FileSystem as any;
  const classicDirectory = fs["documentDirectory"];
  const modernDirectory = fs.Paths?.document?.uri;
  const directory = classicDirectory || modernDirectory || "";

  if (!directory) return "";
  return directory.endsWith("/") ? directory : `${directory}/`;
}

function getProfileImageDirectory() {
  const documentDirectory = getDocumentDirectory();
  return documentDirectory ? `${documentDirectory}${PROFILE_IMAGE_FOLDER}` : "";
}

async function persistProfileImage(uri: string) {
  try {
    const profileImageDirectory = getProfileImageDirectory();
    if (!profileImageDirectory) return uri;

    await FileSystem.makeDirectoryAsync(profileImageDirectory, {
      intermediates: true,
    });

    const cleanUri = uri.split("?")[0];
    const extension = cleanUri.includes(".")
      ? cleanUri.substring(cleanUri.lastIndexOf(".") + 1)
      : "jpg";

    const permanentUri = `${profileImageDirectory}profile-${Date.now()}.${extension}`;

    await FileSystem.copyAsync({
      from: uri,
      to: permanentUri,
    });

    return permanentUri;
  } catch {
    return uri;
  }
}

async function removePersistedProfileImage(uri?: string) {
  try {
    const profileImageDirectory = getProfileImageDirectory();
    if (!uri || !profileImageDirectory || !uri.startsWith(profileImageDirectory)) return;

    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {}
}

const DEFAULT_PROFILE: UserProfile = {
  id: "me",
  name: "Sadiyatou",
  username: "@sadiyatou",
  bio: "Sharing beneficial reminders and building a beautiful Muslim community.",
  location: "Cameroon",
  friends: 23,
};

const DEFAULT_JOB_GROUPS: JobGroup[] = [
  {
    id: "health-careers",
    name: "Healthcare Professionals Circle",
    profession: "Nursing, Medicine & Public Health",
    description:
      "A space for healthcare workers and students to share opportunities, career guidance and mentorship.",
    members: 128,
    mentor: "Dr. Amina",
  },
  {
    id: "tech-careers",
    name: "Tech & Digital Skills Hub",
    profession: "Software, Design, Data & IT Support",
    description:
      "Learn digital skills, share tech jobs, build portfolios and support beginners entering the industry.",
    members: 236,
    mentor: "Yusuf Dev",
  },
  {
    id: "business-careers",
    name: "Business & Entrepreneurship Network",
    profession: "Commerce, Finance, Small Business & Empowerment",
    description:
      "Discuss business ideas, funding, CVs, interviews, apprenticeships and empowerment opportunities.",
    members: 184,
    mentor: "Hauwa Business",
  },
];


const DEFAULT_CONTACT_INVITES: ContactInvite[] = [
  { id: "aisha-contact", name: "Aisha Bello", phone: "+237 670 000 101", status: "contact" },
  { id: "maryam-contact", name: "Maryam Musa", phone: "+237 670 000 102", status: "follower" },
  { id: "fatima-contact", name: "Fatima Noor", phone: "+237 670 000 103", status: "follower" },
  { id: "amina-contact", name: "Amina Charity", phone: "+237 670 000 104", status: "contact" },
  { id: "yusuf-contact", name: "Yusuf Careers", phone: "+237 670 000 105", status: "contact" },
];

const CAREER_GUIDES = [
  "Prepare a clean CV, portfolio and short introduction before applying.",
  "Ask professionals in your field about entry-level steps and required skills.",
  "Join a career circle, share opportunities and help others grow.",
  "Learn interview confidence, workplace manners and how promotions work.",
];

const DEFAULT_POSTS: PostItem[] = [
  {
    id: "job-1",
    type: "Jobs",
    authorId: "careerhub",
    author: "Career Empowerment Hub",
    username: "@careerhub",
    title: "Community Health Assistant Needed",
    body: "A local health project is looking for a reliable assistant. Requirements: basic health knowledge, good communication, willingness to learn and serve the community. Apply by introducing yourself and your experience.",
    location: "Bamenda • Full-time • Entry level",
    time: "Today",
    likes: 91,
    views: 1350,
    reposts: 12,
    verified: true,
    media: [],
    reactions: { like: 30, love: 18, amin: 10, support: 22, insight: 11 },
    comments: [],
    updates: [
      "Applications are open. Shortlisted applicants will be contacted.",
    ],
  },
  {
    id: "1",
    type: "Announcement",
    authorId: "team",
    author: "Chafadia Noor Team",
    username: "@chafadia",
    title: "Welcome to Ummah Space",
    body: "Share reminders, videos, images, files, questions, charity projects, events and beneficial Islamic updates.",
    location: "Community",
    time: "Today",
    likes: 240,
    views: 3200,
    reposts: 18,
    verified: true,
    media: [],
    reactions: { like: 80, love: 65, amin: 70, support: 20, insight: 5 },
    comments: [],
  },
  {
    id: "2",
    type: "Question",
    authorId: "fatima",
    author: "Fatima",
    username: "@fatima",
    title: "How can I stay consistent with Quran?",
    body: "Please share practical tips for reading Quran every day.",
    time: "2 hours ago",
    likes: 73,
    views: 918,
    reposts: 5,
    media: [],
    reactions: { like: 20, love: 10, amin: 18, support: 19, insight: 6 },
    comments: [],
  },
  {
    id: "3",
    type: "Charity",
    authorId: "support",
    author: "Community Support",
    username: "@support",
    title: "Food Pack Support Project",
    body: "We are preparing food packs for families in need. Updates will be posted here.",
    location: "Donation Desk",
    time: "This week",
    likes: 156,
    views: 2100,
    reposts: 22,
    verified: true,
    media: [],
    updates: ["Update 1: Rice and oil collection has started."],
    reactions: { like: 40, love: 30, amin: 45, support: 35, insight: 6 },
    comments: [],
  },
];

export default function CommunityFeedPage() {
  const [posts, setPosts] = useState<PostItem[]>(DEFAULT_POSTS);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([
    "aisha",
    "maryam",
    "fatima",
  ]);
  const [blockedFollowers, setBlockedFollowers] = useState<string[]>([]);
  const [contactInviteVisible, setContactInviteVisible] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [contactInvites, setContactInvites] = useState<ContactInvite[]>(DEFAULT_CONTACT_INVITES);

  const [tab, setTab] = useState<PostType>("All");
  const [appSection, setAppSection] = useState<AppSection>("home");
  const mainScrollRef = useRef<ScrollView | null>(null);
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);

  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [dashboardVisible, setDashboardVisible] = useState<DashboardView | null>(null);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [editType, setEditType] = useState<Exclude<PostType, "All">>("General");
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [profileVisible, setProfileVisible] = useState(false);
  const [avatarViewerVisible, setAvatarViewerVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const [messageThreadOpen, setMessageThreadOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [postDrafts, setPostDrafts] = useState<PostItem[]>([]);
  const [messageSearch, setMessageSearch] = useState("");
  const [messageFilter, setMessageFilter] = useState<"all" | "followers" | "requests" | "media" | "unread" | "drafts" | "mail">("all");
  const [messageRecipientPickerVisible, setMessageRecipientPickerVisible] = useState(false);
  const [messageRecipientSearch, setMessageRecipientSearch] = useState("");
  const [messageOptionsVisible, setMessageOptionsVisible] = useState(false);
  const [chatOptionsVisible, setChatOptionsVisible] = useState(false);
  const [manageConversationsVisible, setManageConversationsVisible] = useState(false);
  const [selectedManagedConversations, setSelectedManagedConversations] = useState<string[]>([]);
  const [dataPrivacyVisible, setDataPrivacyVisible] = useState(false);
  const [notificationReadIds, setNotificationReadIds] = useState<string[]>([]);
  const [notificationFilter, setNotificationFilter] = useState<"all" | "jobs" | "myposts" | "mentions">("all");
  const [mutedConversations, setMutedConversations] = useState<string[]>([]);
  const [starredConversations, setStarredConversations] = useState<string[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<string[]>([]);
  const [blockedConversations, setBlockedConversations] = useState<string[]>([]);
  const [focusedInbox, setFocusedInbox] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);
  const [messageSuggestions, setMessageSuggestions] = useState(true);
  const [messageNudges, setMessageNudges] = useState(true);
  const [harmfulDetection, setHarmfulDetection] = useState(true);
  const [cookiePreferences, setCookiePreferences] = useState(true);
  const [generativeAIData, setGenerativeAIData] = useState(true);
  const [researchInvites, setResearchInvites] = useState(true);
  const [shareProfileOnApply, setShareProfileOnApply] = useState(false);
  const [recruiterInterest, setRecruiterInterest] = useState(false);
  const [selectedMessageRecipient, setSelectedMessageRecipient] = useState("aisha");
  const [messageText, setMessageText] = useState("");
  const [messageMedia, setMessageMedia] = useState<MediaItem[]>([]);
  const [videoDuration, setVideoDuration] = useState(30);
  const [creatorCameraType, setCreatorCameraType] = useState<ImagePicker.CameraType>(ImagePicker.CameraType.back);
  const [notifyPosts, setNotifyPosts] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyLives, setNotifyLives] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [safeMode, setSafeMode] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [commentText, setCommentText] = useState("");

  const [newType, setNewType] = useState<Exclude<PostType, "All">>("General");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newMedia, setNewMedia] = useState<MediaItem[]>([]);
  const [newAudio, setNewAudio] = useState<MediaItem | undefined>();

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [liveCenterVisible, setLiveCenterVisible] = useState(false);
  const [liveVisible, setLiveVisible] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [liveMode, setLiveMode] = useState<"host" | "viewer">("host");
  const [cameraFacing, setCameraFacing] = useState<CameraType>("front");
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [liveTitle] = useState("Islamic Reminder Live");
  const [liveCommentText, setLiveCommentText] = useState("");
  const [liveComments, setLiveComments] = useState<LiveComment[]>([
    {
      id: "welcome-live",
      author: "Chafadia Noor",
      text: "Welcome to the live room. Keep comments respectful and beneficial.",
      time: "Now",
    },
  ]);
  const [liveViewers, setLiveViewers] = useState(128);
  const [liveLikes, setLiveLikes] = useState(420);
  const [liveGifts, setLiveGifts] = useState(12);
  const [liveGuests, setLiveGuests] = useState<string[]>(["Aisha", "Maryam"]);
  const [joinRequests, setJoinRequests] = useState<string[]>(["Fatima"]);
  const [liveReactions, setLiveReactions] = useState<
    Record<LiveReaction, number>
  >({
    heart: 210,
    amin: 88,
    star: 34,
    flower: 17,
    gift: 12,
  });

  const [liveMenuVisible, setLiveMenuVisible] = useState(true);
  const [liveFullscreen, setLiveFullscreen] = useState(false);
  const [liveChatLocked, setLiveChatLocked] = useState(false);
  const [livePinnedNotice, setLivePinnedNotice] = useState(
    "Welcome to the live room. Keep comments respectful and beneficial."
  );

  const [jobGroups, setJobGroups] = useState<JobGroup[]>(DEFAULT_JOB_GROUPS);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [createGroupVisible, setCreateGroupVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupProfession, setNewGroupProfession] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  useEffect(() => {
    loadSavedData();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (dataPrivacyVisible) {
        setDataPrivacyVisible(false);
        return true;
      }
      if (messageOptionsVisible) {
        setMessageOptionsVisible(false);
        return true;
      }
      if (chatOptionsVisible) {
        setChatOptionsVisible(false);
        return true;
      }
      if (messageRecipientPickerVisible) {
        setMessageRecipientPickerVisible(false);
        return true;
      }
      if (messageThreadOpen) {
        setMessageThreadOpen(false);
        return true;
      }
      if (messageVisible) {
        setMessageVisible(false);
        setAppSection("home");
        return true;
      }
      if (searchVisible) {
        setSearchVisible(false);
        return true;
      }
      if (createVisible) {
        setCreateVisible(false);
        return true;
      }
      if (liveVisible) {
        setLiveVisible(false);
        return true;
      }
      if (liveCenterVisible) {
        setLiveCenterVisible(false);
        return true;
      }
      if (menuVisible) {
        setMenuVisible(false);
        return true;
      }
      if (profileVisible) {
        setProfileVisible(false);
        return true;
      }
      if (appSection !== "home") {
        setAppSection("home");
        setTab("All");
        scrollMainToTop();
        return true;
      }
      return false;
    });

    return () => subscription.remove();
  }, [dataPrivacyVisible, messageOptionsVisible, chatOptionsVisible, messageRecipientPickerVisible, messageThreadOpen, messageVisible, searchVisible, createVisible, liveVisible, liveCenterVisible, menuVisible, profileVisible, appSection]);

  const loadSavedData = async () => {
    const savedPosts = await AsyncStorage.getItem(STORAGE_POSTS);
    const savedLikes = await AsyncStorage.getItem(STORAGE_LIKES);
    const savedBookmarks = await AsyncStorage.getItem(STORAGE_SAVED);
    const savedProfile = await AsyncStorage.getItem(STORAGE_PROFILE);
    const savedFollowing = await AsyncStorage.getItem(STORAGE_FOLLOWING);
    const savedFollowers = await AsyncStorage.getItem(STORAGE_FOLLOWERS);
    const savedBlockedFollowers = await AsyncStorage.getItem(STORAGE_BLOCKED_FOLLOWERS);
    const savedJobGroups = await AsyncStorage.getItem(STORAGE_JOB_GROUPS);
    const savedJobApplications = await AsyncStorage.getItem(
      STORAGE_JOB_APPLICATIONS,
    );
    const savedSearchHistory = await AsyncStorage.getItem(STORAGE_SEARCH_HISTORY);
    const savedMessages = await AsyncStorage.getItem(STORAGE_MESSAGES);
    const savedDrafts = await AsyncStorage.getItem(STORAGE_DRAFTS);
    const savedSettings = await AsyncStorage.getItem(STORAGE_SETTINGS);
    const savedContactInvites = await AsyncStorage.getItem(STORAGE_CONTACT_INVITES);

    if (savedPosts) setPosts(JSON.parse(savedPosts));
    if (savedLikes) setLiked(JSON.parse(savedLikes));
    if (savedBookmarks) setSaved(JSON.parse(savedBookmarks));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedFollowing) setFollowing(JSON.parse(savedFollowing));
    if (savedFollowers) setFollowers(JSON.parse(savedFollowers));
    if (savedBlockedFollowers) setBlockedFollowers(JSON.parse(savedBlockedFollowers));
    if (savedJobGroups) setJobGroups(JSON.parse(savedJobGroups));
    if (savedJobApplications)
      setJobApplications(JSON.parse(savedJobApplications));
    if (savedSearchHistory) setSearchHistory(JSON.parse(savedSearchHistory));
    if (savedMessages) setMessages(JSON.parse(savedMessages));
    if (savedDrafts) setPostDrafts(JSON.parse(savedDrafts));
    if (savedContactInvites) setContactInvites(JSON.parse(savedContactInvites));
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (typeof settings.notifyPosts === "boolean") setNotifyPosts(settings.notifyPosts);
        if (typeof settings.notifyMessages === "boolean") setNotifyMessages(settings.notifyMessages);
        if (typeof settings.notifyLives === "boolean") setNotifyLives(settings.notifyLives);
        if (typeof settings.privateProfile === "boolean") setPrivateProfile(settings.privateProfile);
        if (typeof settings.safeMode === "boolean") setSafeMode(settings.safeMode);
        if (typeof settings.dataSaver === "boolean") setDataSaver(settings.dataSaver);
      } catch {}
    }
  };

  const savePosts = async (items: PostItem[]) => {
    setPosts(items);
    await AsyncStorage.setItem(STORAGE_POSTS, JSON.stringify(items));
  };

  const saveProfile = async (updated: UserProfile) => {
    setProfile(updated);
    await AsyncStorage.setItem(STORAGE_PROFILE, JSON.stringify(updated));

    const updatedPosts = posts.map((post) =>
      post.authorId === updated.id
        ? {
            ...post,
            author: updated.name,
            username: updated.username,
            avatar: updated.avatar,
          }
        : post,
    );

    await savePosts(updatedPosts);
  };

  const saveSettings = async (next: Partial<{ notifyPosts: boolean; notifyMessages: boolean; notifyLives: boolean; privateProfile: boolean; safeMode: boolean; dataSaver: boolean }>) => {
    const updated = {
      notifyPosts,
      notifyMessages,
      notifyLives,
      privateProfile,
      safeMode,
      dataSaver,
      ...next,
    };

    setNotifyPosts(updated.notifyPosts);
    setNotifyMessages(updated.notifyMessages);
    setNotifyLives(updated.notifyLives);
    setPrivateProfile(updated.privateProfile);
    setSafeMode(updated.safeMode);
    setDataSaver(updated.dataSaver);

    await AsyncStorage.setItem(STORAGE_SETTINGS, JSON.stringify(updated));
  };

  const saveDraftPost = async () => {
    if (!newTitle.trim() && !newBody.trim() && newMedia.length === 0 && !newAudio) {
      Alert.alert("Empty Draft", "Add a title, message, photo, video, file, voice, or music before saving a draft.");
      return;
    }

    const draft: PostItem = {
      id: `draft-${Date.now()}`,
      type: newType,
      authorId: profile.id,
      author: profile.name,
      username: profile.username,
      avatar: profile.avatar,
      title: newTitle.trim() || "Untitled draft",
      body: newBody.trim() || "Draft saved. Add your message before publishing.",
      location: newLocation.trim() || undefined,
      time: "Draft",
      likes: 0,
      views: 0,
      reposts: 0,
      media: newMedia,
      backgroundAudio: newAudio,
      reactions: { like: 0, love: 0, amin: 0, support: 0, insight: 0 },
      comments: [],
      updates: [],
    };

    const updatedDrafts = [draft, ...postDrafts];
    setPostDrafts(updatedDrafts);
    await AsyncStorage.setItem(STORAGE_DRAFTS, JSON.stringify(updatedDrafts));
    setCreateVisible(false);
    Alert.alert("Draft Saved", "Your post is saved in drafts. Open Create Post to continue later.");
  };

  const loadDraftPost = (draft: PostItem) => {
    setNewType(draft.type);
    setNewTitle(draft.title === "Untitled draft" ? "" : draft.title);
    setNewBody(draft.body.includes("Draft saved") ? "" : draft.body);
    setNewLocation(draft.location || "");
    setNewMedia(draft.media || []);
    setNewAudio(draft.backgroundAudio);
    setCreateVisible(true);
  };

  const deleteDraftPost = async (id: string) => {
    const updatedDrafts = postDrafts.filter((draft) => draft.id !== id);
    setPostDrafts(updatedDrafts);
    await AsyncStorage.setItem(STORAGE_DRAFTS, JSON.stringify(updatedDrafts));
  };

  const requestLivePermissions = async () => {
    const cam = cameraPermission?.granted
      ? cameraPermission
      : await requestCameraPermission();

    const mic = micPermission?.granted
      ? micPermission
      : await requestMicPermission();

    if (!cam.granted || !mic.granted) {
      Alert.alert(
        "Permissions Needed",
        "Please allow camera and microphone access to start live streaming.",
      );
      return false;
    }

    return true;
  };

  const openLiveHost = async () => {
    const allowed = await requestLivePermissions();
    if (!allowed) return;

    setLiveMode("host");
    setLiveVisible(true);
  };

  const openLiveViewer = () => {
    setLiveMode("viewer");
    setLiveVisible(true);
  };

  const startLive = async () => {
    const allowed = await requestLivePermissions();
    if (!allowed) return;

    setIsLive(true);
    setLiveViewers((prev) => prev + 1);

    setLiveComments((prev) => [
      {
        id: `${Date.now()}`,
        author: "System",
        text: `${profile.name} started a live stream.`,
        time: "Now",
      },
      ...prev,
    ]);
  };

  const endLive = () => {
    Alert.alert("End Live", "Do you want to end this live stream?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End Live",
        style: "destructive",
        onPress: () => {
          setIsLive(false);
          setLiveVisible(false);
          setLiveFullscreen(false);
          setLiveMenuVisible(false);
        },
      },
    ]);
  };

  const sendLiveComment = () => {
    if (liveChatLocked) {
      Alert.alert("Chat Paused", "Live chat is paused by the host.");
      return;
    }

    if (!liveCommentText.trim()) return;

    setLiveComments((prev) => [
      {
        id: `${Date.now()}`,
        author: profile.name,
        text: liveCommentText.trim(),
        time: "Now",
      },
      ...prev,
    ]);

    setLiveCommentText("");
  };

  const clearLiveChat = () => {
    setLiveComments([
      {
        id: `notice-${Date.now()}`,
        author: "Chafadia Noor",
        text: livePinnedNotice,
        time: "Now",
      },
    ]);
  };


  const addLiveReaction = (reaction: LiveReaction) => {
    setLiveReactions((prev) => ({
      ...prev,
      [reaction]: prev[reaction] + 1,
    }));

    if (reaction === "heart") setLiveLikes((prev) => prev + 1);
  };

  const sendLiveGift = (gift: LiveGift) => {
    setLiveGifts((prev) => prev + gift.value);

    setLiveComments((prev) => [
      {
        id: `${Date.now()}`,
        author: profile.name,
        text: `sent ${gift.icon} ${gift.name}`,
        time: "Now",
      },
      ...prev,
    ]);
  };

  const requestToJoinLive = () => {
    if (joinRequests.includes(profile.name)) {
      Alert.alert("Request Sent", "Your join request is already pending.");
      return;
    }

    setJoinRequests((prev) => [profile.name, ...prev]);

    Alert.alert(
      "Request Sent",
      "The host can now accept you to join the live call.",
    );
  };

  const acceptJoinRequest = (name: string) => {
    setJoinRequests((prev) => prev.filter((item) => item !== name));
    setLiveGuests((prev) => [name, ...prev]);

    setLiveComments((prev) => [
      {
        id: `${Date.now()}`,
        author: "System",
        text: `${name} joined the live call.`,
        time: "Now",
      },
      ...prev,
    ]);
  };

  const inviteGuest = () => {
    Alert.alert(
      "Invite Guest",
      "In a real app, this will open followers list and send a live invite.",
    );

    setLiveGuests((prev) => ["Guest Invite Sent", ...prev]);
  };

  const shareLive = async () => {
    await Share.share({
      message: `${profile.name} is live on CHAFADIA NOOR: ${liveTitle}`,
    });
  };

  const pickProfilePicture = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Needed", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.95,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      const permanentAvatar = await persistProfileImage(result.assets[0].uri);
      await removePersistedProfileImage(profile.avatar);

      await saveProfile({
        ...profile,
        avatar: permanentAvatar,
      });

      setAvatarViewerVisible(true);
    }
  };

  const takeProfilePicture = async (
    cameraType: ImagePicker.CameraType = ImagePicker.CameraType.back
  ) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Needed", "Please allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.95,
      allowsEditing: true,
      aspect: [1, 1],
      cameraType,
    });

    if (!result.canceled) {
      const permanentAvatar = await persistProfileImage(result.assets[0].uri);
      await removePersistedProfileImage(profile.avatar);

      await saveProfile({
        ...profile,
        avatar: permanentAvatar,
      });

      setAvatarViewerVisible(true);
    }
  };

  const removeProfilePicture = async () => {
    Alert.alert("Remove Profile Picture", "Do you want to remove this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await removePersistedProfileImage(profile.avatar);

          await saveProfile({
            ...profile,
            avatar: undefined,
          });

          setAvatarViewerVisible(false);
        },
      },
    ]);
  };

  const normalizeSearchText = (value?: string | number) =>
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9@#]+/g, " ")
      .trim();

  const filteredPosts = useMemo(() => {
    const searchWords = normalizeSearchText(query).split(" ").filter(Boolean);

    return posts.filter((post) => {
      const searchableText = normalizeSearchText(
        [
          post.title,
          post.body,
          post.author,
          post.username,
          post.type,
          post.location || "",
          post.time,
          ...(post.updates || []),
          ...post.media.map((item) => item.name || item.type),
          ...post.comments.map((comment) => `${comment.author} ${comment.text}`),
        ].join(" "),
      );

      const matchesSearch =
        searchWords.length === 0 ||
        searchWords.every((word) => searchableText.includes(word));

      const sectionMatch =
        searchWords.length > 0
          ? true
          : appSection === "jobs"
            ? post.type === "Jobs"
            : appSection === "charity"
              ? post.type === "Charity"
              : appSection === "events"
                ? post.type === "Event" || post.type === "Reminder"
                : appSection === "home"
                  ? post.type !== "Jobs" && post.type !== "Charity" && post.type !== "Event" && post.type !== "Reminder"
                  : true;

      return sectionMatch && matchesSearch;
    });
  }, [posts, query, appSection]);

  const filteredJobGroups = useMemo(() => {
    const searchWords = normalizeSearchText(query).split(" ").filter(Boolean);

    if (searchWords.length === 0) return jobGroups;

    return jobGroups.filter((group) => {
      const searchableText = normalizeSearchText(
        [
          group.name,
          group.profession,
          group.description,
          group.mentor,
          `${group.members} members`,
          "jobs careers empowerment professional circles group",
        ].join(" "),
      );

      return searchWords.every((word) => searchableText.includes(word));
    });
  }, [jobGroups, query]);

  const visibleResultCount = filteredPosts.length + (appSection === "jobs" || query.trim().length > 0 ? filteredJobGroups.length : 0);

  const myPosts = posts.filter((post) => post.authorId === profile.id);
  const totalMyLikes = myPosts.reduce((sum, post) => sum + post.likes, 0);
  const totalMyViews = myPosts.reduce((sum, post) => sum + post.views, 0);
  const totalMyVideos = myPosts.reduce(
    (sum, post) =>
      sum + post.media.filter((item) => item.type === "video").length,
    0,
  );

  const toggleLike = async (id: string) => {
    const alreadyLiked = liked.includes(id);

    const updatedLiked = alreadyLiked
      ? liked.filter((item) => item !== id)
      : [...liked, id];

    const updatedPosts = posts.map((post) =>
      post.id === id
        ? {
            ...post,
            likes: alreadyLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
          }
        : post,
    );

    setLiked(updatedLiked);
    await AsyncStorage.setItem(STORAGE_LIKES, JSON.stringify(updatedLiked));
    await savePosts(updatedPosts);
    updateSelectedPost(updatedPosts, id);
  };

  const addReaction = async (postId: string, reaction: ReactionType) => {
    const updatedPosts = posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            reactions: {
              ...post.reactions,
              [reaction]: post.reactions[reaction] + 1,
            },
          }
        : post,
    );

    await savePosts(updatedPosts);
    updateSelectedPost(updatedPosts, postId);
  };

  const toggleSave = async (id: string) => {
    const updated = saved.includes(id)
      ? saved.filter((item) => item !== id)
      : [...saved, id];

    setSaved(updated);
    await AsyncStorage.setItem(STORAGE_SAVED, JSON.stringify(updated));
  };

  const followUser = async (authorId: string) => {
    if (authorId === profile.id) return;

    const updated = following.includes(authorId)
      ? following.filter((id) => id !== authorId)
      : [...following, authorId];

    setFollowing(updated);
    await AsyncStorage.setItem(STORAGE_FOLLOWING, JSON.stringify(updated));
  };

  const openContactInvites = () => {
    setContactInviteVisible(true);
  };

  const saveContactInvites = async (items: ContactInvite[]) => {
    setContactInvites(items);
    await AsyncStorage.setItem(STORAGE_CONTACT_INVITES, JSON.stringify(items));
  };

  const sendFollowRequestToContact = async (contact: ContactInvite) => {
    const updatedContacts = contactInvites.map((item) =>
      item.id === contact.id ? { ...item, status: "requested" as const } : item,
    );

    await saveContactInvites(updatedContacts);
    Alert.alert("Follow request sent", `${contact.name} will see your follow request.`);
  };

  const inviteContactToApp = async (contact: ContactInvite) => {
    const updatedContacts = contactInvites.map((item) =>
      item.id === contact.id ? { ...item, status: "invited" as const } : item,
    );

    await saveContactInvites(updatedContacts);
    await Share.share({
      message: `Assalamu alaikum ${contact.name}, join me on CHAFADIA NOOR so we can follow each other, share posts, charity, events, jobs and reminders.`,
    });
  };

  const addContactAsFollower = async (contact: ContactInvite) => {
    const followerId = contact.name.toLowerCase().replace(/\s+/g, "-");
    const updatedFollowers = followers.includes(followerId) ? followers : [...followers, followerId];
    const updatedContacts = contactInvites.map((item) =>
      item.id === contact.id ? { ...item, status: "follower" as const } : item,
    );

    setFollowers(updatedFollowers);
    await AsyncStorage.setItem(STORAGE_FOLLOWERS, JSON.stringify(updatedFollowers));
    await saveContactInvites(updatedContacts);
    Alert.alert("Follower added", `${contact.name} is now in your followers list.`);
  };

  const simulateFollower = openContactInvites;


  const openDashboard = (view: DashboardView) => {
    setDashboardVisible(view);
  };

  const followerDisplayName = (id: string) =>
    id
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const toggleBlockFollower = async (id: string) => {
    const updated = blockedFollowers.includes(id)
      ? blockedFollowers.filter((item) => item !== id)
      : [...blockedFollowers, id];

    setBlockedFollowers(updated);
    await AsyncStorage.setItem(
      STORAGE_BLOCKED_FOLLOWERS,
      JSON.stringify(updated),
    );
  };

  const startEditPost = (post: PostItem) => {
    if (post.authorId !== profile.id) {
      Alert.alert("Edit Post", "You can only edit posts that you created.");
      return;
    }

    setEditingPost(post);
    setEditType(post.type);
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditLocation(post.location || "");
  };

  const saveEditedPost = async () => {
    if (!editingPost) return;

    if (!editTitle.trim() || !editBody.trim()) {
      Alert.alert("Missing Details", "Please keep a title and message.");
      return;
    }

    const updatedPosts = posts.map((post) =>
      post.id === editingPost.id
        ? {
            ...post,
            type: editType,
            title: editTitle.trim(),
            body: editBody.trim(),
            location: editLocation.trim() || undefined,
            time: post.time.includes("Edited") ? post.time : `${post.time} • Edited`,
          }
        : post,
    );

    await savePosts(updatedPosts);
    updateSelectedPost(updatedPosts, editingPost.id);
    setEditingPost(null);
  };

  const createPost = async () => {
    if (!newTitle.trim() || !newBody.trim()) {
      Alert.alert("Missing Details", "Please add a title and message.");
      return;
    }

    const post: PostItem = {
      id: `${Date.now()}`,
      type: newType,
      authorId: profile.id,
      author: profile.name,
      username: profile.username,
      avatar: profile.avatar,
      title: newTitle.trim(),
      body: newBody.trim(),
      location: newLocation.trim() || undefined,
      time: "Just now",
      likes: 0,
      views: 0,
      reposts: 0,
      media: newMedia,
      backgroundAudio: newAudio,
      reactions: {
        like: 0,
        love: 0,
        amin: 0,
        support: 0,
        insight: 0,
      },
      comments: [],
      updates:
        newType === "Charity"
          ? ["Project created. Updates will appear here."]
          : [],
    };

    await savePosts([post, ...posts]);

    setNewType("General");
    setNewTitle("");
    setNewBody("");
    setNewLocation("");
    setNewMedia([]);
    setNewAudio(undefined);
    setCreateVisible(false);
  };

  const addComment = async () => {
    if (!selectedPost) return;

    if (!commentText.trim()) {
      Alert.alert("Empty Comment", "Please write a comment.");
      return;
    }

    const newComment: CommentItem = {
      id: `${Date.now()}`,
      author: profile.name,
      text: commentText.trim(),
      time: "Just now",
      reactions: {
        like: 0,
        love: 0,
        amin: 0,
        support: 0,
        insight: 0,
      },
    };

    const updatedPosts = posts.map((post) =>
      post.id === selectedPost.id
        ? { ...post, comments: [...post.comments, newComment] }
        : post,
    );

    await savePosts(updatedPosts);
    updateSelectedPost(updatedPosts, selectedPost.id);
    setCommentText("");
  };

  const repostPost = async (post: PostItem) => {
    const repost: PostItem = {
      ...post,
      id: `${Date.now()}`,
      authorId: profile.id,
      author: profile.name,
      username: profile.username,
      avatar: profile.avatar,
      title: `Repost: ${post.title}`,
      time: "Just now",
      likes: 0,
      views: 0,
      reposts: 0,
      comments: [],
    };

    const updatedPosts = posts.map((item) =>
      item.id === post.id ? { ...item, reposts: item.reposts + 1 } : item,
    );

    await savePosts([repost, ...updatedPosts]);
    Alert.alert("Reposted", "The post has been reposted to your profile.");
  };

  const sharePost = async (post: PostItem) => {
    await Share.share({
      message: `${post.title}\n\n${post.body}\n\nPosted by: ${post.author}`,
    });
  };

  const reportPost = () => {
    Alert.alert(
      "Report Sent",
      "Thank you. This post has been flagged for review.",
    );
  };

  const deletePost = async (postId: string) => {
    const postToDelete = posts.find((post) => post.id === postId);

    if (!postToDelete) return;

    if (postToDelete.authorId !== profile.id) {
      Alert.alert(
        "Cannot Delete",
        "You can only delete posts that you created.",
      );
      return;
    }

    Alert.alert(
      "Delete Post",
      "Do you want to permanently remove this post from your feed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedPosts = posts.filter((post) => post.id !== postId);
            const updatedLiked = liked.filter((id) => id !== postId);
            const updatedSaved = saved.filter((id) => id !== postId);
            const updatedApplications = jobApplications.filter(
              (application) => application.postId !== postId,
            );

            setLiked(updatedLiked);
            setSaved(updatedSaved);
            setJobApplications(updatedApplications);
            setSelectedPost((current) =>
              current?.id === postId ? null : current,
            );

            await AsyncStorage.setItem(
              STORAGE_LIKES,
              JSON.stringify(updatedLiked),
            );
            await AsyncStorage.setItem(
              STORAGE_SAVED,
              JSON.stringify(updatedSaved),
            );
            await AsyncStorage.setItem(
              STORAGE_JOB_APPLICATIONS,
              JSON.stringify(updatedApplications),
            );
            await savePosts(updatedPosts);
          },
        },
      ],
    );
  };

  const downloadPost = async (post: PostItem) => {
    if (post.media.length === 0) {
      Alert.alert("No Media", "This post has no media to download or share.");
      return;
    }

    const first = post.media[0];

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(first.uri);
    } else {
      Alert.alert(
        "Sharing Not Available",
        "Your device does not support file sharing.",
      );
    }
  };

  const updateSelectedPost = (items: PostItem[], id: string) => {
    const updated = items.find((post) => post.id === id);
    if (updated) setSelectedPost(updated);
  };

  const pickImageOrVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Needed", "Please allow media access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
      allowsEditing: true,
      videoMaxDuration: videoDuration,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      setNewMedia((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          uri: asset.uri,
          type: asset.type === "video" ? "video" : "image",
          name: asset.fileName || "media",
          mimeType: asset.mimeType,
        },
      ]);
    }
  };

  const openCamera = async (
    cameraType: ImagePicker.CameraType = ImagePicker.CameraType.back
  ) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Needed", "Please allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85,
      allowsEditing: true,
      videoMaxDuration: videoDuration,
      cameraType,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      setNewMedia((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          uri: asset.uri,
          type: asset.type === "video" ? "video" : "image",
          name: asset.fileName ||
            (cameraType === ImagePicker.CameraType.front
              ? "front-camera-media"
              : "back-camera-media"),
          mimeType: asset.mimeType,
        },
      ]);
    }
  };

  const takeCreatorPhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Needed", "Please allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      cameraType: creatorCameraType,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setNewMedia((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          uri: asset.uri,
          type: "image",
          name: asset.fileName || "captured-photo",
          mimeType: asset.mimeType,
        },
      ]);
    }
  };

  const recordCreatorVideo = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Needed", "Please allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.85,
      allowsEditing: true,
      videoMaxDuration: videoDuration,
      cameraType: creatorCameraType,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setNewMedia((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          uri: asset.uri,
          type: "video",
          name: asset.fileName || `video-${videoDuration}s`,
          mimeType: asset.mimeType,
        },
      ]);
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      setNewMedia((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          type: "file",
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType,
        },
      ]);
    }
  };

  const pickBackgroundAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      setNewAudio({
        id: `${Date.now()}`,
        type: "audio",
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
      });
    }
  };

  const startVoiceRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission Needed", "Please allow microphone access.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(newRecording);
    } catch {
      Alert.alert("Recording Error", "Unable to start recording.");
    }
  };

  const stopVoiceRecording = async () => {
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    if (uri) {
      setNewMedia((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          type: "audio",
          uri,
          name: "Voice note",
        },
      ]);
    }

    setRecording(null);
  };

  const playAudio = async (uri: string) => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setPlayingAudio(null);
    }

    const { sound } = await Audio.Sound.createAsync({ uri });
    soundRef.current = sound;
    setPlayingAudio(uri);

    sound.setOnPlaybackStatusUpdate((status) => {
      if ("didJustFinish" in status && status.didJustFinish) {
        setPlayingAudio(null);
      }
    });

    await sound.playAsync();
  };

  const createJobPostQuick = () => {
    setNewType("Jobs");
    setNewTitle("");
    setNewBody("");
    setNewLocation("");
    setCreateVisible(true);
  };

  const saveJobGroups = async (items: JobGroup[]) => {
    setJobGroups(items);
    await AsyncStorage.setItem(STORAGE_JOB_GROUPS, JSON.stringify(items));
  };

  const saveJobApplications = async (items: JobApplication[]) => {
    setJobApplications(items);
    await AsyncStorage.setItem(STORAGE_JOB_APPLICATIONS, JSON.stringify(items));
  };

  const applyForJob = async (post: PostItem) => {
    if (post.type !== "Jobs") return;

    const alreadyApplied = jobApplications.some(
      (item) => item.postId === post.id && item.applicant === profile.name,
    );

    if (alreadyApplied) {
      Alert.alert(
        "Already Applied",
        "Your application has already been saved for this job.",
      );
      return;
    }

    const application: JobApplication = {
      id: `${Date.now()}`,
      postId: post.id,
      applicant: profile.name,
      role: post.title,
      message: `I am interested in ${post.title}. Please contact me through the community feed.`,
      time: "Just now",
    };

    await saveJobApplications([application, ...jobApplications]);
    Alert.alert(
      "Application Saved",
      "Your job application has been added locally. You can also comment on the post to introduce yourself.",
    );
  };

  const createJobGroup = async () => {
    if (!newGroupName.trim() || !newGroupProfession.trim()) {
      Alert.alert("Missing Details", "Please add a group name and profession.");
      return;
    }

    const group: JobGroup = {
      id: `${Date.now()}`,
      name: newGroupName.trim(),
      profession: newGroupProfession.trim(),
      description:
        newGroupDescription.trim() ||
        "A professional circle for jobs, career advice, opportunities and empowerment.",
      members: 1,
      mentor: profile.name,
    };

    await saveJobGroups([group, ...jobGroups]);
    setNewGroupName("");
    setNewGroupProfession("");
    setNewGroupDescription("");
    setCreateGroupVisible(false);
  };

  const joinJobGroup = async (groupId: string) => {
    const updated = jobGroups.map((group) =>
      group.id === groupId ? { ...group, members: group.members + 1 } : group,
    );

    await saveJobGroups(updated);
    Alert.alert("Joined Group", "You have joined this professional circle.");
  };

  const deleteJobGroup = async (groupId: string) => {
    Alert.alert("Delete Group", "Do you want to remove this professional circle?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await saveJobGroups(jobGroups.filter((group) => group.id !== groupId));
        },
      },
    ]);
  };

  const deleteJobApplication = async (applicationId: string) => {
    Alert.alert("Remove Application", "Do you want to remove this saved application?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await saveJobApplications(
            jobApplications.filter((application) => application.id !== applicationId),
          );
        },
      },
    ]);
  };



  const openSearchPanel = () => {
    setMessageVisible(false);
    setCreateVisible(false);
    setSearchVisible(true);
    setTimeout(() => mainScrollRef.current?.scrollTo({ y: 0, animated: true }), 80);
  };

  const runSearch = async (value?: string) => {
    const term = (value ?? query).trim();
    if (!term) return;
    setQuery(term);
    const updated = [term, ...searchHistory.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, 12);
    setSearchHistory(updated);
    await AsyncStorage.setItem(STORAGE_SEARCH_HISTORY, JSON.stringify(updated));
    setSearchVisible(false);
    Keyboard.dismiss();
  };

  const deleteSearchHistoryItem = async (term: string) => {
    const updated = searchHistory.filter((item) => item !== term);
    setSearchHistory(updated);
    await AsyncStorage.setItem(STORAGE_SEARCH_HISTORY, JSON.stringify(updated));
  };

  const clearSearchHistory = async () => {
    setSearchHistory([]);
    await AsyncStorage.setItem(STORAGE_SEARCH_HISTORY, JSON.stringify([]));
  };

  const pickMessageMedia = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const media: MediaItem = {
        id: `${Date.now()}`,
        type: asset.mimeType?.startsWith("video") ? "video" : asset.mimeType?.startsWith("image") ? "image" : "file",
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
      };
      setMessageMedia((prev) => [...prev, media]);
    }
  };

  const pickMessageImageOrVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Needed", "Please allow gallery access to attach images or videos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85,
      allowsEditing: true,
      videoMaxDuration: videoDuration,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setMessageMedia((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          uri: asset.uri,
          type: asset.type === "video" ? "video" : "image",
          name: asset.fileName || (asset.type === "video" ? "message-video" : "message-image"),
          mimeType: asset.mimeType,
        },
      ]);
    }
  };

  const openCreatePostFlow = () => {
    setMenuVisible(false);
    setSearchVisible(false);
    setMessageVisible(false);
    setCreateVisible(true);
  };

  const openMessagesCenter = () => {
    setMenuVisible(false);
    setSearchVisible(false);
    setCreateVisible(false);
    setMessageFilter("all");
    setMessageThreadOpen(false);
    setMessageVisible(true);
  };

  const openCreatorCameraPanel = () => {
    openCreatePostFlow();
  };

  const openHeaderLiveCenter = () => {
    setLiveCenterVisible(true);
  };

  const hostLiveFromCenter = () => {
    setLiveCenterVisible(false);
    openLiveHost();
  };

  const joinLiveFromCenter = () => {
    setLiveCenterVisible(false);
    openLiveViewer();
  };

  const openMessageAction = (action: "all" | "requests" | "media" | "new") => {
    if (action === "new") {
      setMessageFilter("all");
      setMessageText("");
      setMessageMedia([]);
      setMessageVisible(true);
      return;
    }

    if (action === "requests") {
      setMessageFilter("requests");
      return;
    }

    if (action === "media") {
      setMessageFilter("media");
      return;
    }

    setMessageFilter("all");
  };

  const sendCommunityMessage = async () => {
    if (!messageText.trim() && messageMedia.length === 0) {
      Alert.alert("Empty Message", "Write a message or attach a file first.");
      return;
    }

    const isFollower = followers.includes(selectedMessageRecipient);
    const message: MessageItem = {
      id: `${Date.now()}`,
      recipient: selectedMessageRecipient,
      text: messageText.trim(),
      time: "Just now",
      media: messageMedia,
      status: isFollower ? "sent" : "request",
    };

    const updated = [message, ...messages];
    setMessages(updated);
    await AsyncStorage.setItem(STORAGE_MESSAGES, JSON.stringify(updated));
    setMessageText("");
    setMessageMedia([]);
    Keyboard.dismiss();
    Alert.alert(isFollower ? "Message Sent" : "Request Sent", isFollower ? "Your message has been sent." : "This person is not a follower, so your message was saved as a request.");
  };

  const simulateReceivedMessage = async () => {
    const reply: MessageItem = {
      id: `${Date.now()}-reply`,
      recipient: selectedMessageRecipient,
      text: `Reply from ${selectedMessageRecipient}: Wa alaikum salam, I received your message.`,
      time: "Now",
      media: [],
      status: "received",
    };
    const updated = [reply, ...messages];
    setMessages(updated);
    await AsyncStorage.setItem(STORAGE_MESSAGES, JSON.stringify(updated));
  };

  const deleteMessageItem = async (id: string) => {
    const updated = messages.filter((item) => item.id !== id);
    setMessages(updated);
    await AsyncStorage.setItem(STORAGE_MESSAGES, JSON.stringify(updated));
  };

  const allConversationNames = useMemo(() => {
    return [
      ...new Set([
        ...followers,
        ...following,
        ...messages.map((item) => item.recipient),
        "aisha",
        "maryam",
        "fatima",
        "yusuf-careers",
        "amina-charity",
        "community-mail",
        "support-mail",
      ]),
    ];
  }, [followers, following, messages]);

  const openManageConversations = () => {
    setMessageOptionsVisible(false);
    setSelectedManagedConversations([]);
    setManageConversationsVisible(true);
  };

  const toggleManagedConversation = (name: string) => {
    setSelectedManagedConversations((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
  };

  const selectAllManagedConversations = () => {
    setSelectedManagedConversations((prev) =>
      prev.length === allConversationNames.length ? [] : allConversationNames,
    );
  };

  const markSelectedConversationsUnread = async () => {
    if (selectedManagedConversations.length === 0) {
      Alert.alert("Select conversations", "Choose at least one conversation first.");
      return;
    }

    const unreadMarkers: MessageItem[] = selectedManagedConversations.map((recipient) => ({
      id: `${Date.now()}-${recipient}-unread`,
      recipient,
      text: "Marked as unread",
      time: "Now",
      media: [],
      status: "received",
    }));

    const updated = [...unreadMarkers, ...messages];
    setMessages(updated);
    await AsyncStorage.setItem(STORAGE_MESSAGES, JSON.stringify(updated));
    setSelectedManagedConversations([]);
    Alert.alert("Marked unread", "Selected conversations were marked as unread.");
  };

  const archiveSelectedConversations = () => {
    if (selectedManagedConversations.length === 0) {
      Alert.alert("Select conversations", "Choose at least one conversation first.");
      return;
    }

    setArchivedConversations((prev) => [
      ...new Set([...prev, ...selectedManagedConversations]),
    ]);
    setSelectedManagedConversations([]);
    Alert.alert("Archived", "Selected conversations were archived.");
  };

  const deleteSelectedConversations = () => {
    if (selectedManagedConversations.length === 0) {
      Alert.alert("Select conversations", "Choose at least one conversation first.");
      return;
    }

    Alert.alert(
      "Delete conversations",
      `Delete ${selectedManagedConversations.length} selected conversation(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const selected = new Set(selectedManagedConversations);
            const updated = messages.filter((item) => !selected.has(item.recipient));
            setMessages(updated);
            await AsyncStorage.setItem(STORAGE_MESSAGES, JSON.stringify(updated));
            setSelectedManagedConversations([]);
            setManageConversationsVisible(false);
          },
        },
      ],
    );
  };


  const scrollMainToTop = () => {
    mainScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const goToAppSection = (section: AppSection) => {
    setAppSection(section);

    if (section === "home") {
      setTab("All");
      scrollMainToTop();
      return;
    }

    if (section === "jobs") {
      setTab("Jobs");
      scrollMainToTop();
      return;
    }

    if (section === "notifications") {
      setTab("All");
      scrollMainToTop();
      return;
    }

    if (section === "charity") {
      setTab("Charity");
      scrollMainToTop();
      return;
    }

    if (section === "events") {
      setTab("Event");
      scrollMainToTop();
      return;
    }

    if (section === "profile") {
      setProfileVisible(true);
      return;
    }

    if (section === "menu") {
      setMenuVisible(true);
    }
  };

  const notificationItems = useMemo(() => {
    const rows: { id: string; type: string; category: "jobs" | "myposts" | "mentions" | "general"; title: string; text: string; time: string; action: () => void }[] = [];

    messages
      .filter((item) => item.status === "received" || item.status === "request")
      .forEach((item) => {
        rows.push({
          id: `message-${item.id}`,
          type: item.status === "request" ? "request" : "message",
          category: "mentions",
          title: item.status === "request" ? "New message request" : "New message",
          text: `${followerDisplayName(item.recipient)}: ${item.text || `${item.media.length} attachment(s)`}`,
          time: item.time,
          action: () => {
            setNotificationReadIds((prev) => [...new Set([...prev, `message-${item.id}`])]);
            setSelectedMessageRecipient(item.recipient);
            setMessageVisible(true);
            setMessageThreadOpen(true);
          },
        });
      });

    joinRequests.forEach((name) => {
      rows.push({
        id: `join-${name}`,
        type: "live",
        category: "general",
        title: "Live join request",
        text: `${name} requested to join your live room.`,
        time: "Now",
        action: () => {
          setNotificationReadIds((prev) => [...new Set([...prev, `join-${name}`])]);
          setLiveCenterVisible(true);
        },
      });
    });

    contactInvites
      .filter((item) => item.status === "requested" || item.status === "invited")
      .forEach((item) => {
        rows.push({
          id: `invite-${item.id}`,
          type: "invite",
          category: "mentions",
          title: item.status === "requested" ? "Follow request sent" : "Invitation sent",
          text: `${item.name} • ${item.phone}`,
          time: "Today",
          action: () => {
            setNotificationReadIds((prev) => [...new Set([...prev, `invite-${item.id}`])]);
            setContactInviteVisible(true);
          },
        });
      });

    rows.push({
      id: "job-alert-software",
      type: "job",
      category: "jobs",
      title: "Software engineer",
      text: "New opportunities are available. Tap to view jobs that match your profile.",
      time: "4h",
      action: () => {
        setNotificationReadIds((prev) => [...new Set([...prev, "job-alert-software"])]);
        goToAppSection("jobs");
      },
    });

    rows.push({
      id: "mypost-reaction",
      type: "post",
      category: "myposts",
      title: "Your post is getting reactions",
      text: "People reacted to your latest community post. Open your profile to review activity.",
      time: "14h",
      action: () => {
        setNotificationReadIds((prev) => [...new Set([...prev, "mypost-reaction"])]);
        setProfileVisible(true);
      },
    });

    rows.push({
      id: "safety-tools",
      type: "safety",
      category: "general",
      title: "Safety reminder",
      text: "Community safety and privacy tools are available in Menu and message settings.",
      time: "Today",
      action: () => {
        setNotificationReadIds((prev) => [...new Set([...prev, "safety-tools"])]);
        setMenuVisible(true);
      },
    });

    return rows;
  }, [messages, joinRequests, contactInvites]);

  const unreadNotificationCount = notificationItems.filter((item) => !notificationReadIds.includes(item.id)).length;

  const markNotificationRead = (id: string) => {
    setNotificationReadIds((prev) => [...new Set([...prev, id])]);
  };

  const markAllNotificationsRead = () => {
    setNotificationReadIds(notificationItems.map((item) => item.id));
  };

  const toggleConversationList = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  };

  const moveConversationToOther = () => {
    Alert.alert("Moved", `${followerDisplayName(selectedMessageRecipient)} was moved to Other.`);
    setChatOptionsVisible(false);
  };

  const labelConversationAsJob = () => {
    Alert.alert("Label added", "This conversation is now labeled as Jobs.");
    setChatOptionsVisible(false);
  };

  const markConversationUnread = () => {
    const unreadMessage: MessageItem = {
      id: `${Date.now()}-unread`,
      recipient: selectedMessageRecipient,
      text: "Marked as unread",
      time: "Now",
      media: [],
      status: "received",
    };
    const updated = [unreadMessage, ...messages];
    setMessages(updated);
    AsyncStorage.setItem(STORAGE_MESSAGES, JSON.stringify(updated));
    setChatOptionsVisible(false);
  };

  const archiveConversation = () => {
    toggleConversationList(setArchivedConversations, selectedMessageRecipient);
    setChatOptionsVisible(false);
  };

  const reportOrBlockConversation = () => {
    toggleConversationList(setBlockedConversations, selectedMessageRecipient);
    setChatOptionsVisible(false);
  };

  const deleteConversation = async () => {
    const updated = messages.filter((item) => item.recipient !== selectedMessageRecipient);
    setMessages(updated);
    await AsyncStorage.setItem(STORAGE_MESSAGES, JSON.stringify(updated));
    setChatOptionsVisible(false);
    setMessageThreadOpen(false);
  };

  const clearLocalPosts = () => {
    Alert.alert("Reset Community Feed", "This will restore sample posts.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          await savePosts(DEFAULT_POSTS);
          setSelectedPost(null);
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.mainKeyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
        enabled
      >
        <ScrollView
          ref={mainScrollRef}
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          contentInsetAdjustmentBehavior="automatic"
        >
        <View style={styles.linkedHeaderBar}>
          <TouchableOpacity style={styles.headerProfileButton} onPress={() => setProfileVisible(true)} accessibilityLabel="Open profile">
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.headerProfileImage} />
            ) : (
              <UserRound size={21} color={GREEN} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.communityProSearchPill} onPress={openSearchPanel} activeOpacity={0.85} accessibilityLabel="Open search">
            <Search size={18} color="#5F6F68" />
            <Text style={styles.communityProSearchText}>{query.trim() ? query : "I'm looking for..."}</Text>
          </TouchableOpacity>

        </View>

        <View style={styles.goldGlow} />
        <View style={styles.greenGlow} />

        {appSection === "charity" && (
          <LinearGradient colors={[CARD, "#F7F0DC"]} style={styles.pageIntroCard}>
            <View style={styles.pageIntroIcon}><HandHeart size={20} color="#FFFFFF" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pageIntroTitle}>Charity & Support</Text>
              <Text style={styles.pageIntroText}>Mosque projects, orphan support, food packs, donations, and trusted community charity groups.</Text>
            </View>
            <TouchableOpacity style={styles.pageIntroButton} onPress={() => { setCreateVisible(true); setNewType("Charity"); }}>
              <Plus size={15} color="#FFFFFF" />
              <Text style={styles.pageIntroButtonText}>Add</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {appSection === "events" && (
          <LinearGradient colors={[CARD, "#F7F0DC"]} style={styles.pageIntroCard}>
            <View style={styles.pageIntroIcon}><CalendarDays size={20} color="#FFFFFF" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pageIntroTitle}>Events & Reminders</Text>
              <Text style={styles.pageIntroText}>Community events, Islamic classes, reminders, programs, and important announcements.</Text>
            </View>
            <TouchableOpacity style={styles.pageIntroButton} onPress={() => { setCreateVisible(true); setNewType("Event"); }}>
              <Plus size={15} color="#FFFFFF" />
              <Text style={styles.pageIntroButtonText}>Add</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {query.trim().length > 0 && (
          <View style={styles.activeSearchStrip}>
            <Search size={15} color={GREEN} />
            <Text style={styles.activeSearchText}>Searching: {query}</Text>
            <TouchableOpacity onPress={() => setQuery("")} style={styles.activeSearchClear}>
              <X size={14} color={GREEN} />
            </TouchableOpacity>
          </View>
        )}

        {appSection === "jobs" && (
          <LinearGradient colors={[CARD, "#F7F0DC"]} style={styles.jobsHubCard}>
            <View style={styles.jobsHubTop}>
              <View style={styles.jobsIconCircle}>
                <BriefcaseBusiness size={22} color="#FFFFFF" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.jobsHubTitle}>
                  Jobs, Careers & Empowerment
                </Text>
                <Text style={styles.jobsHubSubtitle}>
                  Post jobs, apply, create professional circles, meet people in
                  your career field and learn how work life grows.
                </Text>
              </View>
            </View>

            <View style={styles.jobsActionGrid}>
              <TouchableOpacity
                style={styles.jobsPrimaryButton}
                onPress={createJobPostQuick}
              >
                <BriefcaseBusiness size={16} color="#FFFFFF" />
                <Text style={styles.jobsPrimaryText}>Post Job</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.jobsSecondaryButton}
                onPress={() => setCreateGroupVisible(true)}
              >
                <UsersRound size={16} color={GREEN} />
                <Text style={styles.jobsSecondaryText}>Create Group</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.jobsSecondaryButton}
                onPress={() => setTab("Jobs")}
              >
                <ClipboardCheck size={16} color={GREEN} />
                <Text style={styles.jobsSecondaryText}>Find Jobs</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.jobsStatsRow}>
              <JobMiniStat
                icon={<BriefcaseBusiness size={15} color={GOLD} />}
                label="Job posts"
                value={posts.filter((item) => item.type === "Jobs").length}
                onPress={() => openDashboard("jobPosts")}
              />
              <JobMiniStat
                icon={<ClipboardCheck size={15} color={GOLD} />}
                label="Applications"
                value={jobApplications.length}
                onPress={() => openDashboard("applications")}
              />
              <JobMiniStat
                icon={<UsersRound size={15} color={GOLD} />}
                label="Groups"
                value={jobGroups.length}
                onPress={() => openDashboard("groups")}
              />
            </View>

            <Text style={styles.jobsSectionTitle}>Professional Circles</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.jobGroupScroll}
            >
              {filteredJobGroups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={styles.jobGroupCard}
                  activeOpacity={0.9}
                  onPress={() => openDashboard("groups")}
                >
                  <View style={styles.jobGroupIcon}>
                    <Building2 size={18} color={GOLD} />
                  </View>
                  <Text style={styles.jobGroupName}>{group.name}</Text>
                  <Text style={styles.jobGroupProfession}>
                    {group.profession}
                  </Text>
                  <Text style={styles.jobGroupDescription}>
                    {group.description}
                  </Text>
                  <View style={styles.jobGroupFooter}>
                    <Text style={styles.jobGroupMembers}>
                      {group.members} members
                    </Text>
                    <TouchableOpacity
                      style={styles.joinGroupButton}
                      onPress={() => joinJobGroup(group.id)}
                    >
                      <Text style={styles.joinGroupText}>Join</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.jobsSectionTitle}>Career Growth Guide</Text>
            {CAREER_GUIDES.map((item) => (
              <View key={item} style={styles.careerGuideRow}>
                <GraduationCap size={16} color={GREEN} />
                <Text style={styles.careerGuideText}>{item}</Text>
              </View>
            ))}
          </LinearGradient>
        )}

        {appSection === "notifications" && (
          <View style={styles.communityProNotificationsPage}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.notificationFilterScroll}
              contentContainerStyle={styles.notificationFilterContent}
            >
              {([
                ["all", "All"],
                ["jobs", "Jobs"],
                ["myposts", "My posts"],
                ["mentions", "Mentions"],
              ] as ["all" | "jobs" | "myposts" | "mentions", string][]).map(([key, label]) => {
                const active = notificationFilter === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.notificationFilterChip, active && styles.notificationFilterChipActive]}
                    onPress={() => setNotificationFilter(key)}
                  >
                    <Text style={[styles.notificationFilterText, active && styles.notificationFilterTextActive]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.communityProNotificationListWrap}>
              {notificationItems.filter((item) => notificationFilter === "all" || item.category === notificationFilter).length === 0 ? (
                <View style={styles.notificationEmptyState}>
                  <Bell size={26} color={GOLD} />
                  <Text style={styles.emptySearchTitle}>No notifications here</Text>
                  <Text style={styles.emptySearchText}>New messages, jobs, post activity and mentions will appear here.</Text>
                </View>
              ) : (
                notificationItems
                  .filter((item) => notificationFilter === "all" || item.category === notificationFilter)
                  .map((item, index) => {
                    const unread = !notificationReadIds.includes(item.id);
                    const firstMediaPost = posts.find((post) => post.media.length > 0);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.communityProNotificationRow, unread && styles.communityProNotificationRowUnread]}
                        onPress={() => {
                          markNotificationRead(item.id);
                          item.action();
                        }}
                        activeOpacity={0.86}
                      >
                        <View style={[styles.notificationUnreadDot, !unread && styles.notificationUnreadDotHidden]} />
                        <View style={styles.communityProNotificationAvatarWrap}>
                          {item.type === "job" ? (
                            <View style={styles.notificationCompanyLogo}><BriefcaseBusiness size={22} color="#FFFFFF" /></View>
                          ) : item.type === "post" || item.type === "safety" ? (
                            <View style={styles.notificationCompanyLogoGold}><ShieldCheck size={22} color="#FFFFFF" /></View>
                          ) : profile.avatar ? (
                            <Image source={{ uri: profile.avatar }} style={styles.communityProNotificationAvatar} />
                          ) : (
                            <View style={styles.communityProNotificationAvatarFallback}><UserRound size={22} color="#64756E" /></View>
                          )}
                        </View>
                        <View style={styles.communityProNotificationBody}>
                          <Text style={styles.communityProNotificationText} numberOfLines={3}>
                            <Text style={styles.communityProNotificationTitle}>{item.title}</Text>{" "}{item.text}
                          </Text>
                          {(item.type === "job" || item.category === "jobs") && (
                            <TouchableOpacity style={styles.communityProNotificationButton} onPress={() => goToAppSection("jobs")}>
                              <Text style={styles.communityProNotificationButtonText}>View jobs</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <View style={styles.communityProNotificationRight}>
                          <Text style={styles.communityProNotificationTime}>{item.time}</Text>
                          <TouchableOpacity
                            style={styles.notificationMoreButton}
                            onPress={() => {
                              markNotificationRead(item.id);
                              Alert.alert("Notification", "Choose an action", [
                                { text: "Mark as read", onPress: () => markNotificationRead(item.id) },
                                { text: "Open", onPress: item.action },
                                { text: "Cancel", style: "cancel" },
                              ]);
                            }}
                          >
                            <MoreVertical size={18} color="#555" />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    );
                  })
              )}
            </View>
          </View>
        )}

        {appSection !== "notifications" && (
          <View style={styles.sectionHeader}>
            <Filter size={18} color={GOLD} />
            <Text style={styles.sectionTitle}>
              {appSection === "jobs" ? "Jobs & Groups" : appSection === "charity" ? "Charity Page" : appSection === "events" ? "Events & Reminders" : "Home Feed"} • {visibleResultCount}
            </Text>
          </View>
        )}

        {appSection !== "notifications" && visibleResultCount === 0 && (
          <LinearGradient colors={[CARD, "#F7F0DC"]} style={styles.emptySearchCard}>
            <Search size={22} color={GOLD} />
            <Text style={styles.emptySearchTitle}>{appSection === "jobs" ? "No jobs found" : appSection === "charity" ? "No charity posts found" : appSection === "events" ? "No events found" : "No posts found"}</Text>
            <Text style={styles.emptySearchText}>
              Try another keyword, clear the search bar, or switch tabs.
            </Text>
          </LinearGradient>
        )}

        {appSection !== "notifications" && filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            liked={liked.includes(post.id)}
            saved={saved.includes(post.id)}
            following={following.includes(post.authorId)}
            currentUserId={profile.id}
            onLike={() => toggleLike(post.id)}
            onSave={() => toggleSave(post.id)}
            onOpen={() => setSelectedPost(post)}
            onShare={() => sharePost(post)}
            onReport={reportPost}
            onDelete={() => deletePost(post.id)}
            onReaction={(reaction) => addReaction(post.id, reaction)}
            onRepost={() => repostPost(post)}
            onDownload={() => downloadPost(post)}
            onFollow={() => followUser(post.authorId)}
            onPlayAudio={playAudio}
            playingAudio={playingAudio}
            onApply={() => applyForJob(post)}
          />
        ))}

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomTabBarPro}>
        <BottomNavButton label="Home" active={appSection === "home"} icon={<Home size={20} color={appSection === "home" ? GREEN : "#8A8172"} />} onPress={() => goToAppSection("home")} />
        <BottomNavButton label="Jobs" active={appSection === "jobs"} icon={<BriefcaseBusiness size={20} color={appSection === "jobs" ? GREEN : "#8A8172"} />} onPress={() => goToAppSection("jobs")} />
        <BottomNavButton label="Create" active={false} featured icon={<Plus size={22} color="#FFFFFF" />} onPress={openCreatePostFlow} />
        <BottomNavButton label="Notifications" active={appSection === "notifications"} badge={unreadNotificationCount} icon={<Bell size={20} color={appSection === "notifications" ? GREEN : "#8A8172"} />} onPress={() => goToAppSection("notifications")} />
        <BottomNavButton label="Menu" active={appSection === "menu"} icon={<Menu size={20} color={appSection === "menu" ? GREEN : "#8A8172"} />} onPress={() => goToAppSection("menu")} />
      </View>


      <Modal visible={searchVisible} animationType="fade" transparent>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
          enabled
        >
          <View style={styles.modalOverlaySoft}>
            <View style={styles.searchModalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Discover</Text>
                <TouchableOpacity onPress={() => setSearchVisible(false)}>
                  <X size={24} color={GREEN} />
                </TouchableOpacity>
              </View>
              <View style={styles.searchBoxModal}>
                <Search size={18} color={GREEN} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search posts, people, jobs, charity, events..."
                  placeholderTextColor="#8A8172"
                  value={query}
                  onChangeText={setQuery}
                  autoFocus
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="search"
                  onSubmitEditing={() => runSearch()}
                />
                <TouchableOpacity style={styles.searchGoButton} onPress={() => runSearch()}>
                  <Text style={styles.searchGoText}>Go</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.searchQuickGrid}>
                {["For you", "People", "Posts", "Jobs", "Charity", "Events", "Groups"].map((item) => (
                  <TouchableOpacity key={item} style={styles.searchQuickChip} onPress={() => runSearch(item)}>
                    <Text style={styles.searchQuickText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.searchHistoryHeader}>
                <Text style={styles.searchHistoryTitle}>Recent Searches</Text>
                {searchHistory.length > 0 && (
                  <TouchableOpacity onPress={clearSearchHistory}>
                    <Text style={styles.searchHistoryClear}>Clear all</Text>
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView keyboardShouldPersistTaps="handled" style={styles.searchHistoryList}>
                {searchHistory.length === 0 ? (
                  <Text style={styles.noComments}>Your search history will appear here.</Text>
                ) : (
                  searchHistory.map((term) => (
                    <View key={term} style={styles.searchHistoryItem}>
                      <TouchableOpacity style={{ flex: 1 }} onPress={() => runSearch(term)}>
                        <Text style={styles.searchHistoryText}>{term}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteSearchHistoryItem(term)}>
                        <Trash2 size={16} color={ROSE} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
              <Text style={styles.searchHistoryTitle}>Results</Text>
              <ScrollView keyboardShouldPersistTaps="handled" style={styles.searchResultsList}>
                {filteredPosts.slice(0, 6).map((post) => (
                  <TouchableOpacity key={post.id} style={styles.searchResultCard} onPress={() => { setSelectedPost(post); setSearchVisible(false); }}>
                    <Text style={styles.searchResultTitle}>{post.title}</Text>
                    <Text style={styles.searchResultMeta}>{post.type} • {post.author}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={liveCenterVisible} animationType="slide" transparent>
        <View style={styles.liveCenterOverlay}>
          <View style={styles.liveCenterCard}>
            <View style={styles.liveCenterHeader}>
              <TouchableOpacity style={styles.liveCenterBackButton} onPress={() => setLiveCenterVisible(false)}>
                <X size={21} color={GREEN} />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.liveCenterTitle}>Live Center</Text>
                <Text style={styles.liveCenterSubtitle}>Host, join, manage guests, gifts, comments and reactions.</Text>
              </View>
            </View>

            <LinearGradient colors={[GREEN, EMERALD]} style={styles.liveCenterHero}>
              <View style={styles.liveCenterHeroTop}>
                <View style={styles.livePulseBadge}><Radio size={14} color="#FFFFFF" /><Text style={styles.livePulseText}>{isLive ? "LIVE NOW" : "READY"}</Text></View>
                <Text style={styles.liveCenterHeroCount}>{liveViewers} viewers</Text>
              </View>
              <Text style={styles.liveCenterHeroTitle}>{liveTitle}</Text>
              <Text style={styles.liveCenterHeroText}>Start a professional live room, join as viewer, invite guests, send gifts, share, and control camera/microphone inside the live room.</Text>
            </LinearGradient>

            <View style={styles.liveCenterActionGrid}>
              <TouchableOpacity style={styles.liveCenterPrimaryAction} onPress={hostLiveFromCenter}>
                <Camera size={20} color="#FFFFFF" />
                <Text style={styles.liveCenterPrimaryText}>Host Live</Text>
                <Text style={styles.liveCenterActionNote}>Camera, mic, guests</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.liveCenterSecondaryAction} onPress={joinLiveFromCenter}>
                <Play size={20} color={GREEN} />
                <Text style={styles.liveCenterSecondaryText}>Join Live</Text>
                <Text style={styles.liveCenterActionNoteDark}>Watch and request</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.liveCenterSecondaryAction} onPress={shareLive}>
                <Share2 size={20} color={GREEN} />
                <Text style={styles.liveCenterSecondaryText}>Share</Text>
                <Text style={styles.liveCenterActionNoteDark}>Invite people</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.liveCenterSecondaryAction} onPress={() => { setLiveCenterVisible(false); setContactInviteVisible(true); }}>
                <UserPlus size={20} color={GREEN} />
                <Text style={styles.liveCenterSecondaryText}>Invite</Text>
                <Text style={styles.liveCenterActionNoteDark}>Followers & contacts</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.liveCenterStatsRow}>
              <View style={styles.liveCenterStat}><Heart size={16} color={ROSE} /><Text style={styles.liveCenterStatText}>{liveLikes} likes</Text></View>
              <View style={styles.liveCenterStat}><Gift size={16} color={GOLD} /><Text style={styles.liveCenterStatText}>{liveGifts} gifts</Text></View>
              <View style={styles.liveCenterStat}><UsersRound size={16} color={GREEN} /><Text style={styles.liveCenterStatText}>{liveGuests.length} guests</Text></View>
            </View>

            <TouchableOpacity style={styles.liveCenterCloseWide} onPress={() => setLiveCenterVisible(false)}>
              <Text style={styles.liveCenterCloseText}>Not now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={messageVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
          enabled
        >
          <View style={styles.linkedMessagePage}>
            {!messageThreadOpen ? (
              <>
                <View style={styles.communityProMessageHeader}>
                  <TouchableOpacity style={styles.communityProBackButton} onPress={() => setMessageVisible(false)}>
                    <X size={24} color={TEXT} />
                  </TouchableOpacity>
                  <View style={styles.communityProMessageSearchBox}>
                    <Search size={18} color="#5F6F68" />
                    <TextInput
                      style={styles.communityProMessageSearchInput}
                      placeholder="Search messages"
                      placeholderTextColor="#7B837F"
                      value={messageSearch}
                      onChangeText={setMessageSearch}
                      returnKeyType="search"
                    />
                  </View>
                  <TouchableOpacity style={styles.communityProMoreButton} onPress={() => setMessageOptionsVisible(true)}>
                    <MoreVertical size={22} color={TEXT} />
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.communityProMessageFilters} contentContainerStyle={styles.communityProMessageFiltersContent}>
                  {([
                    ["all", "Focused"],
                    ["followers", "Followers"],
                    ["requests", "Requests"],
                    ["media", "Media"],
                    ["unread", "Unread"],
                    ["drafts", "Drafts"],
                    ["mail", "Mail"],
                  ] as const).map(([key, label]) => {
                    const active = messageFilter === key;
                    return (
                      <TouchableOpacity key={label} style={[styles.communityProFilterChip, active && styles.communityProFilterChipActive]} onPress={() => setMessageFilter(key)}>
                        <Text style={[styles.communityProFilterText, active && styles.communityProFilterTextActive]}>{label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <ScrollView style={styles.communityProInboxList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  {allConversationNames.filter((name) => name.toLowerCase().includes(messageSearch.trim().toLowerCase())).map((name) => {
                    const last = messages.find((item) => item.recipient === name);
                    const unread = messages.some((item) => item.recipient === name && item.status === "received");
                    const request = messages.some((item) => item.recipient === name && item.status === "request");
                    const hasMedia = messages.some((item) => item.recipient === name && item.media.length > 0);
                    const isMailThread = name.includes("mail");
                    if (messageFilter === "followers" && !followers.includes(name)) return null;
                    if (messageFilter === "requests" && !request) return null;
                    if (messageFilter === "media" && !hasMedia) return null;
                    if (messageFilter === "unread" && !unread) return null;
                    if (messageFilter === "drafts" && messages.some((item) => item.recipient === name)) return null;
                    if (messageFilter === "mail" && !isMailThread) return null;
                    return (
                      <TouchableOpacity key={name} style={[styles.communityProConversationRow, unread && styles.communityProConversationUnread]} onPress={() => { setSelectedMessageRecipient(name); setMessageThreadOpen(true); }}>
                        <View style={styles.communityProAvatarWrap}>
                          <View style={styles.communityProConversationAvatar}><UserRound size={24} color={GREEN} /></View>
                          {followers.includes(name) && <View style={styles.communityProOnlineDot} />}
                        </View>
                        <View style={styles.communityProConversationBody}>
                          <View style={styles.communityProConversationTopLine}>
                            <Text numberOfLines={1} style={styles.communityProConversationName}>{followerDisplayName(name)}</Text>
                            <Text style={styles.communityProConversationDate}>{last?.time || "Now"}</Text>
                          </View>
                          <Text numberOfLines={2} style={styles.communityProConversationPreview}>{last ? (last.text || `${last.media.length} attachment(s)`) : followers.includes(name) ? "Follower • start a professional conversation" : "Suggested contact • send a request"}</Text>
                          {request && <Text style={styles.communityProRequestLabel}>Message request</Text>}
                        </View>
                        {unread && <View style={styles.communityProUnreadBadge}><Text style={styles.communityProUnreadText}>1</Text></View>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <TouchableOpacity style={styles.communityProComposeFab} onPress={() => { setMessageRecipientPickerVisible(true); setMessageRecipientSearch(""); }}>
                  <Plus size={27} color="#FFFFFF" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.communityProThreadHeader}>
                  <TouchableOpacity style={styles.communityProBackButton} onPress={() => setMessageThreadOpen(false)}>
                    <X size={24} color={TEXT} />
                  </TouchableOpacity>
                  <View style={styles.communityProThreadAvatar}><UserRound size={24} color={GREEN} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.communityProThreadName}>{followerDisplayName(selectedMessageRecipient)}</Text>
                    <Text style={styles.communityProThreadStatus}>{followers.includes(selectedMessageRecipient) ? "Connected • Active now" : "Message request • Not yet connected"}</Text>
                  </View>
                  <TouchableOpacity style={styles.communityProMoreButton} onPress={() => setChatOptionsVisible(true)}>
                    <MoreVertical size={22} color={TEXT} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.communityProMoreButton} onPress={() => Alert.alert("Starred", "Conversation starred.")}>
                    <Star size={21} color={GOLD} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.communityProThreadScroll} contentContainerStyle={styles.communityProThreadContent} keyboardShouldPersistTaps="handled">
                  <View style={styles.communityProProfileIntro}>
                    <View style={styles.communityProProfileBigAvatar}><UserRound size={34} color={GREEN} /></View>
                    <Text style={styles.communityProProfileName}>{followerDisplayName(selectedMessageRecipient)}</Text>
                    <Text style={styles.communityProProfileBio}>{followers.includes(selectedMessageRecipient) ? "Follower in your community network" : "Suggested person. Your message will be sent as a request."}</Text>
                  </View>
                  {messages.filter((item) => item.recipient === selectedMessageRecipient).length === 0 ? (
                    <Text style={styles.communityProThreadEmpty}>No messages yet. Send a note, image, video, voice note, or file.</Text>
                  ) : messages.filter((item) => item.recipient === selectedMessageRecipient).map((item) => {
                    const incoming = item.status === "received";
                    return (
                      <View key={item.id} style={[styles.communityProMessageBubble, incoming && styles.communityProMessageBubbleIncoming]}>
                        <Text style={styles.communityProBubbleSender}>{incoming ? followerDisplayName(selectedMessageRecipient) : "You"} · {item.time}</Text>
                        {!!item.text && <Text style={styles.communityProBubbleText}>{item.text}</Text>}
                        {item.media.map((media) => <Text key={media.id} style={styles.communityProAttachment}>📎 {media.name || media.type}</Text>)}
                        <TouchableOpacity style={styles.communityProDeleteMessage} onPress={() => deleteMessageItem(item.id)}><Trash2 size={14} color={ROSE} /></TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>

                {messageMedia.length > 0 && (
                  <View style={styles.communityProPendingMediaRow}>{messageMedia.map((media) => <Text key={media.id} style={styles.communityProPendingMedia}>📎 {media.name || media.type}</Text>)}</View>
                )}
                <View style={styles.communityProComposerBar}>
                  <TouchableOpacity style={styles.communityProComposerPlus} onPress={pickMessageMedia}><Plus size={22} color={GREEN} /></TouchableOpacity>
                  <TouchableOpacity style={styles.communityProComposerPlus} onPress={pickMessageImageOrVideo}><ImageIcon size={21} color={GREEN} /></TouchableOpacity>
                  <TextInput
                    style={styles.communityProComposerInput}
                    placeholder="Write a message..."
                    placeholderTextColor="#8A8172"
                    value={messageText}
                    onChangeText={setMessageText}
                    multiline
                    textAlignVertical="top"
                  />
                  <TouchableOpacity style={styles.communityProVoiceButton} onPress={simulateReceivedMessage}><Mic size={22} color={GREEN} /></TouchableOpacity>
                  <TouchableOpacity style={styles.communityProSendButton} onPress={sendCommunityMessage}><Send size={19} color="#FFFFFF" /></TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={messageOptionsVisible} animationType="fade" transparent>
        <View style={styles.messageMenuOverlay}>
          <TouchableOpacity style={styles.messageMenuBackdrop} onPress={() => setMessageOptionsVisible(false)} />
          <View style={styles.messageActionSheet}>
            <View style={styles.sheetHandle} />
            <TouchableOpacity style={styles.messageActionRow} onPress={openManageConversations}>
              <FileText size={22} color="#444" />
              <Text style={styles.messageActionText}>Manage conversations</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageActionRow} onPress={() => { setMessageOptionsVisible(false); setDataPrivacyVisible(true); }}>
              <Settings size={22} color="#444" />
              <Text style={styles.messageActionText}>Manage settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageActionRow} onPress={() => { setMessageFilter("requests"); setMessageOptionsVisible(false); }}>
              <MessageCircle size={22} color="#444" />
              <Text style={styles.messageActionText}>Message requests</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageActionRow} onPress={() => { setMessageFilter("unread"); setMessageOptionsVisible(false); }}>
              <Bell size={22} color="#444" />
              <Text style={styles.messageActionText}>Unread messages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageActionRow} onPress={() => { setMessageFilter("mail"); setMessageOptionsVisible(false); }}>
              <Send size={22} color="#444" />
              <Text style={styles.messageActionText}>Mail</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={manageConversationsVisible} animationType="slide" transparent>
        <View style={styles.manageConversationsOverlay}>
          <SafeAreaView style={styles.manageConversationsPage} edges={["top", "left", "right"]}>
            <View style={styles.manageConversationsHeader}>
              <TouchableOpacity style={styles.communityProBackButton} onPress={() => setManageConversationsVisible(false)}>
                <X size={24} color={TEXT} />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.manageConversationsTitle}>Manage conversations</Text>
                <Text style={styles.manageConversationsSubtitle}>Select conversations, then mark unread, archive, or delete.</Text>
              </View>
              <TouchableOpacity style={styles.manageSelectAllButton} onPress={selectAllManagedConversations}>
                <Text style={styles.manageSelectAllText}>
                  {selectedManagedConversations.length === allConversationNames.length ? "Clear" : "All"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.manageBulkActions}>
              <TouchableOpacity style={styles.manageBulkButton} onPress={markSelectedConversationsUnread}>
                <MessageCircle size={18} color={GREEN} />
                <Text style={styles.manageBulkText}>Mark unread</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.manageBulkButton} onPress={archiveSelectedConversations}>
                <Download size={18} color={GREEN} />
                <Text style={styles.manageBulkText}>Archive</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.manageBulkButtonDanger} onPress={deleteSelectedConversations}>
                <Trash2 size={18} color="#FFFFFF" />
                <Text style={styles.manageBulkTextDanger}>Delete</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.manageSelectedCount}>
              {selectedManagedConversations.length} selected
            </Text>

            <ScrollView style={styles.manageConversationList} showsVerticalScrollIndicator={false}>
              {allConversationNames.map((name) => {
                const selected = selectedManagedConversations.includes(name);
                const last = messages.find((item) => item.recipient === name);
                const unread = messages.some((item) => item.recipient === name && item.status === "received");
                const archived = archivedConversations.includes(name);
                return (
                  <TouchableOpacity
                    key={name}
                    style={[styles.manageConversationRow, selected && styles.manageConversationRowSelected]}
                    onPress={() => toggleManagedConversation(name)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.manageCheckCircle, selected && styles.manageCheckCircleActive]}>
                      {selected && <Text style={styles.manageCheckText}>✓</Text>}
                    </View>
                    <View style={styles.manageConversationAvatar}>
                      <UserRound size={22} color={GREEN} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.manageConversationTop}>
                        <Text numberOfLines={1} style={styles.manageConversationName}>{followerDisplayName(name)}</Text>
                        {unread && <View style={styles.manageUnreadDot} />}
                      </View>
                      <Text numberOfLines={1} style={styles.manageConversationPreview}>
                        {archived ? "Archived conversation" : last ? (last.text || `${last.media.length} attachment(s)`) : "No recent message"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal visible={chatOptionsVisible} animationType="fade" transparent>
        <View style={styles.messageMenuOverlay}>
          <TouchableOpacity style={styles.messageMenuBackdrop} onPress={() => setChatOptionsVisible(false)} />
          <View style={styles.messageActionSheet}>
            <View style={styles.sheetHandle} />
            <TouchableOpacity style={styles.messageActionRow} onPress={moveConversationToOther}>
              <FileText size={23} color="#444" />
              <Text style={styles.messageActionText}>Move to Other</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageActionRow} onPress={labelConversationAsJob}>
              <Bookmark size={23} color="#444" />
              <Text style={styles.messageActionText}>Label as jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageActionRow} onPress={markConversationUnread}>
              <MessageCircle size={23} color="#444" />
              <Text style={styles.messageActionText}>Mark as unread</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageActionRow} onPress={() => { toggleConversationList(setStarredConversations, selectedMessageRecipient); setChatOptionsVisible(false); }}>
              <Star size={23} color="#444" />
              <Text style={styles.messageActionText}>{starredConversations.includes(selectedMessageRecipient) ? "Remove star" : "Star"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageActionRow} onPress={() => { toggleConversationList(setMutedConversations, selectedMessageRecipient); setChatOptionsVisible(false); }}>
              <Bell size={23} color="#444" />
              <Text style={styles.messageActionText}>{mutedConversations.includes(selectedMessageRecipient) ? "Unmute" : "Mute"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageActionRow} onPress={archiveConversation}>
              <Download size={23} color="#444" />
              <Text style={styles.messageActionText}>{archivedConversations.includes(selectedMessageRecipient) ? "Unarchive" : "Archive"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageActionRow} onPress={reportOrBlockConversation}>
              <Flag size={23} color="#444" />
              <Text style={styles.messageActionText}>{blockedConversations.includes(selectedMessageRecipient) ? "Unblock" : "Report / Block"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageActionRow} onPress={deleteConversation}>
              <Trash2 size={23} color="#444" />
              <Text style={styles.messageActionText}>Delete conversation</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageActionRow} onPress={() => { setChatOptionsVisible(false); setDataPrivacyVisible(true); }}>
              <Settings size={23} color="#444" />
              <Text style={styles.messageActionText}>Manage settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={dataPrivacyVisible} animationType="slide" transparent>
        <View style={styles.privacyPageOverlay}>
          <SafeAreaView style={styles.privacyPageCard} edges={["top", "left", "right"]}>
            <View style={styles.privacyHeader}>
              <TouchableOpacity style={styles.communityProBackButton} onPress={() => setDataPrivacyVisible(false)}>
                <X size={24} color={TEXT} />
              </TouchableOpacity>
              <Text style={styles.privacyTitle}>Data privacy</Text>
              <TouchableOpacity style={styles.privacyHelpButton} onPress={() => Alert.alert("Help", "Review and control your message, privacy, invitations, jobs and data preferences.")}>
                <HelpCircle size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <PrivacySection title="Manage your data">
                <PrivacyAction title="Manage data permissions" onPress={() => Alert.alert("Data permissions", "Camera, microphone, gallery, files and notification permissions are controlled here.")} />
                <PrivacyAction title="Download your data" onPress={() => Alert.alert("Download data", "Your community posts, messages, drafts and settings will be prepared for export.")} />
                <PrivacySwitch title="Manage cookie preferences" value={cookiePreferences} onValueChange={setCookiePreferences} />
                <PrivacyAction title="Clear search history" onPress={clearSearchHistory} />
                <PrivacyAction title="Personal demographic info" onPress={() => Alert.alert("Personal info", "Update your profile details from your profile page.")} />
                <PrivacySwitch title="Policy and academic research" value={researchInvites} onValueChange={setResearchInvites} />
                <PrivacySwitch title="Data for Generative AI Improvement" value={generativeAIData} onValueChange={setGenerativeAIData} />
              </PrivacySection>
              <PrivacySection title="Who can reach you">
                <PrivacyAction title="Invitations to connect" onPress={openContactInvites} />
                <PrivacyAction title="Invitations from your network" onPress={openContactInvites} />
                <PrivacyAction title="Messages you receive" onPress={() => setMessageFilter("requests")} />
                <PrivacySwitch title="Research invitations" value={researchInvites} onValueChange={setResearchInvites} />
                <PrivacySwitch title="Community marketing emails and promotions" value={notifyMessages} onValueChange={(value) => saveSettings({ notifyMessages: value })} />
              </PrivacySection>
              <PrivacySection title="Messaging experience">
                <PrivacySwitch title="Focused Inbox" value={focusedInbox} onValueChange={setFocusedInbox} />
                <PrivacySwitch title="Delivery and typing indicators" value={typingIndicators} onValueChange={setTypingIndicators} />
                <PrivacySwitch title="Messaging suggestions" value={messageSuggestions} onValueChange={setMessageSuggestions} />
                <PrivacySwitch title="Message nudges" value={messageNudges} onValueChange={setMessageNudges} />
                <PrivacySwitch title="Harmful message detection" value={harmfulDetection} onValueChange={setHarmfulDetection} />
              </PrivacySection>
              <PrivacySection title="Job seeking preferences">
                <PrivacyAction title="Resumes and job applications data" onPress={() => openDashboard("applications")} />
                <PrivacySwitch title="Share your profile when you click Apply for a job" value={shareProfileOnApply} onValueChange={setShareProfileOnApply} />
                <PrivacySwitch title="Signal your interest to recruiters at companies you've created job alerts for" value={recruiterInterest} onValueChange={setRecruiterInterest} />
                <PrivacyAction title="Stored job applicant accounts" onPress={() => openDashboard("applications")} />
              </PrivacySection>
              <PrivacySection title="Other applications">
                <PrivacyAction title="Permitted services" onPress={() => Alert.alert("Permitted services", "Review services connected to this community page.")} />
                <PrivacySwitch title="Microsoft Word" value={dataSaver} onValueChange={(value) => saveSettings({ dataSaver: value })} />
              </PrivacySection>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal visible={messageRecipientPickerVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
          enabled
        >
          <View style={styles.recipientPickerOverlay}>
            <View style={styles.recipientPickerSheet}>
              <View style={styles.recipientPickerHeader}>
                <TouchableOpacity onPress={() => setMessageRecipientPickerVisible(false)} style={styles.communityProBackButton}>
                  <X size={24} color={TEXT} />
                </TouchableOpacity>
                <Text style={styles.recipientPickerTitle}>New message</Text>
              </View>

              <View style={styles.recipientSearchRow}>
                <Text style={styles.recipientToLabel}>To:</Text>
                <TextInput
                  style={styles.recipientSearchInput}
                  placeholder="Type a name or search followers"
                  placeholderTextColor="#7B837F"
                  value={messageRecipientSearch}
                  onChangeText={setMessageRecipientSearch}
                  autoFocus
                />
              </View>

              <Text style={styles.recipientSuggestedTitle}>Suggested followers</Text>
              <ScrollView style={styles.recipientList} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {[...new Set([...followers, ...following, ...contactInvites.map((item) => item.name.toLowerCase().replace(/\s+/g, "-")), "aisha", "maryam", "fatima", "yusuf-careers", "amina-charity"])].filter((name) => followerDisplayName(name).toLowerCase().includes(messageRecipientSearch.trim().toLowerCase())).map((name) => (
                  <TouchableOpacity
                    key={name}
                    style={styles.recipientRow}
                    onPress={() => {
                      setSelectedMessageRecipient(name);
                      setMessageRecipientPickerVisible(false);
                      setMessageVisible(true);
                      setMessageThreadOpen(true);
                    }}
                  >
                    <View style={styles.recipientAvatar}><UserRound size={24} color={GREEN} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recipientName}>{followerDisplayName(name)}</Text>
                      <Text style={styles.recipientMeta}>{followers.includes(name) ? "Follower · can receive direct messages" : "Suggested · message will be a request"}</Text>
                    </View>
                    <Send size={17} color={GREEN} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={menuVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
          enabled
        >
          <View style={styles.modalOverlaySoftMenu}>
            <View style={styles.menuModalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Menu</Text>
                <TouchableOpacity onPress={() => setMenuVisible(false)}>
                  <X size={24} color={GREEN} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.menuScrollContent}>
                <Text style={styles.menuSectionLabel}>Suggested followers</Text>
                {[
                  { id: "amina", name: "Amina Charity", note: "Mosque and orphan support" },
                  { id: "yusuf", name: "Yusuf Careers", note: "Jobs and mentorship" },
                  { id: "maryam-events", name: "Maryam Events", note: "Classes and community programs" },
                ].map((person) => {
                  const isFollowing = following.includes(person.id);
                  return (
                    <View key={person.id} style={styles.suggestedFollowerRow}>
                      <View style={styles.suggestedAvatar}><UserRound size={17} color={GREEN} /></View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suggestedName}>{person.name}</Text>
                        <Text style={styles.suggestedNote}>{person.note}</Text>
                      </View>
                      <TouchableOpacity style={[styles.followSmallButton, isFollowing && styles.followSmallButtonActive]} onPress={() => followUser(person.id)}>
                        <Text style={[styles.followSmallText, isFollowing && styles.followSmallTextActive]}>{isFollowing ? "Following" : "Follow"}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                <Text style={styles.menuSectionLabel}>Pages & tools</Text>
                <View style={styles.menuGrid}>
                  <TouchableOpacity style={[styles.menuTile, styles.menuTileImportant]} onPress={openCreatePostFlow}><Plus size={20} color={GREEN} /><Text style={styles.menuTileText}>Create Post</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.menuTile, styles.menuTileImportant]} onPress={openMessagesCenter}><MessageSquareText size={20} color={GREEN} /><Text style={styles.menuTileText}>Messages</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.menuTile} onPress={() => { setMenuVisible(false); goToAppSection("charity"); }}><HandHeart size={20} color={GREEN} /><Text style={styles.menuTileText}>Charity</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.menuTile} onPress={() => { setMenuVisible(false); goToAppSection("events"); }}><CalendarDays size={20} color={GREEN} /><Text style={styles.menuTileText}>Events</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.menuTile} onPress={() => { setMenuVisible(false); setProfileVisible(true); }}><UserRound size={20} color={GREEN} /><Text style={styles.menuTileText}>Profile</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.menuTile} onPress={() => { setMenuVisible(false); openDashboard("followers"); }}><Users size={20} color={GREEN} /><Text style={styles.menuTileText}>Followers</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.menuTile} onPress={() => { setMenuVisible(false); openDashboard("groups"); }}><UsersRound size={20} color={GREEN} /><Text style={styles.menuTileText}>Groups</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.menuTile} onPress={() => { setMenuVisible(false); openDashboard("posts"); }}><FileText size={20} color={GREEN} /><Text style={styles.menuTileText}>My Posts</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.menuTile} onPress={() => { setMenuVisible(false); setCreateGroupVisible(true); }}><Plus size={20} color={GREEN} /><Text style={styles.menuTileText}>Create Group</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.menuTile} onPress={() => { setMenuVisible(false); openLiveHost(); }}><Radio size={20} color={GREEN} /><Text style={styles.menuTileText}>Host Live</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.menuTile} onPress={() => { setMenuVisible(false); openLiveViewer(); }}><Play size={20} color={GREEN} /><Text style={styles.menuTileText}>Join Live</Text></TouchableOpacity>
                </View>

                <Text style={styles.menuSectionLabel}>Settings</Text>
                <View style={styles.settingsListCard}>
                  <SettingSwitchRow title="Post notifications" subtitle="New posts, replies and likes" value={notifyPosts} onValueChange={(value) => saveSettings({ notifyPosts: value })} />
                  <SettingSwitchRow title="Message notifications" subtitle="Chats and message requests" value={notifyMessages} onValueChange={(value) => saveSettings({ notifyMessages: value })} />
                  <SettingSwitchRow title="Live reminders" subtitle="Host and follower live alerts" value={notifyLives} onValueChange={(value) => saveSettings({ notifyLives: value })} />
                  <SettingSwitchRow title="Private profile" subtitle="Approve followers before they see your posts" value={privateProfile} onValueChange={(value) => saveSettings({ privateProfile: value })} />
                  <SettingSwitchRow title="Community safety mode" subtitle="Hide harmful or disrespectful content" value={safeMode} onValueChange={(value) => saveSettings({ safeMode: value })} />
                  <SettingSwitchRow title="Data saver" subtitle="Reduce video and media loading" value={dataSaver} onValueChange={(value) => saveSettings({ dataSaver: value })} />
                  <TouchableOpacity style={styles.settingsListRow} onPress={() => { saveSettings({ notifyPosts: true, notifyMessages: true, notifyLives: true, privateProfile: false, safeMode: true, dataSaver: false }); Alert.alert("Settings Reset", "Default settings have been restored."); }}>
                    <RotateCcw size={16} color={GREEN} />
                    <Text style={styles.settingsListText}>Reset settings</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.settingsListRow} onPress={clearSearchHistory}>
                    <Trash2 size={16} color={GREEN} />
                    <Text style={styles.settingsListText}>Clear search history</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.settingsListRow} onPress={() => Alert.alert("Drafts", postDrafts.length === 0 ? "No saved drafts yet." : `${postDrafts.length} draft(s) saved.`)}>
                    <Bookmark size={16} color={GREEN} />
                    <Text style={styles.settingsListText}>Saved drafts</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.settingsListRow} onPress={() => { setMenuVisible(false); setProfileVisible(true); }}>
                    <UserRound size={16} color={GREEN} />
                    <Text style={styles.settingsListText}>Account</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.settingsListRow} onPress={() => saveSettings({ privateProfile: !privateProfile })}>
                    <ShieldCheck size={16} color={GREEN} />
                    <Text style={styles.settingsListText}>Privacy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.settingsListRow} onPress={() => saveSettings({ safeMode: !safeMode })}>
                    <Filter size={16} color={GREEN} />
                    <Text style={styles.settingsListText}>Content preferences</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.settingsListRow} onPress={() => openDashboard("followers")}>
                    <ShieldCheck size={16} color={GREEN} />
                    <Text style={styles.settingsListText}>Security</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.settingsListRow} onPress={() => { clearSearchHistory(); setPostDrafts([]); AsyncStorage.removeItem(STORAGE_DRAFTS); Alert.alert("Storage cleared", "Search history and drafts have been cleared."); }}>
                    <Download size={16} color={GREEN} />
                    <Text style={styles.settingsListText}>Storage and cache</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.settingsListRow} onPress={() => saveSettings({ dataSaver: !dataSaver })}>
                    <Eye size={16} color={GREEN} />
                    <Text style={styles.settingsListText}>Accessibility</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.settingsListRow} onPress={() => Alert.alert("Blocked followers", blockedFollowers.length === 0 ? "You have no blocked followers." : blockedFollowers.join(", "))}>
                    <ShieldCheck size={16} color={GREEN} />
                    <Text style={styles.settingsListText}>Blocked followers</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.settingsListRow} onPress={() => Alert.alert("Help and support", "Report a problem, community rules, privacy help, and account support.")}>
                    <HelpCircle size={16} color={GREEN} />
                    <Text style={styles.settingsListText}>Help and support</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={liveVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
          enabled
        >
          <View style={[styles.liveModalOverlay, liveFullscreen && styles.liveModalOverlayFullscreen]}>
            <View style={[styles.liveRoom, liveFullscreen && styles.liveRoomFullscreen]}>
              <View style={styles.liveHeader}>
                <View style={styles.liveHeaderTitleBlock}>
                  <Text style={styles.liveRoomTitle}>
                    {liveMode === "host" ? "Host Live Stream" : "Live Room"}
                  </Text>
                  <Text style={styles.liveRoomSub}>{liveTitle}</Text>
                </View>

                <View style={styles.liveHeaderActions}>
                  <TouchableOpacity
                    style={styles.liveHeaderButton}
                    onPress={() => setLiveFullscreen((prev) => !prev)}
                    accessibilityLabel={liveFullscreen ? "Exit full screen" : "Open full screen"}
                  >
                    {liveFullscreen ? (
                      <Minimize2 size={19} color={GREEN} />
                    ) : (
                      <Maximize2 size={19} color={GREEN} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.liveHeaderButton}
                    onPress={() => setLiveMenuVisible((prev) => !prev)}
                    accessibilityLabel="Open live menu"
                  >
                    <Menu size={20} color={GREEN} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.liveCloseButton}
                    onPress={() => {
                      if (isLive) {
                        endLive();
                        return;
                      }

                      setLiveVisible(false);
                      setLiveFullscreen(false);
                      setLiveMenuVisible(true);
                    }}
                  >
                    <X size={21} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                style={styles.liveContentScroll}
                contentContainerStyle={styles.liveContentScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                automaticallyAdjustKeyboardInsets
              >
                <View style={styles.liveTopMetricsRow}>
                  <View style={styles.liveMetricPillCompact}>
                    <Eye size={13} color={GREEN} />
                    <Text style={styles.liveMetricText}>{liveViewers} viewers</Text>
                  </View>
                  <View style={styles.liveMetricPillCompact}>
                    <Heart size={13} color={ROSE} />
                    <Text style={styles.liveMetricText}>{liveLikes} likes</Text>
                  </View>
                  <View style={styles.liveMetricPillCompact}>
                    <Gift size={13} color={GOLD} />
                    <Text style={styles.liveMetricText}>{liveGifts} gifts</Text>
                  </View>
                </View>

                <View style={[styles.cameraStage, liveFullscreen && styles.cameraStageFullscreen]}>
                  {liveMode === "host" && cameraEnabled ? (
                    <CameraView style={styles.cameraPreview} facing={cameraFacing} />
                  ) : (
                    <LinearGradient colors={["#0B3D32", "#176B55"]} style={styles.viewerStage}>
                      {profile.avatar ? (
                        <Image source={{ uri: profile.avatar }} style={styles.liveAvatar} />
                      ) : (
                        <UserRound size={54} color={GOLD} />
                      )}

                      <Text style={styles.viewerStageTitle}>
                        {liveMode === "host" ? "Camera is Off" : `${profile.name} is watching`}
                      </Text>
                      <Text style={styles.viewerStageSub}>
                        {isLive ? "Live stream is active" : "Start live to begin broadcasting"}
                      </Text>
                    </LinearGradient>
                  )}

                  <View style={styles.liveOverlayTop}>
                    <View style={styles.liveBadge}>
                      <Radio size={12} color="#FFFFFF" />
                      <Text style={styles.liveBadgeText}>{isLive ? "LIVE" : "PREVIEW"}</Text>
                    </View>
                    <View style={styles.liveQualityBadge}>
                      <ShieldCheck size={12} color="#FFFFFF" />
                      <Text style={styles.liveBadgeText}>Safe room</Text>
                    </View>
                  </View>

                  <View style={styles.livePinnedNotice}>
                    <MessageSquareText size={13} color="#FFFFFF" />
                    <Text numberOfLines={2} style={styles.livePinnedNoticeText}>{livePinnedNotice}</Text>
                  </View>

                  <View style={styles.liveQuickRail}>
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled
                      contentContainerStyle={styles.liveQuickRailContent}
                    >
                      {(Object.keys(LIVE_REACTIONS) as LiveReaction[]).map((item) => (
                        <TouchableOpacity
                          key={item}
                          style={styles.liveQuickButton}
                          onPress={() => addLiveReaction(item)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.liveQuickEmoji}>{LIVE_REACTIONS[item]}</Text>
                          <Text style={styles.liveQuickCount}>{liveReactions[item]}</Text>
                        </TouchableOpacity>
                      ))}

                      <View style={styles.liveQuickDivider} />

                      {LIVE_GIFTS.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.liveQuickButtonGold}
                          onPress={() => sendLiveGift(item)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.liveQuickEmoji}>{item.icon}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <View style={styles.liveControlPanel}>
                  <View style={styles.liveControlRow}>
                    {liveMode === "host" && (
                      <>
                        <TouchableOpacity
                          style={styles.liveCircleButton}
                          onPress={() => setCameraFacing((prev) => (prev === "front" ? "back" : "front"))}
                        >
                          <RotateCcw size={17} color={GREEN} />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.liveCircleButton}
                          onPress={() => setCameraEnabled((prev) => !prev)}
                        >
                          {cameraEnabled ? <Camera size={17} color={GREEN} /> : <VideoOff size={17} color={ROSE} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.liveCircleButton}
                          onPress={() => setMicEnabled((prev) => !prev)}
                        >
                          {micEnabled ? <Mic size={17} color={GREEN} /> : <MicOff size={17} color={ROSE} />}
                        </TouchableOpacity>
                      </>
                    )}

                    <TouchableOpacity style={styles.liveCircleButton} onPress={shareLive}>
                      <Share2 size={17} color={GREEN} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.liveCircleButton} onPress={inviteGuest}>
                      <UserPlus size={17} color={GREEN} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.liveCircleButton, liveChatLocked && styles.liveCircleButtonActive]}
                      onPress={() => setLiveChatLocked((prev) => !prev)}
                    >
                      <ShieldCheck size={17} color={liveChatLocked ? "#FFFFFF" : GREEN} />
                    </TouchableOpacity>

                    {liveMode === "viewer" && (
                      <TouchableOpacity style={styles.liveJoinButton} onPress={requestToJoinLive}>
                        <PhoneCall size={15} color="#FFFFFF" />
                        <Text style={styles.liveJoinText}>Request</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {liveMode === "host" && (
                    <TouchableOpacity
                      style={[styles.goLiveButton, isLive && styles.endLiveButton]}
                      onPress={isLive ? endLive : startLive}
                    >
                      {isLive ? <PhoneOff size={17} color="#FFFFFF" /> : <Radio size={17} color="#FFFFFF" />}
                      <Text style={styles.goLiveText}>{isLive ? "End Live Stream" : "Go Live Now"}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.liveMenuCard}>
                  <TouchableOpacity
                    style={styles.liveMenuToggle}
                    onPress={() => setLiveMenuVisible((prev) => !prev)}
                  >
                    <View style={styles.liveMenuToggleLeft}>
                      <Settings size={16} color={GREEN} />
                      <View>
                        <Text style={styles.liveMenuTitle}>Activity center</Text>
                        <Text style={styles.liveMenuSubtitle}>Guests, requests, tools and comments in one scroll</Text>
                      </View>
                    </View>
                    <Text style={styles.liveMenuState}>{liveMenuVisible ? "Hide" : "Open"}</Text>
                  </TouchableOpacity>

                  {liveMenuVisible && (
                    <ScrollView
                      style={styles.liveBottomPanel}
                      contentContainerStyle={styles.liveBottomPanelContent}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                    >
                      <View style={styles.liveUtilityRow}>
                        <TouchableOpacity style={styles.liveUtilityChip} onPress={inviteGuest}>
                          <UserPlus size={13} color={GREEN} />
                          <Text style={styles.liveUtilityText}>Invite</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.liveUtilityChip} onPress={() => setLiveChatLocked((prev) => !prev)}>
                          <ShieldCheck size={13} color={GREEN} />
                          <Text style={styles.liveUtilityText}>{liveChatLocked ? "Open chat" : "Pause chat"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.liveUtilityChip} onPress={clearLiveChat}>
                          <Trash2 size={13} color={GREEN} />
                          <Text style={styles.liveUtilityText}>Clear</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.liveGuestHeader}>
                        <Text style={styles.livePanelTitle}>Guests</Text>
                        <Text style={styles.liveSectionCounter}>{liveGuests.length}</Text>
                      </View>

                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.guestScrollRow}>
                        {liveGuests.map((guest, index) => (
                          <View key={`${guest}-${index}`} style={styles.guestChip}>
                            <Crown size={12} color={GOLD} />
                            <Text style={styles.guestText}>{guest}</Text>
                          </View>
                        ))}
                      </ScrollView>

                      {liveMode === "host" && joinRequests.length > 0 && (
                        <>
                          <View style={styles.liveGuestHeader}>
                            <Text style={styles.livePanelTitle}>Join requests</Text>
                            <Text style={styles.liveSectionCounter}>{joinRequests.length}</Text>
                          </View>

                          {joinRequests.map((name) => (
                            <View key={name} style={styles.joinRequestCard}>
                              <UserRound size={17} color={GREEN} />
                              <Text style={styles.joinRequestName}>{name}</Text>

                              <TouchableOpacity style={styles.acceptButton} onPress={() => acceptJoinRequest(name)}>
                                <UserCheck size={14} color="#FFFFFF" />
                                <Text style={styles.acceptButtonText}>Accept</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </>
                      )}

                      <View style={styles.liveGuestHeader}>
                        <Text style={styles.livePanelTitle}>Live comments</Text>
                        <Text style={styles.liveSectionCounter}>{liveComments.length}</Text>
                      </View>

                      <View style={styles.liveCommentsList}>
                        {liveComments.map((comment) => (
                          <View key={comment.id} style={styles.liveCommentCard}>
                            <Text style={styles.liveCommentAuthor}>{comment.author}</Text>
                            <Text style={styles.liveCommentText}>{comment.text}</Text>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  )}
                </View>
              </ScrollView>

              <View style={styles.liveCommentInputRow}>
                <TextInput
                  style={styles.liveCommentInput}
                  placeholder={liveChatLocked ? "Chat is paused by host" : "Comment on live..."}
                  placeholderTextColor="#8A8172"
                  value={liveCommentText}
                  onChangeText={setLiveCommentText}
                  editable={!liveChatLocked}
                  returnKeyType="send"
                  onSubmitEditing={sendLiveComment}
                />

                <TouchableOpacity style={styles.liveCommentSend} onPress={sendLiveComment}>
                  <Send size={18} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.liveCommentSendGold} onPress={() => addLiveReaction("heart")}>
                  <Heart size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={createGroupVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
          enabled
        >
          <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Professional Group</Text>
              <TouchableOpacity onPress={() => setCreateGroupVisible(false)}>
                <X size={24} color={GREEN} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              automaticallyAdjustKeyboardInsets
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text style={styles.inputLabel}>Group Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Example: Nurses Career Circle"
                placeholderTextColor="#8A8172"
                value={newGroupName}
                onChangeText={setNewGroupName}
                returnKeyType="next"
              />

              <Text style={styles.inputLabel}>Profession / Circle</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Example: Nursing, Tech, Teaching, Business"
                placeholderTextColor="#8A8172"
                value={newGroupProfession}
                onChangeText={setNewGroupProfession}
                returnKeyType="next"
              />

              <Text style={styles.inputLabel}>Purpose</Text>
              <TextInput
                style={styles.modalTextAreaSmall}
                placeholder="Describe what people will learn, share or discuss..."
                placeholderTextColor="#8A8172"
                multiline
                value={newGroupDescription}
                onChangeText={setNewGroupDescription}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.publishButton}
                onPress={createJobGroup}
              >
                <Send size={18} color="#FFFFFF" />
                <Text style={styles.publishText}>Create Group</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>


      <Modal visible={contactInviteVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
          enabled
        >
          <View style={styles.modalOverlay}>
            <View style={styles.contactInviteCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Contacts & Invitations</Text>
                  <Text style={styles.contactInviteSubtitle}>Send follow requests or invite contacts to join you.</Text>
                </View>
                <TouchableOpacity onPress={() => setContactInviteVisible(false)}>
                  <X size={24} color={GREEN} />
                </TouchableOpacity>
              </View>

              <View style={styles.contactSearchBox}>
                <Search size={17} color={GREEN} />
                <TextInput
                  style={styles.contactSearchInput}
                  placeholder="Search contacts, followers or phone..."
                  placeholderTextColor="#8A8172"
                  value={contactSearch}
                  onChangeText={setContactSearch}
                  autoCorrect={false}
                  returnKeyType="search"
                />
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets
                contentContainerStyle={styles.contactInviteList}
              >
                {contactInvites
                  .filter((contact) => {
                    const search = contactSearch.trim().toLowerCase();
                    if (!search) return true;
                    return `${contact.name} ${contact.phone} ${contact.status}`.toLowerCase().includes(search);
                  })
                  .map((contact) => {
                    const isFollowerContact = contact.status === "follower";
                    const isInvited = contact.status === "invited";
                    const isRequested = contact.status === "requested";

                    return (
                      <View key={contact.id} style={styles.contactInviteRow}>
                        <View style={styles.contactInviteAvatar}>
                          <UserRound size={18} color={GREEN} />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={styles.contactInviteName}>{contact.name}</Text>
                          <Text style={styles.contactInvitePhone}>{contact.phone}</Text>
                          <Text style={styles.contactInviteStatus}>
                            {isFollowerContact
                              ? "Already following you"
                              : isRequested
                                ? "Follow request sent"
                                : isInvited
                                  ? "Invitation sent"
                                  : "In your contacts"}
                          </Text>
                        </View>

                        {isFollowerContact ? (
                          <TouchableOpacity style={styles.contactFollowerButton} onPress={() => { setContactInviteVisible(false); openDashboard("followers"); }}>
                            <Users size={14} color={GREEN} />
                            <Text style={styles.contactFollowerText}>View</Text>
                          </TouchableOpacity>
                        ) : isRequested ? (
                          <TouchableOpacity style={styles.contactPendingButton} disabled>
                            <Clock size={14} color="#8A8172" />
                            <Text style={styles.contactPendingText}>Sent</Text>
                          </TouchableOpacity>
                        ) : isInvited ? (
                          <TouchableOpacity style={styles.contactAddButton} onPress={() => addContactAsFollower(contact)}>
                            <UserPlus size={14} color="#FFFFFF" />
                            <Text style={styles.contactAddText}>Add</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.contactInviteActions}>
                            <TouchableOpacity style={styles.contactRequestButton} onPress={() => sendFollowRequestToContact(contact)}>
                              <UserPlus size={14} color="#FFFFFF" />
                              <Text style={styles.contactRequestText}>Request</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.contactInviteButton} onPress={() => inviteContactToApp(contact)}>
                              <Share2 size={14} color={GREEN} />
                              <Text style={styles.contactInviteButtonText}>Invite</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={profileVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
          enabled
        >
          <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Community Profile</Text>
              <TouchableOpacity onPress={() => setProfileVisible(false)}>
                <X size={24} color={GREEN} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" automaticallyAdjustKeyboardInsets contentContainerStyle={styles.modalScrollContent}>
              <LinearGradient
                colors={[GREEN, EMERALD]}
                style={styles.profileHero}
              >
                <TouchableOpacity
                  style={styles.profileAvatar}
                  onPress={() =>
                    profile.avatar
                      ? setAvatarViewerVisible(true)
                      : pickProfilePicture()
                  }
                >
                  {profile.avatar ? (
                    <Image
                      source={{ uri: profile.avatar }}
                      style={styles.profileAvatarImage}
                    />
                  ) : (
                    <UserRound size={34} color={GOLD} />
                  )}
                </TouchableOpacity>

                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileUsername}>{profile.username}</Text>
                <Text style={styles.profileBio}>{profile.bio}</Text>

                <View style={styles.profilePhotoActions}>
                  <TouchableOpacity
                    style={styles.photoAction}
                    onPress={() =>
                      profile.avatar
                        ? setAvatarViewerVisible(true)
                        : pickProfilePicture()
                    }
                  >
                    <Eye size={15} color={GREEN} />
                    <Text style={styles.photoActionText}>View</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.photoAction}
                    onPress={pickProfilePicture}
                  >
                    <ImageIcon size={15} color={GREEN} />
                    <Text style={styles.photoActionText}>Change</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.photoAction}
                    onPress={() => takeProfilePicture(ImagePicker.CameraType.back)}
                  >
                    <Camera size={15} color={GREEN} />
                    <Text style={styles.photoActionText}>Back Camera</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.photoAction}
                    onPress={() => takeProfilePicture(ImagePicker.CameraType.front)}
                  >
                    <Camera size={15} color={GREEN} />
                    <Text style={styles.photoActionText}>Front Camera</Text>
                  </TouchableOpacity>

                  {profile.avatar && (
                    <TouchableOpacity
                      style={styles.photoActionDanger}
                      onPress={removeProfilePicture}
                    >
                      <Trash2 size={15} color="#FFFFFF" />
                      <Text style={styles.photoActionDangerText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </LinearGradient>

              <View style={styles.profileStats}>
                <ProfileStat label="Followers" value={followers.length} />
                <ProfileStat label="Following" value={following.length} />
                <ProfileStat label="Friends" value={profile.friends} />
              </View>

              <View style={styles.profileStats}>
                <ProfileStat label="Posts" value={myPosts.length} />
                <ProfileStat label="Likes" value={totalMyLikes} />
                <ProfileStat label="Videos" value={totalMyVideos} />
              </View>

              <View style={styles.profileStats}>
                <ProfileStat label="Views" value={totalMyViews} />
                <ProfileStat label="Saved" value={saved.length} />
                <ProfileStat label="Liked" value={liked.length} />
              </View>

              <TouchableOpacity
                style={styles.simulateButton}
                onPress={simulateFollower}
              >
                <UserPlus size={17} color="#FFFFFF" />
                <Text style={styles.simulateButtonText}>
                  Invite / Request Followers
                </Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.modalInput}
                value={profile.name}
                onChangeText={(text) => saveProfile({ ...profile, name: text })}
              />

              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.modalInput}
                value={profile.username}
                onChangeText={(text) =>
                  saveProfile({ ...profile, username: text })
                }
              />

              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={styles.modalTextAreaSmall}
                multiline
                textAlignVertical="top"
                value={profile.bio}
                onChangeText={(text) => saveProfile({ ...profile, bio: text })}
              />

              <Text style={styles.commentsTitle}>My Posts</Text>

              {myPosts.length === 0 && (
                <Text style={styles.noComments}>You have not posted yet.</Text>
              )}

              {myPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  liked={liked.includes(post.id)}
                  saved={saved.includes(post.id)}
                  following={false}
                  currentUserId={profile.id}
                  onLike={() => toggleLike(post.id)}
                  onSave={() => toggleSave(post.id)}
                  onOpen={() => setSelectedPost(post)}
                  onShare={() => sharePost(post)}
                  onReport={reportPost}
                  onDelete={() => deletePost(post.id)}
                  onReaction={(reaction) => addReaction(post.id, reaction)}
                  onRepost={() => repostPost(post)}
                  onDownload={() => downloadPost(post)}
                  onFollow={() => {}}
                  onPlayAudio={playAudio}
                  playingAudio={playingAudio}
                  onApply={() => applyForJob(post)}
                />
              ))}
            </ScrollView>
          </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>


      <Modal visible={!!dashboardVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
          enabled
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>
                    {dashboardVisible === "posts" && "Posts Dashboard"}
                    {dashboardVisible === "followers" && "Followers Dashboard"}
                    {dashboardVisible === "lives" && "Live Dashboard"}
                    {dashboardVisible === "jobPosts" && "Job Posts"}
                    {dashboardVisible === "applications" && "Applications"}
                    {dashboardVisible === "groups" && "Professional Groups"}
                  </Text>
                  <Text style={styles.dashboardSubtitle}>
                    {dashboardVisible === "posts" && "Open, review, edit, delete and check reactions."}
                    {dashboardVisible === "followers" && "View followers and manage who is blocked."}
                    {dashboardVisible === "lives" && "See live status, reactions, gifts, guests and comments."}
                    {dashboardVisible === "jobPosts" && "Review job opportunities and apply quickly."}
                    {dashboardVisible === "applications" && "View and manage saved applications."}
                    {dashboardVisible === "groups" && "Join, open or manage professional circles."}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setDashboardVisible(null)}>
                  <X size={24} color={GREEN} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                automaticallyAdjustKeyboardInsets
                contentContainerStyle={styles.modalScrollContent}
              >
                {dashboardVisible === "posts" && (
                  <>
                    <View style={styles.dashboardTopGrid}>
                      <DashboardMiniCard label="Total posts" value={posts.length} />
                      <DashboardMiniCard label="My posts" value={myPosts.length} />
                      <DashboardMiniCard label="Saved" value={saved.length} />
                    </View>

                    {posts.length === 0 && (
                      <Text style={styles.noComments}>No posts available yet.</Text>
                    )}

                    {posts.map((post) => {
                      const canManage = post.authorId === profile.id;
                      return (
                        <View key={`manage-${post.id}`} style={styles.managePostCard}>
                          <View style={styles.managePostTop}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.managePostType}>{post.type}</Text>
                              <Text style={styles.managePostTitle}>{post.title}</Text>
                              <Text style={styles.managePostMeta}>
                                {post.author} • {post.time} • {post.views} views
                              </Text>
                            </View>
                            {canManage && <Text style={styles.ownerBadge}>Yours</Text>}
                          </View>

                          <Text style={styles.managePostBody} numberOfLines={3}>
                            {post.body}
                          </Text>

                          <View style={styles.reactionSummaryGrid}>
                            {(Object.keys(REACTION_LABELS) as ReactionType[]).map((reaction) => (
                              <View key={`${post.id}-${reaction}`} style={styles.reactionSummaryPill}>
                                <Text style={styles.reactionSummaryEmoji}>{REACTION_LABELS[reaction]}</Text>
                                <Text style={styles.reactionSummaryText}>{post.reactions[reaction]}</Text>
                              </View>
                            ))}
                          </View>

                          <View style={styles.manageActionRow}>
                            <TouchableOpacity
                              style={styles.manageButton}
                              onPress={() => setSelectedPost(post)}
                            >
                              <Eye size={15} color={GREEN} />
                              <Text style={styles.manageButtonText}>Open</Text>
                            </TouchableOpacity>

                            {canManage && (
                              <TouchableOpacity
                                style={styles.manageButton}
                                onPress={() => startEditPost(post)}
                              >
                                <FileText size={15} color={GREEN} />
                                <Text style={styles.manageButtonText}>Edit</Text>
                              </TouchableOpacity>
                            )}

                            {canManage && (
                              <TouchableOpacity
                                style={styles.manageDangerButton}
                                onPress={() => deletePost(post.id)}
                              >
                                <Trash2 size={15} color="#FFFFFF" />
                                <Text style={styles.manageDangerText}>Delete</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </>
                )}

                {dashboardVisible === "followers" && (
                  <>
                    <View style={styles.dashboardTopGrid}>
                      <DashboardMiniCard label="Followers" value={followers.length} />
                      <DashboardMiniCard label="Blocked" value={blockedFollowers.length} />
                      <DashboardMiniCard label="Active" value={followers.length - blockedFollowers.length} />
                    </View>

                    <TouchableOpacity style={styles.simulateButton} onPress={openContactInvites}>
                      <UserPlus size={17} color="#FFFFFF" />
                      <Text style={styles.simulateButtonText}>Open Contacts / Send Invitation</Text>
                    </TouchableOpacity>

                    {followers.map((follower) => {
                      const blocked = blockedFollowers.includes(follower);
                      return (
                        <View key={follower} style={styles.followerManageCard}>
                          <View style={styles.followerAvatarSmall}>
                            <UserRound size={18} color={GOLD} />
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text style={styles.followerName}>{followerDisplayName(follower)}</Text>
                            <Text style={styles.followerMeta}>
                              {blocked ? "Blocked from interacting" : "Can follow and interact"}
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={blocked ? styles.unblockButton : styles.blockButton}
                            onPress={() => toggleBlockFollower(follower)}
                          >
                            <Text style={blocked ? styles.unblockText : styles.blockText}>
                              {blocked ? "Unblock" : "Block"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </>
                )}

                {dashboardVisible === "jobPosts" && (
                  <>
                    <View style={styles.dashboardTopGrid}>
                      <DashboardMiniCard label="Open jobs" value={posts.filter((item) => item.type === "Jobs").length} />
                      <DashboardMiniCard label="Applications" value={jobApplications.length} />
                      <DashboardMiniCard label="Groups" value={jobGroups.length} />
                    </View>

                    {posts.filter((item) => item.type === "Jobs").length === 0 && (
                      <Text style={styles.noComments}>No job posts yet.</Text>
                    )}

                    {posts.filter((item) => item.type === "Jobs").map((post) => (
                      <View key={`job-dash-${post.id}`} style={styles.managePostCardCompact}>
                        <View style={styles.managePostTop}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.managePostType}>Job Opportunity</Text>
                            <Text style={styles.managePostTitle}>{post.title}</Text>
                            <Text style={styles.managePostMeta}>{post.location || "Community"} • {post.time}</Text>
                          </View>
                          <BriefcaseBusiness size={20} color={GOLD} />
                        </View>
                        <Text style={styles.managePostBody} numberOfLines={3}>{post.body}</Text>
                        <View style={styles.manageActionRow}>
                          <TouchableOpacity style={styles.manageButton} onPress={() => setSelectedPost(post)}>
                            <Eye size={15} color={GREEN} />
                            <Text style={styles.manageButtonText}>Open</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.manageButton} onPress={() => applyForJob(post)}>
                            <ClipboardCheck size={15} color={GREEN} />
                            <Text style={styles.manageButtonText}>Apply</Text>
                          </TouchableOpacity>
                          {post.authorId === profile.id && (
                            <TouchableOpacity style={styles.manageDangerButton} onPress={() => deletePost(post.id)}>
                              <Trash2 size={15} color="#FFFFFF" />
                              <Text style={styles.manageDangerText}>Delete</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))}
                  </>
                )}

                {dashboardVisible === "applications" && (
                  <>
                    <View style={styles.dashboardTopGrid}>
                      <DashboardMiniCard label="Saved" value={jobApplications.length} />
                      <DashboardMiniCard label="Applicant" value={profile.name} />
                      <DashboardMiniCard label="Ready" value="Yes" />
                    </View>

                    {jobApplications.length === 0 && (
                      <Text style={styles.noComments}>No applications saved yet. Open a job post and tap Apply.</Text>
                    )}

                    {jobApplications.map((application) => (
                      <View key={`application-${application.id}`} style={styles.managePostCardCompact}>
                        <Text style={styles.managePostType}>Application</Text>
                        <Text style={styles.managePostTitle}>{application.role}</Text>
                        <Text style={styles.managePostMeta}>{application.applicant} • {application.time}</Text>
                        <Text style={styles.managePostBody}>{application.message}</Text>
                        <View style={styles.manageActionRow}>
                          <TouchableOpacity
                            style={styles.manageButton}
                            onPress={() => {
                              const foundPost = posts.find((post) => post.id === application.postId);
                              if (foundPost) setSelectedPost(foundPost);
                              else Alert.alert("Post Removed", "The original job post is no longer available.");
                            }}
                          >
                            <Eye size={15} color={GREEN} />
                            <Text style={styles.manageButtonText}>Open Job</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.manageDangerButton} onPress={() => deleteJobApplication(application.id)}>
                            <Trash2 size={15} color="#FFFFFF" />
                            <Text style={styles.manageDangerText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </>
                )}

                {dashboardVisible === "groups" && (
                  <>
                    <View style={styles.dashboardTopGrid}>
                      <DashboardMiniCard label="Groups" value={jobGroups.length} />
                      <DashboardMiniCard label="Members" value={jobGroups.reduce((sum, group) => sum + group.members, 0)} />
                      <DashboardMiniCard label="Mentor" value={profile.name} />
                    </View>

                    <TouchableOpacity style={styles.dashboardPrimaryAction} onPress={() => setCreateGroupVisible(true)}>
                      <UsersRound size={16} color="#FFFFFF" />
                      <Text style={styles.dashboardPrimaryActionText}>Create New Group</Text>
                    </TouchableOpacity>

                    {jobGroups.map((group) => (
                      <View key={`group-dash-${group.id}`} style={styles.managePostCardCompact}>
                        <View style={styles.managePostTop}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.managePostType}>{group.profession}</Text>
                            <Text style={styles.managePostTitle}>{group.name}</Text>
                            <Text style={styles.managePostMeta}>{group.members} members • Mentor: {group.mentor}</Text>
                          </View>
                          <Building2 size={20} color={GOLD} />
                        </View>
                        <Text style={styles.managePostBody}>{group.description}</Text>
                        <View style={styles.manageActionRow}>
                          <TouchableOpacity style={styles.manageButton} onPress={() => joinJobGroup(group.id)}>
                            <UserPlus size={15} color={GREEN} />
                            <Text style={styles.manageButtonText}>Join</Text>
                          </TouchableOpacity>
                          {group.mentor === profile.name && (
                            <TouchableOpacity style={styles.manageDangerButton} onPress={() => deleteJobGroup(group.id)}>
                              <Trash2 size={15} color="#FFFFFF" />
                              <Text style={styles.manageDangerText}>Delete</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))}
                  </>
                )}

                {dashboardVisible === "lives" && (
                  <>
                    <View style={styles.dashboardTopGrid}>
                      <DashboardMiniCard label="Status" value={isLive ? "Live" : "Ready"} />
                      <DashboardMiniCard label="Viewers" value={liveViewers} />
                      <DashboardMiniCard label="Gifts" value={liveGifts} />
                    </View>

                    <View style={styles.managePostCard}>
                      <Text style={styles.managePostTitle}>{liveTitle}</Text>
                      <Text style={styles.managePostMeta}>
                        {liveMode === "host" ? "Host mode" : "Viewer mode"} • {liveLikes} likes • {liveGuests.length} guests
                      </Text>

                      <Text style={styles.dashboardSectionTitle}>Live Reactions</Text>
                      <View style={styles.reactionSummaryGrid}>
                        {(Object.keys(LIVE_REACTIONS) as LiveReaction[]).map((reaction) => (
                          <TouchableOpacity
                            key={`live-dash-${reaction}`}
                            style={styles.reactionSummaryPill}
                            onPress={() => addLiveReaction(reaction)}
                          >
                            <Text style={styles.reactionSummaryEmoji}>{LIVE_REACTIONS[reaction]}</Text>
                            <Text style={styles.reactionSummaryText}>{liveReactions[reaction]}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <Text style={styles.dashboardSectionTitle}>Guests</Text>
                      <View style={styles.guestRow}>
                        {liveGuests.map((guest, index) => (
                          <View key={`dash-guest-${guest}-${index}`} style={styles.guestChip}>
                            <Crown size={13} color={GOLD} />
                            <Text style={styles.guestText}>{guest}</Text>
                          </View>
                        ))}
                      </View>

                      <Text style={styles.dashboardSectionTitle}>Live Comments</Text>
                      {liveComments.map((comment) => (
                        <View key={`dash-comment-${comment.id}`} style={styles.liveCommentCard}>
                          <Text style={styles.liveCommentAuthor}>{comment.author}</Text>
                          <Text style={styles.liveCommentText}>{comment.text}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={!!editingPost} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
          enabled
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Post</Text>
                <TouchableOpacity onPress={() => setEditingPost(null)}>
                  <X size={24} color={GREEN} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                automaticallyAdjustKeyboardInsets
                contentContainerStyle={styles.modalScrollContent}
              >
                <Text style={styles.inputLabel}>Post Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {TABS.filter((item) => item !== "All").map((item) => {
                    const active = editType === item;
                    return (
                      <TouchableOpacity
                        key={`edit-${item}`}
                        style={[styles.createTypePill, active && styles.createTypePillActive]}
                        onPress={() => setEditType(item as Exclude<PostType, "All">)}
                      >
                        <Text style={[styles.createTypeText, active && styles.createTypeTextActive]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Edit title"
                  placeholderTextColor="#8A8172"
                  value={editTitle}
                  onChangeText={setEditTitle}
                  returnKeyType="next"
                />

                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  style={styles.modalTextArea}
                  placeholder="Edit message"
                  placeholderTextColor="#8A8172"
                  multiline
                  textAlignVertical="top"
                  value={editBody}
                  onChangeText={setEditBody}
                />

                <Text style={styles.inputLabel}>Location / Time Optional</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Example: Central Mosque • After Maghrib"
                  placeholderTextColor="#8A8172"
                  value={editLocation}
                  onChangeText={setEditLocation}
                />

                <TouchableOpacity style={styles.publishButton} onPress={saveEditedPost}>
                  <Send size={18} color="#FFFFFF" />
                  <Text style={styles.publishText}>Save Changes</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={avatarViewerVisible} animationType="fade" transparent>
        <View style={styles.avatarViewerOverlay}>
          <View style={styles.avatarViewerHeader}>
            <TouchableOpacity
              style={styles.avatarViewerBack}
              onPress={() => setAvatarViewerVisible(false)}
            >
              <X size={25} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.avatarViewerTitle}>Profile Picture</Text>
          </View>

          <View style={styles.avatarViewerBody}>
            {profile.avatar ? (
              <Image
                source={{ uri: profile.avatar }}
                style={styles.avatarViewerImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.avatarViewerEmpty}>
                <UserRound size={60} color={GOLD} />
                <Text style={styles.avatarViewerEmptyText}>
                  No profile picture yet
                </Text>
              </View>
            )}
          </View>

          <View style={styles.avatarViewerActions}>
            <TouchableOpacity
              style={styles.avatarViewerButton}
              onPress={pickProfilePicture}
            >
              <ImageIcon size={18} color={GREEN} />
              <Text style={styles.avatarViewerButtonText}>Change</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.avatarViewerButton}
              onPress={() => takeProfilePicture(ImagePicker.CameraType.back)}
            >
              <Camera size={18} color={GREEN} />
              <Text style={styles.avatarViewerButtonText}>Back Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.avatarViewerButton}
              onPress={() => takeProfilePicture(ImagePicker.CameraType.front)}
            >
              <Camera size={18} color={GREEN} />
              <Text style={styles.avatarViewerButtonText}>Front Camera</Text>
            </TouchableOpacity>

            {profile.avatar && (
              <TouchableOpacity
                style={styles.avatarViewerDanger}
                onPress={removeProfilePicture}
              >
                <Trash2 size={18} color="#FFFFFF" />
                <Text style={styles.avatarViewerDangerText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={createVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
          enabled
        >
          <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create</Text>
              <TouchableOpacity onPress={() => setCreateVisible(false)}>
                <X size={24} color={GREEN} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" automaticallyAdjustKeyboardInsets contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.inputLabel}>Post Type</Text>

              <View style={styles.creatorProPanel}>
                <View style={styles.creatorHeaderClean}>
                  <View style={styles.creatorIconCircle}><Plus size={18} color="#FFFFFF" /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.creatorProTitle}>Create a post</Text>
                    <Text style={styles.creatorProText}>Choose photo, video, gallery, file, voice or music. Save as draft or publish when ready.</Text>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Video length</Text>
                <View style={styles.durationRow}>
                  {[15, 30, 60, 120, 180, 600].map((seconds) => (
                    <TouchableOpacity
                      key={seconds}
                      style={[styles.durationChip, videoDuration === seconds && styles.durationChipActive]}
                      onPress={() => setVideoDuration(seconds)}
                    >
                      <Text style={[styles.durationText, videoDuration === seconds && styles.durationTextActive]}>
                        {seconds < 60 ? `${seconds}s` : `${Math.round(seconds / 60)}m`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Create media</Text>
                <View style={styles.creatorToolRow}>
                  <MediaTool icon={<Camera size={16} color={GREEN} />} label="Take Photo" onPress={takeCreatorPhoto} />
                  <MediaTool icon={<VideoIcon size={16} color={GREEN} />} label="Record Video" onPress={recordCreatorVideo} />
                  <MediaTool icon={<ImageIcon size={16} color={GREEN} />} label="Gallery" onPress={pickImageOrVideo} />
                  <MediaTool icon={<FileText size={16} color={GREEN} />} label="File" onPress={pickFile} />
                  <MediaTool icon={<Mic size={16} color={GREEN} />} label={recording ? "Stop Voice" : "Voice"} onPress={recording ? stopVoiceRecording : startVoiceRecording} />
                  <MediaTool icon={<Music size={16} color={GREEN} />} label="Music" onPress={pickBackgroundAudio} />
                </View>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {TABS.filter((item) => item !== "All").map((item) => {
                  const active = newType === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.createTypePill,
                        active && styles.createTypePillActive,
                      ]}
                      onPress={() =>
                        setNewType(item as Exclude<PostType, "All">)
                      }
                    >
                      <Text
                        style={[
                          styles.createTypeText,
                          active && styles.createTypeTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Example: Quran class this weekend"
                placeholderTextColor="#8A8172"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={styles.modalTextArea}
                placeholder="Write your post..."
                placeholderTextColor="#8A8172"
                multiline
                textAlignVertical="top"
                value={newBody}
                onChangeText={setNewBody}
              />

              <Text style={styles.inputLabel}>Location / Time Optional</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Example: Central Mosque • After Maghrib"
                placeholderTextColor="#8A8172"
                value={newLocation}
                onChangeText={setNewLocation}
              />

              <Text style={styles.inputLabel}>Selected media</Text>

              <View style={styles.creatorSelectedStrip}>
                <Text style={styles.creatorSelectedText}>Photos, videos, files, voice notes and music you add will appear below. Use Save Draft if you want to finish later.</Text>
              </View>

              {newAudio && (
                <View style={styles.selectedMediaRow}>
                  <Music size={17} color={GOLD} />
                  <Text style={styles.selectedMediaText}>
                    Background audio: {newAudio.name}
                  </Text>
                </View>
              )}

              {newMedia.map((item) => (
                <View key={item.id} style={styles.selectedMediaRow}>
                  {item.type === "image" && (
                    <ImageIcon size={17} color={GOLD} />
                  )}
                  {item.type === "video" && (
                    <VideoIcon size={17} color={GOLD} />
                  )}
                  {item.type === "file" && <FileText size={17} color={GOLD} />}
                  {item.type === "audio" && <Mic size={17} color={GOLD} />}
                  <Text style={styles.selectedMediaText}>
                    {item.name || item.type}
                  </Text>
                </View>
              ))}

              {postDrafts.length > 0 && (
                <View style={styles.draftPanel}>
                  <Text style={styles.draftPanelTitle}>Saved drafts</Text>
                  {postDrafts.slice(0, 3).map((draft) => (
                    <View key={draft.id} style={styles.draftRow}>
                      <TouchableOpacity style={{ flex: 1 }} onPress={() => loadDraftPost(draft)}>
                        <Text style={styles.draftTitle}>{draft.title}</Text>
                        <Text style={styles.draftMeta}>{draft.type} • {draft.media.length} attachment(s)</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.draftDeleteButton} onPress={() => deleteDraftPost(draft.id)}>
                        <Trash2 size={15} color={ROSE} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.creatorPublishRow}>
                <TouchableOpacity
                  style={styles.draftButton}
                  onPress={saveDraftPost}
                >
                  <Bookmark size={18} color={GREEN} />
                  <Text style={styles.draftButtonText}>Save Draft</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.publishButton, styles.publishButtonFlex]}
                  onPress={createPost}
                >
                  <Send size={18} color="#FFFFFF" />
                  <Text style={styles.publishText}>Publish</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={!!selectedPost} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
          enabled
        >
          <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedPost && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Post Details</Text>
                  <TouchableOpacity onPress={() => setSelectedPost(null)}>
                    <X size={24} color={GREEN} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="interactive"
                  automaticallyAdjustKeyboardInsets
                  style={styles.modalBodyScroll}
                  contentContainerStyle={styles.modalScrollContent}
                >
                  <PostCard
                    post={selectedPost}
                    liked={liked.includes(selectedPost.id)}
                    saved={saved.includes(selectedPost.id)}
                    following={following.includes(selectedPost.authorId)}
                    currentUserId={profile.id}
                    onLike={() => toggleLike(selectedPost.id)}
                    onSave={() => toggleSave(selectedPost.id)}
                    onOpen={() => {}}
                    onShare={() => sharePost(selectedPost)}
                    onReport={reportPost}
                    onDelete={() => deletePost(selectedPost.id)}
                    onReaction={(reaction) =>
                      addReaction(selectedPost.id, reaction)
                    }
                    onRepost={() => repostPost(selectedPost)}
                    onDownload={() => downloadPost(selectedPost)}
                    onFollow={() => followUser(selectedPost.authorId)}
                    onPlayAudio={playAudio}
                    playingAudio={playingAudio}
                    onApply={() => applyForJob(selectedPost)}
                  />

                  <Text style={styles.commentsTitle}>
                    {selectedPost.type === "Question" ? "Answers" : "Comments"}
                  </Text>

                  {selectedPost.comments.map((comment) => (
                    <View key={comment.id} style={styles.commentCard}>
                      <View style={styles.commentTop}>
                        <UserRound size={16} color={GOLD} />
                        <Text style={styles.commentAuthor}>
                          {comment.author}
                        </Text>
                        <Text style={styles.commentTime}>{comment.time}</Text>
                      </View>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.commentInputRow}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder={
                      selectedPost.type === "Question"
                        ? "Write an answer..."
                        : "Write a comment..."
                    }
                    placeholderTextColor="#8A8172"
                    value={commentText}
                    onChangeText={setCommentText}
                    returnKeyType="send"
                    onSubmitEditing={addComment}
                  />

                  <TouchableOpacity
                    style={styles.commentSend}
                    onPress={addComment}
                  >
                    <Send size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function postIcon(type: PostType, color: string) {
  if (type === "Jobs") return <BriefcaseBusiness size={15} color={color} />;
  if (type === "Announcement") return <Megaphone size={15} color={color} />;
  if (type === "Question") return <HelpCircle size={15} color={color} />;
  if (type === "Event") return <CalendarDays size={15} color={color} />;
  if (type === "Charity") return <HandHeart size={15} color={color} />;
  if (type === "Reminder") return <Star size={15} color={color} />;
  if (type === "General") return <Users size={15} color={color} />;
  return <Filter size={15} color={color} />;
}

function PostCard({
  post,
  liked,
  saved,
  following,
  currentUserId,
  onLike,
  onSave,
  onOpen,
  onShare,
  onReport,
  onDelete,
  onReaction,
  onRepost,
  onDownload,
  onFollow,
  onPlayAudio,
  onApply,
  playingAudio,
}: {
  key?: string;
  post: PostItem;
  liked: boolean;
  saved: boolean;
  following: boolean;
  currentUserId: string;
  onLike: () => void;
  onSave: () => void;
  onOpen: () => void;
  onShare: () => void;
  onReport: () => void;
  onDelete?: () => void;
  onReaction: (reaction: ReactionType) => void;
  onRepost: () => void;
  onDownload: () => void;
  onFollow: () => void;
  onPlayAudio: (uri: string) => void;
  playingAudio: string | null;
  onApply?: () => void;
}) {
  return (
    <LinearGradient colors={[CARD, "#F7F0DC"]} style={styles.postCard}>
      <View style={styles.postTop}>
        <View style={styles.avatarCircle}>
          {post.avatar ? (
            <Image source={{ uri: post.avatar }} style={styles.avatarImage} />
          ) : (
            postIcon(post.type, GOLD)
          )}
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{post.author}</Text>
            {post.verified && <ShieldCheck size={14} color={GOLD} />}
          </View>

          <Text style={styles.usernameText}>{post.username}</Text>

          <View style={styles.postMetaRow}>
            <Clock size={12} color="#8A8172" />
            <Text style={styles.postTime}>{post.time}</Text>
            <Text style={styles.postDot}>•</Text>
            <Text style={styles.postType}>{post.type}</Text>
          </View>
        </View>

        {post.authorId !== currentUserId && (
          <TouchableOpacity style={styles.followButton} onPress={onFollow}>
            {following ? (
              <UserCheck size={16} color="#FFFFFF" />
            ) : (
              <UserPlus size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        )}

        {post.authorId === currentUserId ? (
          <TouchableOpacity
            style={styles.postTopIconButtonDanger}
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete post"
          >
            <Trash2 size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.postTopIconButton}
            onPress={onReport}
            accessibilityRole="button"
            accessibilityLabel="Report post"
          >
            <Flag size={18} color={ROSE} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity activeOpacity={0.85} onPress={onOpen}>
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postBody}>{post.body}</Text>

        {post.location && (
          <View style={styles.locationRow}>
            <MapPin size={13} color={GOLD} />
            <Text style={styles.locationText}>{post.location}</Text>
          </View>
        )}

        {post.type === "Jobs" && (
          <View style={styles.jobApplyPanel}>
            <View style={{ flex: 1 }}>
              <Text style={styles.jobApplyTitle}>Job opportunity</Text>
              <Text style={styles.jobApplyText}>
                Apply, comment with your experience, or connect with people in
                this career field.
              </Text>
            </View>
            <TouchableOpacity style={styles.applyButton} onPress={onApply}>
              <ClipboardCheck size={15} color="#FFFFFF" />
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        )}

        {post.backgroundAudio && (
          <TouchableOpacity
            style={styles.audioBadge}
            onPress={() => onPlayAudio(post.backgroundAudio!.uri)}
          >
            {playingAudio === post.backgroundAudio.uri ? (
              <Pause size={14} color={GREEN} />
            ) : (
              <Play size={14} color={GREEN} />
            )}
            <Text style={styles.audioBadgeText}>
              Audio: {post.backgroundAudio.name}
            </Text>
          </TouchableOpacity>
        )}

        {post.media.length > 0 && (
          <View style={styles.mediaGrid}>
            {post.media.map((media) => (
              <View key={media.id} style={styles.mediaBox}>
                {media.type === "image" && (
                  <Image
                    source={{ uri: media.uri }}
                    style={styles.mediaImage}
                  />
                )}

                {media.type === "video" && (
                  <Video
                    source={{ uri: media.uri }}
                    style={styles.mediaVideo}
                    resizeMode={ResizeMode.COVER}
                    useNativeControls
                    shouldPlay={false}
                  />
                )}

                {media.type === "file" && (
                  <View style={styles.filePreview}>
                    <FileText size={32} color={GOLD} />
                    <Text style={styles.filePreviewText}>
                      {media.name || "File"}
                    </Text>
                  </View>
                )}

                {media.type === "audio" && (
                  <TouchableOpacity
                    style={styles.filePreview}
                    onPress={() => onPlayAudio(media.uri)}
                  >
                    {playingAudio === media.uri ? (
                      <Pause size={32} color={GOLD} />
                    ) : (
                      <Mic size={32} color={GOLD} />
                    )}
                    <Text style={styles.filePreviewText}>
                      {media.name || "Voice note"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.reactionRow}>
        {(Object.keys(REACTION_LABELS) as ReactionType[]).map((reaction) => (
          <TouchableOpacity
            key={reaction}
            style={styles.reactionPill}
            onPress={() => onReaction(reaction)}
          >
            <Text style={styles.reactionEmoji}>
              {REACTION_LABELS[reaction]}
            </Text>
            <Text style={styles.reactionCount}>{post.reactions[reaction]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Heart size={17} color={liked ? ROSE : GREEN} />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onOpen}>
          <MessageCircle size={17} color={GREEN} />
          <Text style={styles.actionText}>{post.comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onSave}>
          {saved ? (
            <BookmarkCheck size={17} color={GOLD} />
          ) : (
            <Bookmark size={17} color={GREEN} />
          )}
          <Text style={styles.actionText}>{saved ? "Saved" : "Save"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onRepost}>
          <Repeat2 size={17} color={GREEN} />
          <Text style={styles.actionText}>{post.reposts}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onDownload}>
          <Download size={17} color={GREEN} />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Share2 size={17} color={GREEN} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <View style={styles.actionButton}>
          <Eye size={17} color={GREEN} />
          <Text style={styles.actionText}>{post.views}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

function HeaderNavChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.headerNavChip, active && styles.headerNavChipActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.headerNavChipText, active && styles.headerNavChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function BottomNavButton({
  label,
  icon,
  active,
  featured,
  badge,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  featured?: boolean;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.bottomNavButton, featured && styles.bottomNavButtonFeatured]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        style={[
          styles.bottomNavIconWrap,
          active && styles.bottomNavIconWrapActive,
          featured && styles.bottomNavIconWrapFeatured,
        ]}
      >
        {icon}
        {!!badge && badge > 0 && (
          <View style={styles.bottomBadge}>
            <Text style={styles.bottomBadgeText}>{badge > 9 ? "9+" : badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.bottomNavLabel, active && styles.bottomNavLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function PrivacySection({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <View style={styles.privacySection}>
      <Text style={styles.privacySectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function PrivacyAction({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.privacyRow} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.privacyRowText}>{title}</Text>
      <Text style={styles.privacyArrow}>›</Text>
    </TouchableOpacity>
  );
}

function PrivacySwitch({ title, value, onValueChange }: { title: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.privacyRow}>
      <Text style={styles.privacyRowText}>{title}</Text>
      <View style={styles.privacySwitchWrap}>
        <Text style={styles.privacyStateText}>{value ? "On" : "Off"}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#DED6C8", true: MINT }}
          thumbColor={value ? GREEN : "#FFFFFF"}
        />
      </View>
    </View>
  );
}

function SettingSwitchRow({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingSwitchRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingSwitchTitle}>{title}</Text>
        <Text style={styles.settingSwitchSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#DED6C8", true: MINT }}
        thumbColor={value ? GREEN : "#FFFFFF"}
      />
    </View>
  );
}

function JobMiniStat({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.jobMiniStat}
      onPress={onPress}
      activeOpacity={0.86}
      disabled={!onPress}
    >
      {icon}
      <Text style={styles.jobMiniValue}>{value}</Text>
      <Text style={styles.jobMiniLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function MediaTool({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.mediaTool} onPress={onPress}>
      {icon}
      <Text style={styles.mediaToolText}>{label}</Text>
    </TouchableOpacity>
  );
}


function DashboardMiniCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.dashboardMiniCard}>
      <Text style={styles.dashboardMiniValue}>{value}</Text>
      <Text style={styles.dashboardMiniLabel}>{label}</Text>
    </View>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.profileStatCard}>
      <Text style={styles.profileStatNumber}>{value}</Text>
      <Text style={styles.profileStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({

  messageSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F4EFE2",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.08)",
    marginBottom: 10,
  },
  messageSearchInput: {
    flex: 1,
    color: TEXT,
    fontWeight: "700",
    paddingVertical: 4,
  },
  creatorPublishRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    marginBottom: 12,
  },
  draftButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.16)",
    backgroundColor: "#FFFFFF",
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  draftButtonText: {
    color: GREEN,
    fontWeight: "900",
    fontSize: 12,
  },
  publishButtonFlex: {
    flex: 1,
    marginTop: 0,
  },
  draftPanel: {
    backgroundColor: "#F8F5EB",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.08)",
    marginTop: 12,
  },
  draftPanelTitle: {
    color: GREEN,
    fontWeight: "900",
    marginBottom: 8,
  },
  draftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    marginTop: 6,
  },
  draftTitle: {
    color: TEXT,
    fontWeight: "900",
  },
  draftMeta: {
    color: "#8A8172",
    fontSize: 11,
    marginTop: 2,
  },
  draftDeleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDEAEA",
  },
  keyboardAvoidingView: {
    flex: 1,
  },

  modalScrollContent: {
    paddingBottom: 130,
  },

  modalBodyScroll: {
    flex: 1,
  },
  safeArea: { flex: 1, backgroundColor: "#F4F0E6" },
  mainKeyboardAvoiding: { flex: 1 },
  container: { flex: 1 },
  content: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 128 },

  appTopBar: {
    backgroundColor: "rgba(255,253,248,0.96)",
    borderRadius: 24,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.10)",
    shadowColor: "#2B2418",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },

  appBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  appLogoMark: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  appLogoText: {
    color: GOLD,
    fontSize: 13,
    fontWeight: "900",
  },

  appBrandTitle: {
    color: GREEN,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  appBrandSubtitle: {
    color: "#786F62",
    fontSize: 11.5,
    fontWeight: "800",
    marginTop: 2,
  },

  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: MINT,
    alignItems: "center",
    justifyContent: "center",
  },

  headerIconButtonGold: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
  },

  headerNavRow: {
    flexDirection: "row",
    marginTop: 12,
    backgroundColor: "#F2EBDD",
    borderRadius: 18,
    padding: 4,
    gap: 4,
  },

  headerNavChip: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 9,
    alignItems: "center",
  },

  headerNavChipActive: {
    backgroundColor: GREEN,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },

  headerNavChipText: {
    color: "#6F6658",
    fontSize: 11.5,
    fontWeight: "900",
  },

  headerNavChipTextActive: { color: "#FFFFFF" },

  quickActionStrip: {
    flexDirection: "row",
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.10)",
    gap: 7,
  },

  quickActionItem: {
    flex: 1,
    minHeight: 54,
    borderRadius: 17,
    backgroundColor: "#F3EFE5",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  quickActionText: {
    color: GREEN,
    fontSize: 10.5,
    fontWeight: "900",
  },


  pageIntroCard: {
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.10)",
  },

  pageIntroIcon: {
    width: 42,
    height: 42,
    borderRadius: 17,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  pageIntroTitle: {
    color: GREEN,
    fontSize: 15,
    fontWeight: "900",
  },

  pageIntroText: {
    color: "#786F62",
    fontSize: 11.5,
    fontWeight: "700",
    marginTop: 2,
  },

  pageIntroButton: {
    minHeight: 36,
    borderRadius: 15,
    backgroundColor: GREEN,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 11,
  },

  pageIntroButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  bottomTabBar: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 22,
    minHeight: 60,
    borderRadius: 24,
    backgroundColor: "rgba(255,253,248,0.98)",
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowColor: "#1D1710",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.13,
    shadowRadius: 20,
    elevation: 12,
  },

  bottomNavButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  bottomNavButtonFeatured: {
    marginTop: -18,
  },

  bottomNavIconWrap: {
    width: 34,
    height: 30,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomNavIconWrapActive: {
    backgroundColor: MINT,
  },

  bottomNavIconWrapFeatured: {
    width: 48,
    height: 48,
    borderRadius: 22,
    backgroundColor: ROSE,
    borderWidth: 3,
    borderColor: "#FFFDF8",
  },

  bottomNavLabel: {
    color: "#8A8172",
    fontSize: 9.5,
    fontWeight: "900",
  },

  bottomNavLabelActive: {
    color: GREEN,
  },


  activeSearchStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },

  activeSearchText: {
    flex: 1,
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
  },

  activeSearchClear: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: MINT,
    alignItems: "center",
    justifyContent: "center",
  },

  modalOverlaySoft: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 16, 0.42)",
    justifyContent: "flex-end",
    padding: 12,
  },

  modalOverlaySoftMenu: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 16, 0.42)",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 14,
    paddingTop: 72,
  },

  searchModalCard: {
    maxHeight: "86%",
    backgroundColor: CREAM,
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
  },

  searchBoxModal: {
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.14)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  searchGoButton: {
    backgroundColor: GREEN,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  searchGoText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  searchQuickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  searchQuickChip: {
    backgroundColor: MINT,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  searchQuickText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
  },

  searchHistoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  searchHistoryTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "900",
  },

  searchHistoryClear: {
    color: ROSE,
    fontSize: 11,
    fontWeight: "900",
  },

  searchHistoryList: {
    maxHeight: 260,
  },

  searchHistoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },

  searchHistoryText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "800",
  },

  creatorProPanel: {
    backgroundColor: "#F3EFE5",
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.10)",
  },

  creatorHeaderClean: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  creatorIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
  },
  creatorProTitle: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "900",
  },

  creatorProText: {
    color: "#786F62",
    fontSize: 11.5,
    fontWeight: "700",
    marginTop: 3,
    marginBottom: 10,
  },

  durationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 10,
  },

  durationChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.12)",
  },

  durationChipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  durationText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
  },

  durationTextActive: {
    color: "#FFFFFF",
  },

  creatorToolRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  messageModalCard: {
    height: "88%",
    backgroundColor: CREAM,
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
  },

  recipientScroll: {
    marginBottom: 10,
  },

  recipientChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: CARD,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.10)",
  },

  recipientChipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  recipientText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
  },

  recipientTextActive: {
    color: "#FFFFFF",
  },

  messageThread: {
    flex: 1,
    backgroundColor: "#F3EFE5",
    borderRadius: 18,
    padding: 10,
    marginBottom: 10,
  },

  messageBubble: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 11,
    marginBottom: 8,
  },

  messageBubbleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  messageRecipient: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
  },

  messageStatus: {
    color: GREEN,
    fontSize: 10,
    fontWeight: "900",
  },

  messageStatusRequest: {
    color: GOLD,
  },

  messageBubbleText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },

  messageAttachment: {
    color: "#786F62",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 5,
  },

  pendingAttachmentRow: {
    maxHeight: 44,
    marginBottom: 8,
  },

  pendingAttachmentText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "800",
  },

  messageComposerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.12)",
  },

  messageAttachButton: {
    width: 38,
    height: 38,
    borderRadius: 15,
    backgroundColor: MINT,
    alignItems: "center",
    justifyContent: "center",
  },

  messageInput: {
    flex: 1,
    minHeight: 38,
    maxHeight: 110,
    color: TEXT,
    fontSize: 13,
    fontWeight: "700",
    paddingVertical: 8,
  },

  messageSendButton: {
    width: 38,
    height: 38,
    borderRadius: 15,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  menuModalCard: {
    maxHeight: "82%",
    backgroundColor: CREAM,
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
  },

  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  menuTile: {
    width: "48%",
    minHeight: 78,
    borderRadius: 20,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.10)",
  },


  menuTileImportant: {
    backgroundColor: "#F4E8C7",
    borderColor: GOLD,
  },

  menuTileText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
  },


  menuScrollContent: {
    paddingBottom: 24,
  },

  menuSectionLabel: {
    color: "#8A8172",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 8,
  },

  settingsListCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.10)",
  },

  settingsListRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 13,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(6,78,59,0.07)",
  },

  settingsListText: {
    flex: 1,
    color: TEXT,
    fontSize: 12.5,
    fontWeight: "800",
  },

  goldGlow: {
    position: "absolute",
    top: -70,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: GOLD,
    opacity: 0.16,
  },

  greenGlow: {
    position: "absolute",
    top: 420,
    left: -100,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: GREEN,
    opacity: 0.08,
  },

  hero: {
    borderRadius: 26,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: "stretch",
    marginBottom: 12,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },

  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 13,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  heroBadgeText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 6,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  heroSubtitle: {
    color: "#E9FFF7",
    fontSize: 12.2,
    lineHeight: 18,
    marginTop: 10,
    fontWeight: "700",
  },

  heroActions: {
    flexDirection: "row",
    marginTop: 18,
    gap: 10,
  },

  heroButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  heroButtonLive: {
    flex: 1,
    backgroundColor: ROSE,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  heroButtonGold: {
    flex: 1,
    backgroundColor: GOLD,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  heroButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    marginLeft: 7,
    fontSize: 11.5,
  },

  liveCard: {
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.25)",
    marginBottom: 14,
    shadowColor: "#2B2418",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  liveTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  liveIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 17,
    backgroundColor: ROSE,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  liveTitle: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "900",
  },

  liveSubtitle: {
    color: TEXT,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    marginTop: 3,
  },

  liveStatusBadge: {
    backgroundColor: ROSE,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  liveStatusText: {
    color: "#FFFFFF",
    fontSize: 9.5,
    fontWeight: "900",
  },

  liveMiniStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12,
  },

  liveMiniStat: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MINT,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },

  liveMiniStatText: {
    color: GREEN,
    fontSize: 10.5,
    fontWeight: "900",
    marginLeft: 5,
  },

  liveActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 13,
    flexWrap: "wrap",
  },

  livePrimaryButton: {
    backgroundColor: ROSE,
    borderRadius: 17,
    paddingVertical: 10,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  livePrimaryText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 6,
  },

  liveSecondaryButton: {
    backgroundColor: MINT,
    borderRadius: 17,
    paddingVertical: 10,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  liveSecondaryText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 6,
  },


  liveHeaderTitleBlock: {
    flex: 1,
    paddingRight: 10,
  },

  liveTopMetricsRow: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 10,
    flexWrap: "wrap",
  },

  liveMetricPillCompact: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.10)",
  },

  liveMetricText: {
    color: GREEN,
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 5,
  },

  liveQualityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(6,78,59,0.78)",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },

  livePinnedNotice: {
    position: "absolute",
    left: 12,
    right: 58,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.42)",
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },

  livePinnedNoticeText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "800",
    lineHeight: 14,
    marginLeft: 7,
  },

  liveControlPanel: {
    backgroundColor: "rgba(255,253,248,0.92)",
    borderRadius: 18,
    padding: 9,
    marginTop: 2,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(229,217,195,0.85)",
  },

  liveCircleButtonActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  liveUtilityRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 4,
    marginBottom: 3,
  },

  liveUtilityChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MINT,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },

  liveUtilityText: {
    color: GREEN,
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 5,
  },

  liveSectionCounter: {
    color: GOLD,
    fontSize: 10,
    fontWeight: "900",
    backgroundColor: SOFT_GOLD,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  guestScrollRow: {
    marginBottom: 4,
  },

  liveCommentsList: {
    gap: 6,
  },

  liveModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10,21,17,0.42)",
    justifyContent: "flex-end",
  },

  liveModalOverlayFullscreen: {
    justifyContent: "center",
    backgroundColor: "#EEF4EF",
  },

  liveRoom: {
    backgroundColor: "#F6F3EA",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    height: "94%",
    padding: 13,
    flex: 1,
  },

  liveRoomFullscreen: {
    height: "100%",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: 10,
    backgroundColor: "#F3F6F1",
  },

  liveContentScroll: {
    flex: 1,
    minHeight: 0,
  },

  liveContentScrollContent: {
    paddingBottom: 14,
    flexGrow: 1,
  },

  liveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  liveHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  liveHeaderButton: {
    width: 37,
    height: 37,
    borderRadius: 14,
    backgroundColor: CARD,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5D9C3",
  },

  liveRoomTitle: {
    color: GREEN,
    fontSize: 20,
    fontWeight: "900",
  },

  liveRoomSub: {
    color: "#746A5D",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },

  liveCloseButton: {
    width: 37,
    height: 37,
    borderRadius: 14,
    backgroundColor: ROSE,
    justifyContent: "center",
    alignItems: "center",
  },

  cameraStage: {
    height: 300,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: GREEN,
    marginBottom: 14,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },

  cameraStageFullscreen: {
    height: 420,
    borderRadius: 20,
    marginBottom: 10,
  },

  cameraPreview: {
    flex: 1,
  },

  viewerStage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  liveAvatar: {
    width: 92,
    height: 92,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: GOLD,
    marginBottom: 12,
  },

  viewerStageTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },

  viewerStageSub: {
    color: "#DDF8EF",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 5,
  },

  liveOverlayTop: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ROSE,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },

  liveViewBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },

  liveBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 5,
  },

  liveFloatingStats: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    gap: 8,
  },

  liveFloatingText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
  },

  liveQuickRail: {
    position: "absolute",
    right: 8,
    top: 56,
    bottom: 58,
    width: 38,
    borderRadius: 24,
    backgroundColor: "rgba(5, 25, 19, 0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },

  liveQuickRailContent: {
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 4,
  },

  liveQuickRailLabel: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 7.5,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 4,
  },

  liveQuickButton: {
    width: 30,
    minHeight: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,253,248,0.94)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  liveQuickButtonGold: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(245,233,200,0.96)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.30)",
  },

  liveQuickEmoji: {
    fontSize: 13,
    fontWeight: "900",
  },

  liveQuickCount: {
    color: GREEN,
    fontSize: 7.5,
    fontWeight: "900",
    marginTop: -2,
  },

  liveQuickDivider: {
    width: 24,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.24)",
    marginVertical: 2,
  },

  liveControlRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    justifyContent: "center",
    marginBottom: 0,
  },

  liveCircleButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: CARD,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5D9C3",
  },

  liveJoinButton: {
    backgroundColor: GREEN,
    borderRadius: 15,
    paddingHorizontal: 12,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
  },

  liveJoinText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 5,
  },

  goLiveButton: {
    backgroundColor: ROSE,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 12,
    marginBottom: 4,
  },

  endLiveButton: {
    backgroundColor: "#3A1D1D",
  },

  goLiveText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 7,
  },

  liveMenuCard: {
    backgroundColor: "rgba(255,253,248,0.98)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5D9C3",
    padding: 7,
    marginTop: 0,
    marginBottom: 6,
    maxHeight: 218,
  },

  liveMenuToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  liveMenuToggleLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  liveMenuTitle: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
  },

  liveMenuSubtitle: {
    color: "#746A5D",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 1,
  },

  liveMenuState: {
    color: GOLD,
    fontSize: 11,
    fontWeight: "900",
  },

  liveBottomPanel: {
    borderTopWidth: 1,
    borderTopColor: "#EFE3CD",
    marginTop: 6,
    maxHeight: 158,
  },

  liveBottomPanelContent: {
    paddingTop: 3,
    paddingBottom: 12,
  },

  livePanelTitle: {
    color: GREEN,
    fontSize: 11.5,
    fontWeight: "900",
    marginTop: 5,
    marginBottom: 3,
  },

  liveReactionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  liveReactionPill: {
    backgroundColor: SOFT_GOLD,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  liveReactionEmoji: {
    fontSize: 13,
    fontWeight: "900",
  },

  liveReactionCount: {
    color: "#8A6A22",
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 4,
  },

  giftRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  giftPill: {
    backgroundColor: CARD,
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E5D9C3",
    alignItems: "center",
  },

  giftIcon: {
    fontSize: 20,
  },

  giftName: {
    color: GREEN,
    fontSize: 9.5,
    fontWeight: "900",
    marginTop: 2,
  },

  liveGuestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  smallInviteButton: {
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  smallInviteText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 5,
  },

  guestRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  guestChip: {
    backgroundColor: MINT,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  guestText: {
    color: GREEN,
    fontSize: 10.5,
    fontWeight: "900",
    marginLeft: 5,
  },

  joinRequestCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5D9C3",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  joinRequestName: {
    flex: 1,
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 7,
  },

  acceptButton: {
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 5,
  },

  liveCommentCard: {
    backgroundColor: CARD,
    borderRadius: 13,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E5D9C3",
    marginBottom: 5,
  },

  liveCommentAuthor: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
  },

  liveCommentText: {
    color: TEXT,
    fontSize: 11.2,
    lineHeight: 16,
    fontWeight: "700",
    marginTop: 3,
  },

  liveCommentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(6,78,59,0.10)",
    backgroundColor: CREAM,
    gap: 7,
  },

  liveCommentInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.12)",
    color: GREEN,
    fontWeight: "800",
  },

  liveCommentSend: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
  },

  liveCommentSendGold: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: ROSE,
    justifyContent: "center",
    alignItems: "center",
  },

  statsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 18,
    paddingVertical: 11,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.22)",
    shadowColor: "#2B2418",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  statNumber: {
    color: GREEN,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 5,
  },

  statLabel: {
    color: "#746A5D",
    fontSize: 10.5,
    fontWeight: "800",
    marginTop: 3,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    paddingHorizontal: 13,
    minHeight: 50,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.12)",
    marginBottom: 12,
    shadowColor: "#2B2418",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },

  searchInput: {
    flex: 1,
    color: GREEN,
    fontSize: 13.5,
    fontWeight: "800",
    paddingVertical: 13,
    marginLeft: 9,
    minHeight: 46,
  },

  searchClearButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: MINT,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  emptySearchCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5D9C3",
    alignItems: "center",
    marginBottom: 13,
  },

  emptySearchTitle: {
    color: GREEN,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 8,
  },

  emptySearchText: {
    color: TEXT,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    fontWeight: "700",
    marginTop: 4,
  },

  tabScroll: {
    marginBottom: 14,
  },

  tabPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.10)",
  },

  tabPillActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },

  tabText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 6,
  },

  tabTextActive: { color: "#FFFFFF" },

  guidelineCard: {
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.22)",
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
  },

  guidelineTitle: {
    color: GREEN,
    fontSize: 15,
    fontWeight: "900",
  },

  guidelineText: {
    color: TEXT,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 5,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.08)",
  },

  sectionTitle: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 7,
  },

  postCard: {
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.25)",
    marginBottom: 16,
    shadowColor: "#2B2418",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  postTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: MINT,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.10)",
  },

  avatarImage: { width: "100%", height: "100%" },

  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  authorName: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "900",
  },

  usernameText: {
    color: "#8A8172",
    fontSize: 10.5,
    fontWeight: "800",
    marginTop: 2,
  },

  postMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  postTime: {
    color: "#8A8172",
    fontSize: 10.5,
    fontWeight: "800",
    marginLeft: 4,
  },

  postDot: {
    color: "#8A8172",
    fontSize: 10.5,
    fontWeight: "900",
    marginHorizontal: 5,
  },

  postType: {
    color: GOLD,
    fontSize: 10.5,
    fontWeight: "900",
  },

  followButton: {
    backgroundColor: GREEN,
    width: 34,
    height: 34,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },

  postTitle: {
    color: GREEN,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    marginBottom: 7,
    letterSpacing: -0.15,
  },

  postBody: {
    color: TEXT,
    fontSize: 13.2,
    lineHeight: 20,
    fontWeight: "700",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SOFT_GOLD,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    marginTop: 10,
  },

  locationText: {
    color: "#8A6A22",
    fontSize: 10.5,
    fontWeight: "900",
    marginLeft: 5,
  },

  mediaGrid: { marginTop: 12, gap: 10 },

  mediaBox: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: MINT,
    borderWidth: 1,
    borderColor: "#E5D9C3",
  },

  mediaImage: { width: "100%", height: 240 },
  mediaVideo: { width: "100%", height: 260 },

  filePreview: {
    minHeight: 95,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },

  filePreviewText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8,
    textAlign: "center",
  },

  audioBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MINT,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 11,
    marginTop: 10,
    alignSelf: "flex-start",
  },

  audioBadgeText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 6,
  },

  reactionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(6,78,59,0.08)",
  },

  reactionPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SOFT_GOLD,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 9,
  },

  reactionEmoji: {
    fontSize: 12,
    fontWeight: "900",
  },

  reactionCount: {
    color: "#8A6A22",
    fontSize: 10.5,
    fontWeight: "900",
    marginLeft: 4,
  },

  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.80)",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.08)",
  },

  actionText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 5,
  },


  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10,19,16,0.42)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: CREAM,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 16,
    height: "92%",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 12,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(6,78,59,0.08)",
  },

  modalTitle: {
    flex: 1,
    color: GREEN,
    fontSize: 20,
    fontWeight: "900",
  },

  inputLabel: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 7,
    marginTop: 8,
  },

  createTypePill: {
    backgroundColor: CARD,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#E5D9C3",
    marginRight: 8,
    marginTop: 2,
    marginBottom: 10,
  },

  createTypePillActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  createTypeText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
  },

  createTypeTextActive: { color: "#FFFFFF" },

  modalInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: GREEN,
    fontWeight: "800",
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.12)",
    marginBottom: 12,
  },

  modalTextArea: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 150,
    color: GREEN,
    fontWeight: "800",
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.12)",
    marginBottom: 12,
  },

  modalTextAreaSmall: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 105,
    color: GREEN,
    fontWeight: "800",
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.12)",
    marginBottom: 12,
  },

  mediaToolGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  mediaTool: {
    width: "48%",
    backgroundColor: CARD,
    borderRadius: 17,
    padding: 13,
    borderWidth: 1,
    borderColor: "#E5D9C3",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  mediaToolText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 7,
  },

  recordButton: {
    backgroundColor: GREEN,
    borderRadius: 18,
    paddingVertical: 13,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 5,
  },

  recordButtonActive: { backgroundColor: ROSE },

  recordText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 7,
  },

  selectedMediaRow: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5D9C3",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  selectedMediaText: {
    flex: 1,
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 8,
  },

  publishButton: {
    backgroundColor: GREEN,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 20,
  },

  publishText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 7,
  },

  commentsTitle: {
    color: GREEN,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 10,
    marginTop: 5,
  },

  noComments: {
    color: "#8A8172",
    fontSize: 12.5,
    fontWeight: "800",
    marginBottom: 12,
  },

  commentCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: "#E5D9C3",
    marginBottom: 9,
  },

  commentTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  commentAuthor: {
    color: GREEN,
    fontSize: 12.5,
    fontWeight: "900",
    marginLeft: 6,
  },

  commentTime: {
    color: "#8A8172",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 8,
  },

  commentText: {
    color: TEXT,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 6,
  },

  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: Platform.OS === "ios" ? 8 : 14,
    paddingTop: 10,
    paddingBottom: 2,
    borderTopWidth: 1,
    borderTopColor: "#E5D9C3",
    backgroundColor: CREAM,
  },

  commentInput: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5D9C3",
    color: GREEN,
    fontWeight: "800",
  },

  commentSend: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  profileHero: {
    borderRadius: 30,
    padding: 22,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 6,
  },

  profileAvatar: {
    width: 108,
    height: 108,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 2.5,
    borderColor: GOLD,
  },

  profileAvatarImage: {
    width: "100%",
    height: "100%",
  },

  profileName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  profileUsername: {
    color: GOLD,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4,
  },

  profileBio: {
    color: "#E6FFF4",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
  },

  profilePhotoActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
    justifyContent: "center",
  },

  photoAction: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  photoActionText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 5,
  },

  photoActionDanger: {
    backgroundColor: ROSE,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  photoActionDangerText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 5,
  },

  profileStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  profileStatCard: {
    width: "32%",
    backgroundColor: CARD,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5D9C3",
  },

  profileStatNumber: {
    color: GREEN,
    fontSize: 15,
    fontWeight: "900",
  },

  profileStatLabel: {
    color: "#746A5D",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },

  simulateButton: {
    backgroundColor: GREEN,
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 12,
  },

  simulateButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 7,
  },


  contactInviteCard: {
    backgroundColor: CARD,
    borderRadius: 28,
    padding: 16,
    width: "100%",
    maxHeight: "88%",
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.10)",
  },

  contactInviteSubtitle: {
    color: "#746A5D",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },

  contactSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F4EFE2",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.08)",
  },

  contactSearchInput: {
    flex: 1,
    minHeight: 38,
    color: TEXT,
    fontSize: 13,
    fontWeight: "800",
  },

  contactInviteList: {
    paddingBottom: 18,
  },

  contactInviteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 11,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.08)",
  },

  contactInviteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: MINT,
    alignItems: "center",
    justifyContent: "center",
  },

  contactInviteName: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "900",
  },

  contactInvitePhone: {
    color: "#746A5D",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },

  contactInviteStatus: {
    color: EMERALD,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3,
  },

  contactInviteActions: {
    gap: 6,
    alignItems: "flex-end",
  },

  contactRequestButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  contactRequestText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  contactInviteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: MINT,
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  contactInviteButtonText: {
    color: GREEN,
    fontSize: 10,
    fontWeight: "900",
  },

  contactFollowerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: MINT,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  contactFollowerText: {
    color: GREEN,
    fontSize: 10,
    fontWeight: "900",
  },

  contactPendingButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EFE9DC",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  contactPendingText: {
    color: "#8A8172",
    fontSize: 10,
    fontWeight: "900",
  },

  contactAddButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  contactAddText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  avatarViewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
    paddingTop: 55,
    paddingHorizontal: 18,
  },

  avatarViewerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarViewerBack: {
    width: 43,
    height: 43,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarViewerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginLeft: 12,
  },

  avatarViewerBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },

  avatarViewerImage: {
    width: "100%",
    height: "82%",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(212,160,23,0.75)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  avatarViewerEmpty: {
    alignItems: "center",
  },

  avatarViewerEmptyText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 12,
  },

  avatarViewerActions: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 35,
    justifyContent: "center",
    flexWrap: "wrap",
  },

  avatarViewerButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  avatarViewerButtonText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },

  avatarViewerDanger: {
    backgroundColor: ROSE,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  avatarViewerDangerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },

  jobsHubCard: {
    borderRadius: 22,
    padding: 13,
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.25)",
    marginBottom: 16,
    shadowColor: "#2B2418",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  jobsHubTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  jobsIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  jobsHubTitle: { color: GREEN, fontSize: 15.5, fontWeight: "900" },

  jobsHubSubtitle: {
    color: TEXT,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "700",
    marginTop: 3,
  },

  jobsActionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  jobsPrimaryButton: {
    backgroundColor: GREEN,
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  jobsPrimaryText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 6,
  },

  jobsSecondaryButton: {
    backgroundColor: MINT,
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.08)",
  },

  jobsSecondaryText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 6,
  },

  jobsStatsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },

  jobMiniStat: {
    flex: 1,
    backgroundColor: MINT,
    borderRadius: 15,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.06)",
  },

  jobMiniValue: { color: GREEN, fontSize: 15, fontWeight: "900", marginTop: 4 },
  jobMiniLabel: {
    color: "#746A5D",
    fontSize: 9.5,
    fontWeight: "900",
    marginTop: 2,
    textAlign: "center",
  },

  jobsSectionTitle: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8,
    marginTop: 2,
  },

  jobGroupScroll: { marginBottom: 12 },

  jobGroupCard: {
    width: 205,
    backgroundColor: CARD,
    borderRadius: 17,
    padding: 11,
    borderWidth: 1,
    borderColor: "#E5D9C3",
    marginRight: 10,
  },

  jobGroupIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  jobGroupName: { color: GREEN, fontSize: 13.5, fontWeight: "900" },
  jobGroupProfession: {
    color: GOLD,
    fontSize: 10.5,
    fontWeight: "900",
    marginTop: 3,
  },
  jobGroupDescription: {
    color: TEXT,
    fontSize: 10.5,
    fontWeight: "700",
    lineHeight: 15,
    marginTop: 6,
  },

  jobGroupFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  jobGroupMembers: { color: "#746A5D", fontSize: 10, fontWeight: "900" },
  joinGroupButton: {
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  joinGroupText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },

  careerGuideRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MINT,
    borderRadius: 16,
    padding: 10,
    marginBottom: 7,
  },

  careerGuideText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 16,
    marginLeft: 8,
    flex: 1,
  },

  jobApplyPanel: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MINT,
    borderRadius: 18,
    padding: 11,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.08)",
  },

  jobApplyTitle: { color: GREEN, fontSize: 12, fontWeight: "900" },
  jobApplyText: {
    color: TEXT,
    fontSize: 10.2,
    fontWeight: "700",
    lineHeight: 14,
    marginTop: 2,
  },

  applyButton: {
    backgroundColor: GREEN,
    borderRadius: 15,
    paddingVertical: 9,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },

  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "900",
    marginLeft: 5,
  },

  statHint: {
    color: "#9A907F",
    fontSize: 9.5,
    fontWeight: "800",
    marginTop: 2,
  },

  postTopIconButton: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: "rgba(159,45,45,0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(159,45,45,0.14)",
    marginLeft: 6,
  },

  postTopIconButtonDanger: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: ROSE,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },

  managePostCardCompact: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(229,217,195,0.92)",
  },

  dashboardPrimaryAction: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  dashboardPrimaryActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 7,
  },

  dashboardSubtitle: {
    color: "#8A8172",
    fontSize: 11.5,
    fontWeight: "700",
    marginTop: 3,
  },

  dashboardTopGrid: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 14,
  },

  dashboardMiniCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.22)",
  },

  dashboardMiniValue: {
    color: GREEN,
    fontSize: 15,
    fontWeight: "900",
  },

  dashboardMiniLabel: {
    color: "#7D735F",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
    textAlign: "center",
  },

  managePostCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5D9C3",
    marginBottom: 12,
  },

  managePostTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  managePostType: {
    color: GOLD,
    fontSize: 10.5,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 4,
  },

  managePostTitle: {
    color: GREEN,
    fontSize: 15,
    fontWeight: "900",
  },

  managePostMeta: {
    color: "#8A8172",
    fontSize: 10.5,
    fontWeight: "800",
    marginTop: 4,
  },

  managePostBody: {
    color: TEXT,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 10,
  },

  ownerBadge: {
    backgroundColor: MINT,
    color: GREEN,
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
  },

  reactionSummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12,
  },

  reactionSummaryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F1DE",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.18)",
  },

  reactionSummaryEmoji: {
    fontSize: 12,
    marginRight: 5,
  },

  reactionSummaryText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
  },

  manageActionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 13,
    flexWrap: "wrap",
  },

  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: MINT,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  manageButtonText: {
    color: GREEN,
    fontSize: 11.5,
    fontWeight: "900",
  },

  manageDangerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: ROSE,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  manageDangerText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "900",
  },

  followerManageCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5D9C3",
    marginBottom: 10,
    gap: 10,
  },

  followerAvatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
  },

  followerName: {
    color: GREEN,
    fontSize: 13.5,
    fontWeight: "900",
  },

  followerMeta: {
    color: "#8A8172",
    fontSize: 10.5,
    fontWeight: "800",
    marginTop: 3,
  },

  blockButton: {
    backgroundColor: ROSE,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  unblockButton: {
    backgroundColor: MINT,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.18)",
  },

  blockText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  unblockText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
  },

  dashboardSectionTitle: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 14,
    marginBottom: 8,
  },

  searchResultsList: {
    maxHeight: 190,
    marginTop: 8,
  },

  searchResultCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.08)",
  },

  searchResultTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "900",
  },

  searchResultMeta: {
    color: "#786F62",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },

  messageTopActions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  messageTopChip: {
    backgroundColor: MINT,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  messageTopChipText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
  },

  messageTopChipGold: {
    minHeight: 32,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  messageTopChipGoldText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  suggestedFollowerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 11,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.08)",
  },

  suggestedAvatar: {
    width: 38,
    height: 38,
    borderRadius: 15,
    backgroundColor: MINT,
    alignItems: "center",
    justifyContent: "center",
  },

  suggestedName: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "900",
  },

  suggestedNote: {
    color: "#786F62",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },

  followSmallButton: {
    borderRadius: 999,
    backgroundColor: GREEN,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  followSmallButtonActive: {
    backgroundColor: MINT,
  },

  followSmallText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  followSmallTextActive: {
    color: GREEN,
  },

  settingSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },

  settingSwitchTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "900",
  },

  settingSwitchSubtitle: {
    color: "#786F62",
    fontSize: 10.5,
    fontWeight: "700",
    marginTop: 2,
  },


  liveCenterOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 16, 0.42)",
    justifyContent: "flex-end",
    padding: 12,
  },

  liveCenterCard: {
    backgroundColor: CREAM,
    borderRadius: 30,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    shadowColor: "#1D1710",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 14,
  },

  liveCenterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  liveCenterBackButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.10)",
  },

  liveCenterTitle: {
    color: GREEN,
    fontSize: 20,
    fontWeight: "900",
  },

  liveCenterSubtitle: {
    color: "#756D61",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  liveCenterHero: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
  },

  liveCenterHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  livePulseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  livePulseText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  liveCenterHeroCount: {
    color: "#F8E9B7",
    fontSize: 11,
    fontWeight: "900",
  },

  liveCenterHeroTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },

  liveCenterHeroText: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 6,
  },

  liveCenterActionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },

  liveCenterPrimaryAction: {
    width: "48%",
    minHeight: 96,
    borderRadius: 22,
    backgroundColor: GREEN,
    padding: 13,
    justifyContent: "space-between",
  },

  liveCenterSecondaryAction: {
    width: "48%",
    minHeight: 96,
    borderRadius: 22,
    backgroundColor: CARD,
    padding: 13,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.10)",
  },

  liveCenterPrimaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  liveCenterSecondaryText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "900",
  },

  liveCenterActionNote: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 10.5,
    fontWeight: "800",
  },

  liveCenterActionNoteDark: {
    color: "#82786A",
    fontSize: 10.5,
    fontWeight: "800",
  },

  liveCenterStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  liveCenterStat: {
    flex: 1,
    minHeight: 38,
    borderRadius: 15,
    backgroundColor: CARD,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.08)",
  },

  liveCenterStatText: {
    color: GREEN,
    fontSize: 10.5,
    fontWeight: "900",
  },

  liveCenterCloseWide: {
    minHeight: 45,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFE7D6",
  },

  liveCenterCloseText: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "900",
  },

  cameraChoiceRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  cameraChoiceChip: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 9,
    alignItems: "center",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.10)",
  },

  cameraChoiceChipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  cameraChoiceText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
  },

  cameraChoiceTextActive: {
    color: "#FFFFFF",
  },

  messageModalCardPro: {
    width: "100%",
    height: "100%",
    backgroundColor: CARD,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: Platform.OS === "ios" ? 18 : 10,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.20)",
  },
  messageHeaderPro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingBottom: 10,
  },
  messageBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MINT,
  },
  messageTitlePro: { fontSize: 20, fontWeight: "900", color: GREEN },
  messageSubtitlePro: { fontSize: 11, color: "#766F62", marginTop: 2 },
  messageNewButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GOLD,
  },
  messageSearchBoxPro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.14)",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  messageTopActionsPro: { flexDirection: "row", gap: 8, marginVertical: 10 },
  messageTopChipPro: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: MINT,
  },
  messageTopChipProActive: { backgroundColor: GREEN },
  messageTopChipTextActive: { color: "#FFFFFF" },
  messageBodyPro: { flexDirection: "row", gap: 10, minHeight: 420, maxHeight: 540 },
  messagePeopleColumn: {
    width: "36%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(6,78,59,0.10)",
  },
  messageColumnTitle: { fontSize: 12, fontWeight: "900", color: GREEN, marginBottom: 8 },
  chatListItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    padding: 8,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: CREAM,
  },
  chatListItemActive: { backgroundColor: GREEN },
  chatAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: MINT,
    alignItems: "center",
    justifyContent: "center",
  },
  chatName: { fontSize: 12, fontWeight: "900", color: TEXT },
  chatNameActive: { color: "#FFFFFF" },
  chatPreview: { fontSize: 10, color: "#7B7366" },
  chatPreviewActive: { color: "#E8F6EF" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD },
  messageThreadColumn: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(6,78,59,0.10)" },
  threadHeaderPro: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderBottomWidth: 1, borderBottomColor: "rgba(6,78,59,0.08)" },
  threadAvatarLarge: { width: 34, height: 34, borderRadius: 17, backgroundColor: MINT, alignItems: "center", justifyContent: "center" },
  threadName: { fontSize: 14, fontWeight: "900", color: GREEN },
  threadMeta: { fontSize: 10, color: "#7B7366" },
  threadUtilityButton: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: MINT },
  messageThreadPro: { flex: 1 },
  messageThreadContentPro: { padding: 10, gap: 8 },
  emptyThreadCard: { alignItems: "center", padding: 20, gap: 6 },
  emptyThreadTitle: { fontSize: 14, fontWeight: "900", color: GREEN },
  emptyThreadText: { fontSize: 11, color: "#7B7366", textAlign: "center" },
  messageBubblePro: { alignSelf: "flex-end", maxWidth: "88%", backgroundColor: MINT, borderRadius: 16, padding: 10, marginBottom: 8 },
  messageBubbleIncoming: { alignSelf: "flex-start", backgroundColor: SOFT_GOLD },
  messageDeleteTiny: { alignSelf: "flex-end", marginTop: 5 },
  messageComposerRowPro: { flexDirection: "row", alignItems: "flex-end", gap: 6, padding: 8, borderTopWidth: 1, borderTopColor: "rgba(6,78,59,0.08)" },
  messageInputPro: { flex: 1, minHeight: 40, maxHeight: 92, borderRadius: 16, backgroundColor: CREAM, paddingHorizontal: 12, paddingVertical: 10, color: TEXT },
  linkedHeaderBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 8, backgroundColor: "transparent", borderBottomWidth: 0 },
  headerProfileButton: { width: 43, height: 43, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.98)", alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 1, borderColor: "rgba(6,78,59,0.18)", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  headerProfileImage: { width: 43, height: 43, borderRadius: 22 },
  communityProSearchPill: { flex: 1, minHeight: 43, borderRadius: 24, borderWidth: 1.1, borderColor: "rgba(6,78,59,0.18)", backgroundColor: "rgba(255,255,255,0.98)", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 9, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  communityProSearchText: { flex: 1, fontSize: 15, color: "#5F6F68", fontWeight: "700" },
  headerCircleAction: { width: 40, height: 40, borderRadius: 20, backgroundColor: MINT, alignItems: "center", justifyContent: "center" },
  headerMessageAction: { width: 40, height: 40, borderRadius: 20, backgroundColor: GREEN, alignItems: "center", justifyContent: "center" },
  headerUnreadBadge: { position: "absolute", top: 7, right: 7, width: 9, height: 9, borderRadius: 5, backgroundColor: ROSE, borderWidth: 1.5, borderColor: "#FFFFFF" },
  bottomTabBarPro: { position: "absolute", left: 14, right: 14, bottom: Platform.OS === "ios" ? 38 : 34, minHeight: 64, paddingTop: 6, paddingBottom: Platform.OS === "ios" ? 10 : 8, paddingHorizontal: 8, backgroundColor: "rgba(255,255,255,0.99)", borderWidth: 1, borderColor: "rgba(6,78,59,0.10)", borderRadius: 30, flexDirection: "row", alignItems: "center", justifyContent: "space-around", shadowColor: "#000", shadowOpacity: 0.14, shadowRadius: 18, elevation: 22 },
  notificationsPageCard: { marginHorizontal: 14, marginTop: 10, marginBottom: 14, borderRadius: 22, backgroundColor: CARD, borderWidth: 1, borderColor: "rgba(6,78,59,0.10)", padding: 14, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  notificationsHeaderRow: { flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 10 },
  notificationIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: GREEN, alignItems: "center", justifyContent: "center" },
  notificationsTitle: { fontSize: 18, fontWeight: "900", color: GREEN },
  notificationsSubtitle: { fontSize: 12, color: "#706A5D", lineHeight: 17 },
  notificationsList: { maxHeight: 430 },
  notificationRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(6,78,59,0.07)" },
  notificationTitle: { fontSize: 13, fontWeight: "900", color: TEXT },
  notificationText: { fontSize: 12, color: "#756F64", lineHeight: 17 },
  notificationTime: { fontSize: 10, color: "#8A8172", fontWeight: "800" },
  creatorSelectedStrip: { borderRadius: 15, padding: 10, backgroundColor: "rgba(6,78,59,0.06)", borderWidth: 1, borderColor: "rgba(6,78,59,0.08)", marginBottom: 8 },
  creatorSelectedText: { fontSize: 12, color: "#706A5D", lineHeight: 18 },
  linkedMessagePage: { flex: 1, backgroundColor: "#FFFFFF", paddingTop: Platform.OS === "ios" ? 48 : 28 },
  communityProMessageHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#EEF0EC" },
  communityProBackButton: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  communityProMessageSearchBox: { flex: 1, minHeight: 42, borderRadius: 4, backgroundColor: "#F2F7F4", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12 },
  communityProMessageSearchInput: { flex: 1, fontSize: 16, color: TEXT, paddingVertical: 8 },
  communityProMoreButton: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  communityProMessageFilters: { maxHeight: 58, borderBottomWidth: 1, borderBottomColor: "#EEF0EC" },
  communityProMessageFiltersContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 10, alignItems: "center" },
  communityProFilterChip: { paddingHorizontal: 16, height: 38, borderRadius: 20, borderWidth: 1, borderColor: "#C7CEC9", justifyContent: "center", backgroundColor: "#FFFFFF" },
  communityProFilterChipActive: { backgroundColor: GREEN, borderColor: GREEN },
  communityProFilterText: { fontSize: 14, fontWeight: "800", color: TEXT },
  communityProFilterTextActive: { color: "#FFFFFF" },
  communityProInboxList: { flex: 1 },
  communityProConversationRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 11, borderBottomWidth: 1, borderBottomColor: "#EEF0EC", backgroundColor: "#FFFFFF" },
  communityProConversationUnread: { backgroundColor: "#EAF7F1" },
  communityProAvatarWrap: { position: "relative" },
  communityProConversationAvatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#DCE5EA", alignItems: "center", justifyContent: "center" },
  communityProOnlineDot: { position: "absolute", right: 1, bottom: 4, width: 12, height: 12, borderRadius: 6, backgroundColor: "#0A8F5A", borderWidth: 2, borderColor: "#FFFFFF" },
  communityProConversationBody: { flex: 1 },
  communityProConversationTopLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  communityProConversationName: { flex: 1, fontSize: 15, fontWeight: "900", color: TEXT },
  communityProConversationDate: { fontSize: 12, color: "#6F7773" },
  communityProConversationPreview: { marginTop: 3, fontSize: 13, color: "#38423E", lineHeight: 18 },
  communityProRequestLabel: { marginTop: 5, fontSize: 11, color: GREEN, fontWeight: "900" },
  communityProUnreadBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#0D7054", alignItems: "center", justifyContent: "center" },
  communityProUnreadText: { color: "#FFFFFF", fontWeight: "900", fontSize: 11 },
  communityProComposeFab: { position: "absolute", right: 22, bottom: 28, width: 58, height: 58, borderRadius: 29, backgroundColor: "#0D7054", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 10, elevation: 8 },
  communityProThreadHeader: { flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#EEF0EC" },
  communityProThreadAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#DCE5EA", alignItems: "center", justifyContent: "center" },
  communityProThreadName: { fontSize: 16, fontWeight: "900", color: TEXT },
  communityProThreadStatus: { fontSize: 12, color: "#5D6964" },
  communityProThreadScroll: { flex: 1, backgroundColor: "#FFFFFF" },
  communityProThreadContent: { padding: 16, paddingBottom: 24 },
  communityProProfileIntro: { alignItems: "flex-start", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#EEF0EC", marginBottom: 14 },
  communityProProfileBigAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#DCE5EA", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  communityProProfileName: { fontSize: 20, fontWeight: "900", color: TEXT },
  communityProProfileBio: { fontSize: 13, color: "#333", marginTop: 4, lineHeight: 18 },
  communityProThreadEmpty: { textAlign: "center", color: "#777", fontSize: 13, marginTop: 20 },
  communityProMessageBubble: { alignSelf: "flex-end", maxWidth: "86%", padding: 12, borderRadius: 14, backgroundColor: "#E9F7F1", marginBottom: 10, borderWidth: 1, borderColor: "#CFE8DC" },
  communityProMessageBubbleIncoming: { alignSelf: "flex-start", backgroundColor: "#F7F5EE", borderColor: "#E1DFDA" },
  communityProBubbleSender: { fontSize: 11, color: "#69736E", fontWeight: "800", marginBottom: 5 },
  communityProBubbleText: { fontSize: 14, color: TEXT, lineHeight: 20 },
  communityProAttachment: { marginTop: 6, fontSize: 12, color: GREEN, fontWeight: "800" },
  communityProDeleteMessage: { alignSelf: "flex-end", marginTop: 6 },
  communityProPendingMediaRow: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#F7F5EE", flexDirection: "row", flexWrap: "wrap", gap: 6 },
  communityProPendingMedia: { fontSize: 11, color: GREEN, backgroundColor: MINT, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  communityProComposerBar: { flexDirection: "row", alignItems: "flex-end", gap: 6, paddingHorizontal: 10, paddingTop: 8, paddingBottom: Platform.OS === "ios" ? 24 : 10, borderTopWidth: 1, borderTopColor: "#EEF0EC", backgroundColor: "#FFFFFF" },
  communityProComposerPlus: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#F3F6F4" },
  communityProComposerInput: { flex: 1, minHeight: 42, maxHeight: 96, borderRadius: 5, backgroundColor: "#F7F5EE", paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: TEXT },
  communityProVoiceButton: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  communityProSendButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#0D7054", alignItems: "center", justifyContent: "center" },

  recipientPickerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.28)", justifyContent: "flex-end" },
  recipientPickerSheet: { maxHeight: "88%", backgroundColor: "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingBottom: 18, shadowColor: "#000", shadowOpacity: 0.16, shadowRadius: 18, elevation: 20 },
  recipientPickerHeader: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(6,78,59,0.08)" },
  recipientPickerTitle: { fontSize: 20, fontWeight: "900", color: TEXT },
  recipientSearchRow: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 18, marginTop: 14, paddingHorizontal: 14, height: 50, borderRadius: 16, backgroundColor: "#F3F6F4", borderWidth: 1, borderColor: "rgba(6,78,59,0.08)" },
  recipientToLabel: { fontSize: 17, fontWeight: "800", color: TEXT },
  recipientSearchInput: { flex: 1, fontSize: 16, color: TEXT },
  recipientSuggestedTitle: { marginHorizontal: 20, marginTop: 18, marginBottom: 8, fontSize: 15, fontWeight: "900", color: TEXT },
  recipientList: { paddingHorizontal: 10 },
  recipientRow: { flexDirection: "row", alignItems: "center", gap: 13, paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(6,78,59,0.07)" },
  recipientAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: MINT, alignItems: "center", justifyContent: "center" },
  recipientName: { fontSize: 16, fontWeight: "900", color: TEXT },
  recipientMeta: { marginTop: 2, fontSize: 13, color: "#6E675D" },

  messageMenuOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  messageMenuBackdrop: { ...StyleSheet.absoluteFillObject },
  messageActionSheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 14, paddingBottom: 26, paddingHorizontal: 22, maxHeight: "82%" },
  sheetHandle: { width: 58, height: 6, borderRadius: 999, backgroundColor: "#1E1E1E", alignSelf: "center", marginBottom: 18, opacity: 0.8 },
  messageActionRow: { flexDirection: "row", alignItems: "center", gap: 20, paddingVertical: 13 },
  messageActionText: { fontSize: 18, color: "#5A5A5A", fontWeight: "700" },
  privacyPageOverlay: { flex: 1, backgroundColor: "#FFFFFF" },
  privacyPageCard: { flex: 1, backgroundColor: "#FFFFFF" },
  privacyHeader: { height: 62, flexDirection: "row", alignItems: "center", paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: "#EFEFEF", backgroundColor: "#FFFFFF" },
  privacyTitle: { flex: 1, fontSize: 23, fontWeight: "900", color: "#111111", marginLeft: 12 },
  privacyHelpButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#111111", alignItems: "center", justifyContent: "center" },
  privacySection: { borderTopWidth: 10, borderTopColor: "#EEECE5", backgroundColor: "#FFFFFF" },
  privacySectionTitle: { fontSize: 22, fontWeight: "900", color: "#111111", paddingHorizontal: 22, paddingTop: 22, paddingBottom: 12 },
  privacyRow: { minHeight: 64, flexDirection: "row", alignItems: "center", paddingHorizontal: 22, borderTopWidth: 1, borderTopColor: "#EFEFEF", backgroundColor: "#FFFFFF" },
  privacyRowText: { flex: 1, fontSize: 18, color: "#222222", lineHeight: 24 },
  privacyArrow: { fontSize: 32, color: "#8A8A8A", fontWeight: "300" },
  privacySwitchWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  privacyStateText: { fontSize: 17, color: "#777777", fontWeight: "700" },
  notificationsPageCardPro: { marginHorizontal: 12, marginTop: 10, marginBottom: 14, borderRadius: 20, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(6,78,59,0.08)", overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  notificationsHeaderRowPro: { flexDirection: "row", alignItems: "center", gap: 11, padding: 14, borderBottomWidth: 1, borderBottomColor: "rgba(6,78,59,0.08)" },
  markReadButton: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: MINT },
  markReadText: { fontSize: 11, fontWeight: "900", color: GREEN },
  notificationsMessageList: { maxHeight: 520 },
  notificationMessageRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 13, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "rgba(6,78,59,0.06)", backgroundColor: "#FFFFFF" },
  notificationMessageRowUnread: { backgroundColor: "#EAF3FF" },
  notificationMessageDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#0D7054" },
  notificationMessageDotRead: { backgroundColor: "transparent" },
  notificationMessageIconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(6,78,59,0.08)" },
  notificationMessageTopLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  notificationTitleUnread: { color: "#0D7054" },
  bottomBadge: { position: "absolute", top: -5, right: -7, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: ROSE, alignItems: "center", justifyContent: "center", paddingHorizontal: 4, borderWidth: 2, borderColor: "#FFFFFF" },
  bottomBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },

  communityProNotificationsPage: { marginHorizontal: -14, marginTop: 2, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E7E9E5" },
  notificationFilterScroll: { borderBottomWidth: 1, borderBottomColor: "#E4E7E3", backgroundColor: "#FFFFFF" },
  notificationFilterContent: { paddingHorizontal: 22, paddingVertical: 12, gap: 8, alignItems: "center" },
  notificationFilterChip: { paddingHorizontal: 18, height: 44, borderRadius: 22, borderWidth: 1.3, borderColor: "#C8D0CA", backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
  notificationFilterChipActive: { backgroundColor: "#07835F", borderColor: "#07835F" },
  notificationFilterText: { fontSize: 16, fontWeight: "800", color: "#5E6762" },
  notificationFilterTextActive: { color: "#FFFFFF" },
  communityProNotificationListWrap: { backgroundColor: "#FFFFFF" },
  communityProNotificationRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 14, paddingVertical: 13, gap: 10, borderBottomWidth: 1, borderBottomColor: "#E8ECE8", backgroundColor: "#FFFFFF" },
  communityProNotificationRowUnread: { backgroundColor: "#EAF7F1" },
  notificationUnreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#0D7054", marginTop: 28 },
  notificationUnreadDotHidden: { backgroundColor: "transparent" },
  communityProNotificationAvatarWrap: { width: 58, alignItems: "center", justifyContent: "center" },
  communityProNotificationAvatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#DCE5EA" },
  communityProNotificationAvatarFallback: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#DCE5EA", alignItems: "center", justifyContent: "center" },
  notificationCompanyLogo: { width: 54, height: 54, borderRadius: 6, backgroundColor: "#C91D1D", alignItems: "center", justifyContent: "center" },
  notificationCompanyLogoGold: { width: 54, height: 54, borderRadius: 27, backgroundColor: GOLD, alignItems: "center", justifyContent: "center" },
  communityProNotificationBody: { flex: 1, paddingTop: 2 },
  communityProNotificationText: { fontSize: 15, color: "#202623", lineHeight: 21 },
  communityProNotificationTitle: { fontWeight: "900", color: "#111111" },
  communityProNotificationRight: { width: 38, alignItems: "flex-end" },
  communityProNotificationTime: { fontSize: 12, color: "#777F7A", marginBottom: 10 },
  notificationMoreButton: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  communityProNotificationButton: { alignSelf: "flex-start", marginTop: 9, paddingHorizontal: 16, height: 38, borderRadius: 20, borderWidth: 1.2, borderColor: "#0D7054", justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" },
  communityProNotificationButtonText: { color: "#0D7054", fontWeight: "900", fontSize: 15 },
  notificationEmptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 46, paddingHorizontal: 24 },

  manageConversationsOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.28)", justifyContent: "flex-end" },
  manageConversationsPage: { height: "92%", backgroundColor: "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
  manageConversationsHeader: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(6,78,59,0.08)" },
  manageConversationsTitle: { fontSize: 21, fontWeight: "900", color: TEXT },
  manageConversationsSubtitle: { marginTop: 2, fontSize: 12, color: "#6E675D" },
  manageSelectAllButton: { paddingHorizontal: 14, height: 36, borderRadius: 18, backgroundColor: MINT, alignItems: "center", justifyContent: "center" },
  manageSelectAllText: { color: GREEN, fontSize: 13, fontWeight: "900" },
  manageBulkActions: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#FAFBF9" },
  manageBulkButton: { flex: 1, height: 42, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(6,78,59,0.14)", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  manageBulkButtonDanger: { flex: 1, height: 42, borderRadius: 14, backgroundColor: ROSE, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  manageBulkText: { color: GREEN, fontSize: 12, fontWeight: "900" },
  manageBulkTextDanger: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  manageSelectedCount: { paddingHorizontal: 18, paddingVertical: 8, color: "#6E675D", fontSize: 13, fontWeight: "800" },
  manageConversationList: { flex: 1 },
  manageConversationRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "rgba(6,78,59,0.07)", backgroundColor: "#FFFFFF" },
  manageConversationRowSelected: { backgroundColor: "#EEF7F3" },
  manageCheckCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: "rgba(6,78,59,0.28)", alignItems: "center", justifyContent: "center" },
  manageCheckCircleActive: { backgroundColor: GREEN, borderColor: GREEN },
  manageCheckText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  manageConversationAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: MINT, alignItems: "center", justifyContent: "center" },
  manageConversationTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  manageConversationName: { flex: 1, fontSize: 15, color: TEXT, fontWeight: "900" },
  manageConversationPreview: { marginTop: 2, fontSize: 13, color: "#6E675D" },
  manageUnreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#0A66C2" },

});
