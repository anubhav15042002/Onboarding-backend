const crypto = require("crypto");

// Random Code Generation
function generateRandomToken(number) {
  return crypto.randomBytes(number).toString("hex"); // generates random code
}

function generateVerificationCode() {
  // Generate a random 6-digit number between 100000 and 999999
  const code = Math.floor(100000 + Math.random() * 900000);

  return code.toString(); // Return as a string to preserve the exact number format
}

module.exports = { generateRandomToken, generateVerificationCode };
