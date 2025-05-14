const Expense = require('../models/Expense');
const Group = require('../models/Group');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const TimelineEvent = require('../models/TimelineEvent');

// @desc    Get all expenses for group
// @route   GET /api/groups/:groupId/expenses
// @access  Private
exports.getExpenses = asyncHandler(async (req, res, next) => {
  
  const group = await Group.findOne({
    _id: req.params.groupId,
    members: req.user.id
  });

  if (!group) {
    return next(
      new ErrorResponse(
        `Grupa nie istnieje lub użytkownik nie ma uprawnień dostępu do tej grupy`,
        404
      )
    );
  }

  const expenses = await Expense.find({ group: req.params.groupId })
    .populate('paidBy', 'firstName lastName profileImage')
    .populate('shares.user', 'firstName lastName profileImage');

  res.status(200).json({
    success: true,
    count: expenses.length,
    data: expenses
  });
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id)
    .populate('paidBy', 'firstName lastName profileImage')
    .populate('shares.user', 'firstName lastName profileImage');

  if (!expense) {
    return next(
      new ErrorResponse(`Nie znaleziono wydatku o id: ${req.params.id}`, 404)
    );
  }

  const group = await Group.findOne({
    _id: expense.group,
    members: req.user.id
  });

  if (!group) {
    return next(
      new ErrorResponse(
        `Użytkownik nie ma uprawnień dostępu do tego wydatku`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: expense
  });
});

// @desc    Create new expense
// @route   POST /api/groups/:groupId/expenses
// @access  Private
exports.createExpense = asyncHandler(async (req, res, next) => {
  
  const group = await Group.findOne({
    _id: req.params.groupId,
    members: req.user.id
  }).populate('members', 'firstName lastName');

  if (!group) {
    return next(
      new ErrorResponse(
        `Grupa nie istnieje lub użytkownik nie ma uprawnień do dodawania wydatków w tej grupie`,
        404
      )
    );
  }

  req.body.group = req.params.groupId;
  req.body.createdBy = req.user.id;

  if (!group.members.some(member => member._id.toString() === req.body.paidBy)) {
    return next(
      new ErrorResponse(
        `Użytkownik ${req.body.paidBy} nie jest członkiem tej grupy`,
        400
      )
    );
  }

  for (const share of req.body.shares) {
    if (!group.members.some(member => member._id.toString() === share.user)) {
      return next(
        new ErrorResponse(
          `Użytkownik ${share.user} nie jest członkiem tej grupy`,
          400
        )
      );
    }
  }

  const expense = await Expense.create(req.body);
  const userFullName = `${req.user.firstName} ${req.user.lastName}`;
  
  await TimelineEvent.create({
    user: req.user.id,
    type: 'expense_added',
    relatedGroup: group._id,
    relatedExpense: expense._id,
    relatedUser: req.user.id,
    message: `Dodałeś/aś wydatek "${expense.title}" (${expense.amount.toFixed(2)} zł) do grupy "${group.name}"`,
    messageFor: 'user',
    createdAt: expense.createdAt
  });

  await TimelineEvent.create({
    user: req.user.id,
    type: 'expense_added',
    relatedGroup: group._id,
    relatedExpense: expense._id,
    relatedUser: req.user.id,
    message: `${userFullName} dodał/a wydatek "${expense.title}" (${expense.amount.toFixed(2)} zł) do grupy "${group.name}"`,
    messageFor: 'group',
    createdAt: expense.createdAt
  });

  res.status(201).json({
    success: true,
    data: expense
  });
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = asyncHandler(async (req, res, next) => {
  let expense = await Expense.findById(req.params.id);

  if (!expense) {
    return next(
      new ErrorResponse(`Nie znaleziono wydatku o id: ${req.params.id}`, 404)
    );
  }

  const group = await Group.findOne({
    _id: expense.group,
    members: req.user.id
  }).populate('members', 'firstName lastName');

  if (!group) {
    return next(
      new ErrorResponse(
        `Użytkownik nie ma uprawnień do modyfikacji tego wydatku`,
        401
      )
    );
  }

  expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  const userFullName = `${req.user.firstName} ${req.user.lastName}`;
  
  await TimelineEvent.create({
    user: req.user.id,
    type: 'expense_modified',
    relatedGroup: group._id,
    relatedExpense: expense._id,
    relatedUser: req.user.id,
    message: `Zmodyfikowałeś/aś wydatek "${expense.title}" (${expense.amount.toFixed(2)} zł) w grupie "${group.name}"`,
    messageFor: 'user',
    createdAt: new Date()
  });

  await TimelineEvent.create({
    user: req.user.id,
    type: 'expense_modified',
    relatedGroup: group._id,
    relatedExpense: expense._id,
    relatedUser: req.user.id,
    message: `${userFullName} zmodyfikował/a wydatek "${expense.title}" (${expense.amount.toFixed(2)} zł) w grupie "${group.name}"`,
    messageFor: 'group',
    createdAt: new Date()
  });

  res.status(200).json({
    success: true,
    data: expense
  });
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return next(
      new ErrorResponse(`Nie znaleziono wydatku o id: ${req.params.id}`, 404)
    );
  }

  const group = await Group.findOne({
    _id: expense.group,
    members: req.user.id
  }).populate('members', 'firstName lastName');

  if (!group) {
    return next(
      new ErrorResponse(
        `Użytkownik nie ma uprawnień do usunięcia tego wydatku`,
        401
      )
    );
  }

  const userFullName = `${req.user.firstName} ${req.user.lastName}`;
  
  await TimelineEvent.create({
    user: req.user.id,
    type: 'expense_deleted',
    relatedGroup: group._id,
    relatedExpense: expense._id,
    relatedUser: req.user.id,
    message: `Usunąłeś/-ełaś wydatek "${expense.title}" (${expense.amount.toFixed(2)} zł) z grupy "${group.name}"`,
    messageFor: 'user',
    createdAt: new Date()
  });

  await TimelineEvent.create({
    user: req.user.id,
    type: 'expense_deleted',
    relatedGroup: group._id,
    relatedExpense: expense._id,
    relatedUser: req.user.id,
    message: `${userFullName} usunął/-ęła wydatek "${expense.title}" (${expense.amount.toFixed(2)} zł) z grupy "${group.name}"`,
    messageFor: 'group',
    createdAt: new Date()
  });

  await expense.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});