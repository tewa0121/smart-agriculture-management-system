const express = require("express");
const router = express.Router();

const {
  getFarmComparison,
} = require("../controllers/farmComparisonController");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  getFarmComparison
);

module.exports = router;