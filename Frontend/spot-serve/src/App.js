import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import EmergencyHelp from "./pages/EmergencyHelp/EmergencyHelp";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/emergency-help" element={<EmergencyHelp />} />
      </Routes>
    </Router>
  );
};

export default App;
