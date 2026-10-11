const pool = require("../config/database");


// Get all pesticide records for the logged-in farmer
const getPesticideRecordsByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      pesticide_records.id,
      pesticide_records.crop_id,
      pesticide_records.product_name,
      pesticide_records.application_date,
      pesticide_records.quantity,
      pesticide_records.quantity_unit,
      pesticide_records.cost,
      pesticide_records.notes,
      pesticide_records.created_at,
      pesticide_records.updated_at,

      crops.name AS crop_name,
      crops.planting_date,
      crops.expected_harvest_date,

      fields.id AS field_id,
      fields.name AS field_name,

      farms.id AS farm_id,
      farms.name AS farm_name

    FROM pesticide_records

    INNER JOIN crops
      ON pesticide_records.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    WHERE farms.user_id = ?

    ORDER BY pesticide_records.application_date DESC,
             pesticide_records.id DESC
    `,
    [userId]
  );

  return rows;
};


// Get one pesticide record
const getPesticideRecordById = async (
  pesticideId,
  userId
) => {
  const [rows] = await pool.query(
    `
    SELECT
      pesticide_records.id,
      pesticide_records.crop_id,
      pesticide_records.product_name,
      pesticide_records.application_date,
      pesticide_records.quantity,
      pesticide_records.quantity_unit,
      pesticide_records.cost,
      pesticide_records.notes,
      pesticide_records.created_at,
      pesticide_records.updated_at,

      crops.name AS crop_name,
      crops.planting_date,
      crops.expected_harvest_date,

      fields.id AS field_id,
      fields.name AS field_name,

      farms.id AS farm_id,
      farms.name AS farm_name

    FROM pesticide_records

    INNER JOIN crops
      ON pesticide_records.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    WHERE pesticide_records.id = ?
      AND farms.user_id = ?

    LIMIT 1
    `,
    [pesticideId, userId]
  );

  return rows[0] || null;
};


// Create pesticide record
const createPesticideRecord = async ({
  cropId,
  productName,
  applicationDate,
  quantity,
  quantityUnit,
  cost,
  notes,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO pesticide_records
      (
        crop_id,
        product_name,
        application_date,
        quantity,
        quantity_unit,
        cost,
        notes
      )
    VALUES
      (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      cropId,
      productName,
      applicationDate,
      quantity,
      quantityUnit,
      cost,
      notes,
    ]
  );

  return result.insertId;
};


// Update pesticide record
const updatePesticideRecord = async ({
  pesticideId,
  userId,
  cropId,
  productName,
  applicationDate,
  quantity,
  quantityUnit,
  cost,
  notes,
}) => {
  const [result] = await pool.query(
    `
    UPDATE pesticide_records

    INNER JOIN crops
      ON pesticide_records.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    SET
      pesticide_records.crop_id = ?,
      pesticide_records.product_name = ?,
      pesticide_records.application_date = ?,
      pesticide_records.quantity = ?,
      pesticide_records.quantity_unit = ?,
      pesticide_records.cost = ?,
      pesticide_records.notes = ?

    WHERE pesticide_records.id = ?
      AND farms.user_id = ?
    `,
    [
      cropId,
      productName,
      applicationDate,
      quantity,
      quantityUnit,
      cost,
      notes,
      pesticideId,
      userId,
    ]
  );

  return result.affectedRows;
};


// Delete pesticide record
const deletePesticideRecord = async (
  pesticideId,
  userId
) => {
  const [result] = await pool.query(
    `
    DELETE pesticide_records
    FROM pesticide_records

    INNER JOIN crops
      ON pesticide_records.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    WHERE pesticide_records.id = ?
      AND farms.user_id = ?
    `,
    [pesticideId, userId]
  );

  return result.affectedRows;
};


module.exports = {
  getPesticideRecordsByUserId,
  getPesticideRecordById,
  createPesticideRecord,
  updatePesticideRecord,
  deletePesticideRecord,
};