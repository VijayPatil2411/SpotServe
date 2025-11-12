import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./MyRequests.css";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/customer/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this request?"
    );
    if (!confirmCancel) return;

    setCancelingId(id);
    try {
      const token = localStorage.getItem("token");
      await api.put(`/api/customer/jobs/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "CANCELLED", fading: true } : req
        )
      );

      setTimeout(() => {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, fading: false } : req
          )
        );
      }, 600);
    } catch (error) {
      console.error("Error cancelling request:", error);
      alert("Failed to cancel request. Please try again.");
    } finally {
      setCancelingId(null);
    }
  };

  const fetchOtp = async (jobId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.get(`/api/customer/jobs/${jobId}/otp`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.otp) {
        alert(`🔢 Your OTP is: ${res.data.otp}`);
      } else {
        alert(res.data.message || "No OTP available for this job yet.");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching OTP");
    }
  };

  // ✅ Handle payment redirection
  const handlePayNow = (url) => {
    if (!url) {
      alert("No payment link found for this job.");
      return;
    }
    alert("💳 Redirecting to payment gateway...");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 fw-bold">My Service Requests</h2>

      {loading ? (
        <p className="text-center text-muted">Loading your requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-center text-muted">
          You have no service requests yet.
        </p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle my-requests-table">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Service</th>
                <th>Vehicle</th>
                <th>Description</th>
                <th>Location</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, index) => {
                const status = (req.status || "").toUpperCase();
                return (
                  <tr
                    key={req.id}
                    className={`${req.fading ? "fade-row" : ""} ${
                      status === "CANCELLED" ? "cancelled-row" : ""
                    }`}
                  >
                    <td>{index + 1}</td>
                    <td>{req.serviceName || req.serviceId || "N/A"}</td>
                    <td>{req.vehicleId || "N/A"}</td>
                    <td>{req.description || "-"}</td>
                    <td>{req.location || "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          status === "PENDING"
                            ? "bg-warning text-dark"
                            : status === "COMPLETED"
                            ? "bg-success"
                            : status === "ACCEPTED"
                            ? "bg-primary"
                            : status === "ONGOING"
                            ? "bg-info text-dark"
                            : status === "PAYMENT_PENDING"
                            ? "bg-secondary"
                            : status === "CANCELLED"
                            ? "bg-danger"
                            : "bg-dark"
                        }`}
                      >
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td>{new Date(req.createdAt).toLocaleString()}</td>
                    <td>
                      {status === "PENDING" ? (
                        <button
                          className="btn btn-sm btn-outline-danger cancel-btn"
                          disabled={cancelingId === req.id}
                          onClick={() => handleCancel(req.id)}
                        >
                          {cancelingId === req.id ? "Cancelling..." : "Cancel"}
                        </button>
                      ) : status === "ACCEPTED" ? (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => fetchOtp(req.id)}
                        >
                          View OTP
                        </button>
                      ) : status === "PAYMENT_PENDING" && req.paymentUrl ? (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handlePayNow(req.paymentUrl)}
                        >
                          💳 Pay Now
                        </button>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
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
};

export default MyRequests;
