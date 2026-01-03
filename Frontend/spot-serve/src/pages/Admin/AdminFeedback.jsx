import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminFeedback.css";
import { useToast } from "../../components/Toast";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

const AdminFeedback = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllFeedback();
  }, []);

  const loadAllFeedback = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/feedback/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load feedback");

      const data = await res.json();
      
      // Filter: Keep only feedback with rating >= 3
      const filteredData = Array.isArray(data) 
        ? data.filter((fb) => fb.rating >= 3)
        : [];
      
      setFeedbackList(filteredData);
    } catch (err) {
      console.error("loadAllFeedback error:", err);
      showToast("Failed to load feedback", "error");
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Star Renderer - Only filled stars (no gray)
  const renderStars = (rating) => {
    return (
      <span className="star-display">
        {[...Array(rating)].map((_, index) => (
          <span key={index} className="star filled">
            ★
          </span>
        ))}
      </span>
    );
  };

  // ⭐ Date Formatter
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="admin-feedback container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-feedback container mt-4">
      {/* Header */}
      <div className="feedback-header">
        <button className="btn btn-secondary" onClick={() => navigate("/admin/dashboard")}>
          ← Back to Dashboard
        </button>

        <h2 className="fw-bold mt-3">Customer Feedback Management</h2>
        <p className="text-muted">Total Feedback (3+ Stars): {feedbackList.length}</p>
      </div>

      {/* Feedback Table */}
      <div className="feedback-table-container">
        {feedbackList.length === 0 ? (
          <div className="text-center text-muted py-5">
            <h4>No feedback found (showing only 3+ stars)</h4>
          </div>
        ) : (
          <table className="table table-hover feedback-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Job ID</th>
                <th>Customer</th>
                <th>Mechanic</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {feedbackList.map((fb, index) => (
                <tr key={fb.id}>
                  <td>{index + 1}</td>

                  <td>
                    <span className="badge bg-secondary">#{fb.jobId}</span>
                  </td>

                  {/* ⭐ Customer Name + ID */}
                  <td>
                    {fb.customerName
                      ? `${fb.customerName} (#${fb.customerId})`
                      : `Customer ${fb.customerId}`}
                  </td>

                  {/* ⭐ Mechanic Name + ID */}
                  <td>
                    {fb.mechanicName
                      ? `${fb.mechanicName} (#${fb.mechanicId})`
                      : `Mechanic ${fb.mechanicId}`}
                  </td>

                  <td>{renderStars(fb.rating)}</td>

                  <td className="comment-cell">
                    <div className="comment-text">{fb.comment || "-"}</div>
                  </td>

                  <td className="date-cell">{formatDate(fb.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;
