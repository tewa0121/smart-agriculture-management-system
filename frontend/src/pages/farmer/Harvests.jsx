
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSeedling,
  FaWeight,
  FaMoneyBillWave,
  FaBoxOpen,
  FaSync,
} from "react-icons/fa";

import api from "../../services/api";
import {
  getHarvests,
  createHarvest,
  updateHarvest,
  deleteHarvest,
} from "../../services/harvestService";

const initialForm = {
  cropId: "",
  harvestDate: new Date().toISOString().slice(0, 10),
  quantity: "",
  quantityUnit: "kg",
  pricePerUnit: "0",
  quality: "",
  notes: "",
};

const unwrapData = (response) => {
  let result = response?.data ?? response;

  // Handle Axios responses and { success, data } envelopes.
  if (result && !Array.isArray(result) && result.data !== undefined) {
    result = result.data;
  }

  return result;
};

const formatNumber = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });

const formatMoney = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

export default function Harvests() {
  const [harvests, setHarvests] = useState([]);
  const [crops, setCrops] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [harvestResponse, cropResponse] = await Promise.all([
        getHarvests(),
        api.get("/crops"),
      ]);

      const harvestData = unwrapData(harvestResponse);
      const cropData = unwrapData(cropResponse);

      if (!Array.isArray(harvestData)) {
        throw new Error("The server returned an unexpected harvest data format.");
      }

      if (!Array.isArray(cropData)) {
        throw new Error("The server returned an unexpected crop data format.");
      }

      setHarvests(harvestData);
      setCrops(cropData);
    } catch (err) {
      console.error("Failed to load harvest data:", {
        status: err?.response?.status,
        url: err?.config?.url,
        response: err?.response?.data,
        error: err,
      });

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredHarvests = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return harvests;

    return harvests.filter((harvest) =>
      [
        harvest.crop_name,
        harvest.crop_type_name,
        harvest.farm_name,
        harvest.field_name,
        harvest.quality,
        harvest.quantity_unit,
        harvest.harvest_date,
        harvest.notes,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      )
    );
  }, [harvests, search]);

  const totalQuantity = useMemo(
    () =>
      filteredHarvests.reduce(
        (total, harvest) => total + Number(harvest.quantity || 0),
        0
      ),
    [filteredHarvests]
  );

  const totalRevenue = useMemo(
    () =>
      filteredHarvests.reduce(
        (total, harvest) =>
          total + Number(
            harvest.total_revenue ??
              Number(harvest.quantity || 0) *
                Number(harvest.price_per_unit || 0)
          ),
        0
      ),
    [filteredHarvests]
  );

  const resetForm = () => {
    setFormData({
      ...initialForm,
      harvestDate: new Date().toISOString().slice(0, 10),
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    setError("");
    setSuccess("");
    setEditingId(null);
    setFormData({
      ...initialForm,
      harvestDate: new Date().toISOString().slice(0, 10),
    });
    setShowForm(true);
  };

  const openEditForm = (harvest) => {
    setError("");
    setSuccess("");
    setEditingId(harvest.id);

    setFormData({
      cropId: String(harvest.crop_id ?? ""),
      harvestDate: String(harvest.harvest_date ?? "").slice(0, 10),
      quantity: String(harvest.quantity ?? ""),
      quantityUnit: harvest.quantity_unit || "kg",
      pricePerUnit: String(harvest.price_per_unit ?? 0),
      quality: harvest.quality || "",
      notes: harvest.notes || "",
    });

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const quantity = Number(formData.quantity);
    const pricePerUnit = Number(formData.pricePerUnit);

    if (!formData.cropId) {
      setError("Please select a crop.");
      return;
    }

    if (!formData.harvestDate) {
      setError("Please select a harvest date.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (!Number.isFinite(pricePerUnit) || pricePerUnit < 0) {
      setError("Price per unit must be zero or greater.");
      return;
    }

    const payload = {
      cropId: Number(formData.cropId),
      harvestDate: formData.harvestDate,
      quantity,
      quantityUnit: formData.quantityUnit,
      pricePerUnit,
      quality: formData.quality.trim() || null,
      notes: formData.notes.trim() || null,
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await updateHarvest(editingId, payload);
        setSuccess("Harvest record updated successfully.");
      } else {
        await createHarvest(payload);
        setSuccess("Harvest record created successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error("Failed to save harvest:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (harvest) => {
    const confirmed = window.confirm(
      `Delete the harvest record for "${harvest.crop_name || "this crop"}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(harvest.id);

    try {
      await deleteHarvest(harvest.id);
      setHarvests((previous) =>
        previous.filter((item) => item.id !== harvest.id)
      );
      setSuccess("Harvest record deleted successfully.");
    } catch (err) {
      console.error("Failed to delete harvest:", err);
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const estimatedRevenue =
    Number(formData.quantity || 0) *
    Number(formData.pricePerUnit || 0);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Harvest Management</h2>
          <p className="text-muted mb-0">
            Record harvested crops, quantities, quality, and revenue.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={loadData}
            disabled={loading}
          >
            <FaSync className={loading ? "me-2 fa-spin" : "me-2"} />
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-success"
            onClick={openCreateForm}
          >
            <FaPlus className="me-2" />
            Add Harvest
          </button>
        </div>
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setError("")}
          />
        </div>
      )}

      {success && (
        <div
          className="alert alert-success alert-dismissible"
          role="status"
        >
          <span>{success}</span>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setSuccess("")}
          />
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-circle bg-success-subtle text-success p-3">
                <FaBoxOpen size={22} />
              </div>
              <div>
                <div className="text-muted small">Harvest Records</div>
                <h4 className="fw-bold mb-0">
                  {formatNumber(filteredHarvests.length)}
                </h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-circle bg-primary-subtle text-primary p-3">
                <FaWeight size={22} />
              </div>
              <div>
                <div className="text-muted small">
                  Total Quantity (filtered)
                </div>
                <h4 className="fw-bold mb-0">
                  {formatNumber(totalQuantity)}
                </h4>
                <small className="text-muted">
                  Sum of recorded quantities; units may differ.
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-circle bg-warning-subtle text-warning p-3">
                <FaMoneyBillWave size={22} />
              </div>
              <div>
                <div className="text-muted small">
                  Total Revenue (filtered)
                </div>
                <h4 className="fw-bold mb-0">
                  {formatMoney(totalRevenue)}
                </h4>
                <small className="text-muted">
                  Currency follows your configured pricing.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">
              {editingId !== null ? "Edit Harvest" : "Record a Harvest"}
            </h5>

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={resetForm}
              disabled={saving}
              aria-label="Close form"
            >
              <FaTimes />
            </button>
          </div>

          <div className="card-body">
            {crops.length === 0 && (
              <div className="alert alert-warning">
                No crops are available. Create a crop first, then record its harvest.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label htmlFor="cropId" className="form-label">
                    Crop <span className="text-danger">*</span>
                  </label>

                  <select
                    id="cropId"
                    name="cropId"
                    className="form-select"
                    value={formData.cropId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a crop</option>
                    {crops.map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {crop.name || `Crop #${crop.id}`}
                        {crop.field_name ? ` — ${crop.field_name}` : ""}
                        {crop.farm_name ? ` (${crop.farm_name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="harvestDate" className="form-label">
                    Harvest Date <span className="text-danger">*</span>
                  </label>
                  <input
                    id="harvestDate"
                    type="date"
                    name="harvestDate"
                    className="form-control"
                    value={formData.harvestDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label htmlFor="quantity" className="form-label">
                    Quantity <span className="text-danger">*</span>
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    name="quantity"
                    className="form-control"
                    min="0.001"
                    step="any"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label htmlFor="quantityUnit" className="form-label">
                    Quantity Unit
                  </label>
                  <select
                    id="quantityUnit"
                    name="quantityUnit"
                    className="form-select"
                    value={formData.quantityUnit}
                    onChange={handleChange}
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="quintal">Quintals</option>
                    <option value="ton">Tons</option>
                    <option value="g">Grams (g)</option>
                    <option value="piece">Pieces</option>
                    <option value="liter">Liters</option>
                  </select>
                </div>

                <div className="col-12 col-md-4">
                  <label htmlFor="pricePerUnit" className="form-label">
                    Price Per Unit
                  </label>
                  <input
                    id="pricePerUnit"
                    type="number"
                    name="pricePerUnit"
                    className="form-control"
                    min="0"
                    step="any"
                    value={formData.pricePerUnit}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <div className="rounded bg-light p-3">
                    <span className="text-muted me-2">
                      Estimated Total Revenue:
                    </span>
                    <strong>{formatMoney(estimatedRevenue)}</strong>
                    <small className="text-muted ms-2">
                      (quantity × price per unit)
                    </small>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="quality" className="form-label">
                    Quality
                  </label>
                  <select
                    id="quality"
                    name="quality"
                    className="form-select"
                    value={formData.quality}
                    onChange={handleChange}
                  >
                    <option value="">Not specified</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="notes" className="form-label">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="form-control"
                    rows="2"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Optional harvest notes"
                  />
                </div>

                <div className="col-12 d-flex flex-wrap gap-2 justify-content-end">
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
                    disabled={saving || crops.length === 0}
                  >
                    {saving
                      ? "Saving..."
                      : editingId !== null
                        ? "Save Changes"
                        : "Save Harvest"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="row align-items-center g-3">
            <div className="col-12 col-md">
              <h5 className="fw-bold mb-0">Harvest Records</h5>
            </div>
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search crop, farm, field, quality..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search harvest records"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Crop</th>
                <th>Farm / Field</th>
                <th>Harvest Date</th>
                <th>Quantity</th>
                <th>Price / Unit</th>
                <th>Total Revenue</th>
                <th>Quality</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div
                      className="spinner-border text-success mb-2"
                      role="status"
                    />
                    <div>Loading harvest records...</div>
                  </td>
                </tr>
              ) : filteredHarvests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <FaSeedling size={30} className="text-muted mb-3" />
                    <h6 className="fw-bold">
                      {search ? "No matching harvests" : "No harvest records yet"}
                    </h6>
                    <p className="text-muted mb-3">
                      {search
                        ? "Try a different search term."
                        : "Record your first harvest to get started."}
                    </p>
                    {!search && (
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={openCreateForm}
                      >
                        <FaPlus className="me-2" />
                        Add Harvest
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredHarvests.map((harvest) => (
                  <tr key={harvest.id}>
                    <td>
                      <div className="fw-semibold">
                        {harvest.crop_name || `Crop #${harvest.crop_id}`}
                      </div>
                      {harvest.crop_type_name && (
                        <small className="text-muted">
                          {harvest.crop_type_name}
                        </small>
                      )}
                    </td>

                    <td>
                      <div>{harvest.farm_name || "—"}</div>
                      <small className="text-muted">
                        {harvest.field_name || "—"}
                      </small>
                    </td>

                    <td>
                      {harvest.harvest_date
                        ? String(harvest.harvest_date).slice(0, 10)
                        : "—"}
                    </td>

                    <td>
                      <span className="fw-semibold">
                        {formatNumber(harvest.quantity)}
                      </span>{" "}
                      <small className="text-muted">
                        {harvest.quantity_unit || ""}
                      </small>
                    </td>

                    <td>{formatMoney(harvest.price_per_unit)}</td>

                    <td className="fw-semibold text-success">
                      {formatMoney(
                        harvest.total_revenue ??
                          Number(harvest.quantity || 0) *
                            Number(harvest.price_per_unit || 0)
                      )}
                    </td>

                    <td>
                      {harvest.quality ? (
                        <span className="badge text-bg-light border">
                          {harvest.quality}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          title="Edit harvest"
                          aria-label={`Edit harvest ${harvest.id}`}
                          onClick={() => openEditForm(harvest)}
                          disabled={deletingId === harvest.id}
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          title="Delete harvest"
                          aria-label={`Delete harvest ${harvest.id}`}
                          onClick={() => handleDelete(harvest)}
                          disabled={deletingId === harvest.id}
                        >
                          {deletingId === harvest.id ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                            />
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {!loading && filteredHarvests.length > 0 && (
              <tfoot className="table-light">
                <tr>
                  <td colSpan="3" className="fw-bold">
                    Filtered totals
                  </td>
                  <td className="fw-bold">
                    {formatNumber(totalQuantity)}
                  </td>
                  <td>—</td>
                  <td className="fw-bold text-success">
                    {formatMoney(totalRevenue)}
                  </td>
                  <td colSpan="2"> </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="card-footer bg-white text-muted small">
          Showing {filteredHarvests.length} of {harvests.length} harvest records.
        </div>
      </div>
    </div>
  );
}