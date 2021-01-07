const express = require('express');
const router = express.Router();
const membersController = require('../controllers/membersController')

var multer = require('multer');
var path = require('path')




const multerFilter = (req, file, cb) => {
    console.log("multerFilter")
    if (file.mimetype.startsWith("image")) {
      console.log("multerFilter true")
      cb(null, true);
    } else {
      console.log("multerFilter false")

      cb("Please upload only images.", false);
    }
  };

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("diskStorage destination function")
        console.log("dirname", __dirname)
        const uploadsDir = path.join(__dirname,'..','media','defaultProfilePictures', 'persons')
        cb(null, uploadsDir)
    },
    filename : function (req, file, cb) {
      console.log("diskStorage filename function")
        cb(null, `profilepic.png`)
    }
    });
const upload = multer({ storage: storage, fileFilter: multerFilter});



router.route('/persons/AddProfilePicture')
.post(upload.single('data'), membersController.personProfileAddProfilePicture_post)

router.post('/persons/addNew', membersController.personProfileAddNew_post);
router.post('/persons/vote', membersController.personProfileVote_post);

router.post('/persons/comments/addNew', membersController.personCommentAddNew_post);
router.post('/persons/comments/delete', membersController.personCommentDelete_post);
router.post('/persons/comments/likedislike', membersController.personCommentLikeDislike_post);

router.post('/roles/addNew', membersController.roleAddNew_post);
router.post('/institutions/addNew', membersController.institutionAddNew_post);

router.post('/experiences/addNew', membersController.experienceAddNew_post);




module.exports = router;