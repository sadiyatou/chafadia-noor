const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/db');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, uid: user.uid, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

const formatUser = (u) => ({
  id: u.id,
  uid: u.uid,
  fullName: u.full_name,
  email: u.email,
  phone: u.phone,
  photoURL: u.photo_url,
  bio: u.bio,
  role: u.role,
  verified: u.verified,
  isOnline: u.is_online,
  createdAt: u.created_at,
});

/* ── POST /api/auth/register ─────────────────────────────── */
const register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const normEmail = email.toLowerCase().trim();
    const normPhone = phone ? phone.trim() : null;

    // Check duplicate email
    const emailCheck = await query('SELECT id FROM users WHERE email = $1', [normEmail]);
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Check duplicate phone (only if provided)
    if (normPhone) {
      const phoneCheck = await query('SELECT id FROM users WHERE phone = $1', [normPhone]);
      if (phoneCheck.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'Phone number already registered.' });
      }
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await query(
      `INSERT INTO users (full_name, email, phone, password_hash, verified, is_online)
       VALUES ($1, $2, $3, $4, true, true)
       RETURNING id, uid, full_name, email, phone, photo_url, bio, role, verified, is_online, created_at`,
      [fullName.trim(), normEmail, normPhone, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/auth/login ────────────────────────────────── */
const login = async (req, res, next) => {
  try {
    const { contact, password } = req.body;
    if (!contact || !password) {
      return res.status(400).json({ success: false, message: 'Contact and password are required.' });
    }

    const normalised = contact.trim();
    const result = await query(
      `SELECT id, uid, full_name, email, phone, password_hash, photo_url, bio,
              role, verified, is_banned, is_online, created_at
       FROM users WHERE LOWER(email) = LOWER($1) OR phone = $1`,
      [normalised]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    if (user.is_banned) {
      return res.status(403).json({ success: false, message: 'This account has been suspended.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    await query(
      'UPDATE users SET is_online = true, last_seen = NOW(), updated_at = NOW() WHERE id = $1',
      [user.id]
    );

    const token = generateToken(user);
    res.json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/auth/logout ───────────────────────────────── */
const logout = async (req, res, next) => {
  try {
    await query(
      'UPDATE users SET is_online = false, last_seen = NOW(), updated_at = NOW() WHERE id = $1',
      [req.user.id]
    );
    res.json({ success: true, message: 'Logged out.' });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/auth/me ────────────────────────────────────── */
const getMe = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, uid, full_name, email, phone, photo_url, bio, role, verified, is_online, created_at,
         (SELECT COUNT(*) FROM follows WHERE following_id = users.id) AS followers_count,
         (SELECT COUNT(*) FROM follows WHERE follower_id  = users.id) AS following_count
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const u = result.rows[0];
    res.json({
      success: true,
      user: {
        ...formatUser(u),
        followersCount: parseInt(u.followers_count),
        followingCount: parseInt(u.following_count),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/auth/forgot-password ─────────────────────── */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    const result = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [result.rows[0].id, token, expiresAt]
    );
    console.log(`[Password Reset] Token for ${email}: ${token}`);
    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/auth/reset-password ──────────────────────── */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }
    const result = await query(
      'SELECT id, user_id FROM password_resets WHERE token = $1 AND used = false AND expires_at > NOW()',
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, result.rows[0].user_id]);
    await query('UPDATE password_resets SET used = true WHERE id = $1', [result.rows[0].id]);
    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword };
