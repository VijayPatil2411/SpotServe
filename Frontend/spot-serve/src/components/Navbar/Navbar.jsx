import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Registration from "../../pages/Registration/Registration";
import Login from "../../pages/Login/Login"; // <-- import login modal

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
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/services">
                  Services
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/about">
                  About
                </Link>
              </li>

              <li className="nav-item d-lg-none">
                {/* show Register & Login as normal nav items on small screens */}
                <button
                  className="btn btn-sm btn-outline-light mt-2 w-100 mb-1"
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

              <li className="nav-item d-none d-lg-block ms-2">
                {/* show Login & Register as pill buttons on large screens */}
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

      {/* Modal popups */}
      <Registration
        show={showRegistration}
        onClose={() => setShowRegistration(false)}
      />
      <Login show={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};

export default Navbar;
