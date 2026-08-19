const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');
const { uploadsDir } = require('../config/multer');

const buildUrl = (req, subDir, filename) => {
  return `${req.protocol}://${req.get('host')}/uploads/${subDir}/${filename}`;
};

const fileResponse = (req, subDir) => {
  const file = req.file;
  return {
    url: buildUrl(req, subDir, file.filename),
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
  };
};

const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

    const url = buildUrl(req, 'profiles', req.file.filename);

    await query('UPDATE users SET photo_url = $1, updated_at = NOW() WHERE id = $2', [url, req.user.id]);

    res.json({ success: true, ...fileResponse(req, 'profiles') });
  } catch (err) {
    next(err);
  }
};

const uploadChatMedia = (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    res.json({ success: true, ...fileResponse(req, 'chat') });
  } catch (err) {
    next(err);
  }
};

const uploadVoiceNote = (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    res.json({ success: true, ...fileResponse(req, 'voice') });
  } catch (err) {
    next(err);
  }
};

const uploadCommunityMedia = (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    res.json({ success: true, ...fileResponse(req, 'community') });
  } catch (err) {
    next(err);
  }
};

const uploadDocument = (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    res.json({ success: true, ...fileResponse(req, 'documents') });
  } catch (err) {
    next(err);
  }
};

const uploadStatusMedia = (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    res.json({ success: true, ...fileResponse(req, 'status') });
  } catch (err) {
    next(err);
  }
};

const uploadStreamThumbnail = (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    res.json({ success: true, ...fileResponse(req, 'streams') });
  } catch (err) {
    next(err);
  }
};

// Must match the sub-directories the upload* handlers above actually write
// to — anything else (e.g. "../../..") must be rejected before it reaches
// path.join, or a caller could delete arbitrary files outside uploadsDir.
const ALLOWED_SUBDIRS = ['profiles', 'chat', 'voice', 'community', 'documents', 'status', 'streams'];

const deleteFile = (req, res, next) => {
  try {
    const { filename, subDir } = req.body;
    if (!filename || !subDir) {
      return res.status(400).json({ success: false, message: 'filename and subDir are required.' });
    }
    if (!ALLOWED_SUBDIRS.includes(subDir)) {
      return res.status(400).json({ success: false, message: 'Invalid subDir.' });
    }

    const safe = path.basename(filename);
    const filePath = path.join(uploadsDir, subDir, safe);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'File deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadProfileImage, uploadChatMedia, uploadVoiceNote,
  uploadCommunityMedia, uploadDocument, uploadStatusMedia,
  uploadStreamThumbnail, deleteFile,
};
