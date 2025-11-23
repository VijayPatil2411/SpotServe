import React from "react";
import "./ReceiptModal.css";

const ReceiptModal = ({ receipt, onClose }) => {
  if (!receipt) return null;

  return (
    <div className="receipt-modal-overlay">
      <div className="receipt-modal">
        <h3 className="modal-title">Receipt - Job #{receipt.jobId}</h3>

        <div className="modal-section">
          <p><strong>Status:</strong> {receipt.status}</p>
          <p><strong>Service:</strong> {receipt.serviceName}</p>
          <p><strong>Date:</strong> {new Date(receipt.createdAt).toLocaleString()}</p>
        </div>

        <div className="modal-section">
          <h5>Customer Details</h5>
          <p><strong>Name:</strong> {receipt.customerName}</p>
          <p><strong>ID:</strong> {receipt.customerId}</p>
        </div>

        <div className="modal-section">
          <h5>Mechanic Details</h5>
          <p><strong>Name:</strong> {receipt.mechanicName}</p>
          <p><strong>ID:</strong> {receipt.mechanicId}</p>
        </div>

        <div className="modal-section">
          <h5>Vehicle</h5>
          <p><strong>Plate No:</strong> {receipt.vehiclePlateNo}</p>
        </div>

        <div className="modal-section">
          <h5>Billing</h5>
          <p><strong>Base Amount:</strong> ₹{receipt.baseAmount}</p>
          <p><strong>Extra Amount:</strong> ₹{receipt.extraAmount}</p>
          <h4><strong>Total:</strong> ₹{receipt.totalAmount}</h4>
        </div>

        <div className="modal-actions">
          <button className="print-btn" onClick={() => window.print()}>Print</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
