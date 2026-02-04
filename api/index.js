import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import postRoutes from  "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import bookmarkRoutes from "./routes/bookmark.route.js";
import aiRoutes from "./routes/ai.route.js";
import Post from "./models/post.model.js";
import { securityHeaders, sanitizeInput, corsOptions } from "./middleware/security.middleware.js";

dotenv.config();

// Simple MongoDB connection
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("✅ MongoDB is connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

const app = express();
app.set("trust proxy", 1);

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeInput);

// Routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/bookmark", bookmarkRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Serve static files in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../client/dist')));

// Helper function to strip HTML tags and get plain text
const stripHtml = (html) => {
  return html?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || '';
};

// Helper function to inject meta tags into HTML
const injectMetaTags = (html, meta) => {
  const defaults = {
    title: 'dailybloggs',
    description: 'Discover thoughtful articles on technology, creativity, and personal growth.',
    image: '/main-logo.png',
    url: process.env.SITE_URL || 'https://dailybloggs.com',
    type: 'website'
  };

  const finalMeta = { ...defaults, ...meta };

  return html
    .replace(/__META_TITLE__/g, finalMeta.title)
    .replace(/__META_DESCRIPTION__/g, finalMeta.description)
    .replace(/__META_OG_IMAGE__/g, finalMeta.image)
    .replace(/__META_OG_URL__/g, finalMeta.url)
    .replace(/__META_OG_TYPE__/g, finalMeta.type);
};

// Handle post pages with dynamic meta tags
app.get('/post/:slug', async (req, res) => {
  try {
    const indexPath = path.join(__dirname, '../client/dist', 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');

    // Fetch post data for meta tags
    const post = await Post.findOne({ slug: req.params.slug });

    if (post) {
      const description = stripHtml(post.content).substring(0, 160) + '...';
      const siteUrl = process.env.SITE_URL || 'https://dailybloggs.com';

      html = injectMetaTags(html, {
        title: `${post.title} | dailybloggs`,
        description: description,
        image: post.image,
        url: `${siteUrl}/post/${post.slug}`,
        type: 'article'
      });
    } else {
      html = injectMetaTags(html, {});
    }

    res.send(html);
  } catch (error) {
    console.error('Error serving post page:', error);
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  }
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  try {
    const indexPath = path.join(__dirname, '../client/dist', 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');
    html = injectMetaTags(html, {});
    res.send(html);
  } catch (error) {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});



const PORT = process.env.PORT || 6789;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});