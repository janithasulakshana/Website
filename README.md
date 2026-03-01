# 🌍 Lets Go Colombo Tours by J - City Tour Booking Platform

Welcome to Lets Go Colombo Tours by J! This is a complete city tour booking platform for Colombo built with React, Express, and SQLite.

## 📚 Quick Navigation

### 🚀 Getting Started
- **[QUICK_START.md](QUICK_START.md)** - Get up and running in 5 minutes
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete installation guide

### 📖 Documentation
- **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)** - Full technical documentation
- **[ENHANCEMENTS_SUMMARY.md](ENHANCEMENTS_SUMMARY.md)** - All improvements made
- **[API_TESTING.md](API_TESTING.md)** - API endpoint testing guide

---

## ⚡ Quick Start

### 1. Install Dependencies

```powershell
# Backend
cd backend
npm install

# Frontend  
cd frontend
npm install
```

### 2. Start Backend

```powershell
cd backend
npm start
# Runs at http://localhost:5000
```

### 3. Create Admin Account

```powershell
# In PowerShell
$body = @{
    email = "admin@trailcolombo.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### 4. Seed Tours (Optional)

```powershell
cd backend
npm run seed
```

### 5. Start Frontend

```powershell
cd frontend
npm run dev
# Runs at http://localhost:5173
```

### 6. Open in Browser

- **Website**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin (Email: admin@trailcolombo.com, Password: admin123)
- **Backend API**: http://localhost:5000

---

## 🎯 Key Features

✅ Browse city tours with descriptions and pricing
✅ Real-time booking system with validation
✅ Admin dashboard for tour and booking management
✅ Secure admin authentication with JWT
✅ WhatsApp integration for direct messaging
✅ Responsive mobile-friendly design
✅ Complete error handling
✅ Professional UI with Bootstrap 5

---

## 📁 Project Structure

```
Website/
├── backend/                      # Express.js server
│   ├── server.js                # Main API server
│   ├── seed.js                  # Database seeding
│   ├── package.json             # Dependencies
│   ├── .env                     # Configuration
│   └── bookings.db              # SQLite database (auto-created)
│
├── frontend/                     # React + Vite app
│   ├── src/
│   │   ├── pages/               # Page components
│   │   ├── components/          # Reusable components
│   │   └── App.jsx              # Main app with routing
│   ├── package.json             # Dependencies
│   ├── vite.config.js           # Build configuration
│   └── .env                     # Configuration
│
├── QUICK_START.md               # Quick start guide
├── SETUP_GUIDE.md               # Detailed setup
├── PROJECT_DOCUMENTATION.md     # Full documentation
├── API_TESTING.md               # API testing guide
├── ENHANCEMENTS_SUMMARY.md      # Changes made
└── README.md                    # This file
```

---

## 📊 Technical Stack

### Frontend
- React 19
- Vite (build tool)
- React Router v7
- Axios (HTTP client)
- Bootstrap 5 (styling)

### Backend
- Express.js
- SQLite3 (database)
- JWT (authentication)
- bcryptjs (password hashing)
- CORS (cross-origin requests)

---

## 🔐 Security Features

✅ JWT-based admin authentication
✅ Password hashing with bcryptjs
✅ Input validation on all endpoints
✅ Protected admin-only API endpoints
✅ CORS configuration
✅ Error handling and logging

---

## 🌐 API Overview

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /api/tours | ❌ | List all tours |
| POST | /api/tours | ✅ | Create tour |
| DELETE | /api/tours/:id | ✅ | Delete tour |
| GET | /api/bookings | ✅ | List bookings |
| POST | /api/bookings | ❌ | Create booking |
| PUT | /api/bookings/:id | ✅ | Update booking |
| DELETE | /api/bookings/:id | ✅ | Delete booking |
| POST | /api/admin/register | ❌ | Register admin |
| POST | /api/admin/login | ❌ | Login admin |

See [API_TESTING.md](API_TESTING.md) for detailed examples.

---

## 📝 Database Schema

### Tours Table
- id, title, price, description, image, whatsapp, created_at

### Bookings Table
- id, name, email, phone, tour_id, date, status, created_at

### Admins Table
- id, email, password, created_at

---

## 🎓 Pages

1. **Home** (`/`) - Landing page with features
2. **Tours** (`/tours`) - Browse tours and make bookings
3. **Success** (`/success`) - Booking confirmation
4. **Admin** (`/admin`) - Admin dashboard (login required)

---

## ✨ Enhancements Made

This project has been significantly enhanced with:

✅ Database-driven tours (no more hardcoding)
✅ Admin authentication system
✅ Complete booking management
✅ Full CRUD operations for tours
✅ JWT token-based security
✅ Input validation and error handling
✅ Improved UI/UX
✅ Comprehensive documentation
✅ Database seeding script
✅ Environment configuration

See [ENHANCEMENTS_SUMMARY.md](ENHANCEMENTS_SUMMARY.md) for details.

---

## 🚀 Deployment

### Frontend Build
```bash
cd frontend
npm run build
# Output: dist/ folder ready for hosting
```

### Backend Deployment
```bash
cd backend
npm install --production
node server.js
```

**Recommended Hosts:**
- Frontend: Vercel, Netlify, AWS S3
- Backend: Heroku, DigitalOcean, AWS EC2, Railway

---

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
HOST=127.0.0.1
JWT_SECRET=your-secret-key
DATABASE_PATH=./bookings.db
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🆘 Troubleshooting

**Backend won't start?**
- Check port 5000 is available
- Run: `npm install` in backend folder
- Delete bookings.db and restart

**Frontend won't load?**
- Ensure backend is running on port 5000
- Check browser console (F12) for errors
- Clear cache: Ctrl+Shift+Delete

**Login not working?**
- Verify admin account exists
- Check email and password are correct
- Try creating new admin account

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for more solutions.

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | 5-minute quick start |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Complete setup & features |
| [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) | Full technical docs |
| [API_TESTING.md](API_TESTING.md) | API endpoint testing |
| [ENHANCEMENTS_SUMMARY.md](ENHANCEMENTS_SUMMARY.md) | What's been improved |

---

## 🎯 Next Steps

1. **Try it out**: Follow [QUICK_START.md](QUICK_START.md)
2. **Test API**: Use [API_TESTING.md](API_TESTING.md)
3. **Customize**: Update tour descriptions and WhatsApp numbers
4. **Deploy**: Follow deployment section

---

## 📧 Features Included

### User Features
✅ Browse available tours
✅ View tour details and pricing
✅ Book tours with custom dates
✅ WhatsApp contact option
✅ Success confirmation page

### Admin Features
✅ Secure login system
✅ Manage tours (add, view, delete)
✅ View all bookings
✅ Update booking status
✅ Delete bookings
✅ Logout functionality

---

## 🎨 Future Enhancements

Planned features:
- Email confirmation notifications
- Payment processing (Stripe/PayPal)
- Advanced booking filters
- Tour ratings and reviews
- Image upload functionality
- SMS notifications
- Multi-language support
- Analytics dashboard

---

## 📞 Support

For issues or questions:
1. Check the [SETUP_GUIDE.md](SETUP_GUIDE.md) troubleshooting section
2. Review [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
3. Check API examples in [API_TESTING.md](API_TESTING.md)

---

## 📄 License

This project is open source and available for educational and commercial use.

---

## 🙏 Credits

**Lets Go Colombo Tours by J** - A premium city tour booking platform for Colombo

---

## ✅ Ready to Launch! 🚀

Your Lets Go Colombo Tours by J booking platform is complete and ready to use. Start with [QUICK_START.md](QUICK_START.md) to get running in minutes!

**Happy Booking! 🎉**

---

*Last Updated: February 22, 2026*
*Version: 1.0.0 - Production Ready*
