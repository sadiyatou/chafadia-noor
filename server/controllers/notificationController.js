const { query } = require('../config/db');

const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 30, 50);
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT n.id, n.type, n.title, n.body, n.data, n.read, n.created_at,
              u.id AS sender_id, u.full_name AS sender_name, u.photo_url AS sender_photo
       FROM notifications n
       LEFT JOIN users u ON u.id = n.sender_id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1',
      [req.user.id]
    );
    const unreadResult = await query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false',
      [req.user.id]
    );

    const notifications = result.rows.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      data: n.data,
      read: n.read,
      createdAt: n.created_at,
      sender: n.sender_id ? {
        id: n.sender_id,
        fullName: n.sender_name,
        photoURL: n.sender_photo,
      } : null,
    }));

    res.json({
      success: true,
      notifications,
      page,
      limit,
      total: parseInt(countResult.rows[0].count),
      unreadCount: parseInt(unreadResult.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false',
      [req.user.id]
    );
    res.json({ success: true, unreadCount: parseInt(result.rows[0].count) });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const result = await query(
      'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await query(
      'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
      [req.user.id]
    );
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    next(err);
  }
};

const clearAll = async (req, res, next) => {
  try {
    await query('DELETE FROM notifications WHERE user_id = $1', [req.user.id]);
    res.json({ success: true, message: 'All notifications cleared.' });
  } catch (err) {
    next(err);
  }
};

// Internal helper — used by other controllers to create notifications
const createNotification = async ({ userId, senderId, type, title, body, data = {} }, io) => {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, sender_id, type, title, body, data)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, type, title, body, data, read, created_at`,
      [userId, senderId || null, type, title || '', body || '', JSON.stringify(data)]
    );

    const n = result.rows[0];

    if (io) {
      let sender = null;
      if (senderId) {
        const s = await query('SELECT id, full_name, photo_url FROM users WHERE id = $1', [senderId]);
        if (s.rows.length > 0) {
          sender = { id: s.rows[0].id, fullName: s.rows[0].full_name, photoURL: s.rows[0].photo_url };
        }
      }

      io.to(`user:${userId}`).emit('notification:new', {
        id: n.id, type: n.type, title: n.title, body: n.body,
        data: n.data, read: n.read, createdAt: n.created_at, sender,
      });
    }

    return { success: true, notificationId: n.id };
  } catch (err) {
    console.error('CREATE NOTIFICATION ERROR:', err.message);
    return { success: false };
  }
};

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll, createNotification };
