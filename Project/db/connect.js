// Requiring mongoose
const mongoose = require("mongoose");

// Function to connect to database
const connectDB = (url)=>{
    return mongoose.connect(url);
}

// Exporting connectDB function
module.exports = connectDB;