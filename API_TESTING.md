# Trail Colombo API Testing Guide

This file contains example requests to test all API endpoints.

## Base URL
```
http://localhost:5000
```

## 1. Admin Registration

**POST** `/api/admin/register`

```json
{
  "email": "admin@trailcolombo.com",
  "password": "admin123"
}
```

## 2. Admin Login

**POST** `/api/admin/login`

```json
{
  "email": "admin@trailcolombo.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 3. Get All Tours

**GET** `/api/tours`

No authentication required. Response:

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

---

## 4. Add New Tour

**POST** `/api/tours`

Headers:
```
Authorization: Bearer {token}
Content-Type: application/json
```

Body:
```json
{
  "title": "Colombo Port City Tour",
  "price": 60,
  "description": "Explore the modern Port City development with guided tour",
  "image": "https://example.com/port-city.jpg",
  "whatsapp": "94771234567"
}
```

---

## 5. Delete Tour

**DELETE** `/api/tours/{id}`

Headers:
```
Authorization: Bearer {token}
```

---

## 6. Create Booking

**POST** `/api/bookings`

No authentication required.

Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94712345678",
  "tour_id": 1,
  "date": "2024-03-15"
}
```

Response:
```json
{
  "success": true,
  "id": 1
}
```

---

## 7. Get All Bookings

**GET** `/api/bookings`

Headers:
```
Authorization: Bearer {token}
```

Response:
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

---

## 8. Update Booking Status

**PUT** `/api/bookings/{id}`

Headers:
```
Authorization: Bearer {token}
Content-Type: application/json
```

Body:
```json
{
  "status": "confirmed"
}
```

Valid statuses: `pending`, `confirmed`, `cancelled`

---

## 9. Delete Booking

**DELETE** `/api/bookings/{id}`

Headers:
```
Authorization: Bearer {token}
```

---

## 🧪 Testing with PowerShell

### Get Token
```powershell
$loginBody = @{
    email = "admin@trailcolombo.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $loginBody

$token = $response.token
Write-Host "Token: $token"
```

### Create Tour
```powershell
$tourBody = @{
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
  -Body $tourBody
```

### Create Booking
```powershell
$bookingBody = @{
    name = "Jane Doe"
    email = "jane@example.com"
    phone = "+94712345678"
    tour_id = 1
    date = "2024-03-20"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" `
  -Method POST `
  -ContentType "application/json" `
  -Body $bookingBody
```

---

## 📊 Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid token"
}
```

### 404 Not Found
```json
{
  "error": "Tour not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error message"
}
```
