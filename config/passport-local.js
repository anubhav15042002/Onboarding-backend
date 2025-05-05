const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const { comparePasswords } = require("../utils/authHelper.js");

// Utility functions to validate email and phone number
const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  
  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\+?[0-9]{3,15}$/; // Adjust for your phone number format
    return phoneRegex.test(phoneNumber);
  };


passport.use(
  new LocalStrategy(
    { usernameField: "loginID", passwordField: "password" },
    async (loginID, password, done) => {
      try {
        // Check if the loginID is an email or phone number
        let query;
        if (validateEmail(loginID)) {
          query = { email: loginID };
        } else if (validatePhoneNumber(loginID)) {
          query = { phoneNumber: loginID };
        } else {
          // invalid format → fail authentication
          return done(null, false, {
            message: "Please provide valid email or phone number.",
          });
        }

        const user = await User.findOne(query);

        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }

        const result = await comparePasswords(password, user.password);

        if (!result) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
