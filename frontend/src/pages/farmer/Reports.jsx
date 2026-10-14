
import { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiBarChart2,
  FiCalendar,
  FiDollarSign,
  FiDownload,
  FiFilter,
  FiPackage,
  FiRefreshCw,
  FiTrendingUp,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  getCropProductionReport,
  getHarvestReport,
  getExpenseReport,
  getRevenueReport,
  getProfitReport,
  getIrrigationReport,
  getFertilizerReport,
  getActivityReport,
} from "../../services/reportService";

const REPORTS = [
  { value: "crop-production", label: "Crop Production" },
  { value: "harvests", label: "Harvest Report" },
  { value: "expenses", label: "Expense Report" },
  { value: "revenue", label: "Revenue Report" },
  { value: "profit", label: "Profit Report" },
  { value: "irrigation", label: "Irrigation History" },
  { value: "fertilizer", label: "Fertilizer History" },
  { value: "activities", label: "Farm Activities" },
];

const REPORT_FUNCTIONS = {
  "crop-production": getCropProductionReport,
  harvests: getHarvestReport,
  expenses: getExpenseReport,
  revenue: getRevenueReport,
  profit: getProfitReport,
  irrigation: getIrrigationReport,
  fertilizer: getFertilizerReport,
  activities: getActivityReport,
};

const SUMMARY_CONFIG = {
  "crop-production": {
    valueLabel: "Production value",
    quantityLabel: "Production quantity",
    quantityKeys: ["total_quantity", "quantity"],
    moneyKeys: ["total_revenue", "amount", "cost"],
  },
  harvests: {
    valueLabel: "Harvest revenue",
    quantityLabel: "Harvest quantity",
    quantityKeys: ["total_quantity", "quantity"],
    moneyKeys: ["total_revenue", "amount"],
  },
  expenses: {
    valueLabel: "Total expenses",
    quantityLabel: null,
    quantityKeys: [],
    moneyKeys: ["total_expenses", "amount"],
  },
  revenue: {
    valueLabel: "Total revenue",
    quantityLabel: null,
    quantityKeys: [],
    moneyKeys: ["total_revenue", "amount"],
  },
  profit: {
    valueLabel: "Total revenue",
    quantityLabel: null,
    quantityKeys: [],
    moneyKeys: ["total_revenue"],
  },
  irrigation: {
    valueLabel: "Irrigation cost",
    quantityLabel: null,
    quantityKeys: [],
    moneyKeys: ["cost", "amount", "total_cost"],
  },
  fertilizer: {
    valueLabel: "Fertilizer cost",
    quantityLabel: null,
    quantityKeys: [],
    moneyKeys: ["cost", "amount", "total_cost"],
  },
  activities: {
    valueLabel: "Activity labor cost",
    quantityLabel: null,
    quantityKeys: [],
    moneyKeys: ["labor_cost"],
  },
};

const DATE_KEYS = [
  "harvest_date",
  "expense_date",
  "revenue_date",
  "irrigation_date",
  "application_date",
  "activity_date",
  "record_date",
];

const PREFERRED_COLUMNS = [
  "harvest_date",
  "expense_date",
  "revenue_date",
  "application_date",
  "irrigation_date",
  "activity_date",
  "farm_name",
  "field_name",
  "crop_name",
  "crop_type_name",
  "category",
  "activity_type",
  "description",
  "quantity",
  "total_quantity",
  "quantity_unit",
  "price_per_unit",
  "amount",
  "total_revenue",
  "total_expenses",
  "profit",
  "quality",
  "irrigation_method_name",
  "fertilizer_type_name",
  "labor_cost",
  "cost",
  "notes",
];

const INITIAL_FILTERS = {
  farmId: "",
  fieldId: "",
  cropId: "",
  startDate: "",
  endDate: "",
};

const formatLabel = (key) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "—";

  const number = Number(value);

  if (!Number.isFinite(number)) return String(value);

  return number.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString();
};

