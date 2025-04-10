const express = require("express");
const {
  register,
  verifyEmail,
  verifyPhone,
  resendEmailCode,
  resendSMSCode,
  login,
  forgotPassword,
  verifyOTP,
  resendOTP,
  resetPassword,
} = require("../controllers/userController");
const {
  validateRegister,
  validateVerifyEmail,
  validateVerifyPhone,
  validateResendCodes,
  validateLogin,
  validateForgotPassword,
  validateVerifyOTP,
  validateResendOTP,
  validateResetPassword,
} = require("../middleware/validationChecks");

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/verifyEmail", validateVerifyEmail, verifyEmail);
router.post("/verifyPhone", validateVerifyPhone, verifyPhone);
router.post("/resendEmailCode", validateResendCodes, resendEmailCode);
router.post("/resendSMSCode", validateResendCodes, resendSMSCode);
router.post("/login", validateLogin, login);
router.post("/forgotPassword", validateForgotPassword, forgotPassword);
router.post("/verifyOTP", validateVerifyOTP, verifyOTP);
router.post("/resendOTP", validateResendOTP, resendOTP);
router.post("/resetPassword", validateResetPassword, resetPassword);

module.exports = router;
