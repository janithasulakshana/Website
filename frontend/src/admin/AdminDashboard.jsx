import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("bookings");
  const [adminEmail, setAdminEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const email = localStorage.getItem("adminEmail");
    
    if (!token) {
      navigate("/admin-panel");
      return;
    }

    setAdminEmail(email);
    fetchData(token);
  }, [navigate]);

  const fetchData = async (token) => {
    try {
      // Fetch bookings
      const bookingsRes = await fetch("http://localhost:5000/api/bookings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      } else {
        setError("Failed to fetch bookings");
      }

      // Fetch tours
      const toursRes = await fetch("http://localhost:5000/api/tours");
      if (toursRes.ok) {
        const toursData = await toursRes.json();
        setTours(toursData);
      }
    } catch (err) {
      setError("Error fetching data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    navigate("/admin-panel");
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      }
    } catch (err) {
      setError("Failed to update booking");
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;

    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setBookings(bookings.filter(b => b.id !== bookingId));
      }
    } catch (err) {
      setError("Failed to delete booking");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "#28a745";
      case "pending":
        return "#ffc107";
      case "cancelled":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: "#ffffff", color: "#333333", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f5f5f5", color: "#333333", minHeight: "100vh" }}>
      {/* Admin Header */}
      <div style={{ backgroundColor: "#333", color: "white", padding: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: "0", fontSize: "24px" }}>👨‍💼 Admin Dashboard</h1>
            <p style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: 0.8 }}>Trail Colombo by Janiya</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Logged in as: <strong>{adminEmail}</strong></p>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 20px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#c82333"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#dc3545"}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 20px" }}>
        
        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "30px", borderBottom: "2px solid #ddd" }}>
          <button
            onClick={() => setActiveTab("bookings")}
            style={{
              padding: "12px 20px",
              backgroundColor: activeTab === "bookings" ? "#007bff" : "#fff",
              color: activeTab === "bookings" ? "white" : "#333",
              border: "none",
              borderRadius: "5px 5px 0 0",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: "-2px",
              borderBottom: activeTab === "bookings" ? "3px solid #007bff" : "2px solid #ddd"
            }}
          >
            📅 Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("tours")}
            style={{
              padding: "12px 20px",
              backgroundColor: activeTab === "tours" ? "#007bff" : "#fff",
              color: activeTab === "tours" ? "white" : "#333",
              border: "none",
              borderRadius: "5px 5px 0 0",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: "-2px",
              borderBottom: activeTab === "tours" ? "3px solid #007bff" : "2px solid #ddd"
            }}
          >
            🎫 Tours ({tours.length})
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
            borderLeft: "4px solid #f5c6cb"
          }}>
            {error}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div>
            <h2 style={{ marginBottom: "20px" }}>Bookings Management</h2>
            {bookings.length === 0 ? (
              <div style={{ backgroundColor: "#fff", padding: "40px", textAlign: "center", borderRadius: "8px" }}>
                <p style={{ color: "#999", fontSize: "16px" }}>No bookings yet</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff", borderRadius: "8px", overflow: "hidden" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #ddd" }}>
                      <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>ID</th>
                      <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Name</th>
                      <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Email</th>
                      <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Phone</th>
                      <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Tour ID</th>
                      <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Date</th>
                      <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Status</th>
                      <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, idx) => (
                      <tr key={booking.id} style={{ borderBottom: "1px solid #eee", backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                        <td style={{ padding: "15px" }}><strong>#{booking.id}</strong></td>
                        <td style={{ padding: "15px" }}>{booking.name}</td>
                        <td style={{ padding: "15px", fontSize: "14px" }}>{booking.email}</td>
                        <td style={{ padding: "15px" }}>{booking.phone}</td>
                        <td style={{ padding: "15px" }}>{booking.tour_id}</td>
                        <td style={{ padding: "15px" }}>{new Date(booking.date).toLocaleDateString()}</td>
                        <td style={{ padding: "15px" }}>
                          <select
                            value={booking.status || "pending"}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "5px",
                              border: "1px solid #ddd",
                              backgroundColor: getStatusColor(booking.status),
                              color: "white",
                              fontWeight: "bold",
                              cursor: "pointer"
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td style={{ padding: "15px" }}>
                          <button
                            onClick={() => deleteBooking(booking.id)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "5px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "12px"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#c82333"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#dc3545"}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tours Tab */}
        {activeTab === "tours" && (
          <div>
            <h2 style={{ marginBottom: "20px" }}>Available Tours</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {tours.map((tour) => (
                <div key={tour.id} style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                  <h3 style={{ marginTop: "0", color: "#007bff" }}>{tour.title}</h3>
                  <p style={{ margin: "10px 0", color: "#666" }}>{tour.description}</p>
                  <p style={{ margin: "10px 0", fontWeight: "bold" }}>💰 Price: <span style={{ color: "#007bff" }}>${tour.price}</span></p>
                  <p style={{ margin: "10px 0", fontSize: "12px", color: "#999" }}>Created: {new Date(tour.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
