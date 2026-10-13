const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
  override: true,
});

const pool = require("./config/database");

// ===============================
// Import Routes
// ===============================

const authRoutes = require("./routes/authRoutes");
const farmRoutes = require("./routes/farmRoutes");
const fieldRoutes = require("./routes/fieldRoutes");
const cropTypeRoutes = require("./routes/cropTypeRoutes");
const cropRoutes = require("./routes/cropRoutes");
const irrigationRoutes = require("./routes/irrigationRoutes");
const fertilizerRoutes = require("./routes/fertilizerRoutes");
const pesticideRoutes = require("./routes/pesticideRoutes");
const activityRoutes = require("./routes/activityRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const harvestRoutes = require("./routes/harvestRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const farmPerformanceRoutes = require("./routes/farmPerformanceRoutes");
const farmComparisonRoutes = require("./routes/farmComparisonRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

// Error middleware
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// ===============================
// Validate Imports
// ===============================

const routeModules = {
  authRoutes,
  farmRoutes,
  fieldRoutes,
  cropTypeRoutes,
  cropRoutes,
  irrigationRoutes,
  fertilizerRoutes,
  pesticideRoutes,
  activityRoutes,
  expenseRoutes,
  harvestRoutes,
  weatherRoutes,
  dashboardRoutes,
  userRoutes,
  reportRoutes,
  adminDashboardRoutes,
  farmPerformanceRoutes,
  farmComparisonRoutes,
  applicationRoutes,
};

for (const [name, router] of Object.entries(routeModules)) {
  if (
    typeof router !== "function" ||
    typeof router.use !== "function"
  ) {
    throw new TypeError(
      `${name} is not a valid Express router. Check its module.exports.`
    );
  }
}

if (typeof errorMiddleware !== "function") {
  throw new TypeError(
    "errorMiddleware must export an Express error-handling function."
  );
}

// ===============================
// Global Middleware
// ===============================

app.use(helmet());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());

// ===============================
// Root
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Agriculture Management API is running",
  });
});

// ===============================
// Health Check
// ===============================

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT 1 AS database_connected"
    );

    res.json({
      success: true,
      message: "API and database are working",
      database: rows[0].database_connected === 1,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// ===============================
// API Routes
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/crop-types", cropTypeRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/irrigation", irrigationRoutes);
app.use("/api/fertilizer", fertilizerRoutes);
app.use("/api/pesticide", pesticideRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/harvests", harvestRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin-dashboard", adminDashboardRoutes);
app.use("/api/farm-performance", farmPerformanceRoutes);
app.use("/api/farm-comparison", farmComparisonRoutes);
app.use("/api/applications", applicationRoutes);

// ===============================
// CORS Test
// ===============================

app.get("/api/cors-test", (req, res) => {
  res.json({
    success: true,
    origin: req.headers.origin || null,
  });
});

// ===============================
// Error Handling
// Must be registered last
// ===============================

app.use(errorMiddleware);

// ===============================
// Start Server
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});