import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_POSTS = 'CHAFADIA_COMMUNITY_ADVANCED_POSTS_V4';
const STORAGE_LIKES = 'CHAFADIA_COMMUNITY_ADVANCED_LIKES_V4';
const STORAGE_SAVED = 'CHAFADIA_COMMUNITY_ADVANCED_SAVED_V4';
const STORAGE_PROFILE = 'CHAFADIA_COMMUNITY_PROFILE_V4';
const STORAGE_FOLLOWING = 'CHAFADIA_COMMUNITY_FOLLOWING_V4';
const STORAGE_FOLLOWERS = 'CHAFADIA_COMMUNITY_FOLLOWERS_V4';
const STORAGE_BLOCKED_FOLLOWERS = 'CHAFADIA_COMMUNITY_BLOCKED_FOLLOWERS_V1';
const STORAGE_JOB_GROUPS = 'CHAFADIA_COMMUNITY_JOB_GROUPS_V1';
const STORAGE_JOB_APPLICATIONS = 'CHAFADIA_COMMUNITY_JOB_APPLICATIONS_V1';
const STORAGE_SEARCH_HISTORY = 'CHAFADIA_COMMUNITY_SEARCH_HISTORY_V1';
const STORAGE_MESSAGES = 'CHAFADIA_COMMUNITY_MESSAGES_V1';
const STORAGE_DRAFTS = 'CHAFADIA_COMMUNITY_POST_DRAFTS_V1';
const STORAGE_SETTINGS = 'CHAFADIA_COMMUNITY_SETTINGS_V2';
const STORAGE_CONTACT_INVITES = 'CHAFADIA_COMMUNITY_CONTACT_INVITES_V1';

const nowId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const readStorage = async (key, fallback = []) => {
  const saved = await AsyncStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
};

const writeStorage = async (key, value) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  return value;
};

/* =========================
   POSTS
========================= */

export const getPosts = async () => readStorage(STORAGE_POSTS, []);

export const savePosts = async posts => writeStorage(STORAGE_POSTS, posts);

export const createPost = async ({
  type = 'General',
  profile,
  title,
  body,
  location = '',
  media = [],
  backgroundAudio,
}) => {
  const posts = await getPosts();

  const post = {
    id: nowId(),
    type,
    authorId: profile?.id || 'me',
    author: profile?.name || 'Me',
    username: profile?.username || '@me',
    avatar: profile?.avatar,
    title: title.trim(),
    body: body.trim(),
    location: location.trim() || undefined,
    time: 'Just now',
    likes: 0,
    views: 0,
    reposts: 0,
    verified: false,
    media,
    backgroundAudio,
    reactions: {
      like: 0,
      love: 0,
      amin: 0,
      support: 0,
      insight: 0,
    },
    comments: [],
    updates:
      type === 'Charity'
        ? ['Project created. Updates will appear here.']
        : [],
  };

  const updated = [post, ...posts];
  await savePosts(updated);

  return { success: true, post, posts: updated };
};

export const updatePost = async ({ postId, updates }) => {
  const posts = await getPosts();

  const updated = posts.map(post =>
    post.id === postId
      ? {
          ...post,
          ...updates,
          time: post.time?.includes('Edited')
            ? post.time
            : `${post.time} • Edited`,
        }
      : post
  );

  await savePosts(updated);

  return {
    success: true,
    posts: updated,
    post: updated.find(post => post.id === postId),
  };
};

export const deletePost = async postId => {
  const posts = await getPosts();
  const liked = await getLikedPosts();
  const saved = await getSavedPosts();
  const applications = await getJobApplications();

  const updatedPosts = posts.filter(post => post.id !== postId);
  const updatedLiked = liked.filter(id => id !== postId);
  const updatedSaved = saved.filter(id => id !== postId);
  const updatedApplications = applications.filter(
    item => item.postId !== postId
  );

  await savePosts(updatedPosts);
  await saveLikedPosts(updatedLiked);
  await saveSavedPosts(updatedSaved);
  await saveJobApplications(updatedApplications);

  return {
    success: true,
    posts: updatedPosts,
  };
};

export const addPostView = async postId => {
  const posts = await getPosts();

  const updated = posts.map(post =>
    post.id === postId
      ? {
          ...post,
          views: (post.views || 0) + 1,
        }
      : post
  );

  await savePosts(updated);

  return {
    success: true,
    posts: updated,
    post: updated.find(post => post.id === postId),
  };
};

/* =========================
   LIKES / SAVES / REACTIONS
========================= */

export const getLikedPosts = async () => readStorage(STORAGE_LIKES, []);

export const saveLikedPosts = async liked =>
  writeStorage(STORAGE_LIKES, liked);

