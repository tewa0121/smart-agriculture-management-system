const cropModel = require("../models/cropModel");
const fieldModel = require("../models/fieldModel");
const cropTypeModel = require("../models/cropTypeModel");
const { getCropStatus } = require("../services/cropStatusService");


// Calculate expected harvest date without timezone shifting
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

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("Invalid planting date");
  }

  date.setUTCDate(
    date.getUTCDate() + Number(growthDurationDays)
  );

  return date.toISOString().split("T")[0];
};


// Get all crops belonging to the logged-in farmer
const getCrops = async (req, res) => {
  try {
    const crops = await cropModel.getCropsByUserId(
      req.user.id
    );

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


// Get all crops for administrator monitoring
const getAllCrops = async (req, res) => {
  try {
    const crops = await cropModel.getAllCrops();

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
      total: updatedCrops.length,
    });
  } catch (error) {
    console.error("Get all crops error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get all crops",
    });
  }
};


// Get one crop belonging to the logged-in farmer
const getCrop = async (req, res) => {
  try {
    const cropId = Number(req.params.id);

    if (!Number.isInteger(cropId) || cropId <= 0) {
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

    crop.status = getCropStatus({
      plantingDate: crop.planting_date,
      expectedHarvestDate: crop.expected_harvest_date,
      actualHarvestDate: crop.actual_harvest_date,
    });

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


// Create a crop
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

    if (!Number.isInteger(numericFieldId) || numericFieldId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid field ID",
      });
    }

    if (!Number.isInteger(numericCropTypeId) || numericCropTypeId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop type ID",
      });
    }

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Crop name is required",
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
        message: "Field not found or you do not have access to it",
      });
    }

    const cropType = await cropTypeModel.getCropTypeById(
      numericCropTypeId
    );

    if (!cropType) {
      return res.status(404).json({
        success: false,
        message: "Crop type not found",
      });
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (
      typeof plantingDate !== "string" ||
      !datePattern.test(plantingDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Planting date must use YYYY-MM-DD format",
      });
    }

    const calculatedExpectedHarvestDate =
      calculateExpectedHarvestDate(
        plantingDate,
        cropType.growth_duration_days
      );

    const calculatedStatus = getCropStatus({
      plantingDate,
      expectedHarvestDate: calculatedExpectedHarvestDate,
      actualHarvestDate: null,
    });

    const cropId = await cropModel.createCrop({
      fieldId: numericFieldId,
      cropTypeId: numericCropTypeId,
      name: String(name).trim(),
      plantingDate,
      expectedHarvestDate: calculatedExpectedHarvestDate,
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


// Update a crop
const updateCrop = async (req, res) => {
  try {
    const cropId = Number(req.params.id);

    if (!Number.isInteger(cropId) || cropId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop ID",
      });
    }

    const existingCrop = await cropModel.getCropById(
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

    if (!Number.isInteger(numericFieldId) || numericFieldId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid field ID",
      });
    }

    if (!Number.isInteger(numericCropTypeId) || numericCropTypeId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop type ID",
      });
    }

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Crop name is required",
      });
    }

    const field = await fieldModel.verifyFieldOwnership(
      numericFieldId,
      req.user.id
    );

    if (!field) {
      return res.status(404).json({
        success: false,
        message: "Field not found or you do not have access to it",
      });
    }

    const cropType = await cropTypeModel.getCropTypeById(
      numericCropTypeId
    );

    if (!cropType) {
      return res.status(404).json({
        success: false,
        message: "Crop type not found",
      });
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (
      typeof plantingDate !== "string" ||
      !datePattern.test(plantingDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Planting date must use YYYY-MM-DD format",
      });
    }

    const calculatedExpectedHarvestDate =
      calculateExpectedHarvestDate(
        plantingDate,
        cropType.growth_duration_days
      );

    const calculatedStatus = getCropStatus({
      plantingDate,
      expectedHarvestDate: calculatedExpectedHarvestDate,
      actualHarvestDate,
    });

    await cropModel.updateCrop({
      cropId,
      userId: req.user.id,
      fieldId: numericFieldId,
      cropTypeId: numericCropTypeId,
      name: String(name).trim(),
      plantingDate,
      expectedHarvestDate: calculatedExpectedHarvestDate,
      actualHarvestDate,
      status: calculatedStatus,
      notes,
    });

    const updatedCrop = await cropModel.getCropById(
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


// Delete a crop
const deleteCrop = async (req, res) => {
  try {
    const cropId = Number(req.params.id);

    if (!Number.isInteger(cropId) || cropId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop ID",
      });
    }

    const existingCrop = await cropModel.getCropById(
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
  getAllCrops,
  getCrop,
  createCrop,
  updateCrop,
  deleteCrop,
};