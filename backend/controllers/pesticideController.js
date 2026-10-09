const pesticideModel = require("../models/pesticideModel");
const cropModel = require("../models/cropModel");


// Get all pesticide records
const getPesticideRecords = async (req, res) => {
  try {
    const records =
      await pesticideModel.getPesticideRecordsByUserId(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error(
      "Get pesticide records error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve pesticide records",
    });
  }
};


// Get one pesticide record
const getPesticideRecord = async (req, res) => {
  try {
    const pesticideId = Number(req.params.id);

    if (!Number.isInteger(pesticideId) || pesticideId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid pesticide record ID",
      });
    }

    const record =
      await pesticideModel.getPesticideRecordById(
        pesticideId,
        req.user.id
      );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Pesticide record not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error(
      "Get pesticide record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve pesticide record",
    });
  }
};


// Create pesticide record
const createPesticideRecord = async (req, res) => {
  try {
    const {
      cropId,
      productName,
      applicationDate,
      quantity = null,
      quantityUnit = "L",
      cost = 0,
      notes = null,
    } = req.body;

    if (
      !cropId ||
      !productName ||
      !applicationDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Crop, product name, and application date are required",
      });
    }

    const crop =
      await cropModel.getCropById(
        Number(cropId),
        req.user.id
      );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    const pesticideId =
      await pesticideModel.createPesticideRecord({
        cropId: Number(cropId),
        productName: productName.trim(),
        applicationDate,
        quantity,
        quantityUnit,
        cost,
        notes,
      });

    const record =
      await pesticideModel.getPesticideRecordById(
        pesticideId,
        req.user.id
      );

    return res.status(201).json({
      success: true,
      message: "Pesticide record created successfully",
      data: record,
    });
  } catch (error) {
    console.error(
      "Create pesticide record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create pesticide record",
    });
  }
};


// Update pesticide record
const updatePesticideRecord = async (req, res) => {
  try {
    const pesticideId = Number(req.params.id);

    if (!Number.isInteger(pesticideId) || pesticideId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid pesticide record ID",
      });
    }

    const existingRecord =
      await pesticideModel.getPesticideRecordById(
        pesticideId,
        req.user.id
      );

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: "Pesticide record not found",
      });
    }

    const {
      cropId,
      productName,
      applicationDate,
      quantity = null,
      quantityUnit = "L",
      cost = 0,
      notes = null,
    } = req.body;

    if (
      !cropId ||
      !productName ||
      !applicationDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Crop, product name, and application date are required",
      });
    }

    const crop =
      await cropModel.getCropById(
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
      await pesticideModel.updatePesticideRecord({
        pesticideId,
        userId: req.user.id,
        cropId: Number(cropId),
        productName: productName.trim(),
        applicationDate,
        quantity,
        quantityUnit,
        cost,
        notes,
      });

    if (affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes were made",
      });
    }

    const updatedRecord =
      await pesticideModel.getPesticideRecordById(
        pesticideId,
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message: "Pesticide record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error(
      "Update pesticide record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update pesticide record",
    });
  }
};


// Delete pesticide record
const deletePesticideRecord = async (req, res) => {
  try {
    const pesticideId = Number(req.params.id);

    if (!Number.isInteger(pesticideId) || pesticideId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid pesticide record ID",
      });
    }

    const existingRecord =
      await pesticideModel.getPesticideRecordById(
        pesticideId,
        req.user.id
      );

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: "Pesticide record not found",
      });
    }

    await pesticideModel.deletePesticideRecord(
      pesticideId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Pesticide record deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete pesticide record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete pesticide record",
    });
  }
};


module.exports = {
  getPesticideRecords,
  getPesticideRecord,
  createPesticideRecord,
  updatePesticideRecord,
  deletePesticideRecord,
};