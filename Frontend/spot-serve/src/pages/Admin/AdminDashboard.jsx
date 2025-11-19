import React, { useEffect, useState, useMemo } from "react";
import "./AdminDashboard.css";
import api from "../../services/api";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

const AdminDashboard = () => {
  /** ===========================
   *  STATE
   ============================= */
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelView, setPanelView] = useState("list");
  const [searchInPanel, setSearchInPanel] = useState("");
  const [fetchingPanel, setFetchingPanel] = useState(false);

  /** ===========================
   *  SERVICES STATE
   ============================= */
  const [services, setServices] = useState([]);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({ id: null, name: "", basePrice: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", msg: "" });

  /** ===========================
   *  TOAST FUNCTION
   ============================= */
  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 2800);
  };

  /** ===========================
   *  SERVICES FUNCTIONS (TOP — to avoid initialization error)
   ============================= */

  // Load all services
  const loadServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data || []);
    } catch (err) {
      console.error("Service load error:", err);
      setServices([]);
    }
  };

  // Open Add Service Modal
  const openAddService = () => {
    setServiceForm({ id: null, name: "", basePrice: "" });
    setIsEditing(false);
    setServiceModalOpen(true);
  };

  // Open Edit Service Modal
  const openEditService = (service) => {
    setServiceForm({
      id: service.id,
      name: service.name,
      basePrice: service.basePrice,
    });
    setIsEditing(true);
    setServiceModalOpen(true);
  };

  // Save or Update Service
  const handleSaveService = async () => {
    const token = localStorage.getItem("token");
    if (!serviceForm.name.trim() || !serviceForm.basePrice) {
      showToast("Please fill all fields", "error");
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/api/admin/services/${serviceForm.id}`, serviceForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("Service updated successfully!");
      } else {
        await api.post("/api/admin/services", serviceForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("Service added successfully!");
      }

      setServiceModalOpen(false);
      loadServices();
    } catch (err) {
      console.error("Save service error:", err);
      showToast("Error while saving service", "error");
    }
  };

  // Delete Service
  const handleDeleteService = async (id) => {
    if (!window.confirm("Are you sure? This will permanently remove the service.")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/admin/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Service deleted successfully!");
      loadServices();
    } catch (err) {
      console.error("Delete service error:", err);
      showToast("Error deleting service", "error");
    }
  };

  /** ===========================
   *  EXISTING JOB FUNCTIONS (unchanged)
   ============================= */

  const parseJobs = (d) => {
    if (!d) return [];
    if (Array.isArray(d)) return d;
    const keys = ["data", "jobs", "rows", "items", "result", "list"];
    for (const k of keys) if (Array.isArray(d[k])) return d[k];
    return [];
  };

  const tryAltJobsEndpoints = async (token) => {
    const alt = ["/admin/jobs", "/jobs"];
    for (const p of alt) {
      try {
        const res = await fetch(`${API_BASE}${p}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = await res.json();
        const parsed = parseJobs(raw);
        if (parsed.length) return parsed;
      } catch {}
    }
    return [];
  };

  const loadDashboard = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(data || {});
    } catch {
      setStats({});
    }
    setLoading(false);
  };

  const loadAllJobs = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = await res.json();
      let parsed = parseJobs(raw);
      if (!parsed.length) parsed = await tryAltJobsEndpoints(token);
      setAllJobs(parsed);
    } catch {
      setAllJobs([]);
    }
  };

  const fetchJobsByStatus = async (status) => {
    setSelectedStatus(status);
    setPanelOpen(true);
    setPanelView("list");
    setSearchInPanel("");
    setFetchingPanel(true);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard/jobs?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = await res.json();
      let parsed = parseJobs(raw);
      if (!parsed.length) {
        parsed = allJobs.filter((j) => j.status?.toUpperCase() === status);
      }
      setJobs(parsed);
    } catch {
      setJobs([]);
    }

    setFetchingPanel(false);
  };

  const openTotalPanel = () => {
    setSelectedStatus("TOTAL");
    setPanelOpen(true);
    setPanelView("list");
    setSearchInPanel("");
    setJobs(allJobs);
  };

  /** ===========================
   *  useEffect (AFTER all functions!)
   ============================= */
  useEffect(() => {
    loadDashboard();
    loadAllJobs();
    loadServices(); // NOW safe
  }, []);

  /** ===========================
   *  RENDER
   ============================= */

  const mechanicsSummary = useMemo(() => {
    const map = {};
    allJobs.forEach((j) => {
      const name = j.mechanicName || "Unassigned";
      map[name] = map[name] || { name, count: 0, accepted: 0, ongoing: 0, completed: 0 };
      map[name].count++;
    });
    return Object.values(map);
  }, [allJobs]);

  const cards = [
    { key: "TOTAL", title: "Total Requests", value: stats.total ?? 0, icon: "📦", onClick: openTotalPanel },
    { key: "COMPLETED", title: "Completed", value: stats.completed ?? 0, icon: "✅", onClick: () => fetchJobsByStatus("COMPLETED") },
    { key: "PENDING", title: "Pending", value: stats.pending ?? 0, icon: "⏳", onClick: () => fetchJobsByStatus("PENDING") },
    { key: "ACCEPTED", title: "Accepted", value: stats.accepted ?? 0, icon: "🧰", onClick: () => fetchJobsByStatus("ACCEPTED") },
    { key: "ONGOING", title: "Ongoing", value: stats.ongoing ?? 0, icon: "⚙️", onClick: () => fetchJobsByStatus("ONGOING") },
    { key: "CANCELLED", title: "Cancelled", value: stats.cancelled ?? 0, icon: "❌", onClick: () => fetchJobsByStatus("CANCELLED") },
    { key: "USERS", title: "Total Users", value: stats.totalUsers ?? 0, icon: "👥" },
    { key: "MECHS", title: "Total Mechanics", value: stats.totalMechanics ?? 0, icon: "🔧" },
  ];

  return (
    <div className="admin-dashboard container mt-4">
      {toast.show && <div className={`admin-toast toast-${toast.type}`}>{toast.msg}</div>}

      <h2 className="fw-bold text-center mb-3">Admin Dashboard</h2>

      {/* KPI Cards */}
      <div className="cards-row">
        {cards.map((c) => (
          <div key={c.key} className="card-tile" onClick={c.onClick}>
            <div className="tile-top">
              <div className="tile-icon">{c.icon}</div>
              <div className="tile-title">{c.title}</div>
            </div>
            <div className="tile-value">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Summary strip */}
      <div className="summary-strip">
        <div>Total Mechanics: {mechanicsSummary.length}</div>
        <div>Total Jobs: {allJobs.length}</div>
        <div>Total Users: {stats.totalUsers}</div>
      </div>

      {/* ================================
          SERVICES SECTION (NEW)
      ================================= */}
      <div className="services-section mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold">Services</h4>
          <button className="btn btn-primary" onClick={openAddService}>+ Add Service</button>
        </div>

        <table className="table table-hover table-admin">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Base Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted">No services found</td></tr>
            ) : (
              services.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td>{s.name}</td>
                  <td>₹{s.basePrice}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditService(s)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteService(s.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========================
           SERVICE MODAL
      ========================= */}
      {serviceModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h5 className="fw-bold mb-3 text-center">{isEditing ? "Edit Service" : "Add Service"}</h5>

            <input
              className="form-control mb-3"
              placeholder="Service Name"
              value={serviceForm.name}
              onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
            />

            <input
              type="number"
              className="form-control mb-3"
              placeholder="Base Price"
              value={serviceForm.basePrice}
              onChange={(e) => setServiceForm({ ...serviceForm, basePrice: e.target.value })}
            />

            <button className="btn btn-success w-100 mb-2" onClick={handleSaveService}>
              {isEditing ? "Update Service" : "Add Service"}
            </button>

            <button className="btn btn-secondary w-100" onClick={() => setServiceModalOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
