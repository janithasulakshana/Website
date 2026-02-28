require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running", timestamp: new Date() });
});

app.post("/api/auth/register", (req, res) => {
  const { email, password, name } = req.body;
  res.json({ message: "User registered", email, name });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  res.json({ message: "Login successful", token: "jwt_token_here", email });
});

app.get("/api/posts", (req, res) => {
  res.json({ posts: [] });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:$PORT`);
});

module.exports = app;
