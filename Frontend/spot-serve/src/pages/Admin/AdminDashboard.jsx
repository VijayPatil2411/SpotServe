import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobsByStatus = async (status) => {
    setSelectedStatus(status);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard/jobs?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Error loading jobs:", err);
    }
  };

  if (loading) {
    return <p className="text-center mt-5">Loading dashboard...</p>;
  }

  const cards = [
    { title: "Total Requests", value: stats.total, color: "primary", icon: "📦" },
    { title: "Completed Requests", value: stats.completed, color: "success", icon: "✅" },
    { title: "Pending Requests", value: stats.pending, color: "warning", icon: "⏳" },
    { title: "Accepted Requests", value: stats.accepted, color: "info", icon: "🧰" },
    { title: "Ongoing Requests", value: stats.ongoing, color: "secondary", icon: "⚙️" },
    { title: "Cancelled Requests", value: stats.cancelled, color: "danger", icon: "❌" },
  ];

  return (
    <div className="admin-dashboard container mt-5">
      <h2 className="fw-bold text-center mb-4">Admin Dashboard</h2>

      <div className="row g-4 justify-content-center">
        {cards.map((card, index) => (
          <div
            key={index}
            className="col-md-4 col-lg-3"
            onClick={() =>
              card.title !== "Total Requests"
                ? fetchJobsByStatus(card.title.split(" ")[0].toUpperCase())
                : null
            }
            style={{ cursor: card.title !== "Total Requests" ? "pointer" : "default" }}
          >
            <div className={`card admin-card shadow-lg border-${card.color}`}>
              <div className="card-body text-center">
                <div className="display-5 mb-2">{card.icon}</div>
                <h5 className="fw-bold">{card.title}</h5>
                <h3 className={`text-${card.color}`}>{card.value ?? 0}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Job Details */}
      {selectedStatus && (
        <div className="modal-overlay" onClick={() => setSelectedStatus(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="fw-bold text-center mb-3">{selectedStatus} Jobs</h4>
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Mechanic</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-3">
                      No jobs found for this status
                    </td>
                  </tr>
                ) : (
                  jobs.map((job, idx) => (
                    <tr key={job.id}>
                      <td>{idx + 1}</td>
                      <td>{job.customerName || "N/A"}</td>
                      <td>{job.serviceName || "N/A"}</td>
                      <td>{job.mechanicName || "N/A"}</td>
                      <td>{job.status}</td>
                      <td>{new Date(job.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="text-center mt-3">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedStatus(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
