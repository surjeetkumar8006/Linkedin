import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import postRoute from "./routes/posts.routes.js"; 
import userRoutes from "./routes/users.routes.js";
import helmet from "helmet";
import "./config/passport.config.js"; // passport strategy config

dotenv.config();
const app = express();

// Security Middleware
app.use(helmet());

// Middleware for JSON and URL Encoding
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Other middlewares
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(express.static("uploads"));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
}));

// Passport.js setup
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/Linkedin";
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Error:", err));

// Routes
app.use("/api/posts", postRoute);
app.use("/api/users", userRoutes);

// Welcome Route
app.get("/", (req, res) => {
  res.send("🚀 Server is running");
});

// Error Handling
app.use((err, req, res, next) => {
  console.error("Unexpected Error:", err);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
