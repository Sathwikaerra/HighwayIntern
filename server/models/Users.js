import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  dateOfBirth: Date,
  otp: String,
  otpExpiresAt: Date,
  isVerified: { type: Boolean, default: false },
});

export const User = mongoose.model("User", userSchema);
