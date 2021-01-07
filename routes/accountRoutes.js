const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController')
var accountValidations = require('../validations/accountValidations');


var multer = require('multer');
var path = require('path')



const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb("Please upload only images.", false);
    }
  };

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname,'..','media','defaultProfilePictures', 'persons')
        cb(null, uploadsDir)
    },
    filename : function (req, file, cb) {
        cb(null, `profilepic.png`)
    }
    });
const upload = multer({ storage: storage, fileFilter: multerFilter});


// Upload profile pic
router.route('/uploadProfilePicture')
.post(upload.single('data'), accountController.accountAddProfilePicture_post)

router.post('/deleteProfilePicture', accountController.deletePersonProfilePicture_post);


// Account info fetch
router.get('/fetchAccountInfo', accountController.fetchAccountInfo_get);
router.post('/editAccountInfo', accountController.editAccountInfo_post);
router.get('/pseudoAvailabilityCheck', accountController.checkAvailablePseudo_get);
router.post('/resetEmail', accountValidations.resetEmailValidation, accountController.resetEmail_post);
router.post('/resetPassword', accountValidations.resetPasswordValidation, accountController.resetPassword_post);


module.exports = router;