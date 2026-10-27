import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  FaChartLine,
  FaSeedling,
  FaTractor,
  FaMapMarkedAlt,
  FaTint,
  FaFlask,
  FaBug,
  FaClipboardList,
  FaMoneyBillWave,
  FaLeaf,
  FaCloudSun,
  FaFileAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaPaperPlane,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

function MainLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  const navItems = [
    { label: "Dashboard", path: "/farmer/dashboard", icon: <FaChartLine /> },
    { label: "My Farms", path: "/farmer/farms", icon: <FaTractor /> },
    { label: "Fields", path: "/farmer/fields", icon: <FaMapMarkedAlt /> },
    { label: "Crops", path: "/farmer/crops", icon: <FaSeedling /> },
    { label: "Irrigation", path: "/farmer/irrigation", icon: <FaTint /> },
    { label: "Fertilizers", path: "/farmer/fertilizers", icon: <FaFlask /> },
    { label: "Pesticides", path: "/farmer/pesticides", icon: <FaBug /> },
    { label: "Activities", path: "/farmer/activities", icon: <FaClipboardList /> },
    { label: "Expenses", path: "/farmer/expenses", icon: <FaMoneyBillWave /> },
    { label: "Harvests", path: "/farmer/harvests", icon: <FaLeaf /> },
    { label: "Weather", path: "/farmer/weather", icon: <FaCloudSun /> },
    { label: "Reports", path: "/farmer/reports", icon: <FaFileAlt /> },
    { label: "Request Supplies", path: "/farmer/apply-supplies", icon: <FaPaperPlane /> },
  ];

  return (
    <div className="d-flex min-vh-100 bg-light">
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
          style={{ zIndex: 1039 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
        <div className="px-4 py-3 border-bottom border-secondary">
          <div className="d-flex align-items-center gap-2 sidebar-brand">
            <div
              className="bg-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: "42px", height: "42px" }}
            >
              <FaSeedling size={21} />
            </div>

            <div className="sidebar-brand-text">
              <h5 className="mb-0 fw-bold">Smart Agriculture</h5>
              <small className="text-secondary">Management System</small>
            </div>
          </div>
        </div>

        <nav className="px-3 pt-3 pb-2">
          <div className="text-uppercase text-secondary small fw-bold px-3 mb-2 sidebar-menu-label">
            Farmer Menu
          </div>

          <div className="d-flex flex-column gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link text-decoration-none rounded px-3 py-2 d-flex align-items-center gap-3 ${
                    isActive ? "bg-success text-white" : "text-light"
                  }`
                }
              >
                {item.icon}
                <span className="sidebar-menu-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="px-3 pt-2 pb-3 border-top border-secondary mt-auto">
          <div className="px-2 mb-2 sidebar-user-info">
            <small className="text-secondary">Signed in as</small>
            <div className="fw-semibold">{user?.name || "Farmer"}</div>
          </div>

          <button
            type="button"
            className="sidebar-logout btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 text-white border-0"
            style={{
              backgroundColor: "#198754",
              transition: "background-color 0.2s ease",
            }}
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span className="sidebar-logout-text">Logout</span>
          </button>
        </div>
      </aside>

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
                <h5 className="mb-0 fw-semibold">Farmer Portal</h5>
                <small className="text-muted d-none d-sm-block">
                  Manage your agricultural operations
                </small>
              </div>
            </div>

            <div className="text-end d-none d-sm-block">
              <div className="fw-semibold">{user?.name || "Farmer"}</div>
              <small className="text-muted">{user?.email || ""}</small>
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

export default MainLayout;