const getCropStatus = ({
  plantingDate,
  expectedHarvestDate,
  actualHarvestDate,
}) => {
  // If the crop has already been harvested
  if (actualHarvestDate) {
    return "harvested";
  }

  // If required dates are missing
  if (!plantingDate || !expectedHarvestDate) {
    return "planned";
  }

  // Use today's date without timezone conversion
  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  // Crop has not been planted yet
  if (todayString < plantingDate) {
    return "planned";
  }

  // Crop has reached/passed its expected harvest date
  if (todayString >= expectedHarvestDate) {
    return "ready_for_harvest";
  }

  // Crop has been planted and is still growing
  return "growing";
};

module.exports = {
  getCropStatus,
};