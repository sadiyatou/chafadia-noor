const { query } = require('../config/db');

const registerPushToken = async (req, res, next) => {
  try {
    const { pushToken } = req.body;
    if (!pushToken) return res.status(400).json({ success: false, message: 'pushToken is required.' });
    await query('UPDATE users SET push_token = $1 WHERE id = $2', [pushToken, req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, uid, full_name, email, phone, photo_url, bio, role, verified, is_online, last_seen, created_at,
        (SELECT COUNT(*) FROM follows WHERE following_id = users.id) AS followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = users.id) AS following_count
       FROM users WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = result.rows[0];

    const followCheck = await query(
      'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [req.user.id, req.params.id]
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        uid: user.uid,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        photoURL: user.photo_url,
        bio: user.bio,
        role: user.role,
        verified: user.verified,
        isOnline: user.is_online,
        lastSeen: user.last_seen,
        followersCount: parseInt(user.followers_count),
        followingCount: parseInt(user.following_count),
        isFollowing: followCheck.rows.length > 0,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin' && req.user.role !== 'main_admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { fullName, phone, bio, photoURL } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (fullName !== undefined) { fields.push(`full_name = $${idx++}`); values.push(fullName.trim()); }
    if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone); }
    if (bio !== undefined) { fields.push(`bio = $${idx++}`); values.push(bio); }
    if (photoURL !== undefined) { fields.push(`photo_url = $${idx++}`); values.push(photoURL); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(req.params.id);

    await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`,
      values
    );

    const updated = await query(
      `SELECT id, uid, full_name, email, phone, photo_url, bio, role, verified, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );

    const u = updated.rows[0];

    res.json({
      success: true,
      message: 'Profile updated.',
      user: {
        id: u.id,
        uid: u.uid,
        fullName: u.full_name,
        email: u.email,
        phone: u.phone,
        photoURL: u.photo_url,
        bio: u.bio,
        role: u.role,
        verified: u.verified,
        createdAt: u.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters.' });
    }

    const result = await query(
      `SELECT u.id, u.uid, u.full_name, u.photo_url, u.bio, u.verified,
        EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = u.id) AS is_following
       FROM users u
       WHERE u.full_name ILIKE $1 AND u.is_banned = false
       ORDER BY u.full_name
       LIMIT 50`,
      [`%${q.trim()}%`, req.user.id]
    );

    const users = result.rows.map(u => ({
      id: u.id,
      uid: u.uid,
      fullName: u.full_name,
      photoURL: u.photo_url,
      bio: u.bio,
      verified: u.verified,
      isFollowing: u.is_following,
    }));

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const result = q
      ? await query(
          `SELECT id, full_name, email, phone, photo_url, role, is_online
           FROM users
           WHERE (LOWER(full_name) LIKE $1 OR LOWER(email) LIKE $1) AND id != $2 AND is_banned = false
           ORDER BY full_name LIMIT $3`,
          [`%${q}%`, req.user.id, limit]
        )
      : await query(
          `SELECT id, full_name, email, phone, photo_url, role, is_online
           FROM users WHERE id != $1 AND is_banned = false
           ORDER BY full_name LIMIT $2`,
          [req.user.id, limit]
        );

    res.json({
      success: true,
      users: result.rows.map(u => ({
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        phone: u.phone,
        photoURL: u.photo_url,
        role: u.role,
        isOnline: u.is_online,
      })),
    });
  } catch (err) { next(err); }
};

const followUser = async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id);

    if (req.user.id === targetId) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself.' });
    }

    const targetExists = await query('SELECT id FROM users WHERE id = $1', [targetId]);
    if (targetExists.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, targetId]
    );

    const counts = await query(
      'SELECT (SELECT COUNT(*) FROM follows WHERE following_id = $1) AS followers_count',
      [targetId]
    );

    res.json({ success: true, message: 'Followed.', followersCount: parseInt(counts.rows[0].followers_count) });
  } catch (err) {
    next(err);
  }
};

const unfollowUser = async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id);

    await query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
      [req.user.id, targetId]
    );

    const counts = await query(
      'SELECT (SELECT COUNT(*) FROM follows WHERE following_id = $1) AS followers_count',
      [targetId]
    );

    res.json({ success: true, message: 'Unfollowed.', followersCount: parseInt(counts.rows[0].followers_count) });
  } catch (err) {
    next(err);
  }
};

const getFollowers = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.uid, u.full_name, u.photo_url, u.bio, u.verified,
        EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = u.id) AS is_following
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC`,
      [req.params.id, req.user.id]
    );

    const users = result.rows.map(u => ({
      id: u.id,
      uid: u.uid,
      fullName: u.full_name,
      photoURL: u.photo_url,
      bio: u.bio,
      verified: u.verified,
      isFollowing: u.is_following,
    }));

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

const getFollowing = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.uid, u.full_name, u.photo_url, u.bio, u.verified,
        EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = u.id) AS is_following
       FROM follows f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC`,
      [req.params.id, req.user.id]
    );

    const users = result.rows.map(u => ({
      id: u.id,
      uid: u.uid,
      fullName: u.full_name,
      photoURL: u.photo_url,
      bio: u.bio,
      verified: u.verified,
      isFollowing: u.is_following,
    }));

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, getUserById, updateUser, searchUsers, followUser, unfollowUser, getFollowers, getFollowing, registerPushToken };
