const express = require("express");
const router = express.Router();

const {
  getFarmPerformance,
} = require("../controllers/farmPerformanceController");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  getFarmPerformance
);

module.exports = router;