const pool = require("../config/database");

const getDashboardSummary = async (userId) => {
  const [
    farmResult,
    fieldResult,
    activeCropResult,
    irrigationResult,
    fertilizerResult,
    harvestResult,
    expenseResult,
    revenueResult,
  ] = await Promise.all([
    // Total farms
    pool.query(
      `
      SELECT COUNT(*) AS total_farms
      FROM farms
      WHERE user_id = ?
      `,
      [userId]
    ),

    // Total fields
    pool.query(
      `
      SELECT COUNT(*) AS total_fields
      FROM fields
      INNER JOIN farms
        ON fields.farm_id = farms.id
      WHERE farms.user_id = ?
      `,
      [userId]
    ),

    // Active crops
    // Harvested crops are excluded.
    pool.query(
      `
      SELECT COUNT(*) AS active_crops
      FROM crops
      INNER JOIN fields
        ON crops.field_id = fields.id
      INNER JOIN farms
        ON fields.farm_id = farms.id
      WHERE farms.user_id = ?
        AND crops.status <> 'harvested'
      `,
      [userId]
    ),

    // Upcoming / due irrigation records
    pool.query(
      `
      SELECT COUNT(*) AS upcoming_irrigation
      FROM irrigation_records
      INNER JOIN crops
        ON irrigation_records.crop_id = crops.id
      INNER JOIN fields
        ON crops.field_id = fields.id
      INNER JOIN farms
        ON fields.farm_id = farms.id
      WHERE farms.user_id = ?
        AND irrigation_records.interval_days IS NOT NULL
        AND irrigation_records.interval_days > 0
        AND DATE_ADD(
          irrigation_records.irrigation_date,
          INTERVAL irrigation_records.interval_days DAY
        ) <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      `,
      [userId]
    ),

    // Upcoming / due fertilizer records
    pool.query(
      `
      SELECT COUNT(*) AS upcoming_fertilizer
      FROM fertilizer_records
      INNER JOIN crops
        ON fertilizer_records.crop_id = crops.id
      INNER JOIN fields
        ON crops.field_id = fields.id
      INNER JOIN farms
        ON fields.farm_id = farms.id
      WHERE farms.user_id = ?
        AND fertilizer_records.interval_days IS NOT NULL
        AND fertilizer_records.interval_days > 0
        AND DATE_ADD(
          fertilizer_records.application_date,
          INTERVAL fertilizer_records.interval_days DAY
        ) <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      `,
      [userId]
    ),

    // Upcoming harvests
    pool.query(
      `
      SELECT COUNT(*) AS upcoming_harvests
      FROM crops
      INNER JOIN fields
        ON crops.field_id = fields.id
      INNER JOIN farms
        ON fields.farm_id = farms.id
      WHERE farms.user_id = ?
        AND crops.actual_harvest_date IS NULL
        AND crops.expected_harvest_date IS NOT NULL
        AND crops.expected_harvest_date
            BETWEEN CURDATE()
            AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      `,
      [userId]
    ),

    // Total expenses
    pool.query(
      `
      SELECT
        COALESCE(SUM(expenses.amount), 0) AS total_expenses
      FROM expenses
      INNER JOIN farms
        ON expenses.farm_id = farms.id
      WHERE farms.user_id = ?
      `,
      [userId]
    ),

    // Total revenue
    pool.query(
      `
      SELECT
        COALESCE(SUM(harvests.total_revenue), 0)
          AS total_revenue
      FROM harvests
      INNER JOIN crops
        ON harvests.crop_id = crops.id
      INNER JOIN fields
        ON crops.field_id = fields.id
      INNER JOIN farms
        ON fields.farm_id = farms.id
      WHERE farms.user_id = ?
      `,
      [userId]
    ),
  ]);

  const totalFarms =
    Number(farmResult[0][0].total_farms);

  const totalFields =
    Number(fieldResult[0][0].total_fields);

  const activeCrops =
    Number(activeCropResult[0][0].active_crops);

  const upcomingIrrigation =
    Number(
      irrigationResult[0][0].upcoming_irrigation
    );

  const upcomingFertilizer =
    Number(
      fertilizerResult[0][0].upcoming_fertilizer
    );

  const upcomingHarvests =
    Number(
      harvestResult[0][0].upcoming_harvests
    );

  const totalExpenses =
    Number(
      expenseResult[0][0].total_expenses
    );

  const totalRevenue =
    Number(
      revenueResult[0][0].total_revenue
    );

  const estimatedProfit =
    totalRevenue - totalExpenses;

  return {
    total_farms: totalFarms,
    total_fields: totalFields,
    active_crops: activeCrops,

    upcoming_irrigation:
      upcomingIrrigation,

    upcoming_fertilizer:
      upcomingFertilizer,

    upcoming_harvests:
      upcomingHarvests,

    total_expenses:
      Number(totalExpenses.toFixed(2)),

    total_revenue:
      Number(totalRevenue.toFixed(2)),

    estimated_profit:
      Number(estimatedProfit.toFixed(2)),
  };
};

