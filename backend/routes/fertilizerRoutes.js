const express = require("express");

const {
  getFertilizerTypes,
  getFertilizerRecords,
  getFertilizerRecord,
  createFertilizerRecord,
  updateFertilizerRecord,
  deleteFertilizerRecord,
  getFertilizerReminders,
} = require("../controllers/fertilizerController");

const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();


// Get all fertilizer records
router.get(
  "/",
  authenticate,
  getFertilizerRecords
);


// Get fertilizer types
// IMPORTANT: This must come before /:id
router.get(
  "/types",
  authenticate,
  getFertilizerTypes
);


// Get fertilizer reminders
// IMPORTANT: This must come before /:id
router.get(
  "/reminders",
  authenticate,
  getFertilizerReminders
);


// Get one fertilizer record
router.get(
  "/:id",
  authenticate,
  getFertilizerRecord
);


// Create fertilizer record
router.post(
  "/",
  authenticate,
  createFertilizerRecord
);


// Update fertilizer record
router.put(
  "/:id",
  authenticate,
  updateFertilizerRecord
);


// Delete fertilizer record
router.delete(
  "/:id",
  authenticate,
  deleteFertilizerRecord
);


module.exports = router;