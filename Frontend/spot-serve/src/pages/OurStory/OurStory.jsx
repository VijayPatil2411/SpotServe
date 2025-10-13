import React from "react";
import "./OurStory.css";

const OurStory = () => {
  return (
    <div className="page-wrapper">
      <section className="ourstory-hero">
        <h1>Our Story</h1>
        <p>Discover how SpotServe began and our journey in transforming car service experiences.</p>
      </section>

      <section className="ourstory-content">
        <h2>From Vision to Reality</h2>
        <p>
          SpotServe was founded with a mission to simplify vehicle servicing. Our team
          believes in transparent, reliable, and customer-centric services that save time
          and build trust. Over the years, we've grown into a platform connecting car owners
          with top-quality service providers across the city.
        </p>
        <p>
          Every feature we design, from live job tracking to seamless payments, is inspired
          by our passion for innovation and excellence.
        </p>
      </section>
    </div>
  );
};

export default OurStory;
