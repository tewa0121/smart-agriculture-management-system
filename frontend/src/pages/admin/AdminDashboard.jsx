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
  FaUserPlus,
  FaFileAlt,
  FaCheckCircle,
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
          <p className="text-muted mb-2 small text-uppercase fw-bold">{title}</p>
          <h3 className="fw-bold mb-1 text-break">{value}</h3>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: 54,
            height: 54,
            color,
            backgroundColor: `${color}18`,
            fontSize: 23,
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="col-12 col-sm-6 col-xl-4 col-xxl-4">
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
  <div className="text-center text-muted py-5">
    <FaChartLine className="mb-2" size={26} />
    <p className="mb-0">{children}</p>
  </div>
);

const ChartCard = ({ title, subtitle, icon, children }) => (
  <div className="card border-0 shadow-sm h-100 rounded-4">
    <div className="card-body p-3 p-md-4">
      <div className="mb-3">
        <h5 className="fw-bold mb-1">
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
      <div className="container-fluid py-4">
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body d-flex align-items-center gap-3 py-5">
            <div
              className="spinner-border text-success"
              role="status"
              aria-label="Loading dashboard"
            />
            <div>
              <h5 className="mb-1">Loading admin dashboard...</h5>
              <p className="text-muted mb-0">
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
      <div className="container-fluid py-4">
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body text-center py-5">
            <FaExclamationTriangle className="text-danger mb-3" size={38} />
            <h2 className="fw-bold mb-2">Unable to load dashboard</h2>
            <p className="text-muted mb-4">{error}</p>
            <button
              className="btn btn-success"
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
    <div className="container-fluid px-4 py-4 admin-dashboard">
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
        .admin-dashboard .chart-wrap { min-width: 0; }
      `}</style>

      {/* Dashboard heading */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{
                width: 42,
                height: 42,
                color: "#198754",
                backgroundColor: "#e8f5e9",
              }}
            >
              <FaLeaf size={20} />
            </span>
            <h2 className="fw-bold mb-0">Admin Dashboard</h2>
          </div>
          <p className="text-muted mb-0">
            Monitor users, farms, crops, applications, and core agricultural operations.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {loading && hasLoaded && (
            <span className="small text-muted">
              <span className="spinner-border spinner-border-sm text-success me-2" />
              Refreshing...
            </span>
          )}
          <span className="badge bg-success fs-6 py-2 px-3">
            Smart Agriculture
          </span>
        </div>
      </div>

      {error && hasLoaded && (
        <div className="alert alert-warning d-flex flex-wrap align-items-center justify-content-between gap-2">
          <span>{error} Showing the last successfully loaded data.</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-dark"
            onClick={fetchDashboardStats}
            disabled={loading}
          >
            <FaRedoAlt className="me-2" />
            Retry
          </button>
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="card dashboard-panel border-0 shadow-sm mb-4 bg-success bg-opacity-10">
        <div className="card-body p-3 p-md-4">
          <h5 className="fw-bold mb-3 text-success">⚡ Quick Actions</h5>
          <div className="row g-3">
            <div className="col-12 col-sm-6 col-lg-3">
              <Link to="/admin/applications" className="btn btn-success w-100 py-2 d-flex align-items-center justify-content-center gap-2 text-decoration-none">
                <FaClipboardList /> Review Supply Requests
              </Link>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <Link to="/admin/users" className="btn btn-outline-success w-100 py-2 d-flex align-items-center justify-content-center gap-2 text-decoration-none bg-white">
                <FaUserPlus /> Add New User
              </Link>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <Link to="/admin/reports" className="btn btn-outline-success w-100 py-2 d-flex align-items-center justify-content-center gap-2 text-decoration-none bg-white">
                <FaFileAlt /> Generate Reports
              </Link>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <Link to="/admin/farmers" className="btn btn-outline-success w-100 py-2 d-flex align-items-center justify-content-center gap-2 text-decoration-none bg-white">
                <FaCheckCircle /> Manage Farmers
              </Link>
            </div>
          </div>
        </div>
      </div>

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
                  width: 60,
                  height: 60,
                  backgroundColor: "#e8f5e9",
                  color: "#198754",
                  fontSize: 26,
                }}
              >
                <FaBalanceScale />
              </div>
              <div>
                <h5 className="fw-bold mb-1">Farm Comparison</h5>
                <p className="text-muted mb-0">
                  Compare revenue, expenses, labor costs, and net profit across farms.
                </p>
              </div>
            </div>
            <Link
              to="/admin/farm-comparison"
              className="btn btn-success flex-shrink-0"
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
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.cropHarvestOverview}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="total"
                      name="Records"
                      fill="#198754"
                      radius={[5, 5, 0, 0]}
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
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.userDistribution}
                      dataKey="total"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
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
                    <Legend />
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
              <h4 className="fw-bold mb-1">
                <FaTasks className="me-2 text-success" />
                Farm Activity Analytics
              </h4>
              <p className="text-muted mb-0">
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
                <label htmlFor="activityStartDate" className="form-label">
                  <FaCalendarAlt className="me-2" />
                  Start date
                </label>
                <input
                  id="activityStartDate"
                  type="date"
                  className="form-control"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <label htmlFor="activityEndDate" className="form-label">
                  <FaCalendarAlt className="me-2" />
                  End date
                </label>
                <input
                  id="activityEndDate"
                  type="date"
                  className="form-control"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
              <div className="col-12 col-md-4 d-flex flex-wrap gap-2">
                <button type="submit" className="btn btn-success">
                  <FaFilter className="me-2" />
                  Apply Filters
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={clearFilters}
                >
                  <FaTimes className="me-2" />
                  Clear Filters
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Recent farm activities */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card dashboard-panel border-0 shadow-sm">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h5 className="fw-bold mb-0">
                  <FaTasks className="me-2 text-success" />
                  Recent Farm Activities
                </h5>
                <span className="text-muted small">Latest 10 activity records</span>
              </div>
              {stats.recentActivities.length ? (
                <div className="table-responsive">
                  <table className="table table-striped table-hover align-middle mb-0">
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
                          <td style={{ minWidth: 180 }}>
                            {safeText(activity.description)}
                          </td>
                          <td className="text-nowrap">
                            {formatMoney(activity.laborCost)}
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