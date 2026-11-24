const express = require('express');
const CaregiverController = require('../controllers/caregiverController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');
const {
  validateIdParam,
  validateCreateProfile,
  validateUpdateProfile,
  validateVerifyStatus,
  validateCreateDocument,
  validateAddService,
  validateUpdateServicePrice,
  validateAddArea,
} = require('../validators/caregiverValidator');

const router = express.Router();

router.use(authenticate);

// Hồ sơ người chăm sóc
router.get('/profiles', CaregiverController.listProfiles);
router.get('/profiles/me', CaregiverController.getMyProfile);
router.get('/profiles/:id', validateIdParam('id'), CaregiverController.getProfileById);
router.post('/profiles', validateCreateProfile, CaregiverController.createProfile);
router.put(
  '/profiles/:id',
  validateIdParam('id'),
  validateUpdateProfile,
  CaregiverController.updateProfile
);
router.delete('/profiles/:id', validateIdParam('id'), CaregiverController.deleteProfile);

// Duyệt hồ sơ (chỉ ADMIN)
router.patch(
  '/profiles/:id/verify',
  authorizeRoles('ADMIN'),
  validateIdParam('id'),
  validateVerifyStatus,
  CaregiverController.verifyProfile
);

// Giấy tờ của người chăm sóc
router.get('/profiles/:id/documents', validateIdParam('id'), CaregiverController.listDocuments);
router.post(
  '/profiles/:id/documents',
  validateIdParam('id'),
  validateCreateDocument,
  CaregiverController.addDocument
);
router.patch(
  '/documents/:docId/verify',
  authorizeRoles('ADMIN'),
  validateIdParam('docId'),
  validateVerifyStatus,
  CaregiverController.verifyDocument
);
router.delete('/documents/:docId', validateIdParam('docId'), CaregiverController.deleteDocument);

// Dịch vụ của người chăm sóc
router.get('/profiles/:id/services', validateIdParam('id'), CaregiverController.listServices);
router.post(
  '/profiles/:id/services',
  validateIdParam('id'),
  validateAddService,
  CaregiverController.addService
);
router.patch(
  '/services/:serviceLinkId',
  validateIdParam('serviceLinkId'),
  validateUpdateServicePrice,
  CaregiverController.updateServicePrice
);
router.delete('/services/:serviceLinkId', validateIdParam('serviceLinkId'), CaregiverController.removeService);

// Khu vực phục vụ của người chăm sóc
router.get('/profiles/:id/areas', validateIdParam('id'), CaregiverController.listAreas);
router.post('/profiles/:id/areas', validateIdParam('id'), validateAddArea, CaregiverController.addArea);
router.delete('/areas/:areaId', validateIdParam('areaId'), CaregiverController.removeArea);

module.exports = router;