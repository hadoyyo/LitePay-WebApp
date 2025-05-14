const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a group name'],
    trim: true,
    maxlength: [50, 'Group name cannot be more than 50 characters']
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  members: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

GroupSchema.index({ name: 1, members: 1 }, { unique: true });

module.exports = mongoose.model('Group', GroupSchema);