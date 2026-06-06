import { useCallback, useEffect, useState } from 'react';

import * as Notifications from 'expo-notifications';

import * as Device from 'expo-device';

import { Alert, Platform } from 'react-native';

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';

import useAuth from './UseAuth';

// NOTIFICATION BEHAVIOUR
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,

    shouldPlaySound: true,

    shouldSetBadge: true,

    shouldShowBanner: true,

    shouldShowList: true,
  }),
});

export default function useNotifications() {
  const { user } = useAuth();

  const [expoPushToken, setExpoPushToken] =
    useState('');

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [permissionGranted, setPermissionGranted] =
    useState(false);

  // REGISTER FOR PUSH NOTIFICATIONS
  const registerForPushNotifications =
    useCallback(async () => {
      try {
        if (!Device.isDevice) {
          Alert.alert(
            'Real Device Needed',
            'Push notifications only work on physical devices.'
          );

          return;
        }

        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } =
            await Notifications.requestPermissionsAsync();

          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          setPermissionGranted(false);

          Alert.alert(
            'Permission Denied',
            'Notification permission is required.'
          );

          return;
        }

        setPermissionGranted(true);

        const token =
          await Notifications.getExpoPushTokenAsync();

        setExpoPushToken(token.data);

        // SAVE TOKEN TO FIREBASE
        if (user?.uid) {
          const userRef = doc(
            db,
            'users',
            user.uid
          );

          await updateDoc(userRef, {
            expoPushToken: token.data,
          });
        }

        // ANDROID CHANNEL
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync(
            'default',

            {
              name: 'default',

              importance:
                Notifications.AndroidImportance
                  .MAX,

              vibrationPattern: [
                0, 250, 250, 250,
              ],

              lightColor: '#064E3B',
            }
          );
        }
      } catch (error) {
        console.log(
          'NOTIFICATION REGISTER ERROR:',
          error
        );
      }
    }, [user]);

  // LOAD USER NOTIFICATIONS
  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);

    const notificationsRef = collection(
      db,
      'notifications'
    );

    const q = query(
      notificationsRef,

      where('receiverId', '==', user.uid),

      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,

      snapshot => {
        const loadedNotifications =
          snapshot.docs.map(docItem => ({
            id: docItem.id,

            ...docItem.data(),
          }));

        setNotifications(
          loadedNotifications
        );

        const unread =
          loadedNotifications.filter(
            item => !item.read
          ).length;

        setUnreadCount(unread);

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // REGISTER AUTOMATICALLY
  useEffect(() => {
    registerForPushNotifications();
  }, [registerForPushNotifications]);

  // SEND LOCAL NOTIFICATION
  const sendLocalNotification =
    async ({
      title,
      body,
      data = {},
    }) => {
      try {
        await Notifications.scheduleNotificationAsync(
          {
            content: {
              title,

              body,

              data,

              sound: true,
            },

            trigger: null,
          }
        );
      } catch (error) {
        console.log(
          'LOCAL NOTIFICATION ERROR:',
          error
        );
      }
    };

  // SEND PRAYER REMINDER
  const sendPrayerReminder =
    async prayerName => {
      await sendLocalNotification({
        title: 'Prayer Reminder',

        body: `It is almost time for ${prayerName} prayer.`,

        data: {
          type: 'prayer',
        },
      });
    };

  // SEND MESSAGE NOTIFICATION
  const sendMessageNotification =
    async ({
      receiverId,
      senderName,
      message,
    }) => {
      try {
        await addDoc(
          collection(db, 'notifications'),

          {
            receiverId,

            type: 'message',

            title: senderName,

            message,

            read: false,

            createdAt:
              serverTimestamp(),
          }
        );
      } catch (error) {
        console.log(
          'MESSAGE NOTIFICATION ERROR:',
          error
        );
      }
    };

  // SEND CALL NOTIFICATION
  const sendCallNotification =
    async ({
      receiverId,
      callerName,
      callType,
    }) => {
      try {
        await addDoc(
          collection(db, 'notifications'),

          {
            receiverId,

            type: 'call',

            title:
              `${callerName} is calling`,

            message:
              `Incoming ${callType} call`,

            read: false,

            createdAt:
              serverTimestamp(),
          }
        );
      } catch (error) {
        console.log(
          'CALL NOTIFICATION ERROR:',
          error
        );
      }
    };

  // SEND COMMUNITY NOTIFICATION
  const sendCommunityNotification =
    async ({
      receiverId,
      title,
      message,
    }) => {
      try {
        await addDoc(
          collection(db, 'notifications'),

          {
            receiverId,

            type: 'community',

            title,

            message,

            read: false,

            createdAt:
              serverTimestamp(),
          }
        );
      } catch (error) {
        console.log(
          'COMMUNITY NOTIFICATION ERROR:',
          error
        );
      }
    };

  // SEND ARABIC LEARNING REMINDER
  const sendArabicReminder =
    async lessonName => {
      await sendLocalNotification({
        title: 'Arabic Lesson Reminder',

        body:
          `Continue your Arabic lesson: ${lessonName}`,

        data: {
          type: 'arabic',
        },
      });
    };

  // SEND RAMADAN REMINDER
  const sendRamadanReminder =
    async message => {
      await sendLocalNotification({
        title: 'Ramadan Reminder',

        body: message,

        data: {
          type: 'ramadan',
        },
      });
    };

  // MARK AS READ
  const markAsRead = async id => {
    try {
      const notificationRef = doc(
        db,
        'notifications',
        id
      );

      await updateDoc(notificationRef, {
        read: true,
      });
    } catch (error) {
      console.log(
        'MARK READ ERROR:',
        error
      );
    }
  };

  // MARK ALL AS READ
  const markAllAsRead = async () => {
    try {
      const unreadNotifications =
        notifications.filter(
          item => !item.read
        );

      for (const item of unreadNotifications) {
        const notificationRef = doc(
          db,
          'notifications',
          item.id
        );

        await updateDoc(notificationRef, {
          read: true,
        });
      }
    } catch (error) {
      console.log(
        'MARK ALL READ ERROR:',
        error
      );
    }
  };

  // DELETE NOTIFICATION
  const deleteNotification =
    async id => {
      try {
        await deleteDoc(
          doc(db, 'notifications', id)
        );
      } catch (error) {
        console.log(
          'DELETE NOTIFICATION ERROR:',
          error
        );
      }
    };

  // CLEAR ALL
  const clearAllNotifications =
    async () => {
      try {
        for (const item of notifications) {
          await deleteDoc(
            doc(
              db,
              'notifications',
              item.id
            )
          );
        }
      } catch (error) {
        console.log(
          'CLEAR NOTIFICATIONS ERROR:',
          error
        );
      }
    };

  return {
    expoPushToken,

    notifications,

    unreadCount,

    loading,

    permissionGranted,

    registerForPushNotifications,

    sendLocalNotification,

    sendPrayerReminder,

    sendMessageNotification,

    sendCallNotification,

    sendCommunityNotification,

    sendArabicReminder,

    sendRamadanReminder,

    markAsRead,

    markAllAsRead,

    deleteNotification,

    clearAllNotifications,
  };
}