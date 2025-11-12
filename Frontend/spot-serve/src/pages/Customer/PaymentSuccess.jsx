import React, { useEffect } from "react";

const PaymentSuccess = () => {
  useEffect(() => {
    const confirmPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const jobId = params.get("jobId");

      if (!jobId) {
        alert("❌ Invalid payment confirmation link.");
        window.location.href = "/customer/dashboard";
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:8080/api/payments/mark-success?jobId=${jobId}`,
          { method: "POST" }
        );

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          console.log("Payment confirmed:", data);
          alert("✅ Payment successful! Thank you for your payment.");
        } else {
          alert("⚠️ Payment confirmed, but server did not respond properly.");
        }

        // ⏳ Small delay before redirect for UX polish
        setTimeout(() => {
          window.location.href = "/customer/dashboard";
        }, 2000);
      } catch (err) {
        console.error("Error confirming payment:", err);
        alert("⚠️ Error confirming payment status. Please contact support.");
        window.location.href = "/customer/dashboard";
      }
    };

    confirmPayment();
  }, []);

  return (
    <div className="container text-center mt-5">
      <h2 className="fw-bold text-success mb-3">
        Processing Payment Confirmation...
      </h2>
      <p className="text-muted mb-4">
        Please wait while we confirm your payment. You will be redirected shortly.
      </p>
      <div
        className="spinner-border text-success"
        role="status"
        style={{ width: "3rem", height: "3rem" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default PaymentSuccess;
