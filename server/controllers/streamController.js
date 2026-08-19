const { query } = require('../config/db');

const startStream = async (req, res, next) => {
  try {
    const { title, description = '', thumbnailUrl = '' } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });

    const result = await query(
      `INSERT INTO live_streams (host_id, title, description, thumbnail_url, status)
       VALUES ($1, $2, $3, $4, 'live')
       RETURNING id, title, description, thumbnail_url, status, viewer_count, started_at`,
      [req.user.id, title, description, thumbnailUrl]
    );

    const s = result.rows[0];
    const host = await query('SELECT id, full_name, photo_url FROM users WHERE id = $1', [req.user.id]);

    const streamData = {
      id: s.id,
      title: s.title,
      description: s.description,
      thumbnailUrl: s.thumbnail_url,
      status: s.status,
      viewerCount: s.viewer_count,
      startedAt: s.started_at,
      host: { id: host.rows[0].id, fullName: host.rows[0].full_name, photoURL: host.rows[0].photo_url },
    };

    const io = req.app.get('io');
    if (io) {
      io.emit('stream:started', streamData);
    }

    res.status(201).json({ success: true, stream: streamData });
  } catch (err) {
    next(err);
  }
};

const endStream = async (req, res, next) => {
  try {
    const streamId = req.params.id;

    const stream = await query('SELECT host_id, status FROM live_streams WHERE id = $1', [streamId]);
    if (stream.rows.length === 0) return res.status(404).json({ success: false, message: 'Stream not found.' });
    if (stream.rows[0].host_id !== req.user.id) return res.status(403).json({ success: false, message: 'Only the host can end the stream.' });
    if (stream.rows[0].status !== 'live') return res.status(400).json({ success: false, message: 'Stream is not live.' });

    await query("UPDATE live_streams SET status = 'ended', ended_at = NOW() WHERE id = $1", [streamId]);

    const io = req.app.get('io');
    if (io) {
      io.emit('stream:ended', { streamId: parseInt(streamId) });
    }

    res.json({ success: true, message: 'Stream ended.' });
  } catch (err) {
    next(err);
  }
};

const getLiveStreams = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT s.id, s.title, s.description, s.thumbnail_url, s.status, s.viewer_count, s.started_at,
              u.id AS host_id, u.full_name, u.photo_url
       FROM live_streams s
       JOIN users u ON u.id = s.host_id
       WHERE s.status = 'live'
       ORDER BY s.started_at DESC`
    );

    const streams = result.rows.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      thumbnailUrl: s.thumbnail_url,
      status: s.status,
      viewerCount: s.viewer_count,
      startedAt: s.started_at,
      host: { id: s.host_id, fullName: s.full_name, photoURL: s.photo_url },
    }));

    res.json({ success: true, streams });
  } catch (err) {
    next(err);
  }
};

const getStreamById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT s.id, s.title, s.description, s.thumbnail_url, s.status, s.viewer_count, s.started_at, s.ended_at,
              u.id AS host_id, u.full_name, u.photo_url
       FROM live_streams s
       JOIN users u ON u.id = s.host_id
       WHERE s.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Stream not found.' });

    const s = result.rows[0];
    res.json({
      success: true,
      stream: {
        id: s.id, title: s.title, description: s.description,
        thumbnailUrl: s.thumbnail_url, status: s.status, viewerCount: s.viewer_count,
        startedAt: s.started_at, endedAt: s.ended_at,
        host: { id: s.host_id, fullName: s.full_name, photoURL: s.photo_url },
      },
    });
  } catch (err) {
    next(err);
  }
};

const joinStream = async (req, res, next) => {
  try {
    const streamId = req.params.id;
    await query('UPDATE live_streams SET viewer_count = viewer_count + 1 WHERE id = $1', [streamId]);

    const io = req.app.get('io');
    if (io) {
      io.to(`stream:${streamId}`).emit('stream:viewerJoined', { streamId: parseInt(streamId), userId: req.user.id });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const leaveStream = async (req, res, next) => {
  try {
    const streamId = req.params.id;
    await query('UPDATE live_streams SET viewer_count = GREATEST(viewer_count - 1, 0) WHERE id = $1', [streamId]);

    const io = req.app.get('io');
    if (io) {
      io.to(`stream:${streamId}`).emit('stream:viewerLeft', { streamId: parseInt(streamId), userId: req.user.id });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const postComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Comment text is required.' });

    const stream = await query("SELECT id FROM live_streams WHERE id = $1 AND status = 'live'", [req.params.id]);
    if (stream.rows.length === 0) return res.status(404).json({ success: false, message: 'Live stream not found or not active.' });

    const result = await query(
      `INSERT INTO live_stream_comments (stream_id, user_id, text)
       VALUES ($1, $2, $3)
       RETURNING id, text, created_at`,
      [req.params.id, req.user.id, text]
    );

    const author = await query('SELECT id, full_name, photo_url FROM users WHERE id = $1', [req.user.id]);
    const c = result.rows[0];
    const a = author.rows[0];

    const commentData = {
      id: c.id,
      streamId: parseInt(req.params.id),
      text: c.text,
      createdAt: c.created_at,
      author: { id: a.id, fullName: a.full_name, photoURL: a.photo_url },
    };

    const io = req.app.get('io');
    if (io) {
      io.to(`stream:${req.params.id}`).emit('stream:comment', commentData);
    }

    res.status(201).json({ success: true, comment: commentData });
  } catch (err) {
    next(err);
  }
};

const getComments = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT c.id, c.text, c.created_at,
              u.id AS user_id, u.full_name, u.photo_url
       FROM live_stream_comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.stream_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.id]
    );

    const comments = result.rows.map(c => ({
      id: c.id,
      text: c.text,
      createdAt: c.created_at,
      author: { id: c.user_id, fullName: c.full_name, photoURL: c.photo_url },
    }));

    res.json({ success: true, comments });
  } catch (err) {
    next(err);
  }
};

module.exports = { startStream, endStream, getLiveStreams, getStreamById, joinStream, leaveStream, postComment, getComments };
