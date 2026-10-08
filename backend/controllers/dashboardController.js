const dashboardService = require("../services/dashboardService");

const getDashboardSummary = async (req, res) => {
  try {
    const summary =
      await dashboardService.getDashboardSummary(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error(
      "Get dashboard summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard summary",
    });
  }
};

const getMonthlyFinancialsReport = async (req, res) => {
  try {
    const data =
      await dashboardService.getMonthlyFinancials(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message:
        "Monthly financial data retrieved successfully",
      data,
    });
  } catch (error) {
    console.error(
      "Get monthly financials error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve monthly financial data",
    });
  }
};

module.exports = {
  getDashboardSummary,
  getMonthlyFinancialsReport,
};