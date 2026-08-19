import api from './client';

export const createCall = async ({ receiverId, type = 'audio' }) => {
  try {
    const { data } = await api.post('/calls', { receiverId, type });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const answerCall = async (callId) => {
  try {
    const { data } = await api.put(`/calls/${callId}/answer`);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const rejectCall = async (callId) => {
  try {
    const { data } = await api.put(`/calls/${callId}/reject`);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const endCall = async (callId) => {
  try {
    const { data } = await api.put(`/calls/${callId}/end`);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const getCalls = async (page = 1, limit = 30) => {
  try {
    const { data } = await api.get('/calls', { params: { page, limit } });
    return data.calls || [];
  } catch (error) {
    return [];
  }
};

export const getCallById = async (callId) => {
  try {
    const { data } = await api.get(`/calls/${callId}`);
    return data.call || null;
  } catch (error) {
    return null;
  }
};

export default {
  createCall, answerCall, rejectCall, endCall, getCalls, getCallById,
};
