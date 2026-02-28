# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Authentication

#### Register
```
POST /auth/register
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "id": "user-id",
  "name": "John Doe",
  "email": "john@example.com",
  "message": "User registered successfully"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john@example.com",
  "message": "Login successful"
}
```

---

### Posts

#### Get All Posts
```
GET /posts

Response:
{
  "posts": [
    {
      "id": "post-id",
      "title": "My First Post",
      "content": "This is my first post",
      "author": "John Doe",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Post (Protected)
```
POST /posts
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "title": "My First Post",
  "content": "This is my first post"
}

Response:
{
  "id": "post-id",
  "title": "My First Post",
  "content": "This is my first post",
  "author": "user-id",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Get Post by ID
```
GET /posts/:id

Response:
{
  "id": "post-id",
  "title": "My First Post",
  "content": "This is my first post",
  "author": "John Doe",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Update Post (Protected)
```
PUT /posts/:id
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "title": "Updated Title",
  "content": "Updated content"
}

Response:
{
  "id": "post-id",
  "title": "Updated Title",
  "content": "Updated content",
  "updatedAt": "2024-01-01T10:00:00Z"
}
```

#### Delete Post (Protected)
```
DELETE /posts/:id
Authorization: Bearer <token>

Response:
{
  "message": "Post deleted successfully"
}
```

---

### Users

#### Get Profile (Protected)
```
GET /users/profile
Authorization: Bearer <token>

Response:
{
  "id": "user-id",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Update Profile (Protected)
```
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Jane Doe",
  "bio": "Software Developer"
}

Response:
{
  "id": "user-id",
  "name": "Jane Doe",
  "email": "john@example.com",
  "bio": "Software Developer",
  "updatedAt": "2024-01-01T10:00:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "status": 400,
  "details": "Additional details if available"
}
```

### Common Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (not allowed)
- `404` - Not Found
- `500` - Server Error

---

## Using the API from Frontend

### With Axios
```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Register
await API.post('/auth/register', { name, email, password });

// Login
const response = await API.post('/auth/login', { email, password });
localStorage.setItem('token', response.data.token);

// Get posts
const posts = await API.get('/posts');

// Create post
await API.post('/posts', { title, content });
```

---

## Rate Limiting

Currently not implemented. Will be added in v2.

---

## Webhooks

Currently not implemented. Will be added in future versions.

---

## Version
API v1.0
Last Updated: 2024
