import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoute.js";
import { connectDB } from "./db.js";
import cors from "cors"

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors())
app.use("/auth", authRoutes);



// Connect to database with error handling
const startServer = async () => {
  try {
    await connectDB(); 
    console.log("✅ Database connected successfully");
    
    app.listen(3000, () => {
      console.log("🚀 Server running on http://localhost:3000");
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();

