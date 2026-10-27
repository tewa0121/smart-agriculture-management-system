import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  FaChartLine,
  FaUsers,
  FaSeedling,
  FaTractor,
  FaFileAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBalanceScale,
  FaClipboardList,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  // Admin sidebar navigation items
  const navItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <FaChartLine />,
    },
    {
      label: "User Management",
      path: "/admin/users",
      icon: <FaUsers />,
    },
    {
      label: "Farmer Management",
      path: "/admin/farmers",
      icon: <FaSeedling />,
    },
    {
      label: "Farm Monitoring",
      path: "/admin/farms",
      icon: <FaTractor />,
    },
    {
      label: "Reports",
      path: "/admin/reports",
      icon: <FaFileAlt />,
    },
    {
      label: "Farm Comparison",
      path: "/admin/farm-comparison",
      icon: <FaBalanceScale />,
    },
    {
      label: "Supply Applications",
      path: "/admin/applications",
      icon: <FaClipboardList />,
    },
  ];

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
          style={{ zIndex: 1039 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`farmer-sidebar bg-dark text-white d-flex flex-column ${
          sidebarOpen ? "d-flex" : ""
        }`}
        style={{
          width: "260px",
          minWidth: "260px",
          minHeight: "100vh",
          zIndex: 1040,
        }}
      >
        {/* Logo */}
        <div className="px-4 py-3 border-bottom border-secondary">
          <div className="d-flex align-items-center gap-2">
            <div
              className="bg-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: "42px", height: "42px" }}
            >
              <FaSeedling size={21} />
            </div>

            <div>
              <h5 className="mb-0 fw-bold">Smart Agriculture</h5>
              <small className="text-secondary">Administration</small>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 pt-3 pb-2">
          <div className="text-uppercase text-secondary small fw-bold px-3 mb-2">
            Admin Menu
          </div>

          <div className="d-flex flex-column gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin/dashboard"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link text-decoration-none rounded px-3 py-2 d-flex align-items-center gap-3 ${
                    isActive ? "bg-success text-white" : "text-light"
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User and logout */}
        <div className="px-3 pt-3 pb-3 border-top border-secondary mt-auto">
          <div className="px-2 mb-2">
            <small className="text-secondary">Signed in as</small>
            <div className="fw-semibold">{user?.name || "Administrator"}</div>
            <small className="text-secondary">{user?.email || ""}</small>
          </div>

          <button
            type="button"
            className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 text-white border-0"
            style={{
              backgroundColor: "#198754",
              transition: "background-color 0.2s ease",
            }}
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-grow-1">
        <header className="bg-white border-bottom px-3 px-md-4 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="btn btn-outline-success d-md-none"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <FaTimes /> : <FaBars />}
              </button>

              <div>
                <h5 className="mb-0 fw-semibold">Admin Portal</h5>
                <small className="text-muted d-none d-sm-block">
                  Manage users and agricultural operations
                </small>
              </div>
            </div>

            <div className="text-end d-none d-sm-block">
              <div className="fw-semibold">{user?.name || "Administrator"}</div>
              <small className="text-muted">Administrator</small>
            </div>
          </div>
        </header>

        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;