const User = require("../models/user.js");
const { validationResult } = require("express-validator");
const {
  hashPassword,
  comparePasswords,
  // generateToken,
} = require("../utils/authHelper.js");
const {
  generateVerificationCode,
  generateRandomToken,
} = require("../utils/functions.js");
const {
  sendVerificationEmail,
  sendOTPEmail,
} = require("../utils/nodemailer.js");
const { sendVerificationSMS, sendOtpSMS } = require("../utils/twilio.js");
const features = require("../config/features.js");
const passport = require("passport");

// Register
const register = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  try {
    const {
      firstName,
      lastName,
      gender,
      phoneNumber,
      email,
      addressLine1,
      addressLine2,
      country,
      state,
      city,
      zipCode,
      password,
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ phoneNumber }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered.",
      });
    }

    const verifyCode = generateVerificationCode();
    const verifyCodeExpire = Date.now() + 10 * 60 * 1000;
    const verifyCodeSMS = generateVerificationCode();
    const verifyCodeSMSExpire = Date.now() + 10 * 60 * 1000;
    const tempToken = generateRandomToken(32);
    const registerToken = generateRandomToken(32);

    if (features.enableTwilio) {
      try {
        await sendVerificationSMS(phoneNumber, verifyCodeSMS);
      } catch (error) {
        console.error("Failed to send verification SMS:", error);
        return res.status(400).json({
          success: false,
          message: "Error sending SMS",
        });
      }
    } else {
      console.log("Twilio integration is disabled");
    }

    if (features.enableNodemailer) {
      try {
        await sendVerificationEmail(email, verifyCode);
      } catch (error) {
        console.error("Failed to send verification email:", error);
        return res.status(400).json({
          success: false,
          message: "Error sending email",
        });
      }
    } else {
      console.log("Nodemailer integration is disabled");
    }

    const hashedPassword = await hashPassword(password);

    await User.create({
      firstName,
      lastName,
      gender,
      phoneNumber,
      email,
      addressLine1,
      addressLine2,
      country,
      state,
      city,
      zipCode,
      password: hashedPassword,
      verifyCode,
      verifyCodeExpire,
      verifyCodeSMS,
      verifyCodeSMSExpire,
      tempToken,
      registerToken,
    });

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      data: {
        tempToken: tempToken,
        registerToken: registerToken
      },
    });
  } catch (error) {
    console.log("Error while registering:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Checks API
const checkVerificationStatus = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }
  const { tempToken } = req.body;

  if (!tempToken) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid token",
    });
  }

  try {
    const user = await User.findOne({
      tempToken: tempToken,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "User found successfully",
        data: {
          isVerifiedByEmail: user.isVerifiedByEmail,
          isVerifiedByPhone: user.isVerifiedByPhone,
        },
      });
    }
  } catch (error) {
    console.log("Error at checks:", checkVerificationStatus);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify email code
const verifyEmail = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }
  const { tempToken, verifyCode } = req.body;

  if (!tempToken || !verifyCode) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid token or verification code.",
    });
  }

  try {
    const user = await User.findOne({
      tempToken: tempToken,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (Date.now() > user.verifyCodeExpire) {
      return res.status(400).json({
        success: false,
        message: "Verification Code has expired.",
      });
    }

    if (user.verifyCode !== verifyCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    user.verifyCode = null;
    user.verifyCodeExpire = null;
    // user.tempToken = null;
    user.isVerifiedByEmail = true;

    await user.save();

    if (user.isVerifiedByEmail && user.isVerifiedByPhone) {
      user.tempToken = null;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.log("Error during email verification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify SMS code
const verifyPhone = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }
  const { tempToken, verifyCodeSMS } = req.body;

  if (!tempToken || !verifyCodeSMS) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid token or verification code.",
    });
  }

  try {
    const user = await User.findOne({
      tempToken: tempToken,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (Date.now() > user.verifyCodeSMSExpire) {
      return res.status(400).json({
        success: false,
        message: "Verification Code has expired.",
      });
    }

    if (user.verifyCodeSMS !== verifyCodeSMS) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    user.verifyCodeSMS = null;
    user.verifyCodeSMSExpire = null;
    // user.tempToken = null;
    user.isVerifiedByPhone = true;

    await user.save();

    if (user.isVerifiedByEmail && user.isVerifiedByPhone) {
      user.tempToken = null;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Phone number verified successfully.",
    });
  } catch (error) {
    console.log("Error during phone number verification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Resend email verification code
const resendEmailCode = async (req, res) => {
  if (!features.enableNodemailer) {
    console.log("Nodemailer integration is disabled");
    return res.status(503).json({
      success: false,
      message: "Email feature is temporarily disabled",
    });
  }
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }
  const { tempToken } = req.body;

  if (!tempToken) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid token",
    });
  }

  try {
    const user = await User.findOne({ tempToken });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerifiedByEmail) {
      return res.status(400).json({
        success: false,
        message: "User already verified by email.",
      });
    }

    const verifyCode = generateVerificationCode();
    const verifyCodeExpire = Date.now() + 10 * 60 * 1000;

    user.verifyCode = verifyCode;
    user.verifyCodeExpire = verifyCodeExpire;

    await user.save();

    await sendVerificationEmail(user.email, verifyCode);

    return res.status(200).json({
      success: true,
      message: "Email verification code resent",
    });
  } catch (error) {
    console.log("Error while resending verification code on email:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Resend SMS verification code
const resendSMSCode = async (req, res) => {
  if (!features.enableTwilio) {
    console.log("Twilio integration is disabled");
    return res.status(503).json({
      success: false,
      message: "SMS feature is temporarily disabled",
    });
  }
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }
  const { tempToken } = req.body;

  if (!tempToken) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid token",
    });
  }

  try {
    const user = await User.findOne({ tempToken });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerifiedByPhone) {
      return res.status(400).json({
        success: false,
        message: "User already verified by SMS",
      });
    }

    const verifyCodeSMS = generateVerificationCode();
    const verifyCodeSMSExpire = Date.now() + 10 * 60 * 1000;

    user.verifyCodeSMS = verifyCodeSMS;
    user.verifyCodeSMSExpire = verifyCodeSMSExpire;

    await user.save();

    await sendVerificationSMS(user.phoneNumber, verifyCodeSMS);

    return res.status(200).json({
      success: true,
      message: "SMS verification code resent",
    });
  } catch (error) {
    console.log(
      "Error while resending verification code on phone number:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Continue to Dashboard
const continueToDashboard = async (req, res, next) => {
  // 1️⃣ Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  const { registerToken } = req.body;

  try {
    // 2️⃣ Lookup user by tempToken
    const user = await User.findOne({ registerToken });
   
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    if(!user.isVerifiedByEmail || !user.isVerifiedByPhone){
      return res.status(401).json({
        success: false,
        message: "Profile not verified yet."
      })
    }

    // 3️⃣ Establish session
    req.login(user, (err) => {
      if (err) {
        console.error("Auto-login error:", err);
        return res.status(400).json({
          success: false,
          message: "Could not establish session",
        });
      }

      // 4️⃣ Redirect or respond
      return res.status(200).json({
        success: true,
        message: "Session established",
      });
    });
  } catch (err) {
    console.error("Continue error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login
const login = (req, res, next) => {
  // 1️⃣ Validate input (loginID & password)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  // 2️⃣ Authenticate via Passport LocalStrategy
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Auth error:", err || info);
      return res.status(400).json({
        success: false,
        message: "Error during authentication",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3️⃣ Establish session
    req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error("Session error:", loginErr);
        return res.status(400).json({
          success: false,
          message: "Could not establish session",
        });
      }

      // 4️⃣ tempToken logic goes here in controller
      try {
        if (!user.tempToken) {
          if (!user.isVerifiedByEmail || !user.isVerifiedByPhone) {
            const tempToken = generateRandomToken(32);
            user.tempToken = tempToken;
            await user.save();
          }
        }
        if(user.registerToken){
          user.registerToken = null;
          await user.save();
        }
      } catch (error) {
        console.error("TempToken error:", tokenErr);
        return res.status(500).json({
          success: false,
          message: "Error during tokenisation",
        });
      }

      // 5️⃣ Send response
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            isVerifiedByEmail: user.isVerifiedByEmail,
            isVerifiedByPhone: user.isVerifiedByPhone,
            tempToken: user.tempToken,
          },
        },
      });
    });
  })(req, res, next);
};

