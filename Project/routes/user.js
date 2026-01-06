// Requiring modules
const express = require("express");
const router = express.Router(); // creating router to route incoming requests
const {userLogin, userRegister, userContact, getUserData} = require("../controllers/user");
const authMiddleware = require("../middleware/authentication");

router.route('/login').post(userLogin);
router.route('/register').post(userRegister);
router.route('/contacts').post(authMiddleware,userContact);
router.route('/').get(authMiddleware, getUserData);

// Exporting router to app.js
module.exports = router;

