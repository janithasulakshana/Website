# 🎯 Lets Go Colombo Tours by J - Project Overview

## What Has Been Built

```
┌─────────────────────────────────────────────────────────────────┐
│                     LETS GO COLOMBO TOURS BY J PLATFORM                       │
│            City Tour Booking Platform for Colombo                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🌐 FRONTEND (React + Vite)                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Navigation Bar: Home | Tours | Admin                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐   │
│  │ HOME PAGE       │  │ TOURS PAGE      │  │ ADMIN PAGE   │   │
│  ├─────────────────┤  ├─────────────────┤  ├──────────────┤   │
│  │ • Intro         │  │ • Tour List     │  │ • Login      │   │
│  │ • Features      │  │ • Book Tour     │  │ • Dashboard  │   │
│  │ • CTA Button    │  │ • Booking Form  │  │ • Tours Mgmt │   │
│  │                 │  │ • WhatsApp      │  │ • Bookings   │   │
│  └─────────────────┘  └─────────────────┘  └──────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────┐                       │
│  │ SUCCESS PAGE - Booking Confirmation  │                       │
│  └─────────────────────────────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                          ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────────┐
│ 🔧 BACKEND (Express.js)                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  API ROUTES                                          │      │
│  ├──────────────────────────────────────────────────────┤      │
│  │                                                      │      │
│  │  TOURS MANAGEMENT                                   │      │
│  │    GET    /api/tours           (List all)           │      │
│  │    POST   /api/tours           (Add - Protected)    │      │
│  │    DELETE /api/tours/:id       (Delete - Protected) │      │
│  │                                                      │      │
│  │  BOOKINGS MANAGEMENT                                │      │
│  │    GET    /api/bookings        (List - Protected)   │      │
│  │    POST   /api/bookings        (Create)             │      │
│  │    PUT    /api/bookings/:id    (Update - Protected) │      │
│  │    DELETE /api/bookings/:id    (Delete - Protected) │      │
│  │                                                      │      │
│  │  ADMIN AUTHENTICATION                               │      │
│  │    POST   /api/admin/register  (Register)           │      │
│  │    POST   /api/admin/login     (Login)              │      │
│  │                                                      │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  SECURITY & MIDDLEWARE                               │      │
│  ├──────────────────────────────────────────────────────┤      │
│  │  ✓ JWT Authentication                               │      │
│  │  ✓ Password Hashing (bcryptjs)                       │      │
│  │  ✓ Input Validation                                 │      │
│  │  ✓ CORS Configuration                               │      │
│  │  ✓ Error Handling                                   │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                          ↕ Database Queries
┌─────────────────────────────────────────────────────────────────┐
│ 💾 DATABASE (SQLite3)                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ TOURS TABLE  │  │BOOKINGS TABLE│  │ ADMINS TABLE │          │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤          │
│  │ id           │  │ id           │  │ id           │          │
│  │ title        │  │ name         │  │ email        │          │
│  │ price        │  │ email        │  │ password     │          │
│  │ description  │  │ phone        │  │ created_at   │          │
│  │ image        │  │ tour_id  → ───→ │              │          │
│  │ whatsapp     │  │ date         │  │              │          │
│  │ created_at   │  │ status       │  │              │          │
│  │              │  │ created_at   │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Component Architecture

```
App.jsx
  │
  ├─ Navigation Bar
  │  ├─ Logo
  │  ├─ Home Link
  │  ├─ Tours Link
  │  └─ Admin Link
  │
  └─ Routes
     ├─ / (Home)
     │  └─ Home.jsx
     │     ├─ Hero Section
     │     ├─ Features Cards
     │     └─ CTA Button
     │
     ├─ /tours (Tours)
     │  └─ Tours.jsx
     │     ├─ Tour List
     │     │  └─ TourCard.jsx (Repeating)
     │     │     ├─ Image
     │     │     ├─ Title & Price
     │     │     └─ Buttons (Book, WhatsApp)
     │     └─ Booking Form
     │        ├─ Name Input
     │        ├─ Email Input
     │        ├─ Phone Input
     │        ├─ Tour Select
     │        ├─ Date Input
     │        └─ Submit Button
     │
     ├─ /admin (Admin)
     │  └─ Admin.jsx
     │     ├─ Login Form (if not authenticated)
     │     │  ├─ Email Input
     │     │  └─ Password Input
     │     └─ Dashboard (if authenticated)
     │        ├─ Logout Button
     │        ├─ Tours Section
     │        │  ├─ Add Tour Button
     │        │  ├─ Add Tour Form
     │        │  └─ Tours Table
     │        └─ Bookings Section
     │           └─ Bookings Table
     │
     └─ /success (Success)
        └─ Success.jsx
           ├─ Confirmation Message
           ├─ Navigation Buttons
           └─ Email Notification Info
