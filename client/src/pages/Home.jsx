import { Card, Button, Badge } from "flowbite-react";
import { Link, useLocation } from "react-router-dom";
import { HiArrowRight, HiClock, HiHeart, HiChat, HiX, HiTrendingUp, HiSparkles } from "react-icons/hi";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DOMPurify from "dompurify";

export default function HomePage() {
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const [showMore, setShowMore] = useState(true);
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get('search');

  useEffect(() => {
    const fetchRecentPosts = async () => {
      setLoading(true);
      try {
        const searchQuery = searchTerm ? `&searchTerm=${searchTerm}` : '';
        const res = await fetch(`/api/post/getposts?limit=9${searchQuery}`);
        const data = await res.json();
        if (res.ok) {
          setRecentPosts(data.posts);
          setTotalPosts(data.totalPosts);
          if (data.posts.length < 9) {
            setShowMore(false);
          } else {
            setShowMore(true);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentPosts();
  }, [searchTerm]);

  const handleShowMore = async () => {
    const startIndex = recentPosts.length;
    setLoadingMore(true);
    try {
      const searchQuery = searchTerm ? `&searchTerm=${searchTerm}` : '';
      const res = await fetch(`/api/post/getposts?startIndex=${startIndex}&limit=9${searchQuery}`);
      const data = await res.json();
      if (res.ok) {
        setRecentPosts((prev) => [...prev, ...data.posts]);
        if (data.posts.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingMore(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">

      {/* Hero Section - Modern & Engaging */}
      <motion.section
        className="relative px-6 py-20 lg:py-32 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div variants={itemVariants} className="text-center mb-12">
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <HiSparkles className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Welcome to Aman's Blog
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Discover Stories
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                That Matter
              </span>
            </h1>

            {searchTerm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <Badge color="purple" size="lg" className="flex items-center gap-2 shadow-lg">
                  <span>Searching for: "{searchTerm}"</span>
                  <Link to="/" className="hover:text-white">
                    <HiX className="w-4 h-4" />
                  </Link>
                </Badge>
              </motion.div>
            )}

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              {currentUser
                ? `Welcome back, ${currentUser.username}! 🎉 Explore fresh insights and join the conversation.`
                : 'Explore articles on technology, creativity, and innovation. Join thousands of readers discovering quality content daily.'
              }
            </p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              variants={itemVariants}
            >
              {!currentUser ? (
                <>
                  <Link to="/sign-up">
                    <Button gradientDuoTone="purpleToPink" size="xl" className="min-w-[200px]">
                      <HiSparkles className="mr-2 w-5 h-5" />
                      Start Reading
                    </Button>
                  </Link>
                  <Link to="/about">
                    <Button color="light" size="xl" className="min-w-[200px] border-2 border-purple-500">
                      Learn More
                      <HiArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/create-post">
                  <Button gradientDuoTone="purpleToPink" size="xl">
                    <HiSparkles className="mr-2 w-5 h-5" />
                    Create New Post
                  </Button>
                </Link>
              )}
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          {totalPosts > 0 && !searchTerm && (
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mt-16"
            >
              <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {totalPosts}+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Articles</div>
              </div>
              <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {recentPosts.reduce((acc, post) => acc + (post.numberOfLikes || 0), 0)}+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Likes</div>
              </div>
              <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  ∞
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ideas</div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Blog Posts Section */}
      <section className="px-6 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'Search Results' : 'Latest Articles'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {totalPosts > 0 ? `${totalPosts} ${totalPosts === 1 ? 'article' : 'articles'} published` : 'No articles yet'}
              </p>
            </div>
            {totalPosts > 0 && (
              <HiTrendingUp className="w-10 h-10 text-purple-500" />
            )}
          </div>

          {/* Loading Skeletons */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg animate-pulse">
                  <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="flex gap-3 pt-4">
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentPosts.length > 0 ? (
            <>
              {/* Posts Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentPosts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <Link to={`/post/${post.slug}`} className="block h-full">
                      <article className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col group">
                        {/* Post Image */}
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                          {/* Category Badge */}
                          <div className="absolute top-4 left-4">
                            <Badge color="purple" className="font-semibold shadow-lg">
                              {post.category}
                            </Badge>
                          </div>

                          {/* Date Badge */}
                          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white text-sm font-medium">
                            <HiClock className="w-4 h-4" />
                            <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight">
                            {post.title}
                          </h3>

                          <div
                            className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(post.content.substring(0, 150) + '...'),
                            }}
                          />

                          {/* Post Meta */}
                          <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <HiHeart className="w-4 h-4 text-red-500" />
                              <span>{post.numberOfLikes || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-medium ml-auto group-hover:gap-3 transition-all">
                              <span>Read more</span>
                              <HiArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Show More Button */}
              {showMore && (
                <div className="flex justify-center mt-12">
                  <Button
                    onClick={handleShowMore}
                    gradientDuoTone="purpleToPink"
                    size="xl"
                    disabled={loadingMore}
                    className="min-w-[200px]"
                  >
                    {loadingMore ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Articles
                        <HiArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
            >
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HiSparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {searchTerm ? 'No posts found' : 'No posts yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm
                    ? 'Try adjusting your search terms or browse all articles.'
                    : 'Be the first to share your story with the world!'
                  }
                </p>
                {currentUser && !searchTerm && (
                  <Link to="/create-post">
                    <Button gradientDuoTone="purpleToPink" size="lg">
                      <HiSparkles className="mr-2 w-5 h-5" />
                      Create Your First Post
                    </Button>
                  </Link>
                )}
                {searchTerm && (
                  <Link to="/">
                    <Button gradientDuoTone="purpleToPink" outline size="lg">
                      Browse All Articles
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Custom animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
