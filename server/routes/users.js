const express = require('express');
const router = express.Router();
const { listUsers, getUserById, updateUser, searchUsers, followUser, unfollowUser, getFollowers, getFollowing, registerPushToken } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, listUsers);
router.get('/search', authenticate, searchUsers);
router.post('/push-token', authenticate, registerPushToken);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUser);
router.get('/:id/followers', authenticate, getFollowers);
router.get('/:id/following', authenticate, getFollowing);
router.post('/:id/follow', authenticate, followUser);
router.delete('/:id/follow', authenticate, unfollowUser);

module.exports = router;
