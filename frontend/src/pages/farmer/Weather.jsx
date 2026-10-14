
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiCloud,
  FiDroplet,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiThermometer,
  FiTrash2,
  FiWind,
  FiX,
} from "react-icons/fi";

import api from "../../services/api";
import {
  getWeatherRecords,
  createWeatherRecord,
  updateWeatherRecord,
  deleteWeatherRecord,
} from "../../services/weatherService";

const emptyForm = {
  farmId: "",
  recordDate: new Date().toLocaleDateString("en-CA"),
  temperature: "",
  humidity: "",
  rainfall: "",
  windSpeed: "",
  weatherCondition: "",
  notes: "",
};

const unwrapData = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const formatDate = (date) => {
  if (!date) return "—";

  const normalizedDate =
    typeof date === "string" ? date.slice(0, 10) : date;

  const parsed = new Date(`${normalizedDate}T12:00:00`);

  return Number.isNaN(parsed.getTime())
    ? normalizedDate
    : parsed.toLocaleDateString();
};

const Weather = () => {
  const [records, setRecords] = useState([]);
  const [farms, setFarms] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [weatherResponse, farmResponse] = await Promise.all([
        getWeatherRecords(),
        api.get("/farms"),
      ]);

      setRecords(unwrapData(weatherResponse));
      setFarms(unwrapData(farmResponse));

    } catch (err) {
      console.error("Load weather data error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load weather records or farms."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return records;

    return records.filter((record) =>
      [
        record.farm_name,
        record.weather_condition,
        record.record_date,
        record.notes,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [records, search]);

  const summary = useMemo(() => {
    const numericAverage = (key) => {
      const values = records
        .map((record) => Number(record[key]))
        .filter((value) => Number.isFinite(value));

      if (!values.length) return null;

      return values.reduce((total, value) => total + value, 0) /
        values.length;
    };

    return {
      total: records.length,
      temperature: numericAverage("temperature"),
      rainfall: records.reduce(
        (total, record) => total + (Number(record.rainfall) || 0),
        0
      ),
      humidity: numericAverage("humidity"),
    };
  }, [records]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      farmId: farms[0]?.id ? String(farms[0].id) : "",
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const openEditForm = (record) => {
    setEditingId(record.id);

    setForm({
      farmId: String(record.farm_id ?? ""),
      recordDate: record.record_date
        ? String(record.record_date).slice(0, 10)
        : "",
      temperature: record.temperature ?? "",
      humidity: record.humidity ?? "",
      rainfall: record.rainfall ?? "",
      windSpeed: record.wind_speed ?? "",
      weatherCondition: record.weather_condition ?? "",
      notes: record.notes ?? "",
    });

    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.farmId || !form.recordDate) {
      setError("Please select a farm and record date.");
      return;
    }

    const numericFields = [
      ["temperature", "Temperature"],
      ["humidity", "Humidity"],
      ["rainfall", "Rainfall"],
      ["windSpeed", "Wind speed"],
    ];

    for (const [key, label] of numericFields) {
      const value = form[key];

      if (
        value !== "" &&
        !Number.isFinite(Number(value))
      ) {
        setError(`${label} must be a valid number.`);
        return;
      }
    }

    if (
      form.humidity !== "" &&
      (Number(form.humidity) < 0 || Number(form.humidity) > 100)
    ) {
      setError("Humidity must be between 0 and 100.");
      return;
    }

    if (form.rainfall !== "" && Number(form.rainfall) < 0) {
      setError("Rainfall cannot be negative.");
      return;
    }

    if (form.windSpeed !== "" && Number(form.windSpeed) < 0) {
      setError("Wind speed cannot be negative.");
      return;
    }

    const payload = {
      farmId: Number(form.farmId),
      recordDate: form.recordDate,
      temperature:
        form.temperature === "" ? null : Number(form.temperature),
      humidity:
        form.humidity === "" ? null : Number(form.humidity),
      rainfall:
        form.rainfall === "" ? null : Number(form.rainfall),
      windSpeed:
        form.windSpeed === "" ? null : Number(form.windSpeed),
      weatherCondition: form.weatherCondition.trim() || null,
      notes: form.notes.trim() || null,
    };

    setSaving(true);

    try {
      if (editingId) {
        await updateWeatherRecord(editingId, payload);
        setSuccess("Weather record updated successfully.");
      } else {
        await createWeatherRecord(payload);
        setSuccess("Weather record created successfully.");
      }

      closeForm();
      await loadData();

    } catch (err) {
      console.error("Save weather record error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save the weather record."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    const confirmed = window.confirm(
      `Delete the weather record for ${record.farm_name || "this farm"} on ${formatDate(record.record_date)}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteWeatherRecord(record.id);
      setRecords((previous) =>
        previous.filter((item) => item.id !== record.id)
      );
      setSuccess("Weather record deleted successfully.");
    } catch (err) {
      console.error("Delete weather record error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete the weather record."
      );
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Weather Management</h2>
          <p className="text-muted mb-0">
            Record and monitor weather conditions on your farms.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={loadData}
            disabled={loading}
          >
            <FiRefreshCw className="me-2" />
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-success"
            onClick={openCreateForm}
            disabled={farms.length === 0}
          >
            <FiPlus className="me-2" />
            Add Weather
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setError("")}
          />
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible" role="alert">
          {success}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setSuccess("")}
          />
        </div>
      )}

      {!loading && farms.length === 0 && (
        <div className="alert alert-warning">
          You need to create a farm before recording weather.
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex justify-content-between">
              <div>
                <p className="text-muted mb-1">Weather Records</p>
                <h3 className="fw-bold mb-0">{summary.total}</h3>
              </div>
              <FiCloud size={30} className="text-success" />
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex justify-content-between">
              <div>
                <p className="text-muted mb-1">Average Temperature</p>
                <h3 className="fw-bold mb-0">
                  {summary.temperature === null
                    ? "—"
                    : `${summary.temperature.toFixed(1)}°C`}
                </h3>
              </div>
              <FiThermometer size={30} className="text-danger" />
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex justify-content-between">
              <div>
                <p className="text-muted mb-1">Recorded Rainfall</p>
                <h3 className="fw-bold mb-0">
                  {summary.rainfall.toFixed(1)} mm
                </h3>
              </div>
              <FiDroplet size={30} className="text-primary" />
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex justify-content-between">
              <div>
                <p className="text-muted mb-1">Average Humidity</p>
                <h3 className="fw-bold mb-0">
                  {summary.humidity === null
                    ? "—"
                    : `${summary.humidity.toFixed(1)}%`}
                </h3>
              </div>
              <FiWind size={30} className="text-info" />
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h5 className="fw-bold mb-0">
              {editingId ? "Edit Weather Record" : "Add Weather Record"}
            </h5>

            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={closeForm}
              aria-label="Close form"
            >
              <FiX />
            </button>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label" htmlFor="farmId">
                    Farm *
                  </label>
                  <select
                    id="farmId"
                    name="farmId"
                    className="form-select"
                    value={form.farmId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select farm</option>
                    {farms.map((farm) => (
                      <option key={farm.id} value={farm.id}>
                        {farm.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label" htmlFor="recordDate">
                    Record Date *
                  </label>
                  <input
                    id="recordDate"
                    name="recordDate"
                    type="date"
                    className="form-control"
                    value={form.recordDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label" htmlFor="weatherCondition">
                    Weather Condition
                  </label>
                  <select
                    id="weatherCondition"
                    name="weatherCondition"
                    className="form-select"
                    value={form.weatherCondition}
                    onChange={handleChange}
                  >
                    <option value="">Select condition</option>
                    <option value="Sunny">Sunny</option>
                    <option value="Cloudy">Cloudy</option>
                    <option value="Partly Cloudy">Partly Cloudy</option>
                    <option value="Rainy">Rainy</option>
                    <option value="Stormy">Stormy</option>
                    <option value="Windy">Windy</option>
                    <option value="Foggy">Foggy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label" htmlFor="temperature">
                    Temperature (°C)
                  </label>
                  <input
                    id="temperature"
                    name="temperature"
                    type="number"
                    step="any"
                    className="form-control"
                    value={form.temperature}
                    onChange={handleChange}
                    placeholder="e.g. 24"
                  />
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label" htmlFor="humidity">
                    Humidity (%)
                  </label>
                  <input
                    id="humidity"
                    name="humidity"
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    className="form-control"
                    value={form.humidity}
                    onChange={handleChange}
                    placeholder="0–100"
                  />
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label" htmlFor="rainfall">
                    Rainfall (mm)
                  </label>
                  <input
                    id="rainfall"
                    name="rainfall"
                    type="number"
                    min="0"
                    step="any"
                    className="form-control"
                    value={form.rainfall}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                  />
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label" htmlFor="windSpeed">
                    Wind Speed (km/h)
                  </label>
                  <input
                    id="windSpeed"
                    name="windSpeed"
                    type="number"
                    min="0"
                    step="any"
                    className="form-control"
                    value={form.windSpeed}
                    onChange={handleChange}
                    placeholder="e.g. 12"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="notes">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="form-control"
                    rows="3"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Add observations about the weather..."
                  />
                </div>

                <div className="col-12 d-flex gap-2">
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

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <h5 className="fw-bold mb-0">Weather Records</h5>

            <div className="input-group" style={{ maxWidth: "350px" }}>
              <span className="input-group-text bg-white">
                <FiSearch />
              </span>
              <input
                type="search"
                className="form-control"
                placeholder="Search farm or condition..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status" />
              <p className="text-muted mt-2 mb-0">
                Loading weather records...
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Farm</th>
                    <th>Date</th>
                    <th>Condition</th>
                    <th>Temperature</th>
                    <th>Humidity</th>
                    <th>Rainfall</th>
                    <th>Wind Speed</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-5">
                        <FiCloud size={32} className="text-muted mb-2" />
                        <p className="fw-semibold mb-1">
                          No weather records found
                        </p>
                        <p className="text-muted small mb-0">
                          Add a weather record or change your search.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="fw-semibold">
                          {record.farm_name || "—"}
                        </td>
                        <td>{formatDate(record.record_date)}</td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {record.weather_condition || "Not specified"}
                          </span>
                        </td>
                        <td>
                          {record.temperature == null
                            ? "—"
                            : `${record.temperature}°C`}
                        </td>
                        <td>
                          {record.humidity == null
                            ? "—"
                            : `${record.humidity}%`}
                        </td>
                        <td>
                          {record.rainfall == null
                            ? "—"
                            : `${record.rainfall} mm`}
                        </td>
                        <td>
                          {record.wind_speed == null
                            ? "—"
                            : `${record.wind_speed} km/h`}
                        </td>
                        <td>
                          <span title={record.notes || ""}>
                            {record.notes
                              ? `${record.notes.slice(0, 35)}${record.notes.length > 35 ? "..." : ""}`
                              : "—"}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              title="Edit weather record"
                              aria-label="Edit weather record"
                              onClick={() => openEditForm(record)}
                            >
                              <FiEdit2 />
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              title="Delete weather record"
                              aria-label="Delete weather record"
                              onClick={() => handleDelete(record)}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card-footer bg-white text-muted small">
          Showing {filteredRecords.length} of {records.length} records
        </div>
      </div>
    </div>
  );
};

export default Weather;