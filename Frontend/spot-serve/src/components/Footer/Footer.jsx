import React from "react";
// import { Link } from "react-router-dom";
import "./Footer.css";

// Import your pages here
// import AboutUs from ".../";
// import Contact from "../pages/Contact";
// import Terms from "../pages/Terms";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Company */}
        <div className="footer-section company">
          <h3>SpotServe</h3>
          <p>
            Making your vehicle service experience easier, faster, and smarter.
          </p>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>📍 Pune, Maharashtra, India</p>
          <p>📞 +91 98765 43210</p>
          <p>✉️ support@spotserve.in</p>
        </div>

        {/* About / Links */}
        <div className="footer-section">
          <h4>Links</h4>
          {/* <ul>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/terms">Terms & Privacy</Link>
            </li>
          </ul> */}

          <ul>
            <li>About Us</li>
            <li>Contact</li>
            <li>Terms & Privacy</li>
          </ul>
        </div>

        {/* Social */}
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-icons vertical-icons">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-facebook"></i> Facebook
            </a>

            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-twitter"></i> Twitter
            </a>

            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-instagram"></i> Instagram
            </a>

            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-linkedin"></i> LinkedIn
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 SpotServe. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
