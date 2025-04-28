const { body } = require("express-validator");

// Validation checks for registration
const nameValidation = (name) => /^[A-Za-z\s]+$/.test(name);
const passwordValidation = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d!@#$%^&*()_+={}\[\]|\\:;"<>,.?/`~\-_]).{8,20}$/.test(
    password
  );

// Register middleware
const validateRegister = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .trim()
    .escape()
    .isLength({ min: 3, max: 30 })
    .withMessage("First name must be between 3 to 30 characters")
    .custom((value) => {
      if (!nameValidation(value)) {
        throw new Error("First name must only contain alphabets.");
      }
      return true;
    }),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .trim()
    .escape()
    .isLength({ min: 3, max: 30 })
    .withMessage("Last name must be between 3 to 30 characters")
    .custom((value) => {
      if (!nameValidation(value)) {
        throw new Error("Last name must only contain alphabets.");
      }
      return true;
    }),

    body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["male", "female", "others"])
    .withMessage("Gender must be either 'male','female' or 'others'")
    .trim()
    .escape(),

  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .trim()
    .escape()
    .isNumeric()
    .withMessage("Phone number should only contain digits")
    .isLength({ max: 15 })
    .withMessage("Phone number should not exceed 15 digits"),

    body("email")
    .notEmpty()
    .withMessage("Email address is required")
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage("Email address should not exceed 100 characters")
    .isEmail()
    .withMessage("Invalid email format"),

  body("addressLine1")
    .notEmpty()
    .withMessage("Address line 1 is required")
    .trim()
    .escape()
    .isLength({ max: 200 })
    .withMessage("Address line 1 should not exceed 200 characters."),

  body("addressLine2")
    .optional()
    .trim()
    .escape()
    .isLength({ max: 200 })
    .withMessage("Address line 2 should not exceed 200 characters."),

  body("country")
    .notEmpty()
    .withMessage("Country is required")
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage("Country must not exceed 100 characters."),

  body("state")
    .notEmpty()
    .withMessage("State is required")
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage("State must not exceed 100 characters."),

  body("city")
    .notEmpty()
    .withMessage("City is required")
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage("City must not exceed 100 characters."),

  body("zipCode")
    .notEmpty()
    .withMessage("Zip Code is required")
    .trim()
    .escape()
    .isLength({ max: 18 })
    .withMessage("Zip code must not exceed 18 characters"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .trim()
    .escape()
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 and 20 characters.")
    .custom((value) => {
      if (!passwordValidation(value)) {
        throw new Error(
          "Password must contain one uppercase, one lowercase, and one special character or number."
        );
      }
      return true;
    }),
];

// Verify email code middleware
const validateVerifyEmail = [
    body("tempToken")
      .notEmpty()
      .withMessage("Token is required")
      .trim()
      .escape()
      .isLength({ min: 64, max: 64 })
      .withMessage("Token must be exactly 64 characters"),
  
    body("verifyCode")
      .notEmpty()
      .withMessage("Verifiction code is required")
      .trim()
      .escape()
      .isNumeric()
      .withMessage("Verification code should only contain digits")
      .isLength({ min: 6, max: 6 })
      .withMessage("Verification code must be exactly 6 digits"),
];

// Verify phone number code middleware
const validateVerifyPhone = [
  body("tempToken")
    .notEmpty()
    .withMessage("Token is required")
    .trim()
    .escape()
    .isLength({ min: 64, max: 64 })
    .withMessage("Token must be exactly 64 characters"),

  body("verifyCodeSMS")
    .notEmpty()
    .withMessage("Verifiction code is required")
    .trim()
    .escape()
    .isNumeric()
    .withMessage("Verifiction code should only contain digits")
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification code must be exactly 6 digits"),
];

// Resend verify codes middleware
const validateResendCodes = [
  body("tempToken")
    .notEmpty()
    .withMessage("Token is required")
    .trim()
    .escape()
    .isLength({ min: 64, max: 64 })
    .withMessage("Token must be exactly 64 characters"),
];

// Login middleware
const validateLogin = [
  body("loginID")
    .notEmpty()
    .withMessage("Login ID is required")
    .trim()
    .escape(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .trim()
    .escape(),
];

// Forgot password middleware
const validateForgotPassword = [
    body("loginID")
    .notEmpty()
    .withMessage("Login ID is required")
    .trim()
    .escape(),
];

// Verify OTP Middleware
const validateVerifyOTP = [
  body("otpToken")
    .notEmpty()
    .withMessage("Token is required")
    .trim()
    .escape()
    .isLength({ min: 64, max: 64 })
    .withMessage("Token must be exactly 64 characters"),

  body("otp")
    .notEmpty()
    .withMessage("OTP is required")
    .trim()
    .escape()
    .isNumeric()
    .withMessage("OTP should only contain digits")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits"),
];

// Resend OTP
const validateResendOTP = [
  body("otpToken")
    .notEmpty()
    .withMessage("Token is required")
    .trim()
    .escape()
    .isLength({ min: 64, max: 64 })
    .withMessage("Token must be exactly 64 characters"),
];

// Reset Password Validation Middleware
const validateResetPassword = [
  body("resetToken")
    .notEmpty()
    .withMessage("Token is required")
    .isLength({ min: 64, max: 64 })
    .withMessage("Token's length must be exactly of 64 characters")
    .trim()
    .escape(),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .trim()
    .escape()
    .isLength({ min: 8, max: 20 })
    .withMessage(" New password must be between 8 and 20 characters.")
    .custom((value) => {
      if (!passwordValidation(value)) {
        throw new Error(
          "New password must contain one uppercase, one lowercase, and one special character or number."
        );
      }
      return true;
    }),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .trim()
    .escape(),
];

module.exports = {
  validateRegister,
  validateVerifyEmail,
  validateVerifyPhone,
  validateResendCodes,
  validateLogin,
  validateForgotPassword,
  validateVerifyOTP,
  validateResendOTP,
  validateResetPassword,
};
