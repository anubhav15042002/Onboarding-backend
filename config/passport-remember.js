// config/passport-remember.js
const RememberMeStrategy = require('passport-remember-me').Strategy;
const RememberMeToken = require('../models/rememberToken');
const User = require("../models/user.js");
const passport = require('passport');
// const { generateRandomToken } = require('../utils/functions.js');

passport.use(new RememberMeStrategy(
  // {
  //       key: 'remember_me',                  // name of the cookie
  //      cookie: {
  //          path: '/',                         // cookie path
  //          httpOnly: true,                    // not accessible to JS
  //         sameSite: 'lax',                   // or 'none' + secure in prod
  //          secure: false,                     // set true under HTTPS :contentReference[oaicite:2]{index=2}
  //          maxAge: 7 * 24 * 60 * 60 * 1000   // 30 days :contentReference[oaicite:3]{index=3}
  //        }
  //     },
  // verify callback: token → user
  async function (token, done) {
    try {
        // 1. Look up token in DB
      const record = await RememberMeToken.consume(token);
      // console.log("Record:", record);
      if (!record || record.expiresAt < Date.now()) return done(null, false);
      // Check this 
    //    2. Remove it (single‑use)
    // await TokenModel.deleteOne({ token });
      const user = await User.findById(record.userId);
      return done(null, user); 
    } catch (err) {
      return done(err);
    }
  },
  // issue callback: user → new token
  async function (user, done) {
    try {
      console.log("User at issue:", user);
      const newToken = await RememberMeToken.issue(user._id, 7*24*60*60*1000)
    //   await RememberMeToken.save({ token: newToken, userId: user.id });
      return done(null, newToken);
    } catch (err) {
      return done(err);
    }
  }
));


