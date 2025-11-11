import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./MechanicProfile.css";

const MechanicProfile = () => {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/mechanic/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setName(res.data.name || "");
    } catch (err) {
      console.error("Error fetching profile:", err);
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.put(
        "/api/mechanic/profile",
        { name, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ " + (res.data.message || "Profile updated successfully!"));
      setPassword("");
      fetchProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  if (loading) return <p className="text-center mt-4">Loading profile...</p>;

  return (
    <div className="container mt-5 mechanic-profile">
      <h2 className="fw-bold text-center mb-4">Mechanic Profile</h2>
      <div className="profile-card shadow p-4">
        <div className="mb-3">
          <label className="form-label">Email (Read Only)</label>
          <input
            type="email"
            className="form-control"
            value={profile.email}
            disabled
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn btn-primary w-100 mt-2" onClick={handleUpdate}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default MechanicProfile;
