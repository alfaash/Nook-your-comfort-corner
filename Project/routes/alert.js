// Requiring Modules
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authentication");
const {postAlert,getAlert, sendAlertMessage} = require("../controllers/alert");

// Routes
router.route("/").get(authMiddleware,getAlert).post(authMiddleware,postAlert);
router.route("/sendMessage").post(authMiddleware, sendAlertMessage);

// Exporting router to app.js
module.exports = router;