const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGeminiAPI() {
    console.log("🔍 Testing Gemini API Configuration\n");

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in environment");
        return;
    }

    console.log("✓ API Key found:", apiKey.substring(0, 20) + "...");

    const genAI = new GoogleGenerativeAI(apiKey);

    // Test 1: Try to list models (this method may not be available in all SDK versions)
    console.log("\n📋 Attempting to list available models...");
    try {
        const models = await genAI.listModels();
        console.log("✓ Available models:");
        models.forEach(model => {
            console.log(`  - ${model.name}`);
        });
    } catch (error) {
        console.log("⚠️  listModels() not available in this SDK version:", error.message);
    }

    // Test 2: Try different model names
    const modelsToTest = [
        "gemini-pro",
        "models/gemini-pro",
        "gemini-1.0-pro",
        "models/gemini-1.0-pro",
        "gemini-1.5-flash",
        "models/gemini-1.5-flash",
        "gemini-1.5-pro",
        "models/gemini-1.5-pro"
    ];

    console.log("\n🧪 Testing different model names...\n");

    for (const modelName of modelsToTest) {
        try {
            console.log(`Testing: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'test' if you can hear me");
            const response = await result.response;
            const text = response.text();
            console.log(`✅ ${modelName} WORKS! Response: ${text.substring(0, 50)}...\n`);
            break; // Stop after first successful model
        } catch (error) {
            console.log(`❌ ${modelName} failed: ${error.message}\n`);
        }
    }
}

testGeminiAPI().catch(console.error);
