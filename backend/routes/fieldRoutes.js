
const express = require("express");

const {
  createField,
  getFieldsByFarm,
  getField,
  updateField,
  deleteField,
} = require("../controllers/fieldController");

const { authenticate } = require("../middleware/authMiddleware");
const fieldValidator = require("../validators/fieldValidator");
const validate = require("../middleware/validationMiddleware");

const router = express.Router();

// Get all fields belonging to a farm
router.get(
  "/farm/:farmId",
  authenticate,
  getFieldsByFarm
);

// Create a field inside a farm
router.post(
  "/farm/:farmId",
  authenticate,
  fieldValidator,
  validate,
  createField
);

// Get one field
router.get(
  "/:id",
  authenticate,
  getField
);

// Update a field
router.put(
  "/:id",
  authenticate,
  fieldValidator,
  validate,
  updateField
);

// Delete a field
router.delete(
  "/:id",
  authenticate,
  deleteField
);

module.exports = router;

