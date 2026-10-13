
const { body } = require("express-validator");

const fieldValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Field name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Field name must be between 2 and 150 characters"),

  body("area")
    .notEmpty()
    .withMessage("Field area is required")
    .isFloat({ min: 0 })
    .withMessage("Field area must be a non-negative number"),

  body("areaUnit")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 30 })
    .withMessage("Area unit must not exceed 30 characters"),

  body("soilType")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Soil type must not exceed 100 characters"),

  body("description")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
];

module.exports = fieldValidator;

