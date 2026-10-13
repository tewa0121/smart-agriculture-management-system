
const { body } = require("express-validator");

const cropValidator = [
  body("fieldId")
    .notEmpty()
    .withMessage("Field ID is required")
    .isInt({ min: 1 })
    .withMessage("Field ID must be a positive integer"),

  body("cropTypeId")
    .notEmpty()
    .withMessage("Crop type ID is required")
    .isInt({ min: 1 })
    .withMessage("Crop type ID must be a positive integer"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Crop name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Crop name must be between 2 and 150 characters"),

  body("plantingDate")
    .notEmpty()
    .withMessage("Planting date is required")
    .isISO8601()
    .withMessage("Planting date must be a valid date"),

  body("growthDurationDays")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("Growth duration must be a positive number of days"),

  body("expectedHarvestDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Expected harvest date must be a valid date"),

  body("actualHarvestDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Actual harvest date must be a valid date"),

  body("status")
    .optional({ values: "falsy" })
    .isIn([
      "planned",
      "planted",
      "growing",
      "ready_for_harvest",
      "harvested",
    ])
    .withMessage("Invalid crop status"),

  body("notes")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];

module.exports = cropValidator;

