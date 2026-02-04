import { Button, Badge } from "flowbite-react";
import { Link, useLocation } from "react-router-dom";
import { HiArrowRight, HiClock, HiBookOpen, HiSparkles, HiChevronRight } from "react-icons/hi";
import { FaFire, FaRegBookmark, FaHeart } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DOMPurify from "dompurify";
import Avatar from "../components/Avatar";
import AdSense from "../components/AdSense";

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
  const categoryFilter = searchParams.get('category');

  const categories = [
    { name: 'Technology', icon: '💻' },
    { name: 'Personal', icon: '✨' },
    { name: 'Educational', icon: '📚' },
    { name: 'Creative', icon: '🎨' },
    { name: 'News', icon: '📰' },
    { name: 'Medical', icon: '🏥' },
  ];

  useEffect(() => {
    const fetchRecentPosts = async () => {
      setLoading(true);
      try {
        let queryParams = 'limit=9';
        if (searchTerm) {
          queryParams += `&searchTerm=${searchTerm}`;
        }
        if (categoryFilter) {
          queryParams += `&category=${categoryFilter}`;
        }
        const res = await fetch(`/api/post/getposts?${queryParams}`);
        const data = await res.json();
        if (res.ok) {
          setRecentPosts(data.posts);
          setTotalPosts(data.posts.length);
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
  }, [searchTerm, categoryFilter]);


  const handleShowMore = async () => {
    const startIndex = recentPosts.length;
    setLoadingMore(true);
    try {
      let queryParams = `startIndex=${startIndex}&limit=9`;
      if (searchTerm) {
        queryParams += `&searchTerm=${searchTerm}`;
      }
      if (categoryFilter) {
        queryParams += `&category=${categoryFilter}`;
      }
      const res = await fetch(`/api/post/getposts?${queryParams}`);
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

  const featuredPost = recentPosts[0];
  const latestPosts = recentPosts.slice(1);

  const getReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
    return Math.ceil(words / wordsPerMinute) || 1;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      {/* Hero Section */}
      {!searchTerm && !categoryFilter && (
        <section className="relative overflow-hidden bg-white dark:bg-slate-950">
          {/* Dot Grid Background */}
          <div
            className="absolute inset-0 [background-size:20px_20px] [background-image:radial-gradient(#d4d4d4_1px,transparent_1px)] dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]"
          />
          {/* Radial gradient fade */}
          <div className="pointer-events-none absolute inset-0 bg-white dark:bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 opacity-40 dark:opacity-30">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-200 dark:bg-orange-900 rounded-full filter blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 relative z-10">
            {/* Centered Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
                <HiSparkles className="w-4 h-4" />
                <span>Your daily dose of knowledge</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                Stories that
                <span className="relative inline-block mx-3">
                  <span className="relative z-10 text-blue-600">inspire</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 4 150 4 198 10" stroke="#f97316" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                </span>
                and educate
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                Discover thoughtful articles on technology, creativity, and personal growth.
                Join thousands of readers exploring ideas that matter.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to={currentUser ? "/create-post" : "/sign-up"}>
                  <Button color="dark" size="lg" className="px-8">
                    {currentUser ? "Write a Post" : "Start Reading"}
                    <HiArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button color="gray" size="lg" className="px-8">
                    Learn More
                  </Button>
                </Link>
              </div>

            </motion.div>

            {/* Featured Post Card - Below Hero Text */}
            {featuredPost && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-16 max-w-4xl mx-auto"
              >
                <Link to={`/post/${featuredPost.slug}`}>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
                      <div className="grid md:grid-cols-2 gap-0">
                        <div className="relative h-64 md:h-80 overflow-hidden">
                          <img
                            src={featuredPost.image}
                            alt={featuredPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-4 left-4">
                            <Badge color="warning" className="font-medium">
                              <FaFire className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                        </div>
                        <div className="p-8 flex flex-col justify-center">
                          <div className="flex items-center gap-3 mb-4">
                            <Badge color="gray">{featuredPost.category}</Badge>
                            <span className="text-sm text-slate-500 flex items-center gap-1">
                              <HiClock className="w-4 h-4" />
                              {getReadTime(featuredPost.content)} min read
                            </span>
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {featuredPost.title}
                          </h2>
                          <div
                            className="text-slate-600 dark:text-slate-400 line-clamp-3 mb-4"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(featuredPost.content.substring(0, 200)),
                            }}
                          />
                          <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                            Read Article <HiArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Search/Category Results Header */}
      {(searchTerm || categoryFilter) && (
        <section className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  {categoryFilter ? 'Browsing category' : 'Search results for'}
                </p>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white capitalize">
                  {categoryFilter ? categoryFilter : `"${searchTerm}"`}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">{totalPosts} articles found</p>
              </div>
              <Link to="/">
                <Button color="gray">{categoryFilter ? 'View All' : 'Clear Search'}</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {!searchTerm && !categoryFilter && (
        <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Explore Topics</h2>
              <Link to="/about" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 outline-none">
                View all <HiChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={`/?category=${category.name.toLowerCase()}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105 transition-all whitespace-nowrap outline-none"
                >
                  <span>{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ad Section */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <AdSense />
      </div>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          /* Loading Skeleton */
          <div className="grid lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse">
                <div className="bg-slate-200 dark:bg-slate-800 h-48 rounded-xl mb-4"></div>
                <div className="bg-slate-200 dark:bg-slate-800 h-4 rounded w-1/4 mb-3"></div>
                <div className="bg-slate-200 dark:bg-slate-800 h-6 rounded w-3/4 mb-2"></div>
                <div className="bg-slate-200 dark:bg-slate-800 h-4 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : recentPosts.length > 0 ? (
          <>
            {/* Latest Articles Grid */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {searchTerm || categoryFilter ? 'Results' : 'Latest Articles'}
                </h2>
                <span className="text-sm text-slate-500">{totalPosts} articles</span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(searchTerm || categoryFilter ? recentPosts : latestPosts.length > 0 ? latestPosts : recentPosts).map((post, index) => (
                  <motion.article
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group"
                  >
                    <Link to={`/post/${post.slug}`} className="outline-none">
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 hover:-translate-y-1 transition-all duration-300">
                        <div className="relative h-52 overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
                              {post.category}
                            </span>
                          </div>
                          <button className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                            <FaRegBookmark className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </button>
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center gap-2 text-white/90 text-xs">
                              <HiClock className="w-4 h-4" />
                              <span>{getReadTime(post.content)} min read</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <div
                            className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(post.content.substring(0, 100)),
                            }}
                          />
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            {/* Author Info */}
                            <div className="flex items-center gap-2">
                              <Avatar
                                src={post.author?.profilePicture}
                                name={post.author?.username || 'Anonymous'}
                                size="sm"
                                showRing={false}
                              />
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                  {post.author?.username || 'Anonymous'}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <FaHeart className="w-3.5 h-3.5 text-red-400" />
                              <span>{post.numberOfLikes || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </div>

            {/* Load More */}
            {showMore && (
              <div className="flex justify-center">
                <Button
                  onClick={handleShowMore}
                  color="gray"
                  size="lg"
                  disabled={loadingMore}
                  className="px-8"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Load More Articles
                      <HiArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiBookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {searchTerm || categoryFilter ? 'No articles found' : 'No articles yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {searchTerm || categoryFilter
                ? 'Try different keywords or browse all articles.'
                : 'Be the first to share your story with the world!'}
            </p>
            {searchTerm || categoryFilter ? (
              <Link to="/">
                <Button color="gray">Browse All Articles</Button>
              </Link>
            ) : currentUser ? (
              <Link to="/create-post">
                <Button color="dark">Create Your First Post</Button>
              </Link>
            ) : null}
          </div>
        )}
      </section>

      {/* Ad Section */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <AdSense />
      </div>

      {/* AI Writing Assistant Section */}
      {!searchTerm && !categoryFilter && (
        <section className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
                <HiSparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Create content with AI-powered suggestions
              </h2>
              <p className="text-slate-400 mb-10 text-lg">
                Unlock your writing potential with intelligent AI assistance. Get real-time suggestions,
                smart topic ideas, and grammar improvements to craft compelling stories faster.
              </p>

              {/* AI Features Grid */}
              <div className="grid sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                  <div className="text-2xl mb-3">🧠</div>
                  <h3 className="text-white font-semibold mb-1">Smart Suggestions</h3>
                  <p className="text-slate-400 text-sm">AI-powered writing tips as you type</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                  <div className="text-2xl mb-3">💡</div>
                  <h3 className="text-white font-semibold mb-1">Topic Ideas</h3>
                  <p className="text-slate-400 text-sm">Generate trending content ideas instantly</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                  <div className="text-2xl mb-3">✨</div>
                  <h3 className="text-white font-semibold mb-1">Polish & Perfect</h3>
                  <p className="text-slate-400 text-sm">Auto-fix grammar and enhance readability</p>
                </div>
              </div>

              <Link to={currentUser ? "/create-post" : "/sign-up"}>
                <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
                  <HiSparkles className="w-5 h-5" />
                  {currentUser ? "Start Writing with AI" : "Try AI Writing Free"}
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Read Section */}
      {!searchTerm && !categoryFilter && !loading && recentPosts.length > 0 && (
        <section className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Why readers love dailybloggs
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                We're committed to delivering high-quality content that helps you learn, grow, and stay inspired.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🎯',
                  title: 'Curated Content',
                  description: 'Every article is carefully crafted and reviewed to ensure accuracy and value.'
                },
                {
                  icon: '🚀',
                  title: 'Always Fresh',
                  description: 'New articles published regularly covering the latest trends and insights.'
                },
                {
                  icon: '💡',
                  title: 'Practical Insights',
                  description: 'Real-world examples and actionable advice you can apply immediately.'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
