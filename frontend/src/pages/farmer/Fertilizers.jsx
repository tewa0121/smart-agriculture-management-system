import { useEffect, useMemo, useState } from "react";
import {
  FaEdit,
  FaFlask,
  FaPlus,
  FaTrash,
  FaTimes,
  FaSearch,
} from "react-icons/fa";

import api from "../../services/api";

function Fertilizers() {
  const [records, setRecords] = useState([]);
  const [crops, setCrops] = useState([]);
  const [fertilizerTypes, setFertilizerTypes] =
    useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    cropId: "",
    fertilizerTypeId: "",
    applicationDate: "",
    quantity: "",
    quantityUnit: "kg",
    cost: "",
    intervalDays: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      cropId: "",
      fertilizerTypeId: "",
      applicationDate: "",
      quantity: "",
      quantityUnit: "kg",
      cost: "",
      intervalDays: "",
      notes: "",
    });

    setEditingId(null);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        recordsResponse,
        cropsResponse,
        typesResponse,
      ] = await Promise.all([
        api.get("/fertilizer"),
        api.get("/crops"),
        api.get("/fertilizer/types"),
      ]);

      setRecords(recordsResponse.data.data || []);
      setCrops(cropsResponse.data.data || []);
      setFertilizerTypes(
        typesResponse.data.data || []
      );
    } catch (err) {
      console.error(
        "Load fertilizer data error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load fertilizer data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          recordsResponse,
          cropsResponse,
          typesResponse,
        ] = await Promise.all([
          api.get("/fertilizer"),
          api.get("/crops"),
          api.get("/fertilizer/types"),
        ]);

        if (cancelled) {
          return;
        }

        setRecords(recordsResponse.data.data || []);
        setCrops(cropsResponse.data.data || []);
        setFertilizerTypes(
          typesResponse.data.data || []
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load fertilizer data error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load fertilizer data."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    resetForm();
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (record) => {
    setEditingId(record.id);

    setFormData({
      cropId: record.crop_id || "",
      fertilizerTypeId:
        record.fertilizer_type_id || "",

      applicationDate: record.application_date
        ? String(
            record.application_date
          ).substring(0, 10)
        : "",

      quantity: record.quantity ?? "",

      quantityUnit:
        record.quantity_unit || "kg",

      cost: record.cost ?? "",

      intervalDays:
        record.interval_days ?? "",

      notes: record.notes || "",
    });

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

  const validateForm = () => {
    if (!formData.cropId) {
      return "Please select a crop.";
    }

    if (!formData.applicationDate) {
      return "Please select an application date.";
    }

    if (
      formData.quantity !== "" &&
      Number(formData.quantity) < 0
    ) {
      return "Quantity cannot be negative.";
    }

    if (
      formData.cost !== "" &&
      Number(formData.cost) < 0
    ) {
      return "Cost cannot be negative.";
    }

    if (
      formData.intervalDays !== "" &&
      Number(formData.intervalDays) < 0
    ) {
      return "Interval days cannot be negative.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        cropId: Number(formData.cropId),

        fertilizerTypeId:
          formData.fertilizerTypeId
            ? Number(
                formData.fertilizerTypeId
              )
            : null,

        applicationDate:
          formData.applicationDate,

        quantity:
          formData.quantity === ""
            ? null
            : Number(formData.quantity),

        quantityUnit:
          formData.quantityUnit || "kg",

        cost:
          formData.cost === ""
            ? 0
            : Number(formData.cost),

        intervalDays:
          formData.intervalDays === ""
            ? null
            : Number(formData.intervalDays),

        notes:
          formData.notes.trim() || null,
      };

      if (editingId) {
        await api.put(
          `/fertilizer/${editingId}`,
          payload
        );

        setSuccess(
          "Fertilizer record updated successfully."
        );
      } else {
        await api.post(
          "/fertilizer",
          payload
        );

        setSuccess(
          "Fertilizer record created successfully."
        );
      }

      await loadData();

      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error(
        "Save fertilizer record error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save fertilizer record."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this fertilizer record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/fertilizer/${id}`
      );

      setSuccess(
        "Fertilizer record deleted successfully."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Delete fertilizer record error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete fertilizer record."
      );
    }
  };

  const getNextFertilizerDate = (
    record
  ) => {
    if (
      !record.application_date ||
      !record.interval_days
    ) {
      return null;
    }

    const date = new Date(
      `${String(
        record.application_date
      ).substring(0, 10)}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    date.setDate(
      date.getDate() +
        Number(record.interval_days)
    );

    return [
      date.getFullYear(),
      String(
        date.getMonth() + 1
      ).padStart(2, "0"),
      String(
        date.getDate()
      ).padStart(2, "0"),
    ].join("-");
  };

  const isDue = (record) => {
    const nextDate =
      getNextFertilizerDate(record);

    if (!nextDate) {
      return false;
    }

    const today = new Date();

    const todayString = [
      today.getFullYear(),
      String(
        today.getMonth() + 1
      ).padStart(2, "0"),
      String(
        today.getDate()
      ).padStart(2, "0"),
    ].join("-");

    return nextDate <= todayString;
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return String(date).substring(0, 10);
  };

  const totalCost = useMemo(() => {
    return records.reduce(
      (total, record) =>
        total +
        (Number(record.cost) || 0),
      0
    );
  }, [records]);

  const dueCount = useMemo(() => {
    return records.filter(
      (record) => isDue(record)
    ).length;
  }, [records]);

  const upcomingCount = useMemo(() => {
    return records.filter((record) => {
      const nextDate =
        getNextFertilizerDate(record);

      return (
        nextDate && !isDue(record)
      );
    }).length;
  }, [records]);

  /*
   * Search fertilizer records.
   *
   * Searches:
   * - crop name
   * - farm name
   * - fertilizer type
   * - application date
   * - quantity/unit
   * - cost
   * - interval
   * - notes
   * - schedule status
   */
  const filteredRecords = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    if (!search) {
      return records;
    }

    return records.filter((record) => {
      const cropName =
        record.crop_name || "";

      const farmName =
        record.farm_name || "";

      const fertilizerName =
        record.fertilizer_type_name ||
        "";

      const applicationDate =
        formatDate(
          record.application_date
        );

      const quantity =
        record.quantity ?? "";

      const quantityUnit =
        record.quantity_unit || "";

      const cost =
        record.cost ?? "";

      const intervalDays =
        record.interval_days ?? "";

      const notes =
        record.notes || "";

      const nextDate =
        getNextFertilizerDate(record) ||
        "";

      const status = isDue(record)
        ? "fertilizer due due"
        : nextDate
        ? "scheduled upcoming"
        : "no schedule";

      const searchableText = [
        cropName,
        farmName,
        fertilizerName,
        applicationDate,
        quantity,
        quantityUnit,
        cost,
        intervalDays,
        notes,
        nextDate,
        status,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        search
      );
    });
  }, [records, searchTerm]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Fertilizer Management
          </h2>

          <p className="text-muted mb-0">
            Record fertilizer applications and
            track upcoming fertilizer schedules.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-success"
          onClick={openCreateForm}
        >
          <FaPlus className="me-2" />
          Add Fertilizer
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible"
          role="alert"
        >
          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          />
        </div>
      )}

      {success && (
        <div
          className="alert alert-success alert-dismissible"
          role="alert"
        >
          {success}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          />
        </div>
      )}

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    Total Applications
                  </p>

                  <h3 className="fw-bold mb-0">
                    {records.length}
                  </h3>
                </div>

                <FaFlask
                  size={28}
                  className="text-success"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    Fertilizer Due
                  </p>

                  <h3 className="fw-bold mb-0 text-danger">
                    {dueCount}
                  </h3>
                </div>

                <FaFlask
                  size={28}
                  className="text-danger"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    Total Fertilizer Cost
                  </p>

                  <h3 className="fw-bold mb-0">
                    {totalCost.toFixed(2)}
                  </h3>
                </div>

                <span className="text-muted">
                  ETB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              {editingId
                ? "Edit Fertilizer Record"
                : "Add Fertilizer Record"}
            </h5>

            <button
              type="button"
              className="btn btn-sm btn-light"
              onClick={closeForm}
              disabled={saving}
            >
              <FaTimes />
            </button>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Crop */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="cropId"
                    className="form-label"
                  >
                    Crop *
                  </label>

                  <select
                    id="cropId"
                    name="cropId"
                    className="form-select"
                    value={formData.cropId}
                    onChange={handleChange}
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
                        {crop.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fertilizer type */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="fertilizerTypeId"
                    className="form-label"
                  >
                    Fertilizer Type
                  </label>

                  <select
                    id="fertilizerTypeId"
                    name="fertilizerTypeId"
                    className="form-select"
                    value={
                      formData.fertilizerTypeId
                    }
                    onChange={handleChange}
                  >
                    <option value="">
                      Select fertilizer type
                    </option>

                    {fertilizerTypes.map(
                      (type) => (
                        <option
                          key={type.id}
                          value={type.id}
                        >
                          {type.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Application date */}
                <div className="col-12 col-md-4">
                  <label
                    htmlFor="applicationDate"
                    className="form-label"
                  >
                    Application Date *
                  </label>

                  <input
                    type="date"
                    id="applicationDate"
                    name="applicationDate"
                    className="form-control"
                    value={
                      formData.applicationDate
                    }
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="col-6 col-md-4">
                  <label
                    htmlFor="quantity"
                    className="form-label"
                  >
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    id="quantity"
                    name="quantity"
                    className="form-control"
                    value={
                      formData.quantity
                    }
                    onChange={handleChange}
                    placeholder="e.g. 50"
                  />
                </div>

                {/* Unit */}
                <div className="col-6 col-md-4">
                  <label
                    htmlFor="quantityUnit"
                    className="form-label"
                  >
                    Unit
                  </label>

                  <select
                    id="quantityUnit"
                    name="quantityUnit"
                    className="form-select"
                    value={
                      formData.quantityUnit
                    }
                    onChange={handleChange}
                  >
                    <option value="kg">
                      kg
                    </option>

                    <option value="liters">
                      Liters
                    </option>

                    <option value="bags">
                      Bags
                    </option>

                    <option value="tons">
                      Tons
                    </option>

                    <option value="units">
                      Units
                    </option>
                  </select>
                </div>

                {/* Cost */}
                <div className="col-12 col-md-4">
                  <label
                    htmlFor="cost"
                    className="form-label"
                  >
                    Cost (ETB)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    id="cost"
                    name="cost"
                    className="form-control"
                    value={formData.cost}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                {/* Interval */}
                <div className="col-12 col-md-4">
                  <label
                    htmlFor="intervalDays"
                    className="form-label"
                  >
                    Next Application Interval
                    (days)
                  </label>

                  <input
                    type="number"
                    min="0"
                    id="intervalDays"
                    name="intervalDays"
                    className="form-control"
                    value={
                      formData.intervalDays
                    }
                    onChange={handleChange}
                    placeholder="e.g. 30"
                  />
                </div>

                {/* Notes */}
                <div className="col-12">
                  <label
                    htmlFor="notes"
                    className="form-label"
                  >
                    Notes
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    className="form-control"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Additional notes..."
                  />
                </div>

                {/* Buttons */}
                <div className="col-12 d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
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
                      : editingId
                      ? "Update Record"
                      : "Save Record"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Records */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
            <div>
              <h5 className="mb-1">
                Fertilizer Applications
              </h5>

              <small className="text-muted">
                Showing{" "}
                <strong>
                  {filteredRecords.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {records.length}
                </strong>{" "}
                record
                {records.length === 1
                  ? ""
                  : "s"}
              </small>
            </div>

            <span className="text-muted small">
              Upcoming: {upcomingCount}
            </span>
          </div>
        </div>

        <div className="card-body">
          {/* Search */}
          {records.length > 0 && (
            <div className="mb-4">
              <label
                htmlFor="fertilizer-search"
                className="form-label fw-semibold"
              >
                Search Fertilizer Records
              </label>

              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch className="text-success" />
                </span>

                <input
                  type="text"
                  id="fertilizer-search"
                  className="form-control"
                  placeholder="Search by crop, fertilizer, farm, date, status, cost, or notes..."
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

          {loading ? (
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
                Loading fertilizer records...
              </p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-5">
              <FaFlask
                size={40}
                className="text-muted mb-3"
              />

              <h5>No fertilizer records</h5>

              <p className="text-muted">
                Add your first fertilizer
                application record.
              </p>

              <button
                type="button"
                className="btn btn-success"
                onClick={openCreateForm}
              >
                <FaPlus className="me-2" />
                Add Fertilizer
              </button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-5">
              <FaSearch
                size={40}
                className="text-muted mb-3"
              />

              <h5>
                No matching fertilizer records
              </h5>

              <p className="text-muted mb-3">
                No fertilizer records match your
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
                    <th>Crop</th>
                    <th>Fertilizer</th>
                    <th>Application Date</th>
                    <th>Quantity</th>
                    <th>Cost</th>
                    <th>Next Application</th>
                    <th>Status</th>
                    <th className="text-end">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map(
                    (record) => {
                      const nextDate =
                        getNextFertilizerDate(
                          record
                        );

                      const due =
                        isDue(record);

                      return (
                        <tr key={record.id}>
                          <td>
                            <div className="fw-semibold">
                              {record.crop_name ||
                                "Unknown Crop"}
                            </div>

                            {record.farm_name && (
                              <small className="text-muted">
                                {
                                  record.farm_name
                                }
                              </small>
                            )}
                          </td>

                          <td>
                            {record.fertilizer_type_name ||
                              "Not specified"}
                          </td>

                          <td>
                            {formatDate(
                              record.application_date
                            )}
                          </td>

                          <td>
                            {record.quantity ??
                              "-"}{" "}
                            {record.quantity_unit ||
                              ""}
                          </td>

                          <td>
                            {(
                              Number(
                                record.cost
                              ) || 0
                            ).toFixed(2)}{" "}
                            ETB
                          </td>

                          <td>
                            {nextDate || "-"}
                          </td>

                          <td>
                            {due ? (
                              <span className="badge bg-danger">
                                Fertilizer Due
                              </span>
                            ) : nextDate ? (
                              <span className="badge bg-success">
                                Scheduled
                              </span>
                            ) : (
                              <span className="badge bg-secondary">
                                No Schedule
                              </span>
                            )}
                          </td>

                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  openEditForm(
                                    record
                                  )
                                }
                                title="Edit"
                              >
                                <FaEdit />
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleDelete(
                                    record.id
                                  )
                                }
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Fertilizers;