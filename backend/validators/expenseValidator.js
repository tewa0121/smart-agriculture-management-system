
const { body } = require("express-validator");

const expenseValidator = [
  body("farmId")
    .notEmpty()
    .withMessage("Farm ID is required")
    .isInt({ min: 1 })
    .withMessage("Farm ID must be a positive integer"),

  body("fieldId")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("Field ID must be a positive integer"),

  body("cropId")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("Crop ID must be a positive integer"),

  body("category")
    .notEmpty()
    .withMessage("Expense category is required")
    .isIn([
      "fertilizer",
      "irrigation",
      "labor",
      "pesticide",
      "seeds",
      "equipment",
      "transport",
      "other",
    ])
    .withMessage("Invalid expense category"),

  body("amount")
    .notEmpty()
    .withMessage("Expense amount is required")
    .isFloat({ min: 0 })
    .withMessage("Expense amount must be a non-negative number"),

  body("expenseDate")
    .notEmpty()
    .withMessage("Expense date is required")
    .isISO8601()
    .withMessage("Expense date must be a valid date"),

  body("description")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
];

module.exports = expenseValidator;

