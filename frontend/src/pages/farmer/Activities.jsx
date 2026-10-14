import { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaClipboardList,
  FaCalendarAlt,
} from "react-icons/fa";

import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../../services/activityService";

import api from "../../services/api";

function Activities() {
  const [records, setRecords] = useState([]);
  const [crops, setCrops] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    crop_id: "",
    field_id: "",
    activity_type: "Planting",
    activity_date: "",
    description: "",
    labor_cost: "",
  });

  const activityTypes = [
    "Planting",
    "Weeding",
    "Land Preparation",
    "Harvesting",
    "Pesticide Application",
    "Fertilizer Application",
    "Irrigation",
    "Other",
  ];

  // =========================
  // Load activities and crops
  // =========================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [activitiesResponse, cropsResponse] =
        await Promise.all([
          getActivities(),
          api.get("/crops"),
        ]);

      const activityData =
        activitiesResponse?.data?.data ??
        activitiesResponse?.data ??
        [];

      setRecords(
        Array.isArray(activityData)
          ? activityData
          : []
      );

      const cropData =
        cropsResponse?.data?.data ??
        cropsResponse?.data ??
        [];

      setCrops(
        Array.isArray(cropData)
          ? cropData
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load activities:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load farm activities."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // Helpers
  // =========================

  const getCrop = (cropId) => {
    return crops.find(
      (crop) =>
        Number(crop.id) === Number(cropId)
    );
  };

  const getCropName = (cropId) => {
    const crop = getCrop(cropId);

    if (!crop) {
      return "Unknown crop";
    }

    return (
      crop.name ||
      crop.crop_name ||
      crop.crop_type_name ||
      "Unknown crop"
    );
  };

  const getFarmName = (cropId) => {
    const crop = getCrop(cropId);

    return (
      crop?.farm_name ||
      crop?.farm?.name ||
      "—"
    );
  };

  const getFieldName = (cropId) => {
    const crop = getCrop(cropId);

    return (
      crop?.field_name ||
      crop?.field?.name ||
      "—"
    );
  };

  const getLaborCost = (record) => {
    const value =
      record.labor_cost ??
      record.laborCost ??
      0;

    const amount = Number(value);

    return Number.isFinite(amount)
      ? amount
      : 0;
  };

  const formatMoney = (amount) => {
    return Number(amount).toLocaleString(
      "en-ET",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const value = String(date).slice(0, 10);
    const parts = value.split("-");

    if (parts.length !== 3) {
      return value;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const getActivityBadgeClass = (activityType) => {
    switch (activityType) {
      case "Planting":
        return "bg-success";

      case "Weeding":
        return "bg-warning text-dark";

      case "Land Preparation":
        return "bg-secondary";

      case "Harvesting":
        return "bg-primary";

      case "Pesticide Application":
        return "bg-danger";

      case "Fertilizer Application":
        return "bg-info text-dark";

      case "Irrigation":
        return "bg-primary";

      default:
        return "bg-dark";
    }
  };

  // =========================
  // Form controls
  // =========================

  const resetForm = () => {
    setFormData({
      crop_id: "",
      field_id: "",
      activity_type: "Planting",
      activity_date: "",
      description: "",
      labor_cost: "",
    });

    setEditingId(null);
  };

  const openCreateForm = () => {
    setError("");
    setSuccess("");

    resetForm();
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

    if (name === "crop_id") {
      const selectedCrop = getCrop(value);

      setFormData((previous) => ({
        ...previous,
        crop_id: value,
        field_id:
          selectedCrop?.field_id ??
          selectedCrop?.fieldId ??
          "",
      }));

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // Edit activity
  // =========================

  const handleEdit = (record) => {
    setError("");
    setSuccess("");

    const recordCropId =
      record.crop_id ??
      record.cropId ??
      "";

    const recordFieldId =
      record.field_id ??
      record.fieldId ??
      "";

    const recordActivityType =
      record.activity_type ??
      record.activityType ??
      "Other";

    const recordActivityDate =
      record.activity_date ??
      record.activityDate ??
      "";

    const crop = getCrop(recordCropId);

    setFormData({
      crop_id: recordCropId,

      field_id:
        recordFieldId ||
        crop?.field_id ||
        crop?.fieldId ||
        "",

      activity_type: recordActivityType,

      activity_date: recordActivityDate
        ? String(recordActivityDate).slice(0, 10)
        : "",

      description: record.description || "",

      labor_cost:
        record.labor_cost ??
        record.laborCost ??
        "",
    });

    setEditingId(record.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // Validation
  // =========================

  const validateForm = () => {
    if (!formData.crop_id) {
      return "Please select a crop.";
    }

    if (!formData.activity_type.trim()) {
      return "Please select an activity type.";
    }

    if (!formData.activity_date) {
      return "Please select an activity date.";
    }

    if (
      formData.labor_cost === "" ||
      formData.labor_cost === null
    ) {
      return "Please enter the labor cost.";
    }

    const laborCost = Number(formData.labor_cost);

    if (
      !Number.isFinite(laborCost) ||
      laborCost < 0
    ) {
      return "Labor cost must be a valid number of zero or more.";
    }

    if (!Number.isFinite(Number(formData.crop_id))) {
      return "Please select a valid crop.";
    }

    return "";
  };

  // =========================
  // Create / Update activity
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const selectedCrop = getCrop(
        formData.crop_id
      );

      const payload = {
        cropId: Number(formData.crop_id),

        fieldId:
          formData.field_id
            ? Number(formData.field_id)
            : selectedCrop?.field_id
            ? Number(selectedCrop.field_id)
            : selectedCrop?.fieldId
            ? Number(selectedCrop.fieldId)
            : null,

        activityType:
          formData.activity_type.trim(),

        activityDate:
          formData.activity_date,

        description:
          formData.description.trim() || null,

        laborCost:
          Number(formData.labor_cost),
      };

      console.log(
        "Submitting activity:",
        payload
      );

      if (editingId) {
        await updateActivity(
          editingId,
          payload
        );

        setSuccess(
          "Farm activity updated successfully."
        );
      } else {
        await createActivity(payload);

        setSuccess(
          "Farm activity created successfully."
        );
      }

      setShowForm(false);
      resetForm();

      await loadData();
    } catch (err) {
      console.error(
        "Failed to save activity:",
        err?.response?.data || err
      );

      const validationErrors =
        err?.response?.data?.errors;

      if (
        Array.isArray(validationErrors) &&
        validationErrors.length > 0
      ) {
        setError(
          validationErrors
            .map(
              (item) =>
                item.msg || item.message
            )
            .filter(Boolean)
            .join(", ")
        );
      } else {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Failed to save farm activity."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Delete activity
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this farm activity?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteActivity(id);

      setSuccess(
        "Farm activity deleted successfully."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Failed to delete activity:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete farm activity."
      );
    }
  };

  // =========================
  // Search
  // =========================

  const filteredRecords = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return records;
    }

    return records.filter((record) => {
      const cropId =
        record.crop_id ??
        record.cropId;

      const activityType =
        record.activity_type ??
        record.activityType;

      const activityDate =
        record.activity_date ??
        record.activityDate;

      const values = [
        getCropName(cropId),
        getFarmName(cropId),
        getFieldName(cropId),
        activityType,
        activityDate,
        record.description,
        getLaborCost(record),
      ];

      return values.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [records, crops, searchTerm]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  // =========================
  // Render
  // =========================

  return (
    <div className="container-fluid py-4">

      {/* Page Header */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Farm Activities
          </h2>

          <p className="text-muted mb-0">
            Record and manage activities performed on your crops.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-success"
          onClick={openCreateForm}
        >
          <FaPlus className="me-2" />
          Add Activity
        </button>
      </div>

      {/* Alerts */}

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
            aria-label="Close"
          />
        </div>
      )}

      {success && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {success}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
            aria-label="Close"
          />
        </div>
      )}

      {/* Add / Edit Form */}

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">

          <div className="card-header bg-success text-white py-3">
            <h5 className="mb-0">
              <FaClipboardList className="me-2" />

              {editingId
                ? "Edit Farm Activity"
                : "Add Farm Activity"}
            </h5>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">

                {/* Crop */}

                <div className="col-md-6">
                  <label
                    htmlFor="activity-crop"
                    className="form-label fw-semibold"
                  >
                    Crop <span className="text-danger">*</span>
                  </label>

                  <select
                    id="activity-crop"
                    name="crop_id"
                    className="form-select"
                    value={formData.crop_id}
                    onChange={handleChange}
                    disabled={saving}
                    required
                  >
                    <option value="">
                      Select crop
                    </option>

                    {crops.map((crop) => (
                      <option
                        key={crop.id}
                        value={crop.id}
                      >
                        {crop.name ||
                          crop.crop_name ||
                          crop.crop_type_name ||
                          `Crop ${crop.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field */}

                <div className="col-md-6">
                  <label
                    htmlFor="activity-field"
                    className="form-label fw-semibold"
                  >
                    Field
                  </label>

                  <input
                    type="text"
                    id="activity-field"
                    className="form-control"
                    value={
                      formData.crop_id
                        ? getFieldName(formData.crop_id)
                        : ""
                    }
                    placeholder="Field is linked to selected crop"
                    readOnly
                  />

                  <small className="text-muted">
                    The field is automatically linked to the selected crop.
                  </small>
                </div>

                {/* Activity Type */}

                <div className="col-md-6">
                  <label
                    htmlFor="activity-type"
                    className="form-label fw-semibold"
                  >
                    Activity Type <span className="text-danger">*</span>
                  </label>

                  <select
                    id="activity-type"
                    name="activity_type"
                    className="form-select"
                    value={formData.activity_type}
                    onChange={handleChange}
                    disabled={saving}
                    required
                  >
                    {activityTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Activity Date */}

                <div className="col-md-6">
                  <label
                    htmlFor="activity-date"
                    className="form-label fw-semibold"
                  >
                    Activity Date <span className="text-danger">*</span>
                  </label>

                  <div className="input-group">
                    <span className="input-group-text">
                      <FaCalendarAlt />
                    </span>

                    <input
                      type="date"
                      id="activity-date"
                      name="activity_date"
                      className="form-control"
                      value={formData.activity_date}
                      onChange={handleChange}
                      disabled={saving}
                      required
                    />
                  </div>
                </div>

                {/* Description */}

                <div className="col-12">
                  <label
                    htmlFor="activity-description"
                    className="form-label fw-semibold"
                  >
                    Description
                  </label>

                  <textarea
                    id="activity-description"
                    name="description"
                    className="form-control"
                    rows="4"
                    placeholder="Enter details about this activity..."
                    value={formData.description}
                    onChange={handleChange}
                    disabled={saving}
                    maxLength={1000}
                  />

                  <small className="text-muted">
                    Optional. Maximum 1000 characters.
                  </small>
                </div>

                {/* Labor Cost */}

                <div className="col-md-6">
                  <label
                    htmlFor="activity-labor-cost"
                    className="form-label fw-semibold"
                  >
                    Labor Cost (Birr){" "}
                    <span className="text-danger">*</span>
                  </label>

                  <input
                    type="number"
                    id="activity-labor-cost"
                    name="labor_cost"
                    className="form-control"
                    placeholder="Enter total labor cost"
                    min="0"
                    step="0.01"
                    value={formData.labor_cost}
                    onChange={handleChange}
                    disabled={saving}
                    required
                  />

                  <small className="text-muted">
                    Enter the total amount paid to workers for this activity.
                  </small>
                </div>

              </div>

              {/* Buttons */}

              <div className="d-flex justify-content-end gap-2 mt-4">
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
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaClipboardList className="me-2" />
                      {editingId
                        ? "Update Activity"
                        : "Save Activity"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activities Table */}

      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white py-3">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div>
              <h5 className="mb-1">
                Activity Records
              </h5>

              <small className="text-muted">
                Showing {filteredRecords.length} of {records.length} records
              </small>
            </div>
          </div>
        </div>

        <div className="card-body">

          {/* Search */}

          {records.length > 0 && (
            <div className="mb-4">
              <label
                htmlFor="activity-search"
                className="form-label fw-semibold"
              >
                Search Activities
              </label>

              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch className="text-success" />
                </span>

                <input
                  type="search"
                  id="activity-search"
                  className="form-control"
                  placeholder="Search by crop, farm, field, activity, date, description, or labor cost..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
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

          {/* Loading */}

          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-success"
                role="status"
              />

              <p className="text-muted mt-3 mb-0">
                Loading activities...
              </p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-5">
              <FaClipboardList
                size={45}
                className="text-muted mb-3"
              />

              <h5>No farm activities found</h5>

              <p className="text-muted">
                Start by adding your first farm activity.
              </p>

              <button
                type="button"
                className="btn btn-success"
                onClick={openCreateForm}
              >
                <FaPlus className="me-2" />
                Add Activity
              </button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-5">
              <FaSearch
                size={40}
                className="text-muted mb-3"
              />

              <h5>No matching activities</h5>

              <p className="text-muted">
                Try a different search term.
              </p>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={clearSearch}
              >
                <FaTimes className="me-2" />
                Clear Search
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">
                  <tr>
                    <th>Activity</th>
                    <th>Crop</th>
                    <th>Farm</th>
                    <th>Field</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th className="text-end">
                      Labor Cost (Birr)
                    </th>
                    <th className="text-end">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((record) => {
                    const cropId =
                      record.crop_id ??
                      record.cropId;

                    const activityType =
                      record.activity_type ??
                      record.activityType;

                    const activityDate =
                      record.activity_date ??
                      record.activityDate;

                    return (
                      <tr key={record.id}>
                        <td>
                          <span
                            className={`badge ${getActivityBadgeClass(
                              activityType
                            )}`}
                          >
                            {activityType || "Other"}
                          </span>
                        </td>

                        <td className="fw-semibold">
                          {getCropName(cropId)}
                        </td>

                        <td>
                          {getFarmName(cropId)}
                        </td>

                        <td>
                          {getFieldName(cropId)}
                        </td>

                        <td>
                          {formatDate(activityDate)}
                        </td>

                        <td>
                          {record.description ? (
                            <span title={record.description}>
                              {record.description.length > 60
                                ? `${record.description.slice(0, 60)}...`
                                : record.description}
                            </span>
                          ) : (
                            <span className="text-muted">
                              —
                            </span>
                          )}
                        </td>

                        <td className="text-end fw-semibold">
                          {formatMoney(getLaborCost(record))}
                        </td>

                        <td className="text-end">
                          <div className="btn-group">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(record)}
                              title="Edit activity"
                            >
                              <FaEdit />
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(record.id)}
                              title="Delete activity"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Activities;