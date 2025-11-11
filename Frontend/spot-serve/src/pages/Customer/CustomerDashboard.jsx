// src/pages/Customer/CustomerDashboard.jsx
import React, { useEffect, useState } from "react";
import { getAllServices } from "../../services/customerService";
import ServiceCards from "../../components/ServiceCards";

const CustomerDashboard = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllServices();
        console.log("Services fetched:", data);
        setServices(data || []);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Failed to load services. Check console/network.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="mt-4 mb-5">
      <div className="container">
        <h2 className="text-center fw-semibold mb-2">Available Roadside Services</h2>
        <p className="text-center text-muted mb-4">
          Select a service to get quick assistance from nearby mechanics.
        </p>

        {loading && (
          <div className="text-center my-4">
            <div className="spinner-border" role="status" aria-hidden="true"></div>
            <div className="mt-2 text-muted">Loading services...</div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && <ServiceCards services={services} />}
      </div>
    </div>
  );
};

export default CustomerDashboard;