const getMonthlyFinancials = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      months.month,
      COALESCE(expenses.total_expenses, 0) AS expenses,
      COALESCE(harvests.total_revenue, 0) AS revenue
    FROM (
      SELECT 1 AS month
      UNION ALL SELECT 2
      UNION ALL SELECT 3
      UNION ALL SELECT 4
      UNION ALL SELECT 5
      UNION ALL SELECT 6
      UNION ALL SELECT 7
      UNION ALL SELECT 8
      UNION ALL SELECT 9
      UNION ALL SELECT 10
      UNION ALL SELECT 11
      UNION ALL SELECT 12
    ) AS months

    LEFT JOIN (
      SELECT
        MONTH(e.expense_date) AS month,
        SUM(e.amount) AS total_expenses
      FROM expenses e
      INNER JOIN farms f
        ON e.farm_id = f.id
      WHERE f.user_id = ?
      GROUP BY MONTH(e.expense_date)
    ) AS expenses
      ON months.month = expenses.month

    LEFT JOIN (
      SELECT
        MONTH(h.harvest_date) AS month,
        SUM(h.total_revenue) AS total_revenue
      FROM harvests h
      INNER JOIN crops c
        ON h.crop_id = c.id
      INNER JOIN fields fi
        ON c.field_id = fi.id
      INNER JOIN farms f
        ON fi.farm_id = f.id
      WHERE f.user_id = ?
      GROUP BY MONTH(h.harvest_date)
    ) AS harvests
      ON months.month = harvests.month

    ORDER BY months.month
    `,
    [userId, userId]
  );

  return rows;
};
const getCropProduction = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      ct.name AS crop_name,
      COALESCE(
        SUM(h.quantity),
        0
      ) AS total_quantity,
      COALESCE(
        MAX(h.quantity_unit),
        'kg'
      ) AS quantity_unit
    FROM crop_types ct
    INNER JOIN crops c
      ON ct.id = c.crop_type_id
    INNER JOIN fields fi
      ON c.field_id = fi.id
    INNER JOIN farms f
      ON fi.farm_id = f.id
    LEFT JOIN harvests h
      ON c.id = h.crop_id
    WHERE f.user_id = ?
    GROUP BY ct.id, ct.name
    ORDER BY total_quantity DESC
    `,
    [userId]
  );

  return rows;
};
const getUpcomingActivities = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM (
      SELECT
        'Irrigation' AS activity_type,
        c.name AS crop_name,
        f.name AS farm_name,
        fi.name AS field_name,
        DATE_ADD(
          MAX(ir.irrigation_date),
          INTERVAL MAX(ir.interval_days) DAY
        ) AS due_date
      FROM irrigation_records ir
      INNER JOIN crops c
        ON ir.crop_id = c.id
      INNER JOIN fields fi
        ON c.field_id = fi.id
      INNER JOIN farms f
        ON fi.farm_id = f.id
      WHERE f.user_id = ?
        AND ir.interval_days IS NOT NULL
        AND ir.interval_days > 0
      GROUP BY c.id, c.name, f.id, f.name, fi.id, fi.name

      UNION ALL

      SELECT
        'Fertilizer' AS activity_type,
        c.name AS crop_name,
        f.name AS farm_name,
        fi.name AS field_name,
        DATE_ADD(
          MAX(fr.application_date),
          INTERVAL MAX(fr.interval_days) DAY
        ) AS due_date
      FROM fertilizer_records fr
      INNER JOIN crops c
        ON fr.crop_id = c.id
      INNER JOIN fields fi
        ON c.field_id = fi.id
      INNER JOIN farms f
        ON fi.farm_id = f.id
      WHERE f.user_id = ?
        AND fr.interval_days IS NOT NULL
        AND fr.interval_days > 0
      GROUP BY c.id, c.name, f.id, f.name, fi.id, fi.name

      UNION ALL

      SELECT
        'Harvest' AS activity_type,
        c.name AS crop_name,
        f.name AS farm_name,
        fi.name AS field_name,
        c.expected_harvest_date AS due_date
      FROM crops c
      INNER JOIN fields fi
        ON c.field_id = fi.id
      INNER JOIN farms f
        ON fi.farm_id = f.id
      WHERE f.user_id = ?
        AND c.actual_harvest_date IS NULL
        AND c.expected_harvest_date IS NOT NULL
    ) AS upcoming_activities
    WHERE due_date IS NOT NULL
    ORDER BY due_date ASC
    `,
    [userId, userId, userId]
  );

  return rows;
};

module.exports = {
  getDashboardSummary,
  getMonthlyFinancials,
  getCropProduction,
  getUpcomingActivities,
};;