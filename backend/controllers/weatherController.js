const weatherModel = require("../models/weatherModel");
const farmModel = require("../models/farmModel");

const getWeatherRecords = async (req, res) => {
  try {
    const records =
      await weatherModel.getWeatherRecordsByUserId(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error(
      "Get weather records error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve weather records",
    });
  }
};

const getWeatherRecord = async (req, res) => {
  try {
    const weatherId = Number(req.params.id);

    if (
      !Number.isInteger(weatherId) ||
      weatherId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid weather record ID",
      });
    }

    const record =
      await weatherModel.getWeatherRecordById(
        weatherId,
        req.user.id
      );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Weather record not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error(
      "Get weather record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve weather record",
    });
  }
};

const createWeatherRecord = async (req, res) => {
  try {
    const {
      farmId,
      recordDate,
      temperature = null,
      humidity = null,
      rainfall = null,
      windSpeed = null,
      weatherCondition = null,
      notes = null,
    } = req.body;

    if (!farmId || !recordDate) {
      return res.status(400).json({
        success: false,
        message:
          "Farm and record date are required",
      });
    }

    const farm =
      await farmModel.getFarmById(
        Number(farmId),
        req.user.id
      );

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    const numericValues = [
      {
        name: "Temperature",
        value: temperature,
      },
      {
        name: "Humidity",
        value: humidity,
      },
      {
        name: "Rainfall",
        value: rainfall,
      },
      {
        name: "Wind speed",
        value: windSpeed,
      },
    ];

    for (const item of numericValues) {
      if (
        item.value !== null &&
        item.value !== undefined &&
        item.value !== "" &&
        !Number.isFinite(Number(item.value))
      ) {
        return res.status(400).json({
          success: false,
          message: `${item.name} must be a valid number`,
        });
      }
    }

    const numericTemperature =
      temperature === null ||
      temperature === ""
        ? null
        : Number(temperature);

    const numericHumidity =
      humidity === null ||
      humidity === ""
        ? null
        : Number(humidity);

    const numericRainfall =
      rainfall === null ||
      rainfall === ""
        ? null
        : Number(rainfall);

    const numericWindSpeed =
      windSpeed === null ||
      windSpeed === ""
        ? null
        : Number(windSpeed);

    if (
      numericHumidity !== null &&
      (numericHumidity < 0 ||
        numericHumidity > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Humidity must be between 0 and 100",
      });
    }

    if (
      numericRainfall !== null &&
      numericRainfall < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Rainfall cannot be negative",
      });
    }

    if (
      numericWindSpeed !== null &&
      numericWindSpeed < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Wind speed cannot be negative",
      });
    }

    const weatherId =
      await weatherModel.createWeatherRecord({
        farmId: Number(farmId),
        recordDate,
        temperature: numericTemperature,
        humidity: numericHumidity,
        rainfall: numericRainfall,
        windSpeed: numericWindSpeed,
        weatherCondition,
        notes,
      });

    const record =
      await weatherModel.getWeatherRecordById(
        weatherId,
        req.user.id
      );

    return res.status(201).json({
      success: true,
      message: "Weather record created successfully",
      data: record,
    });
  } catch (error) {
    console.error(
      "Create weather record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create weather record",
    });
  }
};

const updateWeatherRecord = async (req, res) => {
  try {
    const weatherId = Number(req.params.id);

    if (
      !Number.isInteger(weatherId) ||
      weatherId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid weather record ID",
      });
    }

    const existingRecord =
      await weatherModel.getWeatherRecordById(
        weatherId,
        req.user.id
      );

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: "Weather record not found",
      });
    }

    const {
      farmId,
      recordDate,
      temperature = null,
      humidity = null,
      rainfall = null,
      windSpeed = null,
      weatherCondition = null,
      notes = null,
    } = req.body;

    if (!farmId || !recordDate) {
      return res.status(400).json({
        success: false,
        message:
          "Farm and record date are required",
      });
    }

    const farm =
      await farmModel.getFarmById(
        Number(farmId),
        req.user.id
      );

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    const numericValues = [
      {
        name: "Temperature",
        value: temperature,
      },
      {
        name: "Humidity",
        value: humidity,
      },
      {
        name: "Rainfall",
        value: rainfall,
      },
      {
        name: "Wind speed",
        value: windSpeed,
      },
    ];

    for (const item of numericValues) {
      if (
        item.value !== null &&
        item.value !== undefined &&
        item.value !== "" &&
        !Number.isFinite(Number(item.value))
      ) {
        return res.status(400).json({
          success: false,
          message: `${item.name} must be a valid number`,
        });
      }
    }

    const numericTemperature =
      temperature === null ||
      temperature === ""
        ? null
        : Number(temperature);

    const numericHumidity =
      humidity === null ||
      humidity === ""
        ? null
        : Number(humidity);

    const numericRainfall =
      rainfall === null ||
      rainfall === ""
        ? null
        : Number(rainfall);

    const numericWindSpeed =
      windSpeed === null ||
      windSpeed === ""
        ? null
        : Number(windSpeed);

    if (
      numericHumidity !== null &&
      (numericHumidity < 0 ||
        numericHumidity > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Humidity must be between 0 and 100",
      });
    }

    if (
      numericRainfall !== null &&
      numericRainfall < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Rainfall cannot be negative",
      });
    }

    if (
      numericWindSpeed !== null &&
      numericWindSpeed < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Wind speed cannot be negative",
      });
    }

    const affectedRows =
      await weatherModel.updateWeatherRecord({
        weatherId,
        userId: req.user.id,
        farmId: Number(farmId),
        recordDate,
        temperature: numericTemperature,
        humidity: numericHumidity,
        rainfall: numericRainfall,
        windSpeed: numericWindSpeed,
        weatherCondition,
        notes,
      });

    if (affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes were made",
      });
    }

    const updatedRecord =
      await weatherModel.getWeatherRecordById(
        weatherId,
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message: "Weather record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error(
      "Update weather record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update weather record",
    });
  }
};

const deleteWeatherRecord = async (req, res) => {
  try {
    const weatherId = Number(req.params.id);

    if (
      !Number.isInteger(weatherId) ||
      weatherId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid weather record ID",
      });
    }

    const existingRecord =
      await weatherModel.getWeatherRecordById(
        weatherId,
        req.user.id
      );

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: "Weather record not found",
      });
    }

    await weatherModel.deleteWeatherRecord(
      weatherId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Weather record deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete weather record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete weather record",
    });
  }
};

module.exports = {
  getWeatherRecords,
  getWeatherRecord,
  createWeatherRecord,
  updateWeatherRecord,
  deleteWeatherRecord,
};