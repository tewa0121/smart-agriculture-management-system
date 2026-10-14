const pool = require("../config/database");

const isValidDate = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date filters.
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({
        success: false,
        message: "Start date must be a valid date in YYYY-MM-DD format.",
      });
    }

    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be a valid date in YYYY-MM-DD format.",
      });
    }

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be later than end date.",
      });
    }

    // Build a safe date filter for farm activities.
    const activityConditions = [];
    const activityParams = [];

    if (startDate) {
      activityConditions.push("activity_date >= ?");
      activityParams.push(startDate);
    }

    if (endDate) {
      activityConditions.push(
        "activity_date < DATE_ADD(?, INTERVAL 1 DAY)"
      );
      activityParams.push(endDate);
    }

    const activityWhere = activityConditions.length
      ? `WHERE ${activityConditions.join(" AND ")}`
      : "";

    const [
      [userRows],
      [farmerRows],
      [farmRows],
      [cropRows],
      [fieldRows],
      [farmAreaRows],
      [farmAreaOverviewRows],
      [cropRecordRows],
      [harvestRows],
      [expenseRows],
      [activityCountRows],
      [laborCostRows],
      [roleRows],
      [monthlyExpenseRows],
      [monthlyRevenueRows],
      [monthlyQuantityRows],
      [recentHarvestRows],
      [recentActivityRows],
      [activityTypeRows],
      [activityLaborRows],
      [filteredActivitySummaryRows],
    ] = await Promise.all([
      // Total users.
      pool.query(`
        SELECT COUNT(*) AS total
        FROM users
      `),

      // Total farmers.
      pool.query(
        `
          SELECT COUNT(*) AS total
          FROM users
          WHERE role = ?
        `,
        ["farmer"]
      ),

      // Total farms.
      pool.query(`
        SELECT COUNT(*) AS total
        FROM farms
      `),

      // Total crop records.
      pool.query(`
        SELECT COUNT(*) AS total
        FROM crops
      `),

      // Total fields.
      pool.query(`
        SELECT COUNT(*) AS total
        FROM fields
      `),

      // Total farm area: sum field areas, not farms.total_area.
      pool.query(`
        SELECT
          COALESCE(SUM(area), 0) AS totalFarmArea
        FROM fields
      `),

      // Total area grouped by farm.
      pool.query(`
        SELECT
          fa.id AS farmId,
          fa.name AS farmName,
          COALESCE(SUM(f.area), 0) AS totalArea,
          COALESCE(MAX(f.area_unit), 'hectare') AS areaUnit
        FROM farms fa
        LEFT JOIN fields f ON f.farm_id = fa.id
        GROUP BY fa.id, fa.name
        ORDER BY fa.id DESC
      `),

      // Crop records with field and farm information.
      pool.query(`
        SELECT
          c.id,
          c.name AS cropName,
          c.field_id AS fieldId,
          f.name AS fieldName,
          f.area AS fieldArea,
          f.area_unit AS areaUnit,
          fa.id AS farmId,
          fa.name AS farmName
        FROM crops c
        LEFT JOIN fields f ON c.field_id = f.id
        LEFT JOIN farms fa ON f.farm_id = fa.id
        ORDER BY c.id DESC
      `),

      // Total harvests.
      pool.query(`
        SELECT COUNT(*) AS total
        FROM harvests
      `),

      // Total expense records.
      pool.query(`
        SELECT COUNT(*) AS total
        FROM expenses
      `),

      // Total farm activity records.
      pool.query(`
        SELECT COUNT(*) AS total
        FROM farm_activities
      `),

      // All-time labor costs.
      pool.query(`
        SELECT
          COALESCE(SUM(labor_cost), 0) AS total
        FROM farm_activities
      `),

      // User distribution.
      pool.query(`
        SELECT
          role,
          COUNT(*) AS total
        FROM users
        GROUP BY role
      `),

      // Monthly expenses for the last six months.
      pool.query(`
        SELECT
          DATE_FORMAT(expense_date, '%Y-%m') AS month,
          COALESCE(SUM(amount), 0) AS total
        FROM expenses
        WHERE expense_date >= DATE_FORMAT(
          DATE_SUB(CURDATE(), INTERVAL 5 MONTH),
          '%Y-%m-01'
        )
        AND expense_date < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        GROUP BY DATE_FORMAT(expense_date, '%Y-%m')
        ORDER BY month ASC
      `),

      // Monthly harvest revenue for the last six months.
      pool.query(`
        SELECT
          DATE_FORMAT(harvest_date, '%Y-%m') AS month,
          COALESCE(SUM(total_revenue), 0) AS total
        FROM harvests
        WHERE harvest_date >= DATE_FORMAT(
          DATE_SUB(CURDATE(), INTERVAL 5 MONTH),
          '%Y-%m-01'
        )
        AND harvest_date < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        GROUP BY DATE_FORMAT(harvest_date, '%Y-%m')
        ORDER BY month ASC
      `),

      // Monthly harvest quantities grouped by unit.
      pool.query(`
        SELECT
          DATE_FORMAT(harvest_date, '%Y-%m') AS month,
          COALESCE(quantity_unit, 'Unknown') AS unit,
          COALESCE(SUM(quantity), 0) AS total
        FROM harvests
        WHERE harvest_date >= DATE_FORMAT(
          DATE_SUB(CURDATE(), INTERVAL 5 MONTH),
          '%Y-%m-01'
        )
        AND harvest_date < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        GROUP BY
          DATE_FORMAT(harvest_date, '%Y-%m'),
          COALESCE(quantity_unit, 'Unknown')
        ORDER BY month ASC
      `),

      // Latest ten harvests.
      pool.query(`
        SELECT
          h.id,
          h.crop_id,
          c.name AS crop_name,
          h.harvest_date,
          h.quantity,
          h.quantity_unit,
          h.total_revenue,
          h.quality
        FROM harvests h
        LEFT JOIN crops c ON h.crop_id = c.id
        ORDER BY h.harvest_date DESC, h.id DESC
        LIMIT 10
      `),

      // Latest ten farm activities.
      pool.query(`
        SELECT
          fa.id,
          fa.crop_id,
          c.name AS crop_name,
          fa.field_id,
          fa.activity_type,
          fa.activity_date,
          fa.description,
          COALESCE(fa.labor_cost, 0) AS labor_cost
        FROM farm_activities fa
        LEFT JOIN crops c ON fa.crop_id = c.id
        ORDER BY fa.activity_date DESC, fa.id DESC
        LIMIT 10
      `),

      // Activity counts by type for the selected date range.
      pool.query(
        `
          SELECT
            COALESCE(
              NULLIF(TRIM(activity_type), ''),
              'Other'
            ) AS activityType,
            COUNT(*) AS total
          FROM farm_activities
          ${activityWhere}
          GROUP BY COALESCE(
            NULLIF(TRIM(activity_type), ''),
            'Other'
          )
          ORDER BY total DESC, activityType ASC
        `,
        activityParams
      ),

      // Labor costs grouped by activity type.
      pool.query(
        `
          SELECT
            COALESCE(
              NULLIF(TRIM(activity_type), ''),
              'Other'
            ) AS activityType,
            COUNT(*) AS totalActivities,
            COALESCE(SUM(labor_cost), 0) AS totalLaborCost
          FROM farm_activities
          ${activityWhere}
          GROUP BY COALESCE(
            NULLIF(TRIM(activity_type), ''),
            'Other'
          )
          ORDER BY totalLaborCost DESC, activityType ASC
        `,
        activityParams
      ),

      // Activity and labor totals for the selected date range.
      pool.query(
        `
          SELECT
            COUNT(*) AS totalActivities,
            COALESCE(SUM(labor_cost), 0) AS totalLaborCost
          FROM farm_activities
          ${activityWhere}
        `,
        activityParams
      ),
    ]);

    // Build the last six month labels.
    const monthlyLabels = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const year = date.getFullYear();
      const monthNumber = String(date.getMonth() + 1).padStart(2, "0");

      monthlyLabels.push({
        key: `${year}-${monthNumber}`,
        label: date.toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        }),
      });
    }

    // Map monthly expenses.
    const expenseMap = {};

    monthlyExpenseRows.forEach((row) => {
      expenseMap[row.month] = Number(row.total || 0);
    });

    const monthlyExpenses = monthlyLabels.map((item) => ({
      month: item.label,
      total: expenseMap[item.key] || 0,
    }));

    // Map monthly harvest revenue.
    const revenueMap = {};

    monthlyRevenueRows.forEach((row) => {
      revenueMap[row.month] = Number(row.total || 0);
    });

    const monthlyHarvestRevenue = monthlyLabels.map((item) => ({
      month: item.label,
      total: revenueMap[item.key] || 0,
    }));

    // Map monthly harvest quantity by unit.
    const quantityMap = {};

    monthlyQuantityRows.forEach((row) => {
      if (!quantityMap[row.month]) {
        quantityMap[row.month] = {};
      }

      quantityMap[row.month][row.unit] = Number(row.total || 0);
    });

    const quantityUnits = [
      ...new Set(monthlyQuantityRows.map((row) => row.unit)),
    ];

    const monthlyHarvestQuantity = monthlyLabels.map((item) => {
      const record = { month: item.label };

      quantityUnits.forEach((unit) => {
        record[unit] = quantityMap[item.key]?.[unit] || 0;
      });

      return record;
    });

    // Normalize user distribution.
    const userDistribution = roleRows.map((row) => ({
      role: row.role,
      total: Number(row.total || 0),
    }));

    // Normalize farm area by farm.
    const farmAreaOverview = farmAreaOverviewRows.map((row) => ({
      farmId: Number(row.farmId),
      farmName: row.farmName,
      totalArea: Number(row.totalArea || 0),
      areaUnit: row.areaUnit || "hectare",
    }));

    // Normalize crop records.
    const cropRecords = cropRecordRows.map((row) => ({
      id: Number(row.id),
      cropName: row.cropName || "Unnamed crop",
      fieldId: row.fieldId == null ? null : Number(row.fieldId),
      fieldName: row.fieldName || "Unassigned field",
      fieldArea: row.fieldArea == null ? null : Number(row.fieldArea),
      areaUnit: row.areaUnit || "hectare",
      farmId: row.farmId == null ? null : Number(row.farmId),
      farmName: row.farmName || "Unassigned farm",
    }));

    // Normalize recent harvest records.
    const recentHarvests = recentHarvestRows.map((row) => ({
      id: row.id,
      cropId: row.crop_id,
      cropName: row.crop_name || "Unknown crop",
      harvestDate: row.harvest_date,
      quantity: Number(row.quantity || 0),
      quantityUnit: row.quantity_unit || "Unknown",
      totalRevenue: Number(row.total_revenue || 0),
      quality: row.quality || "Not specified",
    }));

    // Normalize recent activity records.
    const recentActivities = recentActivityRows.map((row) => ({
      id: row.id,
      cropName: row.crop_name || "Unknown crop",
      fieldId: row.field_id,
      activityType: row.activity_type || "Other",
      activityDate: row.activity_date,
      description: row.description || "No description",
      laborCost: Number(row.labor_cost || 0),
    }));

    // Activity counts by type.
    const activityTypeOverview = activityTypeRows.map((row) => ({
      activityType: row.activityType,
      total: Number(row.total || 0),
    }));

    // Labor costs by activity type.
    const activityLaborOverview = activityLaborRows.map((row) => ({
      activityType: row.activityType,
      totalActivities: Number(row.totalActivities || 0),
      totalLaborCost: Number(row.totalLaborCost || 0),
    }));

    // Date-filtered activity summary.
    const summaryRow = filteredActivitySummaryRows[0] || {};

    const filteredActivitySummary = {
      totalActivities: Number(summaryRow.totalActivities || 0),
      totalLaborCosts: Number(summaryRow.totalLaborCost || 0),
    };

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: Number(userRows[0]?.total || 0),
        totalFarmers: Number(farmerRows[0]?.total || 0),
        totalFarms: Number(farmRows[0]?.total || 0),
        totalCrops: Number(cropRows[0]?.total || 0),
        totalFields: Number(fieldRows[0]?.total || 0),

        // New farm area statistics.
        totalFarmArea: Number(farmAreaRows[0]?.totalFarmArea || 0),
        farmAreaOverview,

        // New crop record list.
        cropRecords,

        totalHarvests: Number(harvestRows[0]?.total || 0),
        totalExpenses: Number(expenseRows[0]?.total || 0),
        totalActivities: Number(activityCountRows[0]?.total || 0),

        totalLaborCosts: Number(laborCostRows[0]?.total || 0),

        cropHarvestOverview: [
          {
            name: "Crop Records",
            total: Number(cropRows[0]?.total || 0),
          },
          {
            name: "Harvest Records",
            total: Number(harvestRows[0]?.total || 0),
          },
        ],

        userDistribution,
        monthlyExpenses,
        monthlyHarvestRevenue,
        monthlyHarvestQuantity,
        quantityUnits,
        recentHarvests,
        recentActivities,

        activityTypeOverview,
        activityLaborOverview,
        filteredActivitySummary,

        activityDateFilter: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      },
    });
  } catch (error) {
    console.error("Admin dashboard statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics.",
    });
  }
};

module.exports = {
  getDashboardStats,
};