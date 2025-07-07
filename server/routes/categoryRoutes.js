const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { validateCategory } = require('../middleware/validators');

router.get('/', categoryController.getCategories);
router.post('/', validateCategory, categoryController.createCategory);

module.exports = router;
