import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../services/api";

const BookRequestModal = ({ show, onClose, service, user }) => {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState({ lat: "", lng: "" });
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [closing, setClosing] = useState(false);

  // Fetch vehicles correctly
  useEffect(() => {
    if (user && show) {
      const token = localStorage.getItem("token");

      api
        .get(`/api/customer/${user.id}/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setVehicles(res.data || []);
        })
        .catch((err) => console.error("Error fetching vehicles:", err));
    }
  }, [user, show]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation not supported!", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
      },
      () => showToast("Unable to detect location!", "error")
    );
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vehicleId || !location.lat || !location.lng) {
      showToast("Select vehicle & location!", "error");
      return;
    }

    try {
      const payload = {
        customerId: user.id,
        serviceId: service.id,
        vehicleId: vehicleId,
        description,
        location: `${location.lat}, ${location.lng}`,
        pickupLat: location.lat,
        pickupLng: location.lng,
      };

      await api.post("/api/customer/jobs", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      showToast("Request placed successfully!", "success");

      setClosing(true);
      setTimeout(() => {
        setClosing(false);
        onClose();
      }, 800);
    } catch (err) {
      console.error("Job creation error:", err);
      showToast("Failed to place service request!", "error");
    }
  };

  return (
    <>
      {/* Toast */}
      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: toast.type === "success" ? "#4CAF50" : "#f44336",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "8px",
            zIndex: 2000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            fontWeight: "500",
          }}
        >
          {toast.message}
        </div>
      )}

      <div className={`custom-modal-wrapper ${closing ? "fade-out" : ""}`}>
        <Modal show={show} onHide={onClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Book {service?.name}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              {/* VEHICLE DROPDOWN */}
              <Form.Group className="mb-3">
                <Form.Label>Select Vehicle</Form.Label>
                <Form.Select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  required
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.plateNo})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* DESCRIPTION */}
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Form.Group>

              
            
              {/* LOCATION */}
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    value={location.lat}
                    placeholder="Latitude"
                    readOnly
                  />
                  <Form.Control
                    type="text"
                    value={location.lng}
                    placeholder="Longitude"
                    readOnly
                  />
                  <Button variant="secondary" onClick={detectLocation}>
                    Detect
                  </Button>
                </div>
              </Form.Group>

              <Button type="submit" className="w-100" variant="primary">
                Submit Request
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default BookRequestModal;
