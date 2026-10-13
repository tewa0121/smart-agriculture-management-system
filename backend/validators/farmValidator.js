
const { body } = require("express-validator");

const farmValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Farm name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Farm name must be between 2 and 150 characters"),

  body("location")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Location must not exceed 255 characters"),

  body("size")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Farm size must be a non-negative number"),

  body("sizeUnit")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 30 })
    .withMessage("Size unit must not exceed 30 characters"),

  body("description")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
];

module.exports = farmValidator;

