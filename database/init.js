const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// Load .env from the project root
require("dotenv").config({
  path: path.join(__dirname, "..", ".env")
});

async function initDatabase() {
  let connection;

  try {
    // Check environment variables
    console.log("Database host:", process.env.DB_HOST);
    console.log("Database port:", process.env.DB_PORT);
    console.log("Database user:", process.env.DB_USER);
    console.log("Database name:", process.env.DB_NAME);

    // Connect to MySQL server without selecting a database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log("Connected to MySQL server.");

    // Create database if it does not exist
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
    );

    console.log(`Database '${process.env.DB_NAME}' is ready.`);

    // Select database
    await connection.query(
      `USE \`${process.env.DB_NAME}\``
    );

    console.log(`Using database '${process.env.DB_NAME}'.`);

    // Read schema.sql
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    console.log("Reading schema.sql...");

    // Execute schema
    await connection.query(schema);

    console.log("Schema executed successfully.");

    // Show created tables
    const [tables] = await connection.query("SHOW TABLES");

    console.log(`Total tables: ${tables.length}`);

    console.table(tables);

  } catch (error) {
    console.error("Database initialization failed:");
    console.error(error);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
  } finally {
    if (connection) {
      await connection.end();
      console.log("MySQL connection closed.");
    }
  }
}

initDatabase();