const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user'); 

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'emails', 'name'], // Required to get email and name
  enableProof: true
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log("Facebook Profile:", profile);

    let user = await User.findOne({ facebookId: profile.id });

    const email = profile.emails?.[0]?.value;

    if (!user && email) {
      // Try finding user by email

        user = await User.findOne({ email });

        if (user) {
          user.facebookId = profile.id;
          user.isVerifiedByEmail = true;
          user.verifyCode = null;
          user.verifyCodeExpire = null;
          await user.save();
        }
      
      // Create new user if not found
      if (!user) {
        const isVerified = !!email;// ✅ only true if email is present

        const newUserData = {
            facebookId: profile.id,
            email: email || null,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            isVerifiedByEmail: isVerified,
        };

        if (isVerified) {
          newUserData.verifyCode = null;
          newUserData.verifyCodeExpire = null;
        }
        user = await User.create(newUserData);
      }
    } 
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));
