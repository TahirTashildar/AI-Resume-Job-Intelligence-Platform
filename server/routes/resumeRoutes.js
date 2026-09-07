const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { aiLimiter } = require('../middleware/rateLimiter');
const resumeController = require('../controllers/resumeController');

const router = express.Router();
router.use(protect);

router.post('/upload', upload.single('resume'), resumeController.uploadResume);
router.get('/', resumeController.listResumes);
router.get('/:id', resumeController.getResume);
router.delete('/:id', resumeController.deleteResume);
router.patch('/:id/rename', resumeController.renameResume);
router.patch('/:id/activate', resumeController.setActiveResume);
router.post('/:id/duplicate', resumeController.duplicateResume);
router.post('/:id/analyze', aiLimiter, resumeController.analyzeResume);
router.post('/:id/improve', aiLimiter, resumeController.improveResume);
router.post('/bullet/improve', aiLimiter, resumeController.improveBullet);

module.exports = router;
