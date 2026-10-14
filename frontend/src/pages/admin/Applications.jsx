import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/applications");

      setApplications(response.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load applications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const updateStatus = async (applicationId, status) => {
    const action = status === "approved" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this application?`)) {
      return;
    }

    const adminNotes = window.prompt(
      "Enter optional notes for the farmer:"
    );

    if (adminNotes === null) {
      return;
    }

    try {
      setUpdatingId(applicationId);
      setError("");

      await api.patch(
        `/applications/${applicationId}/status`,
        {
          status,
          admin_notes: adminNotes,
        }
      );

      await loadApplications();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update application."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const badgeClass = (status) => {
    if (status === "approved") return "bg-success";
    if (status === "rejected") return "bg-danger";
    return "bg-warning text-dark";
  };

  if (loading) {
    return (
      <div className="container py-4">
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h2 className="fw-bold">Farmer Applications</h2>
          <p className="text-muted mb-0">
            Review requests for agricultural supplies.
          </p>
        </div>

        <button
          className="btn btn-outline-success"
          onClick={loadApplications}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Farmer</th>
                <th>Contact</th>
                <th>Supply</th>
                <th>Quantity</th>
                <th>Crop / Location</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>{application.id}</td>

                  <td>
                    <div className="fw-semibold">
                      {application.farmer_name}
                    </div>
                    <small className="text-muted">
                      Farmer ID: {application.farmer_id}
                    </small>
                  </td>

                  <td>
                    <div>{application.farmer_email}</div>
                    <small className="text-muted">
                      {application.farmer_phone || "No phone"}
                    </small>
                  </td>

                  <td>
                    <div className="fw-semibold">
                      {application.product_name}
                    </div>
                    <small className="text-muted text-capitalize">
                      {application.supply_type}
                    </small>
                  </td>

                  <td>
                    {application.quantity} {application.unit}
                  </td>

                  <td>
                    <div>{application.crop_name || "—"}</div>
                    <small className="text-muted">
                      {application.farm_location || "—"}
                    </small>
                  </td>

                  <td>
                    {application.reason || "—"}
                  </td>

                  <td>
                    <span
                      className={`badge ${badgeClass(application.status)}`}
                    >
                      {application.status}
                    </span>

                    {application.admin_notes && (
                      <div
                        className="small text-muted mt-1"
                        style={{ maxWidth: "180px" }}
                      >
                        {application.admin_notes}
                      </div>
                    )}
                  </td>

                  <td>
                    {application.created_at
                      ? new Date(
                          application.created_at
                        ).toLocaleDateString()
                      : "—"}
                  </td>

                  <td>
                    {application.status === "pending" ? (
                      <div className="d-flex flex-column gap-2">
                        <button
                          className="btn btn-success btn-sm"
                          disabled={updatingId === application.id}
                          onClick={() =>
                            updateStatus(
                              application.id,
                              "approved"
                            )
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="btn btn-outline-danger btn-sm"
                          disabled={updatingId === application.id}
                          onClick={() =>
                            updateStatus(
                              application.id,
                              "rejected"
                            )
                          }
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted small">
                        Reviewed
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {applications.length === 0 && (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-5 text-muted"
                  >
                    No applications have been submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Applications;