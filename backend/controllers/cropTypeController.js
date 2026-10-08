const cropTypeModel = require("../models/cropTypeModel");

const getCropTypes = async (req, res) => {
  try {
    const cropTypes = await cropTypeModel.getAllCropTypes();

    return res.status(200).json({
      success: true,
      data: cropTypes,
    });
  } catch (error) {
    console.error("Get crop types error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get crop types",
    });
  }
};

const getCropType = async (req, res) => {
  try {
    const cropTypeId = Number(req.params.id);

    if (!Number.isInteger(cropTypeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop type ID",
      });
    }

    const cropType = await cropTypeModel.getCropTypeById(
      cropTypeId
    );

    if (!cropType) {
      return res.status(404).json({
        success: false,
        message: "Crop type not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: cropType,
    });
  } catch (error) {
    console.error("Get crop type error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get crop type",
    });
  }
};

const createCropType = async (req, res) => {
  try {
    const {
      name,
      description = null,
      growthDurationDays,
    } = req.body;

    const cropTypeId = await cropTypeModel.createCropType({
      name,
      description,
      growthDurationDays,
    });

    const cropType = await cropTypeModel.getCropTypeById(
      cropTypeId
    );

    return res.status(201).json({
      success: true,
      message: "Crop type created successfully",
      data: cropType,
    });
  } catch (error) {
    console.error("Create crop type error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create crop type",
    });
  }
};

const updateCropType = async (req, res) => {
  try {
    const cropTypeId = Number(req.params.id);

    if (!Number.isInteger(cropTypeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop type ID",
      });
    }

    const existingCropType =
      await cropTypeModel.getCropTypeById(cropTypeId);

    if (!existingCropType) {
      return res.status(404).json({
        success: false,
        message: "Crop type not found",
      });
    }

    const {
      name,
      description = null,
      growthDurationDays,
    } = req.body;

    await cropTypeModel.updateCropType({
      cropTypeId,
      name,
      description,
      growthDurationDays,
    });

    const updatedCropType =
      await cropTypeModel.getCropTypeById(cropTypeId);

    return res.status(200).json({
      success: true,
      message: "Crop type updated successfully",
      data: updatedCropType,
    });
  } catch (error) {
    console.error("Update crop type error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update crop type",
    });
  }
};

const deleteCropType = async (req, res) => {
  try {
    const cropTypeId = Number(req.params.id);

    if (!Number.isInteger(cropTypeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop type ID",
      });
    }

    const existingCropType =
      await cropTypeModel.getCropTypeById(cropTypeId);

    if (!existingCropType) {
      return res.status(404).json({
        success: false,
        message: "Crop type not found",
      });
    }

    await cropTypeModel.deleteCropType(cropTypeId);

    return res.status(200).json({
      success: true,
      message: "Crop type deleted successfully",
    });
  } catch (error) {
    console.error("Delete crop type error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete crop type. It may be used by existing crops.",
    });
  }
};

module.exports = {
  getCropTypes,
  getCropType,
  createCropType,
  updateCropType,
  deleteCropType,
};