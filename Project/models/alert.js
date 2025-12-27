// Requiring Libraries
const mongoose = require("mongoose");

// making schema
const alertSchema  = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : [true, 'User Id is required']
    },
    timestamp : {
        type : Date,
        default : Date.now
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

module.exports = mongoose.model("alertSchema", alertSchema);