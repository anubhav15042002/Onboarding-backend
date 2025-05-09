const mongoose = require("mongoose");
const { generateRandomToken } = require("../utils/functions");

const Schema = mongoose.Schema;

const TokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7*24*60*60*1000, // Token expires after 30 days
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

TokenSchema.statics.consume = async function (tok) {
  const rec = await this.findOne({ token: tok });
  if (!rec) return null;
    await rec.deleteOne(); // one-time use
  return rec;
};

TokenSchema.statics.issue = async function (userId, ttl) {
  // ttl: milliseconds until expiration (e.g. 30*24*60*60*1000)
  const tokenString = generateRandomToken(64);
  const rec = await this.create({
    token: tokenString,
    userId,
    expiresAt: Date.now() + ttl,
  });
  return rec.token;
};

const RememberMeToken = mongoose.model("RememberToken", TokenSchema);

module.exports = RememberMeToken;
