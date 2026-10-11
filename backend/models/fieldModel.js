const pool = require("../config/database");

const getFieldsByFarmId = async (farmId, userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      fields.id,
      fields.farm_id,
      fields.name,
      fields.area,
      fields.area_unit,
      fields.soil_type,
      fields.description,
      fields.created_at,
      fields.updated_at
    FROM fields
    INNER JOIN farms
      ON fields.farm_id = farms.id
    WHERE fields.farm_id = ?
      AND farms.user_id = ?
    ORDER BY fields.created_at DESC
    `,
    [farmId, userId]
  );

  return rows;
};

const getFieldById = async (fieldId, userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      fields.id,
      fields.farm_id,
      fields.name,
      fields.area,
      fields.area_unit,
      fields.soil_type,
      fields.description,
      fields.created_at,
      fields.updated_at
    FROM fields
    INNER JOIN farms
      ON fields.farm_id = farms.id
    WHERE fields.id = ?
      AND farms.user_id = ?
    LIMIT 1
    `,
    [fieldId, userId]
  );

  return rows[0] || null;
};

const createField = async ({
  farmId,
  name,
  area,
  areaUnit,
  soilType,
  description,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO fields
      (
        farm_id,
        name,
        area,
        area_unit,
        soil_type,
        description
      )
    VALUES
      (?, ?, ?, ?, ?, ?)
    `,
    [
      farmId,
      name,
      area,
      areaUnit,
      soilType,
      description,
    ]
  );

  return result.insertId;
};

const updateField = async ({
  fieldId,
  userId,
  name,
  area,
  areaUnit,
  soilType,
  description,
}) => {
  const [result] = await pool.query(
    `
    UPDATE fields
    INNER JOIN farms
      ON fields.farm_id = farms.id
    SET
      fields.name = ?,
      fields.area = ?,
      fields.area_unit = ?,
      fields.soil_type = ?,
      fields.description = ?
    WHERE fields.id = ?
      AND farms.user_id = ?
    `,
    [
      name,
      area,
      areaUnit,
      soilType,
      description,
      fieldId,
      userId,
    ]
  );

  return result.affectedRows;
};

const deleteField = async (fieldId, userId) => {
  const [result] = await pool.query(
    `
    DELETE fields
    FROM fields
    INNER JOIN farms
      ON fields.farm_id = farms.id
    WHERE fields.id = ?
      AND farms.user_id = ?
    `,
    [fieldId, userId]
  );

  return result.affectedRows;
};

// Verify that a field belongs to the logged-in farmer
const verifyFieldOwnership = async (fieldId, userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      fields.id,
      fields.farm_id
    FROM fields
    INNER JOIN farms
      ON fields.farm_id = farms.id
    WHERE fields.id = ?
      AND farms.user_id = ?
    LIMIT 1
    `,
    [fieldId, userId]
  );

  return rows[0] || null;
};

module.exports = {
  getFieldsByFarmId,
  getFieldById,
  createField,
  updateField,
  deleteField,
  verifyFieldOwnership,
};