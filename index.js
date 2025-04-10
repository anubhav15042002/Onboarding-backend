require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const router = require("./routes");
const app = express();

const port = process.env.PORT;
connectDB();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use('/onboarding' , router);

app.use("*/*", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "Wrong URL."
  });
});

app.listen(port, () => {
  console.log(`App is listening`);
});
