const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPostById, deletePost, likePost, commentOnPost, getPostComments, deleteComment } = require('../controllers/postController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getPosts);
router.post('/', authenticate, createPost);
router.get('/:id', authenticate, getPostById);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, likePost);
router.post('/:id/comments', authenticate, commentOnPost);
router.get('/:id/comments', authenticate, getPostComments);
router.delete('/:id/comments/:commentId', authenticate, deleteComment);

module.exports = router;
