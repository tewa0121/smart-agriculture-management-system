const pool = require("../config/database");

const getWeatherRecordsByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      weather_records.id,
      weather_records.farm_id,
      weather_records.record_date,
      weather_records.temperature,
      weather_records.humidity,
      weather_records.rainfall,
      weather_records.wind_speed,
      weather_records.weather_condition,
      weather_records.notes,
      weather_records.created_at,
      weather_records.updated_at,

      farms.name AS farm_name

    FROM weather_records

    INNER JOIN farms
      ON weather_records.farm_id = farms.id

    WHERE farms.user_id = ?

    ORDER BY
      weather_records.record_date DESC,
      weather_records.id DESC
    `,
    [userId]
  );

  return rows;
};

const getWeatherRecordById = async (
  weatherId,
  userId
) => {
  const [rows] = await pool.query(
    `
    SELECT
      weather_records.id,
      weather_records.farm_id,
      weather_records.record_date,
      weather_records.temperature,
      weather_records.humidity,
      weather_records.rainfall,
      weather_records.wind_speed,
      weather_records.weather_condition,
      weather_records.notes,
      weather_records.created_at,
      weather_records.updated_at,

      farms.name AS farm_name

    FROM weather_records

    INNER JOIN farms
      ON weather_records.farm_id = farms.id

    WHERE weather_records.id = ?
      AND farms.user_id = ?

    LIMIT 1
    `,
    [weatherId, userId]
  );

  return rows[0] || null;
};

const createWeatherRecord = async ({
  farmId,
  recordDate,
  temperature,
  humidity,
  rainfall,
  windSpeed,
  weatherCondition,
  notes,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO weather_records
      (
        farm_id,
        record_date,
        temperature,
        humidity,
        rainfall,
        wind_speed,
        weather_condition,
        notes
      )
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      farmId,
      recordDate,
      temperature,
      humidity,
      rainfall,
      windSpeed,
      weatherCondition,
      notes,
    ]
  );

  return result.insertId;
};

const updateWeatherRecord = async ({
  weatherId,
  userId,
  farmId,
  recordDate,
  temperature,
  humidity,
  rainfall,
  windSpeed,
  weatherCondition,
  notes,
}) => {
  const [result] = await pool.query(
    `
    UPDATE weather_records

    INNER JOIN farms
      ON weather_records.farm_id = farms.id

    SET
      weather_records.farm_id = ?,
      weather_records.record_date = ?,
      weather_records.temperature = ?,
      weather_records.humidity = ?,
      weather_records.rainfall = ?,
      weather_records.wind_speed = ?,
      weather_records.weather_condition = ?,
      weather_records.notes = ?

    WHERE weather_records.id = ?
      AND farms.user_id = ?
    `,
    [
      farmId,
      recordDate,
      temperature,
      humidity,
      rainfall,
      windSpeed,
      weatherCondition,
      notes,
      weatherId,
      userId,
    ]
  );

  return result.affectedRows;
};

const deleteWeatherRecord = async (
  weatherId,
  userId
) => {
  const [result] = await pool.query(
    `
    DELETE weather_records
    FROM weather_records

    INNER JOIN farms
      ON weather_records.farm_id = farms.id

    WHERE weather_records.id = ?
      AND farms.user_id = ?
    `,
    [weatherId, userId]
  );

  return result.affectedRows;
};

module.exports = {
  getWeatherRecordsByUserId,
  getWeatherRecordById,
  createWeatherRecord,
  updateWeatherRecord,
  deleteWeatherRecord,
};