// middleware/validator.js
const { body, param, query, validationResult } = require("express-validator");

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Registration validation
const validateRegistration = [
  // body("name")
  //   .trim()
  //   .notEmpty()
  //   .withMessage("Name is required")
  //   .isLength({ min: 2, max: 100 })
  //   .withMessage("Name must be between 2 and 100 characters")
  //   .matches(/^[a-zA-Z\s]+$/)
  //   .withMessage("Name can only contain letters and spaces"),
  // body("email")
  //   .trim()
  //   .notEmpty()
  //   .withMessage("Email is required")
  //   .isEmail()
  //   .withMessage("Please provide a valid email")
  //   .normalizeEmail(),
  // body("password")
  //   .notEmpty()
  //   .withMessage("Password is required")
  //   .isLength({ min: 8 })
  //   .withMessage("Password must be at least 8 characters long")
  //   .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  //   .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  validate,
];

// Login validation
const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

// Booking validation
const validateBooking = [
  body("consumerId")
    .notEmpty()
    .withMessage("Consumer ID is required")
    .isMongoId()
    .withMessage("Invalid consumer ID"),
  body("serviceProviderId")
    .notEmpty()
    .withMessage("Service provider ID is required")
    .isMongoId()
    .withMessage("Invalid service provider ID"),
  body("serviceId")
    .notEmpty()
    .withMessage("Service ID is required")
    .isMongoId()
    .withMessage("Invalid service ID"),
  body("scheduledDateTime")
    .notEmpty()
    .withMessage("Scheduled date and time is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      const date = new Date(value);
      if (date <= new Date()) {
        throw new Error("Scheduled date must be in the future");
      }
      return true;
    }),
  body("location.address.street")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Street address too long"),
  body("location.address.city")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("City name too long"),
  body("consumerNotes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes too long (max 1000 characters)"),
  validate,
];

// Service validation
const validateService = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Service name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Service name must be between 3 and 100 characters"),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
      "AC Installation",
      "AC Repair",
      "AC Maintenance",
      "AC Cleaning",
      "AC Inspection",
      "Emergency Service",
      "Commercial Service",
      "Residential Service",
    ])
    .withMessage("Invalid category"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("shortDescription")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Short description too long (max 200 characters)"),
  validate,
];

// MongoDB ID validation
const validateMongoId = [
  param("id").isMongoId().withMessage("Invalid ID format"),
  validate,
];

// Query validation for pagination
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("sortBy")
    .optional()
    .isString()
    .withMessage("Sort by must be a string"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be 'asc' or 'desc'"),
  validate,
];

// Email validation
const validateEmail = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  validate,
];

// Review validation
const validateReview = [
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Comment too long (max 1000 characters)"),
  validate,
];

// Phone number validation
const validatePhoneNumber = [
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Please provide a valid phone number"),
  validate,
];

module.exports = {
  validate,
  validateRegistration,
  validateLogin,
  validateBooking,
  validateService,
  validateMongoId,
  validatePagination,
  validateEmail,
  validateReview,
  validatePhoneNumber,
};
