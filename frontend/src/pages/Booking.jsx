import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { TOUR_PACKAGES, CONTACT_INFO } from "../config/constants";

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedTourId = searchParams.get("tour");
  
  const initialTour = TOUR_PACKAGES.find(t => t.id === parseInt(selectedTourId)) || TOUR_PACKAGES[0];

  const [formData, setFormData] = useState({
    tourId: initialTour.id,
    name: "",
    email: "",
    phone: "",
    date: "",
    numberOfPeople: 1,
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Get the currently selected tour from formData with fallback
  const currentTour = TOUR_PACKAGES.find(t => t.id === formData.tourId) || initialTour;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "numberOfPeople" ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.date) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      // Prepare data with correct field names for backend
      const bookingData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        tour_id: formData.tourId,  // Convert tourId to tour_id for backend
        date: formData.date,
        message: formData.message
      };

      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => navigate("/success"), 2000);
      } else {
        setError("Booking failed. Please try again.");
      }
    } catch (err) {
      setError("Error submitting booking. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div style={{ backgroundColor: "#ffffff", color: "#333333", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>✓</div>
          <h2 style={{ fontSize: "32px", marginBottom: "10px" }}>Booking Submitted!</h2>
          <p style={{ fontSize: "18px", color: "#666" }}>Thank you! We'll contact you soon with confirmation details.</p>
          <p style={{ fontSize: "14px", color: "#999" }}>Redirecting to success page...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#ffffff", color: "#333333", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>Book Your Tour</h1>
          <p style={{ fontSize: "18px", color: "#666" }}>Complete the form below to reserve your spot</p>
        </div>

        {/* Main Content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "50px" }}>
          
          {/* Booking Form */}
          <div>
            <h2 style={{ fontSize: "28px", marginBottom: "25px", borderBottom: "3px solid #007bff", paddingBottom: "10px" }}>
              Tour Details
            </h2>
            
            <form onSubmit={handleSubmit}>
              {/* Tour Selection */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>
                  Select Tour Package *
                </label>
                <select
                  name="tourId"
                  value={formData.tourId}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      tourId: parseInt(e.target.value)
                    }));
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "16px",
                    fontFamily: "inherit"
                  }}
                >
                  {TOUR_PACKAGES.map(tour => (
                    <option key={tour.id} value={tour.id}>
                      {tour.name} - ${tour.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "16px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "16px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Phone */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+94 xxx xxx xxx"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "16px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Date */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>
                  Preferred Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "16px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Number of People */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>
                  Number of People
                </label>
                <select
                  name="numberOfPeople"
                  value={formData.numberOfPeople}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "16px",
                    fontFamily: "inherit"
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num} person{num > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>
                  Additional Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Any special requests or questions?"
                  rows="4"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "16px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    resize: "vertical"
                  }}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  padding: "12px",
                  borderRadius: "5px",
                  marginBottom: "20px",
                  borderLeft: "4px solid #f5c6cb"
                }}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "15px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "background-color 0.3s"
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#0056b3"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#007bff"}
              >
                Complete Booking
              </button>
            </form>
          </div>

          {/* Sidebar - Tour Summary & Contact Info */}
          <div>
            {/* Selected Tour Summary */}
            <div style={{
              backgroundColor: "#f8f9fa",
              border: "2px solid #007bff",
              borderRadius: "8px",
              padding: "25px",
              marginBottom: "30px"
            }}>
              <h3 style={{ fontSize: "22px", marginTop: "0", marginBottom: "20px", color: "#007bff" }}>
                Tour Summary
              </h3>
              <div style={{ marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #ddd" }}>
                <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>Selected Package</p>
                <p style={{ margin: "5px 0 0 0", fontSize: "20px", fontWeight: "bold" }}>
                  {currentTour.name}
                </p>
              </div>
              <div style={{ marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #ddd" }}>
                <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>Duration</p>
                <p style={{ margin: "5px 0 0 0", fontSize: "18px", fontWeight: "bold" }}>
                  {currentTour.duration}
                </p>
              </div>
              <div>
                <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>Price</p>
                <p style={{ margin: "5px 0 0 0", fontSize: "24px", fontWeight: "bold", color: "#007bff" }}>
                  ${currentTour.price}
                </p>
              </div>
            </div>

            {/* Booking Information */}
            <div style={{
              backgroundColor: "#e7f3ff",
              borderRadius: "8px",
              padding: "25px",
              marginBottom: "30px"
            }}>
              <h3 style={{ fontSize: "18px", marginTop: "0", marginBottom: "15px" }}>ℹ️ Booking Information</h3>
              <ul style={{ margin: "0", paddingLeft: "20px", lineHeight: "1.8" }}>
                <li>Pickup is included in all packages</li>
                <li>All bookings require a minimum 24-hour notice</li>
                <li>We'll confirm your booking via WhatsApp or email</li>
                <li>Payment can be made upon pickup</li>
              </ul>
            </div>

            {/* Contact Information */}
            <div style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              padding: "25px",
              borderLeft: "4px solid #28a745"
            }}>
              <h3 style={{ fontSize: "18px", marginTop: "0", marginBottom: "20px" }}>📞 Need Help?</h3>
              
              <div style={{ marginBottom: "15px" }}>
                <p style={{ margin: "0 0 8px 0", color: "#666", fontSize: "14px" }}>WhatsApp</p>
                <a 
                  href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "10px 15px",
                    backgroundColor: "#25d366",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "5px",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}
                >
                  💬 Chat on WhatsApp
                </a>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <p style={{ margin: "0 0 8px 0", color: "#666", fontSize: "14px" }}>Email</p>
                <a 
                  href={`mailto:${CONTACT_INFO.email}`}
                  style={{
                    color: "#007bff",
                    textDecoration: "none",
                    fontWeight: "bold",
                    wordBreak: "break-word"
                  }}
                >
                  {CONTACT_INFO.email}
                </a>
              </div>

              <div>
                <p style={{ margin: "0 0 8px 0", color: "#666", fontSize: "14px" }}>Phone</p>
                <a 
                  href={`tel:${CONTACT_INFO.phone}`}
                  style={{
                    color: "#007bff",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "16px"
                  }}
                >
                  {CONTACT_INFO.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ backgroundColor: "#f8f9fa", borderRadius: "8px", padding: "40px", marginBottom: "50px" }}>
          <h2 style={{ fontSize: "32px", marginBottom: "30px", textAlign: "center" }}>Frequently Asked Questions</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>What's included in the tour?</h4>
              <p style={{ margin: "0", color: "#666", lineHeight: "1.6" }}>
                All packages include professional guide, transportation, and refreshments. Check individual package details for specific inclusions.
              </p>
            </div>
            
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>Can I cancel my booking?</h4>
              <p style={{ margin: "0", color: "#666", lineHeight: "1.6" }}>
                Yes! Cancellations made 24 hours before the tour receive a full refund. Cancellations within 24 hours are subject to 50% fee.
              </p>
            </div>
            
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>How many people per group?</h4>
              <p style={{ margin: "0", color: "#666", lineHeight: "1.6" }}>
                Tours accommodate 1-10 people per booking. For larger groups, please contact us directly via WhatsApp or email.
              </p>
            </div>
            
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>When will I receive confirmation?</h4>
              <p style={{ margin: "0", color: "#666", lineHeight: "1.6" }}>
                We'll confirm your booking within 2 hours via WhatsApp or email. Payment is collected at pickup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
