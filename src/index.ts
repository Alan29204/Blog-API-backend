import express from "express";
import cors from "cors"; // not send req to another domand?
import dotenv from "dotenv"; //
import path from "path";
import morgan from "morgan"; // sit in req res cycle, logs in4 about every incoming HTTP request
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

import { connectDB } from "./config/db.js";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// /docs: url that access API documentation
//swaggerUi.serve: a middleware function of swagger ui express library
// ..setup(swaggerSpec): function config swagger ui

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/health", (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.json({ status: "ok", dbConnected });
});

app.use("/api/auth", authRoutes); //handle all income request

app.use("/api/blogs", blogRoutes);

const PORT = Number(process.env.PORT || 4000);
// Backward-compat: map MONGO_URI -> MONGODB_URL if only the former is set
if (!process.env.MONGODB_URL && process.env.MONGO_URI) {
  process.env.MONGODB_URL = process.env.MONGO_URI;
}

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));


// Connect to MongoDB in the background, do NOT crash server if it FAILS
connectDB().catch((err) => {
  console.error("MongoDB connection error:", err);
});