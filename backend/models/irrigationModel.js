const pool = require("../config/database");

// Get all irrigation methods
const getIrrigationMethods = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      description,
      created_at,
      updated_at
    FROM irrigation_methods
    ORDER BY name ASC
    `
  );

  return rows;
};


// Get all irrigation records for the logged-in farmer
const getIrrigationRecordsByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      irrigation_records.id,
      irrigation_records.crop_id,
      irrigation_records.irrigation_method_id,
      irrigation_records.irrigation_date,
      irrigation_records.quantity,
      irrigation_records.quantity_unit,
      irrigation_records.cost,
      irrigation_records.interval_days,
      irrigation_records.notes,
      irrigation_records.created_at,
      irrigation_records.updated_at,

      crops.name AS crop_name,
      crops.planting_date,
      crops.expected_harvest_date,

      fields.id AS field_id,
      fields.name AS field_name,

      farms.id AS farm_id,
      farms.name AS farm_name,

      irrigation_methods.name AS irrigation_method_name

    FROM irrigation_records

    INNER JOIN crops
      ON irrigation_records.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    LEFT JOIN irrigation_methods
      ON irrigation_records.irrigation_method_id =
         irrigation_methods.id

    WHERE farms.user_id = ?

    ORDER BY irrigation_records.irrigation_date DESC,
             irrigation_records.id DESC
    `,
    [userId]
  );

  return rows;
};


// Get one irrigation record
const getIrrigationRecordById = async (
  irrigationId,
  userId
) => {
  const [rows] = await pool.query(
    `
    SELECT
      irrigation_records.id,
      irrigation_records.crop_id,
      irrigation_records.irrigation_method_id,
      irrigation_records.irrigation_date,
      irrigation_records.quantity,
      irrigation_records.quantity_unit,
      irrigation_records.cost,
      irrigation_records.interval_days,
      irrigation_records.notes,
      irrigation_records.created_at,
      irrigation_records.updated_at,

      crops.name AS crop_name,
      crops.planting_date,
      crops.expected_harvest_date,

      fields.id AS field_id,
      fields.name AS field_name,

      farms.id AS farm_id,
      farms.name AS farm_name,

      irrigation_methods.name AS irrigation_method_name

    FROM irrigation_records

    INNER JOIN crops
      ON irrigation_records.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    LEFT JOIN irrigation_methods
      ON irrigation_records.irrigation_method_id =
         irrigation_methods.id

    WHERE irrigation_records.id = ?
      AND farms.user_id = ?

    LIMIT 1
    `,
    [irrigationId, userId]
  );

  return rows[0] || null;
};


// Create irrigation record
const createIrrigationRecord = async ({
  cropId,
  irrigationMethodId,
  irrigationDate,
  quantity,
  quantityUnit,
  cost,
  intervalDays,
  notes,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO irrigation_records
      (
        crop_id,
        irrigation_method_id,
        irrigation_date,
        quantity,
        quantity_unit,
        cost,
        interval_days,
        notes
      )
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      cropId,
      irrigationMethodId,
      irrigationDate,
      quantity,
      quantityUnit,
      cost,
      intervalDays,
      notes,
    ]
  );

  return result.insertId;
};


// Update irrigation record
const updateIrrigationRecord = async ({
  irrigationId,
  userId,
  cropId,
  irrigationMethodId,
  irrigationDate,
  quantity,
  quantityUnit,
  cost,
  intervalDays,
  notes,
}) => {
  const [result] = await pool.query(
    `
    UPDATE irrigation_records

    INNER JOIN crops
      ON irrigation_records.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    SET
      irrigation_records.crop_id = ?,
      irrigation_records.irrigation_method_id = ?,
      irrigation_records.irrigation_date = ?,
      irrigation_records.quantity = ?,
      irrigation_records.quantity_unit = ?,
      irrigation_records.cost = ?,
      irrigation_records.interval_days = ?,
      irrigation_records.notes = ?

    WHERE irrigation_records.id = ?
      AND farms.user_id = ?
    `,
    [
      cropId,
      irrigationMethodId,
      irrigationDate,
      quantity,
      quantityUnit,
      cost,
      intervalDays,
      notes,
      irrigationId,
      userId,
    ]
  );

  return result.affectedRows;
};


// Delete irrigation record
const deleteIrrigationRecord = async (
  irrigationId,
  userId
) => {
  const [result] = await pool.query(
    `
    DELETE irrigation_records
    FROM irrigation_records

    INNER JOIN crops
      ON irrigation_records.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    WHERE irrigation_records.id = ?
      AND farms.user_id = ?
    `,
    [irrigationId, userId]
  );

  return result.affectedRows;
};


module.exports = {
  getIrrigationMethods,
  getIrrigationRecordsByUserId,
  getIrrigationRecordById,
  createIrrigationRecord,
  updateIrrigationRecord,
  deleteIrrigationRecord,
};