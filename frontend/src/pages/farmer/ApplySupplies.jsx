import { useState } from "react";
import api from "../../services/api";

function ApplySupplies() {
  const [form, setForm] = useState({
    supply_type: "fertilizer",
    product_name: "",
    quantity: "",
    unit: "kg",
    crop_name: "",
    farm_location: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/applications", {
        ...form,
        quantity: Number(form.quantity),
      });

      setSuccess(
        response.data?.message ||
          "Application submitted successfully."
      );

      setForm({
        supply_type: "fertilizer",
        product_name: "",
        quantity: "",
        unit: "kg",
        crop_name: "",
        farm_location: "",
        reason: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit application. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <h2 className="fw-bold text-success">
            Apply for Agricultural Supplies
          </h2>

          <p className="text-muted">
            Submit a request for fertilizer, pesticides, seeds,
            equipment, or other agricultural supplies.
          </p>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                Supply category
              </label>

              <select
                name="supply_type"
                className="form-select"
                value={form.supply_type}
                onChange={handleChange}
                required
              >
                <option value="fertilizer">Fertilizer</option>
                <option value="pesticide">Pesticide</option>
                <option value="seeds">Seeds</option>
                <option value="equipment">Equipment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">
                Product name
              </label>

              <input
                type="text"
                name="product_name"
                className="form-control"
                placeholder="e.g. Urea, NPS, or product name"
                value={form.product_name}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </div>

            <div className="row">
              <div className="col-md-7 mb-3">
                <label className="form-label">
                  Quantity
                </label>

                <input
                  type="number"
                  name="quantity"
                  className="form-control"
                  min="0.01"
                  step="0.01"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-5 mb-3">
                <label className="form-label">
                  Unit
                </label>

                <select
                  name="unit"
                  className="form-select"
                  value={form.unit}
                  onChange={handleChange}
                  required
                >
                  <option value="kg">Kilograms</option>
                  <option value="liters">Liters</option>
                  <option value="pieces">Pieces</option>
                  <option value="bags">Bags</option>
                  <option value="units">Units</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">
                Crop name
              </label>

              <input
                type="text"
                name="crop_name"
                className="form-control"
                placeholder="e.g. Maize, Wheat, Tomato"
                value={form.crop_name}
                onChange={handleChange}
                maxLength={150}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Farm location
              </label>

              <input
                type="text"
                name="farm_location"
                className="form-control"
                placeholder="Enter your farm location"
                value={form.farm_location}
                onChange={handleChange}
                maxLength={255}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Reason for application
              </label>

              <textarea
                name="reason"
                className="form-control"
                rows="4"
                placeholder="Explain why you need these supplies."
                value={form.reason}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={loading}
            >
              {loading
                ? "Submitting..."
                : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ApplySupplies;