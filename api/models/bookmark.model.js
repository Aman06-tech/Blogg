import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can only bookmark a post once
bookmarkSchema.index({ userId: 1, postId: 1 }, { unique: true });

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;
