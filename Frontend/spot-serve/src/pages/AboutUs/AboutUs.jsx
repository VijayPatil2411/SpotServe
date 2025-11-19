import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-wrapper">
      {/* Hero Section */}
      <section className="hero-box">
        <h1>About SpotServe</h1>
        <p>Your trusted platform for smooth and simple car service experience.</p>
      </section>

      {/* Our Story */}
      <section className="section-block">
        <h2>Our Story</h2>
        <p>
          SpotServe started with a simple idea — make vehicle servicing easy for everyone.
          No long queues, no confusion, no hidden details. Just clear, trusted, and quick help.
        </p>
        <p>
          Over time, we grew into a platform that connects car owners with skilled mechanics,
          reliable service centers, and smooth support. Every feature we build aims to save your
          time and give you a better service experience.
        </p>
      </section>

      {/* Mission */}
      <section className="section-block">
        <h2>Our Mission</h2>
        <p>
          We want to make car maintenance stress-free. We focus on customer happiness,
          transparency, and using simple technology to solve real problems.
        </p>
      </section>

      {/* Values */}
      <section className="section-block">
        <h2>Our Values</h2>
        <ul>
          <li>Customer-first approach</li>
          <li>Simple technology that helps</li>
          <li>Honesty and transparency</li>
          <li>Safe and reliable service</li>
        </ul>
      </section>

      {/* Team */}
      <section className="section-block">
        <h2>Our Team</h2>
        <p>
          We are a small but passionate team of engineers, mechanics, and support experts
          who love solving problems and improving your service experience.
        </p>
      </section>
    </div>
  );
};

export default AboutUs;
