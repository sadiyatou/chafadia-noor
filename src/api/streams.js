import api from './client';

export const startStream = async ({ title, description = '', thumbnailUrl = '' }) => {
  try {
    const { data } = await api.post('/streams', { title, description, thumbnailUrl });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const endStream = async (streamId) => {
  try {
    const { data } = await api.put(`/streams/${streamId}/end`);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const getLiveStreams = async () => {
  try {
    const { data } = await api.get('/streams');
    return data.streams || [];
  } catch (error) {
    return [];
  }
};

export const getStreamById = async (streamId) => {
  try {
    const { data } = await api.get(`/streams/${streamId}`);
    return data.stream || null;
  } catch (error) {
    return null;
  }
};

export const joinStream = async (streamId) => {
  try {
    const { data } = await api.post(`/streams/${streamId}/join`);
    return data;
  } catch (error) {
    return { success: false };
  }
};

export const leaveStream = async (streamId) => {
  try {
    const { data } = await api.post(`/streams/${streamId}/leave`);
    return data;
  } catch (error) {
    return { success: false };
  }
};

export const postStreamComment = async (streamId, text) => {
  try {
    const { data } = await api.post(`/streams/${streamId}/comments`, { text });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const getStreamComments = async (streamId) => {
  try {
    const { data } = await api.get(`/streams/${streamId}/comments`);
    return data.comments || [];
  } catch (error) {
    return [];
  }
};

export default {
  startStream, endStream, getLiveStreams, getStreamById,
  joinStream, leaveStream, postStreamComment, getStreamComments,
};
