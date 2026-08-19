const jwt = require('jsonwebtoken');
const { query } = require('./db');
const { sendPushToUser } = require('../utils/push');

const setupSocket = (io) => {
  // Authenticate socket connections via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    console.log(`User connected: ${userId}`);

    // Join personal room for direct notifications
    socket.join(`user:${userId}`);

    // Set user online
    await query('UPDATE users SET is_online = true, last_seen = NOW() WHERE id = $1', [userId]);
    io.emit('user:online', { userId });

    // Auto-join all chat rooms this user belongs to
    const chats = await query('SELECT chat_id FROM chat_members WHERE user_id = $1', [userId]);
    for (const row of chats.rows) {
      socket.join(`chat:${row.chat_id}`);
    }

    // ── Join / leave specific chat rooms ──

    socket.on('chat:join', (chatId) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on('chat:leave', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    // ── Typing indicator ──

    socket.on('chat:typing', (data) => {
      socket.to(`chat:${data.chatId}`).emit('chat:typing', {
        chatId: data.chatId,
        userId,
        typing: !!data.typing,
      });
    });

    // ── Mark messages as read (from client) ──

    socket.on('chat:markRead', async (data) => {
      const { chatId } = data;
      await query('UPDATE chat_members SET unread = 0 WHERE chat_id = $1 AND user_id = $2', [chatId, userId]);
      await query(
        `INSERT INTO message_reads (message_id, user_id)
         SELECT m.id, $2 FROM messages m
         WHERE m.chat_id = $1 AND m.sender_id != $2
           AND m.id NOT IN (SELECT message_id FROM message_reads WHERE user_id = $2)`,
        [chatId, userId]
      );
      socket.to(`chat:${chatId}`).emit('chat:read', { chatId, userId });
    });

    // ── Live stream rooms ──

    socket.on('stream:join', (streamId) => {
      socket.join(`stream:${streamId}`);
    });

    socket.on('stream:leave', (streamId) => {
      socket.leave(`stream:${streamId}`);
    });

    // ── Call signaling (WebRTC) ──
    // Initiate a call: caller → callee
    socket.on('call:initiate', (data) => {
      // data: { toUserId, callId, callType ('voice'|'video'), callerName, callerPhoto }
      io.to(`user:${data.toUserId}`).emit('call:incoming', {
        callId: data.callId,
        callType: data.callType,
        fromUserId: userId,
        callerName: data.callerName,
        callerPhoto: data.callerPhoto,
      });

      // Push notification so the call rings even if the callee's app is
      // backgrounded (the socket event alone only reaches a foregrounded app).
      sendPushToUser(data.toUserId, {
        title: `Incoming ${data.callType === 'video' ? 'video' : 'voice'} call`,
        body: `${data.callerName || 'Someone'} is calling you`,
        data: { type: 'call', callId: data.callId, callType: data.callType, fromUserId: userId },
      });
    });

    // Callee accepts — sends back SDP offer request
    socket.on('call:accept', (data) => {
      // data: { callId, toUserId }
      io.to(`user:${data.toUserId}`).emit('call:accepted', {
        callId: data.callId,
        byUserId: userId,
      });
    });

    // Callee rejects
    socket.on('call:reject', (data) => {
      // data: { callId, toUserId }
      io.to(`user:${data.toUserId}`).emit('call:rejected', {
        callId: data.callId,
        byUserId: userId,
      });
    });

    // Either side ends the call
    socket.on('call:end', (data) => {
      // data: { callId, toUserId }
      io.to(`user:${data.toUserId}`).emit('call:ended', {
        callId: data.callId,
        byUserId: userId,
      });
    });

    // WebRTC SDP offer
    socket.on('call:sdp-offer', (data) => {
      // data: { callId, toUserId, sdp }
      io.to(`user:${data.toUserId}`).emit('call:sdp-offer', {
        callId: data.callId,
        fromUserId: userId,
        sdp: data.sdp,
      });
    });

    // WebRTC SDP answer
    socket.on('call:sdp-answer', (data) => {
      // data: { callId, toUserId, sdp }
      io.to(`user:${data.toUserId}`).emit('call:sdp-answer', {
        callId: data.callId,
        fromUserId: userId,
        sdp: data.sdp,
      });
    });

    // WebRTC ICE candidates
    socket.on('call:ice-candidate', (data) => {
      // data: { callId, toUserId, candidate }
      io.to(`user:${data.toUserId}`).emit('call:ice-candidate', {
        callId: data.callId,
        fromUserId: userId,
        candidate: data.candidate,
      });
    });

    // ── Disconnect ──

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);
      await query('UPDATE users SET is_online = false, last_seen = NOW() WHERE id = $1', [userId]);
      io.emit('user:offline', { userId });
    });
  });
};

module.exports = setupSocket;
