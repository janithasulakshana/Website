import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/home";
import Tours from "./pages/Tours";
import Success from "./pages/Success";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Router>
      <nav style={{ backgroundColor: "#333", padding: "12px 0", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link to="/" style={{ color: "white", textDecoration: "none", fontSize: "20px", fontWeight: "bold" }}>
            Trail Colombo by Janiya
          </Link>
          <ul style={{ display: "flex", listStyle: "none", margin: "0", padding: "0", gap: "30px" }}>
            <li><Link to="/" style={{ color: "white", textDecoration: "none" }}>Home</Link></li>
            <li><Link to="/tours" style={{ color: "white", textDecoration: "none" }}>Tours</Link></li>
            <li><Link to="/admin" style={{ color: "white", textDecoration: "none" }}>Admin</Link></li>
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/success" element={<Success />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}