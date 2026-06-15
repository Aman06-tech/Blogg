import { Button, Modal } from "flowbite-react";
import { useEffect, useState } from "react";
import {
  HiOutlineExclamationCircle,
  HiPencil,
  HiTrash,
  HiEye,
  HiPlus,
  HiDocumentText,
  HiClock,
  HiSearch
} from "react-icons/hi";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signoutSuccess } from "../redux/user/userSlice";
import { motion } from "framer-motion";

export default function DashPosts() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/post/getposts?userId=${currentUser._id}`);
        const data = await res.json();
        if (res.ok) {
          setUserPosts(data.posts);
          if (data.posts.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = userPosts.length;
    try {
      const res = await fetch(`/api/post/getposts?userId=${currentUser._id}&startIndex=${startIndex}`);
      const data = await res.json();
      if (res.ok) {
        setUserPosts((prev) => [...prev, ...data.posts]);
        if (data.posts.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeletePost = async () => {
    setShowModal(false);
    setError(null);
    try {
      const res = await fetch(`/api/post/deletepost/${postIdToDelete}/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.status === 401) {
        dispatch(signoutSuccess());
        navigate('/sign-in');
        return;
      }
      if (!res.ok) {
        setError(data.message || 'Failed to delete post');
      } else {
        setUserPosts((prev) => prev.filter((post) => post._id !== postIdToDelete));
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const filteredPosts = userPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Posts</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Manage and edit your blog posts
            </p>
          </div>
          <Link to="/create-post">
            <Button color="dark">
              <HiPlus className="w-5 h-5 mr-2" />
              New Post
            </Button>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <HiDocumentText className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{userPosts.length}</p>
                <p className="text-xs text-slate-500">Total Posts</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <HiClock className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {userPosts.length > 0 ? new Date(userPosts[0]?.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                </p>
                <p className="text-xs text-slate-500">Last Updated</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <HiEye className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {userPosts.reduce((acc, post) => acc + (post.numberOfLikes || 0), 0)}
                </p>
                <p className="text-xs text-slate-500">Total Likes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search your posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex gap-4">
                  <div className="w-32 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Post Image */}
                  <Link to={`/post/${post.slug}`} className="sm:w-48 h-32 sm:h-auto flex-shrink-0">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Post Content */}
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-md">
                            {post.category}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(post.updatedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <Link to={`/post/${post.slug}`}>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-slate-300 transition-colors line-clamp-1">
                            {post.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <HiEye className="w-4 h-4" />
                            {post.numberOfLikes || 0} likes
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link to={`/post/${post.slug}`}>
                          <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
                            <HiEye className="w-5 h-5" />
                          </button>
                        </Link>
                        <Link to={`/update-post/${post._id}`}>
                          <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
                            <HiPencil className="w-5 h-5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            setShowModal(true);
                            setPostIdToDelete(post._id);
                          }}
                          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Show More Button */}
            {showMore && (
              <div className="flex justify-center pt-4">
                <Button color="gray" onClick={handleShowMore}>
                  Load More Posts
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiDocumentText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {searchTerm ? 'No posts found' : 'No posts yet'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {searchTerm
                ? 'Try a different search term'
                : 'Start creating content to share with your readers'}
            </p>
            {!searchTerm && (
              <Link to="/create-post">
                <Button color="dark">
                  <HiPlus className="w-5 h-5 mr-2" />
                  Create Your First Post
                </Button>
              </Link>
            )}
          </div>
        )}
      </motion.div>

      {/* Delete Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-red-500 mb-4 mx-auto" />
            <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
              Delete Post
            </h3>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeletePost}>
                Yes, Delete Post
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
