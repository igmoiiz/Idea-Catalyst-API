const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs").promises;
const path = require("path");

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.error("⚠️  GEMINI_API_KEY is not set in environment variables!");
      console.error("   AI analysis will fall back to simulated responses.");
    } else {
      console.log("✓ Gemini API key detected");
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Using models/gemini-2.5-flash (verified available with your API key)
    // This was confirmed by running test_api_key.js
    const modelName = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
    this.model = this.genAI.getGenerativeModel({ model: modelName });
    console.log(`✓ Using Gemini model: ${modelName}`);

    this.prompts = {};
    this.promptsLoaded = false;
  }

  async loadPrompts() {
    if (this.promptsLoaded) return;

    const promptsDir = path.join(__dirname, "../system-prompts");
    try {
      const files = await fs.readdir(promptsDir);

      for (const file of files) {
        if (file.endsWith(".txt")) {
          const content = await fs.readFile(path.join(promptsDir, file), "utf-8");
          const key = file.replace(".txt", "");
          this.prompts[key] = content;
        }
      }
      this.promptsLoaded = true;
      console.log("System prompts loaded successfully");
    } catch (error) {
      console.error("Error loading system prompts:", error);
      throw error;
    }
  }

  async generatePersonaResponse(ideaContent, personaType) {
    if (!this.promptsLoaded) {
      await this.loadPrompts();
    }

    // Map personaType to file key
    const personaMapping = {
      "Market Analyst": "Analyst Persona",
      "Project Manager": "Project Manager Persona",
      "Investor": "Investor Simulation Module",
      "Team Builder": "Team Builder System",
      "Pitch Deck": "AI Pitch Deck Generator",
      // Unique mappings for Personas.tsx - each has distinct prompt file
      "VC": "VC Persona",
      "Customer": "Customer Persona",
      "Skeptic": "Skeptic Persona",
    };

    const promptKey = personaMapping[personaType] || personaType;
    const systemPrompt = this.prompts[promptKey];

    if (!systemPrompt) {
      console.warn(`System prompt for '${personaType}' (key: ${promptKey}) not found. Using fallback.`);
      return {
        content: this.getFallbackResponse(personaType, ideaContent),
        rating: Math.floor(Math.random() * 30) + 60
      };
    }

    // Enhanced prompt to ensure structured output with rating
    const fullPrompt = `${systemPrompt}

User Idea:
${ideaContent}

IMPORTANT INSTRUCTIONS:
1. Provide your detailed analysis/response based on the above idea
2. At the END of your response, include a rating on a new line in this EXACT format: "Rating: X/100" where X is a number between 0-100
3. Be specific and reference details from the actual idea provided

Please provide your analysis now:`;

    try {
      console.log(`🤖 Generating ${personaType} analysis via Gemini API...`);
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      console.log(`✓ Gemini API response received for ${personaType}`);

      const rating = this.extractRating(text);
      if (!rating) {
        console.warn(`⚠️  Could not extract rating from Gemini response for ${personaType}, using default`);
      }

      return {
        content: text,
        rating: rating || 75 // Default to 75 if no rating found
      };
    } catch (error) {
      console.error("❌ Gemini generation error:", error.message);
      console.error("   Error details:", error);
      console.warn("⚠️  Falling back to simulated response due to API error.");

      return {
        content: this.getFallbackResponse(personaType, ideaContent),
        rating: Math.floor(Math.random() * 30) + 60,
        isFallback: true // Flag to indicate this is a fallback response
      };
    }
  }

  getFallbackResponse(type, idea) {
    const templates = {
      "Market Analyst": "Based on current market trends, this idea addresses a significant gap. However, saturation in this sector is a risk. I recommend focusing on your unique value proposition to stand out. \n\n⚠️ FALLBACK MODE: Live AI analysis is currently unavailable. This is a generic simulation. Please check your Gemini API configuration.",
      "Investor": "The financial viability looks promising, though customer acquisition costs need verification. The valuation seems reasonable for a pre-seed stage. I would be interested in seeing a more detailed pitch deck. \n\n⚠️ FALLBACK MODE: Live AI analysis is currently unavailable. This is a generic simulation. Please check your Gemini API configuration.",
      "Project Manager": "Implementation roadmap seems feasible. I suggest an agile approach to MVP. Key milestones should include user validation within the first 3 months. \n\n⚠️ FALLBACK MODE: Live AI analysis is currently unavailable. This is a generic simulation. Please check your Gemini API configuration.",
      "Team Builder": "You'll need a strong technical co-founder and a marketing lead. Building a diverse team will be crucial for execution. \n\n⚠️ FALLBACK MODE: Live AI analysis is currently unavailable. This is a generic simulation. Please check your Gemini API configuration.",
      "VC": "As a Venture Capitalist, I look for scalability and a strong moat. This idea has potential, but I need to see a clearer path to $100M ARR. Focus on your unit economics and go-to-market strategy. \n\n⚠️ FALLBACK MODE: Live AI analysis is currently unavailable. This is a generic simulation. Please check your Gemini API configuration.",
      "Customer": "I would definitely consider using this if the price point is accessible. It seems to solve a real problem for me. Make sure the user experience is intuitive. \n\n⚠️ FALLBACK MODE: Live AI analysis is currently unavailable. This is a generic simulation. Please check your Gemini API configuration.",
      "Skeptic": "I'm not convinced. The market is crowded and existing solutions are 'good enough'. What makes you 10x better? You need a stronger differentiator to survive. \n\n⚠️ FALLBACK MODE: Live AI analysis is currently unavailable. This is a generic simulation. Please check your Gemini API configuration.",
    };
    return templates[type] || "⚠️ FALLBACK MODE: Live AI analysis unavailable. This is a generic simulation.";
  }

  extractRating(text) {
    // Try multiple rating formats
    // Format 1: "Rating: X/100"
    let match = text.match(/Rating:\s*(\d+)\s*\/\s*100/i);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }

    // Format 2: "Rating: X/10" (convert to /100)
    match = text.match(/Rating:\s*(\d+)\s*\/\s*10/i);
    if (match && match[1]) {
      return parseInt(match[1], 10) * 10;
    }

    // Format 3: "Score: X/100"
    match = text.match(/Score:\s*(\d+)\s*\/\s*100/i);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }

    // Format 4: Just a number at the end like "85/100"
    match = text.match(/(\d+)\s*\/\s*100/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }

    return null;
  }
}

module.exports = new GeminiService();
