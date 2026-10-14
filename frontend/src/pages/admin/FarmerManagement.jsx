import { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaSync,
  FaUsers,
} from "react-icons/fa";

import api from "../../services/api";

function FarmerManagement() {
  const [farmers, setFarmers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadFarmers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");

      const users = response.data?.data || [];

      setFarmers(
        users.filter((user) => user.role === "farmer")
      );
    } catch (err) {
      console.error("Failed to load farmers:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load farmers. Please check the users API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarmers();
  }, []);

  const filteredFarmers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return farmers;

    return farmers.filter((farmer) =>
      [
        farmer.name,
        farmer.full_name,
        farmer.email,
        farmer.phone,
        farmer.phone_number,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [farmers, search]);

  const handleDelete = async (farmer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        farmer.name || farmer.full_name || farmer.email
      }?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/users/${farmer.id}`);

      setFarmers((previous) =>
        previous.filter((item) => item.id !== farmer.id)
      );

      setSuccess("Farmer deleted successfully.");
    } catch (err) {
      console.error("Failed to delete farmer:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete farmer."
      );
    }
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Farmer Management</h2>
          <p className="text-muted mb-0">
            Manage registered farmers in your agriculture system.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-success"
          onClick={loadFarmers}
          disabled={loading}
        >
          <FaSync className="me-2" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-circle bg-success bg-opacity-10 p-3">
                <FaUsers className="text-success" size={25} />
              </div>

              <div>
                <div className="text-muted small">
                  Registered Farmers
                </div>
                <h3 className="fw-bold mb-0">
                  {farmers.length}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
            <h5 className="fw-semibold mb-0">
              Registered Farmers
            </h5>

            <div className="input-group" style={{ maxWidth: 380 }}>
              <span className="input-group-text bg-white">
                <FaSearch />
              </span>

              <input
                type="search"
                className="form-control"
                placeholder="Search name or email..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Farmer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-success" />
                    <p className="text-muted mt-2 mb-0">
                      Loading farmers...
                    </p>
                  </td>
                </tr>
              ) : filteredFarmers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-muted py-5"
                  >
                    No farmers found.
                  </td>
                </tr>
              ) : (
                filteredFarmers.map((farmer) => (
                  <tr key={farmer.id}>
                    <td>{farmer.id}</td>

                    <td className="fw-semibold">
                      {farmer.name ||
                        farmer.full_name ||
                        "—"}
                    </td>

                    <td>{farmer.email || "—"}</td>

                    <td>
                      {farmer.phone ||
                        farmer.phone_number ||
                        "—"}
                    </td>

                    <td>
                      <span className="badge bg-success">
                        Farmer
                      </span>
                    </td>

                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          title="Edit farmer"
                          onClick={() =>
                            window.alert(
                              "Connect this action to your farmer update form."
                            )
                          }
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          title="Delete farmer"
                          onClick={() => handleDelete(farmer)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white text-muted small">
          Showing {filteredFarmers.length} of {farmers.length} farmers
        </div>
      </div>
    </div>
  );
}

export default FarmerManagement;