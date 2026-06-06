
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_CHATS = 'CHAFADIA_COMM_CHATS_PRO_V3';
const STORAGE_STATUS = 'CHAFADIA_COMM_STATUS_PRO_V3';
const STORAGE_CALLS = 'CHAFADIA_COMM_CALLS_PRO_V3';
const STORAGE_CHANNELS = 'CHAFADIA_COMM_CHANNELS_PRO_V1';

const nowId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const readStorage = async (key, fallback = []) => {
  const saved = await AsyncStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
};

const writeStorage = async (key, data) => {
  await AsyncStorage.setItem(key, JSON.stringify(data));
  return data;
};

/* =========================
   CHATS
========================= */

export const getChats = async () => {
  return readStorage(STORAGE_CHATS, []);
};

export const saveChats = async chats => {
  return writeStorage(STORAGE_CHATS, chats);
};

export const createChat = async ({
  name,
  phone,
  avatar = '',
  online = false,
}) => {
  const chats = await getChats();

  const chat = {
    id: nowId(),
    name,
    phone,
    avatar,
    online,
    typing: false,
    pinned: false,
    archived: false,
    muted: false,
    blocked: false,
    disappearing: false,
    unread: 0,
    isGroup: false,
    messages: [],
  };

  await saveChats([chat, ...chats]);

  return {
    success: true,
    chat,
  };
};

export const createGroup = async ({
  name,
  members = [],
  profileName = 'Me',
}) => {
  const chats = await getChats();

  const group = {
    id: nowId(),
    name,
    phone: 'Group',
    online: false,
    unread: 0,
    isGroup: true,
    members: [profileName, ...members],
    pinned: false,
    archived: false,
    muted: false,
    blocked: false,
    messages: [
      {
        id: nowId(),
        sender: 'me',
        type: 'text',
        text: `Group created with ${members.join(', ')}`,
        time: 'Now',
        read: true,
      },
    ],
  };

  await saveChats([group, ...chats]);

  return {
    success: true,
    group,
  };
};

export const deleteChat = async chatId => {
  const chats = await getChats();
  const updated = chats.filter(chat => chat.id !== chatId);

  await saveChats(updated);

  return {
    success: true,
    chats: updated,
  };
};

export const clearChatMessages = async chatId => {
  const chats = await getChats();

  const updated = chats.map(chat =>
    chat.id === chatId
      ? {
          ...chat,
          messages: [],
          unread: 0,
        }
      : chat
  );

  await saveChats(updated);

  return {
    success: true,
    chats: updated,
  };
};

export const updateChat = async (chatId, updates) => {
  const chats = await getChats();

  const updated = chats.map(chat =>
    chat.id === chatId
      ? {
          ...chat,
          ...updates,
        }
      : chat
  );

  await saveChats(updated);

  return {
    success: true,
    chats: updated,
    chat: updated.find(chat => chat.id === chatId),
  };
};

export const markChatAsRead = async chatId => {
  return updateChat(chatId, { unread: 0 });
};

export const togglePinChat = async chatId => {
  const chats = await getChats();
  const chat = chats.find(item => item.id === chatId);

  return updateChat(chatId, {
    pinned: !chat?.pinned,
  });
};

export const toggleArchiveChat = async chatId => {
  const chats = await getChats();
  const chat = chats.find(item => item.id === chatId);

  return updateChat(chatId, {
    archived: !chat?.archived,
  });
};

export const toggleMuteChat = async chatId => {
  const chats = await getChats();
  const chat = chats.find(item => item.id === chatId);

  return updateChat(chatId, {
    muted: !chat?.muted,
  });
};

export const toggleBlockChat = async chatId => {
  const chats = await getChats();
  const chat = chats.find(item => item.id === chatId);

  return updateChat(chatId, {
    blocked: !chat?.blocked,
  });
};

export const toggleDisappearingMessages = async chatId => {
  const chats = await getChats();
  const chat = chats.find(item => item.id === chatId);

  return updateChat(chatId, {
    disappearing: !chat?.disappearing,
  });
};

/* =========================
   MESSAGES
========================= */

