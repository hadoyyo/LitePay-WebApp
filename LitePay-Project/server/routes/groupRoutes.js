const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const timelineController = require('../controllers/timelineController');
const expenseController = require('../controllers/expenseController');
const invitationController = require('../controllers/invitationController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, groupController.getGroups);
router.post('/', protect, groupController.createGroup);

router.get('/:id', protect, groupController.getGroup);
router.put('/:id', protect, groupController.updateGroup);
router.delete('/:id', protect, groupController.deleteGroup);

router.post('/:id/invite', protect, groupController.inviteToGroup);

router.get('/:groupId/pending-invitations', protect, groupController.getPendingInvitations);

router.delete('/:groupId/members/:memberId', protect, groupController.removeGroupMember);
router.get('/:groupId/members/:userId/status', protect, groupController.getUserInvitationStatus);

router.post('/:groupId/expenses', protect, expenseController.createExpense);
router.get('/:groupId/expenses', protect, expenseController.getExpenses);
router.get('/:groupId/timeline', protect, timelineController.getGroupTimelineEvents);


module.exports = router;