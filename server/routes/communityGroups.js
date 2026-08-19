const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getGroups, getMyGroups, createGroup, joinGroup, leaveGroup,
  getGroupMessages, sendGroupMessage,
  adminGetGroups, adminUpdateGroup,
} = require('../controllers/communityGroupsController');

router.get('/',              authenticate, getGroups);
router.get('/mine',          authenticate, getMyGroups);
router.post('/',             authenticate, createGroup);
router.post('/:id/join',     authenticate, joinGroup);
router.delete('/:id/leave',  authenticate, leaveGroup);
router.get('/:id/messages',  authenticate, getGroupMessages);
router.post('/:id/messages', authenticate, sendGroupMessage);

// Admin
router.get('/admin/all',     authenticate, requireAdmin, adminGetGroups);
router.put('/:id',           authenticate, requireAdmin, adminUpdateGroup);

module.exports = router;
