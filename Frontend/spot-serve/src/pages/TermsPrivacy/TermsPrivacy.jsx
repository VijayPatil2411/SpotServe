import React from "react";
import "./TermsPrivacy.css";

const TermsPrivacy = () => {
  return (
    <div className="page-wrapper">
      <section className="terms-hero">
        <h1>Terms & Privacy</h1>
        <p>Our policies ensure transparency, security, and trust for our users.</p>
      </section>

      <section className="terms-content">
        <h2>Terms of Service</h2>
        <p>
          By using SpotServe, you agree to follow our guidelines and policies. We aim to
          provide reliable services while maintaining user accountability.
        </p>

        <h2>Privacy Policy</h2>
        <p>
          Your personal data is important. SpotServe ensures your information is collected
          responsibly, used only for service purposes, and never shared without consent.
        </p>
      </section>
    </div>
  );
};

export default TermsPrivacy;
