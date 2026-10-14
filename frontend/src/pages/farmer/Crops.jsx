import { useEffect, useState } from "react";
import {
  FaEdit,
  FaPlus,
  FaSeedling,
  FaTrash,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

import api from "../../services/api";

function Crops() {
  const [farms, setFarms] = useState([]);
  const [fields, setFields] = useState([]);
  const [cropTypes, setCropTypes] = useState([]);
  const [crops, setCrops] = useState([]);

  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [selectedFieldId, setSelectedFieldId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingFields, setLoadingFields] = useState(false);
  const [loadingCrops, setLoadingCrops] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);

  const [formData, setFormData] = useState({
    fieldId: "",
    cropTypeId: "",
    name: "",
    plantingDate: "",
    growthDurationDays: "",
    expectedHarvestDate: "",
    actualHarvestDate: "",
    status: "planned",
    notes: "",
  });

  /*
   * Load farms, crop types, and crops when the page opens.
   */
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.get("/farms"),
      api.get("/crop-types"),
      api.get("/crops"),
    ])
      .then(
        ([
          farmsResponse,
          cropTypesResponse,
          cropsResponse,
        ]) => {
          if (!isMounted) {
            return;
          }

          const farmList =
            farmsResponse.data?.data || [];

          const cropTypeList =
            cropTypesResponse.data?.data || [];

          const cropList =
            cropsResponse.data?.data || [];

          setFarms(farmList);
          setCropTypes(cropTypeList);
          setCrops(cropList);

          if (farmList.length > 0) {
            setSelectedFarmId(
              String(farmList[0].id)
            );
          }
        }
      )
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        const message =
          error.response?.data?.message ||
          "Failed to load crop information.";

        setError(message);
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

  /*
   * Load fields when the selected farm changes.
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

        const fieldList =
          response.data?.data || [];

        setFields(fieldList);
        setSearchTerm("");

        if (fieldList.length > 0) {
          setSelectedFieldId(
            String(fieldList[0].id)
          );
        } else {
          setSelectedFieldId("");
        }
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
        setSelectedFieldId("");
      })
      .finally(() => {
        if (isMounted) {
          setLoadingFields(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedFarmId]);

  /*
   * Refresh crops after create, update, or delete.
   */
  const refreshCrops = async () => {
    try {
      setLoadingCrops(true);

      const response = await api.get("/crops");

      setCrops(response.data?.data || []);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to load crops.";

      setError(message);
      setCrops([]);
    } finally {
      setLoadingCrops(false);
    }
  };

  /*
   * Reset crop form.
   */
  const resetForm = () => {
    setFormData({
      fieldId: selectedFieldId || "",
      cropTypeId: "",
      name: "",
      plantingDate: "",
      growthDurationDays: "",
      expectedHarvestDate: "",
      actualHarvestDate: "",
      status: "planned",
      notes: "",
    });

    setEditingCrop(null);
    setShowForm(false);
  };

  /*
   * Handle normal form changes.
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * Handle farm filter change.
   */
  const handleFarmChange = (event) => {
    const farmId = event.target.value;

    setSelectedFarmId(farmId);
    setSelectedFieldId("");
    setFields([]);
    setSearchTerm("");
    setLoadingFields(Boolean(farmId));

    setFormData((previous) => ({
      ...previous,
      fieldId: "",
    }));

    setError("");
    setSuccess("");
  };

  /*
   * Handle field selection.
   */
  const handleFieldChange = (event) => {
    const fieldId = event.target.value;

    setSelectedFieldId(fieldId);

    setFormData((previous) => ({
      ...previous,
      fieldId,
    }));

    setError("");
    setSuccess("");
  };

  /*
   * Calculate expected harvest date.
   */
  const calculateExpectedHarvestDate = (
    plantingDate,
    growthDurationDays
  ) => {
    if (!plantingDate || !growthDurationDays) {
      return "";
    }

    const date = new Date(
      `${plantingDate}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    date.setDate(
      date.getDate() +
        Number(growthDurationDays)
    );

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /*
   * Create or update crop.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.fieldId) {
      setError("Please select a field.");
      return;
    }

    if (!formData.cropTypeId) {
      setError("Please select a crop type.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Please enter a crop name.");
      return;
    }

    if (!formData.plantingDate) {
      setError("Please select a planting date.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      setSaving(true);

      const payload = {
        fieldId: Number(formData.fieldId),

        cropTypeId: Number(
          formData.cropTypeId
        ),

        name: formData.name.trim(),

        plantingDate:
          formData.plantingDate,

        growthDurationDays:
          formData.growthDurationDays
            ? Number(
                formData.growthDurationDays
              )
            : undefined,

        expectedHarvestDate:
          formData.expectedHarvestDate ||
          undefined,

        actualHarvestDate:
          formData.actualHarvestDate ||
          undefined,

        status: formData.status,

        notes: formData.notes.trim(),
      };

      if (editingCrop) {
        await api.put(
          `/crops/${editingCrop.id}`,
          payload
        );

        setSuccess(
          "Crop updated successfully."
        );
      } else {
        await api.post(
          "/crops",
          payload
        );

        setSuccess(
          "Crop created successfully."
        );
      }

      resetForm();

      await refreshCrops();
    } catch (error) {
      const validationErrors =
        error.response?.data?.errors;

      if (
        Array.isArray(validationErrors) &&
        validationErrors.length > 0
      ) {
        setError(
          validationErrors
            .map((item) => item.msg)
            .join(", ")
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to save crop."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /*
   * Edit crop.
   */
  const handleEdit = (crop) => {
    const fieldId =
      crop.field_id ||
      crop.fieldId ||
      "";

    setEditingCrop(crop);

    setSelectedFieldId(
      String(fieldId)
    );

    setFormData({
      fieldId: String(fieldId),

      cropTypeId: String(
        crop.crop_type_id ||
          crop.cropTypeId ||
          ""
      ),

      name: crop.name || "",

      plantingDate:
        crop.planting_date ||
        crop.plantingDate ||
        "",

      growthDurationDays:
        crop.growth_duration_days ||
        crop.growthDurationDays ||
        "",

      expectedHarvestDate:
        crop.expected_harvest_date ||
        crop.expectedHarvestDate ||
        "",

      actualHarvestDate:
        crop.actual_harvest_date ||
        crop.actualHarvestDate ||
        "",

      status:
        crop.status || "planned",

      notes: crop.notes || "",
    });

    setShowForm(true);
    setError("");
    setSuccess("");
  };

  /*
   * Delete crop.
   */
  const handleDelete = async (crop) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${crop.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/crops/${crop.id}`
      );

      setSuccess(
        "Crop deleted successfully."
      );

      await refreshCrops();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete crop."
      );
    }
  };

  /*
   * Status badge.
   */
  const getStatusBadge = (status) => {
    const statusMap = {
      planned: {
        label: "Planned",
        className: "bg-secondary",
      },

      planted: {
        label: "Planted",
        className: "bg-info text-dark",
      },

      growing: {
        label: "Growing",
        className: "bg-success",
      },

      ready_for_harvest: {
        label: "Ready for Harvest",
        className: "bg-warning text-dark",
      },

      harvested: {
        label: "Harvested",
        className: "bg-primary",
      },
    };

    const current =
      statusMap[status] ||
      statusMap.planned;

    return (
      <span
        className={`badge ${current.className}`}
      >
        {current.label}
      </span>
    );
  };

  /*
   * Selected farm.
   */
  const selectedFarm = farms.find(
    (farm) =>
      String(farm.id) ===
      String(selectedFarmId)
  );

  /*
   * Selected field.
   */
  const selectedField = fields.find(
    (field) =>
      String(field.id) ===
      String(selectedFieldId)
  );

  /*
   * Show crops belonging to the selected farm.
   */
  const visibleCrops = crops.filter(
    (crop) => {
      if (!selectedFarmId) {
        return true;
      }

      const field = fields.find(
        (item) =>
          String(item.id) ===
          String(
            crop.field_id ||
              crop.fieldId
          )
      );

      return field !== undefined;
    }
  );

  /*
   * Search crops within the selected farm.
   *
   * Searches:
   * - crop name
   * - crop type
   * - field
   * - status
   * - notes
   */
  const filteredCrops = visibleCrops.filter(
    (crop) => {
      const search =
        searchTerm.trim().toLowerCase();

      if (!search) {
        return true;
      }

      const cropType =
        crop.crop_type_name ||
        crop.cropTypeName ||
        crop.crop_type ||
        "";

      const fieldName =
        crop.field_name ||
        crop.fieldName ||
        "";

      const status =
        crop.status || "";

      const notes =
        crop.notes || "";

      return (
        crop.name
          ?.toLowerCase()
          .includes(search) ||
        cropType
          .toLowerCase()
          .includes(search) ||
        fieldName
          .toLowerCase()
          .includes(search) ||
        status
          .toLowerCase()
          .includes(search) ||
        notes
          .toLowerCase()
          .includes(search)
      );
    }
  );

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Crops
          </h2>

          <p className="text-muted mb-0">
            Manage planted crops, growth periods,
            and harvest schedules.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-success d-flex align-items-center justify-content-center gap-2"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          disabled={
            !selectedFieldId ||
            cropTypes.length === 0
          }
        >
          <FaPlus />
          Add Crop
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

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Farm */}
            <div className="col-12 col-md-6">
              <label
                htmlFor="crop-farm"
                className="form-label fw-semibold"
              >
                Select Farm
              </label>

              <select
                id="crop-farm"
                className="form-select"
                value={selectedFarmId}
                onChange={handleFarmChange}
                disabled={loading}
              >
                <option value="">
                  Select a farm
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

            {/* Field */}
            <div className="col-12 col-md-6">
              <label
                htmlFor="crop-field"
                className="form-label fw-semibold"
              >
                Select Field
              </label>

              <select
                id="crop-field"
                className="form-select"
                value={selectedFieldId}
                onChange={handleFieldChange}
                disabled={
                  loadingFields ||
                  !selectedFarmId
                }
              >
                <option value="">
                  {loadingFields
                    ? "Loading fields..."
                    : "Select a field"}
                </option>

                {fields.map((field) => (
                  <option
                    key={field.id}
                    value={field.id}
                  >
                    {field.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedFarm && (
            <div className="mt-3 bg-light rounded p-3">
              <div className="small text-muted">
                Selected farm
              </div>

              <div className="fw-semibold">
                {selectedFarm.name}
              </div>

              {selectedField && (
                <div className="small text-muted">
                  Field: {selectedField.name}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">
                {editingCrop
                  ? "Edit Crop"
                  : "Add New Crop"}
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
                {/* Field */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="crop-form-field"
                    className="form-label fw-semibold"
                  >
                    Field
                  </label>

                  <select
                    id="crop-form-field"
                    name="fieldId"
                    className="form-select"
                    value={formData.fieldId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select field
                    </option>

                    {fields.map((field) => (
                      <option
                        key={field.id}
                        value={field.id}
                      >
                        {field.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Crop Type */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="crop-type"
                    className="form-label fw-semibold"
                  >
                    Crop Type
                  </label>

                  <select
                    id="crop-type"
                    name="cropTypeId"
                    className="form-select"
                    value={formData.cropTypeId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select crop type
                    </option>

                    {cropTypes.map(
                      (cropType) => (
                        <option
                          key={cropType.id}
                          value={cropType.id}
                        >
                          {cropType.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Crop Name */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="crop-name"
                    className="form-label fw-semibold"
                  >
                    Crop Name
                  </label>

                  <input
                    type="text"
                    id="crop-name"
                    name="name"
                    className="form-control"
                    placeholder="e.g. Maize Season 2026"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Planting Date */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="planting-date"
                    className="form-label fw-semibold"
                  >
                    Planting Date
                  </label>

                  <input
                    type="date"
                    id="planting-date"
                    name="plantingDate"
                    className="form-control"
                    value={formData.plantingDate}
                    onChange={(event) => {
                      const plantingDate =
                        event.target.value;

                      setFormData(
                        (previous) => ({
                          ...previous,
                          plantingDate,
                          expectedHarvestDate:
                            calculateExpectedHarvestDate(
                              plantingDate,
                              previous.growthDurationDays
                            ),
                        })
                      );
                    }}
                    required
                  />
                </div>

                {/* Growth Duration */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="growth-duration"
                    className="form-label fw-semibold"
                  >
                    Growth Duration (Days)
                  </label>

                  <input
                    type="number"
                    id="growth-duration"
                    name="growthDurationDays"
                    className="form-control"
                    min="1"
                    placeholder="e.g. 120"
                    value={
                      formData.growthDurationDays
                    }
                    onChange={(event) => {
                      const duration =
                        event.target.value;

                      setFormData(
                        (previous) => ({
                          ...previous,
                          growthDurationDays:
                            duration,
                          expectedHarvestDate:
                            calculateExpectedHarvestDate(
                              previous.plantingDate,
                              duration
                            ),
                        })
                      );
                    }}
                  />

                  <div className="form-text">
                    The system uses this to calculate
                    the expected harvest date.
                  </div>
                </div>

                {/* Expected Harvest */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="expected-harvest"
                    className="form-label fw-semibold"
                  >
                    Expected Harvest Date
                  </label>

                  <input
                    type="date"
                    id="expected-harvest"
                    name="expectedHarvestDate"
                    className="form-control"
                    value={
                      formData.expectedHarvestDate
                    }
                    onChange={handleChange}
                  />

                  <div className="form-text">
                    Automatically calculated when
                    planting date and growth duration
                    are provided.
                  </div>
                </div>

                {/* Actual Harvest */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="actual-harvest"
                    className="form-label fw-semibold"
                  >
                    Actual Harvest Date
                  </label>

                  <input
                    type="date"
                    id="actual-harvest"
                    name="actualHarvestDate"
                    className="form-control"
                    value={
                      formData.actualHarvestDate
                    }
                    onChange={handleChange}
                  />
                </div>

                {/* Status */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="crop-status"
                    className="form-label fw-semibold"
                  >
                    Status
                  </label>

                  <select
                    id="crop-status"
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="planned">
                      Planned
                    </option>

                    <option value="planted">
                      Planted
                    </option>

                    <option value="growing">
                      Growing
                    </option>

                    <option value="ready_for_harvest">
                      Ready for Harvest
                    </option>

                    <option value="harvested">
                      Harvested
                    </option>
                  </select>
                </div>

                {/* Notes */}
                <div className="col-12">
                  <label
                    htmlFor="crop-notes"
                    className="form-label fw-semibold"
                  >
                    Notes
                  </label>

                  <textarea
                    id="crop-notes"
                    name="notes"
                    className="form-control"
                    rows="3"
                    placeholder="Optional crop notes"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

                {/* Buttons */}
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
                      : editingCrop
                      ? "Update Crop"
                      : "Save Crop"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crops Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1 fw-semibold">
                {selectedFarm
                  ? `${selectedFarm.name} Crops`
                  : "Crops"}
              </h5>

              <small className="text-muted">
                Showing{" "}
                <strong>
                  {filteredCrops.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {visibleCrops.length}
                </strong>{" "}
                crop
                {visibleCrops.length === 1
                  ? ""
                  : "s"}
              </small>
            </div>

            <FaSeedling
              className="text-success"
              size={22}
            />
          </div>
        </div>

        <div className="card-body p-0">
          {loading || loadingCrops ? (
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
                Loading crops...
              </p>
            </div>
          ) : !selectedFarmId ? (
            <div className="text-center py-5 px-3">
              <FaSeedling
                size={40}
                className="text-muted mb-3"
              />

              <h5 className="fw-semibold">
                Select a farm
              </h5>

              <p className="text-muted mb-0">
                Select a farm above to view its crops.
              </p>
            </div>
          ) : visibleCrops.length === 0 ? (
            <div className="text-center py-5 px-3">
              <FaSeedling
                size={40}
                className="text-muted mb-3"
              />

              <h5 className="fw-semibold">
                No crops found
              </h5>

              <p className="text-muted mb-3">
                This farm does not have any crops yet.
              </p>

              <button
                type="button"
                className="btn btn-success"
                disabled={
                  !selectedFieldId ||
                  cropTypes.length === 0
                }
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                <FaPlus className="me-2" />
                Add First Crop
              </button>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="p-3 p-md-4 pb-0">
                <label
                  htmlFor="crop-search"
                  className="form-label fw-semibold"
                >
                  Search Crops
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FaSearch className="text-success" />
                  </span>

                  <input
                    type="text"
                    id="crop-search"
                    className="form-control"
                    placeholder="Search by crop name, type, field, status, or notes..."
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

              {filteredCrops.length === 0 ? (
                <div className="text-center py-5 px-3">
                  <FaSearch
                    size={40}
                    className="text-muted mb-3"
                  />

                  <h5 className="fw-semibold">
                    No matching crops
                  </h5>

                  <p className="text-muted mb-3">
                    No crops match your current search.
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
                <div className="table-responsive mt-3">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Crop</th>
                        <th>Type</th>
                        <th>Field</th>
                        <th>Planting Date</th>
                        <th>Expected Harvest</th>
                        <th>Status</th>
                        <th className="text-end">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCrops.map(
                        (crop) => (
                          <tr key={crop.id}>
                            <td>
                              <div className="fw-semibold">
                                {crop.name}
                              </div>

                              <small className="text-muted">
                                Crop #{crop.id}
                              </small>
                            </td>

                            <td>
                              {crop.crop_type_name ||
                                crop.cropTypeName ||
                                crop.crop_type ||
                                "—"}
                            </td>

                            <td>
                              {crop.field_name ||
                                crop.fieldName ||
                                "—"}
                            </td>

                            <td>
                              {crop.planting_date ||
                                crop.plantingDate ||
                                "—"}
                            </td>

                            <td>
                              {crop.expected_harvest_date ||
                                crop.expectedHarvestDate ||
                                "—"}
                            </td>

                            <td>
                              {getStatusBadge(
                                crop.status
                              )}
                            </td>

                            <td>
                              <div className="d-flex justify-content-end gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() =>
                                    handleEdit(
                                      crop
                                    )
                                  }
                                  title="Edit crop"
                                >
                                  <FaEdit />
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() =>
                                    handleDelete(
                                      crop
                                    )
                                  }
                                  title="Delete crop"
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

export default Crops;