const express = require("express");

const {
  getPesticideRecords,
  getPesticideRecord,
  createPesticideRecord,
  updatePesticideRecord,
  deletePesticideRecord,
} = require("../controllers/pesticideController");

const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all pesticide records
router.get(
  "/",
  authenticate,
  getPesticideRecords
);

// Get one pesticide record
router.get(
  "/:id",
  authenticate,
  getPesticideRecord
);

// Create pesticide record
router.post(
  "/",
  authenticate,
  createPesticideRecord
);

// Update pesticide record
router.put(
  "/:id",
  authenticate,
  updatePesticideRecord
);

// Delete pesticide record
router.delete(
  "/:id",
  authenticate,
  deletePesticideRecord
);

module.exports = router;