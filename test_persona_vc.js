require('dotenv').config();
const geminiService = require('./src/services/gemini.service');

async function testVC() {
    console.log("Testing VC Persona...");
    try {
        const response = await geminiService.generatePersonaResponse(
            "Title: Fitness Coach\nDescription: AI powered fitness.",
            "VC"
        );
        console.log("Success! Response:", response);
    } catch (error) {
        console.error("Failed:", error.message);
    }
}

testVC();
