const express = require("express");

const {
  getCrops,
  getAllCrops,
  getCrop,
  createCrop,
  updateCrop,
  deleteCrop,
} = require("../controllers/cropController");

const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin monitoring endpoint.
// IMPORTANT: Add role-based admin authorization here if your
// authenticate middleware does not already enforce admin access.
router.get("/admin/all", authenticate, getAllCrops);

// Farmer crop endpoints
router.get("/", authenticate, getCrops);
router.get("/:id", authenticate, getCrop);
router.post("/", authenticate, createCrop);
router.put("/:id", authenticate, updateCrop);
router.delete("/:id", authenticate, deleteCrop);

module.exports = router;