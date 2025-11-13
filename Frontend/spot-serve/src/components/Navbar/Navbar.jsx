// Navbar.jsx - IMPROVED VERSION
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const navigate = useNavigate();

  // ✅ MAIN EFFECT: Handle all user state changes
  useEffect(() => {
    // Function to sync user from localStorage
    const syncUserFromStorage = () => {
      try {
        const stored = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (stored && token) {
          const userData = JSON.parse(stored);
          setUser(userData);
          console.log("✅ User synced from localStorage:", userData);
          setShowLogin(false);
          setShowRegistration(false);
        } else {
          setUser(null);
          console.log("✅ User cleared (no token/user in storage)");
        }
      } catch (error) {
        console.error("Error syncing user:", error);
        setUser(null);
      }
    };

    // ✅ Event listeners
    const handleOpenRegistration = () => setShowRegistration(true);
    const handleOpenLogin = () => setShowLogin(true);

    const handleUserLogin = (e) => {
      console.log("🔔 userLogin event received");
      syncUserFromStorage();
    };

    const handleUserLogout = (e) => {
      console.log("🔔 userLogout event received");
      setUser(null);
      setIsMenuOpen(false);
    };

    const handleStorageChange = (e) => {
      if (e.key === "user" || e.key === "token") {
        console.log("🔔 Storage changed:", e.key);
        syncUserFromStorage();
      }
    };

    // Add event listeners
    window.addEventListener("open-registration", handleOpenRegistration);
    window.addEventListener("open-login", handleOpenLogin);
    window.addEventListener("userLogin", handleUserLogin);
    window.addEventListener("userLogout", handleUserLogout);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("open-registration", handleOpenRegistration);
      window.removeEventListener("open-login", handleOpenLogin);
      window.removeEventListener("userLogin", handleUserLogin);
      window.removeEventListener("userLogout", handleUserLogout);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // ✅ ADDED: Check user on component mount/remount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
        console.log("✅ Navbar mounted - user found in storage");
      } catch (error) {
        console.error("Error parsing stored user:", error);
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsMenuOpen(false);
    window.dispatchEvent(new Event("userLogout"));
    navigate("/");
  };

  const navActions = {
    dashboard: () => {
      if (user?.role === "MECHANIC") navigate("/mechanic/dashboard");
      else if (user?.role === "ADMIN") navigate("/admin/dashboard");
      else navigate("/");
    },
    profile: () =>
      user?.role === "MECHANIC"
        ? navigate("/mechanic/profile")
        : navigate("/profile"),
    createRequest: () => navigate("/dashboard"),
    addVehicle: () => setShowAddVehicle(true),
    myRequests: () => navigate("/my-requests"),
    mechanics: () => navigate("/admin/mechanics"),
    revenue: () => navigate("/admin/revenue"),
    reports: () => navigate("/admin/reports"),
  };

  const roleButtons = {
    CUSTOMER: [
      { label: "Dashboard", action: navActions.dashboard },
      { label: "Add Vehicle", action: navActions.addVehicle },
      { label: "My Requests", action: navActions.myRequests },
      { label: "Profile", action: navActions.profile },
    ],
    MECHANIC: [
      { label: "Dashboard", action: navActions.dashboard },
      { label: "Profile", action: navActions.profile },
    ],
    ADMIN: [
      { label: "Dashboard", action: navActions.dashboard },
      { label: "Mechanics", action: navActions.mechanics },
      { label: "Revenue", action: navActions.revenue },
      { label: "Reports", action: navActions.reports },
    ],
  };

  return (
    <>
      <nav className="navbar-modern">
        <div className="container-fluid px-3 px-lg-4">
          <div className="d-flex align-items-center justify-content-between w-100">
            {/* Brand */}
            <Link
              to="/"
              className="brand-logo"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="brand-icon">🔧</span>
              <span className="brand-text">SpotServe</span>
            </Link>

            {/* Hamburger Menu */}
            <button
              className="navbar-toggler d-lg-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation"
            >
              <span className={`hamburger ${isMenuOpen ? "active" : ""}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="nav-desktop d-none d-lg-flex align-items-center gap-2">
              {/* Common Links */}
              <div className="nav-links d-flex align-items-center gap-3">
                <Link className="nav-link-modern" to="/">
                  Home
                </Link>
                <Link className="nav-link-modern" to="/our-story">
                  Our Story
                </Link>
                <Link className="nav-link-modern" to="/about-us">
                  About Us
                </Link>
                <Link className="nav-link-modern" to="/contact-us">
                  Contact
                </Link>
                <Link className="nav-link-modern" to="/terms-privacy">
                  Terms
                </Link>
              </div>

              {/* Auth / User Actions */}
              <div className="nav-actions d-flex align-items-center gap-1">
                {!user ? (
                  <>
                    <button
                      className="btn-modern btn-modern-outline"
                      onClick={() => setShowLogin(true)}
                    >
                      Login
                    </button>
                    <button
                      className="btn-modern btn-modern-primary"
                      onClick={() => setShowRegistration(true)}
                    >
                      Register
                    </button>
                  </>
                ) : (
                  <>
                    {roleButtons[user.role]?.map((btn, idx) => (
                      <button
                        key={idx}
                        className="btn-modern btn-modern-sm"
                        onClick={btn.action}
                      >
                        {btn.label}
                      </button>
                    ))}
                    <div className="user-greeting">
                      Hello,{" "}
                      <span className="user-name">
                        {user.name || user.username || "User"}
                      </span>
                    </div>
                    <button
                      className="btn-modern btn-modern-danger btn-modern-sm"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`nav-mobile d-lg-none ${isMenuOpen ? "show" : ""}`}>
            <div className="mobile-menu-content">
              {/* Common Links */}
              <div className="mobile-section">
                <Link
                  className="nav-link-mobile"
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  className="nav-link-mobile"
                  to="/our-story"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Our Story
                </Link>
                <Link
                  className="nav-link-mobile"
                  to="/about-us"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  className="nav-link-mobile"
                  to="/contact-us"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  className="nav-link-mobile"
                  to="/terms-privacy"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Terms
                </Link>
              </div>

              {/* Auth / User Actions */}
              <div className="mobile-section mobile-actions">
                {!user ? (
                  <>
                    <button
                      className="btn-mobile btn-mobile-outline"
                      onClick={() => {
                        setShowLogin(true);
                        setIsMenuOpen(false);
                      }}
                    >
                      Login
                    </button>
                    <button
                      className="btn-mobile btn-mobile-primary"
                      onClick={() => {
                        setShowRegistration(true);
                        setIsMenuOpen(false);
                      }}
                    >
                      Register
                    </button>
                  </>
                ) : (
                  <>
                    <div className="user-greeting-mobile">
                      Hello,{" "}
                      <span className="user-name">
                        {user.name || user.username || "User"}
                      </span>
                      !
                    </div>
                    {roleButtons[user.role]?.map((btn, idx) => (
                      <button
                        key={idx}
                        className="btn-mobile btn-mobile-outline"
                        onClick={() => {
                          btn.action();
                          setIsMenuOpen(false);
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                    <button
                      className="btn-mobile btn-mobile-danger"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <Registration
        show={showRegistration}
        onClose={() => setShowRegistration(false)}
      />
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
