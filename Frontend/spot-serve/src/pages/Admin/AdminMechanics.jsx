import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminMechanics.css";

const AdminMechanics = () => {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    shopName: "",
    address: "",
  });

  const [adding, setAdding] = useState(false);

  // ✅ Fetch mechanics from backend
  const fetchMechanics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/admin/mechanics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMechanics(response.data || []);
    } catch (err) {
      console.error("Error loading mechanics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Add new mechanic
  const handleAddMechanic = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.post("/api/admin/mechanics", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        alert("✅ Mechanic added successfully!");
        setShowAddModal(false);
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          shopName: "",
          address: "",
        });
        fetchMechanics();
      }
    } catch (err) {
      console.error("Error adding mechanic:", err);
      alert(err.response?.data?.error || "Failed to add mechanic");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="admin-mechanics-container container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Manage Mechanics</h2>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          ➕ Add Mechanic
        </button>
      </div>

      {loading ? (
        <p className="text-center text-muted">Loading mechanics...</p>
      ) : mechanics.length === 0 ? (
        <p className="text-center text-muted">No mechanics found.</p>
      ) : (
        <div className="row">
          {mechanics.map((mech) => (
            <div key={mech.id} className="col-md-4 mb-4">
              <div className="mechanic-card shadow-sm p-3 rounded">
                <h5 className="fw-bold mb-2 text-primary">{mech.name}</h5>
                <p className="small text-muted mb-1">{mech.shopName || "N/A"}</p>
                <p className="mb-1"><strong>Email:</strong> {mech.email}</p>
                <p className="mb-1"><strong>Phone:</strong> {mech.phone}</p>
                <p className="mb-1"><strong>Address:</strong> {mech.address}</p>
                <div className="d-flex justify-content-between mt-2">
                  <span className="badge bg-success">
                    ✅ Completed: {mech.completedJobs}
                  </span>
                  <span className="badge bg-info text-dark">
                    ⚙️ Ongoing: {mech.ongoingJobs}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Mechanic Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h4 className="fw-bold mb-3 text-center">Add New Mechanic</h4>
            <form onSubmit={handleAddMechanic}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  name="shopName"
                  className="form-control"
                  placeholder="Shop Name"
                  value={formData.shopName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <textarea
                  name="address"
                  className="form-control"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  required
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={adding}>
                  {adding ? "Adding..." : "Add Mechanic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMechanics;
