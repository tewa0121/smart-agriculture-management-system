
const pool = require("../config/database");

/*
  Report filters supported by the service:

  {
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate
  }

  All reports are automatically restricted to farms
  owned by the authenticated farmer.
*/

/**
 * Build common ownership/filter conditions.
 */
const buildFilterConditions = ({
  farmId,
  fieldId,
  cropId,
  startDate,
  endDate,
  dateColumn,
}) => {
  const conditions = [];
  const params = [];

  if (farmId) {
    conditions.push("farms.id = ?");
    params.push(farmId);
  }

  if (fieldId) {
    conditions.push("fields.id = ?");
    params.push(fieldId);
  }

  if (cropId) {
    conditions.push("crops.id = ?");
    params.push(cropId);
  }

  if (startDate && dateColumn) {
    conditions.push(`${dateColumn} >= ?`);
    params.push(startDate);
  }

  if (endDate && dateColumn) {
    conditions.push(`${dateColumn} <= ?`);
    params.push(endDate);
  }

  return {
    conditions,
    params,
  };
};

/**
 * Crop production report.
 *
 * Shows crop information together with harvested quantity
 * and revenue.
 */
const getCropProductionReport = async (userId, filters = {}) => {
  const {
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
  } = filters;

  const filter = buildFilterConditions({
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
    dateColumn: "harvests.harvest_date",
  });

  const whereConditions = [
    "farms.user_id = ?",
    ...filter.conditions,
  ];

  const [rows] = await pool.query(
    `
    SELECT
      crops.id AS crop_id,
      crops.name AS crop_name,
      crop_types.name AS crop_type_name,

      farms.id AS farm_id,
      farms.name AS farm_name,

      fields.id AS field_id,
      fields.name AS field_name,

      COALESCE(SUM(harvests.quantity), 0) AS total_quantity,
      MAX(harvests.quantity_unit) AS quantity_unit,
      COALESCE(SUM(harvests.total_revenue), 0) AS total_revenue,
      COUNT(harvests.id) AS harvest_count

    FROM crops

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    INNER JOIN crop_types
      ON crops.crop_type_id = crop_types.id

    LEFT JOIN harvests
      ON harvests.crop_id = crops.id

    WHERE ${whereConditions.join(" AND ")}

    GROUP BY
      crops.id,
      crops.name,
      crop_types.name,
      farms.id,
      farms.name,
      fields.id,
      fields.name

    ORDER BY farms.name, fields.name, crops.name
    `,
    [userId, ...filter.params]
  );

  return rows;
};

/**
 * Harvest report.
 */
const getHarvestReport = async (userId, filters = {}) => {
  const {
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
  } = filters;

  const filter = buildFilterConditions({
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
    dateColumn: "harvests.harvest_date",
  });

  const whereConditions = [
    "farms.user_id = ?",
    ...filter.conditions,
  ];

  const [rows] = await pool.query(
    `
    SELECT
      harvests.id,
      harvests.harvest_date,
      harvests.quantity,
      harvests.quantity_unit,
      harvests.price_per_unit,
      harvests.total_revenue,
      harvests.quality,
      harvests.notes,

      crops.id AS crop_id,
      crops.name AS crop_name,
      crop_types.name AS crop_type_name,

      fields.id AS field_id,
      fields.name AS field_name,

      farms.id AS farm_id,
      farms.name AS farm_name

    FROM harvests

    INNER JOIN crops
      ON harvests.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    INNER JOIN crop_types
      ON crops.crop_type_id = crop_types.id

    WHERE ${whereConditions.join(" AND ")}

    ORDER BY harvests.harvest_date DESC, harvests.id DESC
    `,
    [userId, ...filter.params]
  );

  return rows;
};

/**
 * Expense report.
 */
