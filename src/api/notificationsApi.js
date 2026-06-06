import notificationService from '../services/notificationService';

/* =========================================================
   PUSH NOTIFICATIONS
========================================================= */

export const registerForPushNotifications = async userId => {
  try {
    const token =
      await notificationService.registerForPushNotifications(userId);

    return {
      success: true,
      token,
      message: token
        ? 'Push notifications enabled.'
        : 'Push notification permission was not granted.',
    };
  } catch (error) {
    console.log('REGISTER PUSH API ERROR:', error);

    return {
      success: false,
      token: null,
      message:
        error.message ||
        'Failed to register for push notifications.',
    };
  }
};

/* =========================================================
   LISTEN TO USER NOTIFICATIONS
========================================================= */

export const listenToUserNotifications = (userId, callback) => {
  return notificationService.listenToUserNotifications(
    userId,
    callback
  );
};

/* =========================================================
   CREATE NOTIFICATION
========================================================= */

export const createNotification = async data => {
  try {
    const response =
      await notificationService.createNotification(data);

    return {
      success: response.success,
      data: response,
      message: response.success
        ? 'Notification created.'
        : response.error,
    };
  } catch (error) {
    console.log('CREATE NOTIFICATION API ERROR:', error);

    return {
      success: false,
      message:
        error.message ||
        'Failed to create notification.',
    };
  }
};

/* =========================================================
   LOCAL NOTIFICATIONS
========================================================= */

export const sendLocalNotification = async data => {
  try {
    return await notificationService.sendLocalNotification(data);
  } catch (error) {
    console.log('LOCAL NOTIFICATION API ERROR:', error);

    return {
      success: false,
      message:
        error.message ||
        'Failed to send local notification.',
    };
  }
};

export const sendInstantLocalNotification = async data => {
  try {
    return await notificationService.sendInstantLocalNotification(data);
  } catch (error) {
    console.log('INSTANT NOTIFICATION API ERROR:', error);

    return {
      success: false,
      message:
        error.message ||
        'Failed to send instant notification.',
    };
  }
};

export const schedulePrayerNotification = async data => {
  try {
    return await notificationService.schedulePrayerNotification(data);
  } catch (error) {
    console.log('PRAYER NOTIFICATION API ERROR:', error);

    return {
      success: false,
      message:
        error.message ||
        'Failed to schedule prayer notification.',
    };
  }
};

export const scheduleReminderNotification = async data => {
  try {
    return await notificationService.scheduleReminderNotification(data);
  } catch (error) {
    console.log('REMINDER NOTIFICATION API ERROR:', error);

    return {
      success: false,
      message:
        error.message ||
        'Failed to schedule reminder notification.',
    };
  }
};

/* =========================================================
   SCHEDULED NOTIFICATIONS
========================================================= */

export const getScheduledNotifications = async () => {
  try {
    const notifications =
      await notificationService.getScheduledNotifications();

    return {
      success: true,
      data: notifications,
    };
  } catch (error) {
    console.log('GET SCHEDULED NOTIFICATIONS API ERROR:', error);

    return {
      success: false,
      data: [],
      message:
        error.message ||
        'Failed to load scheduled notifications.',
    };
  }
};

export const cancelAllScheduledNotifications = async () => {
  try {
    return await notificationService.cancelAllScheduledNotifications();
  } catch (error) {
    console.log('CANCEL NOTIFICATIONS API ERROR:', error);

    return {
      success: false,
      message:
        error.message ||
        'Failed to cancel notifications.',
    };
  }
};

/* =========================================================
   MARK READ / DELETE
========================================================= */

export const markNotificationAsRead = async notificationId => {
  try {
    return await notificationService.markNotificationAsRead(
      notificationId
    );
  } catch (error) {
    console.log('MARK READ API ERROR:', error);

    return {
      success: false,
      message:
        error.message ||
        'Failed to mark notification as read.',
    };
  }
};

export const markAllNotificationsAsRead = async userId => {
  try {
    return await notificationService.markAllNotificationsAsRead(userId);
  } catch (error) {
    console.log('MARK ALL READ API ERROR:', error);

    return {
      success: false,
      message:
        error.message ||
        'Failed to mark notifications as read.',
    };
  }
};

export const deleteNotification = async notificationId => {
  try {
    return await notificationService.deleteNotification(notificationId);
  } catch (error) {
    console.log('DELETE NOTIFICATION API ERROR:', error);

    return {
      success: false,
      message:
        error.message ||
        'Failed to delete notification.',
    };
  }
};

export const clearUserNotifications = async userId => {
  try {
    return await notificationService.clearUserNotifications(userId);
  } catch (error) {
    console.log('CLEAR NOTIFICATIONS API ERROR:', error);

    return {
      success: false,
      message:
        error.message ||
        'Failed to clear notifications.',
    };
  }
};

/* =========================================================
   MESSAGE / CALL / COMMUNITY / SYSTEM
========================================================= */

export const createMessageNotification = async data => {
  try {
    return await notificationService.createMessageNotification(data);
  } catch (error) {
    console.log('MESSAGE NOTIFICATION API ERROR:', error);

    return {
      success: false,
      message:
        error.message ||
        'Failed to create message notification.',
    };
  }
};

export const createCallNotification = async data => {
  try {
    return await notificationService.createCallNotification(data);
  } catch (error) {
    console.log('CALL NOTIFICATION API ERROR:', error);

    return {
      success: false,
      message:
        error.message ||
        'Failed to create call notification.',
    };
  }
};

export const createCommunityNotification = async data => {
  try {
    return await notificationService.createCommunityNotification(data);
  } catch (error) {
    console.log('COMMUNITY NOTIFICATION API ERROR:', error);

    return {
      success: false,
      message:
        error.message ||
        'Failed to create community notification.',
    };
  }
};

export const createSystemNotification = async data => {
  try {
    return await notificationService.createSystemNotification(data);
  } catch (error) {
    console.log('SYSTEM NOTIFICATION API ERROR:', error);

    return {
      success: false,
      message:
        error.message ||
        'Failed to create system notification.',
    };
  }
};

/* =========================================================
   EXPORT DEFAULT
========================================================= */

export default {
  registerForPushNotifications,
  listenToUserNotifications,
  createNotification,

  sendLocalNotification,
  sendInstantLocalNotification,
  schedulePrayerNotification,
  scheduleReminderNotification,

  getScheduledNotifications,
  cancelAllScheduledNotifications,

  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearUserNotifications,

  createMessageNotification,
  createCallNotification,
  createCommunityNotification,
  createSystemNotification,
};