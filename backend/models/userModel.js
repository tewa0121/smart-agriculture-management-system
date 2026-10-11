const pool = require("../config/database");

// =====================================================
// Authentication functions
// =====================================================

const findByEmail = async (email) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      password,
      role,
      phone,
      address,
      is_active,
      created_at,
      updated_at
    FROM users
    WHERE email = ?
    LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      role,
      phone,
      address,
      is_active,
      created_at,
      updated_at
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const createUser = async ({
  name,
  email,
  password,
  role = "farmer",
  phone = null,
  address = null,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO users
      (
        name,
        email,
        password,
        role,
        phone,
        address
      )
    VALUES
      (?, ?, ?, ?, ?, ?)
    `,
    [
      name,
      email,
      password,
      role,
      phone,
      address,
    ]
  );

  return result.insertId;
};

// =====================================================
// Admin user-management functions
// =====================================================

const getAllUsers = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      role,
      phone,
      address,
      is_active,
      created_at,
      updated_at
    FROM users
    ORDER BY created_at DESC, id DESC
    `
  );

  return rows;
};

const getUserById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      role,
      phone,
      address,
      is_active,
      created_at,
      updated_at
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const updateUser = async ({
  id,
  name,
  email,
  role,
  phone,
  address,
  isActive,
}) => {
  const [result] = await pool.query(
    `
    UPDATE users
    SET
      name = ?,
      email = ?,
      role = ?,
      phone = ?,
      address = ?,
      is_active = ?
    WHERE id = ?
    `,
    [
      name,
      email,
      role,
      phone,
      address,
      isActive,
      id,
    ]
  );

  return result.affectedRows;
};

const updateUserPassword = async ({
  id,
  password,
}) => {
  const [result] = await pool.query(
    `
    UPDATE users
    SET password = ?
    WHERE id = ?
    `,
    [password, id]
  );

  return result.affectedRows;
};

const deleteUser = async (id) => {
  const [result] = await pool.query(
    `
    DELETE FROM users
    WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows;
};

const countUsersByRole = async (role) => {
  const [rows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM users
    WHERE role = ?
    `,
    [role]
  );

  return Number(rows[0].total);
};

module.exports = {
  // Authentication
  findByEmail,
  findById,
  createUser,

  // Admin management
  getAllUsers,
  getUserById,
  updateUser,
  updateUserPassword,
  deleteUser,
  countUsersByRole,
};