const pool = require("../config/database");

// Get all crops belonging to the logged-in farmer
const getCropsByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      crops.id,
      crops.field_id,
      crops.crop_type_id,
      crops.name,
      crops.planting_date,
      crops.expected_harvest_date,
      crops.actual_harvest_date,
      crops.status,
      crops.notes,
      crops.created_at,
      crops.updated_at,

      fields.name AS field_name,
      fields.area AS field_area,
      fields.area_unit AS field_area_unit,

      farms.id AS farm_id,
      farms.name AS farm_name,

      crop_types.name AS crop_type_name,
      crop_types.growth_duration_days

    FROM crops

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    INNER JOIN crop_types
      ON crops.crop_type_id = crop_types.id

    WHERE farms.user_id = ?

    ORDER BY crops.created_at DESC
    `,
    [userId]
  );

  return rows;
};


// Get all crops for administrator monitoring
const getAllCrops = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      crops.id,
      crops.field_id,
      crops.crop_type_id,
      crops.name,
      crops.planting_date,
      crops.expected_harvest_date,
      crops.actual_harvest_date,
      crops.status,
      crops.notes,
      crops.created_at,
      crops.updated_at,

      fields.name AS field_name,
      fields.area AS field_area,
      fields.area_unit AS field_area_unit,

      farms.id AS farm_id,
      farms.name AS farm_name,

      farms.user_id AS farmer_id,
      users.name AS farmer_name,
      users.email AS farmer_email,

      crop_types.name AS crop_type_name,
      crop_types.growth_duration_days

    FROM crops

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    INNER JOIN crop_types
      ON crops.crop_type_id = crop_types.id

    LEFT JOIN users
      ON farms.user_id = users.id

    ORDER BY crops.created_at DESC
    `
  );

  return rows;
};


// Get one crop belonging to the logged-in farmer
const getCropById = async (cropId, userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      crops.id,
      crops.field_id,
      crops.crop_type_id,
      crops.name,
      crops.planting_date,
      crops.expected_harvest_date,
      crops.actual_harvest_date,
      crops.status,
      crops.notes,
      crops.created_at,
      crops.updated_at,

      fields.name AS field_name,
      fields.area AS field_area,
      fields.area_unit AS field_area_unit,

      farms.id AS farm_id,
      farms.name AS farm_name,

      crop_types.name AS crop_type_name,
      crop_types.growth_duration_days

    FROM crops

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    INNER JOIN crop_types
      ON crops.crop_type_id = crop_types.id

    WHERE crops.id = ?
      AND farms.user_id = ?

    LIMIT 1
    `,
    [cropId, userId]
  );

  return rows[0] || null;
};


// Create a crop
const createCrop = async ({
  fieldId,
  cropTypeId,
  name,
  plantingDate,
  expectedHarvestDate,
  status,
  notes,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO crops (
      field_id,
      crop_type_id,
      name,
      planting_date,
      expected_harvest_date,
      status,
      notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      fieldId,
      cropTypeId,
      name,
      plantingDate,
      expectedHarvestDate,
      status,
      notes,
    ]
  );

  return result.insertId;
};


// Update a crop belonging to the logged-in farmer
const updateCrop = async ({
  cropId,
  userId,
  fieldId,
  cropTypeId,
  name,
  plantingDate,
  expectedHarvestDate,
  actualHarvestDate,
  status,
  notes,
}) => {
  const [result] = await pool.query(
    `
    UPDATE crops

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    SET
      crops.field_id = ?,
      crops.crop_type_id = ?,
      crops.name = ?,
      crops.planting_date = ?,
      crops.expected_harvest_date = ?,
      crops.actual_harvest_date = ?,
      crops.status = ?,
      crops.notes = ?

    WHERE crops.id = ?
      AND farms.user_id = ?
    `,
    [
      fieldId,
      cropTypeId,
      name,
      plantingDate,
      expectedHarvestDate,
      actualHarvestDate,
      status,
      notes,
      cropId,
      userId,
    ]
  );

  return result.affectedRows;
};


// Delete a crop belonging to the logged-in farmer
const deleteCrop = async (cropId, userId) => {
  const [result] = await pool.query(
    `
    DELETE crops
    FROM crops

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    WHERE crops.id = ?
      AND farms.user_id = ?
    `,
    [cropId, userId]
  );

  return result.affectedRows;
};


module.exports = {
  getCropsByUserId,
  getAllCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
};