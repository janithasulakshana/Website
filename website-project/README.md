# Website - Full Stack Web Application

A modern, production-ready full-stack web application built with React, Node.js, Express, and PostgreSQL.

## 🚀 Features

- **Frontend**: React with modern UI/UX
- **Backend**: Node.js + Express REST API
- **Database**: PostgreSQL with Docker
- **Authentication**: JWT-based user auth
- **Responsive Design**: Mobile-friendly interface
- **Docker Support**: Easy deployment with Docker Compose
- **Hot Reload**: Development mode with auto-refresh

## 📋 Prerequisites

### Local Development
- Node.js 18+ 
- npm or yarn
- PostgreSQL 12+ (or Docker)
- Git

### Docker Deployment
- Docker & Docker Compose
- 4GB+ RAM
- 2GB+ disk space

## 🛠️ Quick Start

### Option 1: Local Development

#### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
# Copy .env.example to .env and update values
cp .env.example .env

# Start backend (development mode)
npm run dev

# Backend will run on http://localhost:5000
```

#### 2. Frontend Setup (new terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend (development mode)
npm start

# Frontend will run on http://localhost:3000
```

### Option 2: Docker Compose (Recommended)

```bash
# From project root
docker-compose up -d

# Services will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: localhost:5432
# PgAdmin: http://localhost:5050
```

## 📁 Project Structure

```
website-project/
├── backend/
│   ├── src/
│   │   ├── server.js           # Main app file
│   │   ├── routes/             # API endpoints
│   │   ├── controllers/        # Business logic
│   │   ├── middleware/         # Express middleware
│   │   ├── models/             # Database models
│   │   ├── config/             # Configuration
│   │   └── db/                 # Database setup
│   ├── package.json
│   ├── .env
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── .env
│   └── Dockerfile
│
├── docker-compose.yml          # Docker Compose config
└── README.md                    # This file
```

## 🔧 Configuration

### Backend .env File

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=website_db
DB_USER=postgres
DB_PASSWORD=postgres

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=24h

# CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend .env File

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post (requires auth)
- `GET /api/posts/:id` - Get post details
- `PUT /api/posts/:id` - Update post (requires auth)
- `DELETE /api/posts/:id` - Delete post (requires auth)

### Users
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update profile (requires auth)

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. User registers or logs in
2. Backend generates JWT token
3. Token stored in browser localStorage
4. Token sent with each API request
5. Backend validates token for protected routes

Example request with token:
```javascript
axios.get('/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🗄️ Database

### Setup PostgreSQL (if not using Docker)

```bash
# Create database
createdb website_db

# Create tables (run migration script)
npm run migrate
```

### View Database (PgAdmin)

```
URL: http://localhost:5050
Email: admin@admin.com
Password: admin
```

## 📱 Frontend Pages

- **Home** (`/`) - Dashboard with posts
- **Login** (`/login`) - User login form
- **Register** (`/register`) - User registration form
- **Profile** (`/profile`) - User profile (protected)

## 🚀 Deployment

### Docker Push to Registry

```bash
# Build images
docker-compose build

# Tag images
docker tag website-frontend your-registry/website-frontend:v1.0.0
docker tag website-backend your-registry/website-backend:v1.0.0

# Push to registry
docker push your-registry/website-frontend:v1.0.0
docker push your-registry/website-backend:v1.0.0
```

### Production Environment

1. Update `.env` files with production values
2. Set `NODE_ENV=production`
3. Use strong `JWT_SECRET`
4. Enable HTTPS
5. Configure firewall rules
6. Set up monitoring & logging

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process using port
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error
```bash
# Check PostgreSQL is running
# Verify DB_HOST and DB_PORT in .env
# Ensure database exists
createdb website_db
```

### Frontend Cannot Connect to Backend
```bash
# Check REACT_APP_API_BASE_URL in .env
# Verify backend is running on port 5000
# Check CORS settings in backend
```

### Docker Issues
```bash
# Clear Docker cache
docker-compose down -v
docker system prune

# Rebuild containers
docker-compose up --build
```

## 📊 Performance Tips

1. **Database**: Add indexes on frequently queried columns
2. **Frontend**: Implement code splitting and lazy loading
3. **Backend**: Use caching (Redis) for frequently accessed data
4. **Images**: Optimize images before uploading
5. **Monitoring**: Set up application monitoring

## 🔐 Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Enable HTTPS in production
- [ ] Set strong database password
- [ ] Implement rate limiting
- [ ] Add input validation & sanitization
- [ ] Use environment variables for secrets
- [ ] Enable CORS only for trusted origins
- [ ] Implement SQL injection prevention
- [ ] Add security headers (Helmet.js)
- [ ] Regular security audits

## 📞 Support

- **Issues**: Create GitHub issue
- **Documentation**: Check docs/
- **Community**: Join discussions

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Happy coding! 🎉**

Last Updated: 2024
