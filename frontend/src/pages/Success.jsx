import React from "react";
import { Link } from "react-router-dom";

export default function Success() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="alert alert-success" role="alert">
            <h2 className="alert-heading">✓ Booking Successful!</h2>
            <hr />
            <p>Thank you for booking with us!</p>
            <p className="mb-0">We will contact you soon to confirm your tour details.</p>
          </div>
          <p className="mt-4 text-muted">A confirmation email has been sent to your email address.</p>
          <div className="mt-4">
            <Link to="/tours" className="btn btn-primary me-2">Book Another Tour</Link>
            <Link to="/" className="btn btn-secondary">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}