```

---

## 🔄 Data Flow Diagram

```
USER INTERACTION                    API CALL                      DATABASE

1. BROWSE TOURS
   User clicks Tours → Tours.jsx ─────GET /api/tours────→ Backend → SQLite
                                 ←──────[Tours Array]──←─────────────┤
   Display Tours ◄────────────────────────────────────────────────────┘

2. VIEW TOUR DETAILS
   User clicks Tour → TourCard displayed with description, price, buttons

3. BOOK TOUR
   User fills form → Tours.jsx form ─POST /api/bookings──→ Backend → SQLite
                                    ←──success/error──←────────────
   Redirect to Success page

4. ADMIN LOGIN
   Admin enters creds → Admin.jsx ──POST /api/admin/login──→ Backend ─→ SQLite
                                    ←────JWT token←────────────────
   Store token in localStorage

5. ADMIN: VIEW TOURS
   Admin clicks Dashboard ──GET /api/tours────→ Backend → SQLite
                          ←─[Tours Array]←─────────────
   Display in table

6. ADMIN: ADD TOUR
   Admin fills form ──POST /api/tours────→ Backend ────→ SQLite
                     (with JWT token)    ←─success←────────┤
   Display in table

7. ADMIN: DELETE TOUR
   Admin clicks Delete ──DELETE /api/tours/:id──→ Backend → SQLite
                        (with JWT token)      ←─success←──┤
   Remove from table

8. ADMIN: VIEW BOOKINGS
   Admin clicks Bookings ──GET /api/bookings─→ Backend → SQLite (with JOIN)
                         (with JWT token) ←─[Bookings]←─────
   Display in table

9. ADMIN: DELETE BOOKING
   Admin clicks Delete ──DELETE /api/bookings/:id──→ Backend → SQLite
                        (with JWT token)        ←─success←──┤
   Remove from table
