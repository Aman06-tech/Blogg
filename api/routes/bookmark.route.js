import express from "express";
import {
  toggleBookmark,
  getBookmarks,
  checkBookmark,
  removeBookmark,
} from "../controllers/bookmark.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import { apiLimiter } from "../middleware/security.middleware.js";

const router = express.Router();

// Toggle bookmark (add/remove)
router.put("/toggle/:postId", apiLimiter, verifyToken, toggleBookmark);

// Get all bookmarks for current user
router.get("/", apiLimiter, verifyToken, getBookmarks);

// Check if a post is bookmarked
router.get("/check/:postId", apiLimiter, verifyToken, checkBookmark);

// Remove a bookmark
router.delete("/:postId", apiLimiter, verifyToken, removeBookmark);

export default router;
