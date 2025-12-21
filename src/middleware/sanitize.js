// middleware/sanitize.js
// Custom MongoDB sanitization middleware compatible with Express 5

/**
 * Recursively remove MongoDB operators from objects
 * @param {*} obj - Object to sanitize
 * @returns {*} Sanitized object
 */
const sanitize = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitize(item));
  }

  const sanitized = {};
  for (const key in obj) {
    // Skip MongoDB operators (keys starting with $)
    if (key.startsWith('$')) {
      continue;
    }
    sanitized[key] = sanitize(obj[key]);
  }

  return sanitized;
};

/**
 * Middleware to sanitize request data
 */
const mongoSanitize = (req, res, next) => {
  try {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitize(req.body);
    }

    // Sanitize params
    if (req.params && typeof req.params === 'object') {
      req.params = sanitize(req.params);
    }

    // Sanitize query (read-only in Express 5, so we create a new object)
    if (req.query && typeof req.query === 'object') {
      const sanitizedQuery = sanitize(req.query);
      // Replace query with sanitized version
      Object.keys(req.query).forEach(key => {
        if (key.startsWith('$')) {
          delete req.query[key];
        }
      });
    }

    next();
  } catch (error) {
    console.error('Sanitization error:', error);
    next(error);
  }
};

module.exports = mongoSanitize;
