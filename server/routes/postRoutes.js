const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { validatePost } = require('../middleware/validators');

router.get('/', postController.getPosts);
router.get('/:id', postController.getPost);
router.post('/', validatePost, postController.createPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

module.exports = router;
