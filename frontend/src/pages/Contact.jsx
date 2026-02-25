import React, { useState } from "react";
import { CONTACT_INFO, COMPANY_INFO } from "../config/constants";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would send to your backend
    console.log("Contact form submitted:", form);
    setSubmitted(true);
    setTimeout(() => {
      setForm({ name: "", email: "", phone: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div style={{ backgroundColor: "#ffffff", color: "#333333", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Page Title */}
        <h1 style={{ textAlign: "center", fontSize: "48px", marginBottom: "10px" }}>Get In Touch</h1>
        <p style={{ textAlign: "center", fontSize: "18px", color: "#666", marginBottom: "50px" }}>
          We'd love to hear from you. Contact us with any questions!
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>
          
          {/* Contact Information */}
          <div>
            <h2 style={{ fontSize: "28px", marginBottom: "30px" }}>Contact Information</h2>
            
            <div style={{ marginBottom: "30px" }}>
              <h4 style={{ color: "#007bff", marginBottom: "10px" }}>📞 Phone</h4>
              <a href={`tel:${CONTACT_INFO.phone}`} style={{ fontSize: "18px", color: "#333", textDecoration: "none" }}>
                {CONTACT_INFO.phoneFormatted}
              </a>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <h4 style={{ color: "#007bff", marginBottom: "10px" }}>✉️ Email</h4>
              <a href={`mailto:${CONTACT_INFO.email}`} style={{ fontSize: "18px", color: "#333", textDecoration: "none" }}>
                {CONTACT_INFO.email}
              </a>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <h4 style={{ color: "#007bff", marginBottom: "10px" }}>💬 WhatsApp</h4>
              <a href={`https://wa.me/${CONTACT_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "18px", color: "#333", textDecoration: "none" }}>
                Chat with us on WhatsApp
              </a>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <h4 style={{ color: "#007bff", marginBottom: "10px" }}>🌐 Follow Us</h4>
              <p style={{ margin: "10px 0" }}>
                <a href={CONTACT_INFO.facebook} target="_blank" rel="noopener noreferrer" style={{ color: "#007bff", textDecoration: "none", marginRight: "20px" }}>
                  Facebook
                </a>
                <a href={CONTACT_INFO.instagram} target="_blank" rel="noopener noreferrer" style={{ color: "#007bff", textDecoration: "none" }}>
                  Instagram
                </a>
              </p>
            </div>

            <div style={{ backgroundColor: "#f0f0f0", padding: "20px", borderRadius: "8px", marginTop: "30px" }}>
              <h4 style={{ marginBottom: "10px" }}>✓ Business Hours</h4>
              <p style={{ margin: "5px 0" }}>Weekdays: 8:00 AM - 6:00 PM</p>
              <p style={{ margin: "5px 0" }}>Weekends: 8:00 AM - 7:00 PM</p>
              <p style={{ margin: "5px 0" }}>Holidays: By Appointment</p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 style={{ fontSize: "28px", marginBottom: "30px" }}>Send us a Message</h2>
            
            {submitted ? (
              <div style={{ 
                backgroundColor: "#d4edda", 
                border: "1px solid #c3e6cb", 
                color: "#155724", 
                padding: "20px", 
                borderRadius: "8px",
                textAlign: "center"
              }}>
                <h4 style={{ margin: "0 0 10px 0" }}>✅ Thank You!</h4>
                <p>We've received your message and will get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={form.name}
                    onChange={handleChange}
                    required
                    style={{ 
                      width: "100%", 
                      padding: "12px", 
                      border: "1px solid #ddd", 
                      borderRadius: "5px",
                      fontSize: "16px",
                      boxSizing: "border-box"
                    }}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={form.email}
                    onChange={handleChange}
                    required
                    style={{ 
                      width: "100%", 
                      padding: "12px", 
                      border: "1px solid #ddd", 
                      borderRadius: "5px",
                      fontSize: "16px",
                      boxSizing: "border-box"
                    }}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={form.phone}
                    onChange={handleChange}
                    style={{ 
                      width: "100%", 
                      padding: "12px", 
                      border: "1px solid #ddd", 
                      borderRadius: "5px",
                      fontSize: "16px",
                      boxSizing: "border-box"
                    }}
                    placeholder="Your phone number"
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Message</label>
                  <textarea 
                    name="message" 
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    style={{ 
                      width: "100%", 
                      padding: "12px", 
                      border: "1px solid #ddd", 
                      borderRadius: "5px",
                      fontSize: "16px",
                      boxSizing: "border-box",
                      fontFamily: "Arial, sans-serif"
                    }}
                    placeholder="Tell us about your inquiry..."
                  />
                </div>

                <button 
                  type="submit"
                  style={{ 
                    padding: "15px 30px", 
                    backgroundColor: "#007bff", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "5px", 
                    fontSize: "16px", 
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
