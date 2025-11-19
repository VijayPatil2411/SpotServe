import React, { useEffect, useState, useCallback } from "react";
import "./MechanicDashboard.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api/customer/jobs";
const PAYMENT_API = process.env.REACT_APP_API_PAYMENT || "http://localhost:8080/api/payments";

/* Map modal stays same behaviour but prettier header */
const MapModal = ({ show, onClose, lat, lng }) => {
  if (!show) return null;
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const embedUrl = lat && lng
    ? `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=15&maptype=roadmap`
    : null;

  return (
    <div className="modal-overlay">
      <div className="modal-card map-card">
        <div className="modal-top">
          <div className="modal-title">
            <svg className="icon-sm" viewBox="0 0 24 24"><path d="M12 2C8 2 5 5.2 5 9.1C5 14.2 12 22 12 22s7-7.8 7-12.9C19 5.2 16 2 12 2zM12 11.5A2.4 2.4 0 1 1 12 6.7a2.4 2.4 0 0 1 0 4.8z" /></svg>
            <h5>Pickup Location</h5>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="close">✕</button>
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
          <p className="text-muted center">No location data available for this job.</p>
        )}
      </div>
    </div>
  );
};

const MechanicDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("available"); // available | accepted | completed
  const [mapJob, setMapJob] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [paymentJob, setPaymentJob] = useState(null);
  const [extraAmount, setExtraAmount] = useState("");
  const [description, setDescription] = useState("");

  // fetchJobs: robust — uses available or accepted endpoints when possible.
  // For "completed" tab we combine endpoints and filter client-side so completed always shows.
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      if (activeTab === "available") {
        const res = await fetch(`${API_BASE}/available`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setJobs(data || []);
      } else if (activeTab === "accepted") {
        const res = await fetch(`${API_BASE}/accepted`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setJobs(data || []);
      } else {
        // Completed: try to fetch accepted + available and then filter for completed statuses
        const [accRes, availRes] = await Promise.allSettled([
          fetch(`${API_BASE}/accepted`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/available`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        let list = [];
        if (accRes.status === "fulfilled" && accRes.value.ok) {
          const dd = await accRes.value.json().catch(() => []);
          list = list.concat(dd || []);
        }
        if (availRes.status === "fulfilled" && availRes.value.ok) {
          const dd = await availRes.value.json().catch(() => []);
          list = list.concat(dd || []);
        }

        // normalize and filter for completed-like statuses
        const completedList = (list || []).filter(j => {
          const st = (j?.status || "").toString().toLowerCase();
          return st === "completed" || st === "payment_pending" || st === "done" || st === "closed";
        });

        setJobs(completedList);
      }
    } catch (err) {
      console.error("fetchJobs error", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // keep functional behaviour exactly same — accept, start, verify OTP, payment link
  const handleAccept = async (jobId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/${jobId}/accept`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      const text = await res.text().catch(() => "");
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
      const res = await fetch(`${API_BASE}/${jobId}/start`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
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
    if (!otpInput.trim()) {
      alert("Please enter OTP before verifying.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/${jobId}/verify-otp?otp=${otpInput}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
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

  const handleCompleteJob = (job) => {
    // unchanged: opens payment modal
    setPaymentJob(job);
    setExtraAmount("");
    setDescription("");
  };

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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  // helper for nicer status labels & color class
  const statusMeta = (s) => {
    const st = (s || "").toString().toLowerCase();
    if (st === "pending") return { label: "Pending", cls: "s-warn" };
    if (st === "accepted") return { label: "Accepted", cls: "s-primary" };
    if (st === "ongoing") return { label: "Ongoing", cls: "s-info" };
    if (st === "payment_pending" || st === "payment_pending".toLowerCase()) return { label: "Awaiting Payment", cls: "s-muted" };
    if (st === "completed" || st === "done" || st === "closed") return { label: "Completed", cls: "s-success" };
    return { label: s || "Unknown", cls: "s-dark" };
  };

  return (
    <div className="mechanic-dashboard container">
      <header className="top-row">
        <div>
          <h2 className="title">🔧 Mechanic Dashboard</h2>
          <p className="sub">Quick view of jobs — accept, start, verify OTP, and complete with payment link.</p>
        </div>
        <div className="refresh-area">
          <button className="icon-btn" onClick={fetchJobs} title="Refresh jobs">
            <svg className="icon" viewBox="0 0 24 24"><path d="M12 6V3L8 7l4 4V8c2.8 0 5 2.2 5 5a5 5 0 1 1-5-5z"/></svg>
          </button>
        </div>
      </header>

      <nav className="tabs">
        <button className={`tab ${activeTab === "available" ? "active" : ""}`} onClick={() => setActiveTab("available")}>
          <svg className="tab-icon" viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm4 0h14v-2H7v2zM3 17h12v-2H3v2zM3 9h18V7H3v2z"/></svg>
          Available
        </button>

        <button className={`tab ${activeTab === "accepted" ? "active" : ""}`} onClick={() => setActiveTab("accepted")}>
          <svg className="tab-icon" viewBox="0 0 24 24"><path d="M12 2L3 7v7c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V7l-9-5z"/></svg>
          Accepted
        </button>

        <button className={`tab ${activeTab === "completed" ? "active" : ""}`} onClick={() => setActiveTab("completed")}>
          <svg className="tab-icon" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12 3.4 13.4 9 19l12-12L19.6 5.4z"/></svg>
          Completed
        </button>
      </nav>

      {loading && <div className="loader">Loading jobs...</div>}
      {!loading && jobs.length === 0 && <div className="empty">No jobs found for this tab.</div>}

      <div className="grid">
        {jobs.map((job) => {
          const meta = statusMeta(job.status);
          return (
            <article key={job.id} className="card">
              <div className="card-head">
                <div className="head-left">
                  <div className="service-icon">
                    {/* small animated gear icon */}
                    <svg className="gear" viewBox="0 0 24 24">
                      <path d="M19.14 12.936a7.003 7.003 0 0 0 0-1.872l2.036-1.58a.5.5 0 0 0 .12-.64l-1.93-3.34a.5.5 0 0 0-.6-.22l-2.396.96a6.992 6.992 0 0 0-1.62-.94L14.9 2.3a.5.5 0 0 0-.5-.3h-3.8a.5.5 0 0 0-.5.3l-.36 2.04c-.57.22-1.1.5-1.62.94l-2.4-.96a.5.5 0 0 0-.6.22L2.7 8.85a.5.5 0 0 0 .12.64l2.04 1.58c-.05.31-.08.62-.08.94s.03.63.08.94L2.82 14.6a.5.5 0 0 0-.12.64l1.93 3.34c.15.26.44.37.7.28l2.4-.96c.5.44 1.05.8 1.62.94l.36 2.04a.5.5 0 0 0 .5.3h3.8a.5.5 0 0 0 .5-.3l.36-2.04c.57-.22 1.1-.5 1.62-.94l2.4.96c.27.09.56-.02.7-.28l1.93-3.34a.5.5 0 0 0-.12-.64l-2.04-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="service-name">{job.serviceName || `Service #${job.serviceId}`}</h4>
                    <div className="muted small">{job.location || "Location unknown"}</div>
                  </div>
                </div>

                <div className="head-right">
                  <span className={`status ${meta.cls}`}>{meta.label}</span>
                </div>
              </div>

              <p className="desc">{job.description || "No description provided."}</p>

              <div className="card-actions">
                {/* available -> Accept */}
                {activeTab === "available" && job.status === "Pending" && (
                  <button className="btn-primary" onClick={() => handleAccept(job.id)}>
                    <svg className="btn-icon" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12 3.4 13.4 9 19l12-12L19.6 5.4z"/></svg>
                    Accept
                  </button>
                )}

                {/* accepted tab: start, map, verify OTP, mark done */}
                {activeTab === "accepted" && (
                  <>
                    {job.status === "Accepted" && !job.otpCode && (
                      <button className="btn-warning" onClick={() => handleStartJob(job.id)}>
                        <svg className="btn-icon" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5L12 2z"/><path d="M2 17l10 5 10-5"/></svg>
                        Start Job
                      </button>
                    )}

                    <button className="btn-outline" onClick={() => setMapJob(job)}>
                      <svg className="btn-icon" viewBox="0 0 24 24"><path d="M12 2C8 2 5 5.2 5 9.1C5 14.2 12 22 12 22s7-7.8 7-12.9C19 5.2 16 2 12 2zM12 11.5A2.4 2.4 0 1 1 12 6.7a2.4 2.4 0 0 1 0 4.8z" /></svg>
                      Map
                    </button>

                    {job.otpCode && (
                      <div className="otp-inline">
                        <input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="Enter OTP" />
                        <button className="btn-primary small" onClick={() => handleVerifyOtp(job.id)}>Verify</button>
                      </div>
                    )}

                    {job.status === "Ongoing" && (
                      <button className="btn-success" onClick={() => handleCompleteJob(job)}>
                        <svg className="btn-icon" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12 3.4 13.4 9 19l12-12L19.6 5.4z"/></svg>
                        Mark Done
                      </button>
                    )}
                  </>
                )}

                {/* completed tab: simple view-only buttons */}
                {activeTab === "completed" && (
                  <div className="completed-actions">
                    <button className="btn-outline" onClick={() => setMapJob(job)}>View Map</button>
                    <div className="muted small">Base: ₹{job.baseAmount || 500}</div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Map Modal */}
      <MapModal
        show={!!mapJob}
        onClose={() => setMapJob(null)}
        lat={mapJob?.pickupLat}
        lng={mapJob?.pickupLng}
      />

      {/* Payment Modal (unchanged functionally) */}
      {paymentJob && (
        <div className="modal-overlay">
          <div className="modal-card payment-card">
            <div className="modal-top">
              <div className="modal-title">
                <svg className="icon-sm" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V5l-9-4z"/></svg>
                <h5>Complete Job & Send Payment</h5>
              </div>
              <button className="btn-close" onClick={() => setPaymentJob(null)}>✕</button>
            </div>

            <p><strong>Base Amount:</strong> ₹{paymentJob.baseAmount || 500}</p>

            <input type="number" placeholder="Extra Amount (optional)" value={extraAmount} onChange={(e) => setExtraAmount(e.target.value)} />
            <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />

            <div className="modal-actions-row">
              <button className="btn-success wide" onClick={handleSendPaymentLink}>Send Payment Link</button>
              <button className="btn-outline" onClick={() => setPaymentJob(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MechanicDashboard;