export const sendTextMessage = async ({
  chatId,
  text,
  sender = 'me',
}) => {
  if (!text?.trim()) {
    return {
      success: false,
      message: 'Message is empty.',
    };
  }

  const message = {
    id: nowId(),
    sender,
    type: 'text',
    text: text.trim(),
    time: 'Now',
    read: sender === 'me',
    pinned: false,
    archived: false,
    liked: false,
    edited: false,
  };

  return sendMessage({
    chatId,
    message,
  });
};

export const sendMediaMessage = async ({
  chatId,
  media,
  sender = 'me',
}) => {
  const message = {
    id: nowId(),
    sender,
    type: media.type,
    media,
    time: 'Now',
    read: sender === 'me',
    pinned: false,
    archived: false,
    liked: false,
    edited: false,
  };

  return sendMessage({
    chatId,
    message,
  });
};

export const sendMessage = async ({
  chatId,
  message,
}) => {
  const chats = await getChats();

  const updated = chats.map(chat =>
    chat.id === chatId
      ? {
          ...chat,
          messages: [...(chat.messages || []), message],
        }
      : chat
  );

  await saveChats(updated);

  return {
    success: true,
    message,
    chats: updated,
    chat: updated.find(chat => chat.id === chatId),
  };
};

export const editMessage = async ({
  chatId,
  messageId,
  text,
}) => {
  const chats = await getChats();

  const updated = chats.map(chat =>
    chat.id === chatId
      ? {
          ...chat,
          messages: chat.messages.map(message =>
            message.id === messageId
              ? {
                  ...message,
                  text: text.trim(),
                  edited: true,
                }
              : message
          ),
        }
      : chat
  );

  await saveChats(updated);

  return {
    success: true,
    chats: updated,
    chat: updated.find(chat => chat.id === chatId),
  };
};

export const deleteMessage = async ({
  chatId,
  messageId,
}) => {
  const chats = await getChats();

  const updated = chats.map(chat =>
    chat.id === chatId
      ? {
          ...chat,
          messages: chat.messages.filter(
            message => message.id !== messageId
          ),
        }
      : chat
  );

  await saveChats(updated);

  return {
    success: true,
    chats: updated,
    chat: updated.find(chat => chat.id === chatId),
  };
};

export const deleteSelectedMessages = async ({
  chatId,
  messageIds = [],
}) => {
  const chats = await getChats();

  const updated = chats.map(chat =>
    chat.id === chatId
      ? {
          ...chat,
          messages: chat.messages.filter(
            message => !messageIds.includes(message.id)
          ),
        }
      : chat
  );

  await saveChats(updated);

  return {
    success: true,
    chats: updated,
    chat: updated.find(chat => chat.id === chatId),
  };
};

export const updateMessage = async ({
  chatId,
  messageId,
  updates,
}) => {
  const chats = await getChats();

  const updated = chats.map(chat =>
    chat.id === chatId
      ? {
          ...chat,
          messages: chat.messages.map(message =>
            message.id === messageId
              ? {
                  ...message,
                  ...updates,
                }
              : message
          ),
        }
      : chat
  );

  await saveChats(updated);

  return {
    success: true,
    chats: updated,
    chat: updated.find(chat => chat.id === chatId),
  };
};

export const togglePinMessage = async ({
  chatId,
  messageId,
}) => {
  const chats = await getChats();
  const chat = chats.find(item => item.id === chatId);
  const message = chat?.messages?.find(item => item.id === messageId);

  return updateMessage({
    chatId,
    messageId,
    updates: {
      pinned: !message?.pinned,
    },
  });
};

export const toggleLikeMessage = async ({
  chatId,
  messageId,
}) => {
  const chats = await getChats();
  const chat = chats.find(item => item.id === chatId);
  const message = chat?.messages?.find(item => item.id === messageId);

  return updateMessage({
    chatId,
    messageId,
    updates: {
      liked: !message?.liked,
    },
  });
};

/* =========================
   GROUP MEMBERS
========================= */