const getExpenseReport = async (userId, filters = {}) => {
  const {
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
  } = filters;

  const filter = buildFilterConditions({
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
    dateColumn: "expenses.expense_date",
  });

  const whereConditions = [
    "farms.user_id = ?",
    ...filter.conditions,
  ];

  const [rows] = await pool.query(
    `
    SELECT
      expenses.id,
      expenses.expense_date,
      expenses.category,
      expenses.description,
      expenses.amount,

      farms.id AS farm_id,
      farms.name AS farm_name,

      fields.id AS field_id,
      fields.name AS field_name,

      crops.id AS crop_id,
      crops.name AS crop_name

    FROM expenses

    INNER JOIN farms
      ON expenses.farm_id = farms.id

    LEFT JOIN fields
      ON expenses.field_id = fields.id

    LEFT JOIN crops
      ON expenses.crop_id = crops.id

    WHERE ${whereConditions.join(" AND ")}

    ORDER BY expenses.expense_date DESC, expenses.id DESC
    `,
    [userId, ...filter.params]
  );

  return rows;
};

/**
 * Revenue report.
 */
const getRevenueReport = async (userId, filters = {}) => {
  const {
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
  } = filters;

  const filter = buildFilterConditions({
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
    dateColumn: "harvests.harvest_date",
  });

  const whereConditions = [
    "farms.user_id = ?",
    ...filter.conditions,
  ];

  const [rows] = await pool.query(
    `
    SELECT
      DATE(harvests.harvest_date) AS revenue_date,

      farms.id AS farm_id,
      farms.name AS farm_name,

      fields.id AS field_id,
      fields.name AS field_name,

      crops.id AS crop_id,
      crops.name AS crop_name,

      SUM(harvests.total_revenue) AS total_revenue

    FROM harvests

    INNER JOIN crops
      ON harvests.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    WHERE ${whereConditions.join(" AND ")}

    GROUP BY
      DATE(harvests.harvest_date),
      farms.id,
      farms.name,
      fields.id,
      fields.name,
      crops.id,
      crops.name

    ORDER BY revenue_date DESC
    `,
    [userId, ...filter.params]
  );

  return rows;
};

/**
 * Profit report.
 *
 * Profit = total revenue - total expenses.
 */
const getProfitReport = async (userId, filters = {}) => {
  const {
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
  } = filters;

  /*
    Revenue query
  */
  const revenueFilter = buildFilterConditions({
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
    dateColumn: "harvests.harvest_date",
  });

  const revenueConditions = [
    "farms.user_id = ?",
    ...revenueFilter.conditions,
  ];

  const [revenueRows] = await pool.query(
    `
    SELECT
      COALESCE(SUM(harvests.total_revenue), 0) AS total_revenue

    FROM harvests

    INNER JOIN crops
      ON harvests.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    WHERE ${revenueConditions.join(" AND ")}
    `,
    [userId, ...revenueFilter.params]
  );

  /*
    Expense query
  */
  const expenseFilter = buildFilterConditions({
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
    dateColumn: "expenses.expense_date",
  });

  const expenseConditions = [
    "farms.user_id = ?",
    ...expenseFilter.conditions,
  ];

  const [expenseRows] = await pool.query(
    `
    SELECT
      COALESCE(SUM(expenses.amount), 0) AS total_expenses

    FROM expenses

    INNER JOIN farms
      ON expenses.farm_id = farms.id

    LEFT JOIN fields
      ON expenses.field_id = fields.id

    LEFT JOIN crops
      ON expenses.crop_id = crops.id

    WHERE ${expenseConditions.join(" AND ")}
    `,
    [userId, ...expenseFilter.params]
  );

  const totalRevenue = Number(revenueRows[0].total_revenue || 0);
  const totalExpenses = Number(expenseRows[0].total_expenses || 0);

  return {
    totalRevenue,
    totalExpenses,
    profit: totalRevenue - totalExpenses,
  };
};

/**
 * Irrigation history report.
 */
