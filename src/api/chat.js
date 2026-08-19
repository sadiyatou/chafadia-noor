import api from './client';

// ── Chats ──────────────────────────────────────────────────────
export const getChats = async () => {
  try {
    const { data } = await api.get('/chats');
    return data;
  } catch (e) { return { success: false, chats: [] }; }
};

export const createPrivateChat = async (receiverId) => {
  try {
    const { data } = await api.post('/chats/private', { receiverId });
    return data;
  } catch (e) { return { success: false, message: e.response?.data?.message || 'Failed.' }; }
};

export const getMessages = async (chatId, before = null) => {
  try {
    const params = { limit: 50 };
    if (before) params.before = before;
    const { data } = await api.get(`/chats/${chatId}/messages`, { params });
    return data;
  } catch (e) { return { success: false, messages: [] }; }
};

export const sendMessage = async (chatId, { content, type = 'text', mediaUrl, fileName }) => {
  try {
    const { data } = await api.post(`/chats/${chatId}/messages`, {
      content, type, media_url: mediaUrl, file_name: fileName,
    });
    return data;
  } catch (e) { return { success: false, message: e.response?.data?.message || 'Failed.' }; }
};

export const markRead = async (chatId) => {
  try { await api.put(`/chats/${chatId}/read`); } catch (_) {}
};

export const deleteMessage = async (messageId) => {
  try {
    const { data } = await api.delete(`/chats/messages/${messageId}`);
    return data;
  } catch (e) { return { success: false }; }
};

export const reactToMessage = async (messageId, emoji) => {
  try {
    const { data } = await api.post(`/chats/messages/${messageId}/react`, { emoji });
    return data;
  } catch (e) { return { success: false }; }
};

// ── Community Groups ────────────────────────────────────────────
export const getMyGroups = async () => {
  try {
    const { data } = await api.get('/community-groups/mine');
    return data;
  } catch (e) { return { success: false, groups: [] }; }
};

export const getPublicGroups = async (search = '') => {
  try {
    const { data } = await api.get('/community-groups', { params: search ? { search } : {} });
    return data;
  } catch (e) { return { success: false, groups: [] }; }
};

export const createGroup = async ({ name, description, is_public }) => {
  try {
    const { data } = await api.post('/community-groups', { name, description, is_public });
    return data;
  } catch (e) { return { success: false, message: e.response?.data?.message || 'Failed.' }; }
};

export const joinGroup = async (groupId) => {
  try {
    const { data } = await api.post(`/community-groups/${groupId}/join`);
    return data;
  } catch (e) { return { success: false, message: e.response?.data?.message || 'Failed.' }; }
};

export const leaveGroup = async (groupId) => {
  try {
    const { data } = await api.delete(`/community-groups/${groupId}/leave`);
    return data;
  } catch (e) { return { success: false }; }
};

export const getGroupMessages = async (groupId, before = null) => {
  try {
    const params = { limit: 50 };
    if (before) params.before = before;
    const { data } = await api.get(`/community-groups/${groupId}/messages`, { params });
    return data;
  } catch (e) { return { success: false, messages: [] }; }
};

export const sendGroupMessage = async (groupId, { content, type = 'text', mediaUrl, fileName }) => {
  try {
    const { data } = await api.post(`/community-groups/${groupId}/messages`, {
      content, type, media_url: mediaUrl, file_name: fileName,
    });
    return data;
  } catch (e) { return { success: false }; }
};

// ── Users (for contact list) ────────────────────────────────────
export const searchUsers = async (q) => {
  try {
    const { data } = await api.get('/users', { params: { q, limit: 20 } });
    return data;
  } catch (e) { return { success: false, users: [] }; }
};
