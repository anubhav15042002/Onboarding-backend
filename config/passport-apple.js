const AppleStrategy = require("passport-apple");
const passport = require("passport");
const User = require("../models/user");
const jwt = require("jsonwebtoken");


//Helper to detect Apple Private Relay addresses
function isPrivateRelay(email) {
  return typeof email === 'string' && email.endsWith('@privaterelay.appleid.com');
}

passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKeyString: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      callbackURL: process.env.APPLE_CALLBACK_URL,
      scope: ["name", "email"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, idToken, profile, done) => {
      try {

        console.log("Apple Profile:", profile);
        console.log("Apple idToken:", idToken);

        // 1) Decode the ID token once
        const decoded = idToken ? jwt.decode(idToken) : null;
        console.log("ID Token Details:", decoded);

        if (!decoded || !decoded.sub) {
          return done ({ name: "AppleAuthError", message: "sub missing in idToken" }, null );
        }

        const sub = decoded.sub;
        let email = decoded.email || null;

        // 2) If first-time login, override with req.body.user payload
        let firstName = "";
        let lastName = "";
        if (req.body.user) {
          try {
          console.log("User Details:", req.body.user);
          const userData = JSON.parse(req.body.user);
          firstName = userData.name?.firstName || "";
          lastName = userData.name?.lastName || "";
          email = userData.email || email;
        } catch (error){
          console.error('Failed to parse req.body.user:', error)
        }
      }

        // 3) Determine where to store the email
        let appleEmail = null;
        if (email && isPrivateRelay(email)) {
          appleEmail = email; // store relay address separately
          email = null; // do not store in normal email field
        }

        // 4) Find existing user by appleId or by real email or by jumbled(relay) email
        let user = await User.findOne({ appleId: sub });
        if (!user && email) {
          user = await User.findOne({ email });
          if (user) {
            user.appleId = sub;
            user.isVerifiedByEmail = true;
            user.verifyCode = null;
            user.verifyCodeExpire = null;
          }
        } 

        if (!user && appleEmail) {
          user = await User.findOne({ appleEmail });
          if (user) {
            user.appleId = sub;
          }
        } 

        // 5) Create new user if none found
    if (!user) {
      user = new User({
        appleId: sub,  
        firstName,
        lastName
      });

      if (email) {
        user.email = email;
        user.isVerifiedByEmail = true;
        user.verifyCode = null;
        user.verifyCodeExpire = null;
      }

      if (appleEmail) {
        user.appleEmail = appleEmail;
        user.isVerifiedByEmail = false;
      }
    } 
      // 6) Update existing user fields
      else {
        // if real email arrived now, verify and clear codes
      if (email) {
        user.email = email;
        user.isVerifiedByEmail = true;
        user.verifyCode = null;
        user.verifyCodeExpire = null;
      }
        // if relay address, only store in appleEmail
      if (appleEmail) {
        user.appleEmail = appleEmail;
        if (!user.isVerifiedByEmail) {
          user.isVerifiedByEmail = false;
        }
      }
    }

    // Check this 2.
    // await user.validate().catch(err => console.error('Validation Error:', err));

    await user.save();
    return done(null, user);
  } catch (error) {
    console.error('Error in Apple strategy:', error);
    return done(error, null);
  }
}));

