import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../services/api";

const BookRequestModal = ({ show, onClose, service, user }) => {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [closing, setClosing] = useState(false); // ✅ New for smooth fade-out

  useEffect(() => {
    if (user && show) {
      api
        .get(`/api/customer/${user.id}/vehicles`)
        .then((res) => setVehicles(res.data))
        .catch((err) => console.error("Error fetching vehicles:", err));
    }
  }, [user, show]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported on this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        setLocation(`${lat}, ${lng}`);
      },
      () => alert("Unable to detect location.")
    );
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vehicleId || !location) {
      alert("Please select a vehicle and detect location before submitting.");
      return;
    }

    try {
      const payload = {
        customerId: user.id,
        serviceId: service.id,
        vehicleId,
        description,
        imageUrl,
        location,
        pickupLat: coords.lat,
        pickupLng: coords.lng,
      };

      await api.post("/api/customer/jobs", payload);

      // ✅ Show toast first
      showToast("✅ Service request placed successfully!", "success");

      // ✅ Start smooth close animation
      setClosing(true);
      setTimeout(() => {
        setClosing(false);
        onClose();
      }, 800); // duration matches CSS fade
    } catch (error) {
      console.error("Error creating job:", error);
      showToast("❌ Failed to place service request.", "error");
    }
  };

  return (
    <>
      {/* ✅ Toast Display */}
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
            transition: "opacity 0.4s ease",
            opacity: toast.show ? 1 : 0,
          }}
        >
          {toast.message}
        </div>
      )}

      {/* ✅ Modal with smooth fade-out */}
      <div className={`custom-modal-wrapper ${closing ? "fade-out" : ""}`}>
        <Modal show={show} onHide={onClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Book {service?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
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
                      {v.make} {v.model} ({v.plate_no})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Problem Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue briefly"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Image URL (optional)</Form.Label>
                <Form.Control
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image link (optional)"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    value={location}
                    placeholder="Click Detect to get your location"
                    readOnly
                  />
                  <Button variant="secondary" onClick={detectLocation}>
                    Detect
                  </Button>
                </div>
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100">
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
