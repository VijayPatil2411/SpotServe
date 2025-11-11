import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import api from "../services/api";


const AddVehicleModal = ({ show, onClose, onVehicleAdded }) => {
  const [vehicle, setVehicle] = useState({
    make: "",
    model: "",
    plateNo: "",
    year: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setVehicle({ ...vehicle, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      await api.post("/api/vehicles", vehicle, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Vehicle added successfully!");
      setVehicle({ make: "", model: "", plateNo: "", year: "" });
      onVehicleAdded(); // refresh callback
      onClose();
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert("❌ Failed to add vehicle. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Vehicle</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Make</Form.Label>
            <Form.Control
              type="text"
              name="make"
              value={vehicle.make}
              onChange={handleChange}
              placeholder="e.g. Hyundai"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Model</Form.Label>
            <Form.Control
              type="text"
              name="model"
              value={vehicle.model}
              onChange={handleChange}
              placeholder="e.g. Creta"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Plate Number</Form.Label>
            <Form.Control
              type="text"
              name="plateNo"
              value={vehicle.plateNo}
              onChange={handleChange}
              placeholder="e.g. MH12XY1234"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Year</Form.Label>
            <Form.Control
              type="number"
              name="year"
              value={vehicle.year}
              onChange={handleChange}
              placeholder="e.g. 2023"
              required
            />
          </Form.Group>

          <div className="text-end">
            <Button variant="secondary" onClick={onClose} className="me-2">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                    role="status"
                  />
                  Adding...
                </>
              ) : (
                "Add Vehicle"
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddVehicleModal;
