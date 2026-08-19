import api from './client';

export const getNotifications = async (page = 1, limit = 30) => {
  try {
    const { data } = await api.get('/notifications', { params: { page, limit } });
    return data;
  } catch (error) {
    return { success: false, notifications: [], unreadCount: 0 };
  }
};

export const getUnreadCount = async () => {
  try {
    const { data } = await api.get('/notifications/unread-count');
    return data.unreadCount || 0;
  } catch (error) {
    return 0;
  }
};

export const markNotificationRead = async (notificationId) => {
  try {
    const { data } = await api.put(`/notifications/${notificationId}/read`);
    return data;
  } catch (error) {
    return { success: false };
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const { data } = await api.put('/notifications/read-all');
    return data;
  } catch (error) {
    return { success: false };
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const { data } = await api.delete(`/notifications/${notificationId}`);
    return data;
  } catch (error) {
    return { success: false };
  }
};

export const clearAllNotifications = async () => {
  try {
    const { data } = await api.delete('/notifications/all');
    return data;
  } catch (error) {
    return { success: false };
  }
};

export default {
  getNotifications, getUnreadCount, markNotificationRead,
  markAllNotificationsRead, deleteNotification, clearAllNotifications,
};
