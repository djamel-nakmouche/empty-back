const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController')

router.post('/onNavigation', activityController.onNavigation_post);


module.exports = router;