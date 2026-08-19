const { query } = require('../config/db');

const VALID_TYPES = ['General', 'Jobs', 'Announcement', 'Question', 'Event', 'Charity', 'Reminder'];

const formatPost = (r, currentUserId) => ({
  id: r.id,
  type: r.type || 'General',
  title: r.title || '',
  text: r.text,
  mediaUrl: r.media_url,
  mediaType: r.media_type,
  likes: r.likes,
  commentsCount: r.comments_count,
  views: r.views,
  isLiked: r.is_liked || false,
  createdAt: r.created_at,
  isOwn: r.user_id === currentUserId,
  author: {
    id: r.user_id,
    fullName: r.full_name,
    photoURL: r.photo_url,
    role: r.role,
    verified: r.verified,
  },
});

/* POST /api/posts */
const createPost = async (req, res, next) => {
  try {
    const { text, mediaUrl, mediaType, type = 'General', title = '' } = req.body;

    if (!text && !mediaUrl) {
      return res.status(400).json({ success: false, message: 'Post must have text or media.' });
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid post type.' });
    }

    const result = await query(
      `INSERT INTO posts (user_id, text, media_url, media_type, type, title)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, user_id, text, media_url, media_type, type, title, likes, comments_count, views, created_at`,
      [req.user.id, text || '', mediaUrl || '', mediaType || '', type, title]
    );

    const author = await query(
      'SELECT id, full_name, photo_url, role, verified FROM users WHERE id=$1',
      [req.user.id]
    );

    const p = result.rows[0];
    const a = author.rows[0];

    const post = {
      id: p.id, type: p.type, title: p.title, text: p.text,
      mediaUrl: p.media_url, mediaType: p.media_type,
      likes: p.likes, commentsCount: p.comments_count, views: p.views,
      isLiked: false, isOwn: true, createdAt: p.created_at,
      author: { id: a.id, fullName: a.full_name, photoURL: a.photo_url, role: a.role, verified: a.verified },
    };

    // Broadcast new post to all connected users in real time
    const io = req.app.get('io');
    if (io) io.emit('post:new', post);

    // If admin posts a Job or Announcement, notify all users
    const isAdmin = ['admin', 'main_admin'].includes(req.user.role);
    if (isAdmin && ['Jobs', 'Announcement'].includes(type)) {
      const allUsers = await query('SELECT id FROM users WHERE id != $1 AND is_banned = false', [req.user.id]);
      const notifTitle = type === 'Jobs' ? `New Job: ${title || 'Opportunity'}` : `Announcement: ${title || 'From Admin'}`;
      const notifBody = (p.text || '').slice(0, 120) + ((p.text || '').length > 120 ? '...' : '');
      for (const u of allUsers.rows) {
        await query(
          `INSERT INTO notifications (user_id, sender_id, type, title, body, data)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [u.id, req.user.id, type.toLowerCase(), notifTitle, notifBody, JSON.stringify({ postId: p.id })]
        );
        if (io) {
          io.to(`user:${u.id}`).emit('notification:new', {
            type: type.toLowerCase(), title: notifTitle, body: notifBody,
            read: false, createdAt: new Date().toISOString(),
            data: { postId: p.id },
          });
        }
      }
    }

    res.status(201).json({ success: true, post });
  } catch (err) { next(err); }
};

/* GET /api/posts */
const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;
    const { type } = req.query;

    let whereClauses = [];
    const params = [limit, offset, req.user.id];

    if (type && type !== 'All' && VALID_TYPES.includes(type)) {
      params.push(type);
      whereClauses.push(`p.type = $${params.length}`);
    }

    const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    // Count query only needs the type filter, not the limit/offset/user params
    // that come after it in `params` — reuse the same $-index the main query uses.
    const countParams = whereClauses.length ? [params[params.length - 1]] : [];
    const countWhere = whereClauses.length ? 'WHERE p.type = $1' : '';

    const [countResult, result] = await Promise.all([
      query(`SELECT COUNT(*) FROM posts p ${countWhere}`, countParams),
      query(
        `SELECT p.id, p.user_id, p.text, p.media_url, p.media_type, p.type, p.title,
                p.likes, p.comments_count, p.views, p.created_at,
                u.full_name, u.photo_url, u.role, u.verified,
                EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id=p.id AND pl.user_id=$3) AS is_liked
         FROM posts p JOIN users u ON p.user_id=u.id
         ${where} ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`,
        params
      ),
    ]);

    const total = parseInt(countResult.rows[0].count);
    res.json({
      success: true,
      posts: result.rows.map(r => formatPost(r, req.user.id)),
      page, limit, total,
      hasMore: offset + limit < total,
    });
  } catch (err) { next(err); }
};

/* GET /api/posts/:id */
const getPostById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT p.id, p.user_id, p.text, p.media_url, p.media_type, p.type, p.title,
              p.likes, p.comments_count, p.views, p.created_at,
              u.full_name, u.photo_url, u.role, u.verified,
              EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id=p.id AND pl.user_id=$2) AS is_liked
       FROM posts p JOIN users u ON p.user_id=u.id WHERE p.id=$1`,
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Post not found.' });
    // Increment views
    await query('UPDATE posts SET views = views + 1 WHERE id=$1', [req.params.id]);
    res.json({ success: true, post: formatPost(result.rows[0], req.user.id) });
  } catch (err) { next(err); }
};

/* DELETE /api/posts/:id */
const deletePost = async (req, res, next) => {
  try {
    const post = await query('SELECT user_id FROM posts WHERE id=$1', [req.params.id]);
    if (!post.rows.length) return res.status(404).json({ success: false, message: 'Post not found.' });
    const isOwner = post.rows[0].user_id === req.user.id;
    const isAdmin = ['admin','main_admin'].includes(req.user.role);
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized.' });
    await query('DELETE FROM posts WHERE id=$1', [req.params.id]);
    const io = req.app.get('io');
    if (io) io.emit('post:deleted', { postId: req.params.id });
    res.json({ success: true });
  } catch (err) { next(err); }
};

/* POST /api/posts/:id/like */
const likePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    // INSERT ... ON CONFLICT DO NOTHING is race-safe under concurrent requests
    // (e.g. a double-tap) — a plain SELECT-then-INSERT could hit the
    // UNIQUE(post_id,user_id) constraint and 500 instead of toggling cleanly.
    const inserted = await query(
      'INSERT INTO post_likes (post_id,user_id) VALUES ($1,$2) ON CONFLICT (post_id,user_id) DO NOTHING RETURNING id',
      [postId, req.user.id]
    );
    let liked = inserted.rows.length > 0;
    if (liked) {
      await query('UPDATE posts SET likes=likes+1 WHERE id=$1', [postId]);
    } else {
      const deleted = await query('DELETE FROM post_likes WHERE post_id=$1 AND user_id=$2 RETURNING id', [postId, req.user.id]);
      if (deleted.rows.length > 0) {
        await query('UPDATE posts SET likes=GREATEST(likes-1,0) WHERE id=$1', [postId]);
      }
    }
    const updated = await query('SELECT likes FROM posts WHERE id=$1', [postId]);
    const io = req.app.get('io');
    if (io) io.emit('post:liked', { postId, liked, likes: updated.rows[0].likes, byUserId: req.user.id });
    res.json({ success: true, liked, likes: updated.rows[0].likes });
  } catch (err) { next(err); }
};

