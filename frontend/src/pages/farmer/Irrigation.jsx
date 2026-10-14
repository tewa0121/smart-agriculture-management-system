import { useEffect, useMemo, useState } from "react";
import {
  FaEdit,
  FaPlus,
  FaTint,
  FaTrash,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

import api from "../../services/api";

function Irrigation() {
  const [crops, setCrops] = useState([]);
  const [methods, setMethods] = useState([]);
  const [records, setRecords] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] =
    useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState(null);

  const [formData, setFormData] = useState({
    cropId: "",
    irrigationMethodId: "",
    irrigationDate: "",
    quantity: "",
    quantityUnit: "liters",
    cost: "",
    intervalDays: "",
    notes: "",
  });

  /*
   * Load crops, irrigation methods, and records.
   */
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.get("/crops"),
      api.get("/irrigation/methods"),
      api.get("/irrigation"),
    ])
      .then(
        ([
          cropsResponse,
          methodsResponse,
          recordsResponse,
        ]) => {
          if (!isMounted) {
            return;
          }

          const cropList =
            cropsResponse.data?.data || [];

          const methodList =
            methodsResponse.data?.data || [];

          const recordList =
            recordsResponse.data?.data || [];

          setCrops(cropList);
          setMethods(methodList);
          setRecords(recordList);

          if (cropList.length > 0) {
            setFormData((previous) => ({
              ...previous,
              cropId: String(cropList[0].id),
            }));
          }

          if (methodList.length > 0) {
            setFormData((previous) => ({
              ...previous,
              irrigationMethodId: String(
                methodList[0].id
              ),
            }));
          }
        }
      )
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setError(
          error.response?.data?.message ||
            "Failed to load irrigation information."
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

  /*
   * Refresh irrigation records.
   */
  const refreshRecords = async () => {
    try {
      setLoadingRecords(true);

      const response =
        await api.get("/irrigation");

      setRecords(
        response.data?.data || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load irrigation records."
      );
    } finally {
      setLoadingRecords(false);
    }
  };

  /*
   * Reset form.
   */
  const resetForm = () => {
    setFormData({
      cropId:
        crops.length > 0
          ? String(crops[0].id)
          : "",

      irrigationMethodId:
        methods.length > 0
          ? String(methods[0].id)
          : "",

      irrigationDate: "",
      quantity: "",
      quantityUnit: "liters",
      cost: "",
      intervalDays: "",
      notes: "",
    });

    setEditingRecord(null);
    setShowForm(false);
  };

  /*
   * Handle form changes.
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /*
   * Create or update irrigation record.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.cropId) {
      setError("Please select a crop.");
      return;
    }

    if (!formData.irrigationMethodId) {
      setError(
        "Please select an irrigation method."
      );
      return;
    }

    if (!formData.irrigationDate) {
      setError(
        "Please select an irrigation date."
      );
      return;
    }

    if (!formData.quantity) {
      setError(
        "Please enter the irrigation quantity."
      );
      return;
    }

    if (Number(formData.quantity) < 0) {
      setError(
        "Irrigation quantity cannot be negative."
      );
      return;
    }

    if (
      formData.cost !== "" &&
      Number(formData.cost) < 0
    ) {
      setError(
        "Irrigation cost cannot be negative."
      );
      return;
    }

    if (
      formData.intervalDays !== "" &&
      Number(formData.intervalDays) < 0
    ) {
      setError(
        "Irrigation interval cannot be negative."
      );
      return;
    }

    setError("");
    setSuccess("");

    try {
      setSaving(true);

      const payload = {
        cropId: Number(formData.cropId),

        irrigationMethodId: Number(
          formData.irrigationMethodId
        ),

        irrigationDate:
          formData.irrigationDate,

        quantity: Number(
          formData.quantity
        ),

        quantityUnit:
          formData.quantityUnit,

        cost:
          formData.cost !== ""
            ? Number(formData.cost)
            : 0,

        intervalDays:
          formData.intervalDays !== ""
            ? Number(
                formData.intervalDays
              )
            : undefined,

        notes:
          formData.notes.trim(),
      };

      if (editingRecord) {
        await api.put(
          `/irrigation/${editingRecord.id}`,
          payload
        );

        setSuccess(
          "Irrigation record updated successfully."
        );
      } else {
        await api.post(
          "/irrigation",
          payload
        );

        setSuccess(
          "Irrigation record created successfully."
        );
      }

      resetForm();

      await refreshRecords();
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
            "Failed to save irrigation record."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /*
   * Edit irrigation record.
   */
  const handleEdit = (record) => {
    setEditingRecord(record);

    setFormData({
      cropId: String(
        record.crop_id ||
          record.cropId ||
          ""
      ),

      irrigationMethodId: String(
        record.irrigation_method_id ||
          record.irrigationMethodId ||
          ""
      ),

      irrigationDate:
        record.irrigation_date
          ? String(
              record.irrigation_date
            ).substring(0, 10)
          : record.irrigationDate || "",

      quantity:
        record.quantity ?? "",

      quantityUnit:
        record.quantity_unit ||
        record.quantityUnit ||
        "liters",

      cost:
        record.cost ?? "",

      intervalDays:
        record.interval_days ??
        record.intervalDays ??
        "",

      notes: record.notes || "",
    });

    setShowForm(true);
    setError("");
    setSuccess("");
  };

  /*
   * Delete irrigation record.
   */
  const handleDelete = async (record) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this irrigation record?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/irrigation/${record.id}`
      );

      setSuccess(
        "Irrigation record deleted successfully."
      );

      await refreshRecords();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete irrigation record."
      );
    }
  };

  /*
   * Calculate next irrigation date.
   */
  const getNextIrrigationDate = (
    record
  ) => {
    const dateValue =
      record.irrigation_date ||
      record.irrigationDate;

    const interval =
      record.interval_days ??
      record.intervalDays;

    if (!dateValue || !interval) {
      return null;
    }

    const date = new Date(
      `${String(dateValue).substring(
        0,
        10
      )}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    date.setDate(
      date.getDate() + Number(interval)
    );

    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /*
   * Determine whether irrigation is due.
   */
  const isIrrigationDue = (record) => {
    const nextDate =
      getNextIrrigationDate(record);

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

  /*
   * Get crop display name.
   */
  const getCropName = (record) => {
    return (
      record.crop_name ||
      record.cropName ||
      crops.find(
        (crop) =>
          String(crop.id) ===
          String(
            record.crop_id ||
              record.cropId
          )
      )?.name ||
      "—"
    );
  };

  /*
   * Get irrigation method display name.
   */
  const getMethodName = (record) => {
    return (
      record.irrigation_method_name ||
      record.irrigationMethodName ||
      methods.find(
        (method) =>
          String(method.id) ===
          String(
            record.irrigation_method_id ||
              record.irrigationMethodId
          )
      )?.name ||
      "—"
    );
  };

  /*
   * Get farm display name.
   */
  const getFarmName = (record) => {
    return (
      record.farm_name ||
      record.farmName ||
      ""
    );
  };

  /*
   * Search irrigation records.
   *
   * Searches:
   * - crop
   * - farm
   * - irrigation method
   * - irrigation date
   * - quantity
   * - quantity unit
   * - cost
   * - interval
   * - next irrigation date
   * - status
   * - notes
   */
  const filteredRecords = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    if (!search) {
      return records;
    }

    return records.filter((record) => {
      const cropName =
        getCropName(record);

      const methodName =
        getMethodName(record);

      const farmName =
        getFarmName(record);

      const irrigationDate =
        record.irrigation_date ||
        record.irrigationDate ||
        "";

      const quantity =
        record.quantity ?? "";

      const quantityUnit =
        record.quantity_unit ||
        record.quantityUnit ||
        "";

      const cost =
        record.cost ?? "";

      const intervalDays =
        record.interval_days ??
        record.intervalDays ??
        "";

      const nextDate =
        getNextIrrigationDate(
          record
        ) || "";

      const notes =
        record.notes || "";

      const status = isIrrigationDue(
        record
      )
        ? "irrigation due due"
        : nextDate
        ? "scheduled upcoming"
        : "no schedule";

      const searchableText = [
        cropName,
        methodName,
        farmName,
        irrigationDate,
        quantity,
        quantityUnit,
        cost,
        intervalDays,
        nextDate,
        status,
        notes,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        search
      );
    });
  }, [
    records,
    searchTerm,
    crops,
    methods,
  ]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  /*
   * Calculate statistics.
   */
  const totalRecords =
    records.length;

  const dueRecords =
    records.filter(
      (record) =>
        isIrrigationDue(record)
    ).length;

  const totalCost =
    records.reduce(
      (total, record) =>
        total +
        Number(record.cost || 0),
      0
    );

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Irrigation
          </h2>

          <p className="text-muted mb-0">
            Record irrigation activities and track
            upcoming irrigation schedules.
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
            crops.length === 0 ||
            methods.length === 0
          }
        >
          <FaPlus />
          Add Irrigation
        </button>
      </div>

      {/* Messages */}
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

      {/* Statistics */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="bg-success bg-opacity-10 text-success rounded-circle p-3">
                <FaTint size={22} />
              </div>

              <div>
                <div className="text-muted small">
                  Total Records
                </div>

                <div className="fs-4 fw-bold">
                  {totalRecords}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-3">
                <FaTint size={22} />
              </div>

              <div>
                <div className="text-muted small">
                  Irrigation Due
                </div>

                <div className="fs-4 fw-bold">
                  {dueRecords}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3">
                <span className="fw-bold">
                  ETB
                </span>
              </div>

              <div>
                <div className="text-muted small">
                  Total Irrigation Cost
                </div>

                <div className="fs-4 fw-bold">
                  {totalCost.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">
                {editingRecord
                  ? "Edit Irrigation Record"
                  : "Add Irrigation Record"}
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
                {/* Crop */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="irrigation-crop"
                    className="form-label fw-semibold"
                  >
                    Crop
                  </label>

                  <select
                    id="irrigation-crop"
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

                {/* Method */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="irrigation-method"
                    className="form-label fw-semibold"
                  >
                    Irrigation Method
                  </label>

                  <select
                    id="irrigation-method"
                    name="irrigationMethodId"
                    className="form-select"
                    value={
                      formData.irrigationMethodId
                    }
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select method
                    </option>

                    {methods.map(
                      (method) => (
                        <option
                          key={method.id}
                          value={method.id}
                        >
                          {method.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Date */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="irrigation-date"
                    className="form-label fw-semibold"
                  >
                    Irrigation Date
                  </label>

                  <input
                    type="date"
                    id="irrigation-date"
                    name="irrigationDate"
                    className="form-control"
                    value={
                      formData.irrigationDate
                    }
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="irrigation-quantity"
                    className="form-label fw-semibold"
                  >
                    Quantity
                  </label>

                  <div className="input-group">
                    <input
                      type="number"
                      id="irrigation-quantity"
                      name="quantity"
                      className="form-control"
                      min="0"
                      step="0.01"
                      value={
                        formData.quantity
                      }
                      onChange={handleChange}
                      placeholder="e.g. 500"
                      required
                    />

                    <select
                      name="quantityUnit"
                      className="form-select"
                      value={
                        formData.quantityUnit
                      }
                      onChange={handleChange}
                      style={{
                        maxWidth: "130px",
                      }}
                    >
                      <option value="liters">
                        Liters
                      </option>

                      <option value="cubic_meters">
                        m³
                      </option>

                      <option value="mm">
                        mm
                      </option>
                    </select>
                  </div>
                </div>

                {/* Cost */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="irrigation-cost"
                    className="form-label fw-semibold"
                  >
                    Cost
                  </label>

                  <div className="input-group">
                    <span className="input-group-text">
                      ETB
                    </span>

                    <input
                      type="number"
                      id="irrigation-cost"
                      name="cost"
                      className="form-control"
                      min="0"
                      step="0.01"
                      value={formData.cost}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Interval */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="irrigation-interval"
                    className="form-label fw-semibold"
                  >
                    Irrigation Interval
                  </label>

                  <div className="input-group">
                    <input
                      type="number"
                      id="irrigation-interval"
                      name="intervalDays"
                      className="form-control"
                      min="1"
                      value={
                        formData.intervalDays
                      }
                      onChange={handleChange}
                      placeholder="e.g. 7"
                    />

                    <span className="input-group-text">
                      days
                    </span>
                  </div>

                  <div className="form-text">
                    Used to calculate the next
                    irrigation date.
                  </div>
                </div>

                {/* Notes */}
                <div className="col-12">
                  <label
                    htmlFor="irrigation-notes"
                    className="form-label fw-semibold"
                  >
                    Notes
                  </label>

                  <textarea
                    id="irrigation-notes"
                    name="notes"
                    className="form-control"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Optional irrigation notes"
                  />
                </div>

                {/* Buttons */}
                <div className="col-12 d-flex flex-column flex-sm-row justify-content-end gap-2">
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
                      : editingRecord
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
              <h5 className="mb-1 fw-semibold">
                Irrigation History
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

            <div className="text-muted small">
              Due: {dueRecords}
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Search */}
          {records.length > 0 && (
            <div className="mb-4">
              <label
                htmlFor="irrigation-search"
                className="form-label fw-semibold"
              >
                Search Irrigation Records
              </label>

              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch className="text-success" />
                </span>

                <input
                  type="text"
                  id="irrigation-search"
                  className="form-control"
                  placeholder="Search by crop, farm, method, date, status, cost, or notes..."
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

          {loading ||
          loadingRecords ? (
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
                Loading irrigation records...
              </p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-5 px-3">
              <FaTint
                size={40}
                className="text-muted mb-3"
              />

              <h5 className="fw-semibold">
                No irrigation records
              </h5>

              <p className="text-muted mb-3">
                Start recording irrigation activities
                for your crops.
              </p>

              <button
                type="button"
                className="btn btn-success"
                disabled={
                  crops.length === 0 ||
                  methods.length === 0
                }
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                <FaPlus className="me-2" />
                Add First Record
              </button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-5 px-3">
              <FaSearch
                size={40}
                className="text-muted mb-3"
              />

              <h5 className="fw-semibold">
                No matching irrigation records
              </h5>

              <p className="text-muted mb-3">
                No irrigation records match your
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
                    <th>Method</th>
                    <th>Date</th>
                    <th>Quantity</th>
                    <th>Cost</th>
                    <th>Next Irrigation</th>
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
                        getNextIrrigationDate(
                          record
                        );

                      const due =
                        isIrrigationDue(
                          record
                        );

                      return (
                        <tr
                          key={record.id}
                        >
                          <td>
                            <div className="fw-semibold">
                              {getCropName(
                                record
                              )}
                            </div>

                            {getFarmName(
                              record
                            ) && (
                              <small className="text-muted">
                                {getFarmName(
                                  record
                                )}
                              </small>
                            )}
                          </td>

                          <td>
                            {getMethodName(
                              record
                            )}
                          </td>

                          <td>
                            {record.irrigation_date
                              ? String(
                                  record.irrigation_date
                                ).substring(
                                  0,
                                  10
                                )
                              : record.irrigationDate ||
                                "—"}
                          </td>

                          <td>
                            {record.quantity ??
                              "—"}{" "}
                            {record.quantity_unit ||
                              record.quantityUnit ||
                              ""}
                          </td>

                          <td>
                            ETB{" "}
                            {Number(
                              record.cost || 0
                            ).toFixed(2)}
                          </td>

                          <td>
                            {nextDate ||
                              "Not scheduled"}
                          </td>

                          <td>
                            {due ? (
                              <span className="badge bg-danger">
                                Irrigation Due
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

                          <td>
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  handleEdit(
                                    record
                                  )
                                }
                                title="Edit irrigation record"
                              >
                                <FaEdit />
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleDelete(
                                    record
                                  )
                                }
                                title="Delete irrigation record"
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

export default Irrigation;