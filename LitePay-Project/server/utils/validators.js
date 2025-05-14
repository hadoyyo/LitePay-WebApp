const validateRegisterInput = (username, email, password, confirmPassword) => {
    const errors = {};
    
    if (username.trim() === '') {
      errors.username = 'Username must not be empty';
    }
    
    if (email.trim() === '') {
      errors.email = 'Email must not be empty';
    } else {
      const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
      if (!email.match(regEx)) {
        errors.email = 'Email must be a valid email address';
      }
    }
    
    if (password === '') {
      errors.password = 'Password must not be empty';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords must match';
    }
    
    return {
      errors,
      valid: Object.keys(errors).length < 1
    };
  };
  
  const validateLoginInput = (username, password) => {
    const errors = {};
    
    if (username.trim() === '') {
      errors.username = 'Username must not be empty';
    }
    
    if (password.trim() === '') {
      errors.password = 'Password must not be empty';
    }
    
    return {
      errors,
      valid: Object.keys(errors).length < 1
    };
  };
  
  const validateExpenseInput = (title, amount, paidBy, shares) => {
    const errors = {};
    
    if (title.trim() === '') {
      errors.title = 'Title must not be empty';
    }
    
    if (isNaN(amount) || amount <= 0) {
      errors.amount = 'Amount must be a positive number';
    }
    
    if (!paidBy) {
      errors.paidBy = 'Paid by must be specified';
    }
    
    if (!shares || shares.length === 0) {
      errors.shares = 'At least one share must be specified';
    } else {
      let totalShare = 0;
      shares.forEach(share => {
        if (isNaN(share.amount) || share.amount <= 0) {
          errors.shares = 'All shares must be positive numbers';
        }
        totalShare += share.amount;
      });
      
      if (Math.abs(totalShare - amount) > 0.01) {
        errors.shares = 'Sum of shares must equal the total amount';
      }
    }
    
    return {
      errors,
      valid: Object.keys(errors).length < 1
    };
  };
  
  module.exports = {
    validateRegisterInput,
    validateLoginInput,
    validateExpenseInput
  };