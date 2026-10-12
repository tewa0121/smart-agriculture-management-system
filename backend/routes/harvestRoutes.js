const express = require("express");

const {
  getHarvests,
  getHarvest,
  createHarvest,
  updateHarvest,
  deleteHarvest,
} = require("../controllers/harvestController");

const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  getHarvests
);

router.get(
  "/:id",
  authenticate,
  getHarvest
);

router.post(
  "/",
  authenticate,
  createHarvest
);

router.put(
  "/:id",
  authenticate,
  updateHarvest
);

router.delete(
  "/:id",
  authenticate,
  deleteHarvest
);

module.exports = router;