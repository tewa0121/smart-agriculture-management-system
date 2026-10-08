
const mysql = require("mysql2/promise");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", "..", ".env"),
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // Keep MySQL DATE values as YYYY-MM-DD strings.
  dateStrings: true,
});

// TEMPORARY DIAGNOSTIC LOGGING
// This logs DELETE statements so we can identify
// what operation is actually deleting Crop 1.

const originalQuery = pool.query.bind(pool);

pool.query = async (...args) => {
  const sql = typeof args[0] === "string"
    ? args[0]
    : args[0]?.sql || "";

  if (sql.trim().toUpperCase().startsWith("DELETE")) {
    console.log("\n========== DELETE SQL ==========");
    console.log(sql);
    console.log("VALUES:", args[1] || args[0]?.values || []);
    console.log("================================\n");
  }

  return originalQuery(...args);
};

module.exports = pool;

