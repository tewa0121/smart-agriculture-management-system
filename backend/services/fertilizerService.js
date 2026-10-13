const pool = require("../config/database");


// Get the latest fertilizer record for each crop
const getLatestFertilizerByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      fertilizer_records.id,
      fertilizer_records.crop_id,
      fertilizer_records.application_date,
      fertilizer_records.interval_days,
      fertilizer_records.quantity,
      fertilizer_records.quantity_unit,
      fertilizer_records.cost,
      fertilizer_records.notes,

      crops.name AS crop_name,
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

      AND fertilizer_records.id = (
        SELECT MAX(fr2.id)
        FROM fertilizer_records AS fr2
        WHERE fr2.crop_id = fertilizer_records.crop_id
      )

    ORDER BY fertilizer_records.application_date DESC
    `,
    [userId]
  );

  return rows;
};


// Add days to a YYYY-MM-DD date
const addDaysToDate = (dateString, days) => {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  date.setDate(date.getDate() + days);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};


// Get today's date as YYYY-MM-DD
const getTodayString = () => {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
};


// Calculate fertilizer reminder information
const getFertilizerReminders = async (userId) => {
  const records =
    await getLatestFertilizerByUserId(userId);

  const today = getTodayString();

  return records.map((record) => {
    let nextFertilizerDate = null;
    let status = "no_schedule";

    if (
      record.interval_days !== null &&
      record.interval_days !== undefined &&
      Number(record.interval_days) > 0
    ) {
      nextFertilizerDate = addDaysToDate(
        record.application_date,
        Number(record.interval_days)
      );

      if (nextFertilizerDate <= today) {
        status = "due";
      } else {
        const todayDate = new Date(
          `${today}T00:00:00`
        );

        const nextDate = new Date(
          `${nextFertilizerDate}T00:00:00`
        );

        const difference =
          Math.ceil(
            (
              nextDate.getTime() -
              todayDate.getTime()
            ) /
              (1000 * 60 * 60 * 24)
          );

        if (difference <= 3) {
          status = "due_soon";
        } else {
          status = "scheduled";
        }
      }
    }

    return {
      fertilizer_id: record.id,
      crop_id: record.crop_id,
      crop_name: record.crop_name,

      farm_id: record.farm_id,
      farm_name: record.farm_name,

      field_id: record.field_id,
      field_name: record.field_name,

      fertilizer_type_name:
        record.fertilizer_type_name,

      last_application_date:
        record.application_date,

      interval_days:
        record.interval_days,

      next_fertilizer_date:
        nextFertilizerDate,

      quantity: record.quantity,
      quantity_unit:
        record.quantity_unit,

      status,
    };
  });
};


module.exports = {
  getLatestFertilizerByUserId,
  getFertilizerReminders,
};