import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section company">
          <h3>SpotServe</h3>
          <p>Making your vehicle service experience easier, faster, and smarter.</p>
        </div>

        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>📍 Pune, Maharashtra, India</p>
          <p>📞 +91 98765 43210</p>
          <p>✉️ support@spotserve.in</p>
        </div>

        <div className="footer-section">
          <h4>About Us</h4>
          <ul>
            <li><a href="#">Our Story</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Terms & Privacy</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#"><i className="bi bi-facebook"></i></a>
            <a href="#"><i className="bi bi-twitter"></i></a>
            <a href="#"><i className="bi bi-instagram"></i></a>
            <a href="#"><i className="bi bi-linkedin"></i></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} SpotServe. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
