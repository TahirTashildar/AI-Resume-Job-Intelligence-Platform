const express = require('express');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const interviewController = require('../controllers/interviewController');

const router = express.Router();
router.use(protect);

router.post('/generate', aiLimiter, interviewController.generateInterviewPrep);

module.exports = router;
