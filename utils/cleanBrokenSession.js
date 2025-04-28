// Middleware to clean up empty or invalid sessions automatically
function cleanBrokenSession(req, res, next) {
    if (req.session && !req.user) {
      // If session exists but no user is attached (likely a broken session)
      req.session.destroy((err) => {
        if (err) {
          console.error('Failed to clean up broken session:', err);
        }
        res.clearCookie('connect.sid', { path: '/' });
        console.log('Cleaned up broken session and cookie');
        // Proceed normally
        next();
      });
    } else {
      next();
    }
  }

module.exports = {cleanBrokenSession};