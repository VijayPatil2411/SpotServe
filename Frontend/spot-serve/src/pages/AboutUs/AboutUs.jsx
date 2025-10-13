import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="page-wrapper">
      <section className="about-hero">
        <h1>About Us</h1>
        <p>Learn more about SpotServe, our values, and the team behind the platform.</p>
      </section>

      <section className="about-content">
        <h2>Our Mission</h2>
        <p>
          Our mission is to make car maintenance stress-free and efficient. We prioritize
          customer satisfaction, transparency, and technological innovation.
        </p>

        <h2>Our Values</h2>
        <ul>
          <li>Customer-first approach</li>
          <li>Innovation and continuous improvement</li>
          <li>Integrity and transparency</li>
          <li>Safety and reliability</li>
        </ul>

        <h2>Meet the Team</h2>
        <p>
          A passionate team of engineers, car enthusiasts, and customer support experts
          working together to make SpotServe the most trusted platform for car owners.
        </p>
      </section>
    </div>
  );
};

export default AboutUs;
