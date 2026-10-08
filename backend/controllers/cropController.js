
const cropModel = require("../models/cropModel");
const fieldModel = require("../models/fieldModel");
const cropTypeModel = require("../models/cropTypeModel");
const { getCropStatus } = require("../services/cropStatusService");


// Calculate expected harvest date safely without timezone shifting
const calculateExpectedHarvestDate = (
  plantingDate,
  growthDurationDays
) => {
  const parts = plantingDate.split("-");

  if (parts.length !== 3) {
    throw new Error("Invalid planting date");
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid planting date");
  }

  date.setUTCDate(
    date.getUTCDate() + Number(growthDurationDays)
  );

  return date.toISOString().split("T")[0];
};


// Get all crops for the logged-in farmer
const getCrops = async (req, res) => {
  try {
    const crops = await cropModel.getCropsByUserId(
      req.user.id
    );

    // Calculate the current status dynamically
    const updatedCrops = crops.map((crop) => ({
      ...crop,
      status: getCropStatus({
        plantingDate: crop.planting_date,
        expectedHarvestDate: crop.expected_harvest_date,
        actualHarvestDate: crop.actual_harvest_date,
      }),
    }));

    return res.status(200).json({
      success: true,
      data: updatedCrops,
    });
  } catch (error) {
    console.error("Get crops error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get crops",
    });
  }
};


// Get one crop
const getCrop = async (req, res) => {
  try {
    const cropId = Number(req.params.id);

    if (!Number.isInteger(cropId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop ID",
      });
    }

    const crop = await cropModel.getCropById(
      cropId,
      req.user.id
    );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    // Calculate the current status dynamically
    const currentStatus = getCropStatus({
      plantingDate: crop.planting_date,
      expectedHarvestDate: crop.expected_harvest_date,
      actualHarvestDate: crop.actual_harvest_date,
    });

    crop.status = currentStatus;

    return res.status(200).json({
      success: true,
      data: crop,
    });
  } catch (error) {
    console.error("Get crop error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get crop",
    });
  }
};


// Create crop
const createCrop = async (req, res) => {
  try {
    const {
      fieldId,
      cropTypeId,
      name,
      plantingDate,
      notes = null,
    } = req.body;

    const numericFieldId = Number(fieldId);
    const numericCropTypeId = Number(cropTypeId);

    if (!Number.isInteger(numericFieldId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid field ID",
      });
    }

    if (!Number.isInteger(numericCropTypeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop type ID",
      });
    }

    // Verify field ownership
    const field = await fieldModel.verifyFieldOwnership(
      numericFieldId,
      req.user.id
    );

    if (!field) {
      return res.status(404).json({
        success: false,
        message:
          "Field not found or you do not have access to it",
      });
    }

    // Get crop type and growth duration
    const cropType =
      await cropTypeModel.getCropTypeById(
        numericCropTypeId
      );

    if (!cropType) {
      return res.status(404).json({
        success: false,
        message: "Crop type not found",
      });
    }

    // Validate planting date
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(plantingDate)) {
      return res.status(400).json({
        success: false,
        message:
          "Planting date must use YYYY-MM-DD format",
      });
    }

    // Calculate expected harvest date automatically
    const calculatedExpectedHarvestDate =
      calculateExpectedHarvestDate(
        plantingDate,
        cropType.growth_duration_days
      );

    // Calculate crop status automatically
    const calculatedStatus = getCropStatus({
      plantingDate,
      expectedHarvestDate:
        calculatedExpectedHarvestDate,
      actualHarvestDate: null,
    });

    const cropId = await cropModel.createCrop({
      fieldId: numericFieldId,
      cropTypeId: numericCropTypeId,
      name,
      plantingDate,
      expectedHarvestDate:
        calculatedExpectedHarvestDate,
      status: calculatedStatus,
      notes,
    });

    const crop = await cropModel.getCropById(
      cropId,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Crop created successfully",
      data: crop,
    });
  } catch (error) {
    console.error("Create crop error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create crop",
    });
  }
};


// Update crop
const updateCrop = async (req, res) => {
  try {
    const cropId = Number(req.params.id);

    if (!Number.isInteger(cropId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop ID",
      });
    }

    const existingCrop =
      await cropModel.getCropById(
        cropId,
        req.user.id
      );

    if (!existingCrop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    const {
      fieldId,
      cropTypeId,
      name,
      plantingDate,
      actualHarvestDate = null,
      notes = null,
    } = req.body;

    const numericFieldId = Number(fieldId);
    const numericCropTypeId = Number(cropTypeId);

    if (!Number.isInteger(numericFieldId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid field ID",
      });
    }

    if (!Number.isInteger(numericCropTypeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop type ID",
      });
    }

    // Verify new field ownership
    const field =
      await fieldModel.verifyFieldOwnership(
        numericFieldId,
        req.user.id
      );

    if (!field) {
      return res.status(404).json({
        success: false,
        message:
          "Field not found or you do not have access to it",
      });
    }

    // Get crop type
    const cropType =
      await cropTypeModel.getCropTypeById(
        numericCropTypeId
      );

    if (!cropType) {
      return res.status(404).json({
        success: false,
        message: "Crop type not found",
      });
    }

    // Validate planting date
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(plantingDate)) {
      return res.status(400).json({
        success: false,
        message:
          "Planting date must use YYYY-MM-DD format",
      });
    }

    // Recalculate expected harvest date
    const calculatedExpectedHarvestDate =
      calculateExpectedHarvestDate(
        plantingDate,
        cropType.growth_duration_days
      );

    // Recalculate crop status
    const calculatedStatus = getCropStatus({
      plantingDate,
      expectedHarvestDate:
        calculatedExpectedHarvestDate,
      actualHarvestDate,
    });

    await cropModel.updateCrop({
      cropId,
      userId: req.user.id,
      fieldId: numericFieldId,
      cropTypeId: numericCropTypeId,
      name,
      plantingDate,
      expectedHarvestDate:
        calculatedExpectedHarvestDate,
      actualHarvestDate,
      status: calculatedStatus,
      notes,
    });

    const updatedCrop =
      await cropModel.getCropById(
        cropId,
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message: "Crop updated successfully",
      data: updatedCrop,
    });
  } catch (error) {
    console.error("Update crop error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update crop",
    });
  }
};


// Delete crop
const deleteCrop = async (req, res) => {
  try {
    const cropId = Number(req.params.id);

    if (!Number.isInteger(cropId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop ID",
      });
    }

    const existingCrop =
      await cropModel.getCropById(
        cropId,
        req.user.id
      );

    if (!existingCrop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    await cropModel.deleteCrop(
      cropId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Crop deleted successfully",
    });
  } catch (error) {
    console.error("Delete crop error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete crop",
    });
  }
};


module.exports = {
  getCrops,
  getCrop,
  createCrop,
  updateCrop,
  deleteCrop,
};
