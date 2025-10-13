import React, { useState } from "react";
import "./EmergencyHelp.css";

const EmergencyHelp = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    vehicle: "",
    problem: "",
    location: "",
  });

  const [locationStatus, setLocationStatus] = useState("");

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("❌ Geolocation not supported.");
      return;
    }
    setLocationStatus("📍 Detecting location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `Lat: ${position.coords.latitude.toFixed(
          5
        )}, Lng: ${position.coords.longitude.toFixed(5)}`;
        setFormData((prev) => ({ ...prev, location: coords }));
        setLocationStatus("✅ Location detected!");
      },
      () => setLocationStatus("⚠️ Unable to detect location.")
    );
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call backend POST /jobs for guest request
    console.log("Emergency request:", formData);
    alert("🚨 Help request submitted successfully!");
    // reset except keep last detected location
    setFormData({
      name: "",
      mobile: "",
      vehicle: "",
      problem: "",
      location: formData.location,
    });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="eh-overlay" role="dialog" aria-modal="true">
      <div className="eh-modal shadow">
        <button className="eh-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <h3 className="eh-title">Emergency Vehicle Help</h3>
        <p className="eh-status">{locationStatus}</p>

        <form onSubmit={handleSubmit} className="eh-form">
          <div className="mb-3">
            <label className="form-label">Full Name (optional)</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              placeholder="Your name"
              type="text"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Mobile Number *</label>
            <input
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="form-control"
              placeholder="10-digit mobile"
              type="tel"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Vehicle Make / Model / Plate</label>
            <input
              name="vehicle"
              value={formData.vehicle}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., Tata Nexon, MH12AB1234"
              type="text"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Problem Description *</label>
            <textarea
              name="problem"
              value={formData.problem}
              onChange={handleChange}
              className="form-control"
              rows="3"
              placeholder="Briefly describe the issue"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Current Location</label>
            <div className="d-flex gap-2">
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-control"
                placeholder="Lat, Lng or address"
                type="text"
              />
              <button
                type="button"
                className="btn btn-outline-primary eh-detect"
                onClick={detectLocation}
              >
                📍 Detect
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-danger w-100 mt-2">
            🚨 Get Help Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmergencyHelp;
