
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Share,
  Switch,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import {
  Search,
  Download,
  Pause,
  Play,
  RefreshCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Video,
  Music,
  BookOpen,
  Award,
  Wifi,
  WifiOff,
  HardDrive,
  FolderOpen,
  Settings,
  Clock,
  ShieldCheck,
  Lock,
  Star,
  MoreVertical,
  X,
  Share2,
  Eye,
  CloudOff,
  Database,
  Archive,
  Filter,
  SortAsc,
  Bell,
  BatteryCharging,
  Smartphone,
  BookMarked,
  GraduationCap,
  Image as ImageIcon,
  Headphones,
  FileCheck2,
  ListChecks,
  Sparkles,
  ChevronRight,
  CircleGauge,
  Eraser,
  Save,
  RotateCcw,
} from 'lucide-react-native';

type Tab = 'Home' | 'Library' | 'Queue' | 'Storage' | 'Settings';
type DownloadType = 'Course' | 'PDF' | 'Video' | 'Audio' | 'Article' | 'Certificate' | 'Image' | 'Quiz';
type DownloadStatus = 'Downloaded' | 'Downloading' | 'Paused' | 'Queued' | 'Failed' | 'Expired';
type DownloadQuality = 'Low' | 'Medium' | 'High' | 'Original';
type SortMode = 'Recent' | 'Name' | 'Size' | 'Type';

type OfflineItem = {
  id: string;
  title: string;
  subtitle: string;
  type: DownloadType;
  status: DownloadStatus;
  progress: number;
  sizeMB: number;
  downloadedMB: number;
  quality: DownloadQuality;
  category: string;
  dateAdded: string;
  lastOpened?: string;
  expiresInDays?: number;
  encrypted: boolean;
  favorite: boolean;
  autoUpdate: boolean;
  availableOffline: boolean;
};

type OfflineSettings = {
  wifiOnly: boolean;
  autoDownloadNewLessons: boolean;
  autoUpdateDownloads: boolean;
  backgroundDownloads: boolean;
  lowBatteryPause: boolean;
  encryptedStorage: boolean;
  notifications: boolean;
  deleteExpiredAutomatically: boolean;
  preferredQuality: DownloadQuality;
  maxStorageMB: number;
};

const GREEN = '#064E3B';
const EMERALD = '#0D7054';
const GOLD = '#D4A017';
const CREAM = '#F7F5EE';
const CARD = '#FFFDF8';
const MINT = '#E6F1EC';
const TEXT = '#3C3A34';
const ROSE = '#9F2D2D';
const BLUE = '#1D4ED8';

const DEFAULT_SETTINGS: OfflineSettings = {
  wifiOnly: true,
  autoDownloadNewLessons: false,
  autoUpdateDownloads: true,
  backgroundDownloads: true,
  lowBatteryPause: true,
  encryptedStorage: true,
  notifications: true,
  deleteExpiredAutomatically: false,
  preferredQuality: 'Medium',
  maxStorageMB: 5000,
};

const DEFAULT_ITEMS: OfflineItem[] = [
  {
    id: 'd1',
    title: 'Foundations of Islamic Belief',
    subtitle: 'Full course: notes, exercises, final exam guide',
    type: 'Course',
    status: 'Downloaded',
    progress: 100,
    sizeMB: 850,
    downloadedMB: 850,
    quality: 'High',
    category: 'Courses',
    dateAdded: 'Today',
    lastOpened: '2 hours ago',
    expiresInDays: 90,
    encrypted: true,
    favorite: true,
    autoUpdate: true,
    availableOffline: true,
  },
  {
    id: 'd2',
    title: 'Tawheed Summary Map.pdf',
    subtitle: 'PDF handout with revision questions',
    type: 'PDF',
    status: 'Downloaded',
    progress: 100,
    sizeMB: 18,
    downloadedMB: 18,
    quality: 'Original',
    category: 'PDF Handouts',
    dateAdded: 'Yesterday',
    lastOpened: 'Yesterday',
    expiresInDays: 120,
    encrypted: true,
    favorite: false,
    autoUpdate: true,
    availableOffline: true,
  },
  {
    id: 'd3',
    title: 'Arabic Reading Lesson 4',
    subtitle: 'Video lesson with subtitles and practice drills',
    type: 'Video',
    status: 'Downloading',
    progress: 64,
    sizeMB: 420,
    downloadedMB: 269,
    quality: 'Medium',
    category: 'Videos',
    dateAdded: 'Today',
    expiresInDays: 30,
    encrypted: true,
    favorite: false,
    autoUpdate: false,
    availableOffline: false,
  },
  {
    id: 'd4',
    title: 'Hadith Character Audio Pack',
    subtitle: 'Audio lessons for listening offline',
    type: 'Audio',
    status: 'Queued',
    progress: 0,
    sizeMB: 230,
    downloadedMB: 0,
    quality: 'High',
    category: 'Audio',
    dateAdded: 'Today',
    expiresInDays: 60,
    encrypted: true,
    favorite: false,
    autoUpdate: true,
    availableOffline: false,
  },
  {
    id: 'd5',
    title: 'Certificate of Completion',
    subtitle: 'Offline certificate copy with certificate number',
    type: 'Certificate',
    status: 'Downloaded',
    progress: 100,
    sizeMB: 4,
    downloadedMB: 4,
    quality: 'Original',
    category: 'Certificates',
    dateAdded: 'This week',
    lastOpened: 'This week',
    encrypted: true,
    favorite: true,
    autoUpdate: false,
    availableOffline: true,
  },
  {
    id: 'd6',
    title: 'Islamic Finance Final Exam Pack',
    subtitle: 'Exercises, exam rules, and revision notes',
    type: 'Quiz',
    status: 'Paused',
    progress: 31,
    sizeMB: 95,
    downloadedMB: 29,
    quality: 'Original',
    category: 'Exams',
    dateAdded: 'Today',
    expiresInDays: 45,
    encrypted: true,
    favorite: false,
    autoUpdate: true,
    availableOffline: false,
  },
  {
    id: 'd7',
    title: 'Seerah Mercy and Leadership Article',
    subtitle: 'Article saved for offline reading',
    type: 'Article',
    status: 'Failed',
    progress: 52,
    sizeMB: 12,
    downloadedMB: 6,
    quality: 'Original',
    category: 'Articles',
    dateAdded: 'Today',
    encrypted: false,
    favorite: false,
    autoUpdate: false,
    availableOffline: false,
  },
];

