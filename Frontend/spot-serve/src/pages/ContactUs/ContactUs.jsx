import React from "react";
import "./ContactUs.css";

const ContactUs = () => {
  return (
    <div className="page-wrapper">
      
      <section className="contact-hero">
        <h1>Contact Us</h1>
        <p>We are here to help you. Reach out anytime!</p>
      </section>

      <section className="contact-info">
        <h2>Get in Touch</h2>
        <p>
          If you have questions about services, bookings, or support,
          feel free to contact us.
        </p>

        <div className="contact-cards">

          <div className="contact-card">
            <h3>Email</h3>
            <p>support@spotserve.com</p>
          </div>

          <div className="contact-card">
            <h3>Phone</h3>
            <p>+91 98765 43210</p>
          </div>

          <div className="contact-card">
            <h3>Address</h3>
            <p>Pune, Maharashtra, India</p>
          </div>

        </div>
      </section>

      <section className="contact-form">
        <h2>Send us a Message</h2>
        <form>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" rows="4" required></textarea>
          <button type="submit">Send Message</button>
        </form>
      </section>

    </div>
  );
};

export default ContactUs;
