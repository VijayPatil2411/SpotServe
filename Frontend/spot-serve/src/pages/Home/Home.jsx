import React from "react";
import "./Home.css";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { Container, Row, Col, Button } from "react-bootstrap";

const Home = () => {
  return (
    <>
    <Navbar />
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section d-flex align-items-center justify-content-center text-center">
        <Container>
          <h1 className="hero-title">Welcome to SpotServe</h1>
          <p className="hero-subtitle">
            One-stop solution for all your vehicle service and management needs.
          </p>
          <Button variant="primary" className="hero-btn">
            Get Started
          </Button>
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
                SpotServe connects customers with trusted mechanics and car
                service providers nearby. Whether you need regular maintenance,
                emergency towing, or vehicle inspection — we make it simple,
                fast, and reliable.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5 section-title">Our Features</h2>
          <Row>
            <Col md={4} className="text-center mb-4">
              <div className="feature-card">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3069/3069172.png"
                  alt="Booking"
                  className="feature-icon"
                />
                <h5>Easy Booking</h5>
                <p>Schedule your car service in just a few clicks.</p>
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
                <p>Track your service progress and job status live.</p>
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
                <p>Safe and easy transactions with trusted providers.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
    <Footer />
    </>

   
  );
};

export default Home;
