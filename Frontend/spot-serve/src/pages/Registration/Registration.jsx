import React, { useEffect, useRef, useState } from "react";
import { useToast } from "../../components/Toast";
import "./Registration.css";

const Registration = ({ show, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [exiting, setExiting] = useState(false); // ✅ brought back only for smooth swap

  const popupRef = useRef(null);
  const modalRef = useRef(null);
  const API_BASE =
    process.env.REACT_APP_API_BASE || "http://localhost:8080/api/auth";

  const { showToast } = useToast();

  // Reset exiting when modal opens
  useEffect(() => {
    if (show) setExiting(false);
    document.body.style.overflow = show ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
      if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
    };
  }, [show]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter valid 10-digit number";
    if (!form.password) e.password = "Password required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((s) => ({ ...s, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      });

      const text = await res.text();

      if (text.toLowerCase().includes("successful")) {
        showToast("Registration successful! 🎉", "success");

        setForm({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          setExiting(true);
          setTimeout(() => {
            onClose();
            window.dispatchEvent(new CustomEvent("openLogin"));
          }, 400);
        }, 1000);
      } else {
        showToast(text || "Registration failed. Try again.", "error");
      }
    } catch (err) {
      console.error("Registration failed:", err);
      showToast("Registration failed. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openCenteredPopup = (url, name, width = 600, height = 700) => {
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    const features = `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars=yes,status=1`;
    const popup = window.open(url, name, features);
    if (popup) popup.focus();
    return popup;
  };

  const handleGoogleSignIn = () => {
    const oauthUrl = `${API_BASE}/google/authorize?popup=true`;
    popupRef.current = openCenteredPopup(oauthUrl, "google_oauth_popup", 600, 700);
  };

  const handleSwapToLogin = () => {
    setExiting(true);
    setTimeout(() => {
      onClose();
      window.dispatchEvent(new CustomEvent("openLogin"));
    }, 400);
  };

  if (!show) return null;

  return (
    <>
      <div
        className={`reg-overlay ${exiting ? "overlay-exiting" : ""}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (
            e.target &&
            e.target.classList &&
            (e.target.classList.contains("reg-overlay") ||
              e.target.classList.contains("reg-backdrop"))
          ) {
            onClose();
          }
        }}
      >
        <div className="reg-backdrop" aria-hidden />
        <div
          className={`reg-modal shadow ${exiting ? "exiting" : ""}`}
          ref={modalRef}
        >
          <button className="reg-close" onClick={onClose}>
            &times;
          </button>

          <div className="reg-header">
            <div className="reg-brand">🚗</div>
            <div>
              <h3 className="reg-title">Create your SpotServe account</h3>
              <p className="reg-sub">
                Sign up to manage your vehicles and services
              </p>
            </div>
          </div>

          <form className="reg-form" onSubmit={handleSubmit} noValidate>
            {/* Form fields unchanged */}
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                name="name"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
              />
              {errors.name && (
                <div className="invalid-feedback">{errors.name}</div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                name="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="you@example.com"
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input
                name="phone"
                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit phone number"
              />
              {errors.phone && (
                <div className="invalid-feedback">{errors.phone}</div>
              )}
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Password</label>
                <input
                  name="password"
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                />
                {errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Confirm Password</label>
                <input
                  name="confirmPassword"
                  className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  type="password"
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword}</div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn reg-submit w-100"
              disabled={submitting}
            >
              {submitting ? "Registering…" : "Register"}
            </button>

            <div className="reg-google-wrap mb-3 mt-2">
              <button
                type="button"
                className="google-btn w-100"
                onClick={handleGoogleSignIn}
              >
                <span className="google-icon">G</span>
                <span className="google-text">Continue with Google</span>
              </button>
            </div>

            <div className="reg-footer-text mt-3 text-center">
              Already have an account?{" "}
              <span
                className="link-like"
                onClick={handleSwapToLogin}
                style={{ cursor: "pointer" }}
              >
                Login
              </span>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Registration;
