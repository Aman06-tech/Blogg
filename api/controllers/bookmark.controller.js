import Bookmark from "../models/bookmark.model.js";
import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";

// Toggle bookmark (add or remove)
export const toggleBookmark = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return next(errorHandler(404, "Post not found"));
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({ userId, postId });

    if (existingBookmark) {
      // Remove bookmark
      await Bookmark.findByIdAndDelete(existingBookmark._id);
      res.status(200).json({ bookmarked: false, message: "Bookmark removed" });
    } else {
      // Add bookmark
      const newBookmark = new Bookmark({ userId, postId });
      await newBookmark.save();
      res.status(200).json({ bookmarked: true, message: "Post bookmarked" });
    }
  } catch (error) {
    next(error);
  }
};

// Get user's bookmarks
export const getBookmarks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const bookmarks = await Bookmark.find({ userId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Get the post IDs
    const postIds = bookmarks.map((b) => b.postId);

    // Fetch the actual posts with author info
    const posts = await Post.aggregate([
      { $match: { _id: { $in: postIds } } },
      {
        $lookup: {
          from: "users",
          let: { id: { $toObjectId: "$userId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { username: 1, profilePicture: 1 } }
          ],
          as: "author"
        }
      },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } }
    ]);

    // Add bookmarkedAt timestamp to each post
    const postsWithBookmarkInfo = posts.map((post) => {
      const bookmark = bookmarks.find(
        (b) => b.postId.toString() === post._id.toString()
      );
      return {
        ...post,
        bookmarkedAt: bookmark?.createdAt,
      };
    });

    // Sort by bookmark date
    postsWithBookmarkInfo.sort(
      (a, b) => new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt)
    );

    const totalBookmarks = await Bookmark.countDocuments({ userId });

    res.status(200).json({
      posts: postsWithBookmarkInfo,
      totalBookmarks,
    });
  } catch (error) {
    next(error);
  }
};

// Check if a post is bookmarked
export const checkBookmark = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const bookmark = await Bookmark.findOne({ userId, postId });
    res.status(200).json({ bookmarked: !!bookmark });
  } catch (error) {
    next(error);
  }
};

// Remove bookmark
export const removeBookmark = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const bookmark = await Bookmark.findOneAndDelete({ userId, postId });

    if (!bookmark) {
      return next(errorHandler(404, "Bookmark not found"));
    }

    res.status(200).json({ message: "Bookmark removed" });
  } catch (error) {
    next(error);
  }
};
