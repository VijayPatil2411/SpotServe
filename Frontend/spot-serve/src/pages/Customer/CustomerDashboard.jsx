import React, { useEffect, useState } from "react";
import { getAllServices } from "../../services/customerService";
import ServiceCards from "../../components/ServiceCards";
import "./CustomerDashboard.css";

const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:8080/api/customer";

const CustomerDashboard = () => {
  const [services, setServices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null); // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  /* ============================
     FETCH LOGGED-IN USER
  ============================ */
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (e) {
      console.error("Failed to fetch user", e);
    }
  };

  /* ============================
     FETCH SERVICES
  ============================ */
  const fetchServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllServices();
      setServices(data || []);
    } catch (err) {
      setError("Failed to load services. Check console/network.");
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     FETCH USER JOBS
  ============================ */
  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/jobs/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setJobs(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };

  /* ============================
     LOAD ALL AT PAGE LOAD
  ============================ */
  useEffect(() => {
    fetchUser();
    fetchServices();
    fetchJobs();
    // eslint-disable-next-line
  }, []);

  const handlePayNow = (url) => {
    if (url) window.open(url, "_blank");
    else alert("Payment link not available yet.");
  };

  return (
    <div className="dash-outer">
      <section className="dash-section">
        <h2 className="dash-title">Available Roadside Services</h2>
        <p className="dash-desc">
          Select a service to get quick assistance from nearby mechanics.
        </p>

        {loading && (
          <div className="dash-loading">
            <span className="dash-spinner"></span>
            <span>Loading services...</span>
          </div>
        )}

        {error && <div className="dash-alert">{error}</div>}

        {/* 🔥 FIX: Now passing user → required for vehicle loading */}
        {!loading && !error && <ServiceCards services={services} user={user} />}
      </section>

      <section className="dash-section">
        <h3 className="dash-title dash-title-small">My Active Requests</h3>

        {jobs.length === 0 ? (
          <p className="dash-empty">You currently have no active requests.</p>
        ) : (
          <div className="dash-jobs-grid">
            {jobs.map((job) => (
              <div key={job.id} className="dash-job-card">
                <h4 className="dash-job-title">
                  {job.serviceName || `Service #${job.serviceId}`}
                </h4>

                <div className="dash-job-info">
                  <span
                    className={`dash-status dash-status-${job.status?.toLowerCase()}`}
                  >
                    {job.status === "PAYMENT_PENDING"
                      ? "Awaiting Payment"
                      : job.status}
                  </span>

                  <span>
                    <strong>Location:</strong> {job.location || "N/A"}
                  </span>

                  <span>
                    <strong>Description:</strong>{" "}
                    {job.description || "No description"}
                  </span>
                </div>

                {job.status === "PAYMENT_PENDING" && job.paymentUrl && (
                  <button
                    className="dash-pay-btn"
                    onClick={() => handlePayNow(job.paymentUrl)}
                  >
                    💳 Pay Now
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomerDashboard;
