import  {User} from "../models/Users.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv"
import jwt from "jsonwebtoken";
import {generateToken} from "../token.js"
import { PendingUser } from "../models/pendingUser.js";

dotenv.config();
// controllers/noteController.js

import { v4 as uuidv4 } from "uuid";

// GET all notes
export const getNotes = async (req, res) => {
  res.json({ notes: req.user.notes });
};

// ADD note
export const addNote = async (req, res) => {
  const { content } = req.body;

  const newNote = {
    id: uuidv4(),
    content,
  };

  req.user.notes.push(newNote);
  await req.user.save();

  res.status(201).json({ message: "Note added", note: newNote });
};

// DELETE note
export const deleteNote = async (req, res) => {
  const { id } = req.params;

  req.user.notes = req.user.notes.filter((note) => note.id !== id);
  await req.user.save();

  res.json({ message: "Note deleted", id });
};




// OTP generator
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,       // Your email from env
    pass: process.env.EMAIL_PASS,  // App password (not actual Gmail password)
  },
});



export const signup = async (req, res) => {
  console.log("✅ Signup route hit");

  let { name, email, dateOfBirth } = req.body;

  if (!name || !email || !dateOfBirth) {
    return res.status(400).json({ success: false, error: "All fields are required." });
  }

  name = name.trim();
  email = email.trim().toLowerCase();

  const otp = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 5 mins

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists. Please login." });
    }

    await PendingUser.findOneAndUpdate(
      { email },
      { name, email, dateOfBirth, otp, otpExpiresAt },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Signup OTP Verification",
      html: `<h2>Your Signup OTP</h2><p><strong>${otp}</strong></p><p>Valid for 5 minutes.</p>`,
    });

    return res.json({ success: true, message: "OTP sent to email." });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


// ✅ VERIFY SIGNUP
export const verifySignup = async (req, res) => {
  const { email, otp } = req.body;

  console.log(email,otp);
  try {
    const pending = await PendingUser.findOne({ email });

if (!pending) {
  console.log("❌ No pending user found for email");
  return res.status(400).json({ success: false, message: "No signup attempt found." });
}

console.log("🧾 Found PendingUser:", pending);

if (pending.otp !== otp) {
  console.log("❌ Incorrect OTP. Expected:", pending.otp, "Received:", otp);
  return res.status(400).json({ success: false, message: "Incorrect OTP." });
}

if (new Date(pending.otpExpiresAt) < new Date()) {
  console.log("❌ OTP expired at:", pending.otpExpiresAt);
  return res.status(400).json({ success: false, message: "OTP expired." });
}

    console.log("correct otp")
    // Now create user in User collection
    const newUser = new User({
      name: pending.name,
      email: pending.email,
      dateOfBirth: pending.dateOfBirth,
      isVerified: true,
    });

    console.log("user created")

    await newUser.save();
    await PendingUser.deleteOne({ email }); // cleanup

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email }, // payload
      process.env.JWT_SECRET, // secret
      { expiresIn: "7d" } // optional expiry
    );

    res.json({
      success: true,
      message: "Signup verified. Account created.",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        dateOfBirth: newUser.dateOfBirth,
      },
      token,
    }); 
    console.log("finished")
  } catch (err) {
    console.error("❌ Verification error:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// ✅ LOGIN FLOW
export const login = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(404).json({ message: "User not found or not verified." });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 20 * 60 * 1000);

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Login OTP",
      text: `Your OTP is ${otp}`,
    });

    res.json({ message: "OTP sent to your email." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ VERIFY LOGIN
export const verifyLogin = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpiresAt: { $gt: new Date() },
      isVerified: true,
    });
    console.log("verified")

    if (!user) return res.status(400).json({ message: "Invalid or expired OTP." });

    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

   res.json({
  message: "Login successful!",
  token: generateToken(user),
  user: {
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
  },
});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


