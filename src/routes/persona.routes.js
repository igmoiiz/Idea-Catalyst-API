const express = require("express");
const router = express.Router();
const PersonaResponse = require("../models/personaResponse.model");
const Idea = require("../models/idea.model");
const geminiService = require("../services/gemini.service");
const { verifyToken } = require("../middleware/auth");

// Generate persona response
router.post("/generate", verifyToken, async (req, res) => {
  // router.post("/generate", async (req, res) => {
  // Mock user for testing
  // req.user = { id: "60d0fe4f5311236168a109ca" };
  try {
    const { ideaId, personaType } = req.body;

    if (!ideaId || !personaType) {
      return res.status(400).json({
        success: false,
        message: "Please provide ideaId and personaType",
      });
    }

    // Check if idea exists and belongs to user
    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: "Idea not found",
      });
    }

    if (idea.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to generate response for this idea",
      });
    }

    // Check if response already exists
    const existingResponse = await PersonaResponse.findOne({
      idea: ideaId,
      personaType,
    });

    if (existingResponse) {
      return res.status(200).json({
        success: true,
        data: existingResponse,
        message: "Response already exists",
      });
    }

    // Generate response using Gemini
    console.log(`📝 Generating persona response for: ${personaType}`);
    console.log(`   Idea: ${idea.title}`);

    const aiResponse = await geminiService.generatePersonaResponse(
      `Title: ${idea.title}\nDescription: ${idea.description}\nCategory: ${idea.category}`,
      personaType
    );

    // Check if this is a fallback response
    if (aiResponse.isFallback) {
      console.warn(`⚠️  Using fallback response for ${personaType}`);
    } else {
      console.log(`✓ Generated AI response for ${personaType} with rating: ${aiResponse.rating}`);
    }

    // Save response
    const personaResponse = new PersonaResponse({
      idea: ideaId,
      personaType,
      content: aiResponse.content,
      rating: aiResponse.rating,
    });

    await personaResponse.save();

    res.status(201).json({
      success: true,
      data: personaResponse,
      isFallback: aiResponse.isFallback || false, // Inform frontend if this is a fallback
    });
  } catch (error) {
    console.error("❌ Generate persona response error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while generating response",
      error: error.message,
    });
  }
});

// Get responses for an idea
router.get("/idea/:ideaId", verifyToken, async (req, res) => {
  try {
    const { ideaId } = req.params;

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: "Idea not found",
      });
    }

    // Check access rights (owner or public)
    if (
      idea.user.toString() !== req.user.id &&
      !idea.isPublic
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view responses for this idea",
      });
    }

    const responses = await PersonaResponse.find({ idea: ideaId });

    res.status(200).json({
      success: true,
      count: responses.length,
      data: responses,
    });
  } catch (error) {
    console.error("Get responses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching responses",
      error: error.message,
    });
  }
});

module.exports = router;
