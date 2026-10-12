const applicationModel = require("../models/applicationModel");

const allowedSupplyTypes = [
  "fertilizer",
  "pesticide",
  "seeds",
  "equipment",
  "other",
];

const submitApplication = async (req, res) => {
  try {
    const {
      supply_type,
      product_name,
      quantity,
      unit,
      crop_name,
      farm_location,
      reason,
    } = req.body;

    if (
      !allowedSupplyTypes.includes(supply_type) ||
      typeof product_name !== "string" ||
      !product_name.trim() ||
      typeof unit !== "string" ||
      !unit.trim() ||
      quantity === undefined ||
      quantity === null ||
      quantity === "" ||
      !Number.isFinite(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid supply type, product, quantity, and unit.",
      });
    }

    // The authenticated user's ID comes from verified JWT middleware.
    const farmerId = req.user.id;

    const applicationId = await applicationModel.createApplication({
      farmerId,
      supplyType: supply_type,
      productName: product_name.trim(),
      quantity: Number(quantity),
      unit: unit.trim(),
      cropName: crop_name?.trim(),
      farmLocation: farm_location?.trim(),
      reason: reason?.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Your application was submitted successfully.",
      data: {
        id: applicationId,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Submit application error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit application.",
    });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications =
      await applicationModel.getFarmerApplications(req.user.id);

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Get farmer applications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your applications.",
    });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const applications =
      await applicationModel.getAllApplications();

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Get all applications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve applications.",
    });
  }
};

const reviewApplication = async (req, res) => {
  try {
    const applicationId = Number(req.params.id);
    const { status, admin_notes } = req.body;

    if (
      !Number.isSafeInteger(applicationId) ||
      applicationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
      });
    }

    if (
      admin_notes !== undefined &&
      (typeof admin_notes !== "string" ||
        admin_notes.length > 2000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Admin notes must be text under 2000 characters.",
      });
    }

    const affectedRows =
      await applicationModel.updateApplicationStatus({
        applicationId,
        status,
        adminNotes: admin_notes,
        adminId: req.user.id,
      });

    if (!affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Application ${status} successfully.`,
    });
  } catch (error) {
    console.error("Review application error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update application status.",
    });
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getAllApplications,
  reviewApplication,
};