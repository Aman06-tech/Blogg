
import { Card, Button, Badge } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiArrowRight, HiClock, HiHeart, HiChat } from "react-icons/hi";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default function HomePage() {
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const res = await fetch('/api/post/getposts?limit=9');
        const data = await res.json();
        if (res.ok) {
          setRecentPosts(data.posts);
          setTotalPosts(data.totalPosts);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentPosts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Hero Section - Blog Style */}
      <motion.section
        className="relative px-6 py-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              The Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {currentUser
                ? `Welcome back, ${currentUser.username}! Explore the latest articles and share your thoughts.`
                : 'Discover stories, thinking, and expertise from writers on any topic.'
              }
            </p>
          </motion.div>

          {!currentUser && (
            <motion.div
              className="flex justify-center gap-4"
              variants={itemVariants}
            >
              <Link to="/sign-in">
                <Button gradientDuoTone="purpleToPink" size="lg">
                  Sign In to Read
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button color="gray" size="lg">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Blog Posts Grid */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Latest Posts {totalPosts > 0 && `(${totalPosts})`}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-lg text-gray-600 dark:text-gray-300">Loading articles...</p>
            </div>
          ) : recentPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link to={`/post/${post.slug}`}>
                    <article className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                      {/* Post Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge color="purple" className="font-medium">
                            {post.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                          {post.title}
                        </h3>

                        <div
                          className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-grow"
                          dangerouslySetInnerHTML={{
                            __html: post.content.substring(0, 120) + '...',
                          }}
                        />

                        {/* Post Meta */}
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1">
                            <HiClock className="w-4 h-4" />
                            <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <HiHeart className="w-4 h-4" />
                              <span>{post.numberOfLikes || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">No posts yet!</p>
              {currentUser && currentUser.isAdmin && (
                <Link to="/create-post">
                  <Button gradientDuoTone="purpleToPink">
                    Create Your First Post
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
