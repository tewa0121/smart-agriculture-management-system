import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaCog, FaSignOutAlt } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../utils/getInitials";

// Circle with the user's initials (e.g. "Henok Lema" -> HL).
// Click it to open: profile summary, Settings, Logout.
function UserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const role = user?.role === "admin" ? "admin" : "farmer";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        as="button"
        type="button"
        bsPrefix="user-avatar"
        id="user-menu-toggle"
        title={user?.name || "Account"}
        aria-label="Open account menu"
      >
        {getInitials(user?.name)}
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow user-menu">
        <div className="px-3 py-2 d-flex align-items-center gap-3">
          <div className="user-avatar user-avatar-lg">
            {getInitials(user?.name)}
          </div>

          <div style={{ minWidth: 0 }}>
            <div className="fw-semibold text-truncate">
              {user?.name || "User"}
            </div>
            <div className="small text-body-secondary text-truncate">
              {user?.email || ""}
            </div>
            <span className="badge text-bg-success text-capitalize mt-1">
              {role}
            </span>
          </div>
        </div>

        <Dropdown.Divider />

        <Dropdown.Item
          className="d-flex align-items-center gap-2"
          onClick={() => navigate(`/${role}/settings`)}
        >
          <FaCog /> Settings
        </Dropdown.Item>

        <Dropdown.Item
          className="d-flex align-items-center gap-2 text-danger"
          onClick={handleLogout}
        >
          <FaSignOutAlt /> Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default UserMenu;
