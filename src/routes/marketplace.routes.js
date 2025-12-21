const express = require("express");
const router = express.Router();
const Idea = require("../models/idea.model");

// Get all showcased ideas (formatted as startups)
router.get("/", async (req, res) => {
    try {
        const { industry, funding } = req.query;
        let query = { isPublic: true };

        if (industry && industry !== 'all') {
            query.category = { $regex: new RegExp(industry, 'i') }; // Map industry to category
        }

        // Note: 'funding' filter is tricky since Idea model doesn't have it. 
        // We'll ignore it for now or assume all are 'Pre-Seed'

        const ideas = await Idea.find(query).sort({ createdAt: -1 });

        // Map Ideas to Startup Marketplace format
        const marketplaceItems = ideas.map(idea => {
            // Logic to determine funding/stats could go here (e.g. based on AI analysis tags?)
            // For now, we use defaults for the MVP
            return {
                _id: idea._id,
                title: idea.title,
                description: idea.description,
                industry: idea.category,
                funding: "Pre-Seed",
                valuation: "Undisclosed",
                goal: "TBD",
                raised: "0%"
            };
        });

        res.status(200).json({
            success: true,
            count: marketplaceItems.length,
            data: marketplaceItems,
        });
    } catch (error) {
        console.error("Get marketplace error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching marketplace",
            error: error.message,
        });
    }
});

// Seed/Create route disabled - Submission should happen via /api/ideas
router.post("/", async (req, res) => {
    res.status(501).json({ message: "Use /api/ideas to submit new projects" });
});

router.post("/seed", async (req, res) => {
    res.status(501).json({ message: "Seeding not supported in this version. Submit ideas manually." });
});

module.exports = router;
