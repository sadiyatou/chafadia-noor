// src/context/NotificationContext.js

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';
import useAuth from '../hooks/UseAuth';

export const NotificationContext = createContext(null);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function NotificationProvider({ children }) {
  const { user } = useAuth();

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const registerForPushNotifications = async () => {
    try {
      if (!Device.isDevice) {
        Alert.alert(
          'Real Device Needed',
          'Push notifications work best on a real phone.'
        );
        return;
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
        setPermissionGranted(false);
        return;
      }

      setPermissionGranted(true);

      const token = await Notifications.getExpoPushTokenAsync();

      setExpoPushToken(token.data);

      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          expoPushToken: token.data,
          updatedAt: serverTimestamp(),
        });
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#064E3B',
        });
      }
    } catch (error) {
      console.log('PUSH TOKEN ERROR:', error);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);

    const q = query(
      collection(db, 'notifications'),
      where('receiverId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const loadedNotifications = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }));

      setNotifications(loadedNotifications);

      setUnreadCount(
        loadedNotifications.filter(item => !item.read).length
      );

      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      registerForPushNotifications();
    }
  }, [user]);

  const sendLocalNotification = async (
    title,
    body,
    data = {}
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null,
    });
  };

  const createNotification = async (
    receiverId,
    type,
    title,
    message,
    data = {}
  ) => {
    if (!receiverId) return;

    await addDoc(collection(db, 'notifications'), {
      receiverId,
      senderId: user?.uid || '',
      type,
      title,
      message,
      data,
      read: false,
      createdAt: serverTimestamp(),
    });
  };

  const sendMessageNotification = async (
    receiverId,
    senderName,
    message
  ) => {
    await createNotification(
      receiverId,
      'message',
      senderName,
      message,
      {}
    );
  };

  const sendCallNotification = async (
    receiverId,
    callerName,
    callType
  ) => {
    await createNotification(
      receiverId,
      'call',
      `${callerName} is calling`,
      `Incoming ${callType} call`,
      { callType }
    );
  };

  const sendCommunityNotification = async (
    receiverId,
    title,
    message,
    data = {}
  ) => {
    await createNotification(
      receiverId,
      'community',
      title,
      message,
      data
    );
  };

  const sendPrayerNotification = async (
    title,
    message,
    data = {}
  ) => {
    await sendLocalNotification(title, message, {
      type: 'prayer',
      ...data,
    });
  };

  const sendArabicNotification = async (
    title,
    message,
    data = {}
  ) => {
    await sendLocalNotification(title, message, {
      type: 'arabic',
      ...data,
    });
  };

  const sendRamadanNotification = async (
    title,
    message,
    data = {}
  ) => {
    await sendLocalNotification(title, message, {
      type: 'ramadan',
      ...data,
    });
  };

  const markAsRead = async id => {
    await updateDoc(doc(db, 'notifications', id), {
      read: true,
    });
  };

  const markAllAsRead = async () => {
    for (const item of notifications) {
      if (!item.read) {
        await updateDoc(doc(db, 'notifications', item.id), {
          read: true,
        });
      }
    }
  };

  const deleteNotification = async id => {
    await deleteDoc(doc(db, 'notifications', id));
  };

  const clearAllNotifications = async () => {
    for (const item of notifications) {
      await deleteDoc(doc(db, 'notifications', item.id));
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notifications,
        unreadCount,
        loading,
        permissionGranted,

        registerForPushNotifications,
        sendLocalNotification,
        createNotification,

        sendMessageNotification,
        sendCallNotification,
        sendCommunityNotification,

        sendPrayerNotification,
        sendArabicNotification,
        sendRamadanNotification,

        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotificationContext must be used inside NotificationProvider'
    );
  }

  return context;
}

export default NotificationContext;