/* POST /api/posts/:id/comments */
const commentOnPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Comment text is required.' });
    const postExists = await query('SELECT id, user_id FROM posts WHERE id=$1', [req.params.id]);
    if (!postExists.rows.length) return res.status(404).json({ success: false, message: 'Post not found.' });

    const result = await query(
      `INSERT INTO post_comments (post_id,user_id,text) VALUES ($1,$2,$3)
       RETURNING id, text, created_at`,
      [req.params.id, req.user.id, text]
    );
    await query('UPDATE posts SET comments_count=comments_count+1 WHERE id=$1', [req.params.id]);

    const author = await query('SELECT id, full_name, photo_url FROM users WHERE id=$1', [req.user.id]);
    const c = result.rows[0];
    const a = author.rows[0];

    const comment = {
      id: c.id, text: c.text, createdAt: c.created_at, isOwn: true,
      author: { id: a.id, fullName: a.full_name, photoURL: a.photo_url },
    };

    // Create notification for post author (if not self-comment)
    if (postExists.rows[0].user_id !== req.user.id) {
      await query(
        `INSERT INTO notifications (user_id, sender_id, type, title, body, data)
         VALUES ($1,$2,'comment','New Comment',$3,$4)`,
        [postExists.rows[0].user_id, req.user.id,
         `${a.full_name} commented on your post`,
         JSON.stringify({ postId: req.params.id })]
      );
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${postExists.rows[0].user_id}`).emit('notification:new', {
          type: 'comment', title: 'New Comment',
          body: `${a.full_name} commented on your post`,
        });
      }
    }

    const io = req.app.get('io');
    if (io) io.emit('post:comment', { postId: req.params.id, comment });

    res.status(201).json({ success: true, comment });
  } catch (err) { next(err); }
};

/* GET /api/posts/:id/comments */
const getPostComments = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT c.id, c.text, c.created_at, c.user_id,
              u.id AS author_id, u.full_name, u.photo_url
       FROM post_comments c JOIN users u ON c.user_id=u.id
       WHERE c.post_id=$1 ORDER BY c.created_at ASC`,
      [req.params.id]
    );
    res.json({
      success: true,
      comments: result.rows.map(r => ({
        id: r.id, text: r.text, createdAt: r.created_at,
        isOwn: r.user_id === req.user.id,
        author: { id: r.author_id, fullName: r.full_name, photoURL: r.photo_url },
      })),
    });
  } catch (err) { next(err); }
};

/* DELETE /api/posts/:id/comments/:commentId */
const deleteComment = async (req, res, next) => {
  try {
    const { id: postId, commentId } = req.params;
    const comment = await query('SELECT user_id FROM post_comments WHERE id=$1 AND post_id=$2', [commentId, postId]);
    if (!comment.rows.length) return res.status(404).json({ success: false, message: 'Comment not found.' });
    const isOwner = comment.rows[0].user_id === req.user.id;
    const isAdmin = ['admin','main_admin'].includes(req.user.role);
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized.' });
    await query('DELETE FROM post_comments WHERE id=$1', [commentId]);
    await query('UPDATE posts SET comments_count=GREATEST(comments_count-1,0) WHERE id=$1', [postId]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

module.exports = { createPost, getPosts, getPostById, deletePost, likePost, commentOnPost, getPostComments, deleteComment };
