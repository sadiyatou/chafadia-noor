import api from './client';

export const createOrGetPrivateChat = async ({ currentUserId, receiverId }) => {
  try {
    const { data } = await api.post('/chats/private', { receiverId });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const createGroupChat = async ({ currentUserId, name, members = [], photoURL = '' }) => {
  try {
    const { data } = await api.post('/chats/group', { name, members, photoURL });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const getUserChats = async () => {
  try {
    const { data } = await api.get('/chats');
    return data.chats || [];
  } catch (error) {
    return [];
  }
};

export const getChatById = async (chatId) => {
  try {
    const { data } = await api.get(`/chats/${chatId}`);
    return data.chat || null;
  } catch (error) {
    return null;
  }
};

export const getMessages = async (chatId, page = 1, limit = 50) => {
  try {
    const { data } = await api.get(`/chats/${chatId}/messages`, { params: { page, limit } });
    return data;
  } catch (error) {
    return { success: false, messages: [] };
  }
};

export const sendMessage = async ({ chatId, type = 'text', text = '', mediaUrl = '', fileName = '', replyTo = null }) => {
  try {
    const { data } = await api.post(`/chats/${chatId}/messages`, { type, text, mediaUrl, fileName, replyTo });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const editMessage = async ({ chatId, messageId, text }) => {
  try {
    const { data } = await api.put(`/chats/messages/${messageId}`, { text });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const deleteMessage = async ({ chatId, messageId }) => {
  try {
    const { data } = await api.delete(`/chats/messages/${messageId}`);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const deleteMessageForMe = async ({ chatId, messageId }) => {
  try {
    const { data } = await api.post(`/chats/messages/${messageId}/hide`);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const reactToMessage = async ({ chatId, messageId, emoji }) => {
  try {
    const { data } = await api.post(`/chats/messages/${messageId}/react`, { emoji });
    return data;
  } catch (error) {
    return { success: false };
  }
};

export const removeReaction = async ({ chatId, messageId }) => {
  try {
    const { data } = await api.delete(`/chats/messages/${messageId}/react`);
    return data;
  } catch (error) {
    return { success: false };
  }
};

export const togglePinMessage = async ({ chatId, messageId }) => {
  try {
    const { data } = await api.put(`/chats/messages/${messageId}/pin`);
    return data;
  } catch (error) {
    return { success: false };
  }
};

export const markChatAsRead = async ({ chatId }) => {
  try {
    const { data } = await api.put(`/chats/${chatId}/read`);
    return data;
  } catch (error) {
    return { success: false };
  }
};

export const toggleMuteChat = async (chatId) => {
  try {
    const { data } = await api.put(`/chats/${chatId}/settings/muted`);
    return data;
  } catch (error) {
    return { success: false };
  }
};

export const toggleArchiveChat = async (chatId) => {
  try {
    const { data } = await api.put(`/chats/${chatId}/settings/archived`);
    return data;
  } catch (error) {
    return { success: false };
  }
};

export const togglePinChat = async (chatId) => {
  try {
    const { data } = await api.put(`/chats/${chatId}/settings/pinned`);
    return data;
  } catch (error) {
    return { success: false };
  }
};

export const toggleBlockChat = async (chatId) => {
  try {
    const { data } = await api.put(`/chats/${chatId}/settings/blocked`);
    return data;
  } catch (error) {
    return { success: false };
  }
};

export const addGroupMember = async ({ chatId, userId }) => {
  try {
    const { data } = await api.post(`/chats/${chatId}/members`, { userId });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const removeGroupMember = async ({ chatId, userId }) => {
  try {
    const { data } = await api.delete(`/chats/${chatId}/members`, { data: { userId } });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const makeGroupAdmin = async ({ chatId, userId }) => {
  try {
    const { data } = await api.put(`/chats/${chatId}/admins/add`, { userId });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const removeGroupAdmin = async ({ chatId, userId }) => {
  try {
    const { data } = await api.put(`/chats/${chatId}/admins/remove`, { userId });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const clearChat = async (chatId) => {
  try {
    const { data } = await api.delete(`/chats/${chatId}/messages`);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const deleteChat = async (chatId) => {
  try {
    const { data } = await api.delete(`/chats/${chatId}`);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export default {
  createOrGetPrivateChat, createGroupChat, getUserChats, getChatById,
  getMessages, sendMessage, editMessage, deleteMessage, deleteMessageForMe,
  reactToMessage, removeReaction, togglePinMessage, markChatAsRead,
  toggleMuteChat, toggleArchiveChat, togglePinChat, toggleBlockChat,
  addGroupMember, removeGroupMember, makeGroupAdmin, removeGroupAdmin,
  clearChat, deleteChat,
};
