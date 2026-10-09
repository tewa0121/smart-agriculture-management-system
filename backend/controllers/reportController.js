
const reportService = require("../services/reportService");

/**
 * Get filters from the request query string.
 *
 * Supported:
 * ?farmId=1
 * ?fieldId=2
 * ?cropId=3
 * ?startDate=2026-01-01
 * ?endDate=2026-12-31
 */
const getFilters = (req) => {
  return {
    farmId: req.query.farmId || null,
    fieldId: req.query.fieldId || null,
    cropId: req.query.cropId || null,
    startDate: req.query.startDate || null,
    endDate: req.query.endDate || null,
  };
};

const getCropProductionReport = async (req, res) => {
  try {
    const filters = getFilters(req);

    const data = await reportService.getCropProductionReport(
      req.user.id,
      filters
    );

    res.json({
      success: true,
      report: "crop-production",
      filters,
      data,
    });
  } catch (error) {
    console.error("Crop production report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate crop production report",
      error: error.message,
    });
  }
};

const getHarvestReport = async (req, res) => {
  try {
    const filters = getFilters(req);

    const data = await reportService.getHarvestReport(
      req.user.id,
      filters
    );

    res.json({
      success: true,
      report: "harvest",
      filters,
      data,
    });
  } catch (error) {
    console.error("Harvest report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate harvest report",
      error: error.message,
    });
  }
};

const getExpenseReport = async (req, res) => {
  try {
    const filters = getFilters(req);

    const data = await reportService.getExpenseReport(
      req.user.id,
      filters
    );

    res.json({
      success: true,
      report: "expense",
      filters,
      data,
    });
  } catch (error) {
    console.error("Expense report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate expense report",
      error: error.message,
    });
  }
};

const getRevenueReport = async (req, res) => {
  try {
    const filters = getFilters(req);

    const data = await reportService.getRevenueReport(
      req.user.id,
      filters
    );

    res.json({
      success: true,
      report: "revenue",
      filters,
      data,
    });
  } catch (error) {
    console.error("Revenue report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate revenue report",
      error: error.message,
    });
  }
};

const getProfitReport = async (req, res) => {
  try {
    const filters = getFilters(req);

    const data = await reportService.getProfitReport(
      req.user.id,
      filters
    );

    res.json({
      success: true,
      report: "profit",
      filters,
      data,
    });
  } catch (error) {
    console.error("Profit report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate profit report",
      error: error.message,
    });
  }
};

const getIrrigationReport = async (req, res) => {
  try {
    const filters = getFilters(req);

    const data = await reportService.getIrrigationReport(
      req.user.id,
      filters
    );

    res.json({
      success: true,
      report: "irrigation",
      filters,
      data,
    });
  } catch (error) {
    console.error("Irrigation report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate irrigation report",
      error: error.message,
    });
  }
};

const getFertilizerReport = async (req, res) => {
  try {
    const filters = getFilters(req);

    const data = await reportService.getFertilizerReport(
      req.user.id,
      filters
    );

    res.json({
      success: true,
      report: "fertilizer",
      filters,
      data,
    });
  } catch (error) {
    console.error("Fertilizer report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate fertilizer report",
      error: error.message,
    });
  }
};

const getActivityReport = async (req, res) => {
  try {
    const filters = getFilters(req);

    const data = await reportService.getActivityReport(
      req.user.id,
      filters
    );

    res.json({
      success: true,
      report: "activity",
      filters,
      data,
    });
  } catch (error) {
    console.error("Activity report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate activity report",
      error: error.message,
    });
  }
};

module.exports = {
  getCropProductionReport,
  getHarvestReport,
  getExpenseReport,
  getRevenueReport,
  getProfitReport,
  getIrrigationReport,
  getFertilizerReport,
  getActivityReport,
};

