const express = require('express');
const router = express.Router();
const reviewerController = require('../controllers/reviewerController')

router.get('/institutions/fetchPendingVal', reviewerController.fetchInstitutionsPendingValidation_get);
router.post('/institutions/acceptPendingValidations', reviewerController.acceptedInstitutionPendingValidation_post);
router.post('/institutions/declinePendingValidations', reviewerController.declinedInstitutionPendingValidation_post);
router.post('/institutions/delete', reviewerController.deleteInstitution_post);
router.post('/institutions/edit', reviewerController.editInstitution_post);


router.post('/roles/acceptPendingVal', reviewerController.acceptRolePendingVal_post);
router.post('/roles/declinePendingVal', reviewerController.declineRolePendingVal_post);
router.post('/roles/delete', reviewerController.deleteRole_post);
router.post('/roles/edit', reviewerController.editRole_post);

router.post('/persons/acceptPendingVal', reviewerController.acceptPersonPendingVal_post);
router.post('/persons/declinePendingVal', reviewerController.declinePersonPendingVal_post);
router.post('/persons/delete', reviewerController.deletePerson_post);
router.post('/persons/edit', reviewerController.editPerson_post);

router.post('/persons/profilePictureDelete', reviewerController.deletePersonProfilePicture_post);
router.post('/persons/comments/delete', reviewerController.personCommentDelete_post);

router.post('/experiences/acceptPendingVal', reviewerController.acceptExperiencePendingVal_post);
router.post('/experiences/declinePendingVal', reviewerController.declineExperiencePendingVal_post);
router.post('/experiences/delete', reviewerController.deleteExperience_post);
// router.post('/experiences/edit', reviewerController.editExperience_post);

module.exports = router;