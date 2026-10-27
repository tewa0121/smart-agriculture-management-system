import { useState, useEffect } from "react";
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
  FaSun,
  FaMoon,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  const { user, logout } = useAuth();

  useEffect(() => {
    // አውቶማቲክ ቀን እና ዕለት ማመጣጫ (Automatic Day & Date)
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));
  }, []);

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <FaChartLine /> },
    { label: "User Management", path: "/admin/users", icon: <FaUsers /> },
    { label: "Farmer Management", path: "/admin/farmers", icon: <FaSeedling /> },
    { label: "Farm Monitoring", path: "/admin/farms", icon: <FaTractor /> },
    { label: "Reports", path: "/admin/reports", icon: <FaFileAlt /> },
    { label: "Farm Comparison", path: "/admin/farm-comparison", icon: <FaBalanceScale /> },
    { label: "Supply Applications", path: "/admin/applications", icon: <FaClipboardList /> },
  ];

  return (
    <div className={`d-flex min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
          style={{ zIndex: 1039 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sticky Sidebar */}
      <aside
        className={`farmer-sidebar ${darkMode ? "bg-black text-white border-end border-secondary" : "bg-dark text-white"} d-flex flex-column position-sticky top-0 ${
          sidebarOpen ? "d-flex" : ""
        }`}
        style={{
          width: "260px",
          minWidth: "260px",
          height: "100vh",
          maxHeight: "100vh",
          overflowY: "auto",
          zIndex: 1040,
        }}
      >
        <div className="px-4 py-3 border-bottom border-secondary flex-shrink-0">
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

        <nav className="px-3 pt-3 pb-2 flex-grow-1 overflow-y-auto">
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
                    isActive ? "bg-success text-white" : darkMode ? "text-light" : "text-light"
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className={`px-3 pt-3 pb-3 border-top border-secondary flex-shrink-0 ${darkMode ? "bg-black" : "bg-dark"}`}>
          <div className="px-2 mb-2">
            <small className="text-secondary">Signed in as</small>
            <div className="fw-semibold">{user?.name || "Administrator"}</div>
            <small className="text-secondary">{user?.email || ""}</small>
          </div>

          <button
            type="button"
            className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 text-white border-0"
            style={{ backgroundColor: "#198754" }}
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-grow-1 overflow-x-hidden">
        {/* Header with Automatic Date & Theme Toggle */}
        <header className={`border-bottom px-3 px-md-4 py-3 sticky-top ${darkMode ? "bg-dark text-white border-secondary" : "bg-white text-dark"}`} style={{ zIndex: 1020 }}>
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
                <small className={darkMode ? "text-light opacity-75" : "text-muted"}>
                  📅 {currentDate}
                </small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              {/* Dark / Sunny Mode Toggle Button */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`btn btn-sm rounded-pill px-3 py-2 d-flex align-items-center gap-2 ${
                  darkMode ? "btn-warning text-dark" : "btn-dark text-white"
                }`}
                title="Toggle Theme"
              >
                {darkMode ? <FaSun /> : <FaMoon />}
                <span className="d-none d-sm-inline">{darkMode ? "Sunny Mode" : "Dark Mode"}</span>
              </button>

              <div className="text-end d-none d-sm-block">
                <div className="fw-semibold">{user?.name || "Administrator"}</div>
                <small className={darkMode ? "text-light opacity-75" : "text-muted"}>Administrator</small>
              </div>
            </div>
          </div>
        </header>

        <div className="p-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;