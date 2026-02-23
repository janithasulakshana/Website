/**
 * Backend Configuration and Constants
 * Centralized variables for backend configuration
 */

module.exports = {
  // Contact Information
  CONTACT_INFO: {
    phone: "0768465747",
    phoneFormatted: "+94 76 846 5747",
    email: "info@trailcolombo.com",
    whatsapp: "0768465747"
  },

  // Company Information
  COMPANY_INFO: {
    name: "Trail Colombo by Janiya",
    tagline: "Explore Colombo Like Never Before",
    yearsInBusiness: "10+",
    maxGroupSize: 3
  },

  // Database Configuration
  DATABASE: {
    name: process.env.DATABASE_NAME || "bookings.db",
    path: process.env.DATABASE_PATH || "./bookings.db"
  },

  // JWT Configuration
  JWT: {
    secret: process.env.JWT_SECRET || "your_jwt_secret_key_here",
    expiresIn: "24h",
    algorithm: "HS256"
  },

  // Server Configuration
  SERVER: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || "localhost",
    env: process.env.NODE_ENV || "development"
  },

  // Email Configuration (for nodemailer)
  EMAIL: {
    service: process.env.EMAIL_SERVICE || "gmail",
    from: process.env.EMAIL_FROM || "noreply@trailcolombo.com",
    supportEmail: "info@trailcolombo.com"
  },

  // Tour Pricing
  TOUR_PRICING: {
    halfDay: 55.99,
    fullDay: 66.99,
    tukTukSafari: 32.99,
    currency: "USD"
  },

  // Tour Details
  TOURS: {
    halfDay: {
      name: "Half Day Tour",
      duration: "4-5 Hours",
      attractions: "2-3 major attractions"
    },
    fullDay: {
      name: "Full Day Tour",
      duration: "8-10 Hours",
      attractions: "5-7 major attractions"
    },
    tukTukSafari: {
      name: "Tuk Tuk Safari",
      duration: "4 Hours",
      attractions: "3-4 major attractions"
    }
  },

  // API Configuration
  API: {
    prefix: "/api",
    version: "v1"
  },

  // Booking Configuration
  BOOKING: {
    maxGroupSize: 3,
    minGroupSize: 1,
    bookingConfirmationRequired: true
  },

  // Admin Configuration
  ADMIN: {
    defaultEmail: "admin@trailcolombo.com",
    defaultPassword: "admin123",
    maxLoginAttempts: 5
  },

  // Response Messages
  MESSAGES: {
    SUCCESS: {
      tourCreated: "Tour added successfully",
      tourDeleted: "Tour deleted successfully",
      bookingCreated: "Booking confirmed successfully",
      bookingDeleted: "Booking cancelled successfully",
      adminRegistered: "Admin account created successfully",
      adminLoginSuccess: "Login successful",
      bookingUpdated: "Booking updated successfully"
    },
    ERROR: {
      tourNotFound: "Tour not found",
      bookingNotFound: "Booking not found",
      adminNotFound: "Admin account not found",
      invalidCredentials: "Invalid email or password",
      tokenExpired: "Session expired, please login again",
      unauthorized: "Unauthorized access",
      validationError: "Validation error",
      serverError: "Internal server error",
      duplicateEmail: "Email already registered"
    }
  },

  // CORS Configuration
  CORS: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200
  },

  // Rate Limiting (optional)
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};