const unwrapRows = (response) => {
  if (Array.isArray(response?.data)) return response.data;

  if (Array.isArray(response?.data?.data)) return response.data.data;

  if (Array.isArray(response)) return response;

  return [];
};

const getNumericKey = (rows, keys) =>
  keys.find((key) =>
    rows.some(
      (row) =>
        row[key] !== null &&
        row[key] !== undefined &&
        row[key] !== "" &&
        Number.isFinite(Number(row[key]))
    )
  );

const getDateKey = (rows) =>
  DATE_KEYS.find((key) =>
    rows.some((row) => row[key] !== null && row[key] !== undefined)
  );

const sumKey = (rows, key) =>
  rows.reduce((total, row) => total + (Number(row[key]) || 0), 0);

const Reports = () => {
  const [reportType, setReportType] = useState("crop-production");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [reportData, setReportData] = useState([]);
  const [profitSummary, setProfitSummary] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  const selectedReport = REPORTS.find(
    (report) => report.value === reportType
  );

  const currentSummary = SUMMARY_CONFIG[reportType];

  const loadReport = async (
    activeFilters = filters,
    activeType = reportType
  ) => {
    setLoading(true);
    setError("");

    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(activeFilters).filter(
          ([, value]) =>
            value !== "" && value !== null && value !== undefined
        )
      );

      const reportFunction = REPORT_FUNCTIONS[activeType];

      if (!reportFunction) {
        throw new Error("The selected report type is not supported.");
      }

      const response = await reportFunction(cleanFilters);

      if (response?.success === false) {
        throw new Error(response.message || "Unable to load this report.");
      }

      const result = response?.data;

      if (
        activeType === "profit" &&
        result &&
        !Array.isArray(result) &&
        typeof result === "object"
      ) {
        setProfitSummary(result);
        setReportData([result]);
      } else {
        setProfitSummary(null);
        setReportData(unwrapRows(response));
      }

      setAppliedFilters(cleanFilters);
      setHasLoaded(true);
    } catch (err) {
      setReportData([]);
      setProfitSummary(null);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load report. Please try again."
      );
      setHasLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(INITIAL_FILTERS, reportType);
    // Reload when the report type changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    ) {
      setError("Start date cannot be later than end date.");
      return;
    }

    loadReport(filters, reportType);
  };

  const handleReset = () => {
    const emptyFilters = { ...INITIAL_FILTERS };

    setFilters(emptyFilters);
    loadReport(emptyFilters, reportType);
  };

  const columns = useMemo(() => {
    if (!reportData.length) return [];

    const keys = [
      ...new Set(reportData.flatMap((row) => Object.keys(row))),
    ];

    return keys.sort((a, b) => {
      const aIndex = PREFERRED_COLUMNS.indexOf(a);
      const bIndex = PREFERRED_COLUMNS.indexOf(b);

      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });
  }, [reportData]);

  const moneyKey = getNumericKey(reportData, currentSummary.moneyKeys);
  const quantityKey = getNumericKey(
    reportData,
    currentSummary.quantityKeys
  );

  const totalMoney = profitSummary
    ? Number(profitSummary.totalRevenue || 0)
    : moneyKey
      ? sumKey(reportData, moneyKey)
      : null;

  const totalQuantity = quantityKey
    ? sumKey(reportData, quantityKey)
    : null;

  const chartData = useMemo(() => {
    if (!reportData.length || reportType === "profit") return [];

    const dateKey = getDateKey(reportData);

    const labelCandidates = [
      "crop_name",
      "farm_name",
      "field_name",
      "category",
      "activity_type",
      "fertilizer_type_name",
      "irrigation_method_name",
      "quality",
    ];

    const labelKey = labelCandidates.find((key) =>
      reportData.some(
        (row) => row[key] !== null && row[key] !== undefined
      )
    );

    const valueKey =
      getNumericKey(reportData, currentSummary.quantityKeys) ||
      getNumericKey(reportData, currentSummary.moneyKeys);

    if (!valueKey) return [];

    if (dateKey) {
      return reportData
        .filter((row) => row[dateKey])
        .map((row, index) => ({
          label: formatDate(row[dateKey]),
          value: Number(row[valueKey]) || 0,
          key: row.id ?? index,
        }))
        .slice(0, 30);
    }

    if (labelKey) {
      const grouped = new Map();

      reportData.forEach((row) => {
        const label = row[labelKey] || "Other";

        grouped.set(
          label,
          (grouped.get(label) || 0) + (Number(row[valueKey]) || 0)
        );
      });

      return [...grouped.entries()]
        .map(([label, value]) => ({ label, value }))
        .slice(0, 12);
    }

    return [];
  }, [reportData, reportType, currentSummary]);

  const exportCsv = () => {
    if (!reportData.length || !columns.length) return;

    const escapeCsv = (value) => {
      const text =
        value === null || value === undefined ? "" : String(value);

      return `"${text.replace(/"/g, '""')}"`;
    };

    const csv = [
      columns.map(formatLabel).map(escapeCsv).join(","),
      ...reportData.map((row) =>
        columns.map((column) => escapeCsv(row[column])).join(",")
      ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${reportType}-report.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Reports &amp; Analytics</h2>
          <p className="text-muted mb-0">
            Review your farm production, costs, revenue, and activities.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-success"
          onClick={() => loadReport(filters, reportType)}
          disabled={loading}
        >
          <FiRefreshCw className="me-2" />
          Refresh
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center gap-2 mb-3">
            <FiFilter className="text-success" />
            <h5 className="mb-0">Report filters</h5>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6 col-xl-4">
                <label className="form-label" htmlFor="reportType">
                  Report type
                </label>
                <select
                  id="reportType"
                  className="form-select"
                  value={reportType}
                  onChange={(event) => setReportType(event.target.value)}
                >
                  {REPORTS.map((report) => (
                    <option key={report.value} value={report.value}>
                      {report.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6 col-xl-2">
                <label className="form-label" htmlFor="farmId">
                  Farm ID
                </label>
                <input
                  id="farmId"
                  className="form-control"
                  type="number"
                  min="1"
                  name="farmId"
                  value={filters.farmId}
                  onChange={handleFilterChange}
                  placeholder="All farms"
                />
              </div>

              <div className="col-12 col-md-6 col-xl-2">
                <label className="form-label" htmlFor="fieldId">
                  Field ID
                </label>
                <input
                  id="fieldId"
                  className="form-control"
                  type="number"
                  min="1"
                  name="fieldId"
                  value={filters.fieldId}
                  onChange={handleFilterChange}
                  placeholder="All fields"
                />
              </div>

              <div className="col-12 col-md-6 col-xl-2">
                <label className="form-label" htmlFor="cropId">
                  Crop ID
                </label>
                <input
                  id="cropId"
                  className="form-control"
                  type="number"
                  min="1"
                  name="cropId"
                  value={filters.cropId}
                  onChange={handleFilterChange}
                  placeholder="All crops"
                />
              </div>

              <div className="col-12 col-md-6 col-xl-2">
                <label className="form-label" htmlFor="startDate">
                  Start date
                </label>
                <input
                  id="startDate"
                  className="form-control"
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="col-12 col-md-6 col-xl-2">
                <label className="form-label" htmlFor="endDate">
                  End date
                </label>
                <input
                  id="endDate"
                  className="form-control"
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="col-12 d-flex flex-wrap gap-2">
                <button
                  className="btn btn-success"
                  type="submit"
                  disabled={loading}
                >
                  <FiBarChart2 className="me-2" />
                  {loading ? "Generating..." : "Generate report"}
                </button>

                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Clear filters
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Report error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div
              className="spinner-border text-success mb-3"
              role="status"
              aria-label="Loading"
            />
            <p className="text-muted mb-0">
              Generating your report...
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-2">Report records</p>
                    <h3 className="fw-bold mb-0">
                      {formatNumber(reportData.length)}
                    </h3>
                  </div>
                  <span className="rounded bg-success-subtle text-success p-3">
                    <FiActivity size={22} />
                  </span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-2">
                      {currentSummary.valueLabel}
                    </p>
                    <h3 className="fw-bold mb-0">
                      {totalMoney === null
                        ? "—"
                        : formatNumber(totalMoney)}
                    </h3>
                  </div>
                  <span className="rounded bg-primary-subtle text-primary p-3">
                    <FiDollarSign size={22} />
                  </span>
                </div>
              </div>
            </div>

            {currentSummary.quantityLabel && (
              <div className="col-12 col-md-6 col-xl-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-2">
                        {currentSummary.quantityLabel}
                      </p>
                      <h3 className="fw-bold mb-0">
                        {totalQuantity === null
                          ? "—"
                          : formatNumber(totalQuantity)}
                      </h3>
                    </div>
                    <span className="rounded bg-warning-subtle text-warning p-3">
                      <FiPackage size={22} />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {profitSummary && (
              <div className="col-12 col-md-6 col-xl-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-2">Net profit</p>
                      <h3 className="fw-bold mb-0">
                        {formatNumber(profitSummary.profit)}
                      </h3>
                    </div>
                    <span className="rounded bg-info-subtle text-info p-3">
                      <FiTrendingUp size={22} />
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {profitSummary && (
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <p className="text-muted mb-1">Total revenue</p>
                    <h4 className="fw-bold text-success mb-0">
                      {formatNumber(profitSummary.totalRevenue)}
                    </h4>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <p className="text-muted mb-1">Total expenses</p>
                    <h4 className="fw-bold text-danger mb-0">
                      {formatNumber(profitSummary.totalExpenses)}
                    </h4>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <p className="text-muted mb-1">Net profit</p>
                    <h4 className="fw-bold mb-0">
                      {formatNumber(profitSummary.profit)}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          )}

          {chartData.length > 0 && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                  <div>
                    <h5 className="fw-bold mb-1">
                      {selectedReport?.label} overview
                    </h5>
                    <p className="text-muted small mb-0">
                      Based on records returned by your selected filters.
                    </p>
                  </div>
                  <FiBarChart2 className="text-success" size={22} />
                </div>

                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatNumber(value)}
                      />
                      <Bar
                        dataKey="value"
                        name="Value"
                        fill="#198754"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                <div>
                  <h5 className="fw-bold mb-1">
                    {selectedReport?.label} details
                  </h5>
                  <p className="text-muted small mb-0">
                    {reportData.length} record(s) returned
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={exportCsv}
                  disabled={!reportData.length}
                >
                  <FiDownload className="me-2" />
                  Export CSV
                </button>
              </div>

              {reportData.length === 0 ? (
                <div className="text-center py-5">
                  <FiCalendar
                    size={36}
                    className="text-muted mb-3"
                  />
                  <h6>No report records found</h6>
                  <p className="text-muted mb-0">
                    Try changing the filters or adding records to this
                    module.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        {columns.map((column) => (
                          <th key={column} className="text-nowrap">
                            {formatLabel(column)}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {reportData.map((row, rowIndex) => (
                        <tr key={row.id ?? row.crop_id ?? rowIndex}>
                          {columns.map((column) => {
                            const value = row[column];

                            return (
                              <td
                                key={column}
                                className="text-nowrap"
                              >
                                {value === null || value === undefined
                                  ? "—"
                                  : DATE_KEYS.includes(column)
                                    ? formatDate(value)
                                    : typeof value === "number"
                                      ? formatNumber(value)
                                      : String(value)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {hasLoaded && (
            <p className="text-muted small mt-3 mb-0">
              Filters applied:{" "}
              {Object.keys(appliedFilters).length
                ? Object.entries(appliedFilters)
                    .map(
                      ([key, value]) =>
                        `${formatLabel(key)}: ${value}`
                    )
                    .join(" · ")
                : "None"}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;

