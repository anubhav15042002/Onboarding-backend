require("dotenv").config();
const express = require("express");
const cookieParser = require('cookie-parser');
const cors = require("cors");
const connectDB = require("./config/db");
const router = require("./routes");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const {cleanBrokenSession} = require('./utils/cleanBrokenSession');
require('./config/passport');
const app = express();

const port = process.env.PORT;
connectDB();

app.use(cookieParser());  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.LOCAL_DB,
    collectionName: 'sessions',
  }),
  cookie: {
    httpOnly: true,
    secure: false, // set to true in production (HTTPS) (imp.)
    sameSite: "lax", // check between lax and none in production 
    maxAge: 5 * 60 * 60 * 1000,
  },
}));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));   // re‑login via remember‑me token if no session 

// Add logging to debug sessions
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session Data:', req.session);
  next();
});


app.use('/onboarding' , router);
app.use(cleanBrokenSession);

app.use( "*", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "Wrong URL."
  });
});

app.listen(port, () => {
  console.log(`App is listening`);
});
