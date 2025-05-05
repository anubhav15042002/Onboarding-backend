const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
   // required: true,
    maxLength: 30,
  },
  lastName: {
    type: String,
  //  required: true,
    maxLength: 30,
  },
  gender: {
    type: String,
    enum: ["male", "female", "others"],
   // required: true,
  },
  phoneNumber: {
    type: String,
    // required: true,
    unique: true,
    sparse: true,
    maxLength: 15,
  },
  email: {
    type: String,
   // required: true,
    unique: true,
    sparse: true,
    maxLength: 100,
  },
  appleEmail: { 
    type: String, 
    unique: true,
    sparse: true 
    },
  addressLine1: {
    type: String,
    // required: true,
    maxLength: 200,
  },
  addressLine2: {
    type: String,
    maxLength: 200,
  },
  country: {
    type: String,
   // required: true,
    maxLength: 100,
  },
  state: {
    type: String,
  //  required: true,
    maxLength: 100,
  },
  city: {
    type: String,
   // required: true,
    maxLength: 100,
  },
  zipCode: {
    type: String,
   // required: true,
    maxLength: 18,
  },
  password: {
    type: String,
    minLength: 8,
  //  required: true,
  },
  verifyCode: {
    type: String,
  },
  verifyCodeExpire: {
    type: Date,
  },
  verifyCodeSMS: {
    type: String,
  },
  verifyCodeSMSExpire: {
    type: Date,
  },
  tempToken: {
    type: String,
  },
  registerToken: {
    type: String,
  },
  isVerifiedByEmail: {
    type: Boolean,
    default: false,
  },
  isVerifiedByPhone: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpire: {
    type: Date,
  },
  otpToken: {
    type: String,
  },
  otpTokenExpire: {
    type: Date,
  },
  via: {
    type: String,
    enum: ["email", "phone"],
  },
  resetToken: {
    type: String,
  },
  resetTokenExpire: {
    type: Date,
  },
  // Google OAuth Fields
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  profilePicture: {
    type: String,
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true,
  },
  appleId: {
    type: String,
    unique: true,
    sparse: true,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
