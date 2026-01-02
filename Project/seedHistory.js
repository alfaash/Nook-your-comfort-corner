const mongoose = require("mongoose");
const SensorSchema = require("./models/sensorData");
const User = require("./models/user"); 
require('dotenv').config();

// 1. Connection Config
const MONGO = process.env.MONGO_URI; 

const seedData = async () => {
    try {
        await mongoose.connect(MONGO);
        console.log("✅ Connected to MongoDB");

        // 2. Get a Real User ID (so the data belongs to someone)
        const userId = "6945b083b3c05f380c5a9dc9";
        const user = await User.findById(userId)
        if (!user) {
            console.error("❌ No users found! Create a user first.");
            process.exit(1);
        }
        console.log(`👤 Seeding data for user: ${user.name} (${user._id})`);

        // 3. Generate 30 "Normal" Data Points (Walking/Sitting)
        // Normal magnitude is ~9.8 (gravity) with small fluctuations
        const dummyData = [];

        for (let i = 0; i < 30; i++) {
            dummyData.push({
                userId: userId,
                sensorData: {
                    accelerometer: {
                        // Simulating phone in pocket (mostly Z axis gravity + noise)
                        x: (Math.random() * 2) - 1,   // -1 to 1
                        y: (Math.random() * 2) - 1,   // -1 to 1
                        z: 9.8 + (Math.random() * 2) - 1 // ~9.8 to 10.8
                    },
                    gyroscope: {
                        alpha: Math.random(),
                        beta: Math.random(),
                        gamma: Math.random()
                    }
                }
            });
        }

        // 4. Insert into Database
        await SensorSchema.insertMany(dummyData.reverse()); // Reverse so oldest is first
        console.log("✅ Successfully added 30 normal history points!");
        process.exit();

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

seedData();