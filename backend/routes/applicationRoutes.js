const express = require("express");
const router = express.Router();

const {
  submitApplication,
  getMyApplications,
  getAllApplications,
  reviewApplication,
} = require("../controllers/applicationController");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Farmer submits a supply application.
router.post(
  "/",
  authenticate,
  authorizeRoles("farmer"),
  submitApplication
);

// Farmer views only their own applications.
router.get(
  "/my",
  authenticate,
  authorizeRoles("farmer"),
  getMyApplications
);

// Admin views all applications.
router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  getAllApplications
);

// Admin approves or rejects applications.
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("admin"),
  reviewApplication
);

module.exports = router;