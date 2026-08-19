const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = require('../controllers/notificationController');

router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.put('/read-all', authenticate, markAllAsRead);
router.delete('/all', authenticate, clearAll);
router.put('/:id/read', authenticate, markAsRead);
router.delete('/:id', authenticate, deleteNotification);

module.exports = router;
