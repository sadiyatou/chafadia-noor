const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tokens are valid for 30 days, so the role/ban-status baked into the
    // token at login can go stale — re-check current state on every request
    // so a ban or role change takes effect immediately instead of only once
    // the token expires.
    const result = await query('SELECT role, is_banned FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Account no longer exists.' });
    }
    if (result.rows[0].is_banned) {
      return res.status(403).json({ success: false, message: 'This account has been suspended.' });
    }

    req.user = { ...decoded, role: result.rows[0].role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'main_admin')) {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
