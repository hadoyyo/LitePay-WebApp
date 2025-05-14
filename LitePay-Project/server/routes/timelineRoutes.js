const express = require('express');
const router = express.Router();
const {
  getTimelineEvents,
  getGroupTimelineEvents
} = require('../controllers/timelineController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getTimelineEvents);

module.exports = router;