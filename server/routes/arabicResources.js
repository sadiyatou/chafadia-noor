const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getResources, getResource, createResource, updateResource, deleteResource, adminGetAll,
} = require('../controllers/arabicResourcesController');

router.get('/',              authenticate, getResources);
router.get('/admin/all',     authenticate, requireAdmin, adminGetAll);
router.get('/:id',           authenticate, getResource);
router.post('/',             authenticate, requireAdmin, createResource);
router.put('/:id',           authenticate, requireAdmin, updateResource);
router.delete('/:id',        authenticate, requireAdmin, deleteResource);

module.exports = router;
