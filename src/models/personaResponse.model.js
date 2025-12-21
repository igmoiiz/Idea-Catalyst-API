const mongoose = require("mongoose");

const personaResponseSchema = new mongoose.Schema(
  {
    idea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Idea",
      required: true,
    },
    personaType: {
      type: String,
      required: true,
      enum: [
        "Market Analyst",
        "Project Manager",
        "Investor",
        "Team Builder",
        "Pitch Deck",
        "VC",
        "Customer",
        "Skeptic"
      ],
    },
    content: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 100,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to easily find responses for a specific idea
personaResponseSchema.index({ idea: 1, personaType: 1 });

const PersonaResponse = mongoose.model("PersonaResponse", personaResponseSchema);

module.exports = PersonaResponse;
