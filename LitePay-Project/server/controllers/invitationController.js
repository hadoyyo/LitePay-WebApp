const Invitation = require('../models/Invitation');
const Group = require('../models/Group');
const User = require('../models/User');
const TimelineEvent = require('../models/TimelineEvent');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user invitations
// @route   GET /api/invitations
// @access  Private
exports.getUserInvitations = asyncHandler(async (req, res, next) => {
  const invitations = await Invitation.find({
    invitedUser: req.user.id,
    status: 'pending'
  })
    .populate('group', 'name color')
    .populate('invitedBy', 'firstName lastName profileImage');

  res.status(200).json({
    success: true,
    count: invitations.length,
    data: invitations
  });
});

// @desc    Respond to invitation
// @route   PUT /api/invitations/:id/respond
// @access  Private
exports.respondToInvitation = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  
  if (!['accepted', 'rejected'].includes(status)) {
    return next(new ErrorResponse('Nieprawidłowy status. Oczekiwany to "accepted" lub "rejected"', 400));
  }

  const invitation = await Invitation.findOneAndDelete({
    _id: req.params.id,
    invitedUser: req.user.id,
    status: 'pending'
  })
    .populate('group')
    .populate('invitedBy');

  if (!invitation) {
    return next(new ErrorResponse('Nie znaleziono zaproszenia', 404));
  }

  const userName = `${req.user.firstName} ${req.user.lastName}`;
  const inviterName = invitation.invitedBy 
    ? `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`
    : 'Nieznany Użytkownik';
  const groupName = invitation.group?.name || 'Nieznana Grupa';

  if (status === 'accepted') {
    
    const group = await Group.findByIdAndUpdate(
      invitation.group._id,
      { $addToSet: { members: req.user.id } },
      { new: true, runValidators: true }
    );

    if (!group) {
      return next(new ErrorResponse('Nie znaleziono grupy', 404));
    }

    await TimelineEvent.create({
      user: req.user.id,
      type: 'group_joined',
      relatedGroup: group._id,
      relatedUser: req.user.id,
      message: `Dołączyłeś/aś do grupy "${groupName}"`,
      messageFor: 'user',
      createdAt: new Date()
    });

    await TimelineEvent.create({
      user: req.user.id,
      type: 'group_joined',
      relatedGroup: group._id,
      relatedUser: req.user.id,
      message: `${userName} dołączył/a do grupy "${groupName}"`,
      messageFor: 'group',
      createdAt: new Date()
    });
  }

  res.status(200).json({
    success: true,
    data: { status }
  });
});

// @desc    Get pending invitations count
// @route   GET /api/invitations/count
// @access  Private
exports.getPendingInvitationsCount = asyncHandler(async (req, res, next) => {
  const count = await Invitation.countDocuments({
    invitedUser: req.user.id,
    status: 'pending'
  });

  res.status(200).json({
    success: true,
    data: { count }
  });
});