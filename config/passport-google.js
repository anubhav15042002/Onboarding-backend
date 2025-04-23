const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user'); 

passport.serializeUser((user, done) => {
  done(null, user._id);
});
    
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: process.env.GOOGLE_CALLBACK_URL
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     let user = await User.findOne({ googleId: profile.id });
//     console.log("Profile:" , profile);
    
//     if (!user) {
//       user = await User.create({
//         googleId: profile.id,
//         email: profile.emails[0].value,
//         firstName: profile.name.givenName,
//         lastName: profile.name.familyName,
//         isVerifiedByEmail: true,
//       });
//     }
//     return done(null, user);
//   } catch (error) {
//     console.log("error:", error);
//     return done(error, null);
//   }
// }));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // 1. Try finding by googleId first

    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      // 2. Try finding user by email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // 3. If user exists by email, link the Google ID to their profile
        user.googleId = profile.id;
        user.isVerifiedByEmail = true;
        user.verifyCode = null;
        user.verifyCodeExpire = null;
        await user.save();
      } else {
        // 4. If not found at all, create new user
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          isVerifiedByEmail: true,
        });
      }
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

