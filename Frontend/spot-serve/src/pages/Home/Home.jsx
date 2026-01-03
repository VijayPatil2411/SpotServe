import React, { useState, useEffect } from "react";
import "./Home.css";
import Footer from "../../components/Footer/Footer";
import { Container, Row, Col, Button } from "react-bootstrap";
import ServiceCards from "../../components/ServiceCards";
import { getAllServices } from "../../services/customerService";
import HomeTestimonials from "../../components/HomeTestimonials";

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

        {/* How It Works Section */}
        <section className="how-it-works-section py-5 bg-light">
          <Container>
            <h2 className="text-center mb-2 section-title">How It Works</h2>
            <p className="text-center text-muted mb-5">
              Get help in three simple steps
            </p>
            <Row>
              <Col md={4} className="text-center mb-4">
                <div className="step-card">
                  <div className="step-number">1</div>
                  <div className="step-icon">📱</div>
                  <h5 className="step-title">Request Service</h5>
                  <p className="step-description">
                    Choose your service type and location. Our system finds the nearest available mechanics.
                  </p>
                </div>
              </Col>
              <Col md={4} className="text-center mb-4">
                <div className="step-card">
                  <div className="step-number">2</div>
                  <div className="step-icon">🔍</div>
                  <h5 className="step-title">Get Matched</h5>
                  <p className="step-description">
                    We connect you with verified mechanics based on your needs and location.
                  </p>
                </div>
              </Col>
              <Col md={4} className="text-center mb-4">
                <div className="step-card">
                  <div className="step-number">3</div>
                  <div className="step-icon">✅</div>
                  <h5 className="step-title">Get Fixed</h5>
                  <p className="step-description">
                    Track your mechanic in real-time and get your vehicle back on the road quickly.
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* About Section */}
        <section className="about-section py-5">
          <Container>
            <Row className="align-items-center">
              <Col md={6} className="text-center mb-4 mb-md-0">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1995/1995574.png"
                  alt="Car Service"
                  className="about-img"
                />
              </Col>
              <Col md={6}>
                <h2 className="section-title">About SpotServe</h2>
                <p className="section-text">
                  SpotServe connects customers with trusted mechanics and car service
                  providers nearby. Whether you need regular maintenance, emergency
                  towing, or vehicle inspection — we make it simple, fast, and reliable.
                </p>
                <div className="about-highlights mt-4">
                  <div className="highlight-item">
                    <span className="highlight-icon">✓</span>
                    <span>24/7 Emergency Support</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">✓</span>
                    <span>Verified & Trusted Mechanics</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">✓</span>
                    <span>Transparent Pricing</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">✓</span>
                    <span>Real-time Tracking</span>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Features Section */}
        <section className="features-section py-5 bg-light">
          <Container>
            <h2 className="text-center mb-2 section-title">Our Features</h2>
            <p className="text-center text-muted mb-5">
              Everything you need for hassle-free vehicle service
            </p>
            <Row>
              <Col md={4} className="text-center mb-4">
                <div className="feature-card">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3069/3069172.png"
                    alt="Booking"
                    className="feature-icon"
                  />
                  <h5>Easy Booking</h5>
                  <p>Schedule your car service in just a few clicks with our intuitive interface.</p>
                </div>
              </Col>
              <Col md={4} className="text-center mb-4">
                <div className="feature-card">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/1995/1995525.png"
                    alt="Tracking"
                    className="feature-icon"
                  />
                  <h5>Real-time Tracking</h5>
                  <p>Track your service progress and mechanic location live on the map.</p>
                </div>
              </Col>
              <Col md={4} className="text-center mb-4">
                <div className="feature-card">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/1040/1040230.png"
                    alt="Secure Payment"
                    className="feature-icon"
                  />
                  <h5>Secure Payment</h5>
                  <p>Safe and easy transactions with multiple payment options available.</p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Service Gallery Section */}
        <section className="gallery-section py-5">
          <Container>
            <h2 className="text-center mb-2 section-title">Our Services in Action</h2>
            <p className="text-center text-muted mb-5">
              Real photos from our service locations
            </p>
            <Row>
              <Col md={4} sm={6} className="mb-4">
                <div className="gallery-item">
                  <img
                    src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500"
                    alt="Engine Repair"
                    className="gallery-img"
                  />
                  <div className="gallery-overlay">
                    <h5>Engine Repair</h5>
                  </div>
                </div>
              </Col>
              <Col md={4} sm={6} className="mb-4">
                <div className="gallery-item">
                  <img
                    src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=500"
                    alt="Oil Change"
                    className="gallery-img"
                  />
                  <div className="gallery-overlay">
                    <h5>Oil Change</h5>
                  </div>
                </div>
              </Col>
              <Col md={4} sm={6} className="mb-4">
                <div className="gallery-item">
                  <img
                    src="https://images.unsplash.com/photo-1632823470878-0049726c0a54?w=500"
                    alt="Tire Service"
                    className="gallery-img"
                  />
                  <div className="gallery-overlay">
                    <h5>Tire Service</h5>
                  </div>
                </div>
              </Col>
              <Col md={4} sm={6} className="mb-4">
                <div className="gallery-item">
                  <img
                    src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500"
                    alt="Towing Service"
                    className="gallery-img"
                  />
                  <div className="gallery-overlay">
                    <h5>Towing Service</h5>
                  </div>
                </div>
              </Col>
              <Col md={4} sm={6} className="mb-4">
                <div className="gallery-item">
                  <img
                    src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500"
                    alt="Brake Repair"
                    className="gallery-img"
                  />
                  <div className="gallery-overlay">
                    <h5>Brake Repair</h5>
                  </div>
                </div>
              </Col>
              <Col md={4} sm={6} className="mb-4">
                <div className="gallery-item">
                  <img
                    src="https://images.unsplash.com/photo-1610647752706-3bb12232b37a?w=500"
                    alt="Battery Service"
                    className="gallery-img"
                  />
                  <div className="gallery-overlay">
                    <h5>Battery Service</h5>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Why Choose Us Section */}
        <section className="why-choose-section py-5 bg-light">
          <Container>
            <h2 className="text-center mb-2 section-title">Why Choose SpotServe?</h2>
            <p className="text-center text-muted mb-5">
              We're committed to providing the best service experience
            </p>
            <Row>
              <Col md={6} lg={3} className="mb-4">
                <div className="why-card">
                  <div className="why-icon">🛡️</div>
                  <h5>Licensed & Insured</h5>
                  <p>All mechanics are verified, licensed, and fully insured for your peace of mind.</p>
                </div>
              </Col>
              <Col md={6} lg={3} className="mb-4">
                <div className="why-card">
                  <div className="why-icon">💰</div>
                  <h5>Fair Pricing</h5>
                  <p>Transparent pricing with no hidden charges. Get quotes before service starts.</p>
                </div>
              </Col>
              <Col md={6} lg={3} className="mb-4">
                <div className="why-card">
                  <div className="why-icon">⚡</div>
                  <h5>Fast Response</h5>
                  <p>Average response time of 15 minutes. We're there when you need us most.</p>
                </div>
              </Col>
              <Col md={6} lg={3} className="mb-4">
                <div className="why-card">
                  <div className="why-icon">🏆</div>
                  <h5>Quality Guarantee</h5>
                  <p>100% satisfaction guarantee on all services. Your trust is our priority.</p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Testimonials Section */}
        <div>
      {/* Your existing homepage sections */}
      <HomeTestimonials />
    </div>

        {/* Trust Badges Section */}
        <section className="trust-badges-section py-5 bg-light">
          <Container>
            <h2 className="text-center mb-5 section-title">Trusted & Secure</h2>
            <Row className="align-items-center justify-content-center">
              <Col xs={6} md={2} className="text-center mb-4">
                <div className="trust-badge">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/1086/1086581.png" 
                    alt="Secure"
                    className="trust-icon"
                  />
                  <p>SSL Secure</p>
                </div>
              </Col>
              <Col xs={6} md={2} className="text-center mb-4">
                <div className="trust-badge">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
                    alt="Verified"
                    className="trust-icon"
                  />
                  <p>Verified</p>
                </div>
              </Col>
              <Col xs={6} md={2} className="text-center mb-4">
                <div className="trust-badge">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/2331/2331966.png" 
                    alt="Money Back"
                    className="trust-icon"
                  />
                  <p>Money Back</p>
                </div>
              </Col>
              <Col xs={6} md={2} className="text-center mb-4">
                <div className="trust-badge">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/2099/2099058.png" 
                    alt="24/7 Support"
                    className="trust-icon"
                  />
                  <p>24/7 Support</p>
                </div>
              </Col>
              <Col xs={6} md={2} className="text-center mb-4">
                <div className="trust-badge">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/1611/1611179.png" 
                    alt="Quality"
                    className="trust-icon"
                  />
                  <p>Quality</p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="cta-section py-5">
          <Container>
            <div className="cta-content text-center">
              <h2 className="cta-title">Ready to Get Started?</h2>
              <p className="cta-subtitle">
                Join thousands of satisfied customers who trust SpotServe for their vehicle needs
              </p>
              <Button variant="light" size="lg" className="cta-btn">
                Sign Up Now
              </Button>
            </div>
          </Container>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default Home;
