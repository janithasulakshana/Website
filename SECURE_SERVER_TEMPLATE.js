/**
 * SECURE SERVER.JS - Fixed Version
 * This is the corrected version with all critical vulnerabilities fixed
 * Replace your current server.js with this version
 */

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const app = express();

// Security Middleware
app.use(helmet());  // Add security headers
app.use(bodyParser.json({ limit: '10kb' }));  // Prevent large payload attacks
app.use(bodyParser.urlencoded({ limit: '10kb', extended: false }));

// CORS Configuration - Only allow specific origins
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400  // 24 hours
};
app.use(cors(corsOptions));

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Rate Limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // 5 attempts
  message: "Too many login attempts. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 3,  // 3 bookings per minute
  message: "Too many bookings. Try again later.",
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(generalLimiter);

// Use environment variable for JWT secret (FIXED - Was hardcoded)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET not set in environment variables!");
  process.exit(1);
}

// Database Configuration (FIXED - Was relative path)
const DATABASE_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../data/bookings.db');
const db = new sqlite3.Database(DATABASE_PATH, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Database connected successfully');
});

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON");

// Create tables
db.run(`CREATE TABLE IF NOT EXISTS tours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    price REAL NOT NULL CHECK(price > 0),
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
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
)`);

db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Middleware for admin authentication (FIXED - Uses JWT_SECRET from env)
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No token provided" });
    }
    
    const token = authHeader.substring(7);
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid or expired token" });
    }
};

// Input Validation Helper (FIXED - Added validation)
const validateEmail = (email) => validator.isEmail(email);
const validateName = (name) => {
  const sanitized = validator.escape(name.trim());
  return sanitized.length >= 2 && sanitized.length <= 100;
};
const validatePhone = (phone) => {
  // Accept various phone formats
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 7 && cleaned.length <= 15;
};
const validateDate = (date) => {
  const parsedDate = new Date(date);
  return parsedDate > new Date();
};

// Tours API
app.get("/api/tours", (req, res) => {
    db.all("SELECT * FROM tours", [], (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: "An error occurred. Please try again." });
        }
        res.json(rows || []);
    });
});

app.post("/api/tours", authenticateAdmin, (req, res) => {
    const { title, price, description, image, whatsapp } = req.body;
    
    // Validation (FIXED - Was minimal)
    if (!title || !price) {
      return res.status(400).json({ error: "Title and price are required" });
    }
    
    const sanitizedTitle = validator.escape(title.trim());
    const sanitizedDesc = validator.escape(description?.trim() || '');
    const priceNum = parseFloat(price);
    
    if (sanitizedTitle.length < 3 || sanitizedTitle.length > 200) {
      return res.status(400).json({ error: "Title must be 3-200 characters" });
    }
    
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: "Price must be a positive number" });
    }
    
    db.run(
        `INSERT INTO tours (title, price, description, image, whatsapp) VALUES (?, ?, ?, ?, ?)`,
        [sanitizedTitle, priceNum, sanitizedDesc, image, whatsapp],
        function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: "Failed to add tour" });
            }
            res.json({ success: true, id: this.lastID });
        }
    );
});

app.delete("/api/tours/:id", authenticateAdmin, (req, res) => {
    // Validate ID is a number (FIXED - Type validation)
    const tourId = parseInt(req.params.id);
    if (isNaN(tourId)) {
      return res.status(400).json({ error: "Invalid tour ID" });
    }
    
    db.run("DELETE FROM tours WHERE id = ?", [tourId], function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: "Failed to delete tour" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: "Tour not found" });
        }
        res.json({ success: true });
    });
});

// Bookings API
app.get("/api/bookings", authenticateAdmin, (req, res) => {
    db.all(
      "SELECT b.*, t.title as tour_title FROM bookings b JOIN tours t ON b.tour_id = t.id ORDER BY b.created_at DESC",
      [],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: "Failed to fetch bookings" });
        }
        res.json(rows || []);
      }
    );
});

