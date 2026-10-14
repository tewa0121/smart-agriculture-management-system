import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaSync,
  FaTractor,
  FaUsers,
  FaSeedling,
  FaSearch,
  FaMapMarkerAlt,
  FaRulerCombined,
} from "react-icons/fa";

import api from "../../services/api";

const colors = {
  green: "#16834a",
  greenDark: "#116b3b",
  background: "#f5f7f6",
  text: "#1f2937",
  muted: "#6b7280",
  border: "#e5e7eb",
  white: "#ffffff",
};

const styles = {
  page: {
    width: "100%",
    minWidth: 0,
    minHeight: "100%",
    padding: "28px",
    background: colors.background,
    color: colors.text,
    fontFamily: "Inter, Arial, sans-serif",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "28px",
  },

  title: {
    margin: 0,
    fontSize: "clamp(24px, 3vw, 30px)",
    fontWeight: 700,
    lineHeight: 1.3,
    color: "#183b2b",
  },

  subtitle: {
    margin: "7px 0 0",
    fontSize: "14px",
    lineHeight: 1.6,
    color: colors.muted,
  },

  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    padding: "11px 18px",
    minHeight: "42px",
    border: "none",
    borderRadius: "8px",
    background: colors.green,
    color: colors.white,
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(22,131,74,0.15)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: "20px",
    marginBottom: "28px",
    alignItems: "stretch",
  },

  card: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    minWidth: 0,
    minHeight: "140px",
    padding: "23px",
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    background: colors.white,
    boxShadow: "0 3px 12px rgba(0,0,0,0.035)",
  },

  cardLabel: {
    margin: 0,
    color: colors.muted,
    fontSize: "14px",
    fontWeight: 500,
  },

  cardValue: {
    margin: "12px 0 0",
    color: "#183b2b",
    fontSize: "32px",
    fontWeight: 700,
    lineHeight: 1.2,
  },

  cardDetail: {
    margin: "8px 0 0",
    fontSize: "12px",
    color: colors.muted,
    lineHeight: 1.5,
  },

  icon: {
    width: "50px",
    height: "50px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    fontSize: "21px",
  },

  panel: {
    minWidth: 0,
    overflow: "hidden",
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    background: colors.white,
    boxShadow: "0 3px 12px rgba(0,0,0,0.025)",
  },

  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "18px",
    padding: "22px 24px",
    borderBottom: `1px solid ${colors.border}`,
  },

  panelTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: colors.text,
  },

  panelSubtitle: {
    margin: "6px 0 0",
    fontSize: "13px",
    color: colors.muted,
    lineHeight: 1.5,
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "min(100%, 300px)",
    padding: "0 13px",
    border: `1px solid #d1d5db`,
    borderRadius: "8px",
    background: colors.white,
    color: "#9ca3af",
    boxSizing: "border-box",
  },

  searchInput: {
    width: "100%",
    minWidth: 0,
    padding: "11px 0",
    border: "none",
    outline: "none",
    background: "transparent",
    color: colors.text,
    fontSize: "13px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "720px",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "13px",
  },

  tableHead: {
    background: "#f9fafb",
    color: colors.muted,
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.045em",
  },

  th: {
    padding: "15px 20px",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "17px 20px",
    borderTop: "1px solid #f0f2f0",
    verticalAlign: "middle",
    color: "#4b5563",
  },

  farmName: {
    fontWeight: 600,
    fontSize: "13px",
    color: colors.text,
  },

  secondary: {
    display: "block",
    marginTop: "5px",
    fontSize: "12px",
    color: "#9ca3af",
    overflowWrap: "anywhere",
  },

  badge: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    minWidth: "32px",
    padding: "5px 10px",
    borderRadius: "20px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "12px",
    fontWeight: 700,
  },

  footer: {
    padding: "14px 20px",
    borderTop: `1px solid ${colors.border}`,
    fontSize: "12px",
    color: colors.muted,
    background: "#fff",
  },

  message: {
    padding: "30px 20px",
    textAlign: "center",
    color: colors.muted,
    fontSize: "14px",
  },

  error: {
    marginBottom: "20px",
    padding: "14px 16px",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  warning: {
    marginBottom: "20px",
    padding: "14px 16px",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    background: "#fffbeb",
    color: "#92400e",
    fontSize: "13px",
    lineHeight: 1.6,
  },
};

