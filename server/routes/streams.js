const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { startStream, endStream, getLiveStreams, getStreamById, joinStream, leaveStream, postComment, getComments } = require('../controllers/streamController');

router.get('/', authenticate, getLiveStreams);
router.post('/', authenticate, startStream);
router.get('/:id', authenticate, getStreamById);
router.put('/:id/end', authenticate, endStream);
router.post('/:id/join', authenticate, joinStream);
router.post('/:id/leave', authenticate, leaveStream);
router.post('/:id/comments', authenticate, postComment);
router.get('/:id/comments', authenticate, getComments);

module.exports = router;