export const addMembersToGroup = async ({
  chatId,
  members = [],
}) => {
  const chats = await getChats();

  const updated = chats.map(chat => {
    if (chat.id !== chatId) return chat;

    const currentMembers = chat.members || [];
    const newMembers = members.filter(
      member => !currentMembers.includes(member)
    );

    return {
      ...chat,
      members: [...currentMembers, ...newMembers],
    };
  });

  await saveChats(updated);

  return {
    success: true,
    chats: updated,
    chat: updated.find(chat => chat.id === chatId),
  };
};

export const removeMemberFromGroup = async ({
  chatId,
  memberName,
}) => {
  const chats = await getChats();

  const updated = chats.map(chat =>
    chat.id === chatId
      ? {
          ...chat,
          members: (chat.members || []).filter(
            member => member !== memberName
          ),
        }
      : chat
  );

  await saveChats(updated);

  return {
    success: true,
    chats: updated,
    chat: updated.find(chat => chat.id === chatId),
  };
};

/* =========================
   STATUS / UPDATES
========================= */

export const getStatuses = async () => {
  return readStorage(STORAGE_STATUS, []);
};

export const saveStatuses = async statuses => {
  return writeStorage(STORAGE_STATUS, statuses);
};

export const createStatus = async ({
  name = 'My Status',
  text = '',
  media,
  mine = true,
}) => {
  const statuses = await getStatuses();

  const status = {
    id: nowId(),
    name,
    text,
    media,
    time: 'Just now',
    views: 0,
    mine,
    liked: false,
    likes: 0,
    comments: [],
  };

  await saveStatuses([status, ...statuses]);

  return {
    success: true,
    status,
  };
};

export const viewStatus = async statusId => {
  const statuses = await getStatuses();

  const updated = statuses.map(status =>
    status.id === statusId
      ? {
          ...status,
          views: (status.views || 0) + 1,
        }
      : status
  );

  await saveStatuses(updated);

  return {
    success: true,
    statuses: updated,
    status: updated.find(status => status.id === statusId),
  };
};

export const likeStatus = async statusId => {
  const statuses = await getStatuses();

  const updated = statuses.map(status =>
    status.id === statusId
      ? {
          ...status,
          liked: !status.liked,
          likes: status.liked
            ? Math.max(0, status.likes - 1)
            : status.likes + 1,
        }
      : status
  );

  await saveStatuses(updated);

  return {
    success: true,
    statuses: updated,
    status: updated.find(status => status.id === statusId),
  };
};

export const commentOnStatus = async ({
  statusId,
  author,
  text,
}) => {
  const statuses = await getStatuses();

  const comment = {
    id: nowId(),
    author,
    text,
    time: 'Now',
  };

  const updated = statuses.map(status =>
    status.id === statusId
      ? {
          ...status,
          comments: [...(status.comments || []), comment],
        }
      : status
  );

  await saveStatuses(updated);

  return {
    success: true,
    comment,
    statuses: updated,
  };
};

/* =========================
   CALLS
========================= */

export const getCalls = async () => {
  return readStorage(STORAGE_CALLS, []);
};

export const saveCalls = async calls => {
  return writeStorage(STORAGE_CALLS, calls);
};

export const createCall = async ({
  name,
  type = 'voice',
  direction = 'outgoing',
  participants = [],
}) => {
  const calls = await getCalls();

  const call = {
    id: nowId(),
    name,
    type,
    direction,
    time: 'Now',
    participants: participants.length ? participants : [name],
  };

  await saveCalls([call, ...calls]);

  return {
    success: true,
    call,
  };
};

export const scheduleCall = async ({
  name,
  type = 'voice',
  scheduledFor,
  participants = [],
}) => {
  const calls = await getCalls();

  const call = {
    id: nowId(),
    name,
    type,
    direction: 'scheduled',
    time: `Scheduled • ${scheduledFor}`,
    scheduledFor,
    participants: participants.length ? participants : [name],
  };

  await saveCalls([call, ...calls]);

  return {
    success: true,
    call,
  };
};

/* =========================
   CHANNELS
========================= */

export const getChannels = async () => {
  return readStorage(STORAGE_CHANNELS, []);
};

export const saveChannels = async channels => {
  return writeStorage(STORAGE_CHANNELS, channels);
};

