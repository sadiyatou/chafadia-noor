const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getStats, getUsers, toggleBan, changeRole, toggleVerified, deleteUser,
  getReports, resolveReport, getPosts, deletePost,
  broadcastNotification, getAllChats, adminDeleteChat,
  forceEndStream, getStreams,
} = require('../controllers/adminController');

router.use(authenticate, requireAdmin);

// Dashboard
router.get('/stats', getStats);

// Users
router.get('/users', getUsers);
router.put('/users/:id/ban', toggleBan);
router.put('/users/:id/role', changeRole);
router.put('/users/:id/verified', toggleVerified);
router.delete('/users/:id', deleteUser);

// Reports
router.get('/reports', getReports);
router.put('/reports/:id', resolveReport);

// Posts
router.get('/posts', getPosts);
router.delete('/posts/:id', deletePost);

// Notifications
router.post('/notifications/broadcast', broadcastNotification);

// Chats
router.get('/chats', getAllChats);
router.delete('/chats/:id', adminDeleteChat);

// Streams
router.get('/streams', getStreams);
router.put('/streams/:id/end', forceEndStream);

module.exports = router;
