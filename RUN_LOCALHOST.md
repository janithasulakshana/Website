# Trail Colombo - Running on Localhost

## Prerequisites
- Node.js (v14 or higher)
- npm

## Configuration Files Created
1. **backend/.env** - Backend environment variables
2. **frontend/.env** - Frontend environment variables

## How to Run

### Option 1: Using PowerShell Script
```
powershell
.\START_DEV.ps1
```

### Option 2: Manual Start

#### Start Backend (Terminal 1)
```
bash
cd backend
npm install
npm start
```
Backend runs at: http://localhost:5000

#### Start Frontend (Terminal 2)
```
bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

## Fixes Applied
1. ✅ Updated frontend API_CONFIG to use Vite environment variables (`VITE_` prefix)
2. ✅ Fixed hardcoded URLs in Tours.jsx to use centralized API_CONFIG
3. ✅ Fixed hardcoded URLs in Admin.jsx to use centralized API_CONFIG
4. ✅ Created backend/.env with JWT_SECRET configuration
5. ✅ Created frontend/.env with API_BASE_URL configuration
