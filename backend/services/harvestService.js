
const pool = require("../config/database");

const updateCropAfterHarvest = async ({
  cropId,
  harvestDate,
}) => {
  const [result] = await pool.query(
    `
    UPDATE crops
    SET
      actual_harvest_date = ?,
      status = 'harvested'
    WHERE id = ?
    `,
    [harvestDate, cropId]
  );

  return result.affectedRows;
};

const clearCropHarvestStatus = async (
  cropId,
  status = "growing"
) => {
  const [result] = await pool.query(
    `
    UPDATE crops
    SET
      actual_harvest_date = NULL,
      status = ?
    WHERE id = ?
    `,
    [status, cropId]
  );

  return result.affectedRows;
};

const synchronizeHarvestWithCrop = async ({
  cropId,
  harvestDate,
}) => {
  if (!cropId || !harvestDate) {
    throw new Error(
      "Crop ID and harvest date are required"
    );
  }

  const affectedRows =
    await updateCropAfterHarvest({
      cropId,
      harvestDate,
    });

  if (affectedRows === 0) {
    throw new Error(
      "Crop could not be updated after harvest"
    );
  }

  return {
    cropId,
    actualHarvestDate: harvestDate,
    status: "harvested",
  };
};

module.exports = {
  updateCropAfterHarvest,
  clearCropHarvestStatus,
  synchronizeHarvestWithCrop,
};

