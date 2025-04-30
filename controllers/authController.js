const logout = (req, res) => {
    
  try {
    // 1. Passport logout (clears req.user & session.passport)
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res
          .status(400)
          .json({ success: false, message: "Logout failed" });
      }

      // 2. Destroy server-side session
      if (req.session) {
        req.session.destroy((destroyErr) => {
          if (destroyErr) {
            console.error("Error destroying session after logout:", destroyErr);
            return res
              .status(400)
              .json({ success: false, message: "Session destroy failed" });
          }

          // 3. Clear the session cookie on client
          res.clearCookie("connect.sid", { path: "/" });
          return res
            .status(200)
            .json({ success: true, message: "Logged out successfully" });
        });
      } else {
        // No session to destroy—still clear cookie
        res.clearCookie("connect.sid", { path: "/" });
        return res
          .status(200)
          .json({ success: true, message: "Logged out successfully" });
      }
    });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUserDetails = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    const { firstName, lastName, gender } = req.user;

    return res.status(200).json({
      success: true,
      data: {
        user: {
          firstName: firstName,
          lastName: lastName,
          gender: gender,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Middleware
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    return res.status(401).json({ success: false, message: "Unauthorized" });
  };

module.exports = { logout, getUserDetails };
