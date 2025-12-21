// config/security.js

// Security configuration constants
const SECURITY_CONFIG = {
  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
    BCRYPT_ROUNDS: 12, // Higher = more secure but slower
  },

  // JWT configuration
  JWT: {
    EXPIRES_IN: "7d", // Token expiration time
    REFRESH_EXPIRES_IN: "30d", // Refresh token expiration
    ALGORITHM: "HS256",
  },

  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    AUTH_MAX_ATTEMPTS: 5,
    UPLOAD_MAX_REQUESTS: 10,
  },

  // File upload limits
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_PROFILE_PICTURE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    ALLOWED_DOCUMENT_TYPES: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
    MAX_IMAGES_PER_UPLOAD: 10,
  },

  // Session configuration
  SESSION: {
    MAX_ACTIVE_SESSIONS: 5, // Max concurrent sessions per user
    IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  },

  // CORS allowed origins
  CORS: {
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    ALLOWED_METHODS: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    ALLOWED_HEADERS: ["Content-Type", "Authorization"],
  },

  // Input validation
  VALIDATION: {
    MAX_STRING_LENGTH: 1000,
    MAX_ARRAY_LENGTH: 100,
    MAX_OBJECT_DEPTH: 5,
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
};

// Environment validation
const validateEnvironment = () => {
  const requiredEnvVars = [
    "MONGODB_URI",
    "JWT_SECRET",
    "NODE_ENV",
  ];

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET.length < 32) {
    console.warn(
      "⚠️  WARNING: JWT_SECRET should be at least 32 characters long for better security"
    );
  }

  // Check if in production
  if (process.env.NODE_ENV === "production") {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      console.warn("⚠️  WARNING: Cloudinary credentials not set");
    }
  }
};

// Security headers
const getSecurityHeaders = () => {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'",
  };
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .substring(0, SECURITY_CONFIG.VALIDATION.MAX_STRING_LENGTH);
  }
  return input;
};

// Check password strength
const isPasswordStrong = (password) => {
  const config = SECURITY_CONFIG.PASSWORD;
  
  if (password.length < config.MIN_LENGTH || password.length > config.MAX_LENGTH) {
    return {
      isStrong: false,
      message: `Password must be between ${config.MIN_LENGTH} and ${config.MAX_LENGTH} characters`,
    };
  }

  if (config.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    return {
      isStrong: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (config.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    return {
      isStrong: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (config.REQUIRE_NUMBERS && !/\d/.test(password)) {
    return {
      isStrong: false,
      message: "Password must contain at least one number",
    };
  }

  if (config.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isStrong: false,
      message: "Password must contain at least one special character",
    };
  }

  return { isStrong: true };
};

module.exports = {
  SECURITY_CONFIG,
  validateEnvironment,
  getSecurityHeaders,
  sanitizeInput,
  isPasswordStrong,
};
