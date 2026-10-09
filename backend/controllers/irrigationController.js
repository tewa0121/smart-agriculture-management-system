const irrigationModel = require("../models/irrigationModel");
const cropModel = require("../models/cropModel");
const irrigationService = require("../services/irrigationService");


// Validate YYYY-MM-DD date format
const isValidDateFormat = (date) => {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  return (
    typeof date === "string" &&
    datePattern.test(date)
  );
};


// Get all irrigation methods
const getIrrigationMethods = async (req, res) => {
  try {
    const methods =
      await irrigationModel.getIrrigationMethods();

    return res.status(200).json({
      success: true,
      data: methods,
    });
  } catch (error) {
    console.error(
      "Get irrigation methods error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get irrigation methods",
    });
  }
};


// Get all irrigation records
const getIrrigationRecords = async (req, res) => {
  try {
    const records =
      await irrigationModel.getIrrigationRecordsByUserId(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error(
      "Get irrigation records error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get irrigation records",
    });
  }
};


// Get one irrigation record
const getIrrigationRecord = async (req, res) => {
  try {
    const irrigationId = Number(req.params.id);

    if (!Number.isInteger(irrigationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid irrigation record ID",
      });
    }

    const record =
      await irrigationModel.getIrrigationRecordById(
        irrigationId,
        req.user.id
      );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Irrigation record not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error(
      "Get irrigation record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get irrigation record",
    });
  }
};


// Create irrigation record
const createIrrigationRecord = async (req, res) => {
  try {
    const {
      cropId,
      irrigationMethodId,
      irrigationDate,
      quantity,
      quantityUnit = "liters",
      cost = 0,
      intervalDays = null,
      notes = null,
    } = req.body;

    const numericCropId = Number(cropId);
    const numericMethodId = Number(irrigationMethodId);

    // Validate crop ID
    if (!Number.isInteger(numericCropId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop ID",
      });
    }

    // Validate irrigation method ID
    if (!Number.isInteger(numericMethodId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid irrigation method ID",
      });
    }

    // Verify crop ownership
    const crop = await cropModel.getCropById(
      numericCropId,
      req.user.id
    );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message:
          "Crop not found or you do not have access to it",
      });
    }

    // Validate irrigation date
    if (!isValidDateFormat(irrigationDate)) {
      return res.status(400).json({
        success: false,
        message:
          "Irrigation date must use YYYY-MM-DD format",
      });
    }

    // Validate quantity
    if (
      quantity === undefined ||
      quantity === null ||
      quantity === "" ||
      Number.isNaN(Number(quantity)) ||
      Number(quantity) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be a valid non-negative number",
      });
    }

    // Validate quantity unit
    if (
      typeof quantityUnit !== "string" ||
      quantityUnit.trim() === "" ||
      quantityUnit.trim().length > 30
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity unit is required and must not exceed 30 characters",
      });
    }

    // Validate cost
    if (
      cost === undefined ||
      cost === null ||
      Number.isNaN(Number(cost)) ||
      Number(cost) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cost must be a valid non-negative number",
      });
    }

    // Validate interval
    if (
      intervalDays !== null &&
      intervalDays !== "" &&
      (
        Number.isNaN(Number(intervalDays)) ||
        Number(intervalDays) < 0 ||
        !Number.isInteger(Number(intervalDays))
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Interval days must be a non-negative integer",
      });
    }

    const irrigationId =
      await irrigationModel.createIrrigationRecord({
        cropId: numericCropId,
        irrigationMethodId: numericMethodId,
        irrigationDate,
        quantity: Number(quantity),
        quantityUnit: quantityUnit.trim(),
        cost: Number(cost),
        intervalDays:
          intervalDays === "" ||
          intervalDays === null
            ? null
            : Number(intervalDays),
        notes:
          notes === null ||
          notes === undefined ||
          notes === ""
            ? null
            : String(notes).trim(),
      });

    const record =
      await irrigationModel.getIrrigationRecordById(
        irrigationId,
        req.user.id
      );

    return res.status(201).json({
      success: true,
      message:
        "Irrigation record created successfully",
      data: record,
    });
  } catch (error) {
    console.error(
      "Create irrigation record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create irrigation record",
    });
  }
};


