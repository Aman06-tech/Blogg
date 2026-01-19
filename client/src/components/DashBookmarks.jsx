import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Spinner } from "flowbite-react";
import { HiBookmark, HiClock, HiTrash, HiExternalLink } from "react-icons/hi";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function DashBookmarks() {
  const { currentUser } = useSelector((state) => state.user);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBookmarks, setTotalBookmarks] = useState(0);
  const [showMore, setShowMore] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/bookmark?limit=10");
        const data = await res.json();
        if (res.ok) {
          setBookmarks(data.posts);
          setTotalBookmarks(data.totalBookmarks);
          if (data.posts.length < 10) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = bookmarks.length;
    try {
      const res = await fetch(`/api/bookmark?startIndex=${startIndex}&limit=10`);
      const data = await res.json();
      if (res.ok) {
        setBookmarks((prev) => [...prev, ...data.posts]);
        if (data.posts.length < 10) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveBookmark = async (postId) => {
    try {
      const res = await fetch(`/api/bookmark/${postId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBookmarks((prev) => prev.filter((post) => post._id !== postId));
        setTotalBookmarks((prev) => prev - 1);
        toast.success("Bookmark removed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove bookmark");
    }
  };

  const getReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content?.replace(/<[^>]*>/g, "").split(/\s+/).length || 0;
    return Math.ceil(words / wordsPerMinute) || 1;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <HiBookmark className="w-8 h-8" />
              Saved Articles
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {totalBookmarks} {totalBookmarks === 1 ? "article" : "articles"} saved
            </p>
          </div>
        </div>

        {/* Bookmarks List */}
        {bookmarks.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiBookmark className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No saved articles yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
              When you find articles you want to read later, save them here by clicking the bookmark icon.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Browse Articles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <Link to={`/post/${post.slug}`} className="sm:w-48 flex-shrink-0">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-40 sm:h-full object-cover"
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Category & Read Time */}
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full">
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <HiClock className="w-3.5 h-3.5" />
                            {getReadTime(post.content)} min read
                          </span>
                        </div>

                        {/* Title */}
                        <Link to={`/post/${post.slug}`}>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                        </Link>

                        {/* Author & Date */}
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          {post.author && (
                            <div className="flex items-center gap-2">
                              <img
                                src={post.author.profilePicture}
                                alt={post.author.username}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span>{post.author.username}</span>
                            </div>
                          )}
                          <span>•</span>
                          <span>
                            Saved {new Date(post.bookmarkedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/post/${post.slug}`}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Read article"
                        >
                          <HiExternalLink className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleRemoveBookmark(post._id)}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove bookmark"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Show More */}
            {showMore && (
              <div className="text-center pt-4">
                <button
                  onClick={handleShowMore}
                  className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
