import { useEffect, useState } from "react";

import {
  FaMoneyBillWave,
  FaChartLine,
  FaWallet,
  FaCoins,
  FaFilter,
  FaTimes,
  FaSyncAlt,
  FaFileExcel,
  FaFilePdf,
} from "react-icons/fa";

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import api from "../../services/api";

const formatMoney = (value) =>
  `ETB ${Number(value || 0).toLocaleString("en-ET", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const FarmPerformanceReport = () => {
  const [report, setReport] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [farmId, setFarmId] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    startDate: "",
    endDate: "",
    farmId: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async (filters = appliedFilters) => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (filters.startDate) {
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        params.endDate = filters.endDate;
      }

      if (filters.farmId) {
        params.farmId = filters.farmId;
      }

      const response = await api.get("/farm-performance", {
        params,
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Could not load the report."
        );
      }

      setReport(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load farm performance report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport({
      startDate: "",
      endDate: "",
      farmId: "",
    });

    // Initial page load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = (event) => {
    event.preventDefault();

    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be later than end date.");
      return;
    }

    const filters = {
      startDate,
      endDate,
      farmId,
    };

    setAppliedFilters(filters);
    fetchReport(filters);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFarmId("");

    const filters = {
      startDate: "",
      endDate: "",
      farmId: "",
    };

    setAppliedFilters(filters);
    fetchReport(filters);
  };

  const summaryCards = report
    ? [
        {
          title: "Harvest Revenue",
          value: report.totalRevenue,
          icon: <FaMoneyBillWave />,
          color: "#198754",
          description: "Income from recorded harvests",
        },
        {
          title: "Farm Expenses",
          value: report.totalExpenses,
          icon: <FaWallet />,
          color: "#0d6efd",
          description: "Recorded operating expenses",
        },
        {
          title: "Labor Costs",
          value: report.totalLaborCosts,
          icon: <FaCoins />,
          color: "#fd7e14",
          description: "Recorded farm activity labor",
        },
        {
          title: "Net Profit / Loss",
          value: report.netProfit,
          icon: <FaChartLine />,
          color: report.netProfit >= 0 ? "#198754" : "#dc3545",
          description: "Revenue minus recorded costs",
        },
      ]
    : [];

  const exportRows = () => {
    if (!report) return [];

    const rows = [
      {
        Section: "Overall Summary",
        Name: "Harvest Revenue",
        Revenue: report.totalRevenue,
        Expenses: "",
        LaborCosts: report.totalLaborCosts,
        TotalCosts: report.totalCosts,
        NetProfit: report.netProfit,
      },
      {
        Section: "Overall Summary",
        Name: "Farm Expenses",
        Revenue: "",
        Expenses: report.totalExpenses,
        LaborCosts: "",
        TotalCosts: "",
        NetProfit: "",
      },
      ...(report.farmPerformance || []).map((farm) => ({
        Section: "Farm Performance",
        Name: farm.farmName,
        Revenue: farm.revenue,
        Expenses: farm.expenses,
        LaborCosts: farm.laborCosts,
        TotalCosts: farm.totalCosts,
        NetProfit: farm.netProfit,
      })),
      ...(report.cropPerformance || []).map((crop) => ({
        Section: "Crop Performance",
        Name: crop.cropName,
        Farm: crop.farmName,
        Revenue: crop.revenue,
        Expenses: crop.expenses,
        LaborCosts: crop.laborCosts,
        TotalCosts: crop.totalCosts,
        NetProfit: crop.netProfit,
      })),
      ...(report.monthlyPerformance || []).map((month) => ({
        Section: "Monthly Performance",
        Name: month.month,
        Revenue: month.revenue,
        Expenses: month.expenses,
        LaborCosts: month.laborCosts,
        TotalCosts: month.totalCosts,
        NetProfit: month.netProfit,
      })),
    ];

    return rows;
  };

  const handleExportExcel = () => {
    if (!report) return;

    const workbook = XLSX.utils.book_new();

    const summary = [
      {
        Metric: "Harvest Revenue",
        Amount: report.totalRevenue,
      },
      {
        Metric: "Farm Expenses",
        Amount: report.totalExpenses,
      },
      {
        Metric: "Labor Costs",
        Amount: report.totalLaborCosts,
      },
      {
        Metric: "Total Costs",
        Amount: report.totalCosts,
      },
      {
        Metric: "Net Profit / Loss",
        Amount: report.netProfit,
      },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(summary),
      "Summary"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        (report.farmPerformance || []).map((farm) => ({
          Farm: farm.farmName,
          Revenue: farm.revenue,
          Expenses: farm.expenses,
          LaborCosts: farm.laborCosts,
          TotalCosts: farm.totalCosts,
          NetProfit: farm.netProfit,
        }))
      ),
      "Farm Performance"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        (report.cropPerformance || []).map((crop) => ({
          Farm: crop.farmName,
          Crop: crop.cropName,
          Revenue: crop.revenue,
          Expenses: crop.expenses,
          LaborCosts: crop.laborCosts,
          TotalCosts: crop.totalCosts,
          NetProfit: crop.netProfit,
        }))
      ),
      "Crop Performance"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        (report.monthlyPerformance || []).map((month) => ({
          Month: month.month,
          Revenue: month.revenue,
          Expenses: month.expenses,
          LaborCosts: month.laborCosts,
          TotalCosts: month.totalCosts,
          NetProfit: month.netProfit,
        }))
      ),
      "Monthly Performance"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(exportRows()),
      "All Report Data"
    );

    XLSX.writeFile(workbook, "Farm_Performance_Report.xlsx");
  };

  const handleExportPDF = () => {
    if (!report) return;

    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text("Farm Performance Report", 14, 18);

    pdf.setFontSize(10);

    const selectedFarm =
      report.farms?.find(
        (farm) => String(farm.id) === String(report.selectedFarmId)
      )?.name || "All Farms";

    pdf.text(`Farm: ${selectedFarm}`, 14, 26);

    pdf.text(
      `Start Date: ${report.dateFilter?.startDate || "All dates"}`,
      14,
      32
    );

    pdf.text(
      `End Date: ${report.dateFilter?.endDate || "All dates"}`,
      14,
      38
    );

    autoTable(pdf, {
      startY: 45,
      head: [["Financial Summary", "Amount (ETB)"]],
      body: [
        ["Harvest Revenue", Number(report.totalRevenue || 0).toFixed(2)],
        ["Farm Expenses", Number(report.totalExpenses || 0).toFixed(2)],
        ["Labor Costs", Number(report.totalLaborCosts || 0).toFixed(2)],
        ["Total Costs", Number(report.totalCosts || 0).toFixed(2)],
        ["Net Profit / Loss", Number(report.netProfit || 0).toFixed(2)],
      ],
    });

    let nextY = pdf.lastAutoTable.finalY + 10;

    autoTable(pdf, {
      startY: nextY,
      head: [[
        "Farm",
        "Revenue",
        "Expenses",
        "Labor",
        "Costs",
        "Net Profit",
      ]],
      body: (report.farmPerformance || []).map((farm) => [
        farm.farmName,
        Number(farm.revenue || 0).toFixed(2),
        Number(farm.expenses || 0).toFixed(2),
        Number(farm.laborCosts || 0).toFixed(2),
        Number(farm.totalCosts || 0).toFixed(2),
        Number(farm.netProfit || 0).toFixed(2),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fontSize: 8 },
    });

    nextY = pdf.lastAutoTable.finalY + 10;

    autoTable(pdf, {
      startY: nextY,
      head: [[
        "Crop",
        "Farm",
        "Revenue",
        "Expenses",
        "Labor",
        "Net Profit",
      ]],
      body: (report.cropPerformance || []).map((crop) => [
        crop.cropName,
        crop.farmName,
        Number(crop.revenue || 0).toFixed(2),
        Number(crop.expenses || 0).toFixed(2),
        Number(crop.laborCosts || 0).toFixed(2),
        Number(crop.netProfit || 0).toFixed(2),
      ]),
      styles: { fontSize: 7 },
      headStyles: { fontSize: 7 },
    });

    nextY = pdf.lastAutoTable.finalY + 10;

    autoTable(pdf, {
      startY: nextY,
      head: [[
        "Month",
        "Revenue",
        "Expenses",
        "Labor",
        "Costs",
        "Net Profit",
      ]],
      body: (report.monthlyPerformance || []).map((month) => [
        month.month,
        Number(month.revenue || 0).toFixed(2),
        Number(month.expenses || 0).toFixed(2),
        Number(month.laborCosts || 0).toFixed(2),
        Number(month.totalCosts || 0).toFixed(2),
        Number(month.netProfit || 0).toFixed(2),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fontSize: 8 },
    });

    pdf.save("Farm_Performance_Report.pdf");
  };

  return (
    <div
      className="container-fluid p-3 p-md-4"
      style={{
        background: "#f6f8fb",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
      >
        <div>
          <h2 className="fw-bold mb-1">
            Farm Performance Report
          </h2>

          <p className="text-muted mb-0">
            Monitor farm revenue, expenses, labor costs, and profit.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => fetchReport()}
            disabled={loading}
          >
            <FaSyncAlt className="me-2" />
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-success"
            onClick={handleExportExcel}
            disabled={!report || loading}
          >
            <FaFileExcel className="me-2" />
            Export Excel
          </button>

          <button
            type="button"
            className="btn btn-danger"
            onClick={handleExportPDF}
            disabled={!report || loading}
          >
            <FaFilePdf className="me-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-semibold mb-3">
            <FaFilter className="me-2" />
            Report Filters
          </h5>

          <form onSubmit={handleApplyFilters}>
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-3">
                <label htmlFor="farmId" className="form-label">
                  Select Farm
                </label>

                <select
                  id="farmId"
                  className="form-select"
                  value={farmId}
                  onChange={(event) => setFarmId(event.target.value)}
                >
                  <option value="">All Farms</option>

                  {(report?.farms || []).map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-3">
                <label htmlFor="startDate" className="form-label">
                  Start Date
                </label>

                <input
                  id="startDate"
                  type="date"
                  className="form-control"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                />
              </div>

              <div className="col-12 col-md-3">
                <label htmlFor="endDate" className="form-label">
                  End Date
                </label>

                <input
                  id="endDate"
                  type="date"
                  className="form-control"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) =>
                    setEndDate(event.target.value)
                  }
                />
              </div>

              <div className="col-12 col-md-3 d-flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  Apply
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleClearFilters}
                  disabled={loading}
                >
                  <FaTimes className="me-1" />
                  Clear
                </button>
              </div>
            </div>
          </form>

          <small className="text-muted d-block mt-3">
            Leave the farm and date filters blank to view all available records.
          </small>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <div className="d-flex justify-content-between align-items-center gap-3">
            <span>{error}</span>

            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => fetchReport()}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>

          <p className="text-muted mt-3">
            Loading farm performance report...
          </p>
        </div>
      )}

      {!loading && report && (
        <>
          {/* Summary Cards */}
          <div className="row g-3 mb-4">
            {summaryCards.map((card) => (
              <div
                className="col-12 col-sm-6 col-xl-3"
                key={card.title}
              >
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    borderRadius: 14,
                    transition: "transform 0.2s ease",
                  }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <p className="text-muted mb-1">
                          {card.title}
                        </p>

                        <h4
                          className="fw-bold mb-0"
                          style={{
                            color: card.color,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {formatMoney(card.value)}
                        </h4>
                      </div>

                      <div
                        style={{
                          fontSize: 28,
                          color: card.color,
                        }}
                        aria-hidden="true"
                      >
                        {card.icon}
                      </div>
                    </div>

                    <small className="text-muted">
                      {card.description}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Monthly Chart */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-1">
                Monthly Financial Performance
              </h5>

              <p className="text-muted small mb-4">
                Compare revenue, operating expenses, labor costs, and net profit.
              </p>

              {report.monthlyPerformance?.length ? (
                <div style={{ width: "100%", height: 360 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={report.monthlyPerformance}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 20,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="month" />

                      <YAxis
                        tickFormatter={(value) =>
                          Number(value).toLocaleString()
                        }
                      />

                      <Tooltip
                        formatter={(value) => formatMoney(value)}
                      />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#198754"
                        strokeWidth={2}
                        dot={false}
                      />

                      <Line
                        type="monotone"
                        dataKey="expenses"
                        name="Expenses"
                        stroke="#0d6efd"
                        strokeWidth={2}
                        dot={false}
                      />

                      <Line
                        type="monotone"
                        dataKey="laborCosts"
                        name="Labor Costs"
                        stroke="#fd7e14"
                        strokeWidth={2}
                        dot={false}
                      />

                      <Line
                        type="monotone"
                        dataKey="netProfit"
                        name="Net Profit"
                        stroke="#6f42c1"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  No monthly financial records were found.
                </div>
              )}
            </div>
          </div>

          {/* Farm Comparison */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-1">
                Farm Profit Comparison
              </h5>

              <p className="text-muted small mb-4">
                Compare revenue and estimated net profit across farms.
              </p>

              {report.farmPerformance?.length ? (
                <>
                  <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={report.farmPerformance}
                        margin={{
                          top: 10,
                          right: 20,
                          left: 20,
                          bottom: 20,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                          dataKey="farmName"
                          interval={0}
                          angle={-15}
                          textAnchor="end"
                          height={70}
                        />

                        <YAxis
                          tickFormatter={(value) =>
                            Number(value).toLocaleString()
                          }
                        />

                        <Tooltip
                          formatter={(value) => formatMoney(value)}
                        />

                        <Legend />

                        <Bar
                          dataKey="revenue"
                          name="Revenue"
                          fill="#198754"
                        />

                        <Bar
                          dataKey="netProfit"
                          name="Net Profit"
                          fill="#6f42c1"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="table-responsive mt-4">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Farm</th>
                          <th className="text-end">Revenue</th>
                          <th className="text-end">Expenses</th>
                          <th className="text-end">Labor</th>
                          <th className="text-end">Total Costs</th>
                          <th className="text-end">Net Profit</th>
                        </tr>
                      </thead>

                      <tbody>
                        {report.farmPerformance.map((farm) => (
                          <tr key={farm.farmId}>
                            <td className="fw-semibold">
                              {farm.farmName}
                            </td>

                            <td className="text-end">
                              {formatMoney(farm.revenue)}
                            </td>

                            <td className="text-end">
                              {formatMoney(farm.expenses)}
                            </td>

                            <td className="text-end">
                              {formatMoney(farm.laborCosts)}
                            </td>

                            <td className="text-end">
                              {formatMoney(farm.totalCosts)}
                            </td>

                            <td
                              className={`text-end fw-bold ${
                                farm.netProfit >= 0
                                  ? "text-success"
                                  : "text-danger"
                              }`}
                            >
                              {formatMoney(farm.netProfit)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted py-5">
                  No farm performance records were found.
                </div>
              )}
            </div>
          </div>

          {/* Crop Comparison */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-1">
                Crop Revenue and Cost Comparison
              </h5>

              <p className="text-muted small mb-4">
                Compare crop revenue, recorded crop expenses, labor, and profit.
              </p>

              {report.cropPerformance?.length ? (
                <>
                  <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={report.cropPerformance}
                        margin={{
                          top: 10,
                          right: 20,
                          left: 20,
                          bottom: 20,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                          dataKey="cropName"
                          interval={0}
                          angle={-15}
                          textAnchor="end"
                          height={80}
                        />

                        <YAxis
                          tickFormatter={(value) =>
                            Number(value).toLocaleString()
                          }
                        />

                        <Tooltip
                          formatter={(value) => formatMoney(value)}
                        />

                        <Legend />

                        <Bar
                          dataKey="revenue"
                          name="Revenue"
                          fill="#198754"
                        />

                        <Bar
                          dataKey="totalCosts"
                          name="Total Costs"
                          fill="#dc3545"
                        />

                        <Bar
                          dataKey="netProfit"
                          name="Net Profit"
                          fill="#6f42c1"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="table-responsive mt-4">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Crop</th>
                          <th>Farm</th>
                          <th className="text-end">Revenue</th>
                          <th className="text-end">Expenses</th>
                          <th className="text-end">Labor</th>
                          <th className="text-end">Total Costs</th>
                          <th className="text-end">Net Profit</th>
                        </tr>
                      </thead>

                      <tbody>
                        {report.cropPerformance.map((crop) => (
                          <tr key={crop.cropId}>
                            <td className="fw-semibold">
                              {crop.cropName}
                            </td>

                            <td>{crop.farmName}</td>

                            <td className="text-end">
                              {formatMoney(crop.revenue)}
                            </td>

                            <td className="text-end">
                              {formatMoney(crop.expenses)}
                            </td>

                            <td className="text-end">
                              {formatMoney(crop.laborCosts)}
                            </td>

                            <td className="text-end">
                              {formatMoney(crop.totalCosts)}
                            </td>

                            <td
                              className={`text-end fw-bold ${
                                crop.netProfit >= 0
                                  ? "text-success"
                                  : "text-danger"
                              }`}
                            >
                              {formatMoney(crop.netProfit)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted py-5">
                  No crop performance records were found.
                </div>
              )}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                Financial Summary
              </h5>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <tbody>
                    <tr>
                      <th scope="row">Total Harvest Revenue</th>

                      <td className="text-end text-success fw-semibold">
                        {formatMoney(report.totalRevenue)}
                      </td>
                    </tr>

                    <tr>
                      <th scope="row">Total Farm Expenses</th>

                      <td className="text-end">
                        {formatMoney(report.totalExpenses)}
                      </td>
                    </tr>

                    <tr>
                      <th scope="row">Total Labor Costs</th>

                      <td className="text-end">
                        {formatMoney(report.totalLaborCosts)}
                      </td>
                    </tr>

                    <tr>
                      <th scope="row">Total Costs</th>

                      <td className="text-end fw-semibold">
                        {formatMoney(report.totalCosts)}
                      </td>
                    </tr>

                    <tr>
                      <th scope="row">Net Profit / Loss</th>

                      <td
                        className={`text-end fw-bold ${
                          report.netProfit >= 0
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {formatMoney(report.netProfit)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-muted small mt-3 mb-0">
                Net profit is an estimate based on recorded harvest revenue,
                farm expenses, and labor costs. Costs that have not been
                recorded are not included.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FarmPerformanceReport;