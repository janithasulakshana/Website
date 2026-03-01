# Lets Go Colombo Tours by J - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Frontend Structure](#frontend-structure)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Lets Go Colombo Tours by J** is a full-stack web application that allows users to browse and book city tours around Colombo. The platform features an admin dashboard for managing tours and bookings.

### Key Features
✅ Browse tours with descriptions and pricing
✅ Real-time booking system
✅ Admin authentication and management dashboard
✅ Tour management (add/edit/delete)
✅ Booking management
✅ WhatsApp integration
✅ Responsive mobile-friendly design
✅ Input validation and error handling

### Tech Stack
- **Frontend**: React 19, Vite, React Router, Axios, Bootstrap 5
- **Backend**: Express.js, SQLite3, JWT, bcryptjs
- **Database**: SQLite (file-based)
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Bootstrap 5

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                            │
│            ┌──────────────────────────────────┐              │
│            │   React + Vite Frontend App      │              │
│            │                                  │              │
│            │  Pages:                          │              │
│            │  - Home                          │              │
│            │  - Tours (Browse & Book)         │              │
│            │  - Admin (Dashboard)             │              │
│            │  - Success                       │              │
│            └────────────┬─────────────────────┘              │
│                         │ HTTP/REST API                      │
└─────────────────────────┼──────────────────────────────────┘
                          │
┌─────────────────────────┼──────────────────────────────────┐
│         Node.js Server (Express.js)                         │
│    ┌────────────────────┴──────────────────────┐            │
│    │   API Routes & Controllers                │            │
│    │                                           │            │
│    │   - Tours API (GET, POST, DELETE)         │            │
│    │   - Bookings API (GET, POST, PUT, DELETE) │            │
│    │   - Admin Auth (LOGIN, REGISTER)          │            │
│    └────────────────────┬──────────────────────┘            │
│                         │                                   │
│    ┌────────────────────┴──────────────────────┐            │
│    │   Middleware                              │            │
│    │   - Authentication (JWT)                  │            │
│    │   - CORS                                  │            │
│    │   - Body Parser                           │            │
│    └────────────────────┬──────────────────────┘            │
│                         │                                   │
│    ┌────────────────────┴──────────────────────┐            │
│    │   SQLite Database                         │            │
│    │   Tables:                                 │            │
│    │   - tours                                 │            │
│    │   - bookings                              │            │
│    │   - admins                                │            │
│    └───────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────┘
```

---

## Setup Instructions

### 1. Clone/Extract Project

```bash
# Navigate to project root
cd Website
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 4. Configure Environment Variables

#### Backend (backend/.env)
```env
PORT=5000
HOST=127.0.0.1
DATABASE_PATH=./bookings.db
JWT_SECRET=your-secret-key-change-this
```

#### Frontend (frontend/.env)
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 5. Start Backend Server

```bash
cd backend
npm start
# Server runs at http://localhost:5000
```

### 6. Create Admin Account

In another terminal (using PowerShell):

```powershell
$body = @{
    email = "admin@trailcolombo.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### 7. Seed Initial Tours (Optional)

```bash
cd backend
npm run seed
```

### 8. Start Frontend Development Server

```bash
cd frontend
npm run dev
# App runs at http://localhost:5173
```

### 9. Access Application

- **Website**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin
- **Backend API**: http://localhost:5000

---

## API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication
Protected endpoints require JWT token in header:
```
Authorization: Bearer {token}
```

### Endpoints

#### TOURS

**List all tours**
```
GET /api/tours
```

**Response (200 OK)**
```json
[
  {
    "id": 1,
    "title": "Galle Face & City Walk",
    "price": 40,
    "description": "Explore the iconic Galle Face Green...",
    "image": "/images/galle-face.jpg",
    "whatsapp": "94771234567",
    "created_at": "2024-02-22T10:00:00.000Z"
  }
]
```

**Create tour** ⚡ Protected
```
POST /api/tours
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Tour Title",
  "price": 50,
  "description": "Tour description",
  "image": "https://example.com/image.jpg",
  "whatsapp": "94771234567"
}
```

**Delete tour** ⚡ Protected
```
DELETE /api/tours/{id}
Authorization: Bearer {token}
```

---

#### BOOKINGS

**List all bookings** ⚡ Protected
```
GET /api/bookings
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+94712345678",
    "tour_id": 1,
    "tour_title": "Galle Face & City Walk",
    "date": "2024-03-15",
    "status": "pending",
    "created_at": "2024-02-22T10:00:00.000Z"
  }
]
```

**Create booking**
```
POST /api/bookings
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94712345678",
  "tour_id": 1,
  "date": "2024-03-15"
}
```

**Update booking status** ⚡ Protected
```
PUT /api/bookings/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "confirmed"
}
```

Valid statuses: `pending`, `confirmed`, `cancelled`

**Delete booking** ⚡ Protected
```
DELETE /api/bookings/{id}
Authorization: Bearer {token}
```

---

#### ADMIN

**Register admin**
```
POST /api/admin/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword123"
}
```

**Login admin**
```
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Database Schema

