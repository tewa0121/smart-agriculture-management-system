const pool = require("../config/database");


// Get all farm activities for the logged-in farmer
const getActivitiesByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      farm_activities.id,
      farm_activities.crop_id,
      farm_activities.field_id,
      farm_activities.activity_type,
      farm_activities.activity_date,
      farm_activities.description,
      farm_activities.labor_cost,
      farm_activities.created_at,
      farm_activities.updated_at,

      crops.name AS crop_name,

      fields.name AS field_name,

      farms.id AS farm_id,
      farms.name AS farm_name

    FROM farm_activities

    LEFT JOIN crops
      ON farm_activities.crop_id = crops.id

    LEFT JOIN fields
      ON fields.id = COALESCE(
        farm_activities.field_id,
        crops.field_id
      )

    INNER JOIN farms
      ON fields.farm_id = farms.id

    WHERE farms.user_id = ?

    ORDER BY
      farm_activities.activity_date DESC,
      farm_activities.id DESC
    `,
    [userId]
  );

  return rows;
};


// Get one farm activity
const getActivityById = async (
  activityId,
  userId
) => {
  const [rows] = await pool.query(
    `
    SELECT
      farm_activities.id,
      farm_activities.crop_id,
      farm_activities.field_id,
      farm_activities.activity_type,
      farm_activities.activity_date,
      farm_activities.description,
      farm_activities.labor_cost,
      farm_activities.created_at,
      farm_activities.updated_at,

      crops.name AS crop_name,

      fields.name AS field_name,

      farms.id AS farm_id,
      farms.name AS farm_name

    FROM farm_activities

    LEFT JOIN crops
      ON farm_activities.crop_id = crops.id

    LEFT JOIN fields
      ON fields.id = COALESCE(
        farm_activities.field_id,
        crops.field_id
      )

    INNER JOIN farms
      ON fields.farm_id = farms.id

    WHERE farm_activities.id = ?
      AND farms.user_id = ?

    LIMIT 1
    `,
    [activityId, userId]
  );

  return rows[0] || null;
};


// Create farm activity
const createActivity = async ({
  cropId,
  fieldId,
  activityType,
  activityDate,
  description,
  laborCost,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO farm_activities
      (
        crop_id,
        field_id,
        activity_type,
        activity_date,
        description,
        labor_cost
      )
    VALUES
      (?, ?, ?, ?, ?, ?)
    `,
    [
      cropId,
      fieldId,
      activityType,
      activityDate,
      description,
      laborCost,
    ]
  );

  return result.insertId;
};


// Update farm activity
const updateActivity = async ({
  activityId,
  userId,
  cropId,
  fieldId,
  activityType,
  activityDate,
  description,
  laborCost,
}) => {
  const [result] = await pool.query(
    `
    UPDATE farm_activities

    LEFT JOIN crops
      ON farm_activities.crop_id = crops.id

    LEFT JOIN fields
      ON fields.id = COALESCE(
        farm_activities.field_id,
        crops.field_id
      )

    INNER JOIN farms
      ON fields.farm_id = farms.id

    SET
      farm_activities.crop_id = ?,
      farm_activities.field_id = ?,
      farm_activities.activity_type = ?,
      farm_activities.activity_date = ?,
      farm_activities.description = ?,
      farm_activities.labor_cost = ?

    WHERE farm_activities.id = ?
      AND farms.user_id = ?
    `,
    [
      cropId,
      fieldId,
      activityType,
      activityDate,
      description,
      laborCost,
      activityId,
      userId,
    ]
  );

  return result.affectedRows;
};


// Delete farm activity
const deleteActivity = async (
  activityId,
  userId
) => {
  const [result] = await pool.query(
    `
    DELETE farm_activities
    FROM farm_activities

    LEFT JOIN crops
      ON farm_activities.crop_id = crops.id

    LEFT JOIN fields
      ON fields.id = COALESCE(
        farm_activities.field_id,
        crops.field_id
      )

    INNER JOIN farms
      ON fields.farm_id = farms.id

    WHERE farm_activities.id = ?
      AND farms.user_id = ?
    `,
    [activityId, userId]
  );

  return result.affectedRows;
};


module.exports = {
  getActivitiesByUserId,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
};