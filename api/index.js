import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import sanitizeInput from "./middleware/sanitizeInput.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import connectDB from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();

// 1. Security middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(sanitizeInput);

// 2. Static file serving — must come BEFORE route definitions so that
//    requests for /assets/* are handled here and never reach the catch-all.
app.use(express.static(path.join(__dirname, "../client/dist")));

// 3. API routes
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);

// 4. Special routes
app.get("/robots.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/robots.txt"));
});

app.get("/sitemap.xml", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/sitemap.xml"));
});

app.get("/post/:slug", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// 5. SPA fallback catch-all — serves index.html for any unmatched route so
//    that client-side routing works correctly.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
