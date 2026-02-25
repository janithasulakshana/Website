# 🔧 Admin Panel Troubleshooting Guide

## ⚡ Quick Fix Checklist

### Step 1: Clear Browser Cache and LocalStorage
Open browser console (F12) and run:
```javascript
localStorage.clear();
sessionStorage.clear();
console.log("Cache cleared");
```
Then refresh the page.

### Step 2: Hard Refresh Frontend
- **Windows/Linux**: `Ctrl + Shift + R` (hard refresh)
- **Mac**: `Cmd + Shift + R`

### Step 3: Check Backend is Running
Test in PowerShell:
```powershell
$body = @{email="admin@trailcolombo.com"; password="admin123"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/admin/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing
```

Expected response: `StatusCode : 200` with a token

### Step 4: Verify Frontend is Running
- Open browser and go to `http://localhost:5174` 
- Should see the website normally
- Check for errors in browser console (F12 → Console tab)

### Step 5: Test Admin Portal URLs
Try these URLs directly:
- `http://localhost:5174/admin-panel` → Should show login form
- `http://localhost:5174/admin-panel/dashboard` → Should redirect to login (no token)

---

## 🧪 Testing Steps

### Test 1: Admin Login Form Appears
1. Go to `http://localhost:5174/admin-panel`
2. You should see a login form with:
   - Email input field
   - Password input field
   - Login button
   - Default credentials displayed

**If blank or error**: Check browser console (F12) for errors

### Test 2: Try Login
1. Enter credentials:
   - Email: `admin@trailcolombo.com`
   - Password: `admin123`
2. Click Login button
3. Should see "Logging in..." message
4. Should redirect to dashboard

**If fails**: Check:
- Backend is running (see Step 3 above)
- No CORS errors in browser console
- Check network tab (F12 → Network) for API response

### Test 3: Dashboard Loads
After successful login:
1. Should see "Admin Dashboard" header
2. Should see your email in top-right
3. Should see "Bookings" and "Tours" tabs
4. Should see "Logout" button

**If blank**: Check browser console for errors

### Test 4: Logout Works
1. Click "Logout" button
2. Should redirect back to login page
3. LocalStorage should be cleared

---

## 🐛 Common Issues & Solutions

### Issue: Blank page at `/admin-panel`
**Causes**: Import error, syntax error in AdminLogin.jsx
**Solution**:
1. Check browser console (F12 → Console)
2. Look for red error messages
3. Restart frontend: Kill node processes and run `npm run dev`

### Issue: Login form shows but login fails
**Causes**: Backend not running, CORS issue, wrong credentials
**Solutions**:
1. Check backend is running: `netstat -ano | findstr :5000`
2. Test backend directly (see Step 3 above)
3. Verify credentials in database

### Issue: After login, redirects back to login page
**Causes**: Token not being stored, dashboard not loading
**Solutions**:
1. Check localStorage is saving token:
   - F12 → Application → LocalStorage → localhost:5174
   - Should have "adminToken" and "adminEmail" keys
2. Check browser console for errors on dashboard

### Issue: "CORS" error in console
**Cause**: Backend CORS settings
**Solution**:
1. Check backend `.env` has `CORS_ORIGIN=http://localhost:5173` (or 5174)
2. Restart backend server

### Issue: "Failed to fetch bookings" message
**Causes**: Token invalid, API endpoint not working
**Solutions**:
1. Verify token is valid
2. Check backend `/api/bookings` endpoint works:
   ```powershell
   $token = "your-token-here"
   Invoke-WebRequest -Uri "http://localhost:5000/api/bookings" -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
   ```

---

## 🔍 Debugging Steps

### Check 1: Frontend Console Errors
1. Open browser (Chrome/Edge)
2. Press `F12` to open DevTools
3. Go to "Console" tab
4. Look for any red error messages
5. Copy/paste errors for debugging

### Check 2: Network Requests
1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Try to login
4. Look for request to `admin/login`
5. Check response status and content

### Check 3: LocalStorage
1. Open browser DevTools (F12)
2. Go to "Application" tab
3. Click "LocalStorage" → "http://localhost:5174"
4. Verify after login:
   - `adminToken` should exist with long string
   - `adminEmail` should show email

### Check 4: Backend Logs
Check terminal where backend is running for errors:
```
Server running on http://127.0.0.1:5000
```
Look for any error messages

---

## 🚀 Restart Everything

### Restart Backend
```powershell
# Kill backend process
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Go to backend directory
cd C:\Users\Aruthsha Kasandun\Desktop\Website\backend

# Start backend
npm start
```

### Restart Frontend
```powershell
# Kill frontend Vite process
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Go to frontend directory
cd C:\Users\Aruthsha Kasandun\Desktop\Website\frontend

# Start frontend
npm run dev
```

---

## ✅ Manual Verification

### Verify Admin Account Exists
Check database (SQLite):
```sql
SELECT * FROM admins WHERE email='admin@trailcolombo.com';
```

Should return one row with admin details.

### Verify API Endpoints
Test each endpoint:

**1. Login**
```powershell
$body = @{email="admin@trailcolombo.com"; password="admin123"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/admin/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing
```

**2. Get Bookings (after getting token)**
```powershell
$token = "token-from-login"
Invoke-WebRequest -Uri "http://localhost:5000/api/bookings" -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
```

**3. Get Tours**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/tours" -UseBasicParsing
```

---

## 📞 Emergency Reset

### Reset All (Complete Fresh Start)
1. **Delete all sessions**:
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Restart all services**:
   ```powershell
   # Kill all node processes
   Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
   
   # Wait 2 seconds
   Start-Sleep -Seconds 2
   
   # Restart backend
   cd C:\Users\Aruthsha Kasandun\Desktop\Website\backend
   npm start
   
   # In new terminal, restart frontend
   cd C:\Users\Aruthsha Kasandun\Desktop\Website\frontend
   npm run dev
   ```

3. **Test login again**:
   - Go to `http://localhost:5174/admin-panel`
   - Enter default credentials

---

## 📋 Support Info to Provide

If still having issues, provide:
1. Screenshot of error message
2. Output from browser console (F12 → Console tab)
3. Network request details (F12 → Network tab)
4. Backend terminal output
5. Steps you've already tried

---

**Last Updated**: February 23, 2026
