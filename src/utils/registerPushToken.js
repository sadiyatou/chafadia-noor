import { Platform } from 'react-native';
import Notifications from './safeNotifications';
import api from '../api/client';

// Registers this device's Expo push token with the backend so it can
// receive push notifications for new messages and incoming calls while
// backgrounded (see server/utils/push.js). Safe to call every time the
// app starts — it's a cheap idempotent upsert server-side.
export const registerPushToken = async () => {
  try {
    const settled = await Notifications.getPermissionsAsync();
    let status = settled.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== 'granted') return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync?.('default', {
        name: 'default',
        importance: 4, // Notifications.AndroidImportance.HIGH
      });
    }

    const { data } = await Notifications.getExpoPushTokenAsync();
    if (!data) return;

    await api.post('/users/push-token', { pushToken: data });
  } catch {
    // Push registration is best-effort — never block app usage on it.
  }
};

export default registerPushToken;
