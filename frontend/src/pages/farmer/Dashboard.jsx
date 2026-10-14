import { useCallback, useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  FaTint,
  FaFlask,
  FaSeedling,
  FaCalendarAlt,
  FaTractor,
  FaMapMarkedAlt,
  FaChartLine,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaSyncAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

import api from "../../services/api";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getResponseData(response) {
  // Supports APIs returning either { data: [...] } or the array/object directly.
  return response?.data?.data ?? response?.data ?? null;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [financialData, setFinancialData] = useState([]);
  const [cropProductionData, setCropProductionData] = useState([]);
  const [upcomingActivities, setUpcomingActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [
        summaryResponse,
        financialResponse,
        cropProductionResponse,
        upcomingActivitiesResponse,
      ] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/dashboard/monthly-financials"),
        api.get("/dashboard/crop-production"),
        api.get("/dashboard/upcoming-activities"),
      ]);

      const summaryData = getResponseData(summaryResponse);
      const rawFinancialData = getResponseData(financialResponse);
      const rawCropProductionData = getResponseData(cropProductionResponse);
      const rawUpcomingActivities = getResponseData(upcomingActivitiesResponse);

      setSummary(
        summaryData && typeof summaryData === "object" ? summaryData : {}
      );

      const formattedFinancialData = (
        Array.isArray(rawFinancialData) ? rawFinancialData : []
      ).map((item) => {
        const monthValue = Number(item?.month);
        return {
          month:
            Number.isFinite(monthValue) && monthValue >= 1 && monthValue <= 12
              ? MONTH_NAMES[monthValue - 1]
              : item?.month ?? "—",
          expenses: toNumber(item?.expenses),
          revenue: toNumber(item?.revenue),
        };
      });

      setFinancialData(formattedFinancialData);

      const formattedCropProductionData = (
        Array.isArray(rawCropProductionData) ? rawCropProductionData : []
      ).map((item) => ({
        crop_name: item?.crop_name || "Unknown crop",
        total_quantity: toNumber(item?.total_quantity),
        quantity_unit: item?.quantity_unit || "kg",
      }));

      setCropProductionData(formattedCropProductionData);
      setUpcomingActivities(
        Array.isArray(rawUpcomingActivities) ? rawUpcomingActivities : []
      );
    } catch (requestError) {
      console.error("Dashboard error:", requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const formatNumber = (value) =>
    toNumber(value).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });

  const formatDate = (date) => {
    if (!date) return "—";

    // Parse YYYY-MM-DD as a local date to avoid timezone shifts.
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      const [year, month, day] = date.substring(0, 10).split("-");
      const localDate = new Date(Number(year), Number(month) - 1, Number(day));

      if (Number.isNaN(localDate.getTime())) return date;

      return localDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return String(date);

    return value.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getActivityIcon = (type) => {
    switch (String(type || "").toLowerCase()) {
      case "irrigation":
        return <FaTint />;
      case "fertilizer":
        return <FaFlask />;
      case "harvest":
        return <FaSeedling />;
      default:
        return <FaCalendarAlt />;
    }
  };

  const getActivityClass = (type) => {
    switch (String(type || "").toLowerCase()) {
      case "irrigation":
        return "text-primary";
      case "fertilizer":
        return "text-warning";
      case "harvest":
        return "text-success";
      default:
        return "text-secondary";
    }
  };

  const getActivityBadgeClass = (type) => {
    switch (String(type || "").toLowerCase()) {
      case "irrigation":
        return "bg-primary-subtle text-primary";
      case "fertilizer":
        return "bg-warning-subtle text-dark";
      case "harvest":
        return "bg-success-subtle text-success";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  const estimatedProfit = toNumber(summary?.estimated_profit);

  const summaryCards = [
    {
      title: "Total Farms",
      value: formatNumber(summary?.total_farms),
      icon: <FaTractor />,
      iconClass: "bg-success-subtle text-success",
    },
    {
      title: "Total Fields",
      value: formatNumber(summary?.total_fields),
      icon: <FaMapMarkedAlt />,
      iconClass: "bg-primary-subtle text-primary",
    },
    {
      title: "Active Crops",
      value: formatNumber(summary?.active_crops),
      icon: <FaSeedling />,
      iconClass: "bg-warning-subtle text-warning",
    },
    {
      title: "Upcoming Irrigation",
      value: formatNumber(summary?.upcoming_irrigation),
      icon: <FaTint />,
      iconClass: "bg-info-subtle text-info",
    },
    {
      title: "Upcoming Fertilizer",
      value: formatNumber(summary?.upcoming_fertilizer),
      icon: <FaFlask />,
      iconClass: "bg-warning-subtle text-warning",
    },
    {
      title: "Upcoming Harvests",
      value: formatNumber(summary?.upcoming_harvests),
      icon: <FaCalendarAlt />,
      iconClass: "bg-success-subtle text-success",
    },
    {
      title: "Total Expenses",
      value: formatNumber(summary?.total_expenses),
      icon: <FaMoneyBillWave />,
      iconClass: "bg-danger-subtle text-danger",
      valueClass: "text-danger",
    },
    {
      title: "Total Revenue",
      value: formatNumber(summary?.total_revenue),
      icon: <FaArrowUp />,
      iconClass: "bg-success-subtle text-success",
      valueClass: "text-success",
    },
    {
      title: "Estimated Profit",
      value: formatNumber(estimatedProfit),
      icon: <FaChartLine />,
      iconClass:
        estimatedProfit >= 0
          ? "bg-success-subtle text-success"
          : "bg-danger-subtle text-danger",
      valueClass: estimatedProfit >= 0 ? "text-success" : "text-danger",
    },
  ];

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3 mb-0">Loading farmer dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger border-0 shadow-sm" role="alert">
          <div className="d-flex align-items-start gap-2">
            <FaExclamationTriangle className="mt-1" />
            <div className="flex-grow-1">
              <strong>Dashboard error</strong>
              <div>{error}</div>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm mt-3"
                onClick={() => loadDashboard()}
              >
                <FaSyncAlt className="me-2" />
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Page header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Farmer Dashboard</h2>
          <p className="text-muted mb-0">
            Overview of your farms, crops, finances, and agricultural activities.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="badge bg-success-subtle text-success px-3 py-2">
            <FaSeedling className="me-2" />
            Smart Agriculture
          </span>
          <button
            type="button"
            className="btn btn-outline-success btn-sm"
            onClick={() => loadDashboard({ silent: true })}
            disabled={refreshing}
          >
            <FaSyncAlt className={`me-2 ${refreshing ? "fa-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning py-2" role="alert">
          <strong>Some data may be out of date:</strong> {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="row g-3 g-xl-4">
        {summaryCards.map((card) => (
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={card.title}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3 p-lg-4">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div className="min-w-0">
                    <p className="text-muted mb-2 small fw-semibold">
                      {card.title}
                    </p>
                    <h3
                      className={`fw-bold mb-0 text-break ${
                        card.valueClass || ""
                      }`}
                    >
                      {card.value}
                    </h3>
                  </div>
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${card.iconClass}`}
                    style={{ width: 48, height: 48, fontSize: 18 }}
                    aria-hidden="true"
                  >
                    {card.icon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial chart and summary */}
      <div className="row g-3 g-xl-4 mt-1">
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3 p-lg-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h5 className="fw-bold mb-1">Revenue vs Expenses</h5>
                  <p className="text-muted small mb-0">
                    Monthly financial performance
                  </p>
                </div>
                <FaChartLine className="text-success" size={22} />
              </div>

              {financialData.length === 0 ? (
                <div className="text-center py-5">
                  <FaChartLine size={35} className="text-muted mb-3" />
                  <p className="text-muted mb-0">
                    No financial data available.
                  </p>
                </div>
              ) : (
                <div style={{ width: "100%", height: 350, minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={financialData}
                      margin={{ top: 10, right: 8, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => Number(value).toLocaleString()}
                        width={70}
                      />
                      <Tooltip
                        formatter={(value) => [formatNumber(value), ""]}
                        contentStyle={{
                          borderRadius: 10,
                          border: "1px solid #e9ecef",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="revenue"
                        name="Revenue"
                        fill="#198754"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={48}
                      />
                      <Bar
                        dataKey="expenses"
                        name="Expenses"
                        fill="#dc3545"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={48}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3 p-lg-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Financial Summary</h5>
                <FaMoneyBillWave className="text-success" size={22} />
              </div>

              <div className="p-3 rounded bg-success-subtle mb-3">
                <small className="text-muted">Total Revenue</small>
                <h4 className="fw-bold text-success mb-0 mt-1">
                  {formatNumber(summary?.total_revenue)}
                </h4>
              </div>

              <div className="p-3 rounded bg-danger-subtle mb-3">
                <small className="text-muted">Total Expenses</small>
                <h4 className="fw-bold text-danger mb-0 mt-1">
                  {formatNumber(summary?.total_expenses)}
                </h4>
              </div>

              <div className="border-top pt-3">
                <div className="d-flex justify-content-between align-items-center gap-3">
                  <div>
                    <small className="text-muted">Estimated Profit</small>
                    <h3
                      className={`fw-bold mb-0 mt-1 ${
                        estimatedProfit >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {formatNumber(estimatedProfit)}
                    </h3>
                  </div>
                  {estimatedProfit >= 0 ? (
                    <FaArrowUp className="text-success" size={24} />
                  ) : (
                    <FaArrowDown className="text-danger" size={24} />
                  )}
                </div>
              </div>
              <p className="text-muted small mt-3 mb-0">
                Profit is calculated from the summary data returned by the server.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Crop production */}
      <div className="row g-3 g-xl-4 mt-1">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3 p-lg-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h5 className="fw-bold mb-1">Crop Production</h5>
                  <p className="text-muted small mb-0">
                    Total harvested quantity by crop
                  </p>
                </div>
                <FaSeedling className="text-success" size={22} />
              </div>

              {cropProductionData.length === 0 ? (
                <div className="text-center py-5">
                  <FaSeedling size={35} className="text-muted mb-3" />
                  <p className="text-muted mb-0">
                    No crop production data available.
                  </p>
                </div>
              ) : (
                <div style={{ width: "100%", height: 350, minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={cropProductionData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="crop_name"
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={cropProductionData.length > 5 ? -20 : 0}
                        textAnchor={cropProductionData.length > 5 ? "end" : "middle"}
                        height={cropProductionData.length > 5 ? 65 : 35}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => Number(value).toLocaleString()}
                        width={70}
                      />
                      <Tooltip
                        formatter={(value, _name, item) => [
                          `${formatNumber(value)} ${
                            item?.payload?.quantity_unit || "kg"
                          }`,
                          "Production",
                        ]}
                        contentStyle={{
                          borderRadius: 10,
                          border: "1px solid #e9ecef",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="total_quantity"
                        name="Production"
                        fill="#198754"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {cropProductionData.length > 0 && (
                <p className="text-muted small mb-0 mt-2">
                  Quantities retain the unit provided for each crop; compare crops
                  with care if their units differ.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming activities */}
      <div className="row g-3 g-xl-4 mt-1">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3 p-lg-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1">Upcoming Activities</h5>
                  <p className="text-muted small mb-0">
                    Scheduled irrigation, fertilizer, and harvest activities
                  </p>
                </div>
                <span className="badge bg-success rounded-pill px-3 py-2 align-self-start align-self-md-center">
                  {upcomingActivities.length}{" "}
                  {upcomingActivities.length === 1 ? "Activity" : "Activities"}
                </span>
              </div>

              {upcomingActivities.length === 0 ? (
                <div className="text-center py-5">
                  <FaCalendarAlt size={35} className="text-muted mb-3" />
                  <h6 className="fw-semibold">No upcoming activities</h6>
                  <p className="text-muted mb-0">
                    Your scheduled irrigation, fertilizer, and harvest activities
                    will appear here.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col">Type</th>
                        <th scope="col">Crop</th>
                        <th scope="col">Farm</th>
                        <th scope="col">Field</th>
                        <th scope="col">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingActivities.map((activity, index) => (
                        <tr
                          key={
                            activity.id ??
                            `${activity.activity_type}-${activity.crop_name}-${activity.due_date}-${index}`
                          }
                        >
                          <td>
                            <span
                              className={`badge rounded-pill px-3 py-2 ${getActivityBadgeClass(
                                activity.activity_type
                              )}`}
                            >
                              <span
                                className={`me-2 ${getActivityClass(
                                  activity.activity_type
                                )}`}
                                aria-hidden="true"
                              >
                                {getActivityIcon(activity.activity_type)}
                              </span>
                              {activity.activity_type || "Activity"}
                            </span>
                          </td>
                          <td className="fw-semibold">
                            {activity.crop_name || "—"}
                          </td>
                          <td>{activity.farm_name || "—"}</td>
                          <td>{activity.field_name || "—"}</td>
                          <td className="fw-semibold">
                            {formatDate(activity.due_date)}
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
      </div>
    </div>
  );
}

export default Dashboard;
