
import { useEffect, useMemo, useState } from "react";
import {
  FaMoneyBillWave,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

import api from "../../services/api";

import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../../services/expenseService";

const initialFormData = {
  farm_id: "",
  field_id: "",
  crop_id: "",
  category: "other",
  amount: "",
  expense_date: "",
  description: "",
};

const categoryOptions = [
  { value: "fertilizer", label: "Fertilizer" },
  { value: "irrigation", label: "Irrigation" },
  { value: "labor", label: "Labor" },
  { value: "pesticide", label: "Pesticide" },
  { value: "seeds", label: "Seeds" },
  { value: "equipment", label: "Equipment" },
  { value: "transport", label: "Transport" },
  { value: "other", label: "Other" },
];

const unwrapData = (response) => {
  let data = response?.data ?? response;

  if (data && !Array.isArray(data) && data.data !== undefined) {
    data = data.data;
  }

  return data;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (date) => {
  if (!date) return "-";

  const value = String(date).slice(0, 10);
  const parts = value.split("-");

  return parts.length === 3
    ? `${parts[2]}/${parts[1]}/${parts[0]}`
    : value;
};

const getFarmId = (expense) =>
  expense?.farm_id ?? expense?.farmId ?? expense?.farm?.id ?? "";

const getFieldId = (expense) =>
  expense?.field_id ?? expense?.fieldId ?? expense?.field?.id ?? "";

const getCropId = (expense) =>
  expense?.crop_id ?? expense?.cropId ?? expense?.crop?.id ?? "";

const getFarmName = (expense, farms) => {
  const directName =
    expense?.farm_name ??
    expense?.farmName ??
    expense?.farm?.name;

  if (directName) return directName;

  return (
    farms.find(
      (farm) => Number(farm.id) === Number(getFarmId(expense))
    )?.name || "-"
  );
};

const getFieldName = (expense, fields) => {
  const directName =
    expense?.field_name ??
    expense?.fieldName ??
    expense?.field?.name;

  if (directName) return directName;

  return (
    fields.find(
      (field) => Number(field.id) === Number(getFieldId(expense))
    )?.name || "-"
  );
};

const getCropName = (expense, crops) => {
  const directName =
    expense?.crop_name ??
    expense?.cropName ??
    expense?.crop?.name;

  if (directName) return directName;

  return (
    crops.find(
      (crop) => Number(crop.id) === Number(getCropId(expense))
    )?.name || "-"
  );
};

const getCategoryLabel = (category) =>
  categoryOptions.find((item) => item.value === category)?.label ||
  category ||
  "Other";

const extractErrorMessage = (error, fallback) => {
  const responseData = error?.response?.data;

  if (responseData?.errors?.length) {
    return responseData.errors
      .map((item) => item.msg || item.message)
      .filter(Boolean)
      .join(", ");
  }

  return (
    responseData?.message ||
    responseData?.error ||
    error?.message ||
    fallback
  );
};

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [farms, setFarms] = useState([]);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(initialFormData);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      // These endpoints already exist in your backend.
      const [expensesResponse, farmsResponse, cropsResponse] =
        await Promise.all([
          getExpenses(),
          api.get("/farms"),
          api.get("/crops"),
        ]);

      const expensesData = unwrapData(expensesResponse);
      const farmsData = unwrapData(farmsResponse);
      const cropsData = unwrapData(cropsResponse);

      if (
        !Array.isArray(expensesData) ||
        !Array.isArray(farmsData) ||
        !Array.isArray(cropsData)
      ) {
        throw new Error(
          "The server returned an unexpected data format."
        );
      }

      // Load fields using the existing farm-specific route.
      const fieldResponses = await Promise.all(
        farmsData.map((farm) =>
          api.get(`/fields/farm/${farm.id}`)
        )
      );

      const fieldsData = fieldResponses.flatMap((response) => {
        const data = unwrapData(response);
        return Array.isArray(data) ? data : [];
      });

      setExpenses(expensesData);
      setFarms(farmsData);
      setCrops(cropsData);
      setFields(fieldsData);
    } catch (err) {
      console.error("Failed to load expense data:", {
        status: err?.response?.status,
        url: err?.config?.url,
        response: err?.response?.data,
        error: err,
      });

      setError(
        extractErrorMessage(err, "Failed to load expense records.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  const openCreateForm = () => {
    setError("");
    setSuccess("");
    resetForm();
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
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

  const handleFarmChange = (event) => {
    const farmId = event.target.value;

    setFormData((previous) => ({
      ...previous,
      farm_id: farmId,
      field_id: "",
      crop_id: "",
    }));
  };

  const handleFieldChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      field_id: event.target.value,
      crop_id: "",
    }));
  };

  const handleEdit = (expense) => {
    setError("");
    setSuccess("");
    setEditingId(expense.id);

    setFormData({
      farm_id: String(getFarmId(expense)),
      field_id: String(getFieldId(expense) || ""),
      crop_id: String(getCropId(expense) || ""),
      category:
        expense.category || expense.expense_category || "other",
      amount: expense.amount ?? "",
      expense_date: String(
        expense.expense_date ?? expense.expenseDate ?? ""
      ).slice(0, 10),
      description: expense.description || "",
    });

    setShowForm(true);
  };

  const validateForm = () => {
    if (!formData.farm_id) return "Please select a farm.";

    if (!formData.category) {
      return "Please select an expense category.";
    }

    if (
      formData.amount === "" ||
      !Number.isFinite(Number(formData.amount)) ||
      Number(formData.amount) < 0
    ) {
      return "Please enter a valid non-negative amount.";
    }

    if (!formData.expense_date) {
      return "Please select an expense date.";
    }

    return "";
  };

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

      const payload = {
        farmId: Number(formData.farm_id),
        fieldId: formData.field_id
          ? Number(formData.field_id)
          : null,
        cropId: formData.crop_id
          ? Number(formData.crop_id)
          : null,
        category: formData.category,
        amount: Number(formData.amount),
        expenseDate: formData.expense_date,
        description: formData.description.trim() || null,
      };

      if (editingId) {
        await updateExpense(editingId, payload);
        setSuccess("Expense updated successfully.");
      } else {
        await createExpense(payload);
        setSuccess("Expense created successfully.");
      }

      setShowForm(false);
      resetForm();

      await loadData();
    } catch (err) {
      console.error(
        "Failed to save expense:",
        err?.response?.data || err
      );

      setError(
        extractErrorMessage(err, "Failed to save expense.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expense) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this expense of ${formatCurrency(
        expense.amount
      )}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteExpense(expense.id);
      setSuccess("Expense deleted successfully.");

      await loadData();
    } catch (err) {
      console.error(
        "Failed to delete expense:",
        err?.response?.data || err
      );

      setError(
        extractErrorMessage(err, "Failed to delete expense.")
      );
    }
  };

  const filteredFields = useMemo(() => {
    if (!formData.farm_id) return [];

    return fields.filter(
      (field) =>
        Number(field.farm_id ?? field.farmId) ===
        Number(formData.farm_id)
    );
  }, [fields, formData.farm_id]);

  const filteredCrops = useMemo(() => {
    let result = crops;

    if (formData.farm_id) {
      const farmFieldIds = fields
        .filter(
          (field) =>
            Number(field.farm_id ?? field.farmId) ===
            Number(formData.farm_id)
        )
        .map((field) => Number(field.id));

      result = result.filter((crop) =>
        farmFieldIds.includes(
          Number(crop.field_id ?? crop.fieldId)
        )
      );
    }

    if (formData.field_id) {
      result = result.filter(
        (crop) =>
          Number(crop.field_id ?? crop.fieldId) ===
          Number(formData.field_id)
      );
    }

    return result;
  }, [crops, fields, formData.farm_id, formData.field_id]);

  const filteredExpenses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return expenses;

    return expenses.filter((expense) => {
      const values = [
        getFarmName(expense, farms),
        getFieldName(expense, fields),
        getCropName(expense, crops),
        getCategoryLabel(
          expense.category || expense.expense_category
        ),
        expense.amount,
        expense.expense_date ?? expense.expenseDate,
        expense.description,
      ];

      return values.some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );
    });
  }, [expenses, farms, fields, crops, searchTerm]);

  const totalExpenses = useMemo(
    () =>
      expenses.reduce(
        (total, expense) => total + (Number(expense.amount) || 0),
        0
      ),
    [expenses]
  );

  const filteredTotal = useMemo(
    () =>
      filteredExpenses.reduce(
        (total, expense) => total + (Number(expense.amount) || 0),
        0
      ),
    [filteredExpenses]
  );

  const categoryTotals = useMemo(() => {
    const totals = {};

    categoryOptions.forEach((category) => {
      totals[category.value] = 0;
    });

    expenses.forEach((expense) => {
      const category =
        expense.category || expense.expense_category || "other";

      totals[category] =
        (totals[category] || 0) + (Number(expense.amount) || 0);
    });

    return totals;
  }, [expenses]);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FaMoneyBillWave className="text-success me-2" />
            Expenses
          </h2>
          <p className="text-muted mb-0">
            Track and manage your farm expenses.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-success"
          onClick={openCreateForm}
        >
          <FaPlus className="me-2" />
          Add Expense
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
            aria-label="Close error"
          />
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
            aria-label="Close success"
          />
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Total Expenses</p>
              <h4 className="fw-bold mb-0">
                {formatCurrency(totalExpenses)}
              </h4>
            </div>
          </div>
        </div>

        {[
          ["Fertilizer", "fertilizer"],
          ["Irrigation", "irrigation"],
          ["Labor", "labor"],
        ].map(([label, category]) => (
          <div className="col-12 col-sm-6 col-xl-3" key={category}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <p className="text-muted mb-1">{label}</p>
                <h4 className="fw-bold mb-0">
                  {formatCurrency(categoryTotals[category])}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">
                {editingId ? "Edit Expense" : "Add Expense"}
              </h5>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={closeForm}
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
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Farm *</label>
                  <select
                    name="farm_id"
                    className="form-select"
                    value={formData.farm_id}
                    onChange={handleFarmChange}
                    disabled={saving}
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

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Field</label>
                  <select
                    name="field_id"
                    className="form-select"
                    value={formData.field_id}
                    onChange={handleFieldChange}
                    disabled={saving || !formData.farm_id}
                  >
                    <option value="">Select field (optional)</option>
                    {filteredFields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Crop</label>
                  <select
                    name="crop_id"
                    className="form-select"
                    value={formData.crop_id}
                    onChange={handleChange}
                    disabled={saving || !formData.farm_id}
                  >
                    <option value="">Select crop (optional)</option>
                    {filteredCrops.map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {crop.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Category *
                  </label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={saving}
                    required
                  >
                    {categoryOptions.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Amount *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    className="form-control"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter expense amount"
                    disabled={saving}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    name="expense_date"
                    className="form-control"
                    value={formData.expense_date}
                    onChange={handleChange}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Description
                  </label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    maxLength="1000"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Add notes about this expense..."
                    disabled={saving}
                  />
                </div>

                <div className="col-12 d-flex gap-2 justify-content-end">
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
                      : editingId
                      ? "Update Expense"
                      : "Save Expense"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
            <div>
              <h5 className="fw-bold mb-1">Expense Records</h5>
              <small className="text-muted">
                Showing {filteredExpenses.length} of {expenses.length} records
                {searchTerm &&
                  ` • Filtered total: ${formatCurrency(filteredTotal)}`}
              </small>
            </div>

            <div className="position-relative" style={{ minWidth: "280px" }}>
              <FaSearch
                className="position-absolute text-muted"
                style={{
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                className="form-control ps-5 pe-5"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn btn-sm position-absolute"
                  style={{
                    right: "4px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-3 mb-0">
                Loading expense records...
              </p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-5 px-3">
              <FaMoneyBillWave className="text-muted fs-1 mb-3" />
              <h5 className="fw-bold">
                {searchTerm ? "No matching expenses" : "No expense records"}
              </h5>
              <p className="text-muted mb-3">
                {searchTerm
                  ? "Try a different search term."
                  : "Start tracking your farm expenses by adding your first expense."}
              </p>
              {!searchTerm && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={openCreateForm}
                >
                  <FaPlus className="me-2" />
                  Add Expense
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Farm</th>
                    <th>Field</th>
                    <th>Crop</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="fw-semibold">
                        {getFarmName(expense, farms)}
                      </td>
                      <td>{getFieldName(expense, fields)}</td>
                      <td>{getCropName(expense, crops)}</td>
                      <td>
                        <span className="badge bg-success bg-opacity-10 text-success">
                          {getCategoryLabel(
                            expense.category || expense.expense_category
                          )}
                        </span>
                      </td>
                      <td className="fw-bold">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td>
                        {formatDate(
                          expense.expense_date ?? expense.expenseDate
                        )}
                      </td>
                      <td>
                        <span
                          className="text-muted d-inline-block text-truncate"
                          style={{ maxWidth: "220px" }}
                          title={expense.description || ""}
                        >
                          {expense.description || "-"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(expense)}
                            title="Edit expense"
                            aria-label="Edit expense"
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(expense)}
                            title="Delete expense"
                            aria-label="Delete expense"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Expenses;