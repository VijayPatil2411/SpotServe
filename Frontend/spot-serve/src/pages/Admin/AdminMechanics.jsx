import React, { useEffect, useState } from "react";
import "./AdminMechanics.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api/admin/mechanics";

const AdminMechanics = () => {
  const [mechanics, setMechanics] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMechanic, setNewMechanic] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState(null);

  useEffect(() => {
    fetchMechanics();
  }, []);

  const fetchMechanics = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch mechanics");
      const data = await res.json();
      setMechanics(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto-detect location
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setNewMechanic({
            ...newMechanic,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          alert("📍 Location detected successfully!");
        },
        () => alert("Could not get location.")
      );
    } else {
      alert("Geolocation not supported by browser.");
    }
  };

  // ✅ Add Mechanic
  const handleAddMechanic = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMechanic),
      });
      if (!res.ok) throw new Error("Failed to add mechanic");
      alert("✅ Mechanic added successfully!");
      setShowAddModal(false);
      setNewMechanic({ name: "", email: "", password: "", phone: "", latitude: "", longitude: "" });
      fetchMechanics();
    } catch (err) {
      console.error("Error:", err);
      alert("Error adding mechanic");
    }
  };

  const getCompletionRate = (mech) => {
    const total = mech.totalJobs || mech.completedJobs + mech.ongoingJobs;
    if (total === 0) return "0%";
    return `${Math.round((mech.completedJobs / total) * 100)}%`;
  };

  return (
    <div className="admin-mechanics container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark page-title">
          👨‍🔧 Manage Mechanics
        </h2>
        <button className="btn btn-primary stylish-btn" onClick={() => setShowAddModal(true)}>
          ➕ Add Mechanic
        </button>
      </div>

      {loading && <p className="text-center text-muted">Loading mechanics...</p>}
      {!loading && mechanics.length === 0 && (
        <p className="text-muted text-center">No mechanics found.</p>
      )}

      <div className="row">
        {mechanics.map((mech) => (
          <div key={mech.id} className="col-md-4 mb-4" onClick={() => setSelectedMechanic(mech)}>
            <div className="mechanic-card shadow-hover">
              <div className="card-header">
                <h5 className="fw-bold text-dark mb-1">{mech.name}</h5>
                <p className="text-muted small mb-2">{mech.email}</p>
              </div>

              <div className="card-body">
                <p className="m-0">
                  <strong>📞 Phone:</strong> {mech.phone || "N/A"}
                </p>
                <p className="m-0">
                  <strong>📍 Location:</strong>{" "}
                  {mech.latitude && mech.longitude
                    ? `${mech.latitude.toFixed(3)}, ${mech.longitude.toFixed(3)}`
                    : "Not set"}
                </p>
              </div>

              <hr className="my-2" />

              <div className="d-flex justify-content-between">
                <span className="badge bg-success">
                  ✅ Completed: {mech.completedJobs || 0}
                </span>
                <span className="badge bg-warning text-dark">
                  🔧 Ongoing: {mech.ongoingJobs || 0}
                </span>
              </div>

              <div className="mt-3 text-center mechanic-stats">
                <p className="m-0 small text-muted">
                  Completion Rate:{" "}
                  <strong className="text-success">{getCompletionRate(mech)}</strong>
                </p>
                <p className="m-0 small text-muted">
                  ⭐ Rating: <span className="text-warning">{mech.rating ? mech.rating.toFixed(1) : "—"}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Mechanic Detail Modal */}
      {selectedMechanic && (
        <div className="modal-overlay">
          <div className="modal-card mechanic-detail-card animate-modal">
            <h4 className="fw-bold mb-3 text-center">{selectedMechanic.name}</h4>
            <p><strong>Email:</strong> {selectedMechanic.email}</p>
            <p><strong>Phone:</strong> {selectedMechanic.phone}</p>
            <p><strong>Status:</strong> Active</p>
            <p>
              <strong>Jobs:</strong> {selectedMechanic.completedJobs} completed,{" "}
              {selectedMechanic.ongoingJobs} ongoing
            </p>
            <p>
              <strong>Location:</strong>{" "}
              {selectedMechanic.latitude && selectedMechanic.longitude
                ? `${selectedMechanic.latitude}, ${selectedMechanic.longitude}`
                : "Not set"}
            </p>
            <div className="text-center mt-3">
              <button className="btn btn-secondary" onClick={() => setSelectedMechanic(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Add Mechanic Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card add-mechanic-card animate-modal">
            <h4 className="fw-bold mb-3 text-center">➕ Add New Mechanic</h4>
            <form onSubmit={handleAddMechanic}>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Full Name"
                value={newMechanic.name}
                onChange={(e) => setNewMechanic({ ...newMechanic, name: e.target.value })}
                required
              />
              <input
                type="email"
                className="form-control mb-2"
                placeholder="Email"
                value={newMechanic.email}
                onChange={(e) => setNewMechanic({ ...newMechanic, email: e.target.value })}
                required
              />
              <input
                type="password"
                className="form-control mb-2"
                placeholder="Password"
                value={newMechanic.password}
                onChange={(e) => setNewMechanic({ ...newMechanic, password: e.target.value })}
                required
              />
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Phone"
                value={newMechanic.phone}
                onChange={(e) => setNewMechanic({ ...newMechanic, phone: e.target.value })}
              />

              <div className="d-flex gap-2 mb-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Latitude"
                  value={newMechanic.latitude}
                  onChange={(e) => setNewMechanic({ ...newMechanic, latitude: e.target.value })}
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Longitude"
                  value={newMechanic.longitude}
                  onChange={(e) => setNewMechanic({ ...newMechanic, longitude: e.target.value })}
                />
              </div>

              <button
                type="button"
                className="btn btn-outline-info w-100 mb-2"
                onClick={detectLocation}
              >
                📍 Detect My Location
              </button>

              <button type="submit" className="btn btn-success w-100">
                Add Mechanic
              </button>
            </form>

            <div className="text-center mt-3">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMechanics;
