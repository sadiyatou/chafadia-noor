const express = require('express');
const router = express.Router();
const { uploadImage, uploadMedia, uploadAny } = require('../config/multer');
const { authenticate } = require('../middleware/auth');
const {
  uploadProfileImage, uploadChatMedia, uploadVoiceNote,
  uploadCommunityMedia, uploadDocument, uploadStatusMedia,
  uploadStreamThumbnail, deleteFile,
} = require('../controllers/uploadController');

const setSubDir = (subDir) => (req, res, next) => { req.uploadSubDir = subDir; next(); };

router.post('/profile-image', authenticate, setSubDir('profiles'), uploadImage.single('file'), uploadProfileImage);
router.post('/chat-media', authenticate, setSubDir('chat'), uploadMedia.single('file'), uploadChatMedia);
router.post('/voice-note', authenticate, setSubDir('voice'), uploadMedia.single('file'), uploadVoiceNote);
router.post('/community-media', authenticate, setSubDir('community'), uploadMedia.single('file'), uploadCommunityMedia);
router.post('/document', authenticate, setSubDir('documents'), uploadAny.single('file'), uploadDocument);
router.post('/status-media', authenticate, setSubDir('status'), uploadMedia.single('file'), uploadStatusMedia);
router.post('/stream-thumbnail', authenticate, setSubDir('streams'), uploadImage.single('file'), uploadStreamThumbnail);
router.delete('/', authenticate, deleteFile);

module.exports = router;
