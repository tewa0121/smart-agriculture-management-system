const pool = require("../config/database");


// Get all expenses for the logged-in farmer
const getExpensesByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      expenses.id,
      expenses.farm_id,
      expenses.field_id,
      expenses.crop_id,
      expenses.category,
      expenses.description,
      expenses.amount,
      expenses.expense_date,
      expenses.created_at,
      expenses.updated_at,

      farms.name AS farm_name,

      fields.name AS field_name,

      crops.name AS crop_name

    FROM expenses

    INNER JOIN farms
      ON expenses.farm_id = farms.id

    LEFT JOIN fields
      ON expenses.field_id = fields.id

    LEFT JOIN crops
      ON expenses.crop_id = crops.id

    WHERE farms.user_id = ?

    ORDER BY
      expenses.expense_date DESC,
      expenses.id DESC
    `,
    [userId]
  );

  return rows;
};


// Get one expense
const getExpenseById = async (
  expenseId,
  userId
) => {
  const [rows] = await pool.query(
    `
    SELECT
      expenses.id,
      expenses.farm_id,
      expenses.field_id,
      expenses.crop_id,
      expenses.category,
      expenses.description,
      expenses.amount,
      expenses.expense_date,
      expenses.created_at,
      expenses.updated_at,

      farms.name AS farm_name,

      fields.name AS field_name,

      crops.name AS crop_name

    FROM expenses

    INNER JOIN farms
      ON expenses.farm_id = farms.id

    LEFT JOIN fields
      ON expenses.field_id = fields.id

    LEFT JOIN crops
      ON expenses.crop_id = crops.id

    WHERE expenses.id = ?
      AND farms.user_id = ?

    LIMIT 1
    `,
    [expenseId, userId]
  );

  return rows[0] || null;
};


// Create expense
const createExpense = async ({
  farmId,
  fieldId,
  cropId,
  category,
  description,
  amount,
  expenseDate,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO expenses
      (
        farm_id,
        field_id,
        crop_id,
        category,
        description,
        amount,
        expense_date
      )
    VALUES
      (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      farmId,
      fieldId,
      cropId,
      category,
      description,
      amount,
      expenseDate,
    ]
  );

  return result.insertId;
};


// Update expense
const updateExpense = async ({
  expenseId,
  userId,
  farmId,
  fieldId,
  cropId,
  category,
  description,
  amount,
  expenseDate,
}) => {
  const [result] = await pool.query(
    `
    UPDATE expenses

    INNER JOIN farms
      ON expenses.farm_id = farms.id

    SET
      expenses.farm_id = ?,
      expenses.field_id = ?,
      expenses.crop_id = ?,
      expenses.category = ?,
      expenses.description = ?,
      expenses.amount = ?,
      expenses.expense_date = ?

    WHERE expenses.id = ?
      AND farms.user_id = ?
    `,
    [
      farmId,
      fieldId,
      cropId,
      category,
      description,
      amount,
      expenseDate,
      expenseId,
      userId,
    ]
  );

  return result.affectedRows;
};


// Delete expense
const deleteExpense = async (
  expenseId,
  userId
) => {
  const [result] = await pool.query(
    `
    DELETE expenses
    FROM expenses

    INNER JOIN farms
      ON expenses.farm_id = farms.id

    WHERE expenses.id = ?
      AND farms.user_id = ?
    `,
    [expenseId, userId]
  );

  return result.affectedRows;
};


module.exports = {
  getExpensesByUserId,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};