export const toggleLikePost = async postId => {
  const posts = await getPosts();
  const liked = await getLikedPosts();

  const alreadyLiked = liked.includes(postId);

  const updatedLiked = alreadyLiked
    ? liked.filter(id => id !== postId)
    : [...liked, postId];

  const updatedPosts = posts.map(post =>
    post.id === postId
      ? {
          ...post,
          likes: alreadyLiked
            ? Math.max(0, (post.likes || 0) - 1)
            : (post.likes || 0) + 1,
        }
      : post
  );

  await saveLikedPosts(updatedLiked);
  await savePosts(updatedPosts);

  return {
    success: true,
    liked: updatedLiked,
    posts: updatedPosts,
    post: updatedPosts.find(post => post.id === postId),
  };
};

export const getSavedPosts = async () => readStorage(STORAGE_SAVED, []);

export const saveSavedPosts = async saved =>
  writeStorage(STORAGE_SAVED, saved);

export const toggleSavePost = async postId => {
  const saved = await getSavedPosts();

  const updated = saved.includes(postId)
    ? saved.filter(id => id !== postId)
    : [...saved, postId];

  await saveSavedPosts(updated);

  return {
    success: true,
    saved: updated,
  };
};

export const addReaction = async ({ postId, reaction }) => {
  const posts = await getPosts();

  const updated = posts.map(post =>
    post.id === postId
      ? {
          ...post,
          reactions: {
            ...(post.reactions || {}),
            [reaction]: ((post.reactions || {})[reaction] || 0) + 1,
          },
        }
      : post
  );

  await savePosts(updated);

  return {
    success: true,
    posts: updated,
    post: updated.find(post => post.id === postId),
  };
};

/* =========================
   COMMENTS
========================= */

export const addComment = async ({
  postId,
  author,
  text,
}) => {
  const posts = await getPosts();

  const comment = {
    id: nowId(),
    author,
    text: text.trim(),
    time: 'Just now',
    reactions: {
      like: 0,
      love: 0,
      amin: 0,
      support: 0,
      insight: 0,
    },
  };

  const updated = posts.map(post =>
    post.id === postId
      ? {
          ...post,
          comments: [...(post.comments || []), comment],
        }
      : post
  );

  await savePosts(updated);

  return {
    success: true,
    comment,
    posts: updated,
    post: updated.find(post => post.id === postId),
  };
};

export const deleteComment = async ({ postId, commentId }) => {
  const posts = await getPosts();

  const updated = posts.map(post =>
    post.id === postId
      ? {
          ...post,
          comments: (post.comments || []).filter(
            comment => comment.id !== commentId
          ),
        }
      : post
  );

  await savePosts(updated);

  return {
    success: true,
    posts: updated,
    post: updated.find(post => post.id === postId),
  };
};

export const reactToComment = async ({
  postId,
  commentId,
  reaction,
}) => {
  const posts = await getPosts();

  const updated = posts.map(post =>
    post.id === postId
      ? {
          ...post,
          comments: (post.comments || []).map(comment =>
            comment.id === commentId
              ? {
                  ...comment,
                  reactions: {
                    ...(comment.reactions || {}),
                    [reaction]:
                      ((comment.reactions || {})[reaction] || 0) + 1,
                  },
                }
              : comment
          ),
        }
      : post
  );

  await savePosts(updated);

  return {
    success: true,
    posts: updated,
    post: updated.find(post => post.id === postId),
  };
};

/* =========================
   REPOST / SHARE / REPORT
========================= */

export const repostPost = async ({ post, profile }) => {
  const posts = await getPosts();

  const repost = {
    ...post,
    id: nowId(),
    authorId: profile?.id || 'me',
    author: profile?.name || 'Me',
    username: profile?.username || '@me',
    avatar: profile?.avatar,
    title: `Repost: ${post.title}`,
    time: 'Just now',
    likes: 0,
    views: 0,
    reposts: 0,
    comments: [],
  };

  const updatedOriginals = posts.map(item =>
    item.id === post.id
      ? {
          ...item,
          reposts: (item.reposts || 0) + 1,
        }
      : item
  );

  const updated = [repost, ...updatedOriginals];

  await savePosts(updated);

  return {
    success: true,
    repost,
    posts: updated,
  };
};

export const reportPost = async postId => {
  return {
    success: true,
    postId,
    message: 'Report sent successfully.',
  };
};

/* =========================
   PROFILE / FOLLOWERS
========================= */

export const getProfile = async fallback =>
  readStorage(STORAGE_PROFILE, fallback);

export const saveProfile = async profile => {
  await writeStorage(STORAGE_PROFILE, profile);

  const posts = await getPosts();

  const updatedPosts = posts.map(post =>
    post.authorId === profile.id
      ? {
          ...post,
          author: profile.name,
          username: profile.username,
          avatar: profile.avatar,
        }
      : post
  );

  await savePosts(updatedPosts);

  return {
    success: true,
    profile,
    posts: updatedPosts,
  };
};

