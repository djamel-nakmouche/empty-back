const express = require('express');
const router = express.Router();
const authPatientController = require('../controllers/authController')
var authPatientValidation = require('../validations/authAccountValidations');

router.post('/register', authPatientValidation.registerValidation, authPatientController.register_post);
router.post('/login', authPatientValidation.loginValidation, authPatientController.login_post);
router.get('/confirmation/:token', authPatientController.emailConfirmation_get);
router.get('/tokenCheck/:token', authPatientController.tokenCheck_get);

// Client asking for new validation email. Handling the demand
router.post('/newvalemaildemand', authPatientController.sendValidationEmail_post);


// Client asking for email. Handling the demand
router.post('/resetpassword', authPatientController.sendEmailForPasswordReset_post);
// Client clicking the link in the email sent for password reset. Redirecting to the App.
router.get('/resetpassword/:token', authPatientController.resetPasswordToken_get);
// Client setting his/her new password. 
router.post('/setpassword', authPatientController.setPassword_get);

module.exports = router;