const TimelineEvent = require('../models/TimelineEvent');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const Group = require('../models/Group');

/// @desc    Get user's timeline events
// @route   GET /api/timeline
// @access  Private
exports.getTimelineEvents = asyncHandler(async (req, res, next) => {

  const userGroups = await Group.find({ members: req.user.id }).select('_id');
  const groupIds = userGroups.map(group => group._id);

  // TimelineEvent musi spełnić przynajmniej jeden z warunków
  const events = await TimelineEvent.find({
    $or: [
      // Warunek 1:
      {
        relatedUser: req.user.id,
        messageFor: 'user',
        user: req.user.id,
        type: { $ne: 'group_left' }
      },
      // Warunek 2:
      {
        relatedUser: { $ne: req.user.id },
        relatedGroup: { $in: groupIds },
        messageFor: 'group',
        user: { $ne: req.user.id },
        type: { $ne: 'group_left' }
      },
      // Warunek 3:
      {
        type: 'group_left',
        user: req.user.id,
        messageFor: 'user'
      },
      // Warunek 4:
      {
        type: 'invitation_received',
        relatedUser: { $ne: req.user.id },
        messageFor: 'user',
        user: req.user.id
      },
      // Warunek 5:
      {
        messageFor: 'user',
        type: 'group_joined',
        user: req.user.id
      },
      // Warunek 6:
      {
        relatedUser: { $ne: req.user.id },
        relatedGroup: { $in: groupIds },
        messageFor: 'group',
        user: { $ne: req.user.id },
        type: { $ne: 'invitation_received' }
      },
    ]
  })
    .sort({ createdAt: -1 })
    .populate('relatedUser', 'firstName lastName profileImage')
    .populate('relatedGroup', 'name color')
    .populate('relatedExpense', 'title amount');

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

// @desc    Get group timeline events
// @route   GET /api/groups/:groupId/timeline
// @access  Private
exports.getGroupTimelineEvents = asyncHandler(async (req, res, next) => {

  const group = await Group.findOne({
    _id: req.params.groupId,
    members: req.user.id
  });

  if (!group) {
    return next(
      new ErrorResponse(`Brak uprawnień do sprawdzenia grupowej osi czasu`, 401)
    );
  }

  const events = await TimelineEvent.find({ 
    relatedGroup: req.params.groupId,
    messageFor: 'group',

    $or: [
      { user: req.user.id },
      { 
        type: { 
          $in: [
            'group_created',
            'group_modified',
            'group_joined', 
            'group_left',
            'expense_added',
            'expense_modified',
            'expense_deleted'
          ] 
        } 
      }
    ]
  })
    .sort({ createdAt: -1 })
    .populate('relatedUser', 'firstName lastName profileImage')
    .populate('relatedGroup', 'name color')
    .populate('relatedExpense', 'title amount');

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});