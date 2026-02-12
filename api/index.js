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

// Default meta values (must match index.html exactly for replacement to work)
const DEFAULT_META = {
  title: 'DailyBloggs - Stories That Inspire & Educate',
  description: 'Discover thoughtful articles on technology, creativity, health, and personal growth. Join thousands of readers exploring ideas that matter.',
  image: 'https://dailybloggs.com/main-logo.png',
  url: 'https://dailybloggs.com',
  type: 'website'
};

// Helper function to escape special regex characters
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Helper function to inject post meta tags into HTML
const injectPostMeta = (html, post, siteUrl) => {
  const plainContent = stripHtml(post.content);
  const description = plainContent.length > 155
    ? plainContent.substring(0, 155) + '...'
    : plainContent;
  const postUrl = `${siteUrl}/post/${post.slug}`;
  const postImage = post.image || DEFAULT_META.image;

  // JSON-LD structured data for Article
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": description,
    "image": postImage,
    "url": postUrl,
    "datePublished": post.createdAt,
    "dateModified": post.updatedAt,
    "publisher": {
      "@type": "Organization",
      "name": "DailyBloggs",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/main-logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": postUrl
    }
  });

  return html
    // Replace title
    .replace(new RegExp(escapeRegExp(DEFAULT_META.title), 'g'), `${post.title} - DailyBloggs`)
    // Replace description
    .replace(new RegExp(escapeRegExp(DEFAULT_META.description), 'g'), description)
    // Replace image
    .replace(new RegExp(escapeRegExp(DEFAULT_META.image), 'g'), postImage)
    // Replace URL (og:url, twitter:url)
    .replace(new RegExp(escapeRegExp(DEFAULT_META.url), 'g'), postUrl)
    // Replace canonical
    .replace(
      `<link rel="canonical" href="${siteUrl}"`,
      `<link rel="canonical" href="${postUrl}"`
    )
    // Replace og:type
    .replace('content="website"', 'content="article"')
    // Inject JSON-LD structured data before </head>
    .replace('</head>', `<script type="application/ld+json">${jsonLd}</script>\n</head>`);
};

// Dynamic sitemap.xml
app.get('/sitemap.xml', async (req, res) => {
  try {
    const siteUrl = process.env.SITE_URL || 'https://dailybloggs.com';
    const posts = await Post.find({}).select('slug updatedAt category').sort({ updatedAt: -1 });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/search</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;

    for (const post of posts) {
      const lastmod = post.updatedAt ? new Date(post.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `
  <url>
    <loc>${siteUrl}/post/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    xml += `\n</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Handle post pages with dynamic meta tags
app.get('/post/:slug', async (req, res) => {
  try {
    const indexPath = path.join(__dirname, '../client/dist', 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');

    // Fetch post data for meta tags
    const post = await Post.findOne({ slug: req.params.slug });

    if (post) {
      const siteUrl = process.env.SITE_URL || 'https://dailybloggs.com';
      html = injectPostMeta(html, post, siteUrl);
    }

    res.send(html);
  } catch (error) {
    console.error('Error serving post page:', error);
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  }
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
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