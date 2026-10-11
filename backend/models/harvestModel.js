const pool = require("../config/database");

const getHarvestsByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      harvests.id,
      harvests.crop_id,
      harvests.harvest_date,
      harvests.quantity,
      harvests.quantity_unit,
      harvests.price_per_unit,
      harvests.total_revenue,
      harvests.quality,
      harvests.notes,
      harvests.created_at,
      harvests.updated_at,

      crops.name AS crop_name,
      crops.planting_date,
      crops.expected_harvest_date,
      crops.actual_harvest_date,

      fields.id AS field_id,
      fields.name AS field_name,

      farms.id AS farm_id,
      farms.name AS farm_name,

      crop_types.name AS crop_type_name

    FROM harvests

    INNER JOIN crops
      ON harvests.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    INNER JOIN crop_types
      ON crops.crop_type_id = crop_types.id

    WHERE farms.user_id = ?

    ORDER BY
      harvests.harvest_date DESC,
      harvests.id DESC
    `,
    [userId]
  );

  return rows;
};


const getHarvestById = async (
  harvestId,
  userId
) => {
  const [rows] = await pool.query(
    `
    SELECT
      harvests.id,
      harvests.crop_id,
      harvests.harvest_date,
      harvests.quantity,
      harvests.quantity_unit,
      harvests.price_per_unit,
      harvests.total_revenue,
      harvests.quality,
      harvests.notes,
      harvests.created_at,
      harvests.updated_at,

      crops.name AS crop_name,
      crops.planting_date,
      crops.expected_harvest_date,
      crops.actual_harvest_date,

      fields.id AS field_id,
      fields.name AS field_name,

      farms.id AS farm_id,
      farms.name AS farm_name,

      crop_types.name AS crop_type_name

    FROM harvests

    INNER JOIN crops
      ON harvests.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    INNER JOIN crop_types
      ON crops.crop_type_id = crop_types.id

    WHERE harvests.id = ?
      AND farms.user_id = ?

    LIMIT 1
    `,
    [harvestId, userId]
  );

  return rows[0] || null;
};


const createHarvest = async ({
  cropId,
  harvestDate,
  quantity,
  quantityUnit,
  pricePerUnit,
  totalRevenue,
  quality,
  notes,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO harvests
      (
        crop_id,
        harvest_date,
        quantity,
        quantity_unit,
        price_per_unit,
        total_revenue,
        quality,
        notes
      )
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      cropId,
      harvestDate,
      quantity,
      quantityUnit,
      pricePerUnit,
      totalRevenue,
      quality,
      notes,
    ]
  );

  return result.insertId;
};


const updateHarvest = async ({
  harvestId,
  userId,
  cropId,
  harvestDate,
  quantity,
  quantityUnit,
  pricePerUnit,
  totalRevenue,
  quality,
  notes,
}) => {
  const [result] = await pool.query(
    `
    UPDATE harvests

    INNER JOIN crops
      ON harvests.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    SET
      harvests.crop_id = ?,
      harvests.harvest_date = ?,
      harvests.quantity = ?,
      harvests.quantity_unit = ?,
      harvests.price_per_unit = ?,
      harvests.total_revenue = ?,
      harvests.quality = ?,
      harvests.notes = ?

    WHERE harvests.id = ?
      AND farms.user_id = ?
    `,
    [
      cropId,
      harvestDate,
      quantity,
      quantityUnit,
      pricePerUnit,
      totalRevenue,
      quality,
      notes,
      harvestId,
      userId,
    ]
  );

  return result.affectedRows;
};


const deleteHarvest = async (
  harvestId,
  userId
) => {
  const [result] = await pool.query(
    `
    DELETE harvests
    FROM harvests

    INNER JOIN crops
      ON harvests.crop_id = crops.id

    INNER JOIN fields
      ON crops.field_id = fields.id

    INNER JOIN farms
      ON fields.farm_id = farms.id

    WHERE harvests.id = ?
      AND farms.user_id = ?
    `,
    [harvestId, userId]
  );

  return result.affectedRows;
};


module.exports = {
  getHarvestsByUserId,
  getHarvestById,
  createHarvest,
  updateHarvest,
  deleteHarvest,
};