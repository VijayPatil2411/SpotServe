import React, { useEffect, useState } from "react";
import "./MechanicDashboard.css";

const MapModal = ({ show, onClose, lat, lng }) => {
  if (!show) return null;

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const embedUrl =
    lat && lng
      ? `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=15&maptype=roadmap`
      : null;

  return (
    <div className="modal-overlay">
      <div className="modal-card map-card">
        <h5 className="fw-bold mb-3 text-center">Pickup Location</h5>
        {embedUrl ? (
          <iframe
            title="pickup-map"
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: "10px" }}
            src={embedUrl}
            allowFullScreen
          ></iframe>
        ) : (
          <p className="text-muted text-center mt-4">
            No location data available for this job.
          </p>
        )}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===============================
   Mechanic Dashboard
================================ */
const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:8080/api/customer/jobs";
const PAYMENT_API =
  process.env.REACT_APP_API_PAYMENT || "http://localhost:8080/api/payments";

const MechanicDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [loading, setLoading] = useState(false);
  const [mapJob, setMapJob] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [paymentJob, setPaymentJob] = useState(null);
  const [extraAmount, setExtraAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchJobs();
  }, [activeTab]);

  const fetchJobs = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const endpoint =
      activeTab === "available"
        ? `${API_BASE}/available`
        : `${API_BASE}/accepted`;

    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(data || []);
    } catch (err) {
      console.error("Error loading jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (jobId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/${jobId}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      if (res.ok) {
        alert("✅ Job accepted successfully!");
        fetchJobs();
      } else {
        alert(text || "Failed to accept job");
      }
    } catch (err) {
      console.error(err);
      alert("Error accepting job");
    }
  };

  const handleStartJob = async (jobId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/${jobId}/start`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert(data.message || "OTP generated successfully! Ask the customer.");
        fetchJobs();
      } else {
        alert(data.message || "Failed to start job");
      }
    } catch (err) {
      console.error(err);
      alert("Error starting job");
    }
  };

  const handleVerifyOtp = async (jobId) => {
    const token = localStorage.getItem("token");
    if (!otpInput.trim()) {
      alert("Please enter OTP before verifying.");
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE}/${jobId}/verify-otp?otp=${otpInput}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert("✅ OTP verified successfully!");
        setOtpInput("");
        fetchJobs();
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Error verifying OTP");
    }
  };

  // ✅ Open payment modal instead of alert
  const handleCompleteJob = (job) => {
    setPaymentJob(job);
    setExtraAmount("");
    setDescription("");
  };

  // ✅ Send link to customer (not open Stripe)
  const handleSendPaymentLink = async () => {
    if (!paymentJob) return;
    const token = localStorage.getItem("token");

    const payload = {
      jobId: paymentJob.id,
      baseAmount: paymentJob.baseAmount || 500,
      extraAmount: extraAmount ? parseFloat(extraAmount) : 0,
      description: description || `Payment for job #${paymentJob.id}`,
    };

    try {
      const res = await fetch(`${PAYMENT_API}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.checkoutUrl) {
        alert("✅ Payment link sent to customer! Waiting for confirmation.");
        setPaymentJob(null);
        fetchJobs();
      } else {
        alert("Failed to create payment session");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating payment session");
    }
  };

  return (
    <div className="mechanic-dashboard container mt-5">
      <h2 className="text-center fw-bold mb-4">Mechanic Dashboard</h2>

      <div className="tab-buttons d-flex justify-content-center mb-4">
        <button
          className={`tab-btn ${activeTab === "available" ? "active" : ""}`}
          onClick={() => setActiveTab("available")}
        >
          Available Jobs
        </button>
        <button
          className={`tab-btn ${activeTab === "accepted" ? "active" : ""}`}
          onClick={() => setActiveTab("accepted")}
        >
          Accepted Jobs
        </button>
      </div>

      {loading && <p className="text-center text-muted fs-5">Loading jobs...</p>}
      {!loading && jobs.length === 0 && (
        <p className="text-center text-muted fs-6">No jobs found.</p>
      )}

      <div className="row justify-content-center">
        {jobs.map((job) => (
          <div key={job.id} className="col-md-5 col-lg-4 mb-4">
            <div className="job-card shadow-sm p-3 rounded-4">
              <h5 className="fw-bold">{job.serviceName || `Service #${job.serviceId}`}</h5>
              <p><strong>Location:</strong> {job.location || "Unknown"}</p>
              <p><strong>Description:</strong> {job.description || "No description"}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`badge ${
                    job.status === "Pending"
                      ? "bg-warning text-dark"
                      : job.status === "Accepted"
                      ? "bg-primary"
                      : job.status === "Ongoing"
                      ? "bg-info text-dark"
                      : job.status === "Payment_Pending"
                      ? "bg-secondary"
                      : job.status === "Completed"
                      ? "bg-success"
                      : "bg-dark"
                  }`}
                >
                  {job.status === "Payment_Pending"
                    ? "Waiting for Payment Confirmation"
                    : job.status}
                </span>
              </p>

              {activeTab === "available" && job.status === "Pending" && (
                <button className="btn btn-success w-100 mt-2" onClick={() => handleAccept(job.id)}>
                  Accept Job
                </button>
              )}

              {activeTab === "accepted" && job.status === "Accepted" && (
                <>
                  {!job.otpCode && (
                    <button className="btn btn-warning w-100 mt-2" onClick={() => handleStartJob(job.id)}>
                      Start Job
                    </button>
                  )}
                  <button className="btn btn-outline-primary w-100 mt-2" onClick={() => setMapJob(job)}>
                    View on Map
                  </button>
                  {job.otpCode && (
                    <div className="otp-box mt-3">
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Enter OTP sent to customer"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                      />
                      <button className="btn btn-primary w-100" onClick={() => handleVerifyOtp(job.id)}>
                        Verify OTP
                      </button>
                    </div>
                  )}
                </>
              )}

              {activeTab === "accepted" && job.status === "Ongoing" && (
                <button
                  className="btn btn-success w-100 mt-2"
                  onClick={() => handleCompleteJob(job)}
                >
                  Mark as Done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Map Modal */}
      <MapModal
        show={!!mapJob}
        onClose={() => setMapJob(null)}
        lat={mapJob?.pickupLat}
        lng={mapJob?.pickupLng}
      />

      {/* Payment Modal */}
      {paymentJob && (
        <div className="modal-overlay">
          <div className="modal-card payment-card">
            <h5 className="fw-bold text-center mb-3">
              💰 Complete Job & Send Payment Link
            </h5>
            <p>
              <strong>Base Amount:</strong> ₹
              {paymentJob.baseAmount || 500}
            </p>
            <input
              type="number"
              className="form-control mb-2"
              placeholder="Extra Amount (optional)"
              value={extraAmount}
              onChange={(e) => setExtraAmount(e.target.value)}
            />
            <textarea
              className="form-control mb-3"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>

            <button className="btn btn-success w-100" onClick={handleSendPaymentLink}>
              ✅ Send Payment Link to Customer
            </button>
            <button className="btn btn-secondary w-100 mt-2" onClick={() => setPaymentJob(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MechanicDashboard;
