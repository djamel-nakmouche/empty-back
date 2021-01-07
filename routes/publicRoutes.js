const express = require('express');
const router = express.Router(); 
const publicController = require('../controllers/publicController')

router.get('/persons/fetchById/:personId', publicController.fetchPersonById_get);
router.get('/persons/comments/fetchByPersonId/:personId', publicController.fetchCommentsByPersonId_get); //NEW
router.get('/persons/search', publicController.searchPersons_get);
router.post('/persons/countVisits', publicController.countPersonVisits_post);

router.get('/roles/fetchAll', publicController.fetchRoles_get);
router.post('/roles/institutionRoles', publicController.fetchRoles_post);
router.post('/roles/search', publicController.searchInRoles_post);

router.get('/institutions/search', publicController.searchInstitutions_get);
router.get('/institutions/fetchById/:institutionId', publicController.fetchInstitutionById_get);

// router.post('/institutions/search', publicController.searchInInstitutions_post);

router.get('/experiences/fetch', publicController.fetchExperiences_get);

router.get('/keyFigures', publicController.fetchKeyFigures_get);


module.exports = router;