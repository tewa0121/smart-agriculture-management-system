import { useEffect, useState } from "react";
import {
  FaEdit,
  FaEye,
  FaPlus,
  FaTrash,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

import {
  getFarms,
  createFarm,
  updateFarm,
  deleteFarm,
} from "../../services/farmService";

function Farms() {
  const [farms, setFarms] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    size: "",
    sizeUnit: "hectare",
    description: "",
  });

  /*
   * Initial farm loading.
   */
  useEffect(() => {
    let isMounted = true;

    getFarms()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setFarms(response.data || []);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        console.error("Load farms error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load farms."
        );
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loadFarms = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getFarms();

      setFarms(response.data || []);
    } catch (error) {
      console.error("Load farms error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load farms."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      size: "",
      sizeUnit: "hectare",
      description: "",
    });

    setEditingFarm(null);
  };

  const openCreateForm = () => {
    resetForm();
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (farm) => {
    setFormData({
      name: farm.name || "",
      location: farm.location || "",
      size: farm.size ?? "",
      sizeUnit: farm.size_unit || "hectare",
      description: farm.description || "",
    });

    setEditingFarm(farm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        size:
          formData.size === ""
            ? undefined
            : Number(formData.size),
        sizeUnit: formData.sizeUnit.trim(),
        description: formData.description.trim(),
      };

      if (editingFarm) {
        await updateFarm(
          editingFarm.id,
          payload
        );

        setSuccess(
          "Farm updated successfully."
        );
      } else {
        await createFarm(payload);

        setSuccess(
          "Farm created successfully."
        );
      }

      setShowForm(false);
      resetForm();

      await loadFarms();
    } catch (error) {
      console.error("Save farm error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to save farm."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (farm) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${farm.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteFarm(farm.id);

      setSuccess(
        "Farm deleted successfully."
      );

      await loadFarms();
    } catch (error) {
      console.error("Delete farm error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete farm."
      );
    }
  };

  /*
   * Search farms by:
   * - farm name
   * - location
   * - description
   */
  const filteredFarms = farms.filter((farm) => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return true;
    }

    return (
      farm.name
        ?.toLowerCase()
        .includes(search) ||
      farm.location
        ?.toLowerCase()
        .includes(search) ||
      farm.description
        ?.toLowerCase()
        .includes(search)
    );
  });

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div
            className="spinner-border text-success"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="text-muted mt-3">
            Loading farms...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            My Farms
          </h2>

          <p className="text-muted mb-0">
            Manage your farms and agricultural
            properties.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-success d-flex align-items-center justify-content-center gap-2"
          onClick={openCreateForm}
        >
          <FaPlus />
          Add Farm
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="alert alert-success"
          role="alert"
        >
          {success}
        </div>
      )}

      {/* Search */}
      {farms.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-9">
                <label
                  htmlFor="farm-search"
                  className="form-label fw-semibold"
                >
                  Search Farms
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FaSearch className="text-success" />
                  </span>

                  <input
                    type="text"
                    id="farm-search"
                    className="form-control"
                    placeholder="Search by farm name, location, or description..."
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={clearSearch}
                      title="Clear search"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>

              <div className="col-12 col-md-3">
                <div className="text-muted small">
                  Showing{" "}
                  <strong>
                    {filteredFarms.length}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {farms.length}
                  </strong>{" "}
                  farms
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-1">
                  {editingFarm
                    ? "Edit Farm"
                    : "Add New Farm"}
                </h5>

                <p className="text-muted small mb-0">
                  Enter the farm information below.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="farm-name"
                    className="form-label fw-semibold"
                  >
                    Farm Name
                  </label>

                  <input
                    type="text"
                    id="farm-name"
                    name="name"
                    className="form-control"
                    placeholder="e.g. Green Valley Farm"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={150}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label
                    htmlFor="farm-location"
                    className="form-label fw-semibold"
                  >
                    Location
                  </label>

                  <input
                    type="text"
                    id="farm-location"
                    name="location"
                    className="form-control"
                    placeholder="e.g. Injibara"
                    value={formData.location}
                    onChange={handleChange}
                    maxLength={255}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label
                    htmlFor="farm-size"
                    className="form-label fw-semibold"
                  >
                    Farm Size
                  </label>

                  <input
                    type="number"
                    id="farm-size"
                    name="size"
                    className="form-control"
                    placeholder="e.g. 25"
                    min="0"
                    step="0.01"
                    value={formData.size}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label
                    htmlFor="farm-size-unit"
                    className="form-label fw-semibold"
                  >
                    Size Unit
                  </label>

                  <select
                    id="farm-size-unit"
                    name="sizeUnit"
                    className="form-select"
                    value={formData.sizeUnit}
                    onChange={handleChange}
                  >
                    <option value="hectare">
                      Hectare
                    </option>

                    <option value="acre">
                      Acre
                    </option>

                    <option value="square_meter">
                      Square Meter
                    </option>
                  </select>
                </div>

                <div className="col-12">
                  <label
                    htmlFor="farm-description"
                    className="form-label fw-semibold"
                  >
                    Description
                  </label>

                  <textarea
                    id="farm-description"
                    name="description"
                    className="form-control"
                    rows="4"
                    placeholder="Enter additional information about this farm..."
                    value={formData.description}
                    onChange={handleChange}
                    maxLength={1000}
                  />
                </div>

                <div className="col-12">
                  <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={closeForm}
                      disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : editingFarm
                        ? "Update Farm"
                        : "Create Farm"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Farms */}
      {farms.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <FaMapMarkerAlt
              size={40}
              className="text-muted mb-3"
            />

            <h5 className="fw-bold">
              No farms yet
            </h5>

            <p className="text-muted mb-4">
              Start by adding your first farm.
            </p>

            <button
              type="button"
              className="btn btn-success"
              onClick={openCreateForm}
            >
              <FaPlus className="me-2" />
              Add Your First Farm
            </button>
          </div>
        </div>
      ) : filteredFarms.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <FaSearch
              size={40}
              className="text-muted mb-3"
            />

            <h5 className="fw-bold">
              No matching farms
            </h5>

            <p className="text-muted mb-3">
              No farms match your current search.
            </p>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={clearSearch}
            >
              Clear Search
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredFarms.map((farm) => (
            <div
              className="col-12 col-md-6 col-xl-4"
              key={farm.id}
            >
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">
                        {farm.name}
                      </h5>

                      <div className="text-muted small d-flex align-items-center gap-2">
                        <FaMapMarkerAlt />

                        <span>
                          {farm.location ||
                            "Location not specified"}
                        </span>
                      </div>
                    </div>

                    <span className="badge bg-success-subtle text-success">
                      Farm
                    </span>
                  </div>

                  <div className="border-top border-bottom py-3 my-3">
                    <div className="d-flex align-items-center gap-2">
                      <FaRulerCombined className="text-success" />

                      <div>
                        <small className="text-muted d-block">
                          Farm Size
                        </small>

                        <span className="fw-semibold">
                          {farm.size ?? "-"}{" "}
                          {farm.size_unit ||
                            "hectare"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted small mb-4">
                    {farm.description ||
                      "No description provided."}
                  </p>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm flex-grow-1"
                      title="View farm"
                    >
                      <FaEye className="me-1" />
                      View
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() =>
                        openEditForm(farm)
                      }
                      title="Edit farm"
                    >
                      <FaEdit />
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() =>
                        handleDelete(farm)
                      }
                      title="Delete farm"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Farms;