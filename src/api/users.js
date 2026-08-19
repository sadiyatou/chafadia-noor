import api from './client';

export const getUserDocument = async (userId) => {
  try {
    const { data } = await api.get(`/users/${userId}`);
    return data.user;
  } catch (error) {
    return null;
  }
};

export const createUserDocument = async (userId, userData) => {
  try {
    const { data } = await api.put(`/users/${userId}`, userData);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const updateUserDocument = async (userId, updates) => {
  try {
    const { data } = await api.put(`/users/${userId}`, updates);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const searchUsers = async (searchText) => {
  try {
    const { data } = await api.get('/users/search', { params: { q: searchText } });
    return data.users || [];
  } catch (error) {
    return [];
  }
};

export const followUser = async (currentUserId, targetUserId) => {
  try {
    const { data } = await api.post(`/users/${targetUserId}/follow`);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const unfollowUser = async (currentUserId, targetUserId) => {
  try {
    const { data } = await api.delete(`/users/${targetUserId}/follow`);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const getFollowers = async (userId) => {
  try {
    const { data } = await api.get(`/users/${userId}/followers`);
    return data.users || [];
  } catch (error) {
    return [];
  }
};

export const getFollowing = async (userId) => {
  try {
    const { data } = await api.get(`/users/${userId}/following`);
    return data.users || [];
  } catch (error) {
    return [];
  }
};

export default {
  getUserDocument, createUserDocument, updateUserDocument,
  searchUsers, followUser, unfollowUser, getFollowers, getFollowing,
};
