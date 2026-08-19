const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = process.env.UPLOADS_DIR || './uploads';

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = req.uploadSubDir || 'general';
    const fullPath = path.join(uploadsDir, subDir);
    ensureDir(fullPath);
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`Only images are allowed (got ${file.mimetype})`), false);
};

const mediaFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp',
    'audio/mpeg', 'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac',
    'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/3gpp',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`File type ${file.mimetype} is not allowed`), false);
};

// "Any document" is intentionally broad (pdf/doc/zip/etc. — see admin's
// Downloads upload UI, which lets admins pick literally any file type), so
// this can't be a narrow allowlist. Instead it denies the specific types a
// browser would execute as active content if a served upload were ever
// opened directly — otherwise an uploaded "document" named evil.html would
// be served back (via express.static in server.js) and run as same-origin
// HTML/JS, a stored-XSS vector. Real document formats are unaffected.
const DANGEROUS_UPLOAD_EXTENSIONS = new Set([
  '.html', '.htm', '.xhtml', '.shtml', '.svg', '.js', '.mjs', '.cjs',
  '.php', '.phtml', '.jsp', '.asp', '.aspx', '.exe', '.dll', '.bat', '.cmd', '.sh',
]);
const DANGEROUS_UPLOAD_MIMETYPES = new Set([
  'text/html', 'application/xhtml+xml', 'image/svg+xml',
  'application/javascript', 'text/javascript', 'application/x-msdownload',
]);

const anyFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (DANGEROUS_UPLOAD_EXTENSIONS.has(ext) || DANGEROUS_UPLOAD_MIMETYPES.has(file.mimetype)) {
    return cb(new Error('This file type is not allowed.'), false);
  }
  cb(null, true);
};

const uploadImage = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadMedia = multer({ storage, fileFilter: mediaFilter, limits: { fileSize: 50 * 1024 * 1024 } });
const uploadAny = multer({ storage, fileFilter: anyFilter, limits: { fileSize: 50 * 1024 * 1024 } });

module.exports = { uploadImage, uploadMedia, uploadAny, uploadsDir };
