const express = require('express');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const matchingController = require('../controllers/matchingController');

const router = express.Router();
router.use(protect);

router.post('/analyze', aiLimiter, matchingController.analyzeMatch);
router.get('/', matchingController.listMyMatches);
router.post('/skill-gap', aiLimiter, matchingController.skillGap);

module.exports = router;
