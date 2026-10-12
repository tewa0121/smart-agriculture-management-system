const express = require("express");

const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();


// Get all expenses
router.get(
  "/",
  authenticate,
  getExpenses
);


// Get one expense
router.get(
  "/:id",
  authenticate,
  getExpense
);


// Create expense
router.post(
  "/",
  authenticate,
  createExpense
);


// Update expense
router.put(
  "/:id",
  authenticate,
  updateExpense
);


// Delete expense
router.delete(
  "/:id",
  authenticate,
  deleteExpense
);


module.exports = router;