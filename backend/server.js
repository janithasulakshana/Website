require("dotenv").config();
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

// Get environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const DATABASE_PATH = process.env.DATABASE_PATH || "./bookings.db";
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";

if (!process.env.JWT_SECRET) {
    console.warn("WARNING: JWT_SECRET not set in .env file. Using default value. This is not secure for production!");
}

const app = express();

// Security middleware
app.use(helmet());
app.use(bodyParser.json({ limit: "10mb" }));

// CORS with restricted origins
const corsOptions = {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    optionsSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions));

// Rate limiting
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: "Too many login attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false
});

const bookingLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // 3 bookings per minute
    message: "Too many booking attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false
});

const db = new sqlite3.Database(DATABASE_PATH, (err) => {
    if (err) {
        console.error("Database error:", err.message);
    } else {
        console.log("Connected to SQLite database");
    }
});

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

// Generic error response (don't expose details)
const sendErrorResponse = (res, statusCode = 500, message = "An error occurred") => {
    res.status(statusCode).json({ success: false, error: message });
};

// Middleware for admin authentication
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return sendErrorResponse(res, 401, "Unauthorized");
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        // Don't expose token error details
        return sendErrorResponse(res, 403, "Unauthorized");
    }
};

// Input validation helper
const validateEmail = (email) => {
    return validator.isEmail(email);
};

const validatePhone = (phone) => {
    // Accept 10-15 digit phone numbers
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
};

const validateName = (name) => {
    return validator.isLength(name, { min: 2, max: 100 }) && 
           !validator.contains(name, "<") && 
           !validator.contains(name, ">");
};

const validateDate = (dateString) => {
    // Validate date format YYYY-MM-DD
    if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return false;
    }
    const date = new Date(dateString + 'T00:00:00Z');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return !isNaN(date.getTime()) && date >= now;
};

const validatePrice = (price) => {
    const num = parseFloat(price);
    return !isNaN(num) && num > 0;
};

// Tours API
app.get("/api/tours", (req, res) => {
    db.all("SELECT id, title, price, description, image, whatsapp FROM tours ORDER BY created_at DESC", [], (err, rows) => {
        if (err) {
            console.error("Database error:", err);
            return sendErrorResponse(res, 500, "Failed to retrieve tours");
        }
        res.json(rows || []);
    });
});

app.post("/api/tours", authenticateAdmin, (req, res) => {
    const { title, price, description, image, whatsapp } = req.body;
    
    // Validate input
    if (!title || !validateName(title)) {
        return sendErrorResponse(res, 400, "Invalid tour title");
    }
    if (!price || !validatePrice(price)) {
        return sendErrorResponse(res, 400, "Invalid tour price");
    }
    if (description && !validator.isLength(description, { max: 1000 })) {
        return sendErrorResponse(res, 400, "Description too long");
    }
    
    const sanitizedTitle = validator.escape(title);
    const sanitizedDescription = validator.escape(description || "");
    const sanitizedImage = validator.isURL(image) ? image : "";
    const sanitizedWhatsapp = whatsapp ? validator.escape(whatsapp) : "";
    
    db.run(
        `INSERT INTO tours (title, price, description, image, whatsapp) VALUES (?, ?, ?, ?, ?)`,
        [sanitizedTitle, price, sanitizedDescription, sanitizedImage, sanitizedWhatsapp],
        function(err) {
            if (err) {
                console.error("Database error:", err);
                return sendErrorResponse(res, 500, "Failed to create tour");
            }
            res.json({ success: true, id: this.lastID });
        }
    );
});

app.delete("/api/tours/:id", authenticateAdmin, (req, res) => {
    const tourId = parseInt(req.params.id);
    
    if (isNaN(tourId)) {
        return sendErrorResponse(res, 400, "Invalid tour ID");
    }
    
    db.run("DELETE FROM tours WHERE id = ?", [tourId], function(err) {
        if (err) {
            console.error("Database error:", err);
            return sendErrorResponse(res, 500, "Failed to delete tour");
        }
        res.json({ success: true });
    });
});

// Bookings API
app.get("/api/bookings", authenticateAdmin, (req, res) => {
    db.all(
        "SELECT b.id, b.name, b.email, b.phone, b.tour_id, b.date, b.status, b.created_at, t.title as tour_title FROM bookings b JOIN tours t ON b.tour_id = t.id ORDER BY b.created_at DESC",
        [],
        (err, rows) => {
            if (err) {
                console.error("Database error:", err);
                return sendErrorResponse(res, 500, "Failed to retrieve bookings");
            }
            res.json(rows || []);
        }
    );
});

