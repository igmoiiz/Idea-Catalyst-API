// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please authenticate.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token hasn't been tampered with
    if (!token || token.split(".").length !== 3) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists in database
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email to access this resource",
      });
    }

    // Attach user info to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      isVerified: user.isVerified,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// Optional token verification - doesn't require email verification
const optionalVerifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token || token.split(".").length !== 3) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      req.user = null;
      return next();
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      isVerified: user.isVerified,
    };

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};


// Check if user has completed profile
const hasProfile = (Model) => async (req, res, next) => {
  try {
    const profile = await Model.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(403).json({
        success: false,
        message: "Please complete your profile first",
      });
    }

    req.profile = profile;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking profile",
      error: error.message,
    });
  }
};

// Check if user is authenticated (for routes that accept both authenticated and unauthenticated users)
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }
  next();
};

// Rate limiting middleware for sensitive operations
const rateLimitByIP = (limiter) => (req, res, next) => {
  // Apply rate limiting based on IP address
  const identifier = req.ip;
  limiter(identifier, (err, timeLeft) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error in rate limit check",
      });
    }
    
    if (timeLeft) {
      return res.status(429).json({
        success: false,
        message: `Too many requests. Please try again in ${timeLeft} seconds`,
      });
    }
    
    next();
  });
};

module.exports = {
  verifyToken,
  optionalVerifyToken,
  hasProfile,
  isAuthenticated,
  rateLimitByIP
};