const { query } = require('../config/db');
const { createNotification } = require('./notificationController');

const initiateCall = async (req, res, next) => {
  try {
    const { receiverId, type = 'audio' } = req.body;
    const callerId = req.user.id;

    if (!receiverId) return res.status(400).json({ success: false, message: 'receiverId is required.' });
    if (callerId === parseInt(receiverId)) return res.status(400).json({ success: false, message: 'Cannot call yourself.' });

    const receiver = await query('SELECT id, full_name FROM users WHERE id = $1', [receiverId]);
    if (receiver.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    const result = await query(
      `INSERT INTO calls (caller_id, receiver_id, type, status)
       VALUES ($1, $2, $3, 'ringing')
       RETURNING id, caller_id, receiver_id, type, status, created_at`,
      [callerId, receiverId, type]
    );

    const call = result.rows[0];

    // Insert both as participants
    await query('INSERT INTO call_participants (call_id, user_id, role) VALUES ($1, $2, $3), ($1, $4, $5)',
      [call.id, callerId, 'caller', receiverId, 'receiver']
    );

    const caller = await query('SELECT full_name, photo_url FROM users WHERE id = $1', [callerId]);

    const callData = {
      id: call.id,
      callerId: call.caller_id,
      callerName: caller.rows[0].full_name,
      callerPhoto: caller.rows[0].photo_url,
      receiverId: call.receiver_id,
      type: call.type,
      status: call.status,
      createdAt: call.created_at,
    };

    // Emit incoming call via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${receiverId}`).emit('call:incoming', callData);
    }

    // Send notification
    await createNotification({
      userId: parseInt(receiverId),
      senderId: callerId,
      type: 'call',
      title: `Incoming ${type} call`,
      body: `${caller.rows[0].full_name} is calling you`,
      data: { callId: call.id, callType: type },
    }, io);

    res.status(201).json({ success: true, call: callData });
  } catch (err) {
    next(err);
  }
};

const answerCall = async (req, res, next) => {
  try {
    const callId = req.params.id;

    const call = await query('SELECT id, receiver_id, status FROM calls WHERE id = $1', [callId]);
    if (call.rows.length === 0) return res.status(404).json({ success: false, message: 'Call not found.' });
    if (call.rows[0].receiver_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not the receiver.' });
    if (call.rows[0].status !== 'ringing') return res.status(400).json({ success: false, message: 'Call is not ringing.' });

    await query("UPDATE calls SET status = 'active', started_at = NOW() WHERE id = $1", [callId]);

    const io = req.app.get('io');
    if (io) {
      const updated = await query('SELECT caller_id FROM calls WHERE id = $1', [callId]);
      io.to(`user:${updated.rows[0].caller_id}`).emit('call:answered', { callId: parseInt(callId) });
    }

    res.json({ success: true, message: 'Call answered.' });
  } catch (err) {
    next(err);
  }
};

const rejectCall = async (req, res, next) => {
  try {
    const callId = req.params.id;

    const call = await query('SELECT id, receiver_id, caller_id, status FROM calls WHERE id = $1', [callId]);
    if (call.rows.length === 0) return res.status(404).json({ success: false, message: 'Call not found.' });
    if (call.rows[0].receiver_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not the receiver.' });

    await query("UPDATE calls SET status = 'rejected', ended_at = NOW() WHERE id = $1", [callId]);

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${call.rows[0].caller_id}`).emit('call:rejected', { callId: parseInt(callId) });
    }

    res.json({ success: true, message: 'Call rejected.' });
  } catch (err) {
    next(err);
  }
};

const endCall = async (req, res, next) => {
  try {
    const callId = req.params.id;

    const call = await query('SELECT id, caller_id, receiver_id, status, started_at FROM calls WHERE id = $1', [callId]);
    if (call.rows.length === 0) return res.status(404).json({ success: false, message: 'Call not found.' });

    const isParticipant = call.rows[0].caller_id === req.user.id || call.rows[0].receiver_id === req.user.id;
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not a participant.' });

    let duration = 0;
    if (call.rows[0].started_at) {
      duration = Math.round((Date.now() - new Date(call.rows[0].started_at).getTime()) / 1000);
    }

    await query("UPDATE calls SET status = 'ended', ended_at = NOW(), duration_seconds = $1 WHERE id = $2", [duration, callId]);

    const io = req.app.get('io');
    if (io) {
      const otherId = call.rows[0].caller_id === req.user.id ? call.rows[0].receiver_id : call.rows[0].caller_id;
      io.to(`user:${otherId}`).emit('call:ended', { callId: parseInt(callId), duration });
    }

    res.json({ success: true, message: 'Call ended.', duration });
  } catch (err) {
    next(err);
  }
};

const getCallHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 30, 50);
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT c.id, c.type, c.status, c.duration_seconds, c.started_at, c.ended_at, c.created_at,
              c.caller_id, caller.full_name AS caller_name, caller.photo_url AS caller_photo,
              c.receiver_id, receiver.full_name AS receiver_name, receiver.photo_url AS receiver_photo
       FROM calls c
       JOIN users caller ON caller.id = c.caller_id
       JOIN users receiver ON receiver.id = c.receiver_id
       WHERE c.caller_id = $1 OR c.receiver_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const calls = result.rows.map(c => ({
      id: c.id,
      type: c.type,
      status: c.status,
      duration: c.duration_seconds,
      isOutgoing: c.caller_id === req.user.id,
      caller: { id: c.caller_id, fullName: c.caller_name, photoURL: c.caller_photo },
      receiver: { id: c.receiver_id, fullName: c.receiver_name, photoURL: c.receiver_photo },
      startedAt: c.started_at,
      endedAt: c.ended_at,
      createdAt: c.created_at,
    }));

    res.json({ success: true, calls, page, limit });
  } catch (err) {
    next(err);
  }
};

const getIceServers = async (req, res) => {
  const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];

  const turnUrls = (process.env.TURN_URLS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (turnUrls.length && process.env.TURN_USERNAME && process.env.TURN_CREDENTIAL) {
    iceServers.push({
      urls: turnUrls,
      username: process.env.TURN_USERNAME,
      credential: process.env.TURN_CREDENTIAL,
    });
  }

  res.json({ success: true, iceServers });
};

const getCallById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT c.id, c.type, c.status, c.duration_seconds, c.started_at, c.ended_at, c.created_at,
              c.caller_id, caller.full_name AS caller_name, caller.photo_url AS caller_photo,
              c.receiver_id, receiver.full_name AS receiver_name, receiver.photo_url AS receiver_photo
       FROM calls c
       JOIN users caller ON caller.id = c.caller_id
       JOIN users receiver ON receiver.id = c.receiver_id
       WHERE c.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Call not found.' });

    const c = result.rows[0];
    const isParticipant = c.caller_id === req.user.id || c.receiver_id === req.user.id;
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not a participant.' });

    res.json({
      success: true,
      call: {
        id: c.id, type: c.type, status: c.status, duration: c.duration_seconds,
        isOutgoing: c.caller_id === req.user.id,
        caller: { id: c.caller_id, fullName: c.caller_name, photoURL: c.caller_photo },
        receiver: { id: c.receiver_id, fullName: c.receiver_name, photoURL: c.receiver_photo },
        startedAt: c.started_at, endedAt: c.ended_at, createdAt: c.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { initiateCall, answerCall, rejectCall, endCall, getCallHistory, getCallById, getIceServers };
