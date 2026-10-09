
const fieldModel = require("../models/fieldModel");

const createField = async (req, res) => {
  try {
    const farmId = Number(req.params.farmId);

    if (!Number.isInteger(farmId) || farmId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const {
      name,
      area,
      areaUnit = "hectare",
      soilType = null,
      description = null,
    } = req.body;

    const fieldId = await fieldModel.createField({
      farmId,
      name,
      area,
      areaUnit,
      soilType,
      description,
    });

    const field = await fieldModel.getFieldById(
      fieldId,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Field created successfully",
      data: field,
    });
  } catch (error) {
    console.error("Create field error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create field",
    });
  }
};

const getAllFields = async (req, res) => {
  try {
    const fields = await fieldModel.getAllFieldsByUserId(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: fields,
    });
  } catch (error) {
    console.error("Get all fields error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get fields",
    });
  }
};

const getFieldsByFarm = async (req, res) => {
  try {
    const farmId = Number(req.params.farmId);

    if (!Number.isInteger(farmId) || farmId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const fields = await fieldModel.getFieldsByFarmId(
      farmId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: fields,
    });
  } catch (error) {
    console.error("Get fields by farm error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get fields",
    });
  }
};

const getField = async (req, res) => {
  try {
    const fieldId = Number(req.params.id);

    if (!Number.isInteger(fieldId) || fieldId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid field ID",
      });
    }

    const field = await fieldModel.getFieldById(
      fieldId,
      req.user.id
    );

    if (!field) {
      return res.status(404).json({
        success: false,
        message: "Field not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: field,
    });
  } catch (error) {
    console.error("Get field error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get field",
    });
  }
};

const updateField = async (req, res) => {
  try {
    const fieldId = Number(req.params.id);

    if (!Number.isInteger(fieldId) || fieldId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid field ID",
      });
    }

    const existingField = await fieldModel.getFieldById(
      fieldId,
      req.user.id
    );

    if (!existingField) {
      return res.status(404).json({
        success: false,
        message: "Field not found",
      });
    }

    const {
      name,
      area,
      areaUnit = "hectare",
      soilType = null,
      description = null,
    } = req.body;

    await fieldModel.updateField({
      fieldId,
      userId: req.user.id,
      name,
      area,
      areaUnit,
      soilType,
      description,
    });

    const updatedField = await fieldModel.getFieldById(
      fieldId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Field updated successfully",
      data: updatedField,
    });
  } catch (error) {
    console.error("Update field error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update field",
    });
  }
};

const deleteField = async (req, res) => {
  try {
    const fieldId = Number(req.params.id);

    if (!Number.isInteger(fieldId) || fieldId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid field ID",
      });
    }

    const existingField = await fieldModel.getFieldById(
      fieldId,
      req.user.id
    );

    if (!existingField) {
      return res.status(404).json({
        success: false,
        message: "Field not found",
      });
    }

    await fieldModel.deleteField(fieldId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Field deleted successfully",
    });
  } catch (error) {
    console.error("Delete field error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete field",
    });
  }
};

module.exports = {
  createField,
  getAllFields,
  getFieldsByFarm,
  getField,
  updateField,
  deleteField,
};