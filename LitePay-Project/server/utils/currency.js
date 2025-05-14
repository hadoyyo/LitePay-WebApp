const formatCurrency = (amount, currency = 'PLN') => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const calculateDebts = (expenses, userId) => {
    const debts = {};
    
    expenses.forEach(expense => {
      const paidBy = expense.paidBy.toString();
      const amount = expense.amount;
      
      expense.shares.forEach(share => {
        const shareUserId = share.user.toString();
        const shareAmount = share.amount;
        
        if (shareUserId !== paidBy) {
          if (shareUserId === userId.toString()) {
            
            debts[paidBy] = (debts[paidBy] || 0) + shareAmount;
          } else if (paidBy === userId.toString()) {
            
            debts[shareUserId] = (debts[shareUserId] || 0) - shareAmount;
          }
        }
      });
    });
    
    return debts;
  };
  
  module.exports = {
    formatCurrency,
    calculateDebts
  };