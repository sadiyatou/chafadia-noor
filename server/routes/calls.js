const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { initiateCall, answerCall, rejectCall, endCall, getCallHistory, getCallById, getIceServers } = require('../controllers/callController');

router.get('/', authenticate, getCallHistory);
router.post('/', authenticate, initiateCall);
router.get('/ice-servers', authenticate, getIceServers);
router.get('/:id', authenticate, getCallById);
router.put('/:id/answer', authenticate, answerCall);
router.put('/:id/reject', authenticate, rejectCall);
router.put('/:id/end', authenticate, endCall);

module.exports = router;
