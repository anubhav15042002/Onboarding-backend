const express = require("express");

const router = express.Router();

const userRoutes = require("./userRoutes");

const oauthRoutes = require('./oauthRoutes')

router.use("/auth", userRoutes);
router.use("/oauth" , oauthRoutes );

module.exports = router;