// Update irrigation record
const updateIrrigationRecord = async (req, res) => {
  try {
    const irrigationId = Number(req.params.id);

    if (!Number.isInteger(irrigationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid irrigation record ID",
      });
    }

    // Verify existing record ownership
    const existingRecord =
      await irrigationModel.getIrrigationRecordById(
        irrigationId,
        req.user.id
      );

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: "Irrigation record not found",
      });
    }

    const {
      cropId,
      irrigationMethodId,
      irrigationDate,
      quantity,
      quantityUnit = "liters",
      cost = 0,
      intervalDays = null,
      notes = null,
    } = req.body;

    const numericCropId = Number(cropId);
    const numericMethodId = Number(irrigationMethodId);

    // Validate crop ID
    if (!Number.isInteger(numericCropId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop ID",
      });
    }

    // Validate irrigation method ID
    if (!Number.isInteger(numericMethodId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid irrigation method ID",
      });
    }

    // Verify crop ownership
    const crop = await cropModel.getCropById(
      numericCropId,
      req.user.id
    );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message:
          "Crop not found or you do not have access to it",
      });
    }

    // Validate irrigation date
    if (!isValidDateFormat(irrigationDate)) {
      return res.status(400).json({
        success: false,
        message:
          "Irrigation date must use YYYY-MM-DD format",
      });
    }

    // Validate quantity
    if (
      quantity === undefined ||
      quantity === null ||
      quantity === "" ||
      Number.isNaN(Number(quantity)) ||
      Number(quantity) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be a valid non-negative number",
      });
    }

    // Validate quantity unit
    if (
      typeof quantityUnit !== "string" ||
      quantityUnit.trim() === "" ||
      quantityUnit.trim().length > 30
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity unit is required and must not exceed 30 characters",
      });
    }

    // Validate cost
    if (
      cost === undefined ||
      cost === null ||
      Number.isNaN(Number(cost)) ||
      Number(cost) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cost must be a valid non-negative number",
      });
    }

    // Validate interval
    if (
      intervalDays !== null &&
      intervalDays !== "" &&
      (
        Number.isNaN(Number(intervalDays)) ||
        Number(intervalDays) < 0 ||
        !Number.isInteger(Number(intervalDays))
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Interval days must be a non-negative integer",
      });
    }

    await irrigationModel.updateIrrigationRecord({
      irrigationId,
      userId: req.user.id,
      cropId: numericCropId,
      irrigationMethodId: numericMethodId,
      irrigationDate,
      quantity: Number(quantity),
      quantityUnit: quantityUnit.trim(),
      cost: Number(cost),
      intervalDays:
        intervalDays === "" ||
        intervalDays === null
          ? null
          : Number(intervalDays),
      notes:
        notes === null ||
        notes === undefined ||
        notes === ""
          ? null
          : String(notes).trim(),
    });

    const updatedRecord =
      await irrigationModel.getIrrigationRecordById(
        irrigationId,
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message:
        "Irrigation record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error(
      "Update irrigation record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update irrigation record",
    });
  }
};


// Delete irrigation record
const deleteIrrigationRecord = async (req, res) => {
  try {
    const irrigationId = Number(req.params.id);

    if (!Number.isInteger(irrigationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid irrigation record ID",
      });
    }

    const existingRecord =
      await irrigationModel.getIrrigationRecordById(
        irrigationId,
        req.user.id
      );

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: "Irrigation record not found",
      });
    }

    await irrigationModel.deleteIrrigationRecord(
      irrigationId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Irrigation record deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete irrigation record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete irrigation record",
    });
  }
};


// Get irrigation reminders
const getIrrigationReminders = async (req, res) => {
  try {
    const reminders =
      await irrigationService.getIrrigationReminders(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: reminders,
    });
  } catch (error) {
    console.error(
      "Get irrigation reminders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get irrigation reminders",
    });
  }
};


module.exports = {
  getIrrigationMethods,
  getIrrigationRecords,
  getIrrigationRecord,
  createIrrigationRecord,
  updateIrrigationRecord,
  deleteIrrigationRecord,
  getIrrigationReminders,
};