import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./FarmComparison.css";

function FarmComparison() {
  const { isAuthenticated } = useAuth();

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchFarmComparison = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Please log in as an administrator.");
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be after the end date.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = {};

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get("/farm-comparison", { params });

      // Support common API response structures.
      const responseData = response.data;

      const farmList = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.farms)
          ? responseData.farms
          : Array.isArray(responseData?.data)
            ? responseData.data
            : Array.isArray(responseData?.data?.farms)
              ? responseData.data.farms
              : Array.isArray(responseData?.results)
                ? responseData.results
                : null;

      if (!farmList) {
        console.error(
          "Unexpected farm comparison API response:",
          responseData
        );

        throw new Error(
          responseData?.message ||
            "The API returned an unexpected response format."
        );
      }

      setFarms(farmList);
    } catch (err) {
      console.error("Farm comparison error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your session may have expired. Please log in again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view this report."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load farm comparison."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, startDate, endDate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFarmComparison();
    }
  }, [isAuthenticated, fetchFarmComparison]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  return (
    <div className="farm-comparison-container">
      <div className="farm-comparison-header">
        <h1>Farm Comparison</h1>
        <p>Compare the financial performance of your farms.</p>
      </div>

      <div className="farm-comparison-filters">
        <div className="filter-group">
          <label htmlFor="comparison-start-date">
            Start Date
          </label>

          <input
            id="comparison-start-date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="comparison-end-date">
            End Date
          </label>

          <input
            id="comparison-end-date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={fetchFarmComparison}
          disabled={loading}
        >
          {loading ? "Loading..." : "Compare Farms"}
        </button>
      </div>

      {loading && (
        <p className="comparison-loading">
          Loading farm comparison...
        </p>
      )}

      {error && (
        <div className="comparison-error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && farms.length === 0 && (
        <div className="comparison-empty">
          No farm data found for the selected period.
        </div>
      )}

      {!loading && !error && farms.length > 0 && (
        <div className="farm-comparison-table-wrapper">
          <table className="farm-comparison-table">
            <thead>
              <tr>
                <th>Farm Name</th>
                <th>Location</th>
                <th>Revenue</th>
                <th>Expenses</th>
                <th>Labor Cost</th>
                <th>Total Costs</th>
                <th>Net Profit</th>
              </tr>
            </thead>

            <tbody>
              {farms.map((farm, index) => {
                const profit = Number(farm.net_profit) || 0;

                return (
                  <tr key={farm.farm_id ?? farm.id ?? index}>
                    <td>
                      {farm.farm_name ?? farm.name ?? "Unnamed Farm"}
                    </td>

                    <td>{farm.location || "—"}</td>

                    <td>
                      {formatCurrency(
                        farm.total_revenue ?? farm.revenue
                      )}
                    </td>

                    <td>
                      {formatCurrency(
                        farm.total_expenses ?? farm.expenses
                      )}
                    </td>

                    <td>
                      {formatCurrency(
                        farm.total_labor_cost ?? farm.labor_cost
                      )}
                    </td>

                    <td>{formatCurrency(farm.total_costs)}</td>

                    <td
                      className={
                        profit >= 0
                          ? "comparison-profit-positive"
                          : "comparison-profit-negative"
                      }
                    >
                      {formatCurrency(profit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FarmComparison;