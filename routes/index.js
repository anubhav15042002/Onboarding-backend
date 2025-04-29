const express = require("express");

const router = express.Router();

const userRoutes = require("./userRoutes");

const oauthRoutes = require("./oauthRoutes");

const { logout } = require("../controllers/authController");

router.use("/auth", userRoutes);
router.use("/oauth", oauthRoutes);

router.post("/logout", logout);

module.exports = router;
