const express = require("express");

const {
  getFarms,
  getAllFarms,
  getFarm,
  createFarm,
  updateFarm,
  deleteFarm,
} = require("../controllers/farmController");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const farmValidator = require("../validators/farmValidator");
const validate = require("../middleware/validationMiddleware");

const router = express.Router();

// Admin: get all farms across all farmers
// Keep this route before "/:id".
router.get(
  "/admin/all",
  authenticate,
  authorizeRoles("admin"),
  getAllFarms
);

// Farmer: get farms belonging to the logged-in user
router.get(
  "/",
  authenticate,
  authorizeRoles("farmer"),
  getFarms
);

// Farmer: get one of their own farms
router.get(
  "/:id",
  authenticate,
  authorizeRoles("farmer"),
  getFarm
);

// Farmer: create a farm
router.post(
  "/",
  authenticate,
  authorizeRoles("farmer"),
  farmValidator,
  validate,
  createFarm
);

// Farmer: update their own farm
router.put(
  "/:id",
  authenticate,
  authorizeRoles("farmer"),
  farmValidator,
  validate,
  updateFarm
);

// Farmer: delete their own farm
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("farmer"),
  deleteFarm
);

module.exports = router;