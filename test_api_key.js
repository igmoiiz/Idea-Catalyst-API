const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

console.log("🔍 Testing Gemini API Key Validity\n");
console.log("API Key:", apiKey ? `${apiKey.substring(0, 20)}...` : "NOT FOUND");

if (!apiKey) {
    console.error("❌ No API key found in .env file");
    process.exit(1);
}

// Test the API key by calling the models endpoint
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("\n📡 Calling Google AI API to list models...\n");

https.get(url, (res) => {
    let data = '';

    console.log(`Status Code: ${res.statusCode}`);

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);

            if (res.statusCode === 200 && response.models) {
                console.log("\n✅ API Key is VALID!\n");
                console.log(`Found ${response.models.length} available models:\n`);
                response.models.forEach(model => {
                    console.log(`  ✓ ${model.name}`);
                    if (model.supportedGenerationMethods) {
                        console.log(`    Methods: ${model.supportedGenerationMethods.join(', ')}`);
                    }
                });

                const generateContentModels = response.models.filter(m =>
                    m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
                );

                console.log(`\n📝 Models supporting generateContent (${generateContentModels.length}):`);
                generateContentModels.forEach(model => {
                    console.log(`  ✓ ${model.name}`);
                });

                if (generateContentModels.length > 0) {
                    console.log(`\n💡 Use this model name in your code: "${generateContentModels[0].name}"`);
                }
            } else {
                console.log("\n❌ API Key Invalid or Error:\n");
                console.log(JSON.stringify(response, null, 2));
            }
        } catch (e) {
            console.log("\n❌ Failed to parse response:");
            console.log(data);
        }
    });
}).on('error', (error) => {
    console.error("\n❌ Network Error:", error.message);
});
