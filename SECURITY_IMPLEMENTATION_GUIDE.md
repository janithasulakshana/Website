# Security Implementation Guide

## Quick Start - Fix Security Issues in 3 Steps

### Step 1: Install Required Security Packages

```bash
cd backend
npm install validator helmet express-rate-limit
npm install --save-dev
```

**New Dependencies:**
- `validator` - Input validation and sanitization
- `helmet` - Security headers
- `express-rate-limit` - API rate limiting

---

### Step 2: Update .env File

Create/Update `backend/.env`:

```env
# JWT Configuration (CRITICAL - Generate a strong key)
JWT_SECRET=your_very_secure_random_key_min_32_chars_long_12345678901234567890

# Database Configuration
DATABASE_PATH=/secure/path/to/bookings.db
DATABASE_NAME=bookings.db

# Server Configuration
PORT=5000
HOST=127.0.0.1
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Email Configuration (when implementing)
EMAIL_SERVICE=gmail
EMAIL_FROM=noreply@trailcolombo.com
EMAIL_PASSWORD=your_app_password_here
```

**How to generate JWT_SECRET:**

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Using online generator
# https://generate-random.org/encryption-keys?count=1&bytes=32&cipher=aes-256-cbc&string=&password=
```

---

### Step 3: Replace server.js

**Option A: Quick Fix (Recommended for existing projects)**

Use the `SECURE_SERVER_TEMPLATE.js` as reference and gradually migrate your current `server.js`.

**Option B: Complete Replacement**

```bash
# Backup current version
cp backend/server.js backend/server.js.backup

# Copy secure version
cp SECURE_SERVER_TEMPLATE.js backend/server.js

# Install packages
npm install
```

---

## Detailed Security Fixes

### Fix #1: JWT Secret Management

**Before (❌ INSECURE):**
```javascript
const JWT_SECRET = "your-secret-key";  // Hardcoded!
```

**After (✅ SECURE):**
```javascript
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET not set!");
  process.exit(1);
}
```

---

### Fix #2: Strong Password Hashing

**Before (❌ WEAK):**
```javascript
bcrypt.hashSync(password, 10)  // Only 10 rounds
```

**After (✅ STRONG):**
```javascript
bcrypt.hashSync(password, 12)  // 12 rounds = much slower to crack
```

**Performance Impact:**
- 10 rounds: ~10ms per hash
- 12 rounds: ~50ms per hash
- Negligible for user experience, significant security improvement

---

### Fix #3: Input Validation

**Before (❌ NO VALIDATION):**
```javascript
const { name, email, phone } = req.body;
db.run("INSERT INTO bookings ...", [name, email, phone], ...)
```

**After (✅ VALIDATED):**
```javascript
const validator = require('validator');

// Email validation
if (!validator.isEmail(email)) {
  return res.status(400).json({ error: "Invalid email" });
}

// Name validation & sanitization
const sanitizedName = validator.escape(name.trim());
if (sanitizedName.length < 2 || sanitizedName.length > 100) {
  return res.status(400).json({ error: "Invalid name" });
}

// Phone validation
if (!validator.isMobilePhone(phone)) {
  return res.status(400).json({ error: "Invalid phone" });
}
```

---

### Fix #4: CORS Configuration

**Before (❌ ACCEPTS ANY ORIGIN):**
```javascript
app.use(cors());  // Allows requests from ANY website!
```

**After (✅ RESTRICTED):**
```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 
          ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
```

---

### Fix #5: Error Handling

**Before (❌ EXPOSES DETAILS):**
```javascript
if (err) return res.status(500).json({ error: err.message });
```

**After (✅ HIDES DETAILS):**
```javascript
if (err) {
  console.error('Database error:', err);  // Log for debugging
  return res.status(500).json({ error: "An error occurred" });  // Generic response
}
```

---

### Fix #6: Rate Limiting

**Implementation:**

```javascript
const rateLimit = require('express-rate-limit');

// Login rate limiter: 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts"
});

// Booking rate limiter: 3 bookings per minute
const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: "Too many bookings"
});

