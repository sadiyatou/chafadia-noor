const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getDownloads, getDownload, createDownload, updateDownload, deleteDownload, adminGetAll,
} = require('../controllers/downloadsController');

router.get('/',          authenticate, getDownloads);
router.get('/admin/all', authenticate, requireAdmin, adminGetAll);
router.get('/:id',       authenticate, getDownload);
router.post('/',         authenticate, requireAdmin, createDownload);
router.put('/:id',       authenticate, requireAdmin, updateDownload);
router.delete('/:id',    authenticate, requireAdmin, deleteDownload);

module.exports = router;
