const express = require('express');
const router = express.Router();
const { getFinancialSummary } = require('../controllers/financeController');
const { protect } = require('../middlewares/auth');

router.get('/summary', protect, getFinancialSummary);

module.exports = router;