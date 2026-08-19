const { query } = require('../config/db');

/* GET /api/community-groups */
const getGroups = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = 'WHERE g.is_active = true AND g.is_public = true';
    if (search) { params.push(`%${search}%`); where += ` AND g.name ILIKE $${params.length}`; }

    const sql = `
      SELECT g.*,
        u.full_name AS creator_name,
        (SELECT COUNT(*) FROM community_group_members WHERE group_id=g.id) AS member_count,
        (SELECT COUNT(*) > 0 FROM community_group_members WHERE group_id=g.id AND user_id=$${params.length+1}) AS is_member
      FROM community_groups g LEFT JOIN users u ON u.id=g.created_by
      ${where} ORDER BY g.created_at DESC
      LIMIT $${params.length+2} OFFSET $${params.length+3}`;
    params.push(req.user.id, limit, offset);

    const result = await query(sql, params);
    res.json({ success: true, groups: result.rows });
  } catch (err) { next(err); }
};

/* GET /api/community-groups/mine — groups the user belongs to */
const getMyGroups = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT g.*, m.role AS my_role,
         (SELECT COUNT(*) FROM community_group_members WHERE group_id=g.id) AS member_count
       FROM community_groups g
       JOIN community_group_members m ON m.group_id=g.id AND m.user_id=$1
       WHERE g.is_active=true ORDER BY g.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, groups: result.rows });
  } catch (err) { next(err); }
};

/* POST /api/community-groups */
const createGroup = async (req, res, next) => {
  try {
    const { name, description, cover_image, is_public } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Group name is required.' });

    // Create a group chat in the chats table
    const chatResult = await query(
      `INSERT INTO chats (type, name, created_by) VALUES ('group', $1, $2) RETURNING id`,
      [name, req.user.id]
    );
    const chatId = chatResult.rows[0].id;

    // Add creator as chat member
    await query('INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1,$2,$3)', [chatId, req.user.id, 'admin']);

    // Create community group record
    const result = await query(
      `INSERT INTO community_groups (name, description, cover_image, created_by, is_public, chat_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, description||null, cover_image||null, req.user.id, is_public !== false, chatId]
    );

    const group = result.rows[0];

    // Add creator as group member
    await query(
      'INSERT INTO community_group_members (group_id, user_id, role) VALUES ($1,$2,$3)',
      [group.id, req.user.id, 'admin']
    );

    res.status(201).json({ success: true, group });
  } catch (err) { next(err); }
};

/* POST /api/community-groups/:id/join */
const joinGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const group = await query('SELECT * FROM community_groups WHERE id=$1 AND is_active=true', [id]);
    if (!group.rows.length) return res.status(404).json({ success: false, message: 'Group not found.' });

    const existing = await query('SELECT id FROM community_group_members WHERE group_id=$1 AND user_id=$2', [id, req.user.id]);
    if (existing.rows.length) return res.json({ success: true, message: 'Already a member.' });

    await Promise.all([
      query('INSERT INTO community_group_members (group_id, user_id) VALUES ($1,$2)', [id, req.user.id]),
      query('INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [group.rows[0].chat_id, req.user.id, 'member']),
    ]);

    res.json({ success: true, message: 'Joined group.' });
  } catch (err) { next(err); }
};

/* DELETE /api/community-groups/:id/leave */
const leaveGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const group = await query('SELECT chat_id FROM community_groups WHERE id=$1', [id]);
    if (group.rows.length) {
      await Promise.all([
        query('DELETE FROM community_group_members WHERE group_id=$1 AND user_id=$2', [id, req.user.id]),
        query('DELETE FROM chat_members WHERE chat_id=$1 AND user_id=$2', [group.rows[0].chat_id, req.user.id]),
      ]);
    }
    res.json({ success: true });
  } catch (err) { next(err); }
};

/* GET /api/community-groups/:id/messages */
const getGroupMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { before, limit = 50 } = req.query;

    const group = await query('SELECT chat_id FROM community_groups WHERE id=$1', [id]);
    if (!group.rows.length) return res.status(404).json({ success: false, message: 'Group not found.' });

    const member = await query('SELECT id FROM community_group_members WHERE group_id=$1 AND user_id=$2', [id, req.user.id]);
    if (!member.rows.length) return res.status(403).json({ success: false, message: 'Not a member.' });

    const chatId = group.rows[0].chat_id;

    let sql = `SELECT m.*, u.full_name AS sender_name, u.photo_url AS sender_photo
               FROM messages m JOIN users u ON u.id=m.sender_id
               WHERE m.chat_id=$1`;
    const params = [chatId];
    if (before) { params.push(before); sql += ` AND m.id < $${params.length}`; }
    sql += ` ORDER BY m.created_at DESC LIMIT $${params.length+1}`;
    params.push(limit);

    const result = await query(sql, params);
    res.json({ success: true, messages: result.rows.reverse() });
  } catch (err) { next(err); }
};

/* POST /api/community-groups/:id/messages */
const sendGroupMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, type = 'text', media_url, file_name } = req.body;

    const group = await query('SELECT chat_id FROM community_groups WHERE id=$1', [id]);
    if (!group.rows.length) return res.status(404).json({ success: false, message: 'Group not found.' });

    const member = await query('SELECT id FROM community_group_members WHERE group_id=$1 AND user_id=$2', [id, req.user.id]);
    if (!member.rows.length) return res.status(403).json({ success: false, message: 'Not a member.' });

    const chatId = group.rows[0].chat_id;
    const result = await query(
      `INSERT INTO messages (chat_id, sender_id, text, type, media_url, file_name)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *, (SELECT full_name FROM users WHERE id=$2) AS sender_name,
                    (SELECT photo_url FROM users WHERE id=$2) AS sender_photo`,
      [chatId, req.user.id, content||null, type, media_url||null, file_name||null]
    );

    const message = result.rows[0];

    // Broadcast to socket room
    const io = req.app.get('io');
    // Same event name/shape as private/group chat messages (see chatController.js
    // sendMessage) so a future group-chat screen can reuse the existing listeners.
    if (io) io.to(`chat:${chatId}`).emit('chat:message', { ...message, chatId, isOwn: false });

    res.status(201).json({ success: true, message });
  } catch (err) { next(err); }
};

/* Admin: GET /api/community-groups/admin/all */
const adminGetGroups = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT g.*, u.full_name AS creator_name,
         (SELECT COUNT(*) FROM community_group_members WHERE group_id=g.id) AS member_count
       FROM community_groups g LEFT JOIN users u ON u.id=g.created_by
       ORDER BY g.created_at DESC`
    );
    res.json({ success: true, groups: result.rows });
  } catch (err) { next(err); }
};

/* Admin: PUT /api/community-groups/:id  (edit or deactivate) */
const adminUpdateGroup = async (req, res, next) => {
  try {
    const { name, description, is_active, is_public } = req.body;
    const result = await query(
      `UPDATE community_groups SET
         name=COALESCE($1,name), description=COALESCE($2,description),
         is_active=COALESCE($3,is_active), is_public=COALESCE($4,is_public), updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [name, description, is_active, is_public, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Group not found.' });
    res.json({ success: true, group: result.rows[0] });
  } catch (err) { next(err); }
};

module.exports = {
  getGroups, getMyGroups, createGroup, joinGroup, leaveGroup,
  getGroupMessages, sendGroupMessage,
  adminGetGroups, adminUpdateGroup,
};
