# Backend Architecture

## Overview
Node.js + Express REST API with PostgreSQL database.

## Directory Structure
```
backend/src/
├── server.js           # Express app setup
├── routes/             # API route handlers
│   ├── auth.js
│   ├── posts.js
│   └── users.js
├── controllers/        # Business logic
│   ├── authController.js
│   ├── postController.js
│   └── userController.js
├── models/             # Database models
│   ├── User.js
│   └── Post.js
├── middleware/         # Express middleware
│   ├── auth.js         # JWT authentication
│   ├── validation.js   # Input validation
│   └── errorHandler.js # Error handling
├── db/                 # Database setup
│   ├── connection.js
│   ├── migrate.js
│   └── seed.js
├── config/             # Configuration
│   ├── database.js
│   └── constants.js
└── utils/              # Utility functions
    ├── validators.js
    ├── bcrypt.js
    └── jwt.js
```

## Request Flow
1. Request comes in
2. Middleware processes (auth, validation)
3. Route handler matches path
4. Controller handles business logic
5. Database query executed
6. Response sent back

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Posts Table
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  authorId UUID REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## Authentication Flow
1. User registers with email/password
2. Password hashed with bcryptjs
3. User logs in with email/password
4. JWT token generated and returned
5. Token stored in frontend localStorage
6. Token sent with each request
7. JWT middleware validates token
8. Request proceeds if valid

## Error Handling
- Try-catch blocks in controllers
- Global error handler middleware
- Consistent error response format
- Proper HTTP status codes

## Validation
- Input validation middleware
- Database constraint validation
- Business logic validation

## Security
- Password hashing with bcryptjs
- JWT for authentication
- CORS enabled
- Helmet for HTTP headers
- SQL injection prevention
- Rate limiting (future)

## Performance
- Database indexes
- Connection pooling
- Caching (future)
- Query optimization
