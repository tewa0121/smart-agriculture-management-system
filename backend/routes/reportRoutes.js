
const express = require("express");

const { authenticate } = require("../middleware/authMiddleware");
const reportController = require("../controllers/reportController");

const router = express.Router();

// All report endpoints require authentication.
router.use(authenticate);

// Crop production report
router.get(
  "/crop-production",
  reportController.getCropProductionReport
);

// Harvest report
router.get(
  "/harvests",
  reportController.getHarvestReport
);

// Expense report
router.get(
  "/expenses",
  reportController.getExpenseReport
);

// Revenue report
router.get(
  "/revenue",
  reportController.getRevenueReport
);

// Profit report
router.get(
  "/profit",
  reportController.getProfitReport
);

// Irrigation history report
router.get(
  "/irrigation",
  reportController.getIrrigationReport
);

// Fertilizer history report
router.get(
  "/fertilizer",
  reportController.getFertilizerReport
);

// Farm activity history report
router.get(
  "/activities",
  reportController.getActivityReport
);

module.exports = router;

