import { useEffect, useMemo, useState } from "react";
import {
  FaEdit,
  FaPlus,
  FaSprayCan,
  FaTrash,
  FaTimes,
  FaSearch,
} from "react-icons/fa";

import api from "../../services/api";

function Pesticides() {
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
    cropId: "",
    productName: "",
    applicationDate: "",
    quantity: "",
    quantityUnit: "L",
    cost: "",
    notes: "",
  });

  /*
   * Load pesticide records and crops.
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        recordsResponse,
        cropsResponse,
      ] = await Promise.all([
        api.get("/pesticide"),
        api.get("/crops"),
      ]);

      setRecords(
        recordsResponse.data?.data || []
      );

      setCrops(
        cropsResponse.data?.data || []
      );
    } catch (err) {
      console.error(
        "Load pesticide data error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load pesticide data."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Initial data load.
   */
  useEffect(() => {
    let cancelled = false;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          recordsResponse,
          cropsResponse,
        ] = await Promise.all([
          api.get("/pesticide"),
          api.get("/crops"),
        ]);

        if (cancelled) {
          return;
        }

        setRecords(
          recordsResponse.data?.data || []
        );

        setCrops(
          cropsResponse.data?.data || []
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load pesticide data error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load pesticide data."
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

  /*
   * Reset form.
   */
  const resetForm = () => {
    setFormData({
      cropId: "",
      productName: "",
      applicationDate: "",
      quantity: "",
      quantityUnit: "L",
      cost: "",
      notes: "",
    });

    setEditingId(null);
  };

  /*
   * Open add form.
   */
  const handleShowForm = () => {
    setError("");
    setSuccess("");

    resetForm();

    setShowForm(true);
  };

  /*
   * Close form.
   */
  const handleCloseForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);

    resetForm();
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
   * Edit pesticide record.
   */
  const handleEdit = (record) => {
    setError("");
    setSuccess("");

    setEditingId(record.id);

    setFormData({
      cropId:
        record.crop_id?.toString() || "",

      productName:
        record.product_name || "",

      applicationDate:
        record.application_date
          ? String(
              record.application_date
            ).slice(0, 10)
          : "",

      quantity:
        record.quantity !== null &&
        record.quantity !== undefined
          ? record.quantity.toString()
          : "",

      quantityUnit:
        record.quantity_unit || "L",

      cost:
        record.cost !== null &&
        record.cost !== undefined
          ? record.cost.toString()
          : "",

      notes:
        record.notes || "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * Validate form.
   */
  const validateForm = () => {
    if (!formData.cropId) {
      return "Please select a crop.";
    }

    if (!formData.productName.trim()) {
      return "Product name is required.";
    }

    if (!formData.applicationDate) {
      return "Application date is required.";
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

    return "";
  };

  /*
   * Create or update pesticide record.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        cropId: Number(formData.cropId),

        productName:
          formData.productName.trim(),

        applicationDate:
          formData.applicationDate,

        quantity:
          formData.quantity === ""
            ? null
            : Number(formData.quantity),

        quantityUnit:
          formData.quantityUnit.trim() ||
          "L",

        cost:
          formData.cost === ""
            ? 0
            : Number(formData.cost),

        notes:
          formData.notes.trim() || null,
      };

      if (editingId) {
        await api.put(
          `/pesticide/${editingId}`,
          payload
        );

        setSuccess(
          "Pesticide record updated successfully."
        );
      } else {
        await api.post(
          "/pesticide",
          payload
        );

        setSuccess(
          "Pesticide record created successfully."
        );
      }

      setShowForm(false);

      resetForm();

      await loadData();
    } catch (err) {
      console.error(
        "Save pesticide record error:",
        err
      );

      const validationErrors =
        err.response?.data?.errors;

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
          err.response?.data?.message ||
            "Failed to save pesticide record."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /*
   * Delete pesticide record.
   */
  const handleDelete = async (record) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the pesticide record for "${record.product_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/pesticide/${record.id}`
      );

      setSuccess(
        "Pesticide record deleted successfully."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Delete pesticide record error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete pesticide record."
      );
    }
  };

  /*
   * Search pesticide records.
   *
   * Searches:
   * - product name
   * - crop
   * - farm
   * - field
   * - application date
   * - quantity
   * - quantity unit
   * - cost
   * - notes
   */
  const filteredRecords = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    if (!search) {
      return records;
    }

    return records.filter((record) => {
      const productName =
        record.product_name || "";

      const cropName =
        record.crop_name || "";

      const farmName =
        record.farm_name || "";

      const fieldName =
        record.field_name || "";

      const applicationDate =
        record.application_date || "";

      const quantity =
        record.quantity ?? "";

      const quantityUnit =
        record.quantity_unit || "";

      const cost =
        record.cost ?? "";

      const notes =
        record.notes || "";

      const searchableText = [
        productName,
        cropName,
        farmName,
        fieldName,
        applicationDate,
        quantity,
        quantityUnit,
        cost,
        notes,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        search
      );
    });
  }, [records, searchTerm]);

  /*
   * Clear search.
   */
  const clearSearch = () => {
    setSearchTerm("");
  };

  /*
   * Total pesticide cost.
   */
  const totalCost = useMemo(() => {
    return records.reduce(
      (total, record) =>
        total +
        (Number(record.cost) || 0),
      0
    );
  }, [records]);

  /*
   * Total pesticide quantity.
   */
  const totalQuantity = useMemo(() => {
    return records.reduce(
      (total, record) =>
        total +
        (Number(record.quantity) || 0),
      0
    );
  }, [records]);

  /*
   * Format date.
   */
  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "-";
    }

    return value.toLocaleDateString();
  };

  /*
   * Format currency.
   */
  const formatCurrency = (amount) => {
    return Number(
      amount || 0
    ).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Pesticide Management
          </h2>

          <p className="text-muted mb-0">
            Record and manage pesticide applications
            across your crops.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-success d-flex align-items-center justify-content-center"
          onClick={handleShowForm}
          disabled={loading}
        >
          <FaPlus className="me-2" />
          Add Pesticide
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div
          className="alert alert-success alert-dismissible"
          role="alert"
        >
          {success}

          <button
            type="button"
            className="btn-close"
            onClick={() =>
              setSuccess("")
            }
            aria-label="Close"
          />
        </div>
      )}

      {error && (
        <div
          className="alert alert-danger alert-dismissible"
          role="alert"
        >
          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() =>
              setError("")
            }
            aria-label="Close"
          />
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-4">
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

                <div className="text-success fs-2">
                  <FaSprayCan />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    Total Quantity
                  </p>

                  <h3 className="fw-bold mb-0">
                    {totalQuantity.toFixed(2)}
                  </h3>
                </div>

                <div className="text-primary fs-2">
                  <FaSprayCan />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    Total Cost
                  </p>

                  <h3 className="fw-bold mb-0">
                    {formatCurrency(
                      totalCost
                    )}
                  </h3>
                </div>

                <div className="text-warning fs-2">
                  <span>ETB</span>
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
              <h5 className="fw-bold mb-0">
                {editingId
                  ? "Edit Pesticide Record"
                  : "Add Pesticide Record"}
              </h5>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={
                  handleCloseForm
                }
                disabled={saving}
                aria-label="Close form"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Crop */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="cropId"
                    className="form-label fw-semibold"
                  >
                    Crop
                  </label>

                  <select
                    id="cropId"
                    name="cropId"
                    className="form-select"
                    value={
                      formData.cropId
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >
                    <option value="">
                      Select crop
                    </option>

                    {crops.map(
                      (crop) => (
                        <option
                          key={crop.id}
                          value={crop.id}
                        >
                          {crop.name}

                          {crop.field_name
                            ? ` — ${crop.field_name}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Product */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="productName"
                    className="form-label fw-semibold"
                  >
                    Product Name
                  </label>

                  <input
                    id="productName"
                    name="productName"
                    type="text"
                    className="form-control"
                    value={
                      formData.productName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Insecticide"
                    maxLength={150}
                    required
                  />
                </div>

                {/* Application Date */}
                <div className="col-12 col-md-4">
                  <label
                    htmlFor="applicationDate"
                    className="form-label fw-semibold"
                  >
                    Application Date
                  </label>

                  <input
                    id="applicationDate"
                    name="applicationDate"
                    type="date"
                    className="form-control"
                    value={
                      formData.applicationDate
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="col-12 col-md-4">
                  <label
                    htmlFor="quantity"
                    className="form-label fw-semibold"
                  >
                    Quantity
                  </label>

                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    className="form-control"
                    value={
                      formData.quantity
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                {/* Unit */}
                <div className="col-12 col-md-4">
                  <label
                    htmlFor="quantityUnit"
                    className="form-label fw-semibold"
                  >
                    Quantity Unit
                  </label>

                  <select
                    id="quantityUnit"
                    name="quantityUnit"
                    className="form-select"
                    value={
                      formData.quantityUnit
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="L">
                      Liters (L)
                    </option>

                    <option value="ml">
                      Milliliters (ml)
                    </option>

                    <option value="kg">
                      Kilograms (kg)
                    </option>

                    <option value="g">
                      Grams (g)
                    </option>

                    <option value="units">
                      Units
                    </option>
                  </select>
                </div>

                {/* Cost */}
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="cost"
                    className="form-label fw-semibold"
                  >
                    Cost
                  </label>

                  <div className="input-group">
                    <span className="input-group-text">
                      ETB
                    </span>

                    <input
                      id="cost"
                      name="cost"
                      type="number"
                      className="form-control"
                      value={
                        formData.cost
                      }
                      onChange={
                        handleChange
                      }
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="col-12">
                  <label
                    htmlFor="notes"
                    className="form-label fw-semibold"
                  >
                    Notes
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    className="form-control"
                    rows="3"
                    value={
                      formData.notes
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Optional notes about the pesticide application..."
                    maxLength={1000}
                  />
                </div>

                {/* Buttons */}
                <div className="col-12">
                  <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={
                        handleCloseForm
                      }
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Records */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div>
              <h5 className="fw-bold mb-1">
                Pesticide Records
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
          </div>
        </div>

        <div className="card-body">
          {/* Search */}
          {records.length > 0 && (
            <div className="mb-4">
              <label
                htmlFor="pesticide-search"
                className="form-label fw-semibold"
              >
                Search Pesticide Records
              </label>

              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch className="text-success" />
                </span>

                <input
                  type="search"
                  id="pesticide-search"
                  className="form-control"
                  placeholder="Search by product, crop, farm, field, date, quantity, cost, or notes..."
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
                    onClick={
                      clearSearch
                    }
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
                Loading pesticide records...
              </p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-5 px-3">
              <FaSprayCan className="fs-1 text-muted mb-3" />

              <h5>
                No pesticide records yet
              </h5>

              <p className="text-muted mb-3">
                Start by adding your first
                pesticide application.
              </p>

              <button
                type="button"
                className="btn btn-success"
                onClick={
                  handleShowForm
                }
              >
                <FaPlus className="me-2" />
                Add Pesticide
              </button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-5 px-3">
              <FaSearch
                className="fs-1 text-muted mb-3"
              />

              <h5>
                No matching pesticide records
              </h5>

              <p className="text-muted mb-3">
                No pesticide records match your
                current search.
              </p>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={
                  clearSearch
                }
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Crop</th>
                    <th>Farm / Field</th>
                    <th>Application Date</th>
                    <th>Quantity</th>
                    <th>Cost</th>
                    <th className="text-end">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map(
                    (record) => (
                      <tr key={record.id}>
                        <td>
                          <div className="fw-semibold">
                            {
                              record.product_name
                            }
                          </div>

                          {record.notes && (
                            <small className="text-muted">
                              {record.notes}
                            </small>
                          )}
                        </td>

                        <td>
                          {record.crop_name ||
                            "-"}
                        </td>

                        <td>
                          <div>
                            {record.farm_name ||
                              "-"}
                          </div>

                          <small className="text-muted">
                            {record.field_name ||
                              "-"}
                          </small>
                        </td>

                        <td>
                          {formatDate(
                            record.application_date
                          )}
                        </td>

                        <td>
                          {record.quantity !==
                            null &&
                          record.quantity !==
                            undefined
                            ? `${Number(
                                record.quantity
                              ).toFixed(2)} ${
                                record.quantity_unit ||
                                ""
                              }`
                            : "-"}
                        </td>

                        <td>
                          ETB{" "}
                          {formatCurrency(
                            record.cost
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
                              title="Edit pesticide record"
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
                              title="Delete pesticide record"
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
        </div>
      </div>
    </div>
  );
}

export default Pesticides;