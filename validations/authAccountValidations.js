const { body } = require('express-validator');
const { sanitizeBody } = require('express-validator');


exports.registerValidation = [
  body('pseudo').trim().isLength({ min: 1 }).withMessage('Pseudo must be specified.'),
  body('email').trim().isLength({ min: 6 }).withMessage('Email must have at least 6 characters.')
  .isEmail().withMessage('Email must be a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must have at least 8 characters.'),
];

exports.loginValidation = [
  body('email').trim().isLength({ min: 6 }).withMessage('Email must have at least 6 characters.')
      .isEmail().withMessage('Email must be a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must have at least 8 characters.'),
];
