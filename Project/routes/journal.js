// Requiring Modules
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authentication");
const {uploadJournal, getAllJournals, deleteJournal} = require('../controllers/journal');

// ROUTES
router.route("/").get(authMiddleware,getAllJournals).post(authMiddleware,uploadJournal);
router.route("/:id").delete(authMiddleware,deleteJournal);

// Exporting router

module.exports = router;