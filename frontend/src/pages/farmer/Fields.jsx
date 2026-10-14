import { useEffect, useState } from "react";
import {
  FaEdit,
  FaMapMarkedAlt,
  FaPlus,
  FaTrash,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

import api from "../../services/api";

function Fields() {
  const [farms, setFarms] = useState([]);
  const [fields, setFields] = useState([]);

  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [loadingFarms, setLoadingFarms] = useState(true);
  const [loadingFields, setLoadingFields] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    area: "",
    areaUnit: "hectare",
    soilType: "",
    description: "",
  });

  /*
   * Load farms when the page opens.
   */
  useEffect(() => {
    let isMounted = true;

    api
      .get("/farms")
      .then((response) => {
        if (!isMounted) {
          return;
        }

        const farmList = response.data?.data || [];

        setFarms(farmList);

        if (farmList.length > 0) {
          setSelectedFarmId(String(farmList[0].id));
        }
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        const message =
          error.response?.data?.message ||
          "Failed to load farms.";

        setError(message);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingFarms(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * Load fields whenever the selected farm changes.
   */
  useEffect(() => {
    if (!selectedFarmId) {
      return;
    }

    let isMounted = true;

    setLoadingFields(true);

    api
      .get(`/fields/farm/${selectedFarmId}`)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setFields(response.data?.data || []);
        setSearchTerm("");
        setError("");
        setLoadingFields(false);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        const message =
          error.response?.data?.message ||
          "Failed to load fields.";

        setError(message);
        setFields([]);
        setLoadingFields(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedFarmId]);

  const loadFields = async (farmId) => {
    if (!farmId) {
      return;
    }

    try {
      setLoadingFields(true);
      setError("");

      const response = await api.get(
        `/fields/farm/${farmId}`
      );

      setFields(response.data?.data || []);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to load fields.";

      setError(message);
      setFields([]);
    } finally {
      setLoadingFields(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      area: "",
      areaUnit: "hectare",
      soilType: "",
      description: "",
    });

    setEditingField(null);
    setShowForm(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFarmChange = (event) => {
    const farmId = event.target.value;

    setSelectedFarmId(farmId);
    setFields([]);
    setSearchTerm("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFarmId) {
      setError("Please select a farm first.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        area: Number(formData.area),
        areaUnit: formData.areaUnit,
        soilType: formData.soilType.trim(),
        description: formData.description.trim(),
      };

      if (editingField) {
        await api.put(
          `/fields/${editingField.id}`,
          payload
        );

        setSuccess(
          "Field updated successfully."
        );
      } else {
        await api.post(
          `/fields/farm/${selectedFarmId}`,
          payload
        );

        setSuccess(
          "Field created successfully."
        );
      }

      resetForm();

      await loadFields(selectedFarmId);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to save field.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);

    setFormData({
      name: field.name || "",
      area: field.area ?? "",
      areaUnit:
        field.area_unit || "hectare",
      soilType:
        field.soil_type || "",
      description:
        field.description || "",
    });

    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (field) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${field.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/fields/${field.id}`
      );

      setSuccess(
        "Field deleted successfully."
      );

      await loadFields(selectedFarmId);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to delete field.";

      setError(message);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  /*
   * Search fields by:
   * - field name
   * - soil type
   * - description
   */
  const filteredFields = fields.filter(
    (field) => {
      const search = searchTerm
        .trim()
        .toLowerCase();

      if (!search) {
        return true;
      }

      return (
        field.name
          ?.toLowerCase()
          .includes(search) ||
        field.soil_type
          ?.toLowerCase()
          .includes(search) ||
        field.description
          ?.toLowerCase()
          .includes(search)
      );
    }
  );

  const selectedFarm = farms.find(
    (farm) =>
      String(farm.id) ===
      String(selectedFarmId)
  );

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Fields
          </h2>

          <p className="text-muted mb-0">
            Manage the fields belonging to
            your farms.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-success d-flex align-items-center justify-content-center gap-2"
          onClick={() => {
            setFormData({
              name: "",
              area: "",
              areaUnit: "hectare",
              soilType: "",
              description: "",
            });

            setEditingField(null);
            setError("");
            setSuccess("");
            setShowForm(true);
          }}
          disabled={!selectedFarmId}
        >
          <FaPlus />
          Add Field
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

      {/* Farm selector */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-end g-3">
            <div className="col-12 col-md-6 col-lg-5">
              <label
                htmlFor="farmSelect"
                className="form-label fw-semibold"
              >
                Select Farm
              </label>

              <select
                id="farmSelect"
                className="form-select"
                value={selectedFarmId}
                onChange={handleFarmChange}
                disabled={loadingFarms}
              >
                <option value="">
                  {loadingFarms
                    ? "Loading farms..."
                    : "Select a farm"}
                </option>

                {farms.map((farm) => (
                  <option
                    key={farm.id}
                    value={farm.id}
                  >
                    {farm.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedFarm && (
              <div className="col-12 col-md-6 col-lg-7">
                <div className="bg-light rounded p-3">
                  <div className="small text-muted">
                    Selected farm
                  </div>

                  <div className="fw-semibold">
                    {selectedFarm.name}
                  </div>

                  {selectedFarm.location && (
                    <div className="small text-muted">
                      {selectedFarm.location}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">
                {editingField
                  ? "Edit Field"
                  : "Add New Field"}
              </h5>

              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={resetForm}
                disabled={saving}
              />
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="field-name"
                    className="form-label fw-semibold"
                  >
                    Field Name
                  </label>

                  <input
                    type="text"
                    id="field-name"
                    name="name"
                    className="form-control"
                    placeholder="e.g. North Field"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={150}
                  />
                </div>

                <div className="col-12 col-md-3">
                  <label
                    htmlFor="field-area"
                    className="form-label fw-semibold"
                  >
                    Area
                  </label>

                  <input
                    type="number"
                    id="field-area"
                    name="area"
                    className="form-control"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.area}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-3">
                  <label
                    htmlFor="field-area-unit"
                    className="form-label fw-semibold"
                  >
                    Area Unit
                  </label>

                  <select
                    id="field-area-unit"
                    name="areaUnit"
                    className="form-select"
                    value={formData.areaUnit}
                    onChange={handleChange}
                  >
                    <option value="hectare">
                      Hectare
                    </option>

                    <option value="acre">
                      Acre
                    </option>

                    <option value="m2">
                      Square meter
                    </option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label
                    htmlFor="field-soil-type"
                    className="form-label fw-semibold"
                  >
                    Soil Type
                  </label>

                  <input
                    type="text"
                    id="field-soil-type"
                    name="soilType"
                    className="form-control"
                    placeholder="e.g. Loam"
                    value={formData.soilType}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </div>

                <div className="col-12">
                  <label
                    htmlFor="field-description"
                    className="form-label fw-semibold"
                  >
                    Description
                  </label>

                  <textarea
                    id="field-description"
                    name="description"
                    className="form-control"
                    rows="3"
                    placeholder="Optional field description"
                    value={formData.description}
                    onChange={handleChange}
                    maxLength={1000}
                  />
                </div>

                <div className="col-12 d-flex flex-column flex-sm-row gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={resetForm}
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
                      : editingField
                      ? "Update Field"
                      : "Save Field"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fields */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1 fw-semibold">
                {selectedFarm
                  ? `${selectedFarm.name} Fields`
                  : "Fields"}
              </h5>

              <small className="text-muted">
                Showing{" "}
                <strong>
                  {filteredFields.length}
                </strong>{" "}
                of{" "}
                <strong>{fields.length}</strong>{" "}
                field
                {fields.length === 1
                  ? ""
                  : "s"}
              </small>
            </div>

            <FaMapMarkedAlt
              className="text-success"
              size={22}
            />
          </div>
        </div>

        <div className="card-body">
          {loadingFields ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-success"
                role="status"
              >
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>

              <p className="text-muted mt-3 mb-0">
                Loading fields...
              </p>
            </div>
          ) : !selectedFarmId ? (
            <div className="text-center py-5 px-3">
              <FaMapMarkedAlt
                size={40}
                className="text-muted mb-3"
              />

              <h5 className="fw-semibold">
                Select a farm
              </h5>

              <p className="text-muted mb-0">
                Select a farm above to view
                its fields.
              </p>
            </div>
          ) : (
            <>
              {/* Search */}
              {fields.length > 0 && (
                <div className="mb-4">
                  <label
                    htmlFor="field-search"
                    className="form-label fw-semibold"
                  >
                    Search Fields
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <FaSearch className="text-success" />
                    </span>

                    <input
                      type="text"
                      id="field-search"
                      className="form-control"
                      placeholder="Search by field name, soil type, or description..."
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
              )}

              {fields.length === 0 ? (
                <div className="text-center py-5 px-3">
                  <FaMapMarkedAlt
                    size={40}
                    className="text-muted mb-3"
                  />

                  <h5 className="fw-semibold">
                    No fields found
                  </h5>

                  <p className="text-muted mb-3">
                    This farm does not have
                    any fields yet.
                  </p>

                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => {
                      setFormData({
                        name: "",
                        area: "",
                        areaUnit: "hectare",
                        soilType: "",
                        description: "",
                      });

                      setEditingField(null);
                      setShowForm(true);
                    }}
                  >
                    <FaPlus className="me-2" />
                    Add First Field
                  </button>
                </div>
              ) : filteredFields.length === 0 ? (
                <div className="text-center py-5 px-3">
                  <FaSearch
                    size={40}
                    className="text-muted mb-3"
                  />

                  <h5 className="fw-semibold">
                    No matching fields
                  </h5>

                  <p className="text-muted mb-3">
                    No fields match your
                    current search.
                  </p>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={clearSearch}
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Field Name</th>
                        <th>Area</th>
                        <th>Soil Type</th>
                        <th>Description</th>
                        <th className="text-end">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredFields.map(
                        (field) => (
                          <tr key={field.id}>
                            <td>
                              <div className="fw-semibold">
                                {field.name}
                              </div>

                              <small className="text-muted">
                                Field #{field.id}
                              </small>
                            </td>

                            <td>
                              {field.area}{" "}
                              {field.area_unit ||
                                "hectare"}
                            </td>

                            <td>
                              {field.soil_type || (
                                <span className="text-muted">
                                  Not specified
                                </span>
                              )}
                            </td>

                            <td>
                              <span className="text-muted">
                                {field.description ||
                                  "No description"}
                              </span>
                            </td>

                            <td>
                              <div className="d-flex justify-content-end gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() =>
                                    handleEdit(
                                      field
                                    )
                                  }
                                  title="Edit field"
                                >
                                  <FaEdit />
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() =>
                                    handleDelete(
                                      field
                                    )
                                  }
                                  title="Delete field"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Fields;