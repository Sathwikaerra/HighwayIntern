// middleware/auth.js
import jwt from "jsonwebtoken";
import { User } from "../models/Users.js";

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }

    req.user = user; // attach user to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};