const getIrrigationReport = async (userId, filters = {}) => {
  const {
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
  } = filters;

  const filter = buildFilterConditions({
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
    dateColumn: "irrigation_records.irrigation_date",
  });

  const whereConditions = [
    "farms.user_id = ?",
    ...filter.conditions,
  ];

  const [rows] = await pool.query(
    `
    SELECT
      irrigation_records.id,
      irrigation_records.irrigation_date,
      irrigation_records.quantity,
      irrigation_records.quantity_unit,
      irrigation_records.cost,
      irrigation_records.interval_days,
      irrigation_records.notes,

      irrigation_methods.name AS irrigation_method_name,

      crops.id AS crop_id,
      crops.name AS crop_name,

      fields.id AS field_id,
      fields.name AS field_name,

      farms.id AS farm_id,
      farms.name AS farm_name

    FROM irrigation_records

    INNER JOIN crops
      ON irrigation_records.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    INNER JOIN irrigation_methods
      ON irrigation_records.irrigation_method_id = irrigation_methods.id

    WHERE ${whereConditions.join(" AND ")}

    ORDER BY
      irrigation_records.irrigation_date DESC,
      irrigation_records.id DESC
    `,
    [userId, ...filter.params]
  );

  return rows;
};

/**
 * Fertilizer history report.
 */
const getFertilizerReport = async (userId, filters = {}) => {
  const {
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
  } = filters;

  const filter = buildFilterConditions({
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
    dateColumn: "fertilizer_records.application_date",
  });

  const whereConditions = [
    "farms.user_id = ?",
    ...filter.conditions,
  ];

  const [rows] = await pool.query(
    `
    SELECT
      fertilizer_records.id,
      fertilizer_records.application_date,
      fertilizer_records.quantity,
      fertilizer_records.quantity_unit,
      fertilizer_records.cost,
      fertilizer_records.interval_days,
      fertilizer_records.notes,

      fertilizer_types.name AS fertilizer_type_name,

      crops.id AS crop_id,
      crops.name AS crop_name,

      fields.id AS field_id,
      fields.name AS field_name,

      farms.id AS farm_id,
      farms.name AS farm_name

    FROM fertilizer_records

    INNER JOIN crops
      ON fertilizer_records.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    INNER JOIN fertilizer_types
      ON fertilizer_records.fertilizer_type_id = fertilizer_types.id

    WHERE ${whereConditions.join(" AND ")}

    ORDER BY
      fertilizer_records.application_date DESC,
      fertilizer_records.id DESC
    `,
    [userId, ...filter.params]
  );

  return rows;
};

/**
 * Farm activity history report.
 *
 * farm_activities does not contain farm_id.
 * The farm is determined through the related field.
 */
const getActivityReport = async (userId, filters = {}) => {
  const {
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
  } = filters;

  const filter = buildFilterConditions({
    farmId,
    fieldId,
    cropId,
    startDate,
    endDate,
    dateColumn: "farm_activities.activity_date",
  });

  const whereConditions = [
    "farms.user_id = ?",
    ...filter.conditions,
  ];

  const [rows] = await pool.query(
    `
    SELECT
      farm_activities.id,
      farm_activities.activity_date,
      farm_activities.activity_type,
      farm_activities.description,
      farm_activities.labor_cost,

      farms.id AS farm_id,
      farms.name AS farm_name,

      fields.id AS field_id,
      fields.name AS field_name,

      crops.id AS crop_id,
      crops.name AS crop_name

    FROM farm_activities

    LEFT JOIN fields
      ON farm_activities.field_id = fields.id

    LEFT JOIN farms
      ON fields.farm_id = farms.id

    LEFT JOIN crops
      ON farm_activities.crop_id = crops.id

    WHERE ${whereConditions.join(" AND ")}

    ORDER BY
      farm_activities.activity_date DESC,
      farm_activities.id DESC
    `,
    [userId, ...filter.params]
  );

  return rows;
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

