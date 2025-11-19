// === FULL SAFE REPLACABLE FILE ===
// MechanicDashboard.jsx

import React, { useEffect, useState, useCallback } from "react";
import "./MechanicDashboard.css";

/* ===========================
   API BASES
=========================== */
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8080/api/customer/jobs";

const PAYMENT_API =
  process.env.REACT_APP_API_PAYMENT ||
  "http://localhost:8080/api/payments";

/* ===========================
   TOAST (Green/Red box)
=========================== */
const Toast = ({ message, type }) => {
  if (!message) return null;
  return (
    <div className={`toast-mini ${type === "error" ? "toast-error" : "toast-success"}`}>
      {message}
    </div>
  );
};

/* ===========================
   MAP MODAL
=========================== */
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
        <div className="modal-top">
          <div className="modal-title">
            <svg className="icon-sm" viewBox="0 0 24 24">
              <path d="M12 2C8 2 5 5.2 5 9.1C5 14.2 12 22 12 22s7-7.8 7-12.9C19 5.2 16 2 12 2zM12 11.5A2.4 2.4 0 1 1 12 6.7a2.4 2.4 0 0 1 0 4.8z" />
            </svg>
            <h5>Pickup Location</h5>
          </div>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {embedUrl ? (
          <iframe
            title="pickup-map"
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: "10px" }}
            src={embedUrl}
            allowFullScreen
          />
        ) : (
          <p className="text-muted center">No map available.</p>
        )}
      </div>
    </div>
  );
};

