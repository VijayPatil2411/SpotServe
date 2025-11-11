import React, { useEffect, useState } from "react";
import "./MechanicDashboard.css";

/* ===============================
   Map Modal Component
================================ */
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
   Main Mechanic Dashboard
================================ */
const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:8080/api/customer/jobs";

const MechanicDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [loading, setLoading] = useState(false);
  const [mapJob, setMapJob] = useState(null);
  const [otpInput, setOtpInput] = useState("");

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

  // ✅ Accept Job
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

  // ✅ Start Job → Generate OTP (only once)
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

  // ✅ Verify OTP
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

  // ✅ Complete Job
  const handleCompleteJob = async (jobId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/${jobId}/complete`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert("🎉 Job completed successfully!");
        fetchJobs();
      } else {
        alert(data.message || "Failed to complete job");
      }
    } catch (err) {
      console.error(err);
      alert("Error completing job");
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
            <div className="job-card shadow-sm p-3">
              <h5 className="fw-bold">
                {job.serviceName || `Service #${job.serviceId}`}
              </h5>
              <p>
                <strong>Location:</strong>{" "}
                {job.location ||
                  (job.pickupLat && job.pickupLng
                    ? `${job.pickupLat}, ${job.pickupLng}`
                    : "Unknown")}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {job.description || "No description"}
              </p>
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
                      : job.status === "Completed"
                      ? "bg-success"
                      : "bg-secondary"
                  }`}
                >
                  {job.status}
                </span>
              </p>

              {/* --- Buttons --- */}
              {activeTab === "available" && job.status === "Pending" && (
                <button
                  className="btn btn-success w-100 mt-2"
                  onClick={() => handleAccept(job.id)}
                >
                  Accept Job
                </button>
              )}

              {activeTab === "accepted" && job.status === "Accepted" && (
                <>
                  {/* ✅ Show Start only if no OTP yet */}
                  {!job.otpCode && (
                    <button
                      className="btn btn-warning w-100 mt-2"
                      onClick={() => handleStartJob(job.id)}
                    >
                      Start Job
                    </button>
                  )}

                  <button
                    className="btn btn-outline-primary w-100 mt-2"
                    onClick={() => setMapJob(job)}
                  >
                    View on Map
                  </button>

                  {/* ✅ Show OTP input if OTP exists */}
                  {job.otpCode && (
                    <div className="otp-box mt-3">
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Enter OTP sent to customer"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                      />
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => handleVerifyOtp(job.id)}
                      >
                        Verify OTP
                      </button>
                    </div>
                  )}
                </>
              )}

              {activeTab === "accepted" && job.status === "Ongoing" && (
                <button
                  className="btn btn-success w-100 mt-2"
                  onClick={() => handleCompleteJob(job.id)}
                >
                  Mark as Done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <MapModal
        show={!!mapJob}
        onClose={() => setMapJob(null)}
        lat={mapJob?.pickupLat}
        lng={mapJob?.pickupLng}
      />
    </div>
  );
};

export default MechanicDashboard;
