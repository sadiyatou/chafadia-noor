import api from './client';

export const createPost = async (postData) => {
  try {
    const { data } = await api.post('/posts', postData);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const getPosts = async (page = 1, limit = 20) => {
  try {
    const { data } = await api.get('/posts', { params: { page, limit } });
    return data;
  } catch (error) {
    return { success: false, posts: [], total: 0 };
  }
};

export const getPostById = async (postId) => {
  try {
    const { data } = await api.get(`/posts/${postId}`);
    return data;
  } catch (error) {
    return { success: false, post: null };
  }
};

export const deletePost = async (postId) => {
  try {
    const { data } = await api.delete(`/posts/${postId}`);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const likePost = async (postId) => {
  try {
    const { data } = await api.post(`/posts/${postId}/like`);
    return data;
  } catch (error) {
    return { success: false };
  }
};

export const commentOnPost = async (postId, text) => {
  try {
    const { data } = await api.post(`/posts/${postId}/comments`, { text });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const getPostComments = async (postId) => {
  try {
    const { data } = await api.get(`/posts/${postId}/comments`);
    return data;
  } catch (error) {
    return { success: false, comments: [] };
  }
};

export const deleteComment = async (postId, commentId) => {
  try {
    const { data } = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export default {
  createPost, getPosts, getPostById, deletePost,
  likePost, commentOnPost, getPostComments, deleteComment,
};
