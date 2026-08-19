let Notifications = null;

try {
  Notifications = require('expo-notifications');
} catch (e) {}

const noop = () => {};
const noopAsync = async () => {};

const safe = {
  getPermissionsAsync: async () => ({ status: 'undetermined', granted: false }),
  requestPermissionsAsync: async () => ({ status: 'undetermined', granted: false }),
  getExpoPushTokenAsync: async () => ({ data: '' }),
  scheduleNotificationAsync: noopAsync,
  cancelScheduledNotificationAsync: noopAsync,
  cancelAllScheduledNotificationsAsync: noopAsync,
  setNotificationHandler: noop,
  addNotificationReceivedListener: () => ({ remove: noop }),
  addNotificationResponseReceivedListener: () => ({ remove: noop }),
  setNotificationChannelAsync: noopAsync,
};

export default Notifications || safe;
