const pool = require("../config/database");

const createApplication = async ({
  farmerId,
  supplyType,
  productName,
  quantity,
  unit,
  cropName,
  farmLocation,
  reason,
}) => {
  const [result] = await pool.query(
    `INSERT INTO supply_applications (
      farmer_id,
      supply_type,
      product_name,
      quantity,
      unit,
      crop_name,
      farm_location,
      reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      farmerId,
      supplyType,
      productName,
      quantity,
      unit,
      cropName || null,
      farmLocation || null,
      reason || null,
    ]
  );

  return result.insertId;
};

const getFarmerApplications = async (farmerId) => {
  const [rows] = await pool.query(
    `SELECT *
     FROM supply_applications
     WHERE farmer_id = ?
     ORDER BY created_at DESC`,
    [farmerId]
  );

  return rows;
};

const getAllApplications = async () => {
  const [rows] = await pool.query(
    `SELECT
       a.*,
       u.name AS farmer_name,
       u.email AS farmer_email,
       u.phone AS farmer_phone
     FROM supply_applications a
     INNER JOIN users u ON u.id = a.farmer_id
     ORDER BY
       CASE WHEN a.status = 'pending' THEN 0 ELSE 1 END,
       a.created_at DESC`
  );

  return rows;
};

const updateApplicationStatus = async ({
  applicationId,
  status,
  adminNotes,
  adminId,
}) => {
  const [result] = await pool.query(
    `UPDATE supply_applications
     SET status = ?,
         admin_notes = ?,
         reviewed_by = ?,
         reviewed_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, adminNotes || null, adminId, applicationId]
  );

  return result.affectedRows;
};

module.exports = {
  createApplication,
  getFarmerApplications,
  getAllApplications,
  updateApplicationStatus,
};