import React from "react";

export default function Gallery() {
  const galleryItems = [
    { id: 1, title: "Colombo City View", category: "City" },
    { id: 2, title: "Historic Landmarks", category: "Landmarks" },
    { id: 3, title: "Beach Sunset", category: "Nature" },
    { id: 4, title: "Local Markets", category: "Culture" },
    { id: 5, title: "Temple Visit", category: "Landmarks" },
    { id: 6, title: "Street Food Tour", category: "Food" },
    { id: 7, title: "Group Adventure", category: "Tours" },
    { id: 8, title: "Night Scene", category: "City" },
    { id: 9, title: "Scenic Routes", category: "Nature" },
  ];

  return (
    <div style={{ backgroundColor: "#ffffff", color: "#333333", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        <h1 style={{ textAlign: "center", fontSize: "clamp(30px, 7vw, 48px)", marginBottom: "10px" }}>Photo Gallery</h1>
        <p style={{ textAlign: "center", fontSize: "18px", color: "#666", marginBottom: "50px" }}>
          Explore the beauty of Colombo through our tours
        </p>

        {/* Gallery Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          {galleryItems.map((item) => (
            <div 
              key={item.id}
              style={{ 
                backgroundColor: "#f0f0f0",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "transform 0.3s",
                aspectRatio: "1"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <div style={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "center", 
                alignItems: "center",
                textAlign: "center",
                padding: "20px"
              }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>{item.title}</h4>
                <span style={{ 
                  backgroundColor: "#007bff", 
                  color: "white", 
                  padding: "4px 12px", 
                  borderRadius: "20px", 
                  fontSize: "12px" 
                }}>
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Gallery Note */}
        <div style={{ 
          backgroundColor: "#e7f3ff", 
          border: "1px solid #b3d9ff",
          color: "#004085",
          padding: "20px",
          borderRadius: "8px",
          marginTop: "50px",
          textAlign: "center"
        }}>
          <p style={{ margin: "0" }}>
            These are sample gallery images. Real photos from our tours will be displayed here. 
            For a full photo gallery, please visit our Instagram @trailcolombo
          </p>
        </div>
      </div>
    </div>
  );
}
