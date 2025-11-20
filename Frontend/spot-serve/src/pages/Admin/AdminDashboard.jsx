import React, { useEffect, useState, useMemo } from "react";
import "./AdminDashboard.css";
import api from "../../services/api";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

const AdminDashboard = () => {
  /** STATE */
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // panelView values: "list" | "mechanics" | "users"
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelView, setPanelView] = useState("list");
  const [searchInPanel, setSearchInPanel] = useState("");
  const [fetchingPanel, setFetchingPanel] = useState(false);

  /* SERVICES */
  const [services, setServices] = useState([]);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({ id: null, name: "", basePrice: "" });
  const [isEditing, setIsEditing] = useState(false);

  /* USERS / MECHANICS */
  const [usersList, setUsersList] = useState([]);
  const [mechanicsList, setMechanicsList] = useState([]);

  /* TOAST */
  const [toast, setToast] = useState({ show: false, type: "success", msg: "" });
  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 2800);
  };

  /** INITIAL LOAD */
  useEffect(() => {
    loadDashboard();
    loadAllJobs();
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** HELPERS */
  const parseJobs = (d) => {
    if (!d) return [];
    if (Array.isArray(d)) return d;
    const keys = ["data", "jobs", "rows", "items", "result", "list"];
    for (const k of keys) if (Array.isArray(d[k])) return d[k];
    const arr = Object.values(d).filter((v) => Array.isArray(v));
    return arr.length ? arr[0] : [];
  };

  /** Load all jobs (used for Total and local summaries) */
  const loadAllJobs = async () => {
    const token = localStorage.getItem("token");
    try {
      const statuses = ["Completed", "Pending", "Accepted", "Ongoing", "Cancelled"];
      let combined = [];
      for (let st of statuses) {
        const res = await fetch(
          `${API_BASE}/admin/dashboard/jobs?status=${encodeURIComponent(st)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const raw = await res.json().catch(() => null);
        const parsed = parseJobs(raw || []);
        combined = [...combined, ...parsed];
      }
      setAllJobs(combined);
    } catch (err) {
      console.error("loadAllJobs error:", err);
      setAllJobs([]);
    }
  };

  /** Dashboard stats */
  const loadDashboard = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

          console.log("📊 Stats Response:", data);
    console.log("👥 Total Users:", data.totalUsers);
    console.log("🔧 Total Mechanics:", data.totalMechanics);
    
      setStats(data || {});
    } catch {
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  /** Fetch jobs for a single status and open jobs panel only */
  const fetchJobsByStatus = async (status) => {
    setSelectedStatus(status);
    setFetchingPanel(true);
    setPanelView("list"); // show jobs list only
    setPanelOpen(true);
    setSearchInPanel("");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_BASE}/admin/dashboard/jobs?status=${encodeURIComponent(status)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const raw = await res.json();
      const parsed = parseJobs(raw);
      if (parsed.length) setJobs(parsed);
      else setJobs(allJobs.filter((j) => (j.status || "").toUpperCase() === status));
    } catch {
      setJobs(allJobs.filter((j) => (j.status || "").toUpperCase() === status));
    } finally {
      setFetchingPanel(false);
    }
  };

  /** Open total panel — show only jobs (all) */
  const openTotalPanel = () => {
    setSelectedStatus("TOTAL");
    setPanelOpen(true);
    setPanelView("list");
    setSearchInPanel("");
    setJobs(allJobs);
  };

  /** SERVICES */
  const loadServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data || []);
    } catch {
      setServices([]);
    }
  };

  const openAddService = () => {
    setServiceForm({ id: null, name: "", basePrice: "" });
    setIsEditing(false);
    setServiceModalOpen(true);
  };

  const openEditService = (service) => {
    setServiceForm({
      id: service.id,
      name: service.name,
      basePrice: service.basePrice,
    });
    setIsEditing(true);
    setServiceModalOpen(true);
  };

  const handleSaveService = async () => {
    const token = localStorage.getItem("token");
    if (!serviceForm.name || !serviceForm.basePrice) {
      showToast("Fill all fields", "error");
      return;
    }
    try {
      if (isEditing) {
        await api.put(`/api/admin/services/${serviceForm.id}`, serviceForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("Service updated!");
      } else {
        await api.post("/api/admin/services", serviceForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("Service added!");
      }
      setServiceModalOpen(false);
      loadServices();
    } catch {
      showToast("Error saving", "error");
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/admin/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Service deleted");
      loadServices();
    } catch {
      showToast("Delete error", "error");
    }
  };

  /** USERS & MECHANICS */
  const loadUsers = async () => {
    setFetchingPanel(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setUsersList(Array.isArray(data) ? data : []);
    } catch {
      setUsersList([]);
    } finally {
      setFetchingPanel(false);
    }
    setPanelView("users"); // show users only
    setPanelOpen(true);
  };

  const loadMechanics = async () => {
    setFetchingPanel(true);
    try {
      const res = await fetch(`${API_BASE}/admin/mechanics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setMechanicsList(Array.isArray(data) ? data : []);
    } catch {
      setMechanicsList([]);
    } finally {
      setFetchingPanel(false);
    }
    setPanelView("mechanics"); // show mechanics only
    setPanelOpen(true);
  };

  /** Summary of jobs per mechanic (unchanged) */
  const mechanicsSummary = useMemo(() => {
    const map = {};
    allJobs.forEach((j) => {
      const name = j.mechanicName || "Unassigned";
      map[name] = map[name] || { name, count: 0, accepted: 0, ongoing: 0, completed: 0 };
      map[name].count++;
      const st = (j.status || "").toUpperCase();
      if (st === "ACCEPTED") map[name].accepted++;
      if (st === "ONGOING") map[name].ongoing++;
      if (st === "COMPLETED") map[name].completed++;
    });
    return Object.values(map);
  }, [allJobs]);

  const niceDate = (d) => (d ? new Date(d).toLocaleString() : "-");

  if (loading) return <p className="text-center mt-5">Loading dashboard...</p>;

  const topMechanic =
    mechanicsSummary[0] ? `${mechanicsSummary[0].name} (${mechanicsSummary[0].count})` : "-";

  const cards = [
    { key: "TOTAL", title: "Total Requests", value: stats.total ?? 0, icon: "📦", onClick: openTotalPanel },
    { key: "COMPLETED", title: "Completed", value: stats.completed ?? 0, icon: "✅", onClick: () => fetchJobsByStatus("COMPLETED") },
    { key: "PENDING", title: "Pending", value: stats.pending ?? 0, icon: "⏳", onClick: () => fetchJobsByStatus("PENDING") },
    { key: "ACCEPTED", title: "Accepted", value: stats.accepted ?? 0, icon: "🧰", onClick: () => fetchJobsByStatus("ACCEPTED") },
    { key: "ONGOING", title: "Ongoing", value: stats.ongoing ?? 0, icon: "⚙️", onClick: () => fetchJobsByStatus("ONGOING") },
    { key: "CANCELLED", title: "Cancelled", value: stats.cancelled ?? 0, icon: "❌", onClick: () => fetchJobsByStatus("CANCELLED") },

    {
      key: "MECHS",
      title: "Total Mechanics",
      value: stats.totalMechanics ?? mechanicsSummary.length ?? 0,
      icon: "🔧",
      onClick: () => loadMechanics(),
    },

    {
      key: "USERS",
      title: "Total Users",
      value: stats.totalUsers ?? usersList.length ?? "-",
      icon: "👥",
      onClick: () => loadUsers(),
    },

    {
      key: "TOP_MECH",
      title: "Top Mechanic",
      value: topMechanic,
      icon: "⭐",
      onClick: () => loadMechanics(),
    },
  ];

  /** RENDER */
  return (
    <div className="admin-dashboard container mt-4">
      {toast.show && <div className={`admin-toast toast-${toast.type}`}>{toast.msg}</div>}

      <h2 className="fw-bold text-center mb-3">Admin Dashboard</h2>

      {/* KPI cards */}
      <div className="cards-row">
        {cards.map((c) => (
          <div key={c.key} className="card-tile" onClick={c.onClick}>
            <div className="tile-top">
              <div className="tile-icon">{c.icon}</div>
              <div className="tile-title">{c.title}</div>
            </div>
            <div className="tile-value">{c.value}</div>
            <div className="tile-action">View <span className="chev">›</span></div>
          </div>
        ))}
      </div>

      {/* Summary strip */}
      <div className="summary-strip">
        <div>Total Mechanics: <strong>{stats.totalMechanics ?? mechanicsSummary.length}</strong></div>
        <div>Total Jobs: <strong>{stats.total ?? allJobs.length}</strong></div>
        {/* <div>Total Users: <strong>{stats.totalUsers ?? "-"}</strong></div> */}
        <div>Last Refresh: <strong>{new Date().toLocaleString()}</strong></div>
      </div>

      {/* SERVICES SECTION (unchanged) */}
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
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditService(s)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteService(s.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Service modal */}
      {serviceModalOpen && (
        <div className="modal-overlay" onClick={() => setServiceModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h5 className="fw-bold mb-3 text-center">
              {isEditing ? "Edit Service" : "Add Service"}
            </h5>

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

      {/* PANEL (Jobs / Mechanics / Users) */}
      {panelOpen && (
        <div className="panel-overlay" onClick={() => setPanelOpen(false)}>
          <div className="panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <h4>
                {panelView === "list" &&
                  (selectedStatus === "TOTAL" ? "All Requests" : `${selectedStatus} Jobs`)}
                {panelView === "mechanics" && "Mechanics"}
                {panelView === "users" && "Users"}
              </h4>

              <div className="panel-controls">
                {panelView === "list" && (
                  <input
                    className="panel-search"
                    placeholder="Search jobs…"
                    value={searchInPanel}
                    onChange={(e) => setSearchInPanel(e.target.value)}
                  />
                )}

                {/* Tabs removed on purpose — panel shows only the relevant data */}
                <button className="close-btn" onClick={() => setPanelOpen(false)}>✕</button>
              </div>
            </div>

            <div className="panel-body">
              {fetchingPanel ? (
                <div className="panel-loading">Loading…</div>
              ) : panelView === "list" ? (
                /* JOB TABLE — simplified: only job-specific columns (no separate user/mechanic tables here) */
                <table className="table table-hover table-admin">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>ID</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.length === 0 ? (
                      <tr><td colSpan="6" className="text-center text-muted">No jobs found</td></tr>
                    ) : (
                      jobs
                        .filter(job => {
                          // if search present, match against service name or status (simple)
                          if (!searchInPanel) return true;
                          const q = searchInPanel.toLowerCase();
                          return (
                            (job.serviceName || "").toLowerCase().includes(q) ||
                            (job.status || "").toLowerCase().includes(q) ||
                            (job.location || "").toLowerCase().includes(q)
                          );
                        })
                        .map((job, i) => (
                          <tr key={job.id}>
                            <td>{i + 1}</td>
                            <td>{job.id}</td>
                            <td>{job.serviceName}</td>
                            <td><span className={`badge status-${(job.status || "").toLowerCase()}`}>{job.status}</span></td>
                            <td>{job.location}</td>
                            <td>{niceDate(job.createdAt)}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              ) : panelView === "mechanics" ? (
                /* MECHANICS TABLE */
                <table className="table table-admin">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Shop</th>
                      <th>Total Jobs</th>
                      <th>Completed</th>
                      <th>Ongoing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mechanicsList.length === 0 ? (
                      <tr><td colSpan="8" className="text-center text-muted">No mechanics found</td></tr>
                    ) : (
                      mechanicsList.map((m, i) => (
                        <tr key={m.id}>
                          <td>{i + 1}</td>
                          <td>{m.name}</td>
                          <td>{m.email}</td>
                          <td>{m.phone}</td>
                          <td>{m.shopName || "-"}</td>
                          <td>{m.totalJobs}</td>
                          <td>{m.completedJobs}</td>
                          <td>{m.ongoingJobs}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                /* USERS TABLE */
                <table className="table table-admin">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.length === 0 ? (
                      <tr><td colSpan="6" className="text-center text-muted">No users found</td></tr>
                    ) : (
                      usersList.map((u, i) => (
                        <tr key={u.id}>
                          <td>{i + 1}</td>
                          <td>{u.id}</td>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.phone || "-"}</td>
                          <td>{niceDate(u.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
