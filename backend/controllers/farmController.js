const farmModel = require("../models/farmModel");

// Get farms belonging to the logged-in farmer
const getFarms = async (req, res) => {
  try {
    const farms = await farmModel.getFarmsByUserId(req.user.id);

    return res.status(200).json({
      success: true,
      data: farms,
    });
  } catch (error) {
    console.error("Get farms error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get farms",
    });
  }
};

// Get all farms across all farmers for admin monitoring
const getAllFarms = async (req, res) => {
  try {
    const farms = await farmModel.getAllFarms();

    // Calculate dashboard totals from the farm records.
    const totalFarms = farms.length;

    const totalCropRecords = farms.reduce(
      (total, farm) => total + Number(farm.crop_count || 0),
      0
    );

    const totalFarmArea = farms.reduce(
      (total, farm) => total + Number(farm.total_area || 0),
      0
    );

    return res.status(200).json({
      success: true,
      data: farms,
      summary: {
        totalFarms,
        totalCropRecords,
        totalFarmArea,
      },
    });
  } catch (error) {
    console.error("Get all farms error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve all farms",
    });
  }
};

// Get one farm belonging to the logged-in farmer
const getFarm = async (req, res) => {
  try {
    const farmId = Number(req.params.id);

    if (!Number.isInteger(farmId) || farmId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const farm = await farmModel.getFarmById(
      farmId,
      req.user.id
    );

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: farm,
    });
  } catch (error) {
    console.error("Get farm error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get farm",
    });
  }
};

// Create a farm for the logged-in farmer
const createFarm = async (req, res) => {
  try {
    const {
      name,
      location,
      totalArea,
      areaUnit = "hectare",
      description = null,
    } = req.body;

    const farmId = await farmModel.createFarm({
      userId: req.user.id,
      name,
      location,
      totalArea,
      areaUnit,
      description,
    });

    const farm = await farmModel.getFarmById(
      farmId,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Farm created successfully",
      data: farm,
    });
  } catch (error) {
    console.error("Create farm error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create farm",
    });
  }
};

// Update a farm belonging to the logged-in farmer
const updateFarm = async (req, res) => {
  try {
    const farmId = Number(req.params.id);

    if (!Number.isInteger(farmId) || farmId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const existingFarm = await farmModel.getFarmById(
      farmId,
      req.user.id
    );

    if (!existingFarm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    const {
      name,
      location,
      totalArea,
      areaUnit = "hectare",
      description = null,
    } = req.body;

    await farmModel.updateFarm({
      farmId,
      userId: req.user.id,
      name,
      location,
      totalArea,
      areaUnit,
      description,
    });

    const updatedFarm = await farmModel.getFarmById(
      farmId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Farm updated successfully",
      data: updatedFarm,
    });
  } catch (error) {
    console.error("Update farm error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update farm",
    });
  }
};

// Delete a farm belonging to the logged-in farmer
const deleteFarm = async (req, res) => {
  try {
    const farmId = Number(req.params.id);

    if (!Number.isInteger(farmId) || farmId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const existingFarm = await farmModel.getFarmById(
      farmId,
      req.user.id
    );

    if (!existingFarm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    await farmModel.deleteFarm(farmId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Farm deleted successfully",
    });
  } catch (error) {
    console.error("Delete farm error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete farm",
    });
  }
};

module.exports = {
  getFarms,
  getAllFarms,
  getFarm,
  createFarm,
  updateFarm,
  deleteFarm,
};