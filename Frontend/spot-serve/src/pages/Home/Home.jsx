import React, { useState, useEffect } from "react";
import "./Home.css";
import Footer from "../../components/Footer/Footer";
import { Container, Row, Col, Button } from "react-bootstrap";
import ServiceCards from "../../components/ServiceCards";
import { getAllServices } from "../../services/customerService";

const Home = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [services, setServices] = useState([]);

  // Update user on login/logout
  useEffect(() => {
    const updateUser = () => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    };

    window.addEventListener("userLogin", updateUser);
    window.addEventListener("userLogout", () => setUser(null));

    return () => {
      window.removeEventListener("userLogin", updateUser);
      window.removeEventListener("userLogout", () => setUser(null));
    };
  }, []);

  // Fetch services ALWAYS (not only when user logs in)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getAllServices();
        setServices(data || []);
      } catch (err) {
        console.error("Error loading services:", err);
      }
    };
    fetchServices();
  }, []);

  return (
    <>
      <div className="home">

        {/* ================= HERO ================= */}
        <section className="hero-section d-flex align-items-center justify-content-center text-center">
          <Container>
            <div className="hero-content">
              <h1 className="hero-title animate-fade-in">Welcome to SpotServe</h1>
              <p className="hero-subtitle animate-fade-in-delay">
                One-stop solution for all your vehicle service and management needs.
              </p>
              <p className="hero-description">
                Connect with trusted mechanics instantly. Fast, reliable, and available 24/7.
              </p>

              <div className="hero-buttons">
                <Button variant="outline-light" className="hero-btn btn-learn-more">
                  Learn More
                </Button>
              </div>
            </div>

            <div className="emergency-cta text-center mt-5">
              <h3 className="mb-3">Vehicle Breakdown? Need Help Now?</h3>
            </div>
          </Container>
        </section>

        {/* ================= SERVICES (NEW POSITION) ================= */}
        <section className="customer-services py-5" id="customer-services">
          <Container>
            <h2 className="text-center mb-2 section-title">
              Available Roadside Services
            </h2>
            <p className="text-center text-muted mb-5">
              Select a service to get quick assistance.
            </p>
            <ServiceCards services={services} user={user} />
          </Container>
        </section>

        {/* ================= STATS ================= */}
        <section className="stats-section py-5">
          <Container>
            <Row className="text-center">
              <Col md={3} sm={6} className="mb-4">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <h3 className="stat-number">10,000+</h3>
                  <p className="stat-label">Happy Customers</p>
                </div>
              </Col>
              <Col md={3} sm={6} className="mb-4">
                <div className="stat-card">
                  <div className="stat-icon">🔧</div>
                  <h3 className="stat-number">500+</h3>
                  <p className="stat-label">Expert Mechanics</p>
                </div>
              </Col>
              <Col md={3} sm={6} className="mb-4">
                <div className="stat-card">
                  <div className="stat-icon">⚙️</div>
                  <h3 className="stat-number">20+</h3>
                  <p className="stat-label">Services Available</p>
                </div>
              </Col>
              <Col md={3} sm={6} className="mb-4">
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <h3 className="stat-number">98%</h3>
                  <p className="stat-label">Satisfaction Rate</p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* ALL OTHER SECTIONS UNTOUCHED */}
        {/* How it works, About, Features, Gallery, Why choose, Testimonials, Trust badges, CTA */}

      </div>

      <Footer />
    </>
  );
};

export default Home;
