import React, { useEffect, useRef, useState } from "react";
import "./Login.css";

const Login = ({ show, onClose }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword] = useState(false);
  const popupRef = useRef(null);

  // new: control exit animation
  const [exiting, setExiting] = useState(false);
  const modalRef = useRef(null);

  // Prevent background scroll when modal open
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
      if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
    };
  }, [show]);

  // Handle OAuth response from popup
  useEffect(() => {
    function handleMessage(event) {
      try {
        if (event.origin !== window.location.origin) return;
      } catch {
        return;
      }

      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "oauth" && data.provider === "google") {
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.close();
          popupRef.current = null;
        }
        alert("Signed in with Google successfully.");
        onClose();
      }

      if (data.type === "oauth_error") {
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.close();
          popupRef.current = null;
        }
        alert(data.message || "Google sign-in failed");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onClose]);

  // When exit animation completes: dispatch event to open registration + close this modal
  useEffect(() => {
    if (!modalRef.current) return;
    const node = modalRef.current;
    function onAnimEnd(e) {
      // only react when our exiting animation finished
      if (!exiting) return;
      // tell the app to open registration modal
      window.dispatchEvent(new Event("open-registration"));
      // close this modal (parent will hide it)
      if (typeof onClose === "function") onClose();
      // reset exiting state
      setExiting(false);
    }
    node.addEventListener("animationend", onAnimEnd);
    return () => node.removeEventListener("animationend", onAnimEnd);
  }, [exiting, onClose]);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((s) => ({ ...s, [name]: undefined }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      console.log("Login payload:", {
        email: form.email.trim(),
        password: form.password,
      });

      // simulate login success
      setTimeout(() => {
        setSubmitting(false);
        alert("Login successful!");
        onClose();
      }, 700);
    } catch {
      setSubmitting(false);
      setErrors({ submit: "Login failed. Try again." });
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
    const base = process.env.REACT_APP_API_BASE || "";
    const oauthUrl = `${base}/auth/google/authorize?popup=true`;
    popupRef.current = openCenteredPopup(oauthUrl, "google_oauth_popup", 600, 700);
    const checkClosed = setInterval(() => {
      if (!popupRef.current || popupRef.current.closed) {
        clearInterval(checkClosed);
        popupRef.current = null;
      }
    }, 500);
  };

  // user clicked "Register" -> start exit animation to swap
  const handleSwapToRegister = () => {
    setExiting(true);
  };

  if (!show) return null;

  return (
    <div className={`login-overlay ${exiting ? "overlay-exiting" : ""}`} role="dialog" aria-modal="true">
      <div className="login-backdrop" aria-hidden />
      <div
        className={`login-modal shadow ${exiting ? "exiting" : ""}`}
        ref={modalRef}
      >
        <button className="login-close" onClick={onClose} aria-label="Close">
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
              autoComplete="email"
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3 position-relative">
            <label className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                name="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
              />
            </div>
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}

          <button type="submit" className="btn login-submit w-100" disabled={submitting}>
            {submitting ? "Signing in…" : "Login"}
          </button>

          <div className="login-google-wrap mb-3 mt-2">
            <button type="button" className="google-btn w-100" onClick={handleGoogleSignIn}>
              <span className="google-icon">G</span>
              <span className="google-text">Continue with Google</span>
            </button>
          </div>

          <div className="login-footer-text mt-3 text-center">
            Don’t have an account?{" "}
            <span className="link-like" onClick={handleSwapToRegister} style={{ cursor: "pointer" }}>
              Register
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
