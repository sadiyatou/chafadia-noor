const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query } = require('../config/db');

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { reportedUserId, reportedPostId, reason } = req.body;

    if (!reason) return res.status(400).json({ success: false, message: 'Reason is required.' });
    if (!reportedUserId && !reportedPostId) return res.status(400).json({ success: false, message: 'Must report a user or a post.' });

    const result = await query(
      `INSERT INTO reports (reporter_id, reported_user_id, reported_post_id, reason)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [req.user.id, reportedUserId || null, reportedPostId || null, reason]
    );

    res.status(201).json({ success: true, reportId: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

router.get('/mine', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, reason, status, created_at, resolved_at
       FROM reports WHERE reporter_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, reports: result.rows.map(r => ({
      id: r.id, reason: r.reason, status: r.status,
      createdAt: r.created_at, resolvedAt: r.resolved_at,
    })) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
