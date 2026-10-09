
const harvestModel = require("../models/harvestModel");
const cropModel = require("../models/cropModel");
const harvestService = require("../services/harvestService");
const cropStatusService = require("../services/cropStatusService");

const getHarvests = async (req, res) => {
  try {
    const harvests =
      await harvestModel.getHarvestsByUserId(req.user.id);

    return res.status(200).json({
      success: true,
      data: harvests,
    });
  } catch (error) {
    console.error("Get harvests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve harvests",
    });
  }
};

const getHarvest = async (req, res) => {
  try {
    const harvestId = Number(req.params.id);

    if (!Number.isInteger(harvestId) || harvestId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid harvest ID",
      });
    }

    const harvest =
      await harvestModel.getHarvestById(
        harvestId,
        req.user.id
      );

    if (!harvest) {
      return res.status(404).json({
        success: false,
        message: "Harvest record not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: harvest,
    });
  } catch (error) {
    console.error("Get harvest error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve harvest",
    });
  }
};

const createHarvest = async (req, res) => {
  try {
    const {
      cropId,
      harvestDate,
      quantity,
      quantityUnit = "kg",
      pricePerUnit = 0,
      quality = null,
      notes = null,
    } = req.body;

    if (
      !cropId ||
      !harvestDate ||
      quantity === undefined ||
      quantity === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Crop, harvest date, and quantity are required",
      });
    }

    const numericQuantity = Number(quantity);
    const numericPrice = Number(pricePerUnit);

    if (
      !Number.isFinite(numericQuantity) ||
      numericQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price per unit must be zero or greater",
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

    const totalRevenue =
      numericQuantity * numericPrice;

    const harvestId =
      await harvestModel.createHarvest({
        cropId: Number(cropId),
        harvestDate,
        quantity: numericQuantity,
        quantityUnit,
        pricePerUnit: numericPrice,
        totalRevenue,
        quality,
        notes,
      });

    await harvestService.synchronizeHarvestWithCrop({
      cropId: Number(cropId),
      harvestDate,
    });

    const harvest =
      await harvestModel.getHarvestById(
        harvestId,
        req.user.id
      );

    return res.status(201).json({
      success: true,
      message: "Harvest record created successfully",
      data: harvest,
    });
  } catch (error) {
    console.error("Create harvest error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create harvest record",
    });
  }
};

const updateHarvest = async (req, res) => {
  try {
    const harvestId = Number(req.params.id);

    if (!Number.isInteger(harvestId) || harvestId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid harvest ID",
      });
    }

    const existingHarvest =
      await harvestModel.getHarvestById(
        harvestId,
        req.user.id
      );

    if (!existingHarvest) {
      return res.status(404).json({
        success: false,
        message: "Harvest record not found",
      });
    }

    const {
      cropId,
      harvestDate,
      quantity,
      quantityUnit = "kg",
      pricePerUnit = 0,
      quality = null,
      notes = null,
    } = req.body;

    if (
      !cropId ||
      !harvestDate ||
      quantity === undefined ||
      quantity === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Crop, harvest date, and quantity are required",
      });
    }

    const numericQuantity = Number(quantity);
    const numericPrice = Number(pricePerUnit);

    if (
      !Number.isFinite(numericQuantity) ||
      numericQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price per unit must be zero or greater",
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

    const totalRevenue =
      numericQuantity * numericPrice;

    const affectedRows =
      await harvestModel.updateHarvest({
        harvestId,
        userId: req.user.id,
        cropId: Number(cropId),
        harvestDate,
        quantity: numericQuantity,
        quantityUnit,
        pricePerUnit: numericPrice,
        totalRevenue,
        quality,
        notes,
      });

    if (affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes were made",
      });
    }

    await harvestService.synchronizeHarvestWithCrop({
      cropId: Number(cropId),
      harvestDate,
    });

    const updatedHarvest =
      await harvestModel.getHarvestById(
        harvestId,
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message: "Harvest record updated successfully",
      data: updatedHarvest,
    });
  } catch (error) {
    console.error("Update harvest error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update harvest record",
    });
  }
};

const deleteHarvest = async (req, res) => {
  try {
    const harvestId = Number(req.params.id);

    if (!Number.isInteger(harvestId) || harvestId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid harvest ID",
      });
    }

    const existingHarvest =
      await harvestModel.getHarvestById(
        harvestId,
        req.user.id
      );

    if (!existingHarvest) {
      return res.status(404).json({
        success: false,
        message: "Harvest record not found",
      });
    }

    const crop =
      await cropModel.getCropById(
        Number(existingHarvest.crop_id),
        req.user.id
      );

    const affectedRows =
      await harvestModel.deleteHarvest(
        harvestId,
        req.user.id
      );

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Harvest record could not be deleted",
      });
    }

    if (crop) {
      const recalculatedStatus =
        cropStatusService.getCropStatus({
          plantingDate: crop.planting_date,
          expectedHarvestDate:
            crop.expected_harvest_date,
          actualHarvestDate: null,
        });

      await harvestService.clearCropHarvestStatus(
        Number(existingHarvest.crop_id),
        recalculatedStatus
      );
    }

    return res.status(200).json({
      success: true,
      message: "Harvest record deleted successfully",
    });
  } catch (error) {
    console.error("Delete harvest error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete harvest record",
    });
  }
};

module.exports = {
  getHarvests,
  getHarvest,
  createHarvest,
  updateHarvest,
  deleteHarvest,
};

