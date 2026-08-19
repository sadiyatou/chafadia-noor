const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { askAI } = require('../controllers/aiController');

router.post('/ask', authenticate, askAI);

module.exports = router;
