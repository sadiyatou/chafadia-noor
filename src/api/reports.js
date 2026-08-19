import api from './client';

export const reportUser = async (reportedUserId, reason) => {
  try {
    const { data } = await api.post('/reports', { reportedUserId, reason });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const reportPost = async (reportedPostId, reason) => {
  try {
    const { data } = await api.post('/reports', { reportedPostId, reason });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export const getMyReports = async () => {
  try {
    const { data } = await api.get('/reports/mine');
    return data.reports || [];
  } catch (error) {
    return [];
  }
};

export default { reportUser, reportPost, getMyReports };
