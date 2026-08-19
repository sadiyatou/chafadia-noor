import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  Alert, Image, KeyboardAvoidingView, Platform, ActivityIndicator,
  RefreshControl, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { io, Socket } from 'socket.io-client';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {
  Search, Plus, Send, Phone, Video, ArrowLeft,
  CheckCheck, Users, MessageCircle,
  Paperclip, Mic, Play, Pause, FileText, Trash2,
} from 'lucide-react-native';
import api, { BASE_URL, getToken } from '../../api/client';
import { getCurrentUser } from '../../api/auth';
import { uploadVoiceNote, uploadChatMedia, uploadDocument } from '../../api/upload';
import { Audio, Video as AVVideo, ResizeMode } from '../../utils/safeAV';
import CallOverlay from '../../components/CallOverlay';
import useCall from '../../hooks/useCall';

// ── Theme ─────────────────────────────────────────────────────────
const GREEN  = '#063B28';
const GOLD   = '#D4A017';
const CREAM  = '#F7F5EE';
const BUBBLE_ME   = GREEN;
const BUBBLE_THEM = '#fff';

// ── Types ─────────────────────────────────────────────────────────
interface Chat {
  id: number; type: 'private' | 'group'; name: string; photoURL?: string;
  otherUserId?: number;
  lastMessage?: string; lastMessageType?: string; lastMessageTime?: string;
  unread: number; muted: boolean; pinned: boolean; memberCount: number;
}
interface Message {
  id: number; chatId: number; senderId: number; senderName: string; senderPhoto?: string;
  type: string; text: string; mediaUrl?: string; isOwn: boolean;
  createdAt: string; edited: boolean; reactions: any[];
}
interface Person { id: number; fullName: string; email?: string; phone?: string; photoURL?: string; isOnline: boolean; }

