const Group = require('../models/Group');
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Expense = require('../models/Expense');
const TimelineEvent = require('../models/TimelineEvent');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.getGroups = asyncHandler(async (req, res, next) => {
  const groups = await Group.find({ members: req.user.id })
    .populate('members', 'firstName lastName profileImage')
    .populate('createdBy', 'firstName lastName');

  res.status(200).json({ success: true, count: groups.length, data: groups });
});

exports.getGroup = asyncHandler(async (req, res, next) => {
  const group = await Group.findOne({
    _id: req.params.id,
    members: req.user.id
  }).populate('members', 'firstName lastName profileImage')
    .populate('createdBy', 'firstName lastName');

  if (!group) {
    return next(new ErrorResponse(`Nie znaleziono grupy o id: ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: group });
});

exports.createGroup = asyncHandler(async (req, res, next) => {
  req.body.members = [req.user.id];
  req.body.createdBy = req.user.id;

  const group = await Group.create(req.body);

  const userFullName = `${req.user.firstName} ${req.user.lastName}`;
  
  await TimelineEvent.create({
    user: req.user.id,
    type: 'group_created',
    relatedGroup: group._id,
    relatedUser: req.user.id,
    message: `Utworzyłeś/aś nową grupę "${group.name}"`,
    messageFor: 'user',
    createdAt: group.createdAt
  });

  await TimelineEvent.create({
    user: req.user.id,
    type: 'group_created',
    relatedGroup: group._id,
    relatedUser: req.user.id,
    message: `${userFullName} utworzył/a nową grupę "${group.name}"`,
    messageFor: 'group',
    createdAt: group.createdAt
  });

  res.status(201).json({ success: true, data: group });
});

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private
exports.updateGroup = asyncHandler(async (req, res, next) => {
  let group = await Group.findById(req.params.id);

  if (!group) {
    return next(
      new ErrorResponse(`Nie znaleziono grupy o id: ${req.params.id}`, 404)
    );
  }

  if (!group.members.includes(req.user.id)) {
    return next(
      new ErrorResponse(
        `Użytkownik ${req.user.id} nie ma uprawnień do modyfikacji tej grupy`,
        401
      )
    );
  }

  const oldGroupName = group.name;
  const changes = {};

  if (req.body.name && req.body.name !== group.name) {
    changes.name = req.body.name;
  }
  if (req.body.color && req.body.color !== group.color) {
    changes.color = req.body.color;
  }

  if (Object.keys(changes).length === 0) {
    return res.status(200).json({
      success: true,
      data: group
    });
  }

  group = await Group.findByIdAndUpdate(req.params.id, changes, {
    new: true,
    runValidators: true
  });

  const userFullName = `${req.user.firstName} ${req.user.lastName}`;

  if (changes.name) {

    await TimelineEvent.create({
      user: req.user.id,
      type: 'group_modified',
      relatedGroup: group._id,
      relatedUser: req.user.id,
      message: `Zmieniłeś/aś nazwę grupy z "${oldGroupName}" na "${group.name}"`,
      messageFor: 'user',
      createdAt: new Date()
    });

    await TimelineEvent.create({
      user: req.user.id,
      type: 'group_modified',
      relatedGroup: group._id,
      relatedUser: req.user.id,
      message: `${userFullName} zmienił/a nazwę grupy z "${oldGroupName}" na "${group.name}"`,
      messageFor: 'group',
      createdAt: new Date()
    });
  }

  if (changes.color) {

    await TimelineEvent.create({
      user: req.user.id,
      type: 'group_modified',
      relatedGroup: group._id,
      relatedUser: req.user.id,
      message: `Zmieniłeś/aś kolor grupy "${group.name}"`,
      messageFor: 'user',
      createdAt: new Date()
    });

    await TimelineEvent.create({
      user: req.user.id,
      type: 'group_modified',
      relatedGroup: group._id,
      relatedUser: req.user.id,
      message: `${userFullName} zmienił/a kolor grupy "${group.name}"`,
      messageFor: 'group',
      createdAt: new Date()
    });
  }

  res.status(200).json({
    success: true,
    data: group
  });
});

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
exports.deleteGroup = asyncHandler(async (req, res, next) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return next(
      new ErrorResponse(`Nie znaleziono grupy o id: ${req.params.id}`, 404)
    );
  }

  if (group.createdBy.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `Użytkownik ${req.user.id} nie ma uprawnień do usunięcia tej grupy`,
        401
      )
    );
  }

  const userFullName = `${req.user.firstName} ${req.user.lastName}`;

  await TimelineEvent.create({
    user: req.user.id,
    type: 'group_deleted',
    relatedGroup: group._id,
    relatedUser: req.user.id,
    message: `Usunąłeś/-ełaś grupę "${group.name}"`,
    messageFor: 'user',
    createdAt: new Date()
  });

  const members = await User.find({ _id: { $in: group.members } });
  await Promise.all(members.map(async (member) => {
    if (member._id.toString() !== req.user.id) {
      await TimelineEvent.create({
        user: member._id,
        type: 'group_deleted',
        relatedGroup: group._id,
        relatedUser: req.user.id,
        message: `${userFullName} usunął/-ęła grupę "${group.name}"`,
        messageFor: 'user',
        createdAt: new Date()
      });
    }
  }));


  await Expense.deleteMany({ group: group._id });

  await Invitation.deleteMany({ group: group._id });

  await group.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});


// @desc    Invite user to group
// @route   POST /api/groups/:id/invite
// @access  Private
exports.inviteToGroup = asyncHandler(async (req, res, next) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    return next(new ErrorResponse('Nie znaleziono grupy', 404));
  }

  if (!group.members.includes(req.user.id)) {
    return next(new ErrorResponse('Brak uprawnień do zapraszania', 401));
  }

  const invitedUser = await User.findById(req.body.userId);
  if (!invitedUser) {
    return next(new ErrorResponse('Nie znaleziono użytkownika', 404));
  }

  if (group.members.includes(req.body.userId)) {
    return next(new ErrorResponse('Użytkownik jest już członkiem grupy', 400));
  }

  const existingInvitation = await Invitation.findOne({
    group: req.params.id,
    invitedUser: req.body.userId,
    status: 'pending'
  });

  if (existingInvitation) {
    return next(new ErrorResponse('Użytkownik ma już oczekujące zaproszenie', 400));
  }

  const invitation = await Invitation.create({
    group: req.params.id,
    invitedUser: req.body.userId,
    invitedBy: req.user.id
  });

  const inviterName = `${req.user.firstName} ${req.user.lastName}`;
  const groupName = group.name;

  await TimelineEvent.create({
    user: req.user.id,
    type: 'invitation_received',
    relatedUser: req.body.userId,
    relatedGroup: group._id,
    message: `Zaprosiłeś/aś ${invitedUser.firstName} ${invitedUser.lastName} do grupy "${groupName}"`,
    messageFor: 'user',
    createdAt: new Date()
  });

  await TimelineEvent.create({
    user: req.body.userId,
    type: 'invitation_received',
    relatedUser: req.user.id,
    relatedGroup: group._id,
    message: `Otrzymałeś/aś zaproszenie do grupy "${groupName}" od ${inviterName}`,
    messageFor: 'user',
    createdAt: new Date()
  });

  await TimelineEvent.create({
    user: req.user.id,
    type: 'invitation_received',
    relatedUser: req.body.userId,
    relatedGroup: group._id,
    message: `${inviterName} zaprosił/a ${invitedUser.firstName} ${invitedUser.lastName} do grupy "${groupName}"`,
    messageFor: 'group',
    createdAt: new Date()
  });

  res.status(201).json({
    success: true,
    data: invitation
  });
});


// @desc    Remove member from group or leave group
// @route   DELETE /api/groups/:groupId/members/:memberId
// @access  Private
exports.removeGroupMember = asyncHandler(async (req, res, next) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) {
    return next(new ErrorResponse(`Nie znaleziono grupy o id: ${req.params.groupId}`, 404));
  }

  if (!group.members.includes(req.params.memberId)) {
    return next(new ErrorResponse(`Użytkownik ${req.params.memberId} nie jest członkiem grupy`, 400));
  }

  const isCreator = group.createdBy.toString() === req.user.id;
  const isSelf = req.params.memberId === req.user.id;

  if (!isCreator && !isSelf) {
    return next(new ErrorResponse(`Nie masz uprawnień do wykonania tej czynności`, 401));
  }

  const relatedExpenses = await Expense.find({
    group: req.params.groupId,
    $or: [
      { paidBy: req.params.memberId },
      { 'shares.user': req.params.memberId }
    ]
  });

  group.members = group.members.filter(memberId => memberId.toString() !== req.params.memberId);
  await group.save();

  const removedUser = await User.findById(req.params.memberId);
  const removingUser = await User.findById(req.user.id);
  const removedUserName = removedUser ? `${removedUser.firstName} ${removedUser.lastName}` : 'Nieznany Użytkownik';
  const removingUserName = removingUser ? `${removingUser.firstName} ${removingUser.lastName}` : 'Założyciel Grupy';

  if (isSelf) {

    await TimelineEvent.create({
      user: req.params.memberId,
      type: 'group_left',
      relatedGroup: group._id,
      relatedUser: req.user.id,
      message: `Opuściłeś/aś grupę "${group.name}"`,
      messageFor: 'user',
      createdAt: new Date()
    });


    await TimelineEvent.create({
      user: req.user.id,
      type: 'group_left',
      relatedGroup: group._id,
      relatedUser: req.params.memberId,
      message: `${removedUserName} opuścił/a grupę "${group.name}"`,
      messageFor: 'group',
      createdAt: new Date()
    });
  } else {

    await TimelineEvent.create({
      user: req.params.memberId,
      type: 'group_left',
      relatedGroup: group._id,
      relatedUser: req.user.id,
      message: `Zostałeś/-aś usunięty/-a z grupy "${group.name}" przez ${removingUserName}`,
      messageFor: 'user',
      createdAt: new Date()
    });

    await TimelineEvent.create({
      user: req.user.id,
      type: 'group_left',
      relatedGroup: group._id,
      relatedUser: req.params.memberId,
      message: `${removingUserName} usunął/-ęła ${removedUserName} z grupy "${group.name}"`,
      messageFor: 'group',
      createdAt: new Date()
    });

    await TimelineEvent.create({
      user: req.user.id,
      type: 'group_left',
      relatedGroup: group._id,
      relatedUser: req.params.memberId,
      message: `Usunąłeś/-ęłaś ${removedUserName} z grupy "${group.name}"`,
      messageFor: 'user',
      createdAt: new Date()
    });
  }

  await Promise.all(relatedExpenses.map(expense => 
    TimelineEvent.create({
      user: req.user.id,
      type: 'expense_deleted',
      relatedGroup: group._id,
      relatedExpense: expense._id,
      relatedUser: req.user.id,
      message: `${isSelf ? removedUserName : removingUserName} usunął/-ęła wydatek "${expense.title}" (${expense.amount.toFixed(2)} zł) z grupy "${group.name}"`,
      messageFor: 'group',
      createdAt: new Date()
    })
  ));

  await Promise.all(relatedExpenses.map(expense => 
    TimelineEvent.create({
      user: req.user.id,
      type: 'expense_deleted',
      relatedGroup: group._id,
      relatedExpense: expense._id,
      relatedUser: req.user.id,
      message: `Usunąłeś/-ęłaś wydatek "${expense.title}" (${expense.amount.toFixed(2)} zł) z grupy "${group.name}"`,
      messageFor: 'user',
      createdAt: new Date()
    })
  ));

  await Expense.deleteMany({
    _id: { $in: relatedExpenses.map(e => e._id) }
  });

  res.status(200).json({ success: true, data: group });
});

// @desc    Get expenses for group filtered by user
// @route   GET /api/groups/:groupId/expenses?userId=:userId
// @access  Private
exports.getGroupExpensesForUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.query;
  
  if (!userId) {
    return next(new ErrorResponse('ID użytkownika jest wymagane', 400));
  }

  const group = await Group.findById(req.params.groupId);
  if (!group) {
    return next(new ErrorResponse(`Nie znaleziono grupy o id: ${req.params.groupId}`, 404));
  }

  if (!group.members.includes(req.user.id)) {
    return next(new ErrorResponse(`Użytkownik ${req.user.id} nie ma dostępu do tej grupy`, 401));
  }

  const expenses = await Expense.find({
    group: req.params.groupId,
    $or: [
      { paidBy: userId },
      { 'shares.user': userId }
    ]
  });

  res.status(200).json({ success: true, count: expenses.length, data: expenses });
});

// @desc    Get pending invitations for group
// @route   GET /api/groups/:groupId/pending-invitations
// @access  Private
exports.getPendingInvitations = asyncHandler(async (req, res, next) => {
  const group = await Group.findById(req.params.groupId);
  
  if (!group) {
    return next(new ErrorResponse(`Nie znaleziono grupy o id: ${req.params.groupId}`, 404));
  }

  if (!group.members.includes(req.user.id)) {
    return next(new ErrorResponse(`Użytkownik ${req.user.id} nie ma uprawnień do sprawdzenia zaproszeń do grupy`, 401));
  }

  const invitations = await Invitation.find({
    group: req.params.groupId,
    status: 'pending'
  }).populate('invitedUser', 'firstName lastName');

  res.status(200).json({
    success: true,
    count: invitations.length,
    data: invitations
  });
});

exports.getUserInvitationStatus = asyncHandler(async (req, res, next) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) {
    return next(new ErrorResponse('Nie znaleziono grupy', 404));
  }

  const isMember = group.members.includes(req.params.userId);
  const hasPendingInvitation = await Invitation.exists({
    group: req.params.groupId,
    invitedUser: req.params.userId,
    status: 'pending'
  });

  res.status(200).json({
    success: true,
    data: {
      isMember,
      hasPendingInvitation
    }
  });
});