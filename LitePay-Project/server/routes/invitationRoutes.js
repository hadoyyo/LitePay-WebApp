const express = require('express');
const router = express.Router();
const {
  getUserInvitations,
  respondToInvitation,
  getPendingInvitationsCount
} = require('../controllers/invitationController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getUserInvitations);
router.put('/:id', protect, respondToInvitation);
router.put('/:id/respond', protect, respondToInvitation);
router.get('/count', protect, getPendingInvitationsCount);

module.exports = router;