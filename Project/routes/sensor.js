// Requiring libraries
const express = require("express");
const router = express.Router(); //creating router to route incoming requests
const {getSensorData, storeSensorData} = require("../controllers/sensor"); 
const authMiddleware = require("../middleware/authentication");

// Routes
router.route("/").get(authMiddleware,getSensorData).post(authMiddleware,storeSensorData);

// Exporting router 
module.exports = router;