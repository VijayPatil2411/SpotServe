import React, { useState } from "react";
import BookRequestModal from "./BookRequestModal";
import "./ServiceCards.css";

const serviceIcons = {
  "Puncture Repair": "https://cdn-icons-png.flaticon.com/512/1995/1995574.png",
  "Fuel Delivery": "https://cdn-icons-png.flaticon.com/512/2933/2933806.png",
  "Battery Jumpstart": "https://cdn-icons-png.flaticon.com/512/1995/1995504.png",
  "Towing Service": "https://cdn-icons-png.flaticon.com/512/3081/3081769.png",
  "Engine Breakdown": "https://cdn-icons-png.flaticon.com/512/3845/3845676.png",
  "Flat Tyre Replacement": "https://cdn-icons-png.flaticon.com/512/743/743131.png",
  "Lockout Assistance": "https://cdn-icons-png.flaticon.com/512/1995/1995555.png",
  "Car Wash & Cleaning": "https://cdn-icons-png.flaticon.com/512/565/565422.png",
  "Oil Change": "https://cdn-icons-png.flaticon.com/512/1995/1995578.png",
  "General Inspection": "https://cdn-icons-png.flaticon.com/512/190/190411.png",
};

const ServiceCards = ({ services, user }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: "", type: "" });

  const showToast = (msg, type = "error") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 2500);
  };

  if (!services || services.length === 0) {
    return <p className="text-center text-muted mt-3">No services available.</p>;
  }

  return (
    <div className="container mt-5">
      {/* Toast */}
      {toast.show && (
        <div className={`home-toast toast-${toast.type}`}>{toast.msg}</div>
      )}

      <div className="row justify-content-center">
        {services.map((service) => (
          <div
            key={service.id}
            className="col-md-4 col-lg-3 mb-4 d-flex align-items-stretch"
          >
            <div className="card service-card shadow-sm text-center p-3 border-0">
              <img
                src={
                  serviceIcons[service.name] ||
                  serviceIcons["Battery Jumpstart"]
                }
                alt={service.name}
                className="service-icon mb-3"
              />

              <h5 className="fw-semibold mb-2">{service.name}</h5>
              <p className="text-muted mb-3">
                Base Price: ₹{service.basePrice || service.base_price}
              </p>

              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!user) {
                    showToast("Please login to book a service!", "error");
                    return;
                  }
                  setSelectedService(service);
                }}
              >
                Book Request
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedService && (
        <BookRequestModal
          show={!!selectedService}
          onClose={() => setSelectedService(null)}
          service={selectedService}
          user={user}
        />
      )}
    </div>
  );
};

export default ServiceCards;
