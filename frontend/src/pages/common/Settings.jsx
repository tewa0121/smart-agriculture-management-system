import { useState } from "react";
import { FaLock, FaMoon, FaPalette, FaSun, FaUser } from "react-icons/fa";

import api from "../../services/api";
import PasswordInput from "../../components/common/PasswordInput";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getInitials } from "../../utils/getInitials";

function Message({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`alert alert-${message.type} py-2`} role="alert">
      {message.text}
    </div>
  );
}

function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [profileMessage, setProfileMessage] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((previous) => ({ ...previous, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((previous) => ({ ...previous, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileMessage(null);

    if (!profile.name.trim()) {
      setProfileMessage({ type: "danger", text: "Name is required." });
      return;
    }

    setProfileSaving(true);

    try {
      const response = await api.put("/auth/profile", profile);

      updateUser(response.data.data.user);
      setProfileMessage({
        type: "success",
        text: "Profile updated successfully.",
      });
    } catch (error) {
      setProfileMessage({
        type: "danger",
        text: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordMessage(null);

    if (passwords.newPassword.length < 6) {
      setPasswordMessage({
        type: "danger",
        text: "New password must be at least 6 characters long.",
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMessage({
        type: "danger",
        text: "New passwords do not match.",
      });
      return;
    }

    setPasswordSaving(true);

    try {
      await api.put("/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMessage({
        type: "success",
        text: "Password changed successfully.",
      });
    } catch (error) {
      setPasswordMessage({
        type: "danger",
        text: error.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="mx-auto" style={{ maxWidth: "820px" }}>
        <h4 className="fw-bold mb-1">Settings</h4>
        <p className="text-body-secondary mb-4">
          Manage your profile, appearance and password.
        </p>

        {/* Profile */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="user-avatar user-avatar-lg">
                {getInitials(user?.name)}
              </div>
              <div>
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <FaUser /> Profile
                </h5>
                <small className="text-body-secondary">
                  {user?.email} ·{" "}
                  <span className="text-capitalize">{user?.role}</span>
                </small>
              </div>
            </div>

            <Message message={profileMessage} />

            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label htmlFor="name" className="form-label fw-semibold">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    className="form-control"
                    value={profile.name}
                    onChange={handleProfileChange}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Email (cannot be changed)
                  </label>
                  <input
                    id="email"
                    className="form-control"
                    value={user?.email || ""}
                    disabled
                    readOnly
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="phone" className="form-label fw-semibold">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    className="form-control"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    maxLength={30}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="address" className="form-label fw-semibold">
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    className="form-control"
                    value={profile.address}
                    onChange={handleProfileChange}
                    maxLength={255}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success mt-4"
                disabled={profileSaving}
              >
                {profileSaving ? "Saving..." : "Save profile"}
              </button>
            </form>
          </div>
        </div>

        {/* Appearance */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h5 className="d-flex align-items-center gap-2 mb-3">
              <FaPalette /> Appearance
            </h5>

            <div className="btn-group" role="group" aria-label="Theme">
              <button
                type="button"
                className={`btn d-flex align-items-center gap-2 ${
                  theme === "light" ? "btn-success" : "btn-outline-success"
                }`}
                onClick={() => setTheme("light")}
              >
                <FaSun /> Sunny
              </button>

              <button
                type="button"
                className={`btn d-flex align-items-center gap-2 ${
                  theme === "dark" ? "btn-success" : "btn-outline-success"
                }`}
                onClick={() => setTheme("dark")}
              >
                <FaMoon /> Dark
              </button>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h5 className="d-flex align-items-center gap-2 mb-3">
              <FaLock /> Change password
            </h5>

            <Message message={passwordMessage} />

            <form onSubmit={handlePasswordSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label
                    htmlFor="currentPassword"
                    className="form-label fw-semibold"
                  >
                    Current password
                  </label>
                  <PasswordInput
                    id="currentPassword"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label
                    htmlFor="newPassword"
                    className="form-label fw-semibold"
                  >
                    New password
                  </label>
                  <PasswordInput
                    id="newPassword"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label
                    htmlFor="confirmPassword"
                    className="form-label fw-semibold"
                  >
                    Confirm new password
                  </label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success mt-4"
                disabled={passwordSaving}
              >
                {passwordSaving ? "Updating..." : "Change password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
