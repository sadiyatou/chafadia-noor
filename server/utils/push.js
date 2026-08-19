const { Expo } = require('expo-server-sdk');
const { query } = require('../config/db');

const expo = new Expo();

// Sends a push notification to a user's stored Expo push token (see
// POST /api/users/push-token). Silently no-ops if the user has none
// registered, or if the token turns out to be invalid — this is a
// best-effort notification path, never something callers should await
// for correctness.
const sendPushToUser = async (userId, { title, body, data = {} }) => {
  try {
    const result = await query('SELECT push_token FROM users WHERE id = $1', [userId]);
    const token = result.rows[0]?.push_token;
    if (!token || !Expo.isExpoPushToken(token)) return;

    await expo.sendPushNotificationsAsync([{ to: token, sound: 'default', title, body, data }]);
  } catch (err) {
    console.error('Push notification failed:', err.message);
  }
};

module.exports = { sendPushToUser };
