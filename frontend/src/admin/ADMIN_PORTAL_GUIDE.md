# 🔐 Admin Portal Documentation

## Overview
The admin portal is a completely separate management interface for Lets Go Colombo Tours by J administrators to manage bookings and tours. It's kept separate from the public-facing website for security and usability.

---

## 📍 Access Points

### Admin Login
- **URL**: `http://localhost:5174/admin-panel`
- **Default Credentials**:
  - Email: `admin@letsgocolombotoursbyj.com`
  - Password: `admin123`
  - ⚠️ **Important**: Change these credentials after first login!

### Admin Dashboard
- **URL**: `http://localhost:5174/admin-panel/dashboard`
- **Access**: Only after successful login (JWT token required)

---

## 🏗️ Admin Portal Structure

```
frontend/src/admin/
├── AdminLogin.jsx              # Login page with authentication
├── AdminDashboard.jsx          # Main dashboard with bookings & tours
└── ProtectedAdminRoute.jsx     # Route protection wrapper
```

---

## 🔑 Features

### 1. Admin Login Page
- Email and password authentication
- JWT token storage in localStorage
- Error handling for failed login
- Default credentials displayed for setup

**File**: `AdminLogin.jsx`

### 2. Admin Dashboard
Split into two main tabs:

#### 📅 Bookings Tab
- View all customer bookings
- See: ID, Name, Email, Phone, Tour ID, Date, Status
- **Update Status**: Change booking status from dropdown
  - Pending (yellow)
  - Confirmed (green)
  - Cancelled (red)
- **Delete Booking**: Remove booking with confirmation
- Real-time updates without page refresh

#### 🎫 Tours Tab
- View all available tours
- Display: Tour title, description, price, creation date
- Card-based layout for easy scanning

**File**: `AdminDashboard.jsx`

---

## 🔒 Security Features

### 1. JWT Authentication
- Token stored in `localStorage` as `adminToken`
- Token required for all admin API requests
- Automatic redirect to login if token missing

### 2. Protected Routes
- `ProtectedAdminRoute` wrapper checks for valid token
- Unauthorized access redirected to login page
- Session persists until logout

### 3. Backend API Security
- All admin endpoints require `Authorization: Bearer {token}` header
- Token validated on server side
- Sensitive operations (update, delete) protected

---

## 🔄 API Integration

### Login Endpoint
```
POST http://localhost:5000/api/admin/login
Headers: Content-Type: application/json
Body: {
  "email": "admin@letsgocolombotoursbyj.com",
  "password": "admin123"
}
Response: {
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Login successful"
}
```

### Get Bookings
```
GET http://localhost:5000/api/bookings
Headers: Authorization: Bearer {token}
Response: Array of booking objects
```

### Update Booking Status
```
PUT http://localhost:5000/api/bookings/:id
Headers: 
  - Content-Type: application/json
  - Authorization: Bearer {token}
Body: {
  "status": "confirmed"
}
```

### Delete Booking
```
DELETE http://localhost:5000/api/bookings/:id
Headers: Authorization: Bearer {token}
```

### Get Tours
```
GET http://localhost:5000/api/tours
Response: Array of tour objects
```

---

## 🎯 User Workflow

### First Login (Setup)
1. Open `http://localhost:5174/admin-panel`
2. Enter default credentials:
   - Email: `admin@trailcolombo.com`
   - Password: `admin123`
3. Click "Login"
4. Redirected to dashboard
5. ⚠️ Change password via backend API or manually update database

### Regular Usage
1. Login with credentials
2. View bookings in "Bookings" tab
3. Update booking status as needed
4. Delete cancelled bookings
5. View available tours in "Tours" tab
6. Logout when done

### Logout
1. Click "Logout" button in top-right corner
2. Redirected to login page
3. Token removed from localStorage

---

## 🛠️ Customization Guide

### Add Admin Routes
Located in `frontend/src/App.jsx`:
```jsx
<Route path="/admin-panel" element={<AdminLogin />} />
<Route 
  path="/admin-panel/dashboard" 
  element={
    <ProtectedAdminRoute>
      <AdminDashboard />
    </ProtectedAdminRoute>
  } 
/>
```

### Change Default Credentials
**Backend (server.js)**: Update the seeding script or manually change in database.

### Customize Admin UI
- Colors: Edit inline style objects in `AdminDashboard.jsx`
- Layout: Modify grid/flex properties
- Tabs: Add new tab buttons and content sections

### Add New Admin Features
1. Create new file in `frontend/src/admin/`
2. Add route in `App.jsx` with `ProtectedAdminRoute`
3. Update navigation in `AdminDashboard.jsx`

---

## 🚀 Production Deployment

### Before Going Live
1. ✅ Change default admin credentials
2. ✅ Set strong passwords (minimum 12 characters)
3. ✅ Update `JWT_SECRET` in backend `.env`
4. ✅ Set `CORS_ORIGIN` to production domain
5. ✅ Enable HTTPS for all admin pages
6. ✅ Implement rate limiting on login endpoint
7. ✅ Add email verification for password resets
8. ✅ Enable admin activity logging

### Environment Variables
```
# Backend .env
JWT_SECRET=your-very-secure-secret-key-here
BCRYPT_SALT_ROUNDS=12
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### Database Changes
After deployment, update admin credentials:
```sql
UPDATE admins 
SET password = bcrypt('newstrongpassword', 12) 
WHERE email = 'admin@trailcolombo.com';
```

---

## 🐛 Troubleshooting

### Issue: "Login failed" message
- Verify credentials are correct
- Check backend server is running on port 5000
- Ensure `/api/admin/login` endpoint is working

### Issue: "Cannot access dashboard" after login
- Clear localStorage: `localStorage.clear()`
- Check browser console for errors
- Verify token is being stored properly

### Issue: Bookings not loading
- Check backend API is running
- Verify admin token is valid
- Check browser console for API errors

### Issue: Changes not saving
- Ensure token includes `Authorization` header
- Verify backend PUT/DELETE endpoints are working
- Check network tab in DevTools for error responses

---

## 📋 Checklist for Going Live

- [ ] Change default admin credentials
- [ ] Test login with new credentials
- [ ] Test all CRUD operations (Create, Read, Update, Delete)
- [ ] Verify bookings display correctly
- [ ] Test status updates work properly
- [ ] Test booking deletion with confirmation
- [ ] Verify logout works and clears session
- [ ] Test session persistence (reload page, still logged in)
- [ ] Check responsive design on mobile/tablet
- [ ] Test error handling (invalid credentials, network errors)
- [ ] Update JWT_SECRET in production
- [ ] Set up HTTPS for admin portal
- [ ] Configure backup strategies for bookings data
- [ ] Set up monitoring/logging for admin activities

---

## 📞 Support

For issues or questions about the admin portal:
1. Check browser console (F12 → Console tab)
2. Check backend logs
3. Verify all environment variables are set
4. Test with default credentials first
5. Check network requests in DevTools

---

**Last Updated**: February 23, 2026
**Version**: 1.0
