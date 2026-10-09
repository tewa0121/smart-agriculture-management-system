const fertilizerModel = require("../models/fertilizerModel");
const cropModel = require("../models/cropModel");
const fertilizerService = require("../services/fertilizerService");


// Get all fertilizer types
const getFertilizerTypes = async (req, res) => {
  try {
    const types = await fertilizerModel.getFertilizerTypes();

    return res.status(200).json({
      success: true,
      data: types,
    });
  } catch (error) {
    console.error(
      "Get fertilizer types error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get fertilizer types",
    });
  }
};


// Get all fertilizer records
const getFertilizerRecords = async (req, res) => {
  try {
    const records =
      await fertilizerModel.getFertilizerRecordsByUserId(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error(
      "Get fertilizer records error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get fertilizer records",
    });
  }
};


// Get one fertilizer record
const getFertilizerRecord = async (req, res) => {
  try {
    const fertilizerId = Number(req.params.id);

    if (!Number.isInteger(fertilizerId) || fertilizerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid fertilizer record ID",
      });
    }

    const record =
      await fertilizerModel.getFertilizerRecordById(
        fertilizerId,
        req.user.id
      );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Fertilizer record not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error(
      "Get fertilizer record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get fertilizer record",
    });
  }
};


// Create fertilizer record
const createFertilizerRecord = async (req, res) => {
  try {
    const {
      cropId,
      fertilizerTypeId = null,
      applicationDate,
      quantity = null,
      quantityUnit = "kg",
      cost = 0,
      intervalDays = null,
      notes = null,
    } = req.body;

    if (!cropId || !applicationDate) {
      return res.status(400).json({
        success: false,
        message: "Crop and application date are required",
      });
    }

    const crop = await cropModel.getCropById(
      Number(cropId),
      req.user.id
    );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    const fertilizerId =
      await fertilizerModel.createFertilizerRecord({
        cropId: Number(cropId),
        fertilizerTypeId:
          fertilizerTypeId
            ? Number(fertilizerTypeId)
            : null,
        applicationDate,
        quantity,
        quantityUnit,
        cost,
        intervalDays,
        notes,
      });

    const record =
      await fertilizerModel.getFertilizerRecordById(
        fertilizerId,
        req.user.id
      );

    return res.status(201).json({
      success: true,
      message: "Fertilizer record created successfully",
      data: record,
    });
  } catch (error) {
    console.error(
      "Create fertilizer record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create fertilizer record",
    });
  }
};


// Update fertilizer record
const updateFertilizerRecord = async (req, res) => {
  try {
    const fertilizerId = Number(req.params.id);

    if (!Number.isInteger(fertilizerId) || fertilizerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid fertilizer record ID",
      });
    }

    const existingRecord =
      await fertilizerModel.getFertilizerRecordById(
        fertilizerId,
        req.user.id
      );

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: "Fertilizer record not found",
      });
    }

    const {
      cropId,
      fertilizerTypeId = null,
      applicationDate,
      quantity = null,
      quantityUnit = "kg",
      cost = 0,
      intervalDays = null,
      notes = null,
    } = req.body;

    if (!cropId || !applicationDate) {
      return res.status(400).json({
        success: false,
        message: "Crop and application date are required",
      });
    }

    const crop = await cropModel.getCropById(
      Number(cropId),
      req.user.id
    );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    const affectedRows =
      await fertilizerModel.updateFertilizerRecord({
        fertilizerId,
        userId: req.user.id,
        cropId: Number(cropId),
        fertilizerTypeId:
          fertilizerTypeId
            ? Number(fertilizerTypeId)
            : null,
        applicationDate,
        quantity,
        quantityUnit,
        cost,
        intervalDays,
        notes,
      });

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Fertilizer record not found",
      });
    }

    const updatedRecord =
      await fertilizerModel.getFertilizerRecordById(
        fertilizerId,
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message: "Fertilizer record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error(
      "Update fertilizer record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update fertilizer record",
    });
  }
};


// Delete fertilizer record
const deleteFertilizerRecord = async (req, res) => {
  try {
    const fertilizerId = Number(req.params.id);

    if (!Number.isInteger(fertilizerId) || fertilizerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid fertilizer record ID",
      });
    }

    const existingRecord =
      await fertilizerModel.getFertilizerRecordById(
        fertilizerId,
        req.user.id
      );

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: "Fertilizer record not found",
      });
    }

    const affectedRows =
      await fertilizerModel.deleteFertilizerRecord(
        fertilizerId,
        req.user.id
      );

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Fertilizer record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fertilizer record deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete fertilizer record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete fertilizer record",
    });
  }
};


// Get fertilizer reminders
const getFertilizerReminders = async (req, res) => {
  try {
    const reminders =
      await fertilizerService.getFertilizerReminders(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: reminders,
    });
  } catch (error) {
    console.error(
      "Get fertilizer reminders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get fertilizer reminders",
    });
  }
};


module.exports = {
  getFertilizerTypes,
  getFertilizerRecords,
  getFertilizerRecord,
  createFertilizerRecord,
  updateFertilizerRecord,
  deleteFertilizerRecord,
  getFertilizerReminders,
};