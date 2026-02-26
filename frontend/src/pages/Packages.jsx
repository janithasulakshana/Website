import React from "react";
import { Link } from "react-router-dom";
import { TOUR_PACKAGES, CONTACT_INFO } from "../config/constants";

export default function Packages() {
  return (
    <div style={{ backgroundColor: "#ffffff", color: "#333333", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Page Title */}
        <h1 style={{ textAlign: "center", fontSize: "48px", marginBottom: "10px" }}>Tour Packages</h1>
        <p style={{ textAlign: "center", fontSize: "18px", color: "#666", marginBottom: "50px" }}>
          Choose the perfect package for your Colombo adventure
        </p>

        {/* Packages Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px", marginBottom: "50px" }}>
          {TOUR_PACKAGES.map((tour) => (
            <div 
              key={tour.id} 
              style={{ 
                border: "2px solid #ddd",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "transform 0.3s, box-shadow 0.3s",
                cursor: "pointer"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
            >
              {/* Header */}
              <div style={{ 
                backgroundColor: "#007bff", 
                color: "white", 
                padding: "25px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "10px" }}>{tour.icon}</div>
                <h3 style={{ margin: "0", fontSize: "24px" }}>{tour.name}</h3>
              </div>

              {/* Content */}
              <div style={{ padding: "25px" }}>
                
                {/* Duration and Price */}
                <div style={{ marginBottom: "20px", textAlign: "center", borderBottom: "1px solid #eee", paddingBottom: "20px" }}>
                  <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
                    <strong>Duration:</strong> {tour.duration}
                  </p>
                  <p style={{ margin: "10px 0 5px 0", fontSize: "32px", color: "#007bff", fontWeight: "bold" }}>
                    ${tour.price}
                  </p>
                </div>

                {/* Description */}
                <p style={{ fontSize: "16px", lineHeight: "1.6", marginBottom: "20px", color: "#555" }}>
                  {tour.description}
                </p>

                {/* Attractions */}
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "bold", color: "#007bff" }}>
                    {tour.attractions}
                  </p>
                </div>

                {/* Includes */}
                <div style={{ backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
                  <h5 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "bold" }}>What's Included:</h5>
                  <ul style={{ margin: "0", paddingLeft: "20px", fontSize: "14px", lineHeight: "1.8" }}>
                    {tour.includes.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: "5px" }}>✓ {item}</li>
                    ))}
                  </ul>
                </div>

                {/* CTA Buttons */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <Link 
                    to={`/booking?tour=${tour.id}`}
                    style={{ 
                      display: "block",
                      padding: "12px", 
                      backgroundColor: "#007bff", 
                      color: "white", 
                      textDecoration: "none", 
                      borderRadius: "5px", 
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "14px"
                    }}
                  >
                    Book Now
                  </Link>
                  <a 
                    href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      display: "block",
                      padding: "12px", 
                      backgroundColor: "#25D366", 
                      color: "white", 
                      textDecoration: "none", 
                      borderRadius: "5px", 
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "14px"
                    }}
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div style={{ 
          backgroundColor: "#f0f0f0", 
          padding: "40px 20px", 
          borderRadius: "12px",
          marginBottom: "50px"
        }}>
          <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Package Details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "30px" }}>
            
            <div>
              <h4 style={{ color: "#007bff", marginBottom: "12px" }}>🚗 Transportation</h4>
              <p>Air-conditioned vehicles with professional drivers. Small group tours (max 3 people) for personalized attention.</p>
            </div>

            <div>
              <h4 style={{ color: "#007bff", marginBottom: "12px" }}>👨‍🏫 Expert Guides</h4>
              <p>Knowledgeable local guides who share insights into Colombo's culture, history, and hidden gems.</p>
            </div>

            <div>
              <h4 style={{ color: "#007bff", marginBottom: "12px" }}>📸 Photography</h4>
              <p>Dedicated photography stops at scenic locations. Professional photos of your group available.</p>
            </div>

            <div>
              <h4 style={{ color: "#007bff", marginBottom: "12px" }}>🍽️ Refreshments</h4>
              <p>Complimentary refreshments included. Full Day tours include lunch at selected local restaurants.</p>
            </div>

            <div>
              <h4 style={{ color: "#007bff", marginBottom: "12px" }}>🎯 Flexible Itinerary</h4>
              <p>Customize your tour based on your interests. We adjust pace and stops to match your preferences.</p>
            </div>

            <div>
              <h4 style={{ color: "#007bff", marginBottom: "12px" }}>🛡️ Safety & Insurance</h4>
              <p>All tours include basic insurance. Professional safety briefing at the start of each tour.</p>
            </div>

          </div>
        </div>

        {/* CTA Section */}
        <div style={{ 
          backgroundColor: "#007bff", 
          color: "white", 
          padding: "40px 20px", 
          borderRadius: "12px",
          textAlign: "center"
        }}>
          <h2 style={{ margin: "0 0 15px 0" }}>Ready to Explore?</h2>
          <p style={{ fontSize: "18px", marginBottom: "25px" }}>Select your preferred package and start your adventure today!</p>
          <Link 
            to="/booking"
            style={{ 
              display: "inline-block",
              padding: "15px 40px", 
              backgroundColor: "white", 
              color: "#007bff", 
              textDecoration: "none", 
              borderRadius: "5px", 
              fontWeight: "bold",
              fontSize: "16px"
            }}
          >
            Book Your Tour
          </Link>
        </div>
      </div>
    </div>
  );
}
