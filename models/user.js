const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    maxLength: 30,
  },
  middleName: {
    type: String,
    maxLength: 30,
  },
  lastName: {
    type: String,
    required: true,
    maxLength: 30,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    maxLength: 15,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxLength: 100,
  },
  addressLine1: {
    type: String,
    required: true,
    maxLength: 200,
  },
  addressLine2: {
    type: String,
    maxLength: 200,
  },
  country: {
    type: String,
    required: true,
    maxLength: 100,
  },
  state: {
    type: String,
    required: true,
    maxLength: 100,
  },
  city: {
    type: String,
    required: true,
    maxLength: 100,
  },
  zipCode: {
    type: String,
    required: true,
    maxLength: 18,
  },
  password: {
    type: String,
    minLength: 8,
    required: true,
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
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
