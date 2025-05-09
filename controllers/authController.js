// Logout function

const RememberMeToken = require("../models/rememberToken");

const logout = (req, res, next) => {
  try {
 if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

    // 1️⃣ Capture the remember_me token before session destroyed
    const rememberToken = req.cookies.remember_me;

     // Passport logout (safe even when not authenticated)
        req.logout(err => {
          if (err) console.error("Logout error:", err);
    
          // Destroy server-side session if present
          if (req.session) {
            req.session.destroy(destroyErr => {
              if (destroyErr) console.error("Session destroy error:", destroyErr);
              // Clear both session and remember_me cookies
              res.clearCookie("connect.sid", { path: "/" });
              res.clearCookie("remember_me", { path: "/" });
              // Delete the remember-me token record
              if (rememberToken) {
                RememberMeToken.deleteOne({ token: rememberToken })
                  .then(() => console.log("Remember-me token destroyed"))
                  .catch(dbErr => console.error("Error deleting remember-me token:", dbErr));
              }
              return res.status(200).json({ success: true, message: "Logged out successfully" });
            });
          } else {
            // No session: still clear cookies & delete token
            res.clearCookie("connect.sid", { path: "/" });
            res.clearCookie("remember_me", { path: "/" });
            if (rememberToken) {
              RememberMeToken.deleteOne({ token: rememberToken })
                .then(() => console.log("Remember-me token destroyed"))
                .catch(dbErr => console.error("Error deleting remember-me token:", dbErr));
            }
            return res.status(200).json({ success: true, message: "Logged out successfully" });
          }
        });
      } catch (error) {
        console.error("Unexpected logout error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
      }
    };







//     // 2️⃣ Passport logout → clears req.user & session.passport
//     req.logout((err) => {
//       if (err) {
//         console.error("Logout error:", err);
//         return res
//           .status(500)
//           .json({ success: false, message: "Logout failed" });
//       }

//       // 3️⃣ Destroy server‑side session
//       req.session.destroy((destroyErr) => {
//         if (destroyErr) {
//           console.error("Session destroy error:", destroyErr);
//           // still proceed to clear cookies
//         }

//         // 4️⃣ Clear session cookie
//         res.clearCookie("connect.sid", { path: "/" }); // express‑session cookie

//         // 5️⃣ Clear remember_me cookie
//         res.clearCookie("remember_me", { path: "/" }); // passport‑remember‑me cookie

//         // 6️⃣ Delete token document from DB (if present)
//         if (rememberToken) {
//           RememberMeToken.deleteOne({ token: rememberToken })
//             .then(() => {
//               console.log("Remember-me token destroyed");
//             })
//             .catch((dbErr) => {
//               console.error("Error deleting remember-me token:", dbErr);
//             });
//         }

//         // 7️⃣ Final response
//         return res
//           .status(200)
//           .json({ success: true, message: "Logged out successfully" });
//       });
//     });
//   } catch (error) {
//     console.error("Unexpected logout error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal server error" });
//   }
// };

//     if (req.isAuthenticated()) {
//       // 1. Passport logout (clears req.user & session.passport)
//       req.logout((err) => {
//         if (err) {
//           console.error("Logout error:", err);
//           return res
//             .status(400)
//             .json({ success: false, message: "Logout failed" });
//         }

//         // 2. Destroy server-side session
//         if (req.session) {
//           req.session.destroy((destroyErr) => {
//             if (destroyErr) {
//               console.error(
//                 "Error destroying session after logout:",
//                 destroyErr
//               );
//               return res
//                 .status(400)
//                 .json({ success: false, message: "Session destroy failed" });
//             }

//             // 3. Clear the session cookie on client
//             res.clearCookie("connect.sid", { path: "/" });
//             return res
//               .status(200)
//               .json({ success: true, message: "Logged out successfully" });
//           });
//         } else {
//           // No session to destroy—still clear cookie
//           res.clearCookie("connect.sid", { path: "/" });
//           return res
//             .status(200)
//             .json({ success: true, message: "Logged out successfully" });
//         }
//       });
//     } else {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }
//   } catch (error) {
//     console.log("Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// Get User Details function

const getUserDetails = async (req, res) => {
  try {
     if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }
    else{
      return res.status(200).json({
        success: true,
        user: {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          gender: req.user.gender,
        },
      });
    } 
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { logout, getUserDetails };
