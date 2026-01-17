import { Card, Button, Badge } from "flowbite-react";
import { Link, useLocation } from "react-router-dom";
import { HiArrowRight, HiClock, HiHeart, HiX, HiBookOpen } from "react-icons/hi";
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* Hero Section */}
      <motion.section
        className="relative px-6 py-20 lg:py-28 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-slate-900 dark:text-white">
              Discover Stories That
              <span className="block text-slate-600 dark:text-slate-400">
                Matter
              </span>
            </h1>

            {searchTerm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <Badge color="gray" size="lg" className="flex items-center gap-2">
                  <span>Searching for: "{searchTerm}"</span>
                  <Link to="/" className="hover:text-slate-900">
                    <HiX className="w-4 h-4" />
                  </Link>
                </Badge>
              </motion.div>
            )}

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {currentUser
                ? `Welcome back, ${currentUser.username}. Explore fresh insights and join the conversation.`
                : 'Explore articles on technology, creativity, and innovation. Join readers discovering quality content daily.'
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
                    <Button color="dark" size="lg" className="min-w-[180px]">
                      Get Started
                      <HiArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/about">
                    <Button color="gray" size="lg" className="min-w-[180px]">
                      Learn More
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/create-post">
                  <Button color="dark" size="lg">
                    <HiBookOpen className="mr-2 w-5 h-5" />
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
              className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-16"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {totalPosts}+
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {recentPosts.reduce((acc, post) => acc + (post.numberOfLikes || 0), 0)}+
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  Free
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Forever</div>
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
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {searchTerm ? 'Search Results' : 'Latest Articles'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {totalPosts > 0 ? `${totalPosts} ${totalPosts === 1 ? 'article' : 'articles'} published` : 'No articles yet'}
              </p>
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse">
                  <div className="h-48 bg-slate-200 dark:bg-slate-700"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
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
                    whileHover={{ y: -5 }}
                  >
                    <Link to={`/post/${post.slug}`} className="block h-full">
                      <article className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 h-full flex flex-col group">
                        {/* Post Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                          {/* Category Badge */}
                          <div className="absolute top-4 left-4">
                            <Badge color="dark" className="font-medium">
                              {post.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="p-6 flex flex-col flex-grow">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-3">
                            <HiClock className="w-4 h-4" />
                            <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>

                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors leading-snug">
                            {post.title}
                          </h3>

                          <div
                            className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 flex-grow leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(post.content.substring(0, 120) + '...'),
                            }}
                          />

                          {/* Post Meta */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                              <HiHeart className="w-4 h-4 text-red-500" />
                              <span>{post.numberOfLikes || 0}</span>
                            </div>
                            <span className="text-sm text-slate-900 dark:text-white font-medium group-hover:underline">
                              Read more
                            </span>
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
                    color="gray"
                    size="lg"
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
              className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HiBookOpen className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {searchTerm ? 'No posts found' : 'No posts yet'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {searchTerm
                    ? 'Try adjusting your search terms or browse all articles.'
                    : 'Be the first to share your story with the world!'
                  }
                </p>
                {currentUser && !searchTerm && (
                  <Link to="/create-post">
                    <Button color="dark" size="lg">
                      Create Your First Post
                    </Button>
                  </Link>
                )}
                {searchTerm && (
                  <Link to="/">
                    <Button color="gray" size="lg">
                      Browse All Articles
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
