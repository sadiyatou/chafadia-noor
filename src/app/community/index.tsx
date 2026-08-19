import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  Modal, Alert, Image, KeyboardAvoidingView, Platform, ActivityIndicator,
  RefreshControl, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { io, Socket } from 'socket.io-client';
import {
  Heart, MessageCircle, Share2, Plus, Bell, Users, Search,
  X, Send, Trash2, BriefcaseBusiness, Megaphone, HelpCircle,
  CalendarDays, HandHeart, Clock, UserRound, ChevronRight,
  CheckCircle,
} from 'lucide-react-native';
import api, { BASE_URL, getToken } from '../../api/client';
import { getCurrentUser } from '../../api/auth';
import { router } from 'expo-router';

// ── Constants ─────────────────────────────────────────────────────
const GREEN  = '#063B28';
const GOLD   = '#D4A017';
const CREAM  = '#F7F5EE';
const MINT   = '#E6F1EC';

const POST_TYPES = ['All','General','Jobs','Announcement','Question','Event','Charity','Reminder'] as const;
type PostType = typeof POST_TYPES[number];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Jobs:         <BriefcaseBusiness size={13} color={GREEN} />,
  Announcement: <Megaphone size={13} color={GREEN} />,
  Question:     <HelpCircle size={13} color={GREEN} />,
  Event:        <CalendarDays size={13} color={GREEN} />,
  Charity:      <HandHeart size={13} color={GREEN} />,
  Reminder:     <Clock size={13} color={GREEN} />,
  General:      <UserRound size={13} color={GREEN} />,
};

type Tab = 'feed' | 'notifications' | 'people';

interface Author { id: number; fullName: string; photoURL?: string; role: string; verified: boolean; }
interface Post {
  id: number; type: string; title: string; text: string;
  mediaUrl?: string; mediaType?: string;
  likes: number; commentsCount: number; views: number;
  isLiked: boolean; isOwn: boolean; createdAt: string; author: Author;
}
interface Comment { id: number; text: string; createdAt: string; isOwn: boolean; author: Author; }
interface Notification { id: number; type: string; title: string; body: string; read: boolean; createdAt: string; }
interface Person { id: number; fullName: string; email?: string; phone?: string; photoURL?: string; isOnline: boolean; role: string; }