export const createChannel = async ({
  name,
  description = '',
}) => {
  const channels = await getChannels();

  const channel = {
    id: nowId(),
    name,
    description: description || 'New community channel for useful updates.',
    followers: 1,
    time: 'Just now',
    unread: 0,
    followed: true,
    ownerId: 'me',
    allowComments: true,
    emojiMode: 'any',
    chosenEmojis: ['❤️', '👍', '🤲', '✨'],
    mutedNotifications: false,
    posts: [],
  };

  await saveChannels([channel, ...channels]);

  return {
    success: true,
    channel,
  };
};

export const toggleFollowChannel = async channelId => {
  const channels = await getChannels();

  const updated = channels.map(channel =>
    channel.id === channelId
      ? {
          ...channel,
          followed: !channel.followed,
          followers: channel.followed
            ? Math.max(0, channel.followers - 1)
            : channel.followers + 1,
        }
      : channel
  );

  await saveChannels(updated);

  return {
    success: true,
    channels: updated,
  };
};

export const createChannelPost = async ({
  channelId,
  text,
  media,
}) => {
  const channels = await getChannels();

  const post = {
    id: nowId(),
    name: '',
    text,
    media,
    time: 'Just now',
    views: 0,
    likes: 0,
    liked: false,
    comments: [],
    mine: true,
  };

  const updated = channels.map(channel =>
    channel.id === channelId
      ? {
          ...channel,
          posts: [post, ...(channel.posts || [])],
          time: 'Just now',
        }
      : channel
  );

  await saveChannels(updated);

  return {
    success: true,
    post,
    channels: updated,
    channel: updated.find(channel => channel.id === channelId),
  };
};

export const likeChannelPost = async ({
  channelId,
  postId,
}) => {
  const channels = await getChannels();

  const updated = channels.map(channel =>
    channel.id === channelId
      ? {
          ...channel,
          posts: (channel.posts || []).map(post =>
            post.id === postId
              ? {
                  ...post,
                  liked: !post.liked,
                  likes: post.liked
                    ? Math.max(0, post.likes - 1)
                    : post.likes + 1,
                }
              : post
          ),
        }
      : channel
  );

  await saveChannels(updated);

  return {
    success: true,
    channels: updated,
    channel: updated.find(channel => channel.id === channelId),
  };
};

export const commentOnChannelPost = async ({
  channelId,
  postId,
  author,
  text,
}) => {
  const channels = await getChannels();

  const comment = {
    id: nowId(),
    author,
    text,
    time: 'Now',
  };

  const updated = channels.map(channel =>
    channel.id === channelId
      ? {
          ...channel,
          posts: (channel.posts || []).map(post =>
            post.id === postId
              ? {
                  ...post,
                  comments: [...(post.comments || []), comment],
                }
              : post
          ),
        }
      : channel
  );

  await saveChannels(updated);

  return {
    success: true,
    comment,
    channels: updated,
  };
};

export const updateChannelSettings = async ({
  channelId,
  updates,
}) => {
  const channels = await getChannels();

  const updated = channels.map(channel =>
    channel.id === channelId
      ? {
          ...channel,
          ...updates,
        }
      : channel
  );

  await saveChannels(updated);

  return {
    success: true,
    channels: updated,
    channel: updated.find(channel => channel.id === channelId),
  };
};

/* =========================
   EXPORT
========================= */

export default {
  getChats,
  saveChats,
  createChat,
  createGroup,
  updateChat,
  deleteChat,
  clearChatMessages,
  markChatAsRead,

  togglePinChat,
  toggleArchiveChat,
  toggleMuteChat,
  toggleBlockChat,
  toggleDisappearingMessages,

  sendMessage,
  sendTextMessage,
  sendMediaMessage,
  editMessage,
  deleteMessage,
  deleteSelectedMessages,
  updateMessage,
  togglePinMessage,
  toggleLikeMessage,

  addMembersToGroup,
  removeMemberFromGroup,

  getStatuses,
  saveStatuses,
  createStatus,
  viewStatus,
  likeStatus,
  commentOnStatus,

  getCalls,
  saveCalls,
  createCall,
  scheduleCall,

  getChannels,
  saveChannels,
  createChannel,
  toggleFollowChannel,
  createChannelPost,
  likeChannelPost,
  commentOnChannelPost,
  updateChannelSettings,
};