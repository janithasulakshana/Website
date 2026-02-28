# Quick Start Guide

## Option 1: Docker Compose (Easiest) ✅

### Requirements
- Docker & Docker Compose installed
- 5-10 minutes

### Steps
1. Clone the repository
2. Run from project root:
   ```bash
   docker-compose up -d
   ```
3. Access:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - Database: localhost:5432 (pgadmin on port 5050)

4. To stop:
   ```bash
   docker-compose down
   ```

---

## Option 2: Local Development

### Requirements
- Node.js 18+
- npm/yarn
- PostgreSQL installed and running
- 10-15 minutes

### Backend Setup
```bash
cd backend
npm install
npm run dev
```
Runs on: http://localhost:5000

### Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm start
```
Runs on: http://localhost:3000

---

## Testing the Application

### 1. Register a new account
- Go to http://localhost:3000/register
- Fill in Name, Email, Password
- Click Register

### 2. Login
- Go to http://localhost:3000/login
- Enter your credentials
- Click Login

### 3. Create a post
- After login, go to dashboard
- Create a new post
- View your posts

---

## Common Commands

### Backend
- `npm start` - Production mode
- `npm run dev` - Development mode with auto-reload
- `npm test` - Run tests
- `npm run migrate` - Run database migrations

### Frontend
- `npm start` - Development server with hot-reload
- `npm run build` - Build for production
- `npm test` - Run tests

### Docker
- `docker-compose up` - Start all services
- `docker-compose up -d` - Start in background
- `docker-compose down` - Stop all services
- `docker-compose logs -f backend` - View backend logs
- `docker-compose logs -f frontend` - View frontend logs
- `docker-compose ps` - Show running containers

---

## Database Access

### PgAdmin (Web UI)
- URL: http://localhost:5050
- Email: admin@admin.com
- Password: admin

### Command Line
```bash
psql -h localhost -U postgres -d website_db
```

---

## Troubleshooting

### Port already in use?
```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Can't connect to database?
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Try creating database manually
createdb website_db
```

### Frontend shows blank page?
```bash
# Clear browser cache (Ctrl+Shift+Del)
# Check browser console for errors (F12)
# Verify REACT_APP_API_BASE_URL in .env
```

### Docker container won't start?
```bash
# Clear volumes and start fresh
docker-compose down -v
docker-compose up --build
```

---

## Next Steps

1. ✅ Application is running
2. 📝 Modify components to suit your needs
3. 🔧 Add your business logic
4. 🎨 Customize styling
5. 🚀 Deploy to production

See README.md for full documentation.
