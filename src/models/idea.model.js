const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a title for your idea"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description of your idea"],
      trim: true,
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    category: {
      type: String,
      enum: [
        "Software",
        "Physical Product",
        "Service",
        "Other",
        "FinTech",
        "AI",
        "HealthTech",
        "EdTech",
        "E-commerce",
        "SaaS",
        "CleanTech"
      ],
      default: "Other",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Index for feed queries
ideaSchema.index({ isPublic: 1, createdAt: -1 });

const Idea = mongoose.model("Idea", ideaSchema);

module.exports = Idea;
