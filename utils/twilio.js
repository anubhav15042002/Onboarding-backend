const twilio = require("twilio");

// SMS Verification Code Setup

// Twilio Client Setup
const twilioClient = new twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// SMS Sending Process
const sendVerificationSMS = async (phoneNumber, verificationCode) => {
  try {
    await twilioClient.messages.create({
      body: `Your verification code is: ${verificationCode}.It will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
      to: `+91${phoneNumber}`,
    });
    console.log("Verification SMS sent successfully!");
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw new Error("Failed to send SMS.");
  }
};

const sendOtpSMS = async (phoneNumber, otp) => {
  try {
    await twilioClient.messages.create({
      body: `Your OTP is: ${otp}.It will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
      to: `+91${phoneNumber}`,
    });
    console.log("OTP on SMS sent successfully!");
  } catch (error) {
    console.error("Error sending OTP on SMS:", error);
    throw new Error("Failed to send OTP on SMS.");
  }
};

module.exports = { sendVerificationSMS, sendOtpSMS };