// ── Helpers ───────────────────────────────────────────────────────
function timeAgo(iso?: string) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function fullTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function Avatar({ uri, name, size = 44, online }: { uri?: string; name: string; size?: number; online?: boolean }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <View style={{ position: 'relative' }}>
      {uri
        ? <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
        : <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.35 }}>{initials}</Text>
          </View>
      }
      {online !== undefined && (
        <View style={{ position: 'absolute', bottom: 1, right: 1, width: size * 0.27, height: size * 0.27, borderRadius: 999, backgroundColor: online ? '#22c55e' : '#9ca3af', borderWidth: 1.5, borderColor: '#fff' }} />
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────
export default function MessagesScreen() {
  const { openChatId, openChatName } = useLocalSearchParams<{ openChatId?: string; openChatName?: string }>();
  const [view, setView]               = useState<'list' | 'chat' | 'newchat' | 'call'>('list');
  const [chats, setChats]             = useState<Chat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [activeChat, setActiveChat]   = useState<Chat | null>(null);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [msgLoading, setMsgLoading]   = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending]         = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<number, string>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [search, setSearch]           = useState('');
  const [people, setPeople]           = useState<Person[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleSearch, setPeopleSearch]   = useState('');
  // Voice note / attachment state
  const [isRecording, setIsRecording]   = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [playingId, setPlayingId]       = useState<number | null>(null);

  const socketRef    = useRef<Socket | null>(null);
  const typingTimer  = useRef<any>(null);
  const flatListRef  = useRef<FlatList>(null);
  const activeChatId = useRef<number | null>(null);
  const recordingRef = useRef<any>(null);
  const recordTimerRef = useRef<any>(null);
  const soundRef      = useRef<any>(null);
  // The socket-setup effect below only runs once on mount (before
  // getCurrentUser() resolves), so its closures must read this ref rather
  // than `currentUser` directly or they'd always see the initial `null`.
  const currentUserRef = useRef<any>(null);
  currentUserRef.current = currentUser;

  const callHook = useCall(currentUser);

  // ── Init current user ──
  useEffect(() => { getCurrentUser().then(setCurrentUser); }, []);

  // ── Cleanup recording/playback resources on unmount ──
  useEffect(() => () => {
    clearInterval(recordTimerRef.current);
    recordingRef.current?.stopAndUnloadAsync?.().catch(() => {});
    soundRef.current?.unloadAsync?.().catch(() => {});
  }, []);

  // ── Socket.io ──
  useEffect(() => {
    let socket: Socket;
    getToken().then(token => {
      if (!token) return;
      socket = io(BASE_URL, { auth: { token }, transports: ['websocket'] });
      socketRef.current = socket;

      socket.on('user:online',  ({ userId }: any) => setOnlineUsers(s => new Set(s).add(userId)));
      socket.on('user:offline', ({ userId }: any) => setOnlineUsers(s => { const n = new Set(s); n.delete(userId); return n; }));

      socket.on('chat:message', (msg: Message) => {
        // The server broadcasts to the whole chat room, including the
        // sender's own socket — our own messages are already added
        // optimistically (and reconciled with the real row) by sendMessage()/
        // sendMedia(), so applying this event too would race the REST
        // response and can insert a second, wrongly-attributed bubble.
        const isOwnMessage = msg.senderId === currentUserRef.current?.id;

        // Add to messages if we're in this chat
        if (!isOwnMessage && msg.chatId === activeChatId.current) {
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          // Mark as read
          socket.emit('chat:markRead', { chatId: msg.chatId });
        }
        // Update chat list preview
        setChats(prev => prev.map(c => c.id === msg.chatId
          ? { ...c, lastMessage: msg.text || msg.type, lastMessageTime: msg.createdAt, unread: c.id === activeChatId.current ? 0 : c.unread + 1 }
          : c
        ).sort((a, b) => {
          if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
          return new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime();
        }));
      });

      socket.on('chat:typing', ({ chatId, userId: uid, typing, senderName }: any) => {
        if (chatId !== activeChatId.current) return;
        setTypingUsers(prev => {
          const next = { ...prev };
          if (typing) next[uid] = senderName || 'Someone';
          else delete next[uid];
          return next;
        });
      });

      // ── Call signaling (peer connection lifecycle lives in useCall) ──
      callHook.attachSocket(socket);
    });
    return () => { socket?.disconnect(); };
  }, []);

  // ── Load chats ──
  const fetchChats = useCallback(async () => {
    setChatsLoading(true);
    try {
      const { data } = await api.get('/chats');
      if (data.success) setChats(data.chats);
    } catch {}
    finally { setChatsLoading(false); }
  }, []);

  useEffect(() => { fetchChats(); }, []);

  // ── Auto-open chat when navigated from People tab ──
  useEffect(() => {
    if (!openChatId || chatsLoading) return;
    const id = parseInt(openChatId);
    const found = chats.find(c => c.id === id);
    if (found) {
      openChat(found);
    } else {
      // Chat not in list yet (just created) — open with minimal info
      openChat({ id, type: 'private', name: openChatName || 'Chat', unread: 0, muted: false, pinned: false, memberCount: 2 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openChatId, chatsLoading]);

  // ── Open a chat ──
  const openChat = async (chat: Chat) => {
    setActiveChat(chat);
    activeChatId.current = chat.id;
    setView('chat');
    setMessages([]);
    setMsgLoading(true);
    socketRef.current?.emit('chat:join', chat.id);
    try {
      const { data } = await api.get(`/chats/${chat.id}/messages`);
      if (data.success) setMessages(data.messages);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    } catch {}
    finally { setMsgLoading(false); }
    // Clear unread
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
    socketRef.current?.emit('chat:markRead', { chatId: chat.id });
  };

  const closeChat = () => {
    socketRef.current?.emit('chat:leave', activeChat?.id);
    activeChatId.current = null;
    setView('list');
    setActiveChat(null);
    setMessages([]);
    setTypingUsers({});
    setMessageText('');
  };

  // ── Send message ──
  const sendMessage = async () => {
    if (!messageText.trim() || !activeChat || sending) return;
    const text = messageText.trim();
    setMessageText('');
    setSending(true);

    // Optimistic message
    const temp: Message = {
      id: Date.now(), chatId: activeChat.id, senderId: currentUser?.id,
      senderName: currentUser?.fullName || 'Me', type: 'text',
      text, isOwn: true, createdAt: new Date().toISOString(), edited: false, reactions: [],
    };
    setMessages(prev => [...prev, temp]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const { data } = await api.post(`/chats/${activeChat.id}/messages`, { type: 'text', text });
      if (data.success) {
        // Replace temp with real message
        setMessages(prev => prev.map(m => m.id === temp.id ? { ...data.message, isOwn: true } : m));
        setChats(prev => prev.map(c => c.id === activeChat.id
          ? { ...c, lastMessage: text, lastMessageTime: data.message.createdAt }
          : c
        ));
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== temp.id));
      Alert.alert('Error', 'Message failed to send.');
    }
    setSending(false);
  };

  // ── Send a media message (image/video/audio/file) after upload ──
  const sendMediaMessage = async (type: 'image' | 'video' | 'audio' | 'file', mediaUrl: string, fileName?: string, previewText?: string) => {
    if (!activeChat) return;
    const temp: Message = {
      id: Date.now(), chatId: activeChat.id, senderId: currentUser?.id,
      senderName: currentUser?.fullName || 'Me', type,
      text: previewText || '', mediaUrl, isOwn: true, createdAt: new Date().toISOString(), edited: false, reactions: [],
    };
    setMessages(prev => [...prev, temp]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const { data } = await api.post(`/chats/${activeChat.id}/messages`, {
        type, text: previewText || '', mediaUrl, fileName: fileName || '',
      });
      if (data.success) {
        setMessages(prev => prev.map(m => m.id === temp.id ? { ...data.message, isOwn: true } : m));
        const previewMap: Record<string, string> = { image: 'Image', video: 'Video', audio: 'Voice note', file: fileName || 'File' };
        setChats(prev => prev.map(c => c.id === activeChat.id
          ? { ...c, lastMessage: previewMap[type], lastMessageTime: data.message.createdAt }
          : c
        ));
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== temp.id));
      Alert.alert('Error', 'Message failed to send.');
    }
  };

  // ── Voice notes ──
  const startVoiceRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission needed', 'Allow microphone access to send voice notes.'); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      recordingRef.current = rec;
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000);
    } catch {
      Alert.alert('Recording error', 'Unable to start recording.');
    }
  };

  const cancelVoiceRecording = async () => {
    clearInterval(recordTimerRef.current);
    setIsRecording(false);
    setRecordSeconds(0);
    try { await recordingRef.current?.stopAndUnloadAsync(); } catch {}
    recordingRef.current = null;
  };

  const stopAndSendVoiceRecording = async () => {
    clearInterval(recordTimerRef.current);
    setIsRecording(false);
    const rec = recordingRef.current;
    recordingRef.current = null;
    if (!rec || recordSeconds < 1) { try { await rec?.stopAndUnloadAsync(); } catch {} return; }
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      if (!uri) return;
      setUploadingMedia(true);
      const up = await uploadVoiceNote(uri);
      setUploadingMedia(false);
      if (up.success) await sendMediaMessage('audio', up.url, up.filename);
      else Alert.alert('Upload failed', 'Could not send voice note.');
    } catch {
      setUploadingMedia(false);
      Alert.alert('Error', 'Could not send voice note.');
    }
  };

  // ── Attachments ──
  const pickAttachment = () => {
    Alert.alert('Send attachment', 'Choose what to share', [
      { text: 'Photo', onPress: () => pickMedia('image') },
      { text: 'Video', onPress: () => pickMedia('video') },
      { text: 'Document', onPress: pickDoc },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const pickMedia = async (kind: 'image' | 'video') => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission needed', 'Allow photo library access to share media.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: kind === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const name = asset.fileName || `${kind}_${Date.now()}.${kind === 'image' ? 'jpg' : 'mp4'}`;
    const mimeType = asset.mimeType || (kind === 'image' ? 'image/jpeg' : 'video/mp4');
    setUploadingMedia(true);
    try {
      const up = await uploadChatMedia(asset.uri, name, mimeType);
      if (up.success) await sendMediaMessage(kind, up.url, up.filename);
      else Alert.alert('Upload failed', 'Could not send file.');
    } catch { Alert.alert('Error', 'Could not upload file.'); }
    setUploadingMedia(false);
  };

  const pickDoc = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setUploadingMedia(true);
    try {
      const up = await uploadDocument(asset.uri, asset.name, asset.mimeType || 'application/octet-stream');
      if (up.success) await sendMediaMessage('file', up.url, up.filename, asset.name);
      else Alert.alert('Upload failed', 'Could not send file.');
    } catch { Alert.alert('Error', 'Could not upload file.'); }
    setUploadingMedia(false);
  };

  // ── Audio playback for received/sent voice notes ──
  const toggleAudioPlayback = async (m: Message) => {
    if (!m.mediaUrl) return;
    if (playingId === m.id) {
      try { await soundRef.current?.stopAsync(); await soundRef.current?.unloadAsync(); } catch {}
      soundRef.current = null;
      setPlayingId(null);
      return;
    }
    try { await soundRef.current?.unloadAsync(); } catch {}
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: m.mediaUrl }, { shouldPlay: true });
      soundRef.current = sound;
      setPlayingId(m.id);
      sound.setOnPlaybackStatusUpdate?.((status: any) => {
        if (status.didJustFinish) { setPlayingId(null); sound.unloadAsync(); }
      });
    } catch {
      Alert.alert('Playback error', 'Could not play this voice note.');
    }
  };

  // ── Typing indicator ──
  const handleTyping = (text: string) => {
    setMessageText(text);
    if (!activeChat) return;
    socketRef.current?.emit('chat:typing', { chatId: activeChat.id, typing: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('chat:typing', { chatId: activeChat.id, typing: false });
    }, 1500);
  };

  // ── Start call ──
  const initiateCall = (type: 'voice' | 'video') => {
    if (!activeChat) return;
    callHook.startCall(type, activeChat.otherUserId ?? null, activeChat.name, activeChat.id);
  };

  // ── New chat: search users ──
  const openNewChat = () => {
    setPeopleSearch('');
    setPeople([]);
    setView('newchat');
  };

  useEffect(() => {
    if (view !== 'newchat') return;
    const t = setTimeout(async () => {
      setPeopleLoading(true);
      try {
        const { data } = await api.get('/users', { params: { q: peopleSearch, limit: 20 } });
        if (data.success) setPeople(data.users || []);
      } catch {}
      finally { setPeopleLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [peopleSearch, view]);

  const startChatWith = async (person: Person) => {
    try {
      const { data } = await api.post('/chats/private', { receiverId: person.id });
      if (data.success) {
        await fetchChats();
        // Find or build a chat object and open it
        const chatObj: Chat = {
          id: data.chatId, type: 'private', name: person.fullName,
          photoURL: person.photoURL, unread: 0, muted: false, pinned: false, memberCount: 2,
        };
        openChat(chatObj);
      }
    } catch { Alert.alert('Error', 'Could not start chat.'); }
  };

  const filteredChats = chats.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()));
  const typingText = Object.values(typingUsers).join(', ');

  // ── Render: Chat List ──
  if (view === 'list') return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[GREEN, '#0B5D3B']} style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity style={styles.headerBtn} onPress={openNewChat}>
            <Plus size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchBox}>
          <Search size={15} color="#9b9b9b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            placeholderTextColor="#9b9b9b"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </LinearGradient>

      {chatsLoading
        ? <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={filteredChats}
            keyExtractor={c => String(c.id)}
            refreshControl={<RefreshControl refreshing={false} onRefresh={fetchChats} tintColor={GREEN} />}
            contentContainerStyle={{ paddingVertical: 8 }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MessageCircle size={48} color="#d1d5db" />
                <Text style={styles.emptyTitle}>No conversations yet</Text>
                <Text style={styles.emptyText}>Tap + to start a new chat</Text>
                <TouchableOpacity style={styles.startBtn} onPress={openNewChat}>
                  <Text style={styles.startBtnText}>Start a conversation</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item: c }) => (
              <TouchableOpacity style={styles.chatRow} onPress={() => openChat(c)} activeOpacity={0.7}>
                <Avatar uri={c.photoURL} name={c.name || '?'} size={50} online={undefined} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.chatName} numberOfLines={1}>{c.name}</Text>
                    <Text style={styles.chatTime}>{timeAgo(c.lastMessageTime)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                    <Text style={styles.chatPreview} numberOfLines={1}>
                      {c.lastMessage || 'Tap to open'}
                    </Text>
                    {c.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{c.unread > 99 ? '99+' : c.unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )
      }
    </SafeAreaView>
  );

  // ── Render: New Chat ──
  if (view === 'newchat') return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[GREEN, '#0B5D3B']} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => setView('list')}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Chat</Text>
        </View>
        <View style={styles.searchBox}>
          <Search size={15} color="#9b9b9b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            placeholderTextColor="#9b9b9b"
            value={peopleSearch}
            onChangeText={setPeopleSearch}
            autoFocus
          />
        </View>
      </LinearGradient>

      {peopleLoading
        ? <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={people.filter(p => currentUser && p.id !== currentUser.id)}
            keyExtractor={p => String(p.id)}
            contentContainerStyle={{ paddingVertical: 8 }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Users size={40} color="#d1d5db" />
                <Text style={styles.emptyText}>{peopleSearch ? 'No users found' : 'Search for someone to message'}</Text>
              </View>
            }
            renderItem={({ item: p }) => (
              <TouchableOpacity style={styles.chatRow} onPress={() => startChatWith(p)} activeOpacity={0.7}>
                <Avatar uri={p.photoURL} name={p.fullName} size={48} online={onlineUsers.has(p.id)} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.chatName}>{p.fullName}</Text>
                  <Text style={styles.chatPreview}>{p.email || p.phone || ''}</Text>
                </View>
                {onlineUsers.has(p.id) && <Text style={styles.onlineLabel}>Online</Text>}
              </TouchableOpacity>
            )}
          />
        )
      }
    </SafeAreaView>
  );

  // ── Render: Active Chat ──
  if (view === 'chat' && activeChat) {
    const isOtherTyping = Object.values(typingUsers).length > 0;

    return (
      <SafeAreaView style={styles.container}>
        {/* Chat Header */}
        <LinearGradient colors={[GREEN, '#0B5D3B']} style={[styles.header, { paddingBottom: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={closeChat}>
              <ArrowLeft size={22} color="#fff" />
            </TouchableOpacity>
            <Avatar uri={activeChat.photoURL} name={activeChat.name || '?'} size={38} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { fontSize: 16 }]} numberOfLines={1}>{activeChat.name}</Text>
              <Text style={{ color: isOtherTyping ? GOLD : 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                {isOtherTyping ? `${typingText} is typing...` : activeChat.type === 'group' ? `${activeChat.memberCount} members` : 'tap to view info'}
              </Text>
            </View>
            <TouchableOpacity style={styles.callIconBtn} onPress={() => initiateCall('voice')}>
              <Phone size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.callIconBtn} onPress={() => initiateCall('video')}>
              <Video size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Messages */}
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
          {msgLoading
            ? <ActivityIndicator size="large" color={GREEN} style={{ flex: 1, marginTop: 40 }} />
            : (
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={m => String(m.id)}
                contentContainerStyle={{ padding: 12, gap: 6, paddingBottom: 8 }}
                ListEmptyComponent={
                  <View style={[styles.empty, { paddingTop: 80 }]}>
                    <Text style={styles.emptyText}>No messages yet.{'\n'}Say something!</Text>
                  </View>
                }
                renderItem={({ item: m }) => (
                  <View style={{ alignItems: m.isOwn ? 'flex-end' : 'flex-start', marginBottom: 2 }}>
                    {!m.isOwn && activeChat.type === 'group' && (
                      <Text style={styles.senderLabel}>{m.senderName}</Text>
                    )}
                    <View style={[
                      styles.bubble, m.isOwn ? styles.bubbleMe : styles.bubbleThem,
                      (m.type === 'image' || m.type === 'video') && styles.bubbleMedia,
                    ]}>
                      {m.type === 'image' && m.mediaUrl && (
                        <Image source={{ uri: m.mediaUrl }} style={styles.mediaImage} resizeMode="cover" />
                      )}
                      {m.type === 'video' && m.mediaUrl && (
                        <AVVideo
                          source={{ uri: m.mediaUrl }}
                          style={styles.mediaVideo}
                          useNativeControls
                          resizeMode={ResizeMode.COVER}
                        />
                      )}
                      {m.type === 'audio' && m.mediaUrl && (
                        <TouchableOpacity style={styles.audioRow} onPress={() => toggleAudioPlayback(m)}>
                          <View style={[styles.audioPlayBtn, m.isOwn && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            {playingId === m.id
                              ? <Pause size={16} color={m.isOwn ? '#fff' : GREEN} />
                              : <Play size={16} color={m.isOwn ? '#fff' : GREEN} />}
                          </View>
                          <View style={[styles.audioWave, m.isOwn && { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                          <Text style={[styles.audioLabel, m.isOwn && { color: 'rgba(255,255,255,0.85)' }]}>Voice note</Text>
                        </TouchableOpacity>
                      )}
                      {m.type === 'file' && m.mediaUrl && (
                        <TouchableOpacity style={styles.fileRow} onPress={() => Linking.openURL(m.mediaUrl!)}>
                          <FileText size={20} color={m.isOwn ? '#fff' : GREEN} />
                          <Text style={[styles.fileLabel, m.isOwn && { color: '#fff' }]} numberOfLines={1}>
                            {m.text || 'Document'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {(!m.type || m.type === 'text') && (
                        <Text style={[styles.bubbleText, m.isOwn && { color: '#fff' }]}>{m.text}</Text>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3, justifyContent: 'flex-end' }}>
                        <Text style={[styles.bubbleTime, m.isOwn && { color: 'rgba(255,255,255,0.65)' }]}>{fullTime(m.createdAt)}</Text>
                        {m.isOwn && <CheckCheck size={12} color="rgba(255,255,255,0.7)" />}
                      </View>
                    </View>
                  </View>
                )}
              />
            )
          }

          {/* Input bar */}
          {isRecording ? (
            <View style={styles.inputBar}>
              <TouchableOpacity style={styles.attachBtn} onPress={cancelVoiceRecording}>
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordDot} />
                <Text style={styles.recordingText}>Recording... {formatDuration(recordSeconds)}</Text>
              </View>
              <TouchableOpacity style={styles.sendBtn} onPress={stopAndSendVoiceRecording}>
                <Send size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputBar}>
              <TouchableOpacity style={styles.attachBtn} onPress={pickAttachment} disabled={uploadingMedia}>
                <Paperclip size={20} color={GREEN} />
              </TouchableOpacity>
              <TextInput
                style={styles.chatInput}
                placeholder="Type a message..."
                placeholderTextColor="#9b9b9b"
                value={messageText}
                onChangeText={handleTyping}
                multiline
                maxLength={2000}
              />
              {messageText.trim() ? (
                <TouchableOpacity
                  style={[styles.sendBtn, sending && { opacity: 0.4 }]}
                  onPress={sendMessage}
                  disabled={sending}
                >
                  <Send size={18} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.sendBtn, uploadingMedia && { opacity: 0.4 }]}
                  onPress={startVoiceRecording}
                  disabled={uploadingMedia}
                >
                  {uploadingMedia ? <ActivityIndicator size="small" color="#fff" /> : <Mic size={18} color="#fff" />}
                </TouchableOpacity>
              )}
            </View>
          )}
        </KeyboardAvoidingView>

        {/* Incoming / Outgoing Call Overlay */}
        {callHook.callState && (
          <CallOverlay
            callState={callHook.callState}
            localStream={callHook.localStream}
            remoteStream={callHook.remoteStream}
            muted={callHook.muted}
            cameraOff={callHook.cameraOff}
            onAccept={callHook.acceptCall}
            onReject={callHook.rejectCall}
            onEnd={callHook.endCall}
            onToggleMute={callHook.toggleMute}
            onToggleCamera={callHook.toggleCamera}
          />
        )}
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: CREAM },
  header:        { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, gap: 12 },
  headerTitle:   { color: '#fff', fontSize: 20, fontWeight: '900' },
  headerBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  searchBox:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, gap: 8 },
  searchInput:   { flex: 1, fontSize: 14, color: '#111' },
  chatRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0ede4', backgroundColor: '#fff' },
  chatName:      { fontSize: 15, fontWeight: '800', color: '#111', flex: 1 },
  chatTime:      { fontSize: 11, color: '#9b9b9b', marginLeft: 6 },
  chatPreview:   { fontSize: 13, color: '#6b7280', flex: 1 },
  unreadBadge:   { backgroundColor: GREEN, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, marginLeft: 6 },
  unreadText:    { color: '#fff', fontSize: 11, fontWeight: '900' },
  onlineLabel:   { fontSize: 11, color: '#22c55e', fontWeight: '700' },
  empty:         { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle:    { fontSize: 16, fontWeight: '800', color: '#374151' },
  emptyText:     { fontSize: 14, color: '#9b9b9b', textAlign: 'center' },
  startBtn:      { marginTop: 8, backgroundColor: GREEN, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 14 },
  startBtnText:  { color: '#fff', fontWeight: '800', fontSize: 14 },
  callIconBtn:   { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  senderLabel:   { fontSize: 11, color: GREEN, fontWeight: '700', marginLeft: 4, marginBottom: 2 },
  bubble:        { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  bubbleMe:      { backgroundColor: BUBBLE_ME, borderBottomRightRadius: 4 },
  bubbleThem:    { backgroundColor: BUBBLE_THEM, borderBottomLeftRadius: 4 },
  bubbleText:    { fontSize: 14, color: '#111', lineHeight: 20 },
  bubbleTime:    { fontSize: 10, color: '#9b9b9b' },
  inputBar:      { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0ede4', gap: 8 },
  chatInput:     { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#111', maxHeight: 100, borderWidth: 1, borderColor: '#e5e7eb' },
  sendBtn:       { width: 44, height: 44, borderRadius: 22, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  attachBtn:     { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  recordingIndicator: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12 },
  recordDot:     { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' },
  recordingText: { fontSize: 13, color: '#111', fontWeight: '600' },
  bubbleMedia:   { padding: 4, overflow: 'hidden' },
  mediaImage:    { width: 220, height: 220, borderRadius: 14 },
  mediaVideo:    { width: 220, height: 220, borderRadius: 14, backgroundColor: '#000' },
  audioRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4, minWidth: 160 },
  audioPlayBtn:  { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(6,59,40,0.1)', alignItems: 'center', justifyContent: 'center' },
  audioWave:     { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(6,59,40,0.2)' },
  audioLabel:    { fontSize: 12, color: '#374151', fontWeight: '600' },
  fileRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2, maxWidth: 200 },
  fileLabel:     { fontSize: 13, color: '#111', fontWeight: '600', flexShrink: 1 },
});
