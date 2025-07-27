// models/PendingUser.js
import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  dateOfBirth: String,
  otp: String,
  otpExpiresAt: Date,
});

export const PendingUser = mongoose.model("PendingUser", pendingUserSchema);
