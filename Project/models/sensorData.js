// Requiring libraries
const mongoose = require("mongoose");

// Creating Sensor schema
const sensorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    sensorData: {
        accelerometer: {
            x: { type: Number, required: true },
            y: { type: Number, required: true },
            z: { type: Number, required: true }
        },
        gyroscope: {
            alpha: { type: Number, required: true },
            beta:  { type: Number, required: true },
            gamma: { type: Number, required: true }
        }
    }
});

module.exports = mongoose.model("sensorDataSchema",sensorSchema);