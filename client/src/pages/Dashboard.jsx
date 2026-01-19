import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import DashSidebar from "../components/DashSidebar.jsx";
import DashProfile from "../components/DashProfile.jsx";
import DashPosts from "../components/DashPosts.jsx";
import DashUsers from "../components/DashUsers.jsx";
import DashBookmarks from "../components/DashBookmarks.jsx";
import { motion } from "framer-motion";
import {
  HiDocumentText,
  HiUser,
  HiPencil,
  HiArrowRight,
  HiClock,
  HiEye
} from "react-icons/hi";

// Dashboard Home Component
function DashboardHome() {
  const { currentUser } = useSelector((state) => state.user);
  const [recentPosts, setRecentPosts] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/post/getposts?userId=${currentUser._id}&limit=5`);
        const data = await res.json();
        if (res.ok) {
          setRecentPosts(data.posts);
          const totalLikes = data.posts.reduce((acc, post) => acc + (post.numberOfLikes || 0), 0);
          setStats({ totalPosts: data.posts.length, totalLikes });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser._id]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {getGreeting()}, {currentUser.username}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Here's what's happening with your blog today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <HiDocumentText className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalPosts}</p>
                <p className="text-xs text-slate-500">Total Posts</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <HiEye className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalLikes}</p>
                <p className="text-xs text-slate-500">Total Likes</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <HiClock className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {recentPosts.length > 0
                    ? new Date(recentPosts[0]?.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '-'}
                </p>
                <p className="text-xs text-slate-500">Last Post</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <HiUser className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.isAdmin ? 'Admin' : 'Member'}</p>
                <p className="text-xs text-slate-500">Account Type</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link to="/create-post" className="group">
            <div className="bg-slate-900 dark:bg-white rounded-xl p-6 hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <HiPencil className="w-8 h-8 text-white dark:text-slate-900 mb-3" />
                  <h3 className="text-lg font-semibold text-white dark:text-slate-900 mb-1">Create New Post</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-600">Share your thoughts with the world</p>
                </div>
                <HiArrowRight className="w-6 h-6 text-white dark:text-slate-900 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
          <Link to="/dashboard?tab=profile" className="group">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <HiUser className="w-8 h-8 text-slate-700 dark:text-slate-300 mb-3" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Edit Profile</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Update your account settings</p>
                </div>
                <HiArrowRight className="w-6 h-6 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Posts */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Posts</h2>
            <Link to="/dashboard?tab=posts" className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1">
              View All <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse flex gap-4">
                  <div className="w-16 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentPosts.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentPosts.map((post) => (
                <Link key={post._id} to={`/post/${post.slug}`} className="flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-16 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 dark:text-white truncate">{post.title}</h3>
                    <p className="text-sm text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-md">
                    {post.category}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiDocumentText className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">No posts yet</h3>
              <p className="text-sm text-slate-500 mb-4">Start creating content to see them here</p>
              <Link to="/create-post" className="text-sm font-medium text-slate-900 dark:text-white hover:underline">
                Create your first post →
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    } else {
      setTab("");
    }
  }, [location.search]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <div className="md:w-64 md:flex-shrink-0 md:sticky md:top-0 md:h-screen relative">
        <DashSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {tab === "" && <DashboardHome />}
        {tab === "profile" && <DashProfile />}
        {tab === "posts" && <DashPosts />}
        {tab === "bookmarks" && <DashBookmarks />}
        {tab === "users" && <DashUsers />}
      </div>
    </div>
  );
}
