const AppleStrategy = require('passport-apple');
const passport = require('passport');
const User = require('../models/user');

passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  keyID: process.env.APPLE_KEY_ID,
  privateKeyString: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  callbackURL: process.env.APPLE_CALLBACK_URL,
  scope: ['name', 'email'],
  passReqToCallback: true 
}, async (req,accessToken, refreshToken, idToken, profile, done) => {
  try {
    // console.log("Apple Profile:", profile);
    // console.log("Apple idToken:" , idToken);

    // const email = idToken.email;
    // const sub = idToken.sub;

    // let user = await User.findOne({ appleId: sub });

    // if (!user && email) {
    //   user = await User.findOne({ email });
    //   if (user) {
    //     user.appleId = sub;
    //     user.isVerifiedByEmail = true;
    //     user.verifyCode = null;
    //     user.verifyCodeExpire = null;
    //     await user.save();
    //   }
    // }

    // if (!user) {
    //   user = await User.create({
    //     appleId: sub,
    //     email: email || null,
    //     firstName: profile?.name?.firstName || '',
    //     lastName: profile?.name?.lastName || '',
    //     isVerifiedByEmail: !!email,
    //   });
    // }

     // 1) First-login user info in req.body.user
     let firstName, lastName, email;
     if (req.body.user) {
       const userData = JSON.parse(req.body.user);
       firstName = userData.name.firstName;
       lastName  = userData.name.lastName;
       email     = userData.email;    // guaranteed verified
     } else {
       // 2) Subsequent logins: decode JWT
       const decoded = require('jsonwebtoken').decode(idToken);
       email     = decoded.email;
       firstName = '';                // no longer sent by Apple
       lastName  = '';
     }
 
     const sub = idToken.sub || decoded.sub;
 
     // 3) Find or create user in your DB
     let user = await User.findOne({ appleId: sub });
     if (!user && email) {
       user = await User.findOne({ email });
       if (user) {
         user.appleId = sub;
         user.isVerifiedByEmail = true;
         await user.save();
       }
     }
     if (!user) {
       user = await User.create({
         appleId: sub,
         email,
         firstName,
         lastName,
         isVerifiedByEmail: true
       });
     }
 
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));
