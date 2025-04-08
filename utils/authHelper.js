const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

// Hashing Password
const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(12);
  const hashedPassword = await bcryptjs.hash(password, salt);
  return hashedPassword;
};

// Compare Passwords
const comparePasswords = async (password, hashedPassword) => {
  const isMatch = await bcryptjs.compare(password, hashedPassword);
  return isMatch; // returns true if passwords match, false otherwise
};

// Generate JWT Token
const generateToken = (userId) => {
  const TOKEN_EXPIRATION_TIME = 3 * 60 * 60;
  const token = jwt.sign(
    {
      id: userId,
    },
    jwtSecret,
    { expiresIn: TOKEN_EXPIRATION_TIME }
  );
  return token;
};

// Verify JWT token
// const verifyToken = (token) => {
//   try {
//     const decoded = jwt.verify(token, jwtSecret);
//     return decoded; // returns the decoded payload if token is valid
//   } catch (err) {
//     throw new Error("Invalid or expired token");
//   }
// };

module.exports = { hashPassword, comparePasswords, generateToken };
