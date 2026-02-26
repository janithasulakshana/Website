import React from "react";
import { Link } from "react-router-dom";
import { CONTACT_INFO, COMPANY_INFO, TOUR_PACKAGES, BENEFITS, TESTIMONIALS, COMMITMENT_POINTS } from "../config/constants";

export default function Home() {
  return (
    <div style={{ backgroundColor: "#ffffff", color: "#333333", minHeight: "100vh", padding: "20px 0" }}>
      {/* Test Section */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", backgroundColor: "#f0f0f0", padding: "20px", borderRadius: "8px", marginBottom: "30px", border: "3px solid #333" }}>
        <h1 style={{ color: "#000", margin: "0 0 15px 0" }}>✅ React is Working!</h1>
        <p style={{ margin: "10px 0", fontSize: "18px" }}><strong>{COMPANY_INFO.name}</strong></p>
        <p style={{ margin: "10px 0", fontSize: "16px" }}>{COMPANY_INFO.tagline}</p>
        
        {/* Contact Info Section */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center", marginTop: "15px", paddingTop: "15px", borderTop: "2px solid #ddd" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>📞</span>
            <a href={`tel:${CONTACT_INFO.phone}`} style={{ textDecoration: "none", color: "#333", fontWeight: "bold" }}>
              {CONTACT_INFO.phoneFormatted}
            </a>
          </div>
          
          <a href="https://wa.me/message/2EY6AGCVL5WRG1" target="_blank" rel="noopener noreferrer" style={{ 
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: "#25d366",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            fontSize: "14px"
          }}>
            💬 WhatsApp Chat
          </a>
          
          <a href={CONTACT_INFO.facebook} target="_blank" rel="noopener noreferrer" style={{ 
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: "#1877f2",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            fontSize: "14px"
          }}>
            📘 Facebook Page
          </a>
        </div>
        
        <Link to="/tours" style={{ display: "inline-block", marginTop: "15px", padding: "10px 20px", backgroundColor: "#007bff", color: "white", textDecoration: "none", borderRadius: "5px" }}>Browse Tours</Link>
      </div>
      {/* Hero Section */}
      <div style={{ maxWidth: "1200px", margin: "30px auto 40px", backgroundColor: "#e9ecef", padding: "40px 20px", borderRadius: "8px", textAlign: "center" }}>
        <h1 style={{ fontSize: "48px", margin: "0 0 15px 0" }}>{COMPANY_INFO.name}</h1>
        <p style={{ fontSize: "24px", color: "#666", margin: "15px 0" }}>{COMPANY_INFO.tagline}</p>
        <p style={{ fontSize: "16px", lineHeight: "1.6", marginBottom: "25px" }}>{COMPANY_INFO.description}</p>
        <Link to="/tours" style={{ display: "inline-block", padding: "12px 30px", backgroundColor: "#007bff", color: "white", textDecoration: "none", borderRadius: "5px", fontSize: "16px", fontWeight: "bold" }}>View Our Tours</Link>
      </div>

      {/* Tour Packages */}
      <div style={{ maxWidth: "1200px", margin: "0 auto 40px", padding: "0 20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", fontSize: "32px" }}>Our Tour Packages</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {TOUR_PACKAGES.map((tour) => (
            <div key={tour.id} style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <div style={{ backgroundColor: "#007bff", color: "white", padding: "15px", fontSize: "20px" }}>{tour.icon} {tour.name}</div>
              <div style={{ padding: "20px" }}>
                <p><strong>Duration:</strong> {tour.duration}</p>
                <p><strong>Price:</strong> <span style={{ fontSize: "24px", color: "#007bff", fontWeight: "bold" }}>${tour.price}</span></p>
                <p>{tour.description}</p>
                <Link to={`/booking?tour=${tour.id}`} style={{ display: "block", padding: "10px", backgroundColor: "#007bff", color: "white", textDecoration: "none", borderRadius: "5px", textAlign: "center", marginTop: "10px", fontWeight: "bold" }}>Book Now</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div style={{ maxWidth: "1200px", margin: "0 auto 40px", padding: "0 20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", fontSize: "32px" }}>Why Choose Us?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          {BENEFITS.map((benefit, i) => (
            <div key={i} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <h3 style={{ fontSize: "40px", margin: "0 0 10px 0" }}>{benefit.icon}</h3>
              <h5 style={{ margin: "10px 0" }}>{benefit.title}</h5>
              <p style={{ color: "#666", fontSize: "14px", margin: "0" }}>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ maxWidth: "1200px", margin: "0 auto 40px", padding: "0 20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", fontSize: "32px" }}>Traveler Reviews</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <p style={{ fontStyle: "italic", color: "#666", margin: "0 0 15px 0" }}>"{t.text}"</p>
              <p style={{ margin: "10px 0", fontWeight: "bold" }}>{t.name}</p>
              <p style={{ margin: "5px 0", color: "#999", fontSize: "14px" }}>{t.location}</p>
              <p style={{ margin: "10px 0", color: "#f39c12" }}>★★★★★</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div style={{ backgroundColor: "#007bff", color: "white", margin: "0 auto 40px", padding: "40px 20px", textAlign: "center", maxWidth: "100%" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 15px 0" }}>Ready to Explore Colombo?</h2>
          <p style={{ fontSize: "18px", marginBottom: "30px", margin: "15px 0 30px 0" }}>Book your tour today!</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            <a href={`tel:${CONTACT_INFO.phone}`} style={{ padding: "15px", backgroundColor: "white", color: "#007bff", textDecoration: "none", borderRadius: "5px", fontWeight: "bold" }}>📞 {CONTACT_INFO.phoneFormatted}</a>
            <a href={`mailto:${CONTACT_INFO.email}`} style={{ padding: "15px", backgroundColor: "white", color: "#007bff", textDecoration: "none", borderRadius: "5px", fontWeight: "bold" }}>✉️ {CONTACT_INFO.email}</a>
            <Link to="/booking" style={{ padding: "15px", backgroundColor: "#ffc107", color: "#333", textDecoration: "none", borderRadius: "5px", fontWeight: "bold" }}>📅 Book Online</Link>
          </div>
        </div>
      </div>

      {/* Commitment */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 40px 20px" }}>
        <div style={{ backgroundColor: "#f0f0f0", padding: "40px 20px", borderRadius: "8px" }}>
          <h3 style={{ marginBottom: "20px" }}>🎯 Our Commitment</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            {COMMITMENT_POINTS.map((p, i) => (
              <div key={i}>
                <h6 style={{ margin: "0 0 8px 0" }}>✓ {p.title}</h6>
                <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}