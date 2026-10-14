
import { useCallback, useEffect, useState } from "react";
import {
  FaSearch,
  FaSyncAlt,
  FaUsers,
  FaPlus,
  FaEdit,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "farmer",
  phone: "",
  address: "",
  isActive: true,
};

const USERS_PER_PAGE = 10;

function UserManagement() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const isEditingSelf =
    Boolean(editingUser) &&
    Number(editingUser.id) === Number(currentUser?.id);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");
      const result = response.data.data;

      setUsers(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load users. Please check your login and backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const getActiveStatus = (user) => {
    const status = user.is_active ?? user.isActive;

    return status === true || status === 1 || status === "1";
  };

  const openCreateForm = () => {
    setEditingUser(null);
    setForm({ ...emptyForm });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setEditingUser(user);

    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "farmer",
      phone: user.phone || "",
      address: user.address || "",
      isActive: getActiveStatus(user),
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingUser(null);
    setForm({ ...emptyForm });
    setError("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    if (!editingUser && form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Confirm before deactivating another user's active account.
    if (
      editingUser &&
      !isEditingSelf &&
      getActiveStatus(editingUser) &&
      !form.isActive
    ) {
      const confirmed = window.confirm(
        `Are you sure you want to deactivate ${
          editingUser.name || "this user"
        }?`
      );

      if (!confirmed) return;
    }

    try {
      setSaving(true);

      if (editingUser) {
        const updateData = {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
        };

        // Never submit role or active-status changes for your own account.
        if (!isEditingSelf) {
          updateData.role = form.role;
          updateData.isActive = form.isActive;
        }

        await api.put(`/users/${editingUser.id}`, updateData);

        setSuccess("User updated successfully.");
      } else {
        await api.post("/users", {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
        });

        setSuccess("User created successfully.");
      }

      setShowForm(false);
      setEditingUser(null);
      setForm({ ...emptyForm });

      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save user. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Search and role filtering.
  const filteredUsers = users.filter((user) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      String(user.name || "").toLowerCase().includes(query) ||
      String(user.email || "").toLowerCase().includes(query);

    const matchesRole =
      roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Pagination calculations.
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * USERS_PER_PAGE;

  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + USERS_PER_PAGE
  );

  // Return to page 1 when the search or role filter changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  // Keep the current page valid if users are added or removed.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Page heading */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">User Management</h2>
          <p className="text-muted mb-0">
            Create, view, and manage system user accounts.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline-success d-flex align-items-center gap-2"
            onClick={loadUsers}
            disabled={loading}
          >
            <FaSyncAlt />
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-success d-flex align-items-center gap-2"
            onClick={openCreateForm}
          >
            <FaPlus />
            Create User
          </button>
        </div>
      </div>

      {/* Feedback messages */}
      {success && (
        <div className="alert alert-success alert-dismissible">
          {success}
          <button
            type="button"
            className="btn-close"
            aria-label="Dismiss success message"
            onClick={() => setSuccess("")}
          />
        </div>
      )}

      {error && !showForm && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button
            type="button"
            className="btn-close float-end"
            aria-label="Dismiss error message"
            onClick={() => setError("")}
          />
        </div>
      )}

      {/* User count */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-5 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="text-success fs-2">
                <FaUsers />
              </div>

              <div>
                <div className="text-muted">Total users</div>
                <h3 className="fw-bold mb-0">
                  {loading ? "—" : users.length}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">
              {editingUser ? "Edit User" : "Create User"}
            </h5>

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={closeForm}
              disabled={saving}
              aria-label="Close form"
            >
              <FaTimes />
            </button>
          </div>

          <div className="card-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label htmlFor="user-name" className="form-label">
                    Full name *
                  </label>
                  <input
                    id="user-name"
                    name="name"
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="user-email" className="form-label">
                    Email address *
                  </label>
                  <input
                    id="user-email"
                    name="email"
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    required
                    maxLength={255}
                  />
                </div>

                {!editingUser && (
                  <div className="col-12 col-md-6">
                    <label htmlFor="user-password" className="form-label">
                      Initial password *
                    </label>
                    <input
                      id="user-password"
                      name="password"
                      type="password"
                      className="form-control"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <small className="text-muted">
                      Use at least 6 characters.
                    </small>
                  </div>
                )}

                <div className="col-12 col-md-6">
                  <label htmlFor="user-role" className="form-label">
                    Role *
                  </label>
                  <select
                    id="user-role"
                    name="role"
                    className="form-select"
                    value={form.role}
                    onChange={handleChange}
                    required
                    disabled={isEditingSelf}
                  >
                    <option value="farmer">Farmer</option>
                    <option value="admin">Administrator</option>
                  </select>

                  {isEditingSelf && (
                    <small className="text-muted">
                      You cannot change your own administrator role here.
                    </small>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="user-phone" className="form-label">
                    Phone number
                  </label>
                  <input
                    id="user-phone"
                    name="phone"
                    type="tel"
                    className="form-control"
                    value={form.phone}
                    onChange={handleChange}
                    maxLength={30}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="user-address" className="form-label">
                    Address
                  </label>
                  <input
                    id="user-address"
                    name="address"
                    type="text"
                    className="form-control"
                    value={form.address}
                    onChange={handleChange}
                    maxLength={255}
                  />
                </div>

                {editingUser && (
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        id="user-active"
                        name="isActive"
                        type="checkbox"
                        className="form-check-input"
                        checked={form.isActive}
                        onChange={handleChange}
                        disabled={isEditingSelf}
                      />
                      <label
                        htmlFor="user-active"
                        className="form-check-label"
                      >
                        Account active
                      </label>
                    </div>

                    {isEditingSelf && (
                      <small className="text-muted">
                        You cannot deactivate your own account here.
                      </small>
                    )}
                  </div>
                )}
              </div>

              <div className="d-flex flex-wrap gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                      ? "Save Changes"
                      : "Create User"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {/* Search and role filter */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search users by name or email"
                />
              </div>
            </div>

            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                aria-label="Filter users by role"
              >
                <option value="all">All roles</option>
                <option value="admin">Administrators</option>
                <option value="farmer">Farmers</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-success"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-2">Loading users...</p>
            </div>
          ) : !error ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Role</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center text-muted py-4"
                        >
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user, index) => {
                        const active = getActiveStatus(user);

                        return (
                          <tr key={user.id}>
                            <td>{startIndex + index + 1}</td>
                            <td className="fw-semibold">
                              {user.name || "—"}
                            </td>
                            <td>{user.email || "—"}</td>
                            <td>
                              <span
                                className={`badge ${
                                  user.role === "admin"
                                    ? "text-bg-primary"
                                    : "text-bg-success"
                                }`}
                              >
                                {user.role || "Unknown"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  active
                                    ? "text-bg-success"
                                    : "text-bg-secondary"
                                }`}
                              >
                                {active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success d-flex align-items-center gap-2"
                                onClick={() => openEditForm(user)}
                              >
                                <FaEdit />
                                Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3">
                <small className="text-muted">
                  {filteredUsers.length === 0
                    ? "Showing 0 users"
                    : `Showing ${startIndex + 1}–${Math.min(
                        startIndex + USERS_PER_PAGE,
                        filteredUsers.length
                      )} of ${filteredUsers.length} filtered users`}
                  {" "}({users.length} total)
                </small>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm d-flex align-items-center gap-2"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={safeCurrentPage <= 1}
                  >
                    <FaChevronLeft />
                    Previous
                  </button>

                  <span className="small text-nowrap">
                    Page {safeCurrentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm d-flex align-items-center gap-2"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    disabled={safeCurrentPage >= totalPages}
                  >
                    Next
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="alert alert-danger" role="alert">
              {error}
              <button
                type="button"
                className="btn btn-sm btn-outline-danger ms-2"
                onClick={loadUsers}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserManagement;