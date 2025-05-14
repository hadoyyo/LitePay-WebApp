const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the expense'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide the amount'],
    min: [0, 'Amount cannot be negative']
  },
  paidBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.ObjectId,
    ref: 'Group',
    required: true
  },
  category: {
    type: String,
    enum: ['food', 'transport', 'shopping', 'entertainment', 'bills','accommodation', 'other'],
    default: 'other'
  },
  date: {
    type: Date,
    default: Date.now
  },
  splitType: {
    type: String,
    enum: ['equal', 'unequal', 'percentage'],
    default: 'equal'
  },
  shares: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
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

module.exports = mongoose.model('Expense', ExpenseSchema);