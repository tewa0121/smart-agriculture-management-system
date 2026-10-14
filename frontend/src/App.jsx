import { Navigate, Route, Routes } from "react-router-dom";

// Authentication
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import FarmerManagement from "./pages/admin/FarmerManagement";
import FarmMonitoring from "./pages/admin/FarmMonitoring";
import FarmPerformanceReport from "./pages/admin/FarmPerformanceReport";
import FarmComparison from "./pages/admin/FarmComparison";

// Farmer pages
import Dashboard from "./pages/farmer/Dashboard";
import Farms from "./pages/farmer/Farms";
import Fields from "./pages/farmer/Fields";
import Crops from "./pages/farmer/Crops";
import Irrigation from "./pages/farmer/Irrigation";
import Fertilizers from "./pages/farmer/Fertilizers";
import Pesticides from "./pages/farmer/Pesticides";
import Activities from "./pages/farmer/Activities";
import Expenses from "./pages/farmer/Expenses";
import Harvests from "./pages/farmer/Harvests";
import Weather from "./pages/farmer/Weather";
import Reports from "./pages/farmer/Reports";
import ApplySupplies from "./pages/farmer/ApplySupplies";
import Applications from "./pages/admin/Applications";

// Layout and route protection
import AdminLayout from "./layouts/AdminLayout";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* Protected admin routes: admin role only */}
      <Route
        element={<ProtectedRoute allowedRoles={["admin"]} />}
      >
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="users"
            element={<UserManagement />}
          />

          <Route
            path="farmers"
            element={<FarmerManagement />}
          />

          <Route
            path="farms"
            element={<FarmMonitoring />}
          />

          <Route
            path="reports"
            element={<FarmPerformanceReport />}
          />

          <Route
            path="farm-comparison"
            element={<FarmComparison />}
          />
        </Route>
      </Route>

      {/* Protected farmer routes: farmer role only */}
      <Route
        element={<ProtectedRoute allowedRoles={["farmer"]} />}
      >
        <Route
          path="/farmer"
          element={<MainLayout />}
        >
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          <Route
            path="farms"
            element={<Farms />}
          />

          <Route
            path="fields"
            element={<Fields />}
          />

          <Route
            path="crops"
            element={<Crops />}
          />

          <Route
            path="irrigation"
            element={<Irrigation />}
          />

          <Route
            path="fertilizers"
            element={<Fertilizers />}
          />

          <Route
            path="pesticides"
            element={<Pesticides />}
          />

          <Route
            path="activities"
            element={<Activities />}
          />

          <Route
            path="expenses"
            element={<Expenses />}
          />

          <Route
            path="harvests"
            element={<Harvests />}
          />

          <Route
            path="weather"
            element={<Weather />}
          />

          <Route
            path="reports"
            element={<Reports />}
          />
          <Route
  path="applications"
  element={<Applications />}
/>
          <Route
  path="apply-supplies"
  element={<ApplySupplies />}
/>
        </Route>
      </Route>

      {/* Redirect unknown URLs */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;