### Tours Table
```sql
CREATE TABLE tours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image TEXT,
    whatsapp TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    tour_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id)
);
```

### Admins Table
```sql
CREATE TABLE admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Frontend Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── home.jsx         # Landing page
│   │   ├── Tours.jsx        # Browse & book tours
│   │   ├── Admin.jsx        # Admin dashboard
│   │   └── Success.jsx      # Booking confirmation
│   ├── components/
│   │   └── TourCard.jsx     # Tour card component
│   ├── App.jsx              # Main app with routing & navbar
│   ├── main.jsx             # Entry point
│   ├── App.css              # Global styles
│   └── index.css            # Base styles
├── index.html               # HTML entry point
├── package.json             # Dependencies
├── vite.config.js          # Vite configuration
└── eslint.config.js        # ESLint configuration
```

### Component Overview

**App.jsx** - Main application with React Router and navigation bar

**Pages:**
- `home.jsx` - Landing page with features overview
- `Tours.jsx` - Display tours, booking form, validation
- `Admin.jsx` - Login, tour management, booking management
- `Success.jsx` - Booking confirmation message

**Components:**
- `TourCard.jsx` - Reusable tour card with booking button

---

## Testing

### Manual API Testing with PowerShell

#### 1. Register Admin
```powershell
$body = @{
    email = "admin@trailcolombo.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

#### 2. Login Admin
```powershell
$body = @{
    email = "admin@trailcolombo.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$token = $response.token
Write-Host $token
```

#### 3. Add Tour
```powershell
$body = @{
    title = "New Tour"
    price = 50
    description = "Test tour"
    image = "https://example.com/image.jpg"
    whatsapp = "94771234567"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/tours" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body $body
```

#### 4. Create Booking
```powershell
$body = @{
    name = "Jane Doe"
    email = "jane@example.com"
    phone = "+94712345678"
    tour_id = 1
    date = "2024-03-20"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

---

## Deployment

### Production Build

#### Frontend
```bash
cd frontend
npm run build
```

Output: `frontend/dist/` - ready for static hosting

#### Backend
```bash
cd backend
npm install --production
node server.js
```

### Deployment Checklist

- [ ] Change JWT_SECRET in backend/.env
- [ ] Update VITE_API_BASE_URL to production backend URL
- [ ] Configure database path (production database)
- [ ] Set up environment variables securely
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up SSL certificate
- [ ] Regular database backups
- [ ] Monitor server logs

### Recommended Hosting

**Frontend**
- Vercel (recommended for Vite apps)
- Netlify
- AWS S3 + CloudFront

**Backend**
- Heroku
- AWS EC2
- DigitalOcean
- Railway

---

## Troubleshooting

### Backend Issues

**Port 5000 already in use**
```powershell
netstat -ano | findstr :5000
# Kill process:
taskkill /PID {PID} /F
```

**Database locked**
- Stop backend and delete `bookings.db`
- Restart backend to create fresh database

**CORS errors**
- Verify frontend URL in CORS configuration
- Check backend is running

### Frontend Issues

**Frontend won't connect to backend**
- Verify backend is running on port 5000
- Check console for errors (F12)
- Verify API_BASE_URL in .env

**Vite dev server won't start**
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

**React Router not working**
- Clear browser cache
- Verify route paths in App.jsx

### Database Issues

**Authentication fails**
- Verify password hashing is working
- Check admin credentials in database:
  ```bash
  sqlite3 bookings.db
  SELECT * FROM admins;
  ```

**Can't connect to database**
- Ensure SQLite is installed
- Check database file permissions
- Verify database path in server.js

---

## File Reference

| File | Purpose |
|------|---------|
| `backend/server.js` | Main Express server and API routes |
| `backend/seed.js` | Database seeding script |
| `backend/package.json` | Backend dependencies |
| `backend/.env` | Backend configuration |
| `frontend/src/App.jsx` | Main React app with routing |
| `frontend/src/pages/Tours.jsx` | Tours page with booking form |
| `frontend/src/pages/Admin.jsx` | Admin dashboard |
| `frontend/package.json` | Frontend dependencies |
| `frontend/.env` | Frontend configuration |
| `frontend/vite.config.js` | Vite build configuration |

---

## Support & Maintenance

- **Documentation**: See SETUP_GUIDE.md and QUICK_START.md
- **API Testing**: See API_TESTING.md
- **Issues**: Check Troubleshooting section
- **Updates**: Regularly update dependencies with `npm update`

---

**Last Updated**: February 22, 2026
**Version**: 1.0.0
