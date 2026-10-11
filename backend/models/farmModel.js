const pool = require("../config/database");

// Get all farms belonging to one farmer
const getFarmsByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      user_id,
      name,
      location,
      total_area,
      area_unit,
      description,
      created_at,
      updated_at
    FROM farms
    WHERE user_id = ?
    ORDER BY created_at DESC
    `,
    [userId]
  );

  return rows;
};

// Get all farms for admin monitoring
const getAllFarms = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      farms.id,
      farms.user_id,
      farms.name,
      farms.location,

      -- Calculate area using the farm's fields.
      COALESCE(field_summary.total_area, 0) AS total_area,

      COALESCE(
        field_summary.area_unit,
        farms.area_unit,
        'hectare'
      ) AS area_unit,

      farms.description,
      farms.created_at,
      farms.updated_at,

      -- Farmer information.
      users.name AS farmer_name,
      users.email AS farmer_email,

      -- Number of crop records associated with this farm.
      COALESCE(crop_summary.crop_count, 0) AS crop_count,

      -- Crop names associated with this farm.
      COALESCE(crop_summary.crop_names, '') AS crop_names

    FROM farms

    LEFT JOIN users
      ON farms.user_id = users.id

    -- Calculate each farm's field area independently.
    LEFT JOIN (
      SELECT
        farm_id,
        SUM(area) AS total_area,
        MAX(area_unit) AS area_unit
      FROM fields
      GROUP BY farm_id
    ) AS field_summary
      ON field_summary.farm_id = farms.id

    -- Count crops and collect crop names without duplicating field areas.
    LEFT JOIN (
      SELECT
        f.farm_id,
        COUNT(c.id) AS crop_count,
        GROUP_CONCAT(
          DISTINCT c.name
          ORDER BY c.name
          SEPARATOR ', '
        ) AS crop_names
      FROM fields f
      LEFT JOIN crops c
        ON c.field_id = f.id
      GROUP BY f.farm_id
    ) AS crop_summary
      ON crop_summary.farm_id = farms.id

    ORDER BY farms.created_at DESC, farms.id DESC
    `
  );

  return rows;
};

// Get one farm belonging to a specific farmer
const getFarmById = async (farmId, userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      user_id,
      name,
      location,
      total_area,
      area_unit,
      description,
      created_at,
      updated_at
    FROM farms
    WHERE id = ?
      AND user_id = ?
    LIMIT 1
    `,
    [farmId, userId]
  );

  return rows[0] || null;
};

// Create a farm
const createFarm = async ({
  userId,
  name,
  location,
  totalArea,
  areaUnit,
  description,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO farms (
      user_id,
      name,
      location,
      total_area,
      area_unit,
      description
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      name,
      location,
      totalArea,
      areaUnit,
      description,
    ]
  );

  return result.insertId;
};

// Update a farm belonging to a specific farmer
const updateFarm = async ({
  farmId,
  userId,
  name,
  location,
  totalArea,
  areaUnit,
  description,
}) => {
  const [result] = await pool.query(
    `
    UPDATE farms
    SET
      name = ?,
      location = ?,
      total_area = ?,
      area_unit = ?,
      description = ?
    WHERE id = ?
      AND user_id = ?
    `,
    [
      name,
      location,
      totalArea,
      areaUnit,
      description,
      farmId,
      userId,
    ]
  );

  return result.affectedRows;
};

// Delete a farm belonging to a specific farmer
const deleteFarm = async (farmId, userId) => {
  const [result] = await pool.query(
    `
    DELETE FROM farms
    WHERE id = ?
      AND user_id = ?
    `,
    [farmId, userId]
  );

  return result.affectedRows;
};

module.exports = {
  getFarmsByUserId,
  getAllFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
};