export default function OfflineDownloadsPage() {
  const [tab, setTab] = useState<Tab>('Home');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<OfflineItem[]>(DEFAULT_ITEMS);
  const [settings, setSettings] = useState<OfflineSettings>(DEFAULT_SETTINGS);
  const [selectedItem, setSelectedItem] = useState<OfflineItem | null>(null);
  const [selectedType, setSelectedType] = useState<DownloadType | 'All'>('All');
  const [sortMode, setSortMode] = useState<SortMode>('Recent');
  const [isOnline, setIsOnline] = useState(true);

  const filteredItems = useMemo(() => {
    const s = query.toLowerCase();
    const base = items.filter(item => {
      const matchesType = selectedType === 'All' || item.type === selectedType;
      const matchesText =
        item.title.toLowerCase().includes(s) ||
        item.subtitle.toLowerCase().includes(s) ||
        item.category.toLowerCase().includes(s) ||
        item.type.toLowerCase().includes(s);
      return matchesType && matchesText;
    });

    return [...base].sort((a, b) => {
      if (sortMode === 'Name') return a.title.localeCompare(b.title);
      if (sortMode === 'Size') return b.sizeMB - a.sizeMB;
      if (sortMode === 'Type') return a.type.localeCompare(b.type);
      return 0;
    });
  }, [items, query, selectedType, sortMode]);

  const downloadedItems = items.filter(item => item.status === 'Downloaded');
  const queueItems = items.filter(item => ['Downloading', 'Paused', 'Queued', 'Failed'].includes(item.status));
  const usedStorage = items.reduce((sum, item) => sum + item.downloadedMB, 0);
  const totalDownloadSize = items.reduce((sum, item) => sum + item.sizeMB, 0);
  const storagePercent = Math.min(100, Math.round((usedStorage / settings.maxStorageMB) * 100));
  const downloadedCount = downloadedItems.length;
  const failedCount = items.filter(item => item.status === 'Failed').length;

  const updateItem = (id: string, changes: Partial<OfflineItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...changes } : item));
    setSelectedItem(prev => prev?.id === id ? { ...prev, ...changes } : prev);
  };

  const startDownload = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    if (settings.wifiOnly && !isOnline) {
      Alert.alert('Wi-Fi Required', 'This download is waiting for Wi-Fi because Wi-Fi-only downloads are enabled.');
      updateItem(id, { status: 'Queued' });
      return;
    }

    updateItem(id, { status: 'Downloading' });
  };

  const pauseDownload = (id: string) => updateItem(id, { status: 'Paused' });
  const retryDownload = (id: string) => updateItem(id, { status: 'Downloading', progress: Math.max(5, items.find(i => i.id === id)?.progress || 0) });

  const completeDownload = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    updateItem(id, {
      status: 'Downloaded',
      progress: 100,
      downloadedMB: item.sizeMB,
      availableOffline: true,
      lastOpened: 'Just now',
    });
  };

  const deleteDownload = (id: string) => {
    Alert.alert('Delete Download', 'Remove this item from offline storage?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'Queued', progress: 0, downloadedMB: 0, availableOffline: false } : item));
          setSelectedItem(null);
        },
      },
    ]);
  };

  const deleteAllDownloads = () => {
    Alert.alert('Clear Offline Library', 'This removes all downloaded files but keeps them in your cloud/library list.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: () => setItems(prev => prev.map(item => ({ ...item, status: 'Queued', progress: 0, downloadedMB: 0, availableOffline: false }))),
      },
    ]);
  };

  const toggleFavorite = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) updateItem(id, { favorite: !item.favorite });
  };

  const toggleAutoUpdate = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) updateItem(id, { autoUpdate: !item.autoUpdate });
  };

  const simulateProgress = () => {
    setItems(prev => prev.map(item => {
      if (item.status !== 'Downloading') return item;
      const nextProgress = Math.min(100, item.progress + 12);
      const nextDownloaded = Math.round((nextProgress / 100) * item.sizeMB);
      return {
        ...item,
        progress: nextProgress,
        downloadedMB: nextDownloaded,
        status: nextProgress >= 100 ? 'Downloaded' : 'Downloading',
        availableOffline: nextProgress >= 100,
      };
    }));
  };

  const downloadAllQueued = () => {
    setItems(prev => prev.map(item => item.status === 'Queued' || item.status === 'Paused' || item.status === 'Failed' ? { ...item, status: 'Downloading' } : item));
  };

  const renderContent = () => {
    if (tab === 'Home') {
      return (
        <>
          <StatsGrid />

          <LinearGradient colors={[GREEN, EMERALD]} style={styles.featureCard}>
            <Text style={styles.featureKicker}>Offline Learning Center</Text>
            <Text style={styles.featureTitle}>Study anywhere without internet.</Text>
            <Text style={styles.featureText}>Download courses, videos, PDFs, certificates, articles, audio lessons and exams for safe offline access.</Text>
            <View style={styles.connectionRow}>
              {isOnline ? <Wifi size={17} color={GOLD} /> : <WifiOff size={17} color={GOLD} />}
              <Text style={styles.connectionText}>{isOnline ? 'Online — downloads can continue' : 'Offline mode — only saved content is available'}</Text>
            </View>
          </LinearGradient>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickButton} onPress={downloadAllQueued}>
              <Download size={20} color="#FFFFFF" />
              <Text style={styles.quickButtonText}>Download Queue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickButtonGold} onPress={simulateProgress}>
              <CircleGauge size={20} color="#FFFFFF" />
              <Text style={styles.quickButtonText}>Update Progress</Text>
            </TouchableOpacity>
          </View>

          <SectionTitle icon={<Clock size={18} color={GOLD} />} title="Active Downloads" />
          {queueItems.slice(0, 4).map(item => <DownloadCard key={item.id} item={item} />)}

          <SectionTitle icon={<FolderOpen size={18} color={GOLD} />} title="Recently Available Offline" />
          {downloadedItems.slice(0, 3).map(item => <DownloadCard key={item.id} item={item} />)}
        </>
      );
    }

    if (tab === 'Library') {
      return (
        <>
          <FilterBar />
          {filteredItems.map(item => <DownloadCard key={item.id} item={item} />)}
        </>
      );
    }

    if (tab === 'Queue') {
      return (
        <>
          <View style={styles.queueHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.queueTitle}>Download Queue</Text>
              <Text style={styles.queueText}>{queueItems.length} item(s) waiting, paused, failed, or downloading.</Text>
            </View>
            <TouchableOpacity style={styles.queueButton} onPress={downloadAllQueued}>
              <Play size={16} color="#FFFFFF" />
              <Text style={styles.queueButtonText}>Start All</Text>
            </TouchableOpacity>
          </View>
          {queueItems.map(item => <DownloadCard key={item.id} item={item} />)}
        </>
      );
    }

    if (tab === 'Storage') {
      return (
        <>
          <LinearGradient colors={[GREEN, EMERALD]} style={styles.storageHero}>
            <HardDrive size={34} color={GOLD} />
            <Text style={styles.storageTitle}>{usedStorage.toLocaleString()} MB used</Text>
            <Text style={styles.storageText}>of {settings.maxStorageMB.toLocaleString()} MB offline storage limit</Text>
            <View style={styles.storageTrack}><View style={[styles.storageFill, { width: `${storagePercent}%` }]} /></View>
            <Text style={styles.storagePercent}>{storagePercent}% used</Text>
          </LinearGradient>

          <SectionTitle icon={<Database size={18} color={GOLD} />} title="Storage Breakdown" />
          <StorageRow type="Course" />
          <StorageRow type="Video" />
          <StorageRow type="Audio" />
          <StorageRow type="PDF" />
          <StorageRow type="Certificate" />
          <StorageRow type="Article" />
          <StorageRow type="Quiz" />

          <TouchableOpacity style={styles.dangerButton} onPress={deleteAllDownloads}>
            <Eraser size={18} color="#FFFFFF" />
            <Text style={styles.dangerButtonText}>Clear Offline Downloads</Text>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <>
        <SectionTitle icon={<Settings size={18} color={GOLD} />} title="Offline Download Settings" />
        <SettingSwitch icon={<Wifi size={18} color={GOLD} />} title="Download on Wi-Fi only" subtitle="Prevents large downloads on mobile data." value={settings.wifiOnly} onValueChange={value => setSettings({ ...settings, wifiOnly: value })} />
        <SettingSwitch icon={<BookOpen size={18} color={GOLD} />} title="Auto-download new lessons" subtitle="Automatically download new course lessons you follow." value={settings.autoDownloadNewLessons} onValueChange={value => setSettings({ ...settings, autoDownloadNewLessons: value })} />
        <SettingSwitch icon={<RefreshCcw size={18} color={GOLD} />} title="Auto-update downloads" subtitle="Keep saved notes, exams and courses updated." value={settings.autoUpdateDownloads} onValueChange={value => setSettings({ ...settings, autoUpdateDownloads: value })} />
        <SettingSwitch icon={<Smartphone size={18} color={GOLD} />} title="Background downloads" subtitle="Continue downloads while using other pages." value={settings.backgroundDownloads} onValueChange={value => setSettings({ ...settings, backgroundDownloads: value })} />
        <SettingSwitch icon={<BatteryCharging size={18} color={GOLD} />} title="Pause on low battery" subtitle="Protect battery while downloading large videos." value={settings.lowBatteryPause} onValueChange={value => setSettings({ ...settings, lowBatteryPause: value })} />
        <SettingSwitch icon={<Lock size={18} color={GOLD} />} title="Encrypted offline storage" subtitle="Protect downloaded certificates, exams and private notes." value={settings.encryptedStorage} onValueChange={value => setSettings({ ...settings, encryptedStorage: value })} />
        <SettingSwitch icon={<Bell size={18} color={GOLD} />} title="Download notifications" subtitle="Notify when downloads finish or fail." value={settings.notifications} onValueChange={value => setSettings({ ...settings, notifications: value })} />
        <SettingSwitch icon={<Archive size={18} color={GOLD} />} title="Delete expired automatically" subtitle="Remove expired temporary files from storage." value={settings.deleteExpiredAutomatically} onValueChange={value => setSettings({ ...settings, deleteExpiredAutomatically: value })} />

        <SectionTitle icon={<Video size={18} color={GOLD} />} title="Preferred Quality" />
        <QualitySelector />

        <SectionTitle icon={<HardDrive size={18} color={GOLD} />} title="Storage Limit" />
        <View style={styles.limitCard}>
          <Text style={styles.limitTitle}>{settings.maxStorageMB.toLocaleString()} MB</Text>
          <Text style={styles.limitText}>Offline download storage limit</Text>
          <View style={styles.limitButtons}>
            {[1000, 2500, 5000, 10000].map(size => (
              <TouchableOpacity key={size} style={[styles.limitPill, settings.maxStorageMB === size && styles.limitPillActive]} onPress={() => setSettings({ ...settings, maxStorageMB: size })}>
                <Text style={[styles.limitPillText, settings.maxStorageMB === size && styles.limitPillTextActive]}>{size / 1000}GB</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.connectionToggle} onPress={() => setIsOnline(!isOnline)}>
          {isOnline ? <Wifi size={18} color="#FFFFFF" /> : <WifiOff size={18} color="#FFFFFF" />}
          <Text style={styles.connectionToggleText}>{isOnline ? 'Simulate Offline Mode' : 'Simulate Online Mode'}</Text>
        </TouchableOpacity>
      </>
    );
  };

  function StatsGrid() {
    return (
      <View style={styles.statsGrid}>
        <StatCard icon={<FolderOpen size={21} color={GOLD} />} value={`${downloadedCount}`} label="Offline" />
        <StatCard icon={<Clock size={21} color={GOLD} />} value={`${queueItems.length}`} label="Queue" />
        <StatCard icon={<HardDrive size={21} color={GOLD} />} value={`${storagePercent}%`} label="Storage" />
      </View>
    );
  }

  function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
    return (
      <View style={styles.statCard}>
        {icon}
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  }

  function FilterBar() {
    const types: (DownloadType | 'All')[] = ['All', 'Course', 'PDF', 'Video', 'Audio', 'Article', 'Certificate', 'Image', 'Quiz'];
    return (
      <>
        <View style={styles.filterTopRow}>
          <View style={styles.filterLabelBox}>
            <Filter size={16} color={GOLD} />
            <Text style={styles.filterLabel}>Filter</Text>
          </View>
          <TouchableOpacity style={styles.sortButton} onPress={() => {
            const modes: SortMode[] = ['Recent', 'Name', 'Size', 'Type'];
            const index = modes.indexOf(sortMode);
            setSortMode(modes[(index + 1) % modes.length]);
          }}>
            <SortAsc size={16} color={GREEN} />
            <Text style={styles.sortText}>{sortMode}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          {types.map(type => {
            const active = selectedType === type;
            return (
              <TouchableOpacity key={type} style={[styles.typePill, active && styles.typePillActive]} onPress={() => setSelectedType(type)}>
                <Text style={[styles.typeText, active && styles.typeTextActive]}>{type}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </>
    );
  }

  function DownloadCard({ item }: { item: OfflineItem }) {
    return (
      <TouchableOpacity style={styles.downloadCard} onPress={() => setSelectedItem(item)}>
        <View style={[styles.fileIconBox, { backgroundColor: statusColor(item.status, true) }]}>
          {typeIcon(item.type, '#FFFFFF')}
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.downloadTopRow}>
            <Text style={styles.downloadType}>{item.type}</Text>
            <StatusPill status={item.status} />
          </View>
          <Text style={styles.downloadTitle}>{item.title}</Text>
          <Text style={styles.downloadSubtitle} numberOfLines={2}>{item.subtitle}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{item.downloadedMB}/{item.sizeMB} MB</Text>
            <Text style={styles.metaText}>• {item.quality}</Text>
            {item.encrypted && <Text style={styles.metaText}>• Encrypted</Text>}
          </View>
          {item.status !== 'Downloaded' && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${item.progress}%`, backgroundColor: statusColor(item.status) }]} />
            </View>
          )}
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
            <Star size={20} color={item.favorite ? GOLD : GREEN} fill={item.favorite ? GOLD : 'transparent'} />
          </TouchableOpacity>
          <ActionButton item={item} />
        </View>
      </TouchableOpacity>
    );
  }

  function ActionButton({ item }: { item: OfflineItem }) {
    if (item.status === 'Downloaded') {
      return <TouchableOpacity onPress={() => Alert.alert('Open Offline', `${item.title} is ready offline.`)}><Eye size={20} color={GREEN} /></TouchableOpacity>;
    }
    if (item.status === 'Downloading') {
      return <TouchableOpacity onPress={() => pauseDownload(item.id)}><Pause size={20} color={GREEN} /></TouchableOpacity>;
    }
    if (item.status === 'Failed') {
      return <TouchableOpacity onPress={() => retryDownload(item.id)}><RefreshCcw size={20} color={ROSE} /></TouchableOpacity>;
    }
    return <TouchableOpacity onPress={() => startDownload(item.id)}><Download size={20} color={GREEN} /></TouchableOpacity>;
  }

  function StatusPill({ status }: { status: DownloadStatus }) {
    return (
      <View style={[styles.statusPill, { backgroundColor: statusColor(status, true) }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
  }

  function StorageRow({ type }: { type: DownloadType }) {
    const typeItems = items.filter(item => item.type === type);
    const used = typeItems.reduce((sum, item) => sum + item.downloadedMB, 0);
    const count = typeItems.length;
    return (
      <View style={styles.storageRow}>
        <View style={styles.storageIcon}>{typeIcon(type, GOLD)}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.storageRowTitle}>{type}</Text>
          <Text style={styles.storageRowText}>{count} item(s)</Text>
        </View>
        <Text style={styles.storageRowSize}>{used} MB</Text>
      </View>
    );
  }

  function SettingSwitch({ icon, title, subtitle, value, onValueChange }: { icon: React.ReactNode; title: string; subtitle: string; value: boolean; onValueChange: (value: boolean) => void }) {
    return (
      <View style={styles.settingCard}>
        <View style={styles.settingIcon}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
        <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#D8CBB5', true: EMERALD }} thumbColor={value ? GOLD : '#FFFFFF'} />
      </View>
    );
  }

  function QualitySelector() {
    const qualities: DownloadQuality[] = ['Low', 'Medium', 'High', 'Original'];
    return (
      <View style={styles.qualityGrid}>
        {qualities.map(quality => {
          const active = settings.preferredQuality === quality;
          return (
            <TouchableOpacity key={quality} style={[styles.qualityCard, active && styles.qualityCardActive]} onPress={() => setSettings({ ...settings, preferredQuality: quality })}>
              <Text style={[styles.qualityTitle, active && styles.qualityTitleActive]}>{quality}</Text>
              <Text style={[styles.qualityText, active && styles.qualityTextActive]}>{qualityDescription(quality)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.goldGlow} />
        <View style={styles.greenGlow} />

        <LinearGradient colors={[GREEN, EMERALD]} style={styles.hero}>
          <View style={styles.heroHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.brandRow}>
                <Sparkles size={18} color={GOLD} />
                <Text style={styles.heroKicker}>Chafadia Noor Offline</Text>
              </View>
              <Text style={styles.heroTitle}>Offline Downloads</Text>
              <Text style={styles.heroSubtitle}>Courses • PDFs • Videos • Audio • Exams • Certificates</Text>
            </View>
            <View style={styles.heroIcon}>
              <CloudOff size={32} color={GOLD} />
            </View>
          </View>
          <Text style={styles.heroArabic}>العِلْمُ مَعَكَ أَيْنَمَا كُنْتَ</Text>
          <Text style={styles.heroDua}>Your learning stays with you wherever you are.</Text>
        </LinearGradient>

        <View style={styles.searchBox}>
          <Search size={18} color={GREEN} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search offline files, courses, PDFs..."
            placeholderTextColor="#8A8172"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          {(['Home', 'Library', 'Queue', 'Storage', 'Settings'] as Tab[]).map(item => {
            const active = tab === item;
            return (
              <TouchableOpacity key={item} style={[styles.tabPill, active && styles.tabPillActive]} onPress={() => setTab(item)}>
                {tabIcon(item, active ? '#FFFFFF' : GREEN)}
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {renderContent()}
      </ScrollView>

      <Modal visible={!!selectedItem} animationType="slide">
        <SafeAreaView style={styles.safeArea}>
          {selectedItem && (
            <ScrollView contentContainerStyle={styles.detailPage} showsVerticalScrollIndicator={false}>
              <LinearGradient colors={[GREEN, EMERALD]} style={styles.detailHero}>
                <View style={styles.detailTopRow}>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedItem(null)}>
                    <X size={20} color={GREEN} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.closeButton} onPress={() => Share.share({ message: `${selectedItem.title}\n${selectedItem.subtitle}` })}>
                    <Share2 size={20} color={GREEN} />
                  </TouchableOpacity>
                </View>
                <View style={styles.detailIconLarge}>{typeIcon(selectedItem.type, GOLD)}</View>
                <Text style={styles.detailType}>{selectedItem.type}</Text>
                <Text style={styles.detailTitle}>{selectedItem.title}</Text>
                <Text style={styles.detailSubtitle}>{selectedItem.subtitle}</Text>
              </LinearGradient>

              <View style={styles.detailCard}>
                <Text style={styles.detailSectionTitle}>Download Details</Text>
                <DetailRow icon={<HardDrive size={17} color={GOLD} />} label="Size" value={`${selectedItem.downloadedMB}/${selectedItem.sizeMB} MB`} />
                <DetailRow icon={<CircleGauge size={17} color={GOLD} />} label="Progress" value={`${selectedItem.progress}%`} />
                <DetailRow icon={<CheckCircle2 size={17} color={GOLD} />} label="Status" value={selectedItem.status} />
                <DetailRow icon={<Video size={17} color={GOLD} />} label="Quality" value={selectedItem.quality} />
                <DetailRow icon={<FolderOpen size={17} color={GOLD} />} label="Category" value={selectedItem.category} />
                <DetailRow icon={<Clock size={17} color={GOLD} />} label="Added" value={selectedItem.dateAdded} />
                <DetailRow icon={<ShieldCheck size={17} color={GOLD} />} label="Encrypted" value={selectedItem.encrypted ? 'Yes' : 'No'} />
                <DetailRow icon={<RefreshCcw size={17} color={GOLD} />} label="Auto-update" value={selectedItem.autoUpdate ? 'Enabled' : 'Disabled'} />
                {selectedItem.expiresInDays && <DetailRow icon={<Archive size={17} color={GOLD} />} label="Expires" value={`${selectedItem.expiresInDays} days`} />}
              </View>

              <View style={styles.detailActionsGrid}>
                {selectedItem.status === 'Downloaded' ? (
                  <TouchableOpacity style={styles.detailActionButton} onPress={() => Alert.alert('Open Offline', `${selectedItem.title} is ready offline.`)}>
                    <Eye size={18} color="#FFFFFF" />
                    <Text style={styles.detailActionText}>Open</Text>
                  </TouchableOpacity>
                ) : selectedItem.status === 'Downloading' ? (
                  <TouchableOpacity style={styles.detailActionButton} onPress={() => pauseDownload(selectedItem.id)}>
                    <Pause size={18} color="#FFFFFF" />
                    <Text style={styles.detailActionText}>Pause</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.detailActionButton} onPress={() => startDownload(selectedItem.id)}>
                    <Download size={18} color="#FFFFFF" />
                    <Text style={styles.detailActionText}>Download</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.detailActionButtonGold} onPress={() => completeDownload(selectedItem.id)}>
                  <CheckCircle2 size={18} color="#FFFFFF" />
                  <Text style={styles.detailActionText}>Complete</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.detailActionButton} onPress={() => toggleAutoUpdate(selectedItem.id)}>
                  <RefreshCcw size={18} color="#FFFFFF" />
                  <Text style={styles.detailActionText}>{selectedItem.autoUpdate ? 'Auto On' : 'Auto Off'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.detailActionButtonDanger} onPress={() => deleteDownload(selectedItem.id)}>
                  <Trash2 size={18} color="#FFFFFF" />
                  <Text style={styles.detailActionText}>Delete</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.securityCard}>
                <Lock size={21} color={GOLD} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.securityTitle}>Offline protection</Text>
                  <Text style={styles.securityText}>Use encrypted storage for certificates, exams, student notes and private learning data.</Text>
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <View style={styles.sectionTitle}>
      {icon}
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      {icon}
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function tabIcon(tab: Tab, color: string) {
  if (tab === 'Home') return <CloudOff size={15} color={color} />;
  if (tab === 'Library') return <FolderOpen size={15} color={color} />;
  if (tab === 'Queue') return <Clock size={15} color={color} />;
  if (tab === 'Storage') return <HardDrive size={15} color={color} />;
  return <Settings size={15} color={color} />;
}

function typeIcon(type: DownloadType, color: string) {
  if (type === 'Course') return <GraduationCap size={22} color={color} />;
  if (type === 'PDF') return <FileText size={22} color={color} />;
  if (type === 'Video') return <Video size={22} color={color} />;
  if (type === 'Audio') return <Headphones size={22} color={color} />;
  if (type === 'Article') return <BookOpen size={22} color={color} />;
  if (type === 'Certificate') return <Award size={22} color={color} />;
  if (type === 'Image') return <ImageIcon size={22} color={color} />;
  return <ListChecks size={22} color={color} />;
}

function statusColor(status: DownloadStatus, solid = false) {
  if (status === 'Downloaded') return solid ? GREEN : GREEN;
  if (status === 'Downloading') return solid ? BLUE : BLUE;
  if (status === 'Paused') return solid ? GOLD : GOLD;
  if (status === 'Queued') return solid ? '#6B6257' : '#6B6257';
  if (status === 'Failed') return solid ? ROSE : ROSE;
  return solid ? '#7C2D12' : '#7C2D12';
}

function qualityDescription(quality: DownloadQuality) {
  if (quality === 'Low') return 'Smallest file size';
  if (quality === 'Medium') return 'Balanced quality';
  if (quality === 'High') return 'Best for videos';
  return 'Keep original file';
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: CREAM },
  container: { flex: 1 },
  content: { paddingHorizontal: 15, paddingTop: 18, paddingBottom: 45 },
  goldGlow: { position: 'absolute', top: -80, right: -90, width: 230, height: 230, borderRadius: 999, backgroundColor: GOLD, opacity: 0.16 },
  greenGlow: { position: 'absolute', top: 420, left: -110, width: 240, height: 240, borderRadius: 999, backgroundColor: GREEN, opacity: 0.08 },
  hero: { borderRadius: 34, padding: 19, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 18, elevation: 8 },
  heroHeader: { flexDirection: 'row', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroKicker: { color: GOLD, fontSize: 13, fontWeight: '900' },
  heroTitle: { color: '#FFFFFF', fontSize: 31, fontWeight: '900', marginTop: 4, letterSpacing: -0.5 },
  heroSubtitle: { color: '#E6FFF4', fontSize: 12, fontWeight: '700', marginTop: 6, lineHeight: 18 },
  heroIcon: { width: 58, height: 58, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center' },
  heroArabic: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 18 },
  heroDua: { color: '#FFF4D6', textAlign: 'center', marginTop: 6, fontWeight: '800' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  searchInput: { flex: 1, color: GREEN, fontWeight: '800', marginLeft: 8 },
  tabScroll: { marginBottom: 14 },
  tabPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#E5D9C3', marginRight: 8 },
  tabPillActive: { backgroundColor: GREEN, borderColor: GREEN },
  tabText: { color: GREEN, fontSize: 11, fontWeight: '900', marginLeft: 6 },
  tabTextActive: { color: '#FFFFFF' },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 24, borderWidth: 1, borderColor: '#E5D9C3', padding: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  statValue: { color: GREEN, fontSize: 20, fontWeight: '900', marginTop: 6 },
  statLabel: { color: '#8A8172', fontSize: 10, fontWeight: '900', textAlign: 'center', marginTop: 3 },
  featureCard: { borderRadius: 28, padding: 18, marginBottom: 15 },
  featureKicker: { color: GOLD, fontWeight: '900', fontSize: 12 },
  featureTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginTop: 7 },
  featureText: { color: '#E6FFF4', fontSize: 13, fontWeight: '700', lineHeight: 20, marginTop: 8 },
  connectionRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 13, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 11 },
  connectionText: { color: '#FFFFFF', fontWeight: '800', fontSize: 11, flex: 1 },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  quickButton: { flex: 1, backgroundColor: GREEN, borderRadius: 20, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  quickButtonGold: { flex: 1, backgroundColor: GOLD, borderRadius: 20, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  quickButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, marginBottom: 10 },
  sectionTitleText: { color: GREEN, fontSize: 17, fontWeight: '900' },
  filterTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  filterLabelBox: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  filterLabel: { color: GREEN, fontWeight: '900' },
  sortButton: { backgroundColor: CARD, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: '#E5D9C3' },
  sortText: { color: GREEN, fontWeight: '900', fontSize: 11 },
  typeScroll: { marginBottom: 12 },
  typePill: { backgroundColor: CARD, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 13, borderWidth: 1, borderColor: '#E5D9C3', marginRight: 8 },
  typePillActive: { backgroundColor: GREEN, borderColor: GREEN },
  typeText: { color: GREEN, fontWeight: '900', fontSize: 11 },
  typeTextActive: { color: '#FFFFFF' },
  downloadCard: { backgroundColor: CARD, borderRadius: 26, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', gap: 12, marginBottom: 11, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 9, elevation: 2 },
  fileIconBox: { width: 52, height: 52, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  downloadTopRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  downloadType: { color: GOLD, fontWeight: '900', fontSize: 10 },
  statusPill: { borderRadius: 999, paddingVertical: 3, paddingHorizontal: 7 },
  statusText: { color: '#FFFFFF', fontWeight: '900', fontSize: 9 },
  downloadTitle: { color: GREEN, fontWeight: '900', fontSize: 15, marginTop: 4 },
  downloadSubtitle: { color: '#6B6257', fontWeight: '700', fontSize: 12, lineHeight: 18, marginTop: 4 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  metaText: { color: '#8A8172', fontWeight: '800', fontSize: 10, marginRight: 4 },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: '#E5D9C3', overflow: 'hidden', marginTop: 9 },
  progressFill: { height: '100%', borderRadius: 999 },
  cardActions: { alignItems: 'center', justifyContent: 'space-between', paddingVertical: 3 },
  queueHeader: { backgroundColor: CARD, borderRadius: 26, padding: 15, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  queueTitle: { color: GREEN, fontWeight: '900', fontSize: 18 },
  queueText: { color: '#6B6257', fontWeight: '700', lineHeight: 19, marginTop: 5 },
  queueButton: { backgroundColor: GREEN, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 5 },
  queueButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 11 },
  storageHero: { borderRadius: 30, padding: 20, marginBottom: 13, alignItems: 'center' },
  storageTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 30, marginTop: 10 },
  storageText: { color: '#E6FFF4', fontWeight: '800', marginTop: 4 },
  storageTrack: { width: '100%', height: 13, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden', marginTop: 15 },
  storageFill: { height: '100%', backgroundColor: GOLD, borderRadius: 999 },
  storagePercent: { color: GOLD, fontWeight: '900', marginTop: 8 },
  storageRow: { backgroundColor: CARD, borderRadius: 22, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 9 },
  storageIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' },
  storageRowTitle: { color: GREEN, fontWeight: '900' },
  storageRowText: { color: '#8A8172', fontWeight: '800', fontSize: 11, marginTop: 3 },
  storageRowSize: { color: GOLD, fontWeight: '900' },
  dangerButton: { backgroundColor: ROSE, borderRadius: 20, paddingVertical: 14, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 8 },
  dangerButtonText: { color: '#FFFFFF', fontWeight: '900' },
  settingCard: { backgroundColor: CARD, borderRadius: 24, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  settingIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' },
  settingTitle: { color: GREEN, fontWeight: '900', fontSize: 14 },
  settingSubtitle: { color: '#6B6257', fontWeight: '700', lineHeight: 18, fontSize: 11, marginTop: 3 },
  qualityGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  qualityCard: { width: '48.5%', backgroundColor: CARD, borderRadius: 22, padding: 14, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 10 },
  qualityCardActive: { backgroundColor: GREEN, borderColor: GREEN },
  qualityTitle: { color: GREEN, fontWeight: '900', fontSize: 15 },
  qualityTitleActive: { color: '#FFFFFF' },
  qualityText: { color: '#6B6257', fontWeight: '700', marginTop: 5, fontSize: 11 },
  qualityTextActive: { color: '#E6FFF4' },
  limitCard: { backgroundColor: CARD, borderRadius: 26, padding: 15, borderWidth: 1, borderColor: '#E5D9C3', marginBottom: 12 },
  limitTitle: { color: GREEN, fontWeight: '900', fontSize: 24 },
  limitText: { color: '#6B6257', fontWeight: '800', marginTop: 4 },
  limitButtons: { flexDirection: 'row', gap: 8, marginTop: 13 },
  limitPill: { flex: 1, backgroundColor: CREAM, borderRadius: 999, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5D9C3' },
  limitPillActive: { backgroundColor: GREEN, borderColor: GREEN },
  limitPillText: { color: GREEN, fontWeight: '900', fontSize: 11 },
  limitPillTextActive: { color: '#FFFFFF' },
  connectionToggle: { backgroundColor: GREEN, borderRadius: 20, paddingVertical: 14, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 10 },
  connectionToggleText: { color: '#FFFFFF', fontWeight: '900' },
  detailPage: { paddingBottom: 35 },
  detailHero: { padding: 18, borderBottomLeftRadius: 34, borderBottomRightRadius: 34, alignItems: 'center' },
  detailTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch' },
  closeButton: { width: 42, height: 42, borderRadius: 999, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  detailIconLarge: { width: 74, height: 74, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  detailType: { color: GOLD, fontWeight: '900', marginTop: 12 },
  detailTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', textAlign: 'center', marginTop: 7 },
  detailSubtitle: { color: '#E6FFF4', fontWeight: '700', lineHeight: 21, textAlign: 'center', marginTop: 7 },
  detailCard: { backgroundColor: CARD, borderRadius: 26, padding: 16, borderWidth: 1, borderColor: '#E5D9C3', margin: 15 },
  detailSectionTitle: { color: GREEN, fontWeight: '900', fontSize: 17, marginBottom: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#EFE5D4' },
  detailLabel: { color: '#6B6257', fontWeight: '800', flex: 1 },
  detailValue: { color: GREEN, fontWeight: '900' },
  detailActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginHorizontal: 15 },
  detailActionButton: { width: '48.5%', backgroundColor: GREEN, borderRadius: 20, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 7, marginBottom: 10 },
  detailActionButtonGold: { width: '48.5%', backgroundColor: GOLD, borderRadius: 20, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 7, marginBottom: 10 },
  detailActionButtonDanger: { width: '48.5%', backgroundColor: ROSE, borderRadius: 20, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 7, marginBottom: 10 },
  detailActionText: { color: '#FFFFFF', fontWeight: '900' },
  securityCard: { backgroundColor: '#FFF8E7', borderRadius: 24, padding: 15, borderWidth: 1, borderColor: '#E5D9C3', flexDirection: 'row', gap: 11, marginHorizontal: 15, marginTop: 6 },
  securityTitle: { color: GREEN, fontWeight: '900', fontSize: 15 },
  securityText: { color: TEXT, fontWeight: '700', lineHeight: 19, marginTop: 4 },
});
