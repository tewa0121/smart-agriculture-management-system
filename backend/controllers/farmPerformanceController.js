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

const getFarmPerformance = async (req, res) => {
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
          ? `WHERE ${conditions.join(" AND ")}`
          : "",
        params,
      };
    };

    const harvestFilter = buildDateFilter("h.harvest_date");
    const expenseFilter = buildDateFilter("e.expense_date");
    const activityFilter = buildDateFilter("fa.activity_date");

    const [
      [revenueRows],
      [expenseRows],
      [laborRows],
      [monthlyRows],
    ] = await Promise.all([
      pool.query(
        `
        SELECT COALESCE(SUM(h.total_revenue), 0) AS totalRevenue
        FROM harvests h
        ${harvestFilter.sql}
        `,
        harvestFilter.params
      ),

      pool.query(
        `
        SELECT COALESCE(SUM(e.amount), 0) AS totalExpenses
        FROM expenses e
        ${expenseFilter.sql}
        `,
        expenseFilter.params
      ),

      pool.query(
        `
        SELECT COALESCE(SUM(fa.labor_cost), 0) AS totalLaborCosts
        FROM farm_activities fa
        ${activityFilter.sql}
        `,
        activityFilter.params
      ),

      pool.query(
        `
        SELECT
          monthly.month,
          SUM(monthly.revenue) AS revenue,
          SUM(monthly.expenses) AS expenses,
          SUM(monthly.laborCosts) AS laborCosts
        FROM (
          SELECT
            DATE_FORMAT(h.harvest_date, '%Y-%m') AS month,
            SUM(COALESCE(h.total_revenue, 0)) AS revenue,
            0 AS expenses,
            0 AS laborCosts
          FROM harvests h
          ${harvestFilter.sql}
          GROUP BY DATE_FORMAT(h.harvest_date, '%Y-%m')

          UNION ALL

          SELECT
            DATE_FORMAT(e.expense_date, '%Y-%m') AS month,
            0 AS revenue,
            SUM(COALESCE(e.amount, 0)) AS expenses,
            0 AS laborCosts
          FROM expenses e
          ${expenseFilter.sql}
          GROUP BY DATE_FORMAT(e.expense_date, '%Y-%m')

          UNION ALL

          SELECT
            DATE_FORMAT(fa.activity_date, '%Y-%m') AS month,
            0 AS revenue,
            0 AS expenses,
            SUM(COALESCE(fa.labor_cost, 0)) AS laborCosts
          FROM farm_activities fa
          ${activityFilter.sql}
          GROUP BY DATE_FORMAT(fa.activity_date, '%Y-%m')
        ) AS monthly
        GROUP BY monthly.month
        ORDER BY monthly.month ASC
        `,
        [
          ...harvestFilter.params,
          ...expenseFilter.params,
          ...activityFilter.params,
        ]
      ),
    ]);

    const totalRevenue = Number(revenueRows[0].totalRevenue) || 0;
    const totalExpenses = Number(expenseRows[0].totalExpenses) || 0;
    const totalLaborCosts = Number(laborRows[0].totalLaborCosts) || 0;

    const totalCosts = totalExpenses + totalLaborCosts;
    const netProfit = totalRevenue - totalCosts;

    const monthlyPerformance = monthlyRows.map((row) => {
      const revenue = Number(row.revenue) || 0;
      const expenses = Number(row.expenses) || 0;
      const laborCosts = Number(row.laborCosts) || 0;
      const costs = expenses + laborCosts;

      return {
        month: row.month,
        revenue,
        expenses,
        laborCosts,
        totalCosts: costs,
        netProfit: revenue - costs,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        dateFilter: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
        totalRevenue,
        totalExpenses,
        totalLaborCosts,
        totalCosts,
        netProfit,
        monthlyPerformance,
      },
    });
  } catch (error) {
    console.error("Farm performance report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load farm performance report.",
    });
  }
};

module.exports = {
  getFarmPerformance,
};