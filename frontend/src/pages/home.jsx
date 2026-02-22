import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container mt-5">
      <div className="jumbotron bg-light p-5 rounded-lg">
        <h1 className="display-4">Trail Colombo by Janiya</h1>
        <p className="lead">Explore Colombo Like Never Before</p>
        <hr className="my-4" />
        <p>Discover the vibrant culture, historic landmarks, and modern attractions of Colombo with our expertly curated city tours.</p>
        <Link to="/tours" className="btn btn-primary btn-lg">View Our Tours</Link>
      </div>

      <div className="row mt-5">
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">🏛️ Cultural Heritage</h5>
              <p className="card-text">Visit historic temples, museums, and colonial-era buildings that tell the story of Colombo.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">🌆 Modern Attractions</h5>
              <p className="card-text">Experience Colombo's skyline, Lotus Tower, and contemporary development projects.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">🤝 Local Experiences</h5>
              <p className="card-text">Connect with local guides and discover authentic Colombo through personalized tours.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 p-4 bg-light rounded">
        <h3>Why Choose Trail Colombo?</h3>
        <ul className="mt-3">
          <li>Expert local guides with years of experience</li>
          <li>Flexible booking and flexible pricing</li>
          <li>Small group tours for personalized experiences</li>
          <li>WhatsApp support for easy communication</li>
          <li>Professional and safe tours</li>
        </ul>
      </div>
    </div>
  );
}