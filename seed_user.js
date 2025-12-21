require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/user.model");

const DUMMY_ID = "60d0fe4f5311236168a109ca";

async function seedUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const existing = await User.findById(DUMMY_ID);
        if (!existing) {
            await User.create({
                _id: DUMMY_ID,
                name: "Dev User",
                email: "dev@test.com",
                password: "hashedPassword123", // Doesn't matter for bypass
                isVerified: true
            });
            console.log("Dummy user created!");
        } else {
            console.log("Dummy user exists.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

seedUser();
