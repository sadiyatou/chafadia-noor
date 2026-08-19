const { query } = require('../config/db');

const getStats = async (req, res, next) => {
  try {
    const [users, posts, reports, chats, calls, streams] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query('SELECT COUNT(*) FROM posts'),
      query("SELECT COUNT(*) FROM reports WHERE status = 'open'"),
      query('SELECT COUNT(*) FROM chats'),
      query('SELECT COUNT(*) FROM calls'),
      query("SELECT COUNT(*) FROM live_streams WHERE status = 'live'"),
    ]);

    const banned = await query('SELECT COUNT(*) FROM users WHERE is_banned = true');
    const online = await query('SELECT COUNT(*) FROM users WHERE is_online = true');
    const recentUsers = await query(
      `SELECT id, full_name, email, role, is_banned, created_at
       FROM users ORDER BY created_at DESC LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(users.rows[0].count),
        bannedUsers: parseInt(banned.rows[0].count),
        onlineUsers: parseInt(online.rows[0].count),
        totalPosts: parseInt(posts.rows[0].count),
        openReports: parseInt(reports.rows[0].count),
        totalChats: parseInt(chats.rows[0].count),
        totalCalls: parseInt(calls.rows[0].count),
        liveStreams: parseInt(streams.rows[0].count),
      },
      recentUsers: recentUsers.rows.map(u => ({
        id: u.id, fullName: u.full_name, email: u.email,
        role: u.role, isBanned: u.is_banned, createdAt: u.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const search = req.query.q || '';
    const role = req.query.role || '';
    const banned = req.query.banned;

    let where = 'WHERE 1=1';
    const params = [];
    let idx = 1;

    if (search) { where += ` AND (full_name ILIKE $${idx} OR email ILIKE $${idx})`; params.push(`%${search}%`); idx++; }
    if (role) { where += ` AND role = $${idx}`; params.push(role); idx++; }
    if (banned === 'true') { where += ' AND is_banned = true'; }
    if (banned === 'false') { where += ' AND is_banned = false'; }

    const countResult = await query(`SELECT COUNT(*) FROM users ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT id, uid, full_name, email, phone, photo_url, bio, role, verified, is_online, is_banned, last_seen, created_at
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    const users = result.rows.map(u => ({
      id: u.id, uid: u.uid, fullName: u.full_name, email: u.email, phone: u.phone,
      photoURL: u.photo_url, bio: u.bio, role: u.role, verified: u.verified,
      isOnline: u.is_online, isBanned: u.is_banned, lastSeen: u.last_seen, createdAt: u.created_at,
    }));

    res.json({ success: true, users, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

const toggleBan = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await query('SELECT id, is_banned, role FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.rows[0].role === 'main_admin') return res.status(403).json({ success: false, message: 'Cannot ban the main admin.' });

    const newBanned = !user.rows[0].is_banned;
    await query('UPDATE users SET is_banned = $1, updated_at = NOW() WHERE id = $2', [newBanned, userId]);

    res.json({ success: true, isBanned: newBanned });
  } catch (err) {
    next(err);
  }
};

const changeRole = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    const allowed = ['user', 'admin', 'main_admin'];

    if (!allowed.includes(role)) return res.status(400).json({ success: false, message: 'Invalid role.' });

    const user = await query('SELECT id, role FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.rows[0].role === 'main_admin' && req.user.role !== 'main_admin') {
      return res.status(403).json({ success: false, message: 'Only main_admin can change main_admin role.' });
    }

    await query('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2', [role, userId]);
    res.json({ success: true, role });
  } catch (err) {
    next(err);
  }
};

