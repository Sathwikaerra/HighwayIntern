import  {User} from "../models/Users.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv"
import jwt from "jsonwebtoken";
import {generateToken} from "../token.js"

dotenv.config();



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

// ✅ SIGNUP FLOW
export const signup = async (req, res) => {
  console.log("✅ Signup route hit");

  let { name, email, dateOfBirth } = req.body;

  // Input validation
  if (!name || !email || !dateOfBirth) {
    return res.status(400).json({ success: false, error: "Name, email, and date of birth are required." });
  }

  // Sanitize input
  name = name.trim();
  email = email.trim().toLowerCase();

  const otp = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins from now

  try {
    const existingUser = await User.findOne({ email });
    console.log("🔍 Checked if user exists");

    // If user already verified
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ success: false, message: "User already exists. Please login." });
    }

    // Create or update user with OTP
    await User.findOneAndUpdate(
      { email },
      {
        name,
        email,
        dateOfBirth,
        otp,
        otpExpiresAt,
        isVerified: false,
      },
      { upsert: true, new: true }
    );
    console.log("✅ User created/updated with OTP");

    console.log(process.env.EMAIL)
    console.log(process.env.EMAIL_PASS)
    // Send OTP email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Signup OTP Verification",
        html: `<div>
          <h2>Your Signup OTP</h2>
          <p><strong>${otp}</strong></p>
          <p>This OTP is valid for 5 minutes.</p>
        </div>`
      });

      console.log(`✅ OTP email sent to ${email}`);
      res.json({ success: true, message: "OTP sent for signup verification." });

    } catch (emailErr) {
      console.error("❌ Failed to send OTP email:", emailErr);
      return res.status(500).json({ success: false, error: "Failed to send OTP email." });
    }

  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// ✅ VERIFY SIGNUP
export const verifySignup = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpiresAt: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired OTP." });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ message: "Signup verified. You can now login." });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

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

// middlewares/authMiddleware.js



export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authorized, token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-otp -otpExpiresAt");

    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user; // add user to request
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};


export const loginWithoutOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "User not found or not verified." });
    }

    // ✅ Just send JWT token
    return res.json({
      message: "Login successful without OTP",
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

