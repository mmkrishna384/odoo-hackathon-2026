const express = require('express');
const router = express.Router();
const { getExpenses, getExpense, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('financial_analyst'), getExpenses)
  .post(protect, authorize('financial_analyst'), createExpense);
router.route('/:id')
  .get(protect, authorize('financial_analyst'), getExpense)
  .put(protect, authorize('financial_analyst'), updateExpense)
  .delete(protect, authorize('financial_analyst'), deleteExpense);

module.exports = router;
