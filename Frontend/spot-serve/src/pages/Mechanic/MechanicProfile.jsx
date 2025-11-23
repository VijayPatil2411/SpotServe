import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { Form, Spinner, Row, Col } from "react-bootstrap";
import { useToast } from "../../components/Toast";
import "./MechanicProfile.css";

const MechanicProfile = () => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [prevPassword, setPrevPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const [showPrevPassword, setShowPrevPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Wrap fetchProfile in useCallback to avoid eslint warning
  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/mechanic/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to load profile:", err);
      showToast("Failed to load profile. Please refresh.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]); // add fetchProfile as dependency

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!prevPassword || !newPassword) {
      showToast("Please enter both previous and new passwords.", "error");
      return;
    }
    setChanging(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.put(
        "/api/mechanic/profile/change-password",
        { oldPassword: prevPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(res.data.message || "Password updated successfully!", "success");
      setPrevPassword("");
      setNewPassword("");
      setPasswordStrength(0);
      fetchProfile();
    } catch (err) {
      console.error("Password change failed:", err);
      showToast("Failed to update password. Check old password.", "error");
    } finally {
      setChanging(false);
    }
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return { text: "Weak", color: "#EF4444", bg: "#FEE2E2" };
    if (passwordStrength === 1) return { text: "Fair", color: "#F97316", bg: "#FFEDD5" };
    if (passwordStrength === 2) return { text: "Good", color: "#EAB308", bg: "#FEF3C7" };
    if (passwordStrength === 3) return { text: "Strong", color: "#06B6D4", bg: "#CFFAFE" };
    return { text: "Very Strong", color: "#10B981", bg: "#D1FAE5" };
  };

  if (loading)
    return (
      <div className="premium-loading">
        <div className="loader"></div>
        <p>Loading your profile...</p>
      </div>
    );

  return (
    <div className="premium-wrapper">
      <div className="premium-header">
        <div className="header-blur"></div>
        <div className="header-content-wrapper">
          <div className="header-badge">🔧 Mechanic Portal</div>
          <h1 className="header-main-title">Profile Settings</h1>
          <p className="header-subtitle">Manage your professional information and security</p>
        </div>
      </div>

      <div className="premium-container">
        <Row className="premium-row">
          <Col lg={6} className="col-premium">
            <div className="premium-panel profile-panel">
              <div className="panel-header">
                <div className="header-icon-badge">👤</div>
                <div>
                  <h2 className="panel-title">Profile Information</h2>
                  <p className="panel-subtitle">Your professional details</p>
                </div>
              </div>

              <div className="profile-info-grid">
                <div className="info-item">
                  <div className="info-item-icon">👤</div>
                  <div className="info-item-content">
                    <label className="info-item-label">Full Name</label>
                    <p className="info-item-value">{profile?.name || "-"}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-item-icon">📧</div>
                  <div className="info-item-content">
                    <label className="info-item-label">Email Address</label>
                    <p className="info-item-value">{profile?.email || "-"}</p>
                  </div>
                </div>

                {profile?.phone && (
                  <div className="info-item">
                    <div className="info-item-icon">📱</div>
                    <div className="info-item-content">
                      <label className="info-item-label">Phone Number</label>
                      <p className="info-item-value">{profile.phone}</p>
                    </div>
                  </div>
                )}

                {profile?.location && (
                  <div className="info-item">
                    <div className="info-item-icon">📍</div>
                    <div className="info-item-content">
                      <label className="info-item-label">Location</label>
                      <p className="info-item-value">{profile.location}</p>
                    </div>
                  </div>
                )}

                {profile?.specialties && profile.specialties.length > 0 && (
                  <div className="info-item full-width">
                    <div className="info-item-icon">🔧</div>
                    <div className="info-item-content">
                      <label className="info-item-label">Specialties</label>
                      <div className="specialties-tags">
                        {profile.specialties.map((specialty, idx) => (
                          <span key={idx} className="specialty-tag">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Col>

          <Col lg={6} className="col-premium">
            <div className="premium-panel security-panel">
              <div className="panel-header">
                <div className="header-icon-badge security-badge">🔐</div>
                <div>
                  <h2 className="panel-title">Change Password</h2>
                  <p className="panel-subtitle">Keep your account secure</p>
                </div>
              </div>

              <Form onSubmit={handleUpdatePassword} className="premium-form">
                <div className="form-group-wrapper">
                  <label className="premium-label">Current Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <Form.Control
                      type={showPrevPassword ? "text" : "password"}
                      value={prevPassword}
                      onChange={(e) => setPrevPassword(e.target.value)}
                      className="premium-input"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPrevPassword(!showPrevPassword)}
                    >
                      {showPrevPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <div className="form-group-wrapper">
                  <label className="premium-label">New Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🆕</span>
                    <Form.Control
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        calculatePasswordStrength(e.target.value);
                      }}
                      className="premium-input"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="strength-section">
                      <div className="strength-header">
                        <span className="strength-label">Password Strength</span>
                        <span
                          className="strength-badge"
                          style={{ color: getPasswordStrengthLabel().color }}
                        >
                          {getPasswordStrengthLabel().text}
                        </span>
                      </div>
                      <div className="strength-bar-container">
                        <div className="strength-bar">
                          <div
                            className="strength-fill"
                            style={{
                              width: `${(passwordStrength / 4) * 100}%`,
                              backgroundColor: getPasswordStrengthLabel().color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="requirements-panel">
                  <p className="requirements-title">Requirements:</p>
                  <div className="req-grid">
                    <div className={`req-item ${newPassword.length >= 8 ? "met" : ""}`}>
                      <span className="req-check">✓</span>
                      <span className="req-text">8+ characters</span>
                    </div>
                    <div className={`req-item ${/[A-Z]/.test(newPassword) ? "met" : ""}`}>
                      <span className="req-check">✓</span>
                      <span className="req-text">Uppercase</span>
                    </div>
                    <div className={`req-item ${/[0-9]/.test(newPassword) ? "met" : ""}`}>
                      <span className="req-check">✓</span>
                      <span className="req-text">Number</span>
                    </div>
                    <div className={`req-item ${/[^A-Za-z0-9]/.test(newPassword) ? "met" : ""}`}>
                      <span className="req-check">✓</span>
                      <span className="req-text">Special char</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={changing || passwordStrength < 2}
                  className={`premium-btn secondary-btn ${
                    changing || passwordStrength < 2 ? "disabled" : ""
                  }`}
                >
                  {changing ? (
                    <>
                      <Spinner animation="border" size="sm" className="btn-spinner" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <span>🔄</span> Update Password
                    </>
                  )}
                </button>
              </Form>
            </div>
          </Col>
        </Row>

        <Row className="premium-row">
          <Col lg={12}>
            <div className="premium-panel info-panel">
              <h2 className="panel-title">Account Overview</h2>
              <Row className="info-grid">
                <Col md={3} sm={6}>
                  <div className="info-card">
                    <div className="info-icon">🟢</div>
                    <p className="info-label">Status</p>
                    <p className="info-value">Active</p>
                  </div>
                </Col>
                <Col md={3} sm={6}>
                  <div className="info-card">
                    <div className="info-icon">✅</div>
                    <p className="info-label">Verification</p>
                    <p className="info-value">Verified</p>
                  </div>
                </Col>
                <Col md={3} sm={6}>
                  <div className="info-card">
                    <div className="info-icon">🗓️</div>
                    <p className="info-label">Member Since</p>
                    <p className="info-value">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"}
                    </p>
                  </div>
                </Col>
                <Col md={3} sm={6}>
                  <div className="info-card">
                    <div className="info-icon">🛡️</div>
                    <p className="info-label">Security</p>
                    <p className="info-value">Secure</p>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MechanicProfile;
