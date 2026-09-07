const express = require('express');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/jobSearchUpload');
const controller = require('../controllers/jobSearchController');

const router = express.Router();
router.use(protect);
router.post('/profile', aiLimiter, upload.single('resume'), controller.profile);
router.post('/search', aiLimiter, controller.search);
router.post('/save', controller.save);

module.exports = router;
