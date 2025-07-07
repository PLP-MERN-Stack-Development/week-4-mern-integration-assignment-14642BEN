const { body } = require('express-validator');

exports.validatePost = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('category').notEmpty().withMessage('Category ID is required'),
];

exports.validateCategory = [
  body('name').notEmpty().withMessage('Category name is required')
];
