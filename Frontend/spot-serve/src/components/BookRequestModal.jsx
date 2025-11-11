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

  // ✅ Fetch user's vehicles when modal opens
  useEffect(() => {
    if (user && show) {
      api
        .get(`/api/customer/${user.id}/vehicles`)
        .then((res) => setVehicles(res.data))
        .catch((err) => console.error("Error fetching vehicles:", err));
    }
  }, [user, show]);

  // ✅ Detect current location (latitude & longitude)
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
      (err) => alert("Unable to detect location.")
    );
  };

  // ✅ Handle form submission
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
      alert("✅ Service request placed successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating job:", error);
      alert("❌ Failed to place service request. Check console for details.");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Book {service?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Vehicle Selection */}
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

          {/* Description */}
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

          {/* Image URL */}
          <Form.Group className="mb-3">
            <Form.Label>Image URL (optional)</Form.Label>
            <Form.Control
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image link (optional)"
            />
          </Form.Group>

          {/* Location */}
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
  );
};

export default BookRequestModal;
