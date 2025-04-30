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
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err || !user) {
      console.error('Google login failed:', err || info);

      // Destroy any temporary session if created
      if (req.session) {
        req.session.destroy((destroyErr) => {
          if (destroyErr) {
            console.error('Error destroying session:', destroyErr);
          }
          // Clear the session cookie after destroying session
          res.clearCookie('connect.sid', { path: '/' }); 
          return res.redirect(`${FRONTEND_URL}/`); // Redirect to the frontend
        });
      } else {
        // Just clear cookie if session doesn't exist
        res.clearCookie('connect.sid', { path: '/' });
        return res.redirect(`${FRONTEND_URL}/`); // Redirect to the frontend  
      }
    } else {
      // Login success: establish session manually
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error('Error during login:', loginErr);
          
          // Destroy the session and clear the cookie if there's an error
          if (req.session) {
            req.session.destroy((destroyErr) => {
              if (destroyErr) {
                console.error('Error destroying session after login failure:', destroyErr);
              }
              res.clearCookie('connect.sid', { path: '/' }); // Clear the session cookie
              return res.redirect(`${FRONTEND_URL}/`); // Redirect to error page
            });
          } else {
            res.clearCookie('connect.sid', { path: '/'}); // Clear cookie if no session exists
            return res.redirect(`${FRONTEND_URL}/`); // Redirect to error page
          }
        } else {
          console.log('Google login successful, redirecting to dashboard');
          return res.redirect(`${FRONTEND_URL}/dashboard`); // Redirect to dashboard after successful login
        }
      });
    }
  })(req, res, next);
});


// Test route
// router.get("/details", (req, res) => {
//   if (req.isAuthenticated()) {
//     return res.status(200).json({
//       success: true,
//       user: {
//         firstName: req.user.firstName,
//         lastName:req.user.lastName
//       }
//     });
//   }
//   return res.status(403).json({ success: false, message: "Unauthorized" });
// });


// Logout
// router.get("/logout", (req, res) => {
//   req.logout((err) => {
//     if (err) {
//       console.error('Logout error:', err);
//       return res.status(400).json({ success: false, message: "Logout failed" });
//     }
//     // Now destroy session too and clear cookie
//     if (req.session) {
//       req.session.destroy((destroyErr) => {
//         if (destroyErr) {
//           console.error('Error destroying session after logout:', destroyErr);
//           return res.status(500).json({ success: false, message: "Session destroy failed" });
//         }
//         // Clear the session cookie after session destroy
//         res.clearCookie('connect.sid', { path: '/' });
//         return res.status(200).json({ success: true, message: "Logged out successfully" });
//       });
//     } else {
//       // Clear cookie if session doesn't exist
//       res.clearCookie('connect.sid', { path: '/' });
//       return res.status(200).json({ success: true, message: "Logged out successfully" });
//     }
//   });
// });


// =================   FACEBOOK OAUTH =======================


router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);

router.get("/facebook/callback", (req, res, next) => {
  passport.authenticate("facebook", async (err, user, info) => {
    if (err || !user) {
      console.error("Facebook login failed:", err || info);
      // 1) Destroy any half-created session
      if (req.session) {
        req.session.destroy(destroyErr => {
          if (destroyErr) {
            console.error("Error destroying session:", destroyErr);
          }
          // 2) Clear the session cookie
          res.clearCookie("connect.sid", { path: "/" });
          return res.redirect(`${FRONTEND_URL}/`);
        });
      } else {
        res.clearCookie("connect.sid", { path: "/" });
        return res.redirect(`${FRONTEND_URL}/`);
      }
    } else {
      // Successful login: establish session
      req.login(user, loginErr => {
        if (loginErr) {
          console.error("Error during login:", loginErr);
          // Same cleanup on req.login error
          if (req.session) {
            req.session.destroy(destroyErr => {
              if (destroyErr) {
                console.error("Error destroying session after login failure:", destroyErr);
              }
                res.clearCookie("connect.sid", { path: "/" });
              return res.redirect(`${FRONTEND_URL}/`);
            });
          } else {
            res.clearCookie("connect.sid", { path: "/" });
            return res.redirect(`${FRONTEND_URL}/`);
          }
        } else {
        // 3) On success, redirect and session cookie remains
        console.log('Facebook login successful, redirecting to dashboard');
        return res.redirect(`${FRONTEND_URL}/dashboard`);
        }
      });
    }
  })(req, res, next);  // Invoke the middleware with req, res, next
});


// =================   APPLE OAUTH =======================


router.get('/apple', passport.authenticate('apple'));


router.post('/apple/callback', (req, res, next) => {
  console.log('Callback received from Apple');
  console.log('Content-Type:', req.headers['content-type']); // Should be application/x-www-form-urlencoded
  console.log('Request Body:', req.body); // Should now contain code, state, etc.
    //  Handle user cancellation
    if (req.query.error === 'access_denied') {
      console.log('User cancelled Apple login');
      return res.redirect(`${FRONTEND_URL}/`);  // or any page you want
    }
  passport.authenticate('apple', { failureRedirect: `${FRONTEND_URL}/` }, (err, user, info) => {
    if (err || !user) {
      console.error('Apple login failed:', err || info); // Log any errors
      // 1) Destroy the half-baked session
      if (req.session) {
        req.session.destroy(destroyErr => {
          if (destroyErr) console.error('Error destroying session:', destroyErr);
          // 2) Clear the session cookie
          res.clearCookie('connect.sid', { path: '/' });
          return res.redirect(`${FRONTEND_URL}/`);
        });
      } else {
        res.clearCookie('connect.sid', { path: '/' });
        return res.redirect(`${FRONTEND_URL}/`);
      }
    }
    else {
      console.log('');
      console.log('Session ID:', req.sessionID);
      console.log('Session Data (pre-login):', req.session);
      console.log('User about to be logged in:', user);
      // Successful login: establish session
      req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Error during login:', loginErr);
        if (req.session) {
          req.session.destroy(destroyErr => {
            if (destroyErr) console.error('Error destroying session after login failure:', destroyErr);
            res.clearCookie('connect.sid', { path: '/' });
            return res.redirect(`${FRONTEND_URL}/`);
          });
        } else {
          res.clearCookie('connect.sid', { path: '/' });
          return res.redirect(`${FRONTEND_URL}/`);
        }
      }
      
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Error saving session:', saveErr);
        } else {
          console.log('Session saved to MongoDB');
        }
      console.log('Apple login successful,redirecting to dashboard:', user);
      return res.redirect(`${FRONTEND_URL}/dashboard`);
    });
  });
  }
}
  )(req, res, next);
});

module.exports = router;
