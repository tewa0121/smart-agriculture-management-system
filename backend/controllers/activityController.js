const activityModel = require("../models/activityModel");
const cropModel = require("../models/cropModel");
const fieldModel = require("../models/fieldModel");


// Get all farm activities
const getActivities = async (req, res) => {
  try {
    const activities =
      await activityModel.getActivitiesByUserId(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error(
      "Get farm activities error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve farm activities",
    });
  }
};


// Get one farm activity
const getActivity = async (req, res) => {
  try {
    const activityId = Number(req.params.id);

    if (
      !Number.isInteger(activityId) ||
      activityId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity ID",
      });
    }

    const activity =
      await activityModel.getActivityById(
        activityId,
        req.user.id
      );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Farm activity not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error(
      "Get farm activity error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve farm activity",
    });
  }
};


// Create farm activity
const createActivity = async (req, res) => {
  try {
    const {
      cropId = null,
      fieldId = null,
      activityType,
      activityDate,
      description = null,
      laborCost = 0,
    } = req.body;


    // Activity type and date are required
    if (
      !activityType ||
      !activityDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Activity type and activity date are required",
      });
    }


    // At least a crop or field must be provided
    if (!cropId && !fieldId) {
      return res.status(400).json({
        success: false,
        message:
          "Either crop or field is required",
      });
    }


    // Validate crop ownership
    if (cropId) {
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
    }


    // Validate field ownership
    if (fieldId) {
      const field =
        await fieldModel.getFieldById(
          Number(fieldId),
          req.user.id
        );

      if (!field) {
        return res.status(404).json({
          success: false,
          message: "Field not found",
        });
      }
    }


    const activityId =
      await activityModel.createActivity({
        cropId: cropId
          ? Number(cropId)
          : null,

        fieldId: fieldId
          ? Number(fieldId)
          : null,

        activityType:
          activityType.trim(),

        activityDate,

        description,

        laborCost,
      });


    const activity =
      await activityModel.getActivityById(
        activityId,
        req.user.id
      );


    return res.status(201).json({
      success: true,
      message:
        "Farm activity created successfully",
      data: activity,
    });
  } catch (error) {
    console.error(
      "Create farm activity error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create farm activity",
    });
  }
};


// Update farm activity
const updateActivity = async (req, res) => {
  try {
    const activityId = Number(req.params.id);

    if (
      !Number.isInteger(activityId) ||
      activityId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity ID",
      });
    }


    // Confirm the activity belongs to the farmer
    const existingActivity =
      await activityModel.getActivityById(
        activityId,
        req.user.id
      );

    if (!existingActivity) {
      return res.status(404).json({
        success: false,
        message: "Farm activity not found",
      });
    }


    const {
      cropId = null,
      fieldId = null,
      activityType,
      activityDate,
      description = null,
      laborCost = 0,
    } = req.body;


    if (
      !activityType ||
      !activityDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Activity type and activity date are required",
      });
    }


    if (!cropId && !fieldId) {
      return res.status(400).json({
        success: false,
        message:
          "Either crop or field is required",
      });
    }


    // Validate crop ownership
    if (cropId) {
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
    }


    // Validate field ownership
    if (fieldId) {
      const field =
        await fieldModel.getFieldById(
          Number(fieldId),
          req.user.id
        );

      if (!field) {
        return res.status(404).json({
          success: false,
          message: "Field not found",
        });
      }
    }


    const affectedRows =
      await activityModel.updateActivity({
        activityId,
        userId: req.user.id,

        cropId: cropId
          ? Number(cropId)
          : null,

        fieldId: fieldId
          ? Number(fieldId)
          : null,

        activityType:
          activityType.trim(),

        activityDate,

        description,

        laborCost,
      });


    if (affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes were made",
      });
    }


    const updatedActivity =
      await activityModel.getActivityById(
        activityId,
        req.user.id
      );


    return res.status(200).json({
      success: true,
      message:
        "Farm activity updated successfully",
      data: updatedActivity,
    });
  } catch (error) {
    console.error(
      "Update farm activity error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update farm activity",
    });
  }
};


// Delete farm activity
const deleteActivity = async (req, res) => {
  try {
    const activityId = Number(req.params.id);

    if (
      !Number.isInteger(activityId) ||
      activityId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity ID",
      });
    }


    const existingActivity =
      await activityModel.getActivityById(
        activityId,
        req.user.id
      );

    if (!existingActivity) {
      return res.status(404).json({
        success: false,
        message: "Farm activity not found",
      });
    }


    await activityModel.deleteActivity(
      activityId,
      req.user.id
    );


    return res.status(200).json({
      success: true,
      message:
        "Farm activity deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete farm activity error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete farm activity",
    });
  }
};


module.exports = {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
};