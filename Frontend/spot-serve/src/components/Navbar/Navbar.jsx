import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Registration from "../../pages/Registration/Registration";
import Login from "../../pages/Login/Login";
import AddVehicleModal from "../../components/AddVehicleModal";

const Navbar = () => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const navigate = useNavigate();

  // ✅ Modal listeners (Register / Login)
  useEffect(() => {
    const openRegistration = () => setShowRegistration(true);
    const openLogin = () => setShowLogin(true);
    window.addEventListener("open-registration", openRegistration);
    window.addEventListener("open-login", openLogin);
    return () => {
      window.removeEventListener("open-registration", openRegistration);
      window.removeEventListener("open-login", openLogin);
    };
  }, []);

  // ✅ Keep user in sync after login/logout
  useEffect(() => {
    const handleLogin = () => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    };
    const handleLogout = () => setUser(null);
    window.addEventListener("userLogin", handleLogin);
    window.addEventListener("userLogout", handleLogout);
    return () => {
      window.removeEventListener("userLogin", handleLogin);
      window.removeEventListener("userLogout", handleLogout);
    };
  }, []);

  // ✅ Logout logic
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("userLogout"));
    navigate("/");
  };

  // ✅ Role-based navigation
  const goToDashboard = () => {
    if (user?.role === "MECHANIC") navigate("/mechanic/dashboard");
    else if (user?.role === "ADMIN") navigate("/admin/dashboard");
    else navigate("/dashboard");
  };

  const goToCreateRequest = () => navigate("/dashboard");
  const goToAddVehicle = () => setShowAddVehicle(true);
  const goToMyRequests = () => navigate("/my-requests");

  const goToProfile = () => {
    if (user?.role === "MECHANIC") navigate("/mechanic/profile");
    else navigate("/profile");
  };

  // ✅ Admin-specific navigation
  const goToAdminDashboard = () => navigate("/admin/dashboard");
  const goToAdminMechanics = () => navigate("/admin/mechanics");
  const goToAdminRevenue = () => navigate("/admin/revenue");
  const goToAdminReports = () => navigate("/admin/reports");

  return (
    <>
      <header className="navbar-wrapper shadow-sm">
        <div className="navbar-container container d-flex align-items-center justify-content-between">
          <Link to="/" className="navbar-brand fw-bold fs-5 text-dark m-0">
            SpotServe
          </Link>

          <nav className="nav-items d-flex align-items-center gap-3">
            {/* 🔹 Common Links */}
            <Link className="nav-link-custom" to="/">Home</Link>
            <Link className="nav-link-custom" to="/our-story">Our Story</Link>
            <Link className="nav-link-custom" to="/about-us">About Us</Link>
            <Link className="nav-link-custom" to="/contact-us">Contact Us</Link>
            <Link className="nav-link-custom" to="/terms-privacy">Terms & Privacy</Link>

            {/* 🔹 Guest buttons */}
            {!user ? (
              <>
                <button className="btn-login" onClick={() => setShowLogin(true)}>
                  Login
                </button>
                <button className="btn-register" onClick={() => setShowRegistration(true)}>
                  Register
                </button>
              </>
            ) : (
              <>
                {/* 🔹 CUSTOMER buttons */}
                {user.role === "CUSTOMER" && (
                  <>
                    <button className="btn-nav" onClick={goToDashboard}>Dashboard</button>
                    <button className="btn-nav" onClick={goToCreateRequest}>Create Request</button>
                    <button className="btn-nav" onClick={goToAddVehicle}>Add Vehicle</button>
                    <button className="btn-nav" onClick={goToMyRequests}>My Requests</button>
                    <button className="btn-nav" onClick={goToProfile}>Profile</button>
                  </>
                )}

                {/* 🔹 MECHANIC buttons */}
                {user.role === "MECHANIC" && (
                  <>
                    <button className="btn-nav" onClick={goToDashboard}>Dashboard</button>
                    <button className="btn-nav" onClick={goToProfile}>Profile</button>
                  </>
                )}

                {/* 🔹 ADMIN buttons */}
                {user.role === "ADMIN" && (
                  <>
                    <button className="btn-nav" onClick={goToAdminDashboard}>Dashboard</button>
                    <button className="btn-nav" onClick={goToAdminMechanics}>Mechanics</button>
                    <button className="btn-nav" onClick={goToAdminRevenue}>Revenue</button>
                    <button className="btn-nav" onClick={goToAdminReports}>Reports</button>
                  </>
                )}

                {/* 🔹 Common logout */}
                <button className="btn-logout" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* 🔹 Modals */}
      <Registration show={showRegistration} onClose={() => setShowRegistration(false)} />
      <Login show={showLogin} onClose={() => setShowLogin(false)} />
      <AddVehicleModal
        show={showAddVehicle}
        onClose={() => setShowAddVehicle(false)}
        onVehicleAdded={() => window.location.reload()}
      />
    </>
  );
};

export default Navbar;
