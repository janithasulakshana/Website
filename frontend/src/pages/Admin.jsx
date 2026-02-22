import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Admin() {
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [tourForm, setTourForm] = useState({ title: "", price: "", description: "", image: "", whatsapp: "" });
  const [showTourForm, setShowTourForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (token) {
      fetchBookings();
      fetchTours();
    }
  }, [token]);

  const fetchBookings = () => {
    axios
      .get("http://localhost:5000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setBookings(res.data))
      .catch(err => setError("Failed to fetch bookings"));
  };

  const fetchTours = () => {
    axios
      .get("http://localhost:5000/api/tours")
      .then(res => setTours(res.data))
      .catch(err => setError("Failed to fetch tours"));
  };

  const handleLogin = async e => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", loginForm);
      localStorage.setItem("adminToken", res.data.token);
      setToken(res.data.token);
      setLoginForm({ email: "", password: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    setBookings([]);
    setTours([]);
  };

  const handleDeleteBooking = async id => {
    if (!window.confirm("Delete this booking?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Booking deleted");
      fetchBookings();
    } catch (err) {
      setError("Failed to delete booking");
    }
  };

  const handleAddTour = async e => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("http://localhost:5000/api/tours", tourForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Tour added successfully");
      setTourForm({ title: "", price: "", description: "", image: "", whatsapp: "" });
      setShowTourForm(false);
      fetchTours();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add tour");
    }
  };

  const handleDeleteTour = async id => {
    if (!window.confirm("Delete this tour?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/tours/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Tour deleted");
      fetchTours();
    } catch (err) {
      setError("Failed to delete tour");
    }
  };

  if (!token) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-4">
            <h3 className="mb-4">Admin Login</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                className="form-control mb-2"
                value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="form-control mb-2"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
              <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row mb-5">
        <div className="col-md-6">
          <h3>Tours</h3>
          <button 
            className="btn btn-primary mb-3"
            onClick={() => setShowTourForm(!showTourForm)}
          >
            {showTourForm ? "Cancel" : "Add New Tour"}
          </button>

          {showTourForm && (
            <form onSubmit={handleAddTour} className="mb-4 p-3 border rounded">
              <input
                type="text"
                placeholder="Title"
                className="form-control mb-2"
                value={tourForm.title}
                onChange={e => setTourForm({ ...tourForm, title: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Price"
                className="form-control mb-2"
                value={tourForm.price}
                onChange={e => setTourForm({ ...tourForm, price: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="form-control mb-2"
                value={tourForm.description}
                onChange={e => setTourForm({ ...tourForm, description: e.target.value })}
              />
              <input
                type="text"
                placeholder="Image URL"
                className="form-control mb-2"
                value={tourForm.image}
                onChange={e => setTourForm({ ...tourForm, image: e.target.value })}
              />
              <input
                type="text"
                placeholder="WhatsApp Number"
                className="form-control mb-2"
                value={tourForm.whatsapp}
                onChange={e => setTourForm({ ...tourForm, whatsapp: e.target.value })}
              />
              <button type="submit" className="btn btn-success">Add Tour</button>
            </form>
          )}

          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tours.map(tour => (
                  <tr key={tour.id}>
                    <td>{tour.title}</td>
                    <td>${tour.price}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteTour(tour.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-md-6">
          <h3>Bookings</h3>
          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Tour</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.name}</td>
                    <td>{b.email}</td>
                    <td>{b.tour_title}</td>
                    <td>{b.date}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteBooking(b.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}