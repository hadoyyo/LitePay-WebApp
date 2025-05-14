const express = require('express');
const router = express.Router();
const { 
  getMe,
  updateUser,
  updatePhoto,
  updatePassword,
  searchUsers
} = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const upload = require('../utils/upload');

router.get('/me', protect, getMe);
router.put('/me', protect, updateUser);
router.put('/me/photo', protect, upload.single('file'), updatePhoto);
router.put('/me/password', protect, updatePassword);
router.get('/search', protect, searchUsers);

module.exports = router;