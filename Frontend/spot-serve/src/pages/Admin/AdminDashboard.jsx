import React, { useEffect, useState, useMemo } from "react";
import "./AdminDashboard.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchInPanel, setSearchInPanel] = useState("");
  const [panelView, setPanelView] = useState("list");
  const [fetchingPanel, setFetchingPanel] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadAllJobs();
    // eslint-disable-next-line
  }, []);

  // Try to find an array inside different shapes returned by backend
  const parseJobs = (d) => {
    if (!d) return [];
    if (Array.isArray(d)) return d;
    // common wrappers
    const keysToCheck = ["data", "jobs", "rows", "items", "result", "list"];
    for (const k of keysToCheck) {
      if (Array.isArray(d[k])) return d[k];
    }
    // sometimes the array is one of the values
    const arrays = Object.values(d).filter((v) => Array.isArray(v));
    if (arrays.length) return arrays[0];
    // not an array, maybe it's a numeric count or an object with counts
    return [];
  };

  const tryAltJobsEndpoints = async (token) => {
    // fallback attempts if dashboard jobs endpoint does not return a list
    const altPaths = ["/admin/jobs", "/jobs"];
    for (const p of altPaths) {
      try {
        const res = await fetch(`${API_BASE}${p}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) continue;
        const raw = await res.json();
        console.log(`🔁 Fallback ${p} response:`, raw);
        const parsed = parseJobs(raw);
        if (parsed && parsed.length) return parsed;
      } catch (e) {
        console.warn(`Fallback ${p} error`, e);
      }
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
      console.log("📌 /admin/dashboard/stats =>", data);
      setStats(data || {});
    } catch (err) {
      console.error("❌ stats error:", err);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const loadAllJobs = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // read raw regardless of ok, to inspect what backend gave
      const raw = await res.json().catch(() => null);
      console.log(
        "📌 /admin/dashboard/jobs raw =>",
        raw,
        "status:",
        res.status
      );

      let parsed = parseJobs(raw || {});
      if (
        (!parsed || parsed.length === 0) &&
        raw &&
        (raw.total || raw.count || raw.jobs === undefined)
      ) {
        // If dashboard returned counts only, try alternative endpoints
        console.log(
          "⚠️ dashboard/jobs did not provide list — trying fallback endpoints..."
        );
        parsed = await tryAltJobsEndpoints(token);
      }

      setAllJobs(parsed || []);
      console.log("✅ Parsed allJobs:", parsed?.length ?? 0);
    } catch (err) {
      console.warn("❌ loadAllJobs failed:", err);
      setAllJobs([]);
    }
  };

  // Get jobs by status from server; fallback to client filter if needed
  const fetchJobsByStatus = async (status) => {
    setSelectedStatus(status);
    setFetchingPanel(true);
    setPanelView("list");
    setPanelOpen(true);
    setSearchInPanel("");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_BASE}/admin/dashboard/jobs?status=${encodeURIComponent(status)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const raw = await res.json().catch(() => null);
      console.log(
        `📌 /admin/dashboard/jobs?status=${status} =>`,
        raw,
        "status:",
        res.status
      );

      let parsed = parseJobs(raw || []);
      if (
        (!parsed || parsed.length === 0) &&
        (!res.ok || parsed.length === 0)
      ) {
        // fallback to client-side filter of allJobs
        const filtered = allJobs.filter(
          (j) => (j.status || "").toUpperCase() === (status || "").toUpperCase()
        );
        console.log("⚠️ using client-side filtered jobs:", filtered.length);
        setJobs(filtered);
      } else {
        setJobs(parsed);
      }
    } catch (err) {
      console.error("❌ fetchJobsByStatus error:", err);
      const filtered = allJobs.filter(
        (j) => (j.status || "").toUpperCase() === (status || "").toUpperCase()
      );
      setJobs(filtered);
    } finally {
      setFetchingPanel(false);
    }
  };

  const openTotalPanel = async () => {
    setSelectedStatus("TOTAL");
    setPanelOpen(true);
    setPanelView("list");
    setSearchInPanel("");

    if (allJobs.length > 0) {
      setJobs(allJobs);
      console.log("📌 openTotalPanel using cached allJobs:", allJobs.length);
      return;
    }

    setFetchingPanel(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = await res.json().catch(() => null);
      console.log("📌 openTotalPanel raw =>", raw, "status:", res.status);

      let parsed = parseJobs(raw || []);
      if (!parsed || parsed.length === 0) {
        parsed = await tryAltJobsEndpoints(token);
      }

      setJobs(parsed || []);
      setAllJobs(parsed || []); // cache it
      console.log("✅ openTotalPanel parsed rows:", parsed?.length ?? 0);
    } catch (err) {
      console.error("❌ openTotalPanel error:", err);
      setJobs([]);
    } finally {
      setFetchingPanel(false);
    }
  };

  // search filter
  const filteredPanelJobs = useMemo(() => {
    const s = searchInPanel.trim().toLowerCase();
    if (!s) return jobs;
    return jobs.filter(
      (j) =>
        (j.serviceName || "").toLowerCase().includes(s) ||
        (j.customerName || "").toLowerCase().includes(s) ||
        (j.mechanicName || "").toLowerCase().includes(s) ||
        (j.location || "").toLowerCase().includes(s) ||
        (j.id || "").toString().includes(s) ||
        (j.status || "").toLowerCase().includes(s)
    );
  }, [jobs, searchInPanel]);

  const mechanicsSummary = useMemo(() => {
    const map = {};
    (allJobs || []).forEach((j) => {
      const name = j.mechanicName || "Unassigned";
      if (!map[name])
        map[name] = { name, count: 0, accepted: 0, ongoing: 0, completed: 0 };
      map[name].count++;
      const st = (j.status || "").toUpperCase();
      if (st === "ACCEPTED") map[name].accepted++;
      if (st === "ONGOING") map[name].ongoing++;
      if (st === "COMPLETED") map[name].completed++;
    });
    const arr = Object.values(map).sort((a, b) => b.count - a.count);
    console.log("📌 mechanicsSummary computed:", arr.length);
    return arr;
  }, [allJobs]);

  const niceDate = (d) => {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d || "-";
    }
  };

  if (loading) return <p className="text-center mt-5">Loading dashboard...</p>;

  const topMechanic = mechanicsSummary[0]
    ? `${mechanicsSummary[0].name} (${mechanicsSummary[0].count})`
    : "-";

  const cards = [
    {
      key: "TOTAL",
      title: "Total Requests",
      value: stats.total ?? 0,
      onClick: openTotalPanel,
      icon: "📦",
    },
    {
      key: "COMPLETED",
      title: "Completed",
      value: stats.completed ?? 0,
      onClick: () => fetchJobsByStatus("COMPLETED"),
      icon: "✅",
    },
    {
      key: "PENDING",
      title: "Pending",
      value: stats.pending ?? 0,
      onClick: () => fetchJobsByStatus("PENDING"),
      icon: "⏳",
    },
    {
      key: "ACCEPTED",
      title: "Accepted",
      value: stats.accepted ?? 0,
      onClick: () => fetchJobsByStatus("ACCEPTED"),
      icon: "🧰",
    },
    {
      key: "ONGOING",
      title: "Ongoing",
      value: stats.ongoing ?? 0,
      onClick: () => fetchJobsByStatus("ONGOING"),
      icon: "⚙️",
    },
    {
      key: "CANCELLED",
      title: "Cancelled",
      value: stats.cancelled ?? 0,
      onClick: () => fetchJobsByStatus("CANCELLED"),
      icon: "❌",
    },
    {
      key: "TOTAL_USERS",
      title: "Total Users",
      value: stats.totalUsers ?? stats.users ?? 0,
      onClick: () => {},
      icon: "👥",
    },
    {
      key: "TOTAL_MECHANICS",
      title: "Total Mechanics",
      value: stats.totalMechanics ?? mechanicsSummary.length ?? 0,
      onClick: () => fetchJobsByStatus("ACCEPTED"),
      icon: "🔧",
    },
    {
      key: "TOP_MECHANIC",
      title: "Top Mechanic",
      value: topMechanic,
      onClick: () => {
        setPanelView("mechanics");
        setPanelOpen(true);
      },
      icon: "⭐",
    },
  ];

  return (
    <div className="admin-dashboard container mt-4">
      <h2 className="fw-bold text-center mb-3">Admin Dashboard</h2>

      <div className="cards-row">
        {cards.map((c) => (
          <div
            key={c.key}
            className="card-tile"
            onClick={c.onClick}
            role="button"
          >
            <div className="tile-top">
              <div className="tile-icon">{c.icon}</div>
              <div className="tile-title">{c.title}</div>
            </div>
            <div className="tile-value">{c.value}</div>
            <div className="tile-action">
              View <span className="chev">›</span>
            </div>
          </div>
        ))}
      </div>

      <div className="summary-strip">
        <div>
          Total mechanics: <strong>{mechanicsSummary.length}</strong>
        </div>
        <div>
          Jobs tracked: <strong>{allJobs.length}</strong>
        </div>
        <div>
          Total users: <strong>{stats.totalUsers ?? stats.users ?? "-"}</strong>
        </div>
        <div>
          Last refresh: <strong>{new Date().toLocaleString()}</strong>
        </div>
      </div>

      {panelOpen && (
        <div className="panel-overlay" onClick={() => setPanelOpen(false)}>
          <div className="panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <h4>
                {selectedStatus === "TOTAL"
                  ? "All Requests"
                  : `${selectedStatus || ""} Jobs`}
              </h4>
              <div className="panel-controls">
                <input
                  className="panel-search"
                  placeholder="Search id / customer / service / mechanic / location / status..."
                  value={searchInPanel}
                  onChange={(e) => setSearchInPanel(e.target.value)}
                />
                <div className="view-tabs">
                  <button
                    className={`tab-btn ${
                      panelView === "list" ? "active" : ""
                    }`}
                    onClick={() => setPanelView("list")}
                  >
                    List
                  </button>
                  <button
                    className={`tab-btn ${
                      panelView === "mechanics" ? "active" : ""
                    }`}
                    onClick={() => setPanelView("mechanics")}
                  >
                    Mechanics
                  </button>
                </div>
                <button
                  className="close-btn"
                  onClick={() => setPanelOpen(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="panel-body">
              {fetchingPanel ? (
                <div className="panel-loading">Loading jobs...</div>
              ) : panelView === "list" ? (
                <div className="table-wrap">
                  <table className="table table-hover table-admin">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Service</th>
                        <th>Mechanic</th>
                        <th>Status</th>
                        <th>Location</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPanelJobs.length === 0 ? (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-center text-muted py-4"
                          >
                            No jobs found
                          </td>
                        </tr>
                      ) : (
                        filteredPanelJobs.map((job, idx) => (
                          <tr key={job.id || idx}>
                            <td>{idx + 1}</td>
                            <td>{job.id}</td>
                            <td>{job.customerName || "-"}</td>
                            <td>{job.serviceName || "-"}</td>
                            <td>{job.mechanicName || "Unassigned"}</td>
                            <td>
                              <span
                                className={`badge status-${(
                                  job.status || ""
                                ).toLowerCase()}`}
                              >
                                {job.status || "-"}
                              </span>
                            </td>
                            <td>{job.location || "-"}</td>
                            <td>{niceDate(job.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mechanics-wrap">
                  {mechanicsSummary.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      No mechanics data
                    </div>
                  ) : (
                    <table className="table table-admin mechanics-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Mechanic</th>
                          <th>Total Jobs</th>
                          <th>Accepted</th>
                          <th>Ongoing</th>
                          <th>Completed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mechanicsSummary.map((m, i) => (
                          <tr key={m.name}>
                            <td>{i + 1}</td>
                            <td>{m.name}</td>
                            <td>{m.count}</td>
                            <td>{m.accepted}</td>
                            <td>{m.ongoing}</td>
                            <td>{m.completed}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
