// Requiring Modules
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authentication");
const {postAlert,getAlert} = require("../controllers/alert");

// Routes
router.route("/").get(authMiddleware,getAlert).post(authMiddleware,postAlert);

// Exporting router to app.js
module.exports = router;