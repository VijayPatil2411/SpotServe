import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// 🔹 Shared Components
import Navbar from "./components/Navbar/Navbar";

// 🔹 Public Pages
import Home from "./pages/Home/Home";
import EmergencyHelp from "./pages/EmergencyHelp/EmergencyHelp";
import OurStory from "./pages/OurStory/OurStory";
import AboutUs from "./pages/AboutUs/AboutUs";
import ContactUs from "./pages/ContactUs/ContactUs";
import TermsPrivacy from "./pages/TermsPrivacy/TermsPrivacy";

// 🔹 Customer Pages
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import MyRequests from "./pages/Customer/MyRequests";
import CustomerProfile from "./pages/Customer/CustomerProfile";

// 🔹 Mechanic Pages
import MechanicDashboard from "./pages/Mechanic/MechanicDashboard"; // ✅

const App = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) return <Navigate to="/" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/emergency-help" element={<EmergencyHelp />} />
        <Route path="/our-story" element={<OurStory />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/terms-privacy" element={<TermsPrivacy />} />

        {/* Customer routes */}
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

        {/* Mechanic routes */}
        <Route
          path="/mechanic/dashboard"
          element={
            <ProtectedRoute allowedRoles={["MECHANIC"]}>
              <MechanicDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
