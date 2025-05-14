const mongoose = require('mongoose');

const InvitationSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.ObjectId,
    ref: 'Group',
    required: true
  },
  invitedUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Invitation', InvitationSchema);