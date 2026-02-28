import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/home";
import Tours from "./pages/Tours";
import Success from "./pages/Success";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import Packages from "./pages/Packages";
import Booking from "./pages/Booking";
import Gallery from "./pages/Gallery";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import Blog from "./pages/Blog";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";

export default function App() {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <Router>
      <nav style={{ backgroundColor: "#333", padding: "12px 0", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link to="/" style={{ color: "white", textDecoration: "none", fontSize: "20px", fontWeight: "bold" }}>
            Lets Go Colombo Tours by J
          </Link>
          <ul style={{ display: "flex", listStyle: "none", margin: "0", padding: "0", gap: "20px", alignItems: "center" }}>
            <li><Link to="/" style={{ color: "white", textDecoration: "none", padding: "8px 12px" }}>Home</Link></li>
            <li><Link to="/booking" style={{ color: "white", textDecoration: "none", padding: "8px 12px", backgroundColor: "#ffc107", color: "#333", borderRadius: "5px", fontWeight: "bold" }}>Book Now</Link></li>
            <li><Link to="/packages" style={{ color: "white", textDecoration: "none", padding: "8px 12px" }}>Packages</Link></li>
            <li><Link to="/contact" style={{ color: "white", textDecoration: "none", padding: "8px 12px", backgroundColor: "#007bff", borderRadius: "5px" }}>Contact</Link></li>
            <li style={{ position: "relative" }}>
              <button 
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                style={{ 
                  color: "white", 
                  backgroundColor: "transparent", 
                  border: "none", 
                  cursor: "pointer", 
                  padding: "8px 12px",
                  fontSize: "16px"
                }}
              >
                More ▼
              </button>
              {showMoreMenu && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  right: "0",
                  backgroundColor: "#222",
                  borderRadius: "5px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                  zIndex: 1000,
                  minWidth: "180px",
                  marginTop: "8px"
                }}>
                  <Link to="/gallery" style={{ display: "block", color: "white", textDecoration: "none", padding: "12px 20px", borderBottom: "1px solid #444" }} onClick={() => setShowMoreMenu(false)}>
                    🖼️ Gallery
                  </Link>
                  <Link to="/privacy" style={{ display: "block", color: "white", textDecoration: "none", padding: "12px 20px", borderBottom: "1px solid #444" }} onClick={() => setShowMoreMenu(false)}>
                    🔒 Privacy Policy
                  </Link>
                  <Link to="/terms" style={{ display: "block", color: "white", textDecoration: "none", padding: "12px 20px", borderBottom: "1px solid #444" }} onClick={() => setShowMoreMenu(false)}>
                    📋 Terms & Conditions
                  </Link>
                  <Link to="/blog" style={{ display: "block", color: "white", textDecoration: "none", padding: "12px 20px" }} onClick={() => setShowMoreMenu(false)}>
                    📝 Blog
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tours" element={<Packages />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/success" element={<Success />} />
        <Route path="/admin" element={<Admin />} />
        
        {/* Admin Portal Routes */}
        <Route path="/admin-panel" element={<AdminLogin />} />
        <Route 
          path="/admin-panel/dashboard" 
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } 
        />
      </Routes>
    </Router>
  );
}