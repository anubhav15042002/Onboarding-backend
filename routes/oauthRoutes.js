const express = require("express");
const passport = require("passport");
const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL


// =================   GOOGLE OAUTH =======================


// Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/register` }),
  (req, res) => {
    // Successful login
    // console.log("Session just before redirect:", req.session);
   // console.log("Redirecting to:", `${FRONTEND_URL}/dashboard`);
    res.redirect(`${FRONTEND_URL}/dashboard`); // Or send a response with session info
  }
);

// Test route
router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({
      success: true,
      user: {
        firstName: req.user.firstName,
        email: req.user.email
      }
    });
  }
  return res.status(401).json({ success: false, message: "Not logged in" });
});

// Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err)
      return res.status(500).json({ success: false, message: "Logout failed" });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });
});


// =================   FACEBOOK OAUTH =======================


router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: `${FRONTEND_URL}/register` }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/dashboard`);
    // res.status(200).json({
    //   success: true,
    //   message: "Facebook login successful",
    //     user: {
    //       firstName: req.user.firstName,
    //       email: req.user.email
    //     }
    // })
  }
);


// =================   APPLE OAUTH =======================


router.get('/apple', passport.authenticate('apple'));

// router.post('/apple/callback',
//   passport.authenticate('apple', { failureRedirect: `${FRONTEND_URL}/register` }),
//   (req, res) => {
//     res.redirect(`${FRONTEND_URL}/dashboard`);
//     //     res.status(200).json({
//     //   success: true,
//     //   message: "Apple login successful",
//     //     user: {
//     //       firstName: req.user.firstName,
//     //       email: req.user.email
//     //     }
//     // })
//   }
// );


// router.post('/apple/callback', (req, res, next) => {
//   passport.authenticate('apple', { failureRedirect: `${FRONTEND_URL}/register` }, (err, user, info) => {
//     if (err || !user) {
//       console.error('Authentication failed:', err, info);
//       return res.redirect(`${FRONTEND_URL}/register`);
//     }
//     req.logIn(user, (err) => {
//       if (err) {
//         console.error('Login failed:', err);
//         return res.redirect(`${FRONTEND_URL}/register`);
//       }
//       console.log('Authenticated user:', user);
//       return res.redirect(`${FRONTEND_URL}/dashboard`);
//     });
//   })(req, res, next);
// });

router.post('/apple/callback', (req, res, next) => {
  console.log('Callback received from Apple');
  console.log('Content-Type:', req.headers['content-type']); // Should be application/x-www-form-urlencoded
  console.log('Request Body:', req.body); // Should now contain code, state, etc.
  passport.authenticate('apple', { failureRedirect: 'https://google.com' }, (err, user, info) => {
    if (err || !user) {
      console.error('Authentication failed:', err, info); // Log any errors
      return res.redirect(`${FRONTEND_URL}/register`);
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('Login failed:', loginErr);
        return res.redirect(`${FRONTEND_URL}/register`);
      }
      console.log('User authenticated:', user);
      return res.redirect(`${FRONTEND_URL}/dashboard`);
    });
  })(req, res, next);
});

module.exports = router;
