const express = require("express");
const router = express.Router();
const Idea = require("../models/idea.model");
const { verifyToken } = require("../middleware/auth");

// Create a new idea
router.post("/", verifyToken, async (req, res) => {
  // router.post("/", async (req, res) => {
  // Mock user for testing
  // req.user = { id: "60d0fe4f5311236168a109ca" }; // Dummy ID
  try {
    const { title, description, category, isPublic, tags } = req.body;

    const idea = new Idea({
      user: req.user.id,
      title,
      description,
      category,
      isPublic,
      tags,
    });

    await idea.save();

    res.status(201).json({
      success: true,
      data: idea,
    });
  } catch (error) {
    console.error("Create idea error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating idea",
      error: error.message,
    });
  }
});

// Get public feed
router.get("/feed", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const ideas = await Idea.find({ isPublic: true })
      .populate("user", "name") // Only get user name
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Idea.countDocuments({ isPublic: true });

    res.status(200).json({
      success: true,
      count: ideas.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: ideas,
    });
  } catch (error) {
    console.error("Feed error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching feed",
      error: error.message,
    });
  }
});

// Get user's ideas
router.get("/my-ideas", verifyToken, async (req, res) => {
  try {
    const ideas = await Idea.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: ideas.length,
      data: ideas,
    });
  } catch (error) {
    console.error("My ideas error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching your ideas",
      error: error.message,
    });
  }
});

// Get single idea
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id).populate("user", "name");

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: "Idea not found",
      });
    }

    // Check ownership or visibility
    if (
      idea.user._id.toString() !== req.user.id &&
      !idea.isPublic &&
      req.user.role !== "admin" // Assuming admin role exists or just for safety
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this idea",
      });
    }

    // Increment view count if not owner
    if (idea.user._id.toString() !== req.user.id) {
      idea.stats.views += 1;
      await idea.save();
    }

    res.status(200).json({
      success: true,
      data: idea,
    });
  } catch (error) {
    console.error("Get idea error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching idea",
      error: error.message,
    });
  }
});

// Update idea visibility
router.patch("/:id/visibility", verifyToken, async (req, res) => {
  try {
    const { isPublic } = req.body;

    if (typeof isPublic !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "isPublic must be a boolean"
      });
    }

    let idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: "Idea not found",
      });
    }

    if (idea.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this idea",
      });
    }

    idea.isPublic = isPublic;
    await idea.save();

    res.status(200).json({
      success: true,
      data: idea,
    });
  } catch (error) {
    console.error("Update visibility error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating visibility",
      error: error.message,
    });
  }
});

// Delete idea
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: "Idea not found",
      });
    }

    if (idea.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this idea",
      });
    }

    await idea.deleteOne();

    res.status(200).json({
      success: true,
      message: "Idea deleted successfully",
    });
  } catch (error) {
    console.error("Delete idea error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting idea",
      error: error.message,
    });
  }
});

// Like/Unlike idea
router.post("/:id/like", verifyToken, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: "Idea not found",
      });
    }

    // Toggle like (increment/decrement)
    // In a production app, you'd track individual user likes in a separate collection
    // For now, we'll just increment the counter
    idea.stats.likes += 1;
    await idea.save();

    res.status(200).json({
      success: true,
      data: idea,
      message: "Idea liked successfully",
    });
  } catch (error) {
    console.error("Like idea error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while liking idea",
      error: error.message,
    });
  }
});

module.exports = router;