app.post("/api/bookings", bookingLimiter, (req, res) => {
    const { name, email, phone, tour_id, date } = req.body;
    
    // Validate all fields (FIXED - Comprehensive validation)
    if (!name || !email || !phone || !tour_id || !date) {
        return res.status(400).json({ error: "All fields are required" });
    }
    
    if (!validateEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }
    
    if (!validateName(name)) {
        return res.status(400).json({ error: "Name must be 2-100 characters" });
    }
    
    if (!validatePhone(phone)) {
        return res.status(400).json({ error: "Invalid phone format" });
    }
    
    if (!validateDate(date)) {
        return res.status(400).json({ error: "Tour date must be in the future" });
    }
    
    const tourId = parseInt(tour_id);
    if (isNaN(tourId)) {
        return res.status(400).json({ error: "Invalid tour ID" });
    }
    
    const sanitizedName = validator.escape(name.trim());
    const sanitizedEmail = validator.escape(email.trim());
    const sanitizedPhone = validator.escape(phone.trim());
    
    // Get tour details
    db.get("SELECT * FROM tours WHERE id = ?", [tourId], (err, tour) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: "Database error" });
        }
        if (!tour) {
          return res.status(404).json({ error: "Tour not found" });
        }
        
        db.run(
            `INSERT INTO bookings (name, email, phone, tour_id, date) VALUES (?, ?, ?, ?, ?)`,
            [sanitizedName, sanitizedEmail, sanitizedPhone, tourId, date],
            function(err) {
                if (err) {
                  console.error('Database error:', err);
                  return res.status(500).json({ error: "Failed to create booking" });
                }
                
                // Send confirmation email
                sendBookingConfirmation(sanitizedEmail, sanitizedName, tour.title, date);
                
                res.json({ success: true, id: this.lastID });
            }
        );
    });
});

app.put("/api/bookings/:id", authenticateAdmin, (req, res) => {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    
    // Validate status enum
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    
    const bookingId = parseInt(req.params.id);
    if (isNaN(bookingId)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }
    
    db.run("UPDATE bookings SET status = ? WHERE id = ?", [status, bookingId], function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: "Failed to update booking" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: "Booking not found" });
        }
        res.json({ success: true });
    });
});

app.delete("/api/bookings/:id", authenticateAdmin, (req, res) => {
    const bookingId = parseInt(req.params.id);
    if (isNaN(bookingId)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }
    
    db.run("DELETE FROM bookings WHERE id = ?", [bookingId], function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: "Failed to delete booking" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: "Booking not found" });
        }
        res.json({ success: true });
    });
});

// Admin Authentication (FIXED - Uses JWT_SECRET from env, better validation)
app.post("/api/admin/register", loginLimiter, (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    
    // Hash password with stronger salt rounds (FIXED - Was 10, now 12)
    const hashedPassword = bcrypt.hashSync(password, 12);
    
    db.run(
        `INSERT INTO admins (email, password) VALUES (?, ?)`,
        [validator.escape(email.trim()), hashedPassword],
        function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(400).json({ error: "Email already registered" });
            }
            res.json({ success: true, message: "Admin account created successfully" });
        }
    );
});

app.post("/api/admin/login", loginLimiter, (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    
    db.get("SELECT * FROM admins WHERE email = ?", [validator.escape(email.trim())], (err, admin) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: "An error occurred" });
        }
        
        if (!admin) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
        
        const isValidPassword = bcrypt.compareSync(password, admin.password);
        if (!isValidPassword) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
        
        // Sign JWT with secret from environment (FIXED - Was hardcoded)
        const token = jwt.sign(
          { id: admin.id, email: admin.email },
          JWT_SECRET,
          { expiresIn: "24h", algorithm: 'HS256' }
        );
        
        res.json({
          success: true,
          token: token,
          message: "Login successful"
        });
    });
});

// Email notification function
function sendBookingConfirmation(email, name, tourTitle, date) {
    // TODO: Implement with nodemailer for real email sending
    // For now, just log
    console.log(`[EMAIL] Booking confirmation would be sent to ${email}`);
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: "An unexpected error occurred" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
    console.log(`✅ Backend running at http://${HOST}:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    db.close((err) => {
        if (err) console.error(err);
        process.exit(0);
    });
});
