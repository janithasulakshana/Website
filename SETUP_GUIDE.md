# Trail Colombo - City Tour Booking Platform

A full-stack web application for booking city tours around Colombo, built with React, Express, and SQLite.

## 🎯 Features

- **Tour Management**: Browse and book city tours
- **Admin Dashboard**: Manage tours and bookings
- **User Booking System**: Easy-to-use booking form with validation
- **Admin Authentication**: Secure login with JWT tokens
- **WhatsApp Integration**: Direct messaging for inquiries
- **Responsive Design**: Bootstrap 5 for mobile-friendly UI
- **Database Management**: SQLite for storing tours and bookings

## 📋 Project Structure

```
Website/
├── backend/              # Express.js server
│   ├── server.js        # Main server file
│   ├── package.json     # Backend dependencies
│   ├── bookings.db      # SQLite database (auto-created)
│   └── .env             # Environment variables
│
├── frontend/            # React + Vite app
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── App.jsx      # Main app with routing
│   │   └── main.jsx     # Entry point
│   ├── package.json     # Frontend dependencies
│   ├── vite.config.js   # Vite configuration
│   └── .env             # Environment variables
│
└── public/              # Static files (legacy)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

#### 1. Backend Setup

```bash
cd backend
npm install
```

#### 2. Frontend Setup

```bash
cd frontend
npm install
```

## 🔧 Configuration

### Backend (.env)
```
PORT=5000
HOST=127.0.0.1
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000
```

## ▶️ Running the Application

### Start Backend (Terminal 1)
```bash
cd backend
npm start
# or with auto-reload:
npm run dev
```

The backend will run at `http://localhost:5000`

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

The frontend will run at `http://localhost:5173` (Vite default)

## 📚 API Endpoints

### Tours API

**GET /api/tours**
- Get all available tours
- No authentication required

**POST /api/tours** (Protected)
- Create a new tour
- Requires: `Authorization: Bearer {token}`
- Body: `{ title, price, description, image, whatsapp }`

**DELETE /api/tours/:id** (Protected)
- Delete a tour
- Requires: `Authorization: Bearer {token}`

### Bookings API

**GET /api/bookings** (Protected)
- Get all bookings
- Requires: `Authorization: Bearer {token}`

**POST /api/bookings**
- Create a new booking
- Body: `{ name, email, phone, tour_id, date }`

**PUT /api/bookings/:id** (Protected)
- Update booking status
- Requires: `Authorization: Bearer {token}`
- Body: `{ status }`

**DELETE /api/bookings/:id** (Protected)
- Delete a booking
- Requires: `Authorization: Bearer {token}`

### Admin API

**POST /api/admin/register**
- Register a new admin account
- Body: `{ email, password }`

**POST /api/admin/login**
- Login admin and get JWT token
- Body: `{ email, password }`
- Response: `{ success: true, token: "..." }`

## 🛠️ Admin Setup

### First Admin Registration

1. Open Postman or use curl
2. Send POST request to `http://localhost:5000/api/admin/register`
3. Body (JSON):
```json
{
  "email": "admin@trailcolombo.com",
  "password": "admin123"
}
```

### Login to Admin Dashboard

1. Visit `http://localhost:5173/admin`
2. Enter your credentials
3. Manage tours and bookings

## 📦 Adding Tours

In Admin Dashboard:
1. Click "Add New Tour"
2. Fill in tour details:
   - Title
   - Price
   - Description
   - Image URL
   - WhatsApp Number (for contact)
3. Click "Add Tour"

## 🎨 Pages

- **Home** (`/`) - Landing page with brand intro
- **Tours** (`/tours`) - Browse and book tours
- **Success** (`/success`) - Booking confirmation
- **Admin** (`/admin`) - Admin dashboard (login required)

## 🔐 Security Features

- JWT token-based authentication for admin
- Password hashing with bcryptjs
- Input validation on all API endpoints
- CORS enabled for cross-origin requests
- Protected admin-only endpoints

## 📧 Future Enhancements

- [ ] Email notifications for bookings
- [ ] Payment integration (Stripe/PayPal)
- [ ] Advanced booking management
- [ ] Tour ratings and reviews
- [ ] Image upload functionality
- [ ] SMS notifications
- [ ] Multi-language support

## 🐛 Troubleshooting

**Backend won't start:**
- Check if port 5000 is in use
- Ensure all npm packages are installed: `npm install`

**Frontend won't connect to backend:**
- Verify backend is running on `http://localhost:5000`
- Check CORS settings in backend

**Database issues:**
- Delete `bookings.db` and restart backend to create fresh database

## 📝 License

This project is open source and available for educational and commercial use.

## 👤 Author

Lets Go Colombo Tours by J

---

**Note**: Remember to change the JWT secret key in `.env` for production use!
