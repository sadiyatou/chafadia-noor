const { query, getClient } = require('../config/db');
const { sendPushToUser } = require('../utils/push');

// ── Helper: check user is member of chat ──
const isMember = async (chatId, userId) => {
  const r = await query('SELECT id FROM chat_members WHERE chat_id = $1 AND user_id = $2', [chatId, userId]);
  return r.rows.length > 0;
};

const isAdminOf = async (chatId, userId) => {
  const r = await query("SELECT id FROM chat_members WHERE chat_id = $1 AND user_id = $2 AND role IN ('admin', 'creator')", [chatId, userId]);
  return r.rows.length > 0;
};

const messagePreview = (type, text) => {
  if (type === 'text') return text.length > 80 ? text.slice(0, 80) + '...' : text;
  const map = { image: 'Image', video: 'Video', audio: 'Voice note', file: 'File', system: text };
  return map[type] || 'Message';
};

// ══════════════════════════════════════════════
//  CREATE OR GET PRIVATE CHAT
// ══════════════════════════════════════════════

const createPrivateChat = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    const userId = req.user.id;

    if (!receiverId) return res.status(400).json({ success: false, message: 'receiverId is required.' });
    if (userId === parseInt(receiverId)) return res.status(400).json({ success: false, message: 'Cannot chat with yourself.' });

    const receiverExists = await query('SELECT id FROM users WHERE id = $1', [receiverId]);
    if (receiverExists.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    // Check if private chat already exists between these two users
    const existing = await query(
      `SELECT c.id FROM chats c
       JOIN chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = $1
       JOIN chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = $2
       WHERE c.type = 'private'`,
      [userId, receiverId]
    );

    if (existing.rows.length > 0) {
      return res.json({ success: true, chatId: existing.rows[0].id, exists: true });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const chat = await client.query(
        `INSERT INTO chats (type, created_by) VALUES ('private', $1) RETURNING id`,
        [userId]
      );
      const chatId = chat.rows[0].id;

      await client.query(
        'INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, $3), ($1, $4, $3)',
        [chatId, userId, 'member', receiverId]
      );

      await client.query('COMMIT');
      res.status(201).json({ success: true, chatId, exists: false });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  CREATE GROUP CHAT
// ══════════════════════════════════════════════

const createGroupChat = async (req, res, next) => {
  try {
    const { name, members = [], photoURL } = req.body;
    const userId = req.user.id;

    if (!name) return res.status(400).json({ success: false, message: 'Group name is required.' });

    const allMembers = [...new Set([userId, ...members.map(Number)])];

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const chat = await client.query(
        `INSERT INTO chats (type, name, photo_url, created_by, last_message, last_message_type)
         VALUES ('group', $1, $2, $3, 'Group created', 'system') RETURNING id`,
        [name, photoURL || '', userId]
      );
      const chatId = chat.rows[0].id;

      for (const memberId of allMembers) {
        const role = memberId === userId ? 'creator' : 'member';
        await client.query(
          'INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [chatId, memberId, role]
        );
      }

      // System message
      await client.query(
        `INSERT INTO messages (chat_id, sender_id, type, text) VALUES ($1, $2, 'system', $3)`,
        [chatId, userId, `${name} group was created`]
      );

      await client.query('COMMIT');
      res.status(201).json({ success: true, chatId });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  GET USER'S CHATS
// ══════════════════════════════════════════════

const getUserChats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT c.id, c.type, c.name, c.photo_url, c.last_message, c.last_message_type,
              c.last_message_time, c.created_at,
              cm.unread, cm.muted, cm.archived, cm.pinned, cm.blocked
       FROM chats c
       JOIN chat_members cm ON cm.chat_id = c.id AND cm.user_id = $1
       ORDER BY cm.pinned DESC, c.last_message_time DESC`,
      [userId]
    );

    const chats = [];

    for (const r of result.rows) {
      let chatName = r.name;
      let chatPhoto = r.photo_url;

      let otherUserId = null;
      // For private chats, get the other user's name and photo
      if (r.type === 'private') {
        const other = await query(
          `SELECT u.id, u.full_name, u.photo_url, u.is_online
           FROM chat_members cm
           JOIN users u ON u.id = cm.user_id
           WHERE cm.chat_id = $1 AND cm.user_id != $2`,
          [r.id, userId]
        );
        if (other.rows.length > 0) {
          chatName = other.rows[0].full_name;
          chatPhoto = other.rows[0].photo_url;
          otherUserId = other.rows[0].id;
        }
      }

      // Get member count for groups
      const memberCount = r.type === 'group'
        ? (await query('SELECT COUNT(*) FROM chat_members WHERE chat_id = $1', [r.id])).rows[0].count
        : 2;

      chats.push({
        id: r.id,
        type: r.type,
        name: chatName,
        photoURL: chatPhoto,
        otherUserId,
        lastMessage: r.last_message,
        lastMessageType: r.last_message_type,
        lastMessageTime: r.last_message_time,
        unread: r.unread,
        muted: r.muted,
        archived: r.archived,
        pinned: r.pinned,
        blocked: r.blocked,
        memberCount: parseInt(memberCount),
        createdAt: r.created_at,
      });
    }

    res.json({ success: true, chats });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  GET CHAT BY ID
// ══════════════════════════════════════════════

const getChatById = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    if (!(await isMember(chatId, req.user.id))) {
      return res.status(403).json({ success: false, message: 'Not a member of this chat.' });
    }

    const chat = await query('SELECT * FROM chats WHERE id = $1', [chatId]);
    if (chat.rows.length === 0) return res.status(404).json({ success: false, message: 'Chat not found.' });

    const members = await query(
      `SELECT u.id, u.full_name, u.photo_url, u.is_online, cm.role
       FROM chat_members cm
       JOIN users u ON u.id = cm.user_id
       WHERE cm.chat_id = $1`,
      [chatId]
    );

    const c = chat.rows[0];

    res.json({
      success: true,
      chat: {
        id: c.id,
        type: c.type,
        name: c.name,
        photoURL: c.photo_url,
        lastMessage: c.last_message,
        lastMessageType: c.last_message_type,
        lastMessageTime: c.last_message_time,
        createdAt: c.created_at,
        members: members.rows.map(m => ({
          id: m.id,
          fullName: m.full_name,
          photoURL: m.photo_url,
          isOnline: m.is_online,
          role: m.role,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  GET MESSAGES
// ══════════════════════════════════════════════

const getMessages = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;
    if (!(await isMember(chatId, userId))) {
      return res.status(403).json({ success: false, message: 'Not a member of this chat.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT m.id, m.chat_id, m.sender_id, m.type, m.text, m.media_url, m.file_name,
              m.reply_to, m.pinned, m.edited, m.created_at, m.updated_at,
              u.full_name AS sender_name, u.photo_url AS sender_photo
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.chat_id = $1
         AND m.id NOT IN (SELECT message_id FROM message_deletions WHERE user_id = $3)
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $4`,
      [chatId, limit, userId, offset]
    );

    // Get reactions for these messages
    const messageIds = result.rows.map(r => r.id);
    let reactions = [];
    if (messageIds.length > 0) {
      const rResult = await query(
        `SELECT mr.message_id, mr.user_id, mr.emoji, u.full_name
         FROM message_reactions mr
         JOIN users u ON u.id = mr.user_id
         WHERE mr.message_id = ANY($1)`,
        [messageIds]
      );
      reactions = rResult.rows;
    }

    const messages = result.rows.reverse().map(m => {
      const msgReactions = reactions
        .filter(r => r.message_id === m.id)
        .map(r => ({ userId: r.user_id, fullName: r.full_name, emoji: r.emoji }));

      return {
        id: m.id,
        chatId: m.chat_id,
        senderId: m.sender_id,
        senderName: m.sender_name,
        senderPhoto: m.sender_photo,
        type: m.type,
        text: m.text,
        mediaUrl: m.media_url,
        fileName: m.file_name,
        replyTo: m.reply_to,
        pinned: m.pinned,
        edited: m.edited,
        reactions: msgReactions,
        isOwn: m.sender_id === userId,
        createdAt: m.created_at,
      };
    });

    const total = await query(
      'SELECT COUNT(*) FROM messages WHERE chat_id = $1 AND id NOT IN (SELECT message_id FROM message_deletions WHERE user_id = $2)',
      [chatId, userId]
    );

    res.json({ success: true, messages, page, limit, total: parseInt(total.rows[0].count) });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  SEND MESSAGE
// ══════════════════════════════════════════════

const sendMessage = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;
    if (!(await isMember(chatId, userId))) {
      return res.status(403).json({ success: false, message: 'Not a member of this chat.' });
    }

    const { type = 'text', text = '', mediaUrl = '', fileName = '', replyTo = null } = req.body;

    if (!text && !mediaUrl) {
      return res.status(400).json({ success: false, message: 'Message must have text or media.' });
    }

    const result = await query(
      `INSERT INTO messages (chat_id, sender_id, type, text, media_url, file_name, reply_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, chat_id, sender_id, type, text, media_url, file_name, reply_to, pinned, edited, created_at`,
      [chatId, userId, type, text, mediaUrl, fileName, replyTo]
    );

    const preview = messagePreview(type, text);

    // Update chat last message and increment unread for other members
    await query(
      `UPDATE chats SET last_message = $1, last_message_type = $2, last_message_time = NOW(), updated_at = NOW() WHERE id = $3`,
      [preview, type, chatId]
    );
    await query(
      'UPDATE chat_members SET unread = unread + 1 WHERE chat_id = $1 AND user_id != $2',
      [chatId, userId]
    );

    const sender = await query('SELECT full_name, photo_url FROM users WHERE id = $1', [userId]);
    const m = result.rows[0];

    const messageData = {
      id: m.id,
      chatId: m.chat_id,
      senderId: m.sender_id,
      senderName: sender.rows[0].full_name,
      senderPhoto: sender.rows[0].photo_url,
      type: m.type,
      text: m.text,
      mediaUrl: m.media_url,
      fileName: m.file_name,
      replyTo: m.reply_to,
      pinned: m.pinned,
      edited: m.edited,
      reactions: [],
      isOwn: true,
      createdAt: m.created_at,
    };

    // Emit via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`chat:${chatId}`).emit('chat:message', { ...messageData, isOwn: false });
    }

    // Push notification for members who aren't actively viewing this chat
    // (best-effort — never blocks the response on push delivery).
    query('SELECT user_id FROM chat_members WHERE chat_id = $1 AND user_id != $2', [chatId, userId])
      .then(({ rows }) => {
        rows.forEach(({ user_id }) => {
          sendPushToUser(user_id, {
            title: sender.rows[0].full_name,
            body: preview,
            data: { type: 'chat', chatId: Number(chatId) },
          });
        });
      })
      .catch(() => {});

    res.status(201).json({ success: true, message: messageData });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  EDIT MESSAGE
// ══════════════════════════════════════════════

const editMessage = async (req, res, next) => {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body;

    if (!text) return res.status(400).json({ success: false, message: 'Text is required.' });

    const msg = await query('SELECT sender_id, chat_id FROM messages WHERE id = $1', [messageId]);
    if (msg.rows.length === 0) return res.status(404).json({ success: false, message: 'Message not found.' });
    if (msg.rows[0].sender_id !== req.user.id) return res.status(403).json({ success: false, message: 'Can only edit your own messages.' });

    await query('UPDATE messages SET text = $1, edited = true, updated_at = NOW() WHERE id = $2', [text, messageId]);

    const io = req.app.get('io');
    if (io) {
      io.to(`chat:${msg.rows[0].chat_id}`).emit('chat:messageEdited', { messageId: parseInt(messageId), chatId: msg.rows[0].chat_id, text });
    }

    res.json({ success: true, message: 'Message edited.' });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  DELETE MESSAGE (for everyone)
// ══════════════════════════════════════════════

const deleteMessage = async (req, res, next) => {
  try {
    const { id: messageId } = req.params;

    const msg = await query('SELECT sender_id, chat_id FROM messages WHERE id = $1', [messageId]);
    if (msg.rows.length === 0) return res.status(404).json({ success: false, message: 'Message not found.' });

    const isOwner = msg.rows[0].sender_id === req.user.id;
    const admin = await isAdminOf(msg.rows[0].chat_id, req.user.id);

    if (!isOwner && !admin && req.user.role !== 'admin' && req.user.role !== 'main_admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await query('DELETE FROM messages WHERE id = $1', [messageId]);

    const io = req.app.get('io');
    if (io) {
      io.to(`chat:${msg.rows[0].chat_id}`).emit('chat:messageDeleted', { messageId: parseInt(messageId), chatId: msg.rows[0].chat_id });
    }

    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  DELETE MESSAGE FOR ME
// ══════════════════════════════════════════════

const deleteMessageForMe = async (req, res, next) => {
  try {
    const { id: messageId } = req.params;

    const msg = await query('SELECT id FROM messages WHERE id = $1', [messageId]);
    if (msg.rows.length === 0) return res.status(404).json({ success: false, message: 'Message not found.' });

    await query(
      'INSERT INTO message_deletions (message_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [messageId, req.user.id]
    );

    res.json({ success: true, message: 'Message hidden.' });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  REACT TO MESSAGE
// ══════════════════════════════════════════════

const reactToMessage = async (req, res, next) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) return res.status(400).json({ success: false, message: 'Emoji is required.' });

    const msg = await query('SELECT chat_id FROM messages WHERE id = $1', [messageId]);
    if (msg.rows.length === 0) return res.status(404).json({ success: false, message: 'Message not found.' });
    if (!(await isMember(msg.rows[0].chat_id, req.user.id))) {
      return res.status(403).json({ success: false, message: 'Not a member of this chat.' });
    }

    await query(
      `INSERT INTO message_reactions (message_id, user_id, emoji) VALUES ($1, $2, $3)
       ON CONFLICT (message_id, user_id) DO UPDATE SET emoji = $3`,
      [messageId, req.user.id, emoji]
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`chat:${msg.rows[0].chat_id}`).emit('chat:reaction', {
        messageId: parseInt(messageId), chatId: msg.rows[0].chat_id,
        userId: req.user.id, emoji,
      });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const removeReaction = async (req, res, next) => {
  try {
    const { id: messageId } = req.params;

    const msg = await query('SELECT chat_id FROM messages WHERE id = $1', [messageId]);
    if (msg.rows.length === 0) return res.status(404).json({ success: false, message: 'Message not found.' });
    if (!(await isMember(msg.rows[0].chat_id, req.user.id))) {
      return res.status(403).json({ success: false, message: 'Not a member of this chat.' });
    }

    await query('DELETE FROM message_reactions WHERE message_id = $1 AND user_id = $2', [messageId, req.user.id]);

    const io = req.app.get('io');
    if (io) {
      io.to(`chat:${msg.rows[0].chat_id}`).emit('chat:reactionRemoved', {
        messageId: parseInt(messageId), chatId: msg.rows[0].chat_id, userId: req.user.id,
      });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  PIN / UNPIN MESSAGE
// ══════════════════════════════════════════════

const togglePinMessage = async (req, res, next) => {
  try {
    const { id: messageId } = req.params;

    const msg = await query('SELECT pinned, chat_id FROM messages WHERE id = $1', [messageId]);
    if (msg.rows.length === 0) return res.status(404).json({ success: false, message: 'Message not found.' });
    if (!(await isMember(msg.rows[0].chat_id, req.user.id))) {
      return res.status(403).json({ success: false, message: 'Not a member of this chat.' });
    }

    const newPinned = !msg.rows[0].pinned;
    await query('UPDATE messages SET pinned = $1, updated_at = NOW() WHERE id = $2', [newPinned, messageId]);

    res.json({ success: true, pinned: newPinned });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  MARK CHAT AS READ
// ══════════════════════════════════════════════

const markChatAsRead = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;

    await query('UPDATE chat_members SET unread = 0 WHERE chat_id = $1 AND user_id = $2', [chatId, userId]);

    // Bulk insert read receipts for unread messages
    await query(
      `INSERT INTO message_reads (message_id, user_id)
       SELECT m.id, $2 FROM messages m
       WHERE m.chat_id = $1 AND m.sender_id != $2
         AND m.id NOT IN (SELECT message_id FROM message_reads WHERE user_id = $2)`,
      [chatId, userId]
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`chat:${chatId}`).emit('chat:read', { chatId: parseInt(chatId), userId });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  CHAT SETTINGS (mute, archive, pin, block)
// ══════════════════════════════════════════════

const toggleChatSetting = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const { setting } = req.params;
    const allowed = ['muted', 'archived', 'pinned', 'blocked'];
    if (!allowed.includes(setting)) {
      return res.status(400).json({ success: false, message: 'Invalid setting.' });
    }

    const current = await query(
      `SELECT ${setting} FROM chat_members WHERE chat_id = $1 AND user_id = $2`,
      [chatId, req.user.id]
    );
    if (current.rows.length === 0) return res.status(404).json({ success: false, message: 'Not a member.' });

    const newVal = !current.rows[0][setting];
    await query(
      `UPDATE chat_members SET ${setting} = $1 WHERE chat_id = $2 AND user_id = $3`,
      [newVal, chatId, req.user.id]
    );

    res.json({ success: true, [setting]: newVal });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  GROUP MANAGEMENT
// ══════════════════════════════════════════════

const addGroupMember = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const { userId } = req.body;

    if (!(await isAdminOf(chatId, req.user.id))) {
      return res.status(403).json({ success: false, message: 'Only admins can add members.' });
    }

    const chat = await query("SELECT id FROM chats WHERE id = $1 AND type = 'group'", [chatId]);
    if (chat.rows.length === 0) return res.status(404).json({ success: false, message: 'Group not found.' });

    await query(
      'INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [chatId, userId, 'member']
    );

    res.json({ success: true, message: 'Member added.' });
  } catch (err) {
    next(err);
  }
};

const removeGroupMember = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const { userId } = req.body;

    if (!(await isAdminOf(chatId, req.user.id))) {
      return res.status(403).json({ success: false, message: 'Only admins can remove members.' });
    }

    // Can't remove the creator
    const target = await query('SELECT role FROM chat_members WHERE chat_id = $1 AND user_id = $2', [chatId, userId]);
    if (target.rows.length > 0 && target.rows[0].role === 'creator') {
      return res.status(403).json({ success: false, message: 'Cannot remove the group creator.' });
    }

    await query('DELETE FROM chat_members WHERE chat_id = $1 AND user_id = $2', [chatId, userId]);

    res.json({ success: true, message: 'Member removed.' });
  } catch (err) {
    next(err);
  }
};

const makeGroupAdmin = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const { userId } = req.body;

    if (!(await isAdminOf(chatId, req.user.id))) {
      return res.status(403).json({ success: false, message: 'Only admins can promote members.' });
    }

    await query("UPDATE chat_members SET role = 'admin' WHERE chat_id = $1 AND user_id = $2", [chatId, userId]);
    res.json({ success: true, message: 'Member promoted to admin.' });
  } catch (err) {
    next(err);
  }
};

const removeGroupAdmin = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const { userId } = req.body;

    if (!(await isAdminOf(chatId, req.user.id))) {
      return res.status(403).json({ success: false, message: 'Only admins can demote.' });
    }

    const target = await query('SELECT role FROM chat_members WHERE chat_id = $1 AND user_id = $2', [chatId, userId]);
    if (target.rows.length > 0 && target.rows[0].role === 'creator') {
      return res.status(403).json({ success: false, message: 'Cannot demote the creator.' });
    }

    await query("UPDATE chat_members SET role = 'member' WHERE chat_id = $1 AND user_id = $2", [chatId, userId]);
    res.json({ success: true, message: 'Admin demoted to member.' });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
//  CLEAR / DELETE CHAT
// ══════════════════════════════════════════════

const clearChat = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    if (!(await isMember(chatId, req.user.id))) {
      return res.status(403).json({ success: false, message: 'Not a member.' });
    }

    await query('DELETE FROM messages WHERE chat_id = $1', [chatId]);
    await query("UPDATE chats SET last_message = '', last_message_type = '', updated_at = NOW() WHERE id = $1", [chatId]);

    res.json({ success: true, message: 'Chat cleared.' });
  } catch (err) {
    next(err);
  }
};

const deleteChat = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const chat = await query('SELECT created_by, type FROM chats WHERE id = $1', [chatId]);
    if (chat.rows.length === 0) return res.status(404).json({ success: false, message: 'Chat not found.' });

    const isCreator = chat.rows[0].created_by === req.user.id;
    const isAppAdmin = req.user.role === 'admin' || req.user.role === 'main_admin';

    if (!isCreator && !isAppAdmin) {
      return res.status(403).json({ success: false, message: 'Only the creator can delete this chat.' });
    }

    await query('DELETE FROM chats WHERE id = $1', [chatId]);
    res.json({ success: true, message: 'Chat deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPrivateChat, createGroupChat, getUserChats, getChatById,
  getMessages, sendMessage, editMessage, deleteMessage, deleteMessageForMe,
  reactToMessage, removeReaction, togglePinMessage, markChatAsRead,
  toggleChatSetting, addGroupMember, removeGroupMember, makeGroupAdmin, removeGroupAdmin,
  clearChat, deleteChat,
};