// Apply limiters
app.post("/api/admin/login", loginLimiter, (req, res) => {...});
app.post("/api/bookings", bookingLimiter, (req, res) => {...});
```

---

### Fix #7: Security Headers

**Implementation:**

```javascript
const helmet = require('helmet');

// Add security headers automatically
app.use(helmet());

// Custom headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});
```

---

### Fix #8: Frontend Token Security

**Backend (Enable Secure Cookies):**

```javascript
app.post("/api/admin/login", (req, res) => {
  // ... validation ...
  const token = jwt.sign({...}, JWT_SECRET);
  
  // Send as httpOnly cookie instead of response body
  res.cookie('adminToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // HTTPS only
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
  });
  
  res.json({ success: true });
});
```

**Frontend (Read from Cookie):**

```jsx
// Token is automatically sent with requests (cookies are automatic)
axios
  .get("http://localhost:5000/api/bookings", {
    withCredentials: true  // Include cookies
  })
  .then(res => setBookings(res.data))
```

---

## Testing Security Fixes

### Test 1: Rate Limiting

```bash
# Try to login 6 times in quick succession
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test123456"}'
done
```

Expected: 6th request should be blocked with rate limit message ✅

---

### Test 2: Input Validation

```bash
# Test with invalid email
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"invalid-email","phone":"123","tour_id":1,"date":"2026-03-01"}'
```

Expected: Error about invalid email ✅

---

### Test 3: CORS

```bash
# From a different origin (should fail)
curl -X GET http://localhost:5000/api/tours \
  -H "Origin: http://malicious-site.com"
```

Expected: CORS error or blocked request ✅

---

## Production Deployment Checklist

### Before Deploying to Production

- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Database is outside web root
- [ ] HTTPS/TLS enabled
- [ ] All validation implemented
- [ ] Rate limiting active
- [ ] Security headers configured
- [ ] Error messages are generic
- [ ] Logging is enabled
- [ ] Database backups scheduled
- [ ] Monitoring is set up

### Environment Variables (Production)

```env
# Production
NODE_ENV=production
PORT=443
HOST=0.0.0.0

JWT_SECRET=[STRONG_KEY_32_CHARS_MINIMUM]
DATABASE_PATH=/var/data/trailcolombo/bookings.db
ALLOWED_ORIGINS=https://trailcolombo.com,https://www.trailcolombo.com

# Email
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=[YOUR_SENDGRID_KEY]
```

---

## Monitoring & Logging

### Basic Logging Setup

```javascript
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log security events
function logSecurityEvent(event, details) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${event}: ${JSON.stringify(details)}\n`;
  fs.appendFileSync(path.join(logsDir, 'security.log'), logEntry);
}

// Usage
logSecurityEvent('LOGIN_ATTEMPT', { email, ip: req.ip, success: true });
logSecurityEvent('INVALID_TOKEN', { ip: req.ip });
logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip: req.ip, endpoint: req.path });
```

---

## Migration Path

### Phase 1: Development (Current)
- ✅ Apply all fixes to local copy
- ✅ Test thoroughly
- ✅ Update .env file

### Phase 2: Testing
- ✅ Deploy to staging server
- ✅ Run security tests
- ✅ Test all features
- ✅ Get security review

### Phase 3: Production
- ✅ Set up HTTPS
- ✅ Configure monitoring
- ✅ Enable backups
- ✅ Deploy to production
- ✅ Monitor logs

---

## Common Issues & Solutions

### Issue: "JWT_SECRET not set"
**Solution:** Add `JWT_SECRET` to `.env` file and ensure `dotenv` is loaded before using it

### Issue: CORS errors in frontend
**Solution:** Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

### Issue: Rate limiting too strict
**Solution:** Adjust `windowMs` and `max` values in rate limiter configuration

### Issue: Password validation failing
**Solution:** Ensure password is at least 8 characters with validator

---

## Additional Resources

- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## Support

For security questions or vulnerabilities found:
1. **DO NOT** post on public forums
2. **DO** email security@trailcolombo.com with details
3. Expected response time: 48 hours
