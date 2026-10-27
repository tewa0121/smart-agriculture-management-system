import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaUserTie,
  FaTractor,
  FaSeedling,
  FaClipboardList,
  FaChartLine,
  FaLeaf,
  FaTasks,
  FaCalendarAlt,
  FaFilter,
  FaTimes,
  FaBalanceScale,
  FaRedoAlt,
  FaExclamationTriangle,
  FaMoneyBillWave,
} from "react-icons/fa";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import api from "../../services/api";

const COLORS = [
  "#198754",
  "#0d6efd",
  "#ffc107",
  "#dc3545",
  "#6f42c1",
  "#20c997",
];

const EMPTY_STATS = {
  totalUsers: 0,
  totalFarmers: 0,
  totalFarms: 0,
  totalCrops: 0,
  totalApplications: 0,
  totalFields: 0,
  totalHarvests: 0,
  totalExpenses: 0,
  totalActivities: 0,
  totalLaborCosts: 0,
  cropHarvestOverview: [],
  userDistribution: [],
  monthlyExpenses: [],
  monthlyHarvestRevenue: [],
  monthlyHarvestQuantity: [],
  quantityUnits: [],
  recentHarvests: [],
  recentActivities: [],
  activityTypeOverview: [],
  activityLaborOverview: [],
  filteredActivitySummary: {
    totalActivities: 0,
    totalLaborCosts: 0,
  },
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const formatMoney = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatNumber = (value) => Number(value || 0).toLocaleString();

const formatDate = (value) => {
  if (!value) return "—";

  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

const safeText = (value, fallback = "—") =>
  value === null || value === undefined || value === "" ? fallback : String(value);

const normalizeStats = (data = {}) => ({
  ...EMPTY_STATS,
  ...data,
  cropHarvestOverview: asArray(data.cropHarvestOverview),
  userDistribution: asArray(data.userDistribution),
  monthlyExpenses: asArray(data.monthlyExpenses),
  monthlyHarvestRevenue: asArray(data.monthlyHarvestRevenue),
  monthlyHarvestQuantity: asArray(data.monthlyHarvestQuantity),
  quantityUnits: asArray(data.quantityUnits),
  recentHarvests: asArray(data.recentHarvests),
  recentActivities: asArray(data.recentActivities),
  activityTypeOverview: asArray(data.activityTypeOverview),
  activityLaborOverview: asArray(data.activityLaborOverview),
  filteredActivitySummary: {
    ...EMPTY_STATS.filteredActivitySummary,
    ...(data.filteredActivitySummary || {}),
  },
});

const SummaryCard = ({ title, value, icon, color, subtitle, linkTo }) => {
  const content = (
    <div className="card border-0 shadow-sm h-100 dashboard-summary-card p-3 rounded-4">
      <div className="card-body p-0 d-flex align-items-center justify-content-between gap-3">
        <div className="min-w-0">
          <p className="text-muted mb-2 small text-uppercase fw-bold text-truncate">{title}</p>
          <h3 className="fw-bold mb-1 text-break">{value}</h3>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: 50,
            height: 50,
            color,
            backgroundColor: `${color}18`,
            fontSize: 21,
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="col-12 col-sm-6 col-xl-4">
      {linkTo ? (
        <Link to={linkTo} className="text-decoration-none">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
};

const EmptyState = ({ children }) => (
  <div className="text-center text-muted py-4">
    <FaChartLine className="mb-2" size={24} />
    <p className="mb-0 small">{children}</p>
  </div>
);

const ChartCard = ({ title, subtitle, icon, children }) => (
  <div className="card border-0 shadow-sm h-100 rounded-4">
    <div className="card-body p-3 p-md-4">
      <div className="mb-3">
        <h5 className="fw-bold mb-1 fs-6 fs-md-5">
          {icon && <span className="me-2 text-success">{icon}</span>}
          {title}
        </h5>
        {subtitle && <p className="small text-muted mb-0">{subtitle}</p>}
      </div>
      {children}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(() => normalizeStats());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedDates, setAppliedDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (appliedDates.startDate) params.startDate = appliedDates.startDate;
      if (appliedDates.endDate) params.endDate = appliedDates.endDate;

      const response = await api.get("/admin-dashboard/stats", { params });

      if (response.data?.success) {
        setStats(normalizeStats(response.data.data || {}));
        setHasLoaded(true);
      } else {
        setError(
          response.data?.message || "Unable to load dashboard statistics."
        );
      }
    } catch (err) {
      console.error("Admin dashboard error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load dashboard data. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [appliedDates]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const params = {};
        if (appliedDates.startDate) params.startDate = appliedDates.startDate;
        if (appliedDates.endDate) params.endDate = appliedDates.endDate;

        const response = await api.get("/admin-dashboard/stats", { params });
        if (cancelled) return;

        if (response.data?.success) {
          setStats(normalizeStats(response.data.data || {}));
          setHasLoaded(true);
        } else {
          setError(
            response.data?.message || "Unable to load dashboard statistics."
          );
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Admin dashboard error:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load dashboard data. Check your connection and try again."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [appliedDates]);

  const applyFilters = (event) => {
    event.preventDefault();

    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be later than end date.");
      return;
    }

    setError("");
    setAppliedDates({ startDate, endDate });
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setError("");
    setAppliedDates({ startDate: "", endDate: "" });
  };

  // Best 5 Overview Cards linked directly to Side Bar routes
  const summaryCards = useMemo(
    () => [
      {
        title: "Total Users",
        value: formatNumber(stats.totalUsers),
        icon: <FaUsers />,
        color: "#0d6efd",
        linkTo: "/admin/users",
      },
      {
        title: "Total Farmers",
        value: formatNumber(stats.totalFarmers),
        icon: <FaUserTie />,
        color: "#198754",
        linkTo: "/admin/farmers",
      },
      {
        title: "Total Farms",
        value: formatNumber(stats.totalFarms),
        icon: <FaTractor />,
        color: "#fd7e14",
        linkTo: "/admin/farms",
      },
      {
        title: "Total Crops",
        value: formatNumber(stats.totalCrops),
        icon: <FaSeedling />,
        color: "#20c997",
        linkTo: "/admin/reports",
      },
      {
        title: "Supply Applications",
        value: formatNumber(stats.totalApplications || 0),
        icon: <FaClipboardList />,
        color: "#6f42c1",
        linkTo: "/admin/applications",
      },
    ],
    [stats]
  );

  const hasDateFilter = Boolean(appliedDates.startDate || appliedDates.endDate);

  if (loading && !hasLoaded) {
    return (
      <div className="container-fluid py-4 px-3">
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body d-flex align-items-center gap-3 py-5">
            <div
              className="spinner-border text-success"
              role="status"
              aria-label="Loading dashboard"
            />
            <div>
              <h5 className="mb-1">Loading admin dashboard...</h5>
              <p className="text-muted mb-0 small">
                Gathering your agriculture management statistics.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !hasLoaded) {
    return (
      <div className="container-fluid py-4 px-3">
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body text-center py-5">
            <FaExclamationTriangle className="text-danger mb-3" size={38} />
            <h2 className="fw-bold mb-2 fs-4">Unable to load dashboard</h2>
            <p className="text-muted mb-4 small">{error}</p>
            <button
              className="btn btn-success btn-sm"
              type="button"
              onClick={fetchDashboardStats}
              disabled={loading}
            >
              <FaRedoAlt className="me-2" />
              {loading ? "Retrying..." : "Try Again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-2 px-md-4 py-4 admin-dashboard">
      <style>{`
        .dashboard-summary-card {
          border-radius: 14px;
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .dashboard-summary-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 .5rem 1.25rem rgba(0,0,0,.09) !important;
        }
        .dashboard-panel { border-radius: 14px; overflow: hidden; }
        .admin-dashboard .table th { white-space: nowrap; }
        .admin-dashboard .chart-wrap { min-width: 0; width: 100%; }
      `}</style>

      {/* Dashboard heading */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{
                width: 38,
                height: 38,
                color: "#198754",
                backgroundColor: "#e8f5e9",
              }}
            >
              <FaLeaf size={18} />
            </span>
            <h2 className="fw-bold mb-0 fs-4">Admin Dashboard</h2>
          </div>
          <p className="text-muted mb-0 small">
            Monitor users, farms, crops, finances, harvests, and activities.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {loading && hasLoaded && (
            <span className="small text-muted">
              <span className="spinner-border spinner-border-sm text-success me-1" />
              Refreshing...
            </span>
          )}
          <span className="badge bg-success py-2 px-3">
            Smart Agriculture
          </span>
        </div>
      </div>

      {error && hasLoaded && (
        <div className="alert alert-warning d-flex flex-wrap align-items-center justify-content-between gap-2 small">
          <span>{error} Showing last successfully loaded data.</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-dark py-0 px-2"
            onClick={fetchDashboardStats}
            disabled={loading}
          >
            <FaRedoAlt className="me-1" />
            Retry
          </button>
        </div>
      )}

      {/* Best 5 Summary Cards */}
      <div className="row g-3 mb-4">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      {/* Farm Comparison shortcut */}
      <div className="card dashboard-panel border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#e8f5e9",
                  color: "#198754",
                  fontSize: 22,
                }}
              >
                <FaBalanceScale />
              </div>
              <div>
                <h5 className="fw-bold mb-1 fs-6">Farm Comparison</h5>
                <p className="text-muted mb-0 small">
                  Compare revenue, expenses, labor costs, and net profit across farms.
                </p>
              </div>
            </div>
            <Link
              to="/admin/farm-comparison"
              className="btn btn-success btn-sm flex-shrink-0"
            >
              <FaChartLine className="me-2" />
              Compare Farms
            </Link>
          </div>
        </div>
      </div>

      {/* Crop and user charts */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <ChartCard title="Crop and Harvest Overview">
            {stats.cropHarvestOverview.length ? (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stats.cropHarvestOverview} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar
                      dataKey="total"
                      name="Records"
                      fill="#198754"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState>No crop or harvest data available.</EmptyState>
            )}
          </ChartCard>
        </div>

        <div className="col-12 col-lg-6">
          <ChartCard title="User Distribution">
            {stats.userDistribution.length ? (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={stats.userDistribution}
                      dataKey="total"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ role, name, value }) =>
                        `${role || name || "User"}: ${value ?? ""}`
                      }
                    >
                      {stats.userDistribution.map((entry, index) => (
                        <Cell
                          key={entry.role || `role-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState>No user records available.</EmptyState>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Activity analytics and date filters */}
      <div className="card dashboard-panel border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
            <div>
              <h4 className="fw-bold mb-1 fs-5">
                <FaTasks className="me-2 text-success" />
                Farm Activity Analytics
              </h4>
              <p className="text-muted mb-0 small">
                Filter activity counts and labor costs by date.
              </p>
            </div>
            <span className="badge bg-light text-dark border">
              {hasDateFilter ? "Filtered period" : "All dates"}
            </span>
          </div>

          <form onSubmit={applyFilters}>
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-4">
                <label htmlFor="activityStartDate" className="form-label small fw-semibold">
                  <FaCalendarAlt className="me-2" />
                  Start date
                </label>
                <input
                  id="activityStartDate"
                  type="date"
                  className="form-control form-control-sm"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <label htmlFor="activityEndDate" className="form-label small fw-semibold">
                  <FaCalendarAlt className="me-2" />
                  End date
                </label>
                <input
                  id="activityEndDate"
                  type="date"
                  className="form-control form-control-sm"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
              <div className="col-12 col-md-4 d-flex flex-wrap gap-2">
                <button type="submit" className="btn btn-success btn-sm">
                  <FaFilter className="me-1" />
                  Apply
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={clearFilters}
                >
                  <FaTimes className="me-1" />
                  Clear
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Activities by Type Chart */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <ChartCard
            title="Activities by Type"
            subtitle="Number of activities in the selected period."
            icon={<FaTasks />}
          >
            {stats.activityTypeOverview.length ? (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={stats.activityTypeOverview}
                    margin={{ top: 10, right: 20, left: -10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="activityType" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar
                      dataKey="total"
                      name="Number of Activities"
                      fill="#198754"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState>No farm activities were found for this period.</EmptyState>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Labor Costs by Activity & Highest Labor Costs Table */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-7">
          <ChartCard
            title="Labor Costs by Activity"
            subtitle="Total labor costs for each activity in the selected period."
          >
            {stats.activityLaborOverview.length ? (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={stats.activityLaborOverview}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="activityType"
                      width={100}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip formatter={(value) => formatMoney(value)} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar
                      dataKey="totalLaborCost"
                      name="Labor Cost"
                      fill="#fd7e14"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState>No labor costs were found for this period.</EmptyState>
            )}
          </ChartCard>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card dashboard-panel border-0 shadow-sm h-100 rounded-4">
            <div className="card-body p-3 p-md-4">
              <h5 className="fw-bold mb-3 fs-6">Highest Labor Costs</h5>
              {stats.activityLaborOverview.length ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle small mb-0">
                    <thead className="table-success">
                      <tr>
                        <th>Activity</th>
                        <th>Records</th>
                        <th className="text-end">Labor Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...stats.activityLaborOverview]
                        .sort(
                          (a, b) =>
                            Number(b.totalLaborCost || 0) -
                            Number(a.totalLaborCost || 0)
                        )
                        .map((activity, index) => (
                          <tr key={activity.activityType || `activity-${index}`}>
                            <td className="fw-semibold">
                              {safeText(activity.activityType)}
                            </td>
                            <td>{formatNumber(activity.totalActivities)}</td>
                            <td className="text-end text-nowrap">
                              {formatMoney(activity.totalLaborCost)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState>No activity records found for this period.</EmptyState>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Expenses */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <ChartCard
            title="Monthly Expenses"
            icon={<FaChartLine />}
            subtitle="Recorded expenses over time."
          >
            {stats.monthlyExpenses.length ? (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={stats.monthlyExpenses} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => Number(value).toLocaleString()} />
                    <Tooltip formatter={(value) => formatMoney(value)} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Expenses"
                      stroke="#dc3545"
                      strokeWidth={2.5}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState>No monthly expense data available.</EmptyState>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Monthly Harvest Revenue */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <ChartCard
            title="Monthly Harvest Revenue"
            icon={<FaMoneyBillWave />}
            subtitle="Recorded revenue from harvests over time."
          >
            {stats.monthlyHarvestRevenue.length ? (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={stats.monthlyHarvestRevenue} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => Number(value).toLocaleString()} />
                    <Tooltip formatter={(value) => formatMoney(value)} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Harvest Revenue"
                      stroke="#198754"
                      strokeWidth={2.5}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState>No monthly harvest revenue data available.</EmptyState>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Monthly Harvest Quantity by Unit */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <ChartCard
            title="Monthly Harvest Quantity by Unit"
            icon={<FaSeedling />}
            subtitle="Harvest quantities grouped by unit."
          >
            {stats.monthlyHarvestQuantity.length && stats.quantityUnits.length ? (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyHarvestQuantity} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    {stats.quantityUnits.map((unit, index) => (
                      <Line
                        key={unit}
                        type="monotone"
                        dataKey={unit}
                        name={unit}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState>No harvest quantities recorded for the last six months.</EmptyState>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Recent Harvests */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card dashboard-panel border-0 shadow-sm">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h5 className="fw-bold mb-0 fs-6">Recent Harvests</h5>
                <span className="text-muted small">Latest 10 harvest records</span>
              </div>
              {stats.recentHarvests.length ? (
                <div className="table-responsive">
                  <table className="table table-striped table-hover align-middle mb-0 small">
                    <thead className="table-success">
                      <tr>
                        <th>Harvest ID</th>
                        <th>Crop Name</th>
                        <th>Harvest Date</th>
                        <th>Quantity</th>
                        <th>Total Revenue</th>
                        <th>Quality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentHarvests.map((harvest, index) => (
                        <tr key={harvest.id ?? `harvest-${index}`}>
                          <td>#{safeText(harvest.id)}</td>
                          <td className="fw-semibold">
                            {safeText(harvest.cropName, "Unknown crop")}
                          </td>
                          <td>{formatDate(harvest.harvestDate)}</td>
                          <td className="text-nowrap">
                            {formatNumber(harvest.quantity)}{" "}
                            {safeText(harvest.quantityUnit, "Unknown")}
                          </td>
                          <td className="text-nowrap">
                            {formatMoney(harvest.totalRevenue)}
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {safeText(harvest.quality, "Not specified")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState>No harvest records are available yet.</EmptyState>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent farm activities */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card dashboard-panel border-0 shadow-sm">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h5 className="fw-bold mb-0 fs-6">
                  <FaTasks className="me-2 text-success" />
                  Recent Farm Activities
                </h5>
                <span className="text-muted small">Latest 10 activity records</span>
              </div>
              {stats.recentActivities.length ? (
                <div className="table-responsive">
                  <table className="table table-striped table-hover align-middle mb-0 small">
                    <thead className="table-success">
                      <tr>
                        <th>Activity</th>
                        <th>Crop</th>
                        <th>Field ID</th>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Labor Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentActivities.map((activity, index) => (
                        <tr key={activity.id ?? `recent-activity-${index}`}>
                          <td>
                            <span className="badge bg-success">
                              {safeText(activity.activityType)}
                            </span>
                          </td>
                          <td className="fw-semibold">
                            {safeText(activity.cropName)}
                          </td>
                          <td>{safeText(activity.fieldId)}</td>
                          <td>{formatDate(activity.activityDate)}</td>
                          <td style={{ minWidth: 160 }}>
                            {safeText(activity.description)}
                          </td>
                          <td className="text-nowrap">
                            {formatNumber(activity.laborCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState>No farm activities have been recorded yet.</EmptyState>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;