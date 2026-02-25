import React from "react";

export default function Blog() {
  const blogs = [
    {
      id: 1,
      title: "Top 5 Must-See Attractions in Colombo",
      date: "February 20, 2026",
      author: "Janiya",
      excerpt: "Discover the most iconic landmarks and attractions that define Colombo's rich cultural heritage.",
      content: "Colombo is a vibrant city with a blend of colonial architecture, modern shopping, and spiritual temples. Don't miss the Galle Face Green, the Independence Square, the Colombo National Museum, the Gangaramaya Temple, and the Mount Lavinia Beach. Each offers a unique perspective on Colombo's history and contemporary life."
    },
    {
      id: 2,
      title: "Local Food Guide: Street Food in Colombo",
      date: "February 18, 2026",
      author: "Janiya",
      excerpt: "Experience authentic Sri Lankan street food and local delicacies that travelers should not miss.",
      content: "Sri Lankan street food is a culinary adventure waiting to happen. From kottu roti to lamprais, from devilled preparations to jaggery-based sweets, Colombo's street food scene offers incredible flavors at affordable prices. Our tours include stops at the best street food vendors and local markets where you can taste authentic flavors."
    },
    {
      id: 3,
      title: "Best Time to Visit Colombo",
      date: "February 15, 2026",
      author: "Janiya",
      excerpt: "Plan your perfect Colombo getaway with our guide to the best seasons and weather conditions.",
      content: "The best time to visit Colombo is from December to March during the dry season. The weather is pleasant, and you can enjoy outdoor activities without worrying about heavy rain. However, Colombo is beautiful year-round, and each season offers unique experiences. We offer tours throughout the year, rain or shine!"
    },
    {
      id: 4,
      title: "Tips for First-Time Visitors to Sri Lanka",
      date: "February 10, 2026",
      author: "Janiya",
      excerpt: "Essential travel tips to make your first Sri Lankan experience memorable and hassle-free.",
      content: "First-time visitors to Sri Lanka should know about the local currency (LKR), transportation options, cultural etiquette, and safety tips. Always respect temples and sacred sites, dress modestly when visiting religious places, and try to learn a few Sinhala phrases. Our guides are experienced in helping first-time visitors navigate the city comfortably."
    },
    {
      id: 5,
      title: "Photography Tips for Traveling in Colombo",
      date: "February 5, 2026",
      author: "Janiya",
      excerpt: "Capture stunning moments during your tour with these professional photography tips.",
      content: "Golden hour photography is magical in Colombo, especially at Galle Face Green during sunset. Capture the energy of local markets, the serenity of temples, and the vibrancy of street life. Our tours include dedicated photography stops and our guides can suggest the best angles and timings for different locations."
    },
    {
      id: 6,
      title: "Understanding Colombo's Colonial History",
      date: "January 30, 2026",
      author: "Janiya",
      excerpt: "Explore the fascinating colonial past that shaped modern-day Colombo's architecture and culture.",
      content: "Colombo's colonial history dates back to the Portuguese and Dutch periods, followed by British rule. The colonial influence is visible in the architecture, place names, and cultural practices. Our knowledgeable guides share detailed stories about how these historical events shaped Colombo into the city it is today."
    }
  ];

  return (
    <div style={{ backgroundColor: "#ffffff", color: "#333333", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        <h1 style={{ textAlign: "center", fontSize: "48px", marginBottom: "10px" }}>Travel Blog</h1>
        <p style={{ textAlign: "center", fontSize: "18px", color: "#666", marginBottom: "50px" }}>
          Stories, tips, and insights about Colombo travel
        </p>

        {/* Blog Posts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
          {blogs.map((blog) => (
            <article 
              key={blog.id}
              style={{
                backgroundColor: "#f9f9f9",
                border: "1px solid #ddd",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: "transform 0.3s",
                cursor: "pointer"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              {/* Header */}
              <div style={{ 
                backgroundColor: "#007bff", 
                color: "white", 
                padding: "20px"
              }}>
                <h3 style={{ margin: "0", fontSize: "20px" }}>{blog.title}</h3>
              </div>

              {/* Meta Info */}
              <div style={{ 
                padding: "15px 20px", 
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                color: "#666"
              }}>
                <span>📅 {blog.date}</span>
                <span>✍️ {blog.author}</span>
              </div>

              {/* Content */}
              <div style={{ padding: "20px" }}>
                <p style={{ margin: "0 0 15px 0", fontSize: "15px", lineHeight: "1.6", fontStyle: "italic" }}>
                  {blog.excerpt}
                </p>
                <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.6", color: "#555" }}>
                  {blog.content.substring(0, 150)}...
                </p>
              </div>

              {/* Footer */}
              <div style={{ 
                padding: "15px 20px", 
                backgroundColor: "#f0f0f0",
                textAlign: "center",
                borderTop: "1px solid #eee"
              }}>
                <button 
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}
                >
                  Read More
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Subscribe Section */}
        <div style={{
          backgroundColor: "#007bff",
          color: "white",
          padding: "40px 20px",
          borderRadius: "12px",
          textAlign: "center",
          marginTop: "50px"
        }}>
          <h2 style={{ marginTop: "0" }}>Subscribe to Our Blog</h2>
          <p style={{ marginBottom: "25px" }}>Get travel tips and Colombo stories delivered to your inbox</p>
          <div style={{ display: "flex", gap: "10px", maxWidth: "500px", margin: "0 auto" }}>
            <input 
              type="email" 
              placeholder="Enter your email"
              style={{
                flex: 1,
                padding: "12px 15px",
                border: "none",
                borderRadius: "5px",
                fontSize: "14px"
              }}
            />
            <button 
              style={{
                backgroundColor: "#ffc107",
                color: "#333",
                border: "none",
                padding: "12px 25px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
