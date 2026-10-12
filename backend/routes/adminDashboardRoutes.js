
const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
} = require("../controllers/adminDashboardController");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.get(
  "/stats",
  authenticate,
  authorizeRoles("admin"),
  getDashboardStats
);

module.exports = router;