export const getFollowing = async () =>
  readStorage(STORAGE_FOLLOWING, []);

export const saveFollowing = async following =>
  writeStorage(STORAGE_FOLLOWING, following);

export const toggleFollowUser = async authorId => {
  const following = await getFollowing();

  const updated = following.includes(authorId)
    ? following.filter(id => id !== authorId)
    : [...following, authorId];

  await saveFollowing(updated);

  return {
    success: true,
    following: updated,
  };
};

export const getFollowers = async () =>
  readStorage(STORAGE_FOLLOWERS, []);

export const saveFollowers = async followers =>
  writeStorage(STORAGE_FOLLOWERS, followers);

export const addFollower = async followerId => {
  const followers = await getFollowers();

  const updated = followers.includes(followerId)
    ? followers
    : [...followers, followerId];

  await saveFollowers(updated);

  return {
    success: true,
    followers: updated,
  };
};

export const getBlockedFollowers = async () =>
  readStorage(STORAGE_BLOCKED_FOLLOWERS, []);

export const toggleBlockFollower = async followerId => {
  const blocked = await getBlockedFollowers();

  const updated = blocked.includes(followerId)
    ? blocked.filter(id => id !== followerId)
    : [...blocked, followerId];

  await writeStorage(STORAGE_BLOCKED_FOLLOWERS, updated);

  return {
    success: true,
    blockedFollowers: updated,
  };
};

/* =========================
   CONTACT INVITES
========================= */

export const getContactInvites = async () =>
  readStorage(STORAGE_CONTACT_INVITES, []);

export const saveContactInvites = async invites =>
  writeStorage(STORAGE_CONTACT_INVITES, invites);

export const updateContactInviteStatus = async ({
  contactId,
  status,
}) => {
  const invites = await getContactInvites();

  const updated = invites.map(item =>
    item.id === contactId
      ? {
          ...item,
          status,
        }
      : item
  );

  await saveContactInvites(updated);

  return {
    success: true,
    contactInvites: updated,
  };
};

/* =========================
   JOBS
========================= */

export const getJobGroups = async () =>
  readStorage(STORAGE_JOB_GROUPS, []);

export const saveJobGroups = async groups =>
  writeStorage(STORAGE_JOB_GROUPS, groups);

export const createJobGroup = async ({
  name,
  profession,
  description = '',
  mentor,
}) => {
  const groups = await getJobGroups();

  const group = {
    id: nowId(),
    name: name.trim(),
    profession: profession.trim(),
    description:
      description.trim() ||
      'A professional circle for jobs, career advice, opportunities and empowerment.',
    members: 1,
    mentor,
  };

  const updated = [group, ...groups];

  await saveJobGroups(updated);

  return {
    success: true,
    group,
    jobGroups: updated,
  };
};

export const joinJobGroup = async groupId => {
  const groups = await getJobGroups();

  const updated = groups.map(group =>
    group.id === groupId
      ? {
          ...group,
          members: (group.members || 0) + 1,
        }
      : group
  );

  await saveJobGroups(updated);

  return {
    success: true,
    jobGroups: updated,
  };
};

export const deleteJobGroup = async groupId => {
  const groups = await getJobGroups();

  const updated = groups.filter(group => group.id !== groupId);

  await saveJobGroups(updated);

  return {
    success: true,
    jobGroups: updated,
  };
};

export const getJobApplications = async () =>
  readStorage(STORAGE_JOB_APPLICATIONS, []);

export const saveJobApplications = async applications =>
  writeStorage(STORAGE_JOB_APPLICATIONS, applications);

export const applyForJob = async ({ post, profile }) => {
  const applications = await getJobApplications();

  const alreadyApplied = applications.some(
    item => item.postId === post.id && item.applicant === profile.name
  );

  if (alreadyApplied) {
    return {
      success: false,
      message: 'You already applied for this job.',
    };
  }

  const application = {
    id: nowId(),
    postId: post.id,
    applicant: profile.name,
    role: post.title,
    message: `I am interested in ${post.title}. Please contact me through the community feed.`,
    time: 'Just now',
  };

  const updated = [application, ...applications];

  await saveJobApplications(updated);

  return {
    success: true,
    application,
    jobApplications: updated,
  };
};

export const deleteJobApplication = async applicationId => {
  const applications = await getJobApplications();

  const updated = applications.filter(
    item => item.id !== applicationId
  );

  await saveJobApplications(updated);

  return {
    success: true,
    jobApplications: updated,
  };
};

/* =========================
   SEARCH
========================= */

export const getSearchHistory = async () =>
  readStorage(STORAGE_SEARCH_HISTORY, []);

