const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = new sqlite3.Database("./bookings.db");

// Create tables
db.run(`CREATE TABLE IF NOT EXISTS tours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image TEXT,
    whatsapp TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    tour_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Middleware for admin authentication
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    
    try {
        const decoded = jwt.verify(token, "your-secret-key");
        req.admin = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid token" });
    }
};

// Tours API
app.get("/api/tours", (req, res) => {
    db.all("SELECT * FROM tours", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post("/api/tours", authenticateAdmin, (req, res) => {
    const { title, price, description, image, whatsapp } = req.body;
    if (!title || !price) return res.status(400).json({ error: "Missing required fields" });
    
    db.run(
        `INSERT INTO tours (title, price, description, image, whatsapp) VALUES (?, ?, ?, ?, ?)`,
        [title, price, description, image, whatsapp],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});

app.delete("/api/tours/:id", authenticateAdmin, (req, res) => {
    db.run("DELETE FROM tours WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Bookings API
app.get("/api/bookings", authenticateAdmin, (req, res) => {
    db.all("SELECT b.*, t.title as tour_title FROM bookings b JOIN tours t ON b.tour_id = t.id", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post("/api/bookings", (req, res) => {
    const { name, email, phone, tour_id, date } = req.body;
    
    // Validate input
    if (!name || !email || !phone || !tour_id || !date) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Get tour details
    db.get("SELECT * FROM tours WHERE id = ?", [tour_id], (err, tour) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!tour) return res.status(404).json({ error: "Tour not found" });
        
        db.run(
            `INSERT INTO bookings (name, email, phone, tour_id, date) VALUES (?, ?, ?, ?, ?)`,
            [name, email, phone, tour_id, date],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                
                // Send confirmation email (optional)
                sendBookingConfirmation(email, name, tour.title, date);
                
                res.json({ success: true, id: this.lastID });
            }
        );
    });
});

app.put("/api/bookings/:id", authenticateAdmin, (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status required" });
    
    db.run("UPDATE bookings SET status = ? WHERE id = ?", [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete("/api/bookings/:id", authenticateAdmin, (req, res) => {
    db.run("DELETE FROM bookings WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Admin Authentication
app.post("/api/admin/register", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run(
        `INSERT INTO admins (email, password) VALUES (?, ?)`,
        [email, hashedPassword],
        function(err) {
            if (err) return res.status(500).json({ error: "Email already exists" });
            res.json({ success: true });
        }
    );
});

app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    
    db.get("SELECT * FROM admins WHERE email = ?", [email], (err, admin) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!admin) return res.status(401).json({ error: "Invalid credentials" });
        
        const isValidPassword = bcrypt.compareSync(password, admin.password);
        if (!isValidPassword) return res.status(401).json({ error: "Invalid credentials" });
        
        const token = jwt.sign({ id: admin.id, email: admin.email }, "your-secret-key", { expiresIn: "24h" });
        res.json({ success: true, token });
    });
});

// Email notification function (mock - integrate with nodemailer for real emails)
function sendBookingConfirmation(email, name, tourTitle, date) {
    // TODO: Implement with nodemailer for real email sending
    console.log(`Booking confirmation sent to ${email}`);
}

app.listen(5000, "127.0.0.1", () => console.log("Backend running at http://localhost:5000"));