```

---

## 🔐 Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ ADMIN AUTHENTICATION FLOW                                        │
└──────────────────────────────────────────────────────────────────┘

1. REGISTRATION (First Time)
   ┌─────────────────────────┐
   │ Admin enters credentials│
   ├─────────────────────────┤
   │ Email: admin@...com     │
   │ Password: mypassword123 │
   └──────────┬──────────────┘
              │
              ↓
   ┌─────────────────────────────────────────────┐
   │ POST /api/admin/register                    │
   │ {email, password}                           │
   └──────────┬──────────────────────────────────┘
              │
              ↓
   ┌─────────────────────────────────────────────┐
   │ Backend: Hash Password with bcryptjs        │
   │ Original: mypassword123                     │
   │ Hashed:   $2a$10$NXdG...etc...              │
   └──────────┬──────────────────────────────────┘
              │
              ↓
   ┌─────────────────────────────────────────────┐
   │ Store in Database: admins table             │
   │ email: admin@...com                         │
   │ password: $2a$10$NXdG...etc...              │
   └──────────┬──────────────────────────────────┘
              │
              ↓
   ┌─────────────────────────────────────────────┐
   │ Response: {success: true}                   │
   └─────────────────────────────────────────────┘

2. LOGIN
   ┌─────────────────────────┐
   │ Admin enters credentials│
   ├─────────────────────────┤
   │ Email: admin@...com     │
   │ Password: mypassword123 │
   └──────────┬──────────────┘
              │
              ↓
   ┌─────────────────────────────────────────────┐
   │ POST /api/admin/login                       │
   │ {email, password}                           │
   └──────────┬──────────────────────────────────┘
              │
              ↓
   ┌─────────────────────────────────────────────┐
   │ Backend: Find admin by email                │
   │ Compare passwords using bcryptjs.compare()  │
   │ ✓ Match found                               │
   └──────────┬──────────────────────────────────┘
              │
              ↓
   ┌─────────────────────────────────────────────┐
   │ Generate JWT Token                          │
   │ Payload: {id: 1, email: admin@...com}       │
   │ Sign with: JWT_SECRET = "your-secret-key"   │
   │ Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   └──────────┬──────────────────────────────────┘
              │
              ↓
   ┌─────────────────────────────────────────────┐
   │ Response: {success: true, token: "..."}     │
   └──────────┬──────────────────────────────────┘
              │
              ↓
   ┌─────────────────────────────────────────────┐
   │ Frontend: Store token in localStorage       │
   │ localStorage.setItem("adminToken", token)   │
   └──────────┬──────────────────────────────────┘
              │
              ↓
   ┌─────────────────────────────────────────────┐
   │ Redirect to Admin Dashboard                 │
   └─────────────────────────────────────────────┘

3. PROTECTED ENDPOINT CALL
   ┌────────────────────────────────────────────┐
   │ POST /api/tours (Create Tour)               │
   │ Headers: {                                  │
   │   Authorization: "Bearer eyJ..."            │
   │ }                                           │
   │ Body: {title, price, ...}                   │
   └────────────┬─────────────────────────────────┘
                │
                ↓
   ┌────────────────────────────────────────────┐
   │ Backend Middleware: authenticateAdmin()     │
   │ Extract token from header                   │
   │ Verify token using JWT_SECRET               │
   │ ✓ Token valid & not expired                 │
   └────────────┬─────────────────────────────────┘
                │
                ↓
   ┌────────────────────────────────────────────┐
   │ Process Request (Create tour)               │
   │ Insert into database                        │
   └────────────┬─────────────────────────────────┘
                │
                ↓
   ┌────────────────────────────────────────────┐
   │ Response: {success: true, id: 5}            │
   └────────────────────────────────────────────┘
```

---

## 🌐 URL Routes Map

```
Frontend Routes:
  http://localhost:5173/
    ├─ /              → Home page
    ├─ /tours         → Browse & book tours
    ├─ /admin         → Admin dashboard
    └─ /success       → Booking confirmation

Backend API Routes:
  http://localhost:5000/api
    ├─ GET /tours
    ├─ POST /tours (⚡ protected)
    ├─ DELETE /tours/:id (⚡ protected)
    │
    ├─ GET /bookings (⚡ protected)
    ├─ POST /bookings
    ├─ PUT /bookings/:id (⚡ protected)
    ├─ DELETE /bookings/:id (⚡ protected)
    │
    ├─ POST /admin/register
    └─ POST /admin/login

⚡ = Requires JWT Authentication
```

---

## 🚀 Deployment Architecture

```
DEVELOPMENT
  Frontend: npm run dev (Vite dev server on :3173)
  Backend: npm start (Express on :5000)
  DB: Local bookings.db

PRODUCTION
  Frontend: npm run build → dist/ → Static hosting
            (Vercel/Netlify/S3)
  Backend: node server.js → Node server
           (Heroku/Railway/EC2)
  DB: Hosted SQLite or PostgreSQL
```

---

**This is your complete Lets Go Colombo Tours by J platform! 🎉**

All components working together to create a seamless tour booking experience for Colombo visitors.
