const pool = require("../config/database");

const getAllCropTypes = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      description,
      growth_duration_days,
      created_at,
      updated_at
    FROM crop_types
    ORDER BY name ASC
    `
  );

  return rows;
};

const getCropTypeById = async (cropTypeId) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      description,
      growth_duration_days,
      created_at,
      updated_at
    FROM crop_types
    WHERE id = ?
    LIMIT 1
    `,
    [cropTypeId]
  );

  return rows[0] || null;
};

const createCropType = async ({
  name,
  description,
  growthDurationDays,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO crop_types
      (
        name,
        description,
        growth_duration_days
      )
    VALUES
      (?, ?, ?)
    `,
    [
      name,
      description,
      growthDurationDays,
    ]
  );

  return result.insertId;
};

const updateCropType = async ({
  cropTypeId,
  name,
  description,
  growthDurationDays,
}) => {
  const [result] = await pool.query(
    `
    UPDATE crop_types
    SET
      name = ?,
      description = ?,
      growth_duration_days = ?
    WHERE id = ?
    `,
    [
      name,
      description,
      growthDurationDays,
      cropTypeId,
    ]
  );

  return result.affectedRows;
};

const deleteCropType = async (cropTypeId) => {
  const [result] = await pool.query(
    `
    DELETE FROM crop_types
    WHERE id = ?
    `,
    [cropTypeId]
  );

  return result.affectedRows;
};

module.exports = {
  getAllCropTypes,
  getCropTypeById,
  createCropType,
  updateCropType,
  deleteCropType,
};