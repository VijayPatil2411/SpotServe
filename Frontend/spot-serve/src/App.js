import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Shared Components
import Navbar from "./components/Navbar/Navbar";

// Public Pages
import Home from "./pages/Home/Home";
import EmergencyHelp from "./pages/EmergencyHelp/EmergencyHelp";
import AboutUs from "./pages/AboutUs/AboutUs";
import ContactUs from "./pages/ContactUs/ContactUs";
import TermsPrivacy from "./pages/TermsPrivacy/TermsPrivacy";

// Customer Pages
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import MyRequests from "./pages/Customer/MyRequests";
import CustomerProfile from "./pages/Customer/CustomerProfile";
import PaymentSuccess from "./pages/Customer/PaymentSuccess";

// Mechanic Pages
import MechanicDashboard from "./pages/Mechanic/MechanicDashboard";
import MechanicProfile from "./pages/Mechanic/MechanicProfile";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminMechanics from "./pages/Admin/AdminMechanics";

const App = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // 🔥 Listen for login/logout events and update state
  useEffect(() => {
    const syncUser = () => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    };

    window.addEventListener("userLogin", syncUser);
    window.addEventListener("userLogout", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("userLogin", syncUser);
      window.removeEventListener("userLogout", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  // 🔐 Protected Route
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) return <Navigate to="/" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role))
      return <Navigate to="/" replace />;
    return children;
  };

  return (
    <Router>
      <Navbar />

      {/* ToastContainer placed at top-level so toasts persist across unmounts */}
      <ToastContainer
        position="top-right"
        hideProgressBar={true}
        closeOnClick
        autoClose={1000}
        pauseOnHover
        draggable
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/emergency-help" element={<EmergencyHelp />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/terms-privacy" element={<TermsPrivacy />} />

        {/* Customer Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-requests"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <MyRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* Mechanic Routes */}
        <Route
          path="/mechanic/dashboard"
          element={
            <ProtectedRoute allowedRoles={["MECHANIC"]}>
              <MechanicDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mechanic/profile"
          element={
            <ProtectedRoute allowedRoles={["MECHANIC"]}>
              <MechanicProfile />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mechanics"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminMechanics />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
