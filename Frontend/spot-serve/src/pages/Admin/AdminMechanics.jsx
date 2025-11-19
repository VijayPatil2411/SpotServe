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

  useEffect(() => {
    fetchMechanics();
  }, []);

  // close modal on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowAddModal(false);
    };
    if (showAddModal) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showAddModal]);

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

  const handleDeleteMechanic = async (id, name) => {
    if (!window.confirm(`⚠️ Are you sure you want to remove ${name}?`)) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete mechanic");
      const data = await res.json();
      alert(`✅ ${data.message}`);
      fetchMechanics();
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Failed to delete mechanic");
    }
  };

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
        <h2 className="fw-bold text-dark page-title">👨‍🔧 Manage Mechanics</h2>
        <button className="btn btn-primary stylish-btn" onClick={() => setShowAddModal(true)}>
          ➕ Add Mechanic
        </button>
      </div>

      {loading && <p className="text-center text-muted">Loading mechanics...</p>}
      {!loading && mechanics.length === 0 && <p className="text-muted text-center">No mechanics found.</p>}

      <div className="row">
        {mechanics.map((mech) => (
          <div key={mech.id} className="col-md-4 mb-4">
            <div className="mechanic-card shadow-hover">
              <div className="card-header">
                <h5 className="fw-bold text-dark mb-1">{mech.name}</h5>
                <p className="text-muted small mb-2">{mech.email}</p>
              </div>

              <div className="card-body">
                <p className="m-0"><strong>📞 Phone:</strong> {mech.phone || "N/A"}</p>
                <p className="m-0"><strong>📍 Location:</strong> 
                  {mech.latitude && mech.longitude
                    ? `${mech.latitude.toFixed(3)}, ${mech.longitude.toFixed(3)}`
                    : "Not set"}
                </p>
              </div>

              <hr className="my-2" />

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="badge bg-success me-1">✅ {mech.completedJobs || 0}</span>
                  <span className="badge bg-warning text-dark">🔧 {mech.ongoingJobs || 0}</span>
                </div>
                <button
                  className="btn btn-danger btn-sm delete-btn"
                  onClick={() => handleDeleteMechanic(mech.id, mech.name)}
                >
                  🗑️ Remove
                </button>
              </div>

              <div className="mt-3 text-center mechanic-stats">
                <p className="m-0 small text-muted">
                  Completion Rate: <strong className="text-success">{getCompletionRate(mech)}</strong>
                </p>
                <p className="m-0 small text-muted">
                  ⭐ Rating: <span className="text-warning">{mech.rating ? mech.rating.toFixed(1) : "—"}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Add Mechanic Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card add-mechanic-card animate-modal" onClick={(e) => e.stopPropagation()}>
            
            <h4 className="fw-bold mb-3 text-center">➕ Add New Mechanic</h4>
            <form onSubmit={handleAddMechanic}>
              <input type="text" className="form-control mb-2" placeholder="Full Name"
                value={newMechanic.name}
                onChange={(e) => setNewMechanic({ ...newMechanic, name: e.target.value })} required />
              <input type="email" className="form-control mb-2" placeholder="Email"
                value={newMechanic.email}
                onChange={(e) => setNewMechanic({ ...newMechanic, email: e.target.value })} required />
              <input type="password" className="form-control mb-2" placeholder="Password"
                value={newMechanic.password}
                onChange={(e) => setNewMechanic({ ...newMechanic, password: e.target.value })} required />
              <input type="text" className="form-control mb-2" placeholder="Phone"
                value={newMechanic.phone}
                onChange={(e) => setNewMechanic({ ...newMechanic, phone: e.target.value })} />
              <div className="d-flex gap-2 mb-2">
                <input type="number" className="form-control" placeholder="Latitude"
                  value={newMechanic.latitude}
                  onChange={(e) => setNewMechanic({ ...newMechanic, latitude: e.target.value })} />
                <input type="number" className="form-control" placeholder="Longitude"
                  value={newMechanic.longitude}
                  onChange={(e) => setNewMechanic({ ...newMechanic, longitude: e.target.value })} />
              </div>

              <button type="button" className="btn btn-outline-info w-100 mb-2" onClick={detectLocation}>
                📍 Detect My Location
              </button>

              <button type="submit" className="btn btn-success w-100">Add Mechanic</button>
            </form>

            <div className="text-center mt-3">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMechanics;
