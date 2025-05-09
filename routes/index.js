const express = require("express");
const passport = require('passport');

const router = express.Router();

const userRoutes = require("./userRoutes");

const oauthRoutes = require("./oauthRoutes");

const { logout, getUserDetails } = require("../controllers/authController");

router.use("/auth", userRoutes);
router.use("/oauth", oauthRoutes);

router.post("/logout",  logout);
router.post("/getuserdetails", getUserDetails)

module.exports = router;