/* ===========================
   MAIN PAGE
=========================== */
const MechanicDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("available");

  const [mapJob, setMapJob] = useState(null);
  const [otpInput, setOtpInput] = useState("");

  const [paymentJob, setPaymentJob] = useState(null);
  const [extraAmount, setExtraAmount] = useState("");
  const [description, setDescription] = useState("");

  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 2600);
  };

  /* ===========================
     FETCH JOBS
  =========================== */
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      let endpoint = `${API_BASE}/available`;

      if (activeTab === "accepted") {
        endpoint = `${API_BASE}/accepted`;
      }

      if (activeTab === "completed") {
        const [acc, avail] = await Promise.all([
          fetch(`${API_BASE}/accepted`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/available`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        let list = [];

        if (acc.ok) list = list.concat(await acc.json());
        if (avail.ok) list = list.concat(await avail.json());

        list = list.filter((j) => {
          const s = (j.status || "").toLowerCase();
          return (
            s === "completed" ||
            s === "payment_pending" ||
            s === "done" ||
            s === "closed"
          );
        });

        setJobs(list);
        setLoading(false);
        return;
      }

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setJobs(data || []);
    } catch (err) {
      console.error(err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  /* ===========================
     ACTIONS
  =========================== */

  const handleAccept = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/${id}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast("Job accepted!", "success");
        fetchJobs();
      } else {
        showToast("Failed to accept job", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleStartJob = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/${id}/start`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        showToast("OTP generated — ask customer", "success");
        fetchJobs();
      } else {
        showToast(data.message || "Failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleVerifyOtp = async (id) => {
    if (!otpInput.trim()) {
      showToast("Enter OTP first", "error");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_BASE}/${id}/verify-otp?otp=${otpInput}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        showToast("OTP Verified!", "success");
        setOtpInput("");
        fetchJobs();
      } else showToast(data.message || "Invalid OTP", "error");
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleCompleteJob = (job) => {
    setPaymentJob(job);
    setExtraAmount("");
    setDescription("");
  };

  const handleSendPaymentLink = async () => {
    const job = paymentJob;
    const token = localStorage.getItem("token");

    const baseAmount = job?.service?.basePrice || 0;

    const payload = {
      jobId: job.id,
      baseAmount: baseAmount,
      extraAmount: extraAmount ? parseFloat(extraAmount) : 0,
      description:
        description || `Payment for ${job.serviceName || `job #${job.id}`}`,
    };

    try {
      const res = await fetch(`${PAYMENT_API}/create-checkout-session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.checkoutUrl) {
        showToast("Payment link sent!", "success");
        setPaymentJob(null);
        fetchJobs();
      } else showToast("Failed to create payment", "error");
    } catch {
      showToast("Network error", "error");
    }
  };

  const statusMeta = (s) => {
    const ss = (s || "").toLowerCase();

    if (ss === "pending") return { label: "Pending", cls: "s-warn" };
    if (ss === "accepted") return { label: "Accepted", cls: "s-primary" };
    if (ss === "ongoing") return { label: "Ongoing", cls: "s-info" };
    if (ss === "payment_pending")
      return { label: "Awaiting Payment", cls: "s-muted" };
    if (ss === "completed") return { label: "Completed", cls: "s-success" };

    return { label: s, cls: "s-dark" };
  };

  /* ===========================
     RENDER
  =========================== */
  return (
    <div className="mechanic-dashboard container">
      <Toast message={toastMsg} type={toastType} />

      <header className="top-row">
        <div>
          <h2 className="title">🔧 Mechanic Dashboard</h2>
          <p className="sub">
            Accept, start, verify OTP, complete & send payment link.
          </p>
        </div>

        <div className="refresh-area">
          <button className="icon-btn" onClick={fetchJobs}>
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M12 6V3L8 7l4 4V8c2.8 0 5 2.2 5 5a5 5 0 1 1-5-5z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="tabs">
        <button
          className={`tab ${activeTab === "available" ? "active" : ""}`}
          onClick={() => setActiveTab("available")}
        >
          Available
        </button>

        <button
          className={`tab ${activeTab === "accepted" ? "active" : ""}`}
          onClick={() => setActiveTab("accepted")}
        >
          Accepted
        </button>

        <button
          className={`tab ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </button>
      </nav>

      {loading && <div className="loader">Loading jobs…</div>}
      {!loading && jobs.length === 0 && (
        <div className="empty">No jobs found.</div>
      )}

      <div className="grid">
        {jobs.map((job) => {
          const meta = statusMeta(job.status);
          const basePrice = job?.service?.basePrice || 0;

          return (
            <article key={job.id} className="card">
              {/* Card Top */}
              <div className="card-head">
                <div className="head-left">
                  <div className="service-icon">
                    <svg className="gear" viewBox="0 0 24 24">
                      <path d="M19.14 12.936a7.003 7.003 0 0 0 0-1.872l2.036-1.58a.5.5 0 0 0 .12-.64l-1.93-3.34a.5.5 0 0 0-.6-.22l-2.396.96a6.992 6.992 0 0 0-1.62-.94L14.9 2.3a.5.5 0 0 0-.5-.3h-3.8a.5.5 0 0 0-.5.3l-.36 2.04c-.57.22-1.1.5-1.62.94l-2.4-.96a.5.5 0 0 0-.6.22L2.7 8.85a.5.5 0 0 0 .12.64l2.04 1.58c-.05.31-.08.62-.08.94s.03.63.08.94L2.82 14.6a.5.5 0 0 0-.12.64l1.93 3.34c.15.26.44.37.7.28l2.4-.96c.5.44 1.05.8 1.62.94l.36 2.04a.5.5 0 0 0 .5.3h3.8a.5.5 0 0 0 .5-.3l.36-2.04c.57-.22 1.1-.5 1.62-.94l2.4.96c.27.09.56-.02.7-.28l1.93-3.34a.5.5 0 0 0-.12-.64l-2.04-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
                    </svg>
                  </div>

                  <div>
                    <h4 className="service-name">
                      {job.serviceName || `Service #${job.serviceId}`}
                    </h4>
                    <div className="muted small">
                      {job.location || "Unknown Location"}
                    </div>
                  </div>
                </div>

                <div className="head-right">
                  <span className={`status ${meta.cls}`}>{meta.label}</span>
                </div>
              </div>

              {/* Description */}
              <p className="desc">{job.description || "No description"}</p>

              {/* ACTION BUTTONS */}
              <div className="card-actions">
                {/* AVAILABLE */}
                {activeTab === "available" && job.status === "Pending" && (
                  <button
                    className="btn-primary"
                    onClick={() => handleAccept(job.id)}
                  >
                    Accept
                  </button>
                )}

                {/* ACCEPTED */}
                {activeTab === "accepted" && (
                  <>
                    {job.status === "Accepted" && !job.otpCode && (
                      <button
                        className="btn-warning"
                        onClick={() => handleStartJob(job.id)}
                      >
                        Start Job
                      </button>
                    )}

                    <button
                      className="btn-outline"
                      onClick={() => setMapJob(job)}
                    >
                      Map
                    </button>

                    {job.otpCode && (
                      <div className="otp-inline">
                        <input
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          placeholder="Enter OTP"
                        />
                        <button
                          className="btn-primary small"
                          onClick={() => handleVerifyOtp(job.id)}
                        >
                          Verify
                        </button>
                      </div>
                    )}

                    {job.status === "Ongoing" && (
                      <button
                        className="btn-success"
                        onClick={() => handleCompleteJob(job)}
                      >
                        Mark Done
                      </button>
                    )}
                  </>
                )}

                {/* COMPLETED */}
                {activeTab === "completed" && (
                  <div className="completed-actions">
                    <button
                      className="btn-outline"
                      onClick={() => setMapJob(job)}
                    >
                      View Map
                    </button>

                    <div className="muted small">
                      Base: ₹{job?.service?.basePrice || 0}
                    </div>

                    {job.status === "Completed" && (
                      <button className="btn-primary small">
                        View Receipt
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* PAYMENT MODAL */}
      {paymentJob && (
        <div className="modal-overlay">
          <div className="modal-card payment-card">
            <div className="modal-top">
              <div className="modal-title">
                <h5>Complete Job & Payment</h5>
              </div>
              <button className="btn-close" onClick={() => setPaymentJob(null)}>
                ✕
              </button>
            </div>

            <p>
              <strong>Base Amount:</strong> ₹
              {paymentJob?.service?.basePrice || 0}
            </p>

            <input
              type="number"
              placeholder="Extra Amount"
              value={extraAmount}
              onChange={(e) => setExtraAmount(e.target.value)}
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="modal-actions-row">
              <button className="btn-success wide" onClick={handleSendPaymentLink}>
                Send Payment Link
              </button>
              <button className="btn-outline" onClick={() => setPaymentJob(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAP MODAL */}
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
