import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Form, Button, Spinner, Card, Row, Col } from "react-bootstrap";
import "./CustomerProfile.css";

const CustomerProfile = () => {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" });
  const [changing, setChanging] = useState(false);

  // ✅ Fetch profile on mount
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
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ✅ Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await api.put("/api/customer/profile", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("❌ Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChanging(true);
    try {
      const token = localStorage.getItem("token");
      await api.put("/api/customer/profile/change-password", passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Password changed successfully!");
      setPasswordData({ oldPassword: "", newPassword: "" });
    } catch (err) {
      console.error("Password change failed:", err);
      alert("❌ Failed to change password. Check old password.");
    } finally {
      setChanging(false);
    }
  };

  if (loading)
    return <p className="text-center mt-5 text-muted">Loading profile...</p>;

  return (
    <div className="container mt-5">
      <h2 className="text-center fw-bold mb-4">My Profile</h2>
      <Row>
        <Col md={6}>
          <Card className="p-4 shadow-sm mb-4">
            <h5 className="mb-3 fw-semibold">Update Profile</h5>
            <Form onSubmit={handleProfileUpdate}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={profile.email} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </Form.Group>

              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? <Spinner animation="border" size="sm" /> : "Update Profile"}
              </Button>
            </Form>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="p-4 shadow-sm">
            <h5 className="mb-3 fw-semibold">Change Password</h5>
            <Form onSubmit={handlePasswordChange}>
              <Form.Group className="mb-3">
                <Form.Label>Old Password</Form.Label>
                <Form.Control
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, oldPassword: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Button variant="warning" type="submit" disabled={changing}>
                {changing ? <Spinner animation="border" size="sm" /> : "Change Password"}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerProfile;
