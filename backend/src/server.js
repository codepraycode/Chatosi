import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Allow local dev + deployed frontend
const whitelist = [
  'http://localhost:5173',            // Vite dev
  'https://chatosi.vercel.app'       // Deployed frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (whitelist.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`Blocked CORS request from: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // <--- important for sending cookies
};

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// Health check
app.get('/', (req, res) => {
  return res.status(200).json({ message: 'All Good!' });
});

// Start server
server.listen(PORT, () => {
  console.log("Server is running on PORT:" + PORT);
  connectDB();
});
