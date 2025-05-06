// Logout function

const logout = (req, res) => {
  try {
    if (req.isAuthenticated()) {
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
              console.error(
                "Error destroying session after logout:",
                destroyErr
              );
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
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
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

// Get User Details function

const getUserDetails = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      return res.status(200).json({
        success: true,
        user: {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          gender: req.user.gender,
        },
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
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
