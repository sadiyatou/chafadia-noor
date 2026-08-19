const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getArticles, getArticle, createArticle, updateArticle, deleteArticle, adminGetAll,
} = require('../controllers/articlesController');

router.get('/',          authenticate, getArticles);
router.get('/admin/all', authenticate, requireAdmin, adminGetAll);
router.get('/:id',       authenticate, getArticle);
router.post('/',         authenticate, requireAdmin, createArticle);
router.put('/:id',       authenticate, requireAdmin, updateArticle);
router.delete('/:id',    authenticate, requireAdmin, deleteArticle);

module.exports = router;
