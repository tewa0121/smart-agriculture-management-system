
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  // Redirect users who are not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check the user's role when roles are specified
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/farmer/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