function FarmMonitoring() {
  const [farms, setFarms] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cropError, setCropError] = useState("");

  const loadMonitoringData = useCallback(async () => {
    setLoading(true);
    setError("");
    setCropError("");

    try {
      const results = await Promise.allSettled([
        api.get("/farms/admin/all"),
        api.get("/users"),
        api.get("/crops/admin/all"),
      ]);

      const [farmsResult, usersResult, cropsResult] = results;

      if (farmsResult.status === "fulfilled") {
        setFarms(farmsResult.value.data?.data || []);
      } else {
        console.error("Failed to load farms:", farmsResult.reason);
        setFarms([]);
        setError(
          farmsResult.reason?.response?.data?.message ||
            "Unable to load farm data."
        );
      }

      if (usersResult.status === "fulfilled") {
        const users = usersResult.value.data?.data || [];

        setFarmers(
          users.filter(
            (user) =>
              String(user.role || "").toLowerCase() === "farmer"
          )
        );
      } else {
        console.error("Failed to load users:", usersResult.reason);
        setFarmers([]);
      }

      if (cropsResult.status === "fulfilled") {
        setCrops(cropsResult.value.data?.data || []);
      } else {
        console.error("Failed to load crops:", cropsResult.reason);
        setCrops([]);

        setCropError(
          cropsResult.reason?.response?.data?.message ||
            "Unable to load crop records."
        );
      }
    } catch (err) {
      console.error("Failed to load farm monitoring:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load farm monitoring data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMonitoringData();
  }, [loadMonitoringData]);

  const filteredFarms = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return farms;

    return farms.filter((farm) =>
      [
        farm.name,
        farm.location,
        farm.description,
        farm.farmer_name,
        farm.farmer_email,
        farm.owner_name,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [farms, search]);

  const totalFarms = farms.length;
  const totalFarmers = farmers.length;
  const totalCrops = crops.length;

  const totalFarmArea = farms.reduce(
    (total, farm) => total + Number(farm.total_area || 0),
    0
  );

  const formatArea = (area) =>
    Number(area).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });

  const summaryCards = [
    {
      title: "Registered Farmers",
      value: totalFarmers,
      detail: "Farmers registered in the system",
      icon: <FaUsers />,
      iconBackground: "#dbeafe",
      iconColor: "#2563eb",
    },
    {
      title: "Registered Farms",
      value: totalFarms,
      detail: `Total field area: ${formatArea(totalFarmArea)} ha`,
      icon: <FaTractor />,
      iconBackground: "#dcfce7",
      iconColor: "#15803d",
    },
    {
      title: "Crops Recorded",
      value: totalCrops,
      detail: "Crop records across registered farms",
      icon: <FaSeedling />,
      iconBackground: "#fef3c7",
      iconColor: "#b45309",
    },
  ];

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Farm Monitoring</h1>

          <p style={styles.subtitle}>
            Monitor registered farmers, farms, and crop records.
          </p>
        </div>

        <button
          type="button"
          onClick={loadMonitoringData}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(event) => {
            if (!loading) {
              event.currentTarget.style.background = colors.greenDark;
            }
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = colors.green;
          }}
        >
          <FaSync
            style={{
              animation: loading ? "fm-spin 1s linear infinite" : "none",
            }}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {/* Scoped animation without a separate CSS file */}
      <style>
        {`
          @keyframes fm-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .fm-table-row:hover {
            background: #f7fbf8 !important;
          }

          .fm-search-input:focus {
            outline: none;
          }

          @media (max-width: 600px) {
            .fm-dashboard-page {
              padding: 16px !important;
            }

            .fm-dashboard-header {
              align-items: flex-start !important;
            }

            .fm-dashboard-card {
              min-height: 115px !important;
            }

            .fm-dashboard-panel-header {
              padding: 18px !important;
            }
          }
        `}
      </style>

      {/* General error */}
      {error && (
        <div role="alert" style={styles.error}>
          {error}
        </div>
      )}

      {/* Summary cards */}
      <section style={styles.grid}>
        {summaryCards.map((card) => (
          <article
            key={card.title}
            style={styles.card}
          >
            <div style={{ minWidth: 0 }}>
              <p style={styles.cardLabel}>{card.title}</p>

              <h2 style={styles.cardValue}>
                {loading ? "—" : card.value}
              </h2>

              <p style={styles.cardDetail}>
                {card.detail}
              </p>
            </div>

            <div
              style={{
                ...styles.icon,
                background: card.iconBackground,
                color: card.iconColor,
              }}
            >
              {card.icon}
            </div>
          </article>
        ))}
      </section>

      {cropError && (
        <div role="alert" style={styles.warning}>
          {cropError} Please check the backend crop endpoint.
        </div>
      )}

      {/* Farm overview */}
      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.panelTitle}>Farm Overview</h2>

            <p style={styles.panelSubtitle}>
              Review farm locations, farmers, land area, and crop records.
            </p>
          </div>

          <div style={styles.searchBox}>
            <FaSearch />

            <input
              className="fm-search-input"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search farms or farmers..."
              aria-label="Search farms or farmers"
              style={styles.searchInput}
            />

            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                style={{
                  border: "none",
                  background: "transparent",
                  color: colors.muted,
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={styles.message}>Loading farm data...</div>
        ) : filteredFarms.length === 0 ? (
          <div style={styles.message}>
            {farms.length === 0
              ? "No farms have been registered yet."
              : "No farms match your search."}
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={styles.th}>Farm</th>
                  <th style={styles.th}>Farmer</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Field Area</th>
                  <th style={styles.th}>Crop Records</th>
                </tr>
              </thead>

              <tbody>
                {filteredFarms.map((farm) => (
                  <tr
                    key={farm.id}
                    className="fm-table-row"
                    style={{ background: "#fff" }}
                  >
                    <td style={styles.td}>
                      <div style={styles.farmName}>
                        {farm.name || "Unnamed farm"}
                      </div>

                      {farm.description && (
                        <span style={styles.secondary}>
                          {farm.description}
                        </span>
                      )}
                    </td>

                    <td style={styles.td}>
                      <div style={{ color: colors.text }}>
                        {farm.farmer_name ||
                          farm.owner_name ||
                          "Not assigned"}
                      </div>

                      {farm.farmer_email && (
                        <span style={styles.secondary}>
                          {farm.farmer_email}
                        </span>
                      )}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "7px",
                        }}
                      >
                        <FaMapMarkerAlt
                          style={{ color: "#9ca3af", flexShrink: 0 }}
                        />
                        {farm.location || "Not specified"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "7px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <FaRulerCombined
                          style={{ color: "#9ca3af" }}
                        />
                        {formatArea(farm.total_area || 0)}{" "}
                        {farm.area_unit || "ha"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.badge}>
                        {Number(farm.crop_count || 0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer style={styles.footer}>
          Showing <strong>{filteredFarms.length}</strong> of{" "}
          <strong>{farms.length}</strong> farms
        </footer>
      </section>
    </div>
  );
}

export default FarmMonitoring;