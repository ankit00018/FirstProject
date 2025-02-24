import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config({
    path: './.env'
});

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import routes
import userRouter from "./routes/user.routes.js";

if (userRouter) {
    console.log("✅ User Router imported successfully!");
} else {
    console.log("❌ Failed to import User Router.");
}

// Mount routes
console.log("🚀 Mounting user routes at /api/v1/users...");
app.use("/api/v1/users", userRouter);
console.log("✅ User routes mounted successfully!");

export { app };