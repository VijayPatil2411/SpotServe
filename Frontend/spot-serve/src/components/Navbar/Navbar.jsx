import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Registration from "../../pages/Registration/Registration";
import Login from "../../pages/Login/Login";

const Navbar = () => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const openRegistration = () => setShowRegistration(true);
    window.addEventListener("open-registration", openRegistration);
    return () =>
      window.removeEventListener("open-registration", openRegistration);
  }, []);

  useEffect(() => {
    const openLogin = () => setShowLogin(true);
    window.addEventListener("open-login", openLogin);
    return () => window.removeEventListener("open-login", openLogin);
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            SpotServe
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/services">Services</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/our-story">Our Story</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/about-us">About Us</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/contact-us">Contact Us</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/terms-privacy">Terms & Privacy</Link>
              </li>

              {/* Mobile buttons */}
              <li className="nav-item d-lg-none mt-2">
                <button
                  className="btn btn-sm btn-outline-light w-100 mb-1"
                  onClick={() => setShowLogin(true)}
                >
                  Login
                </button>
                <button
                  className="btn btn-sm btn-outline-light w-100"
                  onClick={() => setShowRegistration(true)}
                >
                  Register
                </button>
              </li>

              {/* Desktop buttons */}
              <li className="nav-item d-none d-lg-flex ms-2">
                <button
                  className="btn nav-login-btn btn-sm me-2"
                  onClick={() => setShowLogin(true)}
                >
                  Login
                </button>
                <button
                  className="btn nav-register-btn btn-sm"
                  onClick={() => setShowRegistration(true)}
                >
                  Register
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <Registration
        show={showRegistration}
        onClose={() => setShowRegistration(false)}
      />
      <Login
        show={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </>
  );
};

export default Navbar;
