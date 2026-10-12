const express = require("express");

const {
  getIrrigationRecords,
  getIrrigationRecord,
  getIrrigationMethods,
  createIrrigationRecord,
  updateIrrigationRecord,
  deleteIrrigationRecord,
  getIrrigationReminders,
} = require("../controllers/irrigationController");

const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all irrigation records
router.get(
  "/",
  authenticate,
  getIrrigationRecords
);

// Get irrigation methods
// IMPORTANT: Must come before /:id
router.get(
  "/methods",
  authenticate,
  getIrrigationMethods
);

// Get irrigation reminders
// IMPORTANT: Must come before /:id
router.get(
  "/reminders",
  authenticate,
  getIrrigationReminders
);

// Get one irrigation record
router.get(
  "/:id",
  authenticate,
  getIrrigationRecord
);

// Create irrigation record
router.post(
  "/",
  authenticate,
  createIrrigationRecord
);

// Update irrigation record
router.put(
  "/:id",
  authenticate,
  updateIrrigationRecord
);

// Delete irrigation record
router.delete(
  "/:id",
  authenticate,
  deleteIrrigationRecord
);

module.exports = router;