import React from "react";

export default function TourCard({ tour }) {
  return (
    <div className="col-md-4">
      <div className="card mb-3">
        {tour.image && <img src={tour.image} className="card-img-top" alt={tour.title} />}
        <div className="card-body">
          <h5 className="card-title">{tour.title}</h5>
          <p className="card-text text-muted">{tour.description}</p>
          <p className="card-text fw-bold">${tour.price}</p>
          <a href="#booking-form" className="btn btn-primary btn-sm">Book Now</a>
          {tour.whatsapp && (
            <a 
              href={`https://wa.me/${tour.whatsapp}?text=Hi! I want to book ${encodeURIComponent(tour.title)}`} 
              target="_blank" 
              rel="noreferrer"
              className="btn btn-success btn-sm ms-2"
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}