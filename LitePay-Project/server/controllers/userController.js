const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const path = require('path');
const fs = require('fs');

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password -__v');

  if (!user) {
    return next(new ErrorResponse('Nie znaleziono użytkownika', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user details
// @route   PUT /api/users/me
// @access  Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email } = req.body;

  if (!firstName || !lastName || !email) {
    return next(new ErrorResponse('Proszę podać wszystkie wymagane pola', 400));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { firstName, lastName, email },
    {
      new: true,
      runValidators: true
    }
  ).select('-password -__v');

  if (!updatedUser) {
    return next(new ErrorResponse('Nie znaleziono użytkownika', 404));
  }

  res.status(200).json({
    success: true,
    data: updatedUser
  });
});

// @desc    Update user password
// @route   PUT /api/users/me/password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Proszę podać aktualne i nowe hasło', 400));
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new ErrorResponse('Nie znaleziono użytkownika', 404));
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse('Aktualne hasło jest nieprawidłowe', 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    data: 'Hasło zostało zaktualizowane'
  });
});

// @desc    Update user photo
// @route   PUT /api/users/me/photo
// @access  Private
exports.updatePhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Proszę przesłać plik', 400));
  }

  const imagePath = `/uploads/${req.file.filename}`;
  
  await User.findByIdAndUpdate(req.user.id, { profileImage: imagePath });

  res.status(200).json({
    success: true,
    data: imagePath
  });
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return next(new ErrorResponse('Proszę wprowadzić frazę do wyszukania', 400));
  }

  const users = await User.find({
    $or: [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { username: { $regex: q, $options: 'i' } }
    ],
    _id: { $ne: req.user.id }
  }).select('firstName lastName username profileImage');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});