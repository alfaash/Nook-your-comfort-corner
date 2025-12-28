// Requiring Modules
const mongoose = require("mongoose");

// Creating Schema
const journalSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : [true, "Please enter a user Id"]
    },
    audioUrl : {
        type : String,
        required : [true, "Audio URL is required"]
    },
    // We are saving public Id so that we can delete the audio from cloudinary if user wants
    publicId : {
        type : String,
        required: [true, "Public Id is required"]
    },
    transcript : {
        type : String
    },
    sentimentScore : {
        type : Number
    },
    aiResponse : {
        type : String
    },
    duration : {
        type : Number,
        required : [true, "Duration is Required"]
    },
    timestamp : {
        type : Date,
        default : Date.now
    }
});

// Exporting Model
module.exports = mongoose.model("journalSchema",journalSchema);