app.post("/api/bookings", (req, res) => {
    try {
        console.log("=== POST /api/bookings ===");
        console.log("Request body:", req.body);
        const { name, email, phone, tour_id, date } = req.body;
        
        // Validate input
        if (!validateName(name)) {
            console.log("❌ Name validation failed");
            return sendErrorResponse(res, 400, "Invalid name");
        }
        if (!validateEmail(email)) {
            console.log("❌ Email validation failed");
            return sendErrorResponse(res, 400, "Invalid email");
        }
        if (!validatePhone(phone)) {
            console.log("❌ Phone validation failed");
            return sendErrorResponse(res, 400, "Invalid phone number");
        }
        if (!tour_id || isNaN(parseInt(tour_id))) {
            console.log("❌ Tour ID validation failed");
            return sendErrorResponse(res, 400, "Invalid tour ID");
        }
        if (!validateDate(date)) {
            console.log("❌ Date validation failed");
            return sendErrorResponse(res, 400, "Invalid booking date");
        }
        
        console.log("✓ All validations passed");
        const sanitizedName = validator.escape(name);
        const sanitizedEmail = validator.normalizeEmail(email);
        const sanitizedPhone = validator.escape(phone);
        const tourId = parseInt(tour_id);
        
        // Check if tour exists
        console.log("Checking if tour exists: ID =", tourId);
        db.get("SELECT id FROM tours WHERE id = ?", [tourId], (err, tour) => {
            if (err) {
                console.error("❌ Database error:", err);
                return sendErrorResponse(res, 500, "Failed to process booking");
            }
            if (!tour) {
                console.log("❌ Tour not found");
                return sendErrorResponse(res, 404, "Tour not found");
            }
            
            console.log("✓ Tour found, creating booking...");
            // Create booking
            db.run(
                `INSERT INTO bookings (name, email, phone, tour_id, date) VALUES (?, ?, ?, ?, ?)`,
                [sanitizedName, sanitizedEmail, sanitizedPhone, tourId, date],
                function(err) {
                    if (err) {
                        console.error("❌ Database insert error:", err);
                        return sendErrorResponse(res, 500, "Failed to create booking");
                    }
                    
                    console.log("✓✓✓ Booking created successfully with ID:", this.lastID);
                    
                    // Send confirmation email (async, don't wait)
                    sendBookingConfirmation(sanitizedEmail, sanitizedName, tourId).catch(err => {
                        console.error("Email error:", err.message);
                    });
                    
                    res.json({ success: true, id: this.lastID });
                }
            );
        });
    } catch (error) {
        console.error("❌ UNCAUGHT ERROR in POST /api/bookings:", error);
        sendErrorResponse(res, 500, "Internal server error");
    }
});

app.put("/api/bookings/:id", authenticateAdmin, (req, res) => {
    const { status } = req.body;
    const bookingId = parseInt(req.params.id);
    
    if (isNaN(bookingId)) {
        return sendErrorResponse(res, 400, "Invalid booking ID");
    }
    
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
        return sendErrorResponse(res, 400, "Invalid status");
    }
    
    db.run("UPDATE bookings SET status = ? WHERE id = ?", [status, bookingId], function(err) {
        if (err) {
            console.error("Database error:", err);
            return sendErrorResponse(res, 500, "Failed to update booking");
        }
        res.json({ success: true });
    });
});

app.delete("/api/bookings/:id", authenticateAdmin, (req, res) => {
    const bookingId = parseInt(req.params.id);
    
    if (isNaN(bookingId)) {
        return sendErrorResponse(res, 400, "Invalid booking ID");
    }
    
    db.run("DELETE FROM bookings WHERE id = ?", [bookingId], function(err) {
        if (err) {
            console.error("Database error:", err);
            return sendErrorResponse(res, 500, "Failed to delete booking");
        }
        res.json({ success: true });
    });
});

// Admin Authentication
app.post("/api/admin/register", loginLimiter, (req, res) => {
    const { email, password } = req.body;
    
    // Validate input
    if (!validateEmail(email)) {
        return sendErrorResponse(res, 400, "Invalid email format");
    }
    
    if (!password || password.length < 8) {
        return sendErrorResponse(res, 400, "Password must be at least 8 characters");
    }
    
    const sanitizedEmail = validator.normalizeEmail(email);
    
    // Hash password with 12 salt rounds (improved security)
    const hashedPassword = bcrypt.hashSync(password, 12);
    
    db.run(
        `INSERT INTO admins (email, password) VALUES (?, ?)`,
        [sanitizedEmail, hashedPassword],
        function(err) {
            if (err) {
                console.error("Database error:", err);
                // Don't reveal if email already exists (information disclosure)
                return sendErrorResponse(res, 400, "Failed to register admin");
            }
            res.json({ success: true });
        }
    );
});

app.post("/api/admin/login", loginLimiter, (req, res) => {
    const { email, password } = req.body;
    
    if (!validateEmail(email) || !password) {
        return sendErrorResponse(res, 400, "Invalid credentials");
    }
    
    const sanitizedEmail = validator.normalizeEmail(email);
    
    db.get("SELECT id, email, password FROM admins WHERE email = ?", [sanitizedEmail], (err, admin) => {
        if (err) {
            console.error("Database error:", err);
            return sendErrorResponse(res, 500, "Authentication failed");
        }
        
        if (!admin) {
            return sendErrorResponse(res, 401, "Invalid credentials");
        }
        
        // Compare password
        const isValidPassword = bcrypt.compareSync(password, admin.password);
        if (!isValidPassword) {
            return sendErrorResponse(res, 401, "Invalid credentials");
        }
        
        // Generate JWT token with 24-hour expiration
        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            JWT_SECRET,
            { expiresIn: "24h" }
        );
        
        res.json({ success: true, token });
    });
});

// Test endpoint
app.get("/api/test", (req, res) => {
    res.json({ success: true, message: "API is working" });
});

// Email notification function
async function sendBookingConfirmation(email, name, tourId) {
    try {
        // TODO: Integrate with nodemailer for production
        // For now, just log the confirmation
        console.log(`✓ Booking confirmation sent to ${email}`);
    } catch (err) {
        console.error(`Failed to send email to ${email}:`, err.message);
        throw err;
    }
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    sendErrorResponse(res, 500, "Internal server error");
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: "Endpoint not found" });
});

// Start server
const server = app.listen(PORT, HOST, () => {
    console.log(`✓ Backend running at http://${HOST}:${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`✓ CORS origin: ${corsOptions.origin}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    server.close(() => {
        console.log("HTTP server closed");
        db.close((err) => {
            if (err) console.error("Database close error:", err);
            process.exit(0);
        });
    });
});

process.on("SIGINT", () => {
    console.log("SIGINT signal received: closing HTTP server");
    server.close(() => {
        console.log("HTTP server closed");
        db.close((err) => {
            if (err) console.error("Database close error:", err);
            process.exit(0);
        });
    });
});