const farmModel = require("../models/farmModel");

const getFarms = async (req, res) => {
  try {
    console.log("GET FARMS - req.user:", req.user);

    const farms = await farmModel.getFarmsByUserId(
      req.user.id
    );

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

const getFarm = async (req, res) => {
  try {
    const farmId = Number(req.params.id);

    if (!Number.isInteger(farmId)) {
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

const updateFarm = async (req, res) => {
  try {
    const farmId = Number(req.params.id);

    if (!Number.isInteger(farmId)) {
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

const deleteFarm = async (req, res) => {
  try {
    const farmId = Number(req.params.id);

    if (!Number.isInteger(farmId)) {
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

    await farmModel.deleteFarm(
      farmId,
      req.user.id
    );

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
  getFarm,
  createFarm,
  updateFarm,
  deleteFarm,
};