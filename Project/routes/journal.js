// Requiring Modules
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authentication");
const {uploadJournal, getAllJournals} = require('../controllers/journal');

// ROUTES
router.route("/").get(authMiddleware,getAllJournals).post(authMiddleware,uploadJournal);

// Exporting router

module.exports = router;