// ─── Session-based login starts here ───

//     req.session.regenerate((err) => {
//       if (err) {
//         console.error("Session regeneration error:", err);
//         return res.status(400).json({
//           success: false,
//           message: "Session error",
//         });
//       }

//       // Store only minimal info
//       req.session.userId = user._id;
//       req.session.loggedInAt = Date.now();

//       req.session.save((err) => {
//         if (err) {
//           console.error("Session save error:", err);
//           return res.status(400).json({
//             success: false,
//             message: "Session error",
//           });
//         }
//         return res.status(200).json({
//           success: true,
//           message: "Login successful",
//           data: {
//             user: {
//               firstName: user.firstName,
//               lastName: user.lastName,
//               gender: user.gender,
//               isVerifiedByEmail: user.isVerifiedByEmail,
//               isVerifiedByPhone: user.isVerifiedByPhone,
//               tempToken: user.tempToken,
//             },
//           },
//         });
//       });
//     });
//   } catch (error) {
//     console.error("Error during login:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// Forgot password
const forgotPassword = async (req, res) => {
  if (features.enableNodemailer || features.enableTwilio) {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }
    const { loginID } = req.body; // Only the loginID (email or phone number) is now required
    try {
      let user;

      // Check if the loginID is an email or phone number
      if (validateEmail(loginID)) {
        user = await User.findOne({ email: loginID });
      } else if (validatePhoneNumber(loginID)) {
        user = await User.findOne({ phoneNumber: loginID });
      } else {
        return res.status(400).json({
          success: false,
          message: "Please provide valid email or phone number.",
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const otp = generateVerificationCode();
      const otpExpire = Date.now() + 10 * 60 * 1000; // OTP expires in 10 mins
      const otpToken = generateRandomToken(32);
      const otpTokenExpire = Date.now() + 3600000;

      let via;
      if (validateEmail(loginID)) {
        via = "email";
        if (features.enableNodemailer) {
          await sendOTPEmail(loginID, otp); // Send OTP via email
        } else {
          return res.status(503).json({
            success: false,
            message: "Email feature is temporarily disabled",
          });
        }
      } else if (validatePhoneNumber(loginID)) {
        via = "phone";
        if (features.enableTwilio) {
          await sendOtpSMS(loginID, otp); // Send OTP via SMS
        } else {
          return res.status(503).json({
            success: false,
            message: "SMS feature is temporarily disabled",
          });
        }
      }

      // Save OTP and expiration time to the user's record
      user.otp = otp;
      user.otpExpire = otpExpire;
      user.otpToken = otpToken;
      user.otpTokenExpire = otpTokenExpire;
      user.via = via;

      await user.save();

      return res.status(200).json({
        success: true,
        message: `OTP sent to ${via}`,
        data: {
          otpToken: otpToken,
        },
      });
    } catch (error) {
      console.error("Error at forgot password:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  } else {
    return res.status(503).json({
      success: false,
      message: "OTP sending feature is temporarily disabled",
    });
  }
};

// Match OTP
const verifyOTP = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }
  const { otpToken, otp } = req.body;

  if (!otpToken || !otp) {
    return res.status(400).json({
      success: false,
      message: "Please provide token and otp",
    });
  }
  try {
    const user = await User.findOne({
      otpToken: otpToken,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (Date.now() > user.otpTokenExpire) {
      return res.status(400).json({
        success: false,
        message: "Token has expired",
      });
    }

    if (Date.now() > user.otpExpire) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const resetToken = generateRandomToken(32);
    const resetTokenExpire = Date.now() + 3600000; // Token expires in 1 hour

    user.otp = null;
    user.otpExpire = null;
    user.otpToken = null;
    user.otpTokenExpire = null;
    user.via = null;
    user.resetToken = resetToken;
    user.resetTokenExpire = resetTokenExpire;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        resetToken: resetToken,
      },
    });
  } catch (error) {
    console.log("Error during otp verification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  if (features.enableNodemailer || features.enableTwilio) {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }
    const { otpToken } = req.body;

    if (!otpToken) {
      return res
        .status(400)
        .json({ message: "Please provide a valid OTP Token" });
    }

    try {
      const user = await User.findOne({ otpToken });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (Date.now() > user.otpTokenExpire) {
        return res.status(401).json({
          message: "Token has expired",
        });
      }

      if (user.via === "email") {
        if (features.enableNodemailer) {
          const otp = generateVerificationCode();
          const otpExpire = Date.now() + 10 * 60 * 1000; // OTP expires in 10 mins

          // Save OTP and expiration time to the applicant's record
          user.otp = otp;
          user.otpExpire = otpExpire;

          await user.save();

          await sendOTPEmail(user.email, otp);

          return res.status(200).json({
            success: true,
            message: "OTP resent to email",
          });
        } else {
          console.log("Nodemailer integration is disabled");
          return res.status(503).json({
            success: false,
            message: "Email feature is temporarily disabled",
          });
        }
      }

      if (user.via === "phone") {
        if (features.enableTwilio) {
          const otp = generateVerificationCode();
          const otpExpire = Date.now() + 10 * 60 * 1000; // OTP expires in 10 mins

          // Save OTP and expiration time to the applicant's record
          user.otp = otp;
          user.otpExpire = otpExpire;

          await user.save();

          await sendOtpSMS(user.phoneNumber, otp);
          return res.status(200).json({
            success: true,
            message: "OTP resent to phone",
          });
        } else {
          return res.status(503).json({
            success: false,
            message: "SMS feature is temporarily disabled",
          });
        }
      }
    } catch (error) {
      console.log("Error while resending OTP", error);
      return res.status(500).json({
        message: "Error resending the OTP",
      });
    }
  } else {
    console.log("Both Nodemailer and Twilio integrations are disabled");
    return res.status(503).json({
      success: false,
      message: "OTP sending feature is temporarily disabled",
    });
  }
};

// Reset Password API
const resetPassword = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  const { resetToken, newPassword, confirmPassword } = req.body;

  if (!resetToken || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide a token or new/confirm password.",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match.",
    });
  }

  try {
    const user = await User.findOne({ resetToken });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (Date.now() > user.resetTokenExpire) {
      return res.status(400).json({
        success: false,
        message: "Token has expired.",
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpire = null;

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Password successfully reset.",
    });
  } catch (error) {
    console.log("Error while resetting password", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Utility functions to validate email and phone number
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\+?[0-9]{3,15}$/; // Adjust for your phone number format
  return phoneRegex.test(phoneNumber);
};

module.exports = {
  register,
  checkVerificationStatus,
  verifyEmail,
  verifyPhone,
  resendEmailCode,
  resendSMSCode,
  continueToDashboard,
  login,
  forgotPassword,
  verifyOTP,
  resendOTP,
  resetPassword,
};
