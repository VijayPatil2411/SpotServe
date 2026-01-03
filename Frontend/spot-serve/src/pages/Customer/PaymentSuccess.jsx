import React, { useEffect, useRef } from "react";
import { useToast } from "../../components/Toast";

const PaymentSuccess = () => {
  const { showToast } = useToast();
  const hasRun = useRef(false); // ✅ prevents double execution in React Strict Mode

  useEffect(() => {
    if (hasRun.current) return; // ❌ stop the second effect run
    hasRun.current = true; // ✅ block any future run

    const confirmPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const jobId = params.get("jobId");

      if (!jobId) {
        showToast("❌ Invalid payment confirmation link.", "error");
        setTimeout(() => {
          window.location.href = "/customer/dashboard";
        }, 3000);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:8080/api/payments/mark-success?jobId=${jobId}`,
          { method: "POST" }
        );

        if (res.ok) {
          showToast("✅ Payment successful! Thank you for your payment.", "success");
          
          // ✅ Redirect to feedback form after 2 seconds
          setTimeout(() => {
            window.location.href = `/feedback/${jobId}`;
          }, 2000);
        } else {
          const errData = await res.json().catch(() => ({}));
          const msg =
            errData.message || errData.error || "⚠️ Server issue during confirmation.";
          showToast(msg, "warning");
          
          // ⚠️ On error, redirect to dashboard
          setTimeout(() => {
            window.location.href = "/customer/dashboard";
          }, 3000);
        }
      } catch (err) {
        console.error("Payment confirm error:", err);
        showToast("⚠️ Error confirming payment status.", "error");
        
        // ❌ On error, redirect to dashboard
        setTimeout(() => {
          window.location.href = "/customer/dashboard";
        }, 3000);
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
