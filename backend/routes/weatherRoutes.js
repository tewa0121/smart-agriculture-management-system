const express = require("express");

const {
  getWeatherRecords,
  getWeatherRecord,
  createWeatherRecord,
  updateWeatherRecord,
  deleteWeatherRecord,
} = require("../controllers/weatherController");

const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  getWeatherRecords
);

router.get(
  "/:id",
  authenticate,
  getWeatherRecord
);

router.post(
  "/",
  authenticate,
  createWeatherRecord
);

router.put(
  "/:id",
  authenticate,
  updateWeatherRecord
);

router.delete(
  "/:id",
  authenticate,
  deleteWeatherRecord
);

module.exports = router;