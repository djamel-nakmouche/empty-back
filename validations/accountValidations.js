const { body } = require('express-validator');
const { sanitizeBody } = require('express-validator');

exports.resetEmailValidation = [
  body('email').trim().isLength({ min: 6 }).withMessage('Email must have at least 6 characters.')
  .isEmail().withMessage('Email must be a valid email'),
];

exports.resetPasswordValidation = [
  body('newPassword').isLength({ min: 6 }).withMessage('Password must have at least 8 characters.'),
];