const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getEssentials, getEssential, createEssential, updateEssential, deleteEssential, adminGetAll,
} = require('../controllers/essentialsController');

router.get('/',          authenticate, getEssentials);
router.get('/admin/all', authenticate, requireAdmin, adminGetAll);
router.get('/:id',       authenticate, getEssential);
router.post('/',         authenticate, requireAdmin, createEssential);
router.put('/:id',       authenticate, requireAdmin, updateEssential);
router.delete('/:id',    authenticate, requireAdmin, deleteEssential);

module.exports = router;