// ── Helpers ───────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Avatar({ uri, name, size = 40 }: { uri?: string; name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.35 }}>{initials}</Text>
    </View>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function CommunityScreen() {
  const [tab, setTab]                     = useState<Tab>('feed');
  const [activeType, setActiveType]       = useState<PostType>('All');
  const [posts, setPosts]                 = useState<Post[]>([]);
  const [postsLoading, setPostsLoading]   = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [hasMore, setHasMore]             = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notiLoading, setNotiLoading]     = useState(false);
  const [unread, setUnread]               = useState(0);
  const [people, setPeople]               = useState<Person[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleSearch, setPeopleSearch]   = useState('');
  const [currentUser, setCurrentUser]     = useState<any>(null);

  // Post creation
  const [showCreate, setShowCreate]       = useState(false);
  const [createType, setCreateType]       = useState<string>('General');
  const [createTitle, setCreateTitle]     = useState('');
  const [createText, setCreateText]       = useState('');
  const [creating, setCreating]           = useState(false);

  // Comments modal
  const [commentPost, setCommentPost]     = useState<Post | null>(null);
  const [comments, setComments]           = useState<Comment[]>([]);
  const [commentText, setCommentText]     = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const pageRef   = useRef(1);
  const loadingRef = useRef(false);

  // ── Load current user ──
  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'main_admin';

  // ── Socket.io real-time ──
  useEffect(() => {
    let socket: Socket;
    getToken().then(token => {
      if (!token) return;
      socket = io(BASE_URL, { auth: { token }, transports: ['websocket'] });
      socketRef.current = socket;

      socket.on('post:new', (post: Post) => {
        setPosts(prev => {
          if (prev.find(p => p.id === post.id)) return prev;
          return [post, ...prev];
        });
      });

      socket.on('post:deleted', ({ postId }: { postId: number }) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
      });

      socket.on('post:liked', ({ postId, likes }: any) => {
        // Only update the count — isLiked is managed locally via optimistic updates
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes } : p));
      });

      socket.on('post:comment', ({ postId }: any) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      });

      socket.on('notification:new', (n: Notification) => {
        setUnread(u => u + 1);
        setNotifications(prev => [n, ...prev]);
      });
    });

    return () => { socket?.disconnect(); };
  }, []);

  // ── Fetch posts ──
  const fetchPosts = useCallback(async (reset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const pg = reset ? 1 : pageRef.current;
    if (reset) { setPostsLoading(true); pageRef.current = 1; }
    try {
      const params: any = { page: pg, limit: 20 };
      if (activeType !== 'All') params.type = activeType;
      const { data } = await api.get('/posts', { params });
      if (data.success) {
        setPosts(reset ? data.posts : prev => [...prev, ...data.posts.filter((p: Post) => !prev.find(x => x.id === p.id))]);
        setHasMore(data.hasMore);
        // Always advance past the page just fetched — on a reset fetch this
        // was previously skipped, so the very next "load more" re-fetched
        // page 1 (all dupes get filtered out, list appears stuck) instead
        // of page 2.
        pageRef.current = pg + 1;
      }
    } catch (e) { /* silent */ }
    finally { setPostsLoading(false); setRefreshing(false); loadingRef.current = false; }
  }, [activeType]);

  useEffect(() => { fetchPosts(true); }, [activeType]);

  // ── Fetch notifications ──
  const fetchNotifications = useCallback(async () => {
    setNotiLoading(true);
    try {
      const [{ data: nd }, { data: uc }] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ]);
      if (nd.success) setNotifications(nd.notifications || []);
      if (uc.success) setUnread(uc.unreadCount || 0);
    } catch (e) { /* silent */ }
    finally { setNotiLoading(false); }
  }, []);

  useEffect(() => { if (tab === 'notifications') fetchNotifications(); }, [tab]);

  // ── Fetch people ──
  const fetchPeople = useCallback(async (q = '') => {
    setPeopleLoading(true);
    try {
      const { data } = await api.get('/users', { params: { q, limit: 30 } });
      if (data.success) setPeople(data.users || []);
    } catch (e) { /* silent */ }
    finally { setPeopleLoading(false); }
  }, []);

  useEffect(() => { if (tab === 'people') fetchPeople(peopleSearch); }, [tab, peopleSearch]);

  // ── Actions ──
  const onRefresh = () => { setRefreshing(true); fetchPosts(true); };

  const onLoadMore = () => { if (hasMore && !postsLoading) fetchPosts(false); };

  const toggleLike = async (post: Post) => {
    // Optimistic update
    setPosts(prev => prev.map(p => p.id === post.id
      ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
      : p
    ));
    try { await api.post(`/posts/${post.id}/like`); }
    catch { // revert on failure
      setPosts(prev => prev.map(p => p.id === post.id
        ? { ...p, isLiked: post.isLiked, likes: post.likes } : p
      ));
    }
  };

  const openComments = async (post: Post) => {
    setCommentPost(post);
    setCommentsLoading(true);
    setComments([]);
    try {
      const { data } = await api.get(`/posts/${post.id}/comments`);
      if (data.success) setComments(data.comments);
    } catch (e) { /* silent */ }
    finally { setCommentsLoading(false); }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !commentPost) return;
    setSubmittingComment(true);
    try {
      const { data } = await api.post(`/posts/${commentPost.id}/comments`, { text: commentText.trim() });
      if (data.success) {
        setComments(prev => [...prev, data.comment]);
        setCommentText('');
        setPosts(prev => prev.map(p => p.id === commentPost.id ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      }
    } catch (e) { Alert.alert('Error', 'Failed to post comment.'); }
    finally { setSubmittingComment(false); }
  };

  const deletePost = (post: Post) => {
    Alert.alert('Delete Post', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/posts/${post.id}`);
          setPosts(prev => prev.filter(p => p.id !== post.id));
        } catch { Alert.alert('Error', 'Failed to delete post.'); }
      }},
    ]);
  };

  const submitPost = async () => {
    if (!createText.trim()) { Alert.alert('Error', 'Post text is required.'); return; }
    setCreating(true);
    try {
      const { data } = await api.post('/posts', {
        text: createText.trim(),
        title: createTitle.trim(),
        type: createType,
      });
      if (data.success) {
        setShowCreate(false);
        setCreateText('');
        setCreateTitle('');
        setCreateType('General');
        setPosts(prev => {
          if (prev.find(p => p.id === data.post.id)) return prev;
          return [data.post, ...prev];
        });
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create post.');
    } finally { setCreating(false); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* silent */ }
  };

  const startChat = async (person: Person) => {
    try {
      const { data } = await api.post('/chats/private', { receiverId: person.id });
      if (data.success) {
        router.push({ pathname: '/messages', params: { openChatId: data.chatId, openChatName: person.fullName } } as any);
      }
    } catch { Alert.alert('Error', 'Could not start chat.'); }
  };

  // ── Render helpers ──
  const renderPostCard = ({ item: post }: { item: Post }) => (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Avatar uri={post.author.photoURL} name={post.author.fullName} size={42} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.authorName}>{post.author.fullName}</Text>
            {post.author.verified && <CheckCircle size={13} color={GREEN} />}
            {(post.author.role === 'admin' || post.author.role === 'main_admin') && (
              <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>Admin</Text></View>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            {post.type !== 'General' && (
              <View style={styles.typeBadge}>
                {TYPE_ICONS[post.type]}
                <Text style={styles.typeBadgeText}>{post.type}</Text>
              </View>
            )}
            <Text style={styles.timeText}>{timeAgo(post.createdAt)}</Text>
          </View>
        </View>
        {(post.isOwn || isAdmin) && (
          <TouchableOpacity onPress={() => deletePost(post)} style={{ padding: 4 }}>
            <Trash2 size={16} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {post.title ? <Text style={styles.postTitle}>{post.title}</Text> : null}
      {post.text ? <Text style={styles.postText}>{post.text}</Text> : null}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(post)}>
          <Heart size={18} color={post.isLiked ? '#ef4444' : '#6b7280'} fill={post.isLiked ? '#ef4444' : 'none'} />
          <Text style={[styles.actionText, post.isLiked && { color: '#ef4444' }]}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openComments(post)}>
          <MessageCircle size={18} color="#6b7280" />
          <Text style={styles.actionText}>{post.commentsCount}</Text>
        </TouchableOpacity>
        <View style={styles.actionBtn}>
          <Share2 size={18} color="#6b7280" />
          <Text style={styles.actionText}>Share</Text>
        </View>
      </View>
    </View>
  );

  const renderNotification = ({ item: n }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notiCard, !n.read && styles.notiUnread]}
      onPress={async () => {
        if (!n.read) {
          try { await api.put(`/notifications/${n.id}/read`); } catch {}
          setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
          setUnread(u => Math.max(0, u - 1));
        }
      }}
    >
      <View style={[styles.notiDot, { backgroundColor: n.read ? '#d1d5db' : GREEN }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.notiTitle}>{n.title}</Text>
        <Text style={styles.notiBody}>{n.body}</Text>
        <Text style={styles.notiTime}>{timeAgo(n.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPerson = ({ item: p }: { item: Person }) => (
    <View style={styles.personCard}>
      <Avatar uri={p.photoURL} name={p.fullName} size={48} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.personName}>{p.fullName}</Text>
          {p.isOnline && <View style={styles.onlineDot} />}
        </View>
        <Text style={styles.personSub}>{p.email || p.phone || p.role}</Text>
      </View>
      <TouchableOpacity style={styles.chatBtn} onPress={() => startChat(p)}>
        <Text style={styles.chatBtnText}>Message</Text>
        <ChevronRight size={14} color={GREEN} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[GREEN, '#0B5D3B']} style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.headerTitle}>Community</Text>
            <Text style={styles.headerSub}>Connect • Share • Grow</Text>
          </View>
          {tab === 'feed' && (
            <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
              <Plus size={16} color="#fff" />
              <Text style={styles.createBtnText}>Post</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {([['feed','Feed'], ['notifications','Alerts'], ['people','People']] as [Tab, string][]).map(([t, label]) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              {t === 'notifications' && unread > 0 && (
                <View style={styles.badge}><Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text></View>
              )}
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Feed Tab */}
      {tab === 'feed' && (
        <>
          {/* Type filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
            {POST_TYPES.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.typeChip, activeType === t && styles.typeChipActive]}
                onPress={() => setActiveType(t)}
              >
                {t !== 'All' && TYPE_ICONS[t]}
                <Text style={[styles.typeChipText, activeType === t && styles.typeChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={posts}
            keyExtractor={p => String(p.id)}
            renderItem={renderPostCard}
            contentContainerStyle={{ padding: 12, gap: 12, paddingBottom: 80 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GREEN} />}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.3}
            ListEmptyComponent={
              postsLoading
                ? <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 40 }} />
                : <View style={styles.empty}><Text style={styles.emptyText}>No posts yet.{'\n'}Be the first to share!</Text></View>
            }
            ListFooterComponent={hasMore && posts.length > 0 ? <ActivityIndicator color={GREEN} style={{ margin: 16 }} /> : null}
          />
        </>
      )}

      {/* Notifications Tab */}
      {tab === 'notifications' && (
        <View style={{ flex: 1 }}>
          {unread > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
              <Text style={styles.markAllText}>Mark all as read ({unread})</Text>
            </TouchableOpacity>
          )}
          {notiLoading
            ? <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 40 }} />
            : (
              <FlatList
                data={notifications}
                keyExtractor={n => String(n.id)}
                renderItem={renderNotification}
                contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 80 }}
                ListEmptyComponent={
                  <View style={styles.empty}>
                    <Bell size={40} color="#d1d5db" />
                    <Text style={styles.emptyText}>No notifications yet</Text>
                  </View>
                }
              />
            )
          }
        </View>
      )}

      {/* People Tab */}
      {tab === 'people' && (
        <View style={{ flex: 1 }}>
          <View style={styles.searchRow}>
            <Search size={16} color="#9b9b9b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search people..."
              placeholderTextColor="#9b9b9b"
              value={peopleSearch}
              onChangeText={setPeopleSearch}
            />
          </View>
          {peopleLoading
            ? <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 40 }} />
            : (
              <FlatList
                data={people.filter(p => currentUser && p.id !== currentUser.id)}
                keyExtractor={p => String(p.id)}
                renderItem={renderPerson}
                contentContainerStyle={{ padding: 12, gap: 10, paddingBottom: 80 }}
                ListEmptyComponent={
                  <View style={styles.empty}>
                    <Users size={40} color="#d1d5db" />
                    <Text style={styles.emptyText}>No users found</Text>
                  </View>
                }
              />
            )
          }
        </View>
      )}

      {/* Create Post Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Post</Text>
                <TouchableOpacity onPress={() => setShowCreate(false)}>
                  <X size={22} color={GREEN} />
                </TouchableOpacity>
              </View>

              {/* Post Type */}
              <Text style={styles.fieldLabel}>Post Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {(isAdmin ? POST_TYPES.slice(1) : ['General','Question','Charity']).map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeChip, createType === t && styles.typeChipActive]}
                      onPress={() => setCreateType(t)}
                    >
                      {TYPE_ICONS[t]}
                      <Text style={[styles.typeChipText, createType === t && styles.typeChipTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Title (optional for Jobs/Events/Announcements) */}
              {['Jobs','Event','Announcement'].includes(createType) && (
                <>
                  <Text style={styles.fieldLabel}>Title</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder={createType === 'Jobs' ? 'e.g. Software Developer — Remote' : 'Post title'}
                    placeholderTextColor="#9b9b9b"
                    value={createTitle}
                    onChangeText={setCreateTitle}
                  />
                </>
              )}

              {/* Body */}
              <Text style={styles.fieldLabel}>Content *</Text>
              <TextInput
                style={[styles.modalInput, { height: 120, textAlignVertical: 'top' }]}
                placeholder={
                  createType === 'Jobs' ? 'Describe the job role, requirements, how to apply...'
                  : createType === 'Announcement' ? 'Share your announcement...'
                  : createType === 'Question' ? 'Ask your question...'
                  : createType === 'Event' ? 'Event details, date, location...'
                  : createType === 'Charity' ? 'Share your charity initiative...'
                  : 'What\'s on your mind?'
                }
                placeholderTextColor="#9b9b9b"
                multiline
                value={createText}
                onChangeText={setCreateText}
              />

              <TouchableOpacity
                style={[styles.postBtn, creating && { opacity: 0.6 }]}
                onPress={submitPost}
                disabled={creating}
              >
                {creating
                  ? <ActivityIndicator color="#fff" />
                  : <><Send size={16} color="#fff" /><Text style={styles.postBtnText}>Post</Text></>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Comments Modal */}
      <Modal visible={!!commentPost} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { maxHeight: '85%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Comments ({commentPost?.commentsCount || 0})</Text>
                <TouchableOpacity onPress={() => { setCommentPost(null); setComments([]); setCommentText(''); }}>
                  <X size={22} color={GREEN} />
                </TouchableOpacity>
              </View>

              {commentsLoading
                ? <ActivityIndicator color={GREEN} style={{ margin: 20 }} />
                : (
                  <FlatList
                    data={comments}
                    keyExtractor={c => String(c.id)}
                    style={{ maxHeight: 340 }}
                    contentContainerStyle={{ gap: 10 }}
                    ListEmptyComponent={<Text style={[styles.emptyText, { textAlign: 'center', padding: 20 }]}>No comments yet.</Text>}
                    renderItem={({ item: c }) => (
                      <View style={styles.commentRow}>
                        <Avatar uri={c.author.photoURL} name={c.author.fullName} size={34} />
                        <View style={styles.commentBubble}>
                          <Text style={styles.commentAuthor}>{c.author.fullName}</Text>
                          <Text style={styles.commentText}>{c.text}</Text>
                          <Text style={styles.commentTime}>{timeAgo(c.createdAt)}</Text>
                        </View>
                      </View>
                    )}
                  />
                )
              }

              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment..."
                  placeholderTextColor="#9b9b9b"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.sendBtn, (!commentText.trim() || submittingComment) && { opacity: 0.4 }]}
                  onPress={submitComment}
                  disabled={!commentText.trim() || submittingComment}
                >
                  <Send size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: CREAM },
  header:           { paddingTop: 12, paddingBottom: 0, paddingHorizontal: 16 },
  headerTitle:      { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  headerSub:        { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  createBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: GOLD, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  createBtnText:    { color: '#fff', fontWeight: '800', fontSize: 13 },
  tabs:             { flexDirection: 'row', marginTop: 14 },
  tab:              { flex: 1, alignItems: 'center', paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', position: 'relative' },
  tabActive:        { borderBottomColor: GOLD },
  tabText:          { color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: 13 },
  tabTextActive:    { color: '#fff' },
  badge:            { position: 'absolute', top: -4, right: 14, backgroundColor: '#ef4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText:        { color: '#fff', fontSize: 9, fontWeight: '900' },
  typeRow:          { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0ede4' },
  typeChip:         { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#F3F4F6', marginVertical: 8 },
  typeChipActive:   { backgroundColor: MINT, borderWidth: 1.5, borderColor: GREEN },
  typeChipText:     { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  typeChipTextActive: { color: GREEN, fontWeight: '800' },
  card:             { backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeader:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  authorName:       { fontSize: 14, fontWeight: '800', color: GREEN },
  adminBadge:       { backgroundColor: GOLD, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  adminBadgeText:   { color: '#fff', fontSize: 9, fontWeight: '900' },
  typeBadge:        { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: MINT, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  typeBadgeText:    { fontSize: 11, color: GREEN, fontWeight: '700' },
  timeText:         { fontSize: 11, color: '#9b9b9b' },
  postTitle:        { fontSize: 15, fontWeight: '800', color: '#111', marginBottom: 6 },
  postText:         { fontSize: 14, color: '#374151', lineHeight: 21 },
  divider:          { height: 1, backgroundColor: '#f0ede4', marginVertical: 10 },
  cardActions:      { flexDirection: 'row', gap: 20 },
  actionBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText:       { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  notiCard:         { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  notiUnread:       { backgroundColor: MINT },
  notiDot:          { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  notiTitle:        { fontSize: 13, fontWeight: '800', color: GREEN },
  notiBody:         { fontSize: 13, color: '#374151', marginTop: 3 },
  notiTime:         { fontSize: 11, color: '#9b9b9b', marginTop: 4 },
  markAllBtn:       { margin: 12, padding: 10, backgroundColor: MINT, borderRadius: 10, alignItems: 'center' },
  markAllText:      { color: GREEN, fontWeight: '700', fontSize: 13 },
  searchRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', gap: 8 },
  searchInput:      { flex: 1, fontSize: 14, color: '#111' },
  personCard:       { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  personName:       { fontSize: 14, fontWeight: '800', color: '#111' },
  personSub:        { fontSize: 12, color: '#6b7280', marginTop: 2 },
  onlineDot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  chatBtn:          { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: MINT, borderRadius: 10 },
  chatBtnText:      { color: GREEN, fontWeight: '700', fontSize: 12 },
  empty:            { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyText:        { color: '#9b9b9b', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet:       { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20 },
  modalHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle:       { fontSize: 17, fontWeight: '900', color: GREEN },
  fieldLabel:       { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6 },
  modalInput:       { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, fontSize: 14, color: '#111', borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 14 },
  postBtn:          { backgroundColor: GREEN, borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 4 },
  postBtnText:      { color: '#fff', fontWeight: '900', fontSize: 15 },
  commentRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  commentBubble:    { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 10 },
  commentAuthor:    { fontSize: 12, fontWeight: '800', color: GREEN },
  commentText:      { fontSize: 13, color: '#374151', marginTop: 3, lineHeight: 19 },
  commentTime:      { fontSize: 11, color: '#9b9b9b', marginTop: 4 },
  commentInputRow:  { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 12 },
  commentInput:     { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111', borderWidth: 1, borderColor: '#e5e7eb', maxHeight: 80 },
  sendBtn:          { backgroundColor: GREEN, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});
