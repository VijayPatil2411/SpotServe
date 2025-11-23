import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./MyRequests.css";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Badge,
  Table,
} from "react-bootstrap";

import ReceiptModal from "../../components/ReceiptModal";  // ⭐ ADDED

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const [receipt, setReceipt] = useState(null); // ⭐ ADDED

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    const filtered = requests
      .filter((r) =>
        filterStatus === "ALL"
          ? true
          : (r.status || "").toUpperCase() === filterStatus
      )
      .filter((r) => {
        const s = searchTerm.toLowerCase();
        return (
          String(r.serviceName || "").toLowerCase().includes(s) ||
          String(r.vehicleId || "").toLowerCase().includes(s) ||
          String(r.location || "").toLowerCase().includes(s)
        );
      })
      .sort((a, b) =>
        sortBy === "recent"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      );

    setFilteredRequests(filtered);
  }, [requests, filterStatus, searchTerm, sortBy]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/customer/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    const confirmCancel = window.confirm("Cancel this request?");
    if (!confirmCancel) return;

    setCancelingId(id);
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/api/customer/jobs/${id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "CANCELLED", fading: true } : req
        )
      );

      setTimeout(() => {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, fading: false } : req
          )
        );
      }, 600);
    } catch (error) {
      console.error("Error cancelling request:", error);
      alert("Failed to cancel request.");
    } finally {
      setCancelingId(null);
    }
  };

  const fetchOtp = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/api/customer/jobs/${jobId}/otp`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.otp) {
        alert(`🔢 OTP: ${res.data.otp}`);
      } else {
        alert(res.data.message || "No OTP available yet.");
      }
    } catch (err) {
      alert("Error fetching OTP");
    }
  };

  const handlePayNow = (url) => {
    if (!url) {
      alert("No payment link found.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ⭐ ADDED — Fetch Receipt
  const viewReceipt = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/api/customer/jobs/${jobId}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReceipt(res.data);
    } catch (error) {
      alert("Unable to load receipt.");
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: "⏳",
      ACCEPTED: "✅",
      ONGOING: "🔄",
      COMPLETED: "🎉",
      PAYMENT_PENDING: "💳",
      CANCELLED: "❌",
    };
    return icons[status] || "📋";
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "warning",
      ACCEPTED: "primary",
      ONGOING: "info",
      COMPLETED: "success",
      PAYMENT_PENDING: "secondary",
      CANCELLED: "danger",
    };
    return colors[status] || "dark";
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: "Pending",
      ACCEPTED: "Accepted",
      Ongoing: "Ongoing",
      COMPLETED: "Completed",
      PAYMENT_PENDING: "Payment Pending",
      CANCELLED: "Cancelled",
    };
    return labels[status] || status;
  };

  const uniqueStatuses = [
    "ALL",
    ...new Set(requests.map((r) => (r.status || "").toUpperCase())),
  ];

  const stats = {
    total: requests.length,
    pending: requests.filter(
      (r) => (r.status || "").toUpperCase() === "PENDING"
    ).length,
    completed: requests.filter(
      (r) => (r.status || "").toUpperCase() === "COMPLETED"
    ).length,
    cancelled: requests.filter(
      (r) => (r.status || "").toUpperCase() === "CANCELLED"
    ).length,
  };

  return (
    <div className="my-requests-wrapper">
      <Container fluid className="py-4">
      
        {/* KPI Cards */}
        <div className="kpi-section mb-4">
          <Row className="g-2">
            <Col xs={6} sm={3} className="mb-2">
              <div className="kpi-card kpi-pending">
                <div className="kpi-icon">⏳</div>
                <div className="kpi-content">
                  <p className="kpi-label">Pending</p>
                  <h4 className="kpi-value">{stats.pending}</h4>
                </div>
              </div>
            </Col>

            <Col xs={6} sm={3} className="mb-2">
              <div className="kpi-card kpi-completed">
                <div className="kpi-icon">✅</div>
                <div className="kpi-content">
                  <p className="kpi-label">Completed</p>
                  <h4 className="kpi-value">{stats.completed}</h4>
                </div>
              </div>
            </Col>

            <Col xs={6} sm={3} className="mb-2">
              <div className="kpi-card kpi-cancelled">
                <div className="kpi-icon">❌</div>
                <div className="kpi-content">
                  <p className="kpi-label">Cancelled</p>
                  <h4 className="kpi-value">{stats.cancelled}</h4>
                </div>
              </div>
            </Col>

            <Col xs={6} sm={3} className="mb-2">
              <div className="kpi-card kpi-total">
                <div className="kpi-icon">📊</div>
                <div className="kpi-content">
                  <p className="kpi-label">Total</p>
                  <h4 className="kpi-value">{stats.total}</h4>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Title */}
        <div className="page-header mb-3">
          <h2 className="page-title">📋 My Requests</h2>
          <p className="page-subtitle">Track and manage your service requests</p>
        </div>

        {/* Filters */}
        <div className="filters-bar mb-3">
          <Row className="g-2">
            <Col md={4} xs={12}>
              <Form.Control
                type="text"
                placeholder="🔍 Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input compact"
                size="sm"
              />
            </Col>

            <Col md={4} xs={6}>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-input compact"
                size="sm"
              >
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s === "ALL" ? "📍 All Status" : s}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4} xs={6}>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-input compact"
                size="sm"
              >
                <option value="recent">🔀 Recent</option>
                <option value="oldest">🔀 Oldest</option>
              </Form.Select>
            </Col>
          </Row>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary mb-2" />
            <p className="text-muted small">Loading...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-message text-center py-4">
            <div className="empty-icon-small">📭</div>
            <p className="text-muted">No requests found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <div className="table-responsive">
              <Table hover size="sm" className="requests-table compact-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Service</th>
                    <th>Vehicle</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((req, index) => {
                    const status = (req.status || "").toUpperCase();

                    return (
                      <tr
                        key={req.id}
                        className={`${req.fading ? "fade-row" : ""} ${
                          status === "CANCELLED" ? "cancelled-row" : ""
                        }`}
                      >
                        <td>{index + 1}</td>
                        <td>{req.serviceName || "N/A"}</td>
                        <td>{req.vehicleId || "-"}</td>
                        <td>{req.location || "-"}</td>

                        <td>
                          <Badge bg={getStatusColor(status)}>
                            {getStatusIcon(status)} {getStatusLabel(status)}
                          </Badge>
                        </td>

                        <td>{new Date(req.createdAt).toLocaleDateString()}</td>

                        {/* ⭐ Updated Action Column */}
                        <td>
                          {status === "PENDING" ? (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleCancel(req.id)}
                              disabled={cancelingId === req.id}
                            >
                              ❌ Cancel
                            </Button>
                          ) : status === "ACCEPTED" ? (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => fetchOtp(req.id)}
                            >
                              🔢 View OTP
                            </Button>
                          ) : status === "PAYMENT_PENDING" &&
                            req.paymentUrl ? (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handlePayNow(req.paymentUrl)}
                            >
                              💳 Pay Now
                            </Button>
                          ) : status === "COMPLETED" ? (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => viewReceipt(req.id)}  // ⭐ ADDED
                            >
                              🧾 Receipt
                            </Button>
                          ) : (
                            <span>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {/* Footer */}
        {!loading && filteredRequests.length > 0 && (
          <div className="results-footer text-center mt-2">
            <small className="text-muted">
              Showing {filteredRequests.length} of {requests.length}
            </small>
          </div>
        )}
      </Container>

      {/* ⭐ Receipt Modal */}
      {receipt && (
        <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
      )}
    </div>
  );
};

export default MyRequests;
