import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { FiUser, FiMail, FiPhone, FiLock, FiMapPin, FiTool } from "react-icons/fi";
import "./MechanicProfile.css";

const MechanicProfile = () => {
  const [profile, setProfile] = useState(null);
  const [prevPassword, setPrevPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/mechanic/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch {
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!prevPassword || !newPassword) {
      alert("Please enter both previous and new passwords.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await api.put(
        "/api/mechanic/profile/change-password",
        { oldPassword: prevPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ " + (res.data.message || "Password updated successfully!"));
      setPrevPassword("");
      setNewPassword("");
      fetchProfile();
    } catch {
      alert("Failed to update password");
    }
  };

  if (loading) {
    return <p className="loading-msg">Loading profile...</p>;
  }

  return (
    <main className="profile-page fade-in">
      <h1 className="profile-header">Mechanic Profile</h1>

      {profile && (
        <div className="profile-info">
          <ProfileRow icon={<FiUser />} label="Name" value={profile.name} />
          <ProfileRow icon={<FiMail />} label="Email" value={profile.email} />
          {profile.phone && <ProfileRow icon={<FiPhone />} label="Phone" value={profile.phone} />}
          {profile.location && <ProfileRow icon={<FiMapPin />} label="Location" value={profile.location} />}
          {profile.specialties && (
            <ProfileRow icon={<FiTool />} label="Specialties" value={profile.specialties.join(", ")} />
          )}
          {/* Add other fields as needed */}
        </div>
      )}

      <section className="change-password-section">
        <h2>Change Password</h2>
        <div className="password-input-row">
          <FiLock className="icon" />
          <input
            type="password"
            placeholder="Enter previous password"
            value={prevPassword}
            onChange={(e) => setPrevPassword(e.target.value)}
          />
        </div>
        <div className="password-input-row">
          <FiLock className="icon" />
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <button
          onClick={handleUpdatePassword}
          disabled={!prevPassword || !newPassword}
          className="update-password-btn"
        >
          Update Password
        </button>
      </section>
    </main>
  );
};

const ProfileRow = ({ icon, label, value }) => (
  <div className="profile-row">
    <div className="icon">{icon}</div>
    <div className="label">{label}</div>
    <div className="value">{value || "-"}</div>
  </div>
);

export default MechanicProfile;
