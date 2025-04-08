const nodemailer = require("nodemailer");

// Nodemailer Setup
const sendVerificationEmail = async (email, verificationCode) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Gmail is used for this example, you can configure other providers
    auth: {
      user: process.env.EMAIL_USER, // Your email address (must be a Gmail address)
      pass: process.env.EMAIL_PASS, // Your email password or an app-specific password
    },
  });

  // Email Sending Process
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender email
    to: email, // Recipient email
    subject: "Your Verification Code",
    text: `Your verification code is: ${verificationCode}. It will expire in 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully!");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send email.");
  }
};

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Gmail is used for this example, you can configure other providers
    auth: {
      user: process.env.EMAIL_USER, // Your email address (must be a Gmail address)
      pass: process.env.EMAIL_PASS, // Your email password or an app-specific password
    },
  });

  // Email Sending Process
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender email
    to: email, // Recipient email
    subject: "Your OTP",
    text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully on email!");
  } catch (error) {
    console.error("Error sending OTP on email:", error);
    throw new Error("Failed to send OTP on email.");
  }
};

module.exports = { sendVerificationEmail, sendOTPEmail };
