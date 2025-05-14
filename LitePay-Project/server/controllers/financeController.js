const Expense = require('../models/Expense');
const Group = require('../models/Group');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get financial summary for user
// @route   GET /api/finances/summary
// @access  Private
exports.getFinancialSummary = asyncHandler(async (req, res, next) => {
  
  const groups = await Group.find({ members: req.user.id });
  
  const allExpenses = await Expense.find({ 
    group: { $in: groups.map(g => g._id) }
  })
  .populate('paidBy', 'firstName lastName profileImage')
  .populate('group', 'name color')
  .populate('shares.user', 'firstName lastName profileImage');

  let totalExpenses = 0;
  const userBalances = {};
  const expensesByPeriod = {
    daily: [],
    monthly: [],
    yearly: []
  };

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    expensesByPeriod.daily.push({
      label: `${day}`,
      amount: 0
    });
  }

  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    expensesByPeriod.monthly.unshift({
      label: date.toLocaleString('pl-PL', { month: 'short', year: 'numeric' }),
      amount: 0
    });
  }

  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    expensesByPeriod.yearly.unshift({
      label: year.toString(),
      amount: 0
    });
  }

  allExpenses.forEach(expense => {
    const paidBy = expense.paidBy._id.toString();
    const amount = expense.amount;
    const expenseDate = new Date(expense.date);
    const expenseMonth = expenseDate.getMonth();
    const expenseYear = expenseDate.getFullYear();
    const expenseDay = expenseDate.getDate();

    expense.shares.forEach(share => {
      const shareUserId = share.user._id.toString();
      if (shareUserId === req.user.id) {
        totalExpenses += share.amount;
      }
    });

    expense.shares.forEach(share => {
      const shareUserId = share.user._id.toString();
      const shareAmount = share.amount;
      
      if (shareUserId !== paidBy) {

        if (!userBalances[paidBy]) userBalances[paidBy] = 0;
        if (!userBalances[shareUserId]) userBalances[shareUserId] = 0;


        if (shareUserId === req.user.id) {
          userBalances[paidBy] -= shareAmount;
        }
        
        if (paidBy === req.user.id) {
          userBalances[shareUserId] += shareAmount;
        }
      }
    });

    if (paidBy === req.user.id || expense.shares.some(s => s.user._id.toString() === req.user.id)) {

      if (expenseYear === currentYear && expenseMonth === currentMonth) {
        const dayIndex = expenseDay - 1;
        if (dayIndex >= 0 && dayIndex < expensesByPeriod.daily.length) {
          expensesByPeriod.daily[dayIndex].amount += amount;
        }
      }

      const monthDiff = (currentYear - expenseYear) * 12 + (currentMonth - expenseMonth);
      if (monthDiff >= 0 && monthDiff < expensesByPeriod.monthly.length) {
        expensesByPeriod.monthly[expensesByPeriod.monthly.length - 1 - monthDiff].amount += amount;
      }

      const yearDiff = currentYear - expenseYear;
      if (yearDiff >= 0 && yearDiff < expensesByPeriod.yearly.length) {
        expensesByPeriod.yearly[expensesByPeriod.yearly.length - 1 - yearDiff].amount += amount;
      }
    }
  });

  let totalOwedToYou = 0;
  let totalYouOwe = 0;
  const debts = [];
  const owedToYou = [];

  Object.entries(userBalances).forEach(([userId, balance]) => {
    if (userId === req.user.id) return;

    let user = null;
    for (const expense of allExpenses) {
      if (expense.paidBy._id.toString() === userId) {
        user = expense.paidBy;
        break;
      }
      const shareUser = expense.shares.find(s => s.user._id.toString() === userId);
      if (shareUser) {
        user = shareUser.user;
        break;
      }
    }

    if (!user) return;

    if (balance > 0) {
      totalOwedToYou += balance;
      owedToYou.push({
        user: user,
        amount: balance
      });
    } else if (balance < 0) {
      totalYouOwe += Math.abs(balance);
      debts.push({
        user: user,
        amount: Math.abs(balance)
      });
    }
  });

  debts.sort((a, b) => b.amount - a.amount);
  owedToYou.sort((a, b) => b.amount - a.amount);

  res.status(200).json({
    success: true,
    data: {
      totalExpenses,
      totalOwedToYou,
      totalYouOwe,
      netBalance: totalOwedToYou - totalYouOwe,
      expensesByPeriod,
      debts,
      owedToYou,
      recentExpenses: allExpenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    }
  });
});