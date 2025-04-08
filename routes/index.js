const express = require("express");

const router = express.Router();

const userRoutes = require("./userRoutes");

router.use("/auth", userRoutes);

module.exports = router;