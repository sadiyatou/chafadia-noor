const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createPrivateChat, createGroupChat, getUserChats, getChatById,
  getMessages, sendMessage, editMessage, deleteMessage, deleteMessageForMe,
  reactToMessage, removeReaction, togglePinMessage, markChatAsRead,
  toggleChatSetting, addGroupMember, removeGroupMember, makeGroupAdmin, removeGroupAdmin,
  clearChat, deleteChat,
} = require('../controllers/chatController');

// Chat CRUD
router.get('/', authenticate, getUserChats);
router.post('/private', authenticate, createPrivateChat);
router.post('/group', authenticate, createGroupChat);
router.get('/:id', authenticate, getChatById);
router.delete('/:id', authenticate, deleteChat);
router.delete('/:id/messages', authenticate, clearChat);

// Messages
router.get('/:id/messages', authenticate, getMessages);
router.post('/:id/messages', authenticate, sendMessage);
router.put('/:id/read', authenticate, markChatAsRead);

// Chat settings
router.put('/:id/settings/:setting', authenticate, toggleChatSetting);

// Group management
router.post('/:id/members', authenticate, addGroupMember);
router.delete('/:id/members', authenticate, removeGroupMember);
router.put('/:id/admins/add', authenticate, makeGroupAdmin);
router.put('/:id/admins/remove', authenticate, removeGroupAdmin);

// Message actions (use /api/messages/:id for single message ops)
router.put('/messages/:id', authenticate, editMessage);
router.delete('/messages/:id', authenticate, deleteMessage);
router.post('/messages/:id/hide', authenticate, deleteMessageForMe);
router.post('/messages/:id/react', authenticate, reactToMessage);
router.delete('/messages/:id/react', authenticate, removeReaction);
router.put('/messages/:id/pin', authenticate, togglePinMessage);

module.exports = router;
