const { upload, uploadToCloudinary } = require("../config/cloudinary");

// ---------------------------
// PROFILE PICTURE UPLOAD
// ---------------------------
const handleProfilePictureUpload = (req, res, next) => {
  const uploader = upload.single("profilePicture");
  uploader(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 5MB.",
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) return next();
    try {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "air-conz/profile-pictures"
      );
      req.uploadedFiles = [{ url: result.secure_url, publicId: result.public_id }];
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error uploading profile picture",
        error: error.message,
      });
    }
  });
};

// ---------------------------
// MULTIPLE BUSINESS IMAGES
// ---------------------------
const handleBusinessImagesUpload = (req, res, next) => {
  const uploader = upload.array("businessImages", 10);
  uploader(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 10MB.",
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.files || req.files.length === 0) return next();
    try {
      req.uploadedFiles = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer,
          "air-conz/business-images"
        );
        req.uploadedFiles.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error uploading business images",
        error: error.message,
      });
    }
  });
};

// ---------------------------
// SINGLE BUSINESS IMAGE
// ---------------------------
const handleSingleBusinessImageUpload = (req, res, next) => {
  const uploader = upload.single("businessImage");
  uploader(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large. Max 10MB.",
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) return next();
    try {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "air-conz/business-images"
      );
      req.uploadedFiles = [{ url: result.secure_url, publicId: result.public_id }];
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error uploading business image",
        error: error.message,
      });
    }
  });
};

// ---------------------------
// SERVICE IMAGES (multiple)
// ---------------------------
const handleServiceImagesUpload = (req, res, next) => {
  const uploader = upload.array("serviceImages", 5);
  uploader(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large. Max 5MB.",
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.files || req.files.length === 0) return next();
    try {
      req.uploadedFiles = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer,
          "air-conz/service-images"
        );
        req.uploadedFiles.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error uploading service images",
        error: error.message,
      });
    }
  });
};

// ---------------------------
// DOCUMENT UPLOAD (3 files max)
// ---------------------------
const handleDocumentUpload = (req, res, next) => {
  const uploader = upload.fields([
    { name: "businessLicense", maxCount: 1 },
    { name: "insurance", maxCount: 1 },
    { name: "certification", maxCount: 1 },
  ]);
  uploader(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large. Max 10MB.",
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    const files = req.files || {};
    try {
      req.uploadedFiles = {};
      for (const key of Object.keys(files)) {
        const file = files[key][0];
        const result = await uploadToCloudinary(
          file.buffer,
          "air-conz/documents"
        );
        req.uploadedFiles[key] = {
          url: result.secure_url,
          publicId: result.public_id,
        };
      }
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error uploading documents",
        error: error.message,
      });
    }
  });
};

module.exports = {
  handleProfilePictureUpload,
  handleBusinessImagesUpload,
  handleSingleBusinessImageUpload,
  handleServiceImagesUpload,
  handleDocumentUpload,
};