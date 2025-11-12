// src/pages/Customer/CustomerDashboard.jsx
import React, { useEffect, useState } from "react";
import { getAllServices } from "../../services/customerService";
import ServiceCards from "../../components/ServiceCards";

const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:8080/api/customer";

const CustomerDashboard = () => {
  const [services, setServices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      await fetchServices();
      await fetchJobs();
    };
    fetchData();
  }, []);

  // ✅ Existing: Fetch all roadside services
  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllServices();
      console.log("Services fetched:", data);
      setServices(data || []);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Failed to load services. Check console/network.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ New: Fetch user's current and past jobs
  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/jobs/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(data || []);
    } catch (err) {
      console.error("Error loading jobs:", err);
    }
  };

  // ✅ Handle “Pay Now” click
  const handlePayNow = (url) => {
    if (url) {
      window.open(url, "_blank");
    } else {
      alert("Payment link not available yet. Please wait for confirmation.");
    }
  };

  return (
    <div className="mt-4 mb-5">
      <div className="container">
        {/* -------------------- SERVICES SECTION -------------------- */}
        <h2 className="text-center fw-semibold mb-2">
          Available Roadside Services
        </h2>
        <p className="text-center text-muted mb-4">
          Select a service to get quick assistance from nearby mechanics.
        </p>

        {loading && (
          <div className="text-center my-4">
            <div className="spinner-border" role="status" aria-hidden="true"></div>
            <div className="mt-2 text-muted">Loading services...</div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && <ServiceCards services={services} />}

        {/* -------------------- PAYMENT SECTION -------------------- */}
        <hr className="my-5" />
        <h4 className="fw-bold text-center mb-3">My Active Requests</h4>

        {jobs.length === 0 ? (
          <p className="text-center text-muted">
            You currently have no active or past requests.
          </p>
        ) : (
          <div className="row justify-content-center">
            {jobs.map((job) => (
              <div key={job.id} className="col-md-5 col-lg-4 mb-4">
                <div className="card shadow-sm p-3 rounded-4">
                  <h5 className="fw-bold mb-1">
                    {job.serviceName || `Service #${job.serviceId}`}
                  </h5>
                  <p className="m-0">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge ${
                        job.status === "Completed"
                          ? "bg-success"
                          : job.status === "PAYMENT_PENDING"
                          ? "bg-dark"
                          : job.status === "Ongoing"
                          ? "bg-info text-dark"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {job.status === "PAYMENT_PENDING"
                        ? "Awaiting Payment"
                        : job.status}
                    </span>
                  </p>
                  <p className="m-0">
                    <strong>Location:</strong>{" "}
                    {job.location ||
                      (job.pickupLat && job.pickupLng
                        ? `${job.pickupLat}, ${job.pickupLng}`
                        : "N/A")}
                  </p>
                  <p className="m-0">
                    <strong>Description:</strong>{" "}
                    {job.description || "No description"}
                  </p>

                  {/* 💳 Pay Now Button (only if waiting for payment) */}
                  {job.status === "PAYMENT_PENDING" && job.paymentUrl && (
                    <button
                      className="btn btn-primary w-100 mt-3"
                      onClick={() => handlePayNow(job.paymentUrl)}
                    >
                      💳 Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
