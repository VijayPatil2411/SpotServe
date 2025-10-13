import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Navbar from "./components/Navbar/Navbar"; // your navbar
import EmergencyHelp from "./pages/EmergencyHelp/EmergencyHelp";
import OurStory from "./pages/OurStory/OurStory";
import AboutUs from "./pages/AboutUs/AboutUs";
import ContactUs from "./pages/ContactUs/ContactUs";
import TermsPrivacy from "./pages/TermsPrivacy/TermsPrivacy";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/emergency-help" element={<EmergencyHelp />} />
        <Route path="/our-story" element={<OurStory />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/terms-privacy" element={<TermsPrivacy />} />
      </Routes>
    </Router>
  );
};

export default App;
