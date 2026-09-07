const express = require('express');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const jobController = require('../controllers/jobController');

const router = express.Router();
router.use(protect);

router.post('/analyze', aiLimiter, jobController.analyzeJobDescriptionText);
router.post('/', jobController.createJob);
router.get('/', jobController.listJobs);
router.get('/:id', jobController.getJob);
router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);
router.post('/:id/analyze', aiLimiter, jobController.analyzeJob);

module.exports = router;
