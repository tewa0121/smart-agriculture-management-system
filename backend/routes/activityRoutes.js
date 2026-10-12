const express = require("express");

const {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
} = require("../controllers/activityController");

const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();


// Get all farm activities
router.get(
  "/",
  authenticate,
  getActivities
);


// Get one farm activity
router.get(
  "/:id",
  authenticate,
  getActivity
);


// Create farm activity
router.post(
  "/",
  authenticate,
  createActivity
);


// Update farm activity
router.put(
  "/:id",
  authenticate,
  updateActivity
);


// Delete farm activity
router.delete(
  "/:id",
  authenticate,
  deleteActivity
);


module.exports = router;