import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./HomeTestimonials.css";

const HomeTestimonials = () => {
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    api
      .get("api/feedback/public/recent")
      .then((res) => setFeedback(res.data))
      .catch(() => setFeedback([]));
  }, []);

  return (
    <div className="testimonials-section">
      <h2 className="heading">What Our Customers Say</h2>

      <div className="testimonial-cards">
        {feedback.length === 0 && (
          <p className="no-data">No feedback available</p>
        )}

        {feedback.map((item) => (
          <div className="testimonial-card" key={item.id}>
            <div className="stars">
              {"⭐".repeat(item.rating)}
            </div>

            <p className="comment">"{item.comment}"</p>

            <div className="user-info">
              <div className="avatar">
                {item.customerName?.charAt(0)}
              </div>
              <div>
                <h4 className="name">{item.customerName || "Customer"}</h4>
                <p className="location">India</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeTestimonials;
