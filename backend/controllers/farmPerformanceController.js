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
    const { startDate, endDate, farmId } = req.query;

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

    if (
      farmId !== undefined &&
      farmId !== "" &&
      (!/^\d+$/.test(String(farmId)) || Number(farmId) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID.",
      });
    }

    const selectedFarmId =
      farmId !== undefined && farmId !== ""
        ? Number(farmId)
        : null;

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
          ? `AND ${conditions.join(" AND ")}`
          : "",
        params,
      };
    };

    const harvestDateFilter =
      buildDateFilter("h.harvest_date");

    const expenseDateFilter =
      buildDateFilter("e.expense_date");

    const activityDateFilter =
      buildDateFilter("fa.activity_date");

    const farmFilter = selectedFarmId
      ? "AND f.id = ?"
      : "";

    const farmParams = selectedFarmId
      ? [selectedFarmId]
      : [];

    /*
     * List of farms for the dropdown.
     */
    const [farms] = await pool.query(`
      SELECT
        f.id,
        f.name
      FROM farms f
      ORDER BY f.name ASC
    `);

    /*
     * Summary:
     * Harvest revenue is connected to farm through
     * harvests -> crops -> fields -> farms.
     *
     * Expenses are filtered by expenses.farm_id.
     * Labor is filtered by farm_activities.field_id.
     */
    const [revenueRows] = await pool.query(
      `
      SELECT
        COALESCE(SUM(h.total_revenue), 0) AS totalRevenue
      FROM harvests h
      INNER JOIN crops c
        ON c.id = h.crop_id
      INNER JOIN fields fi
        ON fi.id = c.field_id
      INNER JOIN farms f
        ON f.id = fi.farm_id
      WHERE 1 = 1
        ${farmFilter}
        ${harvestDateFilter.sql}
      `,
      [
        ...farmParams,
        ...harvestDateFilter.params,
      ]
    );

    const [expenseRows] = await pool.query(
      `
      SELECT
        COALESCE(SUM(e.amount), 0) AS totalExpenses
      FROM expenses e
      INNER JOIN farms f
        ON f.id = e.farm_id
      WHERE 1 = 1
        ${selectedFarmId ? "AND f.id = ?" : ""}
        ${expenseDateFilter.sql}
      `,
      [
        ...farmParams,
        ...expenseDateFilter.params,
      ]
    );

    const [laborRows] = await pool.query(
      `
      SELECT
        COALESCE(SUM(fa.labor_cost), 0) AS totalLaborCosts
      FROM farm_activities fa
      INNER JOIN fields fi
        ON fi.id = fa.field_id
      INNER JOIN farms f
        ON f.id = fi.farm_id
      WHERE 1 = 1
        ${farmFilter}
        ${activityDateFilter.sql}
      `,
      [
        ...farmParams,
        ...activityDateFilter.params,
      ]
    );

    const totalRevenue =
      Number(revenueRows[0].totalRevenue) || 0;

    const totalExpenses =
      Number(expenseRows[0].totalExpenses) || 0;

    const totalLaborCosts =
      Number(laborRows[0].totalLaborCosts) || 0;

    const totalCosts =
      totalExpenses + totalLaborCosts;

    const netProfit =
      totalRevenue - totalCosts;

    /*
     * Monthly performance.
     * Each table is aggregated separately before UNION ALL
     * to avoid multiplying rows through joins.
     */
    const [monthlyRows] = await pool.query(
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
        INNER JOIN crops c
          ON c.id = h.crop_id
        INNER JOIN fields fi
          ON fi.id = c.field_id
        INNER JOIN farms f
          ON f.id = fi.farm_id
        WHERE 1 = 1
          ${farmFilter}
          ${harvestDateFilter.sql}
        GROUP BY DATE_FORMAT(h.harvest_date, '%Y-%m')

        UNION ALL

        SELECT
          DATE_FORMAT(e.expense_date, '%Y-%m') AS month,
          0 AS revenue,
          SUM(COALESCE(e.amount, 0)) AS expenses,
          0 AS laborCosts
        FROM expenses e
        INNER JOIN farms f
          ON f.id = e.farm_id
        WHERE 1 = 1
          ${selectedFarmId ? "AND f.id = ?" : ""}
          ${expenseDateFilter.sql}
        GROUP BY DATE_FORMAT(e.expense_date, '%Y-%m')

        UNION ALL

        SELECT
          DATE_FORMAT(fa.activity_date, '%Y-%m') AS month,
          0 AS revenue,
          0 AS expenses,
          SUM(COALESCE(fa.labor_cost, 0)) AS laborCosts
        FROM farm_activities fa
        INNER JOIN fields fi
          ON fi.id = fa.field_id
        INNER JOIN farms f
          ON f.id = fi.farm_id
        WHERE 1 = 1
          ${farmFilter}
          ${activityDateFilter.sql}
        GROUP BY DATE_FORMAT(fa.activity_date, '%Y-%m')
      ) AS monthly
      GROUP BY monthly.month
      ORDER BY monthly.month ASC
      `,
      [
        ...farmParams,
        ...harvestDateFilter.params,

        ...farmParams,
        ...expenseDateFilter.params,

        ...farmParams,
        ...activityDateFilter.params,
      ]
    );

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

    /*
     * Crop performance.
     *
     * Revenue is attributed using harvests.crop_id.
     * Expenses with crop_id are attributed to that crop.
     * Labor costs are attributed through the activity's crop_id.
     *
     * Labor rows with a NULL crop_id cannot be assigned
     * reliably to an individual crop.
     */
    const [cropRows] = await pool.query(
      `
      SELECT
        c.id AS cropId,
        c.name AS cropName,
        f.id AS farmId,
        f.name AS farmName,

        COALESCE(hr.revenue, 0) AS revenue,
        COALESCE(er.expenses, 0) AS expenses,
        COALESCE(lr.laborCosts, 0) AS laborCosts

      FROM crops c
      INNER JOIN fields fi
        ON fi.id = c.field_id
      INNER JOIN farms f
        ON f.id = fi.farm_id

      LEFT JOIN (
        SELECT
          h.crop_id,
          SUM(COALESCE(h.total_revenue, 0)) AS revenue
        FROM harvests h
        WHERE 1 = 1
          ${harvestDateFilter.sql}
        GROUP BY h.crop_id
      ) hr
        ON hr.crop_id = c.id

      LEFT JOIN (
        SELECT
          e.crop_id,
          SUM(COALESCE(e.amount, 0)) AS expenses
        FROM expenses e
        WHERE e.crop_id IS NOT NULL
          ${expenseDateFilter.sql}
        GROUP BY e.crop_id
      ) er
        ON er.crop_id = c.id

      LEFT JOIN (
        SELECT
          fa.crop_id,
          SUM(COALESCE(fa.labor_cost, 0)) AS laborCosts
        FROM farm_activities fa
        WHERE fa.crop_id IS NOT NULL
          ${activityDateFilter.sql}
        GROUP BY fa.crop_id
      ) lr
        ON lr.crop_id = c.id

      WHERE 1 = 1
        ${farmFilter}

      ORDER BY f.name ASC, c.name ASC
      `,
      [
        ...harvestDateFilter.params,
        ...expenseDateFilter.params,
        ...activityDateFilter.params,
        ...farmParams,
      ]
    );

    const cropPerformance = cropRows.map((row) => {
      const revenue = Number(row.revenue) || 0;
      const expenses = Number(row.expenses) || 0;
      const laborCosts = Number(row.laborCosts) || 0;
      const totalCosts = expenses + laborCosts;

      return {
        cropId: row.cropId,
        cropName: row.cropName,
        farmId: row.farmId,
        farmName: row.farmName,
        revenue,
        expenses,
        laborCosts,
        totalCosts,
        netProfit: revenue - totalCosts,
      };
    });

    /*
     * Performance grouped by farm.
     */
    const [farmRows] = await pool.query(
      `
      SELECT
        f.id AS farmId,
        f.name AS farmName,

        COALESCE(hr.revenue, 0) AS revenue,
        COALESCE(er.expenses, 0) AS expenses,
        COALESCE(lr.laborCosts, 0) AS laborCosts

      FROM farms f

      LEFT JOIN (
        SELECT
          fi.farm_id,
          SUM(COALESCE(h.total_revenue, 0)) AS revenue
        FROM harvests h
        INNER JOIN crops c
          ON c.id = h.crop_id
        INNER JOIN fields fi
          ON fi.id = c.field_id
        WHERE 1 = 1
          ${harvestDateFilter.sql}
        GROUP BY fi.farm_id
      ) hr
        ON hr.farm_id = f.id

      LEFT JOIN (
        SELECT
          e.farm_id,
          SUM(COALESCE(e.amount, 0)) AS expenses
        FROM expenses e
        WHERE 1 = 1
          ${expenseDateFilter.sql}
        GROUP BY e.farm_id
      ) er
        ON er.farm_id = f.id

      LEFT JOIN (
        SELECT
          fi.farm_id,
          SUM(COALESCE(fa.labor_cost, 0)) AS laborCosts
        FROM farm_activities fa
        INNER JOIN fields fi
          ON fi.id = fa.field_id
        WHERE 1 = 1
          ${activityDateFilter.sql}
        GROUP BY fi.farm_id
      ) lr
        ON lr.farm_id = f.id

      WHERE 1 = 1
        ${farmFilter}

      ORDER BY f.name ASC
      `,
      [
        ...harvestDateFilter.params,
        ...expenseDateFilter.params,
        ...activityDateFilter.params,
        ...farmParams,
      ]
    );

    const farmPerformance = farmRows.map((row) => {
      const revenue = Number(row.revenue) || 0;
      const expenses = Number(row.expenses) || 0;
      const laborCosts = Number(row.laborCosts) || 0;
      const totalCosts = expenses + laborCosts;

      return {
        farmId: row.farmId,
        farmName: row.farmName,
        revenue,
        expenses,
        laborCosts,
        totalCosts,
        netProfit: revenue - totalCosts,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        farms,
        selectedFarmId,
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
        cropPerformance,
        farmPerformance,
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