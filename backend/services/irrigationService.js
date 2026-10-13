const pool = require("../config/database");


// Get the latest irrigation record for each crop
const getLatestIrrigationByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      irrigation_records.id,
      irrigation_records.crop_id,
      irrigation_records.irrigation_date,
      irrigation_records.interval_days,
      irrigation_records.quantity,
      irrigation_records.quantity_unit,
      irrigation_records.cost,
      irrigation_records.notes,

      crops.name AS crop_name,
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

      AND irrigation_records.id = (
        SELECT MAX(ir2.id)
        FROM irrigation_records AS ir2
        WHERE ir2.crop_id = irrigation_records.crop_id
      )

    ORDER BY irrigation_records.irrigation_date DESC
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


// Calculate irrigation reminder information
const getIrrigationReminders = async (userId) => {
  const records =
    await getLatestIrrigationByUserId(userId);

  const today = getTodayString();

  return records.map((record) => {
    let nextIrrigationDate = null;
    let status = "no_schedule";

    if (
      record.interval_days !== null &&
      record.interval_days !== undefined &&
      Number(record.interval_days) > 0
    ) {
      nextIrrigationDate = addDaysToDate(
        record.irrigation_date,
        Number(record.interval_days)
      );

      if (nextIrrigationDate <= today) {
        status = "due";
      } else {
        const todayDate = new Date(
          `${today}T00:00:00`
        );

        const nextDate = new Date(
          `${nextIrrigationDate}T00:00:00`
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
      irrigation_id: record.id,
      crop_id: record.crop_id,
      crop_name: record.crop_name,

      farm_id: record.farm_id,
      farm_name: record.farm_name,

      field_id: record.field_id,
      field_name: record.field_name,

      irrigation_method_name:
        record.irrigation_method_name,

      last_irrigation_date:
        record.irrigation_date,

      interval_days:
        record.interval_days,

      next_irrigation_date:
        nextIrrigationDate,

      quantity: record.quantity,
      quantity_unit:
        record.quantity_unit,

      status,
    };
  });
};


module.exports = {
  getLatestIrrigationByUserId,
  getIrrigationReminders,
};