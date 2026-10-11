const pool = require("../config/database");

// Get all fertilizer types
const getFertilizerTypes = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      description,
      created_at,
      updated_at
    FROM fertilizer_types
    ORDER BY name ASC
    `
  );

  return rows;
};


// Get all fertilizer records for the logged-in farmer
const getFertilizerRecordsByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      fertilizer_records.id,
      fertilizer_records.crop_id,
      fertilizer_records.fertilizer_type_id,
      fertilizer_records.application_date,
      fertilizer_records.quantity,
      fertilizer_records.quantity_unit,
      fertilizer_records.cost,
      fertilizer_records.interval_days,
      fertilizer_records.notes,
      fertilizer_records.created_at,
      fertilizer_records.updated_at,

      crops.name AS crop_name,
      crops.planting_date,
      crops.expected_harvest_date,

      fields.id AS field_id,
      fields.name AS field_name,

      farms.id AS farm_id,
      farms.name AS farm_name,

      fertilizer_types.name AS fertilizer_type_name

    FROM fertilizer_records

    INNER JOIN crops
      ON fertilizer_records.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    LEFT JOIN fertilizer_types
      ON fertilizer_records.fertilizer_type_id =
         fertilizer_types.id

    WHERE farms.user_id = ?

    ORDER BY fertilizer_records.application_date DESC,
             fertilizer_records.id DESC
    `,
    [userId]
  );

  return rows;
};


// Get one fertilizer record
const getFertilizerRecordById = async (
  fertilizerId,
  userId
) => {
  const [rows] = await pool.query(
    `
    SELECT
      fertilizer_records.id,
      fertilizer_records.crop_id,
      fertilizer_records.fertilizer_type_id,
      fertilizer_records.application_date,
      fertilizer_records.quantity,
      fertilizer_records.quantity_unit,
      fertilizer_records.cost,
      fertilizer_records.interval_days,
      fertilizer_records.notes,
      fertilizer_records.created_at,
      fertilizer_records.updated_at,

      crops.name AS crop_name,
      crops.planting_date,
      crops.expected_harvest_date,

      fields.id AS field_id,
      fields.name AS field_name,

      farms.id AS farm_id,
      farms.name AS farm_name,

      fertilizer_types.name AS fertilizer_type_name

    FROM fertilizer_records

    INNER JOIN crops
      ON fertilizer_records.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    LEFT JOIN fertilizer_types
      ON fertilizer_records.fertilizer_type_id =
         fertilizer_types.id

    WHERE fertilizer_records.id = ?
      AND farms.user_id = ?

    LIMIT 1
    `,
    [fertilizerId, userId]
  );

  return rows[0] || null;
};


// Create fertilizer record
const createFertilizerRecord = async ({
  cropId,
  fertilizerTypeId,
  applicationDate,
  quantity,
  quantityUnit,
  cost,
  intervalDays,
  notes,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO fertilizer_records
      (
        crop_id,
        fertilizer_type_id,
        application_date,
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
      fertilizerTypeId,
      applicationDate,
      quantity,
      quantityUnit,
      cost,
      intervalDays,
      notes,
    ]
  );

  return result.insertId;
};


// Update fertilizer record
const updateFertilizerRecord = async ({
  fertilizerId,
  userId,
  cropId,
  fertilizerTypeId,
  applicationDate,
  quantity,
  quantityUnit,
  cost,
  intervalDays,
  notes,
}) => {
  const [result] = await pool.query(
    `
    UPDATE fertilizer_records

    INNER JOIN crops
      ON fertilizer_records.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    SET
      fertilizer_records.crop_id = ?,
      fertilizer_records.fertilizer_type_id = ?,
      fertilizer_records.application_date = ?,
      fertilizer_records.quantity = ?,
      fertilizer_records.quantity_unit = ?,
      fertilizer_records.cost = ?,
      fertilizer_records.interval_days = ?,
      fertilizer_records.notes = ?

    WHERE fertilizer_records.id = ?
      AND farms.user_id = ?
    `,
    [
      cropId,
      fertilizerTypeId,
      applicationDate,
      quantity,
      quantityUnit,
      cost,
      intervalDays,
      notes,
      fertilizerId,
      userId,
    ]
  );

  return result.affectedRows;
};


// Delete fertilizer record
const deleteFertilizerRecord = async (
  fertilizerId,
  userId
) => {
  const [result] = await pool.query(
    `
    DELETE fertilizer_records
    FROM fertilizer_records

    INNER JOIN crops
      ON fertilizer_records.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    WHERE fertilizer_records.id = ?
      AND farms.user_id = ?
    `,
    [fertilizerId, userId]
  );

  return result.affectedRows;
};


module.exports = {
  getFertilizerTypes,
  getFertilizerRecordsByUserId,
  getFertilizerRecordById,
  createFertilizerRecord,
  updateFertilizerRecord,
  deleteFertilizerRecord,
};