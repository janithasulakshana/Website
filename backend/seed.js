const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./bookings.db");

// Seed tours
const tours = [
  {
    title: "Galle Face & City Walk",
    price: 40,
    description: "Explore the iconic Galle Face Green and historic colonial architecture in the city center. Perfect for a relaxing evening walk.",
    image: "/images/galle-face.jpg",
    whatsapp: "94771234567"
  },
  {
    title: "Lotus Tower Visit",
    price: 50,
    description: "Visit the iconic Lotus Tower for panoramic views of Colombo. An engineering marvel and the perfect spot for photography.",
    image: "/images/lotus-tower.jpg",
    whatsapp: "94771234567"
  },
  {
    title: "Temple & Museum Tour",
    price: 75,
    description: "Visit the sacred Gangaramaya Temple and explore the National Museum. Learn about Sri Lankan culture and heritage.",
    image: "/images/gangaramaya.jpg",
    whatsapp: "94771234567"
  },
  {
    title: "Old Parliament & Viharamaha Devi Park",
    price: 55,
    description: "Discover the historic Old Parliament building and relax in the serene Viharamaha Devi Park with its scenic views.",
    image: "/images/parliament.jpg",
    whatsapp: "94771234567"
  }
];

db.serialize(() => {
  tours.forEach(tour => {
    db.run(
      `INSERT INTO tours (title, price, description, image, whatsapp) VALUES (?, ?, ?, ?, ?)`,
      [tour.title, tour.price, tour.description, tour.image, tour.whatsapp],
      function(err) {
        if (err) {
          console.error(`Error inserting ${tour.title}:`, err);
        } else {
          console.log(`✓ Added tour: ${tour.title}`);
        }
      }
    );
  });
});

db.close(() => {
  console.log("Database seeding completed!");
});
