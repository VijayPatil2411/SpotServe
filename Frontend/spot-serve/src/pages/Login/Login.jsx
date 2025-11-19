import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = ({ show, onClose }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const popupRef = useRef(null);
  const [exiting, setExiting] = useState(false);
  const modalRef = useRef(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  const API_BASE =
    process.env.REACT_APP_API_BASE || "http://localhost:8080/api/auth";

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email required";
    if (!form.password) e.password = "Password required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((s) => ({ ...s, [name]: undefined }));
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        const user = data.user || {
          id: data.id,
          name: data.name,
          role: data.role,
          email: form.email,
          username: data.username || data.name,
        };

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(user));

        window.dispatchEvent(new Event("userLogin"));
        window.dispatchEvent(new Event("storage"));
        showToast("Login successful! 🎉", "success");

        setForm({ email: "", password: "" });

        setTimeout(() => {
          onClose();
          setTimeout(() => {
            navigate("/");
            setTimeout(() => window.location.reload(), 200);
          }, 100);
        }, 300);
      } else {
        showToast(data.error || "Invalid credentials", "error");
      }
    } catch (err) {
      console.error("Login failed:", err);
      showToast("Login failed. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    const oauthUrl = `${API_BASE}/google/authorize?popup=true`;
    popupRef.current = window.open(
      oauthUrl,
      "google_oauth_popup",
      "width=600,height=700"
    );
  };

  const handleSwapToRegister = () => setExiting(true);

  if (!show) return null;

  return (
    <>
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
      <div
        className={`login-overlay ${exiting ? "overlay-exiting" : ""}`}
        role="dialog"
        aria-modal="true"
        /* CLOSE MODAL WHEN CLICKING OUTSIDE */
        onClick={(e) => {
          if (
            e.target &&
            e.target.classList &&
            (e.target.classList.contains("login-overlay") ||
              e.target.classList.contains("login-backdrop"))
          ) {
            onClose();
          }
        }}
      >
        <div className="login-backdrop" aria-hidden />
        <div
          className={`login-modal shadow ${exiting ? "exiting" : ""}`}
          ref={modalRef}
        >
          <button className="login-close" onClick={onClose}>
            &times;
          </button>

          <div className="login-header">
            <div className="login-brand">🔑</div>
            <div>
              <h3 className="login-title">Welcome back to SpotServe</h3>
              <p className="login-sub">Login to access your dashboard</p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                name="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                type="email"
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            <div className="mb-3 position-relative">
              <label className="form-label">Password</label>
              <input
                name="password"
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                value={form.password}
                onChange={handleChange}
                type="password"
                placeholder="Password"
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn login-submit w-100"
              disabled={submitting}
            >
              {submitting ? "Signing in…" : "Login"}
            </button>

            <div className="login-google-wrap mb-3 mt-2">
              <button
                type="button"
                className="google-btn w-100"
                onClick={handleGoogleSignIn}
              >
                <span className="google-icon">G</span>
                <span className="google-text">Continue with Google</span>
              </button>
            </div>

            <div className="login-footer-text mt-3 text-center">
              Don't have an account?{" "}
              <span
                className="link-like"
                onClick={handleSwapToRegister}
                style={{ cursor: "pointer" }}
              >
                Register
              </span>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
