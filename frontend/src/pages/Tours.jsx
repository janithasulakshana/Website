import React, { useState, useEffect } from "react";
import TourCard from "../components/TourCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Tours() {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", tour_id: "", date: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tours")
      .then(res => {
        setTours(res.data);
        if (res.data.length > 0) {
          setForm(prev => ({ ...prev, tour_id: res.data[0].id }));
        }
      })
      .catch(err => {
        console.error("Error fetching tours:", err);
        setError("Failed to load tours");
      });
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!form.tour_id) {
        setError("Please select a tour");
        setLoading(false);
        return;
      }

      await axios.post("http://localhost:5000/api/bookings", form);
      navigate("/success");
    } catch (err) {
      setError(err.response?.data?.error || "Booking failed. Please try again.");
      setLoading(false);
    }
  };

  if (loading && tours.length === 0) return <div className="container mt-5">Loading tours...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Our Tours</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row mb-5">
        {tours.length === 0 ? (
          <p>No tours available at the moment.</p>
        ) : (
          tours.map(tour => <TourCard key={tour.id} tour={tour} />)
        )}
      </div>

      {tours.length > 0 && (
        <>
          <h3 className="mb-3" id="booking-form">Book Your Tour</h3>
          <form onSubmit={handleSubmit} className="mb-5">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="form-control mb-2"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control mb-2"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              className="form-control mb-2"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <select
              name="tour_id"
              className="form-control mb-2"
              value={form.tour_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a tour</option>
              {tours.map(tour => (
                <option key={tour.id} value={tour.id}>
                  {tour.title} - ${tour.price}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="date"
              className="form-control mb-2"
              value={form.date}
              onChange={handleChange}
              required
            />
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? "Processing..." : "Book Now"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}