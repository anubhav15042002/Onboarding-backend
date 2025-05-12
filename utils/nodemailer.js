const nodemailer = require("nodemailer");
const path = require("path");

// Nodemailer Setup
const sendVerificationEmail = async (email, firstName, verificationCode) => {
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
    subject: "Your One-Time Password (OTP) for Verification",
   html: `
  <div style="font-family: Arial, sans-serif;">
    <table align="center" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; margin: auto;">
      <tbody>
        <tr>
          <td align="center" style="padding: 20px 0;">
            <img src="cid:logo" alt="42 Works Logo" style="width: 80px; height: auto;" />
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; background-color: #ffffff;">
            <p style="margin: 0 0 10px;">Hi ${firstName},</p>
            <p style="margin: 0 0 10px;">
              Your One-Time Password (OTP) for verification is: 
              <strong style="color: #007bff;">${verificationCode}</strong>
            </p>
            <p style="margin: 0 0 10px;">This OTP is valid for 10 minutes. Please use it to complete your verification process.</p>
            <p style="margin: 0 0 10px;">If you didn't request this OTP, please ignore this email or contact our support team immediately.</p>
            <br>
            <p style="margin: 0;">Best,<br>42 Works Onboarding Team</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
`,
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "logo.png"), // Update this path if needed
        cid: "logo",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully!");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send email.");
  }
};

const sendOTPEmail = async (email, firstName, otp) => {
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
    subject: "Your OTP for Forgot Password",
     html: `
  <div style="font-family: Arial, sans-serif;">
    <table align="center" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; margin: auto;">
      <tbody>
        <tr>
          <td align="center" style="padding: 20px 0;">
            <img src="cid:logo" alt="42 Works Logo" style="width: 80px; height: auto;" />
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; background-color: #ffffff;">
            <p style="margin: 0 0 10px;">Hi ${firstName},</p>
            <p style="margin: 0 0 10px;">
              Your One-Time Password (OTP) for verification is: 
              <strong style="color: #007bff;">${otp}</strong>
            </p>
            <p style="margin: 0 0 10px;">This OTP is valid for 10 minutes. Please use it to complete your forgot password process.</p>
            <p style="margin: 0 0 10px;">If you didn't request this OTP, please ignore this email or contact our support team immediately.</p>
            <br>
            <p style="margin: 0;">Best,<br>42 Works Onboarding Team</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
`,
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "logo.png"), // Update this path if needed
        cid: "logo",
      },
    ],
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
