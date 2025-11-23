// AddVehicleModal.jsx
import React, { useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import api from "../services/api";
import "./AddVehicleModal.css";
import { useToast } from "./Toast";

const AddVehicleModal = ({ show, onClose, onVehicleAdded }) => {
  const [vehicle, setVehicle] = useState({
    make: "",
    model: "",
    plateNo: "",
    year: "",
  });

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

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

      showToast("Vehicle added successfully!", "success");

      setVehicle({ make: "", model: "", plateNo: "", year: "" });
      onVehicleAdded();
      onClose();
    } catch (error) {
      showToast("Failed to add vehicle.", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered className="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Add New Vehicle</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={handleSubmit}>
          
          {/* Make */}
          <label className="field-label">Make</label>
          <input
            type="text"
            name="make"
            value={vehicle.make}
            onChange={handleChange}
            className="field-input"
            placeholder="e.g. Hyundai"
            required
          />

          {/* Model */}
          <label className="field-label">Model</label>
          <input
            type="text"
            name="model"
            value={vehicle.model}
            onChange={handleChange}
            className="field-input"
            placeholder="e.g. Creta"
            required
          />

          {/* Plate Number */}
          <label className="field-label">Plate Number</label>
          <input
            type="text"
            name="plateNo"
            value={vehicle.plateNo}
            onChange={handleChange}
            className="field-input"
            placeholder="e.g. MH12AB1234"
            required
          />

          {/* Year */}
          <label className="field-label">Year</label>
          <input
            type="number"
            name="year"
            value={vehicle.year}
            onChange={handleChange}
            className="field-input"
            placeholder="e.g. 2023"
            required
          />

          <div className="btn-row">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Adding...
                </>
              ) : (
                "Add Vehicle"
              )}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default AddVehicleModal;
