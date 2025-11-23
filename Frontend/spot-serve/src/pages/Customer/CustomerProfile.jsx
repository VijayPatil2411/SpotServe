// src/pages/Customer/CustomerProfile.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Form, Spinner, Row, Col } from "react-bootstrap";
import { useToast } from "../../components/Toast";

import "./CustomerProfile.css";

const CustomerProfile = () => {
  const { showToast } = useToast();

  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" });
  const [changing, setChanging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileChanged, setProfileChanged] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/api/customer/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        showToast("Failed to load profile. Please refresh.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [showToast]); // include showToast to satisfy eslint

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await api.put("/api/customer/profile", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Profile updated successfully!", "success");
      setProfileChanged(false);
    } catch (err) {
      console.error("Profile update failed:", err);
      showToast("Failed to update profile. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChanging(true);
    try {
      const token = localStorage.getItem("token");
      await api.put("/api/customer/profile/change-password", passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Password changed successfully!", "success");
      setPasswordData({ oldPassword: "", newPassword: "" });
      setPasswordStrength(0);
    } catch (err) {
      console.error("Password change failed:", err);
      showToast("Failed to change password. Check old password.", "error");
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
          <div className="header-badge">⚡ Account Management</div>
          <h1 className="header-main-title">Profile Settings</h1>
          <p className="header-subtitle">Manage your personal information and security</p>
        </div>
      </div>

      <div className="premium-container">
        <Row className="premium-row">
          <Col lg={6} className="col-premium">
            <div className="premium-panel profile-panel">
              <div className="panel-header">
                <div className="header-icon-badge">👤</div>
                <div>
                  <h2 className="panel-title">Edit Profile</h2>
                  <p className="panel-subtitle">Update your personal information</p>
                </div>
              </div>

              <Form onSubmit={handleProfileUpdate} className="premium-form">
                <div className="form-group-wrapper">
                  <label className="premium-label">Full Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <Form.Control
                      type="text"
                      value={profile.name}
                      onChange={(e) => {
                        setProfile({ ...profile, name: e.target.value });
                        setProfileChanged(true);
                      }}
                      className="premium-input"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="form-group-wrapper">
                  <label className="premium-label">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📧</span>
                    <Form.Control
                      type="email"
                      value={profile.email}
                      disabled
                      className="premium-input disabled-field"
                    />
                  </div>
                  <small className="input-hint">Email cannot be changed</small>
                </div>

                <div className="form-group-wrapper">
                  <label className="premium-label">Phone Number</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📱</span>
                    <Form.Control
                      type="text"
                      value={profile.phone || ""}
                      onChange={(e) => {
                        setProfile({ ...profile, phone: e.target.value });
                        setProfileChanged(true);
                      }}
                      className="premium-input"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving || !profileChanged}
                  className={`premium-btn primary-btn ${saving || !profileChanged ? "disabled" : ""}`}
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="btn-spinner" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <span>💾</span> Save Changes
                    </>
                  )}
                </button>
              </Form>
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

              <Form onSubmit={handlePasswordChange} className="premium-form">
                <div className="form-group-wrapper">
                  <label className="premium-label">Current Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      value={passwordData.oldPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, oldPassword: e.target.value })
                      }
                      className="premium-input"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <div className="form-group-wrapper">
                  <label className="premium-label">New Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🆕</span>
                    <Form.Control
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, newPassword: e.target.value });
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

                  {passwordData.newPassword && (
                    <div className="strength-section">
                      <div className="strength-header">
                        <span className="strength-label">Password Strength</span>
                        <span className="strength-badge" style={{ color: getPasswordStrengthLabel().color }}>
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
                    <div className={`req-item ${passwordData.newPassword.length >= 8 ? "met" : ""}`}>
                      <span className="req-check">✓</span>
                      <span className="req-text">8+ characters</span>
                    </div>
                    <div className={`req-item ${/[A-Z]/.test(passwordData.newPassword) ? "met" : ""}`}>
                      <span className="req-check">✓</span>
                      <span className="req-text">Uppercase</span>
                    </div>
                    <div className={`req-item ${/[0-9]/.test(passwordData.newPassword) ? "met" : ""}`}>
                      <span className="req-check">✓</span>
                      <span className="req-text">Number</span>
                    </div>
                    <div className={`req-item ${/[^A-Za-z0-9]/.test(passwordData.newPassword) ? "met" : ""}`}>
                      <span className="req-check">✓</span>
                      <span className="req-text">Special char</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={changing || passwordStrength < 2}
                  className={`premium-btn secondary-btn ${changing || passwordStrength < 2 ? "disabled" : ""}`}
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
                    <p className="info-value">{new Date().toLocaleDateString()}</p>
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

export default CustomerProfile;
