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

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");

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
          String(r.serviceName || "")
            .toLowerCase()
            .includes(s) ||
          String(r.vehicleId || "")
            .toLowerCase()
            .includes(s) ||
          String(r.location || "")
            .toLowerCase()
            .includes(s)
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
          prev.map((req) => (req.id === id ? { ...req, fading: false } : req))
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
    const token = localStorage.getItem("token");
    try {
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
      ONGOING: "Ongoing",
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
        {/* Compact KPI Section */}
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
          <p className="page-subtitle">
            Track and manage your service requests
          </p>
        </div>

        {/* Compact Filters */}
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
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "ALL" ? "📍 All Status" : status}
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

        {/* Table Section */}
        {loading ? (
          <div className="text-center py-3">
            <div
              className="spinner-border spinner-border-sm text-primary mb-2"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
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
                        <td className="col-num">{index + 1}</td>
                        <td className="col-service">
                          <span className="service-item">
                            {req.serviceName || "N/A"}
                          </span>
                        </td>
                        <td className="col-vehicle">
                          <small>{req.vehicleId || "-"}</small>
                        </td>
                        <td className="col-location">
                          <small>{req.location || "-"}</small>
                        </td>
                        <td className="col-status">
                          <Badge
                            bg={getStatusColor(status)}
                            className="status-badge-small"
                          >
                            {getStatusIcon(status)} {getStatusLabel(status)}
                          </Badge>
                        </td>
                        <td className="col-date">
                          <small>
                            {new Date(req.createdAt).toLocaleDateString()}
                          </small>
                        </td>
                        <td className="col-action">
                          {status === "PENDING" ? (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="btn-action d-flex align-items-center gap-1"
                              disabled={cancelingId === req.id}
                              onClick={() => handleCancel(req.id)}
                              title="Cancel Request"
                            >
                              ❌ <span className="fw-bold">Cancel</span>
                            </Button>
                          ) : status === "ACCEPTED" ? (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="btn-action d-flex align-items-center gap-1"
                              onClick={() => fetchOtp(req.id)}
                              title="View OTP"
                            >
                              🔢 <span className="fw-bold">View OTP</span>
                            </Button>
                          ) : status === "PAYMENT_PENDING" && req.paymentUrl ? (
                            <Button
                              variant="success"
                              size="sm"
                              className="btn-action d-flex align-items-center gap-1"
                              onClick={() => handlePayNow(req.paymentUrl)}
                              title="Payment Pending"
                            >
                              💳 <span className="fw-bold">Pay Now</span>
                            </Button>
                          ) : (
                            <span className="action-none">—</span>
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

        {/* Results Info */}
        {!loading && filteredRequests.length > 0 && (
          <div className="results-footer text-center mt-2">
            <small className="text-muted">
              Showing {filteredRequests.length} of {requests.length}
            </small>
          </div>
        )}
      </Container>
    </div>
  );
};

export default MyRequests;