export const saveSearchTerm = async term => {
  const history = await getSearchHistory();

  const updated = [
    term,
    ...history.filter(
      item => item.toLowerCase() !== term.toLowerCase()
    ),
  ].slice(0, 12);

  await writeStorage(STORAGE_SEARCH_HISTORY, updated);

  return {
    success: true,
    searchHistory: updated,
  };
};

export const deleteSearchTerm = async term => {
  const history = await getSearchHistory();

  const updated = history.filter(item => item !== term);

  await writeStorage(STORAGE_SEARCH_HISTORY, updated);

  return {
    success: true,
    searchHistory: updated,
  };
};

export const clearSearchHistory = async () => {
  await writeStorage(STORAGE_SEARCH_HISTORY, []);
  return { success: true, searchHistory: [] };
};

/* =========================
   COMMUNITY MESSAGES
========================= */

export const getMessages = async () =>
  readStorage(STORAGE_MESSAGES, []);

export const saveMessages = async messages =>
  writeStorage(STORAGE_MESSAGES, messages);

export const sendCommunityMessage = async ({
  recipient,
  text = '',
  media = [],
  isFollower = false,
}) => {
  const messages = await getMessages();

  const message = {
    id: nowId(),
    recipient,
    text: text.trim(),
    media,
    time: 'Just now',
    status: isFollower ? 'sent' : 'request',
  };

  const updated = [message, ...messages];

  await saveMessages(updated);

  return {
    success: true,
    message,
    messages: updated,
  };
};

export const deleteCommunityMessage = async messageId => {
  const messages = await getMessages();

  const updated = messages.filter(item => item.id !== messageId);

  await saveMessages(updated);

  return {
    success: true,
    messages: updated,
  };
};

/* =========================
   DRAFTS
========================= */

export const getDrafts = async () =>
  readStorage(STORAGE_DRAFTS, []);

export const saveDrafts = async drafts =>
  writeStorage(STORAGE_DRAFTS, drafts);

export const saveDraftPost = async ({
  type,
  profile,
  title = '',
  body = '',
  location = '',
  media = [],
  backgroundAudio,
}) => {
  const drafts = await getDrafts();

  const draft = {
    id: `draft-${nowId()}`,
    type,
    authorId: profile?.id || 'me',
    author: profile?.name || 'Me',
    username: profile?.username || '@me',
    avatar: profile?.avatar,
    title: title.trim() || 'Untitled draft',
    body: body.trim() || 'Draft saved. Add your message before publishing.',
    location: location.trim() || undefined,
    time: 'Draft',
    likes: 0,
    views: 0,
    reposts: 0,
    media,
    backgroundAudio,
    reactions: {
      like: 0,
      love: 0,
      amin: 0,
      support: 0,
      insight: 0,
    },
    comments: [],
    updates: [],
  };

  const updated = [draft, ...drafts];

  await saveDrafts(updated);

  return {
    success: true,
    draft,
    drafts: updated,
  };
};

export const deleteDraftPost = async draftId => {
  const drafts = await getDrafts();

  const updated = drafts.filter(draft => draft.id !== draftId);

  await saveDrafts(updated);

  return {
    success: true,
    drafts: updated,
  };
};

/* =========================
   SETTINGS
========================= */

export const getSettings = async fallback =>
  readStorage(STORAGE_SETTINGS, fallback);

export const saveSettings = async settings =>
  writeStorage(STORAGE_SETTINGS, settings);

/* =========================
   EXPORT DEFAULT
========================= */

export default {
  getPosts,
  savePosts,
  createPost,
  updatePost,
  deletePost,
  addPostView,

  getLikedPosts,
  saveLikedPosts,
  toggleLikePost,

  getSavedPosts,
  saveSavedPosts,
  toggleSavePost,
  addReaction,

  addComment,
  deleteComment,
  reactToComment,

  repostPost,
  reportPost,

  getProfile,
  saveProfile,

  getFollowing,
  saveFollowing,
  toggleFollowUser,

  getFollowers,
  saveFollowers,
  addFollower,

  getBlockedFollowers,
  toggleBlockFollower,

  getContactInvites,
  saveContactInvites,
  updateContactInviteStatus,

  getJobGroups,
  saveJobGroups,
  createJobGroup,
  joinJobGroup,
  deleteJobGroup,

  getJobApplications,
  saveJobApplications,
  applyForJob,
  deleteJobApplication,

  getSearchHistory,
  saveSearchTerm,
  deleteSearchTerm,
  clearSearchHistory,

  getMessages,
  saveMessages,
  sendCommunityMessage,
  deleteCommunityMessage,

  getDrafts,
  saveDrafts,
  saveDraftPost,
  deleteDraftPost,

  getSettings,
  saveSettings,
};