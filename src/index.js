require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

// Routes
const authRoutes = require("./routes/auth.routes");
const ideaRoutes = require("./routes/idea.routes");
const personaRoutes = require("./routes/persona.routes");
const marketplaceRoutes = require("./routes/marketplace.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
const allowedOrigins = [
  "https://idea-catalyst-f0j93duqf-moiz-balochs-projects.vercel.app",
  "https://idea-catalyst-api.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));


app.use(express.json());
app.use(morgan("dev"));

// Database Connection
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
    });
} else {
  console.warn("MONGODB_URI is not defined. Database features will be unavailable.");
}


// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/personas", personaRoutes);
app.use("/api/marketplace", marketplaceRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("IdeaCatalyst Backend is running");
});

// Health check for Vercel
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server (not used in Vercel serverless)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
