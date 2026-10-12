const express = require("express");

const {
  getCropTypes,
  getCropType,
  createCropType,
  updateCropType,
  deleteCropType,
} = require("../controllers/cropTypeController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// View all crop types
router.get(
  "/",
  authenticate,
  getCropTypes
);

// View one crop type
router.get(
  "/:id",
  authenticate,
  getCropType
);

// Create crop type - admin only
router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  createCropType
);

// Update crop type - admin only
router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  updateCropType
);

// Delete crop type - admin only
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  deleteCropType
);

module.exports = router;