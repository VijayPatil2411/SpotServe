import React, { useState } from "react";
import "./ContactUs.css";

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", form);
    alert("Message sent successfully!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="page-wrapper">
      <section className="contact-hero">
        <h1>Contact Us</h1>
        <p>We’d love to hear from you! Reach out with questions or feedback.</p>
      </section>

      <section className="contact-form-section">
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
            required
          />

          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <label>Message</label>
          <textarea
            name="message"
            rows="5"
            value={form.message}
            onChange={handleChange}
            placeholder="Type your message..."
            required
          />

          <button type="submit">Send Message</button>
        </form>
      </section>
    </div>
  );
};

export default ContactUs;