const getReports = async (req, res, next) => {
  try {
    const status = req.query.status || 'open';

    const result = await query(
      `SELECT r.id, r.reason, r.status, r.created_at, r.resolved_at,
              reporter.id AS reporter_id, reporter.full_name AS reporter_name, reporter.email AS reporter_email,
              reported_user.id AS reported_user_id, reported_user.full_name AS reported_user_name, reported_user.email AS reported_user_email, reported_user.is_banned AS reported_user_banned,
              p.id AS post_id, p.text AS post_text, p.media_url AS post_media,
              resolver.full_name AS resolved_by_name
       FROM reports r
       JOIN users reporter ON reporter.id = r.reporter_id
       LEFT JOIN users reported_user ON reported_user.id = r.reported_user_id
       LEFT JOIN posts p ON p.id = r.reported_post_id
       LEFT JOIN users resolver ON resolver.id = r.resolved_by
       WHERE r.status = $1
       ORDER BY r.created_at DESC`,
      [status]
    );

    const reports = result.rows.map(r => ({
      id: r.id, reason: r.reason, status: r.status, createdAt: r.created_at, resolvedAt: r.resolved_at,
      reporter: { id: r.reporter_id, fullName: r.reporter_name, email: r.reporter_email },
      reportedUser: r.reported_user_id ? { id: r.reported_user_id, fullName: r.reported_user_name, email: r.reported_user_email, isBanned: r.reported_user_banned } : null,
      reportedPost: r.post_id ? { id: r.post_id, text: r.post_text, mediaUrl: r.post_media } : null,
      resolvedByName: r.resolved_by_name,
    }));

    res.json({ success: true, reports });
  } catch (err) {
    next(err);
  }
};

