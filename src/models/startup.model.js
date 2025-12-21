const mongoose = require("mongoose");

const startupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    funding: {
      type: String,
      required: true, // e.g., Seed, Series A
    },
    valuation: {
      type: String,
      required: true,
    },
    goal: {
      type: String,
      required: true,
    },
    raised: {
      type: String,
      required: true, // e.g., "65%"
    },
    // Optional: Link to an idea if it graduated from the idea phase
    idea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Idea",
    },
    // For simplicity, we won't add full user ownership logic yet unless requested
    // assuming these are curated or added by admin for now.
  },
  { timestamps: true }
);

module.exports = mongoose.model("Startup", startupSchema);
