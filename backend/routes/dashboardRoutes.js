const express = require("express");

const {
  getDashboardSummary,
  getMonthlyFinancialsReport,
  getCropProductionReport,
  getUpcomingActivitiesReport,
} = require("../controllers/dashboardController");

const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/summary", getDashboardSummary);

router.get(
  "/monthly-financials",
  getMonthlyFinancialsReport
);

router.get(
  "/crop-production",
  getCropProductionReport
);

router.get(
  "/upcoming-activities",
  getUpcomingActivitiesReport
);

module.exports = router;