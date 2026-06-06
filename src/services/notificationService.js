import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Alert, Platform } from 'react-native';

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotifications = async userId => {
  try {
    if (!Device.isDevice) {
      Alert.alert(
        'Real Device Needed',
        'Push notifications work best on a real phone.'
      );
      return null;
    }

    const existingPermission =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingPermission.status;

    if (finalStatus !== 'granted') {
      const permission =
        await Notifications.requestPermissionsAsync();

      finalStatus = permission.status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync();

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#064E3B',
      });
    }

    if (userId) {
      await updateDoc(doc(db, 'users', userId), {
        expoPushToken: token.data,
        updatedAt: serverTimestamp(),
      });
    }

    return token.data;
  } catch (error) {
    console.log('REGISTER PUSH ERROR:', error);
    return null;
  }
};

export const listenToUserNotifications = (userId, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('receiverId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, snapshot => {
    const notifications = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    }));

    callback(notifications);
  });
};

export const createNotification = async ({
  receiverId,
  senderId = '',
  type = 'system',
  title,
  message,
  data = {},
}) => {
  try {
    if (!receiverId) {
      return {
        success: false,
        error: 'receiverId is required',
      };
    }

    const notificationData = {
      receiverId,
      senderId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: serverTimestamp(),
    };

    const notificationRef = await addDoc(
      collection(db, 'notifications'),
      notificationData
    );

    return {
      success: true,
      id: notificationRef.id,
      data: notificationData,
    };
  } catch (error) {
    console.log('CREATE NOTIFICATION ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

export const sendLocalNotification = async ({
  title,
  body,
  data = {},
  seconds = 1,
}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: {
        seconds,
      },
    });

    return { success: true };
  } catch (error) {
    console.log('LOCAL NOTIFICATION ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

export const sendInstantLocalNotification = async ({
  title,
  body,
  data = {},
}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null,
    });

    return { success: true };
  } catch (error) {
    console.log('INSTANT NOTIFICATION ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

export const schedulePrayerNotification = async ({
  prayerName,
  prayerTime,
}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${prayerName} Prayer Time`,
        body: `It is time for ${prayerName}. May Allah accept your salah.`,
        data: {
          type: 'prayer',
          prayerName,
        },
        sound: true,
      },
      trigger: prayerTime,
    });

    return { success: true };
  } catch (error) {
    console.log('PRAYER NOTIFICATION ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

export const scheduleReminderNotification = async ({
  title,
  body,
  date,
  data = {},
}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: date,
    });

    return { success: true };
  } catch (error) {
    console.log('REMINDER NOTIFICATION ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

export const cancelAllScheduledNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return { success: true };
  } catch (error) {
    console.log('CANCEL NOTIFICATIONS ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

export const getScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('GET SCHEDULED NOTIFICATIONS ERROR:', error);
    return [];
  }
};

export const markNotificationAsRead = async notificationId => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
    });

    return { success: true };
  } catch (error) {
    console.log('MARK NOTIFICATION READ ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

export const markAllNotificationsAsRead = async userId => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('receiverId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);

    for (const item of snapshot.docs) {
      await updateDoc(item.ref, {
        read: true,
      });
    }

    return { success: true };
  } catch (error) {
    console.log('MARK ALL READ ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteNotification = async notificationId => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));

    return { success: true };
  } catch (error) {
    console.log('DELETE NOTIFICATION ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

export const clearUserNotifications = async userId => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('receiverId', '==', userId)
    );

    const snapshot = await getDocs(q);

    for (const item of snapshot.docs) {
      await deleteDoc(item.ref);
    }

    return { success: true };
  } catch (error) {
    console.log('CLEAR NOTIFICATIONS ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

export const createMessageNotification = async ({
  receiverId,
  senderId,
  senderName,
  message,
  chatId,
}) => {
  return createNotification({
    receiverId,
    senderId,
    type: 'message',
    title: senderName,
    message,
    data: {
      chatId,
      type: 'message',
    },
  });
};

export const createCallNotification = async ({
  receiverId,
  callerId,
  callerName,
  callId,
  callType,
}) => {
  return createNotification({
    receiverId,
    senderId: callerId,
    type: 'call',
    title: `${callerName} is calling`,
    message: `Incoming ${callType} call`,
    data: {
      callId,
      callType,
      type: 'call',
    },
  });
};

export const createCommunityNotification = async ({
  receiverId,
  senderId,
  title,
  message,
  postId,
}) => {
  return createNotification({
    receiverId,
    senderId,
    type: 'community',
    title,
    message,
    data: {
      postId,
      type: 'community',
    },
  });
};

export const createSystemNotification = async ({
  receiverId,
  title,
  message,
  data = {},
}) => {
  return createNotification({
    receiverId,
    senderId: '',
    type: 'system',
    title,
    message,
    data,
  });
};

export default {
  registerForPushNotifications,
  listenToUserNotifications,
  createNotification,

  sendLocalNotification,
  sendInstantLocalNotification,
  schedulePrayerNotification,
  scheduleReminderNotification,

  cancelAllScheduledNotifications,
  getScheduledNotifications,

  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearUserNotifications,

  createMessageNotification,
  createCallNotification,
  createCommunityNotification,
  createSystemNotification,
};