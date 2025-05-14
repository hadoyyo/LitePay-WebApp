const mongoose = require('mongoose');

const TimelineEventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'expense_added',
      'expense_modified',
      'expense_deleted',
      'group_created',
      'group_joined',
      'group_modified',
      'group_left',
      'group_deleted',
      'invitation_received'
    ],
    required: true
  },
  relatedUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  relatedGroup: {
    type: mongoose.Schema.ObjectId,
    ref: 'Group'
  },
  relatedExpense: {
    type: mongoose.Schema.ObjectId,
    ref: 'Expense'
  },
  message: {
    type: String,
    required: true
  },
  messageFor: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

TimelineEventSchema.index({ user: 1 });
TimelineEventSchema.index({ relatedGroup: 1 });
TimelineEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('TimelineEvent', TimelineEventSchema);