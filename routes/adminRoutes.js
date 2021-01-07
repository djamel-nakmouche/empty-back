const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController')

var multer = require('multer');
var path = require('path')


router.get('/accountsSearch', adminController.accountsSearch_get);
router.post('/accountAdminEdit', adminController.accountAdminEdit_post);
router.post('/accountAdminDelete', adminController.accountAdminDelete_post);
router.get('/fetchAllActivity', adminController.allActivityFetch_get);
router.post('/activityDelete', adminController.activityDelete_post);



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



router.route('/defaultProfilePicUpload')
.post(upload.single('data'), adminController.uploadProfilePic)




module.exports = router;