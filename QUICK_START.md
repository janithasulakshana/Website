# 🚀 Quick Start Guide - Trail Colombo

## 1️⃣ Install Dependencies

### Backend
```powershell
cd backend
npm install
```

### Frontend
```powershell
cd frontend
npm install
```

## 2️⃣ Start the Backend

```powershell
cd backend
npm start
```

**Expected output:**
```
Backend running at http://localhost:5000
```

## 3️⃣ Create First Admin Account

Open **Postman** or use **PowerShell**:

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

## 4️⃣ Seed Initial Tours

```powershell
cd backend
npm run seed
```

## 5️⃣ Start the Frontend

In a **new PowerShell terminal**:

```powershell
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
```

## ✅ You're All Set!

- **Website**: http://localhost:5173/
- **Admin Panel**: http://localhost:5173/admin
- **Backend API**: http://localhost:5000

### Default Admin Credentials
- **Email**: admin@trailcolombo.com
- **Password**: admin123

---

## 📱 Features to Try

1. **Browse Tours**: Visit http://localhost:5173/tours
2. **Book a Tour**: Fill the booking form and submit
3. **Admin Dashboard**: Log in at http://localhost:5173/admin
4. **Manage Tours**: Add, view, and delete tours
5. **View Bookings**: See all customer bookings

---

## 🔧 Useful Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start backend server |
| `npm run dev` | Start backend with auto-reload |
| `npm run seed` | Seed sample tours |
| `npm run build` | Build React app for production |
| `npm run lint` | Check code quality |

---

## ⚠️ Troubleshooting

**Port 5000 already in use?**
```powershell
netstat -ano | findstr :5000
```

**Database errors?**
```powershell
# Delete old database and restart
Remove-Item backend/bookings.db
npm start
```

**Frontend not loading?**
- Ensure backend is running first
- Check browser console for errors (F12)

---

## 📧 Admin Email Setup (Optional)

Update `backend/.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

Then uncomment email sending in `backend/server.js`

---

**Happy Booking! 🎉**