const resolveReport = async (req, res, next) => {
  try {
    const { action } = req.body;
    const allowed = ['resolved', 'dismissed', 'banned'];
    if (!allowed.includes(action)) return res.status(400).json({ success: false, message: 'Action must be resolved, dismissed, or banned.' });

    const report = await query('SELECT id, reported_user_id, status FROM reports WHERE id = $1', [req.params.id]);
    if (report.rows.length === 0) return res.status(404).json({ success: false, message: 'Report not found.' });
    if (report.rows[0].status !== 'open') return res.status(400).json({ success: false, message: 'Report already resolved.' });

    await query(
      'UPDATE reports SET status = $1, resolved_by = $2, resolved_at = NOW() WHERE id = $3',
      [action, req.user.id, req.params.id]
    );

    if (action === 'banned' && report.rows[0].reported_user_id) {
      await query('UPDATE users SET is_banned = true, updated_at = NOW() WHERE id = $1', [report.rows[0].reported_user_id]);
    }

    res.json({ success: true, message: `Report ${action}.` });
  } catch (err) {
    next(err);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;

    const countResult = await query('SELECT COUNT(*) FROM posts');
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT p.id, p.text, p.media_url, p.media_type, p.likes, p.comments_count, p.views, p.created_at,
              u.id AS user_id, u.full_name, u.email, u.is_banned
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const posts = result.rows.map(r => ({
      id: r.id, text: r.text, mediaUrl: r.media_url, mediaType: r.media_type,
      likes: r.likes, commentsCount: r.comments_count, views: r.views, createdAt: r.created_at,
      author: { id: r.user_id, fullName: r.full_name, email: r.email, isBanned: r.is_banned },
    }));

    res.json({ success: true, posts, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM posts WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  TOGGLE USER VERIFICATION
// ══════════════════════════════════════════════

const toggleVerified = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await query('SELECT id, verified FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    const newVerified = !user.rows[0].verified;
    await query('UPDATE users SET verified = $1, updated_at = NOW() WHERE id = $2', [newVerified, userId]);

    res.json({ success: true, verified: newVerified });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  DELETE USER ACCOUNT
// ══════════════════════════════════════════════

const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await query('SELECT id, role FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.rows[0].role === 'main_admin') return res.status(403).json({ success: false, message: 'Cannot delete the main admin.' });

    await query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  BROADCAST NOTIFICATION TO ALL USERS
// ══════════════════════════════════════════════

const broadcastNotification = async (req, res, next) => {
  try {
    const { title, body, type = 'announcement' } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required.' });
    }

    const users = await query('SELECT id FROM users WHERE is_banned = false');
    const senderId = req.user.id;

    const io = req.app.get('io');
    let senderData = null;
    if (io) {
      const sender = await query('SELECT id, full_name, photo_url FROM users WHERE id = $1', [senderId]);
      senderData = sender.rows[0]
        ? { id: sender.rows[0].id, fullName: sender.rows[0].full_name, photoURL: sender.rows[0].photo_url }
        : null;
    }

    for (const u of users.rows) {
      const result = await query(
        `INSERT INTO notifications (user_id, sender_id, type, title, body)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, type, title, body, data, read, created_at`,
        [u.id, senderId, type, title, body]
      );

      // Same event/shape the app already listens for (see notificationController.js's
      // createNotification) — broadcasting a plain 'notification' event here previously
      // meant announcements never reached any device in real time.
      if (io) {
        const n = result.rows[0];
        io.to(`user:${u.id}`).emit('notification:new', {
          id: n.id, type: n.type, title: n.title, body: n.body,
          data: n.data, read: n.read, createdAt: n.created_at, sender: senderData,
        });
      }
    }

    res.json({ success: true, message: `Notification sent to ${users.rows.length} users.`, count: users.rows.length });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  ADMIN: LIST ALL CHATS PLATFORM-WIDE
// ══════════════════════════════════════════════

const getAllChats = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;
    const type = req.query.type || '';

    let where = '';
    const params = [];
    let idx = 1;

    if (type) { where = `WHERE c.type = $${idx}`; params.push(type); idx++; }

    const countResult = await query(`SELECT COUNT(*) FROM chats c ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT c.id, c.type, c.name, c.last_message, c.last_message_type, c.last_message_time, c.created_at,
              u.full_name AS creator_name,
              (SELECT COUNT(*) FROM chat_members WHERE chat_id = c.id) AS member_count
       FROM chats c
       LEFT JOIN users u ON u.id = c.created_by
       ${where}
       ORDER BY c.last_message_time DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    const chats = result.rows.map(c => ({
      id: c.id, type: c.type, name: c.name || `Chat #${c.id}`,
      lastMessage: c.last_message, lastMessageType: c.last_message_type,
      lastMessageTime: c.last_message_time, creatorName: c.creator_name,
      memberCount: parseInt(c.member_count), createdAt: c.created_at,
    }));

    res.json({ success: true, chats, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  ADMIN: DELETE ANY CHAT
// ══════════════════════════════════════════════

const adminDeleteChat = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM chats WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Chat not found.' });
    res.json({ success: true, message: 'Chat deleted.' });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  ADMIN: FORCE END LIVE STREAM
// ══════════════════════════════════════════════

const forceEndStream = async (req, res, next) => {
  try {
    const stream = await query("SELECT id, status FROM live_streams WHERE id = $1", [req.params.id]);
    if (stream.rows.length === 0) return res.status(404).json({ success: false, message: 'Stream not found.' });
    if (stream.rows[0].status !== 'live') return res.status(400).json({ success: false, message: 'Stream is not live.' });

    await query("UPDATE live_streams SET status = 'ended', ended_at = NOW() WHERE id = $1", [req.params.id]);

    const io = req.app.get('io');
    if (io) {
      io.emit('stream:ended', { streamId: parseInt(req.params.id) });
    }

    res.json({ success: true, message: 'Stream ended by admin.' });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  ADMIN: GET ALL LIVE STREAMS (including ended)
// ══════════════════════════════════════════════

const getStreams = async (req, res, next) => {
  try {
    const status = req.query.status || '';

    let where = '';
    const params = [];

    if (status) { where = 'WHERE s.status = $1'; params.push(status); }

    const result = await query(
      `SELECT s.id, s.title, s.description, s.status, s.viewer_count, s.started_at, s.ended_at,
              u.id AS host_id, u.full_name AS host_name
       FROM live_streams s
       JOIN users u ON u.id = s.host_id
       ${where}
       ORDER BY s.started_at DESC`,
      params
    );

    const streams = result.rows.map(s => ({
      id: s.id, title: s.title, description: s.description, status: s.status,
      viewerCount: s.viewer_count, startedAt: s.started_at, endedAt: s.ended_at,
      host: { id: s.host_id, fullName: s.host_name },
    }));

    res.json({ success: true, streams });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStats, getUsers, toggleBan, changeRole, toggleVerified, deleteUser,
  getReports, resolveReport, getPosts, deletePost,
  broadcastNotification, getAllChats, adminDeleteChat,
  forceEndStream, getStreams,
};
