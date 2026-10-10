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

const getFarmComparison = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({
        success: false,
        message: "Start date must use YYYY-MM-DD format.",
      });
    }

    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must use YYYY-MM-DD format.",
      });
    }

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be later than end date.",
      });
    }

    const buildDateFilter = (column) => {
      const conditions = [];
      const params = [];

      if (startDate) {
        conditions.push(`${column} >= ?`);
        params.push(startDate);
      }

      if (endDate) {
        conditions.push(`${column} < DATE_ADD(?, INTERVAL 1 DAY)`);
        params.push(endDate);
      }

      return {
        sql: conditions.length
          ? ` AND ${conditions.join(" AND ")}`
          : "",
        params,
      };
    };

    const harvestFilter = buildDateFilter("h.harvest_date");
    const expenseFilter = buildDateFilter("e.expense_date");
    const activityFilter = buildDateFilter("fa.activity_date");

    const [rows] = await pool.query(
      `
      SELECT
        f.id AS farm_id,
        f.name AS farm_name,
        f.location,
        f.total_area,
        f.area_unit,

        (
          SELECT COALESCE(SUM(h.total_revenue), 0)
          FROM fields fi
          JOIN crops c ON c.field_id = fi.id
          JOIN harvests h ON h.crop_id = c.id
          WHERE fi.farm_id = f.id
          ${harvestFilter.sql}
        ) AS total_revenue,

        (
          SELECT COALESCE(SUM(e.amount), 0)
          FROM expenses e
          WHERE e.farm_id = f.id
          ${expenseFilter.sql}
        ) AS total_expenses,

        (
          SELECT COALESCE(SUM(fa.labor_cost), 0)
          FROM farm_activities fa
          WHERE
            (
              fa.field_id IN (
                SELECT fi.id
                FROM fields fi
                WHERE fi.farm_id = f.id
              )
              OR (
                fa.field_id IS NULL
                AND fa.crop_id IN (
                  SELECT c.id
                  FROM crops c
                  JOIN fields fi ON fi.id = c.field_id
                  WHERE fi.farm_id = f.id
                )
              )
            )
          ${activityFilter.sql}
        ) AS labor_costs

      FROM farms f
      ORDER BY f.name ASC
      `,
      [
        ...harvestFilter.params,
        ...expenseFilter.params,
        ...activityFilter.params,
      ]
    );

    const farms = rows.map((row) => {
      const revenue = Number(row.total_revenue) || 0;
      const expenses = Number(row.total_expenses) || 0;
      const laborCosts = Number(row.labor_costs) || 0;
      const totalCosts = expenses + laborCosts;

      return {
        farm_id: row.farm_id,
        farm_name: row.farm_name,
        location: row.location,
        total_area: Number(row.total_area) || 0,
        area_unit: row.area_unit,
        total_revenue: revenue,
        total_expenses: expenses,
        labor_costs: laborCosts,
        total_costs: totalCosts,
        net_profit: revenue - totalCosts,
      };
    });

    return res.status(200).json({
      success: true,
      count: farms.length,
      data: farms,
    });
  } catch (error) {
    console.error("Farm comparison error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load farm comparison.",
    });
  }
};

module.exports = {
  getFarmComparison,
};